import { describe, expect, it, vi } from "vitest";

import analyticsWorker, {
  AnalyticsCounters,
  runExportV2,
  type Env,
} from "../../../workers/analytics-collector/src/worker-v2";
import { MAX_BODY_SIZE } from "../../../workers/analytics-collector/src/index";

class MockKV {
  store = new Map<string, string>();
  putCalls = 0;
  listCalls = 0;
  // Paginates like the real KV list cursor protocol so export cursor loops
  // are exercised (page size mirrors the exporter's batch idiom).
  static readonly LIST_PAGE_SIZE = 50;

  constructor(initial: Record<string, string> = {}) {
    for (const [key, value] of Object.entries(initial)) this.store.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async put(): Promise<void> {
    this.putCalls += 1;
    throw new Error("legacy KV must be read-only");
  }

  async list(options?: { prefix?: string; cursor?: string }): Promise<{
    keys: Array<{ name: string }>;
    list_complete: boolean;
    cursor?: string;
  }> {
    this.listCalls += 1;
    const prefix = options?.prefix ?? "";
    const names = [...this.store.keys()]
      .filter((key) => key.startsWith(prefix))
      .sort();
    let offset = 0;
    if (options?.cursor !== undefined) {
      const parsed = parseInt(options.cursor, 10);
      offset = Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
    }
    const page = names.slice(offset, offset + MockKV.LIST_PAGE_SIZE);
    const next = offset + page.length;
    if (next < names.length) {
      return {
        keys: page.map((name) => ({ name })),
        list_complete: false,
        cursor: String(next),
      };
    }
    return {
      keys: page.map((name) => ({ name })),
      list_complete: true,
    };
  }
}

class MockR2 {
  objects = new Map<string, string>();
  lastOptions: unknown;
  async put(key: string, value: string, options?: unknown): Promise<void> {
    this.objects.set(key, value);
    this.lastOptions = options;
  }
}

type Counter = {
  date: string;
  event: string;
  slug: string;
  dimensions: string;
  count: number;
};

class MockCounterStub {
  counters = new Map<string, Counter>();
  incrementCalls = 0;
  listCalls = 0;
  failWrites = false;
  // Raw rows injected into /list output to simulate poisoned durable rows.
  extraListRows: unknown[] = [];

  seed(counter: Counter): void {
    this.counters.set(this.key(counter), { ...counter });
  }

  private key(counter: Omit<Counter, "count">): string {
    return [counter.date, counter.event, counter.slug, counter.dimensions].join("|");
  }

  private static compare(a: Counter, b: Counter): number {
    const parts: Array<[string, string]> = [
      [a.date, b.date],
      [a.event, b.event],
      [a.slug, b.slug],
      [a.dimensions, b.dimensions],
    ];
    for (const [left, right] of parts) {
      if (left < right) return -1;
      if (left > right) return 1;
    }
    return 0;
  }

  async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const request = input instanceof Request ? input : new Request(input, init);
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/increment") {
      if (this.failWrites) return new Response("fail", { status: 500 });
      const body = (await request.json()) as Omit<Counter, "count">;
      const key = this.key(body);
      const existing = this.counters.get(key);
      this.counters.set(key, {
        ...body,
        count: (existing?.count ?? 0) + 1,
      });
      this.incrementCalls += 1;
      return new Response(null, { status: 204 });
    }

    if (request.method === "GET" && url.pathname === "/list") {
      this.listCalls += 1;
      const from = url.searchParams.get("from") ?? "";
      const to = url.searchParams.get("to") ?? "";
      const limitRaw = url.searchParams.get("limit");
      const cursorRaw = url.searchParams.get("cursor");
      const sorted = [...this.counters.values()]
        .filter((counter) => counter.date >= from && counter.date <= to)
        .sort(MockCounterStub.compare);
      // Opaque offset cursor (the exporter never decodes it — it round-trips
      // whatever the server returns, exactly like the real keyset cursor).
      let offset = 0;
      if (cursorRaw !== null) {
        const match = /^offset:(\d+)$/.exec(cursorRaw);
        offset = match ? parseInt(match[1], 10) : 0;
      }
      const limit =
        limitRaw === null ? sorted.length : parseInt(limitRaw, 10);
      const page = sorted.slice(offset, offset + limit);
      const next = offset + page.length;
      // Poisoned rows ride the first page only (they belong to the window;
      // repeating them per page would simulate duplicates, not poison).
      const rows: unknown[] =
        offset === 0 ? [...page, ...this.extraListRows] : [...page];
      if (next < sorted.length) {
        return Response.json({ counters: rows, cursor: `offset:${next}` });
      }
      return Response.json({ counters: rows });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ ok: true });
    }

    return new Response("not found", { status: 404 });
  }
}

