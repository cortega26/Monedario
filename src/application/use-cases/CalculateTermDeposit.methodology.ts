import type { WorkedExample } from "@/domain/methodology/workedExample";
import type {
  TermDepositInput,
  TermDepositOutput,
} from "./CalculateTermDeposit";

/**
 * Ejemplo resuelto de la calculadora de depósito a plazo, atado a
 * `calculateTermDeposit`. El test verifica que el interés documentado siga
 * coincidiendo con la función real (anti-drift). Los valores mostrados se
 * redondean a pesos enteros.
 */
export const termDepositWorkedExample: {
  input: TermDepositInput;
  expected: Pick<TermDepositOutput, "grossInterest" | "finalAmount"> & {
    grossInterestRounded: number;
    finalAmountRounded: number;
  };
  example: WorkedExample;
} = {
  input: {
    amount: 5_000_000,
    termDays: 90,
    annualRatePercent: 6,
  },
  expected: {
    grossInterest: 73_972.60273972602,
    finalAmount: 5_073_972.602739726,
    grossInterestRounded: 73_973,
    finalAmountRounded: 5_073_973,
  },
  example: {
    scenario:
      "Un depósito a plazo de $5.000.000 a 90 días con una tasa de 6% anual. El banco paga el interés completo al vencimiento; la tributación se resuelve en la declaración anual de renta.",
    steps: [
      {
        label:
          "Calcula el interés pagado al vencimiento, proporcional a los días (base de 365 días).",
        expression: "$5.000.000 × 6% × (90 ÷ 365)",
        result: "$73.973",
      },
      {
        label:
          "Suma el interés al capital para obtener el monto al vencimiento.",
        expression: "$5.000.000 + $73.973",
        result: "$5.073.973",
      },
    ],
    conclusion:
      "Recibes $73.973 de interés y tu capital crece a $5.073.973 al vencimiento. Los intereses tributan en el Impuesto Global Complementario anual (con el tramo exento general de 13,5 UTA y la exención de 20 UTM cuando solo tienes rentas de sueldo o de pequeño contribuyente).",
  },
};
