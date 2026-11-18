/**
 * Contract test between the snapshot Worker and the app.
 *
 * The Worker owns `EconomicSnapshot`; the app parses the committed JSON with
 * `parseSnapshotEconomicParameters`. Both evolve independently, so this test
 * feeds the app parser a snapshot produced by the REAL Worker builder. If a
 * field is renamed, made required or dropped on either side, this fails before
 * the site ships a degraded snapshot.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildSnapshot,
  mergePrev,
  serializeSnapshot,
  type EconomicSnapshot,
  type MindicadorApiResponse,
} from "../../workers/economic-snapshot-refresh/src/buildSnapshot";
import { parseSnapshotEconomicParameters } from "@/infrastructure/economic/EconomicParameterProvider";

const PREVIOUS: EconomicSnapshot = {
  uf: 41350.42,
  utm: 72440,
  uta: 834504,
  ipc: 0.5,
  tmc: 3.49,
  dolar: 1001.17,
  imm: 553553,
  immEffectiveDate: "2026-05-01",
  afcTopes: { monthlyTaxableCapUf: 135.2 },
  previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 90 },
  indicatorUpdatedAt: {
    uf: "2026-11-17",
    utm: "2026-11-01",
    uta: "2025-12-01",
    ipc: "2026-10-01",
    dolar: "2026-11-17",
  },
  lastUpdated: "2026-11-17",
  capturedAt: "2026-11-17T10:15:29.487Z",
  source: "mindicador.cl/api",
  prev: {
    uf: { valor: 41343.55, fecha: "2026-11-16" },
    utm: { valor: 72151, fecha: "2026-10-01" },
    dolar: { valor: 999.1, fecha: "2026-11-16" },
  },
};

const MINDICADOR: MindicadorApiResponse = {
  fecha: "2026-11-18T03:00:00.000Z",
  uf: { valor: 41350.42, fecha: "2026-11-17T03:00:00.000Z" },
  utm: { valor: 72440, fecha: "2026-11-01T03:00:00.000Z" },
  ipc: { valor: 0.5, fecha: "2026-10-01T03:00:00.000Z" },
  tmc: { valor: 3.49, fecha: "2026-10-01T03:00:00.000Z" },
  dolar: { valor: 1001.17, fecha: "2026-11-17T03:00:00.000Z" },
};

async function workerSnapshot(): Promise<EconomicSnapshot> {
  const built = await buildSnapshot({
    fetchApi: async () => MINDICADOR,
    fetchDecemberUtm: async () => 69542,
    now: () => new Date("2026-11-18T19:24:00.000Z"),
    fetchUfOverride: async () => ({ value: 41357.3, dateIso: "2026-11-18" }),
    fetchUsdOverride: async () => ({ value: 996.68, dateIso: "2026-11-18" }),
    fetchIpcOverride: async () => ({ value: 0.5, dateIso: "2026-10-01" }),
    fetchUtmOverride: async () => ({
      value: 72440,
      dateIso: "2026-11-01",
      sourceUrl: "https://www.sii.cl/valores_y_fechas/utm/utm2026.htm",
    }),
  });
  return { ...mergePrev(serializeSnapshot(PREVIOUS), built), source: "snapshot.carry-forward" };
}

describe("economic snapshot contract (Worker -> app)", () => {
  it("parses a Worker-generated snapshot with overrides, prev and carry-forward source", async () => {
    const snapshot = await workerSnapshot();
    const parsed = parseSnapshotEconomicParameters(
      JSON.parse(serializeSnapshot(snapshot))
    );

    expect(parsed.uf).toBe(41357.3);
    expect(parsed.dolar).toBe(996.68);
    expect(parsed.utm).toBe(72440);
    expect(parsed.uta).toBe(834504);
    expect(parsed.ipc).toBe(0.5);
    expect(parsed.tmc).toBe(3.49);
    expect(parsed.indicatorUpdatedAt?.uf).toBe("2026-11-18");
    expect(parsed.indicatorUpdatedAt?.dolar).toBe("2026-11-18");
    expect(parsed.prev?.uf).toEqual({ valor: 41350.42, fecha: "2026-11-17" });
    expect(parsed.prev?.dolar).toEqual({ valor: 1001.17, fecha: "2026-11-17" });
  });

  it("parses the snapshot committed to main", () => {
    const snapshotPath = path.join(
      process.cwd(),
      "src/infrastructure/economic/economic-parameters.snapshot.json"
    );
    const parsed = parseSnapshotEconomicParameters(
      JSON.parse(readFileSync(snapshotPath, "utf8"))
    );

    expect(parsed.uf).toBeGreaterThan(0);
    expect(parsed.utm).toBeGreaterThan(0);
    expect(parsed.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}/u);
  });
});
