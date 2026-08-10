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
import {
  ANALYTICS_SCHEMA_VERSION,
  isAnalyticsEventName,
  LEGACY_EVENT_NAMES,
  normalizeLegacyAnalyticsEvent,
  sanitizeAnalyticsPayload,
} from "../../../src/contracts/analytics-events";

// ── Constants ────────────────────────────────────────────────────────────────

/** Maximum body size in bytes. Larger payloads get 413. */
export const MAX_BODY_SIZE = 2048;

/** Rate limit: max requests per IP per rolling 60-second window. */
const RATE_LIMIT_MAX = 30;

/** Legacy counters use UTC dates. Preserved until the explicit cutover. */
const LEGACY_KV_PREFIX = "telemetry:v1";

/** Versioned counters whose dates follow EXPORT_TIMEZONE. */
const LOCAL_CALENDAR_KV_PREFIX = "telemetry:v2";

/** KV TTL in seconds (35 days = 5 weeks). */
const KV_TTL_SECONDS = 60 * 60 * 24 * 35; // 3_024_000

/** Allowed origin. CORS preflight and origin header are checked against this. */
const ALLOWED_ORIGIN = "https://monedario.cl";

/** Max string length for dimension values. */
const MAX_STRING_LENGTH = 80;

/** Concurrent KV reads per batch during export. */
const KV_EXPORT_READ_BATCH_SIZE = 50;

export const LEGACY_EXPORT_EVENTS = new Set([
  "calculator_view",
  "calculator_start",
  "calculator_complete",
  "calculator_error",
  "next_best_step_shown",
  "next_best_step_click",
  "result_action_click",
  "share_result_click",
  "scenario_action",
  "resume_click",
  "support_page_click",
  "official_source_click",
]);

/**
 * Legacy event names with no successor in the v2 taxonomy. Their counters are
 * excluded from v2 exports instead of failing artifact validation.
 *
 * Decisión del operador 2026-08-03: descartar legados sin mapeo en vez de
 * inventar un canónico. resume_click es un KPI documentado (ux-backlog) cuyo
 * transporte está desactivado desde e17013b7 — follow-up de producto si se
 * quiere reintroducir.
 */
export const LEGACY_UNMAPPED_EXPORT_EVENTS = new Set([
  "resume_click",
  "scenario_action",
]);

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

  // Must have "params" as a non-null, non-array object
  if (raw.params === null || raw.params === undefined) return { valid: false };
  if (typeof raw.params !== "object") return { valid: false };
  if (Array.isArray(raw.params)) return { valid: false };

  // Compatibility stays before the privacy boundary: normalize legacy
  // pre-rename event names (e.g. next_best_step_click) before the strict
  // v2 sanitization, so legacy emitters are not lost (contract design).
  const normalized = normalizeLegacyAnalyticsEvent(
    raw.event,
    raw.params as Record<string, unknown>,
  );
  const sanitized = sanitizeAnalyticsPayload(
    normalized.event,
    normalized.params,
    { rejectUnknown: true },
  );
  return sanitized
    ? { valid: true, event: sanitized.event, params: sanitized.params }
    : { valid: false };
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
  const sanitized = sanitizeAnalyticsPayload(eventName, params);
  return sanitized
    ? { event: sanitized.event, params: sanitized.params }
    : null;
}

// ── Helper: build KV counter key ─────────────────────────────────────────────

export function calendarDateInTimeZone(date: Date, timeZone: string): string {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
  } catch {
    throw new Error(`Invalid EXPORT_TIMEZONE: "${timeZone}"`);
  }

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  if (!values.year || !values.month || !values.day) {
    throw new Error(`Could not resolve calendar date in EXPORT_TIMEZONE: "${timeZone}"`);
  }
  return `${values.year}-${values.month}-${values.day}`;
}

interface CounterStorageSelection {
  prefix: string;
  date: string;
}

interface CounterCalendarCutover {
  instant: Date;
  localDate: string;
  week: string;
}

function calendarDateTimeInTimeZone(
  date: Date,
  timeZone: string,
): { date: string; hour: string; minute: string; second: string } {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(date);
  } catch {
    throw new Error(`Invalid EXPORT_TIMEZONE: "${timeZone}"`);
  }

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  if (
    !values.year ||
    !values.month ||
    !values.day ||
    !values.hour ||
    !values.minute ||
    !values.second
  ) {
    throw new Error(`Could not resolve cutover in EXPORT_TIMEZONE: "${timeZone}"`);
  }

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

