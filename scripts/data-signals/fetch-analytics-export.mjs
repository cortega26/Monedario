#!/usr/bin/env node
/**
 * fetch-analytics-export — baja el export semanal de analytics desde R2.
 *
 * El worker analytics-collector persiste cada lunes un JSON agregado en R2:
 *   analytics-exports/YYYY-Www.json
 *
 * Este script lo descarga vía Cloudflare REST API y lo guarda en el repo
 * para integrarlo al scorecard semanal. Sin raw events, sin PII, sin timestamps finos.
 *
 * Uso:
 *   node scripts/data-signals/fetch-analytics-export.mjs [--week=YYYY-Www] [--dry-run]
 *
 * Required env:
 *   CLOUDFLARE_API_TOKEN   Token con permisos Workers R2 Storage:Read
 *   CLOUDFLARE_ACCOUNT_ID  Account ID de Cloudflare
 *
 * Output:
 *   output/operations/data-signals/analytics/YYYY-Www.json
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  isExportOverdue,
  isoWeekToDateRange,
  previousCompleteISOWeek,
} from "./gsc-utils.mjs";

const OUTPUT_BASE = "output/operations/data-signals/analytics";
const CF_API = "https://api.cloudflare.com/client/v4";
const ACCOUNT_ID = getRequiredEnv("CLOUDFLARE_ACCOUNT_ID");
const BUCKET_NAME = "monedario-analytics-exports";

const ALLOWED_EVENTS = new Set([
  // Current schema (v2).
  "calculator_view",
  "calculator_start",
  "calculator_complete",
  "calculator_error",
  "next_step_shown",
  "next_step_click",
  "source_click",
  "share_attempt",
  "share_success",
  "alert_interest_shown",
  "alert_interest_submit",
  "support_shown",
  "support_click",
  "support_confirmed",
  "article_calculator_cta_click",
  // Historical schema (v1), retained so old weekly exports stay readable.
  "next_best_step_shown",
  "next_best_step_click",
  "result_action_click",
  "share_result_click",
  "scenario_action",
  "resume_click",
  "support_page_click",
  "official_source_click",
]);

// ── CLI ──────────────────────────────────────────────────────────────────────

function printUsage(code = 0) {
  console.log(`
Usage:
  node scripts/data-signals/fetch-analytics-export.mjs [options]

Options:
  --week=YYYY-Www   ISO week to fetch (default: previous complete week)
  --dry-run         Validate and print summary without writing files
  --help, -h        Show this message

Required env:
  CLOUDFLARE_API_TOKEN   Token with Workers R2 Storage:Read
  CLOUDFLARE_ACCOUNT_ID  Cloudflare Account ID

Output (without --dry-run):
  ${OUTPUT_BASE}/YYYY-Www.json
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
        console.error(`[fetch-analytics-export] Invalid --week format: "${val}". Expected YYYY-Www.`);
        process.exit(1);
      }
      opts.week = val;
      continue;
    }
    console.error(`[fetch-analytics-export] Unknown argument: ${arg}`);
    process.exit(1);
  }
  return opts;
}

// ── R2 fetch ─────────────────────────────────────────────────────────────────

async function fetchFromR2(token, objectKey) {
  const url = `${CF_API}/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET_NAME}/objects/${encodeURIComponent(objectKey)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 404) {
    return { found: false, body: null };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `[fetch-analytics-export] HTTP ${res.status} fetching ${objectKey}: ${text.slice(0, 500)}`
    );
  }

  const body = await res.text();
  return { found: true, body };
}

// ── Validation ───────────────────────────────────────────────────────────────

function validateExportArtifact(json, week) {
  const errors = [];

  if (!json || typeof json !== "object") {
    errors.push("artifact is not a valid JSON object");
    return { valid: false, errors };
  }

  if (json.source !== "first-party-events") {
    errors.push(`source must be "first-party-events", got "${json.source}"`);
  }

  if (![1, 2].includes(json.schemaVersion)) {
    errors.push(`schemaVersion must be 1 or 2, got ${json.schemaVersion}`);
  }

  if (json.week !== week) {
    errors.push(`week mismatch: expected "${week}", got "${json.week}"`);
  }

  if (!json.window?.from || !json.window?.to) {
    errors.push("window.from/to are required");
  }

  const expected = isoWeekToDateRange(week);
  if (json.window?.from !== expected.from || json.window?.to !== expected.to) {
    errors.push(
      `window mismatch: expected ${expected.from}→${expected.to}, got ${json.window?.from}→${json.window?.to}`
    );
  }

  const data = json.data ?? [];
  if (!Array.isArray(data)) {
    errors.push("data must be an array");
    return { valid: false, errors };
  }

  const seen = new Set();
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const prefix = `data[${i}]`;

    if (!row.date || typeof row.date !== "string") {
      errors.push(`${prefix}: missing or invalid date`);
    }
    if (!ALLOWED_EVENTS.has(row.event_name)) {
      errors.push(`${prefix}: unknown event_name "${row.event_name}"`);
    }
    const calculatorId = row.calculator_id ?? row.calculator_slug;
    if (!calculatorId || typeof calculatorId !== "string") {
      errors.push(`${prefix}: calculator_id or calculator_slug is required`);
    } else if (!/^[a-z0-9][a-z0-9._-]{0,79}$/.test(calculatorId)) {
      errors.push(`${prefix}: calculator identity must be a bounded safe token`);
    }
    if (typeof row.count !== "number" || row.count < 0) {
      errors.push(`${prefix}: count must be a non-negative number, got ${row.count}`);
    }
    if (row.date && row.date < json.window.from || row.date > json.window.to) {
      errors.push(`${prefix}: date ${row.date} outside window`);
    }

    // Dedup check
    const dedupKey = `${row.date}|${row.event_name}|${calculatorId ?? ""}|${row.dimensions ?? ""}`;
    if (seen.has(dedupKey)) {
      errors.push(`${prefix}: duplicate row key "${dedupKey}"`);
    }
    seen.add(dedupKey);

    // Check no PII-like dimension patterns
    if (row.dimensions) {
      const dims = String(row.dimensions);
      if (/[\d]{6,}/.test(dims)) {
        errors.push(`${prefix}: dimensions may contain numeric sequence resembling PII`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) printUsage(0);

  const token = getRequiredEnv("CLOUDFLARE_API_TOKEN");
  const week = args.week ?? previousCompleteISOWeek();
  const objectKey = `analytics-exports/${week}.json`;

  console.error(`[fetch-analytics-export] week=${week} key=${objectKey}`);

  const { found, body } = await fetchFromR2(token, objectKey);

  if (!found) {
    if (isExportOverdue(week)) {
      console.error(
        `[fetch-analytics-export] OVERDUE: no export in R2 for ${week} past the grace window. ` +
        `The worker cron (Monday 07:57 UTC) likely did not run or failed. Investigate the worker.`
      );
      process.exit(1);
    }
    console.error(
      `[fetch-analytics-export] Export not yet available in R2 for ${week}. ` +
      `The worker cron runs Monday 07:57 UTC. If today is Monday/Tuesday, the export may still be pending.`
    );
    process.exit(0);
  }

  let json;
  try {
    json = JSON.parse(body);
  } catch (err) {
    console.error(`[fetch-analytics-export] Invalid JSON in R2 object: ${err.message}`);
    process.exit(1);
  }

  const validation = validateExportArtifact(json, week);
  if (!validation.valid) {
    console.error(
      `[fetch-analytics-export] VALIDATION FAILED:\n  ${validation.errors.join("\n  ")}`
    );
    process.exit(1);
  }

  const { data } = json;
  const totalEvents = data.reduce((sum, row) => sum + row.count, 0);
  const eventTypes = new Set(data.map((row) => row.event_name)).size;
  console.error(
    `[fetch-analytics-export] valid: ${data.length} rows, ${totalEvents} total events, ${eventTypes} event types`
  );

  if (args.dryRun) {
    console.error("[fetch-analytics-export] dry-run — no file written");
    return;
  }

  const dir = path.resolve(OUTPUT_BASE);
  mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${week}.json`);
  writeFileSync(filePath, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.error(`[fetch-analytics-export] wrote ${filePath}`);
}

main().catch((err) => {
  console.error(`[fetch-analytics-export] fatal: ${err.message}`);
  process.exit(1);
});
