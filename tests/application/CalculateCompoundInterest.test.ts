import { describe, expect, it } from "vitest";
import { calculateCompoundInterest } from "@/application/use-cases/CalculateCompoundInterest";
import { compoundInterestWorkedExample } from "@/application/use-cases/CalculateCompoundInterest.methodology";

describe("calculateCompoundInterest", () => {
  it("calculates monthly compounding and yearly evolution", () => {
    const result = calculateCompoundInterest({
      principal: 1_000_000,
      annualRatePercent: 10,
      years: 10,
      compoundsPerYear: 12,
    });

    expect(result.finalAmount).toBeCloseTo(2_707_041.49, 2);
    expect(result.generatedInterest).toBeCloseTo(1_707_041.49, 2);
    expect(result.totalReturnPercent).toBeCloseTo(170.704, 3);
    expect(result.yearlyEvolution).toHaveLength(10);
    expect(result.yearlyEvolution[0]).toMatchObject({ year: 1 });
    expect(result.yearlyEvolution[0].balance).toBeCloseTo(1_104_713.07, 2);
    expect(result.yearlyEvolution.at(-1)?.balance).toBeCloseTo(
      result.finalAmount,
      6
    );
  });

  it("shows monthly compounding slightly above annual compounding", () => {
    const monthly = calculateCompoundInterest({
      principal: 1_000_000,
      annualRatePercent: 8,
      years: 5,
      compoundsPerYear: 12,
    });
    const annual = calculateCompoundInterest({
      principal: 1_000_000,
      annualRatePercent: 8,
      years: 5,
      compoundsPerYear: 1,
    });

    expect(monthly.finalAmount).toBeGreaterThan(annual.finalAmount);
  });

  it("rejects invalid input values", () => {
    expect(() =>
      calculateCompoundInterest({
        principal: 0,
        annualRatePercent: 8,
        years: 5,
        compoundsPerYear: 12,
      })
    ).toThrow("principal");
    expect(() =>
      calculateCompoundInterest({
        principal: 1_000_000,
        annualRatePercent: 0,
        years: 5,
        compoundsPerYear: 12,
      })
    ).toThrow("annualRatePercent");
    expect(() =>
      calculateCompoundInterest({
        principal: 1_000_000,
        annualRatePercent: 8,
        years: 0,
        compoundsPerYear: 12,
      })
    ).toThrow("years");
  });

  describe("ejemplo de metodología — anti-drift", () => {
    it("el monto final real coincide con el ejemplo publicado", () => {
      // Si la fórmula cambia y el ejemplo mostrado al usuario queda
      // desactualizado, este test falla.
      const result = calculateCompoundInterest(
        compoundInterestWorkedExample.input
      );
      const expected = compoundInterestWorkedExample.expected;
      expect(result.finalAmount).toBeCloseTo(expected.finalAmount, 6);
      expect(result.generatedInterest).toBeCloseTo(
        expected.generatedInterest,
        6
      );
      // La UI redondea a pesos enteros; comparamos lo que ve el usuario.
      expect(Math.round(result.finalAmount)).toBe(expected.finalAmountRounded);
      expect(Math.round(result.generatedInterest)).toBe(
        expected.generatedInterestRounded
      );
    });
  });
});
