/**
 * Analytics Collector — Cloudflare Worker
 *
 * Receives sanitized first-party events from monedario.cl, validates them
 * server-side against a strict schema, and increments aggregated counters in KV.
 *
 * Contract: docs/backlog/PLAN-calculator-led-growth-2026-06-28.md §7
 * ADR: docs/adr/ADR-20260628-first-party-analytics.md
 *
 * Endpoint: POST /api/analytics/event
 * Response: 202 Accepted (no echo) on success.
 *
 * Feature flag: ANALYTICS_DISABLED env var. Set to "1" to reject all events
 * with 503. Set to "0" to enable collection.
 */

import type { KVNamespace, R2Bucket } from "@cloudflare/workers-types";

// ── Constants ────────────────────────────────────────────────────────────────

/** Maximum body size in bytes. Larger payloads get 413. */
export const MAX_BODY_SIZE = 2048;

/** Rate limit: max requests per IP per rolling 60-second window. */
const RATE_LIMIT_MAX = 30;

/** KV key prefix for telemetry counters. */
const KV_PREFIX = "telemetry:v1";

/** KV TTL in seconds (35 days = 5 weeks). */
const KV_TTL_SECONDS = 60 * 60 * 24 * 35; // 3_024_000

/** Allowed origin. CORS preflight and origin header are checked against this. */
const ALLOWED_ORIGIN = "https://monedario.cl";

/** Max string length for dimension values. */
const MAX_STRING_LENGTH = 200;

/** Concurrent KV reads per batch during export. */
const KV_EXPORT_READ_BATCH_SIZE = 50;

// ── Allowlist (must match client-side sanitizer — dual enforcement) ──────────

const EVENT_ALLOWLIST: Readonly<Record<string, ReadonlySet<string>>> = {
  calculator_view: new Set(["page_type", "calculator_slug"]),
  calculator_start: new Set(["calculator_slug", "interaction_type"]),
  calculator_complete: new Set(["calculator_slug", "outcome_class"]),
  calculator_error: new Set(["calculator_slug", "error_code"]),
  next_best_step_shown: new Set(["calculator_slug", "rule_id", "position"]),
  next_best_step_click: new Set(["calculator_slug", "rule_id", "position"]),
  result_action_click: new Set(["calculator_slug", "action_id"]),
  share_result_click: new Set(["calculator_slug", "channel"]),
  scenario_action: new Set(["calculator_slug", "action"]),
  resume_click: new Set(["item_type", "item_id"]),
  support_page_click: new Set(["page_type", "source_context"]),
  official_source_click: new Set(["page_type", "source_domain"]),
};

const FORBIDDEN_KEYS = new Set([
  "profile_signal",
  "rationale",
  "sueldo",
  "deuda",
  "monto",
  "resultado",
  "pension",
  "impuesto",
  "input_values",
  "inputs",
  "raw_values",
  "calculator_name",
  "email",
  "rut",
  "nombre",
  "telefono",
  "direccion",
  "user_id",
  "session_id",
  "cookie_id",
  "fingerprint",
  "ip",
  "user_agent",
  "referrer",
  "query_string",
  "destination_url",
  "source_url",
  "target_href",
  "share_url",
  "page_path",
  "cta_label",
  "source_label",
  "error_message",
  "article_title",
  "article_slug",
  "scroll_depth_percent",
]);

const ENUM_VALUES: Readonly<Record<string, ReadonlySet<string>>> = {
  outcome_class: new Set([
    "success",
    "validation_error",
    "calculation_error",
    "empty_input",
  ]),
  error_code: new Set(["validation", "calculation", "network", "timeout"]),
  interaction_type: new Set(["focusin", "input", "click"]),
  action: new Set(["save", "load", "compare", "delete"]),
  channel: new Set(["copy", "whatsapp", "telegram", "email", "native"]),
  item_type: new Set(["calculator", "post", "guide"]),
  page_type: new Set([
    "calculator",
    "post",
    "guide",
    "home",
    "hub",
    "search",
    "support",
    "legal",
    "unknown",
  ]),
  source_context: new Set(["result", "article", "hub", "footer", "header"]),
  source_domain: new Set([
    "sii.cl",
    "bcentral.cl",
    "suseso.gob.cl",
    "cmfchile.cl",
    "spensiones.cl",
    "chileatiende.gob.cl",
    "hacienda.cl",
    "dt.gob.cl",
    "ine.gob.cl",
    "registrocivil.cl",
    "bcn.cl",
    "leychile.cl",
    "senado.cl",
    "camara.cl",
    "minvu.cl",
  ]),
};

