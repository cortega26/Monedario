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
