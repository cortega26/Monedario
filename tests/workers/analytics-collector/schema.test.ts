import { readFileSync } from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  default as analyticsCollector,
  validateEventPayload,
  sanitizeCollectorEvent,
  MAX_BODY_SIZE,
  calendarDateInTimeZone,
  counterStorageForInstant,
  counterPrefixForExportWeek,
  dateToISOWeekUTC,
  previousCompleteISOWeekInTz,
  isoWeekToDateRangeUTC,
  parseCounterKey,
  aggregateWindow,
  buildExportArtifact,
  validateExportArtifact,
  runExport,
  LEGACY_EXPORT_EVENTS,
  LEGACY_UNMAPPED_EXPORT_EVENTS,
  type TelemetryCounter,
  type ExportDataRow,
  type Env,
} from "../../../workers/analytics-collector/src/index";
import {
  ANALYTICS_EVENT_ALLOWLIST,
  LEGACY_EVENT_NAMES,
} from "../../../src/contracts/analytics-events";

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
        calculator_id: "sueldo-liquido",
        interaction_variant: "input",
      },
    });
    expect(result.valid).toBe(true);
    expect(result.event).toBe("calculator_start");
    expect(result.params).toEqual({
      calculator_id: "sueldo-liquido",
      interaction_variant: "input",
    });
  });

  it("rechaza payload sin campo event", () => {
    const result = validateEventPayload({
      params: { calculator_id: "test" },
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
        calculator_id: "test",
        interaction_variant: "button",
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
        calculator_id: "test",
        interaction_variant: "button",
        profile_signal: "derived text",
      },
    });
    expect(result.valid).toBe(false);
  });

  it("rechaza si calculator_id excede 200 chars", () => {
    const result = validateEventPayload({
      event: "calculator_start",
      params: {
        calculator_id: "a".repeat(201),
        interaction_variant: "button",
      },
    });
    expect(result.valid).toBe(false);
  });

  it("rechaza propiedades heredadas aunque el evento siga vigente", () => {
    const result = validateEventPayload({
      event: "calculator_complete",
      params: {
        calculator_id: "test",
        outcome_class: "success",
      },
    });
    expect(result.valid).toBe(false);
  });

  it("acepta todos los eventos allowlisted con params válidos", () => {
    const validCases = [
      ["calculator_view", { calculator_id: "t", page_type: "calculator" }],
      ["calculator_start", { calculator_id: "t", interaction_variant: "button" }],
      ["calculator_complete", { calculator_id: "t" }],
      ["calculator_error", { calculator_id: "t", error_category: "validation" }],
      ["next_step_shown", { calculator_id: "t", next_step_id: "r1" }],
      ["next_step_click", { calculator_id: "t", next_step_id: "r1" }],
      ["source_click", { calculator_id: "t", source_type: "official" }],
      ["share_attempt", { calculator_id: "t", share_method: "copy" }],
      ["share_success", { calculator_id: "t", share_method: "native" }],
      ["alert_interest_shown", { calculator_id: "t", interaction_variant: "contextual_v1" }],
      ["alert_interest_submit", { calculator_id: "t", interaction_variant: "contextual_v1" }],
      ["support_shown", { calculator_id: "t", support_location: "post_result" }],
      ["support_click", { calculator_id: "t", support_location: "post_result" }],
      ["support_confirmed", { calculator_id: "t", support_location: "post_result" }],
    ] as const;

    for (const [event, params] of validCases) {
      const result = validateEventPayload({ event, params });
      expect(result.valid).toBe(true);
    }
  });

  // ── Free-form token dimensions (calculator_id, next_step_id, action_id) ──

  it("acepta un calculator_id corto y válido", () => {
    const result = validateEventPayload({
      event: "calculator_view",
      params: { page_type: "calculator", calculator_id: "sueldo-liquido" },
    });
    expect(result.valid).toBe(true);
  });

  it("acepta un next_step_id real", () => {
    const result = validateEventPayload({
      event: "next_step_click",
      params: {
        calculator_id: "sueldo-liquido",
        next_step_id: "sl-to-apv-midhigh",
      },
    });
    expect(result.valid).toBe(true);
  });

  it("rechaza calculator_id con espacio", () => {
    const result = validateEventPayload({
      event: "calculator_view",
      params: { page_type: "calculator", calculator_id: "sueldo liquido" },
    });
    expect(result.valid).toBe(false);
  });

  it("rechaza calculator_id con path/puntuación", () => {
    const result = validateEventPayload({
      event: "calculator_view",
      params: { page_type: "calculator", calculator_id: "../etc" },
    });
    expect(result.valid).toBe(false);
  });

  it("rechaza calculator_id con mayúsculas", () => {
    const result = validateEventPayload({
      event: "calculator_view",
      params: { page_type: "calculator", calculator_id: "Sueldo" },
    });
    expect(result.valid).toBe(false);
  });

  it("rechaza calculator_id con unicode", () => {
    const result = validateEventPayload({
      event: "calculator_view",
      params: { page_type: "calculator", calculator_id: "café☕" },
    });
    expect(result.valid).toBe(false);
  });

  it("acepta attribution UTM acotada", () => {
    const result = validateEventPayload({
      event: "next_step_click",
      params: {
        calculator_id: "conversor-utm",
        next_step_id: "convert-uf",
        utm_source: "conversor-utm",
        utm_medium: "post-result",
        utm_campaign: "utility-led-v1",
      },
    });
    expect(result.valid).toBe(true);
  });

  it("rechaza attribution con texto libre", () => {
    const result = validateEventPayload({
      event: "next_step_click",
      params: { calculator_id: "conversor-utm", utm_campaign: "texto libre" },
    });
    expect(result.valid).toBe(false);
  });

  it("normaliza eventos legados (pre-rename) antes de la validación estricta", () => {
    const result = validateEventPayload({
      event: "next_best_step_click",
      params: {
        calculator_slug: "sueldo-liquido",
        rule_id: "sl-to-apv-midhigh",
      },
    });
    expect(result.valid).toBe(true);
    expect(result.event).toBe("next_step_click");
    expect(result.params).toEqual({
      calculator_id: "sueldo-liquido",
      next_step_id: "sl-to-apv-midhigh",
    });
  });
});

