/**
 * MathAuditAgent — plan 115 pass 3 (commit 9e195743) — harness adversarial.
 *
 * Lado independiente: reimplementación propia en TS desde las tablas y textos
 * publicados (SII, LeyChile), sin reutilizar los módulos del motor. Lado motor:
 * imports del repositorio. Se comparan con tolerancia 1e-6 (diferencias de
 * representación float se reportan como delta). Este archivo NO modifica src/.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  calculateAnnualIncomeTax,
  calculateApvWithdrawalRate,
  calculateSecondCategoryTax,
} from "@/domain/taxation/TaxEngine";
import {
  AT2026,
  igcSecondBracketDeduction,
} from "@/domain/taxation/TaxYearParameters";
import {
  getTaxYearForCommercialYear,
  getTaxYearParameters,
} from "@/domain/taxation/TaxYearRegistry";
import { calculateTermDeposit } from "@/application/use-cases/CalculateTermDeposit";
import { calculateNetSalary } from "@/application/use-cases/CalculateNetSalary";
import { simulateDebtRenegotiation } from "@/application/use-cases/SimulateDebtRenegotiation";
import { simulateOperacionRenta } from "@/application/use-cases/SimulateOperacionRenta";
import { calculateAnnuityPayment } from "@/application/use-cases/shared/creditAmortization";
import {
  evaluateCriticalMonthlyFreshness,
  evaluateIpcSeriesFreshness,
} from "@/utils/economicFreshness";
import { resolveEffectiveValue } from "@/domain/economic/EffectiveDatedParameters";

// ---------------------------------------------------------------------------
// Valores independientes (fuentes primarias consultadas 2026-09-29)
// ---------------------------------------------------------------------------
const UTA = 834_504; // SII utm2025.htm dic-2025 (12 × 69.542) y renta 2026
const UTM_SEP = 71_721; // SII utm2026.htm septiembre 2026
const UTM_OCT = 72_151; // SII utm2026.htm octubre 2026
const UF_DIC31 = 39_727.96; // SII renta 2026: 8.000 UF al 31.12.2025
const UF_SNAPSHOT = 41_049.01; // snapshot repo 2026-09-29

type Bracket = [limit: number, rate: number, rebate: number];
/** Tabla IGC AT2026 en UTA (rebajas SII; límite superior inclusivo). */
const SII_TABLE: Bracket[] = [
  [13.5, 0, 0],
  [30, 0.04, 0.54],
  [50, 0.08, 1.74],
  [70, 0.135, 4.49],
  [90, 0.23, 11.14],
  [120, 0.304, 17.8],
  [310, 0.35, 23.32],
  [Number.POSITIVE_INFINITY, 0.4, 38.82],
];

function independentTax(base: number, unit: number): number {
  const bracket = SII_TABLE.find(([limit]) => base <= limit * unit);
  if (!bracket) throw new Error("sin tramo");
  const [, rate, rebate] = bracket;
  return Math.max(0, base * rate - rebate * unit);
}

function independentApvRate(baseIncome: number, withdrawal: number) {
  const igcDelta =
    independentTax(baseIncome + withdrawal, UTA) -
    independentTax(baseIncome, UTA);
  return { rate: (igcDelta / withdrawal) * 1.1 + 0.03, igcDelta };
}

function independentAnnuity(p: number, i: number, n: number): number {
  if (i === 0) return p / n;
  const f = Math.pow(1 + i, n);
  return (p * i * f) / (f - 1);
}

interface IndependentPayroll {
  pensionBase: number;
  afcBase: number;
  afp: number;
  health: number;
  afc: number;
  base: number;
  tax: number;
  net: number;
}

function independentPayroll(
  gross: number,
  opts: {
    afpPct?: number;
    healthPct?: number;
    afcPct?: number;
    uf?: number;
    phCapUf?: number;
    afcCapUf?: number;
  } = {}
): IndependentPayroll {
  const afpPct = opts.afpPct ?? 11.27;
  const healthPct = opts.healthPct ?? 7;
  const afcPct = opts.afcPct ?? 0.6;
  const uf = opts.uf ?? UF_SNAPSHOT;
  const pensionBase = Math.min(gross, (opts.phCapUf ?? 90) * uf);
  const afcBase = Math.min(gross, (opts.afcCapUf ?? 135.2) * uf);
  const afp = pensionBase * (afpPct / 100);
  const health = pensionBase * (healthPct / 100);
  const afc = afcBase * (afcPct / 100);
  const base = Math.max(0, gross - afp - health - afc);
  // Tabla IUSC mensual publicada (sep-2026): mismos factores/rebajas que la
  // tabla IGC expresados en UTM (comprobado aparte contra SII impuesto2026).
  const tax = independentTax(base, UTM_SEP);
  return { pensionBase, afcBase, afp, health, afc, base, tax, net: gross - afp - health - afc - tax };
}

