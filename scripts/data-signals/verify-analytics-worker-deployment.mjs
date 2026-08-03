#!/usr/bin/env node
/**
 * verify-analytics-worker-deployment — verifica la paridad de despliegue del
 * worker `monedario-analytics-collector` contra la fuente de verdad del repo.
 *
 * Contexto (incidente W28): la fuente local tenía auth por header y el
 * calendario `57 7 * * MON`, mientras el worker vivo seguía en un build
 * antiguo con auth por query-string y trigger domingo. Ningún gate detectaba
 * el desfase porque nada verificaba la versión activa, el cron exacto, el
 * comportamiento de auth ni la frescura del artefacto R2. Este verifier
 * convierte cada una de esas propiedades en un chequeo explícito.
 *
 * Chequeos:
 *   1. Versión activa: lista deployments vía Cloudflare API y reporta
 *      deployment/version id y created_on. Con `--deployed-not-before`
 *      falla si el despliegue activo es anterior a ese instante.
 *   2. Cron exacto: `GET /schedules` debe devolver exactamente
 *      `["57 7 * * MON"]`. Polling acotado (por defecto 15 min, intervalos
 *      de 20 s — nunca más de 60 s) para la propagación del trigger.
 *   3. Rechazo de auth por query-string: `GET export?week=...&secret=...`
 *      SIN header Authorization debe responder 401.
 *   4. Smoke de export autenticado (solo con `--smoke-export`): header
 *      `Authorization: Bearer $EXPORT_SECRET` debe responder 200 con solo
 *      metadatos (week, window, rows, totalEvents) — nunca `data` ni `r2Key`.
 *   5. Frescura R2: GET del objeto `analytics-exports/{week}.json` con
 *      `If-Modified-Since` (semántica RFC 7232). 200 = re-escrito después del
 *      instante esperado (cron de la semana o inicio del smoke); 304 = objeto
 *      viejo; 404 = ausente. Solo metadatos: el body nunca se lee ni se loguea.
 *
 * Seguridad:
 *   - Los secretos van SOLO por header. Nunca se imprimen, persisten o pasan
 *     credenciales en URLs.
 *   - Se redactan tokens, secretos, account IDs y bodies de respuesta; las
 *     URLs se reportan como plantillas sin valores.
 *   - El chequeo 3 usa un señuelo constante, no una credencial real.
 *
 * Uso:
 *   node scripts/data-signals/verify-analytics-worker-deployment.mjs [options]
 *
 * Options:
 *   --week=YYYY-Www          Semana para el smoke y el chequeo R2 (default: semana completa anterior)
 *   --smoke-export           Ejecutar el smoke de export autenticado (re-escribe el artefacto R2 de la semana)
 *   --deployed-not-before=ISO  Falla si el despliegue activo es anterior a este instante (formato ISO 8601 UTC)
 *   --max-wait-minutes=N     Polling acotado para propagación del cron (default 15)
 *   --json                   Salida JSON a stdout (para CI)
 *   --help, -h               Muestra este mensaje
 *
 * Required env:
 *   CLOUDFLARE_API_TOKEN     Token con Workers Scripts:Read y Workers R2 Storage:Read
 *   CLOUDFLARE_ACCOUNT_ID    Account ID de Cloudflare
 *
 * Optional env:
 *   EXPORT_SECRET            Secret del worker (solo para `--smoke-export`)
 *   ANALYTICS_EXPORT_URL     Endpoint de export (default https://monedario.cl/api/analytics/export)
 *
 * Ver docs/operations/runbooks/analytics-worker-deployment.md y
 * docs/adr/ADR-20260716-analytics-worker-deployment-parity.md.
 */

import { fileURLToPath } from "node:url";
import { isoWeekToDateRange, previousCompleteISOWeek } from "./gsc-utils.mjs";

const CF_API = "https://api.cloudflare.com/client/v4";
export const WORKER_NAME = "monedario-analytics-collector";
export const R2_BUCKET = "monedario-analytics-exports";
export const DEFAULT_EXPORT_URL = "https://monedario.cl/api/analytics/export";
export const EXPECTED_CRONS = ["57 7 * * MON"];
export const POLL_INTERVAL_MS = 20_000;
export const MAX_WAIT_MS = 15 * 60_000;
export const VERSION_SLACK_MS = 15 * 60_000;
export const QUERY_STRING_DECOY = "query-string-decoy-not-a-credential";

// ── Helpers puros ────────────────────────────────────────────────────────────

