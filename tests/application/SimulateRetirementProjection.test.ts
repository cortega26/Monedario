import { describe, expect, it } from "vitest";
import { simulateRetirementProjection } from "@/application/use-cases/SimulateRetirementProjection";
import { retirementWorkedExample } from "@/application/use-cases/SimulateRetirementProjection.methodology";

const UF = 39300;

function buildInput(overrides: Partial<Parameters<typeof simulateRetirementProjection>[0]> = {}) {
  return {
    currentAge: 35,
    retirementAge: 65,
    grossSalary: 5000000,
    currentBalance: 15000000,
    annualReturnPercent: 5,
    lifeExpectancyAge: 90,
    contributionDensityPercent: 85,
    currentDate: "2026-03-01",
    economicParameters: {
      uf: UF,
      previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 90 },
    },
    ...overrides,
  };
}

describe("simulateRetirementProjection", () => {
  it("fails explicitly when life expectancy does not exceed retirement age", () => {
    expect(() =>
      simulateRetirementProjection(
        buildInput({ retirementAge: 65, lifeExpectancyAge: 65 })
      )
    ).toThrow(
      "lifeExpectancyAge must be greater than retirementAge to estimate pension months."
    );
  });

  it("caps the salary used for contributions at the official imponible limit", () => {
    const result = simulateRetirementProjection(buildInput());

    expect(result.salaryCapClp).toBe(3537000);
    expect(result.taxableSalaryUsedClp).toBe(3537000);
  });

  it("reduces contribution months when lagunas are introduced and returns comparison scenarios", () => {
    const result = simulateRetirementProjection(buildInput());

    expect(result.totalMonths).toBe(360);
    expect(result.monthsWithContributions).toBe(306);
    expect(result.monthsWithoutContributions).toBe(54);
    expect(result.scenarios.map(item => item.label)).toEqual([
      "Base",
      "Conservador",
      "Agresivo",
    ]);
    expect(result.selectedScenario.totalEmployerContributionsToIndividualAccount).toBeGreaterThan(
      0
    );
  });
});

describe("simulateRetirementProjection — ejemplo de metodología (anti-drift)", () => {
  it("la pensión estimada real coincide con el ejemplo publicado", () => {
    // El ejemplo fija currentDate para que el aporte del empleador según
    // cronograma legal sea determinista. Si la fórmula o el cronograma cambian
    // y el ejemplo mostrado al usuario queda desactualizado, este test falla.
    const result = simulateRetirementProjection(retirementWorkedExample.input);
    const expected = retirementWorkedExample.expected;
    expect(result.pensionMonths).toBe(expected.pensionMonths);
    expect(result.selectedScenario.projectedBalance).toBeCloseTo(
      expected.projectedBalance,
      4
    );
    expect(result.selectedScenario.estimatedMonthlyPension).toBeCloseTo(
      expected.estimatedMonthlyPension,
      4
    );
    // La UI redondea a pesos enteros; comparamos lo que ve el usuario.
    expect(Math.round(result.selectedScenario.estimatedMonthlyPension)).toBe(
      expected.estimatedMonthlyPensionRounded
    );
  });
});
