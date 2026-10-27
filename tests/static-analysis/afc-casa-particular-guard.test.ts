import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Guarda de regresión — excepción de casa particular en el 0,6% del seguro de
 * cesantía (Ley 19.728, art. 5: el 3% es íntegramente del empleador).
 *
 * **Qué es y qué no es.** Es una guarda *estructural*: fija invariantes
 * concretos por superficie conocida. No es un analizador semántico y no
 * pretende serlo.
 *
 * Historia: la primera versión escaneaba texto libre exigiendo que "casa
 * particular" apareciera cerca del `0,6%`. La auditoría R4 la atacó con
 * "Cesantía AFC para trabajador de casa particular: aporte trabajador 0,6%" y
 * pasó 3/3 — verificaba co-ocurrencia, no corrección. Una segunda versión con
 * heurísticas de exención generó falsos positivos sobre frases correctas
 * ("excluye", "salvo", líneas partidas). Se descartó: un guard ruidoso se
 * desactiva y deja de proteger.
 *
 * La corrección semántica la sigue dando la auditoría; esto solo impide que el
 * defecto ya corregido reaparezca por descuido.
 */

const read = (file: string) => readFileSync(file, "utf8");

/** Formas exactas que ya fueron defecto y no deben volver. */
const FORBIDDEN = [
  // Fila que atribuía el 0,6% al trabajador de casa particular.
  /\|\s*Casa particular\s*\|\s*0[.,]6\s*%/i,
  // El total de descuentos sin reconocer la excepción.
  /\|\s*\*\*Total descuentos legales\*\*\s*\|\s*\*\*~18,1 %\*\*\s*\|/,
];

const FORBIDDEN_FILES = [
  "src/data/blog/seguro-de-cesantia.md",
  "src/data/blog/primer-empleo-chile-guia-completa.md",
  "src/data/blog/descuentos-de-sueldo.md",
];

describe("casa particular en el 0,6% del seguro de cesantía", () => {
  it("ninguna superficie conserva las formas defectuosas conocidas", () => {
    for (const file of FORBIDDEN_FILES) {
      const content = read(file);
      for (const pattern of FORBIDDEN) {
        expect(
          pattern.test(content),
          `${file} conserva una forma defectuosa: ${pattern}`
        ).toBe(false);
      }
    }
  });

  it("el cuerpo de la pieza principal enuncia la excepción y su fundamento", () => {
    const post = read("src/data/blog/descuentos-de-sueldo.md");
    const paragraph = post
      .split("\n")
      .find(line => line.includes("**Seguro de cesantía:**"));
    expect(paragraph).toBeDefined();
    expect(paragraph).toMatch(/casa particular/i);
    expect(paragraph).toContain("art. 5");
  });

  it("la tabla por tipo de contrato tiene fila propia para casa particular", () => {
    const post = read("src/data/blog/descuentos-de-sueldo.md");
    expect(post).toMatch(/\|\s*Casa particular\s*\|/);
  });

  it("la ficha de la Ley 19.728 menciona la excepción en su regla general", () => {
    const law = read("src/data/laws/ley-19728-seguro-cesantia.md");
    const rule = law
      .split("\n")
      .find(line => line.includes("**Regla general:**"));
    expect(rule).toBeDefined();
    expect(rule).toMatch(/casa particular/i);
  });

  it("toda calculadora con selector de contrato ofrece casa particular", () => {
    const selectors = [
      "src/pages/calculadoras/sueldo-liquido.astro",
      "src/pages/calculadoras/apv.astro",
      "src/pages/calculadoras/operacion-renta.astro",
    ];
    for (const file of selectors) {
      expect(read(file), `${file} no ofrece casa particular`).toContain(
        "casa-particular"
      );
    }
  });
});
