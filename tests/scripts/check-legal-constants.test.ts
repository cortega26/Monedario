import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

// check-legal-constants.mjs reads mirrors relative to LEGAL_CONSTANTS_ROOT;
// the fixture tree mirrors the repo layout with controlled values.

const SCRIPT = path.resolve("scripts/check-legal-constants.mjs");
const tempRoots: string[] = [];

const MIRROR_FILES: Record<string, string> = {
  "src/domain/economic/immConstants.ts":
    'export const DEFAULT_IMM = 553_553;\nexport const DEFAULT_IMM_EFFECTIVE_DATE = "2026-05-01";\n',
  "workers/economic-snapshot-refresh/src/buildSnapshot.ts":
    "const DEFAULT_IMM = 553_553;\nconst DEFAULT_IMM_EFFECTIVE_DATE = \"2026-05-01\";\nconst DEFAULT_AFC_MONTHLY_TAXABLE_CAP_UF = 135.2;\nconst DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF = 90;\n",
  "scripts/refresh-economic-snapshot.mjs":
    "const DEFAULT_IMM = 553_553;\nconst DEFAULT_IMM_EFFECTIVE_DATE = \"2026-05-01\";\nconst DEFAULT_AFC_MONTHLY_TAXABLE_CAP_UF = 135.2;\nconst DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF = 90;\n",
  "src/infrastructure/economic/EconomicParameterProvider.ts":
    "const DEFAULT_AFC_MONTHLY_TAXABLE_CAP_UF = 135.2;\nconst DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF = 90;\n",
  "src/application/use-cases/CalculateMonthlyPayrollBase.ts":
    "const DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF = 90;\nconst DEFAULT_UNEMPLOYMENT_MONTHLY_TAXABLE_CAP_UF = 135.2;\n",
  "src/application/use-cases/EstimateUnemploymentCoverage.ts":
    "const DEFAULT_MONTHLY_TAXABLE_CAP_UF = 135.2;\n",
  "src/application/use-cases/SimulateRetirementProjection.ts":
    "const DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF = 90;\n",
};

function makeFixture(mutate: (files: Record<string, string>) => void): string {
  const root = mkdtempSync(path.join(tmpdir(), "legal-constants-"));
  tempRoots.push(root);
  const files: Record<string, string> = { ...MIRROR_FILES };
  mutate(files);
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(root, rel);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, content, "utf8");
  }
  return root;
}

function run(root: string) {
  return spawnSync("node", [SCRIPT], {
    encoding: "utf8",
    env: { ...process.env, LEGAL_CONSTANTS_ROOT: root },
  });
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

describe("check-legal-constants", () => {
  it("passes when all mirrors agree", () => {
    const result = run(makeFixture(() => {}));
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("OK");
  });

  it("fails with the constant name when one mirror drifts", () => {
    const result = run(makeFixture(files => {
      files["scripts/refresh-economic-snapshot.mjs"] = files[
        "scripts/refresh-economic-snapshot.mjs"
      ].replace("553_553", "553_554");
    }));
    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).toContain("DEFAULT_IMM");
    expect(result.stdout + result.stderr).toContain("mismatch");
  });

  it("fails when a mirrored file is missing (no silent pass)", () => {
    const result = run(makeFixture(files => {
      delete files["src/domain/economic/immConstants.ts"];
    }));
    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).toContain("missing mirror");
  });

  it("fails when a mirror cannot be matched (pattern drift)", () => {
    const result = run(makeFixture(files => {
      files["src/application/use-cases/EstimateUnemploymentCoverage.ts"] =
        "const DEFAULT_MONTHLY_TAXABLE_CAP_UF = DEFAULT_OTRO;\n";
    }));
    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).toContain("no match");
  });

  it("does not let a commented-out old value shadow a drifted assignment", () => {
    const result = run(makeFixture(files => {
      const drifted = files[
        "workers/economic-snapshot-refresh/src/buildSnapshot.ts"
      ].replace("const DEFAULT_IMM = 553_553;", "const DEFAULT_IMM = 553_554;");
      files["workers/economic-snapshot-refresh/src/buildSnapshot.ts"] =
        "// const DEFAULT_IMM = 553_553;\n" + drifted;
    }));
    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).toContain("DEFAULT_IMM");
  });

  it("passes against the real repository mirrors (integration)", () => {
    const result = spawnSync("node", [SCRIPT], {
      encoding: "utf8",
      env: { ...process.env, LEGAL_CONSTANTS_ROOT: "" },
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("OK");
  });
});
