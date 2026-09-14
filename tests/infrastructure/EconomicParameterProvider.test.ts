import { readFileSync } from "fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mergePreviousIndicatorValues } from "../../scripts/refresh-economic-snapshot.mjs";

const SNAPSHOT = JSON.parse(
  readFileSync(
    "src/infrastructure/economic/economic-parameters.snapshot.json",
    "utf-8"
  )
) as {
  uf: number;
  utm: number;
  imm?: number;
  immEffectiveDate?: string;
  indicatorUpdatedAt?: {
    uf?: string;
    utm?: string;
    dolar?: string;
  };
  afcTopes?: {
    monthlyTaxableCapUf?: number;
  };
  previsionalTopes?: {
    pensionAndHealthMonthlyTaxableCapUf?: number;
  };
  prev?: {
    uf?: { valor: number; fecha: string };
    utm?: { valor: number; fecha: string };
    dolar?: { valor: number; fecha: string };
  };
  lastUpdated: string;
};

const LIVE_RESPONSE = {
  fecha: "2026-03-15T12:00:00.000Z",
  uf: { valor: 40123, fecha: "2026-03-15T00:00:00.000Z" },
  utm: { valor: 68000, fecha: "2026-03-01T00:00:00.000Z" },
  ipc: { valor: 0.3, fecha: "2026-02-01T00:00:00.000Z" },
  tmc: { valor: 3.75 },
  dolar: { valor: 945.12, fecha: "2026-03-14T00:00:00.000Z" },
};

const MODE_ENV = "TPI_ECONOMIC_PROVIDER_MODE";
const ORIGINAL_MODE = process.env[MODE_ENV];

function setMode(mode?: "snapshot" | "live") {
  if (mode) {
    process.env[MODE_ENV] = mode;
  } else {
    delete process.env[MODE_ENV];
  }
}

async function loadProviderModule() {
  vi.resetModules();
  const mod = await import("@/infrastructure/economic/EconomicParameterProvider");
  mod.__resetEconomicParameterProviderForTests();
  return mod;
}

