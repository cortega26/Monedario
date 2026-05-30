#!/usr/bin/env node
/**
 * Aggregates the last N weekly GSC query×page exports into a single rolling file
 * so the cannibalization and striking-distance audits run on a more stable signal
 * than one week (which is noisy for a young, low-volume site).
 *
 * Reads:  output/operations/data-signals/gsc/<week>-query-page.json (latest N)
 * Writes: output/operations/data-signals/gsc/aggregate-query-page.json
 *         (same schema as a weekly file, so audits can consume it via --file=)
 *
 * Usage:
 *   node scripts/data-signals/aggregate-gsc-query-page.mjs [--weeks=4] [--dry-run]
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { aggregateQueryPageRows } from "./gsc-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(path.join(__dirname, "..", ".."));
const GSC_DIR = path.join(REPO_ROOT, "output/operations/data-signals/gsc");
const OUTPUT = path.join(GSC_DIR, "aggregate-query-page.json");

function parseArgs(argv) {
  const opts = { weeks: 4, dryRun: false };
  for (const arg of argv) {
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg.startsWith("--weeks=")) opts.weeks = Number(arg.slice(8));
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  let files;
  try {
    files = readdirSync(GSC_DIR)
      .filter(f => /^\d{4}-W\d{2}-query-page\.json$/.test(f))
      .sort();
  } catch {
    files = [];
  }
  if (files.length === 0) {
    console.error(
      "[aggregate-gsc] No weekly <week>-query-page.json files found. Run data-signals:gsc:local first."
    );
    process.exit(2);
  }

  const selected = files.slice(-opts.weeks);
  const docs = selected.map(f => JSON.parse(readFileSync(path.join(GSC_DIR, f), "utf8")));
  const weeks = docs.map(d => d.week).filter(Boolean);
  const froms = docs.map(d => d.window?.from).filter(Boolean).sort();
  const tos = docs.map(d => d.window?.to).filter(Boolean).sort();

  const data = aggregateQueryPageRows(docs);

  const out = {
    fetchedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    schemaVersion: 1,
    source: "gsc-aggregate",
    week: `aggregate-${weeks.length}w`,
    weeks,
    window: { from: froms[0] ?? null, to: tos.at(-1) ?? null },
    data,
  };

  if (opts.dryRun) {
    process.stdout.write(JSON.stringify(out, null, 2) + "\n");
    console.error(`[aggregate-gsc] dry-run — ${data.length} rows from ${weeks.length} week(s)`);
    return;
  }

  mkdirSync(GSC_DIR, { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.error(
    `[aggregate-gsc] wrote ${path.relative(REPO_ROOT, OUTPUT)}  ` +
      `(${data.length} rows · weeks=${weeks.join(",")} · window ${out.window.from}–${out.window.to})`
  );
}

main();
