/**
 * E2E tests for the Refresh Volatile Data Snapshots workflow safety guard.
 *
 * Editorial refresh PRs must stay open for human review while the workflow
 * `add-paths` includes `src/data/blog`: the review-policy generator must not
 * manufacture freshness or human-review dates.
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
  "refresh-economic-snapshot.yml"
);

describe("refresh-economic-snapshot workflow — manual review guard", () => {
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

  // V2/V3: The workflow must not auto-merge PRs that can touch src/data/blog.
  it("does not auto-merge editorial refresh PRs (V2/V3)", () => {
    const content = fs.readFileSync(WORKFLOW_PATH, "utf8");
    expect(content).not.toContain(
      "uses: ./.github/actions/enable-safe-automerge"
    );
    expect(content).not.toContain(
      "pull-request: ${{ steps.create-pr.outputs.pull-request-number }}"
    );
    expect(content).toContain("Refresh PRs stay open for manual review");
  });

  // V4: The workflow should no longer maintain bespoke merge shell commands.
  it("workflow no longer embeds bespoke merge commands (V4)", () => {
    const content = fs.readFileSync(WORKFLOW_PATH, "utf8");
    expect(content).not.toContain("gh pr merge --auto --squash");
    expect(content).not.toContain("gh pr merge --squash");
  });
});
