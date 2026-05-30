#!/usr/bin/env node
/**
 * audit:cannibalization — real SERP cannibalization audit from GSC data.
 *
 * Reads a GSC query×page export (output/operations/data-signals/gsc/<week>-query-page.json,
 * produced by scripts/data-signals/gsc-fetch.mjs) and reports queries for which two or
 * more of the site's own pages accumulate impressions in the same window. Unlike
 * `audit:topic-overlap` (a title/slug heuristic), this is grounded in how Google
 * actually surfaces the corpus, so it tells us which pages truly compete.
 *
 * This audit is read-only and non-blocking: it informs editorial consolidate-vs-
 * differentiate decisions. It never edits content.
 *
 * Usage:
 *   node scripts/audit-cannibalization.mjs [--week=YYYY-Www] [--min-impressions=5] [--min-urls=2] [--top=25] [--json]
 *
 * Exit codes: 0 always when data is present (non-blocking). 2 when no data file is
 * found (so callers can distinguish "clean" from "not measured yet").
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findCannibalizationGroups } from "./data-signals/gsc-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(
  process.env.CANNIBALIZATION_ROOT || path.resolve(__dirname, "..")
);
const GSC_DIR = path.join(REPO_ROOT, "output/operations/data-signals/gsc");
const REPORT_DIR = path.join(REPO_ROOT, "output/validation/cannibalization");

function parseArgs(argv) {
  const opts = { week: null, minImpressions: 5, minUrls: 2, top: 25, json: false };
  for (const arg of argv) {
    if (arg === "--json") opts.json = true;
    else if (arg.startsWith("--week=")) opts.week = arg.slice(7);
    else if (arg.startsWith("--min-impressions=")) opts.minImpressions = Number(arg.slice(18));
    else if (arg.startsWith("--min-urls=")) opts.minUrls = Number(arg.slice(11));
    else if (arg.startsWith("--top=")) opts.top = Number(arg.slice(6));
  }
  return opts;
}

/** Picks the query-page file for the requested week, or the latest available. */
function resolveDataFile(week) {
  let files;
  try {
    files = readdirSync(GSC_DIR).filter(f => /-query-page\.json$/.test(f));
  } catch {
    return null;
  }
  if (files.length === 0) return null;
  if (week) {
    const match = files.find(f => f.startsWith(`${week}-`));
    return match ? path.join(GSC_DIR, match) : null;
  }
  files.sort(); // YYYY-Www sorts chronologically
  return path.join(GSC_DIR, files.at(-1));
}

/** Strips the origin so the report shows readable paths. */
function toPath(pageUrl) {
  try {
    return new URL(pageUrl).pathname;
  } catch {
    return pageUrl;
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const dataFile = resolveDataFile(opts.week);

  if (!dataFile) {
    console.error(
      `[audit-cannibalization] No query×page GSC export found in ${path.relative(REPO_ROOT, GSC_DIR)}.\n` +
        `  Run: node scripts/data-signals/gsc-fetch.mjs   (needs GOOGLE_APPLICATION_CREDENTIALS_JSON)\n` +
        `  Then re-run this audit.`
    );
    process.exit(2);
  }

  const doc = JSON.parse(readFileSync(dataFile, "utf8"));
  const rows = doc.data ?? [];
  const groups = findCannibalizationGroups(rows, {
    minImpressions: opts.minImpressions,
    minUrls: opts.minUrls,
  });

  mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR, `${doc.week ?? "latest"}-cannibalization.json`);
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        week: doc.week ?? null,
        window: doc.window ?? null,
        thresholds: { minImpressions: opts.minImpressions, minUrls: opts.minUrls },
        groupCount: groups.length,
        groups,
      },
      null,
      2
    ) + "\n"
  );

  if (opts.json) {
    process.stdout.write(JSON.stringify(groups, null, 2) + "\n");
  }

  const week = doc.week ?? path.basename(dataFile);
  console.log(
    `[audit-cannibalization] week=${week} rows=${rows.length} ` +
      `min_impressions=${opts.minImpressions} min_urls=${opts.minUrls} ` +
      `cannibalized_queries=${groups.length}`
  );
  console.log(`[audit-cannibalization] report=${path.relative(REPO_ROOT, reportPath)}`);

  if (groups.length === 0) {
    console.log("[audit-cannibalization] OK. No queries with multiple competing own URLs.");
    return;
  }

  console.log(`\nTop ${Math.min(opts.top, groups.length)} cannibalized queries (by impressions):`);
  for (const g of groups.slice(0, opts.top)) {
    console.log(
      `\n  "${g.query}"  — ${g.urlCount} URLs · ${g.totalImpressions} impr · ${g.totalClicks} clicks`
    );
    for (const u of g.urls) {
      console.log(
        `    ${String(u.impressions).padStart(5)} impr · ${String(u.clicks).padStart(3)} clk · pos ${u.position ?? "—"}  ${toPath(u.page)}`
      );
    }
  }
  // Non-blocking: this is decision support, not a gate.
}

main();
