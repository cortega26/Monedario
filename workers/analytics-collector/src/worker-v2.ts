import type { DurableObjectState, KVNamespace, R2Bucket } from "@cloudflare/workers-types";

import {
  aggregateWindow,
  ALLOWED_ORIGIN,
  buildExportArtifact,
  calendarDateInTimeZone,
  counterPrefixForExportWeek,
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

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body) + "\n", {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
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
  const schemaVersion = parseInt(env.SCHEMA_VERSION ?? "2", 10);
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
  if (!env.EXPORT_SECRET) {
    return jsonResponse({ error: "export_not_configured" }, 503);
  }

  const url = new URL(request.url);
  const authHeader = request.headers.get("Authorization");
  const providedSecret =
    authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : null;
  if (!providedSecret) return jsonResponse({ error: "missing_secret" }, 401);
  if (!constantTimeEqual(providedSecret, env.EXPORT_SECRET)) {
    return jsonResponse({ error: "invalid_secret" }, 403);
  }

  const requestedWeek = url.searchParams.get("week");
  const week =
    requestedWeek ??
    previousCompleteISOWeekInTz(env.EXPORT_TIMEZONE ?? "America/Santiago");
  if (!/^\d{4}-W\d{2}$/.test(week)) {
    return jsonResponse({ error: "invalid_week" }, 400);
  }

  const ip =
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
    "unknown";
  if (!(await checkRateLimit(env.ANALYTICS_RATE_LIMITER, `export:${ip}`))) {
    return jsonResponse({ error: "rate_limited" }, 429);
  }

  try {
    const result = await runExportV2(env, week);
    return jsonResponse({
      week: result.week,
      window: result.window,
      rows: result.rows,
      totalEvents: result.totalEvents,
    });
  } catch (error) {
    console.error(
      "[analytics-export] manual export failed:",
      error instanceof Error ? error.message : String(error),
    );
    return jsonResponse({ error: "export_failed" }, 500);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/api/analytics/export") {
      return handleManualExport(request, env);
    }

    if (env.ANALYTICS_DISABLED === "1") {
      return new Response(null, { status: 503, headers: corsHeaders() });
    }
    if (request.method !== "POST") {
      return new Response(null, { status: 405, headers: corsHeaders() });
    }

    const origin = request.headers.get("Origin");
    if (origin && origin !== ALLOWED_ORIGIN) {
      return new Response(null, { status: 403, headers: corsHeaders() });
    }

    const contentType = request.headers.get("Content-Type");
    if (!contentType?.includes("application/json")) {
      return new Response(null, { status: 415, headers: corsHeaders() });
    }

    const contentLength = request.headers.get("Content-Length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return new Response(null, { status: 413, headers: corsHeaders() });
    }

    let body: unknown;
    const bounded = await readBoundedBodyText(request);
    if (!bounded.ok) {
      return new Response(null, {
        status: bounded.status,
        headers: corsHeaders(),
      });
    }
    try {
      body = JSON.parse(bounded.text);
    } catch {
      return new Response(null, { status: 400, headers: corsHeaders() });
    }

    const validation = validateEventPayload(body);
    if (!validation.valid || !validation.event || !validation.params) {
      return new Response(null, { status: 422, headers: corsHeaders() });
    }

    const ip =
      request.headers.get("CF-Connecting-IP") ??
      request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
      "unknown";
    if (!(await checkRateLimit(env.ANALYTICS_RATE_LIMITER, ip))) {
      return new Response(null, { status: 429, headers: corsHeaders() });
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
        headers: { ...corsHeaders(), "Retry-After": "30" },
      });
    }

    return new Response(null, { status: 202, headers: corsHeaders() });
  },

  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    const timeZone = env.EXPORT_TIMEZONE ?? "America/Santiago";
    const week = previousCompleteISOWeekInTz(timeZone);
    console.log(`[analytics-export] trigger=cron week=${week} tz=${timeZone}`);
    await runExportV2(env, week);
  },
};
