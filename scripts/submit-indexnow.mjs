#!/usr/bin/env node

/**
 * submit-indexnow.mjs
 *
 * Notifies IndexNow-participating search engines (Bing, Yandex, Naver,
 * Seznam, Yep) when content URLs change. Google does NOT consume IndexNow.
 *
 * Usage:
 *   node scripts/submit-indexnow.mjs <changed-file> [<changed-file> ...]
 *   node scripts/submit-indexnow.mjs --dry-run <changed-file> ...
 *
 * Each argument is a repo-relative path (as produced by `git diff --name-only`).
 * The script maps content/page files to public URLs, skips everything it
 * cannot map, and POSTs the resulting URL list to the IndexNow endpoint.
 *
 * Submission failures are logged but non-fatal: a flaky external API must
 * not turn a deploy red.
 */

import { readFileSync } from "node:fs";

const KEY = "eed4e4a8f52e5517e712eef975631be2";
const ORIGIN = "https://monedario.cl";
const HOST = "monedario.cl";
const KEY_LOCATION = `${ORIGIN}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run") || process.env.INDEXNOW_DRY_RUN === "1";
const files = args.filter(arg => !arg.startsWith("--"));

/** Extract a frontmatter scalar (handles optional quotes). */
function readFrontmatterField(path, field) {
  let raw;
  try {
    raw = readFileSync(path, "utf-8");
  } catch {
    return null;
  }
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const line = fm[1].match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  if (!line) return null;
  return line[1].trim().replace(/^["']|["']$/g, "");
}

function isDraft(path) {
  return readFrontmatterField(path, "draft") === "true";
}

const basename = path => path.split("/").pop().replace(/\.(md|mdx|astro)$/, "");

/** Map one repo-relative path to a public URL, or null if not mappable. */
function pathToUrl(path) {
  // Blog posts — slug lives in frontmatter, not the filename.
  if (/^src\/data\/blog\/.+\.(md|mdx)$/.test(path)) {
    if (isDraft(path)) return null;
    const slug = readFrontmatterField(path, "slug");
    return slug ? `${ORIGIN}/posts/${slug}/` : null;
  }

  // Laws — collection id is the filename.
  if (/^src\/data\/laws\/.+\.(md|mdx)$/.test(path)) {
    if (isDraft(path)) return null;
    return `${ORIGIN}/leyes/${basename(path)}/`;
  }

  // Glossary — collection id is the filename.
  if (/^src\/data\/glossary\/.+\.(md|mdx)$/.test(path)) {
    if (isDraft(path)) return null;
    return `${ORIGIN}/glosario/${basename(path)}/`;
  }

  // Static .astro pages. Dynamic routes ([slug], [...page]) and non-.astro
  // endpoints (robots.txt.ts, rss.xml.ts, og.png.ts) are not crawlable pages.
  if (/^src\/pages\/.+\.astro$/.test(path)) {
    let route = path.replace(/^src\/pages\//, "").replace(/\.astro$/, "");
    if (route.split("/").some(seg => seg.startsWith("["))) return null;
    route = route.replace(/(^|\/)index$/, "");
    return route ? `${ORIGIN}/${route}/` : `${ORIGIN}/`;
  }

  return null;
}

const urls = [...new Set(files.map(pathToUrl).filter(Boolean))];

if (urls.length === 0) {
  console.log("IndexNow: no submittable URLs in this change set — nothing to do.");
  process.exit(0);
}

console.log(`IndexNow: ${urls.length} URL(s) to submit:`);
for (const url of urls) console.log(`  - ${url}`);

if (dryRun) {
  console.log("IndexNow: --dry-run, not submitting.");
  process.exit(0);
}

const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls };

try {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  if (res.ok) {
    console.log(`IndexNow: submitted (HTTP ${res.status}).`);
  } else {
    const text = await res.text().catch(() => "");
    console.warn(
      `IndexNow: endpoint returned HTTP ${res.status}. ${text}`.trim()
    );
    console.warn(
      "IndexNow: submission not accepted — check that the key file is " +
        `live at ${KEY_LOCATION}.`
    );
  }
} catch (err) {
  console.warn(`IndexNow: request failed (${err.message}) — non-fatal.`);
}
