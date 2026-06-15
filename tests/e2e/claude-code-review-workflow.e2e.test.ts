/**
 * E2E tests for the Claude code review workflow.
 *
 * Verifies that `.github/workflows/claude-code-review.yml` exists and has the
 * expected trigger structure matching the version on the default branch.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const WORKFLOW_PATH = path.join(
  process.cwd(),
  ".github",
  "workflows",
  "claude-code-review.yml",
);

describe("claude-code-review workflow", () => {
  it("workflow file exists", () => {
    expect(fs.existsSync(WORKFLOW_PATH)).toBe(true);
  });

  it("pull_request trigger has no active path scoping", () => {
    const content = fs.readFileSync(WORKFLOW_PATH, "utf8");
    expect(content).toContain("pull_request:");
    // The file may contain commented-out path hints but must not have an
    // active (uncommented) `paths:` key.
    expect(content).not.toMatch(/^\s+paths:/m);
  });
});