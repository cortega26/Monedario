// Banco Central de Chile — SiETE REST API client.
//
// Endpoint: https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx
// Auth:     user + pass in query string (the API's documented mechanism;
//           credentials live only as Worker Secrets, never in code).
// Encoding: response is JSON encoded in Latin-1 (ISO-8859-1). See govFetch.readLatin1.
//
// Series codes we use:
//   - UF (Unidad de Fomento, diaria CLP)             → F073.UFF.PRE.Z.D
//   - USD observado (CLP por USD, diaria)            → F073.TCO.PRE.Z.D
//
// Date format from API: "DD-MM-YYYY". We normalize to ISO "YYYY-MM-DD" before
// returning, so downstream code never deals with the Chilean date convention.

import { govFetch, readLatin1 } from "../govFetch";

const ENDPOINT = "https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx";

export const BCCH_SERIES = {
  UF: "F073.UFF.PRE.Z.D",
  USD_OBSERVED: "F073.TCO.PRE.Z.D",
} as const;

export interface BcchObservation {
  /** Numeric value of the observation. */
  value: number;
  /** ISO date YYYY-MM-DD. */
  dateIso: string;
}

export interface BcchSeriesResponse {
  Codigo: number;
  Descripcion: string;
  Series: {
    seriesId: string | null;
    Obs: BcchRawObservation[] | null;
  };
}

interface BcchRawObservation {
  indexDateString?: string; // "DD-MM-YYYY"
  value?: string;
  statusCode?: string;
}

export interface BcchCredentials {
  user: string;
  password: string;
}

export interface BcchFetchArgs {
  seriesId: string;
  firstDateIso: string; // YYYY-MM-DD inclusive
  lastDateIso: string; // YYYY-MM-DD inclusive
}

export function buildSiteUrl(
  credentials: BcchCredentials,
  args: BcchFetchArgs
): string {
  const params = new URLSearchParams({
    user: credentials.user,
    pass: credentials.password,
    function: "GetSeries",
    timeseries: args.seriesId,
    firstdate: args.firstDateIso,
    lastdate: args.lastDateIso,
  });
  return `${ENDPOINT}?${params.toString()}`;
}

/** Convert "DD-MM-YYYY" → "YYYY-MM-DD". Returns null if input is malformed. */
export function parseChileanDate(input: string | undefined): string | null {
  if (!input) return null;
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(input);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

/** Parses a SiETE response into normalized observations sorted ascending by date.
 *  Returns null if Codigo != 0 (API-level error) or no observations. */
export function parseBcchResponse(
  response: BcchSeriesResponse
): BcchObservation[] | null {
  if (response.Codigo !== 0) return null;
  const raw = response.Series?.Obs;
  if (!raw || raw.length === 0) return null;

  const parsed: BcchObservation[] = [];
  for (const entry of raw) {
    if (entry.statusCode && entry.statusCode !== "OK") continue;
    const dateIso = parseChileanDate(entry.indexDateString);
    if (!dateIso) continue;
    const value = Number(entry.value);
    if (!Number.isFinite(value)) continue;
    parsed.push({ value, dateIso });
  }
  if (parsed.length === 0) return null;
  parsed.sort((a, b) => a.dateIso.localeCompare(b.dateIso));
  return parsed;
}

/** Returns the most recent observation in the series, or null on any failure
 *  (network error, auth error, empty range). Callers must treat this as best-
 *  effort and fall back to alternate sources when it returns null. */
export async function fetchBcchLatest(
  credentials: BcchCredentials,
  seriesId: string,
  options: { lookbackDays?: number; timeoutMs?: number } = {}
): Promise<BcchObservation | null> {
  const lookback = options.lookbackDays ?? 7;
  const today = new Date();
  const last = today.toISOString().slice(0, 10);
  const firstDate = new Date(today.getTime() - lookback * 86_400_000);
  const first = firstDate.toISOString().slice(0, 10);

  const url = buildSiteUrl(credentials, {
    seriesId,
    firstDateIso: first,
    lastDateIso: last,
  });

  const response = await govFetch(url, {
    accept: "application/json",
    timeoutMs: options.timeoutMs ?? 15_000,
  });
  if (!response.ok) return null;

  const raw = await readLatin1(response);
  let parsed: BcchSeriesResponse;
  try {
    parsed = JSON.parse(raw) as BcchSeriesResponse;
  } catch {
    return null;
  }
  const observations = parseBcchResponse(parsed);
  if (!observations) return null;
  return observations.at(-1) ?? null;
}
