import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  GLOSSARY_CATEGORY_BY_SLUG,
  GLOSSARY_CATEGORY_ORDER,
} from "@/config/glossaryCategories";

const glossarySlugs = readdirSync("src/data/glossary")
  .filter(fileName => fileName.endsWith(".md"))
  .map(fileName => fileName.replace(/\.md$/, ""))
  .sort();

describe("glossary category registry", () => {
  it("categorizes every glossary entry", () => {
    for (const slug of glossarySlugs) {
      expect(GLOSSARY_CATEGORY_BY_SLUG[slug]).toBeDefined();
    }
  });

  it("uses only declared categories", () => {
    const declaredCategories = new Set(GLOSSARY_CATEGORY_ORDER);

    for (const category of Object.values(GLOSSARY_CATEGORY_BY_SLUG)) {
      expect(declaredCategories.has(category)).toBe(true);
    }
  });

  it("does not map slugs without a glossary file", () => {
    expect(Object.keys(GLOSSARY_CATEGORY_BY_SLUG).sort()).toEqual(glossarySlugs);
  });
});
