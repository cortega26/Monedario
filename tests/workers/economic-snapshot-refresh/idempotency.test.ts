import { beforeEach, describe, expect, it, vi } from "vitest";

// The worker under test keeps its real idempotency comparison, serialize and
// merge: only the external boundaries (network fetchers, GitHub API) and the
// builder output are controlled. Fixtures are built with the REAL builder and
// fixed deps (no network), then handed to the handler. The comparison itself
// is never reimplemented here — every assertion goes through the handler.

const githubState = vi.hoisted(() => ({
  content: "",
  sha: "seed-sha",
  failGet: false,
  puts: [] as Array<{ content: string; sha: string; message: string }>,
}));

vi.mock("../../../workers/economic-snapshot-refresh/src/githubClient", () => ({
  getCurrentFile: async () => {
    if (githubState.failGet) {
      throw new Error("simulated github read failure");
    }
    return { content: githubState.content, sha: githubState.sha };
  },
  putFile: async (
    _config: unknown,
    args: { content: string; sha: string; message: string }
  ) => {
    githubState.puts.push({ ...args });
    githubState.content = args.content;
    githubState.sha = "updated-sha";
    return {
      commit: { sha: "commit-sha", html_url: "https://example.invalid/c" },
    };
  },
}));

vi.mock(
  "../../../workers/economic-snapshot-refresh/src/buildSnapshot",
  async importOriginal => {
    const actual = await importOriginal<
      typeof import("../../../workers/economic-snapshot-refresh/src/buildSnapshot")
    >();
    return { ...actual, buildSnapshot: vi.fn() };
  }
);

vi.mock(
  "../../../workers/economic-snapshot-refresh/src/sources/ineIpc",
  () => ({ createIneIpcFetcher: () => async () => null })
);

vi.mock(
  "../../../workers/economic-snapshot-refresh/src/sources/bcchSiete",
  () => ({
    BCCH_SERIES: { UF: "uf-series", USD_OBSERVED: "usd-series" },
    fetchBcchLatest: async () => null,
  })
);

vi.mock(
  "../../../workers/economic-snapshot-refresh/src/sources/siiUtm",
  () => ({ createSiiUtmFetcher: () => async () => null })
);

import worker from "../../../workers/economic-snapshot-refresh/src/index";
import {
  buildSnapshot,
  mergePrev,
  serializeSnapshot,
  type EconomicSnapshot,
  type IndicatorOverride,
  type MindicadorApiResponse,
} from "../../../workers/economic-snapshot-refresh/src/buildSnapshot";

const buildSnapshotMock = vi.mocked(buildSnapshot);

const SII_UTM_URL = "https://www.sii.cl/valores_y_fechas/utm/utm2026.htm";
const MINDICADOR_UTM_URL = "https://mindicador.cl/api/utm";

const BASE_API: MindicadorApiResponse = {
  fecha: "2026-05-16T03:00:00.000Z",
  uf: { valor: 40357.67, fecha: "2026-05-16T03:00:00.000Z" },
  utm: { valor: 70588, fecha: "2026-05-01T03:00:00.000Z" },
  ipc: { valor: -0.2, fecha: "2025-12-01T03:00:00.000Z" },
  tmc: { valor: 3.49 },
  dolar: { valor: 891, fecha: "2026-05-15T03:00:00.000Z" },
};

interface FixtureOptions {
  api?: MindicadorApiResponse;
  utmOverride?: (IndicatorOverride & { sourceUrl?: string }) | null;
  nowIso?: string;
}

async function realisticSnapshot(
  options: FixtureOptions = {}
): Promise<EconomicSnapshot> {
  const real = await vi.importActual<
    typeof import("../../../workers/economic-snapshot-refresh/src/buildSnapshot")
  >("../../../workers/economic-snapshot-refresh/src/buildSnapshot");
  return real.buildSnapshot({
    fetchApi: async () => structuredClone(options.api ?? BASE_API),
    fetchDecemberUtm: async () => 69542,
    fetchUtmOverride: async () =>
      options.utmOverride === undefined
        ? { value: 70588, dateIso: "2026-05-01", sourceUrl: SII_UTM_URL }
        : options.utmOverride,
    now: () => new Date(options.nowIso ?? "2026-05-19T10:15:00.000Z"),
  });
}

function makeEnv() {
  return {
    GITHUB_TOKEN: "fictitious-github-pat",
    REPO_OWNER: "example-owner",
    REPO_NAME: "example-repo",
    TARGET_BRANCH: "main",
    TARGET_PATH:
      "src/infrastructure/economic/economic-parameters.snapshot.json",
    COMMIT_AUTHOR_NAME: "monedario-snapshot-bot",
    COMMIT_AUTHOR_EMAIL: "bot@example.invalid",
    COMMIT_MESSAGE: "chore(test): refresh economic snapshot",
    TRIGGER_SECRET: "fictitious-trigger-secret",
  };
}

async function triggerRefresh(): Promise<Response> {
  return worker.fetch(
    new Request("https://example.workers.dev/__refresh", {
      headers: { Authorization: "Bearer fictitious-trigger-secret" },
    }),
    makeEnv()
  );
}

