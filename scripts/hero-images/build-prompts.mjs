#!/usr/bin/env node
import path from "node:path";
import { MANIFEST_PATH, PROMPTS_PATH, readJson, readArticleFile, splitFrontmatter, parseFrontmatter, toRepoRelative, writeJson } from "./lib.mjs";
import { articleContentHash, buildPromptEntry, validateEditReference } from "./prompt-plan.mjs";
import { EDITORIAL_STYLE_VERSION } from "./config.mjs";

async function main() {
  const manifest = await readJson(MANIFEST_PATH);
  const briefs = await readJson(path.join(path.dirname(MANIFEST_PATH), "briefs.json"));
  const briefBySlug = new Map(briefs.entries.map(brief => [brief.slug, brief]));
  if (briefBySlug.size !== briefs.entries.length) throw new Error("Duplicate brief slug.");
  const entries = [];
  for (const article of manifest.articles) {
    const source = await readArticleFile(article.sourcePath);
    const { frontmatterRaw, body } = splitFrontmatter(source);
    const sourceContentHash = articleContentHash(parseFrontmatter(frontmatterRaw, article.sourcePath), body);
    const brief = briefBySlug.get(article.slug);
    const entry = buildPromptEntry({ ...article, sourceContentHash }, brief);
    const referenceErrors = await validateEditReference(brief);
    if (referenceErrors.length) throw new Error(`[${article.slug}] ${referenceErrors.join(" ")}`);
    entries.push(entry);
  }
  entries.sort((a, b) => a.slug.localeCompare(b.slug));
  await writeJson(PROMPTS_PATH, { schemaVersion: 2, styleVersion: EDITORIAL_STYLE_VERSION, sourceManifest: toRepoRelative(MANIFEST_PATH), sourceBriefs: "scripts/hero-images/briefs.json", count: entries.length, entries });
  console.log(`[build-prompts] Reviewed entries: ${entries.length}`);
  console.log(`[build-prompts] Output: ${toRepoRelative(PROMPTS_PATH)}`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
