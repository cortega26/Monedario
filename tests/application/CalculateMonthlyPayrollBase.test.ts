import { describe, expect, it } from "vitest";
import { calculateMonthlyPayrollBase } from "@/application/use-cases/CalculateMonthlyPayrollBase";

// UF value representative of 2026 (used for cap computation)
const UF = 39300;

// Caps from domain defaults as documented in the use-case source
const PENSION_HEALTH_CAP_UF = 90; // 90 UF
const UNEMPLOYMENT_CAP_UF = 135.2; // 135.2 UF

const PENSION_HEALTH_CAP_CLP = PENSION_HEALTH_CAP_UF * UF; // 3_537_000
const UNEMPLOYMENT_CAP_CLP = UNEMPLOYMENT_CAP_UF * UF; // 5_313_360

const BASE_PARAMS = {
  uf: UF,
  afcTopes: { monthlyTaxableCapUf: UNEMPLOYMENT_CAP_UF },
  previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: PENSION_HEALTH_CAP_UF },
};

describe("calculateMonthlyPayrollBase", () => {
  it("computes deductions for a typical indefinido FONASA worker (sueldo medio)", () => {
    // Gross ~$1,000,000 CLP — below caps, FONASA, AFP 10.77%
    const result = calculateMonthlyPayrollBase({
      grossSalary: 1_000_000,
      afpRatePercent: 10.77,
      healthSystem: "fonasa",
      contractType: "indefinido",
      economicParameters: BASE_PARAMS,
    });

    expect(result.grossSalary).toBe(1_000_000);
    expect(result.taxableSalary).toBe(1_000_000);
    // AFP deduction: 1_000_000 * 10.77% = 107_700
    expect(result.deductions.afp).toBeCloseTo(107_700, 0);
    // Health (FONASA): 1_000_000 * 7% = 70_000
    expect(result.deductions.health).toBeCloseTo(70_000, 0);
    // Unemployment (indefinido worker): 1_000_000 * 0.6% = 6_000
    expect(result.deductions.unemploymentInsurance).toBeCloseTo(6_000, 0);
    // incomeTaxBase must be gross minus the three deductions
    const expectedIncomeTaxBase = 1_000_000 - 107_700 - 70_000 - 6_000;
    expect(result.incomeTaxBase).toBeCloseTo(expectedIncomeTaxBase, 0);
    // Effective rates round-trip
    expect(result.effectiveRates.afpPercent).toBeCloseTo(10.77, 4);
    expect(result.effectiveRates.healthPercent).toBeCloseTo(7, 4);
    expect(result.effectiveRates.unemploymentInsurancePercent).toBeCloseTo(0.6, 4);
  });

  it("returns zero unemployment deduction for plazo-fijo contract", () => {
    const result = calculateMonthlyPayrollBase({
      grossSalary: 800_000,
      afpRatePercent: 10.77,
      healthSystem: "fonasa",
      contractType: "plazo-fijo",
      economicParameters: BASE_PARAMS,
    });

    expect(result.contractType).toBe("plazo-fijo");
    expect(result.deductions.unemploymentInsurance).toBe(0);
    expect(result.effectiveRates.unemploymentInsurancePercent).toBe(0);
  });

  it("caps pension-health and unemployment bases above the official UF limits", () => {
    // Salary well above both caps
    const result = calculateMonthlyPayrollBase({
      grossSalary: 8_000_000,
      afpRatePercent: 10.77,
      healthSystem: "fonasa",
      contractType: "indefinido",
      economicParameters: BASE_PARAMS,
    });

    // Pension+health cap applied
    expect(result.cappedBases.pensionAndHealth).toBe(PENSION_HEALTH_CAP_CLP);
    expect(result.deductions.afp).toBeCloseTo(PENSION_HEALTH_CAP_CLP * 0.1077, 0);
    expect(result.deductions.health).toBeCloseTo(PENSION_HEALTH_CAP_CLP * 0.07, 0);
    // Unemployment cap applied
    expect(result.cappedBases.unemploymentInsurance).toBe(UNEMPLOYMENT_CAP_CLP);
    expect(result.deductions.unemploymentInsurance).toBeCloseTo(
      UNEMPLOYMENT_CAP_CLP * 0.006,
      0
    );
  });

  it("tests minimum wage boundary (sueldo mínimo 2026: ~$500,000 CLP)", () => {
    // Sueldo mínimo Chile 2026: 500,000 CLP (approximate — adjust to real value when confirmed)
    const SUELDO_MINIMO = 500_000;
    const result = calculateMonthlyPayrollBase({
      grossSalary: SUELDO_MINIMO,
      afpRatePercent: 10.77,
      healthSystem: "fonasa",
      contractType: "indefinido",
      economicParameters: BASE_PARAMS,
    });

    // No caps should trigger at minimum wage
    expect(result.cappedBases.pensionAndHealth).toBe(SUELDO_MINIMO);
    expect(result.cappedBases.unemploymentInsurance).toBe(SUELDO_MINIMO);
    expect(result.assumptions.usedGrossAsTaxableSalary).toBe(true);
    // incomeTaxBase > 0 at minimum wage
    expect(result.incomeTaxBase).toBeGreaterThan(0);
  });

  it("applies ISAPRE additional health contribution", () => {
    // ISAPRE: 7% base + additional plan premium
    const result = calculateMonthlyPayrollBase({
      grossSalary: 1_500_000,
      afpRatePercent: 10.77,
      healthSystem: "isapre",
      isapreAdditionalPercent: 2, // 2% additional = 9% total
      contractType: "indefinido",
      economicParameters: BASE_PARAMS,
    });

    // Total health rate = 7% + 2% = 9%
    expect(result.effectiveRates.healthPercent).toBeCloseTo(9, 4);
    expect(result.deductions.health).toBeCloseTo(1_500_000 * 0.09, 0);
  });

  it("handles explicit taxableSalary (non-taxable income present)", () => {
    // 200,000 is non-taxable (e.g. viatico)
    const result = calculateMonthlyPayrollBase({
      grossSalary: 1_200_000,
      taxableSalary: 1_000_000,
      afpRatePercent: 10.77,
      healthSystem: "fonasa",
      contractType: "indefinido",
      economicParameters: BASE_PARAMS,
    });

    expect(result.nonTaxableIncome).toBe(200_000);
    expect(result.taxableSalary).toBe(1_000_000);
    expect(result.assumptions.usedGrossAsTaxableSalary).toBe(false);
    // Deductions computed on taxableSalary, not grossSalary
    expect(result.deductions.afp).toBeCloseTo(1_000_000 * 0.1077, 0);
  });

  it("throws on invalid inputs", () => {
    expect(() =>
      calculateMonthlyPayrollBase({
        grossSalary: -1,
        afpRatePercent: 10.77,
        healthSystem: "fonasa",
        economicParameters: BASE_PARAMS,
      })
    ).toThrow("grossSalary");

    expect(() =>
      calculateMonthlyPayrollBase({
        grossSalary: 1_000_000,
        taxableSalary: 1_500_000, // taxable > gross
        afpRatePercent: 10.77,
        healthSystem: "fonasa",
        economicParameters: BASE_PARAMS,
      })
    ).toThrow("taxableSalary");
  });

  it("apvRegimeB reduces incomeTaxBase by the APV amount", () => {
    const withoutApv = calculateMonthlyPayrollBase({
      grossSalary: 2_000_000,
      afpRatePercent: 10.77,
      healthSystem: "fonasa",
      contractType: "indefinido",
      economicParameters: BASE_PARAMS,
    });

    const apvAmount = 100_000;
    const withApv = calculateMonthlyPayrollBase({
      grossSalary: 2_000_000,
      afpRatePercent: 10.77,
      healthSystem: "fonasa",
      contractType: "indefinido",
      apvRegimeB: apvAmount,
      economicParameters: BASE_PARAMS,
    });

    expect(withApv.deductions.apvRegimenB).toBe(apvAmount);
    expect(withApv.incomeTaxBase).toBeCloseTo(
      withoutApv.incomeTaxBase - apvAmount,
      0
    );
    // Previsional deductions are unchanged
    expect(withApv.deductions.afp).toBeCloseTo(withoutApv.deductions.afp, 0);
    expect(withApv.deductions.health).toBeCloseTo(withoutApv.deductions.health, 0);
  });

  it("apvRegimeB that exceeds the remaining taxable base clamps incomeTaxBase to 0", () => {
    const result = calculateMonthlyPayrollBase({
      grossSalary: 600_000,
      afpRatePercent: 10.77,
      healthSystem: "fonasa",
      contractType: "indefinido",
      apvRegimeB: 600_000,
      economicParameters: BASE_PARAMS,
    });

    expect(result.incomeTaxBase).toBe(0);
    expect(result.deductions.apvRegimenB).toBe(600_000);
  });

  it("apvRegimenB is 0 in output when apvRegimeB is not provided", () => {
    const result = calculateMonthlyPayrollBase({
      grossSalary: 1_000_000,
      afpRatePercent: 10.77,
      healthSystem: "fonasa",
      economicParameters: BASE_PARAMS,
    });

    expect(result.deductions.apvRegimenB).toBe(0);
  });

  it("throws when apvRegimeB is negative", () => {
    expect(() =>
      calculateMonthlyPayrollBase({
        grossSalary: 1_000_000,
        afpRatePercent: 10.77,
        healthSystem: "fonasa",
        apvRegimeB: -1,
        economicParameters: BASE_PARAMS,
      })
    ).toThrow("apvRegimeB");
  });
});
