import { describe, expect, it } from "vitest";
import { simulateOperacionRenta } from "@/application/use-cases/SimulateOperacionRenta";
import { operacionRentaWorkedExample } from "@/application/use-cases/SimulateOperacionRenta.methodology";
import { AT2026 } from "@/domain/taxation/TaxYearParameters";

// AT2026 congelado: UTA de cierre del año comercial 2025 (dic-2025).
const UTA_AT2026 = AT2026.uta; // 834_504
// Tramo exento anual: 13,5 UTA.
const EXEMPT_THRESHOLD = 13.5 * UTA_AT2026; // 11_265_804

function baseInput(overrides: Record<string, unknown> = {}) {
  return {
    sueldosRentaNeta: 0,
    sueldosBaseMode: "declarada" as const,
    honorariosBrutos: 0,
    arriendos: 0,
    impuestoUnicoRetenido: 0,
    ppmHonorarios: 0,
    apvRegimenB: 0,
    interesesHipotecarios: 0,
    taxYear: AT2026,
    ...overrides,
  };
}

describe("simulateOperacionRenta (AT2026)", () => {
  it("reproduce la rebaja SII del segundo tramo (0,54 × UTA dic-2025)", () => {
    // SII AT2026: rebaja $450.632,16 = 0,54 × $834.504
    expect(0.54 * UTA_AT2026).toBeCloseTo(450_632.16, 2);
  });

  it("vector dorado SII: $18.000.000 de renta neta ⇒ IGC $269.367,84", () => {
    const result = simulateOperacionRenta(
      baseInput({ sueldosRentaNeta: 18_000_000 })
    );

    expect(result.rentaNetaGlobal).toBe(18_000_000);
    expect(result.baseImponibleIGC).toBe(18_000_000);
    expect(result.tasaMarginal).toBeCloseTo(0.04, 6);
    expect(result.igcCalculado).toBeCloseTo(269_367.84, 2);
    // Con la UTM vigente (sep-2026: $71.721 × 12) daría $255.247,92: el
    // aislamiento temporal exige que NO sea ese valor.
    expect(result.igcCalculado).not.toBeCloseTo(255_247.92, 2);
  });

  it("aísla el cálculo del año tributario de la UTM vigente", () => {
    const result = simulateOperacionRenta(
      baseInput({ sueldosRentaNeta: 18_000_000 })
    );
    // El resultado depende solo de AT2026.uta; no existe entrada de UTM
    // vigente en el contrato (aislamiento estructural).
    expect(result.taxYear).toBe(2026);
    expect(result.commercialYear).toBe(2025);
    expect(result.igcCalculado).toBeCloseTo(
      18_000_000 * 0.04 - 0.54 * AT2026.uta,
      2
    );
  });

  it("devuelve IGC cero bajo el tramo exento anual", () => {
    const result = simulateOperacionRenta(
      baseInput({ sueldosRentaNeta: EXEMPT_THRESHOLD * 0.8 })
    );

    expect(result.igcCalculado).toBe(0);
    expect(result.tasaMarginal).toBe(0);
    expect(result.esDevolución).toBe(false);
    expect(result.montoPago).toBe(0);
  });

  it("calcula el tramo 4% (13,5–30 UTA) con la UTA congelada", () => {
    const income = 20 * UTA_AT2026;
    const result = simulateOperacionRenta(
      baseInput({ sueldosRentaNeta: income })
    );

    expect(result.rentaNetaGlobal).toBe(income);
    expect(result.tasaMarginal).toBeCloseTo(0.04, 4);
    const d2 = 13.5 * UTA_AT2026 * 0.04;
    expect(result.igcCalculado).toBeCloseTo(income * 0.04 - d2, 0);
  });

  it("calcula el tramo 23% (70–90 UTA)", () => {
    const income = 80 * UTA_AT2026;
    const result = simulateOperacionRenta(
      baseInput({ sueldosRentaNeta: income })
    );

    expect(result.tasaMarginal).toBeCloseTo(0.23, 4);
    expect(result.igcCalculado).toBeGreaterThan(0);
    expect(result.montoPago).toBeGreaterThan(0);
  });

  it("aplica APV Régimen B con tope de 600 UF de diciembre", () => {
    const income = 30 * UTA_AT2026;
    const apvSmall = 100 * AT2026.ufDecember;
    const resultNoApv = simulateOperacionRenta(
      baseInput({ sueldosRentaNeta: income })
    );
    const resultWithApv = simulateOperacionRenta(
      baseInput({ sueldosRentaNeta: income, apvRegimenB: apvSmall })
    );

    expect(resultWithApv.apvAplicado).toBe(apvSmall);
    expect(resultWithApv.baseImponibleIGC).toBe(income - apvSmall);
    expect(resultWithApv.igcCalculado).toBeLessThan(
      resultNoApv.igcCalculado
    );
  });

  it("capea APV Régimen B en 600 UF", () => {
    const income = 50 * UTA_AT2026;
    const result = simulateOperacionRenta(
      baseInput({
        sueldosRentaNeta: income,
        apvRegimenB: 700 * AT2026.ufDecember,
      })
    );

    expect(result.apvCap).toBe(600 * AT2026.ufDecember);
    expect(result.apvAplicado).toBe(600 * AT2026.ufDecember);
  });

  it("genera devolución cuando los créditos superan el IGC", () => {
    const income = 20 * UTA_AT2026;
    const d2 = 13.5 * UTA_AT2026 * 0.04;
    const igcExpected = income * 0.04 - d2;
    const retenido = igcExpected + 500_000;

    const result = simulateOperacionRenta(
      baseInput({
        sueldosRentaNeta: income,
        impuestoUnicoRetenido: retenido,
      })
    );

    expect(result.esDevolución).toBe(true);
    expect(result.montoDevolución).toBeCloseTo(500_000, 0);
    expect(result.montoPago).toBe(0);
  });

  it("aplica gastos presuntos (30%, tope 15 UTA) para honorarios", () => {
    const honorarios = 5_000_000;
    const result = simulateOperacionRenta(
      baseInput({ honorariosBrutos: honorarios })
    );

    const gastosBruto = honorarios * 0.3;
    const gastosMax = 15 * UTA_AT2026;
    const gastosEsperados = Math.min(gastosBruto, gastosMax);
    expect(result.gastosPresuntos).toBeCloseTo(gastosEsperados, 0);
    expect(result.rentaNetaHonorarios).toBeCloseTo(
      honorarios - gastosEsperados,
      0
    );
  });

  it("marca la base de sueldos como declarada o estimada", () => {
    const declarada = simulateOperacionRenta(
      baseInput({ sueldosRentaNeta: 10_000_000 })
    );
    const estimada = simulateOperacionRenta(
      baseInput({ sueldosRentaNeta: 10_000_000, sueldosBaseMode: "estimada" })
    );

    expect(declarada.sueldosBaseMode).toBe("declarada");
    expect(estimada.sueldosBaseMode).toBe("estimada");
    expect(estimada.igcCalculado).toBe(declarada.igcCalculado);
  });

  it("rechaza cuando todas las fuentes de ingreso son cero", () => {
    expect(() => simulateOperacionRenta(baseInput())).toThrow(
      "al menos una fuente de ingreso"
    );
  });

  it("rechaza una UTA inválida", () => {
    expect(() =>
      simulateOperacionRenta(
        baseInput({
          sueldosRentaNeta: 1_000_000,
          taxYear: { ...AT2026, uta: 0 },
        })
      )
    ).toThrow("UTA");
  });

  describe("ejemplo de metodología — anti-drift", () => {
    it("el resultado real coincide con el ejemplo publicado", () => {
      const result = simulateOperacionRenta(operacionRentaWorkedExample.input);
      const expected = operacionRentaWorkedExample.expected;
      expect(result.rentaNetaHonorarios).toBe(expected.rentaNetaHonorarios);
      expect(result.baseImponibleIGC).toBe(expected.baseImponibleIGC);
      expect(result.igcCalculado).toBe(expected.igcCalculado);
      expect(result.montoDevolución).toBe(expected.montoDevolución);
    });
  });
});
