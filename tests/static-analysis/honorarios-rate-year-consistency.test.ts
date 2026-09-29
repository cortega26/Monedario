import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AT2026 } from "@/domain/taxation/TaxYearParameters";

/**
 * Guarda D15 (re-auditoría plan 115): en las superficies del ciclo AT2026
 * (ingresos 2025), la retención de honorarios es 14,5%; cualquier mención de
 * 15,25% debe corresponder a boletas emitidas en 2026. La tasa congelada del
 * motor (`AT2026.honorariosPpmRate`) es la referencia.
 */
const AT2026_SURFACES = [
  "src/data/blog/operacion-renta-centro.md",
  "src/data/blog/impuesto-global-complementario-chile.md",
  "src/data/blog/rentas-mixtas-sueldo-honorarios.md",
  "src/pages/guias/impuestos-personas/operacion-renta/index.astro",
];

const WINDOW = 120;

describe("honorarios: tasa por año comercial en superficies AT2026", () => {
  it("el motor congela 14,5% para boletas 2025", () => {
    expect(AT2026.honorariosPpmRate).toBe(0.145);
  });

  for (const file of AT2026_SURFACES) {
    it(`${file}: cita 14,5% y atribuye 15,25% solo a 2026`, () => {
      const content = readFileSync(file, "utf8");
      expect(content, `${file}: debe citar la tasa 2025 (14,5%)`).toContain(
        "14,5"
      );

      let index = content.indexOf("15,25");
      while (index !== -1) {
        const context = content.slice(
          Math.max(0, index - WINDOW),
          index + WINDOW
        );
        expect(
          context,
          `${file}: "15,25" sin contexto de 2026 cerca de: ${context.slice(0, 80)}`
        ).toMatch(/2026/);
        index = content.indexOf("15,25", index + 1);
      }
    });
  }
});
