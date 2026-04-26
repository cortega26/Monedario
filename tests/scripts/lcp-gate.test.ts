import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  checkLcpViolations,
  DEFAULT_THRESHOLD_MS,
  MIN_SAMPLES,
  OWNER_ROUTES,
} from "../../scripts/data-signals/lcp-gate.mjs";

const SCRIPT = path.resolve("scripts/data-signals/lcp-gate.mjs");

function run(args: string[]) {
  return spawnSync("node", [SCRIPT, ...args], { encoding: "utf8" });
}

function makeRow(
  routePath: string,
  lcpP75Ms: number | null,
  count = MIN_SAMPLES
) {
  return { path: routePath, lcpP75Ms, clsP75: 0.05, inpP75Ms: 150, count };
}

// ---------------------------------------------------------------------------
// Pure function — checkLcpViolations
// ---------------------------------------------------------------------------

describe("checkLcpViolations", () => {
  it("returns empty array when all owner routes are within threshold", () => {
    const data = OWNER_ROUTES.map(p => makeRow(p, 2000));
    expect(checkLcpViolations(data)).toEqual([]);
  });

  it("detects a single owner route exceeding threshold", () => {
    const data = [
      makeRow("/calculadoras/sueldo-liquido/", 5000),
      makeRow("/calculadoras/apv/", 1800),
    ];
    const violations = checkLcpViolations(data);
    expect(violations).toHaveLength(1);
    expect(violations[0].path).toBe("/calculadoras/sueldo-liquido/");
    expect(violations[0].lcpP75Ms).toBe(5000);
  });

  it("does not flag a non-owner route above threshold", () => {
    const data = [makeRow("/blog/alguna-pagina/", 9999)];
    expect(checkLcpViolations(data)).toEqual([]);
  });

  it("skips owner routes with null LCP (no data)", () => {
    const data = [makeRow("/calculadoras/sueldo-liquido/", null)];
    expect(checkLcpViolations(data)).toEqual([]);
  });

  it("skips owner routes with count below MIN_SAMPLES (unreliable p75)", () => {
    const data = [makeRow("/calculadoras/apv/", 5000, MIN_SAMPLES - 1)];
    expect(checkLcpViolations(data)).toEqual([]);
  });

  it("includes owner route at exactly MIN_SAMPLES and above threshold", () => {
    const data = [makeRow("/calculadoras/apv/", 5000, MIN_SAMPLES)];
    expect(checkLcpViolations(data)).toHaveLength(1);
  });

  it("respects a custom threshold", () => {
    const data = [makeRow("/calculadoras/sueldo-liquido/", 3000)];
    expect(checkLcpViolations(data, OWNER_ROUTES, 2500)).toHaveLength(1);
    expect(checkLcpViolations(data, OWNER_ROUTES, DEFAULT_THRESHOLD_MS)).toEqual([]);
  });

  it("normalizes paths without trailing slash to match owner routes", () => {
    const data = [makeRow("/calculadoras/sueldo-liquido", 5000)];
    const violations = checkLcpViolations(data);
    expect(violations).toHaveLength(1);
  });

  it("returns all violations when multiple owner routes breach threshold", () => {
    const data = [
      makeRow("/calculadoras/sueldo-liquido/", 4500),
      makeRow("/calculadoras/apv/", 5200),
      makeRow("/calculadoras/operacion-renta/", 1900),
    ];
    const violations = checkLcpViolations(data);
    expect(violations).toHaveLength(2);
    expect(violations.map(v => v.path)).toContain("/calculadoras/sueldo-liquido/");
    expect(violations.map(v => v.path)).toContain("/calculadoras/apv/");
  });
});

// ---------------------------------------------------------------------------
// OWNER_ROUTES constant
// ---------------------------------------------------------------------------

describe("OWNER_ROUTES", () => {
  it("contains all six wired calculator routes with trailing slashes", () => {
    const expected = [
      "/calculadoras/sueldo-liquido/",
      "/calculadoras/apv/",
      "/calculadoras/impuesto-segunda-categoria/",
      "/calculadoras/comisiones-afp/",
      "/calculadoras/finiquito-indemnizacion/",
      "/calculadoras/operacion-renta/",
    ];
    expect(OWNER_ROUTES).toEqual(expected);
  });
});

// ---------------------------------------------------------------------------
// CLI error paths
// ---------------------------------------------------------------------------

describe("lcp-gate CLI", () => {
  it("exits 0 and prints usage with --help", () => {
    const r = run(["--help"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("lcp-gate");
    expect(r.stdout).toContain("--week=YYYY-Www");
  });

  it("exits 1 when --week is missing", () => {
    const r = run([]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("--week is required");
  });

  it("exits 1 for invalid --week format", () => {
    const r = run(["--week=not-a-week"]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("Invalid --week format");
  });

  it("exits 1 for unknown argument", () => {
    const r = run(["--week=2026-W17", "--unknown-flag"]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("Unknown argument");
  });

  it("exits 1 for non-positive --threshold", () => {
    const r = run(["--week=2026-W17", "--threshold=0"]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("Invalid --threshold");
  });

  it("exits 0 with a warning when the RUM file does not exist", () => {
    const r = run(["--week=1999-W01"]);
    expect(r.status).toBe(0);
    expect(r.stderr).toContain("RUM file not found");
    expect(r.stderr).toContain("exit 0");
  });
});
