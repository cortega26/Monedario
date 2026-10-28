/**
 * Reglas de nómina como fuente única (`ADR-20261027-payroll-rules-single-source`).
 *
 * El defecto que motivó esto no era un número equivocado: era el mismo número
 * replicado en diecisiete archivos, viajando **sin su condición**. Por eso la
 * unidad acá no es la tasa sino la regla, y la tasa se declara **por tipo de
 * contrato**, de forma exhaustiva: agregar un contrato nuevo rompe la
 * compilación hasta que cada regla declare su valor.
 *
 * Vigencia: el registro solo afirma lo verificado. `effectiveFrom` es la fecha
 * de verificación; no se inventa historia legal anterior.
 */

/** Tipos de contrato que el motor reconoce. La lista es la fuente de verdad. */
export const PAYROLL_CONTRACT_TYPES = [
  "indefinido",
  "plazo-fijo",
  "casa-particular",
] as const;

export type PayrollContractType = (typeof PAYROLL_CONTRACT_TYPES)[number];

export type PayrollRuleId = "afc.worker" | "afc.employer" | "health.legal";

export interface PayrollRate {
  /** Tasa como fracción: 0.006 = 0,6%. */
  rate: number;
  /** Fundamento normativo de esta tasa para este tipo de contrato. */
  legalBasis: string;
}

export interface PayrollRule {
  id: PayrollRuleId;
  label: string;
  /**
   * Tasa por tipo de contrato. `Record` completo a propósito: un tipo nuevo
   * sin tasa declarada no compila.
   */
  byContract: Record<PayrollContractType, PayrollRate>;
  /** ISO `YYYY-MM-DD`, inclusivo. */
  effectiveFrom: string;
  /** ISO `YYYY-MM-DD`, exclusivo. Ausente = vigente. */
  effectiveTo?: string;
  source: string;
}

const AFC_SOURCE = "https://www.bcn.cl/leychile/navegar?idNorma=184979";
const AFC_TABLE_SOURCE =
  "https://www.afc.cl/empleadores/pagos-y-dudas-sobre-cotizaciones/cotizaciones-cuanto-y-como-se-paga/";
const SALUD_SOURCE =
  "https://www.superdesalud.gob.cl/tax-materias-isapres/cotizaciones-de-salud-3465/";

/**
 * Registro. Ordenado de la versión más nueva a la más antigua por `id`.
 */
export const PAYROLL_RULES: readonly PayrollRule[] = [
  {
    id: "afc.worker",
    label: "Aporte del trabajador al seguro de cesantía",
    byContract: {
      indefinido: {
        rate: 0.006,
        legalBasis: "Ley 19.728 art. 5 letra a): 0,6% de cargo del trabajador",
      },
      "plazo-fijo": {
        rate: 0,
        legalBasis:
          "Ley 19.728 art. 5: sin aporte del trabajador en plazo fijo u obra",
      },
      "casa-particular": {
        rate: 0,
        legalBasis:
          "Ley 19.728 art. 5 letra a): exceptúa a los trabajadores de casa particular del 0,6%",
      },
    },
    effectiveFrom: "2026-10-27",
    source: `${AFC_SOURCE}; ${AFC_TABLE_SOURCE}`,
  },
  {
    id: "afc.employer",
    label: "Aporte del empleador al seguro de cesantía",
    byContract: {
      indefinido: {
        rate: 0.024,
        legalBasis: "Ley 19.728 art. 9: 1,6% a la CIC + 0,8% al FCS",
      },
      "plazo-fijo": {
        rate: 0.03,
        legalBasis: "Ley 19.728 art. 9: 2,8% a la CIC + 0,2% al FCS",
      },
      "casa-particular": {
        rate: 0.03,
        legalBasis:
          "Ley 19.728 arts. 5 y 9: 3% patronal íntegro, 2,2% a la CIC + 0,8% al FCS",
      },
    },
    effectiveFrom: "2026-10-27",
    source: `${AFC_SOURCE}; ${AFC_TABLE_SOURCE}`,
  },
  {
    id: "health.legal",
    label: "Cotización legal de salud",
    byContract: {
      indefinido: {
        rate: 0.07,
        legalBasis:
          "Cotización legal de salud: 7% de la remuneración imponible",
      },
      "plazo-fijo": {
        rate: 0.07,
        legalBasis:
          "Cotización legal de salud: 7% de la remuneración imponible",
      },
      "casa-particular": {
        rate: 0.07,
        legalBasis:
          "Cotización legal de salud: 7% de la remuneración imponible",
      },
    },
    effectiveFrom: "2026-10-27",
    source: SALUD_SOURCE,
  },
] as const;

function toDay(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    throw new Error(`payroll: fecha inválida ${String(value)}`);
  }
  return date.toISOString().slice(0, 10);
}

function isEffectiveOn(rule: PayrollRule, day: string): boolean {
  if (day < rule.effectiveFrom) return false;
  if (rule.effectiveTo && day >= rule.effectiveTo) return false;
  return true;
}

/**
 * Devuelve la versión de la regla vigente en `on`.
 *
 * Falla cerrado: sin regla vigente o con más de una, lanza. Nunca asume la
 * versión "actual" para una fecha que no cubre.
 */
export function resolvePayrollRule(
  id: PayrollRuleId,
  on: Date | string = new Date()
): PayrollRule {
  const day = toDay(on);
  const candidates = PAYROLL_RULES.filter(
    rule => rule.id === id && isEffectiveOn(rule, day)
  );

  if (candidates.length === 0) {
    throw new Error(
      `payroll: no hay versión vigente de "${id}" para ${day}. Registra la regla antes de calcular.`
    );
  }
  if (candidates.length > 1) {
    throw new Error(
      `payroll: ${candidates.length} versiones de "${id}" vigentes para ${day}; la vigencia está solapada.`
    );
  }
  return candidates[0];
}

/** Tasa de una regla para un tipo de contrato, en `on`. */
export function resolvePayrollRate(
  id: PayrollRuleId,
  contractType: PayrollContractType,
  on: Date | string = new Date()
): number {
  const rule = resolvePayrollRule(id, on);
  const entry = rule.byContract[contractType];
  if (!entry) {
    throw new Error(
      `payroll: la regla "${id}" no declara tasa para el contrato "${contractType}".`
    );
  }
  return entry.rate;
}

/** Fundamento normativo de una tasa concreta. */
export function resolvePayrollLegalBasis(
  id: PayrollRuleId,
  contractType: PayrollContractType,
  on: Date | string = new Date()
): string {
  return resolvePayrollRule(id, on).byContract[contractType].legalBasis;
}
