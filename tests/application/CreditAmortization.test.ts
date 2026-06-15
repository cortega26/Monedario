import { describe, expect, it } from "vitest";
import { calculateConsumerCredit } from "@/application/use-cases/CalculateConsumerCredit";
import { simulateCreditCardCost } from "@/application/use-cases/SimulateCreditCardCost";
import { simulateCreditPrepayment } from "@/application/use-cases/SimulateCreditPrepayment";
import {
  calculateAnnuityPayment,
  simulateCreditRepayment,
} from "@/application/use-cases/shared/creditAmortization";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

describe("creditAmortization shared engine", () => {
  it("matches the consumer credit annuity payment for amortizing loans", () => {
    const consumerCredit = calculateConsumerCredit({
      principal: 5000000,
      termMonths: 36,
      rateValue: 3.49,
      rateType: "mensual",
      monthlyInsurance: 5500,
      operatingCosts: 120000,
    });

    const sharedPayment = calculateAnnuityPayment(5000000, 0.0349, 36);

    expect(round2(sharedPayment)).toBe(round2(consumerCredit.monthlyPaymentBase));
  });

  it("matches the prepayment baseline simulation for fixed-installment credit", () => {
    const prepayment = simulateCreditPrepayment({
      currentBalance: 5000000,
      monthlyPayment: 180000,
      monthlyRatePercent: 0.8,
      remainingMonths: 48,
      prepaymentAmount: 500000,
      prepaymentCost: 0,
      effect: "reducir-plazo",
      alternativeAnnualReturnPercent: 8,
    });

    const sharedSimulation = simulateCreditRepayment({
      principal: 5000000,
      monthlyRateDecimal: 0.008,
      paymentStrategy: () => 180000,
      maxMonths: 60,
    });

    expect(sharedSimulation.months).toBe(prepayment.withoutPrepayment.months);
    expect(round2(sharedSimulation.totalPaid)).toBe(
      round2(prepayment.withoutPrepayment.totalPaid)
    );
    expect(round2(sharedSimulation.totalInterest)).toBe(
      round2(prepayment.withoutPrepayment.totalInterest)
    );
  });

  it("calculateAnnuityPayment returns principal/termMonths when rate is 0", () => {
    const result = calculateAnnuityPayment(120000, 0, 12);
    expect(result).toBe(10000);
  });

  it("calculateAnnuityPayment with termMonths=0 returns Infinity due to division by zero", () => {
    // termMonths=0 is an invalid input; the function divides by (1+rate)^0 - 1 = 0.
    // This test documents the current behavior for this edge case.
    const result = calculateAnnuityPayment(120000, 0.1, 0);
    expect(result).toBe(Infinity);
  });

  it("simulateCreditRepayment with maxMonths=0 returns no payments", () => {
    const result = simulateCreditRepayment({
      principal: 5000000,
      monthlyRateDecimal: 0.0349,
      paymentStrategy: () => 180000,
      maxMonths: 0,
    });
    expect(result.months).toBe(0);
    expect(result.totalPaid).toBe(0);
    expect(result.totalInterest).toBe(-5000000);
    expect(result.firstMonthlyPayments).toEqual([]);
  });

  it("simulateCreditRepayment with payment that does not cover interest grows balance", () => {
    const result = simulateCreditRepayment({
      principal: 100000,
      monthlyRateDecimal: 0.1, // 10% monthly = 10000 interest first month
      paymentStrategy: () => 5000, // Payment < interest
      maxMonths: 12,
    });
    // Payment never covers interest, so balance keeps growing
    expect(result.months).toBe(12); // runs to maxMonths
    expect(result.totalPaid).toBe(12 * 5000); // 60000
  });

  it("simulateCreditRepayment with payment exactly matching annuity closes at term", () => {
    const principal = 5000000;
    const monthlyRate = 0.015;
    const termMonths = 24;
    const annuity = calculateAnnuityPayment(principal, monthlyRate, termMonths);

    const result = simulateCreditRepayment({
      principal,
      monthlyRateDecimal: monthlyRate,
      paymentStrategy: () => annuity,
      maxMonths: termMonths + 1,
      payoffThreshold: 0.01,
    });

    // Should complete in exactly termMonths months
    expect(result.months).toBe(termMonths);
    expect(result.totalPaid).toBeGreaterThan(principal);
  });

  it("matches the credit card repayment simulation when using the same floor rule", () => {
    const creditCard = simulateCreditCardCost({
      debt: 650000,
      monthlyRatePercent: 4.2,
      minimumPaymentPercent: 8,
      maxMonths: 240,
    });

    const sharedSimulation = simulateCreditRepayment({
      principal: 650000,
      monthlyRateDecimal: 0.042,
      paymentStrategy: ({ balance }) => balance * 0.08,
      paymentFloor: ({ interest }) => interest + 100,
      maxMonths: 240,
      trackedMonths: 6,
    });

    expect(sharedSimulation.months).toBe(creditCard.baseline.months);
    expect(round2(sharedSimulation.totalPaid)).toBe(
      round2(creditCard.baseline.totalPaid)
    );
    expect(sharedSimulation.firstMonthlyPayments).toEqual(
      creditCard.baseline.firstMonthlyPayments
    );
  });
});
