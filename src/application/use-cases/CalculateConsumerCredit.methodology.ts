import type { WorkedExample } from "@/domain/methodology/workedExample";
import type {
  ConsumerCreditInput,
  ConsumerCreditOutput,
} from "./CalculateConsumerCredit";

/**
 * Ejemplo resuelto de la calculadora de crédito de consumo, atado a
 * `calculateConsumerCredit`. El test verifica que la cuota y el costo total
 * documentados sigan coincidiendo con la función real (anti-drift). Los valores
 * mostrados se redondean a pesos enteros.
 */
export const consumerCreditWorkedExample: {
  input: ConsumerCreditInput;
  expected: Pick<ConsumerCreditOutput, "monthlyPaymentTotal" | "totalPaid"> & {
    monthlyPaymentTotalRounded: number;
    totalPaidRounded: number;
  };
  example: WorkedExample;
} = {
  input: {
    principal: 5_000_000,
    termMonths: 24,
    rateValue: 2.0,
    rateType: "mensual",
  },
  expected: {
    monthlyPaymentTotal: 264_355.48626624927,
    totalPaid: 6_344_531.670389982,
    monthlyPaymentTotalRounded: 264_355,
    totalPaidRounded: 6_344_532,
  },
  example: {
    scenario:
      "Un crédito de consumo de $5.000.000 a 24 meses con una tasa de interés de 2% mensual, sin seguros ni gastos adicionales.",
    steps: [
      {
        label:
          "Aplica la fórmula de cuota fija (anualidad) con la tasa mensual de 2% sobre 24 meses.",
        result: "$264.355/mes",
      },
      {
        label:
          "Multiplica la cuota por el número de meses para el total pagado.",
        expression: "$264.355 × 24",
        result: "$6.344.532",
      },
      {
        label: "Resta el capital prestado para obtener el interés total.",
        expression: "$6.344.532 − $5.000.000",
        result: "$1.344.532",
      },
    ],
    conclusion:
      "Pagas 24 cuotas de $264.355: $6.344.532 en total, de los cuales $1.344.532 son intereses. El CAE refleja ese costo en una sola cifra comparable entre ofertas.",
  },
};
