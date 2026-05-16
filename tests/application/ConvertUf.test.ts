import { describe, expect, it } from "vitest";
import { convertUf } from "@/application/use-cases/ConvertUf";

describe("convertUf", () => {
  it("converts UF to pesos using the injected UF value", () => {
    const result = convertUf({
      amount: 10,
      ufValue: 39_300,
      direction: "uf_to_clp",
    });

    expect(result.ufAmount).toBe(10);
    expect(result.clpAmount).toBe(393_000);
  });

  it("converts pesos to UF using the injected UF value", () => {
    const result = convertUf({
      amount: 786_000,
      ufValue: 39_300,
      direction: "clp_to_uf",
    });

    expect(result.ufAmount).toBe(20);
    expect(result.clpAmount).toBe(786_000);
  });

  it("rejects non-positive amounts and UF values", () => {
    expect(() =>
      convertUf({ amount: 0, ufValue: 39_300, direction: "uf_to_clp" })
    ).toThrow("amount");
    expect(() =>
      convertUf({ amount: 1, ufValue: 0, direction: "uf_to_clp" })
    ).toThrow("ufValue");
  });
});
