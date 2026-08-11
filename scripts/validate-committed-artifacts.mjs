// validate-committed-artifacts
//
// Validates the artifacts that bots write directly to `main` (bypassing PR
// CI): the economic snapshot (build-critical, auto-deployed by Cloudflare
// Pages) and the data-signals JSON files. A malformed artifact (broken JSON,
// NaN value, invalid date) would otherwise reach production with zero checks.
//
// Wired as `check:committed-artifacts` and into the post-push workflow
// `.github/workflows/validate-committed-artifacts.yml` (triggered only by
// paths touching those artifacts).
//
// Root is env-overridable for tests:
//   VALIDATE_ARTIFACTS_ROOT — repo root override (default: repo root)
//
// Exit 0 = all valid, exit 1 = at least one invalid artifact (reports ALL
// failures, not just the first).

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(
  process.env.VALIDATE_ARTIFACTS_ROOT || path.resolve(__dirname, "..")
);
const SNAPSHOT_PATH = path.join(
  REPO_ROOT,
  "src/infrastructure/economic/economic-parameters.snapshot.json"
);
const DATA_SIGNALS_DIR = path.join(REPO_ROOT, "output", "operations", "data-signals");

const REQUIRED_FINITE = ["uf", "utm"];
const OPTIONAL_FINITE = ["uta", "ipc", "tmc", "dolar"];
const INDICATOR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const errors = [];

function fail(file, rule, detail) {
  errors.push(`validate-committed-artifacts: ${file}:${rule} ${detail}`);
}

function listJsonFiles(dirPath) {
  const result = [];
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.name === "node_modules") {
      continue;
    }
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      result.push(...listJsonFiles(fullPath));
    } else if (entry.name.endsWith(".json")) {
      result.push(fullPath);
    }
  }
  return result;
}

function validateSnapshot() {
  let snapshot;
  try {
    snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8"));
  } catch (error) {
    fail("economic-parameters.snapshot.json", "parse", error.message);
    return;
  }

  for (const field of REQUIRED_FINITE) {
    const value = snapshot[field];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      fail("economic-parameters.snapshot.json", "finite", `expected finite number for "${field}", got ${JSON.stringify(value)}`);
    }
  }

  for (const field of OPTIONAL_FINITE) {
    if (!(field in snapshot)) {
      continue;
    }
    const value = snapshot[field];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      fail("economic-parameters.snapshot.json", "finite", `expected finite number for "${field}", got ${JSON.stringify(value)}`);
    }
  }

  if ("utm" in snapshot && !INDICATOR_DATE_PATTERN.test(snapshot?.indicatorUpdatedAt?.utm ?? "")) {
    fail(
      "economic-parameters.snapshot.json",
      "date-format",
      `indicatorUpdatedAt.utm must match YYYY-MM-DD, got ${JSON.stringify(snapshot.indicatorUpdatedAt?.utm)}`
    );
  }
}

function validateDataSignals() {
  const files = listJsonFiles(DATA_SIGNALS_DIR);
  if (files.length === 0) {
    fail("output/operations/data-signals", "empty", "no JSON files found");
    return;
  }
  for (const file of files) {
    const relative = path.relative(REPO_ROOT, file);
    try {
      JSON.parse(readFileSync(file, "utf8"));
    } catch (error) {
      fail(relative, "parse", error.message);
    }
  }
}

if (!statSync(SNAPSHOT_PATH, { throwIfNoEntry: false })) {
  fail("economic-parameters.snapshot.json", "missing", "snapshot file not found");
} else {
  validateSnapshot();
}

if (!statSync(DATA_SIGNALS_DIR, { throwIfNoEntry: false })) {
  fail("output/operations/data-signals", "missing", "data-signals directory not found");
} else {
  validateDataSignals();
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log("[validate-committed-artifacts] OK. Snapshot + data-signals JSON validos.");
