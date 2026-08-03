import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dump, load } from "js-yaml";
import * as prettier from "prettier";
import {
  loadEditorialTimelinessPolicy,
  resolveEditorialTimelinessPolicy,
} from "./lib/editorial-timeliness-policy.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(REPO_ROOT, "src", "data", "blog");
const POLICY_PATH = path.join(REPO_ROOT, "src", "config", "editorial-timeliness-policy.json");

function cadenceLabelFor(maxDays, dataTriggers) {
  if (dataTriggers.length > 0 && maxDays <= 1) return "on_data_change";
  if (maxDays <= 30) return "monthly";
  if (maxDays <= 90) return "quarterly";
  if (maxDays <= 180) return "semiannual";
  return "annual";
}

function deriveReviewPolicy(frontmatter, body, slug, policy) {
  const effectivePolicy = resolveEditorialTimelinessPolicy(frontmatter, slug, policy);
  let maxDays = effectivePolicy.cadenceDays;
  const dataTriggers = new Set();
  const derivationFactors = [`registry:${effectivePolicy.policySource}`];

  for (const entry of frontmatter.volatileData ?? []) {
    if (entry.sync === "strict") {
      dataTriggers.add(entry.id);
      const id = entry.id.toLowerCase();
      if (id.includes("utm") || id.includes(".uf")) {
        maxDays = Math.min(maxDays, 30);
      }
    }
  }

  if (/\[\[utm/.test(body)) {
    dataTriggers.add("economic.utm.value");
    maxDays = Math.min(maxDays, 30);
    derivationFactors.push("template:utm");
  }
  if (/\[\[uf/.test(body)) {
    dataTriggers.add("economic.uf.value");
    maxDays = Math.min(maxDays, 1);
    derivationFactors.push("template:uf");
  }
  if (/\[\[uta/.test(body)) {
    dataTriggers.add("economic.uta.value");
    derivationFactors.push("template:uta");
  }

  const sortedTriggers = [...dataTriggers].sort();
  return {
    cadenceLabel: cadenceLabelFor(maxDays, sortedTriggers),
    maxDays,
    dataTriggers: sortedTriggers,
    derivationFactors: [...new Set(derivationFactors)],
  };
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;
  const yamlStr = match[1];
  const end = match[0].length;
  let data;
  try {
    data = load(yamlStr);
  } catch {
    return null;
  }
  return { yamlStr, end, data };
}

function reviewPolicyChanged(existing, computed) {
  if (!existing) return true;
  return (
    existing.cadenceLabel !== computed.cadenceLabel ||
    existing.maxDays !== computed.maxDays ||
    JSON.stringify(existing.dataTriggers) !== JSON.stringify(computed.dataTriggers) ||
    JSON.stringify(existing.derivationFactors) !== JSON.stringify(computed.derivationFactors)
  );
}

function stripReviewPolicy(yamlStr) {
  return yamlStr.replace(/\nreviewPolicy:\n(?:[ \t][^\n]*\n?)+/, "\n");
}

function stripField(yamlStr, fieldName) {
  const re = new RegExp(`\n${fieldName}:.*`, "");
  return yamlStr.replace(re, "");
}

function injectReviewPolicy(content, yamlStr, end, reviewPolicy, newUpdatedDate) {
  let modified = stripReviewPolicy(yamlStr).trimEnd();

  if (newUpdatedDate) {
    modified = stripField(modified, "updatedDate");
  }

  const block = dump({ reviewPolicy }, { indent: 2, lineWidth: -1 }).trimEnd();
  let newYaml = `${modified}\n${block}`;

  if (newUpdatedDate) {
    newYaml += `\nupdatedDate: ${newUpdatedDate}`;
  }

  const body = content.slice(end);
  return `---\n${newYaml}\n---\n${body}`;
}

function findMdFiles(dir) {
  const result = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...findMdFiles(full));
    } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
      result.push(full);
    }
  }
  return result;
}

async function main() {
  const policy = loadEditorialTimelinessPolicy(POLICY_PATH);
  const files = findMdFiles(BLOG_DIR);
  let updated = 0;
  let skipped = 0;

  for (const filePath of files) {
    const content = readFileSync(filePath, "utf-8");
    const parsed = parseFrontmatter(content);
    if (!parsed) {
      console.warn(`[compute-review-policies] No frontmatter in ${path.relative(process.cwd(), filePath)}`);
      continue;
    }

    const { yamlStr, end, data } = parsed;
    if (data?.reviewPolicy?._manual) {
      skipped++;
      continue;
    }

    const slug =
      typeof data?.slug === "string" ? data.slug.trim() : path.basename(filePath, path.extname(filePath));
    const body = content.slice(end);
    const computed = deriveReviewPolicy(data ?? {}, body, slug, policy);
    const hasDataTriggers = computed.dataTriggers.length > 0;

    // Bump updatedDate for articles with economic data triggers (UF, UTM, IPC, etc.)
    // so Google receives a freshness signal when volatile data refreshes.
    const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const currentDateStr =
      data?.updatedDate && typeof data.updatedDate === "string"
        ? data.updatedDate.slice(0, 10)
        : null;
    const bumpUpdatedDate = hasDataTriggers && currentDateStr !== todayStr;

    if (!reviewPolicyChanged(data?.reviewPolicy, computed) && !bumpUpdatedDate) {
      continue;
    }

    // computedAt feeds ArticleJsonLd's public `lastReviewed`/`reviewedBy` fields,
    // which assert that a human reviewed the article on that date. Only stamp
    // today when a volatile data trigger actually changed (a real automated
    // check event) or this is the article's first computation — a cadence
    // policy refactor alone must not manufacture a review date.
    const previousComputedAt =
      typeof data?.reviewPolicy?.computedAt === "string" ? data.reviewPolicy.computedAt : null;
    computed.computedAt = previousComputedAt && !bumpUpdatedDate ? previousComputedAt : todayStr;

    const updatedDateValue = bumpUpdatedDate ? `${todayStr}T00:00:00Z` : null;
    const rawContent = injectReviewPolicy(
      content,
      yamlStr,
      end,
      computed,
      updatedDateValue
    );
    // js-yaml's dump() quotes ambiguous scalars (e.g. computedAt dates) with
    // single quotes, which disagrees with this repo's Prettier config
    // (singleQuote: false) and fails the pre-commit prettier --check gate.
    // Formatting through Prettier here keeps the generator's output stable
    // against any future formatting-rule drift, not just today's mismatch.
    const prettierConfig = await prettier.resolveConfig(filePath);
    const updatedContent = await prettier.format(rawContent, {
      ...prettierConfig,
      filepath: filePath,
    });
    writeFileSync(filePath, updatedContent, "utf-8");
    const dateNote = bumpUpdatedDate ? ` + updatedDate→${todayStr}` : "";
    console.log(
      `[compute-review-policies] ${path.relative(process.cwd(), filePath)}: ${computed.cadenceLabel} (${computed.maxDays}d, triggers: [${computed.dataTriggers.join(", ")}])${dateNote}`
    );
    updated++;
  }

  console.log(
    `[compute-review-policies] Done: ${updated} updated, ${skipped} skipped (manual).`
  );
}

main().catch(err => {
  console.error("[compute-review-policies] Error:", err.message);
  process.exit(1);
});