describe("EconomicParameterProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setMode(undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (ORIGINAL_MODE === undefined) {
      delete process.env[MODE_ENV];
    } else {
      process.env[MODE_ENV] = ORIGINAL_MODE;
    }
  });

  it("uses local snapshot by default without external fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { getEconomicParameterBundle, getEconomicProviderTelemetry } =
      await loadProviderModule();
    const bundle = await getEconomicParameterBundle();

    expect(bundle.telemetryFlag).toBe("economic_parameters_snapshot");
    expect(bundle.parameters.source).toBe("snapshot");
    expect(bundle.parameters.uf).toBe(SNAPSHOT.uf);
    expect(bundle.parameters.utm).toBe(SNAPSHOT.utm);
    expect(bundle.parameters.afcTopes?.monthlyTaxableCapUf).toBe(
      SNAPSHOT.afcTopes?.monthlyTaxableCapUf
    );
    expect(
      bundle.parameters.previsionalTopes?.pensionAndHealthMonthlyTaxableCapUf
    ).toBe(SNAPSHOT.previsionalTopes?.pensionAndHealthMonthlyTaxableCapUf);
    expect(bundle.parameters.lastUpdated).toBe(SNAPSHOT.lastUpdated);
    expect(bundle.parameters.indicatorUpdatedAt?.uf).toBe(
      SNAPSHOT.indicatorUpdatedAt?.uf ?? SNAPSHOT.lastUpdated
    );
    expect(bundle.parameters.indicatorUpdatedAt?.utm).toBe(
      SNAPSHOT.indicatorUpdatedAt?.utm ?? SNAPSHOT.lastUpdated
    );
    expect(fetchMock).not.toHaveBeenCalled();

    const telemetry = getEconomicProviderTelemetry();
    expect(telemetry.externalFetchCount).toBe(0);
    expect(telemetry.lastSource).toBe("snapshot");
  });

  it("keeps complete previous-period values for homepage deltas", () => {
    const ufPrev = SNAPSHOT.prev?.uf?.fecha ?? "";
    const utmPrevMonth = SNAPSHOT.prev?.utm?.fecha.slice(0, 7) ?? "";
    const dolarPrev = SNAPSHOT.prev?.dolar?.fecha ?? "";
    const ufCurrent = SNAPSHOT.indicatorUpdatedAt?.uf ?? "";
    const utmCurrentMonth =
      SNAPSHOT.indicatorUpdatedAt?.utm?.slice(0, 7) ?? "";
    const dolarCurrent = SNAPSHOT.indicatorUpdatedAt?.dolar ?? "";

    expect(ufPrev).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(utmPrevMonth).toMatch(/^\d{4}-\d{2}$/);
    expect(dolarPrev).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(ufPrev < ufCurrent).toBe(true);
    expect(utmPrevMonth < utmCurrentMonth).toBe(true);
    expect(dolarPrev < dolarCurrent).toBe(true);
  });

  it("manual refresh preserves existing deltas when indicator dates are unchanged", () => {
    const rawSnapshot = { ...SNAPSHOT };
    delete rawSnapshot.prev;
    const refreshed = mergePreviousIndicatorValues(
      JSON.stringify(SNAPSHOT),
      rawSnapshot
    );

    expect(refreshed.prev).toEqual(SNAPSHOT.prev);
  });

  // Regression guard for the stale-IMM bug: the salary calculator silently
  // fell back to a $500.000 minimum wage because mindicador.cl never supplies
  // the IMM and no managed constant carried it. IMM is a legal value (reajuste
  // despachado a ley el 2026-06-16: $553.553 vigente retroactivo desde
  // 2026-05-01, sobre los $539.000 de la Ley 21.751).
  //
  // Two complementary guarantees:
  //  1. FLOOR — `imm` must never drop below the last-known-good legal value.
  //     This catches a reversion to an older fallback or any accidental
  //     downward edit. (It does NOT catch a forgotten *upward* reajuste —
  //     that is what the date tripwire below is for.)
  //  2. DATE TRIPWIRE — after IMM_REVIEW_BY the test fails on purpose, forcing
  //     a human to re-verify the current IMM against the Ministerio del Trabajo
  //     and, if it changed, bump DEFAULT_IMM, the floor, the effective date and
  //     this date. Same forcing-function pattern as check-editorial-timeliness.mjs.
  const IMM_LEGAL_FLOOR = 553_553;
  const IMM_REVIEW_BY = "2026-12-01";

  it("always exposes the managed IMM (>= legal floor) with its effective date in snapshot mode", async () => {
    const { getEconomicParameterBundle } = await loadProviderModule();
    const { parameters } = await getEconomicParameterBundle();

    expect(parameters.imm).toBeDefined();
    expect(parameters.imm).toBeGreaterThanOrEqual(IMM_LEGAL_FLOOR);
    expect(parameters.immEffectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Ideally the committed snapshot carries the field so a refresh round-trips it.
    // The deployed Cloudflare worker runs a stale build (pre-imm); until it is
    // redeployed the snapshot may omit `imm` — the provider fills it from DEFAULT_IMM.
    if (SNAPSHOT.imm !== undefined) {
      expect(SNAPSHOT.imm).toBeGreaterThanOrEqual(IMM_LEGAL_FLOOR);
    }
  });

  it(`forces re-verification of the IMM against current law by ${IMM_REVIEW_BY}`, () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(
      today < IMM_REVIEW_BY,
      `Revisa el IMM vigente en https://www.mintrab.gob.cl/ (valor actual $553.553 vigente desde 2026-05-01). ` +
        `Si cambió, actualiza DEFAULT_IMM, IMM_LEGAL_FLOOR, immEffectiveDate y IMM_REVIEW_BY en provider + ambos generadores + snapshot.`
    ).toBe(true);
  });

  it("supplies the managed IMM even in live mode (mindicador never returns it)", async () => {
    setMode("live");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => LIVE_RESPONSE,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getEconomicParameterBundle } = await loadProviderModule();
    const { parameters } = await getEconomicParameterBundle();

    expect(parameters.source).toBe("live");
    expect(parameters.imm).toBeGreaterThanOrEqual(IMM_LEGAL_FLOOR);
    expect(parameters.immEffectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("resolves the snapshot from a real filesystem path", async () => {
    const { __getEconomicSnapshotFilePathForTests } = await loadProviderModule();
    const snapshotPath = __getEconomicSnapshotFilePathForTests();
    const payload = JSON.parse(readFileSync(snapshotPath, "utf-8")) as {
      uf: number;
      utm: number;
      afcTopes?: {
        monthlyTaxableCapUf?: number;
      };
      previsionalTopes?: {
        pensionAndHealthMonthlyTaxableCapUf?: number;
      };
      indicatorUpdatedAt?: {
        uf?: string;
        utm?: string;
        dolar?: string;
      };
      lastUpdated: string;
    };

    expect(snapshotPath.endsWith("economic-parameters.snapshot.json")).toBe(
      true
    );
    expect(payload.uf).toBe(SNAPSHOT.uf);
    expect(payload.utm).toBe(SNAPSHOT.utm);
    expect(payload.afcTopes?.monthlyTaxableCapUf).toBe(
      SNAPSHOT.afcTopes?.monthlyTaxableCapUf
    );
    expect(payload.previsionalTopes?.pensionAndHealthMonthlyTaxableCapUf).toBe(
      SNAPSHOT.previsionalTopes?.pensionAndHealthMonthlyTaxableCapUf
    );
    expect(payload.lastUpdated).toBe(SNAPSHOT.lastUpdated);
    expect(payload.indicatorUpdatedAt?.uf).toBe(
      SNAPSHOT.indicatorUpdatedAt?.uf
    );
  });

  it("returns live payload when live mode is explicitly enabled", async () => {
    setMode("live");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => LIVE_RESPONSE,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getEconomicParameterBundle, getEconomicProviderTelemetry } =
      await loadProviderModule();
    const bundle = await getEconomicParameterBundle();

    expect(bundle.telemetryFlag).toBe("economic_parameters_live");
    expect(bundle.parameters.source).toBe("live");
    expect(bundle.parameters.lastUpdated).toBe("2026-03-15");
    expect(bundle.parameters.uf).toBe(LIVE_RESPONSE.uf.valor);
    expect(bundle.parameters.utm).toBe(LIVE_RESPONSE.utm.valor);
    expect(bundle.parameters.dolar).toBe(LIVE_RESPONSE.dolar.valor);
    expect(bundle.parameters.indicatorUpdatedAt?.uf).toBe("2026-03-15");
    expect(bundle.parameters.indicatorUpdatedAt?.utm).toBe("2026-03-01");
    expect(bundle.parameters.indicatorUpdatedAt?.dolar).toBe("2026-03-14");
    expect(bundle.parameters.afcTopes?.monthlyTaxableCapUf).toBe(135.2);
    expect(
      bundle.parameters.previsionalTopes?.pensionAndHealthMonthlyTaxableCapUf
    ).toBe(90);

    const telemetry = getEconomicProviderTelemetry();
    expect(telemetry.externalFetchCount).toBe(1);
    expect(telemetry.lastSource).toBe("live");
  });

  it("falls back to snapshot when live mode fails", async () => {
    setMode("live");
    const fetchMock = vi.fn().mockRejectedValue(new Error("network failure"));
    vi.stubGlobal("fetch", fetchMock);

    const { getEconomicParameterBundle, getEconomicProviderTelemetry } =
      await loadProviderModule();
    const bundle = await getEconomicParameterBundle();

    expect(bundle.telemetryFlag).toBe("economic_parameters_snapshot");
    expect(bundle.parameters.source).toBe("snapshot");
    expect(bundle.parameters.uf).toBe(SNAPSHOT.uf);
    expect(bundle.parameters.utm).toBe(SNAPSHOT.utm);
    expect(bundle.fallbackReason).toContain("network failure");

    const telemetry = getEconomicProviderTelemetry();
    expect(telemetry.externalFetchCount).toBe(1);
    expect(telemetry.lastSource).toBe("snapshot");
    expect(telemetry.lastFallbackReason).toContain("network failure");
  });

  it("memoizes bundle and performs a single live fetch", async () => {
    setMode("live");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => LIVE_RESPONSE,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getEconomicParameterBundle, getEconomicProviderTelemetry } =
      await loadProviderModule();

    const [first, second, third] = await Promise.all([
      getEconomicParameterBundle(),
      getEconomicParameterBundle(),
      getEconomicParameterBundle(),
    ]);
    const fourth = await getEconomicParameterBundle();

    expect(first.parameters).toEqual(second.parameters);
    expect(second.parameters).toEqual(third.parameters);
    expect(third.parameters).toEqual(fourth.parameters);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const telemetry = getEconomicProviderTelemetry();
    expect(telemetry.externalFetchCount).toBe(1);
    expect(telemetry.cacheHitCount).toBeGreaterThanOrEqual(1);
  });

  // Plan 103: a missing upstream `fecha` must never be stamped as today.
  // The provider returns `undefined` for that indicator and `lastUpdated`
  // falls back to the stale FALLBACK_LAST_UPDATED so freshness gates fail
  // loudly instead of passing with false recency.
  const FALLBACK_LAST_UPDATED = "2026-05-28";

  it("flags staleness (not today) when live indicators omit fecha", async () => {
    setMode("live");
    const today = new Date().toISOString().slice(0, 10);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        uf: { valor: 40123 },
        utm: { valor: 68000 },
        ipc: { valor: 0.3 },
        tmc: { valor: 3.75 },
        dolar: { valor: 945.12 },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getEconomicParameterBundle } = await loadProviderModule();
    const { parameters } = await getEconomicParameterBundle();

    expect(parameters.lastUpdated).toBe(FALLBACK_LAST_UPDATED);
    expect(parameters.lastUpdated).not.toBe(today);
    expect(parameters.indicatorUpdatedAt?.ipc).toBeUndefined();
    expect(parameters.indicatorUpdatedAt?.tmc).toBeUndefined();
  });

  it("flags staleness (not today) when live fechas are empty or garbage", async () => {
    setMode("live");
    const today = new Date().toISOString().slice(0, 10);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        uf: { valor: 40123, fecha: "" },
        utm: { valor: 68000, fecha: "xx" },
        ipc: { valor: 0.3, fecha: "" },
        tmc: { valor: 3.75, fecha: "not-a-date" },
        dolar: { valor: 945.12, fecha: "" },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getEconomicParameterBundle } = await loadProviderModule();
    const { parameters } = await getEconomicParameterBundle();

    // Garbage (even 10+ chars) maps to undefined — never to today — and the
    // domain invariant stays green because undefined is an allowed absence.
    expect(parameters.lastUpdated).toBe(FALLBACK_LAST_UPDATED);
    expect(parameters.lastUpdated).not.toBe(today);
    expect(parameters.indicatorUpdatedAt?.ipc).toBeUndefined();
    expect(parameters.indicatorUpdatedAt?.tmc).toBeUndefined();
  });

  it("selects the latest real date while ignoring missing fechas", async () => {
    setMode("live");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        uf: { valor: 40123, fecha: "2026-03-15T00:00:00.000Z" },
        utm: { valor: 68000 },
        ipc: { valor: 0.3 },
        tmc: { valor: 3.75 },
        dolar: { valor: 945.12 },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getEconomicParameterBundle } = await loadProviderModule();
    const { parameters } = await getEconomicParameterBundle();

    expect(parameters.lastUpdated).toBe("2026-03-15");
    expect(parameters.indicatorUpdatedAt?.uf).toBe("2026-03-15");
    expect(parameters.indicatorUpdatedAt?.ipc).toBeUndefined();
  });
});
