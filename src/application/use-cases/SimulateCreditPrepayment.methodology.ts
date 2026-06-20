import type { WorkedExample } from "@/domain/methodology/workedExample";
import type { CreditPrepaymentInput } from "./SimulateCreditPrepayment";

/**
 * Ejemplo resuelto del simulador de prepago de crédito, atado a
 * `simulateCreditPrepayment`. El test verifica que el ahorro y los meses
 * documentados sigan coincidiendo con la función real (anti-drift). Los montos
 * mostrados se redondean a pesos enteros.
 */
export const creditPrepaymentWorkedExample: {
  input: CreditPrepaymentInput;
  expected: {
    interestSavings: number;
    netSavingsAfterPrepaymentCost: number;
    monthsSaved: number;
    interestSavingsRounded: number;
  };
  example: WorkedExample;
} = {
  input: {
    currentBalance: 10_000_000,
    monthlyPayment: 300_000,
    monthlyRatePercent: 1.5,
    remainingMonths: 48,
    prepaymentAmount: 2_000_000,
    prepaymentCost: 0,
    effect: "reducir-plazo",
    alternativeAnnualReturnPercent: 5,
  },
  expected: {
    interestSavings: 1_673_784.7921601478,
    netSavingsAfterPrepaymentCost: 1_673_784.7921601478,
    monthsSaved: 12,
    interestSavingsRounded: 1_673_785,
  },
  example: {
    scenario:
      "Un crédito con saldo de $10.000.000, cuota de $300.000 y tasa de 1,5% mensual. Abonas $2.000.000 con el efecto de reducir el plazo.",
    steps: [
      {
        label:
          "Sin prepago, el crédito se paga en 47 meses con su interés total.",
        result: "$3.967.209 de interés",
      },
      {
        label:
          "Con el abono de $2.000.000 manteniendo la cuota, se paga en 35 meses.",
        result: "$2.293.424 de interés",
      },
      {
        label:
          "El ahorro de intereses es la diferencia entre ambos escenarios.",
        expression: "$3.967.209 − $2.293.424",
        result: "$1.673.785",
      },
    ],
    conclusion:
      "Abonar $2.000.000 ahorra $1.673.785 en intereses y acorta el crédito en 12 meses. Conviene compararlo con la rentabilidad de invertir ese monto; la calculadora hace esa comparación.",
  },
};
