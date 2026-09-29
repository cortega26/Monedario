import { describe, expect, it } from "vitest";
import { calculateTermDeposit } from "@/application/use-cases/CalculateTermDeposit";
import { termDepositWorkedExample } from "@/application/use-cases/CalculateTermDeposit.methodology";

describe("calculateTermDeposit", () => {
  it("calcula interés y monto final sin retención del banco", () => {
    // Persona natural residente: el banco no retiene; los intereses tributan
    // en el IGC anual (SII, FAQ 001.140.2738).
    const result = calculateTermDeposit({
      amount: 5_000_000,
      termDays: 180,
      annualRatePercent: 5,
    });

    expect(result.grossInterest).toBeCloseTo(123_287.67, 2);
    expect(result.finalAmount).toBeCloseTo(5_123_287.67, 2);
    expect(result.effectiveAnnualRatePercent).toBeCloseTo(5, 6);
  });

  it("reproduce la tasa anual exacta en un plazo de 365 días", () => {
    const result = calculateTermDeposit({
      amount: 2_000_000,
      termDays: 365,
      annualRatePercent: 4.5,
    });

    expect(result.grossInterest).toBe(90_000);
    expect(result.finalAmount).toBe(2_090_000);
    expect(result.effectiveAnnualRatePercent).toBe(4.5);
  });

  it("rejects invalid input values", () => {
    expect(() =>
      calculateTermDeposit({
        amount: 0,
        termDays: 30,
        annualRatePercent: 5,
      })
    ).toThrow("amount");
    expect(() =>
      calculateTermDeposit({
        amount: 1_000_000,
        termDays: 0,
        annualRatePercent: 5,
      })
    ).toThrow("termDays");
    expect(() =>
      calculateTermDeposit({
        amount: 1_000_000,
        termDays: 30,
        annualRatePercent: 0,
      })
    ).toThrow("annualRatePercent");
  });

  describe("ejemplo de metodología — anti-drift", () => {
    it("el interés real coincide con el ejemplo publicado", () => {
      // Si la fórmula cambia y el ejemplo mostrado al usuario queda
      // desactualizado, este test falla.
      const result = calculateTermDeposit(termDepositWorkedExample.input);
      const expected = termDepositWorkedExample.expected;
      expect(result.grossInterest).toBeCloseTo(expected.grossInterest, 6);
      expect(result.finalAmount).toBeCloseTo(expected.finalAmount, 6);
      // La UI redondea a pesos enteros; comparamos lo que ve el usuario.
      expect(Math.round(result.grossInterest)).toBe(
        expected.grossInterestRounded
      );
      expect(Math.round(result.finalAmount)).toBe(expected.finalAmountRounded);
    });
  });
});
