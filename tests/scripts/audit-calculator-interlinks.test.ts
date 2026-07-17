import path from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

const SCRIPT_PATH = path.resolve("scripts/audit-calculator-interlinks.mjs");

function run(args: string[] = []) {
  return spawnSync("node", [SCRIPT_PATH, ...args], { encoding: "utf8" });
}

describe("audit-calculator-interlinks script", () => {
  it("reports editorial and total inbound links per active calculator", () => {
    const result = run();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "[audit-calculator-interlinks] active calculators:"
    );
    expect(result.stdout).toContain("editorial  total  calculator");
    // A stable, heavily-linked owner surface must appear in the ranking.
    expect(result.stdout).toContain("sueldo-liquido");
  });

  it("emits machine-readable rows with the expected shape under --json", () => {
    const result = run(["--json"]);
    expect(result.status).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(Array.isArray(payload.rows)).toBe(true);
    expect(payload.rows.length).toBeGreaterThanOrEqual(20);
    for (const row of payload.rows) {
      expect(typeof row.slug).toBe("string");
      expect(Number.isInteger(row.inboundEditorial)).toBe(true);
      expect(Number.isInteger(row.inboundTotal)).toBe(true);
      expect(row.inboundTotal).toBeGreaterThanOrEqual(row.inboundEditorial);
    }
  });

  it("never counts a calculator's own page as an inbound link", () => {
    const result = run(["--json"]);
    const payload = JSON.parse(result.stdout);
    for (const row of payload.rows) {
      const selfPage = `src/pages/calculadoras/${row.slug}.astro`;
      expect(row.editorialSources).not.toContain(selfPage);
    }
  });

  it("stays informational (exit 0) with a permissive floor", () => {
    const result = run(["--min=0"]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "under-linked calculators (< 0 editorial): none"
    );
  });

  it("fails under --strict when a floor cannot be met (guardrail mode)", () => {
    const result = run(["--strict", "--min=100"]);
    expect(result.status).toBe(1);
  });
});
