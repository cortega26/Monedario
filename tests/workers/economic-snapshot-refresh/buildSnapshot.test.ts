import { describe, expect, it, vi } from "vitest";
import {
  assertPlausibleDelta,
  buildSnapshot,
  fetchDecemberUtmWithSiiFallback,
  getUtaReferenceYear,
  mergePrev,
  serializeSnapshot,
  type EconomicSnapshot,
  type MindicadorApiResponse,
} from "../../../workers/economic-snapshot-refresh/src/buildSnapshot";

const fixedNow = new Date("2026-05-16T12:00:00.000Z");

const sampleApi: MindicadorApiResponse = {
  fecha: "2026-05-16T03:00:00.000Z",
  uf: { valor: 40357.67, fecha: "2026-05-16T03:00:00.000Z" },
  utm: { valor: 70588, fecha: "2026-05-01T03:00:00.000Z" },
  ipc: { valor: -0.2, fecha: "2025-12-01T03:00:00.000Z" },
  tmc: { valor: 3.49 },
  dolar: { valor: 891, fecha: "2026-05-15T03:00:00.000Z" },
};

function makeDeps(overrides: Partial<{
    api: MindicadorApiResponse;
    decemberUtm: number | null;
    now: Date;
  }> = {}) {
  const api = overrides.api ?? sampleApi;
  return {
    fetchApi: async () => api,
    fetchDecemberUtm: async (year: number) => {
      void year;
      return overrides.decemberUtm !== undefined
        ? overrides.decemberUtm
        : 69542;
    },
    now: () => overrides.now ?? fixedNow,
  };
}

describe("getUtaReferenceYear", () => {
  it("returns previous calendar year", () => {
    expect(getUtaReferenceYear(new Date("2026-01-01T00:00:00Z"))).toBe(2025);
    expect(getUtaReferenceYear(new Date("2026-12-31T23:59:00Z"))).toBe(2025);
    expect(getUtaReferenceYear(new Date("2027-03-15T00:00:00Z"))).toBe(2026);
  });
});

describe("fetchDecemberUtmWithSiiFallback", () => {
  const SII_URL = "https://www.sii.cl/valores_y_fechas/utm/utm2025.htm";

  it("falls back to the SII December row when mindicador fails", async () => {
    const fetchImpl = async (url: string | URL | Request) => {
      const href = String(url);
      if (href.includes("/utm/2025")) {
        return new Response(null, { status: 503 });
      }
      if (href === SII_URL) {
        return new Response(
          "<table><tr><th>Diciembre</th><td>37.000</td></tr></table>"
        );
      }
      throw new Error(`unexpected URL: ${href}`);
    };

    const value = await fetchDecemberUtmWithSiiFallback(
      fetchImpl as typeof fetch,
      "https://mindicador.cl/api",
      5000,
      2025,
    );

    expect(value).toBe(37000);
  });

  it("returns null when both mindicador and SII fail", async () => {
    const fetchImpl = async () => new Response(null, { status: 503 });

    const value = await fetchDecemberUtmWithSiiFallback(
      fetchImpl as typeof fetch,
      "https://mindicador.cl/api",
      5000,
      2025,
    );

    expect(value).toBeNull();
  });

  it("regression: null December UTM still yields UTM × 12, now with an explicit warn", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const snapshot = await buildSnapshot(makeDeps({ decemberUtm: null }));
      expect(snapshot.uta).toBe(70588 * 12);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("UTA fallback")
      );
    } finally {
      warnSpy.mockRestore();
    }
  });
});

