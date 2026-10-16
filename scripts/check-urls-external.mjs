#!/usr/bin/env node
/**
 * check-urls-external.mjs
 *
 * External link validation engine for the whole-site built output.
 *
 * Modes:
 *   --ci      Whole-site blocking PR validation. Exits 1 if any result has blocking=true.
 *             The CI JOB uses continue-on-error:true during initial rollout, so the workflow
 *             will not fail until the job is promoted to hard-fail mode.
 *   --audit   Nightly/manual full audit. Always exits 0 regardless of findings; all classes
 *             are written to artifacts for trend visibility.
 *   --canary  Smoke-test the external engine against local fixture responses. Exits 1 if
 *             expected failure patterns are NOT detected (inverse of normal check).
 *
 * Public commands (package.json):
 *   check:urls:external:ci     → node scripts/check-urls-external.mjs --ci
 *   check:urls:external:audit  → node scripts/check-urls-external.mjs --audit
 *   check:urls:canary          → node scripts/check-urls.mjs --canary &&
 *                                node scripts/check-urls-external.mjs --canary
 */

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { MODES } from "./urlcheck/constants.mjs";
import { extractExternalLinks } from "./urlcheck/extract-external.mjs";
import { runProbePool } from "./urlcheck/probe-external.mjs";
import { classifyExternalResult, buildExternalSummary } from "./urlcheck/classify-external.mjs";
import { buildRedirectInventory, writeExternalArtifacts } from "./urlcheck/external-artifacts.mjs";

// ---- Canary test server port range ----
const CANARY_PORT_BASE = 4500;
const CANARY_PORT_RANGE = 100;

function parseArgs(argv) {
  const flags = new Set(argv.slice(2));
  if (flags.has("--canary")) return { mode: "canary" };
  if (flags.has("--audit")) return { mode: "audit" };
  if (flags.has("--ci")) return { mode: "ci" };
  // Default: audit (non-blocking) when no flag given
  return { mode: "audit" };
}

async function main() {
  const { mode } = parseArgs(process.argv);

  if (mode === "canary") {
    await runCanary();
    return;
  }

  const distDir = path.resolve("dist");
  await assertDistExists(distDir);

  const modeConfig = MODES[mode === "ci" ? "ci" : "external_audit"];
  const { concurrency, timeoutMs } = modeConfig;

  console.log(`[check-urls-external] mode=${mode} dist=${distDir}`);

  // 1. Extract all external links from the built HTML
  const linkMap = await extractExternalLinks(distDir);
  const uniqueUrls = [...linkMap.keys()];

  if (uniqueUrls.length === 0) {
    console.log("[check-urls-external] No external links found — check dist/ output.");
    if (mode === "ci") process.exit(1);
    return;
  }

  console.log(`[check-urls-external] Found ${uniqueUrls.length} unique external URLs.`);

  // 2. Probe each URL
  const probeResults = await runProbePool(uniqueUrls, { concurrency, timeoutMs });

  // 3. Classify results
  const classifiedResults = uniqueUrls.map((url) => {
    const link = linkMap.get(url);
    const probe = probeResults.get(url);
    return classifyExternalResult(link, probe);
  });

  // 4. Write artifacts
  const artifacts = await writeExternalArtifacts(classifiedResults, { mode });
  console.log(`[check-urls-external] artifacts written: ${Object.values(artifacts).join(", ")}`);
  const redirects = buildRedirectInventory(classifiedResults);
  const reviewCount = redirects.filter(
    r => r.review === "review_destination"
  ).length;
  const shareCount = redirects.filter(
    r => r.review === "intentional_share"
  ).length;
  console.log(
    `[check-urls-external] redirects=${redirects.length} review=${reviewCount} intentional_share=${shareCount} inventory=${artifacts.redirectsJson}`
  );

  // 5. Print workflow summary
  console.log("");
  console.log(buildExternalSummary(classifiedResults));
  console.log("");

  // 6. Evaluate gate
  const blockingFailures = classifiedResults.filter((r) => r.blocking);
  const hardFails = classifiedResults.filter((r) => r.classification === "hard_fail" && r.blocking);
  const soft404s = classifiedResults.filter((r) => r.classification === "soft_404" && r.blocking);
  const mismatches = classifiedResults.filter(
    (r) => (r.classification === "host_mismatch" || r.classification === "redirect_mismatch") && r.blocking
  );

  console.log(
    `[check-urls-external] scanned=${uniqueUrls.length} ` +
      `blocking=${blockingFailures.length} ` +
      `hard_fail=${hardFails.length} ` +
      `soft_404=${soft404s.length} ` +
      `host_mismatch=${mismatches.length}`
  );

  if (mode === "audit") {
    console.log("[check-urls-external] Audit mode complete (non-blocking).");
    return;
  }

  // CI mode: exit 1 if any blocking failures
  if (blockingFailures.length > 0) {
    for (const r of blockingFailures) {
      console.error(
        `[check-urls-external] BLOCKING ${r.classification.toUpperCase()} ` +
          `${r.source_url} → ${r.final_url} ` +
          `(signal: ${r.matched_signal ?? r.error ?? "unknown"}) ` +
          `referrer: ${r.referrer_url ?? "unknown"}`
      );
    }
    throw new Error(
      `external_blocking_failures_detected:count=${blockingFailures.length}`
    );
  }

  console.log("[check-urls-external] OK. No blocking external failures detected.");
}

