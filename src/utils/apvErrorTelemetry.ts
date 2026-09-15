import { trackAnalyticsEvent } from "@/utils/analytics";

/**
 * Plan 114 (diseño del plan 112): señal agregada mínima de errores APV.
 *
 * Emite `calculator_error` (evento ya allowlistado, sin nombres nuevos) con
 * `{ calculator_id: "apv", error_category }`. `page_type` y `app_version` los
 * enriquece el transporte central (`src/scripts/analytics.ts`); NO agregarlos
 * aquí. Nunca montos, resultados, valores de input ni `error.message`: solo
 * la categoría del enum del contrato.
 */

// Los valores espejan ENUM_VALUES.error_category de
// src/contracts/analytics-events.ts (el contrato es la taxonomía canónica;
// nada nuevo aquí).
export type ApvErrorCategory =
  "validation" | "calculation" | "network" | "timeout" | "stale_source";

const APV_CALCULATOR_ID = "apv";

// Dedupe del diccionario: una emisión por intento y categoría. Se reinicia
// en cada click de "Calcular" vía resetApvErrorDedupe().
const emittedCategories = new Set<ApvErrorCategory>();

export function emitApvError(errorCategory: ApvErrorCategory): void {
  if (emittedCategories.has(errorCategory)) return;
  emittedCategories.add(errorCategory);
  trackAnalyticsEvent("calculator_error", {
    calculator_id: APV_CALCULATOR_ID,
    error_category: errorCategory,
  });
}

export function resetApvErrorDedupe(): void {
  emittedCategories.clear();
}
