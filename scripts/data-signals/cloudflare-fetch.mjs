#!/usr/bin/env node
/**
 * MON-ENV-DATA2b — Cloudflare data-signals fetcher
 *
 * Fetches two datasets from Cloudflare GraphQL Analytics API:
 *
 *   {week}-traffic.json  — daily zone traffic: requests, pageviews, cache ratio, bandwidth
 *   {week}-rum.json      — RUM Web Vitals per route: LCP p75, CLS p75, INP p75 (ms / score)
 *
 * Auth: single token with two permissions:
 *   - Account Analytics:Read  (for rumWebVitalsEventsAdaptiveGroups)
 *   - Zone   Analytics:Read  (for httpRequests1dGroups)
 *
 * Note on units: Cloudflare returns LCP/INP in microseconds (µs).
 * We divide by 1000 to store as milliseconds. CLS is a dimensionless score.
 * Sentinel value -1 means no data for that metric on that route.
 *
 * Usage:
 *   node scripts/data-signals/cloudflare-fetch.mjs [--week=YYYY-Www] [--dry-run]
 *
 * Required env:
 *   CLOUDFLARE_ANALYTICS_TOKEN   Token with Account+Zone Analytics:Read
 *   CLOUDFLARE_ZONE_ID           Zone ID for monedario.cl
 *   CLOUDFLARE_ACCOUNT_ID        Account ID
 *
 * Optional env:
 *   CLOUDFLARE_SITE_HOST         Hostname to scope RUM to (default: monedario.cl).
 *                                RUM is account-scoped (multi-site), unlike
 *                                traffic which is zone-scoped — see GROWTH-005.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildSchemaHeader,
  isoWeekToDateRange,
  previousCompleteISOWeek,
  sanitizeRumRoutes,
} from "./gsc-utils.mjs";

const OUTPUT_BASE        = "output/operations/data-signals/cloudflare";
const CF_GRAPHQL         = "https://api.cloudflare.com/client/v4/graphql";

/**
 * Hostname to scope RUM Web Vitals queries to (GROWTH-005). Unlike
 * `fetchDailyTraffic` (already zone-scoped), `rumWebVitalsEventsAdaptiveGroups`
 * only exists at the account level in Cloudflare's GraphQL Analytics schema —
 * the account hosts several sites besides monedario.cl, so without a hostname
 * filter, RUM for routes shared across sites (e.g. `/`) silently mixes
 * cross-hostname traffic. monedario.cl has no `www` variant to cover (verified:
 * zero repo references to www.monedario.cl). Override via CLOUDFLARE_SITE_HOST
 * (e.g. for testing against a different site).
 */
