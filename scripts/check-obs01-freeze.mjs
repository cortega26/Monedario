// check:obs01-freeze
//
// Enforces §10 ("No hacer durante OBS-01") in
// docs/backlog/PLAN-calculator-led-growth-2026-06-28.md mechanically. That
// section forbids title/meta, form, CTA, paid-promotion and distribution
// changes to the OBS-01 cohort (seguro-cesantia, operacion-renta,
// prepago-credito, credito-consumo) while the baseline is being measured. It
// was documentation-only and got violated twice on 2026-07-12 (see that
// date's §14 row) by two unrelated work streams that didn't know they were
// touching frozen ground.
//
// Fails (exit 1) when the PR changes a freeze-scoped path AND the plan doc's
// most recent OBS-01 row in §14 is not DONE. Fails closed (exit 1) if the
// plan doc or its OBS-01 row cannot be found, since that means the status
// can't be verified. Passes (exit 0) when no freeze-scoped path changed, when
// OBS-01 is DONE, or when a human applied the 'obs01-freeze-override' label.
//
// Env vars (overridable for tests / manual runs):
//   OBS01_FREEZE_ROOT           — repo root (default: repo root)
//   OBS01_FREEZE_PLAN_PATH      — plan doc path (default: docs/backlog/PLAN-calculator-led-growth-2026-06-28.md)
//   OBS01_FREEZE_BASE_REF       — PR base branch for git diff (default: github.base_ref in CI)
//   OBS01_FREEZE_CHANGED_FILES  — newline-separated changed-file list; bypasses git diff when set
//   OBS01_FREEZE_OVERRIDE       — "1" to bypass the block (set from the 'obs01-freeze-override' PR label)
//
// Exit 0 = freeze not violated (or lifted/overridden), exit 1 = blocked.
//
// `--print-freeze-paths` prints FREEZE_SCOPED_PATHS as JSON and exits 0,
// without touching git or the plan doc. Used by
// tests/scripts/check-obs01-freeze-paths-sync.test.ts to assert this list
// stays in sync with the workflow's trigger `paths:` — the two are
// independent copies, so a path added to one without the other silently
// never fires.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(process.env.OBS01_FREEZE_ROOT || path.resolve(__dirname, ".."));
const PLAN_PATH = path.resolve(
  process.env.OBS01_FREEZE_PLAN_PATH ||
    path.join(REPO_ROOT, "docs/backlog/PLAN-calculator-led-growth-2026-06-28.md")
);

// The four OBS-01 cohort tools' own pages, plus shared components that shape
// their journeys or the analytics that measure them. See §10 and the
// 2026-07-12 §14 log entry (the two violations: title/meta on
// seguro-cesantia.astro, and calculator-prefill.ts touching all four forms).
const FREEZE_SCOPED_PATHS = new Set([
  "src/pages/calculadoras/seguro-cesantia.astro",
  "src/pages/calculadoras/operacion-renta.astro",
  "src/pages/calculadoras/prepago-credito.astro",
  "src/pages/calculadoras/credito-consumo.astro",
  "src/scripts/calculator-prefill.ts",
  "src/components/CalculatorResultNextActions.astro",
  "src/components/NextBestStep.astro",
  "src/scripts/next-best-step.ts",
  "src/data/nextBestStep/rules.ts",
  "src/scripts/analytics.ts",
]);