describe("buildSnapshot", () => {
  it("produces a snapshot matching the published shape", async () => {
    const snapshot = await buildSnapshot(makeDeps());
    expect(snapshot.uf).toBe(40357.67);
    expect(snapshot.utm).toBe(70588);
    expect(snapshot.uta).toBe(69542 * 12);
    expect(snapshot.ipc).toBe(-0.2);
    expect(snapshot.tmc).toBe(3.49);
    expect(snapshot.dolar).toBe(891);
    expect(snapshot.source).toBe("mindicador.cl/api");
    expect(snapshot.lastUpdated).toBe("2026-05-16");
    expect(snapshot.capturedAt).toBe("2026-05-16T12:00:00.000Z");
    expect(snapshot.indicatorUpdatedAt.uf).toBe("2026-05-16");
    expect(snapshot.indicatorUpdatedAt.utm).toBe("2026-05-01");
    expect(snapshot.indicatorUpdatedAt.ipc).toBe("2025-12-01");
    expect(snapshot.indicatorUpdatedAt.dolar).toBe("2026-05-15");
    expect(snapshot.indicatorUpdatedAt.uta).toBe("2025-12-01");
  });

  it("omits tmc fecha when API does not provide it", async () => {
    const snapshot = await buildSnapshot(makeDeps());
    expect(snapshot.indicatorUpdatedAt).not.toHaveProperty("tmc");
  });

  it("falls back to current UTM × 12 when December UTM fetch returns null", async () => {
    const snapshot = await buildSnapshot(makeDeps({ decemberUtm: null }));
    expect(snapshot.uta).toBe(70588 * 12);
  });

  it("uses the official SII UTM override and records provenance", async () => {
    const snapshot = await buildSnapshot({
      ...makeDeps(),
      fetchUtmOverride: async () => ({
        value: 71_649,
        dateIso: "2026-08-01",
        sourceUrl: "https://www.sii.cl/valores_y_fechas/utm/utm2026.htm",
      }),
    });
    expect(snapshot.utm).toBe(71_649);
    expect(snapshot.indicatorUpdatedAt.utm).toBe("2026-08-01");
    expect(snapshot.provenance?.utm.status).toBe("primary");
    expect(snapshot.provenance?.utm.primarySource).toBe("SII");
  });

  it("marks the aggregator fallback explicitly when SII is unavailable", async () => {
    const snapshot = await buildSnapshot({
      ...makeDeps(),
      fetchUtmOverride: async () => null,
    });
    expect(snapshot.utm).toBe(70_588);
    expect(snapshot.provenance?.utm.status).toBe("fallback");
    expect(snapshot.provenance?.utm.sourceUrl).toBe(
      "https://mindicador.cl/api/utm"
    );
  });

  it("omits dolar entirely when API does not return it", async () => {
    const rest = { ...sampleApi };
    delete rest.dolar;
    const snapshot = await buildSnapshot(makeDeps({ api: rest }));
    expect(snapshot.dolar).toBeUndefined();
    expect(snapshot.indicatorUpdatedAt).not.toHaveProperty("dolar");
  });

  it("uses TMC fallback when API does not return tmc.valor", async () => {
    const apiWithoutTmc: MindicadorApiResponse = { ...sampleApi };
    delete apiWithoutTmc.tmc;
    const snapshot = await buildSnapshot(makeDeps({ api: apiWithoutTmc }));
    expect(snapshot.tmc).toBe(3.49);
  });

  it("throws if UF is not a positive finite number", async () => {
    const broken: MindicadorApiResponse = { ...sampleApi, uf: { valor: 0 } };
    await expect(buildSnapshot(makeDeps({ api: broken }))).rejects.toThrow(/UF/);
  });

  it("throws if UTM is not a positive finite number", async () => {
    const broken: MindicadorApiResponse = { ...sampleApi, utm: { valor: NaN } };
    await expect(buildSnapshot(makeDeps({ api: broken }))).rejects.toThrow(/UTM/);
  });

  it("throws if IPC is absent (no mindicador value, no override)", async () => {
    const { ipc, ...rest } = sampleApi;
    void ipc;
    await expect(buildSnapshot(makeDeps({ api: rest }))).rejects.toThrow(/IPC/);
  });

  it("accepts a legitimate IPC of 0 (no inflation)", async () => {
    const snapshot = await buildSnapshot(
      makeDeps({ api: { ...sampleApi, ipc: { valor: 0, fecha: sampleApi.ipc?.fecha } } })
    );
    expect(snapshot.ipc).toBe(0);
  });

  it("prev field is absent on a fresh snapshot (no previous JSON)", async () => {
    const snapshot = await buildSnapshot(makeDeps());
    expect(snapshot.prev).toBeUndefined();
  });

  it("serializes with trailing newline and 2-space indent", async () => {
    const snapshot = await buildSnapshot(makeDeps());
    const text = serializeSnapshot(snapshot);
    expect(text.endsWith("\n")).toBe(true);
    expect(text.split("\n")[1]).toMatch(/^  "uf":/);
  });

  it("uses INE override when provided and replaces both IPC value and date", async () => {
    const snapshot = await buildSnapshot({
      ...makeDeps(),
      fetchIpcOverride: async () => ({
        value: 1.3,
        dateIso: "2026-04-01",
      }),
    });
    expect(snapshot.ipc).toBe(1.3);
    expect(snapshot.indicatorUpdatedAt.ipc).toBe("2026-04-01");
  });

  it("falls back to mindicador IPC when the override returns null", async () => {
    const snapshot = await buildSnapshot({
      ...makeDeps(),
      fetchIpcOverride: async () => null,
    });
    expect(snapshot.ipc).toBe(-0.2);
    expect(snapshot.indicatorUpdatedAt.ipc).toBe("2025-12-01");
  });

  it("falls back to mindicador IPC when the override throws", async () => {
    const snapshot = await buildSnapshot({
      ...makeDeps(),
      fetchIpcOverride: async () => {
        throw new Error("network glitch");
      },
    });
    expect(snapshot.ipc).toBe(-0.2);
    expect(snapshot.indicatorUpdatedAt.ipc).toBe("2025-12-01");
  });

  it("uses BCCh UF override and updates UF date", async () => {
    // Use values that differ from sampleApi to verify override actually applies.
    const snapshot = await buildSnapshot({
      ...makeDeps(),
      fetchUfOverride: async () => ({ value: 41000.99, dateIso: "2026-06-01" }),
    });
    expect(snapshot.uf).toBe(41000.99);
    expect(snapshot.indicatorUpdatedAt.uf).toBe("2026-06-01");
  });

  it("falls back to mindicador UF when override fails", async () => {
    const snapshot = await buildSnapshot({
      ...makeDeps(),
      fetchUfOverride: async () => {
        throw new Error("BCCh down");
      },
    });
    // sampleApi has uf=40357.67 with fecha 2026-05-16
    expect(snapshot.uf).toBe(40357.67);
    expect(snapshot.indicatorUpdatedAt.uf).toBe("2026-05-16");
  });

  it("uses BCCh USD override and updates dolar date", async () => {
    const snapshot = await buildSnapshot({
      ...makeDeps(),
      fetchUsdOverride: async () => ({ value: 891, dateIso: "2026-05-15" }),
    });
    expect(snapshot.dolar).toBe(891);
    expect(snapshot.indicatorUpdatedAt.dolar).toBe("2026-05-15");
  });

  it("USD override does not materialize dolar when mindicador had no dolar AND override returns null", async () => {
    const apiWithoutDolar = { ...sampleApi };
    delete apiWithoutDolar.dolar;
    const snapshot = await buildSnapshot({
      ...makeDeps({ api: apiWithoutDolar }),
      fetchUsdOverride: async () => null,
    });
    expect(snapshot.dolar).toBeUndefined();
    expect(snapshot.indicatorUpdatedAt).not.toHaveProperty("dolar");
  });

  it("USD override materializes dolar even when mindicador omitted it", async () => {
    const apiWithoutDolar = { ...sampleApi };
    delete apiWithoutDolar.dolar;
    const snapshot = await buildSnapshot({
      ...makeDeps({ api: apiWithoutDolar }),
      fetchUsdOverride: async () => ({ value: 891, dateIso: "2026-05-15" }),
    });
    expect(snapshot.dolar).toBe(891);
    expect(snapshot.indicatorUpdatedAt.dolar).toBe("2026-05-15");
  });
});

