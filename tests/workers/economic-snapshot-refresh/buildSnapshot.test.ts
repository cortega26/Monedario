import { describe, expect, it } from "vitest";
import {
  buildSnapshot,
  getUtaReferenceYear,
  serializeSnapshot,
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
    fetchDecemberUtm: async (_year: number) =>
      overrides.decemberUtm !== undefined ? overrides.decemberUtm : 69542,
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

  it("omits dolar entirely when API does not return it", async () => {
    const { dolar: _omit, ...rest } = sampleApi;
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

  it("serializes with trailing newline and 2-space indent", async () => {
    const snapshot = await buildSnapshot(makeDeps());
    const text = serializeSnapshot(snapshot);
    expect(text.endsWith("\n")).toBe(true);
    expect(text.split("\n")[1]).toMatch(/^  "uf":/);
  });
});
