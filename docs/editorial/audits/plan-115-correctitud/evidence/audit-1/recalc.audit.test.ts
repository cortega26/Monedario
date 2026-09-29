/**
 * Harness de recálculo independiente — auditoría plan-115-correctitud (R1/R3/R5).
 * No modifica src/: solo importa funciones del motor y las compara contra una
 * reimplementación propia escrita desde las fórmulas publicadas (tabla SII,
 * interés simple, anualidad, requisitos legales).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  calculateSecondCategoryTax,
  calculateAnnualIncomeTax,
} from "@/domain/taxation/TaxEngine";
import {
  AT2026,
  igcSecondBracketDeduction,
} from "@/domain/taxation/TaxYearParameters";
import { getTaxYearParameters } from "@/domain/taxation/TaxYearRegistry";
import { simulateOperacionRenta } from "@/application/use-cases/SimulateOperacionRenta";
import { calculateTermDeposit } from "@/application/use-cases/CalculateTermDeposit";
import { calculateNetSalary } from "@/application/use-cases/CalculateNetSalary";
import { simulateDebtRenegotiation } from "@/application/use-cases/SimulateDebtRenegotiation";
import {
  resolveEffectiveValue,
  type EffectiveDatedEntry,
} from "@/domain/economic/EffectiveDatedParameters";
import { evaluateIpcSeriesFreshness } from "@/utils/economicFreshness";

const EVIDENCE = "EVIDENCE|";
function log(tag: string, payload: unknown): void {
  // eslint-disable-next-line no-console
  console.log(`${EVIDENCE}${tag}|${JSON.stringify(payload)}`);
}

const REPO_ROOT = fileURLToPath(new URL("../../../../../../", import.meta.url));

// ---------------------------------------------------------------------------
// Constantes de entrada (no se usan valores "de memoria" para los parámetros:
// se leen del repositorio y se contrastan con fuentes en evidence/sources.md).
// ---------------------------------------------------------------------------
const UTA_AT2026 = 834_504;
const REBAJA_SII_TRAMO2 = 450_632.16; // SII AT2026: 0,54 × UTA dic-2025
const UF_DIC_2025 = 39_643.59;
const UTM_SEP_2026 = 71_721;
const UF_SNAPSHOT = 41_049.01;
const UTM_DIC_2025_DERIVADA = UTA_AT2026 / 12; // 69.542 — se contrasta con SII

// ---------------------------------------------------------------------------
// Reimplementación independiente — tabla IGC en UTA.
// Límites y tasas de la tabla SII; rebajas derivadas por continuidad en cada
// frontera a partir de la rebaja publicada del tramo 2 (0,54 UTA).
// ---------------------------------------------------------------------------
interface Bracket {
  limit: number;
  rate: number;
  rebaja: number;
}

function igcTableIndependent(uta: number): Bracket[] {
  const limits = [13.5, 30, 50, 70, 90, 120, 150, Infinity];
  const rates = [0, 0.04, 0.08, 0.135, 0.23, 0.304, 0.35, 0.4];
  const rebajas: number[] = [0, 0.54 * uta];
  for (let i = 2; i < rates.length; i++) {
    // continuidad: limit_{i-1}×(rate_i−rate_{i-1}) + rebaja_{i-1} (todo en pesos)
    rebajas.push(
      limits[i - 1] * uta * (rates[i] - rates[i - 1]) + rebajas[i - 1]
    );
  }
  return limits.map((limit, i) => ({
    limit: limit === Infinity ? Infinity : limit * uta,
    rate: rates[i],
    rebaja: rebajas[i],
  }));
}

function igcIndependent(income: number, uta: number): number {
  const table = igcTableIndependent(uta);
  const bracket =
    table.find(candidate => income <= candidate.limit) ?? table[table.length - 1];
  return Math.max(0, income * bracket.rate - bracket.rebaja);
}

/**
 * Tabla OFICIAL SII art. 52 LIR (personas naturales, AT2026): el tramo 35%
 * se extiende de 120 a 310 UTA (Ley 21.210) y el 40% aplica desde 310 UTA.
 * Los seis primeros tramos coinciden con la tabla del motor.
 */
function igcOfficialAnnual(income: number, uta: number): number {
  const table: Bracket[] = [
    { limit: 13.5 * uta, rate: 0, rebaja: 0 },
    { limit: 30 * uta, rate: 0.04, rebaja: 450_632.16 },
    { limit: 50 * uta, rate: 0.08, rebaja: 1_452_036.96 },
    { limit: 70 * uta, rate: 0.135, rebaja: 3_746_922.96 },
    { limit: 90 * uta, rate: 0.23, rebaja: 9_296_374.56 },
    { limit: 120 * uta, rate: 0.304, rebaja: 14_854_171.2 },
    { limit: 310 * uta, rate: 0.35, rebaja: 19_460_633.28 },
    { limit: Number.POSITIVE_INFINITY, rate: 0.4, rebaja: 32_395_445.28 },
  ];
  const bracket =
    table.find(candidate => income <= candidate.limit) ?? table[table.length - 1];
  return Math.max(0, income * bracket.rate - bracket.rebaja);
}

