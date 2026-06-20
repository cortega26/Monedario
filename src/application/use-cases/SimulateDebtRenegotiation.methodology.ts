import type { WorkedExample } from "@/domain/methodology/workedExample";
import type {
  DebtRenegotiationInput,
  DebtRenegotiationOutput,
} from "./SimulateDebtRenegotiation";

/**
 * Ejemplo resuelto del simulador de renegociación de deudas, atado a
 * `simulateDebtRenegotiation`. Usa una UF de referencia explícita (ilustrativa);
 * la calculadora aplica la UF vigente. El test verifica que la cuota consolidada
 * documentada siga coincidiendo con la función real (anti-drift). Los montos
 * mostrados se redondean a pesos enteros.
 */
export const debtRenegotiationWorkedExample: {
  input: DebtRenegotiationInput;
  expected: Pick<
    DebtRenegotiationOutput,
    "totalDebtClp" | "monthlyPayment" | "totalInterest"
  > & {
    monthlyPaymentRounded: number;
    totalInterestRounded: number;
  };
  example: WorkedExample;
} = {
  input: {
    debts: [
      { amount: 3_000_000, overdueDays: 120 },
      { amount: 2_000_000, overdueDays: 100 },
    ],
    monthlyIncome: 800_000,
    termMonths: 36,
    monthlyRatePercent: 1.0,
    ufValue: 40_000,
    hasFirstCategoryActivityLast24Months: false,
    hasNotifiedExecutiveProceeding: false,
    hasRequiredDocuments: true,
  },
  expected: {
    totalDebtClp: 5_000_000,
    monthlyPayment: 166_071.5490642558,
    totalInterest: 978_575.7663132092,
    monthlyPaymentRounded: 166_072,
    totalInterestRounded: 978_576,
  },
  example: {
    scenario:
      "Dos deudas morosas que suman $5.000.000, consolidadas en un plan a 36 meses con una tasa de 1% mensual.",
    steps: [
      {
        label: "Suma las deudas a consolidar.",
        expression: "$3.000.000 + $2.000.000",
        result: "$5.000.000",
      },
      {
        label:
          "Aplica la fórmula de cuota fija (anualidad) con la tasa de 1% mensual sobre 36 meses.",
        result: "$166.072/mes",
      },
      {
        label: "El interés total es lo pagado por sobre la deuda original.",
        expression: "($166.072 × 36) − $5.000.000",
        result: "$978.576",
      },
    ],
    conclusion:
      "La cuota consolidada sería $166.072 al mes ($978.576 de interés en total). La elegibilidad para la renegociación concursal exige requisitos legales que la calculadora verifica por separado.",
  },
};
