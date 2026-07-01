import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const eslint = new ESLint({ cwd: process.cwd() });

describe("ESLint global ignore boundary", () => {
  it.each([
    ".claude/worktrees/agent-example/src/component.ts",
    ".codex/worktrees/agent-example/src/component.ts",
    ".agents/worktrees/agent-example/src/component.ts",
    "coverage/index.js",
    "coverage-html/report.js",
    ".nyc_output/process.json",
    "playwright-report/index.html",
    "test-results/run/trace.js",
  ])("ignores generated or nested-worktree path %s", async candidatePath => {
    await expect(eslint.isPathIgnored(candidatePath)).resolves.toBe(true);
  });

  it.each([
    "src/config.ts",
    "scripts/check-context.mjs",
    "tests/static-analysis/eslint-global-ignores.e2e.test.ts",
    "workers/economic-snapshot-refresh/src/index.ts",
  ])("continues linting owned source path %s", async candidatePath => {
    await expect(eslint.isPathIgnored(candidatePath)).resolves.toBe(false);
  });
});
