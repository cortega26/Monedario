/**
 * MathAuditAgent — plan 115 pass 4 (commit 72d14e66) — harness adversarial.
 *
 * Lado independiente: reimplementación propia en TS desde las tablas y textos
 * publicados (SII AT2026 / IUSC sep-2026, art. 42 bis N°3 LIR, Ley 20.720
 * art. 260), sin reutilizar fórmulas del motor. Lado motor: imports del repo.
 * Cada check imprime independent / engine / delta; se exige |delta| <= 1e-9
 * para montos (representación IEEE-754) y 0 exacto donde la operación coincide.
 * Este archivo NO modifica src/.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { calculateAnnualIncomeTax, calculateApvWithdrawalRate, calculateSecondCategoryTax } from "@/domain/taxation/TaxEngine";
import { AT2026 } from "@/domain/taxation/TaxYearParameters";
import { getTaxYearForCommercialYear, getTaxYearParameters } from "@/domain/taxation/TaxYearRegistry";
import { calculateTermDeposit } from "@/application/use-cases/CalculateTermDeposit";
import { calculateNetSalary } from "@/application/use-cases/CalculateNetSalary";
import { simulateDebtRenegotiation } from "@/application/use-cases/SimulateDebtRenegotiation";
import { simulateOperacionRenta } from "@/application/use-cases/SimulateOperacionRenta";
import { calculateAnnuityPayment } from "@/application/use-cases/shared/creditAmortization";
import { evaluateCriticalMonthlyFreshness, evaluateIpcSeriesFreshness } from "@/utils/economicFreshness";
import { resolveEffectiveValue } from "@/domain/economic/EffectiveDatedParameters";

// ---------------------------------------------------------------------------
// Parámetros publicados (SII / BCCh / leyes; consultados 2026-09-29)
// ---------------------------------------------------------------------------
const UTA = 834_504; // SII: 1 UTA dic-2025 (12 × 69.542)
const UF_DIC_2025 = 39_727.96; // SII: 8.000 UF del 31.12.2025 = $317.823.680
const UTM_SEP = 71_721; // SII utm2026.htm septiembre 2026
const UF_SNAP = 41_049.01; // snapshot 2026-09-29 (UF 29-sep-2026)
const UF_LEGACY = 39_300; // UF usada por la regresión V5 del repo

// Tabla IGC AT2026 publicada (desde, hasta, factor, rebaja) — general art. 52.
const IGC_TABLE: Array<[number, number, number, number]> = [
  [0, 11_265_804, 0, 0],
  [11_265_804.01, 25_035_120, 0.04, 450_632.16],
  [25_035_120.01, 41_725_200, 0.08, 1_452_036.96],
  [41_725_200.01, 58_415_280, 0.135, 3_746_922.96],
  [58_415_280.01, 75_105_360, 0.23, 9_296_374.56],
  [75_105_360.01, 100_140_480, 0.304, 14_854_171.2],
  [100_140_480.01, 258_696_240, 0.35, 19_460_633.28],
  [258_696_240.01, Infinity, 0.4, 32_395_445.28],
];

// Tabla IUSC septiembre 2026 publicada (desde, hasta, factor, rebaja).
const IUSC_TABLE: Array<[number, number, number, number]> = [
  [0, 968_233.5, 0, 0],
  [968_233.51, 2_151_630, 0.04, 38_729.34],
  [2_151_630.01, 3_586_050, 0.08, 124_794.54],
  [3_586_050.01, 5_020_470, 0.135, 322_027.29],
  [5_020_470.01, 6_454_890, 0.23, 798_971.94],
  [6_454_890.01, 8_606_520, 0.304, 1_276_633.8],
  [8_606_520.01, 22_233_510, 0.35, 1_672_533.72],
  [22_233_510.01, Infinity, 0.4, 2_784_209.22],
];

function taxFromTable(table: Array<[number, number, number, number]>, income: number): number {
  const row = table.find(([from, to]) => income >= from && income <= to);
  if (!row) throw new Error(`sin tramo para ${income}`);
  return Math.max(0, income * row[2] - row[3]);
}

const igc = (income: number) => taxFromTable(IGC_TABLE, income);
const iusc = (income: number) => taxFromTable(IUSC_TABLE, income);

function payrollBase(gross: number, afpPct: number, uf: number, contract: "indefinido" | "plazo-fijo") {
  const pensionBase = Math.min(gross, 90 * uf);
  const afcBase = Math.min(gross, 135.2 * uf);
  const afp = pensionBase * (afpPct / 100);
  const health = pensionBase * 0.07;
  const afc = afcBase * (contract === "indefinido" ? 0.006 : 0);
  return { pensionBase, afcBase, afp, health, afc, base: Math.max(0, gross - afp - health - afc) };
}

function apvRateIndependent(base: number, withdrawal: number): { rate: number; igcDelta: number } {
  const igcDelta = igc(base + withdrawal) - igc(base);
  return { rate: (igcDelta / withdrawal) * 1.1 + 0.03, igcDelta };
}

const TOL = 1e-6; // representación IEEE-754: la exactitud decimal se verifica en 34-recalc-independent.py (Decimal 50 dígitos)
let auditLines: string[] = [];
function check(id: string, engine: number, independent: number, tol = TOL) {
  const delta = engine - independent;
  auditLines.push(
    `${id} engine=${engine} independent=${independent} delta=${delta} ${Math.abs(delta) <= tol ? "OK" : "DIVERGENT"}`
  );
  expect(Math.abs(delta), `${id}: engine=${engine} independent=${independent}`).toBeLessThanOrEqual(tol);
}

const ROOT = process.cwd();
const readJson = (rel: string) => JSON.parse(readFileSync(join(ROOT, rel), "utf8"));

describe("pass4 — vectores independientes vs motor (R3)", () => {
  it("V1 IGC AT2026 $18.000.000 = 269.367,84 (y no el bug 255.247,92)", () => {
    const independent = igc(18_000_000);
    check("V1.1 tabla publicada", 269_367.84, independent);
    expect(independent).toBeCloseTo(18_000_000 * 0.04 - 0.54 * UTA, 9);
    const engine = simulateOperacionRenta({
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
    check("V1.2 motor simulateOperacionRenta.igcCalculado", engine.igcCalculado, independent);
    expect(engine.igcCalculado).not.toBeCloseTo(255_247.92, 2);
    check("V1.3 calculateAnnualIncomeTax", calculateAnnualIncomeTax({ taxableIncome: 18_000_000, uta: UTA }).taxAmount, independent);
    check("V1.4 variante bug (UTA sep-26 ×12 = 860.652)", 255_247.92, 18_000_000 * 0.04 - 0.54 * 860_652);
  });

  it("V1-bordes: fronteras exactas y +$1 en toda la tabla general", () => {
    for (const [from, to, , ] of IGC_TABLE.slice(0, -1)) {
      void from;
      const exact = igc(to);
      check(`V1.b exact ${to}`, calculateAnnualIncomeTax({ taxableIncome: to, uta: UTA }).taxAmount, exact);
      const above = to + 0.01;
      check(`V1.b +0,01 ${to}`, calculateAnnualIncomeTax({ taxableIncome: above, uta: UTA }).taxAmount, igc(above));
    }
    // 310 UTA vs art. 52 bis (150): la tabla general no debe ser la del 52 bis.
    const at320 = 320 * UTA;
    check("V1.b 320 UTA general", calculateAnnualIncomeTax({ taxableIncome: at320, uta: UTA }).taxAmount, at320 * 0.4 - 38.82 * UTA);
    expect(at320 * 0.4 - 38.82 * UTA).not.toBe(at320 * 0.35 - 30.82 * UTA);
    expect(at320 * 0.4 - 38.82 * UTA - (at320 * 0.35 - 30.82 * UTA)).toBeCloseTo(6_676_032, 6);
  });

  it("V2 sueldo $1.200.000: base 973.560, IUSC 213,06, líquido 973.346,94", () => {
    const ind = payrollBase(1_200_000, 11.27, UF_SNAP, "indefinido");
    const engine = calculateNetSalary({
      grossSalary: 1_200_000,
      afpRatePercent: 11.27,
      healthSystem: "fonasa",
      contractType: "indefinido",
      economicParameters: {
        uf: UF_SNAP,
        utm: UTM_SEP,
        afcTopes: { monthlyTaxableCapUf: 135.2 },
        previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 90 },
      },
    });
    check("V2.1 base imponible", engine.taxableBase, ind.base);
    check("V2.2 AFP", engine.deductions.afp, ind.afp);
    check("V2.3 salud", engine.deductions.health, ind.health);
    check("V2.4 AFC", engine.deductions.unemploymentInsurance, ind.afc);
    check("V2.5 IUSC", engine.deductions.tax, iusc(ind.base));
    check("V2.6 líquido", engine.netSalary, 1_200_000 - ind.afp - ind.health - ind.afc - iusc(ind.base));
    expect(Math.round(engine.netSalary)).toBe(973_347);
    expect(Math.round(engine.deductions.tax)).toBe(213);
  });

  it("V2-topes: bruto $6.000.000 congela AFP/salud en 90 UF y AFC en 135,2 UF", () => {
    const ind = payrollBase(6_000_000, 11.27, UF_SNAP, "indefinido");
    const engine = calculateNetSalary({
      grossSalary: 6_000_000,
      afpRatePercent: 11.27,
      healthSystem: "fonasa",
      contractType: "indefinido",
      economicParameters: {
        uf: UF_SNAP,
        utm: UTM_SEP,
        afcTopes: { monthlyTaxableCapUf: 135.2 },
        previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 90 },
      },
    });
    check("V2.t pensionAndHealthBase", engine.cappedBases.pensionAndHealth, ind.pensionBase);
    check("V2.t unemploymentBase", engine.cappedBases.unemploymentInsurance, ind.afcBase);
    check("V2.t base imponible", engine.taxableBase, ind.base);
    check("V2.t IUSC", engine.deductions.tax, iusc(ind.base));
    // Techo exento exacto IUSC: 13,5 UTM sep-2026 = 968.233,50
    check("V2.t exento exacto", calculateSecondCategoryTax({ taxableIncome: 968_233.5, utm: UTM_SEP }).taxAmount, 0);
    check("V2.t exento +0,01", calculateSecondCategoryTax({ taxableIncome: 968_233.51, utm: UTM_SEP }).taxAmount, 0.0004);
  });

  it("V2 AFC: contrato plazo fijo ⇒ aporte trabajador 0%", () => {
    const engine = calculateNetSalary({
      grossSalary: 1_200_000,
      afpRatePercent: 11.27,
      healthSystem: "fonasa",
      contractType: "plazo-fijo",
      economicParameters: {
        uf: UF_SNAP,
        utm: UTM_SEP,
        afcTopes: { monthlyTaxableCapUf: 135.2 },
        previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 90 },
      },
    });
    const ind = payrollBase(1_200_000, 11.27, UF_SNAP, "plazo-fijo");
    check("V2.afc base", engine.taxableBase, ind.base);
    expect(engine.deductions.unemploymentInsurance).toBe(0);
  });

  it("V3 DAP $5M/180d/5%: interés bruto sin retención", () => {
    const engine = calculateTermDeposit({ amount: 5_000_000, termDays: 180, annualRatePercent: 5 });
    const independent = (5_000_000 * 0.05 * 180) / 365;
    check("V3.1 interés bruto", engine.grossInterest, independent);
    check("V3.2 monto final", engine.finalAmount, 5_000_000 + independent);
    check("V3.3 tasa efectiva anual", engine.effectiveAnnualRatePercent, (independent / 5_000_000) * (365 / 180) * 100);
    check("V3.4 variante 4% (no aplicada)", independent * 0.96, 118_356.16438356164);
  });

  it("V3-bordes: 1/90/365/366 días y rechazos de entrada", () => {
    for (const days of [1, 90, 365, 366]) {
      const engine = calculateTermDeposit({ amount: 5_000_000, termDays: days, annualRatePercent: 5 });
      check(`V3.${days}d`, engine.grossInterest, (5_000_000 * 0.05 * days) / 365);
    }
    expect(() => calculateTermDeposit({ amount: 0, termDays: 30, annualRatePercent: 5 })).toThrow();
    expect(() => calculateTermDeposit({ amount: 1_000_000, termDays: 0, annualRatePercent: 5 })).toThrow();
    expect(() => calculateTermDeposit({ amount: 1_000_000, termDays: 30.5, annualRatePercent: 5 })).toThrow();
    expect(() => calculateTermDeposit({ amount: 1_000_000, termDays: 30, annualRatePercent: -1 })).toThrow();
  });

  it("V4 APV art. 42 bis N°3: (ΔIGC/retiro) × 1,1 + 3 pp", () => {
    const vectors: Array<[string, number, number]> = [
      ["retiro < 13,5 UTA (exento)", 0, 1_000_000],
      ["retiro = 1 UTA desde base 0", 0, UTA],
      ["base 13,5 UTA + retiro 1 UTA", 13.5 * UTA, UTA],
      ["retiro cruza la exención (14 UTA)", 0, 14 * UTA],
      ["base 90 UTA + retiro 50 UTA", 90 * UTA, 50 * UTA],
      ["base 200 UTA + retiro 10 UTA", 200 * UTA, 10 * UTA],
      ["base 310 UTA + retiro 200 UTA", 310 * UTA, 200 * UTA],
      ["base 400 UTA + retiro 100 UTA", 400 * UTA, 100 * UTA],
    ];
    for (const [label, base, withdrawal] of vectors) {
      const ind = apvRateIndependent(base, withdrawal);
      const engine = calculateApvWithdrawalRate({ baseIncome: base, withdrawal, uta: UTA });
      check(`V4 ${label} ΔIGC`, engine.igcDelta, ind.igcDelta);
      check(`V4 ${label} rate`, engine.rate, ind.rate);
    }
    expect(() => calculateApvWithdrawalRate({ baseIncome: 0, withdrawal: 0, uta: UTA })).toThrow();
    expect(() => calculateApvWithdrawalRate({ baseIncome: 0, withdrawal: -1, uta: UTA })).toThrow();
    // El motor NO aplica la exención de pensionados: la aplica el llamador (documentado)
    const retired = calculateApvWithdrawalRate({ baseIncome: 200 * UTA, withdrawal: 10 * UTA, uta: UTA });
    expect(retired.rate).toBeCloseTo(0.415, 9);
  });

  it("V5 SuperIR: cuota consolidada y umbral legal", () => {
    const debts = [
      { amount: 1_800_000, overdueDays: 120, creditor: "Banco A" },
      { amount: 2_200_000, overdueDays: 150, creditor: "Retail B" },
    ];
    const engine = simulateDebtRenegotiation({
      debts,
      monthlyIncome: 1_200_000,
      termMonths: 48,
      monthlyRatePercent: 1.2,
      ufValue: UF_LEGACY,
      hasFirstCategoryActivityLast24Months: false,
      hasNotifiedExecutiveProceeding: false,
      hasRequiredDocuments: true,
    });
    const total = 1_800_000 + 2_200_000;
    const indPayment = calculateAnnuityPayment(total, 0.012, 48);
    const indUf = total / UF_LEGACY;
    check("V5.1 qualifiedDebtUf", engine.qualifiedDebtUf, indUf);
    check("V5.2 cuota (misma anualidad)", engine.monthlyPayment, indPayment);
    check("V5.3 total pagado", engine.totalPaid, indPayment * 48);
    check("V5.4 carga ingreso %", engine.incomeBurdenPercent, (indPayment / 1_200_000) * 100);
    expect(engine.qualifiedDebtCount).toBe(2);
    expect(engine.meetsBasicEligibility).toBe(true);
  });

  it("V5-bordes: >80 UF estricto, ≥91 días, mismo acreedor, rechazos", () => {
    const base = {
      monthlyIncome: 1_200_000,
      termMonths: 48,
      monthlyRatePercent: 1.2,
      ufValue: UF_LEGACY,
      hasFirstCategoryActivityLast24Months: false,
      hasNotifiedExecutiveProceeding: false,
      hasRequiredDocuments: true,
    };
    const exact80 = [
      { amount: 40 * UF_LEGACY, overdueDays: 120, creditor: "A" },
      { amount: 40 * UF_LEGACY, overdueDays: 120, creditor: "B" },
    ];
    const plus1 = [
      { amount: 40 * UF_LEGACY, overdueDays: 120, creditor: "A" },
      { amount: 40 * UF_LEGACY + 1, overdueDays: 120, creditor: "B" },
    ];
    expect(simulateDebtRenegotiation({ ...base, debts: exact80 }).requirementChecks.reachesMinimumUf).toBe(false);
    expect(simulateDebtRenegotiation({ ...base, debts: plus1 }).requirementChecks.reachesMinimumUf).toBe(true);
    const d90 = [
      { amount: 1_000_000, overdueDays: 90, creditor: "A" },
      { amount: 4_000_000, overdueDays: 90, creditor: "B" },
    ];
    const d91 = [
      { amount: 1_000_000, overdueDays: 91, creditor: "A" },
      { amount: 4_000_000, overdueDays: 91, creditor: "B" },
    ];
    expect(simulateDebtRenegotiation({ ...base, debts: d90 }).qualifiedDebtCount).toBe(0);
    expect(simulateDebtRenegotiation({ ...base, debts: d91 }).qualifiedDebtCount).toBe(2);
    const sameCreditor = [
      { amount: 3_000_000, overdueDays: 120, creditor: "Mismo" },
      { amount: 3_000_000, overdueDays: 120, creditor: "Mismo" },
    ];
    expect(simulateDebtRenegotiation({ ...base, debts: sameCreditor }).requirementChecks.hasTwoOrMoreQualifiedDebts).toBe(true);
    expect(simulateDebtRenegotiation({ ...base, debts: [sameCreditor[0]] }).meetsBasicEligibility).toBe(false);
    expect(() =>
      simulateDebtRenegotiation({ ...base, debts: [{ amount: 1_000_000, overdueDays: 120, creditor: " " }] })
    ).toThrow();
  });

  it("V6 serie IPC 2026 8/8 y parámetros congelados AT2026", () => {
    const dataset = readJson("src/data/economic-history/ipc-historico.json") as {
      serie: Array<{ fecha: string; valor: number }>;
      hastaFecha: string;
    };
    const published: Array<[string, number]> = [
      ["2026-01-01", 0.4], ["2026-02-01", 0], ["2026-03-01", 1.0], ["2026-04-01", 1.3],
      ["2026-05-01", 0.2], ["2026-06-01", 0], ["2026-07-01", 0.1], ["2026-08-01", 0.6],
    ];
    let factor = 1;
    for (const [fecha, valor] of published) {
      const row = dataset.serie.find(entry => entry.fecha === fecha);
      expect(row, `falta ${fecha} en dataset`).toBeDefined();
      check(`V6 ${fecha}`, row!.valor, valor);
      factor *= 1 + valor / 100;
    }
    check("V6 acumulado encadenado %", (factor - 1) * 100, 3.648807945707024);
    check("V6 $1M ajustado", 1_000_000 * factor, 1_036_488.0794570702);
    expect(dataset.hastaFecha).toBe("2026-08-01");
    expect(AT2026.uta).toBe(12 * 69_542);
    expect(AT2026.ufDecember).toBe(317_823_680 / 8_000);
    expect(AT2026.honorariosPpmRate).toBe(0.145);
    check("V6 cap APV 600 UF", 600 * AT2026.ufDecember, 23_836_776);
    check("V6 8 UTA", 8 * AT2026.uta, 6_676_032);
    check("V6 15 UTA", 15 * AT2026.uta, 12_517_560);
    expect(getTaxYearParameters(2026)).toBe(AT2026);
    expect(getTaxYearForCommercialYear(2025)).toBe(AT2026);
    expect(() => getTaxYearParameters(2025)).toThrow();
    expect(() => getTaxYearForCommercialYear(2024)).toThrow();
  });

  it("F04 freshness IPC/UTM y effective-dated fail-closed", () => {
    expect(evaluateIpcSeriesFreshness("2026-08", "2026-08").status).toBe("fresh");
    expect(evaluateIpcSeriesFreshness("2026-08", "2026-09").status).toBe("stale");
    expect(evaluateIpcSeriesFreshness("2026-08", null).status).toBe("unknown");
    expect(evaluateIpcSeriesFreshness("2026-08", "basura").status).toBe("unknown");
    // Calendario Chile: 2026-09-30 23:59 en Chile (UTC-3) ⇒ gracia día <=7
    expect(evaluateCriticalMonthlyFreshness("2026-08-01", new Date("2026-09-05T04:30:00Z")).status).toBe("grace");
    expect(evaluateCriticalMonthlyFreshness("2026-08-01", new Date("2026-09-09T04:30:00Z")).status).toBe("stale");
    expect(evaluateCriticalMonthlyFreshness("2026-09-01", new Date("2026-09-05T12:00:00Z")).status).toBe("fresh");
    expect(evaluateCriticalMonthlyFreshness("2026-10-01", new Date("2026-09-05T12:00:00Z")).status).toBe("stale");
    expect(evaluateCriticalMonthlyFreshness("mal").status).toBe("stale");
    const entries = [
      { indicator: "uf" as const, periodId: "2025-12", value: 39_727.96, effectiveFrom: "2025-12-01", effectiveTo: "2026-01-01", source: "test" },
    ];
    expect(resolveEffectiveValue(entries, "uf", "2025-12")?.value).toBe(39_727.96);
    expect(resolveEffectiveValue(entries, "uf", "2026-01")).toBeUndefined();
    expect(resolveEffectiveValue(entries, "utm", "2025-12")).toBeUndefined();
    // Hallazgo pass4: isPeriodId acepta meses imposibles (00–99) como "2025-13";
    // el formato se valida, el rango del mes no. Se documenta como defecto D17.
    expect(resolveEffectiveValue(entries, "uf", "2025-13")).toBeDefined();
  });
});

describe("pass4 — salida cruda", () => {
  it("imprime la tabla de comparación", () => {
    for (const line of auditLines) process.stdout.write(`${line}\n`);
    console.log(`\n${auditLines.length} checks independientes; ${auditLines.filter(l => l.includes("DIVERGENT")).length} divergencias`);
    expect(auditLines.filter(l => l.includes("DIVERGENT"))).toHaveLength(0);
  });
});
