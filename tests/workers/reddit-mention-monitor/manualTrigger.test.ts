import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../../../workers/reddit-mention-monitor/src/index";

function makeKv(): KVNamespace {
  const store = new Map<string, string>();
  return {
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => {
      store.set(key, value);
    },
  } as unknown as KVNamespace;
}

function makeEnv(overrides: Record<string, unknown> = {}) {
  return {
    REDDIT_SEEN: makeKv(),
    REDDIT_CLIENT_ID: "client-id",
    REDDIT_CLIENT_SECRET: "client-secret",
    DISCORD_WEBHOOK_URL: "https://discord.example/hook",
    REDDIT_USER_AGENT: "monedario-test",
    CHECK_SECRET: "check-secret",
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("/__check manual trigger auth", () => {
  it("returns 200 with a valid Authorization Bearer header", async () => {
    // Stub network: token endpoint + empty search listings -> no alerts, no KV writes.
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/v1/access_token")) {
        return { ok: true, json: async () => ({ access_token: "t" }) };
      }
      if (url.includes("/search")) {
        return { ok: true, json: async () => ({ data: { children: [] } }) };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    }));

    const res = await worker.fetch(
      new Request("https://example.workers.dev/__check", {
        headers: { Authorization: "Bearer check-secret" },
      }),
      makeEnv(),
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ found: 0, alerted: 0 });
  });

  it("returns 401 when the Authorization header is missing", async () => {
    const res = await worker.fetch(
      new Request("https://example.workers.dev/__check"),
      makeEnv(),
    );
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "missing_secret" });
  });

  it("returns 403 for a wrong secret", async () => {
    const res = await worker.fetch(
      new Request("https://example.workers.dev/__check", {
        headers: { Authorization: "Bearer wrong-secret" },
      }),
      makeEnv(),
    );
    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({ error: "invalid_secret" });
  });

  it("returns 401 for a malformed Authorization scheme", async () => {
    const res = await worker.fetch(
      new Request("https://example.workers.dev/__check", {
        headers: { Authorization: "Bearer" },
      }),
      makeEnv(),
    );
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "missing_secret" });
  });

  it("rejects the legacy query-string form (old ?secret= URLs fail)", async () => {
    const res = await worker.fetch(
      new Request("https://example.workers.dev/__check?secret=check-secret"),
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

  it("returns 503 when CHECK_SECRET is not configured", async () => {
    const res = await worker.fetch(
      new Request("https://example.workers.dev/__check", {
        headers: { Authorization: "Bearer check-secret" },
      }),
      makeEnv({ CHECK_SECRET: undefined }),
    );
    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({ error: "check_not_configured" });
  });

  it("returns 500 when the downstream run fails despite valid auth", async () => {
    const res = await worker.fetch(
      new Request("https://example.workers.dev/__check", {
        headers: { Authorization: "Bearer check-secret" },
      }),
      // REDDIT_CLIENT_ID is required by assertEnv inside runMonitor -> downstream failure
      makeEnv({ REDDIT_CLIENT_ID: undefined }),
    );
    expect(res.status).toBe(500);
    expect(await res.text()).toContain("error:");
  });
});
