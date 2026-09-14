import type { DurableObjectState, KVNamespace, R2Bucket } from "@cloudflare/workers-types";

import { ANALYTICS_SCHEMA_VERSION } from "../../../src/contracts/analytics-events";
import {
  aggregateWindow,
  ALLOWED_ORIGIN,
  buildExportArtifact,
  calendarDateInTimeZone,
  counterPrefixForExportWeek,
  dateToISOWeekUTC,
  isoWeekToDateRangeUTC,
  MAX_BODY_SIZE,
  parseCounterKey,
  previousCompleteISOWeekInTz,
  readBoundedBodyText,
  validateEventPayload,
  validateExportArtifact,
  type ExportRunSummary,
  type TelemetryCounter,
} from "./index";

const DO_NAME = "analytics-counters-v1";
const KV_EXPORT_READ_BATCH_SIZE = 50;
const INTERNAL_DO_ORIGIN = "https://analytics-counter.internal";

interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface CounterStub {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface CounterNamespace {
  idFromName(name: string): unknown;
  get(id: unknown): CounterStub;
}

export interface Env {
  // Legacy read-only store. New ingestion never writes to this namespace.
  ANALYTICS_TELEMETRY: KVNamespace;
  ANALYTICS_COUNTERS: CounterNamespace;
  ANALYTICS_RATE_LIMITER: RateLimitBinding;
  ANALYTICS_EXPORTS: R2Bucket;
  ANALYTICS_DISABLED?: string;
  SCHEMA_VERSION?: string;
  EXPORT_TIMEZONE?: string;
  COUNTER_KEY_CUTOVER_AT?: string;
  EXPORT_SECRET?: string;
  // Operative overrides for the compiled defaults in ./index. Wrangler vars
  // stay the source of truth for operators; invalid values fall back closed
  // to the constants (never fail open, never read unread vars).
  MAX_BODY_SIZE?: string;
  ALLOWED_ORIGIN?: string;
}

type DurableCounterRow = {
  date: string;
  event: string;
  slug: string;
  dimensions: string;
  count: number;
};

interface IncrementPayload {
  date: string;
  event: string;
  slug: string;
  dimensions: string;
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isIncrementPayload(value: unknown): value is IncrementPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.date === "string" &&
    isIsoDate(row.date) &&
    typeof row.event === "string" &&
    row.event.length > 0 &&
    row.event.length <= 80 &&
    typeof row.slug === "string" &&
    row.slug.length > 0 &&
    row.slug.length <= 80 &&
    typeof row.dimensions === "string" &&
    row.dimensions.length <= 1024
  );
}

/**
 * SQLite-backed Durable Object for atomic analytics counters.
 *
 * This intentionally uses the long-supported constructor/fetch Durable Object
 * shape rather than RPC so the module remains importable by the existing Node
 * unit-test suite without a runtime-only `cloudflare:workers` import.
 */
export class AnalyticsCounters {
  private readonly sql: DurableObjectState["storage"]["sql"];

