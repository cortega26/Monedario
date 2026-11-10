#!/usr/bin/env node
// check:deploy-health
//
// Detecta, desde fuera, que el sitio publicado dejó de actualizarse. El
// 2026-11-02 venció una excepción del URL-freeze y TODOS los builds de
// producción fallaron durante 8 días sin que nada lo señalara: el snapshot del
// repositorio estaba fresco, pero el sitio en vivo mostraba UF y dólar viejos.
//
// Controles (cualquier problema => exit 1 y un resumen en Markdown por stdout):
//   1. Sitio en vivo: la fecha de "UF al …" y "Dólar al …" de la portada no
//      puede rezagarse más de los umbrales respecto de hoy (hora de Santiago).
//   2. Excepciones del URL-freeze vencidas o por vencer (14 días).
//
// Variables de entorno (para pruebas): DEPLOY_HEALTH_SITE_URL,
// DEPLOY_HEALTH_NOW (ISO).

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  EXPIRY_WARNING_DAYS,
  findExpiringExceptions,
} from "./check-indexable-url-freeze.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// La UF se publica con días de anticipación, así que su fecha mostrada debería
// ser >= hoy; 3 días de holgura cubren cualquier demora razonable de deploy.
export const UF_MAX_LAG_DAYS = 3;
// El dólar no tiene valor en fines de semana ni feriados (puentes de 4 días).
export const DOLAR_MAX_LAG_DAYS = 6;

function chileToday(now) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return parts; // YYYY-MM-DD
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

export function evaluateExceptionExpiry({ document, now = new Date() }) {
  return findExpiringExceptions(document, now, EXPIRY_WARNING_DAYS).map(e =>
    e.daysLeft < 0
      ? `La excepción de URL-freeze de ${e.url} venció el ${e.expiresAt}: bloquea el CI y puede bloquear el deploy. Renuévala o promueve la URL al inventario aprobado.`
      : `La excepción de URL-freeze de ${e.url} vence en ${e.daysLeft} día(s) (${e.expiresAt}). Renuévala o promueve la URL al inventario aprobado antes de esa fecha.`
  );
}

async function main() {
  const now = process.env.DEPLOY_HEALTH_NOW
    ? new Date(process.env.DEPLOY_HEALTH_NOW)
    : new Date();
  const site = process.env.DEPLOY_HEALTH_SITE_URL || "https://monedario.cl/";

  const problems = [];
  try {
    const res = await fetch(`${site}?deploy-health=${now.getTime()}`, {
      signal: AbortSignal.timeout(30_000),
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) {
      problems.push(`La portada publicada respondió HTTP ${res.status}.`);
    } else {
      problems.push(
        ...evaluateLiveFreshness({ html: await res.text(), now })
      );
    }
  } catch (error) {
    problems.push(
      `No se pudo consultar ${site}: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  const document = JSON.parse(
    readFileSync(
      path.join(ROOT, "docs/governance/url-freeze-exceptions.json"),
      "utf8"
    )
  );
  problems.push(...evaluateExceptionExpiry({ document, now }));

  if (problems.length === 0) {
    console.log("[deploy-health] OK: sitio al día y sin excepciones por vencer.");
    return;
  }
  for (const problem of problems) console.log(`- ${problem}`);
  process.exit(1);
}

if (
  process.argv[1] &&
  import.meta.url === new URL(`file://${path.resolve(process.argv[1])}`).href
) {
  main();
}
