import { afterEach, describe, expect, it, vi } from "vitest";

import {
  default as analyticsCollector,
  validateEventPayload,
  sanitizeCollectorEvent,
  MAX_BODY_SIZE,
  dateToISOWeekUTC,
  isoWeekToDateRangeUTC,
  parseCounterKey,
  aggregateWindow,
  buildExportArtifact,
  validateExportArtifact,
  runExport,
  type TelemetryCounter,
  type ExportDataRow,
  type Env,
} from "../../../workers/analytics-collector/src/index";

class MockKV {
  store = new Map<string, string>();

  constructor(initial: Record<string, string> = {}) {
    for (const [key, value] of Object.entries(initial)) {
      this.store.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async list(options?: { prefix?: string }): Promise<{
    keys: Array<{ name: string }>;
    list_complete: boolean;
    cursor?: string;
  }> {
    const prefix = options?.prefix ?? "";
    return {
      keys: [...this.store.keys()]
        .filter((name) => name.startsWith(prefix))
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

function makeEnv(initialCounters: Record<string, string> = {}): Env {
  return {
    ANALYTICS_TELEMETRY: new MockKV(initialCounters) as unknown as Env["ANALYTICS_TELEMETRY"],
    ANALYTICS_EXPORTS: new MockR2() as unknown as Env["ANALYTICS_EXPORTS"],
    ANALYTICS_DISABLED: "1",
    SCHEMA_VERSION: "1",
    EXPORT_SECRET: "manual-secret",
  };
}

function getMockR2(env: Env): MockR2 {
  return env.ANALYTICS_EXPORTS as unknown as MockR2;
}

afterEach(() => {
  vi.useRealTimers();
});

// ── Collector schema validation ──

describe("validateEventPayload", () => {
  it("acepta un evento válido con campos allowlisted", () => {
    const result = validateEventPayload({
      event: "calculator_start",
      params: {
        calculator_slug: "sueldo-liquido",
        interaction_type: "input",
      },
    });
    expect(result.valid).toBe(true);
    expect(result.event).toBe("calculator_start");
    expect(result.params).toEqual({
      calculator_slug: "sueldo-liquido",
      interaction_type: "input",
    });
  });

  it("rechaza payload sin campo event", () => {
    const result = validateEventPayload({
      params: { calculator_slug: "test" },
    });
    expect(result.valid).toBe(false);
  });

  it("rechaza payload con event no string", () => {
    const result = validateEventPayload({
      event: 123,
      params: {},
    });
    expect(result.valid).toBe(false);
  });

  it("rechaza evento no allowlisted", () => {
    const result = validateEventPayload({
      event: "article_scroll_depth",
      params: { article_slug: "test", scroll_depth_percent: 50 },
    });
    expect(result.valid).toBe(false);
  });

  it("rechaza payload sin params", () => {
    const result = validateEventPayload({
      event: "calculator_start",
    });
    expect(result.valid).toBe(false);
  });

  it("rechaza params que no son objeto", () => {
    const result = validateEventPayload({
      event: "calculator_start",
      params: "string-instead-of-object",
    });
    expect(result.valid).toBe(false);
  });

  it("rechaza payload null", () => {
    expect(validateEventPayload(null).valid).toBe(false);
    expect(validateEventPayload(undefined).valid).toBe(false);
    expect(validateEventPayload("string").valid).toBe(false);
    expect(validateEventPayload([]).valid).toBe(false);
  });

  it("rechaza keys desconocidas en params (server-side strict)", () => {
    const result = validateEventPayload({
      event: "calculator_start",
      params: {
        calculator_slug: "test",
        interaction_type: "click",
        unknown_field: "should-be-rejected",
        otro_campo: 42,
      },
    });
    expect(result.valid).toBe(false);
  });

  it("rechaza campos prohibidos en params", () => {
    const result = validateEventPayload({
      event: "calculator_start",
      params: {
        calculator_slug: "test",
        interaction_type: "click",
        profile_signal: "derived text",
      },
    });
    expect(result.valid).toBe(false);
  });

  it("rechaza si calculator_slug excede 200 chars", () => {
    const result = validateEventPayload({
      event: "calculator_start",
      params: {
        calculator_slug: "a".repeat(201),
        interaction_type: "click",
      },
    });
    expect(result.valid).toBe(false);
  });

  it("rechaza outcome_class inválido", () => {
    const result = validateEventPayload({
      event: "calculator_complete",
      params: {
        calculator_slug: "test",
        outcome_class: "invalid_outcome",
      },
    });
    expect(result.valid).toBe(false);
  });

  it("acepta todos los eventos allowlisted con params válidos", () => {
    const validCases = [
      {
        event: "calculator_view",
        params: { page_type: "calculator", calculator_slug: "t" },
      },
      {
        event: "calculator_start",
        params: { calculator_slug: "t", interaction_type: "click" },
      },
      {
        event: "calculator_complete",
        params: { calculator_slug: "t", outcome_class: "success" },
      },
      {
        event: "calculator_error",
        params: { calculator_slug: "t", error_code: "validation" },
      },
      {
        event: "next_best_step_shown",
        params: { calculator_slug: "t", rule_id: "r1", position: 1 },
      },
      {
        event: "next_best_step_click",
        params: { calculator_slug: "t", rule_id: "r1", position: 1 },
      },
      {
        event: "result_action_click",
        params: { calculator_slug: "t", action_id: "share" },
      },
      {
        event: "share_result_click",
        params: { calculator_slug: "t", channel: "copy" },
      },
      {
        event: "scenario_action",
        params: { calculator_slug: "t", action: "save" },
      },
      {
        event: "resume_click",
        params: { item_type: "calculator", item_id: "sueldo-liquido" },
      },
      {
        event: "support_page_click",
        params: { page_type: "post", source_context: "article" },
      },
      {
        event: "official_source_click",
        params: { page_type: "post", source_domain: "sii.cl" },
      },
    ];

    for (const { event, params } of validCases) {
      const result = validateEventPayload({ event, params });
      expect(result.valid).toBe(true);
    }
  });

  // ── Free-form token dimensions (calculator_slug, rule_id, action_id) ──

  it("acepta un calculator_slug corto y válido", () => {
    const result = validateEventPayload({
      event: "calculator_view",
      params: { page_type: "calculator", calculator_slug: "sueldo-liquido" },
    });
    expect(result.valid).toBe(true);
  });

  it("acepta un rule_id real", () => {
    const result = validateEventPayload({
      event: "next_best_step_click",
      params: {
        calculator_slug: "sueldo-liquido",
        rule_id: "sl-to-apv-midhigh",
        position: 1,
      },
    });
    expect(result.valid).toBe(true);
  });

  it("rechaza calculator_slug con espacio", () => {
    const result = validateEventPayload({
      event: "calculator_view",
      params: { page_type: "calculator", calculator_slug: "sueldo liquido" },
    });
    expect(result.valid).toBe(false);
  });

  it("rechaza calculator_slug con path/puntuación", () => {
    const result = validateEventPayload({
      event: "calculator_view",
      params: { page_type: "calculator", calculator_slug: "../etc" },
    });
    expect(result.valid).toBe(false);
  });

  it("rechaza calculator_slug con mayúsculas", () => {
    const result = validateEventPayload({
      event: "calculator_view",
      params: { page_type: "calculator", calculator_slug: "Sueldo" },
    });
    expect(result.valid).toBe(false);
  });

  it("rechaza calculator_slug con unicode", () => {
    const result = validateEventPayload({
      event: "calculator_view",
      params: { page_type: "calculator", calculator_slug: "café☕" },
    });
    expect(result.valid).toBe(false);
  });

  it("acepta item_id con forma de path (item_id queda fuera de este plan)", () => {
    const result = validateEventPayload({
      event: "resume_click",
      params: {
        item_type: "calculator",
        item_id: "/calculadoras/sueldo-liquido/",
      },
    });
    expect(result.valid).toBe(true);
  });
});

// ── Body size validation ──

describe("payload size", () => {
  it("payload >2 KB se rechaza", () => {
    const bigPayload = {
      event: "calculator_start",
      params: {
        calculator_slug: "a".repeat(2100),
        interaction_type: "click",
      },
    };
    const body = JSON.stringify(bigPayload);
    expect(body.length).toBeGreaterThan(MAX_BODY_SIZE);
  });

  it("payload <=2 KB se acepta", () => {
    const smallPayload = {
      event: "calculator_start",
      params: {
        calculator_slug: "sueldo-liquido",
        interaction_type: "click",
      },
    };
    const body = JSON.stringify(smallPayload);
    expect(body.length).toBeLessThanOrEqual(MAX_BODY_SIZE);
  });
});

// ── Worker sanitization function ──

describe("sanitizeCollectorEvent", () => {
  it("elimina profile_signal aunque sea la única key extra", () => {
    const result = sanitizeCollectorEvent("next_best_step_shown", {
      calculator_slug: "test",
      rule_id: "r1",
      position: 1,
      profile_signal: "sueldo >= 1M",
    });
    expect(result).not.toBeNull();
    expect(result!.params).not.toHaveProperty("profile_signal");
    expect(result!.params).toEqual({
      calculator_slug: "test",
      rule_id: "r1",
      position: 1,
    });
  });

  it("retorna null para evento no allowlisted", () => {
    const result = sanitizeCollectorEvent("user_login", {
      user_id: "123",
    });
    expect(result).toBeNull();
  });

  it("elimina campos con valores objeto o array", () => {
    const result = sanitizeCollectorEvent("calculator_start", {
      calculator_slug: "test",
      interaction_type: "click",
      nested: { a: 1 },
      arr: [1, 2, 3],
    });
    expect(result).not.toBeNull();
    expect(result!.params).not.toHaveProperty("nested");
    expect(result!.params).not.toHaveProperty("arr");
  });

  it("trunca strings largos", () => {
    const longString = "x".repeat(500);
    const result = sanitizeCollectorEvent("calculator_view", {
      page_type: "calculator",
      calculator_slug: longString,
    });
    expect(result).not.toBeNull();
    const slug = result!.params.calculator_slug as string;
    expect(slug.length).toBeLessThanOrEqual(200);
  });
});

// ── ISO week helpers ───────────────────────────────────────────────────────

describe("dateToISOWeekUTC", () => {
  it("returns correct ISO week for a known Monday", () => {
    // 2026-06-22 is a Monday
    const week = dateToISOWeekUTC(new Date("2026-06-22T00:00:00Z"));
    expect(week).toBe("2026-W26");
  });

  it("returns correct ISO week for a known Sunday", () => {
    // 2026-06-28 is a Sunday (last day of W26)
    const week = dateToISOWeekUTC(new Date("2026-06-28T23:59:59Z"));
    expect(week).toBe("2026-W26");
  });

  it("handles W01 spanning years (Dec 29 2025 = W01 2026)", () => {
    // 2025-12-29 is a Monday in W01 2026
    const week = dateToISOWeekUTC(new Date("2025-12-29T00:00:00Z"));
    expect(week).toBe("2026-W01");
  });

  it("returns W53 for Dec 28 2026 (Monday of W53)", () => {
    // 2026-12-28 is a Monday — check if it belongs to W53 2026
    const week = dateToISOWeekUTC(new Date("2026-12-28T00:00:00Z"));
    expect(week).toMatch(/^2026-W5[23]$/);
  });
});

describe("isoWeekToDateRangeUTC", () => {
  it("returns Monday–Sunday range for W26 2026", () => {
    const range = isoWeekToDateRangeUTC("2026-W26");
    expect(range.from).toBe("2026-06-22");
    expect(range.to).toBe("2026-06-28");
  });

  it("throws on invalid format", () => {
    expect(() => isoWeekToDateRangeUTC("2026-26")).toThrow();
    expect(() => isoWeekToDateRangeUTC("abc")).toThrow();
  });

  it("handles W01 2026 (starts Dec 29 2025)", () => {
    const range = isoWeekToDateRangeUTC("2026-W01");
    expect(range.from).toBe("2025-12-29");
    expect(range.to).toBe("2026-01-04");
  });
});

// ── Counter key parsing ───────────────────────────────────────────────────

describe("parseCounterKey", () => {
  it("parses a minimal counter key without dimensions", () => {
    const result = parseCounterKey("telemetry:v1:2026-06-28:calculator_view:sueldo-liquido", 5);
    expect(result).not.toBeNull();
    expect(result!.date).toBe("2026-06-28");
    expect(result!.event).toBe("calculator_view");
    expect(result!.slug).toBe("sueldo-liquido");
    expect(result!.dimensions).toBe("");
    expect(result!.count).toBe(5);
  });

  it("parses a counter key with dimensions", () => {
    const result = parseCounterKey(
      "telemetry:v1:2026-06-28:calculator_complete:sueldo-liquido:success",
      15,
    );
    expect(result).not.toBeNull();
    expect(result!.dimensions).toBe("success");
    expect(result!.count).toBe(15);
  });

  it("parses a counter key with multi-segment dimensions", () => {
    const result = parseCounterKey(
      "telemetry:v1:2026-06-28:share_result_click:seguro-cesantia:copy",
      3,
    );
    expect(result).not.toBeNull();
    expect(result!.slug).toBe("seguro-cesantia");
    expect(result!.dimensions).toBe("copy");
  });

  it("returns null for invalid prefix", () => {
    expect(parseCounterKey("other:v1:2026-06-28:event:slug", 1)).toBeNull();
    expect(parseCounterKey("telemetry:v2:2026-06-28:event:slug", 1)).toBeNull();
  });

  it("returns null for too few segments", () => {
    expect(parseCounterKey("telemetry:v1:date", 1)).toBeNull();
    expect(parseCounterKey("telemetry:v1:date:event", 1)).toBeNull();
  });
});

// ── Aggregation ────────────────────────────────────────────────────────────

describe("aggregateWindow", () => {
  it("aggregates counters within the date window", () => {
    const counters: TelemetryCounter[] = [
      { date: "2026-06-22", event: "calculator_view", slug: "tool-a", dimensions: "", count: 50 },
      { date: "2026-06-22", event: "calculator_view", slug: "tool-a", dimensions: "", count: 20 },
      { date: "2026-06-23", event: "calculator_start", slug: "tool-a", dimensions: "click", count: 30 },
    ];

    const result = aggregateWindow(counters, "2026-06-22", "2026-06-28");

    // 50 + 20 should be merged into one row
    const viewRow = result.find((r) => r.event_name === "calculator_view");
    expect(viewRow).toBeDefined();
    expect(viewRow!.count).toBe(70);

    const startRow = result.find((r) => r.event_name === "calculator_start");
    expect(startRow).toBeDefined();
    expect(startRow!.count).toBe(30);

    expect(result.length).toBe(2);
  });

  it("excludes counters outside the date window", () => {
    const counters: TelemetryCounter[] = [
      { date: "2026-06-21", event: "calculator_view", slug: "tool-a", dimensions: "", count: 10 },
      { date: "2026-06-22", event: "calculator_view", slug: "tool-a", dimensions: "", count: 20 },
      { date: "2026-06-29", event: "calculator_view", slug: "tool-a", dimensions: "", count: 5 },
    ];

    const result = aggregateWindow(counters, "2026-06-22", "2026-06-28");
    expect(result.length).toBe(1);
    expect(result[0].count).toBe(20);
  });

  it("returns empty array for no matching counters", () => {
    const result = aggregateWindow([], "2026-06-22", "2026-06-28");
    expect(result).toEqual([]);
  });

  it("keeps different slugs separate", () => {
    const counters: TelemetryCounter[] = [
      { date: "2026-06-22", event: "calculator_view", slug: "tool-a", dimensions: "", count: 10 },
      { date: "2026-06-22", event: "calculator_view", slug: "tool-b", dimensions: "", count: 20 },
    ];

    const result = aggregateWindow(counters, "2026-06-22", "2026-06-28");
    expect(result.length).toBe(2);
    const slugs = result.map((r) => r.calculator_slug).sort();
    expect(slugs).toEqual(["tool-a", "tool-b"]);
  });
});

// ── Export artifact validation ─────────────────────────────────────────────

describe("buildExportArtifact", () => {
  it("builds a valid artifact", () => {
    const data: ExportDataRow[] = [
      { date: "2026-06-22", event_name: "calculator_view", calculator_slug: "tool-a", dimensions: "", count: 100 },
    ];
    const artifact = buildExportArtifact(
      "2026-W26",
      { from: "2026-06-22", to: "2026-06-28" },
      data,
      1,
    );

    expect(artifact.source).toBe("first-party-events");
    expect(artifact.schemaVersion).toBe(1);
    expect(artifact.week).toBe("2026-W26");
    expect(artifact.window.from).toBe("2026-06-22");
    expect(artifact.window.to).toBe("2026-06-28");
    expect(artifact.data.length).toBe(1);
  });
});

describe("validateExportArtifact", () => {
  const validWindow = { from: "2026-06-22", to: "2026-06-28" };

  it("accepts a valid artifact", () => {
    const artifact = buildExportArtifact(
      "2026-W26",
      validWindow,
      [{ date: "2026-06-22", event_name: "calculator_view", calculator_slug: "tool-a", dimensions: "", count: 100 }],
      1,
    );
    const result = validateExportArtifact(artifact);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects schemaVersion !== 1", () => {
    const artifact = buildExportArtifact(
      "2026-W26",
      validWindow,
      [],
      2,
    );
    const result = validateExportArtifact(artifact);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("schemaVersion"))).toBe(true);
  });

  it("rejects invalid week format", () => {
    const artifact = buildExportArtifact(
      "2026/26",
      validWindow,
      [],
      1,
    );
    const result = validateExportArtifact(artifact);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("week"))).toBe(true);
  });

  it("rejects negative counts", () => {
    const artifact = buildExportArtifact(
      "2026-W26",
      validWindow,
      [{ date: "2026-06-22", event_name: "calculator_view", calculator_slug: "tool-a", dimensions: "", count: -5 }],
      1,
    );
    const result = validateExportArtifact(artifact);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("negative count"))).toBe(true);
  });

