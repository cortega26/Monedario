import { writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_PATH = resolve(
  __dirname,
  "../src/infrastructure/economic/economic-parameters.snapshot.json"
);
const ECONOMIC_API_URL = "https://mindicador.cl/api";
const FETCH_TIMEOUT_MS = Number(process.env.ECONOMIC_SNAPSHOT_TIMEOUT_MS ?? 12000);
const DEFAULT_AFC_MONTHLY_TAXABLE_CAP_UF = 135.2;
const DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF = 90;

function toIsoDate(value) {
  if (typeof value === "string" && value.length >= 10) {
    return value.slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

function getLatestIsoDate(values, fallback) {
  return values
    .map(value => (value ? toIsoDate(value) : undefined))
    .filter(Boolean)
    .sort()
    .at(-1) ?? fallback;
}

function assertFinitePositive(value, label) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a finite number greater than 0.`);
  }
}

async function fetchLiveParameters() {
  const response = await fetch(ECONOMIC_API_URL, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(
      `mindicador.cl request failed with status ${response.status}.`
    );
  }

  const payload = await response.json();
  const uf = Number(payload?.uf?.valor);
  const utm = Number(payload?.utm?.valor);
  const ipc = Number(payload?.ipc?.valor ?? 0);
  const tmc =
    payload?.tmc?.valor !== undefined ? Number(payload.tmc.valor) : 3.49;
  const dolarRaw = payload?.dolar?.valor;
  const dolar = dolarRaw !== undefined ? Number(dolarRaw) : undefined;
  const indicatorUpdatedAt = {
    uf: payload?.uf?.fecha ? toIsoDate(payload.uf.fecha) : undefined,
    utm: payload?.utm?.fecha ? toIsoDate(payload.utm.fecha) : undefined,
    ipc: payload?.ipc?.fecha ? toIsoDate(payload.ipc.fecha) : undefined,
    tmc: payload?.tmc?.fecha ? toIsoDate(payload.tmc.fecha) : undefined,
    dolar: payload?.dolar?.fecha ? toIsoDate(payload.dolar.fecha) : undefined,
  };
  const lastUpdated = getLatestIsoDate(
    [
      payload?.fecha,
      indicatorUpdatedAt.uf,
      indicatorUpdatedAt.utm,
      indicatorUpdatedAt.ipc,
      indicatorUpdatedAt.tmc,
      indicatorUpdatedAt.dolar,
    ],
    toIsoDate(undefined)
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

  return {
    uf,
    utm,
    ipc,
    tmc,
    ...(dolar !== undefined && { dolar }),
    afcTopes: {
      monthlyTaxableCapUf: DEFAULT_AFC_MONTHLY_TAXABLE_CAP_UF,
    },
    previsionalTopes: {
      pensionAndHealthMonthlyTaxableCapUf:
        DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF,
    },
    indicatorUpdatedAt: {
      uf: indicatorUpdatedAt.uf ?? lastUpdated,
      utm: indicatorUpdatedAt.utm ?? lastUpdated,
      ...(indicatorUpdatedAt.ipc ? { ipc: indicatorUpdatedAt.ipc } : {}),
      ...(indicatorUpdatedAt.tmc ? { tmc: indicatorUpdatedAt.tmc } : {}),
      ...(dolar !== undefined
        ? { dolar: indicatorUpdatedAt.dolar ?? lastUpdated }
        : {}),
    },
    lastUpdated,
    capturedAt: new Date().toISOString(),
    source: "mindicador.cl/api",
  };
}

async function main() {
  const snapshot = await fetchLiveParameters();
  writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(
    `[economic-snapshot] Updated ${SNAPSHOT_PATH} (${snapshot.lastUpdated}).`
  );
}

main().catch(error => {
  console.error("[economic-snapshot] Error:", error.message);
  process.exit(1);
});
