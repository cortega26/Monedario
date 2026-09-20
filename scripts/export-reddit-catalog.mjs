#!/usr/bin/env node
// export:reddit-catalog
//
// Exporta el catálogo de páginas de Monedario que el monitor de Reddit
// (`reddit-monitor/`, VM) usa para comparar cada hilo contra lo ya publicado:
//   - similitud alta  -> oportunidad: sugerir esa página
//   - similitud baja y recurrente -> brecha de contenido
//
// La VM no tiene el repo, así que el catálogo se genera aquí, al momento de
// correr el análisis, y se copia junto con `spike_gaps.py`. NO se versiona:
// `reddit-monitor/catalog.json` está en .gitignore, así que no puede quedar
// desactualizado y publicar un artículo no exige regenerar nada.
//
// Reglas del repo que este script respeta:
//   - URL pública derivada SIEMPRE del slug/ruta, nunca de `post.id`
//     (URL.PUBLIC.NO_POST_ID).
//   - No inventa slugs ni registra canonicalTopic: solo lee.
//
// Uso:
//   node scripts/export-reddit-catalog.mjs            # escribe reddit-monitor/catalog.json
//   node scripts/export-reddit-catalog.mjs --out ruta # otro destino

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseFrontmatter, splitFrontmatter } from "./hero-images/lib.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, "..");
export const SCHEMA_VERSION = 1;
export const DEFAULT_OUT = path.join("reddit-monitor", "catalog.json");

/**
 * @typedef {object} CatalogEntry
 * @property {"article"|"calculator"|"guide"|"glossary"|"law"} type
 * @property {string} id
 * @property {string} url Ruta pública derivada del slug (nunca de post.id).
 * @property {string} title
 * @property {string} text Texto que se embebe para comparar con los hilos.
 * @property {"full"|"partial"} coverage
 * @property {string} [cluster]
 * @property {string} [category]
 * @property {string} [canonicalTopic]
 * @property {string} [topicRole]
 * @property {string} [ownerSlug]
 */

/**
 * @typedef {object} Catalog
 * @property {number} schemaVersion
 * @property {string} generatedBy
 * @property {Record<string, number>} counts
 * @property {CatalogEntry[]} entries
 */

/** Cobertura que aporta cada tipo: una guía o calculadora responde la duda;
 *  un término de glosario o una ley solo la define o la respalda. */
const COVERAGE = {
  article: "full",
  calculator: "full",
  guide: "full",
  glossary: "partial",
  law: "partial",
};

const clean = value =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

function readFrontmatter(file) {
  const { frontmatterRaw } = splitFrontmatter(readFileSync(file, "utf8"));
  return parseFrontmatter(frontmatterRaw, file);
}

function listFiles(dir, ext) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(name => name.endsWith(ext))
    .sort();
}

/**
 * @param {CatalogEntry["type"]} type
 * @param {string} id
 * @param {string} url
 * @param {unknown} title
 * @param {unknown[]} textParts
 * @param {Partial<CatalogEntry>} [extra]
 * @returns {CatalogEntry}
 */
function entry(type, id, url, title, textParts, extra = {}) {
  return {
    type,
    id,
    url,
    title: clean(title),
    text: clean(
      textParts
        .map(part => clean(part).replace(/[.\s]+$/, ""))
        .filter(Boolean)
        .join(". ")
    ),
    coverage: COVERAGE[type],
    ...extra,
  };
}

function articleEntries(root, registry) {
  const indexPath = path.join(root, "context", "published-articles-index.json");
  if (!existsSync(indexPath)) return [];
  const { articles = [] } = JSON.parse(readFileSync(indexPath, "utf8"));
  const out = [];
  for (const item of articles) {
    const sourceFile = path.join(root, item.sourcePath ?? "");
    const fm = existsSync(sourceFile) ? readFrontmatter(sourceFile) : {};
    // Páginas `unlisted` no se recomiendan a nadie.
    if (fm.unlisted === true) continue;
    const cluster = item.cluster ?? fm.cluster;
    const canonicalTopic = fm.canonicalTopic;
    const owner = registry?.[cluster]?.[canonicalTopic];
    const tags = Array.isArray(item.tags) ? item.tags.join(", ") : "";
    out.push(
      entry(
        "article",
        item.slug,
        `/posts/${item.slug}/`,
        item.title,
        [item.title, fm.description ?? item.summary, owner?.intentLabel, tags],
        {
          cluster,
          category: item.category,
          canonicalTopic,
          topicRole: fm.topicRole,
          ownerSlug: owner?.ownerSlug,
        }
      )
    );
  }
  return out;
}

