import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  aggregateQueryPageRows,
  buildSchemaHeader,
  consolidatePageRows,
  dateToISOWeek,
  findCannibalizationGroups,
  findStrikingDistance,
  isoWeekToDateRange,
  missingExportWeeks,
  normalizeCountryRow,
  normalizeDeviceRow,
  normalizePageIdentity,
  normalizePageRow,
  normalizeQueryPageRow,
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

describe("missingExportWeeks", () => {
  it("flags the immediately preceding week when absent", () => {
    expect(missingExportWeeks(["2026-W28", "2026-W30"], "2026-W30", 3)).toEqual([
      "2026-W29",
    ]);
  });

  it("reports a middle gap in chronological order", () => {
    // W27 and W28 missing between W26 and W29; W30 is the target.
    expect(
      missingExportWeeks(["2026-W26", "2026-W29", "2026-W30"], "2026-W30", 5),
    ).toEqual(["2026-W27", "2026-W28"]);
  });

  it("excludes gaps beyond the lookback window", () => {
    // lookback 2 → window is [2026-W29, 2026-W30]; W28 and W26 are out of range.
    expect(missingExportWeeks(["2026-W26", "2026-W30"], "2026-W30", 2)).toEqual([
      "2026-W29",
    ]);
  });

  it("returns the full window when nothing is available", () => {
    const missing = missingExportWeeks([], "2026-W30");
    expect(missing).toHaveLength(12);
    expect(missing[0]).toBe("2026-W19");
    expect(missing[11]).toBe("2026-W30");
  });

  it("returns empty when every window week is present", () => {
    expect(
      missingExportWeeks(["2026-W28", "2026-W29", "2026-W30"], "2026-W30", 3),
    ).toEqual([]);
  });

  it("ignores out-of-range or malformed labels in availableWeeks", () => {
    expect(
      missingExportWeeks(
        ["garbage", "2027-W01", "2026-W29", "2026-W30"],
        "2026-W30",
        2,
      ),
    ).toEqual([]);
  });

  it("throws on an invalid target week format", () => {
    expect(() => missingExportWeeks([], "2026-17")).toThrow(/Invalid ISO week/);
  });
});

describe("normalizeCountryRow", () => {
  it("normalizes a country row with alphabetically sorted keys", () => {
    const result = normalizeCountryRow({
      keys: ["chl"],
      clicks: 30,
      impressions: 900,
      ctr: 0.033333,
      position: 7.5,
    });
    expect(result).toEqual({
      clicks: 30,
      ctr: 0.0333,
      impressions: 900,
      key: "chl",
      position: 7.5,
    });
    expect(Object.keys(result)).toEqual([
      "clicks",
      "ctr",
      "impressions",
      "key",
      "position",
    ]);
  });

  it("defaults to empty key and zeros when fields are missing", () => {
    expect(normalizeCountryRow({})).toEqual({
      clicks: 0,
      ctr: 0,
      impressions: 0,
      key: "",
      position: 0,
    });
  });
});