// Minimal valid snapshot for mergePrev tests
function makeSnapshot(overrides: Partial<EconomicSnapshot> = {}): EconomicSnapshot {
  return {
    uf: 40400,
    utm: 70588,
    uta: 834504,
    ipc: 1.3,
    tmc: 3.49,
    dolar: 910,
    imm: 553553,
    immEffectiveDate: "2026-05-01",
    afcTopes: { monthlyTaxableCapUf: 135.2 },
    previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 90 },
    indicatorUpdatedAt: {
      uf: "2026-05-19",
      utm: "2026-05-01",
      dolar: "2026-05-19",
      uta: "2025-12-01",
    },
    lastUpdated: "2026-05-19",
    capturedAt: "2026-05-19T12:00:00.000Z",
    source: "mindicador.cl/api",
    ...overrides,
  };
}

describe("mergePrev", () => {
  it("returns snapshot unchanged when currentJson is not valid JSON", () => {
    const snap = makeSnapshot();
    const result = mergePrev("not-json", snap);
    expect(result).toEqual(snap);
    expect(result.prev).toBeUndefined();
  });

  it("carries UF prev when uf date rolls over", () => {
    const current = makeSnapshot({ uf: 40391.32, indicatorUpdatedAt: { uf: "2026-05-18", utm: "2026-05-01", dolar: "2026-05-18", uta: "2025-12-01" } });
    const newSnap = makeSnapshot({ uf: 40400 }); // date is 2026-05-19
    const result = mergePrev(JSON.stringify(current), newSnap);
    expect(result.prev?.uf).toEqual({ valor: 40391.32, fecha: "2026-05-18" });
  });

  it("preserves existing UF prev when uf date is unchanged", () => {
    const existingPrev = { valor: 40380, fecha: "2026-05-17" };
    const current = makeSnapshot({ uf: 40400, prev: { uf: existingPrev } });
    // Same uf date as new snapshot
    const newSnap = makeSnapshot({ uf: 40405 });
    const result = mergePrev(JSON.stringify(current), newSnap);
    expect(result.prev?.uf).toEqual(existingPrev);
  });

  it("carries UTM prev only when month changes", () => {
    const current = makeSnapshot({
      utm: 69737,
      indicatorUpdatedAt: { uf: "2026-05-19", utm: "2026-04-01", dolar: "2026-05-19", uta: "2025-12-01" },
    });
    const newSnap = makeSnapshot({ utm: 70588 }); // utm date is 2026-05-01
    const result = mergePrev(JSON.stringify(current), newSnap);
    expect(result.prev?.utm).toEqual({ valor: 69737, fecha: "2026-04-01" });
  });

  it("does not carry UTM prev when month is unchanged", () => {
    const current = makeSnapshot({ utm: 70000 }); // same month 2026-05
    const newSnap = makeSnapshot({ utm: 70588 });
    const result = mergePrev(JSON.stringify(current), newSnap);
    expect(result.prev?.utm).toBeUndefined();
  });

  it("carries dolar prev when dolar date rolls over", () => {
    const current = makeSnapshot({ dolar: 906.68, indicatorUpdatedAt: { uf: "2026-05-18", utm: "2026-05-01", dolar: "2026-05-18", uta: "2025-12-01" } });
    const newSnap = makeSnapshot({ dolar: 910 }); // dolar date is 2026-05-19
    const result = mergePrev(JSON.stringify(current), newSnap);
    expect(result.prev?.dolar).toEqual({ valor: 906.68, fecha: "2026-05-18" });
  });

  it("does not carry dolar prev when new snapshot has no dolar", () => {
    const current = makeSnapshot({ dolar: 906.68 });
    const rest = makeSnapshot();
    delete (rest as Partial<EconomicSnapshot>).dolar;
    const newSnap: EconomicSnapshot = { ...rest, indicatorUpdatedAt: { uf: "2026-05-19", utm: "2026-05-01", uta: "2025-12-01" } };
    const result = mergePrev(JSON.stringify(current), newSnap);
    expect(result.prev?.dolar).toBeUndefined();
  });

  it("returns snapshot with no prev when nothing has changed", () => {
    const current = makeSnapshot();
    const newSnap = makeSnapshot({ uf: 40401 }); // same dates as current
    const result = mergePrev(JSON.stringify(current), newSnap);
    expect(result.prev).toBeUndefined();
  });
});

describe("assertPlausibleDelta", () => {
  it("rejects a 10× UF drop (parse glitch)", () => {
    const previousJson = JSON.stringify(makeSnapshot({ uf: 40350 }));
    const snapshot = makeSnapshot({ uf: 4035 });
    expect(() => assertPlausibleDelta(previousJson, snapshot)).toThrow(/UF/);
  });

  it("accepts normal day-over-day UF movement", () => {
    const previousJson = JSON.stringify(makeSnapshot({ uf: 40350 }));
    const snapshot = makeSnapshot({ uf: 40360 });
    expect(() => assertPlausibleDelta(previousJson, snapshot)).not.toThrow();
  });

  it("no-ops when there is no parseable previous snapshot", () => {
    const snapshot = makeSnapshot({ uf: 4035 });
    expect(() => assertPlausibleDelta("{}", snapshot)).not.toThrow();
    expect(() => assertPlausibleDelta("not json", snapshot)).not.toThrow();
  });
});
