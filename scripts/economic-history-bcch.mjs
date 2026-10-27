/**
 * Helpers puros de la serie diaria de UF del Banco Central de Chile
 * (`F073.UFF.PRE.Z.D`).
 *
 * Ver `ADR-20261027-uf-official-source-bcch`.
 *
 * Reglas que NO se heredan del parser de IPC a propósito:
 *
 *  - **Sin redondeo.** `parseBcchIpcObservations` redondea a 1 decimal porque
 *    el IPC es una variación mensual. La UF se publica con 2 decimales
 *    (41189.24); redondearla corrompería 25 años de serie.
 *  - **`statusCode` ausente se acepta.** El IPC lo exige (`!== "OK"` →
 *    descarta), pero en una serie diaria de 27 años una fila sin el campo no
 *    debe convertirse en un hueco. Un código presente y distinto de "OK" sí se
 *    descarta: significa "sin dato".
 */

const UF_DAILY_PLAUSIBILITY_MAX_PCT = 0.05;

/**
 * Convierte `DD-MM-YYYY` (formato de `indexDateString`) a `YYYY-MM-DD`.
 * Devuelve "" si no calza.
 */
export function bcchDateToIso(value) {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(String(value ?? "").trim());
  if (!match) return "";
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Parsea las observaciones diarias de UF del BCCh.
 *
 * @param {Array<{indexDateString?: string, value?: string|number, statusCode?: string}>|null|undefined} obs
 * @returns {Array<{fecha: string, valor: number}>} ordenadas ascendente por fecha
 * @throws {Error} si hay fechas duplicadas o valores no numéricos
 */
export function parseBcchUfDailyObservations(obs) {
  if (!Array.isArray(obs)) return [];

  const byFecha = new Map();
  for (const entry of obs) {
    if (!entry) continue;

    // "OK" = hay dato; cualquier otro código publicado = sin dato.
    if (entry.statusCode !== undefined && entry.statusCode !== "OK") continue;

    const fecha = bcchDateToIso(entry.indexDateString);
    if (!fecha) continue;

    // La UF se publica con 2 decimales (SII 2013-09-01 = 23.040,94), pero el
    // BCCh emite algunos valores con ruido de coma flotante
    // ("23040.939999999"). Se normaliza a 2 decimales.
    //
    // OJO: NO reutilizar el redondeo a 1 decimal de `parseBcchIpcObservations`
    // (correcto para una variación mensual de IPC, corrupto para la UF).
    const raw = Number(entry.value);
    if (!Number.isFinite(raw)) {
      throw new Error(
        `BCCh UF: valor no numérico para ${fecha}: ${JSON.stringify(entry.value)}`
      );
    }
    const valor = Math.round(raw * 100) / 100;

    if (byFecha.has(fecha)) {
      throw new Error(`BCCh UF: fecha duplicada ${fecha}`);
    }
    byFecha.set(fecha, valor);
  }

  return [...byFecha.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, valor]) => ({ fecha, valor }));
}

/**
 * Guard de plausibilidad independiente del proveedor.
 *
 * La UF se reajusta por IPC mensual: no ha variado ~5% en un día en toda su
 * historia. Un salto mayor es corrupción (mezcla de indicadores, corrimiento
 * de 10^, fila de otro dataset) o una revisión que exige revisión humana.
 *
 * Este control habría detectado el defecto de 2014-12-29 (24.627,1 -> 608,15)
 * sin necesitar una segunda fuente.
 *
 * @param {Array<{fecha: string, valor: number}>} serie
 * @returns {Array<{fecha: string, previo: number, nuevo: number, pct: number}>}
 */
export function findUfPlausibilityViolations(serie) {
  if (!Array.isArray(serie)) return [];
  const violations = [];

  for (let i = 1; i < serie.length; i += 1) {
    const prev = serie[i - 1];
    const curr = serie[i];
    if (!prev || !curr || prev.valor === 0) continue;
    const pct = Math.abs(curr.valor / prev.valor - 1);
    if (pct > UF_DAILY_PLAUSIBILITY_MAX_PCT) {
      violations.push({
        fecha: curr.fecha,
        previo: prev.valor,
        nuevo: curr.valor,
        pct,
      });
    }
  }

  return violations;
}
