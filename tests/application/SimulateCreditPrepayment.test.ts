import { describe, expect, it } from "vitest";
import { simulateCreditPrepayment } from "@/application/use-cases/SimulateCreditPrepayment";
import { creditPrepaymentWorkedExample } from "@/application/use-cases/SimulateCreditPrepayment.methodology";

describe("simulateCreditPrepayment", () => {
  it("discounts the prepayment cost from the net benefit comparison", () => {
    const result = simulateCreditPrepayment({
      currentBalance: 10000000,
      monthlyPayment: 240000,
      monthlyRatePercent: 0.9,
      remainingMonths: 72,
      prepaymentAmount: 1000000,
      prepaymentCost: 150000,
      effect: "reducir-plazo",
      alternativeAnnualReturnPercent: 5,
    });

    expect(result.prepaymentCost).toBe(150000);
    expect(result.netSavingsAfterPrepaymentCost).toBeCloseTo(
      result.interestSavings - 150000,
      6
    );
  });

  it("fails when the reported installment does not amortize the credit", () => {
    expect(() =>
      simulateCreditPrepayment({
        currentBalance: 10000000,
        monthlyPayment: 50000,
        monthlyRatePercent: 0.9,
        remainingMonths: 72,
        prepaymentAmount: 1000000,
        prepaymentCost: 0,
        effect: "reducir-plazo",
        alternativeAnnualReturnPercent: 5,
      })
    ).toThrow(/no alcanza a amortizar/i);
  });

  it("rejects invalid alternative investment returns instead of producing NaN outputs", () => {
    expect(() =>
      simulateCreditPrepayment({
        currentBalance: 10000000,
        monthlyPayment: 240000,
        monthlyRatePercent: 0.9,
        remainingMonths: 72,
        prepaymentAmount: 1000000,
        prepaymentCost: 0,
        effect: "reducir-plazo",
        alternativeAnnualReturnPercent: Number.NaN,
      })
    ).toThrow(/alternativeAnnualReturnPercent/i);
  });

  it("rejects invalid monthly credit rates instead of producing unstable comparisons", () => {
    expect(() =>
      simulateCreditPrepayment({
        currentBalance: 10000000,
        monthlyPayment: 240000,
        monthlyRatePercent: Number.NaN,
        remainingMonths: 72,
        prepaymentAmount: 1000000,
        prepaymentCost: 0,
        effect: "reducir-plazo",
        alternativeAnnualReturnPercent: 5,
      })
    ).toThrow(/monthlyRatePercent/i);
  });

  describe("ejemplo de metodología — anti-drift", () => {
    it("el ahorro y los meses reales coinciden con el ejemplo publicado", () => {
      // Si la fórmula cambia y el ejemplo mostrado al usuario queda
      // desactualizado, este test falla.
      const result = simulateCreditPrepayment(
        creditPrepaymentWorkedExample.input
      );
      const expected = creditPrepaymentWorkedExample.expected;
      expect(result.interestSavings).toBeCloseTo(expected.interestSavings, 6);
      expect(result.netSavingsAfterPrepaymentCost).toBeCloseTo(
        expected.netSavingsAfterPrepaymentCost,
        6
      );
      expect(result.monthsSaved).toBe(expected.monthsSaved);
      // La UI redondea a pesos enteros; comparamos lo que ve el usuario.
      expect(Math.round(result.interestSavings)).toBe(
        expected.interestSavingsRounded
      );
    });
  });
});
