import { spawnSync } from "node:child_process";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildSchemaHeader,
  dateToISOWeek,
  isoWeekToDateRange,
  normalizePageRow,
  normalizeQueryRow,
  normalizeSitemapEntry,
  previousCompleteISOWeek,
} from "../../scripts/data-signals/gsc-utils.mjs";

const SCRIPT = path.resolve("scripts/data-signals/gsc-fetch.mjs");

function run(args: string[], extraEnv: Record<string, string> = {}) {
  const env = { ...process.env };
  delete env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  Object.assign(env, extraEnv);
  return spawnSync("node", [SCRIPT, ...args], { encoding: "utf8", env });
}

// ---------------------------------------------------------------------------
// Pure utilities
// ---------------------------------------------------------------------------

describe("isoWeekToDateRange", () => {
  it("returns correct Monday–Sunday for 2026-W17", () => {
    expect(isoWeekToDateRange("2026-W17")).toEqual({
      from: "2026-04-20",
      to: "2026-04-26",
    });
  });

  it("handles week spanning year boundary (2026-W01)", () => {
    expect(isoWeekToDateRange("2026-W01")).toEqual({
      from: "2025-12-29",
      to: "2026-01-04",
    });
  });

  it("handles a mid-year week (2026-W16)", () => {
    expect(isoWeekToDateRange("2026-W16")).toEqual({
      from: "2026-04-13",
      to: "2026-04-19",
    });
  });

  it("throws on missing W prefix", () => {
    expect(() => isoWeekToDateRange("2026-17")).toThrow(/Invalid ISO week/);
  });

  it("throws on bare week number", () => {
    expect(() => isoWeekToDateRange("W17")).toThrow(/Invalid ISO week/);
  });
});

describe("dateToISOWeek", () => {
  it("returns 2026-W17 for Monday Apr 20 2026", () => {
    expect(dateToISOWeek(new Date("2026-04-20T00:00:00Z"))).toBe("2026-W17");
  });

  it("returns 2026-W17 for Sunday Apr 26 2026", () => {
    expect(dateToISOWeek(new Date("2026-04-26T00:00:00Z"))).toBe("2026-W17");
  });

  it("returns 2025-W52 for Dec 28 2025", () => {
    expect(dateToISOWeek(new Date("2025-12-28T00:00:00Z"))).toBe("2025-W52");
  });

  it("returns 2026-W01 for Dec 29 2025", () => {
    expect(dateToISOWeek(new Date("2025-12-29T00:00:00Z"))).toBe("2026-W01");
  });
});

describe("previousCompleteISOWeek", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a valid YYYY-Www string", () => {
    expect(previousCompleteISOWeek()).toMatch(/^\d{4}-W\d{2}$/);
  });

  it("the Sunday of the returned week is in the past", () => {
    const week = previousCompleteISOWeek();
    const { to } = isoWeekToDateRange(week);
    expect(new Date(to).getTime()).toBeLessThan(Date.now());
  });

  it("returns the previous complete week on Monday rollover", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-11T12:00:00Z"));
    expect(previousCompleteISOWeek()).toBe("2026-W19");
  });

  it("stays on the last fully completed week during Sunday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-04T12:00:00Z"));
    expect(previousCompleteISOWeek()).toBe("2025-W52");
  });
});

describe("normalizeQueryRow", () => {
  it("normalizes row with alphabetically sorted keys", () => {
    const row = {
      keys: ["calculadora sueldo"],
      clicks: 10,
      impressions: 200,
      ctr: 0.05123456,
      position: 3.789,
    };
    const result = normalizeQueryRow(row);
    expect(result).toEqual({
      clicks: 10,
      ctr: 0.0512,
      impressions: 200,
      position: 3.79,
      query: "calculadora sueldo",
    });
    expect(Object.keys(result)).toEqual([
      "clicks",
      "ctr",
      "impressions",
      "position",
      "query",
    ]);
  });
});