/**
 * Instante (Date) en que el cron de la semana `week` debió ejecutar el export:
 * el lunes 07:57 UTC siguiente al domingo final de la semana ISO.
 */
export function exportRunAtForWeek(week) {
  const range = isoWeekToDateRange(week);
  const sunday = Date.parse(`${range.to}T00:00:00Z`);
  return new Date(
    sunday + 24 * 60 * 60 * 1000 + (7 * 60 + 57) * 60 * 1000,
  );
}

/** Toma el deployment activo (primero de la lista) y su version_id. */
export function activeDeployment(deployments) {
  const latest = Array.isArray(deployments) ? deployments[0] : undefined;
  if (!latest) {
    return null;
  }
  const version = (latest.versions ?? []).find(
    (entry) => typeof entry.percentage === "number" && entry.percentage > 0,
  );
  return {
    deploymentId: latest.id ?? null,
    versionId: version?.version_id ?? null,
    createdOn: latest.created_on ?? null,
  };
}

function parseCronSet(schedules) {
  return (schedules ?? [])
    .map((entry) => entry?.cron)
    .filter((cron) => typeof cron === "string")
    .sort();
}

function buildErrorUrlPath(pathTemplate) {
  // Nunca loguear el account ID ni query strings; solo la plantilla de ruta.
  return `${CF_API}/accounts/{accountId}${pathTemplate}`;
}

// ── Chequeos ─────────────────────────────────────────────────────────────────

async function apiGet(deps, accountId, token, pathTemplate) {
  const { fetch, log } = deps;
  const url = `${CF_API}/accounts/${accountId}${pathTemplate}`;
  log("debug", `GET ${buildErrorUrlPath(pathTemplate)}`);
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `HTTP ${response.status} en ${buildErrorUrlPath(pathTemplate)}: ${detail.slice(0, 300)}`,
    );
  }
  return response.json();
}

/**
 * Chequeo 1: versión activa.
 * Con `deployedNotBefore` (Date), falla si la versión activa es anterior a
 * ese instante menos una tolerancia de reloj constante.
 */
export async function checkActiveVersion(deps, accountId, token, deployedNotBefore) {
  const { log } = deps;
  const data = await apiGet(
    deps,
    accountId,
    token,
    `/workers/scripts/${WORKER_NAME}/deployments`,
  );
  const active = activeDeployment(data?.result?.deployments);
  if (!active || !active.versionId) {
    return {
      ok: false,
      check: "version-activa",
      detail: "no hay deployment activo con version_id",
    };
  }

  let ok = true;
  let detail = `deployment=${active.deploymentId} version=${active.versionId} created_on=${active.createdOn}`;
  if (deployedNotBefore) {
    const created = Date.parse(active.createdOn);
    if (!Number.isFinite(created)) {
      ok = false;
      detail += " — created_on no parseable";
    } else if (created < deployedNotBefore.getTime() - VERSION_SLACK_MS) {
      ok = false;
      detail += ` — STALE: creado antes de deployed-not-before=${deployedNotBefore.toISOString()} (tolerancia ${VERSION_SLACK_MS / 60000} min)`;
    } else {
      detail += ` — ok: posterior a deployed-not-before=${deployedNotBefore.toISOString()}`;
    }
  } else {
    detail += " — sin deployed-not-before; solo reporte";
  }
  log("debug", detail);
  return { ok, check: "version-activa", detail };
}

/**
 * Chequeo 2: cron exacto, con polling acotado.
 * Espera hasta `maxWaitMs` (intervalos de a lo más 60 s) a que
 * `GET /schedules` devuelva exactamente EXPECTED_CRONS.
 */
