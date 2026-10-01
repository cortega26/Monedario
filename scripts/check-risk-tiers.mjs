#!/usr/bin/env node

/**
 * check-risk-tiers
 *
 * Verifica la aplicación de `docs/editorial/RISK_TIERS.md`:
 *   1. Cobertura total: cada artículo publicado y cada calculadora tiene nivel
 *      en `src/config/editorial-risk-registry.json`.
 *   2. Sin entradas obsoletas: el registro no referencia contenido inexistente.
 *   3. Niveles válidos (R1–R4).
 *   4. Requisitos R4:
 *      - artículos: `articleLead.officialSources` no vacío y `validAsOf`
 *        presente y parseable;
 *      - calculadoras: la página usa `MethodologyBlock` (provenance visible).
 *   5. Waivers: solo eximen mientras estén vigentes; un waiver vencido o que
 *      referencia contenido inexistente es error.
 *
 * Root sobreescribible para tests: RISK_TIERS_ROOT.
 * Fecha de evaluación sobreescribible: RISK_TIERS_TODAY (YYYY-MM-DD).
 * Salida 0 = válido; 1 = al menos un error (reporta todos).
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as internalSafeLoad, JSON_SCHEMA } from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(
  process.env.RISK_TIERS_ROOT || path.resolve(__dirname, "..")
);
const BLOG_DIR = path.join(REPO_ROOT, "src", "data", "blog");
const CALC_DIR = path.join(REPO_ROOT, "src", "pages", "calculadoras");
const REGISTRY_PATH = path.join(
  REPO_ROOT,
  "src",
  "config",
  "editorial-risk-registry.json"
);
const REPORT_PATH = path.join(
  REPO_ROOT,
  "output",
  "validation",
  "risk-tiers",
  "report.json"
);
const VALID_TIERS = new Set(["R1", "R2", "R3", "R4"]);
const POLICY_PATH = "docs/editorial/RISK_TIERS.md";

const errors = [];
const warnings = [];

function fail(rule, detail) {
  errors.push(`check-risk-tiers:${rule} ${detail}`);
}

function warn(rule, detail) {
  warnings.push(`check-risk-tiers:${rule} ${detail}`);
}

function extractFrontmatter(filePath) {
  const source = readFileSync(filePath, "utf8");
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  return internalSafeLoad(match[1], { schema: JSON_SCHEMA });
}

function listPublishedPosts() {
  const posts = new Map();
  for (const file of readdirSync(BLOG_DIR)) {
    if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;
    const filePath = path.join(BLOG_DIR, file);
    const data = extractFrontmatter(filePath) ?? {};
    if (data.draft === true) continue;
    const slug =
      typeof data.slug === "string" && data.slug.trim()
        ? data.slug.trim()
        : file.replace(/\.(md|mdx)$/, "");
    posts.set(slug, { data, filePath });
  }
  return posts;
}

function listCalculatorPages() {
  const calculators = new Map();
  for (const file of readdirSync(CALC_DIR)) {
    if (!file.endsWith(".astro") || file === "index.astro") continue;
    const id = file.replace(/\.astro$/, "");
    const filePath = path.join(CALC_DIR, file);
    calculators.set(id, {
      source: readFileSync(filePath, "utf8"),
      filePath,
    });
  }
  return calculators;
}

function isValidDate(value) {
  if (value == null) return false;
  const parsed = new Date(String(value));
  return !Number.isNaN(parsed.getTime());
}

function loadRegistry() {
  const raw = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
  if (raw.schemaVersion !== 1) {
    fail("schema", `schemaVersion no soportado: ${raw.schemaVersion}`);
  }
  if (raw.policy !== POLICY_PATH) {
    fail("schema", `policy debe ser ${POLICY_PATH}, es ${raw.policy}`);
  }
  const policyFile = path.join(REPO_ROOT, raw.policy);
  try {
    readFileSync(policyFile, "utf8");
  } catch {
    fail("policy", `no existe el documento canónico ${raw.policy}`);
  }
  return {
    articles: raw.articles ?? {},
    calculators: raw.calculators ?? {},
    waivers: Array.isArray(raw.waivers) ? raw.waivers : [],
  };
}

function validateTierMap(label, map, ids) {
  for (const [id, tier] of Object.entries(map)) {
    if (!VALID_TIERS.has(tier)) {
      fail("tier", `${label}/${id}: nivel inválido "${tier}"`);
    }
    if (!ids.has(id)) {
      fail("stale", `${label}/${id}: entrada del registro sin contenido`);
    }
  }
  for (const id of ids) {
    if (!(id in map)) {
      fail("coverage", `${label}/${id}: sin nivel asignado en el registro`);
    }
  }
}

function activeWaiver(waivers, id) {
  const waiver = waivers.find(item => item.id === id);
  if (!waiver) return null;
  if (!isValidDate(waiver.expiresAt)) {
    fail("waiver", `waiver/${id}: expiresAt inválido`);
    return null;
  }
  const expires = new Date(String(waiver.expiresAt));
  if (expires.getTime() < today.getTime()) {
    fail(
      "waiver",
      `waiver/${id}: vencido el ${String(waiver.expiresAt).slice(0, 10)}; resolver la causa`
    );
    return null;
  }
  if (!waiver.reason || String(waiver.reason).trim().length < 12) {
    fail("waiver", `waiver/${id}: falta un motivo explícito`);
    return null;
  }
  return waiver;
}

function validateR4Articles(posts, map, waivers) {
  for (const [slug, tier] of Object.entries(map)) {
    if (tier !== "R4" || !posts.has(slug)) continue;
    const { data } = posts.get(slug);
    const lead = data.articleLead ?? {};
    const hasSources =
      Array.isArray(lead.officialSources) && lead.officialSources.length > 0;
    const hasValidAsOf = isValidDate(lead.validAsOf);
    if (hasSources && hasValidAsOf) continue;
    const waiver = activeWaiver(waivers, slug);
    if (waiver) {
      warn(
        "r4-waiver",
        `${slug}: R4 sin ${[
          !hasSources ? "officialSources" : null,
          !hasValidAsOf ? "validAsOf" : null,
        ]
          .filter(Boolean)
          .join("+")} (waiver hasta ${String(waiver.expiresAt).slice(0, 10)})`
      );
      continue;
    }
    fail(
      "r4-provenance",
      `articles/${slug}: R4 requiere articleLead.officialSources y articleLead.validAsOf`
    );
  }
}

function validateR4Calculators(calculators, map) {
  for (const [id, tier] of Object.entries(map)) {
    if (tier !== "R4" || !calculators.has(id)) continue;
    const { source } = calculators.get(id);
    if (!source.includes("<MethodologyBlock")) {
      fail(
        "r4-provenance",
        `calculators/${id}: R4 requiere MethodologyBlock (fuentes visibles)`
      );
    }
  }
}

function validateWaiverTargets(waivers, posts, calculators) {
  const seen = new Set();
  for (const waiver of waivers) {
    if (!waiver.id || typeof waiver.id !== "string") {
      fail("waiver", "waiver sin id");
      continue;
    }
    if (seen.has(waiver.id)) {
      fail("waiver", `waiver/${waiver.id}: duplicado`);
    }
    seen.add(waiver.id);
    if (!posts.has(waiver.id) && !calculators.has(waiver.id)) {
      fail("waiver", `waiver/${waiver.id}: no corresponde a contenido existente`);
    }
  }
}

const today = process.env.RISK_TIERS_TODAY
  ? new Date(`${process.env.RISK_TIERS_TODAY}T00:00:00Z`)
  : new Date();

const posts = listPublishedPosts();
const calculators = listCalculatorPages();
const { articles, calculators: calcTiers, waivers } = loadRegistry();

validateTierMap("articles", articles, new Set(posts.keys()));
validateTierMap("calculators", calcTiers, new Set(calculators.keys()));
validateWaiverTargets(waivers, posts, calculators);
validateR4Articles(posts, articles, waivers);
validateR4Calculators(calculators, calcTiers);

const byTier = { R1: 0, R2: 0, R3: 0, R4: 0 };
for (const tier of Object.values({ ...articles, ...calcTiers })) {
  if (byTier[tier] !== undefined) byTier[tier] += 1;
}

const report = {
  generatedAt: new Date().toISOString(),
  posts: posts.size,
  calculators: calculators.size,
  byTier,
  waivers: waivers.map(waiver => ({
    id: waiver.id,
    expiresAt: waiver.expiresAt,
  })),
  errors,
  warnings,
};

mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  console.error(
    `[check-risk-tiers] FAIL. posts=${posts.size} calculators=${calculators.size} errors=${errors.length} warnings=${warnings.length}`
  );
  process.exit(1);
}

for (const warning of warnings) console.warn(warning);
console.log(
  `[check-risk-tiers] OK. posts=${posts.size} calculators=${calculators.size} R1=${byTier.R1} R2=${byTier.R2} R3=${byTier.R3} R4=${byTier.R4} waivers=${waivers.length} warnings=${warnings.length}`
);
