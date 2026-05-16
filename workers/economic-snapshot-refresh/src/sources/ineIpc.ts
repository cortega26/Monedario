// INE (Instituto Nacional de Estadísticas de Chile) IPC scraper.
// The mindicador.cl pipeline that we use for other indicators stopped publishing
// IPC after Dec 2025, so we fetch IPC directly from INE's public page. INE is
// the authoritative source; mindicador.cl is just a redistributor.
//
// Source page (after 301): https://www.ine.gob.cl/estadisticas-por-tema/precios-e-inflacion/indice-de-precios-al-consumidor
//
// Stable HTML pattern observed 2026-05-16. The page publishes several index
// cards (IPC, ICT, IPP, …) all using the same CSS classes, so we anchor the
// match to the IPC <h1> heading to avoid picking up a sibling card if INE
// reorders the layout:
//
//   <h1>Índice de Precios al Consumidor - IPC</h1>
//   <p class="cifraV3">1,3%</p>
//   <p class="periodoCifraV3">Variación mensual abril 2026<br>Base anual 2023=100</p>

const INE_IPC_URL =
  "https://www.ine.gob.cl/estadisticas-por-tema/precios-e-inflacion/indice-de-precios-al-consumidor";

const SPANISH_MONTHS: Record<string, string> = {
  enero: "01",
  febrero: "02",
  marzo: "03",
  abril: "04",
  mayo: "05",
  junio: "06",
  julio: "07",
  agosto: "08",
  septiembre: "09",
  octubre: "10",
  noviembre: "11",
  diciembre: "12",
};

export interface IneIpcReading {
  /** Monthly IPC variation as a number (e.g. 1.3 for "1,3%"). */
  value: number;
  /** First day of the reference month as YYYY-MM-DD (e.g. "2026-04-01"). */
  dateIso: string;
}

const MONTH_PATTERN = Object.keys(SPANISH_MONTHS).join("|");

import { govFetch } from "../govFetch";

// Anchored match: find the IPC heading first, then the next cifraV3 + periodoCifraV3
// pair. `[\s\S]*?` is lazy so we pick the *closest* following pair, not one from
// a sibling card further down. Tolerates accented and unaccented "Indice/Índice".
// `class="[^"]*\\bX\\b[^"]*"` lets the parser tolerate adjacent classes
// (e.g. `class="cifraV3 highlight"`) without losing the anchor.
const PATTERN = new RegExp(
  `<h1[^>]*>[^<]*[ÍI]ndice\\s+de\\s+Precios\\s+al\\s+Consumidor[^<]*</h1>` +
    `[\\s\\S]*?<p[^>]*class="[^"]*\\bcifraV3\\b[^"]*"[^>]*>\\s*(-?\\d+(?:[,.]\\d+)?)\\s*%\\s*</p>` +
    `[\\s\\S]*?<p[^>]*class="[^"]*\\bperiodoCifraV3\\b[^"]*"[^>]*>\\s*Variaci[oó]n\\s+mensual\\s+(${MONTH_PATTERN})\\s+(\\d{4})`,
  "i"
);

export function parseIneIpc(html: string): IneIpcReading | null {
  const match = PATTERN.exec(html);
  if (!match) return null;

  const rawValue = match[1].replace(",", ".");
  const value = Number.parseFloat(rawValue);
  if (!Number.isFinite(value)) return null;

  const monthName = match[2].toLowerCase();
  const monthNumber = SPANISH_MONTHS[monthName];
  if (!monthNumber) return null;

  const year = match[3];
  return {
    value,
    dateIso: `${year}-${monthNumber}-01`,
  };
}

export interface IneFetcherOptions {
  timeoutMs?: number;
  url?: string;
}

export function createIneIpcFetcher(
  options: IneFetcherOptions = {}
): () => Promise<IneIpcReading | null> {
  const url = options.url ?? INE_IPC_URL;
  return async () => {
    const response = await govFetch(url, {
      accept: "text/html,application/xhtml+xml",
      referer: "https://www.ine.gob.cl/",
      timeoutMs: options.timeoutMs ?? 15_000,
    });
    if (!response.ok) {
      throw new Error(`INE request failed with status ${response.status}.`);
    }
    const html = await response.text();
    return parseIneIpc(html);
  };
}
