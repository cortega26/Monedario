// check:catalog-drift
//
// Guardrail for TD-0088. Ensures every published article resolves to a real guide
// hub in its breadcrumb instead of falling through to the generic "Artículos"
// crumb, and that the cluster → hub mapping never diverges from GUIDE_HUBS.
//
// Resolution mirrors Breadcrumb.astro:
//   1. If the post's `cluster` is a hub cluster → hub derived from GUIDE_HUBS.
//   2. Otherwise fall back to the first matching tag in tagHubMap.
//   3. If neither resolves, the breadcrumb renders the generic crumb → FAIL.
//
// It also validates that every tagHubMap href points to a valid guide hub dir,
// so the fallback layer cannot point at a hub that does not exist.
//
// Exit 0 on success, exit 1 on any drift.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(
  process.env.CATALOG_DRIFT_ROOT || path.resolve(__dirname, "..")
);

const BLOG_DIR = path.join(REPO_ROOT, "src/data/blog");
const CLUSTERS_PATH = path.join(REPO_ROOT, "src/config/clusters.ts");
const TAG_HUB_MAP_PATH = path.join(REPO_ROOT, "src/config/tagHubMap.ts");

function read(filePath) {
  return readFileSync(filePath, "utf8");
}

// --- Parse the canonical hub clusters from GUIDE_HUB_ORDER in clusters.ts ---
function parseHubClusters(source) {
  const match = source.match(/GUIDE_HUB_ORDER:\s*HubCluster\[\]\s*=\s*\[([\s\S]*?)\]/);
  if (!match) throw new Error("Could not locate GUIDE_HUB_ORDER in clusters.ts.");
  return new Set(
    [...match[1].matchAll(/"([^"]+)"/g)].map(m => m[1])
  );
}

// --- Parse tagHubMap hrefs from tagHubMap.ts ---
function parseTagHubHrefs(source) {
  // Each entry has an href: "/guias/<cluster>/" line.
  return [...source.matchAll(/href:\s*"(\/guias\/[^"]+)"/g)].map(m => m[1]);
}

// --- Parse tagHubMap keys (the tags it maps) ---
function parseTagHubKeys(source) {
  const body = source.slice(
    source.indexOf("tagHubMap"),
    source.indexOf("getHubFromTags")
  );
  // Keys are the identifiers/strings immediately before a `: {` object opener.
  return new Set(
    [...body.matchAll(/(?:^|\n)\s*(?:"([^"]+)"|([a-zA-Z][\w-]*)):\s*\{/g)].map(
      m => (m[1] ?? m[2]).toLowerCase()
    )
  );
}

// --- Minimal frontmatter extraction for the fields we need ---
function parseFrontmatter(source) {
  const fm = source.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return null;
  const block = fm[1];

  const clusterMatch = block.match(/^cluster:\s*(.+)$/m);
  const cluster = clusterMatch ? clusterMatch[1].trim() : null;

  const draftMatch = block.match(/^draft:\s*(true|false)\s*$/m);
  const draft = draftMatch ? draftMatch[1] === "true" : false;

  const tags = [];
  const tagsBlock = block.match(/^tags:\s*\n((?:\s*-\s*.+\n?)+)/m);
  if (tagsBlock) {
    for (const line of tagsBlock[1].split("\n")) {
      const item = line.match(/^\s*-\s*(.+?)\s*$/);
      if (item) tags.push(item[1].replace(/^["']|["']$/g, "").toLowerCase());
    }
  }
  return { cluster, draft, tags };
}

function main() {
  const errors = [];
  const clustersSrc = read(CLUSTERS_PATH);
  const tagHubSrc = read(TAG_HUB_MAP_PATH);

  const hubClusters = parseHubClusters(clustersSrc);
  const tagHubKeys = parseTagHubKeys(tagHubSrc);
  const tagHubHrefs = parseTagHubHrefs(tagHubSrc);

  // 1. Fallback layer integrity: every tagHubMap href must target a real hub.
  for (const href of tagHubHrefs) {
    const slug = href.replace(/^\/guias\//, "").replace(/\/$/, "");
    if (!hubClusters.has(slug)) {
      errors.push(
        `tagHubMap: href "${href}" does not match any guide hub in GUIDE_HUB_ORDER.`
      );
    }
  }

  // 2. Every published article must resolve to a hub (cluster first, tags fallback).
  const files = readdirSync(BLOG_DIR).filter(f => f.endsWith(".md"));
  let checked = 0;
  let viaCluster = 0;
  let viaTags = 0;
  for (const file of files) {
    const fm = parseFrontmatter(read(path.join(BLOG_DIR, file)));
    if (!fm || fm.draft) continue;
    checked += 1;

    if (fm.cluster && hubClusters.has(fm.cluster)) {
      viaCluster += 1;
      continue;
    }
    const tagHit = fm.tags.find(t => tagHubKeys.has(t));
    if (tagHit) {
      viaTags += 1;
      continue;
    }
    errors.push(
      `${file}: cluster "${fm.cluster ?? "—"}" is not a hub cluster and no tag matches tagHubMap; breadcrumb falls back to generic "Artículos".`
    );
  }

  if (errors.length > 0) {
    console.error(`[check-catalog-drift] FAIL: ${errors.length} issue(s)`);
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }

  console.log(
    `[check-catalog-drift] OK. published=${checked} via_cluster=${viaCluster} via_tags=${viaTags} hub_clusters=${hubClusters.size}`
  );
}

main();
