import type { WorkedExampleFixture } from "@/domain/methodology/workedExample";
import type { CalculateIvaInput, CalculateIvaOutput } from "./CalculateIva";

/**
 * Ejemplo resuelto de la calculadora de IVA, atado a `calculateIva`.
 * El test en `CalculateIva.methodology.test.ts` verifica que la salida real
 * siga coincidiendo con `expected` (anti-drift).
 */
export const ivaWorkedExample: WorkedExampleFixture<
  CalculateIvaInput,
  CalculateIvaOutput
> = {
  input: { amount: 1_000_000, direction: "neto-a-bruto" },
  expected: {
    neto: 1_000_000,
    iva: 190_000,
    bruto: 1_190_000,
    ivaRatePercent: 19,
  },
  example: {
    scenario:
      "Tienes un monto neto de $1.000.000 (sin IVA) y quieres saber el total a cobrar con el IVA del 19% incluido.",
    steps: [
      {
        label: "Calcula el IVA: 19% del monto neto.",
        expression: "$1.000.000 × 0,19",
        result: "$190.000",
      },
      {
        label: "Suma el IVA al neto para obtener el bruto.",
        expression: "$1.000.000 + $190.000",
        result: "$1.190.000",
      },
    ],
    conclusion:
      "El bruto con IVA es $1.190.000, de los cuales $190.000 corresponden al IVA del 19%.",
  },
};
