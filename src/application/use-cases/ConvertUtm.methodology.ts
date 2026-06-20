import type { WorkedExampleFixture } from "@/domain/methodology/workedExample";
import type { UtmConversionInput, UtmConversionOutput } from "./ConvertUtm";

/**
 * Ejemplo resuelto del conversor UTM, atado a `convertUtm`. Usa un valor UTM de
 * referencia explícito (ilustrativo); el conversor en producción siempre aplica
 * el valor vigente del mes. El test verifica que la multiplicación documentada
 * siga coincidiendo con la función real (anti-drift).
 */
export const utmWorkedExample: WorkedExampleFixture<
  UtmConversionInput,
  UtmConversionOutput
> = {
  input: { amount: 10, utmValue: 68_923, direction: "utm_to_clp" },
  expected: { utmAmount: 10, clpAmount: 689_230 },
  example: {
    scenario:
      "Una multa de tránsito de 10 UTM, con un valor UTM de referencia de $68.923.",
    steps: [
      {
        label: "Toma el valor de la UTM vigente del mes.",
        result: "$68.923",
      },
      {
        label: "Multiplícalo por la cantidad de UTM.",
        expression: "10 × $68.923",
        result: "$689.230",
      },
    ],
    conclusion:
      "10 UTM equivalen a $689.230 con ese valor. El conversor usa siempre el valor UTM vigente, que se reajusta el primer día hábil de cada mes.",
  },
};
