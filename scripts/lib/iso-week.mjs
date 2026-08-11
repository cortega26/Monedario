// Semana ISO (Jan-4) compartida por los scripts del pipeline semanal
// (audit-ctr-opportunities.mjs, build-weekly-search-report.mjs). Extraído del
// plan 075 — antes triplicado (el worker analytics-collector mantiene su
// variante TZ canónica para fecha→semana con timezone; aquí solo
// label→rango y fecha→semana UTC).

const WEEK_LABEL_RE = /^(\d{4})-W(\d{2})$/;

export function isoWeekToMonday(year, week) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const weekOneMonday = new Date(jan4.getTime() - (jan4Day - 1) * 86400000);
  return new Date(weekOneMonday.getTime() + (week - 1) * 7 * 86400000);
}

function toIsoDateString(date) {
  return date.toISOString().slice(0, 10);
}

export function weekLabelToDateRange(weekLabel) {
  const match = WEEK_LABEL_RE.exec(weekLabel);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);
  const currentMonday = isoWeekToMonday(year, week);
  const currentSunday = new Date(currentMonday.getTime() + 6 * 86400000);
  const previousMonday = new Date(currentMonday.getTime() - 7 * 86400000);
  const previousSunday = new Date(currentMonday.getTime() - 1 * 86400000);
  return {
    currentStart: toIsoDateString(currentMonday),
    currentEnd: toIsoDateString(currentSunday),
    previousStart: toIsoDateString(previousMonday),
    previousEnd: toIsoDateString(previousSunday),
  };
}

export function isoWeekWindow(weekLabel) {
  const range = weekLabelToDateRange(weekLabel);
  if (!range) return null;
  return { from: range.currentStart, to: range.currentEnd };
}

export function dateToIsoWeek(date) {
  const thursday = new Date(date.getTime());
  const day = thursday.getUTCDay() || 7;
  thursday.setUTCDate(thursday.getUTCDate() + 4 - day);
  const isoYear = thursday.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil(((thursday - yearStart) / 86400000 + 1) / 7);
  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}
