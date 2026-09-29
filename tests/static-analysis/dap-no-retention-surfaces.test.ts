import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guarda D14 (re-auditoría plan 115): las superficies públicas del DAP
 * (title/description, JSON-LD y ficha del catálogo/LLM) no pueden prometer un
 * "impuesto 4%" ni una "retención de impuesto": el 4% es Impuesto Adicional de
 * no residentes (art. 59 inc. 2° N°1 a)/g) LIR) y el motor no retiene a
 * residentes. La mención correcta vive en la FAQ de la página.
 */
const page = readFileSync(
  "src/pages/calculadoras/deposito-a-plazo.astro",
  "utf8"
);
const layoutTag = page.match(/<Layout[\s\S]*?>/)?.[0] ?? "";
const jsonLdTag = page.match(/<CalculatorJsonLd[\s\S]*?\/>/)?.[0] ?? "";

const portfolio = readFileSync("src/config/calculatorPortfolio.ts", "utf8");
const dapEntry =
  portfolio.match(
    /href: "\/calculadoras\/deposito-a-plazo\/",[\s\S]*?\n  },/
  )?.[0] ?? "";

describe("DAP: superficies sin retención del 4%", () => {
  it("las superficies existen y no prometen impuesto/retención del 4%", () => {
    expect(layoutTag).not.toBe("");
    expect(jsonLdTag).not.toBe("");
    expect(dapEntry).not.toBe("");

    for (const [name, surface] of [
      ["layout", layoutTag],
      ["jsonld", jsonLdTag],
      ["portfolio", dapEntry],
    ] as const) {
      expect(surface, `${name}: no debe citar 4%`).not.toMatch(/4\s*%/);
      expect(surface, `${name}: no debe prometer impuesto/retención`).not.toMatch(
        /impuesto 4|retención de impuesto/i
      );
    }
  });
});

/**
 * D17 (pass4): el mismo hecho reapareció en contenido relacionado. Barrido del
 * corpus: toda mención de retención cerca de DAP/depósito a plazo debe aclarar
 * que el 4% es Impuesto Adicional de no residentes (art. 59 LIR).
 */
const BLOG_DIR = "src/data/blog";
const WINDOW = 180;

describe("DAP: retención del 4% solo no residentes en contenido relacionado", () => {
  it("ningún artículo atribuye retención por DAP a residentes", () => {
    const files = readdirSync(BLOG_DIR).filter(
      file => file.endsWith(".md") || file.endsWith(".mdx")
    );

    for (const file of files) {
      const content = readFileSync(path.join(BLOG_DIR, file), "utf8");
      let index = content.search(/retención/i);
      while (index !== -1) {
        const context = content.slice(
          Math.max(0, index - WINDOW),
          index + WINDOW
        );
        if (/DAP|depósito a plazo/i.test(context)) {
          expect(
            context,
            `${file}: retención junto a DAP sin aclarar no residentes: ${context.slice(0, 100)}`
          ).toMatch(/no residente|Impuesto Adicional/i);
        }
        const next = content.slice(index + 1).search(/retención/i);
        index = next === -1 ? -1 : index + 1 + next;
      }
    }
  });

  it("ninguna página .astro de guías o calculadoras la atribuye a residentes", () => {
    for (const dir of ["src/pages/guias", "src/pages/calculadoras"]) {
      for (const entry of readdirSync(dir, { recursive: true })) {
        const file = typeof entry === "string" ? entry : entry.toString();
        if (!file.endsWith(".astro")) continue;
        const full = path.join(dir, file);
        const content = readFileSync(full, "utf8");
        let index = content.search(/retención/i);
        while (index !== -1) {
          const context = content.slice(
            Math.max(0, index - WINDOW),
            index + WINDOW
          );
          if (/DAP|depósito a plazo/i.test(context)) {
            expect(
              context,
              `${full}: retención junto a DAP sin aclarar no residentes: ${context.slice(0, 100)}`
            ).toMatch(/no residente|Impuesto Adicional/i);
          }
          const next = content.slice(index + 1).search(/retención/i);
          index = next === -1 ? -1 : index + 1 + next;
        }
      }
    }
  });
});