  it("rejects invalid event_name", () => {
    const artifact = buildExportArtifact(
      "2026-W26",
      validWindow,
      [{ date: "2026-06-22", event_name: "not_an_event", calculator_slug: "tool-a", dimensions: "", count: 1 }],
      1,
    );
    const result = validateExportArtifact(artifact);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("event_name"))).toBe(true);
  });

  it("rejects date outside window", () => {
    const artifact = buildExportArtifact(
      "2026-W26",
      validWindow,
      [{ date: "2026-06-15", event_name: "calculator_view", calculator_slug: "tool-a", dimensions: "", count: 1 }],
      1,
    );
    const result = validateExportArtifact(artifact);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("outside window"))).toBe(true);
  });

  it("rejects empty calculator_slug", () => {
    const artifact = buildExportArtifact(
      "2026-W26",
      validWindow,
      [{ date: "2026-06-22", event_name: "calculator_view", calculator_slug: "", dimensions: "", count: 1 }],
      1,
    );
    const result = validateExportArtifact(artifact);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("calculator_slug"))).toBe(true);
  });

  it("accepts artifact with no data rows (week with no events)", () => {
    const artifact = buildExportArtifact("2026-W26", validWindow, [], 1);
    const result = validateExportArtifact(artifact);
    expect(result.valid).toBe(true);
  });
});

