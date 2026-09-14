import type { APIRoute } from "astro";
import ufHistoricoRaw from "@/data/economic-history/uf-historico.json";

export interface UfSerieEntry {
  fecha: string;
  valor: number;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SUCCESS_CACHE_CONTROL =
  "public, max-age=86400, stale-while-revalidate=604800";
const ERROR_CACHE_CONTROL = "no-store";
const EMPTY_SERIE_ERROR = "Serie UF histórica vacía; no hay datos para servir.";

function isIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const asDate = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(asDate.getTime()) &&
    asDate.toISOString().slice(0, 10) === value
  );
}

function jsonResponse(
  body: unknown,
  status: number,
  cacheControl: string
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cacheControl,
    },
  });
}

function emptySerieResponse(): Response {
  return jsonResponse(
    { lookup: {}, first: null, last: null, error: EMPTY_SERIE_ERROR },
    503,
    ERROR_CACHE_CONTROL
  );
}

/**
 * Responde el historial UF según query params (sin params = legado):
 * - sin params → `{lookup, first, last}` completo (forma legado, intacta).
 * - `?date=YYYY-MM-DD` → `{fecha, valor, first, last}` (200) o
 *   `{fecha, valor: null, first, last, error}` (404). El fallback de hasta
 *   7 días hacia atrás sigue siendo responsabilidad del cliente
 *   (ver LookupHistoricalUf); el endpoint solo devuelve la fila exacta.
 * - `?from=YYYY-MM-DD&to=YYYY-MM-DD` → `{lookup, first, last}` acotado al
 *   rango inclusivo; aquí `first`/`last` describen el slice devuelto
 *   (null cuando el slice está vacío).
 * Si `date` y `from`/`to` vienen juntos, `date` tiene precedencia.
 * Formato de fecha inválido → 400. Serie vacía → 503 en todas las ramas.
 */
export function buildUfHistoryResponse(
  serie: UfSerieEntry[],
  requestUrl: string | URL
): Response {
  const firstEntry = serie[0];
  const lastEntry = serie[serie.length - 1];
  if (serie.length === 0 || !firstEntry || !lastEntry) {
    return emptySerieResponse();
  }
  const first = firstEntry.fecha;
  const last = lastEntry.fecha;

  const url =
    typeof requestUrl === "string"
      ? new URL(requestUrl, "http://localhost")
      : requestUrl;
  const date = url.searchParams.get("date");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (date !== null) {
    if (!isIsoDate(date)) {
      return jsonResponse(
        { error: `Parámetro date inválido: "${date}". Use YYYY-MM-DD.` },
        400,
        ERROR_CACHE_CONTROL
      );
    }
    const entry = serie.find(item => item.fecha === date);
    if (!entry) {
      return jsonResponse(
        {
          fecha: date,
          valor: null,
          first,
          last,
          error: `Sin dato UF para ${date} dentro del rango ${first} → ${last}.`,
        },
        404,
        ERROR_CACHE_CONTROL
      );
    }
    return jsonResponse(
      { fecha: entry.fecha, valor: entry.valor, first, last },
      200,
      SUCCESS_CACHE_CONTROL
    );
  }

  if (from !== null || to !== null) {
    if (from === null || to === null || !isIsoDate(from) || !isIsoDate(to)) {
      return jsonResponse(
        {
          error:
            "Parámetros from/to inválidos: ambos son requeridos con formato YYYY-MM-DD.",
        },
        400,
        ERROR_CACHE_CONTROL
      );
    }
    if (from > to) {
      return jsonResponse(
        { error: `Rango inválido: from (${from}) es posterior a to (${to}).` },
        400,
        ERROR_CACHE_CONTROL
      );
    }
    const slice = serie.filter(item => item.fecha >= from && item.fecha <= to);
    const sliceLookup: Record<string, number> = {};
    for (const entry of slice) {
      sliceLookup[entry.fecha] = entry.valor;
    }
    return jsonResponse(
      {
        lookup: sliceLookup,
        first: slice[0]?.fecha ?? null,
        last: slice[slice.length - 1]?.fecha ?? null,
      },
      200,
      SUCCESS_CACHE_CONTROL
    );
  }

  const lookup: Record<string, number> = {};
  for (const entry of serie) {
    lookup[entry.fecha] = entry.valor;
  }

  return jsonResponse({ lookup, first, last }, 200, SUCCESS_CACHE_CONTROL);
}

export const GET: APIRoute = ({ url }) =>
  buildUfHistoryResponse(ufHistoricoRaw.serie, url);
