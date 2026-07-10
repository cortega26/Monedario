import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  COVERAGE_CRAWLED_NOT_INDEXED,
  COVERAGE_INDEXED,
  extractSitemapLocs,
  normalizeUrlInspectionRow,
  shouldAbortIndexationRun,
  summarizeIndexation,
} from "../../scripts/data-signals/gsc-utils.mjs";

const SCRIPT = path.resolve("scripts/data-signals/gsc-inspect.mjs");

function run(args: string[], extraEnv: Record<string, string> = {}) {
  const env = { ...process.env };
  delete env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  Object.assign(env, extraEnv);
  return spawnSync("node", [SCRIPT, ...args], { encoding: "utf8", env });
}

// ---------------------------------------------------------------------------
// extractSitemapLocs
// ---------------------------------------------------------------------------

describe("extractSitemapLocs", () => {
  it("extracts loc URLs from a urlset in document order, de-duplicated", () => {
    const xml = `<?xml version="1.0"?><urlset>
      <url><loc>https://monedario.cl/</loc></url>
      <url><loc>https://monedario.cl/posts/a/</loc></url>
      <url><loc>https://monedario.cl/posts/a/</loc></url>
    </urlset>`;
    expect(extractSitemapLocs(xml)).toEqual([
      "https://monedario.cl/",
      "https://monedario.cl/posts/a/",
    ]);
  });

  it("extracts child sitemap URLs from a sitemapindex and tolerates whitespace", () => {
    const xml = `<sitemapindex><sitemap><loc>
      https://monedario.cl/sitemap-0.xml
    </loc></sitemap></sitemapindex>`;
    expect(extractSitemapLocs(xml)).toEqual(["https://monedario.cl/sitemap-0.xml"]);
  });

  it("returns [] for non-string or empty input", () => {
    expect(extractSitemapLocs("")).toEqual([]);
    // @ts-expect-error deliberate wrong type
    expect(extractSitemapLocs(null)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// normalizeUrlInspectionRow
// ---------------------------------------------------------------------------

describe("normalizeUrlInspectionRow", () => {
  it("normalizes with alphabetically sorted keys and date-only crawl", () => {
    const result = normalizeUrlInspectionRow("https://monedario.cl/", {
      verdict: "PASS",
      coverageState: COVERAGE_INDEXED,
      indexingState: "INDEXING_ALLOWED",
      robotsTxtState: "ALLOWED",
      lastCrawlTime: "2026-07-02T20:33:17Z",
      extraFieldIgnored: true,
    });
    expect(result).toEqual({
      coverageState: "Submitted and indexed",
      indexingState: "INDEXING_ALLOWED",
      lastCrawl: "2026-07-02",
      robotsTxtState: "ALLOWED",
      url: "https://monedario.cl/",
      verdict: "PASS",
    });
    expect(Object.keys(result)).toEqual([
      "coverageState",
      "indexingState",
      "lastCrawl",
      "robotsTxtState",
      "url",
      "verdict",
    ]);
  });

  it("fills nulls when the inspection result is empty (error/marker)", () => {
    const result = normalizeUrlInspectionRow("https://monedario.cl/x/", {});
    expect(result).toEqual({
      coverageState: null,
      indexingState: null,
      lastCrawl: null,
      robotsTxtState: null,
      url: "https://monedario.cl/x/",
      verdict: null,
    });
  });
});

// ---------------------------------------------------------------------------
// summarizeIndexation
// ---------------------------------------------------------------------------

describe("summarizeIndexation", () => {
  it("counts indexed vs not-indexed and computes whole-number pct", () => {
    const rows = [
      { coverageState: COVERAGE_INDEXED },
      { coverageState: COVERAGE_INDEXED },
      { coverageState: COVERAGE_CRAWLED_NOT_INDEXED },
      { coverageState: "Excluded by ‘noindex’ tag" },
    ];
    expect(summarizeIndexation(rows)).toEqual({
      total: 4,
      indexed: 2,
      notIndexed: 1,
      other: 1,
      indexedPct: 50,
      byCoverage: {
        "Submitted and indexed": 2,
        "Crawled - currently not indexed": 1,
        "Excluded by ‘noindex’ tag": 1,
      },
    });
  });

  it("handles empty input with null pct", () => {
    expect(summarizeIndexation([])).toEqual({
      total: 0,
      indexed: 0,
      notIndexed: 0,
      other: 0,
      indexedPct: null,
      byCoverage: {},
    });
  });

  it("buckets null coverage under 'unknown'", () => {
    const s = summarizeIndexation([{ coverageState: null }]);
    expect(s.byCoverage).toEqual({ unknown: 1 });
    expect(s.other).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// shouldAbortIndexationRun
// ---------------------------------------------------------------------------

describe("shouldAbortIndexationRun", () => {
  it("aborts when every URL inspection failed", () => {
    expect(shouldAbortIndexationRun(250, 250).abort).toBe(true);
  });

  it("aborts when a majority of URL inspections failed", () => {
    expect(shouldAbortIndexationRun(130, 250).abort).toBe(true);
  });

  it("aborts exactly at the 50% threshold", () => {
    expect(shouldAbortIndexationRun(125, 250).abort).toBe(true);
  });

  it("aborts with a 'no URLs' reason for an empty run", () => {
    const result = shouldAbortIndexationRun(0, 0);
    expect(result.abort).toBe(true);
    expect(result.reason).toContain("no URLs");
  });

  it("does not abort a healthy run with few errors", () => {
    expect(shouldAbortIndexationRun(3, 250).abort).toBe(false);
  });

  it("does not abort a fully-indexed healthy run", () => {
    expect(shouldAbortIndexationRun(0, 250).abort).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// CLI error handling (no real API calls)
// ---------------------------------------------------------------------------

describe("gsc-inspect CLI", () => {
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
    const r = run(["--week=bad-week"], { GOOGLE_APPLICATION_CREDENTIALS_JSON: "{}" });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("Invalid --week format");
  });

  it("exits 1 for invalid --max", () => {
    const r = run(["--max=0"], { GOOGLE_APPLICATION_CREDENTIALS_JSON: "{}" });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("Invalid --max");
  });

  it("exits 1 for unknown arguments", () => {
    const r = run(["--nope"], { GOOGLE_APPLICATION_CREDENTIALS_JSON: "{}" });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("Unknown argument");
  });

  it("prints usage and exits 0 with --help", () => {
    const r = run(["--help"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("gsc-inspect");
    expect(r.stdout).toContain("GOOGLE_APPLICATION_CREDENTIALS_JSON");
  });
});
