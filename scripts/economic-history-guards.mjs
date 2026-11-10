/**
 * Guardas puras de integridad de las series económicas históricas.
 *
 * Ver `ADR-20261026-weekly-uf-ingestion`: el ingestor re-descarga 2000→presente
 * y reescribe el archivo completo, así que necesita controles simétricos para
 * las dos formas en que una serie puede retroceder:
 *
 *   - `findMissingDates` (en `economic-history-ipc.mjs`) — fechas que
 *     desaparecen.
 *   - `findChangedValues` (aquí) — fechas que sobreviven con otro valor.
 *
 * Sin el segundo, una revisión o un redondeo aguas arriba reescribiría años de
 * valores publicados sin que ningún gate lo note.
 */

/**
 * Devuelve las fechas presentes en ambas series cuyo valor cambió.
 *
 * Las fechas ausentes en `nextSerie` NO se reportan aquí: son competencia de
 * `findMissingDates`, y separar las dos responsabilidades permite mensajes de
 * error accionables (`--allow-series-shrink` vs `--allow-value-revision`).
 *
 * @param {Array<{fecha: string, valor: number}>|null|undefined} previousSerie
 * @param {Array<{fecha: string, valor: number}>|null|undefined} nextSerie
 * @returns {Array<{fecha: string, previo: number, nuevo: number}>}
 */
export function findChangedValues(previousSerie, nextSerie) {
  if (!Array.isArray(previousSerie) || !Array.isArray(nextSerie)) return [];

  const next = new Map(nextSerie.map(entry => [entry.fecha, entry.valor]));
  const changed = [];

  for (const entry of previousSerie) {
    if (!entry || typeof entry.fecha !== "string") continue;
    if (!next.has(entry.fecha)) continue;
    const nuevo = next.get(entry.fecha);
    if (nuevo !== entry.valor) {
      changed.push({ fecha: entry.fecha, previo: entry.valor, nuevo });
    }
  }

  return changed;
}

/**
 * Combina dos series por fecha: `primarySerie` manda y `fallbackSerie` solo
 * rellena las fechas que la primaria no cubre. Útil para BCCh (oficial) +
 * mindicador (respaldo) sin dejar huecos si el oficial viene incompleto.
 *
 * @param {Array<{fecha: string, valor: number}>} primarySerie
 * @param {Array<{fecha: string, valor: number}>} fallbackSerie
 * @returns {Array<{fecha: string, valor: number}>} ascendente por fecha
 */
export function mergeSeriesByDate(primarySerie, fallbackSerie) {
  const byFecha = new Map();
  for (const entry of Array.isArray(fallbackSerie) ? fallbackSerie : []) {
    if (entry?.fecha) byFecha.set(entry.fecha, entry.valor);
  }
  for (const entry of Array.isArray(primarySerie) ? primarySerie : []) {
    if (entry?.fecha) byFecha.set(entry.fecha, entry.valor);
  }
  return [...byFecha.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, valor]) => ({ fecha, valor }));
}

/**
 * Ejecuta `fn` con reintentos y espera creciente (base, 2×base, 4×base…).
 * mindicador.cl da timeouts y HTTP 500 de forma intermitente; un solo intento
 * por año convertía un fallo transitorio en un hueco que luego rellenaba otra
 * fuente con distinta base/redondeo (falsas "revisiones" del IPC).
 *
 * @template T
 * @param {() => Promise<T>} fn
 * @param {{attempts?: number, baseDelayMs?: number, sleep?: (ms: number) => Promise<void>}} [options]
 * @returns {Promise<T>}
 */
export async function withRetry(fn, options = {}) {
  const attempts = Math.max(1, options.attempts ?? 3);
  const baseDelayMs = options.baseDelayMs ?? 2000;
  const sleep =
    options.sleep ?? (ms => new Promise(resolve => setTimeout(resolve, ms)));
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(baseDelayMs * 2 ** (attempt - 1));
    }
  }
  throw lastError;
}

/**
 * Entradas de un año calendario de una serie ya publicada. Sirve de respaldo
 * cuando la fuente no responde para ese año: el histórico cerrado no cambia, y
 * conservar lo publicado es preferible a omitir el año y dejar que otra fuente
 * lo reescriba.
 *
 * @param {Array<{fecha: string, valor: number}>|null|undefined} serie
 * @param {number} year
 * @returns {Array<{fecha: string, valor: number}>}
 */
export function entriesForYear(serie, year) {
  if (!Array.isArray(serie)) return [];
  const prefix = `${year}-`;
  return serie.filter(
    entry => typeof entry?.fecha === "string" && entry.fecha.startsWith(prefix)
  );
}

/**
 * ¿Hay que volver a pedir este año a la fuente? El histórico cerrado no cambia:
 * re-descargarlo cada semana solo expone la ingesta a los fallos intermitentes
 * de mindicador.cl sin aportar datos. Se pide siempre el año en curso y el
 * anterior (ventana de correcciones tardías), y cualquier año que aún no tenga
 * entradas publicadas.
 *
 * @param {{year: number, currentYear: number, previousSerie: Array<{fecha: string}>|null|undefined, full?: boolean}} input
 * @returns {boolean}
 */
export function shouldRefetchYear({ year, currentYear, previousSerie, full }) {
  if (full) return true;
  if (year >= currentYear - 1) return true;
  return entriesForYear(previousSerie, year).length === 0;
}
