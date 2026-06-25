// check-article-registration.mjs
//
// Guardrail anti-drift / anti-stale para la registración editorial de artículos.
//
// DRIFT  (publicado pero sin registrar): un artículo publicado (draft:false) sin
//         `canonicalTopic`/`topicRole` no queda trazado en el sistema de
//         topic-ownership. Bloqueante en clusters endurecidos (ya lo exige
//         check-frontmatter); warn en el resto hasta endurecer.
// STALE  (registro colgado): una entrada del CANONICAL_TOPIC_REGISTRY cuyo
//         `ownerSlug`/`supportSlug` no corresponde a un artículo publicado, o un
//         canonicalTopic registrado que ningún artículo declara.
//
// Modo por defecto: warn-first (exit 0). `ARTICLE_REG_ENFORCE=1` hace que los
// hallazgos de DRIFT en clusters endurecidos sean bloqueantes (exit 1).

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CANONICAL_TOPIC_REGISTRY,
  HARDENED_OWNERSHIP_CLUSTERS,
} from "../src/config/editorial-topic-policy.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(REPO_ROOT, "src", "data", "blog");
const ENFORCE = process.env.ARTICLE_REG_ENFORCE === "1";

function readFrontmatter(source) {
  const m = source.match(/^---\n([\s\S]*?)\n---/);
  return m ? m[1] : "";
}

function scalar(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  if (!m) return "";
  return m[1].trim().replace(/^["']|["']$/g, "");
}

// 1) Inventario de artículos publicados
const publishedBySlug = new Map();
for (const file of readdirSync(BLOG_DIR)) {
  if (!/\.(md|mdx)$/.test(file)) continue;
  const fm = readFrontmatter(readFileSync(path.join(BLOG_DIR, file), "utf8"));
  if (scalar(fm, "draft") === "true") continue;
  const slug = scalar(fm, "slug") || file.replace(/\.(md|mdx)$/, "");
  publishedBySlug.set(slug, {
    slug,
    cluster: scalar(fm, "cluster"),
    topicRole: scalar(fm, "topicRole"),
    canonicalTopic: scalar(fm, "canonicalTopic"),
  });
}

// 2) Inventario del registro (cluster::canonicalTopic -> entry)
const registeredTopics = new Set(); // `${cluster}::${canonicalTopic}`
const registryOwnerSlugs = new Set();
for (const [cluster, topics] of Object.entries(CANONICAL_TOPIC_REGISTRY)) {
  for (const [topic, entry] of Object.entries(topics)) {
    registeredTopics.add(`${cluster}::${topic}`);
    if (entry.ownerSlug) registryOwnerSlugs.add(entry.ownerSlug);
  }
}

const drift = []; // unregistered / topic-not-in-registry
const stale = []; // dangling owner / support / orphan topic
const blocking = [];

// 3) DRIFT: artículos publicados sin registración
for (const a of publishedBySlug.values()) {
  const hardened = HARDENED_OWNERSHIP_CLUSTERS.includes(a.cluster);
  if (!a.canonicalTopic || !a.topicRole) {
    const msg = `unregistered_article: ${a.slug} [${a.cluster}] sin ${
      !a.canonicalTopic && !a.topicRole
        ? "topicRole+canonicalTopic"
        : !a.canonicalTopic
          ? "canonicalTopic"
          : "topicRole"
    }`;
    drift.push(msg);
    if (hardened) blocking.push(msg);
    continue;
  }
  // canonicalTopic declarado pero ausente del registro (registry drift)
  if (!registeredTopics.has(`${a.cluster}::${a.canonicalTopic}`)) {
    const msg = `topic_not_in_registry: ${a.slug} declara ${a.cluster}::${a.canonicalTopic} (no está en CANONICAL_TOPIC_REGISTRY)`;
    drift.push(msg);
    if (hardened) blocking.push(msg);
  }
}

// 4) STALE: entradas del registro colgadas
for (const [cluster, topics] of Object.entries(CANONICAL_TOPIC_REGISTRY)) {
  for (const [topic, entry] of Object.entries(topics)) {
    const key = `${cluster}::${topic}`;
    for (const field of ["ownerSlug", "supportSlug"]) {
      const slug = entry[field];
      if (slug && !publishedBySlug.has(slug)) {
        stale.push(
          `dangling_${field === "ownerSlug" ? "owner" : "support"}: ${key} -> ${field}="${slug}" no es un artículo publicado`
        );
      }
    }
    // orphan: ningún artículo publicado declara este canonicalTopic
    const used = [...publishedBySlug.values()].some(
      a => a.cluster === cluster && a.canonicalTopic === topic
    );
    if (!used) {
      stale.push(`orphan_topic: ${key} registrado pero ningún artículo publicado lo declara`);
    }
  }
}

// 5) Reporte
const mode = ENFORCE ? "enforce" : "warn-only";
console.log(
  `[check-article-registration] mode=${mode} published=${publishedBySlug.size} registered_topics=${registeredTopics.size} drift=${drift.length} stale=${stale.length} blocking=${blocking.length}`
);
for (const d of drift) console.log(`- DRIFT  ${d}`);
for (const s of stale) console.log(`- STALE  ${s}`);

if (drift.length === 0 && stale.length === 0) {
  console.log("[check-article-registration] OK: sin drift ni entradas stale.");
}

if (ENFORCE && blocking.length > 0) {
  console.error(
    `[check-article-registration] FAIL: ${blocking.length} hallazgo(s) bloqueante(s) en clusters endurecidos.`
  );
  process.exit(1);
}

if (!ENFORCE && (drift.length > 0 || stale.length > 0)) {
  console.log(
    "[check-article-registration] WARN: rollout warning-first. Use ARTICLE_REG_ENFORCE=1 para bloquear drift en clusters endurecidos."
  );
}

process.exit(0);
