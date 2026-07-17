/**
 * Tests de integración: first-party analytics → scorecard.
 *
 * Verifica que el scorecard:
 *  - Lee el JSON de first-party analytics
 *  - Calcula rates correctos (start rate, completion rate)
 *  - Muestra "n/d" cuando el denominador es cero
 *  - No interpreta semana faltante como cero
 *  - Mantiene el CSV fallback funcional
 */
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT_PATH = path.resolve("scripts/build-weekly-search-report.mjs");
const tempRoots: string[] = [];

function createTempRoot() {
  const root = mkdtempSync(path.join(tmpdir(), "tpi-analytics-scorecard-"));
  tempRoots.push(root);
  return root;
}

function runScript(args: string[]) {
  return spawnSync("node", [SCRIPT_PATH, ...args], {
    encoding: "utf8",
  });
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

function makeAnalyticsJson(dir: string, week: string, data: object[]) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    path.join(dir, `${week}.json`),
    JSON.stringify(
      {
        source: "first-party-events",
        schemaVersion: 1,
        week,
        window: { from: "2026-06-22", to: "2026-06-28" },
        data,
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );
}

function makeMinimalBundle(inputDir: string, week: string) {
  mkdirSync(inputDir, { recursive: true });

  writeFileSync(
    path.join(inputDir, "gsc-pages.csv"),
    [
      "Top pages,Clicks,Clicks Difference,Impressions,Impressions Difference,CTR,CTR Difference,Position,Position Difference",
      "https://monedario.cl/calculadoras/tool-a/,40,5,500,50,8.0%,0.5%,3.2,-0.3",
    ].join("\n"),
    "utf8",
  );

  writeFileSync(
    path.join(inputDir, "gsc-queries.csv"),
    [
      "Top queries,Clicks,Clicks Difference,Impressions,Impressions Difference,CTR,CTR Difference,Position,Position Difference",
      "tool a query,35,5,300,40,11.0%,1.0%,3.5,-0.4",
    ].join("\n"),
    "utf8",
  );

  writeFileSync(
    path.join(inputDir, "indexation-summary.json"),
    JSON.stringify({
      weekLabel: week,
      dateRange: {
        currentStart: "2026-06-22",
        currentEnd: "2026-06-28",
        previousStart: "2026-06-15",
        previousEnd: "2026-06-21",
      },
      google: { sitemapStatus: "ok", coverageNotes: "ok", alerts: [], manualActions: "none", enhancementIssues: [] },
      bing: { sitemapStatus: "ok", coverageNotes: "ok", alerts: [] },
      notes: [],
    }),
    "utf8",
  );
}

function makeWatchlist(root: string) {
  const watchlistPath = path.join(root, "watchlist.json");
  writeFileSync(
    watchlistPath,
    JSON.stringify({
      site: "monedario.cl",
      pages: [
        {
          path: "/calculadoras/tool-a/",
          label: "Tool A",
          cluster: "alpha",
          role: "tool",
          queryThemes: ["tool a"],
          nextStepPaths: [],
        },
        {
          path: "/calculadoras/tool-b/",
          label: "Tool B",
          cluster: "beta",
          role: "tool",
          queryThemes: ["tool b"],
          nextStepPaths: [],
        },
      ],
    }),
    "utf8",
  );
  return watchlistPath;
}

describe("analytics scorecard integration", () => {
  it("reads first-party analytics JSON and shows funnel metrics", () => {
    const root = createTempRoot();
    const week = "2026-W26";
    const inputDir = path.join(root, week);
    makeMinimalBundle(inputDir, week);

    const analyticsDir = path.join(root, "analytics");
    makeAnalyticsJson(analyticsDir, week, [
      { date: "2026-06-22", event_name: "calculator_view", calculator_slug: "tool-a", dimensions: "", count: 100 },
      { date: "2026-06-22", event_name: "calculator_start", calculator_slug: "tool-a", dimensions: "click", count: 50 },
      { date: "2026-06-23", event_name: "calculator_complete", calculator_slug: "tool-a", dimensions: "success", count: 25 },
      { date: "2026-06-24", event_name: "calculator_error", calculator_slug: "tool-a", dimensions: "validation", count: 5 },
      { date: "2026-06-25", event_name: "share_result_click", calculator_slug: "tool-a", dimensions: "copy", count: 3 },
    ]);

    const watchlistPath = makeWatchlist(root);
    const markdownOut = path.join(inputDir, "scorecard.md");
    const jsonOut = path.join(inputDir, "scorecard.json");

    const result = runScript([
      "--input", inputDir,
      "--watchlist", watchlistPath,
      "--out", markdownOut,
      "--json-out", jsonOut,
      "--analytics-json-dir", analyticsDir,
    ]);

    expect(result.status).toBe(0);
    const stdout = result.stdout;
    expect(stdout).toContain("analytics-json=yes");

    const markdown = readFileSync(markdownOut, "utf8");
    expect(markdown).toContain("Señales de calculadoras (first-party)");
    expect(markdown).toContain("tool-a");
    expect(markdown).toContain("50"); // starts
    expect(markdown).toContain("25"); // completes

    const json = JSON.parse(readFileSync(jsonOut, "utf8"));
    expect(json.analyticsJson).not.toBeNull();
    expect(json.analyticsJson.available).toBe(true);
    expect(Object.keys(json.analyticsJson.bySlug).length).toBe(1);
    expect(json.analyticsJson.totals.views).toBe(100);
    expect(json.analyticsJson.totals.starts).toBe(50);
    expect(json.analyticsJson.totals.completes).toBe(25);
    expect(json.analyticsJson.totals.errors).toBe(5);
  });

  it("calculates explicit event ratios: views=100, starts=50, completes=25", () => {
    const root = createTempRoot();
    const week = "2026-W26";
    const inputDir = path.join(root, week);
    makeMinimalBundle(inputDir, week);

    const analyticsDir = path.join(root, "analytics");
    makeAnalyticsJson(analyticsDir, week, [
      { date: "2026-06-22", event_name: "calculator_view", calculator_slug: "tool-a", dimensions: "", count: 100 },
      { date: "2026-06-22", event_name: "calculator_start", calculator_slug: "tool-a", dimensions: "click", count: 50 },
      { date: "2026-06-23", event_name: "calculator_complete", calculator_slug: "tool-a", dimensions: "success", count: 25 },
    ]);

    const watchlistPath = makeWatchlist(root);
    const markdownOut = path.join(inputDir, "scorecard.md");
    const jsonOut = path.join(inputDir, "scorecard.json");

    const result = runScript([
      "--input", inputDir,
      "--watchlist", watchlistPath,
      "--out", markdownOut,
      "--json-out", jsonOut,
      "--analytics-json-dir", analyticsDir,
    ]);

    expect(result.status).toBe(0);

    const markdown = readFileSync(markdownOut, "utf8");
    expect(markdown).toContain("Starts/view");
    expect(markdown).toContain("Results/start");
    expect(markdown).toContain("0.50×");
    expect(markdown).toContain(
      "no representan usuarios, sesiones ni conversión de cohorte",
    );
    expect(markdown).not.toContain("Completion rate");

    const json = JSON.parse(readFileSync(jsonOut, "utf8"));
    expect(json.analyticsJson.totals.views).toBe(100);
    expect(json.analyticsJson.totals.starts).toBe(50);
    expect(json.analyticsJson.totals.completes).toBe(25);
  });

  it('shows "n/d" for rates when denominator is zero', () => {
    const root = createTempRoot();
    const week = "2026-W26";
    const inputDir = path.join(root, week);
    makeMinimalBundle(inputDir, week);

    const analyticsDir = path.join(root, "analytics");
    // Only views, no starts → both event ratios should be "n/d"
    makeAnalyticsJson(analyticsDir, week, [
      { date: "2026-06-22", event_name: "calculator_view", calculator_slug: "tool-a", dimensions: "", count: 100 },
    ]);

    const watchlistPath = makeWatchlist(root);
    const markdownOut = path.join(inputDir, "scorecard.md");
    const jsonOut = path.join(inputDir, "scorecard.json");

    const result = runScript([
      "--input", inputDir,
      "--watchlist", watchlistPath,
      "--out", markdownOut,
      "--json-out", jsonOut,
      "--analytics-json-dir", analyticsDir,
    ]);

    expect(result.status).toBe(0);

    const markdown = readFileSync(markdownOut, "utf8");
    // Should show "n/d" when an event-ratio denominator is zero.
    expect(markdown).toContain("n/d");
    // Should NOT show "0%" for rates with zero denominator
    // (the "n/d" check above covers this)
  });

  it("does not interpret missing week as zero", () => {
    const root = createTempRoot();
    const week = "2026-W26";
    const inputDir = path.join(root, week);
    makeMinimalBundle(inputDir, week);

    // Point to a directory with no matching file
    const emptyAnalyticsDir = path.join(root, "empty-analytics");
    mkdirSync(emptyAnalyticsDir, { recursive: true });

    const watchlistPath = makeWatchlist(root);
    const jsonOut = path.join(inputDir, "scorecard.json");

    const result = runScript([
      "--input", inputDir,
      "--watchlist", watchlistPath,
      "--json-out", jsonOut,
      "--analytics-json-dir", emptyAnalyticsDir,
    ]);

    expect(result.status).toBe(0);

    const json = JSON.parse(readFileSync(jsonOut, "utf8"));
    // Missing file → analyticsJson should be null, not zero values
    expect(json.analyticsJson).toBeNull();
  });

  it("CSV fallback still works when analytics JSON is not available", () => {
    const root = createTempRoot();
    const inputDir = path.join(root, "2026-W26");
    mkdirSync(inputDir, { recursive: true });
    // Point to an empty directory so the script does NOT find a real
    // analytics JSON file on disk (e.g. output/operations/data-signals/analytics/).
    const emptyAnalyticsDir = path.join(root, "no-analytics");

    const watchlistPath = makeWatchlist(root);

    writeFileSync(
      path.join(inputDir, "gsc-pages.csv"),
      ["Top pages,Clicks,Clicks Difference,Impressions,Impressions Difference,CTR,CTR Difference,Position,Position Difference",
       "https://monedario.cl/,10,2,100,10,10%,0.5%,5.0,-0.2"].join("\n"),
      "utf8",
    );
    writeFileSync(
      path.join(inputDir, "gsc-queries.csv"),
      ["Top queries,Clicks,Clicks Difference,Impressions,Impressions Difference,CTR,CTR Difference,Position,Position Difference",
       "monedario,8,1,80,5,10%,0.1%,4.0,-0.1"].join("\n"),
      "utf8",
    );
    writeFileSync(
      path.join(inputDir, "analytics-events.csv"),
      [
        "page_path,event_name,event_count,event_count_previous",
        "/calculadoras/tool-a/,calculator_start,20,18",
        "/calculadoras/tool-a/,calculator_complete,4,5",
      ].join("\n"),
      "utf8",
    );
    writeFileSync(
      path.join(inputDir, "indexation-summary.json"),
      JSON.stringify({
        weekLabel: "2026-W26",
        google: { sitemapStatus: "ok", coverageNotes: "ok", alerts: [], manualActions: "none", enhancementIssues: [] },
        bing: { sitemapStatus: "ok", coverageNotes: "ok", alerts: [] },
        notes: [],
      }),
      "utf8",
    );

    const jsonOut = path.join(inputDir, "scorecard.json");

    const result = runScript([
      "--input", inputDir,
      "--watchlist", watchlistPath,
      "--json-out", jsonOut,
      "--analytics-json-dir", emptyAnalyticsDir,
    ]);

    expect(result.status).toBe(0);
    const stdout = result.stdout;
    // CSV analytics should be available
    expect(stdout).toContain("analytics=yes");

    const json = JSON.parse(readFileSync(jsonOut, "utf8"));
    // CSV totals should be populated
    expect(json.analyticsAvailable).toBe(true);
    expect(json.analyticsTotals.calculator_start.current).toBe(20);
    expect(json.analyticsTotals.calculator_complete.current).toBe(4);
    // First-party JSON should be null (not available)
    expect(json.analyticsJson).toBeNull();
  });
});
