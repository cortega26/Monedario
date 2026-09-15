/**
 * Analytics Collector — shared ingestion/export helpers (Cloudflare Worker).
 *
 * Live entrypoint is ./worker-v2 (native rate limiting + SQLite-backed
 * Durable Object counters). This module keeps the pure helpers it needs
 * (validation, calendar math, export aggregation) plus the legacy KV
 * READ path used to export historical weeks until their TTL expires.
 * KV writes were removed with the v2 migration (#475): nothing here may
 * put to ANALYTICS_TELEMETRY.
 *
 * Contract: docs/backlog/PLAN-calculator-led-growth-2026-06-28.md §7
 * ADR: docs/adr/ADR-20260628-first-party-analytics.md
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

/** Legacy counters use UTC dates. Preserved until the explicit cutover. */
const LEGACY_KV_PREFIX = "telemetry:v1";

/** Versioned counters whose dates follow EXPORT_TIMEZONE. */
const LOCAL_CALENDAR_KV_PREFIX = "telemetry:v2";

/** Allowed origin. CORS preflight and origin header are checked against this. */
export const ALLOWED_ORIGIN = "https://monedario.cl";

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

// ── Structured logging ─────────────────────────────────────────────────────────

type LogLevel = "info" | "warn" | "error";

export function log(
  level: LogLevel,
  event: string,
  fields: Record<string, unknown> = {},
): void {
  const entry = {
    level,
    event,
    timestamp: new Date().toISOString(),
    worker: "analytics-collector",
    ...fields,
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

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

// ── Weekly export (legacy KV read + R2 write) ─────────────────────────────────

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

  log("info", "export_started", {
    message: `[analytics-export] week=${week} window=${window.from}→${window.to} prefix=${counterPrefix}`,
  });

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
  log("info", "export_listed", {
    message: `[analytics-export] listed=${counters.length} aggregated=${aggregated.length} rows`,
  });
  if (discarded > 0) {
    log("info", "export_discarded_legacy", {
      message: `[analytics-export] descartados=${discarded} contadores sin taxonomía v2 (legados)`,
    });
  }

  const artifact = buildExportArtifact(week, window, aggregated, schemaVersion);
  const validation = validateExportArtifact(artifact);
  if (!validation.valid) {
    throw new Error(`Export artifact validation failed: ${validation.errors.join("; ")}`);
  }

  const key = `analytics-exports/${week}.json`;
  const body = JSON.stringify(artifact) + "\n";
  await env.ANALYTICS_EXPORTS.put(key, body, {
    httpMetadata: { contentType: "application/json" },
  });

  const totalEvents = aggregated.reduce((sum, row) => sum + row.count, 0);
  log("info", "export_written", {
    message: `[analytics-export] written to R2 key=${key} size=${body.length} rows=${aggregated.length}`,
  });

  return {
    week,
    window,
    rows: aggregated.length,
    totalEvents,
    r2Key: key,
  };
}

// ── Bounded body read ──────────────────────────────────────────────────────

/**
 * Outcome of the bounded body read: either the decoded text, or the HTTP
 * status the caller must answer with (CORS headers added by the caller).
 */
export type BoundedBodyRead =
  | { ok: true; text: string }
  | { ok: false; status: 400 | 413 };

/**
 * Reads the request body keeping at most MAX_BODY_SIZE bytes in memory.
 *
 * Byte accounting uses the raw chunk sizes (`Uint8Array.byteLength`), not
 * `string.length`, so multibyte UTF-8 counts what it retains. The text is
 * decoded once, after the whole in-limit body arrived, so characters split
 * across chunks reassemble correctly.
 *
 * On overflow the chunk that crossed the bound is dropped (never retained),
 * the stream is cancelled best-effort and the caller answers 413: a failed
 * cancel never replaces the status, never leaves an unhandled rejection,
 * and is never awaited (cleanup must not stall the response). A missing or
 * broken stream yields 400, like an empty or unparsable body did before.
 */
export async function readBoundedBodyText(
  request: Request,
): Promise<BoundedBodyRead> {
  const stream: ReadableStream<Uint8Array> | null = request.body;
  if (stream === null) {
    return { ok: false, status: 400 };
  }
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;
  try {
    for (;;) {
      const next = await reader.read().catch(() => null);
      if (next === null) {
        return { ok: false, status: 400 };
      }
      if (next.done) {
        break;
      }
      receivedBytes += next.value.byteLength;
      if (receivedBytes > MAX_BODY_SIZE) {
        // Best-effort cleanup: fire-and-forget, failures swallowed.
        void reader.cancel().catch(() => undefined);
        return { ok: false, status: 413 };
      }
      chunks.push(next.value);
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // Cleanup noise only — the status decided above always wins.
    }
  }
  const merged = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, text: new TextDecoder().decode(merged) };
}
// Legacy v1 fetch/scheduled entrypoint removed with the v2 migration (#475):
// the live entrypoint is ./worker-v2 (native rate limiting + SQLite-backed
// Durable Object counters). Its behavior is covered by
// tests/workers/analytics-collector/root-cause.test.ts.
