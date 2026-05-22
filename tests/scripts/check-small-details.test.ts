import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT_PATH = path.resolve("scripts/check-small-details.mjs");
const tempRoots: string[] = [];

function createTempProject() {
  const root = mkdtempSync(path.join(tmpdir(), "tpi-check-small-details-"));
  tempRoots.push(root);
  mkdirSync(path.join(root, "src", "pages", "calculadoras"), {
    recursive: true,
  });
  mkdirSync(path.join(root, "src", "pages"), { recursive: true });
  mkdirSync(path.join(root, "src", "data", "blog"), { recursive: true });
  return root;
}

function writeCalculator(root: string, name: string, source: string) {
  writeFileSync(
    path.join(root, "src", "pages", "calculadoras", `${name}.astro`),
    source,
    "utf8"
  );
}

function runCheck(root: string, enforce = false) {
  return spawnSync("node", [SCRIPT_PATH], {
    encoding: "utf8",
    env: {
      ...process.env,
      SMALL_DETAILS_CHECK_ROOT: root,
      ...(enforce ? { SMALL_DETAILS_ENFORCE: "1" } : {}),
    },
  });
}

const compliantCalculator = `---
import CalculatorTrustBadge from "@/components/CalculatorTrustBadge.astro";
import ShareCalculatorResult from "@/components/ShareCalculatorResult.astro";
import MethodologyBlock from "@/components/MethodologyBlock.astro";
---
<CalculatorTrustBadge location="calculator_header" />
<button id="calcBtn">Calcular</button>
<div id="demo-error" role="alert"></div>
<ShareCalculatorResult />
<MethodologyBlock title="Metodología" />
<script>
  function showInlineError(message) {
    const errorBox = document.getElementById("demo-error");
    if (!errorBox) return;
    errorBox.textContent = message;
  }
</script>
`;

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("check-small-details script", () => {
  it("passes when calculator trust surfaces and error wiring are present", () => {
    const root = createTempProject();
    writeCalculator(root, "demo", compliantCalculator);

    const result = runCheck(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("calculator_pages=1 errors=0");
    expect(result.stdout).toContain("mode=warn-only");
  });

  it("reports but does not fail pre-existing details in warn-only mode", () => {
    const root = createTempProject();
    writeCalculator(
      root,
      "demo",
      compliantCalculator.replace('id="demo-error"', 'id="other-error"')
    );

    const result = runCheck(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("ASD-101/missing-error-target");
    expect(result.stdout).toContain("Gate in warn-only mode");
  });

  it("fails in enforce mode when a calculator validation selector has no matching error node", () => {
    const root = createTempProject();
    writeCalculator(
      root,
      "demo",
      compliantCalculator.replace('id="demo-error"', 'id="other-error"')
    );

    const result = runCheck(root, true);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("ASD-101/missing-error-target");
  });

  it("fails when a calculator is missing a required trust surface", () => {
    const root = createTempProject();
    writeCalculator(
      root,
      "demo",
      compliantCalculator
        .replace(
          'import MethodologyBlock from "@/components/MethodologyBlock.astro";',
          ""
        )
        .replace('<MethodologyBlock title="Metodología" />', "")
    );

    const result = runCheck(root, true);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("ASD-102/calculator-methodology");
  });
});
