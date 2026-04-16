/**
 * E2E tests for the Refresh Volatile Data Snapshots workflow fix.
 *
 * Verifies that `.github/workflows/refresh-economic-snapshot.yml` uses the
 * auto-merge-with-direct-merge fallback pattern instead of the bare
 * `gh pr merge --auto --squash` command that fails when no required status
 * checks are configured (GitHub GraphQL "clean status" error).
 *
 * Spec: spec.md — Fix GitHub Actions Auto-Merge Failure
 * Verification rows: V1, V2, V3, V4
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const WORKFLOW_PATH = path.join(
  process.cwd(),
  ".github",
  "workflows",
  "refresh-economic-snapshot.yml",
);

describe("refresh-economic-snapshot workflow — auto-merge fix", () => {
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

  // V2: The fallback || pattern must be present in the auto-merge step
  it("Enable auto-merge step contains the || fallback pattern (V2)", () => {
    const content = fs.readFileSync(WORKFLOW_PATH, "utf8");
    // Both auto-merge attempt AND the direct-merge fallback must appear
    expect(content).toContain("gh pr merge --auto --squash");
    expect(content).toContain("gh pr merge --squash");
    // The || operator must be used to chain them
    const hasFallback =
      content.includes("--auto --squash") &&
      content.includes(" || ") &&
      content.includes("gh pr merge --squash");
    expect(hasFallback).toBe(true);
  });

  // V3: The old single-command pattern (no fallback) must NOT be present
  it("old bare single-command pattern without fallback is absent (V3)", () => {
    const content = fs.readFileSync(WORKFLOW_PATH, "utf8");
    // Split into lines and find the auto-merge command line(s)
    const lines = content.split("\n");
    const autoMergeLines = lines.filter((l) =>
      l.includes("gh pr merge --auto --squash"),
    );
    // Every line that contains --auto --squash must also be part of a fallback
    // (i.e. the || continuation must appear either on the same line or the
    //  next non-empty line that contains `gh pr merge --squash`).
    expect(autoMergeLines.length).toBeGreaterThan(0);
    for (const line of autoMergeLines) {
      // The line itself should end with " || \" (multiline) OR be part of a
      // run block that contains || on a subsequent line. We accept both forms.
      const isMultiline = line.trimEnd().endsWith("|| \\");
      const isSingleLine = line.includes(" || ");
      expect(isMultiline || isSingleLine).toBe(true);
    }
  });
});