function calculatorEntries(root) {
  const dir = path.join(root, "src", "pages", "calculadoras");
  return listFiles(dir, ".astro")
    .filter(name => name !== "index.astro")
    .map(name => {
      const id = name.replace(/\.astro$/, "");
      const source = readFileSync(path.join(dir, name), "utf8");
      const title = source.match(/\btitle="([^"]+)"/)?.[1];
      const description = source.match(/\bdescription="([^"]+)"/)?.[1];
      const readable = clean(title?.replace(/\s*\|\s*[^|]+$/, "")) || id;
      return entry(
        "calculator",
        id,
        `/calculadoras/${id}/`,
        readable,
        [readable, description],
        {}
      );
    });
}

function guideEntries(guideHubs) {
  return Object.entries(guideHubs ?? {}).map(([cluster, hub]) =>
    entry(
      "guide",
      cluster,
      `/guias/${cluster}/`,
      hub.nombre,
      [hub.nombre, hub.descripcion, hub.homepageResumen],
      { cluster }
    )
  );
}

function glossaryEntries(root) {
  const dir = path.join(root, "src", "data", "glossary");
  return listFiles(dir, ".md").map(name => {
    const id = name.replace(/\.md$/, "");
    const fm = readFrontmatter(path.join(dir, name));
    return entry(
      "glossary",
      id,
      `/glosario/${id}/`,
      fm.term ?? id,
      [fm.term, fm.shortDefinition],
      {}
    );
  });
}

function lawEntries(root) {
  const dir = path.join(root, "src", "data", "laws");
  return listFiles(dir, ".md").map(name => {
    const id = name.replace(/\.md$/, "");
    const fm = readFrontmatter(path.join(dir, name));
    return entry(
      "law",
      id,
      `/leyes/${id}/`,
      fm.shortName ?? fm.title ?? id,
      [fm.shortName, fm.title],
      {}
    );
  });
}

/**
 * Construye el catálogo. Pura respecto de `root` y de las dos tablas
 * inyectables (por defecto las reales del repo), para poder probarla con un
 * árbol de fixtures. El resultado es determinista (sin fechas): mismas
 * fuentes, mismo archivo.
 *
 * @param {{ root?: string, registry?: any, guideHubs?: any }} [options]
 * @returns {Catalog}
 */
export function buildCatalog({ root = DEFAULT_ROOT, registry, guideHubs } = {}) {
  const entries = [
    ...articleEntries(root, registry),
    ...calculatorEntries(root),
    ...guideEntries(guideHubs),
    ...glossaryEntries(root),
    ...lawEntries(root),
  ].sort((a, b) =>
    a.type === b.type ? a.id.localeCompare(b.id) : a.type.localeCompare(b.type)
  );
  const counts = {};
  for (const e of entries) counts[e.type] = (counts[e.type] ?? 0) + 1;
  return {
    schemaVersion: SCHEMA_VERSION,
    generatedBy: "scripts/export-reddit-catalog.mjs",
    counts,
    entries,
  };
}

export function serialize(catalog) {
  return `${JSON.stringify(catalog, null, 2)}\n`;
}

async function loadRealTables() {
  const [{ CANONICAL_TOPIC_REGISTRY }, { GUIDE_HUBS }] = await Promise.all([
    import(pathToFileURL(path.join(DEFAULT_ROOT, "src/config/editorial-topic-policy.mjs")).href),
    import(pathToFileURL(path.join(DEFAULT_ROOT, "src/config/clusters.ts")).href),
  ]);
  return { registry: CANONICAL_TOPIC_REGISTRY, guideHubs: GUIDE_HUBS };
}

async function main(argv) {
  const outIndex = argv.indexOf("--out");
  const out = path.resolve(
    DEFAULT_ROOT,
    outIndex >= 0 ? argv[outIndex + 1] : DEFAULT_OUT
  );
  const catalog = buildCatalog({ root: DEFAULT_ROOT, ...(await loadRealTables()) });
  const text = serialize(catalog);

  writeFileSync(out, text, "utf8");
  console.log(
    `[export-reddit-catalog] ${path.relative(DEFAULT_ROOT, out)}: ${catalog.entries.length} entradas ${JSON.stringify(catalog.counts)}`
  );
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2)).then(code => process.exit(code));
}
