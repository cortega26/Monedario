import {
  resolveEconomicIndicatorDate,
  type EconomicParameters,
  type EconomicPrevEntry,
} from "@/domain/economic/EconomicParameters";
import type { EconomicTelemetryFlag } from "@/infrastructure/economic/EconomicParameterProvider";
import { getEconomicParameters } from "@/application/use-cases/GetEconomicParameters";
import { formatCLP } from "./formatCLP";

export { formatCLP };

export interface Indicadores {
  uf: EconomicParameters["uf"];
  utm: EconomicParameters["utm"];
  dolar?: EconomicParameters["dolar"];
  fechas: {
    uf: string;
    utm: string;
    dolar?: string;
  };
  fecha: EconomicParameters["lastUpdated"];
  source: EconomicParameters["source"];
  telemetryFlag: EconomicTelemetryFlag;
  prev?: {
    uf?: EconomicPrevEntry;
    utm?: EconomicPrevEntry;
    dolar?: EconomicPrevEntry;
  };
}

export async function getIndicadores(): Promise<Indicadores> {
  return getIndicadoresWith(getEconomicParameters);
}

/**
 * Factory con loader inyectable (tests): misma lógica que getIndicadores sin
 * tocar el provider. El loader debe devolver { parameters, telemetryFlag }.
 */
export async function getIndicadoresWith(
  loader: () => Promise<{
    parameters: EconomicParameters;
    telemetryFlag: EconomicTelemetryFlag;
  }>
): Promise<Indicadores> {
  const { parameters, telemetryFlag } = await loader();
  return {
    uf: parameters.uf,
    utm: parameters.utm,
    dolar: parameters.dolar,
    fechas: {
      uf: resolveEconomicIndicatorDate(parameters, "uf"),
      utm: resolveEconomicIndicatorDate(parameters, "utm"),
      ...(parameters.dolar !== undefined
        ? {
            dolar: resolveEconomicIndicatorDate(parameters, "dolar"),
          }
        : {}),
    },
    fecha: parameters.lastUpdated,
    source: parameters.source,
    telemetryFlag,
    ...(parameters.prev ? { prev: parameters.prev } : {}),
  };
}

/** @deprecated Usa `formatCLP` en su lugar. */
export const fmt = formatCLP;

export function fmtFecha(fecha: string): string {
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

// ── Presentación de fechas y deltas (compartida por el endpoint
// indicadores-hoy.json.ts y el componente IndicadoresHoy.astro — fuente única
// desde la auditoría 071; antes duplicada byte-idéntica en ambos). ──

const MESES_CORTO = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

export function fmtDiaMesCorto(fecha: string): string {
  const parts = fecha.split("-");
  const m = parseInt(parts[1]!, 10) - 1;
  const d = parseInt(parts[2]!, 10);
  return `${d} ${MESES_CORTO[m] ?? ""}`;
}

export function fmtMesCorto(fecha: string): string {
  const m = parseInt(fecha.split("-")[1]!, 10) - 1;
  return MESES_CORTO[m] ?? "";
}

export function fmtDelta(current: number, prev: number): string {
  const pct = ((current - prev) / prev) * 100;
  return pct.toLocaleString("es-CL", { maximumFractionDigits: 2 });
}