// ---- Canary mode ----

/**
 * Starts a local HTTP server that returns synthetic responses for canary fixtures,
 * runs the external check engine against a fixture referrer HTML file,
 * and asserts that expected failure patterns are detected.
 *
 * Canary fixture server paths:
 *   /ok         → 200 with normal content
 *   /soft-404   → 200 with soft-404 content (triggers soft_404 detection)
 *   /hard-404   → 404
 *   /mismatch   → 200 with wrong-institution content (for redirect_mismatch tests)
 *
 * Expected detections for canary to PASS:
 *   1. A link to /hard-404 must produce a hard_fail result.
 *   2. A link to /soft-404 must produce a soft_404 result.
 *   3. A link to /ok must produce an ok result.
 */
async function runCanary() {
  console.log("[check-urls-external] canary mode – starting fixture server...");

  const port = CANARY_PORT_BASE + Math.floor(Math.random() * CANARY_PORT_RANGE);
  const server = createCanaryServer(port);

  await waitForServer(`http://127.0.0.1:${port}/ok`);
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // Build a minimal link map that exercises the detection engines
    const linkMap = buildCanaryLinkMap(baseUrl);
    const uniqueUrls = [...linkMap.keys()];

    // Probe with tight timeout since this is local
    const probeResults = await runProbePool(uniqueUrls, {
      concurrency: 4,
      timeoutMs: 5_000,
      allowPrivateHosts: true,
    });

    // Classify — canary test server is not in the self-origins or host registry,
    // so it will be classified as "unknown" (non-blocking by default).
    // We override blocking for canary assertions: hard_fail and soft_404 are
    // expected to be DETECTED regardless of blocking flag.
    const classified = uniqueUrls.map((url) => {
      const link = linkMap.get(url);
      const probe = probeResults.get(url);
      return classifyExternalResult(link, probe);
    });

    // Assert expected detections
    assertCanaryExpectations(classified, baseUrl);
    console.log("[check-urls-external] Canary passed. All expected failures detected.");
  } finally {
    server.close();
  }
}

function buildCanaryLinkMap(baseUrl) {
  /** @type {Map<string, {referrers: string[], linkType: 'inline', anchorText: string}>} */
  const m = new Map();
  const paths = ["/ok", "/soft-404", "/hard-404"];
  for (const p of paths) {
    const url = `${baseUrl}${p}`;
    m.set(url, {
      href: url,
      referrers: ["https://monedario.cl/canary"],
      linkType: "inline",
      anchorText: p.slice(1),
    });
  }
  return m;
}

function assertCanaryExpectations(classified, baseUrl) {
  const byUrl = new Map(classified.map((r) => [r.source_url, r]));

  const hardFail = byUrl.get(`${baseUrl}/hard-404`);
  if (!hardFail || hardFail.classification !== "hard_fail") {
    throw new Error(
      `canary_hard_fail_not_detected: expected hard_fail for /hard-404, got ${hardFail?.classification}`
    );
  }

  const soft404 = byUrl.get(`${baseUrl}/soft-404`);
  if (!soft404 || soft404.classification !== "soft_404") {
    throw new Error(
      `canary_soft_404_not_detected: expected soft_404 for /soft-404, got ${soft404?.classification}`
    );
  }

  const ok = byUrl.get(`${baseUrl}/ok`);
  if (!ok || ok.classification !== "ok") {
    throw new Error(
      `canary_ok_link_incorrectly_flagged: expected ok for /ok, got ${ok?.classification}`
    );
  }
}

function createCanaryServer(port) {
  const server = createServer((req, res) => {
    const url = req.url ?? "/";

    if (url === "/ok") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        "<!doctype html><html><head><title>OK Page</title></head><body><h1>Bienvenido</h1><p>Everything is fine here.</p></body></html>"
      );
      return;
    }

    if (url === "/soft-404") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        "<!doctype html><html><head><title>Página no encontrada</title></head><body><h1>Página no encontrada</h1><p>Lo sentimos, este recurso no existe.</p></body></html>"
      );
      return;
    }

    if (url === "/hard-404") {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<!doctype html><html><body>Not found.</body></html>");
      return;
    }

    if (url === "/mismatch") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        "<!doctype html><html><head><title>Red de Salud Genérica</title></head><body><h1>Bienvenido al portal genérico</h1></body></html>"
      );
      return;
    }

    // Default: 404 for unknown paths
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end("Not found");
  });

  server.listen(port, "127.0.0.1");
  return server;
}

async function waitForServer(url, attempts = 40) {
  const { default: http } = await import("node:http");
  for (let i = 0; i < attempts; i += 1) {
    const ok = await new Promise((resolve) => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve(true);
      });
      req.on("error", () => resolve(false));
      req.setTimeout(500, () => {
        req.destroy();
        resolve(false);
      });
    });
    if (ok) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`canary_server_not_ready:${url}`);
}

async function assertDistExists(distDir) {
  try {
    await readFile(path.join(distDir, "index.html"), "utf8");
  } catch {
    throw new Error(
      `dist_not_found: ${distDir} does not contain index.html. Run 'pnpm run astro build' first.`
    );
  }
}

main().catch((error) => {
  console.error(`[check-urls-external] FAIL: ${error.message}`);
  process.exit(1);
});
