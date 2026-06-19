import type { EconomicParameters } from "./EconomicParameters";

/**
 * Presentación centralizada de la procedencia de los datos económicos de una
 * calculadora. Mantiene el mapeo `source` → etiqueta y el formateo de fecha en
 * un único módulo leaf para que todas las calculadoras muestren la vigencia de
 * forma idéntica (ver plan 024).
 */

export type EconomicSourceLabel =
  | "dato en línea"
  | "dato de referencia"
  | "fallback de emergencia";

/**
 * Mapea el origen del dato económico a su etiqueta corta visible. El `switch` es
 * exhaustivo a propósito: si se agrega un valor a la unión `source` en
 * `EconomicParameters`, el typecheck fallará aquí hasta manejarlo.
 */
export function resolveEconomicSourceLabel(
  source: EconomicParameters["source"]
): EconomicSourceLabel {
  switch (source) {
    case "live":
      return "dato en línea";
    case "snapshot":
      return "dato de referencia";
    case "fallback":
      return "fallback de emergencia";
  }
}

/** Formatea una fecha ISO (YYYY-MM-DD) como fecha larga chilena en UTC. */
export function formatEconomicDate(isoDate: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00.000Z`));
}
