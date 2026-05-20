import type { APIRoute } from "astro";
import { getIndicadores, fmtFecha } from "@/utils/indicadores";

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

function fmtDiaMesCorto(fecha: string): string {
  const parts = fecha.split("-");
  const m = parseInt(parts[1]!, 10) - 1;
  const d = parseInt(parts[2]!, 10);
  return `${d} ${MESES_CORTO[m] ?? ""}`;
}

function fmtMesCorto(fecha: string): string {
  const m = parseInt(fecha.split("-")[1]!, 10) - 1;
  return MESES_CORTO[m] ?? "";
}

function fmtDelta(current: number, prev: number): string {
  const pct = ((current - prev) / prev) * 100;
  return pct.toLocaleString("es-CL", { maximumFractionDigits: 2 });
}

function fmtClp(value: number, decimals = 0): string {
  return `$${value.toLocaleString("es-CL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function buildDelta(
  current: number,
  prev: { valor: number; fecha: string } | undefined,
  formatVs: (fecha: string) => string
) {
  if (!prev) return null;
  const up = current >= prev.valor;
  return {
    text: `${up ? "▲" : "▼"} ${fmtDelta(current, prev.valor)}% vs. ${formatVs(prev.fecha)}`,
    direction: up ? "up" : "down",
  };
}

const OFFICIAL_SOURCES: Record<string, string> = {
  uf: "Banco Central de Chile",
  utm: "SII",
  dolar: "Banco Central de Chile",
};

function buildTitle(
  indicator: string,
  source: string,
  description: string
): string {
  if (source === "fallback") return "Valor de referencia aproximado";
  return `${OFFICIAL_SOURCES[indicator] ?? "Fuente oficial"} — ${description}`;
}

export const GET: APIRoute = async () => {
  const indicadores = await getIndicadores();
  const ufFecha = indicadores.fechas.uf;
  const utmFecha = indicadores.fechas.utm;
  const dolarFecha = indicadores.fechas.dolar ?? indicadores.fecha;
  const src = indicadores.source;

  const payload = {
    generatedAt: new Date().toISOString(),
    source: src,
    indicators: {
      uf: {
        label: `UF · ${fmtDiaMesCorto(ufFecha)}`,
        value: fmtClp(indicadores.uf, 2),
        title: buildTitle("uf", src, `UF al ${fmtFecha(ufFecha)}`),
        delta: buildDelta(indicadores.uf, indicadores.prev?.uf, fmtDiaMesCorto),
      },
      utm: {
        label: `UTM · ${fmtMesCorto(utmFecha)}`,
        value: fmtClp(Math.round(indicadores.utm)),
        title: buildTitle("utm", src, `UTM ${fmtMesCorto(utmFecha)}`),
        delta: buildDelta(indicadores.utm, indicadores.prev?.utm, fmtMesCorto),
      },
      ...(indicadores.dolar !== undefined
        ? {
            dolar: {
              label: `DÓLAR OBS. · ${fmtDiaMesCorto(dolarFecha)}`,
              value: fmtClp(indicadores.dolar, 2),
              title: buildTitle(
                "dolar",
                src,
                `Dólar al ${fmtFecha(dolarFecha)}`
              ),
              delta: buildDelta(
                indicadores.dolar,
                indicadores.prev?.dolar,
                fmtDiaMesCorto
              ),
            },
          }
        : {}),
    },
  };

  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, must-revalidate",
    },
  });
};
