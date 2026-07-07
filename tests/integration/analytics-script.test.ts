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
});
