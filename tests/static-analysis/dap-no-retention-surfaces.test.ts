import { readFileSync } from "node:fs";
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