class MockCounterNamespace {
  constructor(readonly stub: MockCounterStub) {}
  idFromName(name: string): string {
    return name;
  }
  get(): MockCounterStub {
    return this.stub;
  }
}

class MockRateLimiter {
  calls: string[] = [];
  constructor(public success = true) {}
  async limit({ key }: { key: string }): Promise<{ success: boolean }> {
    this.calls.push(key);
    return { success: this.success };
  }
}

function makeEnv(options: {
  kv?: MockKV;
  counters?: MockCounterStub;
  limiter?: MockRateLimiter;
} = {}): Env {
  const kv = options.kv ?? new MockKV();
  const counters = options.counters ?? new MockCounterStub();
  const limiter = options.limiter ?? new MockRateLimiter();
  return {
    ANALYTICS_TELEMETRY: kv as unknown as Env["ANALYTICS_TELEMETRY"],
    ANALYTICS_COUNTERS: new MockCounterNamespace(counters) as unknown as Env["ANALYTICS_COUNTERS"],
    ANALYTICS_RATE_LIMITER: limiter as unknown as Env["ANALYTICS_RATE_LIMITER"],
    ANALYTICS_EXPORTS: new MockR2() as unknown as Env["ANALYTICS_EXPORTS"],
    ANALYTICS_DISABLED: "0",
    SCHEMA_VERSION: "2",
    EXPORT_TIMEZONE: "America/Santiago",
    COUNTER_KEY_CUTOVER_AT: "2026-07-20T04:00:00Z",
    EXPORT_SECRET: "secret",
  };
}

function validEvent(ip = "192.0.2.10"): Request {
  return new Request("https://monedario.cl/api/analytics/event", {
    method: "POST",
    headers: {
      Origin: "https://monedario.cl",
      "Content-Type": "application/json",
      "CF-Connecting-IP": ip,
    },
    body: JSON.stringify({
      event: "calculator_start",
      params: {
        calculator_id: "sueldo-liquido",
        interaction_variant: "input",
      },
    }),
  });
}

describe("root-cause fix: ingestion", () => {
  it("accepts a valid event without any KV write", async () => {
    const kv = new MockKV();
    const counters = new MockCounterStub();
    const limiter = new MockRateLimiter(true);
    const env = makeEnv({ kv, counters, limiter });

    const response = await analyticsWorker.fetch(validEvent(), env);

    expect(response.status).toBe(202);
    expect(kv.putCalls).toBe(0);
    expect(counters.incrementCalls).toBe(1);
    expect(limiter.calls).toEqual(["192.0.2.10"]);
  });

  it("returns 429 from the native rate limiter before storage", async () => {
    const kv = new MockKV();
    const counters = new MockCounterStub();
    const limiter = new MockRateLimiter(false);
    const env = makeEnv({ kv, counters, limiter });

    const response = await analyticsWorker.fetch(validEvent(), env);

    expect(response.status).toBe(429);
    expect(kv.putCalls).toBe(0);
    expect(counters.incrementCalls).toBe(0);
  });

  it("surfaces durable storage failure as 503 instead of silently losing data", async () => {
    const kv = new MockKV();
    const counters = new MockCounterStub();
    counters.failWrites = true;
    const env = makeEnv({ kv, counters });

    const response = await analyticsWorker.fetch(validEvent(), env);

    expect(response.status).toBe(503);
    expect(response.headers.get("Retry-After")).toBe("30");
    expect(kv.putCalls).toBe(0);
  });
});

describe("root-cause fix: weekly export", () => {
  it("sums legacy KV and new durable counters without double-writing KV", async () => {
    // 2026-W31 (2026-07-27→08-02) predates the legacy KV sunset
    // (cutover 2026-07-20 + 35-day TTL), so the KV scan still runs here;
    // post-sunset weeks are covered by the plan-099 legacy-skip test.
    const kv = new MockKV({
      "telemetry:v2:2026-07-27:calculator_start:sueldo-liquido:input": "3",
    });
    const counters = new MockCounterStub();
    counters.seed({
      date: "2026-07-27",
      event: "calculator_start",
      slug: "sueldo-liquido",
      dimensions: "input",
      count: 2,
    });
    const env = makeEnv({ kv, counters });

    const result = await runExportV2(env, "2026-W31");

    expect(result.totalEvents).toBe(5);
    expect(result.rows).toBe(1);
    expect(kv.putCalls).toBe(0);

    const r2 = env.ANALYTICS_EXPORTS as unknown as MockR2;
    const raw = r2.objects.get("analytics-exports/2026-W31.json");
    expect(raw).toBeDefined();
    const artifact = JSON.parse(raw ?? "{}") as {
      data: Array<{ count: number; event_name: string }>;
    };
    expect(artifact.data).toHaveLength(1);
    expect(artifact.data[0]).toMatchObject({
      event_name: "calculator_start",
      count: 5,
    });
  });
});

