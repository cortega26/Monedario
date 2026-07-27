import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT_PATH = path.resolve("scripts/audit-ctr-opportunities.mjs");
const tempRoots: string[] = [];

function createTempRoot() {
  const root = mkdtempSync(path.join(tmpdir(), "tpi-ctr-audit-"));
  tempRoots.push(root);
  return root;
}

function runScript(args: string[]) {
  return spawnSync("node", [SCRIPT_PATH, ...args], { encoding: "utf8" });
}

function writeWeek(
  gscDir: string,
  week: string,
  window: { from: string; to: string },
  data: object[],
) {
  writeFileSync(
    path.join(gscDir, `${week}-pages.json`),
    JSON.stringify({
      fetchedAt: "2026-07-16T00:00:00Z",
      schemaVersion: 1,
      source: "gsc",
      week,
      window,
      data,
    }),
    "utf8",
  );
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("audit-ctr-opportunities script", () => {
  it("defaults to the latest four complete weeks and persists bounded provenance", () => {
    const root = createTempRoot();
    const gscDir = path.join(root, "gsc");
    mkdirSync(gscDir, { recursive: true });
    const oldPage = {
      clicks: 0,
      ctr: 0,
      impressions: 200,
      page: "https://monedario.cl/posts/old-only/",
      position: 8,
    };
    const currentPage = {
      clicks: 0,
      ctr: 0,
      impressions: 50,
      page: "https://monedario.cl/posts/current-value/",
      position: 8,
    };
    writeWeek(gscDir, "2026-W01", { from: "2025-12-29", to: "2026-01-04" }, [oldPage]);
    writeWeek(gscDir, "2026-W02", { from: "2026-01-05", to: "2026-01-11" }, [currentPage]);
    writeWeek(gscDir, "2026-W03", { from: "2026-01-12", to: "2026-01-18" }, [currentPage]);
    writeWeek(gscDir, "2026-W04", { from: "2026-01-19", to: "2026-01-25" }, [currentPage]);
    writeWeek(gscDir, "2026-W05", { from: "2026-01-26", to: "2026-02-01" }, [currentPage]);

    const markdownOut = path.join(root, "default.md");
    const jsonOut = path.join(root, "default.json");
    const result = runScript([
      "--gsc-dir", gscDir,
      "--out", markdownOut,
      "--json-out", jsonOut,
    ]);

    expect(result.status).toBe(0);
    const report = JSON.parse(readFileSync(jsonOut, "utf8"));
    expect(report.window).toEqual({
      mode: "rolling-complete-weeks",
      requestedWeeks: 4,
      selectedWeeks: ["2026-W02", "2026-W03", "2026-W04", "2026-W05"],
    });
    expect(report.candidates.map((candidate: { page: string }) => candidate.page)).toEqual([
      "/posts/current-value/",
    ]);
    expect(report.candidates[0]).toMatchObject({ clicks: 0, weeks: 4 });
    expect(report.candidates[0]).not.toHaveProperty("missedClicks");
    expect(report.heuristic).toEqual({
      kind: "opportunity-screening",
      ctrThreshold: 0.035,
      clickProjection: null,
    });

    const markdown = readFileSync(markdownOut, "utf8");
    expect(markdown).toContain(
      "2026-W02, 2026-W03, 2026-W04, 2026-W05 (4 semanas)",
    );
    expect(markdown).toContain("heurístico de oportunidad");
    expect(markdown).toContain("no se proyectan clics");
    expect(markdown).not.toMatch(/clics perdidos|missed clicks|CTR esperado|expected CTR/i);
  });

  it("supports explicit rolling length and all-history discovery", () => {
    const root = createTempRoot();
    const gscDir = path.join(root, "gsc");
    mkdirSync(gscDir, { recursive: true });
    const weeks = [
      ["2026-W01", "2025-12-29", "2026-01-04"],
      ["2026-W02", "2026-01-05", "2026-01-11"],
      ["2026-W03", "2026-01-12", "2026-01-18"],
      ["2026-W04", "2026-01-19", "2026-01-25"],
      ["2026-W05", "2026-01-26", "2026-02-01"],
    ];
    for (const [week, from, to] of weeks) {
      writeWeek(gscDir, week, { from, to }, [
        {
          clicks: 1,
          ctr: 0.01,
          impressions: 100,
          page: "https://monedario.cl/posts/shared/",
          position: 8,
        },
      ]);
    }

    const rollingJson = path.join(root, "rolling.json");
    const rollingResult = runScript([
      "--gsc-dir", gscDir,
      "--weeks", "2",
      "--out", path.join(root, "rolling.md"),
      "--json-out", rollingJson,
    ]);
    expect(rollingResult.status).toBe(0);
    expect(JSON.parse(readFileSync(rollingJson, "utf8")).window.selectedWeeks).toEqual([
      "2026-W04",
      "2026-W05",
    ]);

    const allJson = path.join(root, "all.json");
    const allMarkdown = path.join(root, "all.md");
    const allResult = runScript([
      "--gsc-dir", gscDir,
      "--all",
      "--out", allMarkdown,
      "--json-out", allJson,
    ]);
    expect(allResult.status).toBe(0);
    const allReport = JSON.parse(readFileSync(allJson, "utf8"));
    expect(allReport.window).toEqual({
      mode: "all-history-discovery",
      requestedWeeks: null,
      selectedWeeks: weeks.map(([week]) => week),
    });
    expect(readFileSync(allMarkdown, "utf8")).toContain("all-history-discovery");
  });
});