/**
 * Tabla OFICIAL SII art. 43 N°1 LIR IUSC septiembre 2026 (UTM 71.721):
 * tramo 35% entre 120 y 310 UTM; 40% desde 310 UTM (rebaja 38,82 UTM).
 */
function iuscOfficialMonthly(income: number, utm: number): number {
  const uta6382 = 38.82 * utm;
  const table: Bracket[] = [
    { limit: 13.5 * utm, rate: 0, rebaja: 0 },
    { limit: 30 * utm, rate: 0.04, rebaja: 0.54 * utm },
    { limit: 50 * utm, rate: 0.08, rebaja: 1.74 * utm },
    { limit: 70 * utm, rate: 0.135, rebaja: 4.49 * utm },
    { limit: 90 * utm, rate: 0.23, rebaja: 11.14 * utm },
    { limit: 120 * utm, rate: 0.304, rebaja: 17.8 * utm },
    { limit: 310 * utm, rate: 0.35, rebaja: 23.32 * utm },
    { limit: Number.POSITIVE_INFINITY, rate: 0.4, rebaja: uta6382 },
  ];
  const bracket =
    table.find(candidate => income <= candidate.limit) ?? table[table.length - 1];
  return Math.max(0, income * bracket.rate - bracket.rebaja);
}

function marginalRateIndependent(income: number, uta: number): number {
  const table = igcTableIndependent(uta);
  return (table.find(c => income <= c.limit) ?? table[table.length - 1]).rate;
}

// ---------------------------------------------------------------------------
// Reimplementación independiente — sueldo líquido (AFP + salud 7% + AFC 0,6%
// sobre bases topadas en UF; impuesto de segunda categoría con tabla en UTM).
// ---------------------------------------------------------------------------
interface SalaryAssumptions {
  afpPct: number;
  healthPct: number;
  afcPct: number;
  uf: number;
  utm: number;
  capPrevUf: number;
  capAfcUf: number;
}

function netSalaryIndependent(gross: number, a: SalaryAssumptions) {
  const prevBase = Math.min(gross, a.capPrevUf * a.uf);
  const afcBase = Math.min(gross, a.capAfcUf * a.uf);
  const afp = prevBase * (a.afpPct / 100);
  const health = prevBase * (a.healthPct / 100);
  const afc = afcBase * (a.afcPct / 100);
  const taxable = Math.max(0, gross - afp - health - afc);
  const tax = igcIndependent(taxable, a.utm);
  return {
    afp,
    health,
    afc,
    taxable,
    tax,
    net: gross - afp - health - afc - tax,
  };
}

// ---------------------------------------------------------------------------
// Reimplementación independiente — DAP interés simple proporcional.
// ---------------------------------------------------------------------------
function dapIndependent(amount: number, days: number, annualPct: number) {
  const interest = amount * (annualPct / 100) * (days / 365);
  return {
    interest,
    final: amount + interest,
    // Comportamiento eliminado (F03): retención general 4% que el sitio aplicaba.
    oldNetWith4Pct: interest * 0.96,
    oldFinalWith4Pct: amount + interest * 0.96,
  };
}

