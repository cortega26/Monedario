#!/usr/bin/env node
/**
 * MON-ENV-DATA1b — GSC data-signals fetcher
 *
 * Fetches Search Analytics (queries, pages, query×page) and Sitemaps from the
 * Google Search Console API and writes normalized JSON to
 * output/operations/data-signals/gsc/. The query×page export powers the
 * cannibalization audit (scripts/audit-cannibalization.mjs).
 *
 * Usage:
 *   node scripts/data-signals/gsc-fetch.mjs [--week=YYYY-Www] [--dry-run] [--site=sc-domain:monedario.cl]
 *
 * Required env:
 *   GOOGLE_APPLICATION_CREDENTIALS_JSON  — full service-account JSON as a string
 *
 * Auth: JWT RS256 signed with the service-account private key.
 * No external npm dependencies — uses Node built-ins only.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fetchAccessToken } from "./gsc-auth.mjs";
import {
  buildSchemaHeader,
  isoWeekToDateRange,
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
`);
  process.exit(code);
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

  const week = args.week ?? previousCompleteISOWeek();
  const { from, to } = isoWeekToDateRange(week);
  const site = args.site ?? DEFAULT_SITE;

  console.error(`[gsc-fetch] week=${week}  window=${from}–${to}  site=${site}`);

  const token = await fetchAccessToken(creds, GSC_SCOPE);

  const [queryRows, pageRows, queryPageRows, sitemapEntries] = await Promise.all([
    fetchSearchAnalytics(site, from, to, ["query"], token),
    fetchSearchAnalytics(site, from, to, ["page"], token),
    fetchSearchAnalytics(site, from, to, ["query", "page"], token),
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
    process.stdout.write(sep(`sitemaps (${sitemapsDoc.data.length} entries)`));
    process.stdout.write(JSON.stringify(sitemapsDoc, null, 2) + "\n");
    console.error("[gsc-fetch] dry-run — no files written");
    return;
  }

  const dir = path.resolve(OUTPUT_BASE);
  mkdirSync(dir, { recursive: true });

  for (const [filename, doc] of [
    [`${week}-queries.json`, queriesDoc],
    [`${week}-pages.json`, pagesDoc],
    [`${week}-query-page.json`, queryPageDoc],
    [`${week}-sitemaps.json`, sitemapsDoc],
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