function parseCounterCalendarCutover(
  cutoverAt: string | undefined,
  timeZone: string,
): CounterCalendarCutover | null {
  if (!cutoverAt) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(cutoverAt)) {
    throw new Error(
      `Invalid COUNTER_KEY_CUTOVER_AT: "${cutoverAt}" (expected an ISO UTC timestamp)`,
    );
  }

  const instant = new Date(cutoverAt);
  if (Number.isNaN(instant.getTime())) {
    throw new Error(`Invalid COUNTER_KEY_CUTOVER_AT: "${cutoverAt}"`);
  }

  const local = calendarDateTimeInTimeZone(instant, timeZone);
  const localDate = new Date(`${local.date}T00:00:00Z`);
  if (
    local.hour !== "00" ||
    local.minute !== "00" ||
    local.second !== "00" ||
    localDate.getUTCDay() !== 1
  ) {
    throw new Error(
      "COUNTER_KEY_CUTOVER_AT must resolve to Monday 00:00:00 in EXPORT_TIMEZONE",
    );
  }

  return {
    instant,
    localDate: local.date,
    week: dateToISOWeekUTC(localDate),
  };
}

/**
 * Selects the one counter namespace/date convention used for an ingestion.
 * Before the configured boundary, v1 preserves the established UTC contract.
 * At and after the boundary, v2 stores the configured local calendar date.
 */
export function counterStorageForInstant(
  now: Date,
  timeZone: string,
  cutoverAt?: string,
): CounterStorageSelection {
  const cutover = parseCounterCalendarCutover(cutoverAt, timeZone);
  if (!cutover || now < cutover.instant) {
    return { prefix: LEGACY_KV_PREFIX, date: now.toISOString().slice(0, 10) };
  }

  return {
    prefix: LOCAL_CALENDAR_KV_PREFIX,
    date: calendarDateInTimeZone(now, timeZone),
  };
}

/** Selects exactly one versioned prefix for an explicit ISO-week export. */
export function counterPrefixForExportWeek(
  week: string,
  timeZone: string,
  cutoverAt?: string,
): string {
  const cutover = parseCounterCalendarCutover(cutoverAt, timeZone);
  if (!cutover || week < cutover.week) return LEGACY_KV_PREFIX;
  return LOCAL_CALENDAR_KV_PREFIX;
}

function buildCounterKey(
  event: string,
  params: Record<string, string | number | boolean>,
  timeZone: string,
  cutoverAt?: string,
): string {
  const storage = counterStorageForInstant(new Date(), timeZone, cutoverAt);
  const slug = String(params.calculator_id ?? params.page_type ?? "unknown");

  // Build a stable dimension suffix from non-slug params, sorted by key
  const dimEntries = Object.entries(params)
    .filter(([k]) => k !== "calculator_id" && k !== "page_type")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => String(v));

  const dimSuffix = dimEntries.length > 0 ? `:${dimEntries.join(":")}` : "";

  return `${storage.prefix}:${storage.date}:${event}:${slug}${dimSuffix}`;
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
  } catch (error) {
    // If KV is unreachable, allow the request: rate limiting fails open (the
    // request proceeds) and ingestion also fails open (the counter is lost,
    // logged loudly in ingestEvent). Log a truncated key here too — only the
    // minute suffix, never the full IP.
    const suffix = key.split(":").at(-1);
    console.error(
      `[analytics-collector] KV rate-limit check failed (window ${suffix}):`,
      error instanceof Error ? error.message : String(error)
    );
    return true;
  }
}

// ── Event ingestion ──────────────────────────────────────────────────────────

