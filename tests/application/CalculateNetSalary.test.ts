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