describe("normalizePageRow", () => {
  it("normalizes page row with alphabetically sorted keys", () => {
    const row = {
      keys: ["/calculadoras/sueldo-liquido/"],
      clicks: 50,
      impressions: 1000,
      ctr: 0.05,
      position: 2.1,
    };
    const result = normalizePageRow(row);
    expect(result).toEqual({
      clicks: 50,
      ctr: 0.05,
      impressions: 1000,
      page: "/calculadoras/sueldo-liquido/",
      position: 2.1,
    });
    expect(Object.keys(result)).toEqual([
      "clicks",
      "ctr",
      "impressions",
      "page",
      "position",
    ]);
  });
});

describe("buildSchemaHeader", () => {
  it("emits correct structure with alphabetically sorted keys", () => {
    const h = buildSchemaHeader("gsc", "2026-W16", "2026-04-13", "2026-04-19");
    expect(h.source).toBe("gsc");
    expect(h.schemaVersion).toBe(1);
    expect(h.week).toBe("2026-W16");
    expect(h.window).toEqual({ from: "2026-04-13", to: "2026-04-19" });
    expect(typeof h.fetchedAt).toBe("string");
    expect(Object.keys(h)).toEqual([
      "fetchedAt",
      "schemaVersion",
      "source",
      "week",
      "window",
    ]);
  });
});

describe("normalizeSitemapEntry", () => {
  it("truncates timestamps to date and sorts content types", () => {
    const entry = {
      path: "https://monedario.cl/sitemap-index.xml",
      lastDownloaded: "2026-04-19T06:00:00Z",
      lastSubmitted: "2026-04-01T00:00:00Z",
      isPending: false,
      isSitemapsIndex: true,
      warnings: 0,
      errors: 0,
      contents: [
        { type: "WEB", submitted: "50", indexed: "48" },
        { type: "IMAGE", submitted: "5", indexed: "5" },
      ],
    };
    const result = normalizeSitemapEntry(entry);
    expect(result.lastDownloaded).toBe("2026-04-19");
    expect(result.lastSubmitted).toBe("2026-04-01");
    // contents sorted by type: IMAGE < WEB
    expect(result.contents).toEqual([
      { indexed: 5, submitted: 5, type: "IMAGE" },
      { indexed: 48, submitted: 50, type: "WEB" },
    ]);
    expect(Object.keys(result)).toEqual([
      "contents",
      "errors",
      "isPending",
      "isSitemapsIndex",
      "lastDownloaded",
      "lastSubmitted",
      "path",
      "warnings",
    ]);
  });

  it("handles missing optional fields with safe defaults", () => {
    const result = normalizeSitemapEntry({ path: "https://monedario.cl/sitemap.xml" });
    expect(result.contents).toEqual([]);
    expect(result.errors).toBe(0);
    expect(result.lastDownloaded).toBeNull();
    expect(result.lastSubmitted).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// CLI error handling (no real API calls)
// ---------------------------------------------------------------------------

describe("gsc-fetch CLI", () => {
  it("exits 1 when GOOGLE_APPLICATION_CREDENTIALS_JSON is absent", () => {
    const r = run(["--week=2026-W16"]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("GOOGLE_APPLICATION_CREDENTIALS_JSON");
  });

  it("exits 1 when credentials JSON is malformed", () => {
    const r = run(["--week=2026-W16"], {
      GOOGLE_APPLICATION_CREDENTIALS_JSON: "not-json",
    });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("not valid JSON");
  });

  it("exits 1 for invalid --week format", () => {
    const r = run(["--week=bad-week"], {
      GOOGLE_APPLICATION_CREDENTIALS_JSON: "{}",
    });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("Invalid --week format");
  });

  it("prints usage and exits 0 with --help", () => {
    const r = run(["--help"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("gsc-fetch");
    expect(r.stdout).toContain("GOOGLE_APPLICATION_CREDENTIALS_JSON");
  });

  it("exits 1 for unknown arguments", () => {
    const r = run(["--unknown-flag"]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("Unknown argument");
  });
});
