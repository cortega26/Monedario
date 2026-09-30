import { describe, expect, it } from "vitest";
import {
  interpolateEconomicText,
  interpolateEconomicVariables,
} from "@/utils/economicInterpolation";

const VARS = { utm: 71721, uf: 39727.96, uta: 860652 };

describe("interpolateEconomicVariables", () => {
  it("formats CLP expressions with chilean separators", () => {
    expect(interpolateEconomicVariables("[[utm * 13.5 | clp]]", VARS)).toBe(
      "$968.234"
    );
    expect(
      interpolateEconomicVariables("[[1200000 * 0.04 - utm * 0.54 | clp]]", VARS)
    ).toBe("$9.271");
  });

  it("supports raw format, parentheses and multiple expressions", () => {
    expect(interpolateEconomicVariables("[[utm | raw]]", VARS)).toBe("71721");
    expect(
      interpolateEconomicVariables("[[(utm + utm) / 2 | clp]]", VARS)
    ).toBe("$71.721");
    expect(
      interpolateEconomicVariables("De [[utm * 13.5 | clp]] a [[utm * 30 | clp]]", VARS)
    ).toBe("De $968.234 a $2.151.630");
  });

  it("leaves unresolvable expressions intact and reports them", () => {
    const messages: string[] = [];
    expect(
      interpolateEconomicVariables("Monto [[utm|bogus]]", VARS, message =>
        void messages.push(message)
      )
    ).toBe("Monto [[utm|bogus]]");
    expect(messages).toEqual([
      "Could not resolve [[utm|bogus]]: Unknown format: bogus",
    ]);

    const trailing: string[] = [];
    expect(
      interpolateEconomicVariables("Monto [[2+3)|clp]]", VARS, message =>
        void trailing.push(message)
      )
    ).toBe("Monto [[2+3)|clp]]");
    expect(trailing[0]).toContain("Unexpected trailing characters");
  });

  it("interpolates with the real snapshot through interpolateEconomicText", () => {
    const resolved = interpolateEconomicText("Exento hasta [[utm * 13.5 | clp]]");
    expect(resolved).not.toContain("[[");
    expect(resolved).toMatch(/\$[\d.]+/);
  });
});
