// Helpers puros para la extensión de la serie IPC vía Banco Central de Chile
// (plan 115 F04 / TD-0112). La serie oficial usada es
// `G073.IPC.VAR.2023.M` (IPC INE, variación mensual, empalme BCCh base
// 2023=100), que para 2026 coincide con lo publicado por el INE.

/**
 * Convierte observaciones Siete (`indexDateString` DD-MM-YYYY, `value` string)
 * a entradas ISO `{fecha: YYYY-MM-01, valor}` con redondeo a 1 decimal, igual
 * que la serie histórica existente. Ignora observaciones no-OK.
 */
export function parseBcchIpcObservations(observations) {
  const byFecha = new Map();
  for (const obs of observations ?? []) {
    if (!obs || obs.statusCode !== "OK") continue;
    const raw =
      typeof obs.value === "string" ? obs.value : String(obs.value ?? "");
    const value = Number.parseFloat(raw);
    const parts = String(obs.indexDateString ?? "").split("-");
    if (!Number.isFinite(value) || parts.length !== 3) continue;
    const [dd, mm, yyyy] = parts;
    if (!/^\d{4}$/.test(yyyy) || !/^\d{2}$/.test(mm) || !/^\d{2}$/.test(dd)) {
      continue;
    }
    const rounded = Math.round(value * 10) / 10;
    byFecha.set(`${yyyy}-${mm}-01`, rounded === 0 ? 0 : rounded);
  }
  return [...byFecha.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, valor]) => ({ fecha, valor }));
}

/**
 * Extiende `baseSerie` con los meses de `extensionSerie` que falten, sin
 * sobreescribir valores existentes (la historia mindicador/INE manda).
 * Devuelve la serie ordenada y cuántas entradas se agregaron.
 */
export function extendSeriesByDate(baseSerie, extensionSerie) {
  const byFecha = new Map(baseSerie.map(entry => [entry.fecha, entry.valor]));
  let added = 0;
  for (const entry of extensionSerie) {
    if (byFecha.has(entry.fecha)) continue;
    byFecha.set(entry.fecha, entry.valor);
    added += 1;
  }
  const serie = [...byFecha.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, valor]) => ({ fecha, valor }));
  return { serie, added };
}

/**
 * Fechas presentes en `previousSerie` que desaparecerían en `nextSerie`.
 * Arreglo vacío = sin regresión. La ingesta lo usa para no borrar meses ya
 * ingestados cuando una fuente deja de publicar (p. ej. mindicador sin IPC +
 * extensión BCCh no disponible).
 */
export function findMissingDates(previousSerie, nextSerie) {
  const nextDates = new Set((nextSerie ?? []).map(entry => entry.fecha));
  return (previousSerie ?? [])
    .map(entry => entry.fecha)
    .filter(fecha => !nextDates.has(fecha));
}
