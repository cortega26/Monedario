#!/usr/bin/env node
import path from "node:path";
import {
  BLOG_DIR,
  MANIFEST_PATH,
  isPublishable,
  listArticleFiles,
  normalizeSlug,
  normalizeStringArray,
  parseFrontmatter,
  readArticleFile,
  splitFrontmatter,
  summarizeBody,
  toRepoRelative,
  writeJson,
} from "./lib.mjs";

import { articleContentHash } from "./prompt-plan.mjs";

const PUBLISHED_INDEX_PATH = path.join(
  process.cwd(),
  "context",
  "published-articles-index.json"
);

function stripBodyForAnalysis(body) {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractHeadings(body) {
  return body
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => /^##+\s+/.test(line))
    .map(line => line.replace(/^##+\s+/, "").trim())
    .filter(Boolean)
    .slice(0, 8);
}

function extractLeadParagraphs(body) {
  return body
    .split(/\r?\n\r?\n/)
    .map(block => block.trim())
    .filter(
      block =>
        block &&
        !block.startsWith("#") &&
        !block.startsWith("|") &&
        !block.startsWith("```") &&
        !/^[-*]\s+/.test(block)
    )
    .map(block => block.replace(/\s+/g, " ").trim())
    .slice(0, 3);
}

async function main() {
  const files = await listArticleFiles(BLOG_DIR);
  const articles = [];

  for (const filePath of files) {
    const source = await readArticleFile(filePath);
    const { frontmatterRaw, body } = splitFrontmatter(source);

    if (!frontmatterRaw) {
      console.warn(`[scan-articles] Skipping without frontmatter: ${toRepoRelative(filePath)}`);
      continue;
    }

    const frontmatter = parseFrontmatter(frontmatterRaw, filePath);
    const publishable = isPublishable(frontmatter);

    const slug = normalizeSlug(frontmatter, filePath);
    const updatedDate =
      typeof frontmatter.updatedDate === "string" && frontmatter.updatedDate.trim()
        ? frontmatter.updatedDate.trim()
        : "";
    const bodyForAnalysis = stripBodyForAnalysis(body);
    const headings = extractHeadings(body);
    const leadParagraphs = extractLeadParagraphs(body);

    articles.push({
      slug,
      sourceContentHash: articleContentHash(frontmatter, body),
      title: String(frontmatter.title ?? "").trim(),
      tags: normalizeStringArray(frontmatter.tags),
      category: String(frontmatter.category ?? "general").trim().toLowerCase(),
      cluster: typeof frontmatter.cluster === "string" ? frontmatter.cluster.trim() : "",
      sourcePath: toRepoRelative(filePath),
      heroImage:
        typeof frontmatter.heroImage === "string" && frontmatter.heroImage.trim()
          ? frontmatter.heroImage.trim()
          : "",
      summary: summarizeBody(body, 280),
      leadParagraphs,
      headings,
      bodyExcerpt: bodyForAnalysis.slice(0, 1200),
      wordCount: bodyForAnalysis
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter(Boolean).length,
      sourceFile: path.basename(filePath),
      updatedDate,
      ...(publishable ? {} : { draft: true }),
    });
  }

  articles.sort((a, b) => a.slug.localeCompare(b.slug));
  const publishedArticles = articles.filter(article => !article.draft);

  const manifest = {
    schemaVersion: 1,
    source: "src/data/blog/**",
    inclusionRule: "valid frontmatter (drafts included for pre-publication image planning)",
    articleCount: files.length,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    articles: articles.map(({ updatedDate, ...article }) => article),
  };

  const publishedIndex = {
    schemaVersion: 1,
    generatedBy: "scripts/hero-images/scan-articles.mjs",
    note: "Generated file. Do not edit manually; regenerate via node scripts/hero-images/scan-articles.mjs",
    source: "src/data/blog/**",
    publishableRule: "draft !== true",
    ordering: "slug asc",
    publishedCount: publishedArticles.length,
    articles: publishedArticles.map(article => ({
      slug: article.slug,
      title: article.title,
      category: article.category,
      cluster: article.cluster,
      tags: article.tags,
      sourcePath: article.sourcePath,
      heroImage: article.heroImage,
      summary: article.summary,
      ...(article.updatedDate ? { updatedDate: article.updatedDate } : {}),
    })),
  };

  await writeJson(MANIFEST_PATH, manifest);
  if (!process.argv.includes("--manifest-only")) {
    await writeJson(PUBLISHED_INDEX_PATH, publishedIndex);
  }

  console.log(`[scan-articles] Total files: ${files.length}`);
  console.log(`[scan-articles] Prompt candidates: ${articles.length}`);
  console.log(`[scan-articles] Publishable: ${publishedArticles.length}`);
  console.log(`[scan-articles] Manifest: ${toRepoRelative(MANIFEST_PATH)}`);
  if (!process.argv.includes("--manifest-only")) console.log(`[scan-articles] Published index: ${toRepoRelative(PUBLISHED_INDEX_PATH)}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
