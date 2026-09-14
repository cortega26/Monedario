import { describe, expect, it } from "vitest";

import analyticsWorker, {
  runExportV2,
  type Env,
} from "../../../workers/analytics-collector/src/worker-v2";
import { MAX_BODY_SIZE } from "../../../workers/analytics-collector/src/index";

class MockKV {
  store = new Map<string, string>();
  putCalls = 0;

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

  async list(options?: { prefix?: string }): Promise<{
    keys: Array<{ name: string }>;
    list_complete: boolean;
    cursor?: string;
  }> {
    const prefix = options?.prefix ?? "";
    return {
      keys: [...this.store.keys()]
        .filter((key) => key.startsWith(prefix))
        .map((name) => ({ name })),
      list_complete: true,
    };
  }
}

class MockR2 {
  objects = new Map<string, string>();
  async put(key: string, value: string): Promise<void> {
    this.objects.set(key, value);
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
  failWrites = false;

  seed(counter: Counter): void {
    this.counters.set(this.key(counter), { ...counter });
  }

  private key(counter: Omit<Counter, "count">): string {
    return [counter.date, counter.event, counter.slug, counter.dimensions].join("|");
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
      const from = url.searchParams.get("from") ?? "";
      const to = url.searchParams.get("to") ?? "";
      const counters = [...this.counters.values()].filter(
        (counter) => counter.date >= from && counter.date <= to,
      );
      return Response.json({ counters });
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
    const kv = new MockKV({
      "telemetry:v2:2026-09-07:calculator_start:sueldo-liquido:input": "3",
    });
    const counters = new MockCounterStub();
    counters.seed({
      date: "2026-09-07",
      event: "calculator_start",
      slug: "sueldo-liquido",
      dimensions: "input",
      count: 2,
    });
    const env = makeEnv({ kv, counters });

    const result = await runExportV2(env, "2026-W37");

    expect(result.totalEvents).toBe(5);
    expect(result.rows).toBe(1);
    expect(kv.putCalls).toBe(0);

    const r2 = env.ANALYTICS_EXPORTS as unknown as MockR2;
    const raw = r2.objects.get("analytics-exports/2026-W37.json");
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
