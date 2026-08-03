import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as internalSafeLoad, JSON_SCHEMA } from "js-yaml";
import {
  loadEditorialTimelinessPolicy,
  resolveEditorialTimelinessPolicy,
} from "./lib/editorial-timeliness-policy.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(
  process.env.EDITORIAL_TIMELINESS_ROOT || DEFAULT_REPO_ROOT
);
const BLOG_DIR = path.join(REPO_ROOT, "src", "data", "blog");
const POLICY_PATH = path.join(
  REPO_ROOT,
  "src",
  "config",
  "editorial-timeliness-policy.json"
);
const ECONOMIC_SNAPSHOT_PATH = path.join(
  REPO_ROOT,
  "src",
  "infrastructure",
  "economic",
  "economic-parameters.snapshot.json"
);
const VOLATILE_REGISTRY_PATH = path.join(
  REPO_ROOT,
  "src",
  "config",
  "editorial-volatile-data-registry.json"
);
const VOLATILE_SNAPSHOT_PATH = path.join(
  REPO_ROOT,
  "src",
  "infrastructure",
  "editorial",
  "editorial-volatile-data.snapshot.json"
);
const REPORT_PATH = path.join(
  REPO_ROOT,
  "output",
  "validation",
  "editorial-timeliness",
  "report.json"
);
const TODAY = normalizeDateInput(
  process.env.EDITORIAL_TIMELINESS_TODAY || new Date().toISOString()
);
const VOLATILE_SYNC_MODES = new Set(["reference", "strict"]);

