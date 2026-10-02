import { describe, expect, it } from "vitest";

import {
  filterCorrections,
  formatCorrectionDate,
  groupCorrectionsByMonth,
  type Correction,
} from "@/utils/corrections";
import registry from "@/data/correcciones.json";

function sample(overrides: Partial<Correction> = {}): Correction {
  return {
    id: "ejemplo",
    date: "2026-09-29",
    title: "Título de ejemplo",
    pages: [{ href: "/calculadoras/ejemplo/", label: "Ejemplo" }],
    wrong: ["Estaba mal."],
    fixed: ["Quedó bien."],
    affected: "Lectores afectados.",
    sources: "Fuente oficial.",
    prevention: "Control nuevo.",
    ...overrides,
  };
}

describe("formatCorrectionDate", () => {
  it("formatea una fecha simple en español", () => {
    expect(formatCorrectionDate(sample())).toBe("29 de septiembre de 2026");
  });

  it("formatea un rango de dos días", () => {
    expect(
      formatCorrectionDate(
        sample({ date: "2026-09-28", dateEnd: "2026-09-29" })
      )
    ).toBe("28 y 29 de septiembre de 2026");
  });
});

describe("groupCorrectionsByMonth", () => {
  it("agrupa por mes con el más reciente primero", () => {
    const groups = groupCorrectionsByMonth([
      sample({ id: "viejo", date: "2026-08-10" }),
      sample({ id: "nuevo-b", date: "2026-09-29" }),
      sample({ id: "nuevo-a", date: "2026-09-01" }),
    ]);
    expect(groups.map(group => group.key)).toEqual(["2026-09", "2026-08"]);
    expect(groups[0].label).toBe("septiembre de 2026");
    expect(groups[0].corrections.map(c => c.id)).toEqual([
      "nuevo-b",
      "nuevo-a",
    ]);
  });
});

describe("filterCorrections", () => {
  const entries = [
    sample({ id: "a", title: "Tope de 90 UF en finiquito" }),
    sample({
      id: "b",
      title: "Tramos del impuesto",
      pages: [{ href: "/posts/tramos/", label: "Tramos" }],
    }),
  ];

  it("filtra por texto en título y cuerpo", () => {
    expect(filterCorrections(entries, "finiquito", "all")).toHaveLength(1);
    expect(filterCorrections(entries, "inexistente", "all")).toHaveLength(0);
  });

  it("filtra por área derivada de las páginas", () => {
    expect(filterCorrections(entries, "", "Artículos")).toHaveLength(1);
    expect(filterCorrections(entries, "", "Glosario")).toHaveLength(0);
    expect(filterCorrections(entries, "", "all")).toHaveLength(2);
  });
});

describe("src/data/correcciones.json", () => {
  it("es un registro válido y ordenable", () => {
    const entries = (registry as { corrections: Correction[] }).corrections;
    expect(entries.length).toBeGreaterThan(0);
    const ids = entries.map(entry => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const entry of entries) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(entry.pages.length).toBeGreaterThan(0);
      expect(entry.wrong.length).toBeGreaterThan(0);
      expect(entry.fixed.length).toBeGreaterThan(0);
    }
  });
});