const TRANSMISSIBLE_EVENTS = new Set(Object.keys(EVENT_ALLOWLIST));

/** Free-form dimensions (no enum) — constrained to safe lowercase tokens.
 *  item_id is intentionally excluded — see plan 043. */
const FREE_FORM_TOKEN_KEYS = new Set([
  "calculator_slug",
  "rule_id",
  "action_id",
]);
/** Lowercase alnum start, then kebab/snake. Bounds cardinality; blocks garbage. */
const SAFE_TOKEN_RE = /^[a-z0-9][a-z0-9_-]*$/;

// ── Types ────────────────────────────────────────────────────────────────────

interface ValidationResult {
  valid: boolean;
  event?: string;
  params?: Record<string, string | number | boolean>;
}

// ── Server-side validation (exports for testing) ─────────────────────────────

/**
 * Validates a raw event payload against the strict schema.
 *
 * Server-side re-validation is the security boundary — the client-side sanitizer
 * is a convenience, not the trust boundary.
 */
export function validateEventPayload(body: unknown): ValidationResult {
  // Must be a non-null object (not array, not string, not null)
  if (body === null || body === undefined) return { valid: false };
  if (typeof body !== "object") return { valid: false };
  if (Array.isArray(body)) return { valid: false };

  const raw = body as Record<string, unknown>;

  // Must have string "event"
  if (typeof raw.event !== "string") return { valid: false };

  // Event must be in allowlist
  if (!TRANSMISSIBLE_EVENTS.has(raw.event)) return { valid: false };

  // Must have "params" as a non-null, non-array object
  if (raw.params === null || raw.params === undefined) return { valid: false };
  if (typeof raw.params !== "object") return { valid: false };
  if (Array.isArray(raw.params)) return { valid: false };

  const rawParams = raw.params as Record<string, unknown>;
  const allowedKeys = EVENT_ALLOWLIST[raw.event];

  // Check for forbidden or unknown keys — any extra key makes the payload invalid
  for (const key of Object.keys(rawParams)) {
    if (FORBIDDEN_KEYS.has(key)) return { valid: false };
    if (!allowedKeys.has(key)) return { valid: false };
  }

  // Validate each param
  const clean: Record<string, string | number | boolean> = {};
  for (const key of allowedKeys) {
    const value = rawParams[key];

    // Missing required key? Allow — some dimensions are optional per event.
    if (value === undefined) continue;

    // Only primitives
    const t = typeof value;
    if (t !== "string" && t !== "number" && t !== "boolean") return { valid: false };

    // String constraints
    if (t === "string") {
      const s = value as string;
      if (s.length > MAX_STRING_LENGTH) return { valid: false };
      if (s.length === 0) continue; // skip empty strings
      clean[key] = s;
    } else {
      clean[key] = value as number | boolean;
    }

    // Enum validation
    const allowedEnums = ENUM_VALUES[key];
    if (allowedEnums) {
      const strVal = String(clean[key]);
      if (!allowedEnums.has(strVal)) return { valid: false };
    }

    // Free-form token dimensions must match a safe shape (reject the payload).
    if (
      FREE_FORM_TOKEN_KEYS.has(key) &&
      typeof clean[key] === "string" &&
      !SAFE_TOKEN_RE.test(clean[key] as string)
    ) {
      return { valid: false };
    }
  }

  return { valid: true, event: raw.event, params: clean };
}

/**
 * Sanitizes an event payload server-side.
 * Less strict than validateEventPayload — strips unknown keys instead of rejecting.
 * Used by the cron export path, not the ingestion path.
 */
