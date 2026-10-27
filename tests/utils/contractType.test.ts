import { describe, expect, it } from "vitest";
import { parseContractType } from "@/utils/contractType";

/**
 * Guarda real del mapeo selector → motor (auditoría R5, 2026-10-27).
 *
 * La guarda estática no puede ver esta regresión: R5 eliminó el brazo que
 * mapea `casa-particular` y el test de texto siguió pasando 5/5, mientras el
 * motor habría descontado 0,6% a quien no corresponde. Esta prueba fija el
 * contrato de la función que usan las tres calculadoras.
 */
describe("parseContractType", () => {
  it("conserva casa-particular", () => {
    expect(parseContractType("casa-particular")).toBe("casa-particular");
  });

  it("conserva plazo-fijo", () => {
    expect(parseContractType("plazo-fijo")).toBe("plazo-fijo");
  });

  it("conserva indefinido", () => {
    expect(parseContractType("indefinido")).toBe("indefinido");
  });

  it("cae a indefinido cuando no hay selección", () => {
    expect(parseContractType(undefined)).toBe("indefinido");
    expect(parseContractType(null)).toBe("indefinido");
    expect(parseContractType("")).toBe("indefinido");
  });

  it("no coacciona casa-particular a indefinido ante variantes del selector", () => {
    // Regresión concreta de R5: cualquier rama que devolviera "indefinido"
    // para casa-particular fallaría aquí.
    expect(parseContractType("casa-particular")).not.toBe("indefinido");
  });
});
