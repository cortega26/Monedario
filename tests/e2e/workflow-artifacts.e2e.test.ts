/**
 * Validates workflow artifact invariants defined in spec.md.
 * Verifies goals G1–G5 and verification matrix rows V1–V7.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function readUtf8(relativePath: string): string {
  const fullPath = path.join(repoRoot, relativePath);
  return fs.readFileSync(fullPath, "utf8");
}

describe("workflow artifact setup", () => {
  it("creates required files at repository root", () => {
    expect(fs.existsSync(path.join(repoRoot, "spec.md"))).toBe(true);
    expect(fs.existsSync(path.join(repoRoot, "todo.md"))).toBe(true);
  });

  it("creates tests/e2e directory and this test suite", () => {
    expect(fs.existsSync(path.join(repoRoot, "tests", "e2e"))).toBe(true);
    expect(
      fs.existsSync(
        path.join(repoRoot, "tests", "e2e", "workflow-artifacts.e2e.test.ts"),
      ),
    ).toBe(true);
  });

  it("documents all mandatory sections in spec.md", () => {
    const spec = readUtf8("spec.md");

    expect(spec).toContain("## Objective");
    expect(spec).toContain("## Scope");
    expect(spec).toContain("## Goals");
    expect(spec).toContain("## Implementation Plan");
    expect(spec).toContain("## Ongoing Execution Rules");
    expect(spec).toContain("## Verification Matrix");
    expect(spec).toContain("## Commands");
    expect(spec).toContain("## Definition of Done");
  });

  it("documents the periodic review-loop requirement in spec.md", () => {
    const spec = readUtf8("spec.md");
    expect(spec).toContain("Approximately every 20 implementation iterations");
    expect(spec).toContain(
      '"review spec.md and the current implementation for gaps"',
    );
  });

  it("tracks granular checklist tasks in todo.md", () => {
    const todo = readUtf8("todo.md");

    expect(todo).toContain("- [ ]");
    expect(todo).toContain("- [x]");
    expect(todo).toContain("## End-to-End Coverage Tasks");
    expect(todo).toContain("## Validation Loop");
  });

  // V6: All tests pass — vitest config must include e2e glob and disallow empty suites
  it("provides executable test runner configuration that includes e2e tests (V6)", () => {
    const vitest = readUtf8("vitest.config.ts");
    // The glob pattern must cover tests/e2e/**
    expect(vitest).toContain('"tests/**/*.test.ts"');
    // passWithNoTests:false ensures missing tests surface as failures
    expect(vitest).toContain("passWithNoTests: false");
  });

  // G1 depth: Implementation Plan must contain ordered phases with detail
  it("provides actionable, sequenced implementation plan phases in spec.md", () => {
    const spec = readUtf8("spec.md");
    expect(spec).toContain("### Phase 1");
    expect(spec).toContain("### Phase 2");
    expect(spec).toContain("### Phase 3");
    expect(spec.indexOf("### Phase 1") < spec.indexOf("### Phase 2")).toBe(
      true,
    );
    expect(spec.indexOf("### Phase 2") < spec.indexOf("### Phase 3")).toBe(
      true,
    );
  });
});
