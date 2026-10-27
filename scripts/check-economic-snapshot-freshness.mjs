// check:economic-snapshot-freshness
//
// Fails (exit 1) when the committed economic snapshot has gone stale, which
// signals the refresh Worker has silently stopped committing. Wired into the
// DAILY SCHEDULED CI (not the PR gate) so worker death surfaces within ~24h.
//
// Roots/clock are env-overridable for tests:
//   ECONOMIC_SNAPSHOT_ROOT  — repo root override (default: repo root)
//   ECONOMIC_SNAPSHOT_NOW   — ISO datetime "now" override (default: new Date())
//
// Exit 0 = fresh, exit 1 = stale or unreadable.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(
  process.env.ECONOMIC_SNAPSHOT_ROOT || path.resolve(__dirname, "..")
);
const SNAPSHOT_PATH = path.join(
  REPO_ROOT,
  "src/infrastructure/economic/economic-parameters.snapshot.json"
);
const IPC_SERIES_PATH = path.join(
  REPO_ROOT,
  "src/data/economic-history/ipc-historico.json"
);
const UF_SERIES_PATH = path.join(
  REPO_ROOT,
  "src/data/economic-history/uf-historico.json"
);
// La UF se publica con días de anticipación y la serie se refresca manualmente;
// se tolera un rezago acotado para detectar solo series abandonadas.
const UF_SERIES_MAX_LAG_DAYS = 14;

// ADR-20261026: heartbeat de la ingesta de la serie UF. `actualizadoEl` es la
// fecha (UTC) en que el ingestor escribió el archivo; si deja de avanzar, el
// workflow semanal está caído o deshabilitado. Sin este control el fallo solo
// se ve cuando el snapshot adelanta ~28 días a la serie (14 de anticipación de
// la UF + 14 de umbral), demasiado tarde.
const UF_INGEST_MAX_AGE_DAYS = 10;
// Holgura de 1 día: `actualizadoEl` se escribe con `toISOString()` (UTC), así
// que entre 21:00 y 24:00 de Santiago la fecha UTC ya es la del día siguiente.
const UF_INGEST_TZ_SLACK_DAYS = 1;

// Generous thresholds (days). The point is to catch a DEAD pipeline, not to
// chase every publication lag. UF/dólar are ~daily; UTM is monthly.
const CAPTURE_MAX_DAYS = 7; // critical pipeline: surface failure within one week
const INDICATOR_MAX_DAYS = {
  uf: 10,
  dolar: 10,
};
const UTM_MONTH_BOUNDARY_GRACE_DAYS = 7;