// ---------------------------------------------------------------------------
// Reimplementación independiente — anualidad.
// ---------------------------------------------------------------------------
function annuityIndependent(principal: number, monthlyRate: number, months: number) {
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

// ---------------------------------------------------------------------------
// Reimplementación independiente — requisitos Ley 20.720 art. 260 (lectura
// estricta: > 90 días, > 80 UF, 2+ acreedores distintos).
// ---------------------------------------------------------------------------
function debtIndependent(
  debts: Array<{ amount: number; overdueDays: number; creditor: string }>,
  uf: number
) {
  const qualified = debts.filter(d => d.amount > 0 && d.overdueDays > 90);
  const creditors = new Set(qualified.map(d => d.creditor.trim().toLowerCase()));
  const sumUf = qualified.reduce((s, d) => s + d.amount, 0) / uf;
  return {
    qualifiedCount: qualified.length,
    distinctCreditors: creditors.size,
    sumUf,
    eligibleStrict: qualified.length >= 2 && creditors.size >= 2 && sumUf > 80,
    eligibleInclusive: qualified.length >= 2 && creditors.size >= 2 && sumUf >= 80,
  };
}

describe("AUDIT V1 — IGC AT2026 (operación renta)", () => {
  it("vector dorado $18.000.000 con UTA dic-2025", () => {
    const income = 18_000_000;
    const independent = igcIndependent(income, UTA_AT2026);
    const engine = calculateAnnualIncomeTax({ taxableIncome: income, uta: UTA_AT2026 });
    log("V1.golden", {
      income,
      uta: UTA_AT2026,
      independent,
      engine: engine.taxAmount,
      marginal: engine.marginalRate,
      diff: engine.taxAmount - independent,
    });
    expect(independent).toBeCloseTo(269_367.84, 9);
    expect(engine.taxAmount).toBeCloseTo(independent, 9);
    expect(engine.marginalRate).toBe(0.04);
  });

  it("reproduce el valor original del informe ($255.247,92 con UTM sep-2026 ×12)", () => {
    const income = 18_000_000;
    const bugValue = igcIndependent(income, UTM_SEP_2026 * 12);
    log("V1.bug-repro", { utmSep2026x12: UTM_SEP_2026 * 12, bugValue });
    expect(bugValue).toBeCloseTo(255_247.92, 6);
  });

  it("rebaja SII publicada = 0,54 × UTA", () => {
    const engine = igcSecondBracketDeduction(AT2026);
    log("V1.rebaja", { engine, expected: REBAJA_SII_TRAMO2 });
    expect(engine).toBeCloseTo(REBAJA_SII_TRAMO2, 9);
  });

  it("UTA derivada de UTM dic-2025: 12 × 69.542 = 834.504", () => {
    log("V1.uta-derivation", {
      utmDic2025: UTM_DIC_2025_DERIVADA,
      times12: UTM_DIC_2025_DERIVADA * 12,
    });
    expect(UTM_DIC_2025_DERIVADA * 12).toBe(UTA_AT2026);
  });

  it("coeficientes de rebaja derivados coinciden con tabla SII (en UTA)", () => {
    const table = igcTableIndependent(UTA_AT2026);
    const rebajasEnUta = table.map(b => b.rebaja / UTA_AT2026);
    log("V1.rebajas", { rebajasEnUta });
    expect(rebajasEnUta.slice(0, 8).map(v => Number(v.toFixed(6)))).toEqual([
      0, 0.54, 1.74, 4.49, 11.14, 17.8, 23.32, 30.82,
    ]);
  });

  it("frontera exenta 13,5 UTA: exacta ⇒ 0; +$1 ⇒ 0,04", () => {
    const limit = 13.5 * UTA_AT2026;
    const below = calculateSecondCategoryTax({ taxableIncome: limit, utm: UTA_AT2026 });
    const above = calculateSecondCategoryTax({
      taxableIncome: limit + 1,
      utm: UTA_AT2026,
    });
    log("V1.boundary-13.5", { limit, below: below.taxAmount, above: above.taxAmount });
    expect(below.taxAmount).toBe(0);
    expect(above.taxAmount).toBeCloseTo(0.04, 9);
    expect(igcIndependent(limit, UTA_AT2026)).toBe(0);
    expect(igcIndependent(limit + 1, UTA_AT2026)).toBeCloseTo(0.04, 9);
  });

  it("continuidad en fronteras 30/50/70/90/120/150 UTA", () => {
    const results: Array<Record<string, number>> = [];
    for (const limitUta of [30, 50, 70, 90, 120, 150]) {
      const limit = limitUta * UTA_AT2026;
      const below = calculateSecondCategoryTax({ taxableIncome: limit, utm: UTA_AT2026 });
      const above = calculateSecondCategoryTax({
        taxableIncome: limit + 1,
        utm: UTA_AT2026,
      });
      const independentBelow = igcIndependent(limit, UTA_AT2026);
      const independentAbove = igcIndependent(limit + 1, UTA_AT2026);
      results.push({
        limitUta,
        engineJump: above.taxAmount - below.taxAmount,
        independentJump: independentAbove - independentBelow,
      });
      expect(Math.abs(above.taxAmount - below.taxAmount)).toBeLessThan(1);
      expect(below.taxAmount).toBeCloseTo(independentBelow, 6);
      expect(above.taxAmount).toBeCloseTo(independentAbove, 6);
    }
    log("V1.continuity", results);
  });

  it("D1(a) — IGC anual: 200 UTA y 320 UTA, motor vs tabla oficial art. 52", () => {
    const cases = [200, 320].map(utaMultiplier => {
      const income = utaMultiplier * UTA_AT2026;
      const engine = calculateSecondCategoryTax({
        taxableIncome: income,
        utm: UTA_AT2026,
      });
      const official = igcOfficialAnnual(income, UTA_AT2026);
      return {
        utaMultiplier,
        income,
        engine: engine.taxAmount,
        engineRate: engine.marginalRate,
        official,
        diff: engine.taxAmount - official,
      };
    });
    log("D1.annual-igc", cases);
    // La tabla general art. 52 mantiene 35% hasta 310 UTA; el motor aplica 40%
    // desde 150 UTA (tabla art. 52 bis). Divergencia material.
    expect(cases[0].engine).not.toBeCloseTo(cases[0].official, 2);
    expect(cases[0].diff).toBeCloseTo(2_086_260, 0);
    expect(cases[1].engine).not.toBeCloseTo(cases[1].official, 2);
    expect(cases[1].diff).toBeCloseTo(6_676_032, 0);
  });

  it("D1(b) — IUSC mensual: 200 UTM y 320 UTM, motor vs tabla oficial art. 43 N°1 (sep-2026)", () => {
    const cases = [200, 320].map(utmMultiplier => {
      const income = utmMultiplier * UTM_SEP_2026;
      const engine = calculateSecondCategoryTax({
        taxableIncome: income,
        utm: UTM_SEP_2026,
      });
      const official = iuscOfficialMonthly(income, UTM_SEP_2026);
      return {
        utmMultiplier,
        income,
        engine: engine.taxAmount,
        engineRate: engine.marginalRate,
        official,
        diff: engine.taxAmount - official,
      };
    });
    log("D1.monthly-iusc", cases);
    expect(cases[0].engine).not.toBeCloseTo(cases[0].official, 2);
    expect(cases[0].diff).toBeCloseTo(2.5 * UTM_SEP_2026, 3);
    expect(cases[1].engine).not.toBeCloseTo(cases[1].official, 2);
    expect(cases[1].diff).toBeCloseTo(8 * UTM_SEP_2026, 3);
  });

  it("D1(c) — el contrato real sigue siendo continuo (la tabla equivocada es la del art. 52 bis)", () => {
    const limit = 150 * UTA_AT2026;
    const below = calculateSecondCategoryTax({ taxableIncome: limit, utm: UTA_AT2026 });
    const officialAtLimit = igcOfficialAnnual(limit, UTA_AT2026);
    log("D1.continuity-150uta", {
      limit,
      engine: below.taxAmount,
      official: officialAtLimit,
    });
    // En la frontera de 150 UTA ambas tablas coinciden; la divergencia crece
    // a medida que la renta se aleja de esa frontera.
    expect(below.taxAmount).toBeCloseTo(officialAtLimit, 6);
  });

  it("entradas inválidas: negativo lanza; cero ⇒ 0", () => {
    expect(() => calculateSecondCategoryTax({ taxableIncome: -1, utm: UTA_AT2026 })).toThrow(
      "taxableIncome"
    );
    const zero = calculateSecondCategoryTax({ taxableIncome: 0, utm: UTA_AT2026 });
    log("V1.zero", { tax: zero.taxAmount, rate: zero.marginalRate });
    expect(zero.taxAmount).toBe(0);
  });

  it("uso del caso de uso completo (SimulateOperacionRenta) vs reimplementación", () => {
    const rows = [10_000_000, 11_265_804, 11_265_805, 20_000_000, 50_000_000, 130_000_000].map(
      income => {
        const engine = simulateOperacionRenta({
          sueldosRentaNeta: income,
          sueldosBaseMode: "declarada",
          honorariosBrutos: 0,
          arriendos: 0,
          impuestoUnicoRetenido: 0,
          ppmHonorarios: 0,
          apvRegimenB: 0,
          interesesHipotecarios: 0,
          taxYear: getTaxYearParameters(2026),
        });
        const independent = igcIndependent(income, UTA_AT2026);
        return {
          income,
          engine: engine.igcCalculado,
          independent,
          engineMarginal: engine.tasaMarginal,
          independentMarginal: marginalRateIndependent(income, UTA_AT2026),
        };
      }
    );
    log("V1.usecase-grid", rows);
    for (const row of rows) {
      expect(row.engine).toBeCloseTo(row.independent, 6);
      expect(row.engineMarginal).toBeCloseTo(row.independentMarginal, 9);
    }
  });
});

describe("AUDIT V2 — sueldo líquido $1.200.000 (apor. Habitat 11,27%, Fonasa, indefinido)", () => {
  const assumptions: SalaryAssumptions = {
    afpPct: 11.27,
    healthPct: 7,
    afcPct: 0.6,
    uf: UF_SNAPSHOT,
    utm: UTM_SEP_2026,
    capPrevUf: 90,
    capAfcUf: 135.2,
  };

  it("vector: líquido $973.347, impuesto $213 (display redondeado)", () => {
    const gross = 1_200_000;
    const independent = netSalaryIndependent(gross, assumptions);
    const engine = calculateNetSalary({
      grossSalary: gross,
      afpRatePercent: 11.27,
      healthSystem: "fonasa",
      contractType: "indefinido",
      economicParameters: {
        uf: UF_SNAPSHOT,
        utm: UTM_SEP_2026,
        afcTopes: { monthlyTaxableCapUf: 135.2 },
        previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 90 },
      },
    });
    log("V2.vector", {
      independent,
      engine: {
        afp: engine.deductions.afp,
        health: engine.deductions.health,
        afc: engine.deductions.unemploymentInsurance,
        taxableBase: engine.taxableBase,
        tax: engine.deductions.tax,
        net: engine.netSalary,
      },
    });
    expect(independent.afp).toBeCloseTo(135_240, 9);
    expect(independent.health).toBeCloseTo(84_000, 9);
    expect(independent.afc).toBeCloseTo(7_200, 9);
    expect(independent.taxable).toBeCloseTo(973_560, 9);
    expect(independent.tax).toBeCloseTo(213.06, 6);
    expect(engine.deductions.afp).toBeCloseTo(independent.afp, 9);
    expect(engine.deductions.health).toBeCloseTo(independent.health, 9);
    expect(engine.deductions.unemploymentInsurance).toBeCloseTo(independent.afc, 9);
    expect(engine.taxableBase).toBeCloseTo(independent.taxable, 9);
    expect(engine.deductions.tax).toBeCloseTo(independent.tax, 9);
    expect(Math.round(engine.netSalary)).toBe(973_347);
    expect(Math.round(engine.deductions.tax)).toBe(213);
    expect(independent.net).toBeCloseTo(engine.netSalary, 9);
  });

  it("borde: base imponible exactamente 13,5 UTM ⇒ impuesto 0", () => {
    const base = 13.5 * UTM_SEP_2026; // 968.233,5
    const gross = base / (1 - 0.1127 - 0.07 - 0.006);
    const independent = netSalaryIndependent(gross, assumptions);
    const engine = calculateSecondCategoryTax({ taxableIncome: base, utm: UTM_SEP_2026 });
    log("V2.boundary-13.5utm", {
      base,
      gross,
      taxableEngine: engine.taxAmount,
      independentTax: independent.tax,
    });
    expect(engine.taxAmount).toBe(0);
    expect(independent.taxable).toBeCloseTo(base, 6);
    expect(independent.tax).toBe(0);
  });

  it("tope previsional 90 UF cuando el sueldo lo supera", () => {
    const gross = 4_000_000;
    const prevCap = 90 * UF_SNAPSHOT;
    const independent = netSalaryIndependent(gross, assumptions);
    const engine = calculateNetSalary({
      grossSalary: gross,
      afpRatePercent: 11.27,
      healthSystem: "fonasa",
      contractType: "indefinido",
      economicParameters: {
        uf: UF_SNAPSHOT,
        utm: UTM_SEP_2026,
        afcTopes: { monthlyTaxableCapUf: 135.2 },
        previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 90 },
      },
    });
    log("V2.prev-cap", {
      prevCap,
      gross,
      independent: { afp: independent.afp, health: independent.health, taxable: independent.taxable },
      engine: {
        capped: engine.cappedBases.pensionAndHealth,
        afp: engine.deductions.afp,
        health: engine.deductions.health,
        taxable: engine.taxableBase,
      },
    });
    expect(engine.cappedBases.pensionAndHealth).toBeCloseTo(Math.min(gross, prevCap), 9);
    expect(engine.deductions.afp).toBeCloseTo(Math.min(gross, prevCap) * 0.1127, 9);
    expect(independent.tax).toBeCloseTo(engine.deductions.tax, 6);
  });

  it("contrato plazo fijo: AFC trabajador = 0", () => {
    const engine = calculateNetSalary({
      grossSalary: 1_000_000,
      afpRatePercent: 11.27,
      healthSystem: "fonasa",
      contractType: "plazo-fijo",
      economicParameters: {
        uf: UF_SNAPSHOT,
        utm: UTM_SEP_2026,
        afcTopes: { monthlyTaxableCapUf: 135.2 },
        previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 90 },
      },
    });
    const independent = netSalaryIndependent(1_000_000, { ...assumptions, afcPct: 0 });
    log("V2.plazo-fijo", {
      engineAfc: engine.deductions.unemploymentInsurance,
      independentAfc: independent.afc,
    });
    expect(engine.deductions.unemploymentInsurance).toBe(0);
    expect(engine.netSalary).toBeCloseTo(independent.net, 6);
  });

  it("inválidos: sueldo 0 o negativo lanza", () => {
    for (const gross of [0, -1]) {
      expect(() =>
        calculateNetSalary({
          grossSalary: gross,
          afpRatePercent: 11.27,
          healthSystem: "fonasa",
          economicParameters: {
            uf: UF_SNAPSHOT,
            utm: UTM_SEP_2026,
            afcTopes: { monthlyTaxableCapUf: 135.2 },
            previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 90 },
          },
        })
      ).toThrow("grossSalary");
    }
  });
});