  constructor(state: DurableObjectState) {
    this.sql = state.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS counters (
        date TEXT NOT NULL,
        event TEXT NOT NULL,
        slug TEXT NOT NULL,
        dimensions TEXT NOT NULL,
        count INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (date, event, slug, dimensions)
      );
    `);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      this.sql.exec("SELECT 1");
      return Response.json({ ok: true });
    }

    if (request.method === "POST" && url.pathname === "/increment") {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return new Response("invalid_json", { status: 400 });
      }
      if (!isIncrementPayload(body)) {
        return new Response("invalid_counter", { status: 422 });
      }

      this.sql.exec(
        `INSERT INTO counters (date, event, slug, dimensions, count)
         VALUES (?, ?, ?, ?, 1)
         ON CONFLICT(date, event, slug, dimensions)
         DO UPDATE SET count = count + 1`,
        body.date,
        body.event,
        body.slug,
        body.dimensions,
      );
      return new Response(null, { status: 204 });
    }

    if (request.method === "GET" && url.pathname === "/list") {
      const from = url.searchParams.get("from") ?? "";
      const to = url.searchParams.get("to") ?? "";
      if (!isIsoDate(from) || !isIsoDate(to) || from > to) {
        return new Response("invalid_window", { status: 400 });
      }

      const rows = this.sql
        .exec<DurableCounterRow>(
          `SELECT date, event, slug, dimensions, count
           FROM counters
           WHERE date >= ? AND date <= ?
           ORDER BY date, event, slug, dimensions`,
          from,
          to,
        )
        .toArray();
      return Response.json({ counters: rows });
    }

    return new Response("not_found", { status: 404 });
  }
}

/**
 * Resolves the max body size in bytes. Reads MAX_BODY_SIZE from env (so
 * wrangler.toml stays operative) with the compiled constant as fallback.
 * Invalid values (NaN, non-integer, <= 0) fall back closed to the constant.
 */
function resolveMaxBodySize(env: Env): number {
  const raw = env.MAX_BODY_SIZE;
  if (raw === undefined) return MAX_BODY_SIZE;
  const parsed = parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return MAX_BODY_SIZE;
  return parsed;
}

/**
 * Resolves the allowed CORS origin. Reads ALLOWED_ORIGIN from env with the
 * compiled constant as fallback. Must parse as an https origin with no path;
 * anything else falls back closed to the constant.
 */
function resolveAllowedOrigin(env: Env): string {
  const raw = env.ALLOWED_ORIGIN;
  if (!raw) return ALLOWED_ORIGIN;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.origin !== raw) return ALLOWED_ORIGIN;
    return url.origin;
  } catch {
    return ALLOWED_ORIGIN;
  }
}

/**
 * Fail-closed schema version. Only 1 (historical) and the current taxonomy
 * version are accepted; anything else (typo, NaN, out-of-range) throws before
 * any KV/DO listing so a misconfiguration can never silently select the
 * legacy v1 branch.
 */
function resolveSchemaVersion(env: Env): number {
  const raw = env.SCHEMA_VERSION ?? String(ANALYTICS_SCHEMA_VERSION);
  const parsed = parseInt(raw, 10);
  if (
    !Number.isInteger(parsed) ||
    ![1, ANALYTICS_SCHEMA_VERSION].includes(parsed)
  ) {
    throw new Error(`Invalid SCHEMA_VERSION: "${raw}"`);
  }
  return parsed;
}

/**
 * Strict export-week validation. Accepts only YYYY-Www with week 01–53 whose
 * Monday round-trips to the claimed ISO week (rejects W00/W54/W99 and W53 in
 * years with only 52 weeks before any R2 write).
 */
function isValidExportWeek(week: string): boolean {
  const match = /^(\d{4})-W(\d{2})$/.exec(week);
  if (!match) return false;
  const weekNum = parseInt(match[2], 10);
  if (!Number.isInteger(weekNum) || weekNum < 1 || weekNum > 53) return false;
  let window: { from: string; to: string };
  try {
    window = isoWeekToDateRangeUTC(week);
  } catch {
    return false;
  }
  const monday = new Date(`${window.from}T00:00:00Z`);
  if (Number.isNaN(monday.getTime())) return false;
  return dateToISOWeekUTC(monday) === week;
}

/**
 * Rate-limit identity. Only CF-Connecting-IP is trusted; when absent the
 * caller falls into a single "unknown" bucket. Proxy-forwarded headers (XFF)
 * are never trusted behind Cloudflare — a client can forge them to rotate
 * identity past the limiter.
 */
function rateLimitIdentity(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "unknown";
}

function corsHeaders(allowedOrigin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(
  body: unknown,
  status = 200,
  allowedOrigin: string = ALLOWED_ORIGIN,
): Response {
  return new Response(JSON.stringify(body) + "\n", {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(allowedOrigin),
    },
  });
}

function constantTimeEqual(a: string, b: string): boolean {
  const maxLength = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < maxLength; i += 1) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function getCounterStub(env: Env): CounterStub {
  const id = env.ANALYTICS_COUNTERS.idFromName(DO_NAME);
  return env.ANALYTICS_COUNTERS.get(id);
}

async function checkRateLimit(
  limiter: RateLimitBinding | undefined,
  actorKey: string,
): Promise<boolean> {
  try {
    if (!limiter) throw new Error("ANALYTICS_RATE_LIMITER binding missing");
    const result = await limiter.limit({ key: actorKey });
    return result.success;
  } catch (error) {
    // Analytics must not become an availability dependency for the website.
    // Fail open, but never expose the actor key/IP in logs.
    console.error(
      "[analytics-collector] native rate-limit check failed:",
      error instanceof Error ? error.message : String(error),
    );
    return true;
  }
}

function durableCounterFromEvent(
  event: string,
  params: Record<string, string | number | boolean>,
  timeZone: string,
): IncrementPayload {
  const slug = String(params.calculator_id ?? params.page_type ?? "unknown");
  const dimensions = Object.entries(params)
    .filter(([key]) => key !== "calculator_id" && key !== "page_type")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => String(value))
    .join(":");

  return {
    date: calendarDateInTimeZone(new Date(), timeZone),
    event,
    slug,
    dimensions,
  };
}

async function ingestEvent(
  env: Env,
  event: string,
  params: Record<string, string | number | boolean>,
): Promise<void> {
  const timeZone = env.EXPORT_TIMEZONE ?? "America/Santiago";
  const counter = durableCounterFromEvent(event, params, timeZone);
  const response = await getCounterStub(env).fetch(`${INTERNAL_DO_ORIGIN}/increment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(counter),
  });

  if (!response.ok) {
    throw new Error(`Durable counter increment failed with HTTP ${response.status}`);
  }
}

