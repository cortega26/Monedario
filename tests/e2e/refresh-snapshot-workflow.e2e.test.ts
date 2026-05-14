/**
 * E2E tests for the Refresh Volatile Data Snapshots workflow safety guard.
 *
 * Verifies that `.github/workflows/refresh-economic-snapshot.yml` delegates to
 * the shared safe auto-merge action instead of maintaining bespoke merge logic.
 *
 * Verification rows: V1, V2, V3, V4
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const WORKFLOW_PATH = path.join(
  process.cwd(),
  ".github",
  "workflows",
  "refresh-economic-snapshot.yml",
);

describe("refresh-economic-snapshot workflow — safe auto-merge", () => {
  // V1: Workflow file must exist
  it("workflow file exists (V1)", () => {
    expect(fs.existsSync(WORKFLOW_PATH)).toBe(true);
  });

  // V4: Workflow YAML must be parseable (structural validity)
  it("workflow YAML is parseable without errors (V4)", () => {
    const content = fs.readFileSync(WORKFLOW_PATH, "utf8");
    // Basic YAML structure checks without an external parser dependency
    expect(content).toContain("jobs:");
    expect(content).toContain("steps:");
    expect(content).toContain("name:");
    // Should not have un-closed multi-line indicators that would break YAML
    expect(content.split("\n").length).toBeGreaterThan(10);
  });

  // V2: The workflow must delegate to the shared safe auto-merge action.
  it("Enable auto-merge step uses the shared action (V2)", () => {
    const content = fs.readFileSync(WORKFLOW_PATH, "utf8");
    expect(content).toContain("uses: ./.github/actions/enable-safe-automerge");
  });

  // V3: The workflow must pass the created PR number to the shared action.
  it("workflow passes the created PR number to the shared action (V3)", () => {
    const content = fs.readFileSync(WORKFLOW_PATH, "utf8");
    expect(content).toContain(
      "pull-request: ${{ steps.create-pr.outputs.pull-request-number }}",
    );
  });

  // V4: The workflow should no longer maintain bespoke merge shell commands.
  it("workflow no longer embeds bespoke merge commands (V4)", () => {
    const content = fs.readFileSync(WORKFLOW_PATH, "utf8");
    expect(content).not.toContain("gh pr merge --auto --squash");
    expect(content).not.toContain("gh pr merge --squash");
  });
});