describe("AUDIT V3 — DAP sin retención (residente)", () => {
  it("vector $5.000.000 / 180 días / 5%: interés 123.287,67 sin retención", () => {
    const independent = dapIndependent(5_000_000, 180, 5);
    const engine = calculateTermDeposit({
      amount: 5_000_000,
      termDays: 180,
      annualRatePercent: 5,
    });
    log("V3.vector", {
      independent,
      engine: {
        grossInterest: engine.grossInterest,
        finalAmount: engine.finalAmount,
        tir: engine.effectiveAnnualRatePercent,
      },
    });
    expect(independent.interest).toBeCloseTo(123_287.67, 2);
    expect(engine.grossInterest).toBeCloseTo(independent.interest, 9);
    expect(engine.finalAmount).toBeCloseTo(independent.final, 9);
    // El motor no resta el 4% (comportamiento corregido en F03).
    expect(engine.grossInterest).not.toBeCloseTo(independent.oldNetWith4Pct, 2);
  });

  it("reproduce el vector del informe original (5M/90d/6% → neto viejo 71.014)", () => {
    const independent = dapIndependent(5_000_000, 90, 6);
    log("V3.bug-repro", independent);
    expect(Math.round(independent.oldFinalWith4Pct)).toBe(5_071_014);
    expect(Math.round(independent.oldNetWith4Pct)).toBe(71_014);
  });

  it("365 días reproduce la tasa anual exacta", () => {
    const engine = calculateTermDeposit({
      amount: 2_000_000,
      termDays: 365,
      annualRatePercent: 4.5,
    });
    const independent = dapIndependent(2_000_000, 365, 4.5);
    log("V3.365d", { engine: engine.grossInterest, independent: independent.interest });
    expect(engine.grossInterest).toBe(90_000);
    expect(engine.grossInterest).toBeCloseTo(independent.interest, 9);
  });

  it("inválidos: monto/plazo/tasa no positivos lanzan", () => {
    expect(() =>
      calculateTermDeposit({ amount: 0, termDays: 30, annualRatePercent: 5 })
    ).toThrow("amount");
    expect(() =>
      calculateTermDeposit({ amount: 1_000_000, termDays: 0, annualRatePercent: 5 })
    ).toThrow("termDays");
    expect(() =>
      calculateTermDeposit({ amount: 1_000_000, termDays: 30, annualRatePercent: 0 })
    ).toThrow("annualRatePercent");
  });

  it("no existe parámetro de residencia en el contrato: 4% no modelable (limitación)", () => {
    const engine = calculateTermDeposit({
      amount: 1_000_000,
      termDays: 30,
      annualRatePercent: 6,
    });
    log("V3.residency-limitation", {
      outputKeys: Object.keys(engine),
      note: "sin entrada de residencia; el caso no domiciliado (4% Impuesto Adicional) no se modela",
    });
    expect(engine.finalAmount).toBeCloseTo(1_000_000 + 1_000_000 * 0.06 * (30 / 365), 9);
  });
});

