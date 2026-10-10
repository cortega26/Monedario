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

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  extendSeriesByDate,
  findMissingDates,
  parseBcchIpcObservations,
} from "./economic-history-ipc.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "src/data/economic-history");

const BASE_URL = "https://mindicador.cl/api";
const TIMEOUT_MS = 15_000;
const DELAY_MS = 300; // pausa entre requests para no saturar la API

// Extensión oficial del IPC: mindicador.cl dejó de publicar la serie después
// de dic-2025 (TD-0112), así que los meses faltantes se completan con la serie
// del BCCh (IPC INE, variación mensual, empalme base 2023=100). Requiere
// BCCH_USER/BCCH_PASSWORD (p. ej. en .env.local); sin credenciales se omite.
const BCCH_ENDPOINT = "https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx";
const BCCH_IPC_SERIES = "G073.IPC.VAR.2023.M";

function loadEnvLocal() {
  const envPath = join(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    if (process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

loadEnvLocal();

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
// La ingesta nunca debe perder fechas ya ingestadas (p. ej. mindicador deja de
// publicar IPC y la extensión BCCh falla: la serie mindicador-only borraría los
// meses oficiales). --allow-series-shrink habilita encogimientos intencionales.
const ALLOW_SERIES_SHRINK = args["allow-series-shrink"] === true;

function incluyeIndicador(indicador) {
  return !SOLO || SOLO.includes(indicador);
}

/**
 * Detecta regresiones de la serie recién ingerida contra la versión en disco:
 * cualquier `fecha` existente que desaparezca. Devuelve null si no hay archivo
 * previo, si no se puede parsear o si no hay fechas perdidas.
 */
function findSeriesRegression(indicador, serie) {
  const filePath = join(OUT_DIR, `${indicador}-historico.json`);
  if (!existsSync(filePath)) return null;
  let previous;
  try {
    previous = JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
  const missing = findMissingDates(previous.serie, serie);
  return missing.length > 0 ? { filePath, missing } : null;
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

/**
 * Serie IPC mensual del BCCh (Siete REST WS, Latin-1). Devuelve null si no
 * hay credenciales; nunca registra la URL (contiene las credenciales).
 */
async function fetchBcchIpcSerie(firstDateIso, lastDateIso) {
  const user = process.env.BCCH_USER;
  const password = process.env.BCCH_PASSWORD;
  if (!user || !password) return null;

  const params = new URLSearchParams({
    user,
    pass: password,
    function: "GetSeries",
    timeseries: BCCH_IPC_SERIES,
    firstdate: firstDateIso,
    lastdate: lastDateIso,
  });
  const res = await fetch(`${BCCH_ENDPOINT}?${params.toString()}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`BCCh HTTP ${res.status}`);
  const text = new TextDecoder("iso-8859-1").decode(await res.arrayBuffer());
  const data = JSON.parse(text);
  if (data?.Codigo !== 0 || !Array.isArray(data?.Series?.Obs)) {
    throw new Error(`BCCh Codigo ${data?.Codigo}: ${data?.Descripcion}`);
  }
  return parseBcchIpcObservations(data.Series.Obs);
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

if (ipcData) {
  try {
    const extension = await fetchBcchIpcSerie(
      `${FROM_YEAR}-01-01`,
      `${TO_YEAR}-12-31`
    );
    if (extension && extension.length > 0) {
      const { serie, added } = extendSeriesByDate(ipcData.serie, extension);
      ipcData.serie = serie;
      ipcData.totalEntradas = serie.length;
      ipcData.desdeFecha = serie[0]?.fecha ?? "";
      ipcData.hastaFecha = serie[serie.length - 1]?.fecha ?? "";
      ipcData.fuente =
        "INE (IPC mensual) vía mindicador.cl; extensión vía Banco Central de Chile (G073.IPC.VAR.2023.M, base 2023=100)";
      ipcData.nota +=
        " Los meses sin dato en mindicador.cl se completan con la serie oficial del BCCh (IPC INE, empalme base 2023=100).";
      console.log(
        `  BCCh: +${added} mes(es); serie hasta ${ipcData.hastaFecha}`
      );
    } else {
      console.warn(
        "  BCCh: sin credenciales BCCH_USER/BCCH_PASSWORD — extensión omitida"
      );
    }
  } catch (err) {
    console.warn(
      `  BCCh: error — ${err.message} (se conserva la serie mindicador)`
    );
  }
}

const files = [
  { name: "uf-historico.json", data: ufData },
  { name: "utm-historico.json", data: utmData },
  { name: "ipc-historico.json", data: ipcData },
].filter(file => file.data !== null);

for (const { name, data } of files) {
  const regression = findSeriesRegression(data.indicador, data.serie);
  if (regression && !ALLOW_SERIES_SHRINK) {
    const sample = regression.missing.slice(-3).join(", ");
    console.error(
      `\n✗ ${name}: la nueva serie perdería ${regression.missing.length} fecha(s) ya ingestada(s) ` +
        `(${sample}). Se aborta para no regresar el dataset; si el encogimiento es ` +
        `intencional, repite con --allow-series-shrink.`
    );
    process.exit(1);
  }
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
