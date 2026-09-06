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

  it("allows only seven days of month-boundary grace (Chilean calendar)", () => {
    expect(
      evaluateCriticalMonthlyFreshness(
        "2026-07-01",
        new Date("2026-08-07T23:59:00Z")
      ).status
    ).toBe("grace");
    // 2026-08-08T00:00Z es aún 2026-08-07 en Chile (20:00): día local 7 → grace.
    // El día 8 chileno empieza a las 04:00Z.
    expect(
      evaluateCriticalMonthlyFreshness(
        "2026-07-01",
        new Date("2026-08-08T04:30:00Z")
      ).status
    ).toBe("stale");
  });

  it("does not declare stale up to 4h before the grace expires in Chile (month boundary)", () => {
    // 2026-09-08T00:30Z = 2026-09-07T20:30 en Chile: día local 7 ≤ gracia.
    // Con getUTC*() este caso daba "stale" (día UTC 8 > 7) — el bug del plan.
    expect(
      evaluateCriticalMonthlyFreshness(
        "2026-08-01",
        new Date("2026-09-08T00:30:00Z"),
        7
      ).status
    ).toBe("grace");
  });

  it("keeps the same verdict for non-boundary instants (regression)", () => {
    // Mediodía UTC del día 10: día 10 tanto en UTC como en Chile → stale.
    expect(
      evaluateCriticalMonthlyFreshness(
        "2026-08-01",
        new Date("2026-09-10T12:00:00Z"),
        7
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

  it("marks 2-month-old indicators as stale even inside the grace week", () => {
    expect(
      evaluateCriticalMonthlyFreshness(
        "2026-07-01",
        new Date("2026-09-05T15:00:00Z")
      ).status
    ).toBe("stale");
  });

  it("marks 3-month-old indicators as stale even inside the grace week", () => {
    expect(
      evaluateCriticalMonthlyFreshness(
        "2026-06-01",
        new Date("2026-09-05T15:00:00Z")
      ).status
    ).toBe("stale");
  });

  it("grants grace only to the previous month on day <= 7", () => {
    expect(
      evaluateCriticalMonthlyFreshness(
        "2026-08-01",
        new Date("2026-09-05T15:00:00Z")
      ).status
    ).toBe("grace");
  });

  it("marks the previous month as stale from day 8 onward", () => {
    expect(
      evaluateCriticalMonthlyFreshness(
        "2026-08-01",
        new Date("2026-09-10T15:00:00Z")
      ).status
    ).toBe("stale");
  });

  it("handles the January to previous-December boundary", () => {
    expect(
      evaluateCriticalMonthlyFreshness(
        "2025-12-01",
        new Date("2026-01-05T15:00:00Z")
      ).status
    ).toBe("grace");
    expect(
      evaluateCriticalMonthlyFreshness(
        "2025-11-01",
        new Date("2026-01-05T15:00:00Z")
      ).status
    ).toBe("stale");
    expect(
      evaluateCriticalMonthlyFreshness(
        "2025-10-01",
        new Date("2026-01-05T15:00:00Z")
      ).status
    ).toBe("stale");
    expect(
      evaluateCriticalMonthlyFreshness(
        "2025-12-01",
        new Date("2026-01-10T15:00:00Z")
      ).status
    ).toBe("stale");
  });
});
