import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT_PATH = path.resolve("scripts/check-policy-registry.mjs");
const tempRoots: string[] = [];

function createTempRoot() {
  const root = mkdtempSync(path.join(tmpdir(), "tpi-policy-registry-"));
  tempRoots.push(root);
  return root;
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("check-policy-registry script", () => {
  it("passes against the current repository wiring and emits a report", () => {
    const root = createTempRoot();
    const reportPath = path.join(root, "report.json");

    const result = spawnSync("node", [SCRIPT_PATH, "--report", reportPath], {
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("[check-policy-registry] OK");

    const report = JSON.parse(readFileSync(reportPath, "utf8"));
    expect(report.status).toBe("ok");
    expect(report.summary.errorCount).toBe(0);
    expect(report.summary.policyCount).toBeGreaterThan(0);
  });
});
