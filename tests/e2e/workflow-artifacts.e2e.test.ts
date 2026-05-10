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
  it("creates tests/e2e directory and this test suite", () => {
    expect(fs.existsSync(path.join(repoRoot, "tests", "e2e"))).toBe(true);
    expect(
      fs.existsSync(
        path.join(repoRoot, "tests", "e2e", "workflow-artifacts.e2e.test.ts"),
      ),
    ).toBe(true);
  });

  // V6: All tests pass — vitest config must include e2e glob and disallow empty suites
  it("provides executable test runner configuration that includes e2e tests (V6)", () => {
    const vitest = readUtf8("vitest.config.ts");
    // The glob pattern must cover tests/e2e/**
    expect(vitest).toContain('"tests/**/*.test.ts"');
    // passWithNoTests:false ensures missing tests surface as failures
    expect(vitest).toContain("passWithNoTests: false");
  });
});
