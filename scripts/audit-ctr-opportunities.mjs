#!/usr/bin/env node

/**
 * Bounded, on-demand full-catalog CTR opportunity sweep.
 *
 * Defaults to the latest four complete weekly GSC page artifacts. Use --all
 * only for intentional all-history discovery. The 3.5% threshold is a
 * prioritization heuristic, never an expected CTR or click forecast.
 */

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { isoWeekWindow } from "./lib/iso-week.mjs";

const DEFAULT_GSC_DIR = "output/operations/data-signals/gsc";
const DEFAULT_ROLLING_WEEKS = 4;
const MIN_IMPRESSIONS = 150;
const POSITION_MIN = 4;
const POSITION_MAX = 15;
const CTR_OPPORTUNITY_HEURISTIC = 0.035;

function parseArgs(argv) {
  const today = new Date().toISOString().slice(0, 10);
  const options = {
    gscDir: DEFAULT_GSC_DIR,
    weeks: DEFAULT_ROLLING_WEEKS,
    all: false,
    outputFile: `docs/reports/CTR-AUDIT-${today}.md`,
    jsonFile: `docs/reports/CTR-AUDIT-${today}.json`,
  };
  let weeksSpecified = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--gsc-dir") {
      options.gscDir = argv[++index] ?? "";
    } else if (arg === "--weeks") {
      weeksSpecified = true;
      options.weeks = Number(argv[++index]);
    } else if (arg === "--all") {
      options.all = true;
    } else if (arg === "--out") {
      options.outputFile = argv[++index] ?? "";
    } else if (arg === "--json-out") {
      options.jsonFile = argv[++index] ?? "";
    } else if (arg === "--help" || arg === "-h") {
      console.log(`Usage:
  node scripts/audit-ctr-opportunities.mjs [options]

Options:
  --gsc-dir <dir>   GSC artifact directory (default: ${DEFAULT_GSC_DIR})
  --weeks <count>   Latest complete weeks to include (default: ${DEFAULT_ROLLING_WEEKS})
  --all             Explicit all-history discovery mode
  --out <file>      Markdown output path
  --json-out <file> JSON output path`);
      process.exit(0);
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }

  if (!options.gscDir || !options.outputFile || !options.jsonFile) {
    throw new Error("--gsc-dir, --out, and --json-out require non-empty values");
  }
  if (!Number.isInteger(options.weeks) || options.weeks < 1) {
    throw new Error("--weeks must be a positive integer");
  }
  if (options.all && weeksSpecified) {
    throw new Error("--all and --weeks are mutually exclusive");
  }
  return options;
}

function readWeeklyArtifact(gscDir, file) {
  const filePath = path.join(gscDir, file);
  const fileWeek = file.replace(/-pages\.json$/, "");
  let doc;
  try {
    doc = JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    throw new Error(`invalid artifact ${path.resolve(filePath)}: invalid JSON`);
  }
  const expectedWindow = isoWeekWindow(fileWeek);
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
    throw new Error(`invalid artifact ${path.resolve(filePath)}: root must be an object`);
  }
  if (doc.schemaVersion !== 1 || doc.source !== "gsc" || doc.week !== fileWeek) {
    throw new Error(
      `invalid artifact ${path.resolve(filePath)}: schemaVersion/source/week mismatch`
    );
  }
  if (
    !expectedWindow ||
    doc.window?.from !== expectedWindow.from ||
    doc.window?.to !== expectedWindow.to
  ) {
    throw new Error(`invalid artifact ${path.resolve(filePath)}: window mismatch`);
  }
  if (!Array.isArray(doc.data)) {
    throw new Error(`invalid artifact ${path.resolve(filePath)}: data must be an array`);
  }
  return doc;
}

