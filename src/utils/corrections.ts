/**
 * Registro público de correcciones materiales (`src/data/correcciones.json`).
 * Una entrada existe solo para errores que cambian un número, un plazo, un
 * requisito o una conclusión. Organización canónica: por fecha (año → mes).
 */
export interface CorrectionPage {
  href: string;
  label: string;
}

export interface Correction {
  id: string;
  /** Fecha de la corrección (ISO, YYYY-MM-DD). */
  date: string;
  /** Fin del rango cuando la corrección abarcó varios días (ISO, opcional). */
  dateEnd?: string;
  title: string;
  pages: CorrectionPage[];
  wrong: string[];
  fixed: string[];
  affected: string;
  sources: string;
  prevention: string;
}

export interface MonthGroup {
  /** Clave `YYYY-MM` para anclas. */
  key: string;
  year: number;
  /** 1-12. */
  month: number;
  label: string;
  corrections: Correction[];
}

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

function parseIsoDate(value: string): {
  day: number;
  month: number;
  year: number;
} {
  const [year, month, day] = value.split("-").map(Number);
  return { day, month, year };
}

/** "29 de septiembre de 2026" (o "28 y 29 de septiembre de 2026" con rango). */
export function formatCorrectionDate(correction: Correction): string {
  const start = parseIsoDate(correction.date);
  const end = correction.dateEnd ? parseIsoDate(correction.dateEnd) : start;
  const monthName = MONTHS_ES[start.month - 1] ?? "";
  if (end.day === start.day && end.month === start.month) {
    return `${start.day} de ${monthName} de ${start.year}`;
  }
  const endMonthName = MONTHS_ES[end.month - 1] ?? monthName;
  return `${start.day} y ${end.day} de ${endMonthName} de ${end.year}`;
}

/** Fecha efectiva para ordenar: fin del rango si existe. */
export function effectiveDate(correction: Correction): string {
  return correction.dateEnd ?? correction.date;
}

function monthKey(correction: Correction): string {
  const { month, year } = parseIsoDate(correction.date);
  return `${year}-${String(month).padStart(2, "0")}`;
}

/** Agrupa por mes (año → mes), más reciente primero. */
export function groupCorrectionsByMonth(
  corrections: Correction[]
): MonthGroup[] {
  const byKey = new Map<string, MonthGroup>();
  for (const correction of corrections) {
    const key = monthKey(correction);
    const { month, year } = parseIsoDate(correction.date);
    const group = byKey.get(key) ?? {
      key,
      year,
      month,
      label: `${MONTHS_ES[month - 1] ?? ""} de ${year}`,
      corrections: [],
    };
    group.corrections.push(correction);
    byKey.set(key, group);
  }
  return [...byKey.values()]
    .map(group => ({
      ...group,
      corrections: [...group.corrections].sort((a, b) =>
        effectiveDate(a) < effectiveDate(b)
          ? 1
          : effectiveDate(a) > effectiveDate(b)
            ? -1
            : a.id.localeCompare(b.id)
      ),
    }))
    .sort((a, b) => (a.key < b.key ? 1 : -1));
}

/** Área derivada de las páginas afectadas (para el filtro). */
export function correctionAreas(correction: Correction): string[] {
  const areas = new Set<string>();
  for (const page of correction.pages) {
    if (page.href.startsWith("/calculadoras/")) areas.add("Calculadoras");
    else if (page.href.startsWith("/posts/")) areas.add("Artículos");
    else if (page.href.startsWith("/glosario/")) areas.add("Glosario");
    else areas.add("Otras páginas");
  }
  return [...areas];
}

/** Texto buscable en minúsculas (título, páginas, afectados, fuentes). */
export function correctionSearchText(correction: Correction): string {
  return [
    correction.title,
    ...correction.pages.map(page => `${page.label} ${page.href}`),
    correction.affected,
    correction.sources,
    ...correction.wrong,
    ...correction.fixed,
  ]
    .join(" ")
    .toLowerCase();
}

export function filterCorrections(
  corrections: Correction[],
  query: string,
  area: string
): Correction[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(term => term.length > 1);
  return corrections.filter(correction => {
    if (area !== "all" && !correctionAreas(correction).includes(area)) {
      return false;
    }
    if (terms.length === 0) return true;
    const haystack = correctionSearchText(correction);
    return terms.every(term => haystack.includes(term));
  });
}
