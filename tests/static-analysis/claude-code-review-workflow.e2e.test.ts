/**
 * E2E tests for the Claude code review workflow.
 *
 * The workflow is currently disabled (renamed to .yml.disabled) pending OAuth
 * token renewal. The test validates the preserved configuration.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const WORKFLOW_PATH = path.join(
  process.cwd(),
  ".github",
  "workflows",
  "claude-code-review.yml.disabled",
);

describe("claude-code-review workflow", () => {
  it("workflow file exists", () => {
    expect(fs.existsSync(WORKFLOW_PATH)).toBe(true);
  });

  it("pull_request trigger scopes runs to source changes via paths", () => {
    const content = fs.readFileSync(WORKFLOW_PATH, "utf8");
    expect(content).toContain("pull_request:");
    // Path scoping is active (not commented out) so reviews only fire for
    // code, test, script, worker, and config changes — not docs or CI.
    expect(content).toMatch(/^\s+paths:/m);
    expect(content).toContain('"src/**"');
    expect(content).toContain('"tests/**"');
    expect(content).toContain('"scripts/**"');
    // Docs and CI changes skip review.
    expect(content).toMatch(/^\s+paths-ignore:/m);
    expect(content).toContain('"docs/**"');
    expect(content).toContain('".github/**"');
  });
});