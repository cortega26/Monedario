import type { WorkedExample } from "@/domain/methodology/workedExample";
import type { TaxInput } from "./TaxEngine";

/**
 * Ejemplo resuelto de la calculadora de impuesto de segunda categoría, atado a
 * `calculateSecondCategoryTax`. Usa un valor UTM de referencia explícito
 * (ilustrativo); la calculadora en producción aplica la UTM vigente del mes.
 * El test verifica que el impuesto documentado siga coincidiendo con la función
 * real (anti-drift).
 */
export const secondCategoryTaxWorkedExample: {
  input: TaxInput;
  /** El impuesto se muestra al usuario redondeado a pesos enteros. */
  expectedTaxAmountRounded: number;
  expectedMarginalRate: number;
  example: WorkedExample;
} = {
  input: { taxableIncome: 1_500_000, utm: 68_923 },
  expectedTaxAmountRounded: 22_782,
  expectedMarginalRate: 0.04,
  example: {
    scenario:
      "Una base imponible mensual de $1.500.000, con una UTM de referencia de $68.923.",
    steps: [
      {
        label:
          "Ubica el tramo: $1.500.000 cae en el segundo tramo (sobre 13,5 UTM), con tasa 4% y rebaja de 0,54 UTM.",
        expression: "0,54 × $68.923",
        result: "$37.218",
      },
      {
        label: "Aplica la tasa del tramo a la base imponible.",
        expression: "$1.500.000 × 4%",
        result: "$60.000",
      },
      {
        label: "Resta la rebaja del tramo.",
        expression: "$60.000 − $37.218",
        result: "$22.782",
      },
    ],
    conclusion:
      "El impuesto único es $22.782. La rebaja por tramo asegura que la tasa solo afecte la parte del ingreso que supera el límite exento.",
  },
};
