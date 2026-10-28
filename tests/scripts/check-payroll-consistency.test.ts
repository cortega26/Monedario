import { describe, expect, it } from "vitest";
import {
  extractAfpClaims,
  findMismatches,
} from "../../scripts/check-payroll-consistency.mjs";

const REGISTRY = new Map([
  ["Capital", { commission: 1.44, total: 11.44 }],
  ["Modelo", { commission: 0.58, total: 10.58 }],
  ["Uno", { commission: 0.46, total: 10.46 }],
]);

describe("extractAfpClaims", () => {
  it("extrae la comisión cuando el nombre está junto a la cifra", () => {
    const claims = extractAfpClaims(
      "afiliado a Capital AFP (comisión 1,44%, total AFP 11,44%)",
      [...REGISTRY.keys()]
    );
    expect(claims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ afp: "Capital", kind: "commission", value: 1.44 }),
        expect.objectContaining({ afp: "Capital", kind: "total", value: 11.44 }),
      ])
    );
  });

  it("ignora un rango sin administradora nombrada", () => {
    const claims = extractAfpClaims(
      "la comisión varía entre el 0,46 % y el 1,45 % del imponible",
      [...REGISTRY.keys()]
    );
    expect(claims).toEqual([]);
  });

  it("no atribuye una cifra a una AFP que aparece lejos", () => {
    const claims = extractAfpClaims(
      "Capital es una administradora. " + "x".repeat(120) + " comisión 1,44%",
      [...REGISTRY.keys()]
    );
    expect(claims).toEqual([]);
  });
});

describe("findMismatches", () => {
  it("detecta el defecto real: Capital con la comisión de Modelo (D2)", () => {
    const problems = findMismatches(
      "afiliado a Capital AFP (comisión 0,58%, total AFP 10,58%)",
      REGISTRY
    );
    expect(problems).toHaveLength(2);
    expect(problems[0].expected).toBe(1.44);
    expect(problems[0].value).toBe(0.58);
  });

  it("acepta una afirmación correcta", () => {
    expect(
      findMismatches(
        "afiliado a Capital AFP (comisión 1,44%, total AFP 11,44%)",
        REGISTRY
      )
    ).toEqual([]);
  });

  it("no confunde el valor correcto de Modelo con el de Capital", () => {
    expect(
      findMismatches("afiliado a Modelo (comisión 0,58%)", REGISTRY)
    ).toEqual([]);
  });

  it("tolera diferencias de redondeo menores a 0,005", () => {
    expect(
      findMismatches("afiliado a Uno (comisión 0,46%)", REGISTRY)
    ).toEqual([]);
  });
});
