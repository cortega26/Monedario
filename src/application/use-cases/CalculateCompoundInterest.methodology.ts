import type { WorkedExample } from "@/domain/methodology/workedExample";
import type {
  CompoundInterestInput,
  CompoundInterestOutput,
} from "./CalculateCompoundInterest";

/**
 * Ejemplo resuelto de la calculadora de interés compuesto, atado a
 * `calculateCompoundInterest`. El test verifica que el monto final documentado
 * siga coincidiendo con la función real (anti-drift). Los valores mostrados se
 * redondean a pesos enteros.
 */
export const compoundInterestWorkedExample: {
  input: CompoundInterestInput;
  expected: Pick<
    CompoundInterestOutput,
    "finalAmount" | "generatedInterest"
  > & {
    finalAmountRounded: number;
    generatedInterestRounded: number;
  };
  example: WorkedExample;
} = {
  input: {
    principal: 1_000_000,
    annualRatePercent: 6,
    years: 10,
    compoundsPerYear: 12,
  },
  expected: {
    finalAmount: 1_819_396.73403229,
    generatedInterest: 819_396.73403229,
    finalAmountRounded: 1_819_397,
    generatedInterestRounded: 819_397,
  },
  example: {
    scenario:
      "Inviertes $1.000.000 a una tasa de 6% anual con capitalización mensual, durante 10 años.",
    steps: [
      {
        label:
          "Convierte la tasa anual a tasa mensual (6% ÷ 12) y capitaliza durante 120 meses.",
        expression: "$1.000.000 × (1 + 0,06/12)^120",
        result: "$1.819.397",
      },
      {
        label: "Resta el capital inicial para aislar el interés generado.",
        expression: "$1.819.397 − $1.000.000",
        result: "$819.397",
      },
    ],
    conclusion:
      "Tras 10 años el capital llega a $1.819.397: $819.397 son interés. La capitalización mensual hace que el interés genere más interés mes a mes.",
  },
};
