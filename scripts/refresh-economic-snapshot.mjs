// ⚠️ SECONDARY PATH (as of 2026-05-16, ADR-20260516).
// The canonical economic snapshot refresher is the Cloudflare Worker at
// `workers/economic-snapshot-refresh/`. This script does NOT fetch IPC from
// INE — it relies only on mindicador.cl, which currently lags on IPC (Dec 2025
// stuck) and may overwrite a fresh IPC value committed by the Worker.
//
// Use this script ONLY for:
//   - Local dev / debugging the mindicador.cl pipeline.
//   - Emergency manual refresh when the Worker is unreachable AND the IPC
//     staleness is acceptable.
//
// Prefer triggering the Worker manually from Cloudflare dashboard (Workers →
// monedario-economic-snapshot-refresh → Triggers → Run now) or via:
//   curl "https://monedario-economic-snapshot-refresh.<sub>.workers.dev/__refresh?secret=<PAT>"

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
// Ingreso Mínimo Mensual — managed legal constant. Reajuste despachado a ley el
// 2026-06-16, vigente retroactivo desde 2026-05-01 ($553.553). mindicador.cl no
// entrega el IMM, por lo que se mantiene aquí. Al reajustarse el IMM, actualiza
// valor y fecha de vigencia; el test del provider valida un piso + fecha de
// revisión que obliga a re-verificar contra el Ministerio del Trabajo.
// Mirror of src/domain/economic/immConstants.ts DEFAULT_IMM (Node script cannot import the .ts leaf). Keep in sync.
const DEFAULT_IMM = 553_553;
const DEFAULT_IMM_EFFECTIVE_DATE = "2026-05-01";

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

async function fetchDecemberUtm(referenceYear) {
  const url = `https://mindicador.cl/api/utm/${referenceYear}`;
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const payload = await response.json();
    const decEntry = payload?.serie?.find(e =>
      e.fecha?.startsWith(`${referenceYear}-12`)
    );
    return decEntry ? Number(decEntry.valor) : null;
  } catch {
    return null;
  }
}

function getUtaReferenceYear() {
  const now = new Date();
  const year = now.getFullYear();
  // UTA for the current calendar year uses December of the previous year.
  // If it's still early in the year (before March), the previous year's December
  // UTM should be available, so the reference year is current - 1.
  // UTA is defined once per year, so for the entire calendar year we use year-1.
  return year - 1;
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

  // UTA = December UTM of the previous year × 12
  const utaRefYear = getUtaReferenceYear();
  const decUtm = await fetchDecemberUtm(utaRefYear);
  const uta = decUtm !== null
    ? decUtm * 12
    : utm * 12;
  if (decUtm === null) {
    console.warn(
      `[economic-snapshot] WARN: Could not fetch December ${utaRefYear} UTM from mindicador.cl. Calculated UTA from current UTM as approximation.`
    );
  }
  const ipc = Number(payload?.ipc?.valor ?? 0);
  const tmc =
    payload?.tmc?.valor !== undefined ? Number(payload.tmc.valor) : 3.49;
  const dolarRaw = payload?.dolar?.valor;
  const dolar = dolarRaw !== undefined ? Number(dolarRaw) : undefined;
  const indicatorUpdatedAt = {
    uf: payload?.uf?.fecha ? toIsoDate(payload.uf.fecha) : undefined,
    utm: payload?.utm?.fecha ? toIsoDate(payload.utm.fecha) : undefined,
    uta: decUtm !== null
      ? `${utaRefYear}-12-01`
      : payload?.utm?.fecha
        ? toIsoDate(payload.utm.fecha)
        : undefined,
    ipc: payload?.ipc?.fecha ? toIsoDate(payload.ipc.fecha) : undefined,
    tmc: payload?.tmc?.fecha ? toIsoDate(payload.tmc.fecha) : undefined,
    dolar: payload?.dolar?.fecha ? toIsoDate(payload.dolar.fecha) : undefined,
  };
  const lastUpdated = getLatestIsoDate(
    [
      payload?.fecha,
      indicatorUpdatedAt.uf,
      indicatorUpdatedAt.utm,
      indicatorUpdatedAt.uta,
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
  assertFinitePositive(uta, "UTA");

  return {
    uf,
    utm,
    uta,
    ipc,
    tmc,
    ...(dolar !== undefined && { dolar }),
    imm: DEFAULT_IMM,
    immEffectiveDate: DEFAULT_IMM_EFFECTIVE_DATE,
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
      uta: indicatorUpdatedAt.uta ?? lastUpdated,
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
