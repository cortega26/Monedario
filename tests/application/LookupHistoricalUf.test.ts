import { describe, expect, it } from "vitest";
import { lookupHistoricalUf } from "@/application/use-cases/LookupHistoricalUf";
import { ufHistoricoWorkedExample } from "@/application/use-cases/LookupHistoricalUf.methodology";

const BASE_LOOKUP: Record<string, number> = {
  "2000-01-01": 15067.93,
  "2010-06-14": 21120.0,
  "2010-06-15": 21131.22,
  "2026-07-09": 40844.79,
};
const FIRST = "2000-01-01";
const LAST = "2026-07-09";

describe("lookupHistoricalUf — coincidencia exacta", () => {
  it("retorna el valor exacto cuando la fecha existe", () => {
    const result = lookupHistoricalUf({
      date: "2010-06-15",
      lookup: BASE_LOOKUP,
      firstAvailableDate: FIRST,
      lastAvailableDate: LAST,
    });
    expect(result).toEqual({
      found: true,
      date: "2010-06-15",
      resolvedDate: "2010-06-15",
      value: 21131.22,
      isExactMatch: true,
    });
  });
});

describe("lookupHistoricalUf — fecha sin dato exacto", () => {
  it("retrocede al día anterior cuando la fecha exacta no está", () => {
    // 2010-06-16 no está en el lookup; retrocede a 2010-06-15
    const result = lookupHistoricalUf({
      date: "2010-06-16",
      lookup: BASE_LOOKUP,
      firstAvailableDate: FIRST,
      lastAvailableDate: LAST,
    });
    expect(result).toMatchObject({
      found: true,
      isExactMatch: false,
      resolvedDate: "2010-06-15",
      value: 21131.22,
    });
  });
});

describe("lookupHistoricalUf — fechas fuera de rango", () => {
  it("retorna before_range para fechas anteriores al dataset", () => {
    const result = lookupHistoricalUf({
      date: "1999-12-31",
      lookup: BASE_LOOKUP,
      firstAvailableDate: FIRST,
      lastAvailableDate: LAST,
    });
    expect(result).toEqual({ found: false, reason: "before_range" });
  });

  it("retorna after_range para fechas posteriores al dataset", () => {
    const result = lookupHistoricalUf({
      date: "2026-07-10",
      lookup: BASE_LOOKUP,
      firstAvailableDate: FIRST,
      lastAvailableDate: LAST,
    });
    expect(result).toEqual({ found: false, reason: "after_range" });
  });
});

describe("lookupHistoricalUf — anti-drift (ejemplo de metodología)", () => {
  it("la salida real coincide con el ejemplo publicado", () => {
    expect(lookupHistoricalUf(ufHistoricoWorkedExample.input)).toEqual(
      ufHistoricoWorkedExample.expected
    );
  });
});

describe("lookupHistoricalUf — fechas malformadas", () => {
  it.each(["2026-08-19T15:00:00", "2026-8-5", "not-a-date"])(
    "retorna no_data tipado para %s sin lanzar ni NaN",
    date => {
      const result = lookupHistoricalUf({
        date,
        lookup: BASE_LOOKUP,
        firstAvailableDate: FIRST,
        lastAvailableDate: LAST,
      });
      expect(result).toEqual({ found: false, reason: "no_data" });
    }
  );
});
