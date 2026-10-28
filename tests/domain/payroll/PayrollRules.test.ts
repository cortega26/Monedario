import { describe, expect, it } from "vitest";
import {
  PAYROLL_CONTRACT_TYPES,
  PAYROLL_RULES,
  resolvePayrollLegalBasis,
  resolvePayrollRate,
  resolvePayrollRule,
} from "@/domain/payroll/PayrollRules";

const ON = "2026-10-27";

describe("PayrollRules — exhaustividad", () => {
  it("cada regla declara tasa para todos los tipos de contrato", () => {
    for (const rule of PAYROLL_RULES) {
      for (const contract of PAYROLL_CONTRACT_TYPES) {
        const entry = rule.byContract[contract];
        expect(entry, `${rule.id} sin tasa para ${contract}`).toBeDefined();
        expect(Number.isFinite(entry.rate)).toBe(true);
        expect(entry.legalBasis.length).toBeGreaterThan(10);
      }
    }
  });

  it("no hay dos versiones vigentes de la misma regla", () => {
    for (const rule of PAYROLL_RULES) {
      expect(() => resolvePayrollRule(rule.id, ON)).not.toThrow();
    }
  });
});

describe("PayrollRules — valores verificados", () => {
  it("AFC del trabajador: 0,6% solo en indefinido común", () => {
    expect(resolvePayrollRate("afc.worker", "indefinido", ON)).toBe(0.006);
    expect(resolvePayrollRate("afc.worker", "plazo-fijo", ON)).toBe(0);
    expect(resolvePayrollRate("afc.worker", "casa-particular", ON)).toBe(0);
  });

  it("AFC del empleador: 2,4% indefinido; 3% plazo fijo y casa particular", () => {
    expect(resolvePayrollRate("afc.employer", "indefinido", ON)).toBe(0.024);
    expect(resolvePayrollRate("afc.employer", "plazo-fijo", ON)).toBe(0.03);
    expect(resolvePayrollRate("afc.employer", "casa-particular", ON)).toBe(0.03);
  });

  it("salud legal: 7% en todos los contratos", () => {
    for (const contract of PAYROLL_CONTRACT_TYPES) {
      expect(resolvePayrollRate("health.legal", contract, ON)).toBe(0.07);
    }
  });

  it("la excepción de casa particular cita la Ley 19.728", () => {
    expect(resolvePayrollLegalBasis("afc.worker", "casa-particular", ON)).toMatch(
      /19\.728/
    );
  });
});

describe("PayrollRules — fallo cerrado", () => {
  it("lanza si se consulta una fecha anterior a la vigencia", () => {
    expect(() => resolvePayrollRule("afc.worker", "2020-01-01")).toThrow(
      /no hay versión vigente/
    );
  });

  it("lanza con una fecha inválida", () => {
    expect(() => resolvePayrollRule("afc.worker", "no-es-fecha")).toThrow(
      /fecha inválida/
    );
  });

  it("acepta Date además de ISO", () => {
    expect(resolvePayrollRate("afc.worker", "indefinido", new Date(ON))).toBe(
      0.006
    );
  });
});
