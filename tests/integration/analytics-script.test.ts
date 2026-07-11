// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("analytics browser script", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    document.body.innerHTML = "";
    document.documentElement.removeAttribute(
      "data-analytics-click-handler-attached"
    );
    document.documentElement.dataset.analyticsTransport = "enabled";
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
          calculator_slug: "seguro-cesantia",
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
      calculator_slug: "sueldo-liquido",
      outcome_class: "success",
    });
    window.monedarioAnalytics?.track("calculator_complete", {
      calculator_slug: "sueldo-liquido",
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
      calculator_slug: "sueldo-liquido",
      outcome_class: "success",
    });

    document.dispatchEvent(new Event("astro:page-load"));
    await vi.runOnlyPendingTimersAsync();

    window.monedarioAnalytics?.track("calculator_complete", {
      calculator_slug: "sueldo-liquido",
      outcome_class: "success",
    });

    const fetchMock = vi.mocked(window.fetch);
    const completePayloads = fetchMock.mock.calls
      .map(call => JSON.parse(String(call[1]?.body)))
      .filter(payload => payload.event === "calculator_complete");

    expect(completePayloads).toHaveLength(2);
  });

  it("does not dedupe calculator_start (not in ONCE_PER_VIEW_EVENTS)", async () => {
    await import("../../src/scripts/analytics");
    await vi.runOnlyPendingTimersAsync();

    window.monedarioAnalytics?.track("calculator_start", {
      calculator_slug: "sueldo-liquido",
      interaction_type: "input",
    });
    window.monedarioAnalytics?.track("calculator_start", {
      calculator_slug: "sueldo-liquido",
      interaction_type: "input",
    });

    const fetchMock = vi.mocked(window.fetch);
    const startPayloads = fetchMock.mock.calls
      .map(call => JSON.parse(String(call[1]?.body)))
      .filter(payload => payload.event === "calculator_start");

    expect(startPayloads).toHaveLength(2);
  });
});
