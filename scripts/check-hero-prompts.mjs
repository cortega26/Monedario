#!/usr/bin/env node
import path from "node:path";
import { MANIFEST_PATH, PROMPTS_PATH, readJson, readArticleFile, splitFrontmatter, parseFrontmatter, sha256Hex } from "./hero-images/lib.mjs";
import { articleContentHash, buildPromptEntry, validateBrief, validateEditReference } from "./hero-images/prompt-plan.mjs";
import { EDITORIAL_STYLE_VERSION } from "./hero-images/config.mjs";
const configuredPath = (key, fallback) => process.env[key] ? path.resolve(process.env[key]) : fallback;
async function main() {
  const manifest = await readJson(configuredPath("HERO_MANIFEST_PATH", MANIFEST_PATH));
  const prompts = await readJson(configuredPath("HERO_PROMPTS_PATH", PROMPTS_PATH));
  const briefs = await readJson(configuredPath("HERO_BRIEFS_PATH", path.join(path.dirname(MANIFEST_PATH), "briefs.json")));
  const errors = [];
  const entries = prompts.entries ?? [];
  const articles = manifest.articles ?? [];
  const briefEntries = briefs.entries ?? [];
  const entryBySlug = new Map(entries.map(entry => [entry.slug, entry]));
  const briefBySlug = new Map(briefEntries.map(brief => [brief.slug, brief]));
  const promptTexts = new Map();
  const scenes = new Map();
  if (prompts.schemaVersion !== 2 || prompts.styleVersion !== EDITORIAL_STYLE_VERSION) errors.push("Outdated prompt schema/style. Rebuild prompts from reviewed briefs.");
  if (entries.length !== articles.length || entryBySlug.size !== entries.length) errors.push("Prompt count mismatch or duplicate slug.");
  if (briefBySlug.size !== briefEntries.length) errors.push("Duplicate brief slug.");
  for (const article of articles) {
    const slug = article.slug;
    const brief = briefBySlug.get(slug);
    const entry = entryBySlug.get(slug);
    if (!entry) { errors.push(`[${slug}] Missing prompt entry.`); continue; }
    try {
      const { frontmatterRaw, body } = splitFrontmatter(await readArticleFile(article.sourcePath));
      const currentHash = articleContentHash(parseFrontmatter(frontmatterRaw, article.sourcePath), body);
      const currentArticle = { ...article, sourceContentHash: currentHash };
      if (article.sourceContentHash !== currentHash) errors.push(`[${slug}] Manifest source hash is stale; run scan-articles after reviewing the article change.`);
      const briefErrors = [...validateBrief(currentArticle, brief), ...await validateEditReference(brief)];
      errors.push(...briefErrors.map(error => `[${slug}] ${error}`));
      if (!briefErrors.length) {
        const expected = buildPromptEntry(currentArticle, brief);
        for (const key of ["sourcePath", "generationMethod", "referenceImagePath", "referenceImageHash", "styleVersion", "sourceContentHash", "briefHash", "targetImagePath", "sceneId", "approvedModelId", "promptTrack", "template", "readerSituation", "alt", "prompt", "promptHash"]) {
          if (entry[key] !== expected[key]) errors.push(`[${slug}] ${key} differs from the reviewed brief. Rebuild prompts; do not append operational notes.`);
        }
        if (JSON.stringify(entry.briefReview) !== JSON.stringify(expected.briefReview)) errors.push(`[${slug}] briefReview differs from the current review.`);
        const otherScene = scenes.get(brief.scene);
        if (otherScene) errors.push(`[${slug}] Duplicate scene with ${otherScene}; review article differentiation.`);
        scenes.set(brief.scene, slug);
      }
      if (entry.promptHash !== sha256Hex(entry.prompt ?? "")) errors.push(`[${slug}] promptHash does not match prompt content.`);
      const otherPrompt = promptTexts.get(entry.prompt);
      if (otherPrompt) errors.push(`[${slug}] Duplicate prompt detected with ${otherPrompt}.`);
      promptTexts.set(entry.prompt, slug);
    } catch (error) { errors.push(`[${slug}] ${error.message}`); }
  }
  console.log(`[check-hero-prompts] Checked entries: ${articles.length}; style: ${EDITORIAL_STYLE_VERSION}`);
  if (errors.length) {
    console.error(`[check-hero-prompts] FAIL: ${errors.length} issue(s)\n${errors.map(error => `- ${error}`).join("\n")}`);
    process.exitCode = 1;
    return;
  }
  console.log("[check-hero-prompts] OK");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
