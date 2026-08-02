/**
 * E2E tests for the shared scheduled-workflow issue lifecycle action.
 *
 * Verifies that the shared action exists and that the main issue-producing
 * governance/ops workflows delegate issue syncing to it instead of embedding
 * repeated GitHub issue API boilerplate.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const actionPath = path.join(
  repoRoot,
  ".github",
  "actions",
  "upsert-issue-by-title",
  "action.yml",
);

const delegatedWorkflows = [
  ".github/workflows/doc-gardening.yml",
  ".github/workflows/guardrail-drift-audit.yml",
  ".github/workflows/check-afp-commissions.yml",
  ".github/workflows/editorial-timeliness-audit.yml",
  ".github/workflows/weekly-search-ops.yml",
  ".github/workflows/check-ts7-readiness.yml.disabled",
];

function readUtf8(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("upsert-issue-by-title integration", () => {
  it("shared action file exists and contains open/close support", () => {
    expect(fs.existsSync(actionPath)).toBe(true);
    const content = fs.readFileSync(actionPath, "utf8");
    expect(content).toContain("Create, update, or close an open GitHub issue");
    expect(content).toContain('state: "closed"');
    expect(content).toContain('if (desiredState !== "open")');
  });

  it("target workflows delegate issue syncing to the shared action", () => {
    for (const workflowPath of delegatedWorkflows) {
      const content = readUtf8(workflowPath);
      expect(content).toContain("uses: ./.github/actions/upsert-issue-by-title");
      expect(content).not.toContain("github.rest.issues.listForRepo");
      expect(content).not.toContain("github.rest.issues.create");
      expect(content).not.toContain("github.rest.issues.update");
    }
  });
});