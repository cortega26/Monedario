import { describe, expect, it } from "vitest";
import { getReadingTime } from "@/utils/readingTime";
import { slugifyAll, slugifyStr } from "@/utils/slugify";

describe("getReadingTime", () => {
  it("devuelve 1 min para vacío y mínimo", () => {
    expect(getReadingTime("")).toBe("1 min de lectura");
    expect(getReadingTime("   ")).toBe("1 min de lectura");
    expect(getReadingTime("una palabra")).toBe("1 min de lectura");
  });

  it("redondea hacia arriba según palabras", () => {
    const twoHundred = Array.from({ length: 200 }, (_, i) => `palabra${i}`).join(" ");
    expect(getReadingTime(twoHundred)).toBe("1 min de lectura");
    const fourHundred = Array.from({ length: 400 }, (_, i) => `palabra${i}`).join(" ");
    expect(getReadingTime(fourHundred)).toBe("2 min de lectura");
  });
});

describe("slugifyStr / slugifyAll", () => {
  it("slugifica strings Latin (números y acrónimos)", () => {
    expect(slugifyStr("E2E Testing")).toBe("e2e-testing");
    expect(slugifyStr("TypeScript 5.0")).toBe("typescript-5.0");
    expect(slugifyStr("Renta Imponible")).toBe("renta-imponible");
  });

  it("preserva caracteres no-Latin con kebabcase (espacios); camelCase Latin NO se divide (branch slugify)", () => {
    expect(slugifyStr("рета импонибле")).toBe("рета-импонибле");
    // Comportamiento real: "camelCaseChino" es Latin → branch slugify() →
    // lowercase unido sin separar camelCase (el split camelCase vive en el
    // branch no-Latin de kebabcase).
    expect(slugifyStr("camelCaseChino")).toBe("camelcasechino");
  });

  it("slugifyAll mapea el arreglo completo", () => {
    expect(slugifyAll(["AFP", "Renta Imponible"])).toEqual([
      "afp",
      "renta-imponible",
    ]);
  });
});
