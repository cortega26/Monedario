#!/usr/bin/env node
/**
 * MON-ENV-DATA2d — LCP p75 hard-gate
 *
 * Reads the Cloudflare RUM snapshot for a given week and fails (exit 1) if
 * any "owner route" has LCP p75 > threshold (default 4000 ms).
 *
 * Owner routes are the primary calculator pages. Add new routes here when a
 * calculator is added to the site (see: src/pages/calculadoras/).
 *
 * Exit codes:
 *   0 — no violations (or RUM file absent / no data for owner routes)
 *   1 — one or more owner routes exceed the LCP threshold
 *
 * Usage:
 *   node scripts/data-signals/lcp-gate.mjs --week=YYYY-Www [--threshold=MS]
 *
 * Note: only routes with count >= MIN_SAMPLES are checked. A p75 derived
 * from fewer samples is statistically unreliable and would cause false alerts.
 *
 * TODO(2026): consider adding a percentile floor argument and wiring the
 * sample threshold to a named constant shared with the scorecard script once
 * Cloudflare RUM has accumulated several weeks of data.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUTPUT_BASE = "output/operations/data-signals/cloudflare";

/** Minimum RUM event count for a route before its p75 is considered reliable. */
export const MIN_SAMPLES = 20;

/** Default LCP threshold in milliseconds (Chrome "needs improvement" boundary). */
export const DEFAULT_THRESHOLD_MS = 4000;

/**
 * Calculator pages whose LCP is a hard gate. Cloudflare RUM paths include
 * trailing slashes; OWNER_ROUTES must match exactly (after normalization).
 * Update when new calculators are wired with <NextBestStep>.
 */
export const OWNER_ROUTES = [
  "/calculadoras/sueldo-liquido/",
  "/calculadoras/apv/",
  "/calculadoras/impuesto-segunda-categoria/",
  "/calculadoras/comisiones-afp/",
  "/calculadoras/finiquito-indemnizacion/",
  "/calculadoras/operacion-renta/",
];

/** Normalize a path to have a leading and trailing slash. */
function normalizePath(p) {
  const withLeading = p.startsWith("/") ? p : `/${p}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

/**
 * Pure function — filters RUM rows to violations only.
 *
 * @param {Array<{path: string, lcpP75Ms: number|null, count: number}>} rumData
 * @param {string[]} ownerRoutes  — normalized paths (with trailing slash)
 * @param {number}   thresholdMs
 * @param {number}   minSamples
 * @returns {Array<{path: string, lcpP75Ms: number, count: number}>}
 */
export function checkLcpViolations(
  rumData,
  ownerRoutes = OWNER_ROUTES,
  thresholdMs = DEFAULT_THRESHOLD_MS,
  minSamples = MIN_SAMPLES
) {
  const normalizedOwners = new Set(ownerRoutes.map(normalizePath));
  return rumData.filter(
    (row) =>
      normalizedOwners.has(normalizePath(row.path)) &&
      row.count >= minSamples &&
      row.lcpP75Ms !== null &&
      row.lcpP75Ms > thresholdMs
  );
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function printUsage(code = 0) {
  process.stdout.write(`
Usage:
  node scripts/data-signals/lcp-gate.mjs --week=YYYY-Www [options]

Options:
  --week=YYYY-Www       ISO week whose rum.json to read (required)
  --threshold=MS        LCP p75 threshold in ms (default: ${DEFAULT_THRESHOLD_MS})
  --help, -h            Show this message

Exit codes:
  0  No violations, or RUM file absent / insufficient data
  1  One or more owner routes exceed the LCP threshold

`);
  process.exit(code);
}

function parseArgs(argv) {
  const opts = { week: null, threshold: DEFAULT_THRESHOLD_MS, help: false };
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") { opts.help = true; continue; }
    if (arg.startsWith("--week=")) {
      const val = arg.slice("--week=".length);
      if (!/^\d{4}-W\d{2}$/.test(val)) {
        console.error(`[lcp-gate] Invalid --week format: "${val}". Expected YYYY-Www.`);
        process.exit(1);
      }
      opts.week = val;
      continue;
    }
    if (arg.startsWith("--threshold=")) {
      const val = parseInt(arg.slice("--threshold=".length), 10);
      if (isNaN(val) || val <= 0) {
        console.error(`[lcp-gate] Invalid --threshold value. Must be a positive integer.`);
        process.exit(1);
      }
      opts.threshold = val;
      continue;
    }
    console.error(`[lcp-gate] Unknown argument: ${arg}`);
    process.exit(1);
  }
  return opts;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) printUsage(0);

  if (!args.week) {
    console.error("[lcp-gate] --week is required. Example: --week=2026-W17");
    process.exit(1);
  }

  const rumFile = path.resolve(`${OUTPUT_BASE}/${args.week}-rum.json`);

  if (!existsSync(rumFile)) {
    console.warn(`[lcp-gate] RUM file not found: ${rumFile} — skipping gate (exit 0).`);
    process.exit(0);
  }

  let rumDoc;
  try {
    rumDoc = JSON.parse(readFileSync(rumFile, "utf8"));
  } catch (err) {
    console.error(`[lcp-gate] Failed to parse ${rumFile}: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(rumDoc?.data)) {
    console.error(`[lcp-gate] Unexpected RUM schema — "data" array missing. Check schemaVersion.`);
    process.exit(1);
  }

  const violations = checkLcpViolations(rumDoc.data, OWNER_ROUTES, args.threshold, MIN_SAMPLES);

  if (violations.length === 0) {
    console.log(`[lcp-gate] ✅  All owner routes within LCP threshold (${args.threshold} ms).`);
    process.exit(0);
  }

  console.error(
    `[lcp-gate] ❌  LCP threshold exceeded on ${violations.length} owner route(s) (threshold: ${args.threshold} ms):`
  );
  for (const v of violations) {
    console.error(`  ${v.path}  lcpP75Ms=${v.lcpP75Ms}  count=${v.count}`);
  }
  process.exit(1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`[lcp-gate] fatal: ${err.message}`);
    process.exit(1);
  });
}
