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
      expect(content).not.toContain("continue-on-error: true");
    }
  });
});