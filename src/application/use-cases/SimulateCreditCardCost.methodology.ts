import type { WorkedExample } from "@/domain/methodology/workedExample";
import type { CreditCardCostInput } from "./SimulateCreditCardCost";

/**
 * Ejemplo resuelto de la calculadora de costo de tarjeta de crédito, atado a
 * `simulateCreditCardCost`. El test verifica que los meses y el interés
 * documentados sigan coincidiendo con la función real (anti-drift). Los montos
 * mostrados se redondean a pesos enteros.
 */
export const creditCardCostWorkedExample: {
  input: CreditCardCostInput;
  expected: {
    baselineMonths: number;
    baselineTotalInterest: number;
    baselineTotalInterestRounded: number;
    doubledMonths: number;
  };
  example: WorkedExample;
} = {
  input: {
    debt: 1_000_000,
    monthlyRatePercent: 2.5,
    minimumPaymentPercent: 5,
  },
  expected: {
    baselineMonths: 259,
    baselineTotalInterest: 998_050.0000000033,
    baselineTotalInterestRounded: 998_050,
    doubledMonths: 99,
  },
  example: {
    scenario:
      "Una deuda de tarjeta de $1.000.000 con una tasa de 2,5% mensual, pagando solo el mínimo del 5% del saldo cada mes.",
    steps: [
      {
        label: "El primer pago mínimo es el 5% del saldo.",
        expression: "$1.000.000 × 5%",
        result: "$50.000",
      },
      {
        label:
          "Como el mínimo baja con el saldo, la deuda tarda en extinguirse.",
        result: "259 meses (≈ 21 años)",
      },
      {
        label: "El interés acumulado en todo ese tiempo casi iguala la deuda.",
        result: "$998.050",
      },
    ],
    conclusion:
      "Pagando solo el mínimo, tardas 259 meses y pagas $998.050 en intereses, casi otra vez la deuda. Duplicando el pago el plazo baja a 99 meses. Pagar más que el mínimo es lo que reduce el costo.",
  },
};
