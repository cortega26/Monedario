/**
 * E2E tests for the shared generic workflow artifact upload action.
 *
 * Verifies that the helper exists with the expected contract and that the
 * remaining workflow fleet delegates artifact publication to it instead of
 * calling the pinned upload action directly.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const actionPath = path.join(
  repoRoot,
  ".github",
  "actions",
  "upload-workflow-artifact",
  "action.yml",
);
const workflowPaths = [
  ".github/workflows/ci.yml",
  ".github/workflows/weekly-search-ops.yml",
  ".github/workflows/hero-images-generate.yml",
  ".github/workflows/doc-gardening.yml",
  ".github/workflows/check-afp-commissions.yml",
  ".github/workflows/guardrail-drift-audit.yml",
  ".github/workflows/editorial-timeliness-audit.yml",
].map((relativePath) => path.join(repoRoot, relativePath));

describe("upload-workflow-artifact action", () => {
  it("action file exists and exposes the shared upload contract", () => {
    expect(fs.existsSync(actionPath)).toBe(true);
    const content = fs.readFileSync(actionPath, "utf8");

    expect(content).toContain("artifact-name:");
    expect(content).toContain("path:");
    expect(content).toContain("retention-days:");
    expect(content).toContain("if-no-files-found:");
    expect(content).toContain("default: error");
    expect(content).toContain("uses: actions/upload-artifact@");
  });

  it("workflows delegate direct artifact uploads to the shared helper", () => {
    const workflowContent = workflowPaths
      .map((filePath) => fs.readFileSync(filePath, "utf8"))
      .join("\n");
    const helperUsesCount =
      workflowContent.match(/uses: \.\/\.github\/actions\/upload-workflow-artifact/g)
        ?.length ?? 0;

    expect(helperUsesCount).toBe(7);
    expect(workflowContent).not.toContain("artifact-name: site-dist");
    expect(workflowContent).toContain("artifact-name: a11y-report");
    expect(workflowContent).toContain("artifact-name: hero-images-artifacts");
    expect(workflowContent).not.toContain("uses: actions/upload-artifact@");
  });
});
