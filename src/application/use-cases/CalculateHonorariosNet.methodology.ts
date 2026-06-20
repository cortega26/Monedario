import type { WorkedExample } from "@/domain/methodology/workedExample";
import type { HonorariosNetInput } from "./CalculateHonorariosNet";

/**
 * Ejemplo resuelto de la calculadora de boleta de honorarios, atado a
 * `calculateHonorariosNet`. El test verifica que la retención y el líquido
 * documentados sigan coincidiendo con la función real (anti-drift).
 */
export const honorariosWorkedExample: {
  input: HonorariosNetInput;
  expected: { withholdingAmount: number; netFeeReceived: number };
  example: WorkedExample;
} = {
  input: { grossFee: 500_000, withholdingRatePercent: 15.25 },
  expected: { withholdingAmount: 76_250, netFeeReceived: 423_750 },
  example: {
    scenario:
      "Emites una boleta de $500.000 con la retención vigente del 15,25%.",
    steps: [
      {
        label: "Calcula la retención que adelanta el SII (15,25% del bruto).",
        expression: "$500.000 × 15,25%",
        result: "$76.250",
      },
      {
        label: "Resta la retención al monto bruto.",
        expression: "$500.000 − $76.250",
        result: "$423.750",
      },
    ],
    conclusion:
      "Recibes $423.750 líquidos hoy. Los $76.250 retenidos son un adelanto que se regulariza en tu Operación Renta.",
  },
};
