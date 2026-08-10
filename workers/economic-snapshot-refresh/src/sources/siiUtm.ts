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
  const year = now.getUTCFullYear();
  const monthIndex = now.getUTCMonth();
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
