import {
  assertEconomicParameters,
  type EconomicIndicatorUpdatedAt,
  type EconomicParameters,
} from "@/domain/economic/EconomicParameters";
import { existsSync, readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

type MindicadorResponse = {
  fecha?: string;
  uf?: { valor?: number; fecha?: string };
  utm?: { valor?: number; fecha?: string };
  uta?: { valor?: number; fecha?: string };
  ipc?: { valor?: number; fecha?: string };
  tmc?: { valor?: number; fecha?: string };
  dolar?: { valor?: number; fecha?: string };
};

interface EconomicSnapshotPayload {
  uf: number;
  utm: number;
  uta?: number;
  ipc?: number;
  tmc?: number;
  dolar?: number;
  afcTopes?: {
    monthlyTaxableCapUf?: number;
  };
  previsionalTopes?: {
    pensionAndHealthMonthlyTaxableCapUf?: number;
  };
  indicatorUpdatedAt?: EconomicIndicatorUpdatedAt;
  lastUpdated: string;
}

type EconomicProviderMode = "snapshot" | "live";

export type EconomicTelemetryFlag =
  | "economic_parameters_live"
  | "economic_parameters_snapshot"
  | "economic_parameters_fallback";

export interface EconomicParameterBundle {
  parameters: EconomicParameters;
  telemetryFlag: EconomicTelemetryFlag;
  fallbackReason?: string;
}

export interface EconomicProviderTelemetry {
  externalFetchCount: number;
  cacheHitCount: number;
  lastSource?: EconomicParameters["source"];
  lastFallbackReason?: string;
}

const DEFAULT_AFC_MONTHLY_TAXABLE_CAP_UF = 135.2;
const DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF = 90;
const FALLBACK_LAST_UPDATED = new Date().toISOString().slice(0, 10);
const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_FILE_NAME = "economic-parameters.snapshot.json";
const ECONOMIC_PROVIDER_MODE_ENV = "TPI_ECONOMIC_PROVIDER_MODE";
const ECONOMIC_API_URL = "https://mindicador.cl/api";
const FETCH_TIMEOUT_MS = 5000;

const FALLBACK_PARAMETERS: EconomicParameters = {
  uf: 39300,
  utm: 67294,
  uta: 834504,
  ipc: 0,
  tmc: 3.49,
  afcTopes: {
    monthlyTaxableCapUf: DEFAULT_AFC_MONTHLY_TAXABLE_CAP_UF,
  },
  previsionalTopes: {
    pensionAndHealthMonthlyTaxableCapUf:
      DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF,
  },
  indicatorUpdatedAt: {
    uf: FALLBACK_LAST_UPDATED,
    utm: FALLBACK_LAST_UPDATED,
  },
  lastUpdated: FALLBACK_LAST_UPDATED,
  source: "fallback",
};

let cachedBundlePromise: Promise<EconomicParameterBundle> | undefined;
const telemetryState: EconomicProviderTelemetry = {
  externalFetchCount: 0,
  cacheHitCount: 0,
};

function syncDevTelemetry(): void {
  if (!import.meta.env.DEV) return;
  (
    globalThis as typeof globalThis & {
      __TPI_ECONOMIC_PROVIDER_TELEMETRY__?: EconomicProviderTelemetry;
    }
  ).__TPI_ECONOMIC_PROVIDER_TELEMETRY__ = getEconomicProviderTelemetry();
}

function toIsoDate(value: string | undefined): string {
  if (value && value.length >= 10) {
    return value.slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

function getLatestIsoDate(
  values: Array<string | undefined>,
  fallback: string
): string {
  return (
    values
      .map(value => (value ? toIsoDate(value) : undefined))
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? fallback
  );
}

function normalizeIndicatorUpdatedAt(
  indicatorUpdatedAt: EconomicIndicatorUpdatedAt | undefined,
  lastUpdated: string,
  hasDolar: boolean,
  hasUta: boolean
): EconomicIndicatorUpdatedAt {
  return {
    uf: indicatorUpdatedAt?.uf ?? lastUpdated,
    utm: indicatorUpdatedAt?.utm ?? lastUpdated,
    ipc: indicatorUpdatedAt?.ipc,
    tmc: indicatorUpdatedAt?.tmc,
    ...(hasDolar
      ? {
          dolar: indicatorUpdatedAt?.dolar ?? lastUpdated,
        }
      : {}),
    ...(hasUta
      ? {
          uta: indicatorUpdatedAt?.uta ?? lastUpdated,
        }
      : {}),
  };
}

function normalizeReason(reason: unknown): string {
  return reason instanceof Error ? reason.message : "Unknown provider error.";
}

function resolveEconomicProviderMode(): EconomicProviderMode {
  return process.env[ECONOMIC_PROVIDER_MODE_ENV] === "live"
    ? "live"
    : "snapshot";
}

function resolveSnapshotFilePath(): string {
  const cwdCandidate = resolve(
    process.cwd(),
    "src",
    "infrastructure",
    "economic",
    SNAPSHOT_FILE_NAME
  );
  if (existsSync(cwdCandidate)) return cwdCandidate;

  return resolve(MODULE_DIR, SNAPSHOT_FILE_NAME);
}

function loadSnapshotEconomicParameters(): EconomicParameters {
  const snapshotPath = resolveSnapshotFilePath();

  // Validate that the resolved path is indeed our expected snapshot file
  if (!snapshotPath.endsWith(SNAPSHOT_FILE_NAME)) {
    throw new Error(`Security breach: invalid snapshot path ${snapshotPath}`);
  }

  const payload = JSON.parse(
    readFileSync(snapshotPath, "utf-8")
  ) as EconomicSnapshotPayload;

  const snapshotParameters: EconomicParameters = {
    uf: Number(payload.uf),
    utm: Number(payload.utm),
    ipc: Number(payload.ipc ?? 0),
    tmc: payload.tmc !== undefined ? Number(payload.tmc) : 3.49,
    dolar: payload.dolar !== undefined ? Number(payload.dolar) : undefined,
    uta: payload.uta !== undefined ? Number(payload.uta) : undefined,
    afcTopes: {
      monthlyTaxableCapUf: Number(
        payload.afcTopes?.monthlyTaxableCapUf ??
          DEFAULT_AFC_MONTHLY_TAXABLE_CAP_UF
      ),
    },
    previsionalTopes: {
      pensionAndHealthMonthlyTaxableCapUf: Number(
        payload.previsionalTopes?.pensionAndHealthMonthlyTaxableCapUf ??
          DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF
      ),
    },
    indicatorUpdatedAt: normalizeIndicatorUpdatedAt(
      payload.indicatorUpdatedAt,
      String(payload.lastUpdated),
      payload.dolar !== undefined,
      payload.uta !== undefined
    ),
    lastUpdated: String(payload.lastUpdated),
    source: "snapshot",
  };

  return assertEconomicParameters(snapshotParameters);
}

async function fetchLiveEconomicParameters(): Promise<EconomicParameters> {
  const response = await fetch(ECONOMIC_API_URL, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(
      `mindicador.cl request failed with status ${response.status}.`
    );
  }

  const payload = (await response.json()) as MindicadorResponse;
  const indicatorUpdatedAt: EconomicIndicatorUpdatedAt = {
    uf: payload.uf?.fecha ? toIsoDate(payload.uf.fecha) : undefined,
    utm: payload.utm?.fecha ? toIsoDate(payload.utm.fecha) : undefined,
    uta: payload.uta?.fecha ? toIsoDate(payload.uta.fecha) : undefined,
    ipc: payload.ipc?.fecha ? toIsoDate(payload.ipc.fecha) : undefined,
    tmc: payload.tmc?.fecha ? toIsoDate(payload.tmc.fecha) : undefined,
    dolar: payload.dolar?.fecha ? toIsoDate(payload.dolar.fecha) : undefined,
  };
  const lastUpdated = getLatestIsoDate(
    [
      payload.fecha,
      indicatorUpdatedAt.uf,
      indicatorUpdatedAt.utm,
      indicatorUpdatedAt.uta,
      indicatorUpdatedAt.ipc,
      indicatorUpdatedAt.tmc,
      indicatorUpdatedAt.dolar,
    ],
    FALLBACK_LAST_UPDATED
  );
  const liveParameters: EconomicParameters = {
    uf: Number(payload.uf?.valor),
    utm: Number(payload.utm?.valor),
    ipc: Number(payload.ipc?.valor ?? 0),
    tmc: payload.tmc?.valor !== undefined ? Number(payload.tmc.valor) : 3.49,
    dolar:
      payload.dolar?.valor !== undefined
        ? Number(payload.dolar.valor)
        : undefined,
    uta:
      payload.uta?.valor !== undefined ? Number(payload.uta.valor) : undefined,
    afcTopes: {
      monthlyTaxableCapUf: DEFAULT_AFC_MONTHLY_TAXABLE_CAP_UF,
    },
    previsionalTopes: {
      pensionAndHealthMonthlyTaxableCapUf:
        DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF,
    },
    indicatorUpdatedAt: normalizeIndicatorUpdatedAt(
      indicatorUpdatedAt,
      lastUpdated,
      payload.dolar?.valor !== undefined,
      payload.uta?.valor !== undefined
    ),
    lastUpdated,
    source: "live",
  };

  return assertEconomicParameters(liveParameters);
}

function buildSnapshotBundle(reason?: unknown): EconomicParameterBundle {
  const bundle: EconomicParameterBundle = {
    parameters: loadSnapshotEconomicParameters(),
    telemetryFlag: "economic_parameters_snapshot",
  };

  if (reason) {
    bundle.fallbackReason = normalizeReason(reason);
  }

  return bundle;
}

function buildFallbackBundle(reason: unknown): EconomicParameterBundle {
  return {
    parameters: assertEconomicParameters(FALLBACK_PARAMETERS),
    telemetryFlag: "economic_parameters_fallback",
    fallbackReason: normalizeReason(reason),
  };
}

function storeTelemetry(bundle: EconomicParameterBundle): void {
  telemetryState.lastSource = bundle.parameters.source;
  telemetryState.lastFallbackReason = bundle.fallbackReason;
  syncDevTelemetry();
}

async function loadEconomicParameterBundle(): Promise<EconomicParameterBundle> {
  if (resolveEconomicProviderMode() === "snapshot") {
    try {
      const bundle = buildSnapshotBundle();
      storeTelemetry(bundle);
      return bundle;
    } catch (snapshotError) {
      const bundle = buildFallbackBundle(snapshotError);
      storeTelemetry(bundle);
      return bundle;
    }
  }

  try {
    telemetryState.externalFetchCount += 1;
    const parameters = await fetchLiveEconomicParameters();
    const bundle: EconomicParameterBundle = {
      parameters,
      telemetryFlag: "economic_parameters_live",
    };
    storeTelemetry(bundle);
    return bundle;
  } catch (liveError) {
    try {
      const bundle = buildSnapshotBundle(
        new Error(`Live fetch failed: ${normalizeReason(liveError)}`)
      );
      storeTelemetry(bundle);
      return bundle;
    } catch (snapshotError) {
      const bundle = buildFallbackBundle(
        new Error(
          `Live fetch failed: ${normalizeReason(liveError)} | Snapshot failed: ${normalizeReason(snapshotError)}`
        )
      );
      storeTelemetry(bundle);
      return bundle;
    }
  }
}

export async function getEconomicParameterBundle(): Promise<EconomicParameterBundle> {
  if (cachedBundlePromise) {
    telemetryState.cacheHitCount += 1;
    syncDevTelemetry();
    return cachedBundlePromise;
  }

  cachedBundlePromise = loadEconomicParameterBundle();
  return cachedBundlePromise;
}

export function getEconomicProviderTelemetry(): EconomicProviderTelemetry {
  return {
    ...telemetryState,
  };
}

export function __resetEconomicParameterProviderForTests(): void {
  cachedBundlePromise = undefined;
  telemetryState.externalFetchCount = 0;
  telemetryState.cacheHitCount = 0;
  telemetryState.lastSource = undefined;
  telemetryState.lastFallbackReason = undefined;
  syncDevTelemetry();
}

export function __getEconomicSnapshotFilePathForTests(): string {
  return resolveSnapshotFilePath();
}