export async function checkExactSchedule(deps, accountId, token, options = {}) {
  const { log, now, sleep } = deps;
  const maxWaitMs = options.maxWaitMs ?? MAX_WAIT_MS;
  const pollIntervalMs = Math.min(options.pollIntervalMs ?? POLL_INTERVAL_MS, 60_000);
  const startedAt = now().getTime();
  // Tope determinista de intentos: la terminación no depende solo del reloj
  // (los tests inyectan un now congelado).
  const maxAttempts = Math.max(1, Math.ceil(maxWaitMs / pollIntervalMs));
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts += 1;
    const data = await apiGet(
      deps,
      accountId,
      token,
      `/workers/scripts/${WORKER_NAME}/schedules`,
    );
    const crons = parseCronSet(data?.result?.schedules);
    if (JSON.stringify(crons) === JSON.stringify([...EXPECTED_CRONS].sort())) {
      return {
        ok: true,
        check: "cron-exacto",
        detail: `crons=${JSON.stringify(crons)} en ${attempts} intento(s)`,
      };
    }

    const elapsed = now().getTime() - startedAt;
    if (elapsed + pollIntervalMs > maxWaitMs || attempts >= maxAttempts) {
      return {
        ok: false,
        check: "cron-exacto",
        detail: `crons=${JSON.stringify(crons)} ≠ esperado ${JSON.stringify(EXPECTED_CRONS)} tras ${Math.round(maxWaitMs / 60000)} min (${attempts} intentos)`,
      };
    }
    log("debug", `crons=${JSON.stringify(crons)} — reintento en ${Math.round(pollIntervalMs / 1000)} s`);
    await sleep(pollIntervalMs);
  }

  return {
    ok: false,
    check: "cron-exacto",
    detail: `crons no coinciden tras ${maxAttempts} intentos (${Math.round(maxWaitMs / 60000)} min)`,
  };
}

/**
 * Chequeo 3: el endpoint manual rechaza credenciales en query-string.
 * Envía el señuelo sin header; el worker debe responder 401.
 */
export async function checkQueryStringRejected(deps, exportUrl, week) {
  const { fetch, log } = deps;
  const url = `${exportUrl}?week=${encodeURIComponent(week)}&secret=${QUERY_STRING_DECOY}`;
  log("debug", `GET ${exportUrl}?week={week}&secret={decoy} (sin header)`);
  const response = await fetch(url);
  const body = await response.text().catch(() => "");
  const ok = response.status === 401;
  return {
    ok,
    check: "auth-rechaza-query-string",
    detail: ok
      ? `query-string sin header → HTTP ${response.status} (esperado 401)`
      : `query-string sin header → HTTP ${response.status} (esperado 401); body: ${body.slice(0, 200)}`,
  };
}

/**
 * Chequeo 4: smoke de export autenticado por header.
 * El worker debe responder 200 con solo metadatos (sin data ni r2Key).
 * El body no se loguea nunca.
 */
export async function checkAuthenticatedExport(deps, exportUrl, week, secret) {
  const { fetch, log } = deps;
  log("debug", `GET ${exportUrl}?week={week} con Authorization: Bearer {redactado}`);
  const response = await fetch(exportUrl + `?week=${encodeURIComponent(week)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });

  const checks = { status: response.status === 200 };
  let body = null;
  if (response.status !== 200) {
    const text = await response.text().catch(() => "");
    return {
      ok: false,
      check: "smoke-export-autenticado",
      detail: `HTTP ${response.status} (esperado 200); body: ${text.slice(0, 200)}`,
    };
  }

  try {
    body = await response.json();
  } catch (error) {
    return {
      ok: false,
      check: "smoke-export-autenticado",
      detail: `HTTP 200 pero body no es JSON: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  const problems = [];
  if (body.week !== week) problems.push(`week=${body.week} (esperado ${week})`);
  if (!body.window?.from || !body.window?.to) problems.push("window.from/to ausentes");
  if (!Number.isFinite(body.rows)) problems.push("rows no numérico");
  if (!Number.isFinite(body.totalEvents)) problems.push("totalEvents no numérico");
  if ("data" in body) problems.push("respuesta expone data cruda");
  if ("r2Key" in body) problems.push("respuesta expone r2Key");

  return {
    ok: problems.length === 0 && checks.status,
    check: "smoke-export-autenticado",
    detail: problems.length === 0
      ? `HTTP 200; week=${body.week} rows=${body.rows} totalEvents=${body.totalEvents} (solo metadatos)`
      : problems.join("; "),
  };
}

/**
 * Chequeo 5: el artefacto R2 de la semana existe y está fresco, usando
 * `If-Modified-Since` (RFC 7232) para evitar descargar el contenido.
 *
 *  - 200 → el objeto se escribió después del instante de referencia.
 *  - 304 → existe pero es anterior al instante de referencia (stale).
 *  - 404 → no existe.
 *
 * `referenceTime`: con smoke, el inicio del smoke (prueba que el export
 * autenticado escribió R2). Sin smoke, la hora del cron de la semana
 * (`exportRunAtForWeek`); si ese instante aún no llegó, el chequeo queda
 * "pendiente" (no es fallo).
 */
export async function checkR2Freshness(deps, accountId, token, week, referenceTime, now) {
  const { fetch, log } = deps;
  const objectKey = `analytics-exports/${week}.json`;
  const urlPath = `/r2/buckets/${R2_BUCKET}/objects/${objectKey}`;
  const url = `${CF_API}/accounts/${accountId}${urlPath}`;

  if (referenceTime.getTime() > now().getTime()) {
    return {
      ok: true,
      check: "r2-frescura",
      detail: `pendiente: instante esperado ${referenceTime.toISOString()} aún no llega (${now().toISOString()})`,
    };
  }

  log("debug", `GET ${CF_API}/accounts/{accountId}/r2/buckets/{bucket}/objects/{key} con If-Modified-Since`);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "If-Modified-Since": referenceTime.toUTCString(),
    },
  });

  // El body nunca se lee ni se loguea.
  await response.body?.cancel().catch(() => {});

  const lastModified = response.headers.get("last-modified") ?? "n/a";
  const contentLength = response.headers.get("content-length") ?? "n/a";

  if (response.status === 404) {
    return {
      ok: false,
      check: "r2-frescura",
      detail: `objeto ${objectKey} ausente (HTTP 404)`,
    };
  }
  if (response.status === 304) {
    return {
      ok: false,
      check: "r2-frescura",
      detail: `objeto ${objectKey} existe pero NO fue modificado desde ${referenceTime.toISOString()} (HTTP 304 = stale); last-modified=${lastModified}`,
    };
  }
  if (response.status === 200) {
    return {
      ok: true,
      check: "r2-frescura",
      detail: `objeto ${objectKey} re-escrito después de ${referenceTime.toISOString()} (HTTP 200); last-modified=${lastModified} content-length=${contentLength}`,
    };
  }
  return {
    ok: false,
    check: "r2-frescura",
    detail: `objeto ${objectKey} → HTTP ${response.status} (esperado 200/304/404)`,
  };
}

