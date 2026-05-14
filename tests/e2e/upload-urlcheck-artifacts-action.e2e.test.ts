/**
 * E2E tests for the shared urlcheck upload action.
 *
 * Verifies that the action exists, supports internal and external scopes, and
 * that `ci.yml` delegates artifact upload to it instead of embedding the path
 * lists inline.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const actionPath = path.join(
  repoRoot,
  ".github",
  "actions",
  "upload-urlcheck-artifacts",
  "action.yml",
);
const workflowPath = path.join(repoRoot, ".github", "workflows", "ci.yml");

describe("upload-urlcheck-artifacts action", () => {
  it("action file exists and supports internal plus external scopes", () => {
    expect(fs.existsSync(actionPath)).toBe(true);
    const content = fs.readFileSync(actionPath, "utf8");

    expect(content).toContain("artifact-name:");
    expect(content).toContain("retention-days:");
    expect(content).toContain("scope:");
    expect(content).toContain("internal)");
    expect(content).toContain("external)");
    expect(content).toContain("internal-broken.json");
    expect(content).toContain("external-summary.json");
    expect(content).toContain("Unsupported urlcheck scope");
  });

  it("ci workflow delegates urlcheck artifact uploads to the shared action", () => {
    const content = fs.readFileSync(workflowPath, "utf8");
    const usesCount =
      content.match(/uses: \.\/\.github\/actions\/upload-urlcheck-artifacts/g)
        ?.length ?? 0;

    expect(usesCount).toBe(3);
    expect(content).toContain("artifact-name: urlcheck-artifacts-ci");
    expect(content).toContain("artifact-name: urlcheck-artifacts-external-audit");
    expect(content).toContain("artifact-name: urlcheck-artifacts-external-ci");
    expect(content).not.toContain("output/validation/urlcheck/internal-broken.json");
    expect(content).not.toContain("output/validation/urlcheck/external-summary.json");
  });
});