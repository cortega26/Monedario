/**
 * Re-auditoría plan 115 (commit 8b73793) — harness adversarial (R3).
 *
 * Lado independiente: este archivo reimplementa las fórmulas desde los valores
 * publicados (tabla SII con rebajas por tramo, interés simple, anualidad,
 * filtros legales). El lado motor importa el código del repositorio y se
 * comparan ambos con tolerancia 1e-6 (display redondeado se marca aparte).
 *
 * No modifica `src/`.
 */
import { describe, expect, it } from "vitest";
import {
  calculateAnnualIncomeTax,
  calculateApvWithdrawalRate,
  calculateSecondCategoryTax,
} from "@/domain/taxation/TaxEngine";
import { AT2026 } from "@/domain/taxation/TaxYearParameters";
import { calculateTermDeposit } from "@/application/use-cases/CalculateTermDeposit";
import { calculateNetSalary } from "@/application/use-cases/CalculateNetSalary";
import { simulateDebtRenegotiation } from "@/application/use-cases/SimulateDebtRenegotiation";
import { simulateOperacionRenta } from "@/application/use-cases/SimulateOperacionRenta";
import { calculateAnnuityPayment } from "@/application/use-cases/shared/creditAmortization";
import { evaluateIpcSeriesFreshness } from "@/utils/economicFreshness";
import { resolveEffectiveValue } from "@/domain/economic/EffectiveDatedParameters";

// ---------------------------------------------------------------------------
// Lado independiente — valores publicados por SII (consulta 2026-09-29)
// ---------------------------------------------------------------------------
const UTA = 834_504; // SII utm2025.htm: dic-2025 UTM 69.542 × 12
const UTM = 71_721; // SII utm2026.htm: septiembre 2026
const UF_DIC_31 = 39_727.96; // SII AT2026: 8.000 UF al 31.12.2025 = $317.823.680

type Bracket = [limit: number, rate: number, rebate: number];
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

function independentNetSalary(gross: number) {
  const afp = gross * 0.1127;
  const health = gross * 0.07;
  const afc = gross * 0.006;
  const base = gross - afp - health - afc;
  const tax = independentTax(base, UTM);
  return { base, tax, net: gross - afp - health - afc - tax };
}

const results: string[] = [];
function report(label: string, independent: unknown, engine: unknown) {
  const ok =
    typeof independent === "number" && typeof engine === "number"
      ? Math.abs(independent - engine) < 1e-6
      : JSON.stringify(independent) === JSON.stringify(engine);
  results.push(
    `${ok ? "OK  " : "FAIL"} ${label}: independiente=${independent} motor=${engine}`
  );
  return ok;
}

