import type { WorkedExample } from "@/domain/methodology/workedExample";
import type {
  TermDepositInput,
  TermDepositOutput,
} from "./CalculateTermDeposit";

/**
 * Ejemplo resuelto de la calculadora de depósito a plazo, atado a
 * `calculateTermDeposit`. El test verifica que el interés neto documentado siga
 * coincidiendo con la función real (anti-drift). Los valores mostrados se
 * redondean a pesos enteros.
 */
export const termDepositWorkedExample: {
  input: TermDepositInput;
  expected: Pick<
    TermDepositOutput,
    "grossInterest" | "withholdingTax" | "netInterest" | "finalAmount"
  > & {
    grossInterestRounded: number;
    withholdingTaxRounded: number;
    netInterestRounded: number;
    finalAmountRounded: number;
  };
  example: WorkedExample;
} = {
  input: {
    amount: 5_000_000,
    termDays: 90,
    annualRatePercent: 6,
    applyWithholding: true,
  },
  expected: {
    grossInterest: 73_972.60273972602,
    withholdingTax: 2_958.9041095890407,
    netInterest: 71_013.69863013698,
    finalAmount: 5_071_013.698630137,
    grossInterestRounded: 73_973,
    withholdingTaxRounded: 2_959,
    netInterestRounded: 71_014,
    finalAmountRounded: 5_071_014,
  },
  example: {
    scenario:
      "Un depósito a plazo de $5.000.000 a 90 días con una tasa de 6% anual, con la retención del 4% sobre los intereses.",
    steps: [
      {
        label:
          "Calcula el interés bruto proporcional a los días (base de 365 días).",
        expression: "$5.000.000 × 6% × (90 ÷ 365)",
        result: "$73.973",
      },
      {
        label: "Aplica la retención del 4% sobre el interés.",
        expression: "$73.973 × 4%",
        result: "$2.959",
      },
      {
        label: "Resta la retención para obtener el interés neto.",
        expression: "$73.973 − $2.959",
        result: "$71.014",
      },
    ],
    conclusion:
      "Recibes $71.014 de interés neto: tu capital crece a $5.071.014 al vencimiento. La tasa es del mercado y cambia entre instituciones y fechas.",
  },
};
