// check:homepage-surface-freshness
//
// Guardrail for TD-0089. Home discovery surfaces must not communicate freshness
// from hardcoded dates that nobody updates. ProblemCards derives every "Actualizado"
// date from content (blog frontmatter or the latest post in a card's cluster); this
// check prevents reintroducing manual date literals and ensures every cluster a card
// points to actually has published posts (so the date resolves instead of going blank).
//
// Exit 0 on success, exit 1 on any issue.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(
  process.env.HOMEPAGE_FRESHNESS_ROOT || path.resolve(__dirname, "..")
);

const SURFACE_PATH = path.join(REPO_ROOT, "src/components/ProblemCards.astro");
const BLOG_DIR = path.join(REPO_ROOT, "src/data/blog");

function read(filePath) {
  return readFileSync(filePath, "utf8");
}

/** Clusters that have at least one published (non-draft) blog post. */
function clustersWithPosts() {
  const set = new Set();
  for (const file of readdirSync(BLOG_DIR).filter(f => f.endsWith(".md"))) {
    const fm = read(path.join(BLOG_DIR, file)).match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    const block = fm[1];
    if (/^draft:\s*true\s*$/m.test(block)) continue;
    const cluster = block.match(/^cluster:\s*(.+)$/m)?.[1].trim();
    if (cluster) set.add(cluster);
  }
  return set;
}

function main() {
  const errors = [];
  const source = read(SURFACE_PATH);

  // 1. No hardcoded date literals on the discovery surface.
  const dateLiterals = [...source.matchAll(/new Date\(\s*["'][^"']+["']\s*\)/g)];
  for (const m of dateLiterals) {
    errors.push(
      `ProblemCards.astro contains a hardcoded date literal \`${m[0]}\`; derive the date from content instead (blog frontmatter or cluster latest post).`
    );
  }

  // 2. Every cluster a card points to must have published posts so the date resolves.
  const withPosts = clustersWithPosts();
  const cardClusters = [
    ...source.matchAll(/kind:\s*["']cluster["'],\s*cluster:\s*["']([^"']+)["']/g),
  ].map(m => m[1]);
  for (const cluster of new Set(cardClusters)) {
    if (!withPosts.has(cluster)) {
      errors.push(
        `ProblemCards.astro card points to cluster "${cluster}" which has no published posts; its "Actualizado" date would be blank.`
      );
    }
  }

  if (errors.length > 0) {
    console.error(`[check-homepage-surface-freshness] FAIL: ${errors.length} issue(s)`);
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }

  console.log(
    `[check-homepage-surface-freshness] OK. No manual dates; ${new Set(cardClusters).size} cluster-derived card date(s) resolve from published posts.`
  );
}

main();
