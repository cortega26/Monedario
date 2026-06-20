import type { WorkedExampleFixture } from "@/domain/methodology/workedExample";
import type { UfConversionInput, UfConversionOutput } from "./ConvertUf";

/**
 * Ejemplo resuelto del conversor UF, atado a `convertUf`. Usa un valor UF de
 * referencia explícito (ilustrativo); el conversor en producción aplica el
 * valor vigente del día. El test verifica que la multiplicación documentada
 * siga coincidiendo con la función real (anti-drift).
 */
export const ufWorkedExample: WorkedExampleFixture<
  UfConversionInput,
  UfConversionOutput
> = {
  input: { amount: 1_000, ufValue: 39_773.62, direction: "uf_to_clp" },
  expected: { ufAmount: 1_000, clpAmount: 39_773_620 },
  example: {
    scenario: "Un arriendo de 1.000 UF, con la UF de referencia en $39.773,62.",
    steps: [
      {
        label: "Toma el valor de la UF del día.",
        result: "$39.773,62",
      },
      {
        label: "Multiplícalo por la cantidad de UF.",
        expression: "1.000 × $39.773,62",
        result: "$39.773.620",
      },
    ],
    conclusion:
      "1.000 UF equivalen a $39.773.620 ese día. El conversor usa siempre el valor UF vigente, que el Banco Central publica a diario.",
  },
};