describe("root-cause fix: worker-v2 bounded body (plan 097)", () => {
  const EVENT_URL = "https://monedario.cl/api/analytics/event";

  function postV2(
    init: RequestInit,
    env: Env = makeEnv(),
  ): Promise<Response> {
    return analyticsWorker.fetch(new Request(EVENT_URL, init), env);
  }

  function closedStream(bytes: Uint8Array): ReadableStream<Uint8Array> {
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    });
  }

  function streamInit(
    body: ReadableStream<Uint8Array>,
    extraHeaders: Record<string, string> = {},
  ): RequestInit & { duplex: "half" } {
    return {
      method: "POST",
      headers: { "Content-Type": "application/json", ...extraHeaders },
      body,
      duplex: "half",
    } as unknown as RequestInit & { duplex: "half" };
  }

  const VALID_BODY = JSON.stringify({
    event: "calculator_start",
    params: { calculator_id: "sueldo-liquido", interaction_variant: "input" },
  });

  it("accepts a body of exactly MAX bytes (202)", async () => {
    const encoder = new TextEncoder();
    const baseBytes = encoder.encode(VALID_BODY).length;
    expect(baseBytes).toBeLessThan(MAX_BODY_SIZE);
    // Trailing whitespace: JSON.parse tolerates it, schema untouched.
    const exact = VALID_BODY + " ".repeat(MAX_BODY_SIZE - baseBytes);
    expect(encoder.encode(exact).length).toBe(MAX_BODY_SIZE);

    const response = await postV2(
      streamInit(closedStream(encoder.encode(exact))),
    );
    expect(response.status).toBe(202);
  });

  it("rejects a body of MAX+1 bytes (413)", async () => {
    const encoder = new TextEncoder();
    const baseBytes = encoder.encode(VALID_BODY).length;
    const over = VALID_BODY + " ".repeat(MAX_BODY_SIZE - baseBytes + 1);
    expect(encoder.encode(over).length).toBe(MAX_BODY_SIZE + 1);

    const env = makeEnv();
    const response = await postV2(
      streamInit(closedStream(encoder.encode(over))),
      env,
    );
    expect(response.status).toBe(413);
    expect(
      (env.ANALYTICS_COUNTERS as unknown as MockCounterNamespace).stub
        .incrementCalls,
    ).toBe(0);
  });

  it("counts bytes, not chars: over MAX bytes but under MAX chars is 413", async () => {
    // "é" is 1 UTF-16 unit but 2 UTF-8 bytes.
    const unicodeBody = JSON.stringify({
      event: "calculator_start",
      params: {
        calculator_id: "é".repeat(1500),
        interaction_variant: "input",
      },
    });
    expect(unicodeBody.length).toBeLessThan(MAX_BODY_SIZE);
    expect(new TextEncoder().encode(unicodeBody).length).toBeGreaterThan(
      MAX_BODY_SIZE,
    );

    const response = await postV2(
      streamInit(closedStream(new TextEncoder().encode(unicodeBody))),
    );
    expect(response.status).toBe(413);
  });

  it("stream accounting wins: lying Content-Length with a large body is 413", async () => {
    const big = JSON.stringify({
      event: "calculator_start",
      params: {
        calculator_id: "a".repeat(MAX_BODY_SIZE + 10),
        interaction_variant: "button",
      },
    });
    const response = await postV2(
      streamInit(closedStream(new TextEncoder().encode(big)), {
        "Content-Length": "100",
      }),
    );
    expect(response.status).toBe(413);
  });

  it("decodes multibyte split across chunks: same status as the undivided body (no 400)", async () => {
    const unicodeSmall = JSON.stringify({
      event: "calculator_start",
      params: {
        calculator_id: "sueldo-líquido",
        interaction_variant: "input",
      },
    });
    const raw = new TextEncoder().encode(unicodeSmall);
    expect(raw.length).toBeLessThan(MAX_BODY_SIZE);
    // Cut inside the "í" (U+00ED = C3 AD in UTF-8).
    const cut = raw.indexOf(0xc3) + 1;
    expect(cut).toBeGreaterThan(0);

    const whole = await postV2({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: unicodeSmall,
    });

    const split = await postV2(
      streamInit(
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(raw.slice(0, cut));
            controller.enqueue(raw.slice(cut));
            controller.close();
          },
        }),
      ),
    );
    // Never a 400 caused by splitting the multibyte sequence.
    expect(split.status).toBe(whole.status);
  });
});

