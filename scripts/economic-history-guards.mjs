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
