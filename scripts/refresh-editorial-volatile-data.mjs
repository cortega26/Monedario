import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const REGISTRY_PATH = path.join(
  REPO_ROOT,
  "src",
  "config",
  "editorial-volatile-data-registry.json"
);
const ECONOMIC_SNAPSHOT_PATH = path.join(
  REPO_ROOT,
  "src",
  "infrastructure",
  "economic",
  "economic-parameters.snapshot.json"
);
const OUTPUT_PATH = path.join(
  REPO_ROOT,
  "src",
  "infrastructure",
  "editorial",
  "editorial-volatile-data.snapshot.json"
);
const FETCH_TIMEOUT_MS = Number(
  process.env.EDITORIAL_VOLATILE_TIMEOUT_MS ?? 15000
);

const AFP_OVERVIEW_URL =
  "https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9908.html";
const AFP_UNO_NEWS_URL =
  "https://www.spensiones.cl/portal/institucional/594/w3-article-16714.html";

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function normalizeIsoDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }
  return parsed.toISOString().slice(0, 10);
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&aacute;/gi, "á")
    .replace(/&eacute;/gi, "é")
    .replace(/&iacute;/gi, "í")
    .replace(/&oacute;/gi, "ó")
    .replace(/&uacute;/gi, "ú")
    .replace(/&ntilde;/gi, "ñ")
    .replace(/&uuml;/gi, "ü")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

function extractTitle(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? decodeHtml(stripTags(match[1])) : null;
}

function normalizeNumericString(value) {
  return String(value).replace(/\./g, "").replace(",", ".").trim();
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      "user-agent": "MonedarioBot/1.0 (+https://monedario.cl)",
    },
  });
  if (!response.ok) {
    throw new Error(`Request failed for ${url} with status ${response.status}.`);
  }
  return response.text();
}

function resolveReviewTriggerDate({ datasetId, nextValue, observedAt, previous, effectiveDate }) {
  if (previous && previous.value === nextValue && previous.reviewTriggerDate) {
    return previous.reviewTriggerDate;
  }
  if (datasetId === "pensions.afp.uno_commission" && effectiveDate) {
    return effectiveDate;
  }
  return observedAt;
}

function buildEconomicDatasets(registry, previousSnapshot) {
  const economicSnapshot = readJson(ECONOMIC_SNAPSHOT_PATH);
  const observedAt = normalizeIsoDate(economicSnapshot.lastUpdated ?? economicSnapshot.capturedAt);
  const datasets = {};

  const economicMappings = [
    ["economic.uf.value", economicSnapshot.uf],
    ["economic.utm.value", economicSnapshot.utm],
    ["economic.uta.value", economicSnapshot.uta],
    ["economic.ipc.monthly_variation", economicSnapshot.ipc],
    ["economic.afc.monthly_taxable_cap_uf", economicSnapshot.afcTopes?.monthlyTaxableCapUf],
    [
      "pensions.previsional.monthly_taxable_cap_uf",
      economicSnapshot.previsionalTopes?.pensionAndHealthMonthlyTaxableCapUf,
    ],
  ];

  for (const [datasetId, value] of economicMappings) {
    if (!Number.isFinite(value)) {
      console.warn(
        `[editorial-volatile-data] Skipping ${datasetId}: value not available in economic snapshot.`
      );
      continue;
    }
    const datasetMeta = registry.datasets[datasetId];
    if (!datasetMeta) {
      console.warn(
        `[editorial-volatile-data] Skipping ${datasetId}: no registry metadata found.`
      );
      continue;
    }
    const previous = previousSnapshot?.datasets?.[datasetId];
    datasets[datasetId] = {
      label: datasetMeta.label,
      value,
      unit: datasetMeta.unit,
      lastObservedAt: observedAt,
      reviewTriggerDate: resolveReviewTriggerDate({
        datasetId,
        nextValue: value,
        observedAt,
        previous,
      }),
      sourceUrl: datasetMeta.sourceUrls[0],
      sourceLabel: "mindicador.cl/api",
    };
  }

  return { datasets, observedAt };
}