// ── Orquestación ─────────────────────────────────────────────────────────────

/**
 * Ejecuta un chequeo convirtiendo cualquier error (red, HTTP, parseo) en un
 * resultado fallido con mensaje saneado, para que un solo chequeo roto no
 * aborte la verificación completa.
 */
async function runCheck(deps, label, fn) {
  try {
    return await fn();
  } catch (error) {
    deps.log("error", `${label} lanzó excepción: ${error instanceof Error ? error.message : String(error)}`);
    return {
      ok: false,
      check: label,
      detail: `error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Ejecuta los cinco chequeos con dependencias inyectables (fetch/now/sleep/log)
 * para que los tests cubran estados actuales, stale, no autorizados y de
 * propagación sin red. Devuelve `{ ok, results }`.
 */
export async function verifyDeploymentParity(deps, config) {
  const { now } = deps;
  const results = [];
  const deployedNotBefore =
    typeof config.deployedNotBefore === "string" && config.deployedNotBefore
      ? new Date(config.deployedNotBefore)
      : null;

  results.push(
    await runCheck(deps, "version-activa", () =>
      checkActiveVersion(deps, config.accountId, config.token, deployedNotBefore),
    ),
  );

  results.push(
    await runCheck(deps, "cron-exacto", () =>
      checkExactSchedule(deps, config.accountId, config.token, {
        maxWaitMs: config.maxWaitMs,
        pollIntervalMs: config.pollIntervalMs,
      }),
    ),
  );

  results.push(
    await runCheck(deps, "auth-rechaza-query-string", () =>
      checkQueryStringRejected(deps, config.exportUrl, config.week),
    ),
  );

  if (config.smokeExport) {
    if (!config.exportSecret) {
      results.push({
        ok: false,
        check: "smoke-export-autenticado",
        detail: "EXPORT_SECRET requerido para --smoke-export",
      });
    } else {
      const smokeStartedAt = now();
      results.push(
        await runCheck(deps, "smoke-export-autenticado", () =>
          checkAuthenticatedExport(
            deps,
            config.exportUrl,
            config.week,
            config.exportSecret,
          ),
        ),
      );
      results.push(
        await runCheck(deps, "r2-frescura", () =>
          checkR2Freshness(
            deps,
            config.accountId,
            config.token,
            config.week,
            smokeStartedAt,
            now,
          ),
        ),
      );
    }
  } else {
    results.push(
      await runCheck(deps, "r2-frescura", () =>
        checkR2Freshness(
          deps,
          config.accountId,
          config.token,
          config.week,
          exportRunAtForWeek(config.week),
          now,
        ),
      ),
    );
  }

  return {
    ok: results.every((result) => result.ok),
    results,
  };
}

// ── CLI ──────────────────────────────────────────────────────────────────────

export function createDefaultDeps() {
  return {
    fetch: globalThis.fetch,
    now: () => new Date(),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    log: (level, message) => console.error(`[verify-analytics-worker-deployment] ${level}: ${message}`),
  };
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

function printUsage(code = 0) {
  console.log(`
Usage:
  node scripts/data-signals/verify-analytics-worker-deployment.mjs [options]

Options:
  --week=YYYY-Www          Semana para el smoke y el chequeo R2 (default: semana completa anterior)
  --smoke-export           Ejecutar el smoke de export autenticado (re-escribe el artefacto R2 de la semana)
  --deployed-not-before=ISO  Falla si el despliegue activo es anterior a este instante (ISO 8601 UTC)
  --max-wait-minutes=N     Polling acotado para propagación del cron (default 15)
  --json                   Salida JSON a stdout (para CI)
  --help, -h               Muestra este mensaje

Required env:
  CLOUDFLARE_API_TOKEN     Token con Workers Scripts:Read y Workers R2 Storage:Read
  CLOUDFLARE_ACCOUNT_ID    Account ID de Cloudflare

Optional env:
  EXPORT_SECRET            Secret del worker (solo para --smoke-export)
  ANALYTICS_EXPORT_URL     Endpoint de export (default ${DEFAULT_EXPORT_URL})

Salida: exit 0 si todos los chequeos pasan (o quedan pendientes); exit 1 si
algún chequeo falla; exit 2 en error de uso o de configuración.
`);
  process.exit(code);
}

function parseArgs(argv) {
  const opts = {
    week: null,
    smokeExport: false,
    deployedNotBefore: null,
    maxWaitMs: MAX_WAIT_MS,
    json: false,
    help: false,
  };
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") { opts.help = true; continue; }
    if (arg === "--smoke-export") { opts.smokeExport = true; continue; }
    if (arg === "--json") { opts.json = true; continue; }
    if (arg.startsWith("--week=")) {
      const val = arg.slice("--week=".length);
      if (!/^\d{4}-W\d{2}$/.test(val)) {
        console.error(`[verify-analytics-worker-deployment] Formato de --week inválido: "${val}". Se espera YYYY-Www.`);
        process.exit(2);
      }
      opts.week = val;
      continue;
    }
    if (arg.startsWith("--deployed-not-before=")) {
      const val = arg.slice("--deployed-not-before=".length);
      if (!Number.isFinite(Date.parse(val))) {
        console.error(`[verify-analytics-worker-deployment] --deployed-not-before no es una fecha ISO válida: "${val}"`);
        process.exit(2);
      }
      opts.deployedNotBefore = val;
      continue;
    }
    if (arg.startsWith("--max-wait-minutes=")) {
      const val = Number(arg.slice("--max-wait-minutes=".length));
      if (!Number.isFinite(val) || val <= 0) {
        console.error(`[verify-analytics-worker-deployment] --max-wait-minutes debe ser un número positivo: "${arg}"`);
        process.exit(2);
      }
      opts.maxWaitMs = Math.min(val * 60_000, 15 * 60_000);
      continue;
    }
    console.error(`[verify-analytics-worker-deployment] Argumento desconocido: ${arg}`);
    process.exit(2);
  }
  return opts;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) printUsage(0);

  const deps = createDefaultDeps();
  const config = {
    accountId: getRequiredEnv("CLOUDFLARE_ACCOUNT_ID"),
    token: getRequiredEnv("CLOUDFLARE_API_TOKEN"),
    exportSecret: process.env.EXPORT_SECRET,
    exportUrl: process.env.ANALYTICS_EXPORT_URL || DEFAULT_EXPORT_URL,
    week: args.week ?? previousCompleteISOWeek(),
    smokeExport: args.smokeExport,
    deployedNotBefore: args.deployedNotBefore,
    maxWaitMs: args.maxWaitMs,
    pollIntervalMs: POLL_INTERVAL_MS,
  };

  const summary = await verifyDeploymentParity(deps, config);

  if (args.json) {
    process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
  } else {
    for (const result of summary.results) {
      console.log(`[verify-analytics-worker-deployment] ${result.ok ? "PASS" : "FAIL"} ${result.check}: ${result.detail}`);
    }
    console.log(
      `[verify-analytics-worker-deployment] ${summary.ok ? "PARIDAD OK" : "PARIDAD ROTA"} (week=${config.week})`,
    );
  }

  process.exit(summary.ok ? 0 : 1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(
      `[verify-analytics-worker-deployment] fatal: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(2);
  });
}