// A committed file looks like a merged + serialized snapshot.
async function committedFile(snapshot: EconomicSnapshot): Promise<string> {
  return serializeSnapshot(mergePrev("not-json", snapshot));
}

function asSnapshot(value: unknown): EconomicSnapshot {
  return value as EconomicSnapshot;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

// Reverse key order one level deep: equivalent data, different bytes.
function reverseEntries<T>(obj: T): T {
  if (Array.isArray(obj) || typeof obj !== "object" || obj === null) {
    return obj;
  }
  const reversed = Object.fromEntries(Object.entries(obj).reverse());
  for (const [key, value] of Object.entries(reversed)) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      reversed[key] = Object.fromEntries(Object.entries(value).reverse());
    }
  }
  return reversed as T;
}

function storedSnapshot(): EconomicSnapshot {
  return JSON.parse(githubState.content) as EconomicSnapshot;
}

beforeEach(() => {
  githubState.content = "";
  githubState.sha = "seed-sha";
  githubState.failGet = false;
  githubState.puts = [];
  buildSnapshotMock.mockReset();
});

describe("economic snapshot idempotency (plan 091)", () => {
  it("second run with same data but new observation times does zero PUTs", async () => {
    const seed = await realisticSnapshot({
      nowIso: "2026-05-19T10:15:00.000Z",
    });
    githubState.content = await committedFile(seed);
    const fresh = await realisticSnapshot({
      nowIso: "2026-05-19T14:15:00.000Z",
    });
    // Sanity: only the observation instants moved between cron runs.
    expect(fresh.capturedAt).not.toBe(seed.capturedAt);
    expect(fresh.provenance?.utm.verifiedAt).not.toBe(
      seed.provenance?.utm.verifiedAt
    );
    buildSnapshotMock.mockResolvedValue(fresh);

    const first = await triggerRefresh();
    const second = await triggerRefresh();
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(await first.text()).toBe("ok\n");
    expect(await second.text()).toBe("ok\n");
    expect(githubState.puts).toHaveLength(0);
    expect(githubState.content).toBe(await committedFile(seed));
  });

  it("an indicator value change produces exactly one PUT", async () => {
    const seed = await realisticSnapshot();
    githubState.content = await committedFile(seed);
    const changedApi = clone(BASE_API);
    changedApi.uf = { valor: 40450, fecha: "2026-05-16T03:00:00.000Z" };
    const fresh = await realisticSnapshot({
      api: changedApi,
      nowIso: "2026-05-19T14:15:00.000Z",
    });
    buildSnapshotMock.mockResolvedValue(fresh);

    const res = await triggerRefresh();
    expect(res.status).toBe(200);
    expect(githubState.puts).toHaveLength(1);
    expect(storedSnapshot().uf).toBe(40450);
  });

  it("an indicator vigencia-date change PUTs once with correct prev", async () => {
    const seed = await realisticSnapshot();
    githubState.content = await committedFile(seed);
    const rolledApi = clone(BASE_API);
    rolledApi.uf = { valor: 40371.2, fecha: "2026-05-17T03:00:00.000Z" };
    const fresh = await realisticSnapshot({
      api: rolledApi,
      nowIso: "2026-05-19T14:15:00.000Z",
    });
    buildSnapshotMock.mockResolvedValue(fresh);

    const res = await triggerRefresh();
    expect(res.status).toBe(200);
    expect(githubState.puts).toHaveLength(1);
    const stored = storedSnapshot();
    expect(stored.prev?.uf).toEqual({ valor: 40357.67, fecha: "2026-05-16" });
    expect(stored.capturedAt).toBe(fresh.capturedAt);
    expect(stored.provenance?.utm.verifiedAt).toBe(
      fresh.provenance?.utm.verifiedAt
    );
    expect(githubState.puts[0]?.sha).toBe("seed-sha");
  });

  it("primary→fallback with the same value still produces one PUT", async () => {
    const seed = await realisticSnapshot();
    githubState.content = await committedFile(seed);
    const fresh = await realisticSnapshot({
      utmOverride: null,
      nowIso: "2026-05-19T14:15:00.000Z",
    });
    expect(fresh.utm).toBe(seed.utm);
    expect(fresh.indicatorUpdatedAt.utm).toBe(seed.indicatorUpdatedAt.utm);
    expect(fresh.provenance?.utm.status).toBe("fallback");
    buildSnapshotMock.mockResolvedValue(fresh);

    const res = await triggerRefresh();
    expect(res.status).toBe(200);
    expect(githubState.puts).toHaveLength(1);
    const stored = storedSnapshot();
    expect(stored.provenance?.utm.status).toBe("fallback");
    expect(stored.provenance?.utm.sourceUrl).toBe(MINDICADOR_UTM_URL);
  });

  it("a provenance sourceUrl change with the same value produces one PUT", async () => {
    const seed = await realisticSnapshot();
    githubState.content = await committedFile(seed);
    const fresh = await realisticSnapshot({
      utmOverride: {
        value: 70588,
        dateIso: "2026-05-01",
        sourceUrl: `${SII_UTM_URL}?v=2`,
      },
      nowIso: "2026-05-19T14:15:00.000Z",
    });
    expect(fresh.provenance?.utm.status).toBe("primary");
    buildSnapshotMock.mockResolvedValue(fresh);

    const res = await triggerRefresh();
    expect(res.status).toBe(200);
    expect(githubState.puts).toHaveLength(1);
  });

  it("an added unknown data field produces one PUT", async () => {
    const seed = await realisticSnapshot();
    githubState.content = await committedFile(seed);
    const fresh = await realisticSnapshot({
      nowIso: "2026-05-19T14:15:00.000Z",
    });
    buildSnapshotMock.mockResolvedValue(
      asSnapshot({ ...clone(fresh), futureField: "from a future schema" })
    );

    const res = await triggerRefresh();
    expect(res.status).toBe(200);
    expect(githubState.puts).toHaveLength(1);
  });

  it("a removed data field produces one PUT", async () => {
    const seed = await realisticSnapshot();
    githubState.content = await committedFile(seed);
    const fresh = await realisticSnapshot({
      nowIso: "2026-05-19T14:15:00.000Z",
    });
    const withoutDolar = clone(fresh);
    delete withoutDolar.dolar;
    buildSnapshotMock.mockResolvedValue(withoutDolar);

    const res = await triggerRefresh();
    expect(res.status).toBe(200);
    expect(githubState.puts).toHaveLength(1);
    expect(storedSnapshot()).not.toHaveProperty("dolar");
  });

  it("a changed unknown data field produces one PUT", async () => {
    const seedBase = await realisticSnapshot();
    githubState.content = serializeSnapshot(
      mergePrev("not-json", asSnapshot({ ...clone(seedBase), futureField: "v1" }))
    );
    const fresh = await realisticSnapshot({
      nowIso: "2026-05-19T14:15:00.000Z",
    });
    buildSnapshotMock.mockResolvedValue(
      asSnapshot({ ...clone(fresh), futureField: "v2" })
    );

    const res = await triggerRefresh();
    expect(res.status).toBe(200);
    expect(githubState.puts).toHaveLength(1);
  });

  it("reordered keys and different spacing are still a no-op", async () => {
    const seed = await realisticSnapshot();
    githubState.content = JSON.stringify(reverseEntries(seed));
    const fresh = await realisticSnapshot({
      nowIso: "2026-05-19T14:15:00.000Z",
    });
    buildSnapshotMock.mockResolvedValue(fresh);

    const res = await triggerRefresh();
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok\n");
    expect(githubState.puts).toHaveLength(0);
  });

  it("reordered arrays are a difference (one PUT)", async () => {
    const seedBase = await realisticSnapshot();
    githubState.content = serializeSnapshot(
      mergePrev(
        "not-json",
        asSnapshot({ ...clone(seedBase), reviewers: ["a", "b"] })
      )
    );
    const fresh = await realisticSnapshot({
      nowIso: "2026-05-19T14:15:00.000Z",
    });
    buildSnapshotMock.mockResolvedValue(
      asSnapshot({ ...clone(fresh), reviewers: ["b", "a"] })
    );

    const res = await triggerRefresh();
    expect(res.status).toBe(200);
    expect(githubState.puts).toHaveLength(1);
  });

  it("a PUT preserves the new timestamps and leaves inputs intact", async () => {
    const seed = await realisticSnapshot();
    githubState.content = await committedFile(seed);
    const rolledApi = clone(BASE_API);
    rolledApi.uf = { valor: 40371.2, fecha: "2026-05-17T03:00:00.000Z" };
    const fresh = await realisticSnapshot({
      api: rolledApi,
      nowIso: "2026-05-19T18:15:00.000Z",
    });
    const frozenFresh = clone(fresh);
    buildSnapshotMock.mockResolvedValue(fresh);

    const res = await triggerRefresh();
    expect(res.status).toBe(200);
    expect(githubState.puts).toHaveLength(1);
    const sent = JSON.parse(
      githubState.puts[0]?.content ?? ""
    ) as EconomicSnapshot;
    expect(sent.capturedAt).toBe(fresh.capturedAt);
    expect(sent.provenance?.utm.verifiedAt).toBe(
      fresh.provenance?.utm.verifiedAt
    );
    expect(fresh).toEqual(frozenFresh);
  });

  it("a github read failure is an observable failure, not a false no-op", async () => {
    githubState.failGet = true;
    buildSnapshotMock.mockResolvedValue(await realisticSnapshot());

    const res = await triggerRefresh();
    expect(res.status).toBe(500);
    expect(await res.text()).toContain("error:");
    expect(githubState.puts).toHaveLength(0);
  });

  it("invalid stored JSON is an observable failure, not a false no-op", async () => {
    githubState.content = "this is not json {{{";
    buildSnapshotMock.mockResolvedValue(await realisticSnapshot());

    const res = await triggerRefresh();
    expect(res.status).toBe(500);
    expect(await res.text()).toContain("error:");
    expect(githubState.puts).toHaveLength(0);
  });
});
