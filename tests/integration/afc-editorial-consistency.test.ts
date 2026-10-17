import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const slugs = [
  "seguro-de-cesantia",
  "seguro-cesantia-cuenta-individual-vs-fondo-solidario",
] as const;

function article(slug: (typeof slugs)[number]): string {
  return readFileSync(resolve("src/data/blog", `${slug}.md`), "utf8");
}

describe("AFC: no regresión editorial de datos oficiales", () => {
  for (const slug of slugs) {
    it(`${slug} usa mínimos y porcentajes CIC vigentes`, () => {
      const content = article(slug);
      expect(content).toContain("10 cotizaciones");
      expect(content).toContain("5 cotizaciones");
      expect(content).toContain("60%");
      expect(content).not.toContain("55%");
      expect(content).not.toContain("al menos 6 cotizaciones");
      expect(content).not.toContain("al menos 3 cotizaciones");
      expect(content).not.toContain("acuerdo mutuo bajo art. 163 bis");
      expect(content).toContain("art. 163 bis");
      expect(content).toContain("validAsOf: 2026-10-16");
      expect(content).toContain(
        "https://www.afc.cl/mi-seguro-de-cesantia/requisitos-y-documentos/"
      );
    });
  }

  it("la guía general identifica bien los aportes de casa particular", () => {
    const content = article("seguro-de-cesantia");
    const row = content
      .split("\n")
      .find(line => line.startsWith("| Casa particular"));
    expect(row?.split("|").map(cell => cell.trim()).slice(2, 5)).toEqual([
      "0%",
      "3%",
      "3%",
    ]);
    expect(content).toContain("10,10%");
  });
});
