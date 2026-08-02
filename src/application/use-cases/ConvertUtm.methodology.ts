import type { WorkedExampleFixture } from "@/domain/methodology/workedExample";
import type { UtmConversionInput, UtmConversionOutput } from "./ConvertUtm";

/**
 * Ejemplo resuelto del conversor UTM, atado a `convertUtm`. Usa un valor UTM de
 * referencia explícito (ilustrativo); el conversor en producción siempre aplica
 * el valor vigente del mes. El test verifica que la multiplicación documentada
 * siga coincidiendo con la función real (anti-drift).
 */
export function buildUtmWorkedExample(
  utmValue: number,
  referenceDate: string
): WorkedExampleFixture<UtmConversionInput, UtmConversionOutput> {
  const formattedValue = Math.round(utmValue).toLocaleString("es-CL");
  const formattedResult = Math.round(utmValue * 10).toLocaleString("es-CL");
  return {
    input: { amount: 10, utmValue, direction: "utm_to_clp" },
    expected: { utmAmount: 10, clpAmount: utmValue * 10 },
    example: {
      scenario: `Una multa de tránsito de 10 UTM, con el valor SII de $${formattedValue} vigente desde ${referenceDate}.`,
      steps: [
        {
          label: "Toma el valor de la UTM vigente del mes.",
          result: `$${formattedValue}`,
        },
        {
          label: "Multiplícalo por la cantidad de UTM.",
          expression: `10 × $${formattedValue}`,
          result: `$${formattedResult}`,
        },
      ],
      conclusion: `10 UTM equivalen a $${formattedResult} con el valor oficial indicado. El ejemplo y el conversor usan el mismo snapshot económico.`,
    },
  };
}
