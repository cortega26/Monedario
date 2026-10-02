#!/usr/bin/env node

/**
 * detect-seo-opportunities
 *
 * Growth Engine Fase 0 (report-only): lee los data-signals ya commiteados
 * (GSC + analytics first-party), corre los detectores y escribe un reporte
 * JSON + Markdown. No modifica contenido, rutas ni configuración.
 *
 * Uso:
 *   node scripts/detect-seo-opportunities.mjs [--week 2026-W39] [--root .]
 *     [--out output/validation/growth-opportunities]
 *     [--registry src/config/growth-opportunity-registry.json]
 *
 * Datos faltantes de la semana no son error: el reporte se emite con
 * status "insufficient_data" y el proceso sale 0 (Fase 0 nunca bloquea).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  dateToISOWeek,
  previousCompleteISOWeek,
} from "./data-signals/gsc-utils.mjs";
import {
  buildOpportunityReport,
  renderOpportunityMarkdown,
} from "./lib/growth-opportunities.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const args = {
    week: null,
    root: DEFAULT_ROOT,
    out: null,
    registry: null,
    previousSignature: null,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (flag === "--week") args.week = value;
    else if (flag === "--root") args.root = path.resolve(value);
    else if (flag === "--out") args.out = value;
    else if (flag === "--registry") args.registry = value;
    else if (flag === "--previous-signature") args.previousSignature = value;
    else {
      console.error(`[growth] argumento desconocido: ${flag}`);
      process.exit(1);
    }
    i += 1;
  }
  if (args.week && !/^\d{4}-W\d{2}$/.test(args.week)) {
    console.error(`[growth] semana inválida: ${args.week} (esperado YYYY-Www)`);
    process.exit(1);
  }
  return args;
}

function readJson(filePath) {
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function previousWeekLabel(fromIsoDate) {
  const date = new Date(`${fromIsoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 7);
  return dateToISOWeek(date);
}

function main() {
  const args = parseArgs(process.argv);
  const root = args.root;
  const outDir = path.resolve(
    root,
    args.out ?? "output/validation/growth-opportunities"
  );
  const registryPath = path.resolve(
    root,
    args.registry ?? "src/config/growth-opportunity-registry.json"
  );

  const registry = JSON.parse(readFileSync(registryPath, "utf8"));
  const week = args.week ?? previousCompleteISOWeek();
  const signals = path.join(root, "output", "operations", "data-signals");

  const pagesDoc = readJson(path.join(signals, "gsc", `${week}-pages.json`));
  const queriesDoc = readJson(path.join(signals, "gsc", `${week}-queries.json`));
  const queryPageDoc = readJson(
    path.join(signals, "gsc", `${week}-query-page.json`)
  );
  const analyticsDoc = readJson(
    path.join(signals, "analytics", `${week}.json`)
  );
  const externalDoc = readJson(
    path.join(root, "output", "external-intelligence", `${week}.json`)
  );
  const pageLastmodIndex = readJson(
    path.join(root, "context", "page-lastmod-index.json")
  );
  const ourRoutes = Object.keys(pageLastmodIndex?.pages ?? {});
  const feedback = readJson(
    path.join(root, "src", "config", "growth-opportunity-feedback.json")
  );
  let previousSignature = args.previousSignature
    ? readJson(path.resolve(root, args.previousSignature))
    : null;
  if (
    previousSignature &&
    (!Array.isArray(previousSignature.ids) ||
      typeof previousSignature.week !== "string")
  ) {
    console.warn("[growth] firma previa inválida; se ignora el delta");
    previousSignature = null;
  }

  const missing = [
    !pagesDoc && "gsc/pages",
    !queriesDoc && "gsc/queries",
    !queryPageDoc && "gsc/query-page",
  ].filter(Boolean);

  mkdirSync(outDir, { recursive: true });
  const outJson = path.join(outDir, `${week}.json`);
  const outMd = path.join(outDir, `${week}.md`);

  if (missing.length > 0) {
    const report = {
      schemaVersion: 1,
      phase: registry.phase ?? "report-only",
      status: "insufficient_data",
      week,
      missing,
    };
    writeFileSync(outJson, `${JSON.stringify(report, null, 2)}\n`);
    writeFileSync(
      outMd,
      `# Growth opportunities — ${week}\n\nDatos insuficientes: faltan ${missing.join(", ")}. El reporte se emitirá cuando el bundle esté commiteado.\n`
    );
    console.log(
      `[growth] week=${week} status=insufficient_data missing=${missing.join(",")} artifacts=${outJson},${outMd}`
    );
    return;
  }

  const window = pagesDoc.window ?? queriesDoc.window ?? queryPageDoc.window;
  const prevWeek = window?.from ? previousWeekLabel(window.from) : null;
  const previousPagesDoc = prevWeek
    ? readJson(path.join(signals, "gsc", `${prevWeek}-pages.json`))
    : null;

  const report = buildOpportunityReport({
    week,
    window,
    counts: {
      pages: pagesDoc.data?.length ?? 0,
      queries: queriesDoc.data?.length ?? 0,
      queryPage: queryPageDoc.data?.length ?? 0,
      analytics: analyticsDoc?.data?.length ?? 0,
      external: externalDoc
        ? (externalDoc.keywordGaps?.length ?? 0) +
          (externalDoc.competitorGaps?.length ?? 0) +
          (externalDoc.serpFeatures?.length ?? 0) +
          (externalDoc.competitorPages?.length ?? 0)
        : 0,
    },
    pages: pagesDoc.data ?? [],
    queries: queriesDoc.data ?? [],
    queryPage: queryPageDoc.data ?? [],
    analytics: analyticsDoc?.data ?? [],
    previousPages: previousPagesDoc?.data ?? [],
    previousWeekAvailable: Boolean(previousPagesDoc),
    external: externalDoc ?? null,
    externalAvailable: Boolean(externalDoc),
    ourRoutes,
    feedback: feedback ?? null,
    previousSignature,
    registry,
  });
  report.status = "ok";

  writeFileSync(outJson, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(outMd, `${renderOpportunityMarkdown(report)}\n`);

  const byType = Object.entries(report.byType)
    .map(([type, count]) => `${type}:${count}`)
    .join(",");
  console.log(
    `[growth] week=${week} status=ok candidates=${report.candidates.length} byType=${byType || "-"} artifacts=${outJson},${outMd}`
  );
}

main();
