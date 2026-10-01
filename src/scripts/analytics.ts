import {
  cleanAnalyticsParams,
  getAnalyticsEventNameForCta,
  getEditorialImageAnalyticsParams,
  getReachedScrollMilestones,
  isOfficialSourceUrl,
  isTransmissibleEvent,
  sanitizeAnalyticsEvent,
  type AnalyticsEventParams,
} from "@/utils/analytics";

type Cleanup = () => void;
type IdleHandle =
  | { kind: "idle"; id: number }
  | { kind: "timeout"; id: ReturnType<typeof globalThis.setTimeout> };

const CLICK_HANDLER_FLAG = "data-analytics-click-handler-attached";
const CALCULATOR_VIEW_FLAG = "data-analytics-calculator-view-tracked";
let pageCleanup: Cleanup | null = null;
let pendingAnalyticsInit: IdleHandle | null = null;

// Events that are transmitted at most once per calculator per page-view.
// Recalculations (keystroke-driven re-runs) and prefill-driven synthetic
// input events must not inflate these counts past a single completion.
const ONCE_PER_VIEW_EVENTS = new Set(["calculator_complete"]);
let sentOncePerView = new Set<string>();
function resetOncePerViewDedup() {
  sentOncePerView = new Set();
}

function scheduleIdle(callback: () => void): IdleHandle {
  if ("requestIdleCallback" in window) {
    return {
      kind: "idle",
      id: window.requestIdleCallback(callback, { timeout: 1200 }),
    };
  }

  return { kind: "timeout", id: globalThis.setTimeout(callback, 120) };
}

function track(eventName: string, params: AnalyticsEventParams = {}) {
  const payload = cleanAnalyticsParams({
    page_path: window.location.pathname,
    page_type: getCurrentPageType(),
    ...params,
  });
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...payload });

  // First-party transport: only for allowlisted events, only when enabled.
  sendAnalyticsEvent(eventName, params);
}

function getCurrentPageType() {
  const typedElement = document.querySelector<HTMLElement>(
    "[data-analytics-page-type]"
  );
  return typedElement?.dataset.analyticsPageType ?? "unknown";
}

// ── First-party transport ───────────────────────────────────────────────────
// Contract: docs/backlog/PLAN-calculator-led-growth-2026-06-28.md §7
// ADR: docs/adr/ADR-20260628-first-party-analytics.md
//
// Sends sanitized events to the analytics collector Worker via POST.
// - Feature flag off by default.
// - Only transmissible events are sent.
// - Sanitized client-side; the Worker re-validates server-side.
// - Short timeout (3 s), keepalive, silent failure.
// - Never blocks navigation, calculation, or UI.

const COLLECTOR_ENDPOINT = "/api/analytics/event";
const TRANSPORT_TIMEOUT_MS = 3_000;

/**
 * Feature flag: disabled by default (plan §13 STOP condition 4).
 *
 * To enable in a test/dev environment, set:
 *   document.documentElement.dataset.analyticsTransport = "enabled"
 * or:
 *   window.__monedarioAnalyticsTransport = true
 *
 * Resolution order (ADR-20260921-production-only-transport):
 *  1. Explicit opt-in (`window.__monedarioAnalyticsTransport === true`) wins
 *     everywhere: unit/integration tests, manual preview verification and the
 *     Playwright accessibility suite all use it on non-production hosts.
 *  2. Otherwise the build-time DOM flag is the master switch: absent (or any
 *     value other than "enabled") means off.
 *  3. With the DOM flag on, only production hosts transmit. Preview
 *     deployments (*.pages.dev, branch deploys), local dev and E2E runners
 *     never pollute the production aggregates — no dashboard allowlist, no
 *     per-environment build matrix. Cloudflare Web Analytics (edge beacon,
 *     cookieless) remains the always-on baseline and needs no gate.
 */
const PRODUCTION_HOSTS = new Set(["monedario.cl", "www.monedario.cl"]);

function isTransportEnabled(): boolean {
  if (
    (window as unknown as Record<string, unknown>)
      .__monedarioAnalyticsTransport === true
  ) {
    return true;
  }
  if (document.documentElement.dataset.analyticsTransport !== "enabled") {
    return false;
  }
  return PRODUCTION_HOSTS.has(window.location.hostname.toLowerCase());
}

function sendAnalyticsEvent(
  eventName: string,
  params: AnalyticsEventParams
): void {
  // Gate 1: feature flag
  if (!isTransportEnabled()) return;

  // Gate 2: event must be transmissible
  if (!isTransmissibleEvent(eventName)) return;

  // Gate 2b: dedup once-per-view events (e.g. calculator_complete on recalcs)
  if (ONCE_PER_VIEW_EVENTS.has(eventName)) {
    const slug = String(
      (params as Record<string, unknown>).calculator_id ??
        (params as Record<string, unknown>).calculator_slug ??
        ""
    );
    const dedupKey = `${eventName}:${slug}`;
    if (sentOncePerView.has(dedupKey)) return;
    sentOncePerView.add(dedupKey);
  }

  // Gate 3: sanitize — this is the client-side boundary
  const sanitized = sanitizeAnalyticsEvent(eventName, {
    page_type: getCurrentPageType(),
    app_version: document.documentElement.dataset.appVersion,
    ...params,
  } as Record<string, unknown>);
  if (!sanitized) return;

  const body = JSON.stringify(sanitized);

  // Gate 4: size check (server also enforces, but early-exit saves bandwidth)
  if (body.length > 2048) return;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TRANSPORT_TIMEOUT_MS);

  fetch(COLLECTOR_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
    signal: controller.signal,
  })
    .catch(() => {
      // Silent failure: never throw, never block UI, never retry.
      // The event was already pushed to dataLayer for debugging.
    })
    .finally(() => {
      clearTimeout(timeoutId);
    });
}

