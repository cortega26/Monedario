/**
 * E2E tests for workflows that build simple issue payloads via shell outputs.
 *
 * Verifies that the weekly search ops and TS7 readiness workflows no longer
 * rely on actions/github-script just to populate issue payload outputs.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const workflows = [
  {
    path: ".github/workflows/weekly-search-ops.yml",
    requiredFragments: [
      'shell: bash',
      'labels_json=["ops","search","weekly"]',
      'desired_state=open',
      'Scorecard generated: \\`$scorecard_generated\\`',
    ],
  },
  {
    path: ".github/workflows/check-ts7-readiness.yml",
    requiredFragments: [
      'shell: bash',
      'desired_state=open',
      'TS7 shipped — execute compatibility audit',
      'docs/backlog/TS7_COMPATIBILITY_AUDIT_2026-04-30.md',
    ],
  },
];

describe("shell issue payload workflows", () => {
  it("target workflows build issue payload outputs without github-script", () => {
    for (const workflow of workflows) {
      const content = fs.readFileSync(path.join(repoRoot, workflow.path), "utf8");

      expect(content).toContain('>> "$GITHUB_OUTPUT"');
      expect(content).not.toContain('uses: actions/github-script@');

      for (const fragment of workflow.requiredFragments) {
        expect(content).toContain(fragment);
      }
    }
  });
});