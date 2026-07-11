import officialHosts from "@/config/official-hosts.json";

const SCROLL_DEPTH_MILESTONES = [25, 50, 75, 100] as const;

// Official source hosts derive from the canonical registry (TD-0094) so analytics,
// urlcheck and editorial citations never diverge on what counts as official.
const OFFICIAL_HOST_SUFFIXES = officialHosts.officialSuffixes;
const OFFICIAL_HOSTNAMES = new Set(
  officialHosts.hosts.map(entry => entry.host)
);

export type AnalyticsEventParams = Record<
  string,
  string | number | boolean | undefined
>;

// ── First-party analytics: sanitizer ────────────────────────────────────────
// Contract: docs/backlog/PLAN-calculator-led-growth-2026-06-28.md §7
// ADR: docs/adr/ADR-20260628-first-party-analytics.md
//
// Design:
// - Pure function: no side effects, no IO, no window access.
// - Allowlist by event: only declared dimensions pass through.
// - Forbidden keys (PII, financial values, identifiers) are always stripped.
// - Enum values are validated; invalid enums are dropped.
// - Strings are truncated at 200 characters.
// - Non-primitive values (objects, arrays) are dropped.
// - The server-side collector (Worker) re-validates everything independently.

/** Maximun string length for any dimension value. */
const MAX_STRING_LENGTH = 200;

/**
 * Allowed dimensions per event.
 * Any key not listed here is stripped.
 */
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

/**
 * Keys that must never appear in a transmitted payload.
 * These are stripped regardless of event type.
 */
const FORBIDDEN_KEYS = new Set([
  // Profile / rationale
  "profile_signal",
  "rationale",
  // Financial inputs or results
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
  // PII
  "email",
  "rut",
  "nombre",
  "telefono",
  "direccion",
  // Identifiers
  "user_id",
  "session_id",
  "cookie_id",
  "fingerprint",
  // Network / tracking
  "ip",
  "user_agent",
  "referrer",
  "query_string",
  // URLs with potential PII
  "destination_url",
  "source_url",
  "target_href",
  "share_url",
  "page_path",
  // Free text / labels
  "cta_label",
  "source_label",
  "error_message",
  "article_title",
  "article_slug",
  "scroll_depth_percent",
]);

/**
 * Enum validation: if a dimension has a fixed set of allowed values, those are
 * declared here. Values not in the set are dropped.
 */
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

/** Events that the transport is allowed to send. */
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

export type SanitizedAnalyticsEvent = {
  event: string;
  params: Record<string, string | number | boolean>;
};

/**
 * Sanitizes a client-side analytics event before transmission.
 *
 * @returns The sanitized event, or null if the event is not transmissible.
 */
export function sanitizeAnalyticsEvent(
  eventName: string,
  params: Record<string, unknown>
): SanitizedAnalyticsEvent | null {
  // 1. Event must be in the allowlist
  if (!TRANSMISSIBLE_EVENTS.has(eventName)) {
    return null;
  }

  const allowedKeys = EVENT_ALLOWLIST[eventName];
  const clean: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params)) {
    // 2. Strip forbidden keys unconditionally
    if (FORBIDDEN_KEYS.has(key)) continue;

    // 3. Strip keys not in this event's allowlist
    if (!allowedKeys.has(key)) continue;

    // 4. Only primitives: string, number, boolean
    if (value === undefined || value === null) continue;
    const t = typeof value;
    if (t !== "string" && t !== "number" && t !== "boolean") continue;

    // 5. String truncation
    let finalValue: string | number | boolean;
    if (t === "string") {
      finalValue = (value as string).slice(0, MAX_STRING_LENGTH);
    } else {
      finalValue = value as number | boolean;
    }

    // 6. Enum validation: if the key has declared allowed values, validate
    if (ENUM_VALUES[key]) {
      if (!ENUM_VALUES[key].has(String(finalValue))) continue;
    }

    // 7. Free-form token dimensions must match a safe shape (drop, keep event).
    if (
      FREE_FORM_TOKEN_KEYS.has(key) &&
      typeof finalValue === "string" &&
      !SAFE_TOKEN_RE.test(finalValue)
    ) {
      continue; // drop the invalid value; keep the event
    }

    clean[key] = finalValue;
  }

  return { event: eventName, params: clean };
}

/**
 * Returns true if the event name is transmissible (in the allowlist).
 * Used to gate transport without running the full sanitizer.
 */
export function isTransmissibleEvent(eventName: string): boolean {
  return TRANSMISSIBLE_EVENTS.has(eventName);
}

const CTA_EVENT_NAMES: Record<string, string> = {
  "calculator-trust-link": "calculator_trust_link_click",
  "hub-route": "hub_route_click",
  "next-step": "next_step_click",
  "related-post": "related_content_click",
  "search-chip": "search_chip_click",
};

export function getAnalyticsEventNameForCta(ctaType?: string): string {
  if (!ctaType) return "cta_click";

  return CTA_EVENT_NAMES[ctaType] ?? "cta_click";
}

export function getReachedScrollMilestones(progressPercent: number): number[] {
  if (!Number.isFinite(progressPercent) || progressPercent <= 0) {
    return [];
  }

  const normalizedProgress = Math.min(progressPercent, 100);
  return SCROLL_DEPTH_MILESTONES.filter(
    milestone => normalizedProgress >= milestone
  );
}

export function isOfficialSourceUrl(href: string): boolean {
  let url: URL;

  try {
    url = new URL(href);
  } catch {
    return false;
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return false;
  }

  const hostname = url.hostname.toLowerCase();
  const normalizedHostname = hostname.replace(/^www\./, "");
  if (
    OFFICIAL_HOSTNAMES.has(hostname) ||
    OFFICIAL_HOSTNAMES.has(normalizedHostname)
  ) {
    return true;
  }

  return OFFICIAL_HOST_SUFFIXES.some(
    suffix => hostname.endsWith(suffix) || normalizedHostname.endsWith(suffix)
  );
}

export function cleanAnalyticsParams(
  params: AnalyticsEventParams
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  ) as Record<string, string | number | boolean>;
}

export function trackAnalyticsEvent(
  eventName: string,
  params: AnalyticsEventParams = {}
) {
  if (typeof window === "undefined") return;
  window.monedarioAnalytics?.track(eventName, params);
}