describe("normalizeDeviceRow", () => {
  it("normalizes a device row with alphabetically sorted keys", () => {
    const result = normalizeDeviceRow({
      keys: ["MOBILE"],
      clicks: 10,
      impressions: 500,
      ctr: 0.02,
      position: 3.1,
    });
    expect(result.key).toBe("MOBILE");
    expect(result.clicks).toBe(10);
    expect(result.impressions).toBe(500);
  });

  it("defaults to empty key when keys are missing", () => {
    expect(normalizeDeviceRow({}).key).toBe("");
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

describe("normalizePageIdentity", () => {
  it("normaliza URL completa a pathname con trailing slash", () => {
    expect(normalizePageIdentity("https://monedario.cl/calculadoras/sueldo-liquido")).toBe(
      "/calculadoras/sueldo-liquido/"
    );
    expect(normalizePageIdentity("https://monedario.cl/calculadoras/sueldo-liquido/")).toBe(
      "/calculadoras/sueldo-liquido/"
    );
  });

  it("ignora query string y host", () => {
    expect(normalizePageIdentity("https://monedario.cl/uf?utm_source=x")).toBe("/uf/");
    expect(normalizePageIdentity("https://www.monedario.cl/uf/")).toBe("/uf/");
  });

  it("acepta paths relativos y devuelve vacío para entrada vacía", () => {
    expect(normalizePageIdentity("/uf")).toBe("/uf/");
    expect(normalizePageIdentity("")).toBe("");
    expect(normalizePageIdentity(null)).toBe("");
  });
});

describe("consolidatePageRows", () => {
  it("consolida la misma página con y sin trailing slash sumando métricas", () => {
    const rows = [
      { page: "https://monedario.cl/calculadoras/sueldo-liquido/", clicks: 2, impressions: 451, ctr: 0.0044, position: 6.5 },
      { page: "https://monedario.cl/calculadoras/sueldo-liquido", clicks: 0, impressions: 1, ctr: 0, position: 99 },
    ];
    const result = consolidatePageRows(rows);
    expect(result).toHaveLength(1);
    expect(result[0].page).toBe("https://monedario.cl/calculadoras/sueldo-liquido/");
    expect(result[0].clicks).toBe(2);
    expect(result[0].impressions).toBe(452);
    // ctr = 2/452 ≈ 0.0044 (redondeado a 4 decimales)
    expect(result[0].ctr).toBe(0.0044);
    // position ponderada por impresiones: (451*6.5 + 1*99) / 452 ≈ 6.71
    expect(result[0].position).toBeCloseTo(6.71, 1);
  });

  it("no duplica filas ya únicas y preserva el orden", () => {
    const rows = [
      { page: "/a/", clicks: 1, impressions: 10, ctr: 0.1, position: 1 },
      { page: "/b/", clicks: 3, impressions: 30, ctr: 0.1, position: 2 },
    ];
    const result = consolidatePageRows(rows);
    expect(result.map((r) => r.page)).toEqual(["/a/", "/b/"]);
    expect(result[0].clicks).toBe(1);
    expect(result[1].clicks).toBe(3);
  });

  it("recalcula ctr a cero sin impresiones", () => {
    const rows = [
      { page: "/a", clicks: 0, impressions: 0, ctr: 0, position: 0 },
      { page: "/a/", clicks: 0, impressions: 0, ctr: 0, position: 0 },
    ];
    const result = consolidatePageRows(rows);
    expect(result).toHaveLength(1);
    expect(result[0].ctr).toBe(0);
  });
});

describe("normalizeQueryPageRow", () => {
  it("normalizes a query×page row with alphabetically sorted keys", () => {
    const row = {
      keys: ["sueldo liquido", "/calculadoras/sueldo-liquido/"],
      clicks: 12,
      impressions: 340,
      ctr: 0.035294,
      position: 4.512,
    };
    const result = normalizeQueryPageRow(row);
    expect(result).toEqual({
      clicks: 12,
      ctr: 0.0353,
      impressions: 340,
      page: "/calculadoras/sueldo-liquido/",
      position: 4.51,
      query: "sueldo liquido",
    });
    expect(Object.keys(result)).toEqual([
      "clicks",
      "ctr",
      "impressions",
      "page",
      "position",
      "query",
    ]);
  });
});

describe("findCannibalizationGroups", () => {
  const rows = [
    // "sueldo liquido" surfaced by two own URLs → cannibalization
    { query: "sueldo liquido", page: "https://monedario.cl/calculadoras/sueldo-liquido/", impressions: 300, clicks: 10, position: 4.1, ctr: 0.03 },
    { query: "sueldo liquido", page: "https://monedario.cl/posts/sueldo-imponible-chile/", impressions: 120, clicks: 2, position: 8.3, ctr: 0.01 },
    // "que es la uf" surfaced by a single URL → not cannibalization
    { query: "que es la uf", page: "https://monedario.cl/posts/que-es-la-uf/", impressions: 500, clicks: 40, position: 2.0, ctr: 0.08 },
    // "apv" second URL below the impression floor → not counted
    { query: "apv", page: "https://monedario.cl/posts/que-es-el-apv/", impressions: 200, clicks: 9, position: 3.0, ctr: 0.045 },
    { query: "apv", page: "https://monedario.cl/calculadoras/apv/", impressions: 2, clicks: 0, position: 30, ctr: 0 },
  ];

  it("flags only queries with 2+ own URLs above the impression floor", () => {
    const groups = findCannibalizationGroups(rows, { minImpressions: 5, minUrls: 2 });
    expect(groups).toHaveLength(1);
    expect(groups[0].query).toBe("sueldo liquido");
    expect(groups[0].urlCount).toBe(2);
    expect(groups[0].totalImpressions).toBe(420);
    expect(groups[0].totalClicks).toBe(12);
    // URLs sorted by impressions desc
    expect(groups[0].urls[0].page).toContain("/calculadoras/sueldo-liquido/");
  });

  it("respects a lower impression floor (apv now counts)", () => {
    const groups = findCannibalizationGroups(rows, { minImpressions: 1, minUrls: 2 });
    expect(groups.map(g => g.query).sort()).toEqual(["apv", "sueldo liquido"]);
  });

  it("returns empty when no query has competing URLs", () => {
    const single = [rows[2]];
    expect(findCannibalizationGroups(single)).toEqual([]);
  });

  it("collapses duplicate (query,page) rows by max impressions", () => {
    const dup = [
      { query: "x", page: "https://monedario.cl/a/", impressions: 10, clicks: 1, position: 5, ctr: 0.1 },
      { query: "x", page: "https://monedario.cl/a/", impressions: 40, clicks: 3, position: 4, ctr: 0.07 },
      { query: "x", page: "https://monedario.cl/b/", impressions: 20, clicks: 1, position: 6, ctr: 0.05 },
    ];
    const groups = findCannibalizationGroups(dup, { minImpressions: 5, minUrls: 2 });
    expect(groups).toHaveLength(1);
    expect(groups[0].urlCount).toBe(2);
    expect(groups[0].totalImpressions).toBe(60); // 40 (max for /a/) + 20
  });
});

describe("aggregateQueryPageRows", () => {
  const docs = [
    {
      data: [
        { query: "uf hoy", page: "https://monedario.cl/calculadoras/conversor-uf/", impressions: 100, clicks: 5, position: 10, ctr: 0.05 },
        { query: "apv", page: "https://monedario.cl/calculadoras/apv/", impressions: 40, clicks: 0, position: 20, ctr: 0 },
      ],
    },
    {
      data: [
        { query: "uf hoy", page: "https://monedario.cl/calculadoras/conversor-uf/", impressions: 300, clicks: 15, position: 6, ctr: 0.05 },
      ],
    },
  ];

  it("sums impressions/clicks and impression-weights position across weeks", () => {
    const rows = aggregateQueryPageRows(docs);
    const uf = rows.find(r => r.query === "uf hoy");
    expect(uf?.impressions).toBe(400);
    expect(uf?.clicks).toBe(20);
    // weighted position = (100*10 + 300*6) / 400 = 2800/400 = 7
    expect(uf?.position).toBe(7);
    // ctr recomputed = 20/400 = 0.05
    expect(uf?.ctr).toBe(0.05);
  });

  it("keeps single-week rows intact and sorts by impressions desc", () => {
    const rows = aggregateQueryPageRows(docs);
    expect(rows[0].query).toBe("uf hoy"); // 400 > 40
    expect(rows.find(r => r.query === "apv")?.impressions).toBe(40);
  });

  it("returns empty for empty input", () => {
    expect(aggregateQueryPageRows([])).toEqual([]);
    expect(aggregateQueryPageRows(undefined)).toEqual([]);
  });
});

describe("findStrikingDistance", () => {
  const rows = [
    // In-band (pos 8-20), good demand → opportunity
    { query: "calcular finiquito", page: "https://monedario.cl/calculadoras/finiquito-indemnizacion/", impressions: 300, clicks: 1, position: 11.2, ctr: 0.003 },
    // In-band, lower position (closer to page 1) → higher proximity weight
    { query: "tasa cae", page: "https://monedario.cl/posts/cae-costo-real-credito-chile/", impressions: 100, clicks: 0, position: 8.0, ctr: 0 },
    // Already top-5 → excluded (not striking distance)
    { query: "que es la uf", page: "https://monedario.cl/posts/que-es-la-uf/", impressions: 900, clicks: 200, position: 2.1, ctr: 0.22 },
    // Page 3+ → excluded by default max-position
    { query: "apv 2026", page: "https://monedario.cl/posts/que-es-el-apv/", impressions: 400, clicks: 0, position: 28.0, ctr: 0 },
    // In-band but below impression floor → excluded
    { query: "rara cola", page: "https://monedario.cl/posts/x/", impressions: 3, clicks: 0, position: 12.0, ctr: 0 },
  ];

  it("returns only in-band pairs above the impression floor", () => {
    const res = findStrikingDistance(rows, { minPosition: 8, maxPosition: 20, minImpressions: 10 });
    expect(res.map(o => o.query).sort()).toEqual(["calcular finiquito", "tasa cae"]);
  });

  it("scores by impressions weighted by closeness to page 1", () => {
    const res = findStrikingDistance(rows, { minPosition: 8, maxPosition: 20, minImpressions: 10 });
    // finiquito: 300 impr at pos 11.2; cae: 100 impr at pos 8 (max proximity)
    // 300 × ((20-11.2+1)/13)=300×0.7538=226.15 vs 100 × (13/13)=100 → finiquito ranks first
    expect(res[0].query).toBe("calcular finiquito");
    expect(res[0].score).toBeGreaterThan(res[1].score);
  });

  it("maxClicks filter surfaces only under-converting pairs", () => {
    const res = findStrikingDistance(rows, { minImpressions: 10, maxClicks: 0 });
    // finiquito has 1 click → excluded; cae has 0 → kept
    expect(res.map(o => o.query)).toEqual(["tasa cae"]);
  });

  it("returns empty when nothing is in the band", () => {
    expect(findStrikingDistance([rows[2], rows[3]], { minImpressions: 1 })).toEqual([]);
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

describe("gsc-fetch GAP gate", () => {
  const tmpDirs: string[] = [];

  afterEach(() => {
    for (const dir of tmpDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  function tmpDir(): string {
    const dir = mkdtempSync(path.join(os.tmpdir(), "gsc-"));
    tmpDirs.push(dir);
    return dir;
  }

  it("default mode: a missing previous week aborts before the credential check", () => {
    const dir = tmpDir();
    const target = previousCompleteISOWeek();
    const { from } = isoWeekToDateRange(target);
    const prevWeek = dateToISOWeek(
      new Date(Date.parse(`${from}T00:00:00Z`) - 7 * 86_400_000),
    );
    const r = run([], { GSC_OUTPUT_BASE: dir });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("GAP");
    expect(r.stderr).toContain(prevWeek);
    expect(r.stderr).not.toContain("Missing env var");
  });

  it("backfill mode: the same gap only warns, then exits on missing credentials", () => {
    const dir = tmpDir();
    const r = run(["--week=2026-W17"], { GSC_OUTPUT_BASE: dir });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("GAP (backfill mode)");
    expect(r.stderr).toContain("Missing env var");
  });

  it("backfill mode: a present target-week export counts as weeks_present=1", () => {
    const dir = tmpDir();
    writeFileSync(path.join(dir, "2026-W17-pages.json"), "{}\n", "utf8");
    const r = run(["--week=2026-W17"], { GSC_OUTPUT_BASE: dir });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("weeks_present=1");
    expect(r.stderr).toContain("GAP (backfill mode)");
    expect(r.stderr).toContain("Missing env var");
  });

  it("backfill mode: a complete lookback window does not trigger the gate", () => {
    const dir = tmpDir();
    for (const week of missingExportWeeks([], "2026-W17", 12)) {
      writeFileSync(path.join(dir, `${week}-pages.json`), "{}\n", "utf8");
    }
    const r = run(["--week=2026-W17"], { GSC_OUTPUT_BASE: dir });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("weeks_present=12 missing=[]");
    expect(r.stderr).not.toContain("GAP");
    expect(r.stderr).toContain("Missing env var");
  });

  it("explicit --week equal to the previous complete week is still strict", () => {
    const dir = tmpDir();
    const target = previousCompleteISOWeek();
    const r = run([`--week=${target}`], { GSC_OUTPUT_BASE: dir });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("GAP");
    expect(r.stderr).not.toContain("Missing env var");
  });
});