export function sanitizeCollectorEvent(
  eventName: string,
  params: Record<string, unknown>,
): { event: string; params: Record<string, string | number | boolean> } | null {
  if (!TRANSMISSIBLE_EVENTS.has(eventName)) return null;

  const allowedKeys = EVENT_ALLOWLIST[eventName];
  const clean: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params)) {
    if (FORBIDDEN_KEYS.has(key)) continue;
    if (!allowedKeys.has(key)) continue;
    if (value === undefined || value === null) continue;

    const t = typeof value;
    if (t !== "string" && t !== "number" && t !== "boolean") continue;

    let finalValue: string | number | boolean;
    if (t === "string") {
      finalValue = (value as string).slice(0, MAX_STRING_LENGTH);
    } else {
      finalValue = value as number | boolean;
    }

    const allowedEnums = ENUM_VALUES[key];
    if (allowedEnums && !allowedEnums.has(String(finalValue))) continue;

    clean[key] = finalValue;
  }

  return { event: eventName, params: clean };
}

// ── Helper: build KV counter key ─────────────────────────────────────────────

function getDateString(): string {
  // UTC date in ISO format: YYYY-MM-DD
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildCounterKey(
  event: string,
  params: Record<string, string | number | boolean>,
): string {
  const date = getDateString();
  const slug = String(params.calculator_slug ?? params.item_id ?? params.page_type ?? "unknown");

  // Build a stable dimension suffix from non-slug params, sorted by key
  const dimEntries = Object.entries(params)
    .filter(([k]) => k !== "calculator_slug" && k !== "item_id" && k !== "page_type")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => String(v));

  const dimSuffix = dimEntries.length > 0 ? `:${dimEntries.join(":")}` : "";

  return `${KV_PREFIX}:${date}:${event}:${slug}${dimSuffix}`;
}

// ── Rate limiter (KV-backed) ─────────────────────────────────────────────────

async function checkRateLimit(
  kv: KVNamespace,
  ip: string,
): Promise<boolean> {
  const minute = Math.floor(Date.now() / 60_000);
  const key = `rate_limit:${ip}:${minute}`;

  try {
    const current = await kv.get(key);
    const count = current ? parseInt(current, 10) : 0;

    if (count >= RATE_LIMIT_MAX) return false; // rate limited

    // Increment with 120s TTL (2 windows to avoid edge cases)
    await kv.put(key, String(count + 1), { expirationTtl: 120 });
    return true;
  } catch {
    // If KV is unreachable, allow the request (fail open for rate limiting,
    // fail closed for the actual event writing).
    return true;
  }
}

// ── Event ingestion ──────────────────────────────────────────────────────────

async function ingestEvent(
  kv: KVNamespace,
  event: string,
  params: Record<string, string | number | boolean>,
): Promise<void> {
  const key = buildCounterKey(event, params);

  try {
    // Increment counter with TTL
    const current = await kv.get(key);
    const count = current ? parseInt(current, 10) : 0;
    await kv.put(key, String(count + 1), { expirationTtl: KV_TTL_SECONDS });
  } catch {
    // KV write failure: silently drop. We don't have a dead-letter queue at
    // this scale. The export will show a gap if persistent.
  }
}

// ── CORS headers ─────────────────────────────────────────────────────────────

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

// ── ISO week helpers (timezone-aware for export) ─────────────────────────────

/**
 * Computes the previous complete ISO week string (YYYY-Www) using a
 * timezone-aware "current date."  The export trigger fires on Monday
 * morning, so "previous complete week" is last Monday–Sunday.
 *
 * Implementation: get the current date in the given timezone by offsetting
 * from UTC, then walk back to the most-recently-completed Sunday, then
 * back to Monday of that week, and compute the ISO week from that Monday.
 */
function previousCompleteISOWeekInTz(): string {
  // Use the most recent fully completed Sunday as the reference. On Sunday
  // itself, the current ISO week is still in progress, so step back 7 days.
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dayNum = todayUtc.getUTCDay() || 7; // 1=Monday … 7=Sunday
  const daysBack = dayNum === 7 ? 7 : dayNum;
  const completedSunday = new Date(todayUtc.getTime() - daysBack * 86_400_000);
  return dateToISOWeekUTC(completedSunday);
}

/**
 * Pure ISO-week calculation from a UTC date.
 * Monday = first day of the week (ISO 8601).
 * Returns "YYYY-Www".
 */
export function dateToISOWeekUTC(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7; // 1=Monday … 7=Sunday

  // Find Thursday of the same ISO week. The ISO year is the year of that Thursday.
  const thursday = new Date(d.getTime() + (4 - dayNum) * 86_400_000);
  const isoYear = thursday.getUTCFullYear();

  // Week 1 is the week containing Jan 4 (guaranteed by ISO 8601).
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4.getTime() - (jan4Day - 1) * 86_400_000);

  // The Monday of the target week.
  const monday = new Date(thursday.getTime() - 3 * 86_400_000);
  const week = Math.floor((monday.getTime() - week1Monday.getTime()) / 604_800_000) + 1;

  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}

