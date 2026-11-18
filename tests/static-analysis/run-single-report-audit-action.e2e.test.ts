/**
 * E2E tests for the shared single-report audit runner action.
 *
 * Verifies that the action exists and that the single-report governance/data
 * audits delegate bootstrap plus command execution to it instead of embedding
 * the same setup pattern inline.
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
  "run-single-report-audit",
  "action.yml",
);

const delegatedWorkflows = [
  {
    path: ".github/workflows/guardrail-drift-audit.yml",
    command: "command: pnpm run check:policy-registry",
  },
  {
    path: ".github/workflows/editorial-timeliness-audit.yml",
    command: "command: pnpm run check:editorial-timeliness",
  },
  {
    path: ".github/workflows/check-afp-commissions.yml",
    command: "command: node scripts/check-afp-commissions.mjs",
  },
];

type WorkflowStep = {
  name?: string;
  uses?: string;
  if?: string;
  run?: string;
  "continue-on-error"?: boolean | string;
};

function stepsOf(content: string): WorkflowStep[] {
  const parsed = load(content) as {
    jobs?: Record<string, { steps?: WorkflowStep[] }>;
  };
  return Object.values(parsed.jobs ?? {}).flatMap(job => job.steps ?? []);
}

describe("run-single-report-audit action", () => {
  it("action file exists and exposes the shared audit contract", () => {
    expect(fs.existsSync(actionPath)).toBe(true);
    const content = fs.readFileSync(actionPath, "utf8");

    expect(content).toContain("command:");
    expect(content).toContain("node-version:");
    expect(content).toContain("outcome:");
    expect(content).toContain("exit-code:");
    expect(content).toContain("uses: ./.github/actions/bootstrap-pnpm");
    expect(content).toContain("bash -o pipefail -c");
  });

  it("target workflows delegate bootstrap plus audit execution to the shared action", () => {
    for (const workflow of delegatedWorkflows) {
      const content = fs.readFileSync(
        path.join(repoRoot, workflow.path),
        "utf8",
      );

      expect(content).toContain("uses: ./.github/actions/run-single-report-audit");
      expect(content).toContain(workflow.command);
      expect(content).toContain("steps.audit.outputs.outcome");
      expect(content).not.toContain("uses: ./.github/actions/bootstrap-pnpm");

      // The invariant is that the audit outcome is never swallowed: the audit
      // step must not tolerate failure, and a later step must turn a failing
      // outcome into a red workflow. `continue-on-error` stays allowed on other
      // steps (e.g. the diagnostic artifact upload, subject to an account-wide
      // storage quota) as long as it cannot mask the audit itself.
      const steps = stepsOf(content);
      const auditStep = steps.find(
        step => step.uses === "./.github/actions/run-single-report-audit"
      );
      expect(
        auditStep,
        `${workflow.path} must run the shared audit action`
      ).toBeDefined();
      expect(
        auditStep?.["continue-on-error"] ?? false,
        `${workflow.path}: the audit step must not swallow its failure`
      ).toBe(false);

      const propagatesFailure = steps.some(
        step =>
          String(step.if ?? "").includes("steps.audit.outputs.outcome") &&
          String(step.if ?? "").includes("failure") &&
          String(step.run ?? "")
            .trim()
            .startsWith("exit 1")
      );
      expect(
        propagatesFailure,
        `${workflow.path}: a step must fail the workflow when the audit fails`
      ).toBe(true);

    }
  });
});