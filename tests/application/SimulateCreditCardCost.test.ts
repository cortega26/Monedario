import { describe, expect, it } from "vitest";
import { simulateCreditCardCost } from "@/application/use-cases/SimulateCreditCardCost";

describe("simulateCreditCardCost", () => {
  it("minimum payment scenario: debt grows slowly and takes many months to clear", () => {
    // Typical revolving credit card: 500,000 CLP, 3% monthly, 3% min payment
    const result = simulateCreditCardCost({
      debt: 500_000,
      monthlyRatePercent: 3,
      minimumPaymentPercent: 3,
    });

    expect(result.usesFixedPayment).toBe(false);
    // With min payment only, takes many months (>> 12)
    expect(result.baseline.months).toBeGreaterThan(24);
    // Total paid > debt (interest accrues)
    expect(result.baseline.totalPaid).toBeGreaterThan(500_000);
    expect(result.baseline.totalInterest).toBeGreaterThan(0);
    // First monthly payments array should be populated
    expect(result.baseline.firstMonthlyPayments.length).toBeGreaterThan(0);
  });

  it("doubled payment scenario pays off debt faster with less total interest", () => {
    const result = simulateCreditCardCost({
      debt: 500_000,
      monthlyRatePercent: 3,
      minimumPaymentPercent: 3,
    });

    // Doubled payment clears debt in fewer months
    expect(result.doubledPayment.months).toBeLessThan(result.baseline.months);
    // Less total interest paid
    expect(result.doubledPayment.totalInterest).toBeLessThan(result.baseline.totalInterest);
    // Both still > 0 (not free)
    expect(result.doubledPayment.totalPaid).toBeGreaterThan(500_000);
  });

  it("fixed monthly payment scenario flags usesFixedPayment = true", () => {
    // Fixed payment of 50,000/month on 300,000 debt at 2% monthly
    const result = simulateCreditCardCost({
      debt: 300_000,
      monthlyRatePercent: 2,
      minimumPaymentPercent: 5,
      fixedMonthlyPayment: 50_000,
    });

    expect(result.usesFixedPayment).toBe(true);
    // With fixed payment > interest, debt clears in finite time
    expect(result.baseline.months).toBeGreaterThan(0);
    expect(result.baseline.months).toBeLessThan(600);
    // Total paid at least > debt (interest accrues even for a few months)
    expect(result.baseline.totalPaid).toBeGreaterThan(300_000);
  });

  it("zero interest rate: total paid equals debt (only principal)", () => {
    // Edge case: rate = 0% (deferred credit)
    const result = simulateCreditCardCost({
      debt: 200_000,
      monthlyRatePercent: 0,
      minimumPaymentPercent: 10,
    });

    expect(result.baseline.totalInterest).toBeCloseTo(0, 5);
    expect(result.baseline.totalPaid).toBeCloseTo(200_000, 0);
  });

  it("throws on non-positive debt", () => {
    expect(() =>
      simulateCreditCardCost({
        debt: 0,
        monthlyRatePercent: 2,
        minimumPaymentPercent: 3,
      })
    ).toThrow("debt");
  });

  it("throws on non-positive minimumPaymentPercent", () => {
    expect(() =>
      simulateCreditCardCost({
        debt: 100_000,
        monthlyRatePercent: 2,
        minimumPaymentPercent: 0,
      })
    ).toThrow("minimumPaymentPercent");
  });
});
