const DEFAULT_AFC_MONTHLY_TAXABLE_CAP_UF = 135.2;
const DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF = 90;
const DEFAULT_TMC_FALLBACK = 3.49;
// Ingreso Mínimo Mensual — managed legal constant. Reajuste despachado a ley el
// 2026-06-16, vigente retroactivo desde 2026-05-01 ($553.553). mindicador.cl no
// entrega el IMM, por lo que se mantiene aquí. Al reajustarse, actualiza valor y fecha.
// Mirror of src/domain/economic/immConstants.ts DEFAULT_IMM (separate Worker bundle). Keep in sync.
const DEFAULT_IMM = 553_553;
const DEFAULT_IMM_EFFECTIVE_DATE = "2026-05-01";

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

export interface PrevIndicatorEntry {
  valor: number;
  fecha: string;
}

export interface EconomicSnapshot {
  uf: number;
  utm: number;
  uta: number;
  ipc: number;
  tmc: number;
  dolar?: number;
  imm: number;
  immEffectiveDate: string;
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
  /** Previous-period values for delta display. Populated by mergePrev; absent on first run. */
  prev?: {
    uf?: PrevIndicatorEntry;
    utm?: PrevIndicatorEntry;
    dolar?: PrevIndicatorEntry;
  };
  lastUpdated: string;
  capturedAt: string;
  source: "mindicador.cl/api";
  provenance?: {
    utm: {
      primarySource: "SII";
      sourceUrl: string;
      status: "primary" | "fallback";
      verifiedAt: string;
    };
  };
}

/** Generic shape for a single-indicator authoritative override. */
export interface IndicatorOverride {
  value: number;
  /** ISO date for the observation. For IPC, this is the first day of the
   *  reference month (e.g. "2026-04-01"). For UF/USD, the calendar day. */
  dateIso: string;
}

/** @deprecated Use IndicatorOverride. Retained for backwards-compatible callers. */
export type IpcOverride = IndicatorOverride;

export interface BuildSnapshotDeps {
  fetchApi: () => Promise<MindicadorApiResponse>;
  fetchDecemberUtm: (year: number) => Promise<number | null>;
  now: () => Date;
  /** Optional authoritative IPC source (INE). Overrides mindicador.cl when present. */
  fetchIpcOverride?: () => Promise<IndicatorOverride | null>;
  /** Optional authoritative UF source (BCCh). Overrides mindicador.cl when present. */
  fetchUfOverride?: () => Promise<IndicatorOverride | null>;
  /** Optional authoritative USD observado source (BCCh). Overrides mindicador.cl when present. */
  fetchUsdOverride?: () => Promise<IndicatorOverride | null>;
  /** Optional official UTM source (SII). Overrides the aggregator when present. */
  fetchUtmOverride?: () => Promise<(IndicatorOverride & { sourceUrl?: string }) | null>;
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

  let uf = Number(payload?.uf?.valor);
  let ufOverrideDate: string | undefined;
  if (deps.fetchUfOverride) {
    try {
      const override = await deps.fetchUfOverride();
      if (override) {
        uf = override.value;
        ufOverrideDate = override.dateIso;
      }
    } catch {
      // Override failed; keep mindicador.cl UF. Caller is responsible for logging.
    }
  }

  let utm = Number(payload?.utm?.valor);
  let utmOverrideDate: string | undefined;
  let utmSourceUrl = "https://mindicador.cl/api/utm";
  let utmProvenanceStatus: "primary" | "fallback" = "fallback";
  if (deps.fetchUtmOverride) {
    try {
      const override = await deps.fetchUtmOverride();
      if (override) {
        utm = override.value;
        utmOverrideDate = override.dateIso;
        utmSourceUrl = override.sourceUrl ?? utmSourceUrl;
        utmProvenanceStatus = "primary";
      }
    } catch {
      // Keep the explicit mindicador fallback; provenance records the downgrade.
    }
  }

  const utaRefYear = getUtaReferenceYear(now);
  const decUtm = await deps.fetchDecemberUtm(utaRefYear);
  const uta = decUtm !== null ? decUtm * 12 : utm * 12;

  const ipcRaw = payload?.ipc?.valor;
  let ipc = typeof ipcRaw === "number" ? ipcRaw : NaN;
  let ipcOverrideDate: string | undefined;
  if (deps.fetchIpcOverride) {
    try {
      const override = await deps.fetchIpcOverride();
      if (override) {
        ipc = override.value;
        ipcOverrideDate = override.dateIso;
      }
    } catch {
      // Override failed; keep mindicador.cl IPC. Caller is responsible for logging.
    }
  }

  const tmcRaw = payload?.tmc?.valor;
  const tmc = tmcRaw !== undefined ? Number(tmcRaw) : DEFAULT_TMC_FALLBACK;
  const dolarRaw = payload?.dolar?.valor;
  let dolar: number | undefined =
    dolarRaw !== undefined ? Number(dolarRaw) : undefined;
  let usdOverrideDate: string | undefined;
  if (deps.fetchUsdOverride) {
    try {
      const override = await deps.fetchUsdOverride();
      if (override) {
        dolar = override.value;
        usdOverrideDate = override.dateIso;
      }
    } catch {
      // Override failed; keep mindicador.cl USD. Caller is responsible for logging.
    }
  }

