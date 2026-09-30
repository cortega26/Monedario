import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guarda D18/D20 (pass4 plan 115): el año tributario es el año de la
 * declaración (AT2026 = rentas 2025). Las superficies de la campaña 2026 no
 * pueden etiquetar las rentas 2025 como «año tributario 2025»; la UTA se
 * define sobre el año comercial (diciembre 2025 para el AT2026); y la tasa de
 * honorarios se fija por año comercial (boletas 2026 ⇒ AT2027).
 */
const OPERACION_RENTA_CENTRO = "src/data/blog/operacion-renta-centro.md";
const IMPUESTO_GLOBAL = "src/data/blog/impuesto-global-complementario-chile.md";
const BOLETA_HONORARIOS = "src/pages/calculadoras/boleta-honorarios-liquido.astro";

describe("taxonomía año comercial / año tributario", () => {
  it("operacion-renta-centro (campaña 2026) no usa «año tributario 2025»", () => {
    const content = readFileSync(OPERACION_RENTA_CENTRO, "utf8");
    expect(content).not.toContain("año tributario 2025");
    expect(content).toContain("año tributario 2026");
  });

  it("la UTA se define sobre el año comercial", () => {
    const content = readFileSync(IMPUESTO_GLOBAL, "utf8");
    let index = content.indexOf("12 × UTM");
    expect(index, "debe existir la definición 12 × UTM").toBeGreaterThan(-1);
    while (index !== -1) {
      const context = content.slice(index, index + 140);
      expect(
        context,
        `UTA sin año comercial en el contexto: ${context.slice(0, 90)}`
      ).toContain("año comercial");
      index = content.indexOf("12 × UTM", index + 1);
    }
  });

  it("la nota del 15,25% se rotula por año comercial (boletas 2026 ⇒ AT2027)", () => {
    const content = readFileSync(BOLETA_HONORARIOS, "utf8");
    expect(content).not.toMatch(/15,25[^.]{0,120}año tributario 2026/i);
    expect(content).toMatch(/15,25[^.]{0,160}año comercial 2026/i);
  });

  it("el glosario no hardcodea umbrales de impuesto en CLP aproximado (D24)", () => {
    const dir = "src/data/glossary";
    for (const file of readdirSync(dir).filter(name => name.endsWith(".md"))) {
      const content = readFileSync(path.join(dir, file), "utf8");
      for (const [index, line] of content.split("\n").entries()) {
        if (/~\$\d/.test(line) && /impuesto|tramo exento/i.test(line)) {
          expect.fail(
            `${file}:${index + 1}: usa UTM (p. ej. [[utm * 13.5 | clp]]) en vez de CLP aproximado: ${line.trim()}`
          );
        }
      }
    }
  });
});
