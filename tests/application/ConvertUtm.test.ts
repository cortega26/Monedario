import { describe, expect, it } from "vitest";
import { convertUtm } from "@/application/use-cases/ConvertUtm";

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