function extractAfpUnoDataset(html, overviewHtml, registry, previousSnapshot, observedAt) {
  const title = extractTitle(html) ?? "Superintendencia de Pensiones";
  const commissionMatch = html.match(
    /nueva comisión de\s*(\d+(?:,\d+)?)%\s*se aplicará/i
  );
  const previousCommissionMatch = html.match(
    /hasta ayer.*?comisión de\s*(\d+(?:,\d+)?)%/i
  );
  const effectiveDateMatch = html.match(
    /A partir de hoy,\s*miércoles\s*1\s*de\s*octubre\s*de\s*2025/i
  );
  const overviewContributionMatch = overviewHtml.match(
    /Cotización obligatoria<\/strong>\s*del\s*10%/i
  );

  if (!commissionMatch) {
    throw new Error("Unable to extract AFP Uno commission from official source.");
  }
  if (!effectiveDateMatch) {
    throw new Error("Unable to extract AFP Uno effective date from official source.");
  }
  if (!overviewContributionMatch) {
    throw new Error("Unable to confirm mandatory AFP contribution from overview source.");
  }

  const commission = Number(normalizeNumericString(commissionMatch[1]));
  const previousCommission = previousCommissionMatch
    ? Number(normalizeNumericString(previousCommissionMatch[1]))
    : null;
  const effectiveDate = "2025-10-01";
  const previousAfpUno = previousSnapshot?.datasets?.["pensions.afp.uno_commission"];
  const previousMandatory =
    previousSnapshot?.datasets?.["pensions.afp.worker_mandatory_contribution"];

  return {
    "pensions.afp.worker_mandatory_contribution": {
      label: registry.datasets["pensions.afp.worker_mandatory_contribution"].label,
      value: 10,
      unit: "percent",
      lastObservedAt: observedAt,
      reviewTriggerDate: resolveReviewTriggerDate({
        datasetId: "pensions.afp.worker_mandatory_contribution",
        nextValue: 10,
        observedAt,
        previous: previousMandatory,
      }),
      sourceUrl: AFP_OVERVIEW_URL,
      sourceLabel: "Superintendencia de Pensiones",
    },
    "pensions.afp.uno_commission": {
      label: registry.datasets["pensions.afp.uno_commission"].label,
      value: commission,
      unit: "percent",
      lastObservedAt: observedAt,
      reviewTriggerDate: resolveReviewTriggerDate({
        datasetId: "pensions.afp.uno_commission",
        nextValue: commission,
        observedAt,
        previous: previousAfpUno,
        effectiveDate,
      }),
      effectiveDate,
      previousValue: previousCommission,
      sourceUrl: AFP_UNO_NEWS_URL,
      sourceLabel: title,
    },
  };
}

async function fetchAfpDatasetsWithFallback(registry, previousSnapshot, observedAt) {
  try {
    const [afpUnoHtml, afpOverviewHtml] = await Promise.all([
      fetchHtml(AFP_UNO_NEWS_URL),
      fetchHtml(AFP_OVERVIEW_URL),
    ]);
    return extractAfpUnoDataset(afpUnoHtml, afpOverviewHtml, registry, previousSnapshot, observedAt);
  } catch (err) {
    const previousAfpUno = previousSnapshot?.datasets?.["pensions.afp.uno_commission"];
    const previousMandatory =
      previousSnapshot?.datasets?.["pensions.afp.worker_mandatory_contribution"];
    if (previousAfpUno && previousMandatory) {
      console.warn(
        `[editorial-volatile-data] AFP source unavailable (${err.message}); retaining previous snapshot values.`
      );
      return {
        "pensions.afp.uno_commission": previousAfpUno,
        "pensions.afp.worker_mandatory_contribution": previousMandatory,
      };
    }
    throw new Error(
      `AFP data fetch/parse failed and no previous snapshot to fall back to: ${err.message}`
    );
  }
}

async function main() {
  const registry = readJson(REGISTRY_PATH);
  const previousSnapshot = (() => {
    try {
      return readJson(OUTPUT_PATH);
    } catch {
      return null;
    }
  })();

  const { datasets: economicDatasets, observedAt } = buildEconomicDatasets(
    registry,
    previousSnapshot
  );
  const pensionDatasets = await fetchAfpDatasetsWithFallback(
    registry,
    previousSnapshot,
    observedAt
  );

  const snapshot = {
    lastUpdated: observedAt,
    capturedAt: new Date().toISOString(),
    datasets: {
      ...economicDatasets,
      ...pensionDatasets,
    },
  };

  mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(
    `[editorial-volatile-data] Updated ${OUTPUT_PATH} (${snapshot.lastUpdated}).`
  );
}

main().catch(error => {
  console.error("[editorial-volatile-data] Error:", error.message);
  process.exit(1);
});