function installGlobalClickTracking() {
  if (document.documentElement.hasAttribute(CLICK_HANDLER_FLAG)) {
    return;
  }

  document.documentElement.setAttribute(CLICK_HANDLER_FLAG, "true");
  document.addEventListener("click", event => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const ctaElement = target.closest<HTMLElement>("[data-analytics-cta]");
    if (ctaElement) {
      const href =
        ctaElement instanceof HTMLAnchorElement ? ctaElement.href : undefined;
      track(getAnalyticsEventNameForCta(ctaElement.dataset.analyticsCta), {
        cta_type: ctaElement.dataset.analyticsCta,
        cta_label:
          ctaElement.dataset.analyticsLabel ?? ctaElement.textContent?.trim(),
        cta_location: ctaElement.dataset.analyticsLocation,
        destination_url: href,
      });
    }

    const anchor = target.closest<HTMLAnchorElement>("a[href]");
    if (!anchor) return;
    if (!isOfficialSourceUrl(anchor.href)) return;

    track("source_click", {
      source_type: "official",
    });
  });
}

/** One exposure and click per public image/surface in the current page DOM.
 * Observe the image itself, excluding the card title from visible area.
 * A fast click qualifies as exposure only if at least half the image is visible.
 */
function initEditorialImageTracking(): Cleanup {
  if (!("IntersectionObserver" in window)) return () => {};
  const viewportWidth = window.innerWidth;
  const seen = new Set<string>();
  const clicked = new Set<string>();
  const timers = new Map<HTMLImageElement, ReturnType<typeof setTimeout>>();
  const candidates = new Map<
    HTMLImageElement,
    { key: string; params: Record<string, string> }
  >();
  const cleanups: Cleanup[] = [];

  function visible(image: HTMLImageElement) {
    if (
      document.visibilityState === "hidden" ||
      !image.isConnected ||
      !image.complete ||
      image.naturalWidth === 0
    )
      return false;
    const rect = image.getBoundingClientRect();
    const area = rect.width * rect.height;
    const width = Math.max(
      0,
      Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0)
    );
    const height = Math.max(
      0,
      Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
    );
    return area > 0 && (width * height) / area >= 0.5;
  }

  function cancel(image: HTMLImageElement) {
    clearTimeout(timers.get(image));
    timers.delete(image);
  }

  function expose(image: HTMLImageElement) {
    const candidate = candidates.get(image);
    if (!candidate || seen.has(candidate.key)) return;
    seen.add(candidate.key);
    cancel(image);
    track("editorial_image_impression", candidate.params);
  }

  function consider(image: HTMLImageElement) {
    const candidate = candidates.get(image);
    if (!candidate || seen.has(candidate.key)) return;
    if (!visible(image)) {
      cancel(image);
      return;
    }
    if (timers.has(image)) return;
    timers.set(
      image,
      setTimeout(() => {
        timers.delete(image);
        if (visible(image)) expose(image);
      }, 1000)
    );
  }

  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        const image = entry.target as HTMLImageElement;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5)
          consider(image);
        else cancel(image);
      }
    },
    { threshold: [0, 0.5] }
  );

  for (const wrapper of document.querySelectorAll<HTMLElement>(
    "[data-image-version][data-image-article][data-image-surface]"
  )) {
    const image = wrapper.querySelector("img");
    const params = getEditorialImageAnalyticsParams(
      wrapper.dataset,
      viewportWidth
    );
    if (!image || !params) continue;
    const key = `${params.article_slug}:${params.image_surface}:${params.image_version}`;
    candidates.set(image, { key, params });
    observer.observe(image);
    const handleLoad = () => consider(image);
    image.addEventListener("load", handleLoad);
    cleanups.push(() => image.removeEventListener("load", handleLoad));
    if (wrapper instanceof HTMLAnchorElement) {
      const handleClick = (event: MouseEvent) => {
        if (event.type === "auxclick" && event.button !== 1) return;
        if (document.visibilityState === "hidden" || clicked.has(key)) return;
        if (!seen.has(key)) {
          if (!visible(image)) return;
          expose(image);
        }
        clicked.add(key);
        track("editorial_image_click", params);
      };
      wrapper.addEventListener("click", handleClick);
      wrapper.addEventListener("auxclick", handleClick);
      cleanups.push(() => {
        wrapper.removeEventListener("click", handleClick);
        wrapper.removeEventListener("auxclick", handleClick);
      });
    }
  }
  const handleVisibility = () => {
    for (const image of candidates.keys()) consider(image);
  };
  document.addEventListener("visibilitychange", handleVisibility);
  return () => {
    observer.disconnect();
    for (const image of timers.keys()) cancel(image);
    for (const cleanup of cleanups) cleanup();
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}

