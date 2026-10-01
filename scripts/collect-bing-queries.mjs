#!/usr/bin/env node

/**
 * collect-bing-queries
 *
 * Growth Engine Fase 0.1 (fuente libre): lee las estadísticas de queries de
 * Bing Webmaster Tools para el sitio verificado y las mezcla en
 * `output/external-intelligence/<semana>.json` como `engineQueries`
 * (`source: "free"`, `freeSources: ["bing-webmaster"]`).
 *
 * La clave se lee de `BING_WEBMASTER_API_KEY` (entorno) o de `.env` en la
 * raíz del repo. Nunca se imprime ni se escribe en el archivo de salida.
 *
 * Uso:
 *   node scripts/collect-bing-queries.mjs [--week 2026-W39] [--root .]
 *     [--site https://monedario.cl/] [--max-rows 1000] [--timeout-ms 20000]
 *
 * Report-only: sin clave o con fallo de API se omite con un aviso (exit 0).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { previousCompleteISOWeek } from "./data-signals/gsc-utils.mjs";
import { mergeExternalIntelligence } from "./lib/external-intelligence.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, "..");
const BING_API = "https://ssl.bing.com/webmaster/api.svc/json";
const DEFAULT_SITE = "https://monedario.cl/";

export function stripQuotes(value) {
  return String(value ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

/**
 * Parser mínimo de `.env` (sin dependencias) para uso local/CLI.
 * @param {string} text
 * @returns {Record<string, string>}
 */
export function parseEnvFile(text) {
  const env = {};
  for (const line of String(text ?? "").split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match) env[match[1]] = stripQuotes(match[2]);
  }
  return env;
}

export function normalizeSiteUrl(url) {
  const value = stripQuotes(url);
  return value.endsWith("/") ? value : `${value}/`;
}

function hostOf(url) {
  try {
    return new URL(normalizeSiteUrl(url)).hostname
      .replace(/^www\./i, "")
      .toLowerCase();
  } catch {
    return null;
  }
}

export function pickSite(sites, preferred = DEFAULT_SITE) {
  const wantedHost = hostOf(preferred);
  if (!wantedHost) return null;
  const verified = (sites ?? []).filter(site => site?.IsVerified && site?.Url);
  const exact = verified.find(site => hostOf(site.Url) === wantedHost);
  if (exact) return exact.Url;
  return (
    verified.find(site => hostOf(site.Url)?.includes(wantedHost))?.Url ?? null
  );
}

export function normalizeBingQueryRows(payload, maxRows = 1000) {
  const rows = payload?.d ?? [];
  const out = [];
  for (const row of rows) {
    const query = typeof row.Query === "string" ? row.Query.trim() : "";
    const impressions = Number(row.Impressions ?? 0);
    if (!query || !(impressions > 0)) continue;
    const clicks = Number(row.Clicks ?? 0);
    const impressionPosition = Number(row.AvgImpressionPosition);
    const clickPosition = Number(row.AvgClickPosition);
    const position =
      impressionPosition > 0
        ? impressionPosition
        : clickPosition > 0
          ? clickPosition
          : null;
    out.push({
      engine: "bing",
      query,
      clicks,
      impressions,
      ctr: clicks / impressions,
      position,
    });
  }
  return out
    .sort(
      (a, b) =>
        b.impressions - a.impressions || a.query.localeCompare(b.query)
    )
    .slice(0, maxRows);
}

function parseArgs(argv) {
  const args = {
    root: DEFAULT_ROOT,
    week: null,
    out: null,
    site: DEFAULT_SITE,
    maxRows: 1000,
    timeoutMs: 20_000,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (flag === "--root") args.root = path.resolve(value);
    else if (flag === "--week") args.week = value;
    else if (flag === "--out") args.out = value;
    else if (flag === "--site") args.site = value;
    else if (flag === "--max-rows") args.maxRows = Number(value);
    else if (flag === "--timeout-ms") args.timeoutMs = Number(value);
    else {
      console.error(`[bing] argumento desconocido: ${flag}`);
      process.exit(1);
    }
    i += 1;
  }
  if (args.week && !/^\d{4}-W\d{2}$/.test(args.week)) {
    console.error(`[bing] semana inválida: ${args.week}`);
    process.exit(1);
  }
  return args;
}

function resolveApiKey(root) {
  const fromEnv = stripQuotes(process.env.BING_WEBMASTER_API_KEY);
  if (fromEnv) return fromEnv;
  const envPath = path.join(root, ".env");
  if (!existsSync(envPath)) return null;
  return parseEnvFile(readFileSync(envPath, "utf8")).BING_WEBMASTER_API_KEY ?? null;
}

async function fetchBing(method, params, apiKey, timeoutMs) {
  const search = new URLSearchParams({ ...params, apikey: apiKey });
  const response = await fetch(`${BING_API}/${method}?${search}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    throw new Error(`${method}: HTTP ${response.status}`);
  }
  return response.json();
}

async function main() {
  const args = parseArgs(process.argv);
  const apiKey = resolveApiKey(args.root);
  if (!apiKey) {
    console.warn("[bing] sin BING_WEBMASTER_API_KEY; colector omitido");
    return;
  }

  const outDir = path.resolve(
    args.root,
    args.out ?? "output/external-intelligence"
  );
  const week = args.week ?? previousCompleteISOWeek();
  const outFile = path.join(outDir, `${week}.json`);

  let siteUrl;
  try {
    const sites = await fetchBing("GetUserSites", {}, apiKey, args.timeoutMs);
    siteUrl = pickSite(sites?.d, args.site);
    if (!siteUrl) {
      console.warn(
        `[bing] no hay sitio verificado para ${args.site}; colector omitido`
      );
      return;
    }
    const stats = await fetchBing(
      "GetQueryStats",
      { siteUrl },
      apiKey,
      args.timeoutMs
    );
    const engineQueries = normalizeBingQueryRows(stats, args.maxRows);

    const incoming = {
      source: "free",
      week,
      retrievedAt: new Date().toISOString(),
      license: "internal-only",
      scale: {
        volume: "bing_clicks_impressions_native",
        difficulty: "not_available_free_source",
      },
      engineQueries,
      freeSources: ["bing-webmaster"],
    };
    const existing = existsSync(outFile)
      ? JSON.parse(readFileSync(outFile, "utf8"))
      : null;
    const merged = mergeExternalIntelligence(existing, incoming);

    mkdirSync(outDir, { recursive: true });
    writeFileSync(outFile, `${JSON.stringify(merged, null, 2)}\n`);
    console.log(
      `[bing] site=${siteUrl} queries=${engineQueries.length} file=${outFile}`
    );
  } catch (error) {
    console.warn(`[bing] error de API: ${error.message}; colector omitido`);
  }
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  main().catch(error => {
    console.error(`[bing] error: ${error.message}`);
    process.exit(1);
  });
}
