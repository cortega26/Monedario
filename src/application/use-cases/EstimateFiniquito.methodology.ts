import type { WorkedExample } from "@/domain/methodology/workedExample";
import type { EstimateFiniquitoInput } from "./EstimateFiniquito";

/**
 * Ejemplo resuelto de la calculadora de finiquito, atado a `estimateFiniquito`.
 * El test verifica que la indemnización documentada siga coincidiendo con la
 * función real (anti-drift).
 */
export const finiquitoWorkedExample: {
  input: EstimateFiniquitoInput;
  expected: {
    yearsOfServiceIndemnity: number;
    substituteNoticeIndemnity: number;
    totalEstimate: number;
  };
  example: WorkedExample;
} = {
  input: {
    monthlySalary: 800_000,
    yearsWorked: 5,
    terminationCause: "necesidad",
    noticeGiven: false,
  },
  expected: {
    yearsOfServiceIndemnity: 4_000_000,
    substituteNoticeIndemnity: 800_000,
    totalEstimate: 4_800_000,
  },
  example: {
    scenario:
      "Un trabajador con sueldo de $800.000 y 5 años de antigüedad es desvinculado por necesidades de la empresa, sin aviso previo de 30 días.",
    steps: [
      {
        label:
          "Indemnización por años de servicio: un mes de sueldo por año (tope legal de 11 años).",
        expression: "5 × $800.000",
        result: "$4.000.000",
      },
      {
        label:
          "Indemnización sustitutiva del aviso previo: un mes de sueldo, porque no se avisó con 30 días.",
        result: "$800.000",
      },
      {
        label: "Suma ambos conceptos.",
        expression: "$4.000.000 + $800.000",
        result: "$4.800.000",
      },
    ],
    conclusion:
      "La estimación del finiquito es $4.800.000. Es una referencia: el monto final depende de la causal exacta, días pendientes y feriado proporcional, y debe revisarlo un profesional.",
  },
};
