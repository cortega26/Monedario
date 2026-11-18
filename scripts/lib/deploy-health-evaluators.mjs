// Pure evaluators for the deploy-health checks. No Node built-ins: this module
// is bundled by the Cloudflare Worker (`workers/deploy-health`) and imported by
// `scripts/check-deploy-health.mjs` so both use exactly the same rules.

// La UF se publica con días de anticipación, así que su fecha mostrada debería
// ser >= hoy; 3 días de holgura cubren cualquier demora razonable de deploy.
export const UF_MAX_LAG_DAYS = 3;
// El dólar no tiene valor en fines de semana ni feriados (puentes de 4 días).
export const DOLAR_MAX_LAG_DAYS = 6;
// El Worker de snapshot commitea cuando cambia la UF (diaria), así que
// capturedAt es un heartbeat diario. 36 h toleran una publicación tardía y
// detectan un día completo perdido.
export const SNAPSHOT_MAX_AGE_HOURS = 36;
export const SNAPSHOT_URL =
  "https://raw.githubusercontent.com/cortega26/Monedario/main/src/infrastructure/economic/economic-parameters.snapshot.json";
// Días de antelación con que una excepción próxima a vencer se señala.
export const EXPIRY_WARNING_DAYS = 14;

function chileToday(now) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // YYYY-MM-DD
}

function daysBetween(isoFrom, isoTo) {
  return Math.round(
    (Date.parse(`${isoTo}T00:00:00Z`) - Date.parse(`${isoFrom}T00:00:00Z`)) /
      86_400_000
  );
}

/** Extrae las fechas "UF al DD/MM/YYYY" y "Dólar al DD/MM/YYYY" de la portada. */
export function parseSiteDates(html) {
  const grab = label => {
    const match = new RegExp(`${label} al (\\d{2})/(\\d{2})/(\\d{4})`).exec(
      html
    );
    return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
  };
  return { uf: grab("UF"), dolar: grab("D[óo]lar") };
}

/**
 * @returns {string[]} problemas; vacío si el sitio publicado está al día.
 */
export function evaluateLiveFreshness({ html, now = new Date() }) {
  const today = chileToday(now);
  const dates = parseSiteDates(html);
  const problems = [];
  for (const [key, label, max] of [
    ["uf", "UF", UF_MAX_LAG_DAYS],
    ["dolar", "Dólar", DOLAR_MAX_LAG_DAYS],
  ]) {
    const shown = dates[key];
    if (!shown) {
      problems.push(
        `No se pudo leer la fecha de ${label} en la portada publicada (cambió el marcado o el sitio no responde).`
      );
      continue;
    }
    const lag = daysBetween(shown, today);
    if (lag > max) {
      problems.push(
        `El sitio publicado muestra ${label} al ${shown}, ${lag} día(s) detrás de hoy (${today}); el máximo tolerado es ${max}. El último deploy de producción probablemente falló.`
      );
    }
  }
  return problems;
}

/**
 * Heartbeat del Worker de snapshot: el archivo de `main` debe haberse
 * refrescado dentro de SNAPSHOT_MAX_AGE_HOURS. Detecta un Worker caído aunque
 * la portada todavía muestre fechas aceptables.
 * @returns {string[]} problemas; vacío si el snapshot está fresco.
 */
export function evaluateSnapshotHeartbeat({ snapshot, now = new Date() }) {
  const capturedAt = snapshot?.capturedAt;
  const ts = Date.parse(capturedAt ?? "");
  if (Number.isNaN(ts)) {
    return [
      "El snapshot económico de main no tiene un capturedAt válido; no se puede verificar el heartbeat del Worker.",
    ];
  }
  const ageHours = (now.getTime() - ts) / 3_600_000;
  if (ageHours > SNAPSHOT_MAX_AGE_HOURS) {
    return [
      `El snapshot económico no se refresca desde ${capturedAt} (${ageHours.toFixed(1)} h, max ${SNAPSHOT_MAX_AGE_HOURS} h); el Worker de refresh está caído o fallando.`,
    ];
  }
  return [];
}

/**
 * Excepciones APPROVED que vencen en los próximos `withinDays` días (o ya
 * vencieron). Puro: lo usan el gate de URL-freeze y el health check.
 *
 * @param {{exceptions?: Array<{url: string, decision?: string, expiresAt?: string}>}} document
 * @param {Date} now
 * @param {number} withinDays
 * @returns {Array<{url: string, expiresAt: string, daysLeft: number}>}
 */
export function findExpiringExceptions(
  document,
  now = new Date(),
  withinDays = EXPIRY_WARNING_DAYS
) {
  const expiring = [];
  for (const entry of document?.exceptions ?? []) {
    if (entry.decision !== "APPROVED") continue;
    const expires = Date.parse(entry.expiresAt);
    if (!Number.isFinite(expires)) continue;
    const daysLeft = Math.floor((expires - now.getTime()) / 86_400_000);
    if (daysLeft <= withinDays) {
      expiring.push({ url: entry.url, expiresAt: entry.expiresAt, daysLeft });
    }
  }
  return expiring.sort((a, b) => a.daysLeft - b.daysLeft);
}

export function evaluateExceptionExpiry({ document, now = new Date() }) {
  return findExpiringExceptions(document, now, EXPIRY_WARNING_DAYS).map(e =>
    e.daysLeft < 0
      ? `La excepción de URL-freeze de ${e.url} venció el ${e.expiresAt}: bloquea el CI y puede bloquear el deploy. Renuévala o promueve la URL al inventario aprobado.`
      : `La excepción de URL-freeze de ${e.url} vence en ${e.daysLeft} día(s) (${e.expiresAt}). Renuévala o promueve la URL al inventario aprobado antes de esa fecha.`
  );
}
