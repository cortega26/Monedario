#!/usr/bin/env node
/**
 * GSC URL Inspection fetcher — indexation coverage signal.
 *
 * Reads the live sitemap, runs the Search Console URL Inspection API over each
 * URL, and writes a normalized per-URL coverage snapshot + an indexation summary
 * to output/operations/data-signals/gsc/<week>-url-inspection.json.
 *
 * This is the standing signal for "how much of the site is actually indexed",
 * which the sitemap-contents "indexed" count does NOT reflect (that field is a
 * known GSC reporting artifact). The URL Inspection API returns the real
 * per-URL coverageState (e.g. "Submitted and indexed" vs
 * "Crawled - currently not indexed").
 *
 * Usage:
 *   node scripts/data-signals/gsc-inspect.mjs [--week=YYYY-Www] [--dry-run]
 *                                             [--site=sc-domain:monedario.cl]
 *                                             [--origin=https://monedario.cl]
 *                                             [--max=250]
 *
 * Required env:
 *   GOOGLE_APPLICATION_CREDENTIALS_JSON  — full service-account JSON as a string
 *
 * Auth: JWT RS256 (shared ./gsc-auth.mjs). Scope: webmasters.readonly.
 * No external npm dependencies — uses Node built-ins only.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fetchAccessToken } from "./gsc-auth.mjs";
import {
  buildSchemaHeader,
  extractSitemapLocs,
  isoWeekToDateRange,
  normalizeUrlInspectionRow,
  previousCompleteISOWeek,
  summarizeIndexation,
} from "./gsc-utils.mjs";

const DEFAULT_SITE = "sc-domain:monedario.cl";
const DEFAULT_ORIGIN = "https://monedario.cl";
const OUTPUT_BASE = "output/operations/data-signals/gsc";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const INSPECT_URL =
  "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";
const DEFAULT_MAX = 250; // safety cap; the sitemap is ~184 URLs today
const PACE_MS = 400; // delay between inspection calls (QPS is low)
const MAX_RETRIES = 4; // per-URL retries on 429/5xx with exponential backoff

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function printUsage(code = 0) {
  console.log(`
Usage:
  node scripts/data-signals/gsc-inspect.mjs [options]

Options:
  --week=YYYY-Www   ISO week label for the snapshot (default: previous complete week)
  --site=<url>      GSC property (default: ${DEFAULT_SITE})
  --origin=<url>    Site origin for the sitemap (default: ${DEFAULT_ORIGIN})
  --max=<n>         Max URLs to inspect (default: ${DEFAULT_MAX})
  --dry-run         Print JSON to stdout instead of writing files
  --help, -h        Show this message

Required env:
  GOOGLE_APPLICATION_CREDENTIALS_JSON   Service-account JSON string

Output (without --dry-run):
  ${OUTPUT_BASE}/<week>-url-inspection.json
`);
  process.exit(code);
}

function parseArgs(argv) {
  const opts = {
    week: null,
    dryRun: false,
    site: null,
    origin: null,
    max: DEFAULT_MAX,
    help: false,
  };

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      opts.help = true;
      continue;
    }
    if (arg === "--dry-run") {
      opts.dryRun = true;
      continue;
    }
    if (arg.startsWith("--week=")) {
      const val = arg.slice("--week=".length);
      if (!/^\d{4}-W\d{2}$/.test(val)) {
        console.error(
          `[gsc-inspect] Invalid --week format: "${val}". Expected YYYY-Www (e.g. 2026-W17).`
        );
        process.exit(1);
      }
      opts.week = val;
      continue;
    }
    if (arg.startsWith("--site=")) {
      opts.site = arg.slice("--site=".length);
      continue;
    }
    if (arg.startsWith("--origin=")) {
      opts.origin = arg.slice("--origin=".length);
      continue;
    }
    if (arg.startsWith("--max=")) {
      const val = Number(arg.slice("--max=".length));
      if (!Number.isInteger(val) || val <= 0) {
        console.error(`[gsc-inspect] Invalid --max: "${arg.slice("--max=".length)}". Expected a positive integer.`);
        process.exit(1);
      }
      opts.max = val;
      continue;
    }
    console.error(`[gsc-inspect] Unknown argument: ${arg}`);
    process.exit(1);
  }

  return opts;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Sitemap → URL list
// ---------------------------------------------------------------------------

/**
 * Fetches the sitemap index and every child sitemap, returning the full list of
 * page URLs under the given origin (de-duplicated, capped at `max`).
 */
