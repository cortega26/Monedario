/**
 * Glossary HTML decision (plan 006 step 5).
 * Pipeline permits raw HTML, so GlossaryContentWrapper sanitizes.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readRepo(relative: string): string {
  return readFileSync(resolve(process.cwd(), relative), "utf-8");
}

describe("Glossary HTML pipeline decision", () => {
  it("markdown pipeline permits raw HTML (mdx + no rehype sanitize)", () => {
    const astroConfig = readRepo("astro.config.ts");
    expect(astroConfig).toContain("mdx()");
    expect(astroConfig).not.toMatch(/rehypeSanitize|rehype-sanitize/);
    const blogSample = readRepo(
      "src/data/blog/operacion-renta-f22-checklist.md"
    );
    expect(blogSample).toContain("<details>");
  });

  it("GlossaryContentWrapper sanitizes before injecting glossary links", () => {
    const wrapper = readRepo("src/components/GlossaryContentWrapper.astro");
    expect(wrapper).toContain("sanitizeGlossaryHtml");
    expect(wrapper).toContain("injectGlossaryLinks(safeHtml)");
    // Order: sanitize first, then inject links.
    expect(wrapper.indexOf("sanitizeGlossaryHtml")).toBeLessThan(
      wrapper.indexOf("injectGlossaryLinks(safeHtml)")
    );
  });

  it("sanitizer allowlist preserves legitimate markup", () => {
    const wrapper = readRepo("src/components/GlossaryContentWrapper.astro");
    for (const tag of ["details", "summary", "table", "p", '"a"']) {
      expect(wrapper).toContain(tag);
    }
    expect(wrapper).toContain("<script");
  });
});
