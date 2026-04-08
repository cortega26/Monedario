import { describe, expect, it } from "vitest";
import { simulateOperacionRenta } from "@/application/use-cases/SimulateOperacionRenta";

// UTM 2026 value (published by SII — matches domain snapshot)
const UTM = 67294;
// UF 2026 reference value
const UF = 39300;

// UTA = UTM × 12 (annual unit used by the IGC progressive table)
const UTA = UTM * 12; // 807_528

// First bracket exempt limit: 13.5 UTA
const EXEMPT_THRESHOLD = 13.5 * UTA; // ~10_901_628 CLP

const BASE_INCOME_PARAMS = { utm: UTM, uf: UF };

describe("simulateOperacionRenta", () => {
  it("returns zero IGC when renta bruta global is below the exempt threshold", () => {
    // Income well below 13.5 UTA — should owe 0 pesos
    const rentaBruta = EXEMPT_THRESHOLD * 0.8;
    const result = simulateOperacionRenta({
      sueldosBrutos: rentaBruta,
      honorariosBrutos: 0,
      arriendos: 0,
      impuestoUnicoRetenido: 0,
      ppmHonorarios: 0,
      apvRegimenB: 0,
      interesesHipotecarios: 0,
      economicParameters: BASE_INCOME_PARAMS,
    });

    expect(result.igcCalculado).toBe(0);
    expect(result.tasaMarginal).toBe(0);
    expect(result.esDevolución).toBe(false);
    expect(result.montoPago).toBe(0);
  });

  it("computes correct IGC for mid-bracket income (4% bracket: 13.5–30 UTA)", () => {
    // Income just inside the 4% bracket: 20 UTA
    const income = 20 * UTA; // 16_150_560
    const result = simulateOperacionRenta({
      sueldosBrutos: income,
      honorariosBrutos: 0,
      arriendos: 0,
      impuestoUnicoRetenido: 0,
      ppmHonorarios: 0,
      apvRegimenB: 0,
      interesesHipotecarios: 0,
      economicParameters: BASE_INCOME_PARAMS,
    });

    expect(result.rentaBrutaGlobal).toBe(income);
    expect(result.baseImponibleIGC).toBe(income);
    expect(result.tasaMarginal).toBeCloseTo(0.04, 4);
    // Tax = income × 0.04 − deduction for 4% bracket
    // d2 = 13.5 × utm × 0.04 (from TaxEngine)
    const d2 = 13.5 * UTA * 0.04;
    expect(result.igcCalculado).toBeCloseTo(income * 0.04 - d2, 0);
    expect(result.esDevolución).toBe(false);
  });

  it("computes correct IGC for high income (23% bracket: 70–90 UTA)", () => {
    // Income at 80 UTA — inside 23% bracket
    const income = 80 * UTA;
    const result = simulateOperacionRenta({
      sueldosBrutos: income,
      honorariosBrutos: 0,
      arriendos: 0,
      impuestoUnicoRetenido: 0,
      ppmHonorarios: 0,
      apvRegimenB: 0,
      interesesHipotecarios: 0,
      economicParameters: BASE_INCOME_PARAMS,
    });

    expect(result.tasaMarginal).toBeCloseTo(0.23, 4);
    // IGC > 0
    expect(result.igcCalculado).toBeGreaterThan(0);
    expect(result.montoPago).toBeGreaterThan(0);
  });

  it("applies APV Régimen B deduction up to 600 UF cap", () => {
    const income = 30 * UTA;
    // APV far below 600 UF cap
    const apvSmall = 100 * UF;
    const resultNoApv = simulateOperacionRenta({
      sueldosBrutos: income,
      honorariosBrutos: 0,
      arriendos: 0,
      impuestoUnicoRetenido: 0,
      ppmHonorarios: 0,
      apvRegimenB: 0,
      interesesHipotecarios: 0,
      economicParameters: BASE_INCOME_PARAMS,
    });
    const resultWithApv = simulateOperacionRenta({
      sueldosBrutos: income,
      honorariosBrutos: 0,
      arriendos: 0,
      impuestoUnicoRetenido: 0,
      ppmHonorarios: 0,
      apvRegimenB: apvSmall,
      interesesHipotecarios: 0,
      economicParameters: BASE_INCOME_PARAMS,
    });

    expect(resultWithApv.apvAplicado).toBe(apvSmall);
    expect(resultWithApv.baseImponibleIGC).toBe(income - apvSmall);
    // IGC with APV must be less than IGC without APV
    expect(resultWithApv.igcCalculado).toBeLessThan(resultNoApv.igcCalculado);
  });

  it("caps APV Régimen B at 600 UF ceiling", () => {
    const income = 50 * UTA;
    const apvAboveCap = 700 * UF; // exceeds 600 UF cap
    const result = simulateOperacionRenta({
      sueldosBrutos: income,
      honorariosBrutos: 0,
      arriendos: 0,
      impuestoUnicoRetenido: 0,
      ppmHonorarios: 0,
      apvRegimenB: apvAboveCap,
      interesesHipotecarios: 0,
      economicParameters: BASE_INCOME_PARAMS,
    });

    expect(result.apvCap).toBe(600 * UF);
    expect(result.apvAplicado).toBe(600 * UF);
  });

  it("generates devolucion when credits exceed IGC (impuesto unico retenido > tax)", () => {
    // Modest income with large withheld tax → refund
    const income = 20 * UTA;
    const d2 = 13.5 * UTA * 0.04;
    const igcExpected = income * 0.04 - d2;
    const retenido = igcExpected + 500_000; // over-withheld

    const result = simulateOperacionRenta({
      sueldosBrutos: income,
      honorariosBrutos: 0,
      arriendos: 0,
      impuestoUnicoRetenido: retenido,
      ppmHonorarios: 0,
      apvRegimenB: 0,
      interesesHipotecarios: 0,
      economicParameters: BASE_INCOME_PARAMS,
    });

    expect(result.esDevolución).toBe(true);
    expect(result.montoDevolución).toBeCloseTo(500_000, 0);
    expect(result.montoPago).toBe(0);
  });

  it("applies gastos presuntos (30%, capped at 15 UTA) for honorarios", () => {
    const honorarios = 5_000_000;
    const result = simulateOperacionRenta({
      sueldosBrutos: 0,
      honorariosBrutos: honorarios,
      arriendos: 0,
      impuestoUnicoRetenido: 0,
      ppmHonorarios: 0,
      apvRegimenB: 0,
      interesesHipotecarios: 0,
      economicParameters: BASE_INCOME_PARAMS,
    });

    const gastosBruto = honorarios * 0.3;
    const gastosMax = 15 * UTA;
    const gastosEsperados = Math.min(gastosBruto, gastosMax);
    expect(result.gastosPresuntos).toBeCloseTo(gastosEsperados, 0);
    expect(result.rentaNetaHonorarios).toBeCloseTo(honorarios - gastosEsperados, 0);
  });

  it("throws when all income sources are zero", () => {
    expect(() =>
      simulateOperacionRenta({
        sueldosBrutos: 0,
        honorariosBrutos: 0,
        arriendos: 0,
        impuestoUnicoRetenido: 0,
        ppmHonorarios: 0,
        apvRegimenB: 0,
        interesesHipotecarios: 0,
        economicParameters: BASE_INCOME_PARAMS,
      })
    ).toThrow("al menos una fuente de ingreso");
  });
});