const SITE_HOST = process.env.CLOUDFLARE_SITE_HOST ?? "monedario.cl";

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function printUsage(code = 0) {
  console.log(`
Usage:
  node scripts/data-signals/cloudflare-fetch.mjs [options]

Options:
  --week=YYYY-Www   ISO week to fetch (default: previous complete week)
  --dry-run         Print JSON to stdout instead of writing files
  --help, -h        Show this message

Required env:
  CLOUDFLARE_ANALYTICS_TOKEN   Token with Account+Zone Analytics:Read
  CLOUDFLARE_ZONE_ID           Zone ID for monedario.cl
  CLOUDFLARE_ACCOUNT_ID        Account ID

Output (without --dry-run):
  ${OUTPUT_BASE}/<week>-traffic.json   Daily zone traffic + cache ratio
  ${OUTPUT_BASE}/<week>-rum.json       RUM Web Vitals per route (LCP/CLS/INP p75)
`);
  process.exit(code);
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var ${name}`);
  }
  return value;
}

function parseArgs(argv) {
  const opts = { week: null, dryRun: false, help: false };
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") { opts.help = true; continue; }
    if (arg === "--dry-run") { opts.dryRun = true; continue; }
    if (arg.startsWith("--week=")) {
      const val = arg.slice("--week=".length);
      if (!/^\d{4}-W\d{2}$/.test(val)) {
        console.error(`[cloudflare-fetch] Invalid --week format: "${val}". Expected YYYY-Www.`);
        process.exit(1);
      }
      opts.week = val;
      continue;
    }
    console.error(`[cloudflare-fetch] Unknown argument: ${arg}`);
    process.exit(1);
  }
  return opts;
}

// ---------------------------------------------------------------------------
// GraphQL helpers
// ---------------------------------------------------------------------------

async function gql(token, query, variables = {}) {
  const res = await fetch(CF_GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`[cloudflare-fetch] HTTP ${res.status}: ${await res.text()}`);
  }
  const body = await res.json();
  if (body.errors?.length) {
    throw new Error(`[cloudflare-fetch] GraphQL: ${body.errors[0].message}`);
  }
  return body.data;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

async function fetchDailyTraffic(token, zoneTag, from, to) {
  const data = await gql(token, `
    query Traffic($zoneTag: string!, $from: Date!, $to: Date!) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          httpRequests1dGroups(
            limit: 14
            orderBy: [date_ASC]
            filter: { date_geq: $from, date_leq: $to }
          ) {
            dimensions { date }
            sum { bytes cachedBytes cachedRequests pageViews requests }
          }
        }
      }
    }
  `, { zoneTag, from, to });
  return data.viewer.zones[0]?.httpRequests1dGroups ?? [];
}

/**
 * Builds the GraphQL query + variables for RUM Web Vitals, scoped by
 * hostname (GROWTH-005 fix). Exported so the query shape is testable without
 * a network call — `rumWebVitalsEventsAdaptiveGroups` is account-scoped, so
 * without `requestHost` in the filter, RUM for routes shared across the
 * account's sites (e.g. `/`) mixes cross-hostname traffic silently.
 */
export function buildRumQuery(accountTag, host, fromDt, toDt) {
  return {
    query: `
    query RUM($accountTag: string!, $host: string!, $from: DateTime!, $to: DateTime!) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          rumWebVitalsEventsAdaptiveGroups(
            limit: 100
            orderBy: [count_DESC]
            filter: { datetime_geq: $from, datetime_leq: $to, requestHost: $host }
          ) {
            count
            dimensions { requestPath }
            quantiles {
              cumulativeLayoutShiftP75
              interactionToNextPaintP75
              largestContentfulPaintP75
            }
          }
        }
      }
    }
  `,
    variables: { accountTag, host, from: fromDt, to: toDt },
  };
}

export async function fetchRumWebVitals(token, accountTag, host, fromDt, toDt) {
  const { query, variables } = buildRumQuery(accountTag, host, fromDt, toDt);
  const data = await gql(token, query, variables);
  return data.viewer.accounts[0]?.rumWebVitalsEventsAdaptiveGroups ?? [];
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

/** Cloudflare stores LCP/INP in microseconds — convert to ms. -1 = no data. */
function usToMs(val) {
  return val < 0 ? null : Math.round(val / 1000);
}

function normalizeDayRow(row) {
  const s = row.sum;
  const cacheRatioPct =
    s.requests > 0 ? Math.round((s.cachedRequests / s.requests) * 1000) / 10 : 0;
  return {
    bandwidthMB:    Math.round((s.bytes / 1024 / 1024) * 100) / 100,
    cacheRatioPct,
    cachedRequests: s.cachedRequests,
    date:           row.dimensions.date,
    pageViews:      s.pageViews,
    requests:       s.requests,
  };
}

function buildTrafficSummary(rows) {
  const t = rows.reduce(
    (acc, r) => ({
      bandwidthMB:    acc.bandwidthMB + r.bandwidthMB,
      cachedRequests: acc.cachedRequests + r.cachedRequests,
      pageViews:      acc.pageViews + r.pageViews,
      requests:       acc.requests + r.requests,
    }),
    { bandwidthMB: 0, cachedRequests: 0, pageViews: 0, requests: 0 }
  );
  return {
    bandwidthMB:   Math.round(t.bandwidthMB * 100) / 100,
    cacheRatioPct: t.requests > 0 ? Math.round((t.cachedRequests / t.requests) * 1000) / 10 : 0,
    pageViews:     t.pageViews,
    requests:      t.requests,
  };
}

function normalizeRumRow(row) {
  const q = row.quantiles;
  const clsRaw = q.cumulativeLayoutShiftP75;
  return {
    clsP75:  clsRaw < 0 ? null : Math.round(clsRaw * 1000) / 1000,
    count:   row.count,
    inpP75Ms: usToMs(q.interactionToNextPaintP75),
    lcpP75Ms: usToMs(q.largestContentfulPaintP75),
    path:    row.dimensions.requestPath,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) printUsage(0);

  const token = getRequiredEnv("CLOUDFLARE_ANALYTICS_TOKEN");
  const zoneId = getRequiredEnv("CLOUDFLARE_ZONE_ID");
  const accountId = getRequiredEnv("CLOUDFLARE_ACCOUNT_ID");
  const week      = args.week ?? previousCompleteISOWeek();
  const { from, to } = isoWeekToDateRange(week);

  console.error(`[cloudflare-fetch] week=${week}  window=${from}–${to}`);

  const [rawTraffic, rawRum] = await Promise.all([
    fetchDailyTraffic(token, zoneId, from, to),
    fetchRumWebVitals(token, accountId, SITE_HOST, `${from}T00:00:00Z`, `${to}T23:59:59Z`),
  ]);

  const trafficRows = rawTraffic.map(normalizeDayRow);
  const rumRowsRaw  = rawRum.map(normalizeRumRow);

  // Sanitize RUM routes — keep only known site routes.
  const { kept: rumRows, discarded: discardedRum } = sanitizeRumRoutes(rumRowsRaw);
  if (discardedRum.length > 0) {
    console.error(
      `[cloudflare-fetch] RUM discarded ${discardedRum.length} routes outside site inventory:`
    );
    for (const d of discardedRum) {
      console.error(`  - ${d.path} (count=${d.count}, reason=${d.reason})`);
    }
  }

  const trafficDoc = {
    ...buildSchemaHeader("cloudflare-traffic", week, from, to),
    summary: buildTrafficSummary(trafficRows),
    data:    trafficRows,
  };

  const rumDoc = {
    ...buildSchemaHeader("cloudflare-rum", week, from, to),
    // LCP/INP stored in ms. CLS is dimensionless score. null = no data for route.
    // Thresholds: LCP good <2500ms, needs-improvement <4000ms; CLS good <0.1; INP good <200ms.
    data: rumRows,
    _meta: {
      totalRawRoutes: rumRowsRaw.length,
      keptRoutes: rumRows.length,
      discardedRoutes: discardedRum.length,
      discarded: discardedRum,
    },
  };

  if (args.dryRun) {
    const sep = (label) => `\n${"─".repeat(60)}\n--- ${label} ---\n${"─".repeat(60)}\n`;
    process.stdout.write(sep(`traffic (${trafficRows.length} days, ${trafficDoc.summary.pageViews} pageviews)`));
    process.stdout.write(JSON.stringify(trafficDoc, null, 2) + "\n");
    process.stdout.write(sep(`rum (${rumRows.length} routes)`));
    process.stdout.write(JSON.stringify(rumDoc, null, 2) + "\n");
    console.error("[cloudflare-fetch] dry-run — no files written");
    return;
  }

  const dir = path.resolve(OUTPUT_BASE);
  mkdirSync(dir, { recursive: true });

  const files = [
    [`${week}-traffic.json`, trafficDoc, `${trafficRows.length} days, cache ${trafficDoc.summary.cacheRatioPct}%`],
    [`${week}-rum.json`,     rumDoc,     `${rumRows.length} routes`],
  ];

  for (const [filename, doc, note] of files) {
    const filePath = path.join(dir, filename);
    writeFileSync(filePath, JSON.stringify(doc, null, 2) + "\n", "utf8");
    console.error(`[cloudflare-fetch] wrote ${filePath}  (${note})`);
  }

  console.error("[cloudflare-fetch] done");
}

// Guarded so importing this module (e.g. from tests, to exercise buildRumQuery)
// does not also run main() — mirrors the pattern in lcp-gate.mjs.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`[cloudflare-fetch] fatal: ${err.message}`);
    process.exit(1);
  });
}
