export type CriticalMonthlyFreshness =
  | { status: "fresh"; reason: string }
  | { status: "grace"; reason: string }
  | { status: "stale"; reason: string };

// Chile vive 3-4h detrás de UTC: decidir mes/día con getUTC*() declararía
// "stale" hasta 4h antes de que venza la gracia en Chile. El mes/día siempre
// se resuelven con el calendario local (Intl + America/Santiago).
function chileCalendarParts(now: Date): {
  year: number;
  month: number;
  day: number;
} {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) =>
    Number(parts.find(p => p.type === type)?.value ?? "0");
  return { year: get("year"), month: get("month"), day: get("day") };
}

export function evaluateCriticalMonthlyFreshness(
  indicatorDate: string,
  now = new Date(),
  graceDays = 7
): CriticalMonthlyFreshness {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(indicatorDate)) {
    return { status: "stale", reason: `fecha inválida: ${indicatorDate}` };
  }
  const { year, month, day } = chileCalendarParts(now);
  const currentMonth = `${year}-${String(month).padStart(2, "0")}`;
  const indicatorMonth = indicatorDate.slice(0, 7);
  if (indicatorMonth === currentMonth) {
    return { status: "fresh", reason: `UTM vigente para ${currentMonth}` };
  }
  if (indicatorMonth > currentMonth) {
    return { status: "stale", reason: `fecha futura: ${indicatorDate}` };
  }
  const prevMonthNum = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const previousMonth = `${prevYear}-${String(prevMonthNum).padStart(2, "0")}`;
  if (indicatorMonth === previousMonth && day <= graceDays) {
    return {
      status: "grace",
      reason: `UTM del mes anterior dentro de la gracia de ${graceDays} días`,
    };
  }
  return {
    status: "stale",
    reason: `UTM ${indicatorMonth} vencida; no se publicó ${currentMonth} dentro de ${graceDays} días`,
  };
}
