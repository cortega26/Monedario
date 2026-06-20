import type { WorkedExample } from "@/domain/methodology/workedExample";
import type { OperacionRentaInput } from "./SimulateOperacionRenta";

/**
 * Ejemplo resuelto del simulador de Operación Renta, atado a
 * `simulateOperacionRenta`. Usa valores UTM/UF de referencia explícitos
 * (ilustrativos); el simulador en producción aplica los valores vigentes del
 * año tributario. El test verifica que el resultado documentado siga
 * coincidiendo con la función real (anti-drift).
 */
export const operacionRentaWorkedExample: {
  input: OperacionRentaInput;
  expected: {
    rentaNetaHonorarios: number;
    baseImponibleIGC: number;
    igcCalculado: number;
    montoDevolución: number;
  };
  example: WorkedExample;
} = {
  input: {
    sueldosBrutos: 0,
    honorariosBrutos: 10_000_000,
    arriendos: 0,
    impuestoUnicoRetenido: 0,
    ppmHonorarios: 1_450_000,
    apvRegimenB: 0,
    interesesHipotecarios: 0,
    economicParameters: { utm: 68_923, uf: 40_000 },
  },
  expected: {
    rentaNetaHonorarios: 7_000_000,
    baseImponibleIGC: 7_000_000,
    igcCalculado: 0,
    montoDevolución: 1_450_000,
  },
  example: {
    scenario:
      "Un trabajador a honorarios que emitió $10.000.000 en boletas durante el año, con $1.450.000 retenidos como PPM (UTM de referencia: $68.923).",
    steps: [
      {
        label: "Aplica el 30% de gastos presuntos (con tope de 15 UTA).",
        expression: "$10.000.000 × 30%",
        result: "$3.000.000",
      },
      {
        label: "Resta los gastos presuntos para obtener la renta neta.",
        expression: "$10.000.000 − $3.000.000",
        result: "$7.000.000",
      },
      {
        label:
          "Calcula el impuesto: la base ($7.000.000) queda bajo el tramo exento anual (13,5 UTA), así que el IGC es cero.",
        result: "$0",
      },
      {
        label:
          "Compara el impuesto con lo retenido: como el IGC es $0 y se retuvo $1.450.000, todo se devuelve.",
        expression: "$0 − $1.450.000",
        result: "−$1.450.000",
      },
    ],
    conclusion:
      "El SII devuelve $1.450.000: la renta neta no alcanza el tramo exento, por lo que el PPM retenido durante el año vuelve íntegro.",
  },
};
