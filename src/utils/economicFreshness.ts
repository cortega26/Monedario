export type CriticalMonthlyFreshness =
  | { status: "fresh"; reason: string }
  | { status: "grace"; reason: string }
  | { status: "stale"; reason: string };

export function evaluateCriticalMonthlyFreshness(
  indicatorDate: string,
  now = new Date(),
  graceDays = 7
): CriticalMonthlyFreshness {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(indicatorDate)) {
    return { status: "stale", reason: `fecha inválida: ${indicatorDate}` };
  }
  const currentMonth = now.toISOString().slice(0, 7);
  const indicatorMonth = indicatorDate.slice(0, 7);
  if (indicatorMonth === currentMonth) {
    return { status: "fresh", reason: `UTM vigente para ${currentMonth}` };
  }
  if (indicatorMonth > currentMonth) {
    return { status: "stale", reason: `fecha futura: ${indicatorDate}` };
  }
  if (now.getUTCDate() <= graceDays) {
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
