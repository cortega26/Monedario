// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";

import { sanitizeAnalyticsPayload } from "@/contracts/analytics-events";
import {
  emitApvError,
  resetApvErrorDedupe,
  type ApvErrorCategory,
} from "@/utils/apvErrorTelemetry";
import { validateEventPayload } from "../../workers/analytics-collector/src/index";

const CATEGORIES: readonly ApvErrorCategory[] = [
  "validation",
  "calculation",
  "network",
  "timeout",
  "stale_source",
];

function trackMock(): ReturnType<typeof vi.fn> {
  const track = window.monedarioAnalytics?.track;
  if (!track) throw new Error("monedarioAnalytics bridge not stubbed");
  return vi.mocked(track);
}

describe("apvErrorTelemetry", () => {
  beforeEach(() => {
    window.monedarioAnalytics = { track: vi.fn() };
    resetApvErrorDedupe();
  });

  it.each(CATEGORIES)(
    "forwards %s to the bridge with calculator_id apv",
    category => {
      emitApvError(category);

      expect(trackMock()).toHaveBeenCalledTimes(1);
      expect(trackMock()).toHaveBeenCalledWith("calculator_error", {
        calculator_id: "apv",
        error_category: category,
      });
    }
  );

  it("emits once for a repeated same-category error within an attempt", () => {
    emitApvError("validation");
    emitApvError("validation");

    expect(trackMock()).toHaveBeenCalledTimes(1);
  });

  it("emits once per category when two categories fail in one attempt", () => {
    emitApvError("validation");
    emitApvError("calculation");

    expect(trackMock()).toHaveBeenCalledTimes(2);
  });

  it("re-emits after reset (next attempt)", () => {
    emitApvError("validation");
    resetApvErrorDedupe();
    emitApvError("validation");

    expect(trackMock()).toHaveBeenCalledTimes(2);
  });

  it.each(["validation", "calculation", "stale_source"] as const)(
    "round-trips the %s payload through both sanitizers (strict)",
    category => {
      emitApvError(category);

      const [, params] = trackMock().mock.calls[0];
      expect(Object.keys(params ?? {}).sort()).toEqual([
        "calculator_id",
        "error_category",
      ]);
      const client = sanitizeAnalyticsPayload(
        "calculator_error",
        (params ?? {}) as Record<string, unknown>,
        { rejectUnknown: true }
      );
      expect(client).not.toBeNull();
      const server = validateEventPayload({
        event: client?.event,
        params: client?.params,
      });
      expect(server.valid).toBe(true);
      expect(server.event).toBe("calculator_error");
      expect(JSON.stringify(server.params)).not.toMatch(
        /message|monto|sueldo|result|valor/i
      );
    }
  );
});
