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
 * Por defecto: desde 2000, hasta el año actual. Los años cerrados ya publicados
 * no se vuelven a pedir a mindicador.cl (solo el año en curso y el anterior);
 * --full-refetch fuerza la descarga completa. Cada año se reintenta 3 veces y,
 * si sigue fallando, se conservan las entradas ya publicadas.
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
import {
  entriesForYear,
  findChangedValues,
  mergeSeriesByDate,
  shouldRefetchYear,
  withRetry,
} from "./economic-history-guards.mjs";
import {
  findUfPlausibilityViolations,
  parseBcchUfDailyObservations,
} from "./economic-history-bcch.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "src/data/economic-history");

const BASE_URL = "https://mindicador.cl/api";
const TIMEOUT_MS = 15_000;
const DELAY_MS = 300; // pausa entre requests para no saturar la API
const FETCH_ATTEMPTS = 3;
const FETCH_RETRY_BASE_MS = 3_000;

// Extensión oficial del IPC: mindicador.cl dejó de publicar la serie después
// de dic-2025 (TD-0112), así que los meses faltantes se completan con la serie
// del BCCh (IPC INE, variación mensual, empalme base 2023=100). Requiere
// BCCH_USER/BCCH_PASSWORD (p. ej. en .env.local); sin credenciales se omite.
const BCCH_ENDPOINT = "https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx";
const BCCH_IPC_SERIES = "G073.IPC.VAR.2023.M";
// ADR-20261027: el emisor oficial de la UF es el BCCh. La serie `PRE.Z.D` es la
// publicada en pesos, diaria, con 2 decimales y ~14 días de anticipación.
const BCCH_UF_SERIES = "F073.UFF.PRE.Z.D";

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
// Por defecto solo se re-piden el año en curso y el anterior; el histórico
// cerrado se toma de lo ya publicado. --full-refetch descarga todo de nuevo.
const FULL_REFETCH = args["full-refetch"] === true;
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
// ADR-20261026: `findMissingDates` solo compara fechas. El script re-descarga
// 2000→presente y reescribe el archivo completo, así que una revisión o un
// redondeo aguas arriba reescribiría valores ya publicados sin que ningún gate
// lo note. --allow-value-revision habilita revisiones intencionales.
const ALLOW_VALUE_REVISION = args["allow-value-revision"] === true;

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

/**
 * ADR-20261026 — detecta valores ya ingestados que cambiarían en la nueva
 * serie. Complementa `findSeriesRegression`, que solo mira el conjunto de
 * fechas. Devuelve null si no hay archivo previo, si no se puede parsear o si
 * no hay valores alterados.
 */