describe("AUDIT V5 — SuperIR (Ley 20.720 art. 260)", () => {
  const base = {
    monthlyIncome: 1_200_000,
    termMonths: 48,
    monthlyRatePercent: 1.2,
    hasFirstCategoryActivityLast24Months: false,
    hasNotifiedExecutiveProceeding: false,
    hasRequiredDocuments: true,
  };

  it("regresión: 2 acreedores, montos suman > 80 UF ⇒ elegible", () => {
    const debts = [
      { amount: 1_800_000, overdueDays: 120, creditor: "Banco A" },
      { amount: 2_200_000, overdueDays: 150, creditor: "Retail B" },
    ];
    const uf = 39_300;
    const engine = simulateDebtRenegotiation({ ...base, debts, ufValue: uf });
    const independent = debtIndependent(debts, uf);
    log("V5.case1", {
      independent,
      engine: {
        qualifiedDebtUf: engine.qualifiedDebtUf,
        creditors: engine.qualifiedCreditorCount,
        meets: engine.meetsBasicEligibility,
        payment: engine.monthlyPayment,
        totalPaid: engine.totalPaid,
      },
      annuity: annuityIndependent(4_000_000, 0.012, 48),
    });
    expect(engine.meetsBasicEligibility).toBe(true);
    expect(engine.monthlyPayment).toBeCloseTo(annuityIndependent(4_000_000, 0.012, 48), 9);
    expect(independent.eligibleStrict).toBe(true);
  });

  it("borde del informe (y del motor): exactamente 80 UF y 2 acreedores", () => {
    const uf = 40_000;
    const debts = [
      { amount: 1_600_000, overdueDays: 120, creditor: "Banco A" },
      { amount: 1_600_000, overdueDays: 150, creditor: "Retail B" },
    ];
    const engine = simulateDebtRenegotiation({ ...base, debts, ufValue: uf });
    const independent = debtIndependent(debts, uf);
    log("V5.exactly-80uf", {
      independent,
      engine: {
        qualifiedDebtUf: engine.qualifiedDebtUf,
        reachesMinimumUf: engine.requirementChecks.reachesMinimumUf,
        meets: engine.meetsBasicEligibility,
      },
    });
    // Divergencia: la ley exige "más de 80 UF" (estricto); el motor usa >=.
    expect(independent.sumUf).toBe(80);
    expect(independent.eligibleStrict).toBe(false);
    expect(engine.meetsBasicEligibility).toBe(true);
  });

  it("borde 90 días exactos: no califica (se exige >90)", () => {
    const debts = [
      { amount: 2_000_000, overdueDays: 90, creditor: "Banco A" },
      { amount: 1_800_000, overdueDays: 91, creditor: "Retail B" },
    ];
    const engine = simulateDebtRenegotiation({ ...base, debts, ufValue: 39_300 });
    log("V5.90-days", {
      qualifiedCount: engine.qualifiedDebtCount,
      minimumOverdueDays: engine.minimumOverdueDays,
      meets: engine.meetsBasicEligibility,
    });
    expect(engine.minimumOverdueDays).toBe(91);
    expect(engine.qualifiedDebtCount).toBe(1);
    expect(engine.meetsBasicEligibility).toBe(false);
  });

  it("dos deudas del mismo acreedor (case/espacios) ⇒ no distintas", () => {
    const debts = [
      { amount: 2_000_000, overdueDays: 120, creditor: "Banco A" },
      { amount: 1_800_000, overdueDays: 150, creditor: "  banco a " },
      { amount: 1_000_000, overdueDays: 150, creditor: "Retail B" },
    ];
    const engine = simulateDebtRenegotiation({ ...base, debts, ufValue: 39_300 });
    log("V5.same-creditor", {
      qualifiedCreditorCount: engine.qualifiedCreditorCount,
      meets: engine.meetsBasicEligibility,
    });
    expect(engine.qualifiedCreditorCount).toBe(2);
    expect(engine.meetsBasicEligibility).toBe(true);
  });

  it("adversarial: monto negativo es aceptado y contamina la deuda total", () => {
    const debts = [
      { amount: -500_000, overdueDays: 120, creditor: "Banco A" },
      { amount: 2_500_000, overdueDays: 120, creditor: "Retail B" },
    ];
    const engine = simulateDebtRenegotiation({ ...base, debts, ufValue: 39_300 });
    log("V5.negative-amount", {
      totalDebtClp: engine.totalDebtClp,
      qualifiedDebtUf: engine.qualifiedDebtUf,
      meets: engine.meetsBasicEligibility,
      payment: engine.monthlyPayment,
    });
    expect(engine.totalDebtClp).toBe(2_000_000);
    expect(engine.meetsBasicEligibility).toBe(false);
  });

  it("80 UF y un peso más ⇒ elegible por ambos criterios", () => {
    const uf = 40_000;
    const debts = [
      { amount: 1_600_000, overdueDays: 120, creditor: "Banco A" },
      { amount: 1_600_001, overdueDays: 150, creditor: "Retail B" },
    ];
    const engine = simulateDebtRenegotiation({ ...base, debts, ufValue: uf });
    const independent = debtIndependent(debts, uf);
    log("V5.80uf-plus-1", {
      independent,
      engineMeets: engine.meetsBasicEligibility,
      reaches: engine.requirementChecks.reachesMinimumUf,
    });
    expect(independent.eligibleStrict).toBe(true);
    expect(engine.meetsBasicEligibility).toBe(true);
  });

  it("exige acreedor en cada deuda (no vacío)", () => {
    expect(() =>
      simulateDebtRenegotiation({
        ...base,
        debts: [{ amount: 2_000_000, overdueDays: 120, creditor: "   " }],
        ufValue: 39_300,
      })
    ).toThrow("acreedor");
  });
});

