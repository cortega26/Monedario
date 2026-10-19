import fs from "node:fs";
import path from "node:path";

import { JSON_SCHEMA, load } from "js-yaml";
import { describe, expect, it } from "vitest";

const workflowPath = path.join(
  process.cwd(),
  ".github",
  "workflows",
  "weekly-search-ops.yml"
);
const source = fs.readFileSync(workflowPath, "utf8");
const workflow = load(source, { schema: JSON_SCHEMA }) as {
  on: {
    schedule: Array<{ cron: string }>;
    workflow_dispatch: Record<string, unknown> | null;
  };
  permissions: Record<string, string>;
  jobs: Record<string, { "runs-on": string }>;
};

describe("weekly search ops at current scale", () => {
  it("runs every Monday without an ISO-week parity gate", () => {
    expect(Object.keys(workflow.on).sort()).toEqual([
      "schedule",
      "workflow_dispatch",
    ]);
    expect(workflow.on.schedule).toEqual([{ cron: "15 8 * * 1" }]);
    expect(source).not.toContain("Gate cadence");
    expect(source).not.toContain("steps.cadence");
    expect(source).not.toMatch(/WEEK_NUM|%\s*2|odd ISO|even ISO/i);
  });

  it("preserves the runner fallback and least-privilege workflow permissions", () => {
    expect(workflow.permissions).toEqual({ contents: "read", issues: "write" });
    expect(workflow.jobs["weekly-ops"]?.["runs-on"]).toBe(
      "${{ vars.ACTIONS_RUNNER_LABEL || 'ubuntu-24.04' }}"
    );
  });

  it("classifies analytics incidents without the obsolete traffic deferral", () => {
    expect(source).toContain("ANALYTICS_STATUS=missing");
    expect(source).toContain("ANALYTICS_STATUS=available");
    expect(source).toContain("ANALYTICS_STATUS=invalid");
    expect(source).toContain("Decide 1-3 next actions");
    expect(source).toContain("2026-08-01 cadence review");
    expect(source).not.toMatch(/100\s+(clicks|clics)|traffic warrants/i);
  });
});
