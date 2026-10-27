import { describe, expect, it } from "vitest";
import { findChangedValues } from "../../scripts/economic-history-guards.mjs";

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