  const rawDates = {
    uf: ufOverrideDate ?? payload?.uf?.fecha,
    utm: utmOverrideDate ?? payload?.utm?.fecha,
    uta: decUtm !== null ? `${utaRefYear}-12-01` : payload?.utm?.fecha,
    ipc: ipcOverrideDate ?? payload?.ipc?.fecha,
    tmc: payload?.tmc?.fecha,
    dolar: usdOverrideDate ?? payload?.dolar?.fecha,
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
    imm: DEFAULT_IMM,
    immEffectiveDate: DEFAULT_IMM_EFFECTIVE_DATE,
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
    provenance: {
      utm: {
        primarySource: "SII",
        sourceUrl: utmSourceUrl,
        status: utmProvenanceStatus,
        verifiedAt: now.toISOString(),
      },
    },
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

/**
 * Reads the previously committed snapshot JSON and carries forward prev values.
 *
 * Rules:
 * - UF / Dólar (daily): when indicatorUpdatedAt date rolls over, the old value
 *   becomes the new prev. If the date is unchanged, the existing prev is preserved.
 * - UTM (monthly): same logic but keyed on YYYY-MM, not the full date.
 *
 * This is a pure function — it never fetches anything and never throws.
 */
export function mergePrev(
  currentJson: string,
  newSnapshot: EconomicSnapshot
): EconomicSnapshot {
  let current: Partial<EconomicSnapshot>;
  try {
    current = JSON.parse(currentJson) as Partial<EconomicSnapshot>;
  } catch {
    return newSnapshot;
  }

  const carry: NonNullable<EconomicSnapshot["prev"]> = {};

  if (typeof current.uf === "number" && current.indicatorUpdatedAt?.uf) {
    if (current.indicatorUpdatedAt.uf !== newSnapshot.indicatorUpdatedAt.uf) {
      carry.uf = { valor: current.uf, fecha: current.indicatorUpdatedAt.uf };
    } else if (current.prev?.uf) {
      carry.uf = current.prev.uf;
    }
  }

  if (typeof current.utm === "number" && current.indicatorUpdatedAt?.utm) {
    const curMonth = current.indicatorUpdatedAt.utm.slice(0, 7);
    const newMonth = newSnapshot.indicatorUpdatedAt.utm.slice(0, 7);
    if (curMonth !== newMonth) {
      carry.utm = { valor: current.utm, fecha: current.indicatorUpdatedAt.utm };
    } else if (current.prev?.utm) {
      carry.utm = current.prev.utm;
    }
  }

  if (
    newSnapshot.dolar !== undefined &&
    newSnapshot.indicatorUpdatedAt.dolar &&
    typeof current.dolar === "number" &&
    current.indicatorUpdatedAt?.dolar
  ) {
    if (current.indicatorUpdatedAt.dolar !== newSnapshot.indicatorUpdatedAt.dolar) {
      carry.dolar = { valor: current.dolar, fecha: current.indicatorUpdatedAt.dolar };
    } else if (current.prev?.dolar) {
      carry.dolar = current.prev.dolar;
    }
  }

  const hasPrev =
    carry.uf !== undefined || carry.utm !== undefined || carry.dolar !== undefined;
  return hasPrev ? { ...newSnapshot, prev: carry } : newSnapshot;
}

export function serializeSnapshot(snapshot: EconomicSnapshot): string {
  return `${JSON.stringify(snapshot, null, 2)}\n`;
}

/**
 * Rechaza saltos implausibles respecto al snapshot anterior. Una UF/UTM/dólar
 * que cambia 10× (típico de un glitch de parseo upstream) supera estos umbrales
 * generosos; el movimiento real diario/mensual nunca lo hace. Si no hay valor
 * previo parseable (primera ejecución), no valida ese indicador.
 */
export function assertPlausibleDelta(
  previousJson: string,
  snapshot: EconomicSnapshot
): void {
  let prev: Partial<EconomicSnapshot>;
  try {
    prev = JSON.parse(previousJson) as Partial<EconomicSnapshot>;
  } catch {
    return; // no previous snapshot to compare against
  }

  const checks: Array<[string, number | undefined, number | undefined, number]> = [
    ["UF", prev.uf, snapshot.uf, 0.05],
    ["UTM", prev.utm, snapshot.utm, 0.2],
    ["Dolar", prev.dolar, snapshot.dolar, 0.15],
  ];

  for (const [label, before, after, maxRelChange] of checks) {
    if (
      typeof before !== "number" ||
      typeof after !== "number" ||
      before <= 0
    ) {
      continue;
    }
    const relChange = Math.abs(after - before) / before;
    if (relChange > maxRelChange) {
      throw new Error(
        `${label} deviation ${(relChange * 100).toFixed(1)}% exceeds ${(
          maxRelChange * 100
        ).toFixed(0)}% (prev=${before}, new=${after}); refusing to publish.`
      );
    }
  }
}
