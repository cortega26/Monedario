/**
 * E2E tests for the shared logged command runner action.
 *
 * Verifies that the action exists and that doc-gardening delegates its logged
 * checks to the helper instead of embedding the same shell redirection pattern
 * inline four times.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { load } from "js-yaml";

const repoRoot = process.cwd();
const actionPath = path.join(
  repoRoot,
  ".github",
  "actions",
  "run-command-with-log",
  "action.yml",
);
const workflowPath = path.join(
  repoRoot,
  ".github",
  "workflows",
  "doc-gardening.yml",
);

describe("run-command-with-log action", () => {
  it("action file exists and exposes the logged command contract", () => {
    expect(fs.existsSync(actionPath)).toBe(true);
    const content = fs.readFileSync(actionPath, "utf8");

    expect(content).toContain("command:");
    expect(content).toContain("log-path:");
    expect(content).toContain("outcome:");
    expect(content).toContain("exit-code:");
    expect(content).toContain('mkdir -p "$(dirname "$LOG_PATH")"');
    expect(content).toContain('bash -o pipefail -c "$RUN_COMMAND" > "$LOG_PATH" 2>&1');
  });

  it("doc-gardening delegates repeated logged checks to the shared action", () => {
    const content = fs.readFileSync(workflowPath, "utf8");
    const usesCount =
      content.match(/uses: \.\/\.github\/actions\/run-command-with-log/g)
        ?.length ?? 0;

    expect(usesCount).toBe(4);
    expect(content).toContain("steps.check_context.outputs.outcome");
    expect(content).toContain("steps.check_docs.outputs.outcome");
    expect(content).toContain("steps.lint.outputs.outcome");
    expect(content).toContain("steps.format_check.outputs.outcome");

    // The invariant is that a failing check is never swallowed: none of the
    // logged checks may tolerate failure, and one step must turn any failing
    // outcome into a red workflow. `continue-on-error` is allowed on other
    // steps (the diagnostic artifact upload, subject to an account-wide
    // storage quota) as long as it cannot mask a check.
    const parsed = load(content) as {
      jobs?: Record<string, { steps?: Array<Record<string, unknown>> }>;
    };
    const steps = Object.values(parsed.jobs ?? {}).flatMap(
      job => job.steps ?? [],
    );
    for (const id of ["check_context", "check_docs", "lint", "format_check"]) {
      const step = steps.find(candidate => candidate.id === id);
      expect(step, `doc-gardening must keep the ${id} step`).toBeDefined();
      expect(
        step?.["continue-on-error"] ?? false,
        `${id} must not swallow its failure`,
      ).toBe(false);
    }

    const propagatesFailure = steps.some(
      step =>
        ["check_context", "check_docs", "lint", "format_check"].every(id =>
          String(step.if ?? "").includes(`steps.${id}.outputs.outcome`),
        ) &&
        String(step.if ?? "").includes("failure") &&
        String(step.run ?? "")
          .trim()
          .startsWith("exit 1"),
    );
    expect(
      propagatesFailure,
      "doc-gardening must fail the job when any logged check fails",
    ).toBe(true);
    expect(content).not.toContain("> output/validation/doc-gardening/check-context.log 2>&1");
    expect(content).not.toContain("> output/validation/doc-gardening/check-docs.log 2>&1");
    expect(content).not.toContain("> output/validation/doc-gardening/lint.log 2>&1");
    expect(content).not.toContain("> output/validation/doc-gardening/format-check.log 2>&1");
  });
});