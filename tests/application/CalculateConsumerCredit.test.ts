import { describe, expect, it } from "vitest";
import { calculateConsumerCredit } from "@/application/use-cases/CalculateConsumerCredit";
import { consumerCreditWorkedExample } from "@/application/use-cases/CalculateConsumerCredit.methodology";

describe("calculateConsumerCredit", () => {
  it("computes low-risk consumer credit (12 months, monthly rate 1.5%)", () => {
    // Principal: 1,000,000 CLP, 12 months, 1.5% monthly
    const result = calculateConsumerCredit({
      principal: 1_000_000,
      termMonths: 12,
      rateValue: 1.5,
      rateType: "mensual",
    });

    // Monthly payment via annuity: P * r / (1 - (1+r)^-n)
    const r = 0.015;
    const n = 12;
    const expectedMonthlyBase = (1_000_000 * r) / (1 - Math.pow(1 + r, -n));
    expect(result.monthlyPaymentBase).toBeCloseTo(expectedMonthlyBase, 1);
    expect(result.monthlyPaymentTotal).toBeCloseTo(expectedMonthlyBase, 1);
    expect(result.totalPaid).toBeCloseTo(expectedMonthlyBase * 12, 1);
    expect(result.totalInterest).toBeCloseTo(expectedMonthlyBase * 12 - 1_000_000, 1);
    // CAE ≥ annual equivalent rate (adds no insurance/costs here, should be equal)
    expect(result.caePercent).toBeCloseTo(result.annualEquivalentRatePercent, 0);
  });

  it("computes high-interest revolving credit (annual rate 48%)", () => {
    // Consumer fintech credit: 500,000 CLP, 6 months, 48% annual
    const result = calculateConsumerCredit({
      principal: 500_000,
      termMonths: 6,
      rateValue: 48,
      rateType: "anual",
    });

    // Monthly rate from annual: (1+0.48)^(1/12) - 1
    const expectedMonthlyRate = Math.pow(1.48, 1 / 12) - 1;
    expect(result.monthlyRateDecimal).toBeCloseTo(expectedMonthlyRate, 6);
    expect(result.totalInterest).toBeGreaterThan(0);
    // CAE > 0 and > monthly equivalent annualized rate when no extra costs
    expect(result.caePercent).toBeGreaterThan(0);
    expect(result.annualEquivalentRatePercent).toBeGreaterThan(40);
  });

  it("applies monthly insurance and operating costs to total paid", () => {
    // 2,000,000 CLP, 24 months, 2% monthly + 10,000 insurance + 50,000 operating cost
    const result = calculateConsumerCredit({
      principal: 2_000_000,
      termMonths: 24,
      rateValue: 2,
      rateType: "mensual",
      monthlyInsurance: 10_000,
      operatingCosts: 50_000,
    });

    // Base payment without insurance
    const r = 0.02;
    const n = 24;
    const expectedBase = (2_000_000 * r) / (1 - Math.pow(1 + r, -n));
    expect(result.monthlyPaymentBase).toBeCloseTo(expectedBase, 1);
    // Total monthly = base + insurance
    expect(result.monthlyPaymentTotal).toBeCloseTo(expectedBase + 10_000, 1);
    // Total paid = monthly × n + operating costs
    expect(result.totalPaid).toBeCloseTo((expectedBase + 10_000) * 24 + 50_000, 1);
    // CAE > rate without costs (insurance & operating costs inflate effective rate)
    expect(result.caePercent).toBeGreaterThan(result.annualEquivalentRatePercent);
  });

  it("CAE reflects the true cost including operating costs (net disbursed principal)", () => {
    // When operating costs are present, CAE is computed on net disbursed principal
    const principal = 1_000_000;
    const operatingCosts = 100_000;
    const result = calculateConsumerCredit({
      principal,
      termMonths: 12,
      rateValue: 2,
      rateType: "mensual",
      operatingCosts,
    });

    // CAE should be larger than the nominal equivalent annual rate
    expect(result.caePercent).toBeGreaterThan(result.annualEquivalentRatePercent);
    // totalInterest = totalPaid - principal (includes operating costs effect)
    expect(result.totalInterest).toBeCloseTo(result.totalPaid - principal, 1);
  });

  it("CAE is positive for any positive principal and rate", () => {
    const result = calculateConsumerCredit({
      principal: 300_000,
      termMonths: 36,
      rateValue: 1,
      rateType: "mensual",
    });

    expect(result.caePercent).toBeGreaterThan(0);
    expect(result.monthlyPaymentBase).toBeGreaterThan(0);
  });

  it("throws on zero or negative principal", () => {
    expect(() =>
      calculateConsumerCredit({
        principal: 0,
        termMonths: 12,
        rateValue: 1.5,
        rateType: "mensual",
      })
    ).toThrow("principal");
  });

  it("throws when operating costs exceed principal", () => {
    expect(() =>
      calculateConsumerCredit({
        principal: 100_000,
        termMonths: 12,
        rateValue: 1.5,
        rateType: "mensual",
        operatingCosts: 200_000,
      })
    ).toThrow("operatingCosts");
  });

  describe("ejemplo de metodología — anti-drift", () => {
    it("la cuota y el total reales coinciden con el ejemplo publicado", () => {
      // Si la fórmula cambia y el ejemplo mostrado al usuario queda
      // desactualizado, este test falla.
      const result = calculateConsumerCredit(consumerCreditWorkedExample.input);
      const expected = consumerCreditWorkedExample.expected;
      expect(result.monthlyPaymentTotal).toBeCloseTo(
        expected.monthlyPaymentTotal,
        6
      );
      expect(result.totalPaid).toBeCloseTo(expected.totalPaid, 6);
      // La UI redondea a pesos enteros; comparamos lo que ve el usuario.
      expect(Math.round(result.monthlyPaymentTotal)).toBe(
        expected.monthlyPaymentTotalRounded
      );
      expect(Math.round(result.totalPaid)).toBe(expected.totalPaidRounded);
    });
  });
});
