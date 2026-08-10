import { describe, expect, it } from "vitest";
import { resolvePageTitle } from "@/utils/seoTitle";

describe("resolvePageTitle", () => {
  it("appends the site suffix when no seoTitle is present", () => {
    expect(resolvePageTitle("Sueldo líquido", "Monedario")).toBe(
      "Sueldo líquido | Monedario"
    );
  });

  it("uses seoTitle verbatim (no suffix) when present", () => {
    expect(
      resolvePageTitle("Sueldo líquido", "Monedario", "Calcula tu sueldo líquido")
    ).toBe("Calcula tu sueldo líquido");
  });

  it("treats only undefined as absent (empty/whitespace is schema-blocked)", () => {
    expect(resolvePageTitle("IVA", "Monedario", undefined)).toBe("IVA | Monedario");
    expect(resolvePageTitle("IVA", "Monedario", "Calculadora de IVA")).toBe(
      "Calculadora de IVA"
    );
  });
});
