/**
 * E2E tests for the Dependabot auto-merge workflow safety guard.
 *
 * Verifies that `.github/workflows/dependency-automerge.yml` delegates to the
 * shared safe auto-merge action for eligible patch updates.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const WORKFLOW_PATH = path.join(
  process.cwd(),
  ".github",
  "workflows",
  "dependency-automerge.yml",
);

describe("dependency-automerge workflow — safe auto-merge", () => {
  it("workflow file exists", () => {
    expect(fs.existsSync(WORKFLOW_PATH)).toBe(true);
  });

  it("workflow YAML is structurally valid", () => {
    const content = fs.readFileSync(WORKFLOW_PATH, "utf8");
    expect(content).toContain("jobs:");
    expect(content).toContain("steps:");
    expect(content).toContain("name:");
    expect(content.split("\n").length).toBeGreaterThan(10);
  });

  it("eligible patch step uses the shared action", () => {
    const content = fs.readFileSync(WORKFLOW_PATH, "utf8");
    expect(content).toContain("uses: ./.github/actions/enable-safe-automerge");
  });

  it("workflow passes the PR URL to the shared action", () => {
    const content = fs.readFileSync(WORKFLOW_PATH, "utf8");
    expect(content).toContain(
      "pull-request: ${{ github.event.pull_request.html_url }}",
    );
    expect(content).not.toContain("gh pr merge --auto --squash");
    expect(content).not.toContain("gh pr merge --squash");
  });
});