function now() {
  const override = process.env.ECONOMIC_SNAPSHOT_NOW;
  const d = override ? new Date(override) : new Date();
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid ECONOMIC_SNAPSHOT_NOW: ${override}`);
  }
  return d;
}

function ageInDays(isoOrDate, ref) {
  const then = new Date(isoOrDate);
  if (Number.isNaN(then.getTime())) return null;
  return (ref.getTime() - then.getTime()) / 86_400_000;
}

// Chile vive 3-4h detrás de UTC: el mes/día de la gracia UTM se resuelve con el
// calendario local (Intl + America/Santiago), nunca con getUTC*().
function chileMonthKeyAndDay(ref) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(ref);
  const get = (type) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");
  return {
    monthKey: `${String(get("year")).padStart(4, "0")}-${String(get("month")).padStart(2, "0")}`,
    day: get("day"),
  };
}

function main() {
  let snapshot;
  try {
    snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8"));
  } catch (err) {
    console.error(
      `[check-economic-snapshot-freshness] FAIL: cannot read/parse ${SNAPSHOT_PATH}: ${err.message}`
    );
    process.exit(1);
  }

  const ref = now();
  const errors = [];

  const captureAge = ageInDays(snapshot.capturedAt, ref);
  if (captureAge === null) {
    errors.push(`capturedAt missing or unparseable: ${snapshot.capturedAt}`);
  } else if (captureAge > CAPTURE_MAX_DAYS) {
    errors.push(
      `capturedAt is ${captureAge.toFixed(1)}d old (max ${CAPTURE_MAX_DAYS}d) — refresh Worker may have stopped. capturedAt=${snapshot.capturedAt}`
    );
  }

  for (const [indicator, maxDays] of Object.entries(INDICATOR_MAX_DAYS)) {
    const date = snapshot.indicatorUpdatedAt?.[indicator];
    const age = date ? ageInDays(date, ref) : null;
    if (age === null) {
      errors.push(`indicatorUpdatedAt.${indicator} missing or unparseable: ${date}`);
    } else if (age > maxDays) {
      errors.push(
        `${indicator} last updated ${age.toFixed(1)}d ago (max ${maxDays}d). date=${date}`
      );
    }
  }

  const utmDate = snapshot.indicatorUpdatedAt?.utm;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(utmDate ?? ""))) {
    errors.push(`indicatorUpdatedAt.utm missing or unparseable: ${utmDate}`);
  } else {
    const { monthKey: currentMonth, day: currentDay } = chileMonthKeyAndDay(ref);
    const utmMonth = utmDate.slice(0, 7);
    if (utmMonth > currentMonth) {
      errors.push(`utm has a future reference month: ${utmDate}`);
    } else if (
      utmMonth !== currentMonth &&
      currentDay > UTM_MONTH_BOUNDARY_GRACE_DAYS
    ) {
      errors.push(
        `utm reference month ${utmMonth} is stale after the ${UTM_MONTH_BOUNDARY_GRACE_DAYS}d month-boundary grace; expected ${currentMonth}`
      );
    }
  }

  // Re-auditoría 2026-09-29 (obs. 2) + ADR-20261026: la serie UF ingerida no
  // puede quedar abandonada respecto de la UF del snapshot. Desde ADR-20261026
  // la comparación se ancla a la última entrada real de `serie` (igual que la
  // rama IPC): un `hastaFecha` adelantado ya no puede enmascarar un rezago.
  let ufSeries = null;
  try {
    ufSeries = JSON.parse(readFileSync(UF_SERIES_PATH, "utf8"));
  } catch (err) {
    if (err.code !== "ENOENT") {
      errors.push(`no se pudo leer uf-historico.json: ${err.message}`);
    }
  }

  if (ufSeries) {
    const entries = Array.isArray(ufSeries.serie) ? ufSeries.serie : [];
    const lastEntryDate = String(entries.at(-1)?.fecha ?? "");
    const metadataDate = String(ufSeries.hastaFecha ?? "");
    let lastDate;
    if (entries.length > 0) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(lastEntryDate)) {
        lastDate = lastEntryDate;
      } else {
        errors.push(
          `uf-historico.json con última entrada inválida: ${lastEntryDate || "(vacía)"}`
        );
      }
    } else {
      lastDate = metadataDate;
    }

    if (lastDate !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(lastDate)) {
      errors.push(
        `uf-historico.json sin última fecha válida: serie=${lastEntryDate || "(vacía)"} hastaFecha=${metadataDate || "(vacía)"}`
      );
    }

    // Heartbeat: la ingesta semanal debe haber escrito el archivo hace poco,
    // aunque la serie siga "adelantada" respecto del snapshot.
    const actualizadoEl = String(ufSeries.actualizadoEl ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(actualizadoEl)) {
      errors.push(
        `uf-historico.json sin actualizadoEl válido: ${ufSeries.actualizadoEl}`
      );
    } else {
      const ingestAge =
        (ref.getTime() - new Date(`${actualizadoEl}T00:00:00Z`).getTime()) /
        86_400_000;
      if (ingestAge > UF_INGEST_MAX_AGE_DAYS + UF_INGEST_TZ_SLACK_DAYS) {
        errors.push(
          `uf-historico.json actualizadoEl=${actualizadoEl} (${ingestAge.toFixed(1)}d, max ${UF_INGEST_MAX_AGE_DAYS}d + ${UF_INGEST_TZ_SLACK_DAYS}d) — la ingesta semanal parece caída; revisa refresh-uf-history.yml`
        );
      }
    }

    const snapshotUfDate = String(snapshot.indicatorUpdatedAt?.uf ?? "");
    if (/^\d{4}-\d{2}-\d{2}$/.test(snapshotUfDate) && lastDate !== undefined) {
      const lagDays =
        (new Date(snapshotUfDate).getTime() - new Date(lastDate).getTime()) /
        86_400_000;
      if (lagDays > UF_SERIES_MAX_LAG_DAYS) {
        errors.push(
          `uf-historico.json llega a ${lastDate} (rezago ${lagDays.toFixed(1)}d vs snapshot ${snapshotUfDate}) — corre \`pnpm run fetch:economic-history --solo=uf\``
        );
      }
    }
  }

  // TD-0112: la serie IPC ingerida no puede ir detrás del último período
  // publicado en el snapshot (la extensión oficial se ingiere vía BCCh).
  // La última fecha real de `serie` manda; `hastaFecha` solo es fallback para
  // archivos antiguos/vacíos. Así un metadato adelantado no puede enmascarar
  // una serie que en los hechos sigue atrás.
  const snapshotIpcPeriod = String(snapshot.indicatorUpdatedAt?.ipc ?? "").slice(
    0,
    7
  );
  if (/^\d{4}-\d{2}$/.test(snapshotIpcPeriod)) {
    try {
      const series = JSON.parse(readFileSync(IPC_SERIES_PATH, "utf8"));
      const entries = Array.isArray(series.serie) ? series.serie : [];
      const lastEntryDate = String(entries.at(-1)?.fecha ?? "");
      const metadataDate = String(series.hastaFecha ?? "");
      let lastPeriod;
      if (entries.length > 0) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(lastEntryDate)) {
          lastPeriod = lastEntryDate.slice(0, 7);
        } else {
          errors.push(
            `ipc-historico.json con última entrada inválida: ${lastEntryDate || "(vacía)"}`
          );
        }
      } else {
        lastPeriod = metadataDate.slice(0, 7);
      }
      if (lastPeriod !== undefined && !/^\d{4}-\d{2}$/.test(lastPeriod)) {
        errors.push(
          `ipc-historico.json sin última fecha válida: serie=${lastEntryDate || "(vacía)"} hastaFecha=${metadataDate || "(vacía)"}`
        );
      } else if (lastPeriod !== undefined && lastPeriod < snapshotIpcPeriod) {
        errors.push(
          `ipc-historico.json llega a ${lastPeriod} pero el snapshot publica ${snapshotIpcPeriod} — corre \`pnpm run fetch:economic-history --solo=ipc\``
        );
      }
    } catch (err) {
      if (err.code !== "ENOENT") {
        errors.push(`no se pudo leer ipc-historico.json: ${err.message}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error(
      `[check-economic-snapshot-freshness] FAIL: ${errors.length} stale signal(s):`
    );
    for (const e of errors) console.error(`  - ${e}`);
    console.error(
      "Reproduce: run `pnpm run economic:snapshot:refresh` and confirm the Worker (refresh-economic-snapshot.yml) is green."
    );
    process.exit(1);
  }

  console.log(
    `[check-economic-snapshot-freshness] OK. capturedAt ${captureAge.toFixed(1)}d old; uf/dólar within daily thresholds, UTM within the monthly 7d gate and IPC series aligned with the snapshot.`
  );
}

main();
