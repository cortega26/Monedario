export const ANALYTICS_SCHEMA_VERSION = 2 as const;

export const ANALYTICS_EVENT_ALLOWLIST = {
  calculator_view: ["calculator_id", "page_type", "cluster", "app_version"],
  calculator_start: [
    "calculator_id",
    "page_type",
    "cluster",
    "interaction_variant",
    "app_version",
  ],
  calculator_complete: ["calculator_id", "page_type", "cluster", "app_version"],
  calculator_error: [
    "calculator_id",
    "page_type",
    "cluster",
    "error_category",
    "app_version",
  ],
  next_step_shown: [
    "calculator_id",
    "page_type",
    "cluster",
    "interaction_variant",
    "next_step_id",
    "app_version",
  ],
  next_step_click: [
    "calculator_id",
    "page_type",
    "cluster",
    "interaction_variant",
    "next_step_id",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "app_version",
  ],
  source_click: ["calculator_id", "page_type", "source_type", "app_version"],
  share_attempt: ["calculator_id", "page_type", "share_method", "app_version"],
  share_success: ["calculator_id", "page_type", "share_method", "app_version"],
  alert_interest_shown: [
    "calculator_id",
    "page_type",
    "interaction_variant",
    "app_version",
  ],
  alert_interest_submit: [
    "calculator_id",
    "page_type",
    "interaction_variant",
    "app_version",
  ],
  support_shown: [
    "calculator_id",
    "page_type",
    "support_location",
    "app_version",
  ],
  support_click: [
    "calculator_id",
    "page_type",
    "support_location",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "app_version",
  ],
  support_confirmed: [
    "calculator_id",
    "page_type",
    "support_location",
    "app_version",
  ],
  article_calculator_cta_click: [
    "cta_type",
    "cta_location",
    "destination_url",
    "page_type",
    "app_version",
  ],
} as const;

export type AnalyticsEventName = keyof typeof ANALYTICS_EVENT_ALLOWLIST;
export type AnalyticsPropertyName =
  (typeof ANALYTICS_EVENT_ALLOWLIST)[AnalyticsEventName][number];

export const ANALYTICS_ALLOWED_PROPERTIES = [
  "calculator_id",
  "page_type",
  "cluster",
  "interaction_variant",
  "next_step_id",
  "source_type",
  "error_category",
  "share_method",
  "support_location",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "app_version",
  "cta_type",
  "cta_location",
  "destination_url",
] as const satisfies readonly AnalyticsPropertyName[];

const ENUM_VALUES: Readonly<Record<string, ReadonlySet<string>>> = {
  page_type: new Set([
    "calculator",
    "post",
    "guide",
    "home",
    "hub",
    "support",
    "legal",
    "unknown",
  ]),
  interaction_variant: new Set(["focus", "input", "button", "contextual_v1"]),
  source_type: new Set(["official", "methodology", "snapshot"]),
  error_category: new Set([
    "validation",
    "calculation",
    "network",
    "timeout",
    "stale_source",
  ]),
  share_method: new Set(["copy", "whatsapp", "native"]),
  support_location: new Set(["post_result"]),
};

const SAFE_TOKEN = /^[a-z0-9][a-z0-9._-]{0,79}$/;
const APP_VERSION = /^[0-9]+\.[0-9]+\.[0-9]+(?:-[a-z0-9.-]+)?$/;
// destination_url solo admite URLs internas del sitio (el clic CTA apunta a
// una calculadora de monedario.cl). Evita exfiltrar destinos externos.
const INTERNAL_URL = /^https:\/\/(?:www\.)?monedario\.cl\/[a-z0-9/._-]*$/;
const FORBIDDEN_KEY_PATTERN =
  /(?:amount|balance|debt|email|fingerprint|income|input|ip|monto|name|nombre|pension|phone|query|result|resultado|rut|salary|session|sueldo|tax|telefono|user|value|valor)/i;

export type AnalyticsPayload = {
  event: AnalyticsEventName;
  params: Record<string, string>;
};

export function isAnalyticsEventName(
  value: string
): value is AnalyticsEventName {
  return Object.hasOwn(ANALYTICS_EVENT_ALLOWLIST, value);
}

export function sanitizeAnalyticsPayload(
  eventName: string,
  params: Record<string, unknown>,
  options: { rejectUnknown?: boolean } = {}
): AnalyticsPayload | null {
  if (!isAnalyticsEventName(eventName)) return null;
  const allowed = new Set<string>(ANALYTICS_EVENT_ALLOWLIST[eventName]);
  const clean: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (FORBIDDEN_KEY_PATTERN.test(key) || !allowed.has(key)) {
      if (options.rejectUnknown) return null;
      continue;
    }
    if (typeof value !== "string" || value.length === 0 || value.length > 80) {
      if (options.rejectUnknown) return null;
      continue;
    }
    const enumValues = ENUM_VALUES[key];
    const valid = enumValues
      ? enumValues.has(value)
      : key === "app_version"
        ? APP_VERSION.test(value)
        : key === "destination_url"
          ? INTERNAL_URL.test(value)
          : SAFE_TOKEN.test(value);
    if (!valid) {
      if (options.rejectUnknown) return null;
      continue;
    }
    clean[key] = value;
  }

  return { event: eventName, params: clean };
}

export const LEGACY_EVENT_NAMES: Readonly<Record<string, AnalyticsEventName>> =
  {
    next_best_step_shown: "next_step_shown",
    next_best_step_click: "next_step_click",
    official_source_click: "source_click",
    share_result_click: "share_attempt",
    // Decisión de taxonomía 2026-08-03 (fix export v2): los CTAs de página de
    // resultado pasaron a ser next-step y el clic al enlace de soporte pasó a
    // support_click (ver UtmPostResultActions.astro).
    result_action_click: "next_step_click",
    support_page_click: "support_click",
  };

const LEGACY_PARAM_NAMES: Readonly<Record<string, AnalyticsPropertyName>> = {
  calculator_slug: "calculator_id",
  interaction_type: "interaction_variant",
  rule_id: "next_step_id",
  error_code: "error_category",
  channel: "share_method",
};

const LEGACY_VALUES: Readonly<Record<string, string>> = {
  focusin: "focus",
  click: "button",
};

/** Compatibility stays before the privacy boundary; transmitted payloads are v2 only. */
export function normalizeLegacyAnalyticsEvent(
  eventName: string,
  params: Record<string, unknown>
): { event: string; params: Record<string, unknown> } {
  const event = LEGACY_EVENT_NAMES[eventName] ?? eventName;
  const normalized: Record<string, unknown> = {};
  for (const [key, rawValue] of Object.entries(params)) {
    const nextKey = LEGACY_PARAM_NAMES[key] ?? key;
    const value =
      typeof rawValue === "string"
        ? (LEGACY_VALUES[rawValue] ?? rawValue)
        : rawValue;
    normalized[nextKey] = value;
  }
  if (event === "source_click") normalized.source_type = "official";
  return { event, params: normalized };
}