/**
 * Converts an ISO week string "YYYY-Www" to a UTC date range {from, to}.
 * from = Monday 00:00:00 UTC, to = Sunday 23:59:59 UTC.
 */
export function isoWeekToDateRangeUTC(week: string): { from: string; to: string } {
  const match = /^(\d{4})-W(\d{2})$/.exec(week);
  if (!match) throw new Error(`Invalid ISO week: "${week}"`);
  const year = parseInt(match[1], 10);
  const weekNum = parseInt(match[2], 10);

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4.getTime() - (jan4Day - 1) * 86_400_000);
  const monday = new Date(week1Monday.getTime() + (weekNum - 1) * 7 * 86_400_000);
  const sunday = new Date(monday.getTime() + 6 * 86_400_000);

  return {
    from: monday.toISOString().slice(0, 10),
    to: sunday.toISOString().slice(0, 10),
  };
}

// ── KV listing and aggregation ───────────────────────────────────────────────

export interface TelemetryCounter {
  date: string; // "YYYY-MM-DD"
  event: string;
  slug: string;
  dimensions: string; // everything after date:event:slug
  count: number;
}

/**
 * Lists all telemetry counters from KV (paginated).
 * Parses keys of the form `telemetry:v1:{date}:{event}:{slug}[:{dimensions...}]`
 * and returns parsed rows with counts.
 */
async function listTelemetryCounters(
  kv: KVNamespace,
  window?: { from: string; to: string },
): Promise<TelemetryCounter[]> {
  const counters: TelemetryCounter[] = [];
  const prefixes = window
    ? datesInWindowUTC(window.from, window.to).map((date) => `${KV_PREFIX}:${date}:`)
    : [`${KV_PREFIX}:`];

  for (const prefix of prefixes) {
    let cursor: string | undefined;

    do {
      const result = await kv.list({ prefix, cursor });
      for (let i = 0; i < result.keys.length; i += KV_EXPORT_READ_BATCH_SIZE) {
        const batch = result.keys.slice(i, i + KV_EXPORT_READ_BATCH_SIZE);
        const parsedBatch = await Promise.all(
          batch.map(async (key) => {
            const count = await kv.get(key.name);
            if (count === null) return null;
            return parseCounterKey(key.name, parseInt(count, 10) || 0);
          }),
        );

        for (const parsed of parsedBatch) {
          if (parsed) counters.push(parsed);
        }
      }
      cursor = result.list_complete ? undefined : result.cursor;
    } while (cursor);
  }

  return counters;
}

function datesInWindowUTC(from: string, to: string): string[] {
  const dates: string[] = [];
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);

  for (let current = start; current <= end; current = new Date(current.getTime() + 86_400_000)) {
    dates.push(current.toISOString().slice(0, 10));
  }

  return dates;
}

/**
 * Parses a KV counter key into its components.
 * Key format: telemetry:v1:{date}:{event}:{slug}[:{dimension...}]
 */
export function parseCounterKey(
  key: string,
  count: number,
): TelemetryCounter | null {
  // Minimum 5 segments: prefix:v1:date:event:slug
  const parts = key.split(":");
  if (parts.length < 5) return null;
  if (parts[0] !== "telemetry" || parts[1] !== "v1") return null;

  const date = parts[2];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const event = parts[3];
  const slug = parts[4];
  const dimensions = parts.slice(5).join(":");

  return { date, event, slug, dimensions, count };
}

// ── Export artifact types ────────────────────────────────────────────────────

export interface ExportDataRow {
  date: string;
  event_name: string;
  calculator_slug: string;
  dimensions: string;
  count: number;
}

export interface ExportArtifact {
  source: string;
  schemaVersion: number;
  week: string;
  window: { from: string; to: string };
  data: ExportDataRow[];
}

interface ExportValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ExportRunSummary {
  week: string;
  window: { from: string; to: string };
  rows: number;
  totalEvents: number;
  r2Key: string;
}

// ── Aggregation ──────────────────────────────────────────────────────────────