async function ingestEvent(
  kv: KVNamespace,
  event: string,
  params: Record<string, string | number | boolean>,
  timeZone: string,
  cutoverAt?: string,
): Promise<void> {
  const key = buildCounterKey(event, params, timeZone, cutoverAt);

  try {
    // Increment counter with TTL
    const current = await kv.get(key);
    const count = current ? parseInt(current, 10) : 0;
    await kv.put(key, String(count + 1), { expirationTtl: KV_TTL_SECONDS });
  } catch (error) {
    // Fail-open (el evento no bloquea la respuesta), pero NUNCA en silencio:
    // un fallo persistente de KV debe ser visible en Workers Logs, no solo
    // como un gap en el export.
    console.error(
      `[analytics-collector] KV counter update failed (read or write) for key ${key}:`,
      error instanceof Error ? error.message : String(error)
    );
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
export function previousCompleteISOWeekInTz(
  timeZone: string,
  now = new Date(),
): string {
  // Use the most recent fully completed Sunday as the reference. On Sunday
  // itself, the current ISO week is still in progress, so step back 7 days.
  const localDate = calendarDateInTimeZone(now, timeZone);
  const todayUtc = new Date(`${localDate}T00:00:00Z`);
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
 * Lists telemetry counters from one versioned KV namespace (paginated).
 * Parses keys of the form `telemetry:vN:{date}:{event}:{slug}[:{dimensions...}]`
 * and returns parsed rows with counts.
 */
async function listTelemetryCounters(
  kv: KVNamespace,
  counterPrefix: string,
  window?: { from: string; to: string },
): Promise<TelemetryCounter[]> {
  const counters: TelemetryCounter[] = [];
  const prefixes = window
    ? datesInWindowUTC(window.from, window.to).map((date) => `${counterPrefix}:${date}:`)
    : [`${counterPrefix}:`];

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
 * Key format: telemetry:v1|v2:{date}:{event}:{slug}[:{dimension...}]
 */
export function parseCounterKey(
  key: string,
  count: number,
): TelemetryCounter | null {
  // Minimum 5 segments: prefix:v1:date:event:slug
  const parts = key.split(":");
  if (parts.length < 5) return null;
  if (
    parts[0] !== "telemetry" ||
    (parts[1] !== "v1" && parts[1] !== "v2")
  ) {
    return null;
  }

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
  calculator_id?: string;
  calculator_slug?: string;
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
 * Resolves the v2 event name for a counter row.
 *
 * Legacy pre-rename counters (before e17013b7) persist in KV until the 35-day
 * TTL expires: mapped names (LEGACY_EVENT_NAMES) normalize to the v2
 * taxonomy; unmapped names (LEGACY_UNMAPPED_EXPORT_EVENTS or any future
 * unknown) have no v2 successor and return null — they are excluded from
 * exports rather than failing artifact validation.
 */
function resolveCounterEvent(event: string): string | null {
  const canonical = LEGACY_EVENT_NAMES[event] ?? event;
  return isAnalyticsEventName(canonical) ? canonical : null;
}

/**
 * Filters counters to the target date window and aggregates by
 * (date, event_name, calculator_slug, dimensions).
 *
 * v2 exports normalize legacy counter names to the new taxonomy so the
 * artifact validates uniformly; legacy counters without a v2 successor are
 * excluded from the aggregate (they must not fail the export). v1 exports
 * keep the legacy names, matching LEGACY_EXPORT_EVENTS validation.
 */
export function aggregateWindow(
  counters: TelemetryCounter[],
  from: string,
  to: string,
  schemaVersion: number = ANALYTICS_SCHEMA_VERSION,
): ExportDataRow[] {
  const map = new Map<string, ExportDataRow>();

  for (const c of counters) {
    if (c.date < from || c.date > to) continue;
    const event =
      schemaVersion === ANALYTICS_SCHEMA_VERSION
        ? resolveCounterEvent(c.event)
        : c.event;
    if (event === null) continue;
    const rowKey = `${c.date}|${event}|${c.slug}|${c.dimensions}`;
    const existing = map.get(rowKey);
    if (existing) {
      existing.count += c.count;
    } else {
      map.set(rowKey, {
        date: c.date,
        event_name: event,
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
    return (a.calculator_slug ?? "").localeCompare(b.calculator_slug ?? "");
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
  const versionedData = data.map((row) => {
    const calculatorIdentity = row.calculator_id ?? row.calculator_slug ?? "";
    const common = {
      date: row.date,
      event_name: row.event_name,
      dimensions: row.dimensions,
      count: row.count,
    };
    return schemaVersion === ANALYTICS_SCHEMA_VERSION
      ? { ...common, calculator_id: calculatorIdentity }
      : { ...common, calculator_slug: calculatorIdentity };
  });
  return {
    source: "first-party-events",
    schemaVersion,
    week,
    window,
    data: versionedData,
  };
}

/**
 * Validates the export artifact before persisting.
 * - schemaVersion must be 1 (historical) or 2 (current taxonomy)
 * - counts must be >= 0
 * - event_name must be in TRANSMISSIBLE_EVENTS
 * - calculator_id (v2) or calculator_slug (v1) must be non-empty
 * - date must be within the declared window
 * - dimensions, if non-empty, must use only allowlisted enum values
 */
export function validateExportArtifact(
  artifact: ExportArtifact,
): ExportValidationResult {
  const errors: string[] = [];

  if (![1, ANALYTICS_SCHEMA_VERSION].includes(artifact.schemaVersion)) {
    errors.push(
      `schemaVersion must be 1 or ${ANALYTICS_SCHEMA_VERSION}, got ${artifact.schemaVersion}`,
    );
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
    const calculatorIdentity = row.calculator_id ?? row.calculator_slug;
    if (row.count < 0) {
      errors.push(`negative count for ${row.event_name}/${calculatorIdentity}`);
    }
    if (
      !row.event_name ||
      (artifact.schemaVersion === ANALYTICS_SCHEMA_VERSION &&
        !isAnalyticsEventName(row.event_name)) ||
      (artifact.schemaVersion === 1 && !LEGACY_EXPORT_EVENTS.has(row.event_name))
    ) {
      errors.push(`invalid event_name: "${row.event_name}"`);
    }
    if (!calculatorIdentity || calculatorIdentity.length === 0) {
      errors.push("calculator_id or calculator_slug is empty");
    }
    if (
      artifact.schemaVersion === ANALYTICS_SCHEMA_VERSION &&
      (typeof row.calculator_id !== "string" || row.calculator_slug !== undefined)
    ) {
      errors.push("schemaVersion 2 requires calculator_id and forbids calculator_slug");
    }
    if (
      artifact.schemaVersion === 1 &&
      (typeof row.calculator_slug !== "string" || row.calculator_id !== undefined)
    ) {
      errors.push("schemaVersion 1 requires calculator_slug and forbids calculator_id");
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
  COUNTER_KEY_CUTOVER_AT?: string;
  EXPORT_SECRET?: string;
}

export async function runExport(env: Env, week: string): Promise<ExportRunSummary> {
  const schemaVersion = parseInt(
    env.SCHEMA_VERSION ?? String(ANALYTICS_SCHEMA_VERSION),
    10,
  );
  const timeZone = env.EXPORT_TIMEZONE ?? "America/Santiago";
  const counterPrefix = counterPrefixForExportWeek(
    week,
    timeZone,
    env.COUNTER_KEY_CUTOVER_AT,
  );
  const window = isoWeekToDateRangeUTC(week);

  console.log(
    `[analytics-export] week=${week} window=${window.from}→${window.to} prefix=${counterPrefix}`,
  );

  const counters = await listTelemetryCounters(
    env.ANALYTICS_TELEMETRY,
    counterPrefix,
    window,
  );
  const aggregated = aggregateWindow(
    counters,
    window.from,
    window.to,
    schemaVersion,
  );
  const discarded =
    schemaVersion === ANALYTICS_SCHEMA_VERSION
      ? counters.reduce(
          (sum, c) => sum + (resolveCounterEvent(c.event) === null ? 1 : 0),
          0,
        )
      : 0;
  console.log(
    `[analytics-export] listed=${counters.length} aggregated=${aggregated.length} rows`,
  );
  if (discarded > 0) {
    console.log(
      `[analytics-export] descartados=${discarded} contadores sin taxonomía v2 (legados)`,
    );
  }

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
    const timeZone = env.EXPORT_TIMEZONE ?? "America/Santiago";
    await ingestEvent(
      env.ANALYTICS_TELEMETRY,
      validation.event,
      validation.params,
      timeZone,
      env.COUNTER_KEY_CUTOVER_AT,
    );

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
   *     calculator_id, dimensions, count }] }
   */
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    const tz = env.EXPORT_TIMEZONE ?? "America/Santiago";

    // Compute the previous complete ISO week.
    const week = previousCompleteISOWeekInTz(tz);
    console.log(`[analytics-export] trigger=cron week=${week} tz=${tz}`);

    try {
      await runExport(env, week);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[analytics-export] export failed for week=${week}: ${message}`);
      throw error instanceof Error ? error : new Error(message);
    }
  },
};