async function collectSitemapUrls(origin, max) {
  const indexUrl = `${origin.replace(/\/$/, "")}/sitemap-index.xml`;
  const res = await fetch(indexUrl);
  if (!res.ok) {
    throw new Error(`sitemap-index fetch failed (${res.status}) at ${indexUrl}`);
  }
  const indexXml = await res.text();
  const locs = extractSitemapLocs(indexXml);
  const childSitemaps = locs.filter((u) => /\.xml($|\?)/.test(u));

  const pageUrls = new Set();
  // If the index actually listed page URLs (single-sitemap sites), keep them too.
  for (const u of locs) {
    if (!/\.xml($|\?)/.test(u) && u.startsWith(origin)) pageUrls.add(u);
  }
  for (const sm of childSitemaps) {
    const r = await fetch(sm);
    if (!r.ok) {
      console.error(`[gsc-inspect] WARN child sitemap ${sm} failed (${r.status}); skipping`);
      continue;
    }
    for (const u of extractSitemapLocs(await r.text())) {
      if (u.startsWith(origin)) pageUrls.add(u);
    }
  }

  return [...pageUrls].sort().slice(0, max);
}

// ---------------------------------------------------------------------------
// URL Inspection
// ---------------------------------------------------------------------------

/**
 * Inspects a single URL. Retries on 429/5xx with exponential backoff. Returns
 * the raw indexStatusResult, or `{ __error }` when it ultimately fails.
 */
async function inspectUrl(url, site, token) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(INSPECT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inspectionUrl: url, siteUrl: site }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.inspectionResult?.indexStatusResult ?? {};
    }
    // Retry throttling / transient server errors; fail fast on 4xx auth/quota-perm.
    if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
      const backoff = PACE_MS * 2 ** (attempt + 1);
      console.error(`[gsc-inspect] ${res.status} on ${url}; retry in ${backoff}ms`);
      await sleep(backoff);
      continue;
    }
    return { __error: `${res.status}: ${(await res.text()).slice(0, 200)}` };
  }
  return { __error: "exhausted retries" };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) printUsage(0);

  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credsJson) {
    console.error("[gsc-inspect] Missing env var GOOGLE_APPLICATION_CREDENTIALS_JSON");
    process.exit(1);
  }
  let creds;
  try {
    creds = JSON.parse(credsJson);
  } catch {
    console.error("[gsc-inspect] GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON");
    process.exit(1);
  }

  const week = args.week ?? previousCompleteISOWeek();
  const site = args.site ?? DEFAULT_SITE;
  const origin = args.origin ?? DEFAULT_ORIGIN;

  console.error(`[gsc-inspect] week=${week}  site=${site}  origin=${origin}`);

  const urls = await collectSitemapUrls(origin, args.max);
  console.error(`[gsc-inspect] inspecting ${urls.length} URLs (paced ${PACE_MS}ms)`);

  const token = await fetchAccessToken(creds, SCOPE);

  const rows = [];
  let errors = 0;
  let done = 0;
  for (const url of urls) {
    const result = await inspectUrl(url, site, token);
    if (result.__error) errors++;
    rows.push(normalizeUrlInspectionRow(url, result.__error ? {} : result));
    if (++done % 25 === 0) console.error(`[gsc-inspect]   ...${done}/${urls.length}`);
    await sleep(PACE_MS);
  }

  rows.sort((a, b) => a.url.localeCompare(b.url));
  const summary = summarizeIndexation(rows);
  const { from, to } = isoWeekToDateRange(week);
  const header = buildSchemaHeader("gsc-url-inspection", week, from, to);
  const doc = { ...header, summary, errors, data: rows };

  console.error(
    `[gsc-inspect] indexed=${summary.indexed}/${summary.total} (${summary.indexedPct}%)  ` +
      `notIndexed=${summary.notIndexed}  other=${summary.other}  errors=${errors}`
  );

  if (args.dryRun) {
    process.stdout.write(JSON.stringify(doc, null, 2) + "\n");
    console.error("[gsc-inspect] dry-run — no files written");
    return;
  }

  const dir = path.resolve(OUTPUT_BASE);
  mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${week}-url-inspection.json`);
  writeFileSync(filePath, JSON.stringify(doc, null, 2) + "\n", "utf8");
  console.error(`[gsc-inspect] wrote ${filePath}  (${rows.length} rows)`);
  console.error("[gsc-inspect] done");
}

main().catch((err) => {
  console.error(`[gsc-inspect] fatal: ${err.message}`);
  process.exit(1);
});
