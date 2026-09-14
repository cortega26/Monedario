/**
 * Cliente liviano del endpoint de historial UF por rango.
 * Reemplaza la descarga del mapa completo (~212 KB) por un fetch por fecha
 * candidata (`GET /api/uf-historico-lookup.json?date=YYYY-MM-DD`).
 * La regla de fallback (exacto + hasta 7 días hacia atrás) replica
 * `lookupHistoricalUf`; ese módulo sigue siendo la referencia de la regla.
 */

export interface UfHistoryRow {
  fecha: string;
  valor: number;
  first: string;
  last: string;
}

/** Fetch mínimo inyectable (permite stub en tests). */
export type UfHistoryFetch = (url: string) => Promise<{
  status: number;
  json: () => Promise<unknown>;
}>;

export type UfRemoteResult =
  | {
      found: true;
      date: string;
      resolvedDate: string;
      value: number;
      isExactMatch: boolean;
    }
  | {
      found: false;
      reason: "before_range" | "after_range" | "no_data" | "network_error";
    };

export const UF_HISTORY_LOOKBACK_DAYS = 7;

export function buildUfDateUrl(endpoint: string, isoDate: string): string {
  return `${endpoint}?date=${isoDate}`;
}

function previousIsoDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function isUfHistoryRow(value: unknown): value is UfHistoryRow {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row["fecha"] === "string" &&
    typeof row["valor"] === "number" &&
    isFinite(row["valor"])
  );
}

/**
 * Resuelve el valor UF para `date` consultando el endpoint por rango.
 * Intento exacto + hasta 7 días hacia atrás (máximo 8 requests).
 */
export async function fetchHistoricalUf(
  fetchFn: UfHistoryFetch,
  endpoint: string,
  date: string,
  first: string,
  last: string,
  lookbackDays: number = UF_HISTORY_LOOKBACK_DAYS
): Promise<UfRemoteResult> {
  if (date < first) return { found: false, reason: "before_range" };
  if (date > last) return { found: false, reason: "after_range" };

  let candidate = date;
  for (let step = 0; step <= lookbackDays; step++) {
    if (candidate < first) break;
    let response: Awaited<ReturnType<UfHistoryFetch>>;
    try {
      response = await fetchFn(buildUfDateUrl(endpoint, candidate));
    } catch {
      return { found: false, reason: "network_error" };
    }
    if (response.status === 200) {
      const row: unknown = await response.json();
      if (!isUfHistoryRow(row)) return { found: false, reason: "no_data" };
      return {
        found: true,
        date,
        resolvedDate: candidate,
        value: row.valor,
        isExactMatch: candidate === date,
      };
    }
    if (response.status === 404) {
      candidate = previousIsoDate(candidate);
      continue;
    }
    return { found: false, reason: "no_data" };
  }
  return { found: false, reason: "no_data" };
}
