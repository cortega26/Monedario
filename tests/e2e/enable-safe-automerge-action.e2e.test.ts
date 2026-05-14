/**
 * E2E tests for the shared safe auto-merge action.
 *
 * Verifies that the composite action contains the only approved auto-merge
 * behavior: enable auto-merge, treat already-enabled or already-merged states
 * as success, and never fall back to a direct merge.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ACTION_PATH = path.join(
  process.cwd(),
  ".github",
  "actions",
  "enable-safe-automerge",
  "action.yml",
);

describe("enable-safe-automerge action", () => {
  it("action file exists", () => {
    expect(fs.existsSync(ACTION_PATH)).toBe(true);
  });

  it("action enables auto-merge without a direct merge fallback", () => {
    const content = fs.readFileSync(ACTION_PATH, "utf8");
    expect(content).toContain('gh pr merge --auto --squash "$PR_TARGET"');
    expect(content).not.toContain('gh pr merge --squash "$PR_TARGET"');
  });

  it("action leaves the PR open for manual review on non-fatal failure", () => {
    const content = fs.readFileSync(ACTION_PATH, "utf8");
    expect(content).toContain(
      "Auto-merge could not be enabled safely. Leaving the PR open for manual review.",
    );
  });
});