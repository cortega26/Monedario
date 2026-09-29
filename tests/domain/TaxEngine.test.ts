import { describe, expect, it } from "vitest";
import {
  calculateAnnualIncomeTax,
  calculateSecondCategoryTax,
} from "@/domain/taxation/TaxEngine";
import { secondCategoryTaxWorkedExample } from "@/domain/taxation/calculateSecondCategoryTax.methodology";

const UTM = 67294;

function roundToPeso(value: number): number {
  return Math.round(value);
}

describe("TaxEngine.calculateSecondCategoryTax", () => {
  it("returns zero tax for zero taxable income", () => {
    const result = calculateSecondCategoryTax({ taxableIncome: 0, utm: UTM });
    expect(result.taxAmount).toBe(0);
    expect(result.marginalRate).toBe(0);
  });

  it("keeps first bracket upper boundary exempt", () => {
    const result = calculateSecondCategoryTax({
      taxableIncome: 13.5 * UTM,
      utm: UTM,
    });
    expect(result.taxAmount).toBe(0);
    expect(result.marginalRate).toBe(0);
  });

  it("applies second bracket immediately above the first boundary", () => {
    const result = calculateSecondCategoryTax({
      taxableIncome: 13.5 * UTM + 1,
      utm: UTM,
    });
    expect(result.taxAmount).toBeCloseTo(0.04, 6);
    expect(result.marginalRate).toBe(0.04);
  });

  it("transitions to the top bracket for extreme income", () => {
    const result = calculateSecondCategoryTax({
      taxableIncome: 180 * UTM,
      utm: UTM,
    });
    // d8 = 30.82 × UTM = 2,074,001.08 → tax = 180×UTM×0.4 − d8 = 2,771,166.92
    expect(result.taxAmount).toBeCloseTo(2771166.92, 2);
    expect(result.marginalRate).toBe(0.4);
  });

  it("produces continuous tax at the bracket 2/3 boundary (30 UTM)", () => {
    const fromBelow = calculateSecondCategoryTax({
      taxableIncome: 30 * UTM,
      utm: UTM,
    });
    const fromAbove = calculateSecondCategoryTax({
      taxableIncome: 30 * UTM + 1,
      utm: UTM,
    });
    expect(Math.abs(fromAbove.taxAmount - fromBelow.taxAmount)).toBeLessThan(1);
  });

  it("produces continuous tax at the bracket 3/4 boundary (50 UTM)", () => {
    const fromBelow = calculateSecondCategoryTax({
      taxableIncome: 50 * UTM,
      utm: UTM,
    });
    const fromAbove = calculateSecondCategoryTax({
      taxableIncome: 50 * UTM + 1,
      utm: UTM,
    });
    expect(Math.abs(fromAbove.taxAmount - fromBelow.taxAmount)).toBeLessThan(1);
  });

  it("produces continuous tax at the bracket 4/5 boundary (70 UTM)", () => {
    const fromBelow = calculateSecondCategoryTax({
      taxableIncome: 70 * UTM,
      utm: UTM,
    });
    const fromAbove = calculateSecondCategoryTax({
      taxableIncome: 70 * UTM + 1,
      utm: UTM,
    });
    expect(Math.abs(fromAbove.taxAmount - fromBelow.taxAmount)).toBeLessThan(1);
  });

  it("computes exact tax for an income in bracket 4 (60 UTM)", () => {
    const result = calculateSecondCategoryTax({
      taxableIncome: 60 * UTM,
      utm: UTM,
    });
    // tax = 60×UTM×0.135 − 4.49×UTM = (60×0.135 − 4.49) × UTM = (8.1 − 4.49) × UTM = 3.61 × UTM
    const expected = 3.61 * UTM;
    expect(result.taxAmount).toBeCloseTo(expected, 0);
    expect(result.marginalRate).toBe(0.135);
  });

  it("maintains monotonic tax amount as taxable income increases", () => {
    const low = calculateSecondCategoryTax({
      taxableIncome: 30 * UTM,
      utm: UTM,
    });
    const mid = calculateSecondCategoryTax({
      taxableIncome: 50 * UTM,
      utm: UTM,
    });
    const high = calculateSecondCategoryTax({
      taxableIncome: 70 * UTM,
      utm: UTM,
    });

    expect(low.taxAmount).toBeLessThanOrEqual(mid.taxAmount);
    expect(mid.taxAmount).toBeLessThanOrEqual(high.taxAmount);
  });

  it("uses stable rounding to CLP pesos for UI presentation", () => {
    const result = calculateSecondCategoryTax({
      taxableIncome: 23.123 * UTM,
      utm: UTM,
    });
    expect(roundToPeso(result.taxAmount)).toBe(25903);
  });

  it("throws on invalid taxable income", () => {
    expect(() =>
      calculateSecondCategoryTax({ taxableIncome: -1, utm: UTM })
    ).toThrow("taxableIncome must be a finite number >= 0.");
  });

  it("throws on invalid UTM value", () => {
    expect(() =>
      calculateSecondCategoryTax({ taxableIncome: 1000000, utm: 0 })
    ).toThrow("utm must be a finite number > 0.");
  });

  describe("ejemplo de metodología — anti-drift", () => {
    it("el impuesto real coincide con el ejemplo publicado", () => {
      // Si la fórmula o los tramos cambian y el ejemplo mostrado al usuario
      // queda desactualizado, este test falla.
      const result = calculateSecondCategoryTax(
        secondCategoryTaxWorkedExample.input
      );
      expect(roundToPeso(result.taxAmount)).toBe(
        secondCategoryTaxWorkedExample.expectedTaxAmountRounded
      );
      expect(result.marginalRate).toBe(
        secondCategoryTaxWorkedExample.expectedMarginalRate
      );
    });
  });
});

describe("TaxEngine.calculateAnnualIncomeTax", () => {
  const UTA_AT2026 = 834_504;

  it("usa la UTA congelada del año tributario, no la UTM vigente", () => {
    const result = calculateAnnualIncomeTax({
      taxableIncome: 18_000_000,
      uta: UTA_AT2026,
    });

    expect(result.taxAmount).toBeCloseTo(269_367.84, 2);
    expect(result.marginalRate).toBeCloseTo(0.04, 6);
  });

  it("mantiene el tramo exento hasta 13,5 UTA", () => {
    const result = calculateAnnualIncomeTax({
      taxableIncome: 13.5 * UTA_AT2026,
      uta: UTA_AT2026,
    });

    expect(result.taxAmount).toBe(0);
    expect(result.marginalRate).toBe(0);
  });

  it("rechaza una UTA inválida", () => {
    expect(() =>
      calculateAnnualIncomeTax({ taxableIncome: 1_000_000, uta: 0 })
    ).toThrow("utm must be a finite number > 0.");
  });
});
