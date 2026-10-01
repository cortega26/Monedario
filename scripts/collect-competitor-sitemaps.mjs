#!/usr/bin/env node

/**
 * collect-competitor-sitemaps
 *
 * Growth Engine Fase 0.1 (fuente libre): lee los sitemaps públicos de los
 * competidores configurados en `src/config/competitors.json` y escribe/mezcla
 * `output/external-intelligence/<semana>.json` con la lista `competitorPages`.
 * No scrapea páginas ni sigue enlaces: solo `<loc>` de sitemaps.
 *
 * Los datos de proveedor (Semrush/Ahrefs) existentes en el archivo se
 * preservan; este colector solo actualiza `competitorPages` y metadatos.
 *
 * Uso:
 *   node scripts/collect-competitor-sitemaps.mjs [--week 2026-W39] [--root .]
 *     [--config src/config/competitors.json]
 *     [--out output/external-intelligence]
 *     [--timeout-ms 10000] [--max-pages 500] [--max-child-sitemaps 8]
 *
 * Report-only: fallos por dominio se reportan y no bloquean (exit 0).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractSitemapLocs,
  previousCompleteISOWeek,
} from "./data-signals/gsc-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, "..");
const USER_AGENT = "MonedarioBot/1.0 (+https://monedario.cl/)";
const SITEMAP_LIKE = /(?:sitemap|\.xml(?:\.gz)?$)/i;

export function resolveSitemapUrl(entry) {
  if (entry?.sitemapUrl) return entry.sitemapUrl;
  return `https://${entry.domain}/sitemap.xml`;
}

export function buildCompetitorPages(locs, domain, maxPages = 500) {
  const seen = new Set();
  const pages = [];
  for (const loc of locs ?? []) {
    let parsed;
    try {
      parsed = new URL(loc);
    } catch {
      continue;
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") continue;
    if (SITEMAP_LIKE.test(parsed.pathname)) continue;
    if (seen.has(parsed.pathname)) continue;
    seen.add(parsed.pathname);
    pages.push({ domain, url: `${parsed.origin}${parsed.pathname}` });
    if (pages.length >= maxPages) break;
  }
  return pages;
}

export function isSitemapIndex(xml) {
  return typeof xml === "string" && /<sitemapindex[\s>]/i.test(xml);
}

export function mergeExternalIntelligence(existing, incoming) {
  const base = existing && typeof existing === "object" ? existing : {};
  const merged = { ...base, ...incoming };
  for (const key of ["keywordGaps", "competitorGaps", "serpFeatures"]) {
    if (Array.isArray(base[key])) merged[key] = base[key];
  }
  if (base.source && base.source !== "free") {
    merged.source = base.source;
    merged.freeSources = Array.from(
      new Set([...(base.freeSources ?? []), "competitor-sitemaps"])
    );
  } else {
    merged.source = "free";
    merged.freeSources = ["competitor-sitemaps"];
  }
  return merged;
}

function parseArgs(argv) {
  const args = {
    root: DEFAULT_ROOT,
    week: null,
    config: null,
    out: null,
    timeoutMs: 10_000,
    maxPages: 500,
    maxChildSitemaps: 8,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (flag === "--root") args.root = path.resolve(value);
    else if (flag === "--week") args.week = value;
    else if (flag === "--config") args.config = value;
    else if (flag === "--out") args.out = value;
    else if (flag === "--timeout-ms") args.timeoutMs = Number(value);
    else if (flag === "--max-pages") args.maxPages = Number(value);
    else if (flag === "--max-child-sitemaps") args.maxChildSitemaps = Number(value);
    else {
      console.error(`[competitors] argumento desconocido: ${flag}`);
      process.exit(1);
    }
    i += 1;
  }
  if (args.week && !/^\d{4}-W\d{2}$/.test(args.week)) {
    console.error(`[competitors] semana inválida: ${args.week}`);
    process.exit(1);
  }
  return args;
}

async function fetchText(url, timeoutMs) {
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT, accept: "application/xml,text/xml,*/*" },
    signal: AbortSignal.timeout(timeoutMs),
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}

async function collectDomain(entry, args) {
  const sitemapUrl = resolveSitemapUrl(entry);
  const result = { domain: entry.domain, sitemapUrl, pages: [], notes: [] };
  const rootXml = await fetchText(sitemapUrl, args.timeoutMs);

  let pageLocs = [];
  if (isSitemapIndex(rootXml)) {
    const children = extractSitemapLocs(rootXml)
      .filter(loc => SITEMAP_LIKE.test(new URL(loc).pathname))
      .slice(0, args.maxChildSitemaps);
    result.notes.push(`sitemap index: ${children.length} hijos`);
    for (const child of children) {
      try {
        const childXml = await fetchText(child, args.timeoutMs);
        pageLocs.push(...extractSitemapLocs(childXml));
      } catch (error) {
        result.notes.push(`hijo falló: ${child} (${error.message})`);
      }
    }
  } else {
    pageLocs = extractSitemapLocs(rootXml);
  }

  result.pages = buildCompetitorPages(pageLocs, entry.domain, args.maxPages);
  return result;
}

async function main() {
  const args = parseArgs(process.argv);
  const configPath = path.resolve(
    args.root,
    args.config ?? "src/config/competitors.json"
  );
  if (!existsSync(configPath)) {
    console.error(`[competitors] falta ${configPath}`);
    process.exit(1);
  }
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const competitors = config.competitors ?? [];
  const outDir = path.resolve(
    args.root,
    args.out ?? "output/external-intelligence"
  );
  const week = args.week ?? previousCompleteISOWeek();
  const outFile = path.join(outDir, `${week}.json`);

  const competitorPages = [];
  const perDomain = [];
  for (const entry of competitors) {
    try {
      const result = await collectDomain(entry, args);
      competitorPages.push(...result.pages);
      perDomain.push({
        domain: entry.domain,
        pages: result.pages.length,
        notes: result.notes,
      });
    } catch (error) {
      perDomain.push({ domain: entry.domain, pages: 0, error: error.message });
    }
  }

  const incoming = {
    source: "free",
    week,
    retrievedAt: new Date().toISOString(),
    license: "internal-only",
    scale: {
      volume: "not_available_free_source",
      difficulty: "not_available_free_source",
    },
    competitorPages,
  };
  const existing = existsSync(outFile)
    ? JSON.parse(readFileSync(outFile, "utf8"))
    : null;
  const merged = mergeExternalIntelligence(existing, incoming);

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, `${JSON.stringify(merged, null, 2)}\n`);

  const ok = perDomain.filter(item => !item.error).length;
  const failed = perDomain.length - ok;
  console.log(
    `[competitors] week=${week} domains=${perDomain.length} ok=${ok} failed=${failed} pages=${competitorPages.length} file=${outFile}`
  );
  for (const item of perDomain) {
    if (item.error) {
      console.warn(`[competitors] ${item.domain}: ${item.error}`);
    } else {
      console.log(
        `[competitors] ${item.domain}: ${item.pages} páginas${
          item.notes.length ? ` (${item.notes.join("; ")})` : ""
        }`
      );
    }
  }
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  main().catch(error => {
    console.error(`[competitors] error: ${error.message}`);
    process.exit(1);
  });
}
