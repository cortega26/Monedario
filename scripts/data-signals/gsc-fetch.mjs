#!/usr/bin/env node
/**
 * MON-ENV-DATA1b — GSC data-signals fetcher
 *
 * Fetches Search Analytics (queries, pages, query×page, countries, devices)
 * and Sitemaps from the Google Search Console API and writes normalized JSON to
 * output/operations/data-signals/gsc/. The query×page export powers the
 * cannibalization audit (scripts/audit-cannibalization.mjs); the country and
 * device exports feed the strategic-viability measurement baseline.
 *
 * A GAP gate runs before auth: when the target week is the previous complete
 * week (the normal CI case — the workflow always passes an explicit
 * --week=<previous complete> even on schedule), a missing overdue week before
 * it aborts with exit 1 (so a lost week fails the data-signals job instead of
 * passing silently); older targets (real backfills) only warn.
 *
 * Usage:
 *   node scripts/data-signals/gsc-fetch.mjs [--week=YYYY-Www] [--dry-run] [--site=sc-domain:monedario.cl]
 *
 * Required env:
 *   GOOGLE_APPLICATION_CREDENTIALS_JSON  — full service-account JSON as a string
 *
 * Optional env:
 *   GSC_OUTPUT_BASE  — override the output directory (used by tests)
 *
 * Auth: JWT RS256 signed with the service-account private key.
 * No external npm dependencies — uses Node built-ins only.
 */

import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fetchAccessToken } from "./gsc-auth.mjs";
import {
  buildSchemaHeader,
  dateToISOWeek,
  isExportOverdue,
  isoWeekToDateRange,
  missingExportWeeks,
  normalizeCountryRow,
  normalizeDeviceRow,
  normalizePageRow,
  normalizeQueryPageRow,
  normalizeQueryRow,
  normalizeSitemapEntry,
  previousCompleteISOWeek,
} from "./gsc-utils.mjs";

const DEFAULT_SITE = "sc-domain:monedario.cl";
const OUTPUT_BASE = "output/operations/data-signals/gsc";
const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const ROW_LIMIT = 1000;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function printUsage(code = 0) {
  console.log(`
Usage:
  node scripts/data-signals/gsc-fetch.mjs [options]

Options:
  --week=YYYY-Www   ISO week to fetch (default: previous complete week)
  --site=<url>      GSC site URL (default: ${DEFAULT_SITE})
  --dry-run         Print JSON to stdout instead of writing files
  --help, -h        Show this message

Required env:
  GOOGLE_APPLICATION_CREDENTIALS_JSON   Service-account JSON string

Output (without --dry-run):
  ${OUTPUT_BASE}/<week>-queries.json
  ${OUTPUT_BASE}/<week>-pages.json
  ${OUTPUT_BASE}/<week>-query-page.json
  ${OUTPUT_BASE}/<week>-sitemaps.json
  ${OUTPUT_BASE}/<week>-countries.json
  ${OUTPUT_BASE}/<week>-devices.json
`);
  process.exit(code);
}

/**
 * Returns the YYYY-Www labels present in the output dir, derived from the
 * pages/queries export files. Missing or unreadable dir → empty list.
 * @param {string} outputBase
 * @returns {string[]}
 */
function deriveAvailableWeeks(outputBase) {
  let entries;
  try {
    entries = readdirSync(outputBase, { withFileTypes: true });
  } catch {
    return [];
  }
  const weeks = new Set();
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const m = /^(\d{4}-W\d{2})-(?:pages|queries)\.json$/.exec(entry.name);
    if (m) weeks.add(m[1]);
  }
  return [...weeks];
}

function parseArgs(argv) {
  const opts = { week: null, dryRun: false, site: null, help: false };

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
          `[gsc-fetch] Invalid --week format: "${val}". Expected YYYY-Www (e.g. 2026-W17).`
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
    console.error(`[gsc-fetch] Unknown argument: ${arg}`);
    process.exit(1);
  }

  return opts;
}

// ---------------------------------------------------------------------------
// GSC API calls
// ---------------------------------------------------------------------------

async function fetchSearchAnalytics(siteUrl, from, to, dimensions, token) {
  const dims = Array.isArray(dimensions) ? dimensions : [dimensions];
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const rows = [];
  let startRow = 0;

  for (;;) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dimensions: dims,
        endDate: to,
        rowLimit: ROW_LIMIT,
        startDate: from,
        startRow,
      }),
    });
    if (!res.ok) {
      throw new Error(
        `[gsc-fetch] searchAnalytics/${dims.join("+")} failed (${res.status}): ${await res.text()}`
      );
    }
    const data = await res.json();
    const batch = data.rows ?? [];
    rows.push(...batch);
    if (batch.length < ROW_LIMIT) break;
    startRow += ROW_LIMIT;
  }

  return rows;
}

