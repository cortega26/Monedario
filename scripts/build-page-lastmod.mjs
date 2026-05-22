#!/usr/bin/env node

/**
 * build-page-lastmod.mjs
 *
 * Generates context/page-lastmod-index.json — a map of static-page URL paths
 * to their last git commit date (YYYY-MM-DD). astro.config.ts reads it to set
 * <lastmod> in the sitemap for calculators, guide hubs and static pages.
 *
 * Blog posts are NOT covered here — their lastmod comes from frontmatter via
 * context/published-articles-index.json.
 *
 * Why a committed index instead of reading git at build time: the production
 * build runs on a shallow clone, where `git log` would report the deploy date
 * for every file (fake freshness). This script must run where full history
 * exists — locally, or in CI with fetch-depth: 0 — and the result is committed.
 *
 * Regenerate: node scripts/build-page-lastmod.mjs
 */

import { readdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const PAGES_DIR = "src/pages";
const OUT = "context/page-lastmod-index.json";

function walkAstroPages(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...walkAstroPages(full));
    } else if (entry.isFile() && entry.name.endsWith(".astro")) {
      found.push(full);
    }
  }
  return found;
}

/** Map a page file to its URL path, or null for dynamic routes. */
function fileToUrlPath(file) {
  let route = file.slice(`${PAGES_DIR}/`.length).replace(/\.astro$/, "");
  if (route.split("/").some(seg => seg.startsWith("["))) return null;
  route = route.replace(/(^|\/)index$/, "");
  return route ? `/${route}/` : "/";
}

/** Last commit date (YYYY-MM-DD) for a file, or null if uncommitted. */
function lastCommitDate(file) {
  try {
    const iso = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", file],
      { encoding: "utf-8" }
    ).trim();
    return iso ? iso.split("T")[0] : null;
  } catch {
    return null;
  }
}

const pages = {};
for (const file of walkAstroPages(PAGES_DIR)) {
  const urlPath = fileToUrlPath(file);
  if (!urlPath) continue;
  const date = lastCommitDate(file);
  if (date) pages[urlPath] = date;
}

const sortedPages = Object.fromEntries(
  Object.entries(pages).sort(([a], [b]) => a.localeCompare(b))
);

const json = {
  schemaVersion: 1,
  generatedBy: "scripts/build-page-lastmod.mjs",
  note: "Generated file. Do not edit manually; regenerate via node scripts/build-page-lastmod.mjs",
  source: "src/pages/**/*.astro (static routes only)",
  pageCount: Object.keys(sortedPages).length,
  pages: sortedPages,
};

writeFileSync(OUT, `${JSON.stringify(json, null, 2)}\n`);
console.log(`page-lastmod: wrote ${json.pageCount} entries to ${OUT}`);