describe("AUDIT V6 — IPC 2026, UTA y UF", () => {
  const dataset = JSON.parse(
    readFileSync(
      `${REPO_ROOT}src/data/economic-history/ipc-historico.json`,
      "utf8"
    )
  ) as {
    actualizadoEl: string;
    desdeFecha: string;
    hastaFecha: string;
    totalEntradas: number;
    serie: Array<{ fecha: string; valor: number }>;
  };
  const ufDataset = JSON.parse(
    readFileSync(
      `${REPO_ROOT}src/data/economic-history/uf-historico.json`,
      "utf8"
    )
  ) as { serie: Array<{ fecha: string; valor: number }> };
  const ufDataset2025Dec01 = ufDataset.serie.find(
    e => e.fecha === "2025-12-01"
  )?.valor as number;
  const ufDataset2025Dec31 = ufDataset.serie.find(
    e => e.fecha === "2025-12-31"
  )?.valor as number;
  const snapshot = JSON.parse(
    readFileSync(
      `${REPO_ROOT}src/infrastructure/economic/economic-parameters.snapshot.json`,
      "utf8"
    )
  ) as {
    uta: number;
    utm: number;
    uf: number;
    imm: number;
    immEffectiveDate: string;
    indicatorUpdatedAt: Record<string, string>;
  };

  it("meses 2026 del dataset coinciden con el claim", () => {
    const y2026 = dataset.serie.filter(e => e.fecha.startsWith("2026-"));
    const pairs = y2026.map(e => [e.fecha.slice(0, 7), e.valor]);
    log("V6.ipc-2026", pairs);
    expect(pairs).toEqual([
      ["2026-01", 0.4],
      ["2026-02", 0],
      ["2026-03", 1],
      ["2026-04", 1.3],
      ["2026-05", 0.2],
      ["2026-06", 0],
      ["2026-07", 0.1],
      ["2026-08", 0.6],
    ]);
  });

  it("acumulado ene–ago 2026 ≈ +3,65% (informe: +3,6%)", () => {
    const y2026 = dataset.serie.filter(e => e.fecha.startsWith("2026-"));
    const factor = y2026.reduce((acc, e) => acc * (1 + e.valor / 100), 1);
    log("V6.accumulated-2026", { factor, pct: (factor - 1) * 100 });
    expect((factor - 1) * 100).toBeCloseTo(3.6488, 3);
    expect((factor - 1) * 100).toBeCloseTo(3.6, 1);
  });

  it("metadatos del dataset y última entrada", () => {
    log("V6.dataset-meta", {
      actualizadoEl: dataset.actualizadoEl,
      desdeFecha: dataset.desdeFecha,
      hastaFecha: dataset.hastaFecha,
      totalEntradas: dataset.totalEntradas,
      last: dataset.serie.at(-1),
    });
    expect(dataset.hastaFecha).toBe("2026-08-01");
    expect(dataset.serie.at(-1)).toEqual({ fecha: "2026-08-01", valor: 0.6 });
    expect(dataset.totalEntradas).toBe(dataset.serie.length);
  });

  it("UTA/UTM/UF/IMM del snapshot", () => {
    log("V6.snapshot", {
      uta: snapshot.uta,
      utm: snapshot.utm,
      uf: snapshot.uf,
      imm: snapshot.imm,
      immEffectiveDate: snapshot.immEffectiveDate,
      indicatorUpdatedAt: snapshot.indicatorUpdatedAt,
    });
    expect(snapshot.uta).toBe(UTA_AT2026);
    expect(snapshot.uta).toBe(AT2026.uta);
    expect(AT2026.ufDecember).toBe(UF_DIC_2025);
    expect(snapshot.utm).toBe(UTM_SEP_2026);
    expect(snapshot.indicatorUpdatedAt.uta).toBe("2025-12-01");
    expect(snapshot.indicatorUpdatedAt.ipc).toBe("2026-08-01");
  });

  it("D2 — UF dic-2025: SII usa $39.727,96 (31.12.2025); AT2026 congela $39.643,59", () => {
    const ufDatasetDec31 = ufDataset2025Dec31;
    log("D2.uf-dic-2025", {
      at2026_ufDecember: AT2026.ufDecember,
      ufDataset2025_12_01: ufDataset2025Dec01,
      ufDataset2025_12_31: ufDatasetDec31,
      siiImplicitFrom8000Uf: 317_823_680 / 8_000,
      apvCapEngine: 600 * AT2026.ufDecember,
      apvCapOfficial: 600 * ufDatasetDec31,
      apvCapDiff: 600 * (ufDatasetDec31 - AT2026.ufDecember),
    });
    expect(AT2026.ufDecember).toBe(39_643.59);
    expect(ufDatasetDec31).toBe(39_727.96);
    expect(AT2026.ufDecember).not.toBe(ufDatasetDec31);
    // Cap APV Régimen B (600 UF) con el valor congelado vs el oficial:
    expect(600 * AT2026.ufDecember).toBeCloseTo(23_786_154, 6);
    expect(600 * ufDatasetDec31).toBeCloseTo(23_836_776, 6);
  });

  it("D2(b) — efecto del cap APV en SimulateOperacionRenta (600 UF dic)", () => {
    const income = 50 * UTA_AT2026;
    const result = simulateOperacionRenta({
      sueldosRentaNeta: income,
      sueldosBaseMode: "declarada",
      honorariosBrutos: 0,
      arriendos: 0,
      impuestoUnicoRetenido: 0,
      ppmHonorarios: 0,
      apvRegimenB: 700 * AT2026.ufDecember,
      interesesHipotecarios: 0,
      taxYear: getTaxYearParameters(2026),
    });
    log("D2.apv-cap-effect", {
      apvCap: result.apvCap,
      apvAplicado: result.apvAplicado,
      apvCapOficial: 600 * ufDataset2025Dec31,
    });
    expect(result.apvCap).toBe(600 * AT2026.ufDecember);
    expect(result.apvCap).toBeCloseTo(23_786_154, 6);
  });
  it("freshness: dataset 2026-08 vs snapshot 2026-08 ⇒ fresh; 2026-09 ⇒ stale", () => {
    const fresh = evaluateIpcSeriesFreshness("2026-08", snapshot.indicatorUpdatedAt.ipc);
    const stale = evaluateIpcSeriesFreshness("2026-08", "2026-09-01");
    log("V6.freshness", { fresh, stale });
    expect(fresh.status).toBe("fresh");
    expect(stale.status).toBe("stale");
  });

  it("resolver effective-dated: UTA dic-2025 exacta y no fuga a 2026-01", () => {
    const entries: EffectiveDatedEntry[] = [
      {
        indicator: "uta",
        periodId: "2025-12",
        value: 834_504,
        effectiveFrom: "2025-12-01",
        effectiveTo: "2026-01-01",
        source: "SII",
      },
    ];
    const exact = resolveEffectiveValue(entries, "uta", "2025-12");
    const leak = resolveEffectiveValue(entries, "uta", "2026-01");
    log("V6.effective-dated", { exact, leak });
    expect(exact?.value).toBe(834_504);
    expect(leak).toBeUndefined();
  });
});

describe("AUDIT V4 — copy APV (art. 42 bis N°3) sin motor asociado", () => {
  it("la página declara la fórmula legal; no hay módulo que la ejecute", () => {
    const apv = readFileSync(`${REPO_ROOT}src/pages/calculadoras/apv.astro`, "utf8");
    const checks = {
      formula110: apv.includes("multiplicada por 1,1"),
      pp3: apv.includes("3 puntos porcentuales"),
      retention15: apv.includes("retiene 15%"),
      pensioners: apv.includes("pensionados"),
      art42bis: apv.includes("art. 42 bis N°3 LIR"),
      withdrawalTaxInEngine: false,
    };
    log("V4.copy-checks", checks);
    // Aritmética de la fórmula declarada (no hay motor que la calcule):
    const marginal = 0.35;
    const resulting = marginal * 1.1 + 0.03;
    log("V4.formula-arith", { marginal, resulting, retentionAbono: 0.15 });
    expect(checks.formula110).toBe(true);
    expect(checks.pp3).toBe(true);
    expect(checks.retention15).toBe(true);
    expect(checks.pensioners).toBe(true);
    expect(checks.art42bis).toBe(true);
    expect(resulting).toBeCloseTo(0.415, 9);
  });
});
