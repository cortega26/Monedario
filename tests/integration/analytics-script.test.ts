// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function setHostname(hostname: string): void {
  const happyDOM = (
    window as unknown as { happyDOM?: { setURL?: (url: string) => void } }
  ).happyDOM;
  if (happyDOM?.setURL) {
    happyDOM.setURL(`https://${hostname}/calculadoras/sueldo-liquido/`);
    return;
  }
  Object.defineProperty(window, "location", {
    value: new URL(`https://${hostname}/calculadoras/sueldo-liquido/`),
    configurable: true,
  });
}

describe("analytics browser script", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    document.body.innerHTML = "";
    document.documentElement.removeAttribute(
      "data-analytics-click-handler-attached"
    );
    document.documentElement.dataset.analyticsTransport = "enabled";
    // Explicit opt-in: the hostname gate (ADR-20260921-production-only-
    // transport) blocks localhost, so tests simulate an opted-in
    // environment — same mechanism as the Playwright accessibility suite.
    (window as unknown as Record<string, unknown>).__monedarioAnalyticsTransport =
      true;
    window.dataLayer = [];
    window.requestIdleCallback = callback =>
      window.setTimeout(
        () => callback({ didTimeout: false, timeRemaining: () => 0 }),
        0
      );
    window.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 202 }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.documentElement.dataset.analyticsTransport = undefined;
    delete (window as unknown as Record<string, unknown>)
      .__monedarioAnalyticsTransport;
    delete (window as unknown as { requestIdleCallback?: unknown })
      .requestIdleCallback;
  });

  it("sends one calculator_view event when a calculator page initializes", async () => {
    document.body.innerHTML = `
      <main
        data-analytics-page-type="calculator"
        data-analytics-calculator="seguro-cesantia"
        data-analytics-calculator-name="Calculadora de Seguro de Cesantia"
      >
        <input id="salary" />
      </main>
    `;

    await import("../../src/scripts/analytics");
    await vi.runOnlyPendingTimersAsync();

    document.dispatchEvent(new Event("astro:page-load"));
    await vi.runOnlyPendingTimersAsync();

    const fetchMock = vi.mocked(window.fetch);
    const payloads = fetchMock.mock.calls.map(call =>
      JSON.parse(String(call[1]?.body))
    );
    const viewPayloads = payloads.filter(
      payload => payload.event === "calculator_view"
    );

    expect(viewPayloads).toEqual([
      {
        event: "calculator_view",
        params: {
          page_type: "calculator",
          calculator_id: "seguro-cesantia",
        },
      },
    ]);
    const dataLayer = (window.dataLayer ?? []) as Array<{ event?: string }>;
    expect(dataLayer.filter(entry => entry.event === "calculator_view")).toHaveLength(1);
  });

  it("dedupes calculator_complete to one POST per page-view for the same slug", async () => {
    await import("../../src/scripts/analytics");
    await vi.runOnlyPendingTimersAsync();

    window.monedarioAnalytics?.track("calculator_complete", {
      calculator_id: "sueldo-liquido",
      outcome_class: "success",
    });
    window.monedarioAnalytics?.track("calculator_complete", {
      calculator_id: "sueldo-liquido",
      outcome_class: "success",
    });

    const fetchMock = vi.mocked(window.fetch);
    const completePayloads = fetchMock.mock.calls
      .map(call => JSON.parse(String(call[1]?.body)))
      .filter(payload => payload.event === "calculator_complete");

    expect(completePayloads).toHaveLength(1);
  });

  it("re-allows calculator_complete after astro:page-load resets the dedup", async () => {
    await import("../../src/scripts/analytics");
    await vi.runOnlyPendingTimersAsync();

    window.monedarioAnalytics?.track("calculator_complete", {
      calculator_id: "sueldo-liquido",
      outcome_class: "success",
    });

    document.dispatchEvent(new Event("astro:page-load"));
    await vi.runOnlyPendingTimersAsync();

    window.monedarioAnalytics?.track("calculator_complete", {
      calculator_id: "sueldo-liquido",
      outcome_class: "success",
    });

    const fetchMock = vi.mocked(window.fetch);
    const completePayloads = fetchMock.mock.calls
      .map(call => JSON.parse(String(call[1]?.body)))
      .filter(payload => payload.event === "calculator_complete");

    expect(completePayloads).toHaveLength(2);
  });

  it("does not dedupe calculator_start (not in ONCE_PER_VIEW_EVENTS)", async () => {    await import("../../src/scripts/analytics");
    await vi.runOnlyPendingTimersAsync();

    window.monedarioAnalytics?.track("calculator_start", {
      calculator_id: "sueldo-liquido",
      interaction_type: "input",
    });
    window.monedarioAnalytics?.track("calculator_start", {
      calculator_id: "sueldo-liquido",
      interaction_type: "input",
    });

    const fetchMock = vi.mocked(window.fetch);
    const startPayloads = fetchMock.mock.calls
      .map(call => JSON.parse(String(call[1]?.body)))
      .filter(payload => payload.event === "calculator_start");

    expect(startPayloads).toHaveLength(2);
  });

  it("does not POST on non-production hosts even with the DOM flag enabled", async () => {
    delete (window as unknown as Record<string, unknown>)
      .__monedarioAnalyticsTransport;
    setHostname("monedario-cl.pages.dev");

    await import("../../src/scripts/analytics");
    await vi.runOnlyPendingTimersAsync();

    window.monedarioAnalytics?.track("calculator_start", {
      calculator_id: "sueldo-liquido",
      interaction_variant: "input",
    });

    expect(vi.mocked(window.fetch)).not.toHaveBeenCalled();
    // dataLayer still records locally: observability without transmission.
    const dataLayer = (window.dataLayer ?? []) as Array<{ event?: string }>;
    expect(
      dataLayer.filter(entry => entry.event === "calculator_start")
    ).toHaveLength(1);
  });

  it("POSTs on the production host with the DOM flag enabled", async () => {
    delete (window as unknown as Record<string, unknown>)
      .__monedarioAnalyticsTransport;
    setHostname("monedario.cl");

    await import("../../src/scripts/analytics");
    await vi.runOnlyPendingTimersAsync();

    window.monedarioAnalytics?.track("calculator_start", {
      calculator_id: "sueldo-liquido",
      interaction_variant: "input",
    });

    expect(vi.mocked(window.fetch)).toHaveBeenCalledTimes(1);
  });

  it("window opt-in overrides the hostname gate (preview verification)", async () => {
    setHostname("localhost");

    await import("../../src/scripts/analytics");
    await vi.runOnlyPendingTimersAsync();

    window.monedarioAnalytics?.track("calculator_start", {
      calculator_id: "sueldo-liquido",
      interaction_variant: "input",
    });

    // beforeEach opts in via window.__monedarioAnalyticsTransport.
    expect(vi.mocked(window.fetch)).toHaveBeenCalledTimes(1);
  });
});
