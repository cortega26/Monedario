import { describe, expect, it } from "vitest";
import {
  bcchDateToIso,
  findUfPlausibilityViolations,
  parseBcchUfDailyObservations,
} from "../../scripts/economic-history-bcch.mjs";

describe("bcchDateToIso", () => {
  it("converts the BCCh DD-MM-YYYY format", () => {
    expect(bcchDateToIso("09-11-2026")).toBe("2026-11-09");
    expect(bcchDateToIso("01-01-2000")).toBe("2000-01-01");
  });

  it("returns empty string for unusable input", () => {
    expect(bcchDateToIso("2026-11-09")).toBe("");
    expect(bcchDateToIso("")).toBe("");
    expect(bcchDateToIso(null)).toBe("");
  });
});

describe("parseBcchUfDailyObservations", () => {
  it("parses and sorts ascending", () => {
    const parsed = parseBcchUfDailyObservations([
      { indexDateString: "27-10-2026", value: "41226.39", statusCode: "OK" },
      { indexDateString: "25-10-2026", value: "41215.77", statusCode: "OK" },
    ]);
    expect(parsed).toEqual([
      { fecha: "2026-10-25", valor: 41215.77 },
      { fecha: "2026-10-27", valor: 41226.39 },
    ]);
  });

  it("preserves two decimals — must NOT round like the IPC parser", () => {
    // El parser de IPC redondea a 1 decimal (variación mensual). Aplicarlo aquí
    // convertiría 41189.24 en 41189.2 y corrompería 25 años de serie.
    const [entry] = parseBcchUfDailyObservations([
      { indexDateString: "20-10-2026", value: "41189.24", statusCode: "OK" },
    ]);
    expect(entry.valor).toBe(41189.24);
    expect(entry.valor).not.toBe(41189.2);
  });

  it("normalises BCCh float noise to 2 decimals", () => {
    // El BCCh emite "23040.939999999"; el SII publica 23.040,94 para esa fecha.
    const [entry] = parseBcchUfDailyObservations([
      { indexDateString: "01-09-2013", value: "23040.939999999", statusCode: "OK" },
    ]);
    expect(entry.valor).toBe(23040.94);
  });

  it("keeps 608.15 exact (the value the aggregator corrupted)", () => {
    const [entry] = parseBcchUfDailyObservations([
      { indexDateString: "29-12-2014", value: "24627.1", statusCode: "OK" },
    ]);
    expect(entry.valor).toBe(24627.1);
  });

  it("skips rows with a published non-OK statusCode", () => {
    const parsed = parseBcchUfDailyObservations([
      { indexDateString: "01-01-2026", value: "40000", statusCode: "OK" },
      { indexDateString: "02-01-2026", value: "", statusCode: "ND" },
    ]);
    expect(parsed).toHaveLength(1);
  });

  it("accepts rows with no statusCode (a 27-year daily series cannot afford holes)", () => {
    const parsed = parseBcchUfDailyObservations([
      { indexDateString: "01-01-2026", value: "40000" },
    ]);
    expect(parsed).toEqual([{ fecha: "2026-01-01", valor: 40000 }]);
  });

  it("throws on duplicate dates instead of silently picking one", () => {
    expect(() =>
      parseBcchUfDailyObservations([
        { indexDateString: "01-01-2026", value: "40000", statusCode: "OK" },
        { indexDateString: "01-01-2026", value: "40001", statusCode: "OK" },
      ])
    ).toThrow(/duplicada/);
  });

  it("throws on a non-numeric value", () => {
    expect(() =>
      parseBcchUfDailyObservations([
        { indexDateString: "01-01-2026", value: "n/a", statusCode: "OK" },
      ])
    ).toThrow(/no numérico/);
  });

  it("is defensive with empty or missing observations", () => {
    expect(parseBcchUfDailyObservations(undefined)).toEqual([]);
    expect(parseBcchUfDailyObservations([])).toEqual([]);
  });
});

describe("findUfPlausibilityViolations", () => {
  it("catches the 2014 corruption that shipped for years", () => {
    const serie = [
      { fecha: "2014-12-28", valor: 24627.1 },
      { fecha: "2014-12-29", valor: 608.15 },
    ];
    const violations = findUfPlausibilityViolations(serie);
    expect(violations).toHaveLength(1);
    expect(violations[0].fecha).toBe("2014-12-29");
    expect(violations[0].pct).toBeGreaterThan(0.9);
  });

  it("accepts a normal series", () => {
    const serie = [
      { fecha: "2026-10-25", valor: 41215.77 },
      { fecha: "2026-10-26", valor: 41221.08 },
      { fecha: "2026-10-27", valor: 41226.39 },
    ];
    expect(findUfPlausibilityViolations(serie)).toEqual([]);
  });

  it("tolerates small day-to-day moves", () => {
    const serie = [
      { fecha: "2026-01-01", valor: 40000 },
      { fecha: "2026-01-02", valor: 40200 }, // +0.5%
    ];
    expect(findUfPlausibilityViolations(serie)).toEqual([]);
  });

  it("ignores a zero baseline instead of dividing by it", () => {
    const serie = [
      { fecha: "2026-01-01", valor: 0 },
      { fecha: "2026-01-02", valor: 40000 },
    ];
    expect(findUfPlausibilityViolations(serie)).toEqual([]);
  });
});
