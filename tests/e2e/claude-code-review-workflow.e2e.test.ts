/**
 * E2E tests for the Claude code review workflow trigger scope.
 *
 * Verifies that `.github/workflows/claude-code-review.yml` is limited to code
 * and automation surfaces so docs-only or editorial-only pull requests do not
 * trigger the expensive review job.
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

describe("claude-code-review workflow — scoped trigger", () => {
  it("workflow file exists", () => {
    expect(fs.existsSync(WORKFLOW_PATH)).toBe(true);
  });

  it("pull_request trigger is path-scoped", () => {
    const content = fs.readFileSync(WORKFLOW_PATH, "utf8");
    expect(content).toContain("pull_request:");
    expect(content).toContain("paths:");
    expect(content).toContain('      - "src/**"');
    expect(content).toContain('      - "scripts/**"');
    expect(content).toContain('      - "tests/**"');
    expect(content).toContain('      - ".github/workflows/**"');
    expect(content).not.toContain('      - "docs/**"');
  });
});