// ── Export runner and manual endpoint ─────────────────────────────────────

describe("runExport", () => {
  it("writes the validated weekly artifact to R2 and returns only summary metadata", async () => {
    const env = makeEnv({
      "telemetry:v1:2026-06-22:calculator_view:sueldo-liquido": "4",
      "telemetry:v1:2026-06-23:calculator_complete:sueldo-liquido:success": "2",
      "telemetry:v1:2026-06-29:calculator_view:sueldo-liquido": "99",
    });

    const summary = await runExport(env, "2026-W26");

    expect(summary).toEqual({
      week: "2026-W26",
      window: { from: "2026-06-22", to: "2026-06-28" },
      rows: 2,
      totalEvents: 6,
      r2Key: "analytics-exports/2026-W26.json",
    });

    const written = getMockR2(env).objects.get("analytics-exports/2026-W26.json");
    expect(written).toBeDefined();
    const artifact = JSON.parse(written ?? "") as ReturnType<typeof buildExportArtifact>;
    expect(validateExportArtifact(artifact).valid).toBe(true);
    expect(artifact.data).toEqual([
      {
        date: "2026-06-22",
        event_name: "calculator_view",
        calculator_slug: "sueldo-liquido",
        dimensions: "",
        count: 4,
      },
      {
        date: "2026-06-23",
        event_name: "calculator_complete",
        calculator_slug: "sueldo-liquido",
        dimensions: "success",
        count: 2,
      },
    ]);
  });
});