describe("plan 098: fail-closed config and input validation", () => {
  const EXPORT_URL = "https://monedario.cl/api/analytics/export";

  function exportRequest(
    week: string | null,
    secret = "secret",
    extraHeaders: Record<string, string> = {},
  ): Request {
    const url = week === null ? EXPORT_URL : `${EXPORT_URL}?week=${week}`;
    return new Request(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${secret}`, ...extraHeaders },
    });
  }

  function eventWithHeaders(headers: Record<string, string>): Request {
    return new Request("https://monedario.cl/api/analytics/event", {
      method: "POST",
      headers: {
        Origin: "https://monedario.cl",
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        event: "calculator_start",
        params: {
          calculator_id: "sueldo-liquido",
          interaction_variant: "input",
        },
      }),
    });
  }

  it("rejects SCHEMA_VERSION=abc before any listing (no silent v1 branch)", async () => {
    const env = { ...makeEnv(), SCHEMA_VERSION: "abc" };
    await expect(runExportV2(env, "2026-W37")).rejects.toThrow(
      "Invalid SCHEMA_VERSION",
    );
    const r2 = env.ANALYTICS_EXPORTS as unknown as MockR2;
    expect(r2.objects.size).toBe(0);
  });

  it("rejects out-of-range SCHEMA_VERSION=99", async () => {
    const env = { ...makeEnv(), SCHEMA_VERSION: "99" };
    await expect(runExportV2(env, "2026-W37")).rejects.toThrow(
      "Invalid SCHEMA_VERSION",
    );
  });

  it("manual export with SCHEMA_VERSION=abc fails closed (no 200 legacy taxonomy)", async () => {
    const env = { ...makeEnv(), SCHEMA_VERSION: "abc" };
    const response = await analyticsWorker.fetch(
      exportRequest("2026-W37"),
      env,
    );
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "export_failed" });
    const r2 = env.ANALYTICS_EXPORTS as unknown as MockR2;
    expect(r2.objects.size).toBe(0);
  });

  it("rejects ?week=2026-W99 with 400 invalid_week", async () => {
    const env = makeEnv();
    const response = await analyticsWorker.fetch(
      exportRequest("2026-W99"),
      env,
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_week" });
    const r2 = env.ANALYTICS_EXPORTS as unknown as MockR2;
    expect(r2.objects.size).toBe(0);
  });

  it("rejects ?week=2026-W00 with 400 invalid_week", async () => {
    const env = makeEnv();
    const response = await analyticsWorker.fetch(
      exportRequest("2026-W00"),
      env,
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_week" });
  });

  it("rejects ?week=2026-W54 with 400 invalid_week", async () => {
    const env = makeEnv();
    const response = await analyticsWorker.fetch(
      exportRequest("2026-W54"),
      env,
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_week" });
  });

  it("rejects W53 in a 52-week year (2025-W53 Monday belongs to 2026-W01)", async () => {
    const env = makeEnv();
    const response = await analyticsWorker.fetch(
      exportRequest("2025-W53"),
      env,
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_week" });
  });

  it("runExportV2 throws on W99 before any R2 write", async () => {
    const env = makeEnv();
    await expect(runExportV2(env, "2026-W99")).rejects.toThrow(
      "Invalid export week",
    );
    const r2 = env.ANALYTICS_EXPORTS as unknown as MockR2;
    expect(r2.objects.size).toBe(0);
  });

  it("ignores spoofed X-Forwarded-For: same CF IP shares one limiter key", async () => {
    const limiter = new MockRateLimiter(true);
    const env = makeEnv({ limiter });
    const first = await analyticsWorker.fetch(
      eventWithHeaders({
        "CF-Connecting-IP": "192.0.2.10",
        "X-Forwarded-For": "203.0.113.1",
      }),
      env,
    );
    const second = await analyticsWorker.fetch(
      eventWithHeaders({
        "CF-Connecting-IP": "192.0.2.10",
        "X-Forwarded-For": "203.0.113.2, 203.0.113.3",
      }),
      env,
    );
    expect(first.status).toBe(202);
    expect(second.status).toBe(202);
    expect(limiter.calls).toEqual(["192.0.2.10", "192.0.2.10"]);
  });

  it("missing CF-Connecting-IP falls into a single unknown bucket (XFF ignored)", async () => {
    const limiter = new MockRateLimiter(true);
    const env = makeEnv({ limiter });
    const response = await analyticsWorker.fetch(
      eventWithHeaders({ "X-Forwarded-For": "203.0.113.9" }),
      env,
    );
    expect(response.status).toBe(202);
    expect(limiter.calls).toEqual(["unknown"]);
  });

  it("manual-export limiter key ignores XFF too", async () => {
    const limiter = new MockRateLimiter(true);
    const env = makeEnv({ limiter });
    const first = await analyticsWorker.fetch(
      exportRequest("2026-W37", "secret", {
        "CF-Connecting-IP": "192.0.2.44",
        "X-Forwarded-For": "203.0.113.5",
      }),
      env,
    );
    const second = await analyticsWorker.fetch(
      exportRequest("2026-W37", "secret", {
        "CF-Connecting-IP": "192.0.2.44",
        "X-Forwarded-For": "203.0.113.6",
      }),
      env,
    );
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(limiter.calls).toEqual([
      "export:192.0.2.44",
      "export:192.0.2.44",
    ]);
  });

  it("honors a stricter MAX_BODY_SIZE env override with 413", async () => {
    const env = { ...makeEnv(), MAX_BODY_SIZE: "10" };
    const response = await analyticsWorker.fetch(validEvent(), env);
    expect(response.status).toBe(413);
    const stub = env.ANALYTICS_COUNTERS as unknown as MockCounterNamespace;
    expect(stub.stub.incrementCalls).toBe(0);
  });

  it("falls back to the constant on an invalid MAX_BODY_SIZE override", async () => {
    const env = { ...makeEnv(), MAX_BODY_SIZE: "abc" };
    const response = await analyticsWorker.fetch(validEvent(), env);
    expect(response.status).toBe(202);
  });

  it("honors an ALLOWED_ORIGIN env override (allow + deny)", async () => {
    const env = {
      ...makeEnv(),
      ALLOWED_ORIGIN: "https://example.com",
    };
    const allowed = await analyticsWorker.fetch(
      eventWithHeaders({
        Origin: "https://example.com",
        "CF-Connecting-IP": "192.0.2.10",
      }),
      env,
    );
    expect(allowed.status).toBe(202);
    expect(allowed.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://example.com",
    );

    const denied = await analyticsWorker.fetch(
      eventWithHeaders({
        Origin: "https://monedario.cl",
        "CF-Connecting-IP": "192.0.2.10",
      }),
      env,
    );
    expect(denied.status).toBe(403);
  });

  it("falls back to the constant on an invalid ALLOWED_ORIGIN override", async () => {
    const env = { ...makeEnv(), ALLOWED_ORIGIN: "not-a-url" };
    const response = await analyticsWorker.fetch(validEvent(), env);
    expect(response.status).toBe(202);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://monedario.cl",
    );
  });
});

describe("plan 099: analytics export hardening", () => {
  const W31_DATES = [
    "2026-07-27",
    "2026-07-28",
    "2026-07-29",
    "2026-07-30",
    "2026-07-31",
    "2026-08-01",
    "2026-08-02",
  ];

  function ctaClickEvent(): Request {
    return new Request("https://monedario.cl/api/analytics/event", {
      method: "POST",
      headers: {
        Origin: "https://monedario.cl",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: "article_calculator_cta_click",
        params: {
          cta_type: "article-calculator-cta",
          cta_location: "post-result",
          destination_url: "https://monedario.cl/calculadoras/sueldo-liquido/",
          page_type: "article",
          app_version: "1.2.3",
        },
      }),
    });
  }

  it("paginates the DO export to exhaustion with exact totals", async () => {
    const counters = new MockCounterStub();
    for (let i = 0; i < 120; i += 1) {
      counters.seed({
        date: W31_DATES[i % W31_DATES.length],
        event: "calculator_start",
        slug: "tool",
        dimensions: `dim-${i}`,
        count: 1,
      });
    }
    const env = makeEnv({ kv: new MockKV(), counters });

    const first = await runExportV2(env, "2026-W31");

    expect(first.totalEvents).toBe(120);
    expect(first.rows).toBe(120);
    // 120 rows at 50 per page forces multiple round-trips.
    expect(counters.listCalls).toBeGreaterThanOrEqual(3);

    // A retry replays the same pages: identical totals, never duplicated.
    const second = await runExportV2(env, "2026-W31");
    expect(second.totalEvents).toBe(120);
    expect(second.rows).toBe(120);
  });

  it("pages legacy KV cursors without double-counting", async () => {
    const initial: Record<string, string> = {};
    for (let i = 0; i < 60; i += 1) {
      initial[`telemetry:v2:2026-07-27:calculator_start:tool:d${i}`] = "1";
    }
    const kv = new MockKV(initial);
    const env = makeEnv({ kv, counters: new MockCounterStub() });

    const result = await runExportV2(env, "2026-W31");

    expect(result.totalEvents).toBe(60);
    // 60 keys on one date at 50 per mock page forces a cursor follow-up.
    expect(kv.listCalls).toBeGreaterThanOrEqual(2);

    const retry = await runExportV2(env, "2026-W31");
    expect(retry.totalEvents).toBe(60);
  });

  it("excludes poisoned durable rows without failing the week", async () => {
    const counters = new MockCounterStub();
    counters.seed({
      date: "2026-07-27",
      event: "calculator_start",
      slug: "tool",
      dimensions: "ok-a",
      count: 2,
    });
    counters.seed({
      date: "2026-07-28",
      event: "calculator_start",
      slug: "tool",
      dimensions: "ok-b",
      count: 3,
    });
    counters.extraListRows = [
      null,
      "not-a-row",
      {
        date: "2026-13-40",
        event: "calculator_start",
        slug: "s",
        dimensions: "",
        count: 1,
      },
      { date: "2026-07-27", event: "", slug: "s", dimensions: "", count: 1 },
      {
        date: "2026-07-27",
        event: "calculator_start",
        slug: "s",
        dimensions: "",
        count: -1,
      },
      {
        date: "2026-07-27",
        event: "calculator_start",
        slug: "s",
        dimensions: "",
        count: "3",
      },
      {
        date: "2020-01-01",
        event: "calculator_start",
        slug: "s",
        dimensions: "",
        count: 9,
      },
    ];
    const env = makeEnv({ kv: new MockKV(), counters });

    const result = await runExportV2(env, "2026-W31");

    expect(result.totalEvents).toBe(5);
    expect(result.rows).toBe(2);
    const r2 = env.ANALYTICS_EXPORTS as unknown as MockR2;
    expect(r2.objects.get("analytics-exports/2026-W31.json")).toBeDefined();
  });

  it("skips the legacy KV scan past TTL and keeps old-week re-exports", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    try {
      const kv = new MockKV({
        "telemetry:v2:2026-09-07:calculator_start:sueldo-liquido:stale": "5",
      });
      const counters = new MockCounterStub();
      counters.seed({
        date: "2026-09-07",
        event: "calculator_start",
        slug: "sueldo-liquido",
        dimensions: "fresh",
        count: 2,
      });
      const env = makeEnv({ kv, counters });

      // 2026-W37 starts after cutover (2026-07-20) + 35-day TTL: the stale
      // KV key must not be read and the export still succeeds on DO data.
      const result = await runExportV2(env, "2026-W37");

      expect(result.totalEvents).toBe(2);
      expect(kv.listCalls).toBe(0);
      expect(
        logSpy.mock.calls.some((args) =>
          args.map(String).join(" ").includes("legacy_skipped"),
        ),
      ).toBe(true);
    } finally {
      logSpy.mockRestore();
    }

    // Manual old-week re-export (?week=2026-W29) predates the sunset and
    // must still scan legacy KV.
    const oldKv = new MockKV({
      "telemetry:v1:2026-07-13:calculator_start:sueldo-liquido:kept": "4",
    });
    const oldCounters = new MockCounterStub();
    oldCounters.seed({
      date: "2026-07-13",
      event: "calculator_start",
      slug: "sueldo-liquido",
      dimensions: "kept",
      count: 1,
    });
    const oldEnv = makeEnv({ kv: oldKv, counters: oldCounters });

    const oldResult = await runExportV2(oldEnv, "2026-W29");

    expect(oldResult.totalEvents).toBe(5);
    expect(oldKv.listCalls).toBeGreaterThan(0);
  });

  it("writes a compact artifact that round-trips through JSON.parse", async () => {
    const counters = new MockCounterStub();
    counters.seed({
      date: "2026-07-27",
      event: "calculator_start",
      slug: "tool",
      dimensions: "input",
      count: 7,
    });
    const env = makeEnv({ kv: new MockKV(), counters });

    await runExportV2(env, "2026-W31");

    const r2 = env.ANALYTICS_EXPORTS as unknown as MockR2;
    const raw = r2.objects.get("analytics-exports/2026-W31.json") ?? "";
    expect(raw.endsWith("\n")).toBe(true);
    expect(raw.includes("\n  ")).toBe(false);
    const parsed = JSON.parse(raw) as { data: unknown[] };
    expect(Array.isArray(parsed.data)).toBe(true);
    expect(parsed.data).toHaveLength(1);
    const options = r2.lastOptions as {
      httpMetadata?: { contentType?: string };
    };
    expect(options?.httpMetadata?.contentType).toBe("application/json");
  });

  it("keeps the legacy dimensions join for enum-only events", async () => {
    const counters = new MockCounterStub();
    const env = makeEnv({ kv: new MockKV(), counters });

    const response = await analyticsWorker.fetch(validEvent(), env);

    expect(response.status).toBe(202);
    const stored = [...counters.counters.values()];
    expect(stored).toHaveLength(1);
    // No ":"-bearing value: the historical bare-values join is preserved so
    // the series merges with pre-099 rows.
    expect(stored[0].dimensions).toBe("input");
  });

  it("serializes a colon-bearing destination_url as versioned pairs", async () => {
    const counters = new MockCounterStub();
    const env = makeEnv({ kv: new MockKV(), counters });

    const response = await analyticsWorker.fetch(ctaClickEvent(), env);

    expect(response.status).toBe(202);
    const stored = [...counters.counters.values()];
    expect(stored).toHaveLength(1);
    expect(stored[0].dimensions).toBe(
      "v2:app_version=1.2.3:cta_location=post-result:cta_type=article-calculator-cta:destination_url=https\\://monedario.cl/calculadoras/sueldo-liquido/",
    );
  });

  it("carries new-format dimensions through export opaquely", async () => {
    const dimensions =
      "v2:app_version=1.2.3:cta_location=post-result:cta_type=article-calculator-cta:destination_url=https\\://monedario.cl/calculadoras/sueldo-liquido/";
    const counters = new MockCounterStub();
    counters.seed({
      date: "2026-07-27",
      event: "article_calculator_cta_click",
      slug: "article",
      dimensions,
      count: 2,
    });
    const env = makeEnv({ kv: new MockKV(), counters });

    const result = await runExportV2(env, "2026-W31");

    expect(result.totalEvents).toBe(2);
    const r2 = env.ANALYTICS_EXPORTS as unknown as MockR2;
    const raw = r2.objects.get("analytics-exports/2026-W31.json") ?? "";
    const artifact = JSON.parse(raw) as {
      data: Array<{ dimensions: string; count: number }>;
    };
    expect(artifact.data).toHaveLength(1);
    expect(artifact.data[0].dimensions).toBe(dimensions);
    expect(artifact.data[0].count).toBe(2);
  });
});

describe("plan 100: v2 fetch branch matrix", () => {
  const EVENT_URL = "https://monedario.cl/api/analytics/event";

  function postRaw(body: string, contentType: string): Request {
    return new Request(EVENT_URL, {
      method: "POST",
      headers: {
        Origin: "https://monedario.cl",
        "Content-Type": contentType,
      },
      body,
    });
  }

  it("rejects non-POST ingestion with 405", async () => {
    const env = makeEnv();
    const response = await analyticsWorker.fetch(
      new Request(EVENT_URL, { method: "GET" }),
      env,
    );
    expect(response.status).toBe(405);
  });

  it("rejects a foreign Origin with 403", async () => {
    const env = makeEnv();
    const response = await analyticsWorker.fetch(
      new Request(EVENT_URL, {
        method: "POST",
        headers: {
          Origin: "https://evil.example.com",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ event: "calculator_view", params: {} }),
      }),
      env,
    );
    expect(response.status).toBe(403);
  });

  it("rejects a non-JSON content type with 415", async () => {
    const env = makeEnv();
    const response = await analyticsWorker.fetch(
      postRaw("{}", "text/plain"),
      env,
    );
    expect(response.status).toBe(415);
  });

  it("rejects malformed JSON with 400", async () => {
    const env = makeEnv();
    const response = await analyticsWorker.fetch(
      postRaw("{oops", "application/json"),
      env,
    );
    expect(response.status).toBe(400);
  });

  it("rejects a schema-invalid payload with 422", async () => {
    const env = makeEnv();
    const response = await analyticsWorker.fetch(
      postRaw(
        JSON.stringify({ event: "not_a_real_event", params: {} }),
        "application/json",
      ),
      env,
    );
    expect(response.status).toBe(422);
  });

  it("rejects everything with 503 while ANALYTICS_DISABLED=1", async () => {
    const counters = new MockCounterStub();
    const env = { ...makeEnv({ counters }), ANALYTICS_DISABLED: "1" };
    const response = await analyticsWorker.fetch(validEvent(), env);
    expect(response.status).toBe(503);
    expect(counters.incrementCalls).toBe(0);
  });
});

describe("plan 100: v2 manual-export auth matrix", () => {
  const EXPORT_URL = "https://monedario.cl/api/analytics/export?week=2026-W37";

  function exportGet(auth?: string): Request {
    const headers: Record<string, string> = {};
    if (auth !== undefined) headers.Authorization = auth;
    return new Request(EXPORT_URL, { method: "GET", headers });
  }

  it("returns 503 export_not_configured without EXPORT_SECRET", async () => {
    const env = { ...makeEnv(), EXPORT_SECRET: undefined };
    const response = await analyticsWorker.fetch(
      exportGet("Bearer secret"),
      env,
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "export_not_configured" });
  });

  it("returns 401 missing_secret without Authorization", async () => {
    const env = makeEnv();
    const response = await analyticsWorker.fetch(exportGet(), env);
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "missing_secret" });
  });

  it("returns 403 invalid_secret on a wrong bearer", async () => {
    const env = makeEnv();
    const response = await analyticsWorker.fetch(
      exportGet("Bearer wrong"),
      env,
    );
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "invalid_secret" });
  });

  it("returns 429 when the export rate limiter refuses", async () => {
    const limiter = new MockRateLimiter(false);
    const env = makeEnv({ limiter });
    const response = await analyticsWorker.fetch(
      exportGet("Bearer secret"),
      env,
    );
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: "rate_limited" });
  });
});

describe("plan 100: AnalyticsCounters edges via direct instantiation", () => {
  // The class only uses state.storage.sql; a stub whose exec returns an
  // empty row set suffices for every early-return edge below.
  function makeDO(): AnalyticsCounters {
    const stub = {
      exec: () => ({ toArray: () => [] as unknown[] }),
    };
    return new AnalyticsCounters({
      storage: { sql: stub },
    } as unknown as ConstructorParameters<typeof AnalyticsCounters>[0]);
  }

  function doRequest(path: string, init?: RequestInit): Request {
    return new Request(`https://analytics-counter.internal${path}`, init);
  }

  it("answers /health with { ok: true }", async () => {
    const response = await makeDO().fetch(doRequest("/health"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("rejects an inverted /list window with invalid_window", async () => {
    const response = await makeDO().fetch(
      doRequest("/list?from=2026-08-02&to=2026-07-27"),
    );
    expect(response.status).toBe(400);
    expect(await response.text()).toBe("invalid_window");
  });

  it("rejects a missing /list window with invalid_window", async () => {
    const response = await makeDO().fetch(doRequest("/list"));
    expect(response.status).toBe(400);
    expect(await response.text()).toBe("invalid_window");
  });

  it("rejects an out-of-range /list limit with invalid_limit", async () => {
    for (const limit of ["0", "1001", "abc"]) {
      const response = await makeDO().fetch(
        doRequest(`/list?from=2026-07-27&to=2026-08-02&limit=${limit}`),
      );
      expect(response.status).toBe(400);
      expect(await response.text()).toBe("invalid_limit");
    }
  });

  it("rejects an undecodable /list cursor with invalid_cursor", async () => {
    const response = await makeDO().fetch(
      doRequest("/list?from=2026-07-27&to=2026-08-02&cursor=not-json"),
    );
    expect(response.status).toBe(400);
    expect(await response.text()).toBe("invalid_cursor");
  });

  it("rejects a malformed /increment body with invalid_json", async () => {
    const response = await makeDO().fetch(
      doRequest("/increment", { method: "POST", body: "{oops" }),
    );
    expect(response.status).toBe(400);
    expect(await response.text()).toBe("invalid_json");
  });

  it("rejects a well-formed but schema-invalid /increment with invalid_counter", async () => {
    const response = await makeDO().fetch(
      doRequest("/increment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: "2026-07-27" }),
      }),
    );
    expect(response.status).toBe(422);
    expect(await response.text()).toBe("invalid_counter");
  });

  it("answers unknown routes with not_found", async () => {
    const response = await makeDO().fetch(doRequest("/nope"));
    expect(response.status).toBe(404);
    expect(await response.text()).toBe("not_found");
  });
});