function independentSuperir(
  debts: Array<{ amount: number; overdueDays: number; creditor: string }>,
  uf: number,
  opts: { docs?: boolean; firstCategory?: boolean; notified?: boolean } = {}
) {
  const qualified = debts.filter(d => d.amount > 0 && d.overdueDays >= 91);
  const qUf = qualified.reduce((s, d) => s + d.amount, 0) / uf;
  const basic =
    debts.filter(d => d.amount > 0).length >= 2 &&
    qualified.length >= 2 &&
    qUf > 80 &&
    !opts.firstCategory &&
    !opts.notified;
  return {
    qUf,
    qualifiedCount: qualified.length,
    basic,
    canSubmit: basic && (opts.docs ?? true),
  };
}

const ROOT = process.cwd();
function readDataset(name: string) {
  return JSON.parse(
    readFileSync(join(ROOT, "src/data/economic-history", name), "utf8")
  ) as { serie: Array<{ fecha: string; valor: number }>; hastaFecha: string };
}

const results: string[] = [];
let fails = 0;
function report(label: string, independent: unknown, engine: unknown) {
  let ok: boolean;
  let delta: number | string = "";
  if (typeof independent === "number" && typeof engine === "number") {
    delta = Math.abs(independent - engine);
    ok = (delta as number) < 1e-6;
  } else {
    ok = JSON.stringify(independent) === JSON.stringify(engine);
  }
  results.push(
    `${ok ? "OK  " : "FAIL"} ${label}: independiente=${String(independent)} motor=${String(engine)}${typeof delta === "number" ? ` delta=${delta}` : ""}`
  );
  if (!ok) fails += 1;
  return ok;
}