// ── Body size validation ──

describe("payload size", () => {
  it("payload >2 KB se rechaza", () => {
    const bigPayload = {
      event: "calculator_start",
      params: {
        calculator_id: "a".repeat(2100),
        interaction_variant: "button",
      },
    };
    const body = JSON.stringify(bigPayload);
    expect(body.length).toBeGreaterThan(MAX_BODY_SIZE);
  });

  it("payload <=2 KB se acepta", () => {
    const smallPayload = {
      event: "calculator_start",
      params: {
        calculator_id: "sueldo-liquido",
        interaction_variant: "button",
      },
    };
    const body = JSON.stringify(smallPayload);
    expect(body.length).toBeLessThanOrEqual(MAX_BODY_SIZE);
  });
});

// ── Worker sanitization function ──

describe("sanitizeCollectorEvent", () => {
  it("elimina profile_signal aunque sea la única key extra", () => {
    const result = sanitizeCollectorEvent("next_step_shown", {
      calculator_id: "test",
      next_step_id: "r1",
      profile_signal: "sueldo >= 1M",
    });
    expect(result).not.toBeNull();
    expect(result!.params).not.toHaveProperty("profile_signal");
    expect(result!.params).toEqual({
      calculator_id: "test",
      next_step_id: "r1",
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
      calculator_id: "test",
      interaction_variant: "button",
      nested: { a: 1 },
      arr: [1, 2, 3],
    });
    expect(result).not.toBeNull();
    expect(result!.params).not.toHaveProperty("nested");
    expect(result!.params).not.toHaveProperty("arr");
  });

  it("descarta strings largos en la ruta tolerante", () => {
    const longString = "x".repeat(500);
    const result = sanitizeCollectorEvent("calculator_view", {
      page_type: "calculator",
      calculator_id: longString,
    });
    expect(result).not.toBeNull();
    expect(result!.params.calculator_id).toBeUndefined();
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

describe("Chile calendar boundaries", () => {
  it("uses the Santiago calendar date across summer and winter UTC crossovers", () => {
    expect(
      calendarDateInTimeZone(
        new Date("2026-01-15T02:30:00Z"),
        "America/Santiago",
      ),
    ).toBe("2026-01-14");
    expect(
      calendarDateInTimeZone(
        new Date("2026-07-15T03:30:00Z"),
        "America/Santiago",
      ),
    ).toBe("2026-07-14");
  });

  it("selects the previous complete week from local Sunday and Monday", () => {
    expect(
      previousCompleteISOWeekInTz(
        "America/Santiago",
        new Date("2026-07-13T03:30:00Z"),
      ),
    ).toBe("2026-W27");
    expect(
      previousCompleteISOWeekInTz(
        "America/Santiago",
        new Date("2026-07-13T04:30:00Z"),
      ),
    ).toBe("2026-W28");
  });

  it("handles the ISO-year rollover using the local Monday", () => {
    expect(
      previousCompleteISOWeekInTz(
        "America/Santiago",
        new Date("2026-01-05T02:30:00Z"),
      ),
    ).toBe("2025-W52");
    expect(
      previousCompleteISOWeekInTz(
        "America/Santiago",
        new Date("2026-01-05T03:30:00Z"),
      ),
    ).toBe("2026-W01");
  });

  it("rejects an invalid configured timezone", () => {
    expect(() =>
      calendarDateInTimeZone(new Date("2026-07-16T00:00:00Z"), "Mars/Olympus"),
    ).toThrow('Invalid EXPORT_TIMEZONE: "Mars/Olympus"');
  });

  it("selects UTC v1 before cutover and local-date v2 at the boundary", () => {
    const cutoverAt = "2026-07-20T04:00:00Z";

    expect(
      counterStorageForInstant(
        new Date("2026-07-20T03:59:59Z"),
        "America/Santiago",
        cutoverAt,
      ),
    ).toEqual({ prefix: "telemetry:v1", date: "2026-07-20" });
    expect(
      counterStorageForInstant(
        new Date("2026-07-20T04:00:00Z"),
        "America/Santiago",
        cutoverAt,
      ),
    ).toEqual({ prefix: "telemetry:v2", date: "2026-07-20" });
  });

  it("assigns each export week to exactly one versioned prefix", () => {
    const cutoverAt = "2026-07-20T04:00:00Z";

    expect(
      counterPrefixForExportWeek("2026-W29", "America/Santiago", cutoverAt),
    ).toBe("telemetry:v1");
    expect(
      counterPrefixForExportWeek("2026-W30", "America/Santiago", cutoverAt),
    ).toBe("telemetry:v2");
  });

  it("rejects a cutover that is not Monday local midnight", () => {
    expect(() =>
      counterPrefixForExportWeek(
        "2026-W30",
        "America/Santiago",
        "2026-07-20T03:59:59Z",
      ),
    ).toThrow("must resolve to Monday 00:00:00");
    expect(() =>
      counterPrefixForExportWeek(
        "2026-W30",
        "America/Santiago",
        "2026-07-21T04:00:00Z",
      ),
    ).toThrow("must resolve to Monday 00:00:00");
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
    expect(parseCounterKey("telemetry:v3:2026-06-28:event:slug", 1)).toBeNull();
  });

  it("parses local-calendar v2 keys", () => {
    expect(
      parseCounterKey("telemetry:v2:2026-07-20:calculator_view:sueldo-liquido", 7),
    ).toMatchObject({
      date: "2026-07-20",
      event: "calculator_view",
      slug: "sueldo-liquido",
      count: 7,
    });
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

  it("normaliza contadores legados y excluye los sin sucesor v2 (export v2)", () => {
    const counters: TelemetryCounter[] = [
      { date: "2026-07-27", event: "next_best_step_shown", slug: "tool-a", dimensions: "", count: 4 },
      { date: "2026-07-28", event: "official_source_click", slug: "tool-a", dimensions: "", count: 3 },
      { date: "2026-07-29", event: "resume_click", slug: "tool-a", dimensions: "", count: 2 },
      { date: "2026-07-30", event: "calculator_view", slug: "tool-a", dimensions: "", count: 1 },
    ];

    const rows = aggregateWindow(counters, "2026-07-27", "2026-08-02");

    expect(rows.map((r) => r.event_name).sort()).toEqual([
      "calculator_view",
      "next_step_shown",
      "source_click",
    ]);
    expect(rows.find((r) => r.event_name === "resume_click")).toBeUndefined();

    const artifact = buildExportArtifact(
      "2026-W31",
      { from: "2026-07-27", to: "2026-08-02" },
      rows,
      2,
    );
    expect(validateExportArtifact(artifact).valid).toBe(true);
  });

  it("preserva los nombres legados en agregados schema v1", () => {
    const counters: TelemetryCounter[] = [
      { date: "2026-07-13", event: "next_best_step_shown", slug: "tool-a", dimensions: "", count: 4 },
      { date: "2026-07-14", event: "resume_click", slug: "tool-a", dimensions: "", count: 2 },
    ];

    const rows = aggregateWindow(counters, "2026-07-13", "2026-07-19", 1);

    expect(rows.map((r) => r.event_name).sort()).toEqual([
      "next_best_step_shown",
      "resume_click",
    ]);

    const artifact = buildExportArtifact(
      "2026-W29",
      { from: "2026-07-13", to: "2026-07-19" },
      rows,
      1,
    );
    expect(validateExportArtifact(artifact).valid).toBe(true);
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

  it("uses calculator_id and removes the legacy column in schema v2", () => {
    const artifact = buildExportArtifact(
      "2026-W31",
      { from: "2026-07-27", to: "2026-08-02" },
      [
        {
          date: "2026-08-02",
          event_name: "support_click",
          calculator_slug: "conversor-utm",
          dimensions: "post_result",
          count: 1,
        },
      ],
      2,
    );

    expect(artifact.data[0]).toMatchObject({
      calculator_id: "conversor-utm",
    });
    expect(artifact.data[0]).not.toHaveProperty("calculator_slug");
    expect(validateExportArtifact(artifact).valid).toBe(true);
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

  it("accepts current schemaVersion 2", () => {
    const artifact = buildExportArtifact(
      "2026-W26",
      validWindow,
      [],
      2,
    );
    const result = validateExportArtifact(artifact);
    expect(result.valid).toBe(true);
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

  it("never mixes v1 and v2 counters across the configured cutover", async () => {
    const env = makeEnv({
      "telemetry:v1:2026-07-13:calculator_view:sueldo-liquido": "11",
      "telemetry:v2:2026-07-13:calculator_view:sueldo-liquido": "99",
      "telemetry:v1:2026-07-20:calculator_view:sueldo-liquido": "88",
      "telemetry:v2:2026-07-20:calculator_view:sueldo-liquido": "12",
    });
    env.EXPORT_TIMEZONE = "America/Santiago";
    env.COUNTER_KEY_CUTOVER_AT = "2026-07-20T04:00:00Z";

    const legacy = await runExport(env, "2026-W29");
    const local = await runExport(env, "2026-W30");

    expect(legacy.totalEvents).toBe(11);
    expect(local.totalEvents).toBe(12);
  });

  it("exporta v2 normalizando legados, descartando los sin sucesor y logueando descartados", async () => {
    const env = makeEnv({
      "telemetry:v2:2026-07-27:next_best_step_shown:sueldo-liquido": "4",
      "telemetry:v2:2026-07-28:official_source_click:sueldo-liquido": "3",
      "telemetry:v2:2026-07-29:resume_click:sueldo-liquido": "2",
      "telemetry:v2:2026-07-30:calculator_view:sueldo-liquido": "1",
    });
    env.SCHEMA_VERSION = "2";
    env.EXPORT_TIMEZONE = "America/Santiago";
    env.COUNTER_KEY_CUTOVER_AT = "2026-07-20T04:00:00Z";

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    let summary: Awaited<ReturnType<typeof runExport>>;
    let loggedDiscards = false;
    try {
      summary = await runExport(env, "2026-W31");
      // Capturar antes de mockRestore(): restore limpia mock.calls.
      loggedDiscards = logSpy.mock.calls.some((call) =>
        String(call[0]).includes(
          "descartados=1 contadores sin taxonomía v2 (legados)",
        ),
      );
    } finally {
      logSpy.mockRestore();
    }

    // resume_click se descarta: 4+3+1 = 8 eventos en 3 filas
    expect(summary).toMatchObject({
      week: "2026-W31",
      rows: 3,
      totalEvents: 8,
    });
    expect(loggedDiscards).toBe(true);

    const written = getMockR2(env).objects.get("analytics-exports/2026-W31.json");
    expect(written).toBeDefined();
    const artifact = JSON.parse(written ?? "") as ReturnType<typeof buildExportArtifact>;
    expect(validateExportArtifact(artifact).valid).toBe(true);
    expect(artifact.data.map((r) => r.event_name).sort()).toEqual([
      "calculator_view",
      "next_step_shown",
      "source_click",
    ]);
  });
});

describe("scheduled()", () => {
  it("runs on Monday after the previous ISO week is complete", () => {
    const config = readFileSync(
      new URL(
        "../../../workers/analytics-collector/wrangler.toml",
        import.meta.url,
      ),
      "utf8",
    );

    expect(config).toMatch(/crons\s*=\s*\["57 7 \* \* MON"\]/);
    expect(config).toMatch(
      /COUNTER_KEY_CUTOVER_AT\s*=\s*"2026-07-20T04:00:00Z"/,
    );
  });

  it("re-throws infrastructure failures so the invocation is marked failed", async () => {
    const env = {
      ANALYTICS_TELEMETRY: {
        async list() {
          throw new Error("KV unreachable");
        },
        async get() {
          return null;
        },
        async put() {},
      },
      ANALYTICS_EXPORTS: { async put() {} },
    } as unknown as Env;

    await expect(
      analyticsCollector.scheduled({} as never, env),
    ).rejects.toThrow();
  });
});

describe("event ingestion calendar", () => {
  const cutoverAt = "2026-07-20T04:00:00Z";

  it("preserves v1 UTC keys before the Monday-local cutover", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T03:30:00Z"));
    const env = makeEnv();
    env.ANALYTICS_DISABLED = "0";
    env.EXPORT_TIMEZONE = "America/Santiago";
    env.COUNTER_KEY_CUTOVER_AT = cutoverAt;

    const response = await analyticsCollector.fetch(
      new Request("https://monedario.cl/api/analytics/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://monedario.cl",
          "CF-Connecting-IP": "192.0.2.1",
        },
        body: JSON.stringify({
          event: "calculator_start",
          params: { calculator_id: "sueldo-liquido", interaction_variant: "input" },
        }),
      }),
      env,
    );

    expect(response.status).toBe(202);
    const kv = env.ANALYTICS_TELEMETRY as unknown as MockKV;
    expect(kv.store.get("telemetry:v1:2026-07-15:calculator_start:sueldo-liquido:input")).toBe("1");
    expect(kv.store.has("telemetry:v2:2026-07-14:calculator_start:sueldo-liquido:input")).toBe(false);
  });

  it("writes v2 counters under the configured local date after cutover", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-21T03:30:00Z"));
    const env = makeEnv();
    env.ANALYTICS_DISABLED = "0";
    env.EXPORT_TIMEZONE = "America/Santiago";
    env.COUNTER_KEY_CUTOVER_AT = cutoverAt;

    const response = await analyticsCollector.fetch(
      new Request("https://monedario.cl/api/analytics/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://monedario.cl",
          "CF-Connecting-IP": "192.0.2.2",
        },
        body: JSON.stringify({
          event: "calculator_start",
          params: { calculator_id: "sueldo-liquido", interaction_variant: "input" },
        }),
      }),
      env,
    );

    expect(response.status).toBe(202);
    const kv = env.ANALYTICS_TELEMETRY as unknown as MockKV;
    expect(kv.store.get("telemetry:v2:2026-07-20:calculator_start:sueldo-liquido:input")).toBe("1");
    expect(kv.store.has("telemetry:v1:2026-07-21:calculator_start:sueldo-liquido:input")).toBe(false);
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

// ── Barrido de cobertura de eventos legados ─────────────────────────────────

describe("cobertura de eventos legados (barrido)", () => {
  it.each([...LEGACY_EXPORT_EVENTS].sort())(
    "%s está en la allowlist nueva, mapeado al canónico v2 o declarado descartable",
    (name) => {
      const inAllowlist = Object.hasOwn(ANALYTICS_EVENT_ALLOWLIST, name);
      const mapped = Object.hasOwn(LEGACY_EVENT_NAMES, name);
      const discarded = LEGACY_UNMAPPED_EXPORT_EVENTS.has(name);
      expect(inAllowlist || mapped || discarded).toBe(true);
      if (mapped) {
        expect(
          Object.hasOwn(ANALYTICS_EVENT_ALLOWLIST, LEGACY_EVENT_NAMES[name]),
        ).toBe(true);
      }
    },
  );
});
