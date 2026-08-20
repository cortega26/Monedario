import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const workflowsDir = path.join(repoRoot, ".github", "workflows");
const expectedRunner = "${{ vars.ACTIONS_RUNNER_LABEL || 'ubuntu-latest' }}";
// Jobs created after the bridge retirement (2026-08-01) that are not part of
// the documented ADR-20260716 bridge scope remain on hardcoded ubuntu-latest.
const outOfScopeDeclarations = new Set([
  "deploy-analytics-collector.yml",
  "security-scans.yml",
  "validate-committed-artifacts.yml",
]);

function read(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("GitHub Actions runner portability", () => {
  it("routes every workflow job through the hosted-default repository variable", () => {
    const workflowFiles = fs
      .readdirSync(workflowsDir)
      .filter(file => file.endsWith(".yml"))
      .sort();

    const declarations = workflowFiles.flatMap(file => {
      if (outOfScopeDeclarations.has(file)) return [];
      const source = fs.readFileSync(path.join(workflowsDir, file), "utf8");
      return [...source.matchAll(/^\s+runs-on:\s+(.+)$/gm)].map(match => ({
        file,
        runner: match[1]?.trim(),
      }));
    });

    expect(declarations.length).toBeGreaterThan(0);
    expect(declarations).toEqual(
      declarations.map(declaration => ({
        ...declaration,
        runner: expectedRunner,
      }))
    );
  });

  it("installs bootstrap and security tools without root-owned paths", () => {
    const pnpmBootstrap = read(".github/actions/bootstrap-pnpm/action.yml");
    const pythonBootstrap = read(".github/actions/bootstrap-python/action.yml");
    const securityWorkflow = read(".github/workflows/security-scans.yml");
    const portableSources = [pnpmBootstrap, pythonBootstrap, securityWorkflow];

    for (const source of portableSources) {
      expect(source).not.toContain("/usr/local/bin");
      expect(source).not.toMatch(/\bsudo\s+install\b/);
      expect(source).toContain("GITHUB_PATH");
    }

    expect(pnpmBootstrap).toContain('--prefix "${PNPM_HOME}"');
    expect(pythonBootstrap).toContain('UV_BIN_DIR="${RUNNER_TEMP}/uv-bin"');
    expect(securityWorkflow).toContain(
      'bin_dir="${RUNNER_TEMP}/security-tools/bin"'
    );
  });
});
