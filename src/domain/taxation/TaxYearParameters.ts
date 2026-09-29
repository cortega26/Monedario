/**
 * Parámetros fiscales congelados por año tributario.
 *
 * Un cálculo tributario no puede depender de indicadores "vigentes": la tabla
 * del IGC de un año tributario usa la UTA de cierre del año comercial
 * correspondiente. Este módulo fija esos valores por período y es la única
 * fuente que deben consultar las calculadoras tributarias históricas
 * (auditoría de correctitud 2026-09-28, F01/F02; el registry effective-dated
 * completo llega con ADR en el plan 115, paso 3).
 */
export interface TaxYearParameters {
  /** Año tributario (AT). */
  taxYear: number;
  /** Año comercial de los ingresos. */
  commercialYear: number;
  /** Año de presentación de la declaración. */
  filingYear: number;
  /** UTA de cierre del año comercial (diciembre), unidad de la tabla IGC. */
  uta: number;
  /** UF de diciembre del año comercial, para topes expresados en UF. */
  ufDecember: number;
  /** Tasa de retención/PPM de boletas emitidas en el año comercial. */
  honorariosPpmRate: number;
  /** Fuente y alcance de los valores congelados. */
  source: string;
}

/**
 * AT2026 — ingresos del año comercial 2025.
 *
 * - Tabla IGC AT2026: factor 4% y rebaja $450.632,16 para el segundo tramo
 *   (0,54 UTA × $834.504).
 * - UTA diciembre 2025: $834.504 (SII).
 * - UF diciembre 2025: $39.643,59 (Banco Central de Chile).
 * - Retención de boletas de honorarios emitidas en 2025: 14,5% (Ley 21.133,
 *   gradual).
 */
export const AT2026: TaxYearParameters = {
  taxYear: 2026,
  commercialYear: 2025,
  filingYear: 2026,
  uta: 834_504,
  ufDecember: 39_643.59,
  honorariosPpmRate: 0.145,
  source:
    "SII — tabla IGC AT2026 (rebaja $450.632,16) y UTA dic-2025 $834.504; BCCh — UF dic-2025 $39.643,59; Ley 21.133 — retención honorarios 14,5% para boletas 2025.",
};

/** Rebaja del segundo tramo del IGC publicada por el SII para el AT dado. */
export function igcSecondBracketDeduction(taxYear: TaxYearParameters): number {
  return 0.54 * taxYear.uta;
}
