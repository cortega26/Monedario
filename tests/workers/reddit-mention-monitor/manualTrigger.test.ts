import { afterEach, describe, expect, it, vi } from "vitest";
import worker, { type Env } from "../../../workers/reddit-mention-monitor/src/index";
import type { Match } from "../../../workers/reddit-mention-monitor/src/discord";

// Forces postAlert to deliver only the first match (partial Discord failure).
// Off by default so existing cases exercise the real implementation.
const discordControl = vi.hoisted(() => ({ failPartially: false }));

vi.mock("../../../workers/reddit-mention-monitor/src/discord", async importOriginal => {
  const actual =
    await importOriginal<typeof import("../../../workers/reddit-mention-monitor/src/discord")>();
  return {
    ...actual,
    postAlert: async (url: string, matches: Match[], timeoutMs?: number) => {
      if (!discordControl.failPartially) {
        return actual.postAlert(url, matches, timeoutMs);
      }
      return {
        delivered: matches.slice(0, 1),
        error: new Error("Discord webhook failed (429): rate limited"),
      };
    },
  };
});

// Structural KV mock. NOT typed as KVNamespace: @cloudflare/workers-types is
// not in the repo tsconfig that astro check uses (same note as logic.test.ts).
type KvCache = {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
};

function makeKv(): KvCache {
  const store = new Map<string, string>();
  return {
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

function makeEnv(overrides: Record<string, unknown> = {}): Env {
  return {
    REDDIT_SEEN: makeKv() as unknown as Env["REDDIT_SEEN"],
    REDDIT_CLIENT_ID: "client-id",
    REDDIT_CLIENT_SECRET: "client-secret",
    DISCORD_WEBHOOK_URL: "https://discord.example/hook",
    REDDIT_USER_AGENT: "monedario-test",
    CHECK_SECRET: "check-secret",
    ...overrides,
  } as unknown as Env;
}

afterEach(() => {
  vi.unstubAllGlobals();
  discordControl.failPartially = false;
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
    await expect(res.json()).resolves.toEqual({ found: 0, alerted: 0, attempted: 0 });
  });

  it("reports delivered (not attempted) when Discord partially fails", async () => {
    discordControl.failPartially = true;
    const child = (id: string, title: string) => ({
      data: {
        name: id,
        title,
        subreddit: "chile",
        permalink: `/r/chile/comments/${id}/`,
        author: "example-user",
        score: 10,
        created_utc: 0,
        over_18: false,
      },
    });
    let searchCalls = 0;
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/v1/access_token")) {
        return { ok: true, json: async () => ({ access_token: "t" }) };
      }
      if (url.includes("/search")) {
        searchCalls += 1;
        if (searchCalls === 1) {
          return {
            ok: true,
            json: async () => ({
              data: { children: [child("t3_a", "AFP post"), child("t3_b", "AFP otro")] },
            }),
          };
        }
        return { ok: true, json: async () => ({ data: { children: [] } }) };
      }
      throw new Error(`unexpected fetch: ${url}`);
    }));

    const res = await worker.fetch(
      new Request("https://example.workers.dev/__check", {
        headers: { Authorization: "Bearer check-secret" },
      }),
      makeEnv(),
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ found: 2, alerted: 1, attempted: 2 });
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
