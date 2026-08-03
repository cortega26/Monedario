import { describe, expect, it } from "vitest";
import { convertUtm } from "@/application/use-cases/ConvertUtm";
import { buildUtmWorkedExample } from "@/application/use-cases/ConvertUtm.methodology";

describe("convertUtm", () => {
  it("converts UTM to pesos using the injected UTM value", () => {
    const result = convertUtm({
      amount: 3,
      utmValue: 67_294,
      direction: "utm_to_clp",
    });

    expect(result.utmAmount).toBe(3);
    expect(result.clpAmount).toBe(201_882);
  });

  it("converts pesos to UTM using the injected UTM value", () => {
    const result = convertUtm({
      amount: 134_588,
      utmValue: 67_294,
      direction: "clp_to_utm",
    });

    expect(result.utmAmount).toBe(2);
    expect(result.clpAmount).toBe(134_588);
  });

  it("rejects non-positive amounts and UTM values", () => {
    expect(() =>
      convertUtm({ amount: 0, utmValue: 67_294, direction: "utm_to_clp" })
    ).toThrow("amount");
    expect(() =>
      convertUtm({ amount: 1, utmValue: 0, direction: "utm_to_clp" })
    ).toThrow("utmValue");
  });
});

describe("convertUtm — ejemplo de metodología (anti-drift)", () => {
  it("la salida real coincide con el ejemplo publicado", () => {
    const utmWorkedExample = buildUtmWorkedExample(71_649, "2026-08-01");
    expect(convertUtm(utmWorkedExample.input)).toEqual(
      utmWorkedExample.expected
    );
    expect(utmWorkedExample.example.scenario).toContain("$71.649");
    expect(utmWorkedExample.example.scenario).toContain("2026-08-01");
  });
});
