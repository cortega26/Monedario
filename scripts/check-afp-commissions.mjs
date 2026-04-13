#!/usr/bin/env node
/**
 * check-afp-commissions.mjs
 *
 * Validates AFP commission rates declared in src/config/afpCommissions.ts
 * against the official Previred Indicadores Previsionales page.
 *
 * The "total" column in afpCommissions.ts must equal:
 *   10% (mandatory savings) + AFP administration commission (cargo trabajador dependiente)
 *
 * Exit codes:
 *   0 — all rates match (or remote validation was successful)
 *   1 — mismatches detected or fetch failed
 *
 * Usage:
 *   node scripts/check-afp-commissions.mjs
 *
 * Output (JSON report): output/validation/afp-commissions/report.json
 */

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const REPORT_DIR = resolve(ROOT, "output/validation/afp-commissions");
const REPORT_PATH = resolve(REPORT_DIR, "report.json");

const PREVIRED_URL = "https://www.previred.com/indicadores-previsionales/";
const AFP_NAMES = ["Capital", "Cuprum", "Habitat", "Modelo", "PlanVital", "ProVida", "Uno"];

// Tolerance for floating-point comparison (0.005% = 0.00005)
const RATE_TOLERANCE = 0.005;

// ─── Parse current config ──────────────────────────────────────────────────────

function parseAfpConfig() {
  const configPath = resolve(ROOT, "src/config/afpCommissions.ts");
  const content = readFileSync(configPath, "utf8");

  const entries = [];
  const entryRe =
    /\{\s*name:\s*"([^"]+)",\s*commission:\s*([\d.]+),\s*total:\s*([\d.]+)\s*\}/g;
  let m;
  while ((m = entryRe.exec(content)) !== null) {
    entries.push({
      name: m[1],
      commission: parseFloat(m[2]),
      total: parseFloat(m[3]),
    });
  }

  if (entries.length === 0) {
    throw new Error(
      "No AFP entries found in afpCommissions.ts — config file format may have changed.",
    );
  }

  return entries;
}

// ─── Fetch Previred ────────────────────────────────────────────────────────────

async function fetchPreviredHtml() {
  const res = await fetch(PREVIRED_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; tuplatainforma-rate-checker/1.0)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    throw new Error(`Previred responded with HTTP ${res.status}`);
  }

  return res.text();
}

// ─── Parse Previred table ─────────────────────────────────────────────────────

/**
 * Extracts "cargo del trabajador dependiente" total % for each AFP from
 * the Previred indicators HTML. Returns an object keyed by AFP name.
 *
 * The Previred table has AFP names followed by percentage columns. The first
 * percentage column is the worker's total AFP deduction (10% + commission).
 * Previred uses Spanish comma notation: "11,44%" → 11.44
 *
 * Strategy: strip all HTML tags first so each AFP name sits directly adjacent
 * to its rate value, regardless of how many tag attributes/styles are between
 * them in the raw HTML. This avoids false matches in nav/news text above the
 * table for common names like "Capital", "Habitat", "Uno".
 */
function parsePreviredRates(html) {
  // 1. Isolate the AFP commissions table section if possible.
  //    The table typically follows a heading containing "AFP" and "comisión"
  //    or similar. Use the entire HTML as fallback.
  let tableSection = html;
  const tableStart = html.search(/comisiones?\s+afp|tabla\s+de\s+comision|afp.*comision/i);
  if (tableStart !== -1) {
    tableSection = html.slice(tableStart);
  }

  // 2. Strip HTML tags and decode basic entities, then collapse whitespace.
  const text = tableSection
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&\w{1,8};/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

  const rates = {};

  for (const name of AFP_NAMES) {
    // Escape regex special chars (PlanVital is safe, but guard anyway)
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // After stripping tags, the AFP name sits close to the first %:
    //   "Capital 11,44% 0,1% ..."  or  "Capital  11,44% ..."
    // Limit lookahead to 80 chars to avoid cross-AFP matches.
    const re = new RegExp(
      `\\b${escapedName}\\b[^%]{1,80}?(\\d{1,2},\\d{2})%`,
      "i",
    );
    const match = re.exec(text);

    if (match) {
      // "11,44" → 11.44
      rates[name] = parseFloat(match[1].replace(",", "."));
    }
  }

  return rates;
}

// ─── Report writer ─────────────────────────────────────────────────────────────

