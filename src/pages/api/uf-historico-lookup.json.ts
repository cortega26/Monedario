import type { APIRoute } from "astro";
import ufHistoricoRaw from "@/data/economic-history/uf-historico.json";

export const GET: APIRoute = () => {
  const lookup: Record<string, number> = {};
  for (const entry of ufHistoricoRaw.serie) {
    lookup[entry.fecha] = entry.valor;
  }
  const first = ufHistoricoRaw.serie[0]!.fecha;
  const last = ufHistoricoRaw.serie[ufHistoricoRaw.serie.length - 1]!.fecha;

  return new Response(JSON.stringify({ lookup, first, last }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
};
