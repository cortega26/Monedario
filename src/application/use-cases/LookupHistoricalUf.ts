export interface HistoricalUfInput {
  /** Fecha en formato YYYY-MM-DD */
  date: string;
  /** Mapa fecha → valor UF construido a partir del dataset histórico */
  lookup: Record<string, number>;
  /** Última fecha disponible en el dataset (YYYY-MM-DD) */
  lastAvailableDate: string;
  /** Primera fecha disponible en el dataset (YYYY-MM-DD) */
  firstAvailableDate: string;
}

export type HistoricalUfResult =
  | {
      found: true;
      date: string;
      resolvedDate: string;
      value: number;
      isExactMatch: boolean;
    }
  | { found: false; reason: "before_range" | "after_range" | "no_data" };

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const asDate = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(asDate.getTime()) &&
    asDate.toISOString().slice(0, 10) === value
  );
}

/**
 * Busca el valor de la UF para una fecha dada.
 * Si la fecha no tiene dato exacto, retrocede día a día hasta 7 días.
 * La UF tiene cobertura diaria casi completa (≥ 9 600 entradas) con sólo 2 huecos conocidos.
 */
export function lookupHistoricalUf(
  input: HistoricalUfInput
): HistoricalUfResult {
  const { date, lookup, lastAvailableDate, firstAvailableDate } = input;

  if (!isIsoDate(date)) return { found: false, reason: "no_data" };
  if (!isIsoDate(firstAvailableDate) || !isIsoDate(lastAvailableDate))
    return { found: false, reason: "no_data" };

  if (date < firstAvailableDate)
    return { found: false, reason: "before_range" };
  if (date > lastAvailableDate) return { found: false, reason: "after_range" };

  // Exact match
  if (lookup[date] !== undefined) {
    return {
      found: true,
      date,
      resolvedDate: date,
      value: lookup[date],
      isExactMatch: true,
    };
  }

  // Retrocede hasta 7 días para cubrir huecos y fines de semana sin dato
  const d = new Date(date + "T12:00:00Z");
  for (let i = 1; i <= 7; i++) {
    d.setUTCDate(d.getUTCDate() - 1);
    const candidate = d.toISOString().slice(0, 10);
    if (candidate < firstAvailableDate) break;
    if (lookup[candidate] !== undefined) {
      return {
        found: true,
        date,
        resolvedDate: candidate,
        value: lookup[candidate],
        isExactMatch: false,
      };
    }
  }

  return { found: false, reason: "no_data" };
}
