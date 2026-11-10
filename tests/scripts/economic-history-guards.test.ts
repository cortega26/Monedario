import { describe, expect, it } from "vitest";
import {
  entriesForYear,
  findChangedValues,
  shouldRefetchYear,
  withRetry,
} from "../../scripts/economic-history-guards.mjs";

const serie = (...entries: Array<[string, number]>) =>
  entries.map(([fecha, valor]) => ({ fecha, valor }));

describe("findChangedValues (ADR-20261026)", () => {
  it("returns nothing when the series only grows", () => {
    const prev = serie(["2026-01-01", 100], ["2026-01-02", 101]);
    const next = serie(
      ["2026-01-01", 100],
      ["2026-01-02", 101],
      ["2026-01-03", 102]
    );
    expect(findChangedValues(prev, next)).toEqual([]);
  });

  it("detects a revised value on an already-published date", () => {
    const prev = serie(["2026-01-01", 100], ["2026-01-02", 101]);
    const next = serie(["2026-01-01", 100], ["2026-01-02", 101.5]);
    expect(findChangedValues(prev, next)).toEqual([
      { fecha: "2026-01-02", previo: 101, nuevo: 101.5 },
    ]);
  });

  it("ignores dates that disappeared (that is findMissingDates' job)", () => {
    const prev = serie(["2026-01-01", 100], ["2026-01-02", 101]);
    const next = serie(["2026-01-01", 100]);
    expect(findChangedValues(prev, next)).toEqual([]);
  });

  it("reports every revision, not just the first", () => {
    const prev = serie(["2026-01-01", 100], ["2026-01-02", 101]);
    const next = serie(["2026-01-01", 999], ["2026-01-02", 888]);
    expect(findChangedValues(prev, next)).toHaveLength(2);
  });

  it("treats a same-value float re-read as unchanged", () => {
    const prev = serie(["2026-01-01", 41178.64]);
    const next = serie(["2026-01-01", 41178.64]);
    expect(findChangedValues(prev, next)).toEqual([]);
  });

  it("is defensive with missing or malformed input", () => {
    expect(findChangedValues(undefined, serie(["2026-01-01", 100]))).toEqual([]);
    expect(findChangedValues(serie(["2026-01-01", 100]), null)).toEqual([]);
    const malformed = [
      { fecha: null, valor: 1 },
    ] as unknown as Array<{ fecha: string; valor: number }>;
    expect(findChangedValues(malformed, serie(["2026-01-01", 2]))).toEqual([]);
  });
});

describe("withRetry", () => {
  const noSleep = async () => {};

  it("returns the first successful result without retrying", async () => {
    let calls = 0;
    const result = await withRetry(
      async () => {
        calls += 1;
        return "ok";
      },
      { sleep: noSleep }
    );
    expect(result).toBe("ok");
    expect(calls).toBe(1);
  });

  it("recovers from transient failures and backs off exponentially", async () => {
    let calls = 0;
    const waits: number[] = [];
    const result = await withRetry(
      async () => {
        calls += 1;
        if (calls < 3) throw new Error("HTTP 500");
        return "ok";
      },
      {
        attempts: 3,
        baseDelayMs: 100,
        sleep: async ms => {
          waits.push(ms);
        },
      }
    );
    expect(result).toBe("ok");
    expect(calls).toBe(3);
    expect(waits).toEqual([100, 200]);
  });

  it("rethrows the last error once the attempts are exhausted", async () => {
    let calls = 0;
    await expect(
      withRetry(
        async () => {
          calls += 1;
          throw new Error(`fallo ${calls}`);
        },
        { attempts: 3, sleep: noSleep }
      )
    ).rejects.toThrow("fallo 3");
    expect(calls).toBe(3);
  });
});

describe("entriesForYear", () => {
  const prev = serie(
    ["2008-12-01", 0.3],
    ["2009-01-01", 0.1],
    ["2009-02-01", -0.4],
    ["2010-01-01", 0.2]
  );

  it("returns only the entries of the requested calendar year", () => {
    expect(entriesForYear(prev, 2009)).toEqual(
      serie(["2009-01-01", 0.1], ["2009-02-01", -0.4])
    );
  });

  it("returns an empty list for unknown years or missing series", () => {
    expect(entriesForYear(prev, 1999)).toEqual([]);
    expect(entriesForYear(null, 2009)).toEqual([]);
    expect(entriesForYear(undefined, 2009)).toEqual([]);
  });
});

describe("shouldRefetchYear", () => {
  const previousSerie = serie(["2009-02-01", -0.4], ["2025-06-01", 0.2]);
  const base = { currentYear: 2026, previousSerie };

  it("always refetches the current and the previous year", () => {
    expect(shouldRefetchYear({ ...base, year: 2026 })).toBe(true);
    expect(shouldRefetchYear({ ...base, year: 2025 })).toBe(true);
  });

  it("skips closed years that are already published", () => {
    expect(shouldRefetchYear({ ...base, year: 2009 })).toBe(false);
  });

  it("fetches a closed year that has no published entries yet", () => {
    expect(shouldRefetchYear({ ...base, year: 2010 })).toBe(true);
    expect(
      shouldRefetchYear({ year: 2009, currentYear: 2026, previousSerie: null })
    ).toBe(true);
  });

  it("refetches everything when a full refetch is requested", () => {
    expect(shouldRefetchYear({ ...base, year: 2009, full: true })).toBe(true);
  });
});
