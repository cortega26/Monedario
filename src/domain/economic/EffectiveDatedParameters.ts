/**
 * Modelo effective-dated para parámetros económicos y legales.
 *
 * Un valor económico no es "el vigente": es el valor que aplica a un período
 * concreto. Las calculadoras históricas o tributarias deben consultar
 * `resolveEffectiveValue()` con un período explícito; las pantallas de "hoy"
 * pueden seguir usando el indicador vigente. Ver
 * `docs/adr/ADR-20260929-effective-dated-economic-parameters.md`.
 */

export type EconomicIndicatorKey = "uf" | "utm" | "uta" | "ipc" | "imm" | "tmc";

/** Período al que aplica un valor, en formato `YYYY-MM`. */
export type PeriodId = string;

export interface EffectiveDatedEntry {
  indicator: EconomicIndicatorKey;
  /** Período nominal del valor (ej. `"2025-12"`). */
  periodId: PeriodId;
  value: number;
  /** Vigencia desde (ISO `YYYY-MM-DD`, inclusivo). */
  effectiveFrom: string;
  /** Vigencia hasta (ISO `YYYY-MM-DD`, exclusivo). Ausente = vigente. */
  effectiveTo?: string;
  /** Fecha de publicación de la fuente, si difiere de la vigencia. */
  publicationDate?: string;
  source: string;
}

const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isPeriodId(value: string): value is PeriodId {
  return PERIOD_PATTERN.test(value);
}

function firstDayOf(periodId: PeriodId): string {
  return `${periodId}-01`;
}

function coversPeriod(entry: EffectiveDatedEntry, periodId: PeriodId): boolean {
  const start = firstDayOf(periodId);
  const fromOk = entry.effectiveFrom <= start;
  const toOk = entry.effectiveTo === undefined || entry.effectiveTo > start;
  return fromOk && toOk;
}

/**
 * Devuelve la entrada que aplica al período pedido para el indicador dado.
 * Prioriza la coincidencia exacta de `periodId`; si no, la última entrada
 * cuya vigencia cubre el inicio del período. `undefined` si no hay cobertura:
 * el llamador debe fallar cerrado, nunca asumir el valor vigente.
 */
export function resolveEffectiveValue(
  entries: readonly EffectiveDatedEntry[],
  indicator: EconomicIndicatorKey,
  periodId: PeriodId
): EffectiveDatedEntry | undefined {
  if (!isPeriodId(periodId)) return undefined;

  const candidates = entries.filter(
    entry => entry.indicator === indicator && coversPeriod(entry, periodId)
  );
  if (candidates.length === 0) return undefined;

  const exact = candidates.find(entry => entry.periodId === periodId);
  if (exact) return exact;

  return [...candidates]
    .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom))
    .at(-1);
}
