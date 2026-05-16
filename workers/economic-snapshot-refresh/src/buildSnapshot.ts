const DEFAULT_AFC_MONTHLY_TAXABLE_CAP_UF = 135.2;
const DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF = 90;
const DEFAULT_TMC_FALLBACK = 3.49;

export interface MindicadorIndicator {
  valor?: number;
  fecha?: string;
}

export interface MindicadorApiResponse {
  fecha?: string;
  uf?: MindicadorIndicator;
  utm?: MindicadorIndicator;
  ipc?: MindicadorIndicator;
  tmc?: MindicadorIndicator;
  dolar?: MindicadorIndicator;
}

export interface UtmSerieEntry {
  fecha?: string;
  valor?: number;
}

export interface UtmSerieResponse {
  serie?: UtmSerieEntry[];
}

export interface EconomicSnapshot {
  uf: number;
  utm: number;
  uta: number;
  ipc: number;
  tmc: number;
  dolar?: number;
  afcTopes: { monthlyTaxableCapUf: number };
  previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: number };
  indicatorUpdatedAt: {
    uf: string;
    utm: string;
    ipc?: string;
    tmc?: string;
    dolar?: string;
    uta: string;
  };
  lastUpdated: string;
  capturedAt: string;
  source: "mindicador.cl/api";
}

export interface BuildSnapshotDeps {
  fetchApi: () => Promise<MindicadorApiResponse>;
  fetchDecemberUtm: (year: number) => Promise<number | null>;
  now: () => Date;
}

function toIsoDate(value: string | undefined, fallback: string): string {
  if (typeof value === "string" && value.length >= 10) {
    return value.slice(0, 10);
  }
  return fallback;
}

function getLatestIsoDate(values: Array<string | undefined>, fallback: string): string {
  const candidates = values
    .filter((v): v is string => typeof v === "string" && v.length >= 10)
    .map(v => v.slice(0, 10))
    .sort();
  return candidates.at(-1) ?? fallback;
}

function assertFinitePositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a finite number greater than 0.`);
  }
}

// UTA for a calendar year is defined using the December UTM of the previous year.
// Returns the year that should hold the reference December.
export function getUtaReferenceYear(now: Date): number {
  return now.getUTCFullYear() - 1;
}

export async function buildSnapshot(deps: BuildSnapshotDeps): Promise<EconomicSnapshot> {
  const now = deps.now();
  const todayIso = now.toISOString().slice(0, 10);

  const payload = await deps.fetchApi();

  const uf = Number(payload?.uf?.valor);
  const utm = Number(payload?.utm?.valor);

  const utaRefYear = getUtaReferenceYear(now);
  const decUtm = await deps.fetchDecemberUtm(utaRefYear);
  const uta = decUtm !== null ? decUtm * 12 : utm * 12;

  const ipc = Number(payload?.ipc?.valor ?? 0);
  const tmcRaw = payload?.tmc?.valor;
  const tmc = tmcRaw !== undefined ? Number(tmcRaw) : DEFAULT_TMC_FALLBACK;
  const dolarRaw = payload?.dolar?.valor;
  const dolar = dolarRaw !== undefined ? Number(dolarRaw) : undefined;

  const rawDates = {
    uf: payload?.uf?.fecha,
    utm: payload?.utm?.fecha,
    uta: decUtm !== null ? `${utaRefYear}-12-01` : payload?.utm?.fecha,
    ipc: payload?.ipc?.fecha,
    tmc: payload?.tmc?.fecha,
    dolar: payload?.dolar?.fecha,
  };

  const lastUpdated = getLatestIsoDate(
    [
      payload?.fecha,
      rawDates.uf,
      rawDates.utm,
      rawDates.uta,
      rawDates.ipc,
      rawDates.tmc,
      rawDates.dolar,
    ],
    todayIso
  );

  assertFinitePositive(uf, "UF");
  assertFinitePositive(utm, "UTM");
  if (!Number.isFinite(ipc)) {
    throw new Error("IPC must be a finite number.");
  }
  assertFinitePositive(tmc, "TMC");
  if (dolar !== undefined) {
    assertFinitePositive(dolar, "Dolar");
  }
  assertFinitePositive(uta, "UTA");

  const indicatorUpdatedAt: EconomicSnapshot["indicatorUpdatedAt"] = {
    uf: toIsoDate(rawDates.uf, lastUpdated),
    utm: toIsoDate(rawDates.utm, lastUpdated),
    uta: toIsoDate(rawDates.uta, lastUpdated),
  };
  if (rawDates.ipc) indicatorUpdatedAt.ipc = toIsoDate(rawDates.ipc, lastUpdated);
  if (rawDates.tmc) indicatorUpdatedAt.tmc = toIsoDate(rawDates.tmc, lastUpdated);
  if (dolar !== undefined) {
    indicatorUpdatedAt.dolar = toIsoDate(rawDates.dolar, lastUpdated);
  }

  const snapshot: EconomicSnapshot = {
    uf,
    utm,
    uta,
    ipc,
    tmc,
    ...(dolar !== undefined ? { dolar } : {}),
    afcTopes: {
      monthlyTaxableCapUf: DEFAULT_AFC_MONTHLY_TAXABLE_CAP_UF,
    },
    previsionalTopes: {
      pensionAndHealthMonthlyTaxableCapUf:
        DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF,
    },
    indicatorUpdatedAt,
    lastUpdated,
    capturedAt: now.toISOString(),
    source: "mindicador.cl/api",
  };

  return snapshot;
}

export interface FetcherOptions {
  timeoutMs?: number;
  baseUrl?: string;
}

export function createMindicadorFetchers(options: FetcherOptions = {}): {
  fetchApi: BuildSnapshotDeps["fetchApi"];
  fetchDecemberUtm: BuildSnapshotDeps["fetchDecemberUtm"];
} {
  const timeoutMs = options.timeoutMs ?? 12_000;
  const baseUrl = options.baseUrl ?? "https://mindicador.cl/api";

  const fetchApi: BuildSnapshotDeps["fetchApi"] = async () => {
    const response = await fetch(baseUrl, { signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) {
      throw new Error(`mindicador.cl request failed with status ${response.status}.`);
    }
    return (await response.json()) as MindicadorApiResponse;
  };

  const fetchDecemberUtm: BuildSnapshotDeps["fetchDecemberUtm"] = async year => {
    try {
      const response = await fetch(`${baseUrl}/utm/${year}`, {
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) return null;
      const payload = (await response.json()) as UtmSerieResponse;
      const decEntry = payload?.serie?.find(e => e.fecha?.startsWith(`${year}-12`));
      const value = decEntry?.valor;
      return typeof value === "number" && Number.isFinite(value) ? value : null;
    } catch {
      return null;
    }
  };

  return { fetchApi, fetchDecemberUtm };
}

export function serializeSnapshot(snapshot: EconomicSnapshot): string {
  return `${JSON.stringify(snapshot, null, 2)}\n`;
}