async function listDurableCounters(
  env: Env,
  window: { from: string; to: string },
): Promise<TelemetryCounter[]> {
  const url = new URL(`${INTERNAL_DO_ORIGIN}/list`);
  url.searchParams.set("from", window.from);
  url.searchParams.set("to", window.to);
  const response = await getCounterStub(env).fetch(url);
  if (!response.ok) {
    throw new Error(`Durable counter export failed with HTTP ${response.status}`);
  }
  const body = (await response.json()) as { counters?: TelemetryCounter[] };
  if (!Array.isArray(body.counters)) {
    throw new Error("Durable counter export returned an invalid payload");
  }
  return body.counters;
}

async function listLegacyKvCounters(
  kv: KVNamespace,
  counterPrefix: string,
  window: { from: string; to: string },
): Promise<TelemetryCounter[]> {
  const counters: TelemetryCounter[] = [];
  const dates: string[] = [];
  const start = new Date(`${window.from}T00:00:00Z`);
  const end = new Date(`${window.to}T00:00:00Z`);
  for (
    let current = start;
    current <= end;
    current = new Date(current.getTime() + 86_400_000)
  ) {
    dates.push(current.toISOString().slice(0, 10));
  }

  for (const date of dates) {
    let cursor: string | undefined;
    const prefix = `${counterPrefix}:${date}:`;
    do {
      const result = await kv.list({ prefix, cursor });
      for (let i = 0; i < result.keys.length; i += KV_EXPORT_READ_BATCH_SIZE) {
        const batch = result.keys.slice(i, i + KV_EXPORT_READ_BATCH_SIZE);
        const parsed = await Promise.all(
          batch.map(async (key) => {
            const count = await kv.get(key.name);
            return count === null
              ? null
              : parseCounterKey(key.name, parseInt(count, 10) || 0);
          }),
        );
        for (const row of parsed) if (row) counters.push(row);
      }
      cursor = result.list_complete ? undefined : result.cursor;
    } while (cursor);
  }
  return counters;
}

export async function runExportV2(
  env: Env,
  week: string,
): Promise<ExportRunSummary> {
  if (!isValidExportWeek(week)) {
    throw new Error(`Invalid export week: "${week}"`);
  }
  const schemaVersion = resolveSchemaVersion(env);
  const timeZone = env.EXPORT_TIMEZONE ?? "America/Santiago";
  const window = isoWeekToDateRangeUTC(week);
  const legacyPrefix = counterPrefixForExportWeek(
    week,
    timeZone,
    env.COUNTER_KEY_CUTOVER_AT,
  );

  const [legacyCounters, durableCounters] = await Promise.all([
    listLegacyKvCounters(env.ANALYTICS_TELEMETRY, legacyPrefix, window),
    listDurableCounters(env, window),
  ]);

  // No double-write exists: legacy KV is read-only after this migration and
  // every new event is written only to the Durable Object. Summing the two
  // sources therefore preserves a mid-week cutover without overlap.
  const counters = [...legacyCounters, ...durableCounters];
  const aggregated = aggregateWindow(
    counters,
    window.from,
    window.to,
    schemaVersion,
  );
  const artifact = buildExportArtifact(week, window, aggregated, schemaVersion);
  const validation = validateExportArtifact(artifact);
  if (!validation.valid) {
    throw new Error(`Export artifact validation failed: ${validation.errors.join("; ")}`);
  }

  const key = `analytics-exports/${week}.json`;
  const body = JSON.stringify(artifact, null, 2) + "\n";
  await env.ANALYTICS_EXPORTS.put(key, body, {
    httpMetadata: { contentType: "application/json" },
  });

  const totalEvents = aggregated.reduce((sum, row) => sum + row.count, 0);
  console.log(
    `[analytics-export] week=${week} legacy=${legacyCounters.length} durable=${durableCounters.length} aggregated=${aggregated.length} total=${totalEvents}`,
  );

  return {
    week,
    window,
    rows: aggregated.length,
    totalEvents,
    r2Key: key,
  };
}

