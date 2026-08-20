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

function writePage(root: string, name: string, source: string) {
  writeFileSync(path.join(root, "src", "pages", `${name}.astro`), source, "utf8");
}

function writeExternalSummary(root: string, summary: unknown) {
  const summaryDir = path.join(root, "output", "validation", "urlcheck");
  mkdirSync(summaryDir, { recursive: true });
  writeFileSync(
    path.join(summaryDir, "external-summary.json"),
    JSON.stringify(summary, null, 2),
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

  it("warns only for reader-facing implementation vocabulary", () => {
    const root = createTempProject();
    writeCalculator(root, "demo", compliantCalculator);
    writePage(
      root,
      "apoyar",
      `---
const widgetId = "internal";
---
<!-- widget comment is not reader-facing -->
<script>const widget = "internal";</script>
<div id="kofi-widget-container">Este widget se ve.</div>
`
    );

    const result = runCheck(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("ASD-004/meta-widget");
  });

  it("ignores implementation-only vocabulary in comments, scripts and attributes", () => {
    const root = createTempProject();
    writeCalculator(root, "demo", compliantCalculator);
    writePage(
      root,
      "apoyar",
      `---
const widgetId = "internal";
---
<!-- widget comment is not reader-facing -->
<script>const widget = "internal";</script>
<div id="kofi-widget-container">Panel de aporte</div>
`
    );

    const result = runCheck(root);

    expect(result.status).toBe(0);
    expect(result.stdout).not.toContain("ASD-004/meta-widget");
  });

  it("accepts documented official-host network-error budget", () => {
    const root = createTempProject();
    writeCalculator(root, "demo", compliantCalculator);
    writeExternalSummary(root, {
      blockingFailures: 0,
      totalNonOk: 4,
      byClassification: { network_error: 4 },
      byHost: {
        "www.superir.gob.cl": { total: 3, network_error: 3 },
        "www.tta.cl": { total: 1, network_error: 1 },
      },
    });

    const result = runCheck(root, true);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("warnings=0");
    expect(result.stdout).not.toContain("ASD-403/external-url-non-ok-budget");
  });

  it("warns when external URL non-OK findings exceed accepted network-error budget", () => {
    const root = createTempProject();
    writeCalculator(root, "demo", compliantCalculator);
    writeExternalSummary(root, {
      blockingFailures: 0,
      totalNonOk: 5,
      byClassification: { network_error: 5 },
      byHost: {
        "www.superir.gob.cl": { total: 4, network_error: 4 },
        "www.tta.cl": { total: 1, network_error: 1 },
      },
    });

    const result = runCheck(root, true);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("warnings=1");
    expect(result.stdout).toContain("ASD-403/external-url-non-ok-budget");
  });

  it("fails on direct open-side bold glue: texto<strong>", () => {
    const root = createTempProject();
    writePage(
      root,
      "glue",
      `---
const visible = "sí";
---
<p>El texto<strong class="x">pegado</strong> aquí.</p>
`
    );

    const result = runCheck(root, true);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("bold-glue");
  });

  it("fails on newline open-side bold glue: texto\\n<strong>", () => {
    const root = createTempProject();
    writePage(
      root,
      "glue",
      `---
const visible = "sí";
---
<p>El texto
<strong class="x">pegado</strong> aquí.</p>
`
    );

    const result = runCheck(root, true);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("bold-glue");
  });

  it("fails on direct close-side bold glue: </strong>texto", () => {
    const root = createTempProject();
    writePage(
      root,
      "glue",
      `---
const visible = "sí";
---
<p><strong class="x">Pegado</strong>texto aquí.</p>
`
    );

    const result = runCheck(root, true);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("bold-glue");
  });

  it("fails on newline close-side bold glue: </strong>\\ntexto", () => {
    const root = createTempProject();
    writePage(
      root,
      "glue",
      `---
const visible = "sí";
---
<p><strong class="x">Pegado</strong>
texto aquí.</p>
`
    );

    const result = runCheck(root, true);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("bold-glue");
  });

  it("passes when a space separates text and <strong>", () => {
    const root = createTempProject();
    writePage(
      root,
      "bien",
      `---
const visible = "sí";
---
<p>El texto <strong class="x">con espacio</strong> aquí.</p>
`
    );

    const result = runCheck(root, true);

    expect(result.status).toBe(0);
    expect(result.stdout).not.toContain("bold-glue");
  });

  it("does not flag punctuation after closing bold", () => {
    const root = createTempProject();
    writePage(
      root,
      "bien",
      `---
const visible = "sí";
---
<p>El texto <strong class="x">con espacio</strong>, y más.</p>
`
    );

    const result = runCheck(root, true);

    expect(result.status).toBe(0);
    expect(result.stdout).not.toContain("bold-glue");
  });

  it("does not flag block-level <strong> at the start of a line after a tag", () => {
    const root = createTempProject();
    writePage(
      root,
      "bloque",
      `---
const visible = "sí";
---
<p>
  <strong class="x">Bloque</strong> válido.
</p>
`
    );

    const result = runCheck(root, true);

    expect(result.status).toBe(0);
    expect(result.stdout).not.toContain("bold-glue");
  });
});
