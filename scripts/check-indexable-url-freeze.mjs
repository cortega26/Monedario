import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REQUIRED_EXCEPTION_FIELDS = [
  "url",
  "problem",
  "evidence",
  "hypothesis",
  "cost",
  "maintenance",
  "metric",
  "threshold",
  "decision",
  "approvedBy",
  "approvedAt",
  "expiresAt",
];

export function normalizeIndexableUrl(value) {
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  url.pathname =
    url.pathname === "/" ? "/" : `${url.pathname.replace(/\/+$/, "")}/`;
  return url.href;
}

function readJson(file, label) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(
      `${label} is unreadable: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function sitemapUrls(dist) {
  const sitemap = path.join(dist, "sitemap-0.xml");
  if (!existsSync(sitemap)) {
    throw new Error("dist/sitemap-0.xml is missing; run the Astro build first");
  }
  const xml = readFileSync(sitemap, "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(match => normalizeIndexableUrl(match[1]))
    .sort();
}

function outputPathFor(dist, urlValue) {
  const pathname = new URL(urlValue).pathname;
  return pathname === "/"
    ? path.join(dist, "index.html")
    : path.join(dist, pathname.replace(/^\//, ""), "index.html");
}

function containsNoindex(html) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].some(match => {
    const tag = match[0];
    return (
      /\bname\s*=\s*["']robots["']/i.test(tag) &&
      /\bcontent\s*=\s*["'][^"']*\bnoindex\b/i.test(tag)
    );
  });
}

export function checkIndexableUrlFreeze({
  dist,
  baselineFile,
  exceptionsFile,
  now = new Date(),
}) {
  const errors = [];
  const baseline = readJson(baselineFile, "approved inventory");
  const exceptionDocument = readJson(exceptionsFile, "exception registry");
  const approvedList = Array.isArray(baseline.urls) ? baseline.urls : [];
  const approved = new Set(approvedList.map(normalizeIndexableUrl));
  const generatedList = sitemapUrls(dist);
  const generated = new Set(generatedList);
  const exceptions = new Set();

  for (const entry of exceptionDocument.exceptions ?? []) {
    const complete = REQUIRED_EXCEPTION_FIELDS.every(
      key => String(entry[key] ?? "").trim().length > 0
    );
    if (!complete) {
      errors.push(`incomplete exception record for ${entry.url ?? "unknown URL"}`);
      continue;
    }
    if (entry.decision !== "APPROVED") continue;
    if (!Number.isFinite(Date.parse(entry.approvedAt))) {
      errors.push(`invalid approvedAt for exception ${entry.url}`);
      continue;
    }
    if (
      !Number.isFinite(Date.parse(entry.expiresAt)) ||
      Date.parse(entry.expiresAt) < now.getTime()
    ) {
      errors.push(`expired or invalid exception for ${entry.url}`);
      continue;
    }
    exceptions.add(normalizeIndexableUrl(entry.url));
  }

  if (approved.size === 0) errors.push("approved inventory is empty");
  if (approved.size !== approvedList.length) {
    errors.push("approved inventory contains duplicates");
  }
  if (generated.size !== generatedList.length) {
    errors.push("generated sitemap contains duplicate URLs");
  }

  const removed = [...approved].filter(url => !generated.has(url)).sort();
  const added = [...generated].filter(url => !approved.has(url)).sort();
  const unapprovedAdded = added.filter(url => !exceptions.has(url));
  for (const url of removed) {
    errors.push(`- ${url} (approved URL missing from generated sitemap)`);
  }
  for (const url of unapprovedAdded) {
    errors.push(
      `+ ${url} (unapproved indexable URL; request an exception in docs/governance/url-freeze-exceptions.json)`
    );
  }

  for (const url of generated) {
    const htmlPath = outputPathFor(dist, url);
    if (!existsSync(htmlPath)) {
      errors.push(`sitemap URL has no rendered HTML: ${url}`);
      continue;
    }
    if (containsNoindex(readFileSync(htmlPath, "utf8"))) {
      errors.push(`noindex page is present in sitemap: ${url}`);
    }
  }

  return {
    status: errors.length === 0 ? "PASS" : "FAIL",
    approved: approved.size,
    generated: generated.size,
    approvedAdditions: added.filter(url => exceptions.has(url)).length,
    added,
    removed,
    errors,
  };
}

function main() {
  const result = checkIndexableUrlFreeze({
    dist: path.join(ROOT, "dist"),
    baselineFile: path.join(
      ROOT,
      "docs/reports/indexable-url-inventory.json"
    ),
    exceptionsFile: path.join(
      ROOT,
      "docs/governance/url-freeze-exceptions.json"
    ),
  });
  if (result.status === "FAIL") {
    for (const error of result.errors) {
      console.error(`[indexable-url-freeze] ${error}`);
    }
    process.exit(1);
  }
  console.log(
    `[indexable-url-freeze] PASS approved=${result.approved} generated=${result.generated} approved_additions=${result.approvedAdditions}`
  );
}

if (
  process.argv[1] &&
  import.meta.url === new URL(`file://${path.resolve(process.argv[1])}`).href
) {
  try {
    main();
  } catch (error) {
    console.error(
      `[indexable-url-freeze] ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}