function percent(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function buildMarkdown(report) {
  const candidateRows = report.candidates.length
    ? report.candidates
        .map(
          candidate =>
            `| ${candidate.page} | ${candidate.weeks} | ${candidate.impressions} | ${candidate.clicks} | ${percent(candidate.ctr)} | ${candidate.position.toFixed(1)} | ${candidate.heuristicGapPp.toFixed(2)} pp |`
        )
        .join("\n")
    : "| _(ninguna página supera el umbral)_ | | | | | | |";
  const rankingRows = report.rankingBound.length
    ? report.rankingBound
        .slice(0, 10)
        .map(
          page =>
            `| ${page.page} | ${page.impressions} | ${percent(page.ctr)} | ${page.position.toFixed(1)} |`
        )
        .join("\n")
    : "| _(ninguna)_ | | | |";

  return `# Auditoría de oportunidades de CTR

**Fecha:** ${report.generatedAt.slice(0, 10)}
**Alcance:** catálogo completo — páginas con datos en los artefactos seleccionados
**Modo de ventana:** ${report.window.mode}
**Semanas seleccionadas:** ${report.window.selectedWeeks.join(", ")} (${report.window.selectedWeeks.length} semanas)
**Generado por:** \`scripts/audit-ctr-opportunities.mjs\` — barrido puntual, no programado

## Método

Se agregan solo los artefactos semanales seleccionados, sumando clics e
impresiones por página y calculando la posición media ponderada por impresiones.
La selección predeterminada usa las últimas ${DEFAULT_ROLLING_WEEKS} semanas
completas; \`--all\` habilita de forma explícita el descubrimiento histórico.

Una página es candidata si registra al menos ${MIN_IMPRESSIONS} impresiones,
posición media entre ${POSITION_MIN} y ${POSITION_MAX}, y CTR bajo
${percent(CTR_OPPORTUNITY_HEURISTIC)}. Ese porcentaje es un **heurístico de oportunidad**
para priorizar revisión; no es KPI, calibración ni pronóstico.
La brecha se expresa solo en puntos porcentuales y no se proyectan clics.

## Resumen

- Páginas analizadas: **${report.totals.pagesAnalyzed}**
- Candidatas a revisión de title/snippet: **${report.totals.candidates}**
- Heurístico de oportunidad CTR: **${percent(CTR_OPPORTUNITY_HEURISTIC)}**
- Proyección universal de clics: **no se calcula**

## Candidatas — revisión de title/meta description

| Página | Semanas | Impresiones | Clics | CTR | Posición | Brecha heurística CTR |
|---|---|---|---|---|---|---|
${candidateRows}

## Fuera de alcance — problema de ranking, no de CTR

| Página | Impresiones | CTR | Posición |
|---|---|---|---|
${rankingRows}

## Advertencias

- El heurístico no calibra posición exacta, intención, marca, dispositivo ni
  estacionalidad. Una página con cero clics tampoco recibe un pronóstico.
- Conviene confirmar la tendencia antes de actuar sobre pocas semanas.
- Las reescrituras pasan por el proceso editorial; este informe es evidencia,
  no contenido ni autorización para editar una superficie YMYL.
`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const pageFiles = readdirSync(options.gscDir)
    .filter(file => /^\d{4}-W\d{2}-pages\.json$/.test(file))
    .sort();
  if (pageFiles.length === 0) {
    throw new Error(`no *-pages.json files found in ${options.gscDir}`);
  }
  const selectedFiles = options.all ? pageFiles : pageFiles.slice(-options.weeks);
  const documents = selectedFiles.map(file => readWeeklyArtifact(options.gscDir, file));
  const selectedWeeks = documents.map(document => document.week);

  /** @type {Map<string, {clicks:number,impressions:number,posImpr:number,weeks:Set<string>}>} */
  const pages = new Map();
  for (const document of documents) {
    for (const row of document.data) {
      if (!row.page || !row.impressions) continue;
      const aggregate = pages.get(row.page) ?? {
        clicks: 0,
        impressions: 0,
        posImpr: 0,
        weeks: new Set(),
      };
      aggregate.clicks += row.clicks ?? 0;
      aggregate.impressions += row.impressions;
      aggregate.posImpr += (row.position ?? 0) * row.impressions;
      aggregate.weeks.add(document.week);
      pages.set(row.page, aggregate);
    }
  }

  const analyzed = [...pages.entries()].map(([pageUrl, aggregate]) => ({
    page: pageUrl.replace(/^https?:\/\/[^/]+/, ""),
    clicks: aggregate.clicks,
    impressions: aggregate.impressions,
    ctr: aggregate.clicks / aggregate.impressions,
    position: aggregate.posImpr / aggregate.impressions,
    weeks: aggregate.weeks.size,
  }));
  const candidates = analyzed
    .filter(
      page =>
        page.impressions >= MIN_IMPRESSIONS &&
        page.position >= POSITION_MIN &&
        page.position <= POSITION_MAX &&
        page.ctr < CTR_OPPORTUNITY_HEURISTIC
    )
    .map(page => ({
      ...page,
      heuristicGapPp: (CTR_OPPORTUNITY_HEURISTIC - page.ctr) * 100,
    }))
    .sort(
      (left, right) =>
        right.heuristicGapPp - left.heuristicGapPp ||
        right.impressions - left.impressions
    );
  const rankingBound = analyzed
    .filter(
      page => page.impressions >= MIN_IMPRESSIONS && page.position > POSITION_MAX
    )
    .sort((left, right) => right.impressions - left.impressions);
  const report = {
    generatedAt: new Date().toISOString(),
    window: {
      mode: options.all ? "all-history-discovery" : "rolling-complete-weeks",
      requestedWeeks: options.all ? null : options.weeks,
      selectedWeeks,
    },
    heuristic: {
      kind: "opportunity-screening",
      ctrThreshold: CTR_OPPORTUNITY_HEURISTIC,
      clickProjection: null,
    },
    totals: {
      pagesAnalyzed: analyzed.length,
      candidates: candidates.length,
    },
    candidates,
    rankingBound,
  };

  mkdirSync(path.dirname(options.outputFile), { recursive: true });
  mkdirSync(path.dirname(options.jsonFile), { recursive: true });
  writeFileSync(options.outputFile, buildMarkdown(report), "utf8");
  writeFileSync(options.jsonFile, JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(
    `CTR audit: ${analyzed.length} pages analyzed, ${candidates.length} candidate(s), ${selectedWeeks.length} week(s) selected.`
  );
  console.log(`CTR audit: markdown written to ${options.outputFile}`);
  console.log(`CTR audit: JSON written to ${options.jsonFile}`);
}

try {
  main();
} catch (error) {
  console.error(`[ctr-audit] ${error.message}`);
  process.exit(1);
}
