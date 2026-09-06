import type { APIRoute } from "astro";
import ufHistoricoRaw from "@/data/economic-history/uf-historico.json";

export const GET: APIRoute = () => {
  const serie = ufHistoricoRaw.serie;
  if (serie.length === 0) {
    return new Response(
      JSON.stringify({
        lookup: {},
        first: null,
        last: null,
        error: "Serie UF histórica vacía; no hay datos para servir.",
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      }
    );
  }
  const lookup: Record<string, number> = {};
  for (const entry of serie) {
    lookup[entry.fecha] = entry.valor;
  }
  const firstEntry = serie[0];
  const lastEntry = serie[serie.length - 1];
  if (!firstEntry || !lastEntry) {
    return new Response(
      JSON.stringify({
        lookup: {},
        first: null,
        last: null,
        error: "Serie UF histórica vacía; no hay datos para servir.",
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      }
    );
  }
  const first = firstEntry.fecha;
  const last = lastEntry.fecha;

  return new Response(JSON.stringify({ lookup, first, last }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
};
