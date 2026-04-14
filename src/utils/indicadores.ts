import {
  resolveEconomicIndicatorDate,
  type EconomicParameters,
} from "@/domain/economic/EconomicParameters";
import type { EconomicTelemetryFlag } from "@/infrastructure/economic/EconomicParameterProvider";
import { getEconomicParameters } from "@/application/use-cases/GetEconomicParameters";

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
}

export async function getIndicadores(): Promise<Indicadores> {
  const { parameters, telemetryFlag } = await getEconomicParameters();
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
  };
}

export function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CL");
}

export function fmtFecha(fecha: string): string {
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

export function fmtFechaCorta(fecha: string): string {
  const [, m, d] = fecha.split("-");
  return `${d}/${m}`;
}
