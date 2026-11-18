import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Regression test for the 2026-11-18 incident.
 *
 * mindicador.cl was down (HTTP 522). Before the fix, `buildSnapshot` awaited
 * the base fetch unguarded, so the scheduled handler threw and no snapshot was
 * committed: the site kept serving the previous day's UF/USD even though the
 * BCCh already published the new values.
 *
 * This test exercises the REAL handler end to end: only the external
 * boundaries are mocked (GitHub, BCCh, SII, INE and global fetch). If the
 * carry-forward fallback is removed, the scheduled promise rejects and there is
 * no commit — both assertions fail.
 */

const state = vi.hoisted(() => ({
  current: "",
  puts: [] as Array<{ content: string; sha: string; message: string }>,
}));

vi.mock("../../../workers/economic-snapshot-refresh/src/githubClient", () => ({
  getCurrentFile: async () => ({ content: state.current, sha: "seed-sha" }),
  putFile: async (
    _config: unknown,
    args: { content: string; sha: string; message: string }
  ) => {
    state.puts.push({ ...args });
    state.current = args.content;
    return {
      commit: { sha: "commit-sha", html_url: "https://example.invalid/c" },
    };
  },
}));

vi.mock(
  "../../../workers/economic-snapshot-refresh/src/sources/bcchSiete",
  () => ({
    BCCH_SERIES: { UF: "uf-series", USD_OBSERVED: "usd-series" },
    fetchBcchLatest: async (_credentials: unknown, seriesId: string) =>
      seriesId === "uf-series"
        ? { value: 41357.3, dateIso: "2026-11-18" }
        : { value: 996.68, dateIso: "2026-11-18" },
  })
);

vi.mock(
  "../../../workers/economic-snapshot-refresh/src/sources/siiUtm",
  () => ({ createSiiUtmFetcher: () => async () => null })
);

vi.mock(
  "../../../workers/economic-snapshot-refresh/src/sources/ineIpc",
  () => ({ createIneIpcFetcher: () => async () => null })
);

import worker from "../../../workers/economic-snapshot-refresh/src/index";
import { serializeSnapshot } from "../../../workers/economic-snapshot-refresh/src/buildSnapshot";

const PREVIOUS_SNAPSHOT = {
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
  provenance: {
    utm: {
      primarySource: "SII",
      sourceUrl: "https://www.sii.cl/valores_y_fechas/utm/utm2026.htm",
      status: "fallback",
      verifiedAt: "2026-11-17T10:15:29.487Z",
    },
  },
  prev: {
    uf: { valor: 41343.55, fecha: "2026-11-16" },
    utm: { valor: 72151, fecha: "2026-10-01" },
    dolar: { valor: 999.1, fecha: "2026-11-16" },
  },
};

const ENV = {
  GITHUB_TOKEN: "test-token",
  REPO_OWNER: "cortega26",
  REPO_NAME: "Monedario",
  TARGET_BRANCH: "main",
  TARGET_PATH: "src/infrastructure/economic/economic-parameters.snapshot.json",
  COMMIT_AUTHOR_NAME: "monedario-snapshot-bot",
  COMMIT_AUTHOR_EMAIL: "noreply+snapshot-bot@monedario.cl",
  COMMIT_MESSAGE: "chore(editorial): refresh economic snapshot (worker)",
  MINDICADOR_TIMEOUT_MS: "12000",
  BCCH_USER: "user",
  BCCH_PASSWORD: "password",
};

async function runScheduled(): Promise<void> {
  const pending: Array<Promise<void>> = [];
  await worker.scheduled({} as ScheduledEvent, ENV, {
    waitUntil: (promise: Promise<void>) => {
      pending.push(promise);
    },
  } as ExecutionContext);
  await Promise.all(pending);
}

describe("scheduled refresh during a mindicador outage", () => {
  beforeEach(() => {
    state.current = serializeSnapshot(PREVIOUS_SNAPSHOT);
    state.puts = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new DOMException(
          "The operation was aborted due to timeout",
          "TimeoutError"
        );
      })
    );
  });

  it("commits a carry-forward snapshot with the BCCh values instead of aborting", async () => {
    await runScheduled();

    expect(state.puts).toHaveLength(1);
    const committed = JSON.parse(state.puts[0].content);

    expect(committed.source).toBe("snapshot.carry-forward");
    expect(committed.uf).toBe(41357.3);
    expect(committed.dolar).toBe(996.68);
    expect(committed.indicatorUpdatedAt.uf).toBe("2026-11-18");
    expect(committed.indicatorUpdatedAt.dolar).toBe("2026-11-18");
    expect(committed.prev).toEqual({
      uf: { valor: 41350.42, fecha: "2026-11-17" },
      utm: { valor: 72151, fecha: "2026-10-01" },
      dolar: { valor: 1001.17, fecha: "2026-11-17" },
    });
    // Fields mindicador owns are carried forward, not invented.
    expect(committed.utm).toBe(72440);
    expect(committed.tmc).toBe(3.49);
  });
});
