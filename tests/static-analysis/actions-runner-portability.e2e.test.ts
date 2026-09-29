import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const workflowsDir = path.join(repoRoot, ".github", "workflows");
const expectedRunner = "${{ vars.ACTIONS_RUNNER_LABEL || 'ubuntu-latest' }}";

// Files created entirely after the bridge retirement (2026-08-01). Every job
// in them is outside the documented ADR-20260716 bridge scope, so the whole
// file stays on hardcoded ubuntu-latest.
const fullyOutOfScopeFiles = new Set([
  "deploy-analytics-collector.yml",
  "ops-reminders.yml",
  "validate-committed-artifacts.yml",
]);

// Files that mix bridge jobs with post-retirement jobs. Exceptions are keyed
// by job name so a regression in any bridge job still fails the test.
const perJobExceptions: Record<string, Record<string, string>> = {
  "security-scans.yml": {
    "gitleaks-pr": "ubuntu-latest",
  },
};

function read(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function jobRunnerMap(source: string): Map<string, string> {
  const map = new Map<string, string>();
  let currentJob: string | null = null;

  for (const line of source.split("\n")) {
    const jobMatch = line.match(/^  ([\w-]+):\s*$/);
    if (jobMatch) {
      currentJob = jobMatch[1] ?? null;
      continue;
    }
    if (currentJob) {
      const runnerMatch = line.match(/^\s+runs-on:\s+(.+)$/);
      if (runnerMatch) {
        map.set(currentJob, runnerMatch[1]?.trim() ?? "");
        currentJob = null;
      }
    }
  }

  return map;
}

describe("GitHub Actions runner portability", () => {
  it("routes every in-scope workflow job through the hosted-default repository variable", () => {
    const workflowFiles = fs
      .readdirSync(workflowsDir)
      .filter(file => file.endsWith(".yml"))
      .sort();

    const declarations = workflowFiles.flatMap(file => {
      if (fullyOutOfScopeFiles.has(file)) return [];
      const source = read(path.join(".github", "workflows", file));
      return [...jobRunnerMap(source)].map(([job, runner]) => ({
        file,
        job,
        runner,
      }));
    });

    expect(declarations.length).toBeGreaterThan(0);

    for (const declaration of declarations) {
      const exception = perJobExceptions[declaration.file]?.[declaration.job];
      if (exception !== undefined) {
        expect(declaration.runner).toBe(exception);
      } else {
        expect(declaration.runner).toBe(expectedRunner);
      }
    }
  });

  it("keeps security-scans.yml bridge jobs on the fallback and gitleaks-pr as the only hardcoded exception", () => {
    const runners = jobRunnerMap(read(".github/workflows/security-scans.yml"));

    for (const job of ["gitleaks", "opengrep", "trivy", "python-audit"]) {
      expect(runners.get(job)).toBe(expectedRunner);
    }
    expect(runners.get("gitleaks-pr")).toBe("ubuntu-latest");
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