function initArticleScrollTracking(): Cleanup {
  const article = document.querySelector<HTMLElement>(
    "[data-analytics-article]"
  );
  if (!article) return () => {};

  const firedMilestones = new Set<number>();
  const articleSlug = article.dataset.analyticsArticle;
  const articleTitle = article.dataset.analyticsArticleTitle;
  const hero = document.querySelector<HTMLElement>(
    '[data-image-surface="article_hero"]'
  );
  const imageParams = hero
    ? getEditorialImageAnalyticsParams(hero.dataset, window.innerWidth)
    : null;

  const handleScroll = () => {
    const maxScrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    if (maxScrollableHeight <= 0) return;

    const progress = (window.scrollY / maxScrollableHeight) * 100;

    for (const milestone of getReachedScrollMilestones(progress)) {
      if (firedMilestones.has(milestone)) continue;
      firedMilestones.add(milestone);
      track("article_scroll_depth", {
        ...imageParams,
        article_slug: articleSlug,
        article_title: articleTitle,
        // Stringificado: el contrato solo acepta strings acotados (enum
        // scroll_depth_percent); el número crudo se descartaría en silencio
        // en el sanitizador y rechazaría el evento en el worker (plan 100).
        scroll_depth_percent: String(milestone),
      });
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}

function initCalculatorStartTracking(): Cleanup {
  const calculatorRoot = document.querySelector<HTMLElement>(
    "[data-analytics-calculator]"
  );
  if (!calculatorRoot) return () => {};

  let hasStarted = false;
  const calculatorSlug = calculatorRoot.dataset.analyticsCalculator;
  const calculatorName = calculatorRoot.dataset.analyticsCalculatorName;

  if (!calculatorRoot.hasAttribute(CALCULATOR_VIEW_FLAG)) {
    calculatorRoot.setAttribute(CALCULATOR_VIEW_FLAG, "true");
    track("calculator_view", {
      page_type: "calculator",
      calculator_id: calculatorSlug,
    });
  }

  const startTracking = (interactionType: string) => {
    if (hasStarted) return;
    hasStarted = true;
    track("calculator_start", {
      calculator_id: calculatorSlug,
      calculator_name: calculatorName,
      interaction_variant: interactionType,
    });
  };

  const handleFocusIn = (event: Event) => {
    if ((event.target as Element | null)?.closest("input, select, textarea")) {
      startTracking("focus");
    }
  };

  const handleInput = (event: Event) => {
    if ((event.target as Element | null)?.closest("input, select, textarea")) {
      startTracking("input");
    }
  };

  const handleClick = (event: Event) => {
    if ((event.target as Element | null)?.closest("button")) {
      startTracking("button");
    }
  };

  calculatorRoot.addEventListener("focusin", handleFocusIn);
  calculatorRoot.addEventListener("input", handleInput);
  calculatorRoot.addEventListener("click", handleClick);

  return () => {
    calculatorRoot.removeEventListener("focusin", handleFocusIn);
    calculatorRoot.removeEventListener("input", handleInput);
    calculatorRoot.removeEventListener("click", handleClick);
  };
}

let trackedBody: HTMLElement | null = null;
function initPageTracking() {
  if (trackedBody === document.body) return;
  pageCleanup?.();
  trackedBody = document.body;
  const cleanups = [
    initArticleScrollTracking(),
    initCalculatorStartTracking(),
    initEditorialImageTracking(),
  ];
  pageCleanup = () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}

function initNonCriticalAnalytics() {
  installGlobalClickTracking();
  initPageTracking();
}

function scheduleAnalyticsInit() {
  if (pendingAnalyticsInit !== null) return;

  // Defers non-critical listeners until after the browser gets a chance to paint.
  pendingAnalyticsInit = scheduleIdle(() => {
    pendingAnalyticsInit = null;
    initNonCriticalAnalytics();
  });
}

window.monedarioAnalytics = {
  track,
};

scheduleAnalyticsInit();
document.addEventListener("astro:page-load", () => {
  resetOncePerViewDedup();
  scheduleAnalyticsInit();
});
document.addEventListener("astro:after-swap", () => {
  resetOncePerViewDedup();
  scheduleAnalyticsInit();
});

// End observation before Astro removes the old DOM, including pending idle work.
document.addEventListener("astro:before-swap", () => {
  pageCleanup?.();
  pageCleanup = null;
  trackedBody = null;
  if (pendingAnalyticsInit !== null) {
    if (pendingAnalyticsInit.kind === "idle") {
      window.cancelIdleCallback?.(pendingAnalyticsInit.id);
    } else {
      globalThis.clearTimeout(pendingAnalyticsInit.id);
    }
    pendingAnalyticsInit = null;
  }
});
