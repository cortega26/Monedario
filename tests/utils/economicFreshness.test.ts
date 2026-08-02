import { describe, expect, it } from "vitest";
import { evaluateCriticalMonthlyFreshness } from "@/utils/economicFreshness";

describe("evaluateCriticalMonthlyFreshness", () => {
  it("accepts the current reference month", () => {
    expect(
      evaluateCriticalMonthlyFreshness(
        "2026-08-01",
        new Date("2026-08-20T12:00:00Z")
      ).status
    ).toBe("fresh");
  });

  it("allows only seven days of month-boundary grace", () => {
    expect(
      evaluateCriticalMonthlyFreshness(
        "2026-07-01",
        new Date("2026-08-07T23:59:00Z")
      ).status
    ).toBe("grace");
    expect(
      evaluateCriticalMonthlyFreshness(
        "2026-07-01",
        new Date("2026-08-08T00:00:00Z")
      ).status
    ).toBe("stale");
  });

  it("rejects invalid and future dates", () => {
    expect(
      evaluateCriticalMonthlyFreshness("invalid", new Date("2026-08-02"))
        .status
    ).toBe("stale");
    expect(
      evaluateCriticalMonthlyFreshness("2026-09-01", new Date("2026-08-02"))
        .status
    ).toBe("stale");
  });
});