describe("pass 3 — recálculo independiente vs motor (plan 115)", () => {
  it("V1 — $18.000.000 renta neta ⇒ IGC $269.367,84 (AT2026)", () => {
    const viaEngine = calculateAnnualIncomeTax({
      taxableIncome: 18_000_000,
      uta: UTA,
    });
    const viaUseCase = simulateOperacionRenta({
      sueldosRentaNeta: 18_000_000,
      sueldosBaseMode: "declarada",
      honorariosBrutos: 0,
      arriendos: 0,
      impuestoUnicoRetenido: 0,
      ppmHonorarios: 0,
      apvRegimenB: 0,
      interesesHipotecarios: 0,
      taxYear: AT2026,
    });
    expect(report("V1.igc motor", independentTax(18_000_000, UTA), viaEngine.taxAmount)).toBe(true);
    expect(report("V1.igc use case", independentTax(18_000_000, UTA), viaUseCase.igcCalculado)).toBe(true);
    expect(viaEngine.marginalRate).toBeCloseTo(0.04, 12);
    expect(viaUseCase.taxYear).toBe(2026);
    expect(viaUseCase.commercialYear).toBe(2025);
    expect(viaUseCase.apvCap).toBeCloseTo(600 * UF_DIC31, 6);
    // Reproduce el bug original con UTM vigente ×12 (no debe ocurrir).
    const buggy = independentTax(18_000_000, 12 * UTM_SEP);
    report("V1.variante bug UTM sep×12 (esperado 255.247,92)", 255_247.92, buggy);
    expect(Math.abs(viaEngine.taxAmount - buggy)).toBeGreaterThan(1);
  });

  it("IGC — bordes y tabla general 310/38,82 vs art. 52 bis 150", () => {
    for (const n of [13.5, 14, 29.99, 30, 30.0001, 50, 70, 90, 120, 310, 320, 400]) {
      const income = n * UTA;
      const engine = calculateAnnualIncomeTax({ taxableIncome: income, uta: UTA });
      expect(report(`IGC.${n}UTA`, independentTax(income, UTA), engine.taxAmount)).toBe(true);
    }
    for (const n of [13.5, 30, 50, 70, 90, 120, 310, 320]) {
      const income = n * UTM_SEP;
      const engine = calculateSecondCategoryTax({ taxableIncome: income, utm: UTM_SEP });
      expect(report(`IUSC.${n}UTM`, independentTax(income, UTM_SEP), engine.taxAmount)).toBe(true);
    }
    // Continuidad en cada frontera publicada: el salto por +$1 debe ser el de
    // la tabla publicada (tasa del tramo nuevo, hasta 0,40), no un valor suelto.
    for (const n of [13.5, 30, 50, 70, 90, 120, 310]) {
      const below = calculateSecondCategoryTax({ taxableIncome: n * UTM_SEP, utm: UTM_SEP });
      const above = calculateSecondCategoryTax({ taxableIncome: n * UTM_SEP + 1, utm: UTM_SEP });
      const jump = Math.abs(above.taxAmount - below.taxAmount);
      const indJump = Math.abs(
        independentTax(n * UTM_SEP + 1, UTM_SEP) - independentTax(n * UTM_SEP, UTM_SEP)
      );
      report(`IUSC.salto frontera ${n} UTM (tabla publicada)`, indJump, jump);
    }
    // El tramo 150 (art. 52 bis) habría dado otro impuesto en 320 UTA.
    const bis = (320 * 0.4 - 30.82) * UTA;
    report(
      "IGC.320UTA no usa art. 52 bis (diferencia $6.676.032)",
      6_676_032,
      Math.abs(bis - independentTax(320 * UTA, UTA))
    );
  });

  it("V2 — sueldo líquido $1.200.000 y topes previsionales", () => {
    const params = {
      uf: UF_SNAPSHOT,
      utm: UTM_SEP,
      afcTopes: { monthlyTaxableCapUf: 135.2 },
      previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 90 },
    };
    const engine = calculateNetSalary({
      grossSalary: 1_200_000,
      afpRatePercent: 11.27,
      healthSystem: "fonasa",
      contractType: "indefinido",
      economicParameters: params,
    });
    const ind = independentPayroll(1_200_000);
    expect(report("V2.base", ind.base, engine.taxableBase)).toBe(true);
    expect(report("V2.tax", ind.tax, engine.deductions.tax)).toBe(true);
    expect(report("V2.net", ind.net, engine.netSalary)).toBe(true);
    expect(report("V2.afp", ind.afp, engine.deductions.afp)).toBe(true);
    expect(report("V2.salud", ind.health, engine.deductions.health)).toBe(true);
    expect(report("V2.afc", ind.afc, engine.deductions.unemploymentInsurance)).toBe(true);
    expect(Math.round(engine.netSalary)).toBe(973_347);
    expect(Math.round(engine.deductions.tax)).toBe(213);

    // Con UTM octubre el tramo exento absorbería el impuesto (documenta que el
    // snapshot de septiembre es el que sostiene el ejemplo, no el "vigente").
    report("V2.con UTM oct el impuesto sería 0", 0, Math.max(0, ind.base * 0.04 - 0.54 * UTM_OCT));

    // Tope previsional 90 UF: la base AFP/salud deja de crecer.
    const high = calculateNetSalary({
      grossSalary: 6_000_000,
      afpRatePercent: 11.27,
      healthSystem: "fonasa",
      contractType: "indefinido",
      economicParameters: params,
    });
    const indHigh = independentPayroll(6_000_000);
    report("V2.tope previsional base", indHigh.pensionBase, high.cappedBases.pensionAndHealth);
    report("V2.tope AFC base", indHigh.afcBase, high.cappedBases.unemploymentInsurance);
    report("V2.base 6M", indHigh.base, high.taxableBase);
    report("V2.tax 6M", indHigh.tax, high.deductions.tax);

    // Plazo fijo: AFC trabajador 0% (empleador 3%).
    const fixed = calculateNetSalary({
      grossSalary: 1_200_000,
      afpRatePercent: 11.27,
      healthSystem: "fonasa",
      contractType: "plazo-fijo",
      economicParameters: params,
    });
    const indFixed = independentPayroll(1_200_000, { afcPct: 0 });
    report("V2.plazo-fijo AFC 0", indFixed.net, fixed.netSalary);

    // Frontera exenta exacta: base = 13,5 UTM ⇒ impuesto 0.
    const exemptBase = 13.5 * UTM_SEP;
    report("V2.frontera exenta 13,5 UTM", 0, independentTax(exemptBase, UTM_SEP));
    const grossForExempt = exemptBase / (1 - 0.1127 - 0.07 - 0.006);
    const atBoundary = calculateNetSalary({
      grossSalary: grossForExempt,
      afpRatePercent: 11.27,
      healthSystem: "fonasa",
      contractType: "indefinido",
      economicParameters: params,
    });
    expect(atBoundary.deductions.tax).toBeLessThan(0.01);
  });

  it("V3 — DAP interés simple y rechazo del 4% universal", () => {
    for (const [amount, days, rate] of [
      [5_000_000, 180, 5],
      [2_000_000, 365, 4.5],
      [1_000_000, 1, 0.01],
      [1_000_000, 366, 7.35],
    ] as const) {
      const engine = calculateTermDeposit({ amount, termDays: days, annualRatePercent: rate });
      const ind = amount * (rate / 100) * (days / 365);
      expect(report(`V3.${amount}/${days}d/${rate}%`, ind, engine.grossInterest)).toBe(true);
      expect(report(`V3.final ${amount}/${days}`, amount + ind, engine.finalAmount)).toBe(true);
      expect(engine.effectiveAnnualRatePercent).toBeCloseTo(rate, 6);
    }
    const engine = calculateTermDeposit({ amount: 5_000_000, termDays: 180, annualRatePercent: 5 });
    report("V3.variante 4% rechazada", 118_356.16438356163, engine.grossInterest * 0.96);
    expect(() => calculateTermDeposit({ amount: 5_000_000, termDays: 180, annualRatePercent: 0 })).toThrow();
    expect(() => calculateTermDeposit({ amount: -1, termDays: 30, annualRatePercent: 5 })).toThrow();
    expect(() => calculateTermDeposit({ amount: 1, termDays: 1.5, annualRatePercent: 5 })).toThrow();
  });

  it("V4 — APV art. 42 bis N°3: tasa media del retiro", () => {
    for (const [baseU, wU] of [
      [90, 50],
      [200, 10],
      [0, 5],
      [10, 5],
      [30, 0.1],
      [29.9, 0.2],
      [310, 200],
      [120, 120],
    ] as const) {
      const base = baseU * UTA;
      const withdrawal = wU * UTA;
      const engine = calculateApvWithdrawalRate({ baseIncome: base, withdrawal, uta: UTA });
      const ind = independentApvRate(base, withdrawal);
      expect(report(`V4.delta ${baseU}/${wU}UTA`, ind.igcDelta, engine.igcDelta)).toBe(true);
      expect(report(`V4.tasa ${baseU}/${wU}UTA`, ind.rate, engine.rate)).toBe(true);
    }
    const marginal = calculateApvWithdrawalRate({ baseIncome: 200 * UTA, withdrawal: 10 * UTA, uta: UTA });
    expect(marginal.rate).toBeCloseTo(0.35 * 1.1 + 0.03, 12);
    expect(() => calculateApvWithdrawalRate({ baseIncome: 0, withdrawal: 0, uta: UTA })).toThrow();
    expect(() => calculateApvWithdrawalRate({ baseIncome: 0, withdrawal: -1, uta: UTA })).toThrow();
  });

  it("V5 — SuperIR art. 260: bordes y anualidad", () => {
    const base = {
      monthlyIncome: 1_200_000,
      termMonths: 48,
      monthlyRatePercent: 1.2,
      ufValue: 39_300,
      hasFirstCategoryActivityLast24Months: false,
      hasNotifiedExecutiveProceeding: false,
      hasRequiredDocuments: true,
    };
    const case1 = simulateDebtRenegotiation({
      ...base,
      debts: [
        { amount: 1_800_000, overdueDays: 120, creditor: "Banco A" },
        { amount: 2_200_000, overdueDays: 150, creditor: "Retail B" },
      ],
    });
    const ind = independentSuperir(
      [
        { amount: 1_800_000, overdueDays: 120, creditor: "Banco A" },
        { amount: 2_200_000, overdueDays: 150, creditor: "Retail B" },
      ],
      39_300
    );
    expect(report("V5.uf", ind.qUf, case1.qualifiedDebtUf)).toBe(true);
    expect(report("V5.cuota", independentAnnuity(4_000_000, 0.012, 48), case1.monthlyPayment)).toBe(true);
    expect(report("V5.totalPagado", independentAnnuity(4_000_000, 0.012, 48) * 48, case1.totalPaid)).toBe(true);
    expect(case1.meetsBasicEligibility).toBe(true);
    expect(case1.canSubmitApplication).toBe(true);
    expect(report("V5.carga%", (independentAnnuity(4_000_000, 0.012, 48) / 1_200_000) * 100, case1.incomeBurdenPercent)).toBe(true);

    const edges: Array<[string, Parameters<typeof independentSuperir>[0], boolean]> = [
      [
        "80 UF exactas",
        [
          { amount: 40 * 39_300, overdueDays: 200, creditor: "A" },
          { amount: 40 * 39_300, overdueDays: 200, creditor: "B" },
        ],
        false,
      ],
      [
        "80 UF + $1",
        [
          { amount: 40 * 39_300, overdueDays: 200, creditor: "A" },
          { amount: 40 * 39_300 + 1, overdueDays: 200, creditor: "B" },
        ],
        true,
      ],
      [
        "90 días no califica / 91 sí",
        [
          { amount: 2_000_000, overdueDays: 90, creditor: "A" },
          { amount: 2_000_000, overdueDays: 91, creditor: "B" },
        ],
        false,
      ],
      [
        "mismo acreedor califica (obligaciones diversas)",
        [
          { amount: 2_000_000, overdueDays: 120, creditor: "Banco A" },
          { amount: 2_000_000, overdueDays: 130, creditor: "banco a" },
        ],
        true,
      ],
      ["una sola deuda", [{ amount: 10_000_000, overdueDays: 365, creditor: "A" }], false],
      [
        "deuda $0 no cuenta",
        [
          { amount: 0, overdueDays: 200, creditor: "A" },
          { amount: 4_000_000, overdueDays: 200, creditor: "B" },
        ],
        false,
      ],
    ];
    for (const [label, debts, expected] of edges) {
      const engine = simulateDebtRenegotiation({ ...base, debts });
      const indEdge = independentSuperir(debts, 39_300);
      report(`V5.${label}`, indEdge.basic, engine.meetsBasicEligibility);
      expect(engine.meetsBasicEligibility).toBe(expected);
    }
    const noDocs = simulateDebtRenegotiation({
      ...base,
      hasRequiredDocuments: false,
      debts: [
        { amount: 2_000_000, overdueDays: 120, creditor: "A" },
        { amount: 2_000_000, overdueDays: 120, creditor: "B" },
      ],
    });
    expect(noDocs.meetsBasicEligibility).toBe(true);
    expect(noDocs.canSubmitApplication).toBe(false);
    const firstCat = simulateDebtRenegotiation({
      ...base,
      hasFirstCategoryActivityLast24Months: true,
      debts: [
        { amount: 2_000_000, overdueDays: 120, creditor: "A" },
        { amount: 2_000_000, overdueDays: 120, creditor: "B" },
      ],
    });
    expect(firstCat.meetsBasicEligibility).toBe(false);
    const notified = simulateDebtRenegotiation({
      ...base,
      hasNotifiedExecutiveProceeding: true,
      debts: [
        { amount: 2_000_000, overdueDays: 120, creditor: "A" },
        { amount: 2_000_000, overdueDays: 120, creditor: "B" },
      ],
    });
    expect(notified.meetsBasicEligibility).toBe(false);
    expect(() =>
      simulateDebtRenegotiation({
        ...base,
        debts: [{ amount: 2_000_000, overdueDays: 120, creditor: "  " }],
      })
    ).toThrow("acreedor");
  });

  it("V6 — dataset IPC, UF 31-12-2025, UTA y snapshot", () => {
    const expected2026 = [0.4, 0, 1.0, 1.3, 0.2, 0, 0.1, 0.6];
    const ipc = readDataset("ipc-historico.json");
    const byMonth = new Map(ipc.serie.map(e => [e.fecha, e.valor]));
    for (const [i, value] of expected2026.entries()) {
      const fecha = `2026-${String(i + 1).padStart(2, "0")}-01`;
      expect(report(`V6.ipc ${fecha}`, value, byMonth.get(fecha))).toBe(true);
    }
    expect(ipc.hastaFecha).toBe("2026-08-01");
    // Acumulado encadenado (no suma simple).
    const chained = expected2026.reduce((acc, v) => acc * (1 + v / 100), 1);
    report("V6.acumulado encadenado %", 3.648807945707024, (chained - 1) * 100);
    report("V6.$1M dic-25→ago-26", 1_036_488.0794570702, 1_000_000 * chained);

    const uf = readDataset("uf-historico.json");
    const ufDic31 = uf.serie.find(e => e.fecha === "2025-12-31");
    report("V6.UF 31-12-2025", UF_DIC31, ufDic31?.valor);
    report("V6.UF dic-2025 día 1 (derogada en D2)", 39_643.59, uf.serie.find(e => e.fecha === "2025-12-01")?.valor);

    report("V6.UTA = 12 × 69.542", UTA, 12 * 69_542);
    report("V6.AT2026.uta", UTA, AT2026.uta);
    report("V6.AT2026.ufDecember", UF_DIC31, AT2026.ufDecember);
    expect(igcSecondBracketDeduction(AT2026)).toBeCloseTo(0.54 * UTA, 6);
    expect(AT2026.honorariosPpmRate).toBe(0.145);
    expect(getTaxYearParameters(2026)).toBe(AT2026);
    expect(getTaxYearForCommercialYear(2025)).toBe(AT2026);
    expect(() => getTaxYearParameters(2025)).toThrow();
  });

  it("F04 — frescura IPC fail-closed y effective-dated", () => {
    expect(evaluateIpcSeriesFreshness("2026-08", "2026-08-01").status).toBe("fresh");
    expect(evaluateIpcSeriesFreshness("2026-08", "2026-09-01").status).toBe("stale");
    expect(evaluateIpcSeriesFreshness("2026-08", null).status).toBe("unknown");
    expect(evaluateIpcSeriesFreshness("2026-08", "basura").status).toBe("unknown");
    // La serie del repo vs el snapshot real.
    const snapshot = JSON.parse(
      readFileSync(
        join(ROOT, "src/infrastructure/economic/economic-parameters.snapshot.json"),
        "utf8"
      )
    ) as { indicatorUpdatedAt: { ipc: string }; utm: number; uta: number; uf: number };
    const ipc = readDataset("ipc-historico.json");
    const fresh = evaluateIpcSeriesFreshness(
      ipc.hastaFecha.slice(0, 7),
      snapshot.indicatorUpdatedAt.ipc
    );
    report("F04.serie IPC vs snapshot", "fresh", fresh.status);
    report("F04.snapshot.utm", UTM_SEP, snapshot.utm);
    report("F04.snapshot.uta", UTA, snapshot.uta);

    // Bordes de evaluateCriticalMonthlyFreshness (calendario Chile).
    expect(evaluateCriticalMonthlyFreshness("2026-08-01", new Date("2026-09-07T23:59:00Z")).status).toBe("grace");
    expect(evaluateCriticalMonthlyFreshness("2026-08-01", new Date("2026-09-08T04:30:00Z")).status).toBe("stale");
    expect(evaluateCriticalMonthlyFreshness("2026-09-01", new Date("2026-08-02T12:00:00Z")).status).toBe("stale");
    expect(evaluateCriticalMonthlyFreshness("bad", new Date()).status).toBe("stale");
    expect(evaluateCriticalMonthlyFreshness("2025-12-01", new Date("2026-01-05T15:00:00Z")).status).toBe("grace");

    const entries = [
      {
        indicator: "uf" as const,
        periodId: "2025-12",
        value: UF_DIC31,
        effectiveFrom: "2025-12-01",
        effectiveTo: "2026-01-01",
        source: "BCCh",
      },
    ];
    expect(resolveEffectiveValue(entries, "uf", "2025-12")?.value).toBe(UF_DIC31);
    expect(resolveEffectiveValue(entries, "uf", "2026-01")).toBeUndefined();
    expect(resolveEffectiveValue(entries, "uf", "2025-11")).toBeUndefined();
    expect(resolveEffectiveValue(entries, "uf", "2025/12")).toBeUndefined();
    expect(resolveEffectiveValue(entries, "utm", "2025-12")).toBeUndefined();
  });

  it("resumen del harness", () => {
    const failed = results.filter(line => line.startsWith("FAIL"));
    // eslint-disable-next-line no-console
    console.log(`\n=== PASS 3 COMPARISON (${results.length} checks) ===`);
    for (const line of results) {
      // eslint-disable-next-line no-console
      console.log(line);
    }
    // eslint-disable-next-line no-console
    console.log(`=== FAILS: ${failed.length} ===`);
    expect(fails).toBe(0);
    expect(failed).toEqual([]);
  });
});
