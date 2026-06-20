import { describe, expect, it } from "vitest";
import { calculateTermDeposit } from "@/application/use-cases/CalculateTermDeposit";
import { termDepositWorkedExample } from "@/application/use-cases/CalculateTermDeposit.methodology";

describe("calculateTermDeposit", () => {
  it("calculates gross interest, 4% withholding and net final amount", () => {
    const result = calculateTermDeposit({
      amount: 5_000_000,
      termDays: 180,
      annualRatePercent: 5,
      applyWithholding: true,
    });

    expect(result.grossInterest).toBeCloseTo(123_287.67, 2);
    expect(result.withholdingTax).toBeCloseTo(4_931.51, 2);
    expect(result.netInterest).toBeCloseTo(118_356.16, 2);
    expect(result.finalAmount).toBeCloseTo(5_118_356.16, 2);
    expect(result.netEffectiveAnnualRatePercent).toBeCloseTo(4.8, 6);
  });

  it("keeps gross and net interest equal when withholding does not apply", () => {
    const result = calculateTermDeposit({
      amount: 2_000_000,
      termDays: 365,
      annualRatePercent: 4.5,
      applyWithholding: false,
    });

    expect(result.grossInterest).toBe(90_000);
    expect(result.withholdingTax).toBe(0);
    expect(result.netInterest).toBe(90_000);
    expect(result.finalAmount).toBe(2_090_000);
    expect(result.netEffectiveAnnualRatePercent).toBe(4.5);
  });

  it("rejects invalid input values", () => {
    expect(() =>
      calculateTermDeposit({
        amount: 0,
        termDays: 30,
        annualRatePercent: 5,
        applyWithholding: true,
      })
    ).toThrow("amount");
    expect(() =>
      calculateTermDeposit({
        amount: 1_000_000,
        termDays: 0,
        annualRatePercent: 5,
        applyWithholding: true,
      })
    ).toThrow("termDays");
    expect(() =>
      calculateTermDeposit({
        amount: 1_000_000,
        termDays: 30,
        annualRatePercent: 0,
        applyWithholding: true,
      })
    ).toThrow("annualRatePercent");
  });

  describe("ejemplo de metodología — anti-drift", () => {
    it("el interés neto real coincide con el ejemplo publicado", () => {
      // Si la fórmula cambia y el ejemplo mostrado al usuario queda
      // desactualizado, este test falla.
      const result = calculateTermDeposit(termDepositWorkedExample.input);
      const expected = termDepositWorkedExample.expected;
      expect(result.grossInterest).toBeCloseTo(expected.grossInterest, 6);
      expect(result.netInterest).toBeCloseTo(expected.netInterest, 6);
      // La UI redondea a pesos enteros; comparamos lo que ve el usuario.
      expect(Math.round(result.grossInterest)).toBe(
        expected.grossInterestRounded
      );
      expect(Math.round(result.withholdingTax)).toBe(
        expected.withholdingTaxRounded
      );
      expect(Math.round(result.netInterest)).toBe(expected.netInterestRounded);
      expect(Math.round(result.finalAmount)).toBe(expected.finalAmountRounded);
    });
  });
});