function runGit(args) {
  try {
    return execFileSync("git", args, {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function splitPaths(raw) {
  return raw
    .split(/\r?\n/)
    .map(line => line.trim().replace(/\\/g, "/"))
    .filter(Boolean);
}

function getChangedFiles() {
  const explicit = process.env.OBS01_FREEZE_CHANGED_FILES;
  if (explicit !== undefined) return splitPaths(explicit);

  const baseRef = String(process.env.OBS01_FREEZE_BASE_REF ?? "").trim();
  const candidateRanges = [];
  if (baseRef) {
    candidateRanges.push(`origin/${baseRef}...HEAD`);
    candidateRanges.push(`${baseRef}...HEAD`);
  }
  candidateRanges.push("HEAD^1...HEAD");
  candidateRanges.push("HEAD^...HEAD");

  for (const range of candidateRanges) {
    const output = runGit(["diff", "--name-only", range]);
    if (output === null) continue;
    return splitPaths(output);
  }
  return [];
}

// Scans the plan doc's Progress Log (§14) table for rows whose "Fase" cell
// mentions OBS-01 and returns the most recent one (last in document order —
// the table is chronological). Not anchored to a literal "## 14." heading so
// it survives section renumbering.
function parseObs01Status(docText) {
  const lines = docText.split(/\r?\n/);
  let startIndex = lines.findIndex(line => /progress log/i.test(line));
  if (startIndex === -1) startIndex = 0;

  let lastMatch = null;
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith("|")) continue;
    const cells = line.split("|");
    if (cells.length < 4) continue;

    const fecha = (cells[1] ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) continue;

    const fase = (cells[2] ?? "").trim();
    if (!fase.includes("OBS-01")) continue;

    const estado = (cells[3] ?? "").trim().replace(/^\*+|\*+$/g, "");
    lastMatch = { fecha, fase, estado };
  }
  return lastMatch;
}

function fail(reasonLines, touchedFreezePaths) {
  console.error("[check-obs01-freeze] BLOCKED.");
  for (const line of reasonLines) console.error(`  ${line}`);
  console.error("");
  console.error("Freeze-scoped path(s) touched by this PR:");
  for (const f of touchedFreezePaths) console.error(`  - ${f}`);
  console.error("");
  console.error(
    "This touches paths frozen by §10 (\"No hacer durante OBS-01\") in " +
      "docs/backlog/PLAN-calculator-led-growth-2026-06-28.md. See that section " +
      "and the 2026-07-12 §14 log entry for why the freeze exists — it was " +
      "violated twice on that date by changes that didn't know they collided."
  );
  console.error("");
  console.error("To proceed:");
  console.error("  - Preferred: wait until OBS-01's row in §14 is marked DONE.");
  console.error(
    "  - Explicit human-reviewed override: apply the 'obs01-freeze-override' " +
      "label to this PR once a human has confirmed the change does not affect " +
      "the OBS-01 cohort's journeys or measurement."
  );
  process.exit(1);
}

function main() {
  if (process.argv.includes("--print-freeze-paths")) {
    console.log(JSON.stringify([...FREEZE_SCOPED_PATHS].sort()));
    return;
  }

  const changedFiles = getChangedFiles();
  const touchedFreezePaths = changedFiles.filter(f => FREEZE_SCOPED_PATHS.has(f));

  if (touchedFreezePaths.length === 0) {
    console.log("[check-obs01-freeze] OK. No freeze-scoped paths changed.");
    return;
  }

  if (process.env.OBS01_FREEZE_OVERRIDE === "1") {
    console.warn(
      `[check-obs01-freeze] OVERRIDE active ('obs01-freeze-override' label). ` +
        `${touchedFreezePaths.length} freeze-scoped path(s) changed but this PR was ` +
        `authorized by a human reviewer. Touched:\n` +
        touchedFreezePaths.map(f => `  - ${f}`).join("\n")
    );
    return;
  }

  let docText;
  try {
    docText = readFileSync(PLAN_PATH, "utf8");
  } catch (err) {
    fail(
      [
        `Cannot read plan doc at ${PLAN_PATH}: ${err.message}`,
        "Cannot verify OBS-01 status — failing closed.",
      ],
      touchedFreezePaths
    );
    return;
  }

  const obs01Row = parseObs01Status(docText);
  if (!obs01Row) {
    fail(
      [
        "No OBS-01 row found in the plan doc's Progress Log (§14).",
        "Cannot verify OBS-01 status — failing closed.",
      ],
      touchedFreezePaths
    );
    return;
  }

  if (obs01Row.estado.toUpperCase() === "DONE") {
    console.log(
      `[check-obs01-freeze] OK. OBS-01 status is DONE (row ${obs01Row.fecha}) — freeze lifted for ` +
        `${touchedFreezePaths.length} touched path(s).`
    );
    return;
  }

  fail(
    [
      `OBS-01 is not DONE. Latest §14 row: ${obs01Row.fecha} — "${obs01Row.fase}" — ` +
        `status "${obs01Row.estado}".`,
    ],
    touchedFreezePaths
  );
}

main();
