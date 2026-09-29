/**
 * Ingesta de series históricas desde mindicador.cl.
 * Genera 5 archivos en src/data/economic-history/:
 *   - uf-historico.json   — valor diario de la UF
 *   - utm-historico.json  — valor mensual de la UTM
 *   - ipc-historico.json  — variación mensual IPC (%) — no es índice acumulado
 *   - uf-rango.json       — sidecar liviano {first, last, count} del rango UF
 *   - uf-mensual.json     — sidecar liviano con un punto por mes (gráfico uf-hoy)
 *
 * Uso:
 *   node scripts/fetch-economic-history.mjs [--desde=2000] [--hasta=2026]
 *
 * Por defecto: desde 2000, hasta el año actual.
 * El script es re-ejecutable; sobreescribe los archivos de salida.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "src/data/economic-history");

const BASE_URL = "https://mindicador.cl/api";
const TIMEOUT_MS = 15_000;
const DELAY_MS = 300; // pausa entre requests para no saturar la API

// --- Parseo de argumentos --------------------------------------------------

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith("--"))
    .map(a => {
      const [k, v] = a.slice(2).split("=");
      return [k, v ?? true];
    })
);

const currentYear = new Date().getUTCFullYear();
const FROM_YEAR = parseInt(args.desde ?? "2000", 10);
const TO_YEAR   = parseInt(args.hasta ?? String(currentYear), 10);
// --solo=ipc,uf permite refrescar una o más series sin reescribir el resto.
const SOLO = args.solo
  ? String(args.solo)
      .split(",")
      .map(value => value.trim())
      .filter(Boolean)
  : null;

function incluyeIndicador(indicador) {
  return !SOLO || SOLO.includes(indicador);
}

// --- Utilidades -----------------------------------------------------------

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json();
}

/** Normaliza fecha ISO completa a YYYY-MM-DD. */
function toIsoDate(fecha) {
  return typeof fecha === "string" ? fecha.slice(0, 10) : "";
}

// --- Fetchers por indicador -----------------------------------------------

/**
 * Descarga la serie anual de un indicador (uf, utm, ipc).
 * mindicador devuelve {serie: [{fecha, valor}]} en orden descendente.
 */
async function fetchYearSerie(indicador, year) {
  const data = await fetchJson(`${BASE_URL}/${indicador}/${year}`);
  const serie = data?.serie ?? [];
  return serie
    .map(e => ({ fecha: toIsoDate(e.fecha), valor: e.valor }))
    .filter(e => e.fecha && typeof e.valor === "number" && isFinite(e.valor))
    .sort((a, b) => a.fecha.localeCompare(b.fecha)); // ascendente
}

// --- Ingesta por indicador ------------------------------------------------

async function ingestIndicador(indicador, granularidad, nota) {
  console.log(`\n[${indicador.toUpperCase()}] Ingesta ${FROM_YEAR}–${TO_YEAR}...`);
  const allEntries = [];

  for (let year = FROM_YEAR; year <= TO_YEAR; year++) {
    try {
      const entries = await fetchYearSerie(indicador, year);
      console.log(`  ${year}: ${entries.length} entradas`);
      allEntries.push(...entries);
    } catch (err) {
      console.warn(`  ${year}: error — ${err.message} (omitido)`);
    }
    if (year < TO_YEAR) await sleep(DELAY_MS);
  }

  // Eliminar duplicados por fecha (mantener el último si hay varios)
  const byFecha = new Map();
  for (const e of allEntries) byFecha.set(e.fecha, e.valor);
  const serie = [...byFecha.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, valor]) => ({ fecha, valor }));

  return {
    fuente: "mindicador.cl",
    indicador,
    granularidad,
    actualizadoEl: new Date().toISOString().slice(0, 10),
    desdeFecha: serie[0]?.fecha ?? "",
    hastaFecha: serie[serie.length - 1]?.fecha ?? "",
    totalEntradas: serie.length,
    nota,
    serie,
  };
}

// --- Main -----------------------------------------------------------------

mkdirSync(OUT_DIR, { recursive: true });

console.log(`Ingesta económica histórica — ${FROM_YEAR} a ${TO_YEAR}`);
console.log(`Destino: ${OUT_DIR}`);

const ufData = incluyeIndicador("uf")
  ? await ingestIndicador("uf", "diaria", "Valor diario de la UF en pesos chilenos.")
  : null;

const utmData = incluyeIndicador("utm")
  ? await ingestIndicador(
      "utm",
      "mensual",
      "Valor mensual de la UTM en pesos chilenos."
    )
  : null;

const ipcData = incluyeIndicador("ipc")
  ? await ingestIndicador(
      "ipc",
      "mensual",
      "Variación porcentual mensual del IPC según el INE, publicada por mindicador.cl. " +
        "Este campo refleja la variación del período (%), NO un índice acumulado. " +
        "Para calcular poder adquisitivo acumulado es necesario encadenar las variaciones."
    )
  : null;

const files = [
  { name: "uf-historico.json", data: ufData },
  { name: "utm-historico.json", data: utmData },
  { name: "ipc-historico.json", data: ipcData },
].filter(file => file.data !== null);

for (const { name, data } of files) {
  const path = join(OUT_DIR, name);
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(
    `\n✓ ${name} — ${data.totalEntradas} entradas (${data.desdeFecha} → ${data.hastaFecha})`
  );
}

// --- Sidecars livianos UF ---------------------------------------------------
// Evitan parsear los ~638 KB de uf-historico.json por dos strings (rango) o
// ~60 puntos mensuales (gráfico). Derivan de los mismos datos ya ingeridos.

if (ufData) {
  const ufRango = {
    first: ufData.desdeFecha,
    last: ufData.hastaFecha,
    count: ufData.totalEntradas,
  };
  writeFileSync(
    join(OUT_DIR, "uf-rango.json"),
    JSON.stringify(ufRango, null, 2) + "\n",
    "utf8"
  );
  console.log(
    `\n✓ uf-rango.json — ${ufRango.count} entradas (${ufRango.first} → ${ufRango.last})`
  );
}

if (ufData) {
  // Un punto por mes (primera fecha disponible del mes, serie ascendente).
  const ufMesesVistos = new Set();
  const ufPuntosMensuales = [];
  for (const entry of ufData.serie) {
    const mes = entry.fecha.slice(0, 7);
    if (ufMesesVistos.has(mes)) continue;
    ufMesesVistos.add(mes);
    ufPuntosMensuales.push({ fecha: entry.fecha, valor: entry.valor });
  }
  const ufMensual = {
    fuente: "mindicador.cl",
    indicador: "uf",
    granularidad: "mensual",
    actualizadoEl: ufData.actualizadoEl,
    count: ufPuntosMensuales.length,
    puntos: ufPuntosMensuales,
  };
  writeFileSync(
    join(OUT_DIR, "uf-mensual.json"),
    JSON.stringify(ufMensual, null, 2) + "\n",
    "utf8"
  );
  console.log(`uf-mensual.json: ${ufMensual.count} puntos mensuales`);
}

console.log("Ingesta completada.");
