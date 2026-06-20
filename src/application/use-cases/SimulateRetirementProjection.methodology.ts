import type { WorkedExample } from "@/domain/methodology/workedExample";
import type { RetirementProjectionInput } from "./SimulateRetirementProjection";

/**
 * Ejemplo resuelto del simulador de jubilación, atado a
 * `simulateRetirementProjection`. Usa una UF de referencia y una fecha base
 * explícitas (ilustrativas) para que el aporte del empleador según cronograma
 * legal sea determinista; la calculadora aplica los valores y la fecha
 * vigentes. El test verifica que la pensión documentada siga coincidiendo con
 * la función real (anti-drift). El monto mostrado se redondea a pesos enteros.
 */
export const retirementWorkedExample: {
  input: RetirementProjectionInput;
  expected: {
    pensionMonths: number;
    projectedBalance: number;
    estimatedMonthlyPension: number;
    estimatedMonthlyPensionRounded: number;
  };
  example: WorkedExample;
} = {
  input: {
    currentAge: 35,
    retirementAge: 65,
    grossSalary: 1_500_000,
    currentBalance: 10_000_000,
    annualReturnPercent: 5,
    lifeExpectancyAge: 85,
    contributionDensityPercent: 100,
    currentDate: "2026-06-01",
    economicParameters: {
      uf: 40_000,
      previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 87.8 },
    },
  },
  expected: {
    pensionMonths: 240,
    projectedBalance: 204_941_740.00804102,
    estimatedMonthlyPension: 853_923.916700171,
    estimatedMonthlyPensionRounded: 853_924,
  },
  example: {
    scenario:
      "Una persona de 35 años con $1.500.000 de sueldo y $10.000.000 ya ahorrados, que se jubila a los 65 y proyecta hasta los 85, con una rentabilidad anual de 5%.",
    steps: [
      {
        label:
          "Cada mes cotiza el 10% del imponible más el aporte del empleador, y el saldo crece con la rentabilidad durante 30 años (360 meses).",
        result: "Saldo proyectado: $204.941.740",
      },
      {
        label:
          "Reparte el saldo entre los meses de pensión (de 65 a 85 años = 240 meses).",
        expression: "$204.941.740 ÷ 240",
        result: "$853.924/mes",
      },
    ],
    conclusion:
      "La pensión estimada es $853.924 al mes (≈ 57% del sueldo). Es una proyección con supuestos de rentabilidad y densidad de cotización; no incluye PGU ni comisiones, y el resultado real puede variar.",
  },
};