async function handleManualExport(request: Request, env: Env): Promise<Response> {
  const allowedOrigin = resolveAllowedOrigin(env);
  if (!env.EXPORT_SECRET) {
    return jsonResponse({ error: "export_not_configured" }, 503, allowedOrigin);
  }

  const url = new URL(request.url);
  const authHeader = request.headers.get("Authorization");
  const providedSecret =
    authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : null;
  if (!providedSecret)
    return jsonResponse({ error: "missing_secret" }, 401, allowedOrigin);
  if (!constantTimeEqual(providedSecret, env.EXPORT_SECRET)) {
    return jsonResponse({ error: "invalid_secret" }, 403, allowedOrigin);
  }

  const requestedWeek = url.searchParams.get("week");
  const week =
    requestedWeek ??
    previousCompleteISOWeekInTz(env.EXPORT_TIMEZONE ?? "America/Santiago");
  if (!isValidExportWeek(week)) {
    return jsonResponse({ error: "invalid_week" }, 400, allowedOrigin);
  }

  const ip = rateLimitIdentity(request);
  if (!(await checkRateLimit(env.ANALYTICS_RATE_LIMITER, `export:${ip}`))) {
    return jsonResponse({ error: "rate_limited" }, 429, allowedOrigin);
  }

  try {
    const result = await runExportV2(env, week);
    return jsonResponse(
      {
        week: result.week,
        window: result.window,
        rows: result.rows,
        totalEvents: result.totalEvents,
      },
      200,
      allowedOrigin,
    );
  } catch (error) {
    console.error(
      "[analytics-export] manual export failed:",
      error instanceof Error ? error.message : String(error),
    );
    return jsonResponse({ error: "export_failed" }, 500, allowedOrigin);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const maxBodySize = resolveMaxBodySize(env);
    const allowedOrigin = resolveAllowedOrigin(env);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(allowedOrigin) });
    }

    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/api/analytics/export") {
      return handleManualExport(request, env);
    }

    if (env.ANALYTICS_DISABLED === "1") {
      return new Response(null, { status: 503, headers: corsHeaders(allowedOrigin) });
    }
    if (request.method !== "POST") {
      return new Response(null, { status: 405, headers: corsHeaders(allowedOrigin) });
    }

    const origin = request.headers.get("Origin");
    if (origin && origin !== allowedOrigin) {
      return new Response(null, { status: 403, headers: corsHeaders(allowedOrigin) });
    }

    const contentType = request.headers.get("Content-Type");
    if (!contentType?.includes("application/json")) {
      return new Response(null, { status: 415, headers: corsHeaders(allowedOrigin) });
    }

    const contentLength = request.headers.get("Content-Length");
    if (contentLength && parseInt(contentLength, 10) > maxBodySize) {
      return new Response(null, { status: 413, headers: corsHeaders(allowedOrigin) });
    }

    let body: unknown;
    const bounded = await readBoundedBodyText(request);
    if (!bounded.ok) {
      return new Response(null, {
        status: bounded.status,
        headers: corsHeaders(allowedOrigin),
      });
    }
    // Enforce an operator-lowered MAX_BODY_SIZE override on the retained
    // bytes. The shared bounded reader caps at the compiled constant, so
    // this check only fires when the env override is stricter (fail-closed).
    if (new TextEncoder().encode(bounded.text).byteLength > maxBodySize) {
      return new Response(null, { status: 413, headers: corsHeaders(allowedOrigin) });
    }
    try {
      body = JSON.parse(bounded.text);
    } catch {
      return new Response(null, { status: 400, headers: corsHeaders(allowedOrigin) });
    }

    const validation = validateEventPayload(body);
    if (!validation.valid || !validation.event || !validation.params) {
      return new Response(null, { status: 422, headers: corsHeaders(allowedOrigin) });
    }

    const ip = rateLimitIdentity(request);
    if (!(await checkRateLimit(env.ANALYTICS_RATE_LIMITER, ip))) {
      return new Response(null, { status: 429, headers: corsHeaders(allowedOrigin) });
    }

    try {
      await ingestEvent(env, validation.event, validation.params);
    } catch (error) {
      console.error(
        "[analytics-collector] Durable counter write failed:",
        error instanceof Error ? error.message : String(error),
      );
      return new Response(null, {
        status: 503,
        headers: { ...corsHeaders(allowedOrigin), "Retry-After": "30" },
      });
    }

    return new Response(null, { status: 202, headers: corsHeaders(allowedOrigin) });
  },

  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    const timeZone = env.EXPORT_TIMEZONE ?? "America/Santiago";
    const week = previousCompleteISOWeekInTz(timeZone);
    console.log(`[analytics-export] trigger=cron week=${week} tz=${timeZone}`);
    await runExportV2(env, week);
  },
};