function findValueRevisions(indicador, serie) {
  const filePath = join(OUT_DIR, `${indicador}-historico.json`);
  if (!existsSync(filePath)) return null;
  let previous;
  try {
    previous = JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
  if (!Array.isArray(previous?.serie)) return null;

  const revised = findChangedValues(previous.serie, serie);
  return revised.length > 0 ? { filePath, revised } : null;
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

/** Serie ya publicada en disco (o null si no existe o no se puede leer). */
function readPreviousSerie(indicador) {
  const filePath = join(OUT_DIR, `${indicador}-historico.json`);
  if (!existsSync(filePath)) return null;
  try {
    const previous = JSON.parse(readFileSync(filePath, "utf8"));
    return Array.isArray(previous?.serie) ? previous.serie : null;
  } catch {
    return null;
  }
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

/**
 * Serie UF diaria del BCCh (Siete REST WS, Latin-1). Devuelve null si no hay
 * credenciales. Lanza si el BCCh responde con error o sin observaciones: el
 * llamador decide si cae al respaldo.
 */
async function fetchBcchUfSerie(firstDateIso, lastDateIso) {
  const user = process.env.BCCH_USER;
  const password = process.env.BCCH_PASSWORD;
  if (!user || !password) return null;

  const params = new URLSearchParams({
    user,
    pass: password,
    function: "GetSeries",
    timeseries: BCCH_UF_SERIES,
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
  return parseBcchUfDailyObservations(data.Series.Obs);
}

// --- Ingesta por indicador ------------------------------------------------

async function ingestIndicador(indicador, granularidad, nota) {
  console.log(`\n[${indicador.toUpperCase()}] Ingesta ${FROM_YEAR}–${TO_YEAR}...`);
  const allEntries = [];
  const previousSerie = readPreviousSerie(indicador);

  for (let year = FROM_YEAR; year <= TO_YEAR; year++) {
    if (
      !shouldRefetchYear({
        year,
        currentYear,
        previousSerie,
        full: FULL_REFETCH,
      })
    ) {
      // Histórico cerrado y ya publicado: no se vuelve a pedir (--full-refetch
      // fuerza la descarga completa).
      allEntries.push(...entriesForYear(previousSerie, year));
      continue;
    }
    try {
      // mindicador.cl falla de forma intermitente (timeouts, HTTP 500): se
      // reintenta antes de rendirse con ese año.
      const entries = await withRetry(() => fetchYearSerie(indicador, year), {
        attempts: FETCH_ATTEMPTS,
        baseDelayMs: FETCH_RETRY_BASE_MS,
      });
      console.log(`  ${year}: ${entries.length} entradas`);
      allEntries.push(...entries);
    } catch (err) {
      // Respaldo: lo ya publicado para ese año. Omitirlo dejaba un hueco que
      // otra fuente (BCCh, base distinta) rellenaba cambiando valores
      // publicados, y el guard de revisión abortaba la ingesta completa.
      const kept = entriesForYear(previousSerie, year);
      console.warn(
        `  ${year}: error — ${err.message} ` +
          (kept.length > 0
            ? `(se conservan ${kept.length} entradas ya publicadas)`
            : "(omitido)")
      );
      allEntries.push(...kept);
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

/**
 * ADR-20261027: la UF se ingiere desde el BCCh (emisor oficial). mindicador.cl
 * queda como respaldo y como señal de reconciliación, nunca como autoridad.
 *
 * - Si el BCCh responde, manda: rellena huecos con mindicador y reporta las
 *   discrepancias sin bloquear (la evidencia de 2014 demuestra que el
 *   agregador puede publicar valores falsos; bloquear por su culpa publicaría
 *   datos peores).
 * - Si el BCCh falla o viene vacío, se usa mindicador y la `fuente` lo dice.
 *   Nunca se atribuye a BCCh un dato que no vino de BCCh.
 */
async function ingestUfSeries() {
  const nota =
    "Valor diario de la Unidad de Fomento en pesos chilenos. Fuente oficial: " +
    "Banco Central de Chile (serie F073.UFF.PRE.Z.D); mindicador.cl solo como " +
    "respaldo y control de reconciliación.";

  let bcchSerie = null;
  try {
    bcchSerie = await fetchBcchUfSerie(
      `${FROM_YEAR}-01-01`,
      new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10)
    );
    if (bcchSerie && bcchSerie.length === 0) bcchSerie = null;
    if (!bcchSerie) {
      console.warn(
        "  BCCh: sin credenciales BCCH_USER/BCCH_PASSWORD — se usa mindicador.cl"
      );
    }
  } catch (err) {
    console.warn(`  BCCh: error — ${err.message} (se intenta mindicador.cl)`);
  }

  let mindicador = null;
  try {
    mindicador = await ingestIndicador("uf", "diaria", nota);
  } catch (err) {
    console.warn(`  mindicador: error — ${err.message}`);
  }

  let serie;
  let fuente;
  if (bcchSerie) {
    const gaps = mergeSeriesByDate(bcchSerie, mindicador?.serie ?? []);
    serie = gaps;
    const filled = gaps.length - bcchSerie.length;
    fuente = "Banco Central de Chile (F073.UFF.PRE.Z.D)";
    if (filled > 0) {
      fuente += `; ${filled} fecha(s) sin dato oficial rellenadas vía mindicador.cl`;
    }
    console.log(
      `  BCCh: ${bcchSerie.length} observaciones (${bcchSerie[0]?.fecha} → ${bcchSerie.at(-1)?.fecha})` +
        (filled > 0 ? `, ${filled} rellenada(s) con mindicador` : "")
    );
    if (mindicador?.serie?.length) {
      const disagreements = findChangedValues(mindicador.serie, bcchSerie);
      if (disagreements.length > 0) {
        const sample = disagreements
          .slice(0, 3)
          .map(d => `${d.fecha} (mindicador ${d.previo} vs BCCh ${d.nuevo})`)
          .join(", ");
        console.warn(
          `  Reconciliación: ${disagreements.length} discrepancia(s) con mindicador — manda BCCh. ${sample}`
        );
      }
    }
  } else if (mindicador?.serie?.length) {
    serie = mindicador.serie;
    fuente = "mindicador.cl (respaldo: BCCh no disponible)";
    console.warn("  ADVERTENCIA: serie UF servida desde mindicador.cl, no desde el BCCh");
  } else {
    throw new Error(
      "No se pudo ingerir la UF: BCCh y mindicador.cl fallaron. No se escribe nada."
    );
  }

  const implausible = findUfPlausibilityViolations(serie);
  if (implausible.length > 0) {
    const sample = implausible
      .slice(0, 3)
      .map(v => `${v.fecha} (${v.previo} → ${v.nuevo}, ${(v.pct * 100).toFixed(1)}%)`)
      .join(", ");
    throw new Error(
      `Serie UF implausible: ${implausible.length} salto(s) diario(s) > 5% (${sample}). ` +
        "Se aborta: parece corrupción de fuente, no una revisión real."
    );
  }

  return {
    fuente,
    indicador: "uf",
    granularidad: "diaria",
    actualizadoEl: new Date().toISOString().slice(0, 10),
    desdeFecha: serie[0]?.fecha ?? "",
    hastaFecha: serie[serie.length - 1]?.fecha ?? "",
    totalEntradas: serie.length,
    nota,
    serie,
  };
}

const ufData = incluyeIndicador("uf") ? await ingestUfSeries() : null;

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
  const revision = findValueRevisions(data.indicador, data.serie);
  if (revision && !ALLOW_VALUE_REVISION) {
    const sample = revision.revised
      .slice(0, 3)
      .map(r => `${r.fecha} (${r.previo} → ${r.nuevo})`)
      .join(", ");
    console.error(
      `\n✗ ${name}: la nueva serie cambiaría el valor de ${revision.revised.length} ` +
        `fecha(s) ya publicada(s) (${sample}). Se aborta para no reescribir historia ` +
        `sin revisión; si la revisión es intencional, repite con --allow-value-revision.`
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
