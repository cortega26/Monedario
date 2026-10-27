import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guarda de regresión (ADR de corrección `descuentos-de-sueldo`, ronda 3 de
 * compliance, 2026-10-27).
 *
 * La Ley 19.728 (art. 5) exonera a los trabajadores de casa particular del 0,6%
 * del seguro de cesantía: ese 3% es íntegramente del empleador. El dato estaba
 * repetido como regla general en artículos, glosarios y en la calculadora, y
 * tres rondas de auditoría encontraron copias nuevas cada vez.
 *
 * Esta guarda falla si aparece un `0,6%` de cesantía/AFC sin la excepción de
 * casa particular en su vecindad. No reemplaza la auditoría: impide que el
 * mismo hecho vuelva a divergir entre superficies.
 */

const SURFACES = [
  ...readdirSync("src/data/blog")
    .filter(file => file.endsWith(".md"))
    .map(file => join("src/data/blog", file)),
  ...readdirSync("src/data/glossary")
    .filter(file => file.endsWith(".md"))
    .map(file => join("src/data/glossary", file)),
  ...readdirSync("src/pages/calculadoras")
    .filter(file => file.endsWith(".astro"))
    .map(file => join("src/pages/calculadoras", file)),
];

const AFC_RATE = /0[.,]6\s*%/;
const AFC_CONTEXT = /cesant|afc|\bCIC\b|\bFCS\b/i;
const DOMESTIC = /casa particular/i;
// Ventana de vecindad: cubre el caso de tablas donde la fila "Casa particular"
// está a dos líneas de la fila "Indefinido".
const WINDOW = 3;

/**
 * En una tabla markdown la excepción puede vivir en el encabezado (una columna
 * "Casa particular") y no en la fila. Devuelve el encabezado de la tabla que
 * contiene `index`, si existe.
 */
function tableHeaderFor(lines: string[], index: number): string {
  for (let cursor = index; cursor >= 0; cursor -= 1) {
    const line = lines[cursor];
    if (!line.trimStart().startsWith("|")) return "";
    const next = lines[cursor + 1] ?? "";
    if (/^\s*\|[\s:|-]+\|\s*$/.test(next)) return line;
  }
  return "";
}

function offenders(file: string): string[] {
  const lines = readFileSync(file, "utf8").split("\n");
  const found: string[] = [];

  lines.forEach((line, index) => {
    if (!AFC_RATE.test(line) || !AFC_CONTEXT.test(line)) return;
    const from = Math.max(0, index - WINDOW);
    const to = Math.min(lines.length, index + WINDOW + 1);
    const neighbourhood = [
      lines.slice(from, to).join("\n"),
      tableHeaderFor(lines, index),
    ].join("\n");
    if (!DOMESTIC.test(neighbourhood)) {
      found.push(`${file}:${index + 1}: ${line.trim()}`);
    }
  });

  return found;
}

describe("excepción de casa particular en el 0,6% del seguro de cesantía", () => {
  it("ninguna superficie declara el 0,6% sin la excepción de casa particular cerca", () => {
    const offendersByFile = SURFACES.map(offenders).filter(list => list.length > 0);
    expect(
      offendersByFile.flat(),
      "El 0,6% del seguro de cesantía aparece sin la excepción de casa particular (Ley 19.728, art. 5)."
    ).toEqual([]);
  });

  it("el cuerpo de la pieza principal enuncia la excepción y su fundamento legal", () => {
    const post = readFileSync("src/data/blog/descuentos-de-sueldo.md", "utf8");
    const paragraph = post
      .split("\n")
      .find(line => line.includes("**Seguro de cesantía:**"));
    expect(paragraph, "falta el párrafo del seguro de cesantía").toBeDefined();
    expect(paragraph).toMatch(DOMESTIC);
    expect(paragraph).toContain("art. 5");
  });

  it("la tabla de contrato de la pieza principal tiene fila propia para casa particular", () => {
    const post = readFileSync("src/data/blog/descuentos-de-sueldo.md", "utf8");
    expect(post).toMatch(/\|\s*Casa particular\s*\|/);
  });
});