async function fetchSitemaps(siteUrl, token) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(
      `[gsc-fetch] sitemaps failed (${res.status}): ${await res.text()}`
    );
  }
  const data = await res.json();
  return data.sitemap ?? [];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) printUsage(0);

  const previousComplete = previousCompleteISOWeek();
  const week = args.week ?? previousComplete;
  // Strict only when the target IS the previous complete week: the workflow
  // always passes an explicit --week=<previous complete> even in the
  // scheduled case, so "was --week passed" is NOT a reliable backfill signal.
  // Older targets (real backfills) stay permissive.
  const strictGate = week === previousComplete;

  // ---- GAP gate: detect lost weeks before auth ----------------------------
  // Runs before credential validation so a lost export fails the job loudly
  // instead of passing silently, and so the gate is testable without
  // credentials. Strict mode aborts when the week before the target is
  // missing AND overdue; real backfills (older targets) only warn.
  const outputBase = process.env.GSC_OUTPUT_BASE || OUTPUT_BASE;
  const availableWeeks = deriveAvailableWeeks(outputBase);
  const missing = missingExportWeeks(availableWeeks, week);
  console.error(
    `[gsc-fetch] weeks_present=${availableWeeks.length} missing=[${missing.join(",")}]`
  );
  if (missing.length > 0) {
    const { from: weekFrom } = isoWeekToDateRange(week);
    const prevWeek = dateToISOWeek(
      new Date(Date.parse(`${weekFrom}T00:00:00Z`) - 7 * 86_400_000)
    );
    if (missing.includes(prevWeek) && isExportOverdue(prevWeek)) {
      if (strictGate) {
        console.error(
          `[gsc-fetch] GAP: missing exports: ${missing.join(", ")}. ` +
            "Backfill with --week=<week> or a manual data-signals.yml run " +
            "(workflow_dispatch input week), then re-run."
        );
        process.exit(1);
      }
      console.error(
        `[gsc-fetch] GAP (backfill mode): weeks missing: ${missing.join(", ")}`
      );
    } else {
      console.error(
        `[gsc-fetch] WARNING: older missing exports (outside the GAP rule): ${missing.join(", ")}`
      );
    }
  }

  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credsJson) {
    console.error(
      "[gsc-fetch] Missing env var GOOGLE_APPLICATION_CREDENTIALS_JSON"
    );
    process.exit(1);
  }

  let creds;
  try {
    creds = JSON.parse(credsJson);
  } catch {
    console.error(
      "[gsc-fetch] GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON"
    );
    process.exit(1);
  }

  const { from, to } = isoWeekToDateRange(week);
  const site = args.site ?? DEFAULT_SITE;

  console.error(`[gsc-fetch] week=${week}  window=${from}–${to}  site=${site}`);

  const token = await fetchAccessToken(creds, GSC_SCOPE);

  const [
    queryRows,
    pageRows,
    queryPageRows,
    countryRows,
    deviceRows,
    sitemapEntries,
  ] = await Promise.all([
    fetchSearchAnalytics(site, from, to, ["query"], token),
    fetchSearchAnalytics(site, from, to, ["page"], token),
    fetchSearchAnalytics(site, from, to, ["query", "page"], token),
    fetchSearchAnalytics(site, from, to, ["country"], token),
    fetchSearchAnalytics(site, from, to, ["device"], token),
    fetchSitemaps(site, token),
  ]);

  const header = buildSchemaHeader("gsc", week, from, to);

  const queriesDoc = {
    ...header,
    data: queryRows.map(normalizeQueryRow),
  };
  const pagesDoc = {
    ...header,
    data: pageRows.map(normalizePageRow),
  };
  const queryPageDoc = {
    ...header,
    data: queryPageRows.map(normalizeQueryPageRow),
  };
  const countriesDoc = {
    ...header,
    data: countryRows.map(normalizeCountryRow),
  };
  const devicesDoc = {
    ...header,
    data: deviceRows.map(normalizeDeviceRow),
  };
  const sitemapsDoc = {
    ...header,
    data: sitemapEntries.map(normalizeSitemapEntry),
  };

  if (args.dryRun) {
    const sep = (label) => `\n${"─".repeat(60)}\n--- ${label} ---\n${"─".repeat(60)}\n`;
    process.stdout.write(sep(`queries (${queriesDoc.data.length} rows)`));
    process.stdout.write(JSON.stringify(queriesDoc, null, 2) + "\n");
    process.stdout.write(sep(`pages (${pagesDoc.data.length} rows)`));
    process.stdout.write(JSON.stringify(pagesDoc, null, 2) + "\n");
    process.stdout.write(sep(`query-page (${queryPageDoc.data.length} rows)`));
    process.stdout.write(JSON.stringify(queryPageDoc, null, 2) + "\n");
    process.stdout.write(sep(`countries (${countriesDoc.data.length} rows)`));
    process.stdout.write(JSON.stringify(countriesDoc, null, 2) + "\n");
    process.stdout.write(sep(`devices (${devicesDoc.data.length} rows)`));
    process.stdout.write(JSON.stringify(devicesDoc, null, 2) + "\n");
    process.stdout.write(sep(`sitemaps (${sitemapsDoc.data.length} entries)`));
    process.stdout.write(JSON.stringify(sitemapsDoc, null, 2) + "\n");
    console.error("[gsc-fetch] dry-run — no files written");
    return;
  }

  const dir = path.resolve(outputBase);
  mkdirSync(dir, { recursive: true });

  for (const [filename, doc] of [
    [`${week}-queries.json`, queriesDoc],
    [`${week}-pages.json`, pagesDoc],
    [`${week}-query-page.json`, queryPageDoc],
    [`${week}-sitemaps.json`, sitemapsDoc],
    [`${week}-countries.json`, countriesDoc],
    [`${week}-devices.json`, devicesDoc],
  ]) {
    const filePath = path.join(dir, filename);
    writeFileSync(filePath, JSON.stringify(doc, null, 2) + "\n", "utf8");
    console.error(
      `[gsc-fetch] wrote ${filePath}  (${doc.data.length} rows)`
    );
  }

  console.error("[gsc-fetch] done");
}

main().catch((err) => {
  console.error(`[gsc-fetch] fatal: ${err.message}`);
  process.exit(1);
});