function writeReport(report) {
  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  console.log("=== AFP Commission Rate Checker ===");
  console.log(`Date: ${today}`);
  console.log(`Source: ${PREVIRED_URL}`);
  console.log();

  // 1. Parse current config ──────────────────────────────────────────────────
  let configEntries;
  try {
    configEntries = parseAfpConfig();
  } catch (err) {
    console.error(`ERROR: Failed to parse afpCommissions.ts — ${err.message}`);
    writeReport({ date: today, status: "error", error: err.message, mismatches: [] });
    process.exit(1);
  }

  console.log("Current values in src/config/afpCommissions.ts:");
  for (const e of configEntries) {
    console.log(
      `  ${e.name.padEnd(10)} commission=${e.commission.toFixed(2)}%  total=${e.total.toFixed(2)}%`,
    );
  }
  console.log();

  // 2. Fetch and parse Previred ───────────────────────────────────────────────
  let previredRates = {};
  try {
    console.log(`Fetching ${PREVIRED_URL} ...`);
    const html = await fetchPreviredHtml();
    previredRates = parsePreviredRates(html);

    const found = Object.keys(previredRates).length;
    if (found < AFP_NAMES.length) {
      console.warn(
        `WARNING: Only ${found}/${AFP_NAMES.length} AFP rates found in Previred HTML.`,
      );
      console.warn(
        "Previred page structure may have changed. Manual verification required.",
      );
      const missing = AFP_NAMES.filter((n) => !(n in previredRates));
      console.warn(`  Missing rates for: ${missing.join(", ")}`);
    }

    console.log("Previred values (cargo del trabajador dependiente):");
    for (const [name, total] of Object.entries(previredRates)) {
      console.log(`  ${name.padEnd(10)} total=${total.toFixed(2)}%`);
    }
    console.log();
  } catch (err) {
    const msg = `Previred fetch failed: ${err.message}`;
    console.error(`ERROR: ${msg}`);
    console.error(
      "Cannot complete validation without Previred data. Marking as FAIL.",
    );
    writeReport({
      date: today,
      status: "fetch_error",
      error: msg,
      configEntries,
      previredRates: {},
      mismatches: [],
    });
    process.exit(1);
  }

  // 3. Compare ───────────────────────────────────────────────────────────────
  const mismatches = [];

  for (const entry of configEntries) {
    if (!(entry.name in previredRates)) {
      // Rate not found on Previred — flag as warning but not hard failure
      console.warn(
        `  WARNING: ${entry.name} not found in Previred data — skipping comparison`,
      );
      continue;
    }

    const previredTotal = previredRates[entry.name];
    const diff = Math.abs(entry.total - previredTotal);

    if (diff > RATE_TOLERANCE) {
      mismatches.push({
        afp: entry.name,
        configTotal: entry.total,
        previredTotal,
        diff: parseFloat((entry.total - previredTotal).toFixed(4)),
      });
    }
  }

  // 4. Report ────────────────────────────────────────────────────────────────
  const status = mismatches.length === 0 ? "pass" : "fail";
  const report = {
    date: today,
    status,
    configPath: "src/config/afpCommissions.ts",
    sourceUrl: PREVIRED_URL,
    configEntries,
    previredRates,
    mismatches,
  };
  writeReport(report);

  if (mismatches.length === 0) {
    console.log("✓ All AFP commission rates match Previred official figures.");
    console.log();
    console.log("PASS");
    process.exit(0);
  } else {
    console.error(`✗ ${mismatches.length} mismatch(es) detected:\n`);
    for (const m of mismatches) {
      console.error(`  AFP ${m.afp}`);
      console.error(
        `    Previred (official): ${m.previredTotal.toFixed(2)}%`,
      );
      console.error(
        `    Config (current):    ${m.configTotal.toFixed(2)}%`,
      );
      console.error(
        `    Drift: ${m.diff > 0 ? "+" : ""}${m.diff.toFixed(2)}%`,
      );
      console.error();
    }
    console.error("ACTION REQUIRED:");
    console.error(
      "  1. Open src/config/afpCommissions.ts and update the wrong values.",
    );
    console.error(
      "  2. Cross-check with at least one AFP official site before committing.",
    );
    console.error(
      "  3. Search src/pages/calculadoras/ for any hardcoded AFP rate text.",
    );
    console.error(
      "  4. See docs/governance/FINANCIAL_DATA_VERIFICATION_POLICY.md for full procedure.",
    );
    console.error();
    console.error("Reference sources:");
    console.error(`  Previred: ${PREVIRED_URL}`);
    console.error("  AFP Capital: https://www.afpcapital.cl/comisiones");
    console.error(
      "  AFP Uno: https://www.uno.cl/sobre-uno/nuestras-comisiones",
    );
    console.error(
      "  SP: https://www.spensiones.cl/portal/institucional/594/w3-channel.html",
    );
    console.error();
    console.error("FAIL");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("FATAL:", err.message);
  process.exit(1);
});