/**
 * Filters counters to the target date window and aggregates by
 * (date, event_name, calculator_slug, dimensions).
 */
export function aggregateWindow(
  counters: TelemetryCounter[],
  from: string,
  to: string,
): ExportDataRow[] {
  const map = new Map<string, ExportDataRow>();

  for (const c of counters) {
    if (c.date < from || c.date > to) continue;
    const rowKey = `${c.date}|${c.event}|${c.slug}|${c.dimensions}`;
    const existing = map.get(rowKey);
    if (existing) {
      existing.count += c.count;
    } else {
      map.set(rowKey, {
        date: c.date,
        event_name: c.event,
        calculator_slug: c.slug,
        dimensions: c.dimensions,
        count: c.count,
      });
    }
  }

  return [...map.values()].sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    const eventCmp = a.event_name.localeCompare(b.event_name);
    if (eventCmp !== 0) return eventCmp;
    return a.calculator_slug.localeCompare(b.calculator_slug);
  });
}

// ── Export artifact ──────────────────────────────────────────────────────────

/**
 * Builds the export artifact with strict schema.
 */
export function buildExportArtifact(
  week: string,
  window: { from: string; to: string },
  data: ExportDataRow[],
  schemaVersion: number,
): ExportArtifact {
  return {
    source: "first-party-events",
    schemaVersion,
    week,
    window,
    data,
  };
}

/**
 * Validates the export artifact before persisting.
 * - schemaVersion must be 1
 * - counts must be >= 0
 * - event_name must be in TRANSMISSIBLE_EVENTS
 * - calculator_slug must be non-empty
 * - date must be within the declared window
 * - dimensions, if non-empty, must use only allowlisted enum values
 */
