import type { WorkedExample } from "@/domain/methodology/workedExample";
import type {
  IpcRentAdjustmentInput,
  IpcRentAdjustmentOutput,
} from "./CalculateRentAdjustment";

/**
 * Ejemplo resuelto de la calculadora de reajuste de arriendo (modo IPC), atado a
 * `calculateIpcRentAdjustment`. Usa una variación de IPC de referencia
 * (ilustrativa); la calculadora aplica el IPC que ingresa la persona usuaria.
 * El test verifica que el reajuste documentado siga coincidiendo con la función
 * real (anti-drift). Los valores mostrados se redondean a pesos enteros.
 */
export const rentAdjustmentWorkedExample: {
  input: IpcRentAdjustmentInput;
  expected: Pick<
    IpcRentAdjustmentOutput,
    "adjustedRentClp" | "differenceClp"
  > & {
    adjustedRentClpRounded: number;
    differenceClpRounded: number;
  };
  example: WorkedExample;
} = {
  input: { currentRentClp: 400_000, ipcVariationPercent: 3.5 },
  expected: {
    adjustedRentClp: 413_999.99999999994,
    differenceClp: 13_999.999999999942,
    adjustedRentClpRounded: 414_000,
    differenceClpRounded: 14_000,
  },
  example: {
    scenario:
      "Un arriendo de $400.000 que se reajusta por la variación del IPC del período, con un IPC de referencia de 3,5%.",
    steps: [
      {
        label: "Convierte la variación del IPC en un factor de reajuste.",
        expression: "1 + 3,5% ",
        result: "1,035",
      },
      {
        label: "Aplica el factor al arriendo actual.",
        expression: "$400.000 × 1,035",
        result: "$414.000",
      },
      {
        label: "La diferencia es el alza mensual.",
        expression: "$414.000 − $400.000",
        result: "$14.000",
      },
    ],
    conclusion:
      "El arriendo reajustado es $414.000, $14.000 más al mes. El reajuste solo aplica si el contrato lo pacta y con la periodicidad acordada.",
  },
};
