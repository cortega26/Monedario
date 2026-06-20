import type { WorkedExample } from "@/domain/methodology/workedExample";
import type { UnemploymentCoverageInput } from "./EstimateUnemploymentCoverage";

/**
 * Ejemplo resuelto de la calculadora de seguro de cesantía, atado a
 * `estimateUnemploymentCoverage`. Usa una UF de referencia explícita
 * (ilustrativa); la calculadora aplica la UF vigente. El test verifica que la
 * cotización y el saldo documentados sigan coincidiendo con la función real
 * (anti-drift). El ejemplo se centra en la Cuenta Individual de Cesantía (CIC).
 */
export const unemploymentCoverageWorkedExample: {
  input: UnemploymentCoverageInput;
  expected: {
    monthlyCicContribution: number;
    estimatedCicBalance: number;
    totalCoverage: number;
    monthsCovered: number;
  };
  example: WorkedExample;
} = {
  input: {
    grossSalary: 800_000,
    contractType: "indefinido",
    terminationCause: "necesidad",
    monthsContributed: 24,
    lastThreeContinuousContributions: true,
    economicParameters: {
      uf: 40_000,
      afcTopes: { monthlyTaxableCapUf: 135.2 },
    },
  },
  expected: {
    monthlyCicContribution: 17_600,
    estimatedCicBalance: 422_400,
    totalCoverage: 422_400,
    monthsCovered: 1,
  },
  example: {
    scenario:
      "Un trabajador con contrato indefinido y sueldo de $800.000, con 24 cotizaciones, despedido por necesidades de la empresa.",
    steps: [
      {
        label:
          "Cada mes va a tu Cuenta Individual de Cesantía el 2,2% del sueldo (contrato indefinido).",
        expression: "$800.000 × 2,2%",
        result: "$17.600",
      },
      {
        label: "Estima el saldo acumulado tras 24 cotizaciones.",
        expression: "$17.600 × 24",
        result: "$422.400",
      },
      {
        label:
          "El primer giro busca el 70% del sueldo, pero está limitado al saldo disponible.",
        expression: "mín($560.000, $422.400)",
        result: "$422.400",
      },
    ],
    conclusion:
      "Con ese saldo el primer giro es de $422.400. La cobertura depende de cuánto hayas acumulado en tu cuenta individual; el Fondo Solidario tiene requisitos aparte que la calculadora solo verifica como filtro.",
  },
};
