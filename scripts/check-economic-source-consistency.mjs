// check:economic-source-consistency
//
// Guardrail for TD-0087. Validates that the canonical (primary) source of each
// economic indicator stays aligned with ADR-20260516
// (docs/adr/ADR-20260516-economic-snapshot-cloudflare-worker.md): the official
// issuer is primary and mindicador.cl is only a fallback/mirror.
//
// It cross-checks four layers:
//   1. Registry  — src/config/editorial-volatile-data-registry.json
//   2. Snapshot  — src/infrastructure/editorial/editorial-volatile-data.snapshot.json
//   3. ADR map   — the expected issuer per indicator (encoded below)
//   4. Worker    — workers/economic-snapshot-refresh wires the official overrides
//
// Exit 0 on success, exit 1 on any inconsistency.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(
  process.env.ECONOMIC_SOURCE_ROOT || path.resolve(__dirname, "..")
);

const REGISTRY_PATH = path.join(
  REPO_ROOT,
  "src/config/editorial-volatile-data-registry.json"
);
const SNAPSHOT_PATH = path.join(
  REPO_ROOT,
  "src/infrastructure/editorial/editorial-volatile-data.snapshot.json"
);
const WORKER_INDEX_PATH = path.join(
  REPO_ROOT,
  "workers/economic-snapshot-refresh/src/index.ts"
);
const WORKER_BCCH_PATH = path.join(
  REPO_ROOT,
  "workers/economic-snapshot-refresh/src/sources/bcchSiete.ts"
);

const MINDICADOR_LABEL = "mindicador.cl";

// Expected canonical issuer per economic dataset, derived from the ADR source map.
// `mindicadorFallback` asserts mindicador.cl must appear as a fallback (and never
// as the canonical source) for indicators the Worker mirrors from mindicador.cl.
const EXPECTED = {
  "economic.uf.value": { issuer: "Banco Central de Chile", mindicadorFallback: true },
  "economic.utm.value": {
    issuer: "Servicio de Impuestos Internos (SII)",
    mindicadorFallback: true,
  },
  "economic.uta.value": {
    issuer: "Servicio de Impuestos Internos (SII)",
    mindicadorFallback: true,
  },
  "economic.ipc.monthly_variation": {
    issuer: "Instituto Nacional de Estadísticas (INE)",
    mindicadorFallback: true,
  },
  "economic.afc.monthly_taxable_cap_uf": {
    issuer: "Superintendencia de Pensiones",
    mindicadorFallback: false,
  },
  "pensions.previsional.monthly_taxable_cap_uf": {
    issuer: "Superintendencia de Pensiones",
    mindicadorFallback: false,
  },
};

// Worker wiring that must remain present so official sourcing is not silently dropped.
const WORKER_REQUIRED = {
  [WORKER_BCCH_PATH]: ["BCCH_SERIES", "F073.UFF.PRE.Z.D", "F073.TCO.PRE.Z.D"],
  [WORKER_INDEX_PATH]: [
    "fetchUfOverride",
    "fetchUsdOverride",
    "fetchIpcOverride",
    "createIneIpcFetcher",
  ],
};

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function isMindicador(label, url) {
  return (
    (label && label.toLowerCase().includes("mindicador")) ||
    (url && url.toLowerCase().includes("mindicador.cl"))
  );
}

function main() {
  const errors = [];
  const registry = readJson(REGISTRY_PATH);
  const snapshot = readJson(SNAPSHOT_PATH);

  for (const [datasetId, expected] of Object.entries(EXPECTED)) {
    const meta = registry.datasets?.[datasetId];
    if (!meta) {
      errors.push(`Registry: dataset "${datasetId}" missing.`);
      continue;
    }
    const canonical = meta.canonicalSource;
    if (!canonical || !canonical.label || !canonical.url) {
      errors.push(
        `Registry: dataset "${datasetId}" must declare a canonicalSource with label and url.`
      );
      continue;
    }

    // 1. Canonical issuer matches the ADR map.
    if (canonical.label !== expected.issuer) {
      errors.push(
        `Registry: "${datasetId}" canonical source is "${canonical.label}", expected "${expected.issuer}" (ADR-20260516).`
      );
    }

    // 2. Canonical source must never be mindicador.cl.
    if (isMindicador(canonical.label, canonical.url)) {
      errors.push(
        `Registry: "${datasetId}" uses mindicador.cl as the canonical source; it must be a fallback only.`
      );
    }

    // 3. mindicador.cl present as a fallback where the Worker mirrors it.
    const fallbacks = Array.isArray(meta.fallbackSources) ? meta.fallbackSources : [];
    const hasMindicadorFallback = fallbacks.some(s => isMindicador(s.label, s.url));
    if (expected.mindicadorFallback && !hasMindicadorFallback) {
      errors.push(
        `Registry: "${datasetId}" should list ${MINDICADOR_LABEL} in fallbackSources.`
      );
    }

    // 4. Emitted snapshot attribution matches the registry canonical source.
    const emitted = snapshot.datasets?.[datasetId];
    if (!emitted) {
      errors.push(`Snapshot: dataset "${datasetId}" missing — run editorial:volatile-data:refresh.`);
      continue;
    }
    if (emitted.sourceLabel !== canonical.label) {
      errors.push(
        `Snapshot: "${datasetId}" sourceLabel is "${emitted.sourceLabel}", expected canonical "${canonical.label}".`
      );
    }
    if (emitted.sourceUrl !== canonical.url) {
      errors.push(
        `Snapshot: "${datasetId}" sourceUrl is "${emitted.sourceUrl}", expected "${canonical.url}".`
      );
    }
    if (isMindicador(emitted.sourceLabel, emitted.sourceUrl)) {
      errors.push(
        `Snapshot: "${datasetId}" still attributes the value to mindicador.cl.`
      );
    }
  }

  // 5. Worker still wires the official overrides.
  for (const [filePath, needles] of Object.entries(WORKER_REQUIRED)) {
    let source;
    try {
      source = readFileSync(filePath, "utf8");
    } catch {
      errors.push(`Worker: cannot read ${path.relative(REPO_ROOT, filePath)}.`);
      continue;
    }
    for (const needle of needles) {
      if (!source.includes(needle)) {
        errors.push(
          `Worker: ${path.relative(REPO_ROOT, filePath)} no longer references "${needle}"; official sourcing may be dropped.`
        );
      }
    }
  }

  if (errors.length > 0) {
    console.error(`[check-economic-source-consistency] FAIL: ${errors.length} issue(s)`);
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log(
    `[check-economic-source-consistency] OK: ${Object.keys(EXPECTED).length} indicators aligned with ADR-20260516 (official issuer primary, mindicador.cl fallback).`
  );
}

main();
