/**
 * E2E tests for the shared urlcheck placeholder artifact action.
 *
 * Verifies that the action exists, supports internal and external scopes, and
 * that `ci.yml` delegates placeholder creation to it instead of embedding the
 * shell boilerplate inline.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const actionPath = path.join(
  repoRoot,
  ".github",
  "actions",
  "ensure-urlcheck-artifacts",
  "action.yml",
);
const workflowPath = path.join(repoRoot, ".github", "workflows", "ci.yml");

describe("ensure-urlcheck-artifacts action", () => {
  it("action file exists and supports internal plus external scopes", () => {
    expect(fs.existsSync(actionPath)).toBe(true);
    const content = fs.readFileSync(actionPath, "utf8");
    expect(content).toContain('scope:');
    expect(content).toContain('internal)');
    expect(content).toContain('external)');
    expect(content).toContain('Unsupported urlcheck scope');
  });

  it("ci workflow delegates placeholder creation to the shared action", () => {
    const content = fs.readFileSync(workflowPath, "utf8");
    const usesCount = content.match(/uses: \.\/\.github\/actions\/ensure-urlcheck-artifacts/g)?.length ?? 0;

    expect(usesCount).toBe(3);
    expect(content).toContain('scope: internal');
    expect(content).toContain('scope: external');
    expect(content).not.toContain('internal-broken.json ] || printf');
    expect(content).not.toContain('external-summary.json ] || printf');
  });
});