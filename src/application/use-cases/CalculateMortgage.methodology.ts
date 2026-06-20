import type { WorkedExample } from "@/domain/methodology/workedExample";
import type { MortgageInput } from "./CalculateMortgage";

/**
 * Ejemplo resuelto de la calculadora de dividendo hipotecario, atado a
 * `calculateMortgage`. Usa un valor UF de referencia explícito (ilustrativo);
 * la calculadora en producción aplica la UF vigente del mes. El test verifica
 * que el dividendo documentado siga coincidiendo con la función real
 * (anti-drift).
 */
export const mortgageWorkedExample: {
  input: MortgageInput;
  expected: {
    loanAmountUF: number;
    /** Dividendo base mensual en pesos, redondeado como se muestra. */
    basePaymentPesosRounded: number;
  };
  example: WorkedExample;
} = {
  input: {
    propertyValue: 3000,
    currency: "uf",
    downPaymentPercent: 20,
    annualRatePercent: 4.5,
    termYears: 25,
    ufValuePesos: 40_000,
  },
  expected: {
    loanAmountUF: 2400,
    basePaymentPesosRounded: 528_695,
  },
  example: {
    scenario:
      "Una propiedad de 3.000 UF con 20% de pie, financiada a 25 años con una tasa anual de 4,5% (UF de referencia: $40.000).",
    steps: [
      {
        label: "Calcula el pie (20%) y el monto del crédito.",
        expression: "3.000 UF − 600 UF de pie",
        result: "2.400 UF",
      },
      {
        label: "Convierte la tasa anual de 4,5% a tasa mensual equivalente.",
        expression: "(1,045)^(1/12) − 1",
        result: "0,36748%",
      },
      {
        label: "Aplica la fórmula de cuota fija (anualidad) sobre 300 meses.",
        result: "13,2174 UF/mes",
      },
      {
        label: "Expresa el dividendo en pesos con la UF de referencia.",
        expression: "13,2174 UF × $40.000",
        result: "$528.695",
      },
    ],
    conclusion:
      "El dividendo base es de 13,2174 UF (≈ $528.695 al mes). El monto en pesos varía cada mes con el valor de la UF; no incluye seguros de desgravamen ni incendio.",
  },
};
