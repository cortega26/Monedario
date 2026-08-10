import { govFetch } from "../govFetch";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

export interface SiiUtmReading {
  value: number;
  dateIso: string;
  sourceUrl: string;
}

export function siiUtmPageUrl(year: number): string {
  return `https://www.sii.cl/valores_y_fechas/utm/utm${year}.htm`;
}

/**
 * Calendar parts in Chilean local time. Chile lives 3-4h behind UTC: deciding
 * month/day with getUTC*() would adopt the next month's SII page up to 4h
 * early (the page pre-publishes the following month). Pattern: Intl with
 * America/Santiago, same as calendarDateInTimeZone in the analytics collector.
 */
export function calendarPartsInTz(
  now: Date,
  timeZone = "America/Santiago",
): { year: number; monthIndex: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) =>
    Number(parts.find(p => p.type === type)?.value ?? "0");
  return { year: get("year"), monthIndex: get("month") - 1, day: get("day") };
}

export function parseSiiUtm(
  html: string,
  year: number,
  monthIndex: number
): SiiUtmReading | null {
  const month = MONTHS[monthIndex];
  if (!month) return null;
  const pattern = new RegExp(
    `<th[^>]*>\\s*${month}\\s*</th>\\s*<td[^>]*>\\s*([0-9.]+)\\s*</td>`,
    "i"
  );
  const match = pattern.exec(html);
  if (!match) return null;
  const value = Number(match[1].replace(/\./g, ""));
  if (!Number.isFinite(value) || value <= 0) return null;
  return {
    value,
    dateIso: `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`,
    sourceUrl: siiUtmPageUrl(year),
  };
}

export function createSiiUtmFetcher(options: {
  now?: () => Date;
  timeoutMs?: number;
} = {}): () => Promise<SiiUtmReading | null> {
  return async () => {
    const now = options.now?.() ?? new Date();
    const { year, monthIndex } = calendarPartsInTz(now);
  const url = siiUtmPageUrl(year);
    const response = await govFetch(url, {
      accept: "text/html,application/xhtml+xml",
      referer: "https://www.sii.cl/valores_y_fechas/",
      timeoutMs: options.timeoutMs ?? 15_000,
    });
    if (!response.ok) {
      throw new Error(`SII UTM request failed with status ${response.status}.`);
    }
    return parseSiiUtm(await response.text(), year, monthIndex);
  };
}