describe("re-auditoría plan 115 — recálculo independiente vs motor", () => {
  it("V1: IGC $18.000.000 con UTA dic-2025", () => {
    const engine = calculateAnnualIncomeTax({
      taxableIncome: 18_000_000,
      uta: UTA,
    });
    const independent = independentTax(18_000_000, UTA);
    expect(report("V1.igc", independent, engine.taxAmount)).toBe(true);
    expect(engine.taxAmount).toBeCloseTo(269_367.84, 9);
    expect(engine.marginalRate).toBeCloseTo(0.04, 12);

    const buggy = independentTax(18_000_000, 12 * UTM);
    report("V1.repro-bug-UTM-sep", buggy, buggy);
    expect(buggy).toBeCloseTo(255_247.92, 9);

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
    expect(report("V1.usecase", independent, viaUseCase.igcCalculado)).toBe(true);
    expect(viaUseCase.apvCap).toBe(600 * UF_DIC_31);
    expect(viaUseCase.apvCap).toBeCloseTo(23_836_776, 9);
  });

  it("Tabla general 310 UTM/UTA (no art. 52 bis 150)", () => {
    for (const [n, expected] of [
      [180, (180 * 0.35 - 23.32) * UTM],
      [200, (200 * 0.35 - 23.32) * UTM],
      [310, (310 * 0.35 - 23.32) * UTM],
      [320, (320 * 0.4 - 38.82) * UTM],
    ] as const) {
      const engine = calculateSecondCategoryTax({
        taxableIncome: n * UTM,
        utm: UTM,
      });
      expect(report(`IUSC.${n}UTM`, expected, engine.taxAmount)).toBe(true);
    }
    for (const n of [200, 310, 320] as const) {
      const engine = calculateAnnualIncomeTax({ taxableIncome: n * UTA, uta: UTA });
      const expected = independentTax(n * UTA, UTA);
      expect(report(`IGC.${n}UTA`, expected, engine.taxAmount)).toBe(true);
    }
    // 320 UTA con la estructura art. 52 bis habría dado +$6.676.032
    const bis = (320 * 0.4 - 30.82) * UTA;
    expect(independentTax(320 * UTA, UTA) - bis).toBeCloseTo(-6_676_032, 6);
  });

  it("V2: sueldo líquido $1.200.000", () => {
    const engine = calculateNetSalary({
      grossSalary: 1_200_000,
      afpRatePercent: 11.27,
      healthSystem: "fonasa",
      contractType: "indefinido",
      economicParameters: {
        uf: 41_049.01,
        utm: UTM,
        afcTopes: { monthlyTaxableCapUf: 135.2 },
        previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 90 },
      },
    });
    const independent = independentNetSalary(1_200_000);
    expect(report("V2.base", independent.base, engine.taxableBase)).toBe(true);
    expect(report("V2.tax", independent.tax, engine.deductions.tax)).toBe(true);
    expect(report("V2.net", independent.net, engine.netSalary)).toBe(true);
    expect(Math.round(engine.deductions.tax)).toBe(213);
    expect(Math.round(engine.netSalary)).toBe(973_347);
    expect(engine.deductions.unemploymentInsurance).toBeCloseTo(7_200, 9);
  });

  it("V3: DAP $5.000.000 / 180d / 5%", () => {
    const engine = calculateTermDeposit({
      amount: 5_000_000,
      termDays: 180,
      annualRatePercent: 5,
    });
    const independent = 5_000_000 * 0.05 * (180 / 365);
    expect(report("V3.gross", independent, engine.grossInterest)).toBe(true);
    expect(engine.grossInterest).toBeCloseTo(123_287.67, 2);
    expect(engine.finalAmount).toBeCloseTo(5_000_000 + independent, 9);
    // el 4% universal habría dado:
    expect(independent * 0.96).toBeCloseTo(118_356.16, 2);
  });

  it("V4: APV art. 42 bis N°3 (ΔIGC/retiro × 1,1 + 3 pp)", () => {
    for (const [base, w] of [
      [90 * UTA, 50 * UTA],
      [200 * UTA, 10 * UTA],
      [0, 5 * UTA],
      [10 * UTA, 5 * UTA],
    ] as const) {
      const engine = calculateApvWithdrawalRate({
        baseIncome: base,
        withdrawal: w,
        uta: UTA,
      });
      const independent = independentApvRate(base, w);
      expect(
        report(`V4.delta.base${base / UTA}w${w / UTA}`, independent.igcDelta, engine.igcDelta)
      ).toBe(true);
      expect(
        report(`V4.rate.base${base / UTA}w${w / UTA}`, independent.rate, engine.rate)
      ).toBe(true);
    }
    const marginal = calculateApvWithdrawalRate({
      baseIncome: 200 * UTA,
      withdrawal: 10 * UTA,
      uta: UTA,
    });
    expect(marginal.rate).toBeCloseTo(0.35 * 1.1 + 0.03, 12);
    expect(() =>
      calculateApvWithdrawalRate({ baseIncome: 0, withdrawal: 0, uta: UTA })
    ).toThrow();
  });

  it("V5: SuperIR art. 260 — bordes 80 UF, 90/91 días, mismo acreedor", () => {
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
    const uf1 = 4_000_000 / 39_300;
    const pay1 = independentAnnuity(4_000_000, 0.012, 48);
    expect(report("V5.uf", uf1, case1.qualifiedDebtUf)).toBe(true);
    expect(report("V5.cuota", pay1, case1.monthlyPayment)).toBe(true);
    expect(report("V5.totalPaid", pay1 * 48, case1.totalPaid)).toBe(true);
    expect(case1.meetsBasicEligibility).toBe(true);

    const sameCreditor = simulateDebtRenegotiation({
      ...base,
      debts: [
        { amount: 2_000_000, overdueDays: 120, creditor: "Banco A" },
        { amount: 2_000_000, overdueDays: 130, creditor: "Banco A" },
      ],
    });
    // Art. 260: "dos o más obligaciones ... provenientes de obligaciones
    // diversas" — el mismo acreedor con dos obligaciones no queda excluido.
    expect(sameCreditor.meetsBasicEligibility).toBe(true);
    report("V5.mismo-acreedor", true, sameCreditor.meetsBasicEligibility);

    const exactly80 = simulateDebtRenegotiation({
      ...base,
      debts: [
        { amount: 40 * 39_300, overdueDays: 200, creditor: "A" },
        { amount: 40 * 39_300, overdueDays: 200, creditor: "B" },
      ],
    });
    expect(exactly80.qualifiedDebtUf).toBeCloseTo(80, 12);
    report("V5.80UF-exactas", false, exactly80.meetsBasicEligibility);
    const plus1 = simulateDebtRenegotiation({
      ...base,
      debts: [
        { amount: 40 * 39_300, overdueDays: 200, creditor: "A" },
        { amount: 40 * 39_300 + 1, overdueDays: 200, creditor: "B" },
      ],
    });
    report("V5.80UF+$1", true, plus1.meetsBasicEligibility);

    const ninety = simulateDebtRenegotiation({
      ...base,
      debts: [
        { amount: 2_000_000, overdueDays: 90, creditor: "A" },
        { amount: 2_000_000, overdueDays: 91, creditor: "B" },
      ],
    });
    expect(ninety.qualifiedDebtCount).toBe(1);
    report("V5.90dias", false, ninety.meetsBasicEligibility);
  });

  it("V6: frescura IPC y effective-dated exclusivo", () => {
    expect(evaluateIpcSeriesFreshness("2026-08", "2026-08").status).toBe("fresh");
    expect(evaluateIpcSeriesFreshness("2026-08", "2026-09").status).toBe("stale");
    expect(evaluateIpcSeriesFreshness("2026-08", null).status).toBe("unknown");
    const entries = [
      {
        indicator: "uf" as const,
        periodId: "2025-12",
        value: 39_727.96,
        effectiveFrom: "2025-12-01",
        effectiveTo: "2026-01-01",
        source: "BCCh",
      },
    ];
    expect(resolveEffectiveValue(entries, "uf", "2025-12")?.value).toBe(39_727.96);
    expect(resolveEffectiveValue(entries, "uf", "2026-01")).toBeUndefined();
    expect(resolveEffectiveValue(entries, "uf", "2025-11")).toBeUndefined();
    expect(resolveEffectiveValue(entries, "uf", "2025/12")).toBeUndefined();
  });

  it("imprime el resumen de comparaciones", () => {
    const failures = results.filter(line => line.startsWith("FAIL"));
    // eslint-disable-next-line no-console
    console.log(`\n=== RE-AUDIT COMPARISON (${results.length} checks) ===`);
    for (const line of results) {
      // eslint-disable-next-line no-console
      console.log(line);
    }
    // eslint-disable-next-line no-console
    console.log(`=== FAILS: ${failures.length} ===`);
    expect(failures).toEqual([]);
  });
});
