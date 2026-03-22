import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

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
const SOURCE_MODES = new Set([
  "manual_review",
  "manual_review_with_official_sources",
  "runtime_snapshot_plus_editorial_review",
]);

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

function loadPolicy() {
  const raw = JSON.parse(readFileSync(POLICY_PATH, "utf8"));
  if (!Number.isInteger(raw.defaultCadenceDays) || raw.defaultCadenceDays <= 0) {
    throw new Error("editorial timeliness policy requires defaultCadenceDays > 0.");
  }
  if (!SOURCE_MODES.has(raw.defaultSourceMode)) {
    throw new Error(`Unknown defaultSourceMode "${raw.defaultSourceMode}".`);
  }
  for (const [category, policy] of Object.entries(raw.categoryPolicies ?? {})) {
    if (!Number.isInteger(policy.cadenceDays) || policy.cadenceDays <= 0) {
      throw new Error(`Category "${category}" requires cadenceDays > 0.`);
    }
    if (!SOURCE_MODES.has(policy.sourceMode)) {
      throw new Error(`Category "${category}" has unknown sourceMode "${policy.sourceMode}".`);
    }
  }
  for (const [slug, override] of Object.entries(raw.slugOverrides ?? {})) {
    if (
      override.cadenceDays !== undefined &&
      (!Number.isInteger(override.cadenceDays) || override.cadenceDays <= 0)
    ) {
      throw new Error(`Slug override "${slug}" requires cadenceDays > 0 when present.`);
    }
    if (override.sourceMode && !SOURCE_MODES.has(override.sourceMode)) {
      throw new Error(`Slug override "${slug}" has unknown sourceMode "${override.sourceMode}".`);
    }
  }
  return raw;
}

function parseFrontmatter(filePath) {
  const block = extractFrontmatter(filePath);
  if (!block) {
    throw new Error(`Missing frontmatter block in ${filePath}`);
  }
  const parsed = yaml.load(block, { schema: yaml.JSON_SCHEMA }) || {};
  return typeof parsed === "object" && parsed ? parsed : {};
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
    const payload = JSON.parse(readFileSync(ECONOMIC_SNAPSHOT_PATH, "utf8"));
    return typeof payload.lastUpdated === "string" ? payload.lastUpdated : null;
  } catch {
    return null;
  }
}

function resolveEffectivePolicy(frontmatter, slug, policy) {
  const categoryPolicy = policy.categoryPolicies?.[frontmatter.category] ?? {};
  const slugOverride = policy.slugOverrides?.[slug] ?? {};
  return {
    cadenceDays:
      slugOverride.cadenceDays ??
      categoryPolicy.cadenceDays ??
      policy.defaultCadenceDays,
    sourceMode:
      slugOverride.sourceMode ??
      categoryPolicy.sourceMode ??
      policy.defaultSourceMode,
    policySource: slugOverride.sourceMode || slugOverride.cadenceDays
      ? `slugOverrides.${slug}`
      : categoryPolicy.cadenceDays || categoryPolicy.sourceMode
        ? `categoryPolicies.${frontmatter.category}`
        : "defaultPolicy",
  };
}

function buildRecord(filePath, frontmatter, policy) {
  const slug =
    typeof frontmatter.slug === "string"
      ? frontmatter.slug.trim()
      : path.basename(filePath, path.extname(filePath));
  const relativePath = path.relative(REPO_ROOT, filePath).replace(/\\/g, "/");
  const effectivePolicy = resolveEffectivePolicy(frontmatter, slug, policy);
  const validAsOf = parseOptionalDate(frontmatter.articleLead?.validAsOf);
  const updatedDate = parseOptionalDate(frontmatter.updatedDate);
  const pubDate = parseOptionalDate(frontmatter.pubDate);
  const reviewDate = validAsOf ?? updatedDate ?? pubDate;
  const dueDate = reviewDate ? addDays(reviewDate, effectivePolicy.cadenceDays) : null;
  const daysSinceReview = reviewDate ? diffInDays(reviewDate, TODAY) : null;
  const daysUntilDue = dueDate ? diffInDays(TODAY, dueDate) : null;
  const stale = dueDate ? TODAY.getTime() > dueDate.getTime() : true;
  const hasOfficialSources =
    Array.isArray(frontmatter.articleLead?.officialSources) &&
    frontmatter.articleLead.officialSources.length > 0;

  return {
    slug,
    relativePath,
    category: String(frontmatter.category || ""),
    draft: frontmatter.draft === true,
    reviewDate: reviewDate ? formatIsoDate(reviewDate) : null,
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
  };
}

function writeReport(report) {
  mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
}

function main() {
  const policy = loadPolicy();
  const files = listContentFiles(BLOG_DIR);
  const failures = [];
  const records = [];

  for (const filePath of files) {
    const frontmatter = parseFrontmatter(filePath);
    const record = buildRecord(filePath, frontmatter, policy);
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

    if (record.stale) {
      failures.push(
        `${record.relativePath}: review SLA expired on ${record.dueDate} (${record.cadenceDays}d cadence, sourceMode=${record.sourceMode}).`
      );
    }
  }

  const staleRecords = records.filter(record => record.stale);
  const report = {
    generatedAt: new Date().toISOString(),
    today: formatIsoDate(TODAY),
    economicSnapshotLastUpdated: loadEconomicSnapshotDate(),
    totalPublished: records.length,
    staleCount: staleRecords.length,
    staleSlugs: staleRecords.map(record => record.slug),
    records,
  };
  writeReport(report);

  console.log(
    `[check-editorial-timeliness] published=${records.length} stale=${staleRecords.length} report=${path.relative(REPO_ROOT, REPORT_PATH)}`
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