function normalizeDateInput(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date input: ${value}`);
  }
  parsed.setUTCHours(0, 0, 0, 0);
  return parsed;
}

function formatIsoDate(value) {
  return value.toISOString().slice(0, 10);
}

function diffInDays(fromDate, toDate) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((toDate.getTime() - fromDate.getTime()) / msPerDay);
}

function extractFrontmatter(filePath) {
  const source = readFileSync(filePath, "utf8");
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  return match ? match[1] : null;
}

function listContentFiles(dirPath) {
  const result = [];
  const entries = readdirSync(dirPath, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      result.push(...listContentFiles(absolutePath));
      continue;
    }
    if (!/\.(md|mdx)$/i.test(entry.name)) continue;
    result.push(absolutePath);
  }

  return result;
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function loadVolatileRegistry() {
  const registry = readJson(VOLATILE_REGISTRY_PATH);
  if (!registry.datasets || typeof registry.datasets !== "object") {
    throw new Error("editorial volatile registry requires a datasets object.");
  }
  return registry;
}

function loadVolatileSnapshot() {
  try {
    return readJson(VOLATILE_SNAPSHOT_PATH);
  } catch {
    return { lastUpdated: null, datasets: {} };
  }
}

function parseFrontmatter(filePath) {
  const block = extractFrontmatter(filePath);
  if (!block) {
    throw new Error(`Missing frontmatter block in ${filePath}`);
  }
  try {
    const parsed = internalSafeLoad(block, { schema: JSON_SCHEMA }) || {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (err) {
    throw new Error(`Failed to parse frontmatter in ${filePath}: ${err.message}`);
  }
}

function parseOptionalDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setUTCHours(0, 0, 0, 0);
  return parsed;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function loadEconomicSnapshotDate() {
  try {
    const payload = readJson(ECONOMIC_SNAPSHOT_PATH);
    return typeof payload.lastUpdated === "string" ? payload.lastUpdated : null;
  } catch {
    return null;
  }
}

function normalizeExpectedValue(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    const numeric = Number(trimmed.replace(/\./g, "").replace(",", "."));
    return Number.isNaN(numeric) ? trimmed : numeric;
  }
  return null;
}

function valuesMatch(expectedValue, snapshotValue) {
  const normalizedExpected = normalizeExpectedValue(expectedValue);
  if (typeof normalizedExpected === "number" && typeof snapshotValue === "number") {
    return Math.abs(normalizedExpected - snapshotValue) < 1e-9;
  }
  return String(normalizedExpected) === String(snapshotValue);
}

function normalizeVolatileEntries(frontmatter) {
  if (!Array.isArray(frontmatter.volatileData)) {
    return [];
  }
  return frontmatter.volatileData
    .filter(entry => entry && typeof entry === "object")
    .map(entry => ({
      id: typeof entry.id === "string" ? entry.id.trim() : "",
      sync: typeof entry.sync === "string" ? entry.sync.trim() : "",
      expectedValue: entry.expectedValue,
    }));
}

function buildRecord(filePath, frontmatter, policy, volatileRegistry, volatileSnapshot) {
  const slug =
    typeof frontmatter.slug === "string"
      ? frontmatter.slug.trim()
      : path.basename(filePath, path.extname(filePath));
  const relativePath = path.relative(REPO_ROOT, filePath).replace(/\\/g, "/");
  const effectivePolicy = resolveEditorialTimelinessPolicy(frontmatter, slug, policy);
  const validAsOf = parseOptionalDate(frontmatter.articleLead?.validAsOf);
  const updatedDate = parseOptionalDate(frontmatter.updatedDate);
  const pubDate = parseOptionalDate(frontmatter.pubDate);
  const reviewDate = validAsOf ?? updatedDate ?? pubDate;

  // For runtime_snapshot_plus_editorial_review articles the volatile snapshot is
  // refreshed automatically (daily workflow). A fresh snapshot confirms the data
  // is still valid, so it counts as an effective editorial check. Using the
  // snapshot's lastUpdated date as an upper bound on the review date prevents
  // the SLA from expiring whenever the data hasn't actually changed — without
  // bypassing the strict-sync drift checks, which still compare against the
  // frontmatter reviewDate.
  let effectiveReviewDate = reviewDate;
  if (
    effectivePolicy.sourceMode === "runtime_snapshot_plus_editorial_review" &&
    volatileSnapshot.lastUpdated
  ) {
    const snapshotDate = parseOptionalDate(volatileSnapshot.lastUpdated);
    if (snapshotDate && (!effectiveReviewDate || snapshotDate > effectiveReviewDate)) {
      effectiveReviewDate = snapshotDate;
    }
  }

  // Evergreen articles carry no volatile figures, laws, or product terms, so
  // they never accrue a review SLA — they still need a traceable reviewDate,
  // just no dueDate/staleness computed from it.
  const isEvergreen = effectivePolicy.sourceMode === "evergreen";
  const dueDate = isEvergreen
    ? null
    : effectiveReviewDate
      ? addDays(effectiveReviewDate, effectivePolicy.cadenceDays)
      : null;
  const daysSinceReview = effectiveReviewDate ? diffInDays(effectiveReviewDate, TODAY) : null;
  const daysUntilDue = dueDate ? diffInDays(TODAY, dueDate) : null;
  const stale = isEvergreen ? false : dueDate ? TODAY.getTime() > dueDate.getTime() : true;
  const hasOfficialSources =
    Array.isArray(frontmatter.articleLead?.officialSources) &&
    frontmatter.articleLead.officialSources.length > 0;

  const volatileData = normalizeVolatileEntries(frontmatter).map(entry => {
    const datasetMeta = volatileRegistry.datasets?.[entry.id] ?? null;
    const snapshotDataset = volatileSnapshot.datasets?.[entry.id] ?? null;
    return {
      ...entry,
      validSyncMode: VOLATILE_SYNC_MODES.has(entry.sync),
      datasetExists: Boolean(datasetMeta),
      datasetLabel: datasetMeta?.label ?? null,
      snapshotValue:
        snapshotDataset && Object.hasOwn(snapshotDataset, "value")
          ? snapshotDataset.value
          : null,
      reviewTriggerDate: snapshotDataset?.reviewTriggerDate ?? null,
      lastObservedAt: snapshotDataset?.lastObservedAt ?? null,
      valueMatches:
        entry.expectedValue !== undefined && snapshotDataset
          ? valuesMatch(entry.expectedValue, snapshotDataset.value)
          : null,
    };
  });

  return {
    slug,
    relativePath,
    category: String(frontmatter.category || ""),
    draft: frontmatter.draft === true,
    reviewDate: reviewDate ? formatIsoDate(reviewDate) : null,
    effectiveReviewDate: effectiveReviewDate !== reviewDate ? formatIsoDate(effectiveReviewDate) : null,
    validAsOf: validAsOf ? formatIsoDate(validAsOf) : null,
    updatedDate: updatedDate ? formatIsoDate(updatedDate) : null,
    pubDate: pubDate ? formatIsoDate(pubDate) : null,
    dueDate: dueDate ? formatIsoDate(dueDate) : null,
    daysSinceReview,
    daysUntilDue,
    cadenceDays: effectivePolicy.cadenceDays,
    sourceMode: effectivePolicy.sourceMode,
    policySource: effectivePolicy.policySource,
    hasOfficialSources,
    stale,
    volatileData,
  };
}

function writeReport(report) {
  mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
}

function main() {
  const policy = loadEditorialTimelinessPolicy(POLICY_PATH);
  const volatileRegistry = loadVolatileRegistry();
  const volatileSnapshot = loadVolatileSnapshot();
  const files = listContentFiles(BLOG_DIR);
  const failures = [];
  const records = [];

  for (const filePath of files) {
    const frontmatter = parseFrontmatter(filePath);
    const record = buildRecord(
      filePath,
      frontmatter,
      policy,
      volatileRegistry,
      volatileSnapshot
    );
    if (record.draft) continue;
    records.push(record);

    if (!record.reviewDate) {
      failures.push(
        `${record.relativePath}: missing review date (articleLead.validAsOf, updatedDate, or pubDate).`
      );
      continue;
    }

    if (
      record.sourceMode === "manual_review_with_official_sources" &&
      record.hasOfficialSources !== true
    ) {
      failures.push(
        `${record.relativePath}: sourceMode "${record.sourceMode}" requires articleLead.officialSources.`
      );
    }

    if (
      record.sourceMode === "runtime_snapshot_plus_editorial_review" &&
      record.volatileData.length === 0
    ) {
      failures.push(
        `${record.relativePath}: sourceMode "${record.sourceMode}" requires volatileData dependencies.`
      );
    }

    if (record.sourceMode === "evergreen" && record.volatileData.length > 0) {
      failures.push(
        `${record.relativePath}: sourceMode "evergreen" is incompatible with declared volatileData dependencies.`
      );
    }

    if (record.stale) {
      failures.push(
        `${record.relativePath}: review SLA expired on ${record.dueDate} (${record.cadenceDays}d cadence, sourceMode=${record.sourceMode}).`
      );
    }

    for (const dataset of record.volatileData) {
      if (!dataset.validSyncMode) {
        failures.push(
          `${record.relativePath}: volatileData "${dataset.id}" has unknown sync mode "${dataset.sync}".`
        );
        continue;
      }

      if (!dataset.datasetExists) {
        failures.push(
          `${record.relativePath}: volatileData "${dataset.id}" is not registered in editorial-volatile-data-registry.json.`
        );
        continue;
      }

      if (!dataset.reviewTriggerDate) {
        failures.push(
          `${record.relativePath}: volatileData "${dataset.id}" has no snapshot reviewTriggerDate.`
        );
        continue;
      }

      if (
        dataset.sync === "strict" &&
        record.reviewDate < dataset.reviewTriggerDate
      ) {
        failures.push(
          `${record.relativePath}: volatileData "${dataset.id}" changed on ${dataset.reviewTriggerDate} and article reviewDate ${record.reviewDate} is behind.`
        );
      }

      if (
        dataset.sync === "strict" &&
        dataset.expectedValue !== undefined &&
        dataset.valueMatches !== true
      ) {
        failures.push(
          `${record.relativePath}: volatileData "${dataset.id}" expectedValue=${JSON.stringify(
            dataset.expectedValue
          )} does not match snapshot value=${JSON.stringify(dataset.snapshotValue)}.`
        );
      }
    }
  }

  const staleRecords = records.filter(record => record.stale);
  const driftRecords = records.filter(record =>
    record.volatileData.some(dataset =>
      dataset.sync === "strict" &&
      ((dataset.reviewTriggerDate && record.reviewDate < dataset.reviewTriggerDate) ||
        (dataset.expectedValue !== undefined && dataset.valueMatches === false))
    )
  );

  const report = {
    generatedAt: new Date().toISOString(),
    today: formatIsoDate(TODAY),
    economicSnapshotLastUpdated: loadEconomicSnapshotDate(),
    volatileSnapshotLastUpdated:
      typeof volatileSnapshot.lastUpdated === "string"
        ? volatileSnapshot.lastUpdated
        : null,
    totalPublished: records.length,
    staleCount: staleRecords.length,
    staleSlugs: staleRecords.map(record => record.slug),
    driftCount: driftRecords.length,
    driftSlugs: driftRecords.map(record => record.slug),
    records,
  };
  writeReport(report);

  console.log(
    `[check-editorial-timeliness] published=${records.length} stale=${staleRecords.length} drift=${driftRecords.length} report=${path.relative(REPO_ROOT, REPORT_PATH)}`
  );

  if (failures.length > 0) {
    console.error("[check-editorial-timeliness] FAIL:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("[check-editorial-timeliness] OK.");
}

main();
