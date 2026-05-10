#!/usr/bin/env node
/**
 * lighthouse-audit.mjs — Run Lighthouse baseline against production URLs
 *
 * Uses lhci to collect and assert against the production site.
 *
 * Usage:
 *   node scripts/lighthouse-audit.mjs                # full audit (desktop, 5 URLs, 3 runs)
 *   node scripts/lighthouse-audit.mjs --device mobile # mobile-only
 *   node scripts/lighthouse-audit.mjs --urls 1,2,3   # specific URLs by index (1-based)
 *
 * Requires: @lhci/cli (already installed)
 * Requires: Chrome/Chromium (uses system chrome via chrome-launcher)
 */

import { execSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));
const REPORT_DIR = join(PROJECT_ROOT, "output", "performance", "lighthouse", "2026-05-reaudit");

const URLS = [
  "https://monedario.cl/",
  "https://monedario.cl/posts/como-calcular-sueldo-liquido/",
  "https://monedario.cl/calculadoras/sueldo-liquido/",
  "https://monedario.cl/guias/ahorro-e-inversion/",
  "https://monedario.cl/guias/",
];

const URL_LABELS = ["homepage", "article", "calculator", "hub", "guides-index"];

const { values: args } = parseArgs({
  options: {
    device: { type: "string", default: "desktop" },
    urls: { type: "string" }, // comma-separated 1-based indices, e.g. "1,3,5"
  },
});

function run() {
  // Build a temp lighthouserc that targets production URLs
  const selectedUrls = args.urls
    ? args.urls.split(",").map(i => URLS[parseInt(i, 10) - 1]).filter(Boolean)
    : URLS;

  if (selectedUrls.length === 0) {
    console.error("No valid URLs selected.");
    process.exit(1);
  }

  const urlLabels = args.urls
    ? args.urls.split(",").map(i => URL_LABELS[parseInt(i, 10) - 1]).filter(Boolean)
    : URL_LABELS;

  console.log("\n  Lighthouse Baseline Audit");
  console.log(`  Target: monedario.cl`);
  console.log(`  Device: ${args.device}`);
  console.log(`  URLs: ${urlLabels.join(", ")}`);
  console.log(`  Reports: ${REPORT_DIR}\n`);

  const tempConfig = {
    ci: {
      collect: {
        url: selectedUrls,
        numberOfRuns: 3,
        settings: { preset: args.device },
      },
      assert: {
        assertions: {
          "categories:performance": ["warn", { minScore: 0.99 }],
          "largest-contentful-paint": ["warn", { maxNumericValue: 1700 }],
          "cumulative-layout-shift": ["warn", { maxNumericValue: 0 }],
          "total-blocking-time": ["warn", { maxNumericValue: 0 }],
          "speed-index": ["warn", { maxNumericValue: 3000 }],
        },
      },
      upload: {
        target: "filesystem",
        outputDir: REPORT_DIR,
      },
    },
  };

  const tempConfigPath = join(PROJECT_ROOT, "lighthouserc.prod.cjs");
  writeFileSync(
    tempConfigPath,
    `module.exports = ${JSON.stringify(tempConfig, null, 2)};\n`
  );

  try {
    execSync(
      `pnpm exec lhci collect --config="${tempConfigPath}" && pnpm exec lhci assert --config="${tempConfigPath}"`,
      {
        cwd: PROJECT_ROOT,
        stdio: "inherit",
        env: { ...process.env, LIGHTHOUSE_OUTPUT: "json,html" },
      }
    );
  } finally {
    if (existsSync(tempConfigPath)) {
      try { execSync(`rm "${tempConfigPath}"`); } catch { /* ignore */ }
    }
  }
}

run();