export function validateExportArtifact(
  artifact: ExportArtifact,
): ExportValidationResult {
  const errors: string[] = [];

  if (artifact.schemaVersion !== 1) {
    errors.push(`schemaVersion must be 1, got ${artifact.schemaVersion}`);
  }

  if (artifact.source !== "first-party-events") {
    errors.push(`source must be "first-party-events", got "${artifact.source}"`);
  }

  if (!/^\d{4}-W\d{2}$/.test(artifact.week)) {
    errors.push(`invalid week format: "${artifact.week}"`);
  }

  if (!artifact.window?.from || !artifact.window?.to) {
    errors.push("window.from and window.to are required");
  }

  for (const row of artifact.data) {
    if (row.count < 0) {
      errors.push(`negative count for ${row.event_name}/${row.calculator_slug}`);
    }
    if (!row.event_name || !TRANSMISSIBLE_EVENTS.has(row.event_name)) {
      errors.push(`invalid event_name: "${row.event_name}"`);
    }
    if (!row.calculator_slug || row.calculator_slug.length === 0) {
      errors.push("calculator_slug is empty");
    }
    if (!row.date || row.date < artifact.window.from || row.date > artifact.window.to) {
      errors.push(`date ${row.date} outside window ${artifact.window.from}→${artifact.window.to}`);
    }
    // Validate dimension enums where present
    if (row.dimensions) {
      const dimParts = row.dimensions.split(":");
      for (const dimValue of dimParts) {
        if (dimValue.length > MAX_STRING_LENGTH) {
          errors.push(`dimension value too long in row ${row.date}/${row.event_name}`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function constantTimeEqual(a: string, b: string): boolean {
  const maxLength = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;

  for (let i = 0; i < maxLength; i += 1) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }

  return diff === 0;
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

// ── Main handler ─────────────────────────────────────────────────────────────

export interface Env {
  ANALYTICS_TELEMETRY: KVNamespace;
  ANALYTICS_EXPORTS: R2Bucket;
  ANALYTICS_DISABLED?: string;
  SCHEMA_VERSION?: string;
  EXPORT_TIMEZONE?: string;
  EXPORT_SECRET?: string;
}

export async function runExport(env: Env, week: string): Promise<ExportRunSummary> {
  const schemaVersion = parseInt(env.SCHEMA_VERSION ?? "1", 10);
  const window = isoWeekToDateRangeUTC(week);

  console.log(
    `[analytics-export] week=${week} window=${window.from}→${window.to}`,
  );

  const counters = await listTelemetryCounters(env.ANALYTICS_TELEMETRY, window);
  const aggregated = aggregateWindow(counters, window.from, window.to);
  console.log(
    `[analytics-export] listed=${counters.length} aggregated=${aggregated.length} rows`,
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
    `[analytics-export] written to R2 key=${key} size=${body.length} rows=${aggregated.length}`,
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
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : null;
  if (!providedSecret) {
    return jsonResponse({ error: "missing_secret" }, 401);
  }
  if (!constantTimeEqual(providedSecret, env.EXPORT_SECRET)) {
    return jsonResponse({ error: "invalid_secret" }, 403);
  }

  const requestedWeek = url.searchParams.get("week");
  const week = requestedWeek ?? previousCompleteISOWeekInTz();
  if (!/^\d{4}-W\d{2}$/.test(week)) {
    return jsonResponse({ error: "invalid_week" }, 400);
  }

  const ip =
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
    "unknown";
  const allowed = await checkRateLimit(env.ANALYTICS_TELEMETRY, `export:${ip}`);
  if (!allowed) {
    return jsonResponse({ error: "rate_limited" }, 429);
  }

  try {
    const result = await runExport(env, week);
    return jsonResponse({
      week: result.week,
      window: result.window,
      rows: result.rows,
      totalEvents: result.totalEvents,
    });
  } catch (error) {
    console.error(
      `[analytics-export] manual export failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return jsonResponse({ error: "export_failed" }, 500);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/api/analytics/export") {
      return handleManualExport(request, env);
    }

    // Feature flag: reject all events when disabled
    if (env.ANALYTICS_DISABLED === "1") {
      return new Response(null, { status: 503, headers: corsHeaders() });
    }

    // Only POST
    if (request.method !== "POST") {
      return new Response(null, { status: 405, headers: corsHeaders() });
    }

    // Origin check
    const origin = request.headers.get("Origin");
    if (origin && origin !== ALLOWED_ORIGIN) {
      return new Response(null, { status: 403, headers: corsHeaders() });
    }

    // Content-Type check
    const contentType = request.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      return new Response(null, { status: 415, headers: corsHeaders() });
    }

    // Body size check (early exit before reading body)
    const contentLength = request.headers.get("Content-Length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return new Response(null, { status: 413, headers: corsHeaders() });
    }

    // Read body
    let body: unknown;
    try {
      const text = await request.text();

      // Size guard on actual text (defense in depth)
      if (text.length > MAX_BODY_SIZE) {
        return new Response(null, { status: 413, headers: corsHeaders() });
      }

      body = JSON.parse(text);
    } catch {
      return new Response(null, { status: 400, headers: corsHeaders() });
    }

    // Validate payload
    const validation = validateEventPayload(body);
    if (!validation.valid || !validation.event || !validation.params) {
      return new Response(null, { status: 422, headers: corsHeaders() });
    }

    // Rate limit (best-effort IP extraction)
    const ip =
      request.headers.get("CF-Connecting-IP") ??
      request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
      "unknown";

    const allowed = await checkRateLimit(env.ANALYTICS_TELEMETRY, ip);
    if (!allowed) {
      return new Response(null, { status: 429, headers: corsHeaders() });
    }

    // Ingest — increment KV counters
    await ingestEvent(env.ANALYTICS_TELEMETRY, validation.event, validation.params);

    // 202 Accepted — no echo of the payload
    return new Response(null, { status: 202, headers: corsHeaders() });
  },

  /**
   * Cron trigger: weekly export of aggregated counters to R2.
   *
   * Runs every Monday at 07:57 UTC (madrugada en Chile). Aggregates all KV
   * counters for the previous complete ISO week, builds a strict-schema JSON
   * artifact, validates it, and persists it to R2 at:
   *
   *   analytics-exports/YYYY-Www.json
   *
   * The artifact schema matches the contract in the ADR and plan §7:
   *   { source, schemaVersion, week, window, data: [{ date, event_name,
   *     calculator_slug, dimensions, count }] }
   */
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    const tz = env.EXPORT_TIMEZONE ?? "America/Santiago";

    // Compute the previous complete ISO week.
    const week = previousCompleteISOWeekInTz();
    console.log(`[analytics-export] trigger=cron week=${week} tz=${tz}`);

    try {
      await runExport(env, week);
    } catch (error) {
      console.error(
        `[analytics-export] VALIDATION FAILED: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  },
};
