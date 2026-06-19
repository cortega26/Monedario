// check:economic-snapshot-freshness
//
// Fails (exit 1) when the committed economic snapshot has gone stale, which
// signals the refresh Worker has silently stopped committing. Wired into the
// DAILY SCHEDULED CI (not the PR gate) so worker death surfaces within ~24h.
//
// Roots/clock are env-overridable for tests:
//   ECONOMIC_SNAPSHOT_ROOT  — repo root override (default: repo root)
//   ECONOMIC_SNAPSHOT_NOW   — ISO datetime "now" override (default: new Date())
//
// Exit 0 = fresh, exit 1 = stale or unreadable.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(
  process.env.ECONOMIC_SNAPSHOT_ROOT || path.resolve(__dirname, "..")
);
const SNAPSHOT_PATH = path.join(
  REPO_ROOT,
  "src/infrastructure/economic/economic-parameters.snapshot.json"
);

// Generous thresholds (days). The point is to catch a DEAD pipeline, not to
// chase every publication lag. UF/dólar are ~daily; UTM is monthly.
const CAPTURE_MAX_DAYS = 10; // capturedAt: is the snapshot being regenerated at all?
const INDICATOR_MAX_DAYS = {
  uf: 10,
  utm: 45,
  dolar: 10,
};

function now() {
  const override = process.env.ECONOMIC_SNAPSHOT_NOW;
  const d = override ? new Date(override) : new Date();
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid ECONOMIC_SNAPSHOT_NOW: ${override}`);
  }
  return d;
}

function ageInDays(isoOrDate, ref) {
  const then = new Date(isoOrDate);
  if (Number.isNaN(then.getTime())) return null;
  return (ref.getTime() - then.getTime()) / 86_400_000;
}

function main() {
  let snapshot;
  try {
    snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8"));
  } catch (err) {
    console.error(
      `[check-economic-snapshot-freshness] FAIL: cannot read/parse ${SNAPSHOT_PATH}: ${err.message}`
    );
    process.exit(1);
  }

  const ref = now();
  const errors = [];

  const captureAge = ageInDays(snapshot.capturedAt, ref);
  if (captureAge === null) {
    errors.push(`capturedAt missing or unparseable: ${snapshot.capturedAt}`);
  } else if (captureAge > CAPTURE_MAX_DAYS) {
    errors.push(
      `capturedAt is ${captureAge.toFixed(1)}d old (max ${CAPTURE_MAX_DAYS}d) — refresh Worker may have stopped. capturedAt=${snapshot.capturedAt}`
    );
  }

  for (const [indicator, maxDays] of Object.entries(INDICATOR_MAX_DAYS)) {
    const date = snapshot.indicatorUpdatedAt?.[indicator];
    const age = date ? ageInDays(date, ref) : null;
    if (age === null) {
      errors.push(`indicatorUpdatedAt.${indicator} missing or unparseable: ${date}`);
    } else if (age > maxDays) {
      errors.push(
        `${indicator} last updated ${age.toFixed(1)}d ago (max ${maxDays}d). date=${date}`
      );
    }
  }

  if (errors.length > 0) {
    console.error(
      `[check-economic-snapshot-freshness] FAIL: ${errors.length} stale signal(s):`
    );
    for (const e of errors) console.error(`  - ${e}`);
    console.error(
      "Reproduce: run `pnpm run economic:snapshot:refresh` and confirm the Worker (refresh-economic-snapshot.yml) is green."
    );
    process.exit(1);
  }

  console.log(
    `[check-economic-snapshot-freshness] OK. capturedAt ${captureAge.toFixed(1)}d old; uf/utm/dólar within thresholds.`
  );
}

main();
