import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = path.resolve("scripts/check-no-inline-clp-formatters.mjs");
const tempRoots: string[] = [];

function buildRoot(calculadoraAstro: string): string {
  const root = mkdtempSync(path.join(tmpdir(), "no-inline-clp-"));
  tempRoots.push(root);
  const dir = path.join(root, "src", "pages", "calculadoras");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "fixture.astro"), calculadoraAstro, "utf8");
  return root;
}

function run(root: string) {
  return spawnSync("node", [SCRIPT], {
    env: { ...process.env, NO_INLINE_CLP_ROOT: root },
    encoding: "utf8",
  });
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("check-no-inline-clp-formatters", () => {
  it("blocks a divergent CLP formatter without Math.round (rule 2)", () => {
    const root = buildRoot(
      '---\nconst fmt = (n: number) => "$" + n.toLocaleString("es-CL");\n---'
    );
    const r = run(root);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("divergent-clp-no-round");
    expect(r.stderr).toContain("fixture.astro");
  });

  it("blocks an inline const fmtClp definition (rule 1)", () => {
    const root = buildRoot(
      '---\nconst fmtClp = (n: number) => "$" + Math.round(n).toLocaleString("es-CL");\n---'
    );
    const r = run(root);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("inline-clp-formatter-def");
  });

  it("passes when no formatters are defined", () => {
    const root = buildRoot("---\nconst x = 1;\n---");
    const r = run(root);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("OK");
  });

  it("passes with formatCLP usage and single-use Math.round inline expressions", () => {
    const root = buildRoot(
      '---\nimport { formatCLP } from "@/utils/formatCLP";\nconst fmt = formatCLP;\nconst total = "$" + Math.round(1234.5).toLocaleString("es-CL");\n---'
    );
    const r = run(root);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("OK");
  });

  it("passes on toLocaleString with explicit options (UF historic precision)", () => {
    const root = buildRoot(
      '---\nconst valorFmt =\n  "$" +\n  valor.toLocaleString("es-CL", {\n    minimumFractionDigits: 2,\n    maximumFractionDigits: 2,\n  });\n---'
    );
    const r = run(root);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("OK");
  });
});
