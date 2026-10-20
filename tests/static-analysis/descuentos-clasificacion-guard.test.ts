import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Guarda de regresión (corrección descuentos-de-sueldo, 2026-10-20): la cuota
 * sindical y el crédito social de una caja de compensación son descuentos
 * obligatorios (DT ORD. N°4184/70 y N°262/4); un atraso puede descontarse como
 * tiempo no trabajado sin multa (DT ORD. N°1578); no todos los descuentos se
 * calculan sobre el imponible; y la fuente principal del artículo 58 debe abrir
 * el texto del artículo (DT ORD. N°680), no otra consulta.
 */
const POST = "src/data/blog/descuentos-de-sueldo.md";
const ORD_680 = "https://www.dt.gob.cl/legislacion/1624/w3-article-111170.html";
const WRONG_ART58_SOURCE =
  "https://www.dt.gob.cl/portal/1628/w3-article-60593.html";

const read = (file: string) => readFileSync(file, "utf8");

function section(content: string, start: string, end: string): string {
  const from = content.indexOf(start);
  const to = content.indexOf(end, from + start.length);
  expect(from, `falta el encabezado "${start}"`).toBeGreaterThan(-1);
  expect(to, `falta el encabezado "${end}"`).toBeGreaterThan(from);
  return content.slice(from, to);
}

describe("descuentos-de-sueldo: clasificación y bases", () => {
  const post = read(POST);

  it("la fuente principal del artículo 58 es el ORD. N°680 y no la consulta de indemnización", () => {
    const firstSource = post.match(/officialSources:\s*\n\s*- label: "[^"]*"\s*\n\s*href: "([^"]+)"/);
    expect(firstSource?.[1]).toBe(ORD_680);
    expect(post).not.toContain(WRONG_ART58_SOURCE);
  });

  it("la sección de descuentos autorizados no incluye cuota sindical ni caja de compensación", () => {
    const authorized = section(
      post,
      "### Descuentos autorizados",
      "### Descuentos prohibidos"
    );
    expect(authorized).not.toMatch(/cuotas? sindicales?/i);
    expect(authorized).not.toMatch(/préstamos de caja de compensación/i);
  });

  it("la cuota sindical y el crédito de caja de compensación figuran como obligatorios", () => {
    const legal = section(
      post,
      "### Descuentos legales",
      "### Descuentos autorizados"
    );
    expect(legal).toMatch(/\*\*Cuota sindical:\*\*[^\n]*obligatorio/);
    expect(legal).toMatch(/\*\*Crédito social de una caja de compensación/);
    expect(legal).toContain("son de aquellos obligatorios comprendidos");
  });

  it("no reaparecen las afirmaciones corregidas", () => {
    for (const forbidden of [
      "Todos se calculan sobre tu [remuneración imponible]",
      "Todos estos descuentos se calculan sobre el **sueldo imponible**",
      "el descuento es exactamente 7%",
      "No. Es un descuento autorizado",
      "Solo si existe una multa por tardanza",
      "ya es un descuento autorizado, no estrictamente legal",
    ]) {
      expect(post, `reapareció: ${forbidden}`).not.toContain(forbidden);
    }
  });

  it("distingue el tiempo no trabajado de la multa y declara los topes", () => {
    expect(post).toContain("tiempo no laborado");
    expect(post).toContain("Multa del reglamento interno");
    for (const cap of ["90 UF", "135,2 UF", "15%", "30%", "45%", "11 años"]) {
      expect(post, `falta el tope ${cap}`).toContain(cap);
    }
  });
});

describe("superficies relacionadas: sin cuota sindical ni CCAF como voluntarias", () => {
  it("primer-empleo-chile-guia-completa", () => {
    const content = read("src/data/blog/primer-empleo-chile-guia-completa.md");
    expect(content).not.toContain("autorizados por ti:** sindicato");
  });

  it("como-calcular-sueldo-liquido", () => {
    const content = read("src/data/blog/como-calcular-sueldo-liquido.md");
    expect(content).not.toContain(
      "Préstamos de caja de compensación, anticipos, seguros voluntarios. Estos son opcionales"
    );
  });

  it("codigo-del-trabajo (resumen del artículo 58)", () => {
    const content = read("src/data/laws/codigo-del-trabajo.md");
    expect(content).not.toContain("seguros de vida, cuotas de caja de compensación");
  });
});
