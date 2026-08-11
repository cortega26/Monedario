import { afterEach, describe, expect, it, vi } from "vitest";

// Deterministic, network-free snapshot pipeline for the valid-auth 200 case:
// runRefresh's real logic (assertEnv, idempotency compare, noop path) runs,
// only the external boundaries are mocked.
vi.mock("../../../workers/economic-snapshot-refresh/src/buildSnapshot", () => ({
  createMindicadorFetchers: () => ({
    fetchApi: async () => null,
    fetchDecemberUtm: async () => null,
  }),
  createIneIpcFetcher: () => async () => null,
  buildSnapshot: async () => ({ uf: 1, utm: 1 }),
  assertPlausibleDelta: () => {},
  mergePrev: (_current: unknown, raw: unknown) => raw,
  serializeSnapshot: (snapshot: unknown) => JSON.stringify(snapshot),
}));

vi.mock("../../../workers/economic-snapshot-refresh/src/githubClient", () => ({
  getCurrentFile: async () => ({
    content: JSON.stringify({ uf: 1, utm: 1 }),
    sha: "abc123",
  }),
  putFile: async () => {
    throw new Error("putFile should not be reached: idempotent payload");
  },
}));

vi.mock("../../../workers/economic-snapshot-refresh/src/sources/ineIpc", () => ({
  createIneIpcFetcher: () => async () => null,
}));

vi.mock("../../../workers/economic-snapshot-refresh/src/sources/bcchSiete", () => ({
  BCCH_SERIES: {
    UF: "uf-series",
    USD_OBSERVED: "usd-series",
  },
  fetchBcchLatest: async () => null,
}));

vi.mock("../../../workers/economic-snapshot-refresh/src/sources/siiUtm", () => ({
  createSiiUtmFetcher: () => async () => null,
}));

import worker from "../../../workers/economic-snapshot-refresh/src/index";

function makeEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    GITHUB_TOKEN: "github-pat",
    REPO_OWNER: "cortega26",
    REPO_NAME: "Monedario",
    TARGET_BRANCH: "main",
    TARGET_PATH: "src/infrastructure/economic/economic-parameters.snapshot.json",
    COMMIT_AUTHOR_NAME: "bot",
    COMMIT_AUTHOR_EMAIL: "bot@example.com",
    COMMIT_MESSAGE: "test",
    TRIGGER_SECRET: "manual-trigger-secret",
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("/__refresh manual trigger auth", () => {
  it("returns 200 with a valid Authorization Bearer header", async () => {
    const res = await worker.fetch(
      new Request("https://example.workers.dev/__refresh", {
        headers: { Authorization: "Bearer manual-trigger-secret" },
      }),
      makeEnv(),
    );
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok\n");
  });

  it("returns 401 when the Authorization header is missing", async () => {
    const res = await worker.fetch(
      new Request("https://example.workers.dev/__refresh"),
      makeEnv(),
    );
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "missing_secret" });
  });

  it("returns 403 for a wrong secret", async () => {
    const res = await worker.fetch(
      new Request("https://example.workers.dev/__refresh", {
        headers: { Authorization: "Bearer wrong-secret" },
      }),
      makeEnv(),
    );
    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({ error: "invalid_secret" });
  });

  it("returns 401 for a malformed Authorization scheme", async () => {
    const res = await worker.fetch(
      new Request("https://example.workers.dev/__refresh", {
        headers: { Authorization: "Basic dXNlcjpwYXNz" },
      }),
      makeEnv(),
    );
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "missing_secret" });
  });

  it("rejects the legacy query-string form (old ?secret= URLs fail)", async () => {
    const res = await worker.fetch(
      new Request("https://example.workers.dev/__refresh?secret=manual-trigger-secret"),
      makeEnv(),
    );
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "missing_secret" });
  });

  it("returns 404 for any other route", async () => {
    const res = await worker.fetch(
      new Request("https://example.workers.dev/__scheduled"),
      makeEnv(),
    );
    expect(res.status).toBe(404);
  });

  it("returns 503 when TRIGGER_SECRET is not configured", async () => {
    const res = await worker.fetch(
      new Request("https://example.workers.dev/__refresh", {
        headers: { Authorization: "Bearer manual-trigger-secret" },
      }),
      makeEnv({ TRIGGER_SECRET: undefined }),
    );
    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({ error: "trigger_not_configured" });
  });

  it("returns 500 when the downstream refresh fails despite valid auth", async () => {
    const res = await worker.fetch(
      new Request("https://example.workers.dev/__refresh", {
        headers: { Authorization: "Bearer manual-trigger-secret" },
      }),
      // GITHUB_TOKEN is required by assertEnv inside runRefresh -> downstream failure
      makeEnv({ GITHUB_TOKEN: undefined }),
    );
    expect(res.status).toBe(500);
    expect(await res.text()).toContain("error:");
  });

  it("never compares the manual auth against the GitHub PAT", async () => {
    const res = await worker.fetch(
      new Request("https://example.workers.dev/__refresh", {
        headers: { Authorization: "Bearer github-pat" },
      }),
      makeEnv(),
    );
    // The PAT is not the trigger secret: even a valid PAT is rejected.
    expect(res.status).toBe(403);
  });
});
