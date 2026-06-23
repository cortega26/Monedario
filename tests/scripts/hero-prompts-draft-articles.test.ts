import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { load as parseYaml, JSON_SCHEMA } from "js-yaml";

const BLOG_DIR = path.resolve("src/data/blog");

function articleFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return articleFiles(entryPath);
    return /\.mdx?$/.test(entry.name) ? [entryPath] : [];
  });
}

function frontmatter(filePath: string): Record<string, unknown> {
  const source = fs.readFileSync(filePath, "utf8");
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  return (parseYaml(match?.[1] ?? "", { schema: JSON_SCHEMA }) ?? {}) as Record<
    string,
    unknown
  >;
}

describe("hero prompt coverage for draft articles", () => {
  it("plans prompts for every article without exposing drafts in the published index", () => {
    const articles = articleFiles(BLOG_DIR).map(frontmatter);
    const articleSlugs = articles.map(article => String(article.slug));
    const draftSlugs = articles
      .filter(article => article.draft === true)
      .map(article => String(article.slug));
    const manifest = JSON.parse(fs.readFileSync("scripts/hero-images/manifest.json", "utf8"));
    const prompts = JSON.parse(fs.readFileSync("scripts/hero-images/prompts.json", "utf8"));
    const published = JSON.parse(
      fs.readFileSync("context/published-articles-index.json", "utf8")
    );

    const manifestSlugs = new Set(manifest.articles.map((article: { slug: string }) => article.slug));
    const promptSlugs = new Set(prompts.entries.map((entry: { slug: string }) => entry.slug));
    const publishedSlugs = new Set(
      published.articles.map((article: { slug: string }) => article.slug)
    );

    for (const slug of articleSlugs) {
      expect(manifestSlugs.has(slug)).toBe(true);
      expect(promptSlugs.has(slug)).toBe(true);
    }

    for (const slug of draftSlugs) {
      expect(publishedSlugs.has(slug)).toBe(false);
    }
  });
});
