#!/usr/bin/env node
/**
 * audit:striking-distance — highest-ROI SEO growth opportunities from GSC data.
 *
 * Reads a GSC query×page export (output/operations/data-signals/gsc/<week>-query-page.json,
 * produced by scripts/data-signals/gsc-fetch.mjs) and lists (query, page) pairs that
 * already earn impressions but rank just off the top (default positions 8–20). These
 * are pages one small on-page improvement away from the click zone — the growth lever
 * to prioritize once real cannibalization has been ruled out (see audit:cannibalization).
 *
 * Read-only and non-blocking: decision support, never edits content.
 *
 * Usage:
 *   node scripts/audit-striking-distance.mjs [--week=YYYY-Www] [--min-position=8] [--max-position=20] [--min-impressions=10] [--max-clicks=N] [--top=30] [--json]
 *
 * Exit codes: 0 when data is present. 2 when no query×page export is found.
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findStrikingDistance } from "./data-signals/gsc-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(
  process.env.STRIKING_DISTANCE_ROOT || path.resolve(__dirname, "..")
);
const GSC_DIR = path.join(REPO_ROOT, "output/operations/data-signals/gsc");
const REPORT_DIR = path.join(REPO_ROOT, "output/validation/striking-distance");

function parseArgs(argv) {
  const opts = {
    week: null,
    minPosition: 8,
    maxPosition: 20,
    minImpressions: 10,
    maxClicks: Infinity,
    top: 30,
    json: false,
  };
  for (const arg of argv) {
    if (arg === "--json") opts.json = true;
    else if (arg.startsWith("--week=")) opts.week = arg.slice(7);
    else if (arg.startsWith("--min-position=")) opts.minPosition = Number(arg.slice(15));
    else if (arg.startsWith("--max-position=")) opts.maxPosition = Number(arg.slice(15));
    else if (arg.startsWith("--min-impressions=")) opts.minImpressions = Number(arg.slice(18));
    else if (arg.startsWith("--max-clicks=")) opts.maxClicks = Number(arg.slice(13));
    else if (arg.startsWith("--top=")) opts.top = Number(arg.slice(6));
  }
  return opts;
}

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
  files.sort();
  return path.join(GSC_DIR, files.at(-1));
}

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
      `[audit-striking-distance] No query×page GSC export found in ${path.relative(REPO_ROOT, GSC_DIR)}.\n` +
        `  Run: pnpm run data-signals:gsc:local   (needs GOOGLE_APPLICATION_CREDENTIALS_JSON)\n` +
        `  Then re-run this audit.`
    );
    process.exit(2);
  }

  const doc = JSON.parse(readFileSync(dataFile, "utf8"));
  const rows = doc.data ?? [];
  const opportunities = findStrikingDistance(rows, {
    minPosition: opts.minPosition,
    maxPosition: opts.maxPosition,
    minImpressions: opts.minImpressions,
    maxClicks: opts.maxClicks,
  });

  mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR, `${doc.week ?? "latest"}-striking-distance.json`);
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        week: doc.week ?? null,
        window: doc.window ?? null,
        thresholds: {
          minPosition: opts.minPosition,
          maxPosition: opts.maxPosition,
          minImpressions: opts.minImpressions,
          maxClicks: opts.maxClicks === Infinity ? null : opts.maxClicks,
        },
        opportunityCount: opportunities.length,
        opportunities,
      },
      null,
      2
    ) + "\n"
  );

  const week = doc.week ?? path.basename(dataFile);
  console.log(
    `[audit-striking-distance] week=${week} rows=${rows.length} ` +
      `band=${opts.minPosition}-${opts.maxPosition} min_impressions=${opts.minImpressions} ` +
      `opportunities=${opportunities.length}`
  );
  console.log(`[audit-striking-distance] report=${path.relative(REPO_ROOT, reportPath)}`);

  if (opts.json) {
    process.stdout.write(JSON.stringify(opportunities, null, 2) + "\n");
  }

  if (opportunities.length === 0) {
    console.log(
      "[audit-striking-distance] No (query, page) pairs in the striking band. Try a wider --max-position or lower --min-impressions."
    );
    return;
  }

  console.log(`\nTop ${Math.min(opts.top, opportunities.length)} opportunities (by score = impressions × closeness to page 1):`);
  for (const o of opportunities.slice(0, opts.top)) {
    console.log(
      `  score ${String(o.score).padStart(7)} · ${String(o.impressions).padStart(5)} impr · ${String(o.clicks).padStart(3)} clk · pos ${o.position.toFixed(1).padStart(5)}  ${toPath(o.page)}\n` +
        `             query: "${o.query}"`
    );
  }
}

main();
