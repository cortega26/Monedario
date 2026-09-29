import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import {
  CALCULATOR_DECISION_GUIDES,
  CALCULATOR_FAMILIES,
  CALCULATOR_FOOTER_SHORTCUTS,
  CALCULATOR_FAMILY_ORDER,
  CALCULATOR_PORTFOLIO,
} from "@/config/calculatorPortfolio";

function postSlugs(): Set<string> {
  const slugs = new Set<string>();
  for (const file of readdirSync("src/data/blog")) {
    const match = /^([^.]+)\.(md|mdx)$/.exec(file);
    if (!match) continue;
    const source = readFileSync(`src/data/blog/${file}`, "utf8");
    const frontmatterSlug = /^slug:\s*"?([^"\n]+?)"?\s*$/m.exec(source);
    slugs.add(frontmatterSlug?.[1] ?? match[1]);
  }
  return slugs;
}

function relatedHrefExists(href: string, calculatorHrefs: Set<string>): boolean {
  if (calculatorHrefs.has(href)) return true;
  const calc = /^\/calculadoras\/([^/]+)\/$/.exec(href);
  if (calc) return existsSync(`src/pages/calculadoras/${calc[1]}.astro`);
  const post = /^\/posts\/([^/]+)\/$/.exec(href);
  if (post) return postSlugs().has(post[1]);
  const guide = /^\/guias\/([^/]+)\/$/.exec(href);
  if (guide) return existsSync(`src/pages/guias/${guide[1]}/index.astro`);
  const glossary = /^\/glosario\/([^/]+)\/$/.exec(href);
  if (glossary) {
    return existsSync(`src/data/glossary/${glossary[1]}.md`);
  }
  return false;
}

describe("calculator portfolio registry", () => {
  it("keeps every calculator in a declared family", () => {
    const familyIds = new Set(CALCULATOR_FAMILY_ORDER);

    expect(CALCULATOR_PORTFOLIO).toHaveLength(22);
    expect(CALCULATOR_FAMILY_ORDER).toHaveLength(4);

    for (const calculator of CALCULATOR_PORTFOLIO) {
      expect(familyIds.has(calculator.family)).toBe(true);
      expect(calculator.primaryJtbd.trim().length).toBeGreaterThan(10);
      expect(calculator.whenToUse.trim().length).toBeGreaterThan(10);
      expect(calculator.notFor.trim().length).toBeGreaterThan(10);
    }
  });

  it("does not duplicate calculator routes and keeps every family populated", () => {
    const hrefs = CALCULATOR_PORTFOLIO.map(calculator => calculator.href);
    const uniqueHrefs = new Set(hrefs);

    expect(uniqueHrefs.size).toBe(hrefs.length);

    for (const familyId of CALCULATOR_FAMILY_ORDER) {
      expect(CALCULATOR_FAMILIES[familyId]).toBeDefined();
      expect(
        CALCULATOR_PORTFOLIO.some(calculator => calculator.family === familyId)
      ).toBe(true);
    }

    for (const calculator of CALCULATOR_PORTFOLIO) {
      for (const related of calculator.related) {
        expect(relatedHrefExists(related.href, uniqueHrefs), related.href).toBe(
          true
        );
        expect(related.label.trim().length).toBeGreaterThan(3);
        expect(related.when.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it("keeps the approved decision-path next steps for seguro-cesantia and prepago-credito", () => {
    const bySlug = new Map(
      CALCULATOR_PORTFOLIO.map(calculator => [calculator.slug, calculator])
    );

    const cesantia = bySlug.get("seguro-cesantia");
    expect(cesantia?.related.map(related => related.href)).toEqual([
      "/calculadoras/sueldo-liquido/",
      "/calculadoras/finiquito-indemnizacion/",
      "/posts/seguro-cesantia-cuenta-individual-vs-fondo-solidario/",
    ]);

    const prepago = bySlug.get("prepago-credito");
    expect(prepago?.related.map(related => related.href)).toEqual([
      "/calculadoras/credito-consumo/",
      "/guias/ahorro-e-inversion/",
      "/calculadoras/simulador-renegociacion/",
    ]);

    expect(
      prepago?.related.find(related => related.href === "/guias/ahorro-e-inversion/")
        ?.label
    ).toBe("Ahorro: qué hago con la cuota liberada");
  });

  it("keeps chooser guides aligned with existing calculators", () => {
    const hrefs = new Set(CALCULATOR_PORTFOLIO.map(calculator => calculator.href));

    expect(CALCULATOR_DECISION_GUIDES.length).toBeGreaterThanOrEqual(8);

    for (const guide of CALCULATOR_DECISION_GUIDES) {
      expect(guide.title.trim().length).toBeGreaterThan(5);
      expect(guide.situation.trim().length).toBeGreaterThan(10);
      expect(guide.why.trim().length).toBeGreaterThan(10);
      expect(hrefs.has(guide.recommendedHref)).toBe(true);
    }
  });

  it("derives footer shortcuts from selected calculator entries", () => {
    const hrefs = new Set(CALCULATOR_PORTFOLIO.map(calculator => calculator.href));
    const shortcutHrefs = CALCULATOR_FOOTER_SHORTCUTS.map(shortcut => shortcut.href);

    // SEO-02 (plan 117): el bloque sitewide se limita a 2 herramientas.
    expect(shortcutHrefs).toEqual([
      "/calculadoras/sueldo-liquido/",
      "/calculadoras/conversor-uf/",
    ]);

    for (const shortcut of CALCULATOR_FOOTER_SHORTCUTS) {
      expect(hrefs.has(shortcut.href)).toBe(true);
      expect(shortcut.label.trim().length).toBeGreaterThan(3);
    }
  });
});
