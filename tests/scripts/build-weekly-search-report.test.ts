import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT_PATH = path.resolve("scripts/build-weekly-search-report.mjs");
const tempRoots: string[] = [];

function createTempRoot() {
  const root = mkdtempSync(path.join(tmpdir(), "tpi-weekly-search-"));
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

function makeGscJsonDir(root: string, week: string) {
  const gscDir = path.join(root, "gsc");
  mkdirSync(gscDir, { recursive: true });

  const header = {
    fetchedAt: "2026-04-25T00:00:00Z",
    schemaVersion: 1,
    source: "gsc",
    week,
    window: { from: "2026-04-13", to: "2026-04-19" },
  };

  writeFileSync(
    path.join(gscDir, `${week}-pages.json`),
    JSON.stringify({
      ...header,
      data: [
        { clicks: 40, ctr: 0.08, impressions: 500, page: "https://monedario.cl/posts/winner/", position: 3.2 },
        { clicks: 15, ctr: 0.02, impressions: 450, page: "https://monedario.cl/posts/loser/", position: 8.2 },
        { clicks: 60, ctr: 0.1, impressions: 120, page: "https://monedario.cl/calculadoras/tool/", position: 2.8 },
      ],
    }),
    "utf8"
  );

  writeFileSync(
    path.join(gscDir, `${week}-queries.json`),
    JSON.stringify({
      ...header,
      data: [
        { clicks: 35, ctr: 0.11, impressions: 300, position: 3.5, query: "winner query chile" },
        { clicks: 40, ctr: 0.03, impressions: 500, position: 7.0, query: "loser query chile" },
        { clicks: 30, ctr: 0.13, impressions: 220, position: 2.6, query: "tool query chile" },
      ],
    }),
    "utf8"
  );

  return gscDir;
}

function writeGscWeek(
  gscDir: string,
  week: string,
  window: { from: string; to: string },
  pages: object[],
  queries: object[],
  headerOverrides: Record<string, unknown> = {},
) {
  mkdirSync(gscDir, { recursive: true });
  const header = {
    fetchedAt: "2026-07-16T00:00:00Z",
    schemaVersion: 1,
    source: "gsc",
    week,
    window,
    ...headerOverrides,
  };
  writeFileSync(
    path.join(gscDir, `${week}-pages.json`),
    JSON.stringify({ ...header, data: pages }),
    "utf8",
  );
  writeFileSync(
    path.join(gscDir, `${week}-queries.json`),
    JSON.stringify({ ...header, data: queries }),
    "utf8",
  );
}

function writeMinimalJsonBundle(inputDir: string, week: string) {
  mkdirSync(inputDir, { recursive: true });
  writeFileSync(
    path.join(inputDir, "indexation-summary.json"),
    JSON.stringify({
      weekLabel: week,
      google: {
        sitemapStatus: "ok",
        coverageNotes: "ok",
        alerts: [],
        manualActions: "none",
        enhancementIssues: [],
      },
      bing: { sitemapStatus: "ok", coverageNotes: "ok", alerts: [] },
      notes: [],
    }),
    "utf8",
  );
}

function makeCfJsonDir(root: string, week: string) {
  const cfDir = path.join(root, "cloudflare");
  mkdirSync(cfDir, { recursive: true });

  const header = {
    fetchedAt: "2026-04-25T00:00:00Z",
    schemaVersion: 1,
    source: "cloudflare-rum",
    week,
    window: { from: "2026-04-13", to: "2026-04-19" },
  };

  writeFileSync(
    path.join(cfDir, `${week}-rum.json`),
    JSON.stringify({
      ...header,
      data: [
        { clsP75: 0.008, count: 60, inpP75Ms: 48, lcpP75Ms: 1128, path: "/calculadoras/operacion-renta/" },
        { clsP75: null, count: 10, inpP75Ms: null, lcpP75Ms: 5200, path: "/posts/loser/" },
      ],
    }),
    "utf8"
  );

  writeFileSync(
    path.join(cfDir, `${week}-traffic.json`),
    JSON.stringify({
      ...header,
      source: "cloudflare-traffic",
      summary: { bandwidthMB: 278.9, cacheRatioPct: 8.3, pageViews: 5088, requests: 14252 },
      data: [],
    }),
    "utf8"
  );

  return cfDir;
}

describe("build-weekly-search-report script", () => {
  it("initializes a weekly input bundle", () => {
    const root = createTempRoot();
    const inputDir = path.join(root, "2026-W11");

    const result = runScript(["--input", inputDir, "--init"]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Initialized input bundle");
    expect(readFileSync(path.join(inputDir, "README.md"), "utf8")).toContain(
      "gsc-pages.csv"
    );
    const indexation = JSON.parse(
      readFileSync(path.join(inputDir, "indexation-summary.json"), "utf8")
    );
    expect(indexation.weekLabel).toBe("2026-W11");
    expect(indexation.dateRange.currentStart).toBe("2026-03-09");
    expect(indexation.dateRange.currentEnd).toBe("2026-03-15");
    expect(indexation.dateRange.previousStart).toBe("2026-03-02");
    expect(indexation.dateRange.previousEnd).toBe("2026-03-08");
  });

  it("generates correct date ranges for arbitrary ISO weeks on --init", () => {
    const cases = [
      {
        week: "2026-W18",
        currentStart: "2026-04-27",
        currentEnd: "2026-05-03",
        previousStart: "2026-04-20",
        previousEnd: "2026-04-26",
      },
      {
        week: "2026-W01",
        currentStart: "2025-12-29",
        currentEnd: "2026-01-04",
        previousStart: "2025-12-22",
        previousEnd: "2025-12-28",
      },
    ];

    for (const tc of cases) {
      const root = createTempRoot();
      const inputDir = path.join(root, tc.week);
      const result = runScript(["--input", inputDir, "--init"]);
      expect(result.status).toBe(0);
      const indexation = JSON.parse(
        readFileSync(path.join(inputDir, "indexation-summary.json"), "utf8")
      );
      expect(indexation.weekLabel).toBe(tc.week);
      expect(indexation.dateRange.currentStart).toBe(tc.currentStart);
      expect(indexation.dateRange.currentEnd).toBe(tc.currentEnd);
      expect(indexation.dateRange.previousStart).toBe(tc.previousStart);
      expect(indexation.dateRange.previousEnd).toBe(tc.previousEnd);
    }
  });

  it("builds a scorecard with winners, losers, refresh cues, and linking actions", () => {
    const root = createTempRoot();
    const inputDir = path.join(root, "2026-W11");
    mkdirSync(inputDir, { recursive: true });

    const watchlistPath = path.join(root, "watchlist.json");
    writeFileSync(
      watchlistPath,
      JSON.stringify(
        {
          site: "monedario.cl",
          pages: [
            {
              path: "/posts/winner/",
              label: "Winner owner",
              cluster: "alpha",
              role: "owner",
              queryThemes: ["winner query"],
              nextStepPaths: ["/calculadoras/winner/"],
            },
            {
              path: "/posts/loser/",
              label: "Loser owner",
              cluster: "beta",
              role: "owner",
              queryThemes: ["loser query"],
              nextStepPaths: ["/calculadoras/loser/"],
            },
            {
              path: "/calculadoras/tool/",
              label: "Tool page",
              cluster: "gamma",
              role: "tool",
              queryThemes: ["tool query"],
              nextStepPaths: ["/posts/tool-guide/"],
            },
          ],
        },
        null,
        2
      )
    );

    writeFileSync(
      path.join(inputDir, "gsc-pages.csv"),
      [
        "Top pages,Clicks,Clicks Difference,Impressions,Impressions Difference,CTR,CTR Difference,Position,Position Difference",
        "https://monedario.cl/posts/winner/,40,20,500,120,8.0%,1.0%,3.2,-0.8",
        "https://monedario.cl/posts/loser/,15,-12,450,80,2.0%,-1.1%,8.2,1.4",
        "https://monedario.cl/calculadoras/tool/,60,3,120,20,10.0%,0.2%,2.8,-0.1",
      ].join("\n"),
      "utf8"
    );

    writeFileSync(
      path.join(inputDir, "gsc-queries.csv"),
      [
        "Top queries,Clicks,Clicks Difference,Impressions,Impressions Difference,CTR,CTR Difference,Position,Position Difference",
        "winner query chile,35,18,300,90,11.0%,1.3%,3.5,-0.5",
        "loser query chile,40,10,500,150,3.0%,0.1%,7.0,-0.4",
        "tool query chile,30,12,220,60,13.0%,2.0%,2.6,-0.2",
      ].join("\n"),
      "utf8"
    );

    writeFileSync(
      path.join(inputDir, "analytics-events.csv"),
      [
        "page_path,event_name,event_count,event_count_previous",
        "/posts/winner/,cta_click,4,9",
        "/posts/loser/,cta_click,2,3",
        "/calculadoras/tool/,calculator_start,20,18",
        "/calculadoras/tool/,calculator_complete,4,5",
      ].join("\n"),
      "utf8"
    );

    writeFileSync(
      path.join(inputDir, "indexation-summary.json"),
      JSON.stringify(
        {
          weekLabel: "2026-W11",
          dateRange: {
            currentStart: "2026-03-09",
            currentEnd: "2026-03-15",
            previousStart: "2026-03-02",
            previousEnd: "2026-03-08",
          },
          google: {
            sitemapStatus: "processing",
            coverageNotes: "Google still processing indexation.",
            alerts: ["Sitemap still pending read."],
            manualActions: "none",
            enhancementIssues: [],
          },
          bing: {
            sitemapStatus: "processing",
            coverageNotes: "Bing still processing sitemap.",
            alerts: [],
          },
          notes: ["Keep focus on refresh before new content."],
        },
        null,
        2
      ),
      "utf8"
    );

    const markdownOut = path.join(inputDir, "scorecard.md");
    const jsonOut = path.join(inputDir, "scorecard.json");
    const result = runScript([
      "--input",
      inputDir,
      "--watchlist",
      watchlistPath,
      "--out",
      markdownOut,
      "--json-out",
      jsonOut,
    ]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Scorecard written");

    const markdown = readFileSync(markdownOut, "utf8");
    expect(markdown).toContain("Strategic Watchlist");
    expect(markdown).toContain("winner");
    expect(markdown).toContain("loser");
    expect(markdown).toContain("La demanda del query set sube, pero la landing cae");
    expect(markdown).toContain("Completion rate 20.0%");
    expect(markdown).toContain("El tráfico sube, pero los CTA no acompañan");

    const json = JSON.parse(readFileSync(jsonOut, "utf8"));
    expect(json.totals.trackedWinnerCount).toBe(1);
    expect(json.totals.trackedLoserCount).toBe(1);
    expect(json.totals.trackedActionCount).toBe(1);
    expect(json.source).toBe("csv");
  });

  it("uses GSC JSON when available and reports source=json", () => {
    const root = createTempRoot();
    const week = "2026-W16";
    const inputDir = path.join(root, week);
    mkdirSync(inputDir, { recursive: true });

    const watchlistPath = path.join(root, "watchlist.json");
    writeFileSync(
      watchlistPath,
      JSON.stringify({ site: "monedario.cl", pages: [] }),
      "utf8"
    );

    writeFileSync(
      path.join(inputDir, "indexation-summary.json"),
      JSON.stringify({
        weekLabel: week,
        dateRange: { currentStart: "2026-04-13", currentEnd: "2026-04-19", previousStart: "2026-04-06", previousEnd: "2026-04-12" },
        google: { sitemapStatus: "ok", coverageNotes: "ok", alerts: [], manualActions: "none", enhancementIssues: [] },
        bing: { sitemapStatus: "ok", coverageNotes: "ok", alerts: [] },
        notes: [],
      }),
      "utf8"
    );

    const gscDir = makeGscJsonDir(root, week);
    const markdownOut = path.join(inputDir, "scorecard.md");
    const jsonOut = path.join(inputDir, "scorecard.json");

    const result = runScript([
      "--input", inputDir,
      "--watchlist", watchlistPath,
      "--out", markdownOut,
      "--json-out", jsonOut,
      "--gsc-json-dir", gscDir,
      "--cloudflare-json-dir", path.join(root, "nonexistent-cf"),
    ]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("GSC source: JSON");
    expect(result.stdout).toContain("gsc-source=json");

    const json = JSON.parse(readFileSync(jsonOut, "utf8"));
    expect(json.source).toBe("json");
    expect(json.totals.clicks).toBeGreaterThan(0);
    expect(json.totals.clicksDelta).toBeNull();
    expect(json.comparison).toEqual({
      status: "unavailable",
      currentWeek: "2026-W16",
      previousWeek: "2026-W15",
    });
    expect(json.topPageWinners).toEqual([]);
    expect(json.topPageLosers).toEqual([]);
    expect(json.cloudflarePerf).toBeNull();
    expect(readFileSync(markdownOut, "utf8")).toContain(
      "previous artifact 2026-W15 is missing",
    );
  });

  it("compares W01 with the previous ISO year and preserves changed, new, removed, and normalized query identities", () => {
    const root = createTempRoot();
    const week = "2026-W01";
    const inputDir = path.join(root, week);
    writeMinimalJsonBundle(inputDir, week);
    const watchlistPath = path.join(root, "watchlist.json");
    writeFileSync(
      watchlistPath,
      JSON.stringify({ site: "monedario.cl", pages: [] }),
      "utf8",
    );

    const gscDir = path.join(root, "gsc");
    writeGscWeek(
      gscDir,
      week,
      { from: "2025-12-29", to: "2026-01-04" },
      [
        { clicks: 20, ctr: 0.1, impressions: 200, page: "https://monedario.cl/posts/existing/", position: 4 },
        { clicks: 5, ctr: 0.1, impressions: 50, page: "https://monedario.cl/posts/new/", position: 10 },
      ],
      [
        { clicks: 12, ctr: 0.1, impressions: 120, position: 4, query: "  Tax   Refund " },
        { clicks: 3, ctr: 0.1, impressions: 30, position: 9, query: "new query" },
      ],
    );
    writeGscWeek(
      gscDir,
      "2025-W52",
      { from: "2025-12-22", to: "2025-12-28" },
      [
        { clicks: 10, ctr: 0.1, impressions: 100, page: "https://monedario.cl/posts/existing/", position: 5 },
        { clicks: 7, ctr: 0.1, impressions: 70, page: "https://monedario.cl/posts/removed/", position: 6 },
      ],
      [
        { clicks: 8, ctr: 0.1, impressions: 80, position: 5, query: "tax refund" },
        { clicks: 4, ctr: 0.1, impressions: 40, position: 8, query: "removed query" },
      ],
    );

    const jsonOut = path.join(inputDir, "scorecard.json");
    const result = runScript([
      "--input", inputDir,
      "--watchlist", watchlistPath,
      "--json-out", jsonOut,
      "--gsc-json-dir", gscDir,
      "--analytics-json-dir", path.join(root, "missing-analytics"),
      "--cloudflare-json-dir", path.join(root, "missing-cloudflare"),
    ]);

    expect(result.status).toBe(0);
    const json = JSON.parse(readFileSync(jsonOut, "utf8"));
    expect(json.comparison).toEqual({
      status: "available",
      currentWeek: "2026-W01",
      previousWeek: "2025-W52",
    });
    expect(json.totals).toMatchObject({
      clicks: 25,
      clicksDelta: 8,
      impressions: 250,
      impressionsDelta: 80,
    });
    expect(json.topPageWinners[0]).toMatchObject({
      path: "/posts/existing/",
      clicksDelta: 10,
      impressionsDelta: 100,
      ctrDelta: 0,
      positionDelta: -1,
      identityStatus: "existing",
    });
    expect(json.topPageWinners[1]).toMatchObject({
      path: "/posts/new/",
      clicksDelta: 5,
      position: 10,
      positionDelta: null,
      identityStatus: "new",
    });
    expect(json.topPageLosers[0]).toMatchObject({
      path: "/posts/removed/",
      clicks: 0,
      clicksDelta: -7,
      position: null,
      positionDelta: null,
      identityStatus: "removed",
    });
    expect(json.topQueryWinners).toHaveLength(2);
    expect(json.topQueryWinners[0]).toMatchObject({
      clicksDelta: 4,
      identityStatus: "existing",
    });
    expect(json.topQueryLosers[0]).toMatchObject({
      label: "removed query",
      clicksDelta: -4,
      position: null,
      positionDelta: null,
      identityStatus: "removed",
    });
    expect(json.topQueryWinners[1]).toMatchObject({
      label: "new query",
      position: 9,
      positionDelta: null,
      identityStatus: "new",
    });
    expect(json.inputStatus).toMatchObject({
      analytics: { status: "missing" },
      cloudflare: {
        status: "missing",
        rum: { status: "missing" },
        traffic: { status: "missing" },
      },
      urlInspection: { status: "missing" },
    });
    const markdown = readFileSync(
      path.join(inputDir, "weekly-search-scorecard.md"),
      "utf8"
    );
    expect(markdown).toContain("analytics=missing");
    expect(markdown).toContain("new identity; prior position n/d");
    expect(markdown).toContain("removed identity; current position n/d");
  });

  it("fails on a corrupt previous GSC artifact instead of treating it as missing", () => {
    const root = createTempRoot();
    const week = "2026-W16";
    const inputDir = path.join(root, week);
    writeMinimalJsonBundle(inputDir, week);
    const watchlistPath = path.join(root, "watchlist.json");
    writeFileSync(watchlistPath, JSON.stringify({ site: "monedario.cl", pages: [] }), "utf8");
    const gscDir = path.join(root, "gsc");
    writeGscWeek(gscDir, week, { from: "2026-04-13", to: "2026-04-19" }, [], []);
    writeGscWeek(gscDir, "2026-W15", { from: "2026-04-06", to: "2026-04-12" }, [], []);
    const corruptPath = path.join(gscDir, "2026-W15-pages.json");
    writeFileSync(corruptPath, "{not-json", "utf8");
    const jsonOut = path.join(inputDir, "scorecard.json");

    const result = runScript([
      "--input", inputDir,
      "--watchlist", watchlistPath,
      "--json-out", jsonOut,
      "--gsc-json-dir", gscDir,
    ]);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(corruptPath);
    expect(result.stderr).toContain("invalid JSON");
    expect(() => readFileSync(jsonOut, "utf8")).toThrow();
  });

  it("fails on wrong GSC metadata with the artifact path and reason", () => {
    const root = createTempRoot();
    const week = "2026-W16";
    const inputDir = path.join(root, week);
    writeMinimalJsonBundle(inputDir, week);
    const watchlistPath = path.join(root, "watchlist.json");
    writeFileSync(watchlistPath, JSON.stringify({ site: "monedario.cl", pages: [] }), "utf8");
    const gscDir = path.join(root, "gsc");
    writeGscWeek(
      gscDir,
      week,
      { from: "2026-04-13", to: "2026-04-19" },
      [],
      [],
      { source: "not-gsc" },
    );

    const result = runScript([
      "--input", inputDir,
      "--watchlist", watchlistPath,
      "--gsc-json-dir", gscDir,
    ]);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(path.join(gscDir, "2026-W16-pages.json"));
    expect(result.stderr).toContain("source must be gsc");
  });

  it("fails before writing outputs for present-invalid optional signal artifacts", () => {
    for (const kind of ["analytics", "cloudflare", "inspection"] as const) {
      const root = createTempRoot();
      const week = "2026-W16";
      const inputDir = path.join(root, week);
      writeMinimalJsonBundle(inputDir, week);
      const watchlistPath = path.join(root, "watchlist.json");
      writeFileSync(
        watchlistPath,
        JSON.stringify({ site: "monedario.cl", pages: [] }),
        "utf8",
      );
      const gscDir = makeGscJsonDir(root, week);
      const analyticsDir = path.join(root, "analytics");
      const cloudflareDir = path.join(root, "cloudflare-invalid");
      let invalidPath: string;
      let expectedReason: string;

      if (kind === "analytics") {
        mkdirSync(analyticsDir, { recursive: true });
        invalidPath = path.join(analyticsDir, `${week}.json`);
        writeFileSync(invalidPath, '{"token":"TOP_SECRET"', "utf8");
        expectedReason = "invalid JSON";
      } else if (kind === "cloudflare") {
        mkdirSync(cloudflareDir, { recursive: true });
        invalidPath = path.join(cloudflareDir, `${week}-rum.json`);
        writeFileSync(
          invalidPath,
          JSON.stringify({
            schemaVersion: 2,
            source: "cloudflare-rum",
            week,
            window: { from: "2026-04-13", to: "2026-04-19" },
            data: [],
          }),
          "utf8",
        );
        expectedReason = "schemaVersion must be 1";
      } else {
        invalidPath = path.join(gscDir, `${week}-url-inspection.json`);
        writeFileSync(
          invalidPath,
          JSON.stringify({
            schemaVersion: 1,
            source: "gsc-url-inspection",
            week,
            window: { from: "2026-04-13", to: "2026-04-19" },
            summary: {},
            data: {},
          }),
          "utf8",
        );
        expectedReason = "data must be an array";
      }

      const markdownOut = path.join(inputDir, `${kind}.md`);
      const jsonOut = path.join(inputDir, `${kind}.json`);
      const result = runScript([
        "--input", inputDir,
        "--watchlist", watchlistPath,
        "--out", markdownOut,
        "--json-out", jsonOut,
        "--gsc-json-dir", gscDir,
        "--analytics-json-dir", analyticsDir,
        "--cloudflare-json-dir", cloudflareDir,
      ]);

      expect(result.status).toBe(1);
      expect(result.stderr).toContain(invalidPath);
      expect(result.stderr).toContain(expectedReason);
      expect(result.stderr).not.toContain("TOP_SECRET");
      expect(() => readFileSync(markdownOut, "utf8")).toThrow();
      expect(() => readFileSync(jsonOut, "utf8")).toThrow();
    }
  });

  it("rejects invalid consumed fields in analytics, Cloudflare, and URL Inspection artifacts", () => {
    const week = "2026-W16";
    const window = { from: "2026-04-13", to: "2026-04-19" };
    const cases = [
      {
        name: "analytics-event",
        target: "analytics",
        reason: "data[0].event_name is not allowlisted",
        document: {
          schemaVersion: 1,
          source: "first-party-events",
          week,
          window,
          data: [
            {
              date: "2026-04-13",
              event_name: "TOP_SECRET",
              calculator_slug: "tool",
              count: 1,
            },
          ],
        },
      },
      {
        name: "analytics-date",
        target: "analytics",
        reason: "data[0].date must be inside the artifact window",
        document: {
          schemaVersion: 1,
          source: "first-party-events",
          week,
          window,
          data: [
            {
              date: "TOP_SECRET",
              event_name: "calculator_view",
              calculator_slug: "tool",
              count: 1,
            },
          ],
        },
      },
      {
        name: "rum-metric",
        target: "rum",
        reason: "data[0].lcpP75Ms must be null or a non-negative finite number",
        document: {
          schemaVersion: 1,
          source: "cloudflare-rum",
          week,
          window,
          data: [
            {
              path: "/",
              count: 1,
              lcpP75Ms: "TOP_SECRET",
              clsP75: 0,
              inpP75Ms: null,
            },
          ],
        },
      },
      {
        name: "traffic-summary",
        target: "traffic",
        reason: "summary.pageViews must be a non-negative finite number",
        document: {
          schemaVersion: 1,
          source: "cloudflare-traffic",
          week,
          window,
          summary: {
            pageViews: "TOP_SECRET",
            requests: 1,
            cacheRatioPct: 0,
            bandwidthMB: 0,
          },
          data: [],
        },
      },
      {
        name: "inspection-url",
        target: "inspection",
        reason: "data[0].url must be an absolute URL",
        document: {
          schemaVersion: 1,
          source: "gsc-url-inspection",
          week,
          window,
          summary: { total: 1, indexed: 0, notIndexed: 0, other: 1, indexedPct: 0 },
          errors: 0,
          data: [{ url: "TOP_SECRET", coverageState: null, lastCrawl: null }],
        },
      },
      {
        name: "inspection-summary",
        target: "inspection",
        reason: "summary.total must be a non-negative integer",
        document: {
          schemaVersion: 1,
          source: "gsc-url-inspection",
          week,
          window,
          summary: {
            total: "TOP_SECRET",
            indexed: 0,
            notIndexed: 0,
            other: 0,
            indexedPct: null,
          },
          errors: 0,
          data: [],
        },
      },
    ];

    for (const testCase of cases) {
      const root = createTempRoot();
      const inputDir = path.join(root, week);
      writeMinimalJsonBundle(inputDir, week);
      const watchlistPath = path.join(root, "watchlist.json");
      writeFileSync(
        watchlistPath,
        JSON.stringify({ site: "monedario.cl", pages: [] }),
        "utf8"
      );
      const gscDir = makeGscJsonDir(root, week);
      const analyticsDir = path.join(root, "analytics");
      const cloudflareDir = path.join(root, "cloudflare");
      let invalidPath;
      if (testCase.target === "analytics") {
        mkdirSync(analyticsDir, { recursive: true });
        invalidPath = path.join(analyticsDir, `${week}.json`);
      } else if (testCase.target === "inspection") {
        invalidPath = path.join(gscDir, `${week}-url-inspection.json`);
      } else {
        mkdirSync(cloudflareDir, { recursive: true });
        invalidPath = path.join(cloudflareDir, `${week}-${testCase.target}.json`);
      }
      writeFileSync(invalidPath, JSON.stringify(testCase.document), "utf8");

      const markdownOut = path.join(inputDir, `${testCase.name}.md`);
      const jsonOut = path.join(inputDir, `${testCase.name}.json`);
      const result = runScript([
        "--input", inputDir,
        "--watchlist", watchlistPath,
        "--out", markdownOut,
        "--json-out", jsonOut,
        "--gsc-json-dir", gscDir,
        "--analytics-json-dir", analyticsDir,
        "--cloudflare-json-dir", cloudflareDir,
      ]);

      expect(result.status, testCase.name).toBe(1);
      expect(result.stderr).toContain(invalidPath);
      expect(result.stderr).toContain(testCase.reason);
      expect(result.stderr).not.toContain("TOP_SECRET");
      expect(() => readFileSync(markdownOut, "utf8")).toThrow();
      expect(() => readFileSync(jsonOut, "utf8")).toThrow();
    }
  });

  it("falls back to CSV when JSON files are missing (hermetic test)", () => {
    const root = createTempRoot();
    const inputDir = path.join(root, "2026-W11");
    mkdirSync(inputDir, { recursive: true });

    const watchlistPath = path.join(root, "watchlist.json");
    writeFileSync(
      watchlistPath,
      JSON.stringify({ site: "monedario.cl", pages: [] }),
      "utf8"
    );

    writeFileSync(
      path.join(inputDir, "gsc-pages.csv"),
      ["Top pages,Clicks,Clicks Difference,Impressions,Impressions Difference,CTR,CTR Difference,Position,Position Difference",
       "https://monedario.cl/,10,2,100,10,10%,0.5%,5.0,-0.2"].join("\n"),
      "utf8"
    );
    writeFileSync(
      path.join(inputDir, "gsc-queries.csv"),
      ["Top queries,Clicks,Clicks Difference,Impressions,Impressions Difference,CTR,CTR Difference,Position,Position Difference",
       "monedario,8,1,80,5,10%,0.1%,4.0,-0.1"].join("\n"),
      "utf8"
    );
    writeFileSync(
      path.join(inputDir, "indexation-summary.json"),
      JSON.stringify({
        weekLabel: "2026-W11",
        google: { sitemapStatus: "ok", coverageNotes: "ok", alerts: [], manualActions: "none", enhancementIssues: [] },
        bing: { sitemapStatus: "ok", coverageNotes: "ok", alerts: [] },
        notes: [],
      }),
      "utf8"
    );

    const emptyGscDir = path.join(root, "empty-gsc");
    mkdirSync(emptyGscDir, { recursive: true });
    const jsonOut = path.join(inputDir, "scorecard.json");

    const result = runScript([
      "--input", inputDir,
      "--watchlist", watchlistPath,
      "--json-out", jsonOut,
      "--gsc-json-dir", emptyGscDir,
    ]);

    expect(result.status).toBe(0);
    const json = JSON.parse(readFileSync(jsonOut, "utf8"));
    expect(json.source).toBe("csv");
  });

  it("prefers CSV exports over JSON when both are available", () => {
    const root = createTempRoot();
    const week = "2026-W16";
    const inputDir = path.join(root, week);
    mkdirSync(inputDir, { recursive: true });

    const watchlistPath = path.join(root, "watchlist.json");
    writeFileSync(
      watchlistPath,
      JSON.stringify({ site: "monedario.cl", pages: [] }),
      "utf8"
    );

    writeFileSync(
      path.join(inputDir, "gsc-pages.csv"),
      [
        "Top pages,Clicks,Clicks Difference,Impressions,Impressions Difference,CTR,CTR Difference,Position,Position Difference",
        "https://monedario.cl/posts/csv-winner/,40,12,500,120,8.0%,1.0%,3.2,-0.8",
      ].join("\n"),
      "utf8"
    );
    writeFileSync(
      path.join(inputDir, "gsc-queries.csv"),
      [
        "Top queries,Clicks,Clicks Difference,Impressions,Impressions Difference,CTR,CTR Difference,Position,Position Difference",
        "csv winner query,35,10,300,90,11.0%,1.3%,3.5,-0.5",
      ].join("\n"),
      "utf8"
    );
    writeFileSync(
      path.join(inputDir, "indexation-summary.json"),
      JSON.stringify({
        weekLabel: week,
        google: {
          sitemapStatus: "ok",
          coverageNotes: "ok",
          alerts: [],
          manualActions: "none",
          enhancementIssues: [],
        },
        bing: { sitemapStatus: "ok", coverageNotes: "ok", alerts: [] },
        notes: [],
      }),
      "utf8"
    );

    const gscDir = makeGscJsonDir(root, week);
    const markdownOut = path.join(inputDir, "scorecard.md");
    const jsonOut = path.join(inputDir, "scorecard.json");

    const result = runScript([
      "--input",
      inputDir,
      "--watchlist",
      watchlistPath,
      "--out",
      markdownOut,
      "--json-out",
      jsonOut,
      "--gsc-json-dir",
      gscDir,
    ]);

    expect(result.status).toBe(0);
    expect(result.stdout).not.toContain("GSC source: JSON");

    const markdown = readFileSync(markdownOut, "utf8");
    expect(markdown).toContain("/posts/csv-winner/");

    const json = JSON.parse(readFileSync(jsonOut, "utf8"));
    expect(json.source).toBe("csv");
    expect(json.totals.clicks).toBe(40);
  });

  it("includes cloudflare performance section in markdown when RUM/traffic JSON exist", () => {
    const root = createTempRoot();
    const week = "2026-W16";
    const inputDir = path.join(root, week);
    mkdirSync(inputDir, { recursive: true });

    const watchlistPath = path.join(root, "watchlist.json");
    writeFileSync(
      watchlistPath,
      JSON.stringify({ site: "monedario.cl", pages: [] }),
      "utf8"
    );
    writeFileSync(
      path.join(inputDir, "indexation-summary.json"),
      JSON.stringify({
        weekLabel: week,
        google: { sitemapStatus: "ok", coverageNotes: "ok", alerts: [], manualActions: "none", enhancementIssues: [] },
        bing: { sitemapStatus: "ok", coverageNotes: "ok", alerts: [] },
        notes: [],
      }),
      "utf8"
    );

    const gscDir = makeGscJsonDir(root, week);
    const cfDir = makeCfJsonDir(root, week);
    const markdownOut = path.join(inputDir, "scorecard.md");
    const jsonOut = path.join(inputDir, "scorecard.json");

    const result = runScript([
      "--input", inputDir,
      "--watchlist", watchlistPath,
      "--out", markdownOut,
      "--json-out", jsonOut,
      "--gsc-json-dir", gscDir,
      "--cloudflare-json-dir", cfDir,
    ]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("cloudflare=yes");

    const markdown = readFileSync(markdownOut, "utf8");
    expect(markdown).toContain("Performance real (Cloudflare RUM");
    expect(markdown).toContain("1128ms ✅");
    expect(markdown).toContain("5200ms ❌");
    expect(markdown).toContain("0.008 ✅");
    expect(markdown).toContain("5088 pageviews");
    expect(markdown).toContain("cache 8.3%");

    const json = JSON.parse(readFileSync(jsonOut, "utf8"));
    expect(json.cloudflarePerf).not.toBeNull();
    expect(json.cloudflarePerf.traffic.summary.pageViews).toBe(5088);
  });
});
