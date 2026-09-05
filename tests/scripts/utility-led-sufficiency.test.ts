/**
 * Tests para la regla de denominador mínimo (plan 084):
 *  - `minimumDenominator` calcula el n mínimo para descartar un umbral con 95%
 *    de confianza, sin lanzar ante entradas inválidas.
 *  - El scorecard semanal marca una señal con denominador insuficiente como
 *    "SIN DATOS SUFICIENTES" (nunca como HALT ni como 0%), y conserva la
 *    clasificación (rate) ya publicada para señales con denominador
 *    suficiente.
 *  - El Gate D de sostenibilidad imprime una línea inequívoca "SIN REGISTRO"
 *    cuando weeklyHours, weeklyCostClp y burnoutLevel1To5 llegan en null.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync, mkdtempSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  minimumDenominator,
  sufficiencyLabel,
} from "../../scripts/build-weekly-search-report.mjs";

const SCRIPT_PATH = path.resolve("scripts/build-weekly-search-report.mjs");
const tempRoots: string[] = [];

function createTempRoot() {
  const root = mkdtempSync(path.join(tmpdir(), "tpi-utility-led-"));
  tempRoots.push(root);
  return root;
}

function runScript(args: string[]) {
  return spawnSync("node", [SCRIPT_PATH, ...args], { encoding: "utf8" });
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

function makeMinimalBundle(inputDir: string) {
  mkdirSync(inputDir, { recursive: true });

  writeFileSync(
    path.join(inputDir, "gsc-pages.csv"),
    [
      "Top pages,Clicks,Clicks Difference,Impressions,Impressions Difference,CTR,CTR Difference,Position,Position Difference",
      "https://monedario.cl/calculadoras/tool-a/,40,5,500,50,8.0%,0.5%,3.2,-0.3",
    ].join("\n"),
    "utf8"
  );

  writeFileSync(
    path.join(inputDir, "gsc-queries.csv"),
    [
      "Top queries,Clicks,Clicks Difference,Impressions,Impressions Difference,CTR,CTR Difference,Position,Position Difference",
      "tool a query,35,5,300,40,11.0%,1.0%,3.5,-0.4",
    ].join("\n"),
    "utf8"
  );

  writeFileSync(
    path.join(inputDir, "indexation-summary.json"),
    JSON.stringify({
      weekLabel: path.basename(inputDir),
      dateRange: {
        currentStart: "2026-08-24",
        currentEnd: "2026-08-30",
        previousStart: "2026-08-17",
        previousEnd: "2026-08-23",
      },
      google: { sitemapStatus: "ok", coverageNotes: "ok", alerts: [], manualActions: "none", enhancementIssues: [] },
      bing: { sitemapStatus: "ok", coverageNotes: "ok", alerts: [] },
      notes: [],
    }),
    "utf8"
  );
}

function makeWatchlist(root: string) {
  const watchlistPath = path.join(root, "watchlist.json");
  writeFileSync(
    watchlistPath,
    JSON.stringify({
      site: "monedario.cl",
      pages: [
        {
          path: "/calculadoras/tool-a/",
          label: "Tool A",
          cluster: "alpha",
          role: "tool",
          queryThemes: ["tool a"],
          nextStepPaths: [],
        },
      ],
    }),
    "utf8"
  );
  return watchlistPath;
}

function makeAnalyticsJson(dir: string, week: string, data: object[]) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    path.join(dir, `${week}.json`),
    JSON.stringify(
      {
        source: "first-party-events",
        schemaVersion: 1,
        week,
        window: { from: "2026-08-24", to: "2026-08-30" },
        data,
      },
      null,
      2
    ) + "\n",
    "utf8"
  );
}

describe("minimumDenominator", () => {
  it("returns 149 for the alert-interest GREEN threshold (2%)", () => {
    expect(minimumDenominator(0.02)).toBe(149);
  });

  it("returns 598 for the support-click GREEN threshold (0.5%)", () => {
    expect(minimumDenominator(0.005)).toBe(598);
  });

  it("returns 99 for the next-step HALT threshold (3%)", () => {
    expect(minimumDenominator(0.03)).toBe(99);
  });

  it("returns null for invalid threshold rates without throwing", () => {
    expect(minimumDenominator(0)).toBeNull();
    expect(minimumDenominator(1)).toBeNull();
    expect(minimumDenominator(-0.1)).toBeNull();
    expect(minimumDenominator(NaN)).toBeNull();
  });
});

describe("sufficiencyLabel", () => {
  it("labels a below-minimum denominator as SIN DATOS SUFICIENTES, never HALT", () => {
    // alert_interest_shown=79 real (W31-W35), umbral GREEN 2% -> n_min=149.
    expect(sufficiencyLabel(79, 0.02)).toBe("SIN DATOS SUFICIENTES");
    expect(sufficiencyLabel(79, 0.02)).not.toBe("HALT");
  });

  it("labels an at-or-above-minimum denominator as SUFICIENTE", () => {
    // next_step_shown=108 real (W31-W35), umbral HALT 3% -> n_min=99.
    expect(sufficiencyLabel(108, 0.03)).toBe("SUFICIENTE");
  });
});

describe("weekly scorecard: denominator sufficiency rendering", () => {
  it("marks low-denominator signals as SIN DATOS SUFICIENTES while a zero rate keeps reading 0.0% (not HALT)", () => {
    const root = createTempRoot();
    const week = "2026-W35";
    const inputDir = path.join(root, week);
    makeMinimalBundle(inputDir);

    const analyticsDir = path.join(root, "analytics");
    // Volúmenes reales W31-W35 citados en el plan 084: next-step suficiente
    // (108 >= 99), alerta y apoyo insuficientes (79 < 149, 62 < 598), todas
    // con 0 clics/envíos observados.
    makeAnalyticsJson(analyticsDir, week, [
      { date: "2026-08-25", event_name: "calculator_view", calculator_slug: "tool-a", dimensions: "", count: 1000 },
      { date: "2026-08-25", event_name: "calculator_start", calculator_slug: "tool-a", dimensions: "", count: 500 },
      { date: "2026-08-25", event_name: "calculator_complete", calculator_slug: "tool-a", dimensions: "", count: 100 },
      { date: "2026-08-25", event_name: "next_step_shown", calculator_slug: "tool-a", dimensions: "", count: 108 },
      { date: "2026-08-25", event_name: "next_step_click", calculator_slug: "tool-a", dimensions: "", count: 0 },
      { date: "2026-08-25", event_name: "alert_interest_shown", calculator_slug: "tool-a", dimensions: "", count: 79 },
      { date: "2026-08-25", event_name: "alert_interest_submit", calculator_slug: "tool-a", dimensions: "", count: 0 },
      { date: "2026-08-25", event_name: "support_shown", calculator_slug: "tool-a", dimensions: "", count: 62 },
      { date: "2026-08-25", event_name: "support_click", calculator_slug: "tool-a", dimensions: "", count: 0 },
    ]);

    const watchlistPath = makeWatchlist(root);
    const markdownOut = path.join(inputDir, "scorecard.md");
    const jsonOut = path.join(inputDir, "scorecard.json");

    const result = runScript([
      "--input", inputDir,
      "--watchlist", watchlistPath,
      "--out", markdownOut,
      "--json-out", jsonOut,
      "--analytics-json-dir", analyticsDir,
    ]);

    expect(result.status).toBe(0);
    const markdown = readFileSync(markdownOut, "utf8");

    // Regresión: las razones ya publicadas no cambian de valor.
    expect(markdown).toContain("0.0%");

    // Denominador insuficiente -> etiqueta explícita, nunca HALT desnudo ni
    // un 0% sin contexto de suficiencia.
    const alertLine = markdown
      .split("\n")
      .find(line => line.includes("Interés aviso / mostrado"));
    expect(alertLine).toBeDefined();
    expect(alertLine).toContain("n=79");
    expect(alertLine).toContain("n_min=149");
    expect(alertLine).toContain("SIN DATOS SUFICIENTES");

    const supportLine = markdown
      .split("\n")
      .find(line => line.includes("Apoyo click / mostrado"));
    expect(supportLine).toBeDefined();
    expect(supportLine).toContain("n=62");
    expect(supportLine).toContain("n_min=598");
    expect(supportLine).toContain("SIN DATOS SUFICIENTES");

    // Denominador suficiente -> clasificación conservada (no se recalifica).
    const nextStepLine = markdown
      .split("\n")
      .find(line => line.includes("Siguiente paso / mostrado"));
    expect(nextStepLine).toBeDefined();
    expect(nextStepLine).toContain("n=108");
    expect(nextStepLine).toContain("n_min=99");
    expect(nextStepLine).toContain("SUFICIENTE");
    expect(nextStepLine).not.toContain("SIN DATOS SUFICIENTES");

    // Columnas por calculadora agregadas a la tabla existente (no reemplazan
    // las columnas de razón ya publicadas).
    expect(markdown).toContain("Next suficiencia");
    expect(markdown).toContain("Alert suficiencia");
    expect(markdown).toContain("Support suficiencia");
  });
});

describe("weekly scorecard: Gate D sustainability capture", () => {
  it('prints "SIN REGISTRO" when weeklyHours, weeklyCostClp and burnoutLevel1To5 are null', () => {
    const root = createTempRoot();
    const week = "2026-W35";
    const inputDir = path.join(root, week);
    makeMinimalBundle(inputDir);

    // Documento tal como lo genera `--init`, sin llenar los campos que
    // gobiernan la continuidad (extracto 3 del plan 084).
    writeFileSync(
      path.join(inputDir, "utility-led-ops.json"),
      JSON.stringify(
        {
          schemaVersion: 1,
          week,
          weeklyHours: null,
          weeklyCostClp: null,
          tokenUsage: null,
          burnoutLevel1To5: null,
          qualityIncidents: [],
          learningSignal: null,
          reputationSignal: null,
          maintenanceTasks: [],
          blockers: [],
          revenueClpOptional: null,
          note: "Ingresos cero no son fallo; la sostenibilidad es el gate de continuidad.",
        },
        null,
        2
      ) + "\n",
      "utf8"
    );

    const watchlistPath = makeWatchlist(root);
    const markdownOut = path.join(inputDir, "scorecard.md");
    const jsonOut = path.join(inputDir, "scorecard.json");

    const result = runScript([
      "--input", inputDir,
      "--watchlist", watchlistPath,
      "--out", markdownOut,
      "--json-out", jsonOut,
    ]);

    expect(result.status).toBe(0);
    const markdown = readFileSync(markdownOut, "utf8");
    expect(markdown).toContain("Gate D: SIN REGISTRO");
    expect(markdown).toContain("utility-led-ops.json");

    const json = JSON.parse(readFileSync(jsonOut, "utf8"));
    expect(json.utilityLed.operations.status).toBe("INPUT_REQUIRED");
  });
});
