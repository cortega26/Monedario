import { readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { load } from "js-yaml";
import { describe, expect, it } from "vitest";

// scripts/check-obs01-freeze.mjs's FREEZE_SCOPED_PATHS and
// .github/workflows/obs01-freeze-gate.yml's trigger `paths:` are two
// independent copies of the same freeze scope. This guards against them
// drifting apart — a path added to one without the other means the gate
// silently never fires for it.

const SCRIPT = path.resolve("scripts/check-obs01-freeze.mjs");
const WORKFLOW = path.resolve(".github/workflows/obs01-freeze-gate.yml");

// Meta-triggers in the workflow that re-run the gate when its own inputs
// change, but aren't part of the freeze scope itself.
const WORKFLOW_ONLY_PATHS = new Set([
  "docs/backlog/PLAN-calculator-led-growth-2026-06-28.md",
  "scripts/check-obs01-freeze.mjs",
  ".github/workflows/obs01-freeze-gate.yml",
]);

describe("check-obs01-freeze freeze-path sync", () => {
  it("workflow trigger paths match the script's FREEZE_SCOPED_PATHS", () => {
    const scriptPaths: string[] = JSON.parse(
      spawnSync("node", [SCRIPT, "--print-freeze-paths"], { encoding: "utf8" }).stdout
    );

    const workflowDoc = load(readFileSync(WORKFLOW, "utf8")) as {
      on: { pull_request: { paths: string[] } };
    };
    const workflowPaths = workflowDoc.on.pull_request.paths.filter(
      p => !WORKFLOW_ONLY_PATHS.has(p)
    );

    expect(new Set(workflowPaths)).toEqual(new Set(scriptPaths));
  });
});
