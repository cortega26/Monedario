import { describe, expect, it } from "vitest";
import {
  buildUfDateUrl,
  fetchHistoricalUf,
  UF_HISTORY_LOOKBACK_DAYS,
  type UfHistoryFetch,
} from "@/application/use-cases/FetchHistoricalUf";
import { lookupHistoricalUf } from "@/application/use-cases/LookupHistoricalUf";

const ENDPOINT = "/api/uf-historico-lookup.json";
const FIRST = "2026-01-01";
const LAST = "2026-01-10";

function stubFetch(
  impl: (isoDate: string) => { status: number; row?: unknown }
): { fetchFn: UfHistoryFetch; calls: string[] } {
  const calls: string[] = [];
  const fetchFn: UfHistoryFetch = async url => {
    calls.push(url);
    const isoDate = new URL(url, "http://localhost").searchParams.get("date");
    const found = impl(isoDate ?? "");
    return {
      status: found.status,
      json: async () => found.row,
    };
  };
  return { fetchFn, calls };
}

describe("buildUfDateUrl", () => {
  it("construye el query ?date=", () => {
    expect(buildUfDateUrl(ENDPOINT, "2026-01-05")).toBe(
      "/api/uf-historico-lookup.json?date=2026-01-05"
    );
  });
});

describe("fetchHistoricalUf", () => {
  it("resuelve el match exacto con un solo fetch", async () => {
    const { fetchFn, calls } = stubFetch(() => ({
      status: 200,
      row: { fecha: "2026-01-05", valor: 40005, first: FIRST, last: LAST },
    }));
    const result = await fetchHistoricalUf(
      fetchFn,
      ENDPOINT,
      "2026-01-05",
      FIRST,
      LAST
    );
    expect(result).toEqual({
      found: true,
      date: "2026-01-05",
      resolvedDate: "2026-01-05",
      value: 40005,
      isExactMatch: true,
    });
    expect(calls).toHaveLength(1);
  });

  it("retrocede al día previo disponible (fallback 7 días)", async () => {
    const { fetchFn, calls } = stubFetch(isoDate =>
      isoDate === "2026-01-04"
        ? {
            status: 200,
            row: { fecha: "2026-01-04", valor: 40004, first: FIRST, last: LAST },
          }
        : { status: 404 }
    );
    const result = await fetchHistoricalUf(
      fetchFn,
      ENDPOINT,
      "2026-01-05",
      FIRST,
      LAST
    );
    expect(result).toEqual({
      found: true,
      date: "2026-01-05",
      resolvedDate: "2026-01-04",
      value: 40004,
      isExactMatch: false,
    });
    expect(calls).toHaveLength(2);
  });

  it("acota los intentos a 8 (exacto + 7 atrás)", async () => {
    const { fetchFn, calls } = stubFetch(() => ({ status: 404 }));
    const result = await fetchHistoricalUf(
      fetchFn,
      ENDPOINT,
      "2026-01-10",
      FIRST,
      LAST
    );
    expect(result).toEqual({ found: false, reason: "no_data" });
    expect(calls).toHaveLength(UF_HISTORY_LOOKBACK_DAYS + 1);
    expect(UF_HISTORY_LOOKBACK_DAYS).toBe(7);
  });

  it("no fetchea fuera de rango", async () => {
    const { fetchFn, calls } = stubFetch(() => ({ status: 200, row: {} }));
    await expect(
      fetchHistoricalUf(fetchFn, ENDPOINT, "2025-12-31", FIRST, LAST)
    ).resolves.toEqual({ found: false, reason: "before_range" });
    await expect(
      fetchHistoricalUf(fetchFn, ENDPOINT, "2026-01-11", FIRST, LAST)
    ).resolves.toEqual({ found: false, reason: "after_range" });
    expect(calls).toHaveLength(0);
  });

  it("reporta network_error si el fetch rechaza", async () => {
    const fetchFn: UfHistoryFetch = async () => {
      throw new Error("offline");
    };
    await expect(
      fetchHistoricalUf(fetchFn, ENDPOINT, "2026-01-05", FIRST, LAST)
    ).resolves.toEqual({ found: false, reason: "network_error" });
  });

  it("status no-200/no-404 es no_data sin reintentar", async () => {
    const { fetchFn, calls } = stubFetch(() => ({ status: 500 }));
    await expect(
      fetchHistoricalUf(fetchFn, ENDPOINT, "2026-01-05", FIRST, LAST)
    ).resolves.toEqual({ found: false, reason: "no_data" });
    expect(calls).toHaveLength(1);
  });

  it("body 200 malformado es no_data", async () => {
    const { fetchFn } = stubFetch(() => ({ status: 200, row: { x: 1 } }));
    await expect(
      fetchHistoricalUf(fetchFn, ENDPOINT, "2026-01-05", FIRST, LAST)
    ).resolves.toEqual({ found: false, reason: "no_data" });
  });

  it("respeta el borde inferior del rango al retroceder", async () => {
    const { fetchFn, calls } = stubFetch(() => ({ status: 404 }));
    const result = await fetchHistoricalUf(
      fetchFn,
      ENDPOINT,
      "2026-01-02",
      FIRST,
      LAST
    );
    expect(result).toEqual({ found: false, reason: "no_data" });
    // 2026-01-02 y 2026-01-01; al retroceder más se sale del rango
    expect(calls).toHaveLength(2);
  });

  it("paridad con lookupHistoricalUf (regla de 7 días)", async () => {
    const lookup: Record<string, number> = {
      "2026-01-01": 40001,
      "2026-01-02": 40002,
      // hueco 03–04
      "2026-01-05": 40005,
    };
    const { fetchFn } = stubFetch(isoDate =>
      lookup[isoDate] === undefined
        ? { status: 404 }
        : {
            status: 200,
            row: {
              fecha: isoDate,
              valor: lookup[isoDate],
              first: FIRST,
              last: LAST,
            },
          }
    );
    for (const date of ["2026-01-02", "2026-01-03", "2026-01-04", "2026-01-05"]) {
      const expected = lookupHistoricalUf({
        date,
        lookup,
        firstAvailableDate: FIRST,
        lastAvailableDate: LAST,
      });
      const actual = await fetchHistoricalUf(
        fetchFn,
        ENDPOINT,
        date,
        FIRST,
        LAST
      );
      expect(actual).toEqual(expected);
    }
    // hueco mayor a 7 días: ambos agotan sin dato
    const sparse: Record<string, number> = { "2026-01-01": 40001 };
    const sparseFetch = stubFetch(() => ({ status: 404 }));
    const expected = lookupHistoricalUf({
      date: "2026-01-10",
      lookup: sparse,
      firstAvailableDate: FIRST,
      lastAvailableDate: LAST,
    });
    const actual = await fetchHistoricalUf(
      sparseFetch.fetchFn,
      ENDPOINT,
      "2026-01-10",
      FIRST,
      LAST
    );
    expect(expected).toEqual({ found: false, reason: "no_data" });
    expect(actual).toEqual(expected);
    expect(sparseFetch.calls).toHaveLength(8);
  });
});