describe("manual export endpoint", () => {
  it("returns 503 when EXPORT_SECRET is not configured", async () => {
    const env = makeEnv();
    env.EXPORT_SECRET = undefined;

    const response = await analyticsCollector.fetch(
      new Request("https://monedario.cl/api/analytics/export", {
        headers: { Authorization: "Bearer manual-secret" },
      }),
      env,
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "export_not_configured" });
  });

  it("returns 401 without an Authorization header and 403 with a wrong secret", async () => {
    const env = makeEnv();

    const missing = await analyticsCollector.fetch(
      new Request("https://monedario.cl/api/analytics/export"),
      env,
    );
    const wrong = await analyticsCollector.fetch(
      new Request("https://monedario.cl/api/analytics/export", {
        headers: { Authorization: "Bearer wrong" },
      }),
      env,
    );

    expect(missing.status).toBe(401);
    await expect(missing.json()).resolves.toEqual({ error: "missing_secret" });
    expect(wrong.status).toBe(403);
    await expect(wrong.json()).resolves.toEqual({ error: "invalid_secret" });
  });

  it("returns 401 when the secret is passed as a query string instead of the header", async () => {
    const env = makeEnv();

    const response = await analyticsCollector.fetch(
      new Request("https://monedario.cl/api/analytics/export?secret=manual-secret"),
      env,
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "missing_secret" });
  });

  it("returns 400 for an invalid week parameter", async () => {
    const env = makeEnv();

    const response = await analyticsCollector.fetch(
      new Request("https://monedario.cl/api/analytics/export?week=2026-26", {
        headers: { Authorization: "Bearer manual-secret" },
      }),
      env,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_week" });
  });

  it("exports the requested week and does not echo raw data rows", async () => {
    const env = makeEnv({
      "telemetry:v1:2026-06-22:calculator_start:seguro-cesantia:click": "3",
    });

    const response = await analyticsCollector.fetch(
      new Request("https://monedario.cl/api/analytics/export?week=2026-W26", {
        headers: {
          Authorization: "Bearer manual-secret",
          "CF-Connecting-IP": "203.0.113.10",
        },
      }),
      env,
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      week: "2026-W26",
      window: { from: "2026-06-22", to: "2026-06-28" },
      rows: 1,
      totalEvents: 3,
    });
    expect(body).not.toHaveProperty("data");
    expect(body).not.toHaveProperty("r2Key");
    expect(getMockR2(env).objects.has("analytics-exports/2026-W26.json")).toBe(true);
  });

  it("defaults to the previous complete ISO week", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-30T10:00:00Z"));
    const env = makeEnv({
      "telemetry:v1:2026-06-22:calculator_view:sueldo-liquido": "5",
    });

    const response = await analyticsCollector.fetch(
      new Request("https://monedario.cl/api/analytics/export", {
        headers: { Authorization: "Bearer manual-secret" },
      }),
      env,
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      week: "2026-W26",
      window: { from: "2026-06-22", to: "2026-06-28" },
      rows: 1,
      totalEvents: 5,
    });
  });
});
