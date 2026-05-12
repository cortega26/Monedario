import { describe, expect, it } from "vitest";
import {
  calculateNetSalary,
  estimateGrossFromNet,
} from "@/application/use-cases/CalculateNetSalary";

const UF = 40000;
const UTM = 67294;

describe("calculateNetSalary", () => {
  it("uses explicit taxable salary and contract type for worker deductions", () => {
    const result = calculateNetSalary({
      grossSalary: 1500000,
      taxableSalary: 1350000,
      afpRatePercent: 10.77,
      healthSystem: "fonasa",
      contractType: "plazo-fijo",
      economicParameters: {
        uf: UF,
        utm: UTM,
        afcTopes: { monthlyTaxableCapUf: 135.2 },
        previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 90 },
      },
    });

    expect(result.taxableSalary).toBe(1350000);
    expect(result.nonTaxableIncome).toBe(150000);
    expect(result.contractType).toBe("plazo-fijo");
    expect(result.deductions.unemploymentInsurance).toBe(0);
    expect(result.taxableBase).toBeCloseTo(1110105, 6);
  });

  it("caps pension-health and unemployment bases above the official UF limits", () => {
    const result = calculateNetSalary({
      grossSalary: 7000000,
      taxableSalary: 6200000,
      afpRatePercent: 10.77,
      healthSystem: "fonasa",
      contractType: "indefinido",
      economicParameters: {
        uf: UF,
        utm: UTM,
        afcTopes: { monthlyTaxableCapUf: 135.2 },
        previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 90 },
      },
    });

    expect(result.cappedBases.pensionAndHealth).toBe(3600000);
    expect(result.cappedBases.unemploymentInsurance).toBe(5408000);
    expect(result.deductions.afp).toBeCloseTo(387720, 6);
    expect(result.deductions.health).toBeCloseTo(252000, 6);
    expect(result.deductions.unemploymentInsurance).toBeCloseTo(32448, 6);
    expect(result.taxableBase).toBeCloseTo(5527832, 6);
  });
});

describe("calculateNetSalary — APV Régimen B", () => {
  const BASE_PARAMS = {
    uf: UF,
    utm: UTM,
    afcTopes: { monthlyTaxableCapUf: 135.2 },
    previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 90 },
  };

  it("without APV: result is identical to current behavior (regression)", () => {
    const withoutApv = calculateNetSalary({
      grossSalary: 2_000_000,
      afpRatePercent: 10.77,
      healthSystem: "fonasa",
      contractType: "indefinido",
      economicParameters: BASE_PARAMS,
    });
    const withApvZero = calculateNetSalary({
      grossSalary: 2_000_000,
      afpRatePercent: 10.77,
      healthSystem: "fonasa",
      contractType: "indefinido",
      apvRegimeB: 0,
      economicParameters: BASE_PARAMS,
    });

    expect(withApvZero.netSalary).toBeCloseTo(withoutApv.netSalary, 0);
    expect(withApvZero.deductions.tax).toBeCloseTo(withoutApv.deductions.tax, 0);
    expect(withApvZero.deductions.apvRegimenB).toBe(0);
  });

  it("APV Régimen B small: tax is reduced but positive", () => {
    const apvAmount = 100_000;
    const withoutApv = calculateNetSalary({
      grossSalary: 2_000_000,
      afpRatePercent: 10.77,
      healthSystem: "fonasa",
      contractType: "indefinido",
      economicParameters: BASE_PARAMS,
    });
    const withApv = calculateNetSalary({
      grossSalary: 2_000_000,
      afpRatePercent: 10.77,
      healthSystem: "fonasa",
      contractType: "indefinido",
      apvRegimeB: apvAmount,
      economicParameters: BASE_PARAMS,
    });

    expect(withApv.deductions.apvRegimenB).toBe(apvAmount);
    // Tax is reduced because incomeTaxBase is lower
    expect(withApv.deductions.tax).toBeLessThan(withoutApv.deductions.tax);
    // Tax is still positive for this salary level
    expect(withApv.deductions.tax).toBeGreaterThan(0);
    // APV reduces net salary (it's withheld from paycheck)
    expect(withApv.netSalary).toBeLessThan(withoutApv.netSalary);
    // But less than a full APV reduction because tax savings offset part of it
    expect(withoutApv.netSalary - withApv.netSalary).toBeLessThan(apvAmount);
  });

  it("APV Régimen B that eliminates the taxable base: income tax is 0", () => {
    // With gross=700k: AFP(10.77%)+health(7%)+unemployment(0.6%) ≈ 128,590
    // incomeTaxBase before APV ≈ 571,410 — so APV=600k fully eliminates it
    const withApv = calculateNetSalary({
      grossSalary: 700_000,
      afpRatePercent: 10.77,
      healthSystem: "fonasa",
      contractType: "indefinido",
      apvRegimeB: 600_000,
      economicParameters: BASE_PARAMS,
    });

    expect(withApv.deductions.tax).toBe(0);
    expect(withApv.taxableBase).toBe(0);
    expect(withApv.deductions.apvRegimenB).toBe(600_000);
  });
});

describe("estimateGrossFromNet", () => {
  const BASE_PARAMS = { uf: UF, utm: UTM };

  it("round-trips: net salary of the estimated gross equals the target (fonasa, indefinido)", () => {
    const targetNet = 900_000;
    const result = estimateGrossFromNet({
      targetNetSalary: targetNet,
      afpRatePercent: 11.27,
      healthSystem: "fonasa",
      contractType: "indefinido",
      economicParameters: BASE_PARAMS,
    });
    expect(Math.abs(result.netSalary - targetNet)).toBeLessThanOrEqual(1);
    expect(result.grossSalary).toBeGreaterThan(targetNet);
  });

  it("round-trips with plazo-fijo (no unemployment deduction)", () => {
    const targetNet = 600_000;
    const result = estimateGrossFromNet({
      targetNetSalary: targetNet,
      afpRatePercent: 10.58,
      healthSystem: "fonasa",
      contractType: "plazo-fijo",
      economicParameters: BASE_PARAMS,
    });
    expect(Math.abs(result.netSalary - targetNet)).toBeLessThanOrEqual(1);
    expect(result.contractType).toBe("plazo-fijo");
    expect(result.deductions.unemploymentInsurance).toBe(0);
  });

  it("round-trips with isapre and additional health premium", () => {
    const targetNet = 1_200_000;
    const result = estimateGrossFromNet({
      targetNetSalary: targetNet,
      afpRatePercent: 11.27,
      healthSystem: "isapre",
      isapreAdditionalPercent: 2,
      contractType: "indefinido",
      economicParameters: BASE_PARAMS,
    });
    expect(Math.abs(result.netSalary - targetNet)).toBeLessThanOrEqual(1);
    expect(result.effectiveRates.healthPercent).toBeCloseTo(9, 4);
  });

  it("gross salary is strictly greater than the target net salary", () => {
    const targetNet = 500_000;
    const result = estimateGrossFromNet({
      targetNetSalary: targetNet,
      afpRatePercent: 11.27,
      healthSystem: "fonasa",
      contractType: "indefinido",
      economicParameters: BASE_PARAMS,
    });
    expect(result.grossSalary).toBeGreaterThan(targetNet);
  });

  it("throws on non-positive target net salary", () => {
    expect(() =>
      estimateGrossFromNet({
        targetNetSalary: 0,
        afpRatePercent: 11.27,
        healthSystem: "fonasa",
        economicParameters: BASE_PARAMS,
      })
    ).toThrow("targetNetSalary must be a finite number greater than 0.");
  });
});
