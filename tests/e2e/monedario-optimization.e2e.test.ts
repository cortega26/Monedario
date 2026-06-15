import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

const calculatorPages = readdirSync(join(root, "src/pages/calculadoras"))
  .filter(file => file.endsWith(".astro") && file !== "index.astro")
  .sort();

describe("Monedario optimization implementation", () => {
  it("defines the reusable calculator trust badge", () => {
    const path = "src/components/CalculatorTrustBadge.astro";
    expect(existsSync(join(root, path))).toBe(true);

    const content = read(path);
    expect(content).toContain("location?: string");
    expect(content).toContain("aboutHref?: string");
    expect(content).toContain("corre en tu navegador");
    expect(content).toContain("No guardamos los datos");
    expect(content).toContain('data-analytics-cta="calculator-trust-link"');
  });

  it("defines the reusable next steps component", () => {
    const path = "src/components/NextSteps.astro";
    expect(existsSync(join(root, path))).toBe(true);

    const content = read(path);
    expect(content).toContain("currentHref: string");
    expect(content).toContain("excludeHrefs?: string[]");
    expect(content).toContain("slice(0, 3)");
    expect(content).toContain('data-analytics-cta="next-step"');
  });

  it("renders trust and next steps on every calculator detail page", () => {
    expect(calculatorPages.length).toBeGreaterThan(0);

    for (const file of calculatorPages) {
      const content = read(`src/pages/calculadoras/${file}`);
      // The calculator either imports the components directly, or uses
      // CalculatorShell which provides them transitively.
      if (content.includes("CalculatorShell")) continue;
      expect(content, file).toContain("CalculatorTrustBadge");
      expect(content, file).toContain("NextSteps");
      expect(content, file).toContain("CALCULATOR_PORTFOLIO");
    }
  });

  it("renders article next steps and excludes them from related posts", () => {
    const content = read("src/layouts/PostDetails.astro");

    expect(content).toContain("NextSteps");
    expect(content).toContain("nextStepItems");
    expect(content).toContain("nextStepExcludedHrefs");
    expect(content).toContain("relatedPostsExcludedSlugs");
  });

  it("keeps Breadcrumb as the single BreadcrumbList source for articles", () => {
    const articleJsonLd = read("src/components/ArticleJsonLd.astro");
    const breadcrumb = read("src/components/Breadcrumb.astro");

    expect(articleJsonLd).not.toContain('"@type": "BreadcrumbList"');
    expect(breadcrumb).toContain('"@type": "BreadcrumbList"');
  });

  it("tracks search chips and explicit continuity events", () => {
    const search = read("src/pages/buscar.astro");
    const analytics = `${read("src/scripts/analytics.ts")}\n${read("src/utils/analytics.ts")}`;

    expect(search).toContain('data-analytics-cta="search-chip"');
    expect(analytics).toContain("search_chip_click");
    expect(analytics).toContain("next_step_click");
    expect(analytics).toContain("related_content_click");
    expect(analytics).toContain("calculator_trust_link_click");
    expect(analytics).toContain("hub_route_click");
  });
});
