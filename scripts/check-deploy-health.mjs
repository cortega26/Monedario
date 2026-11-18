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
//   2. Heartbeat del Worker: capturedAt del snapshot de main no puede superar
//      SNAPSHOT_MAX_AGE_HOURS (detecta el refresh caído aunque la portada aún
//      muestre fechas aceptables).
//   3. Excepciones del URL-freeze vencidas o por vencer (14 días).
//
// Variables de entorno (para pruebas): DEPLOY_HEALTH_SITE_URL,
// DEPLOY_HEALTH_NOW (ISO).

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SNAPSHOT_URL,
  evaluateExceptionExpiry,
  evaluateLiveFreshness,
  evaluateSnapshotHeartbeat,
} from "./lib/deploy-health-evaluators.mjs";

export * from "./lib/deploy-health-evaluators.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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

  const snapshotUrl =
    process.env.DEPLOY_HEALTH_SNAPSHOT_URL || SNAPSHOT_URL;
  try {
    const res = await fetch(`${snapshotUrl}?deploy-health=${now.getTime()}`, {
      signal: AbortSignal.timeout(30_000),
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) {
      problems.push(
        `El snapshot económico de main respondió HTTP ${res.status}.`
      );
    } else {
      problems.push(
        ...evaluateSnapshotHeartbeat({ snapshot: await res.json(), now })
      );
    }
  } catch (error) {
    problems.push(
      `No se pudo consultar el snapshot económico de main: ${error instanceof Error ? error.message : String(error)}`
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
