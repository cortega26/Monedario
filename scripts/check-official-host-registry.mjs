// check:official-host-registry
//
// Guardrail for TD-0094. Keeps the canonical official-host registry
// (src/config/official-hosts.json) consistent with its consumers and flags
// official-looking hosts used in content that are not yet classified.
//
// Validates:
//   1. Registry shape: every entry has host/label/type; type is from the allowed set;
//      hosts are unique and stored bare (no scheme, no path).
//   2. analytics.ts derives from the registry (does not re-hardcode a host list).
//   3. urlcheck classifyHost() returns "official_source" for every canonical host
//      (bare and www. forms) — the two registries cannot diverge.
//   4. Drift reporter: external links in content whose host matches an official
//      suffix (.gob.cl/.gov.cl) but is absent from the registry → FAIL, so new
//      official hosts get classified instead of silently bypassing urlcheck.
//
// Exit 0 on success, exit 1 on any inconsistency.

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { classifyHost } from "./urlcheck/host-registry.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(
  process.env.OFFICIAL_HOSTS_ROOT || path.resolve(__dirname, "..")
);

const REGISTRY_PATH = path.join(REPO_ROOT, "src/config/official-hosts.json");
const ANALYTICS_PATH = path.join(REPO_ROOT, "src/utils/analytics.ts");
const CONTENT_DIRS = ["src/data/blog", "src/data/laws", "src/pages"].map(d =>
  path.join(REPO_ROOT, d)
);

const ALLOWED_TYPES = new Set([
  "oficial",
  "regulador",
  "referencia-legal",
  "proveedor-tecnico",
  "semi-oficial",
]);

function read(filePath) {
  return readFileSync(filePath, "utf8");
}

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function main() {
  const errors = [];
  const registry = JSON.parse(read(REGISTRY_PATH));

  // 1. Registry shape.
  const seen = new Set();
  const officialSet = new Set();
  for (const entry of registry.hosts ?? []) {
    if (!entry.host || !entry.label || !entry.type) {
      errors.push(`Registry: entry ${JSON.stringify(entry)} missing host/label/type.`);
      continue;
    }
    if (!ALLOWED_TYPES.has(entry.type)) {
      errors.push(`Registry: "${entry.host}" has invalid type "${entry.type}".`);
    }
    if (/[:/]/.test(entry.host) || entry.host.startsWith("www.")) {
      errors.push(`Registry: "${entry.host}" must be a bare hostname (no scheme/path/www.).`);
    }
    if (seen.has(entry.host)) {
      errors.push(`Registry: duplicate host "${entry.host}".`);
    }
    seen.add(entry.host);
    officialSet.add(entry.host);
  }
  if (!Array.isArray(registry.officialSuffixes) || registry.officialSuffixes.length === 0) {
    errors.push("Registry: officialSuffixes must be a non-empty array.");
  }

  // 2. analytics.ts derives from the registry.
  const analytics = read(ANALYTICS_PATH);
  if (!analytics.includes("official-hosts.json")) {
    errors.push("analytics.ts must import the canonical official-hosts.json registry.");
  }
  if (/OFFICIAL_HOSTNAMES\s*=\s*new Set\(\s*\[/.test(analytics)) {
    errors.push("analytics.ts still hardcodes an inline OFFICIAL_HOSTNAMES list; derive it from the registry.");
  }

  // 3. urlcheck classifies every canonical host as official_source.
  for (const host of officialSet) {
    for (const variant of host.startsWith("www.") ? [host] : [host, `www.${host}`]) {
      if (classifyHost(variant) !== "official_source") {
        errors.push(`urlcheck: classifyHost("${variant}") is not official_source.`);
      }
    }
  }

  // 4. Drift reporter: official-suffix hosts in content missing from the registry.
  const suffixes = registry.officialSuffixes ?? [];
  const urlRe = /https?:\/\/([a-zA-Z0-9.-]+)/g;
  const unclassified = new Map(); // host -> sample file
  for (const dir of CONTENT_DIRS) {
    for (const file of walk(dir)) {
      if (!/\.(md|mdx|astro|ts)$/.test(file)) continue;
      const src = read(file);
      for (const m of src.matchAll(urlRe)) {
        const host = m[1].toLowerCase().replace(/^www\./, "");
        if (!suffixes.some(s => host.endsWith(s))) continue;
        if (officialSet.has(host)) continue;
        if (!unclassified.has(host)) {
          unclassified.set(host, path.relative(REPO_ROOT, file));
        }
      }
    }
  }
  for (const [host, sample] of unclassified) {
    errors.push(
      `Unclassified official host "${host}" (e.g. ${sample}): add it to official-hosts.json with a source type.`
    );
  }

  if (errors.length > 0) {
    console.error(`[check-official-host-registry] FAIL: ${errors.length} issue(s)`);
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }

  console.log(
    `[check-official-host-registry] OK. hosts=${officialSet.size} suffixes=${suffixes.join(",")} (analytics + urlcheck derive from the canonical registry).`
  );
}

main();
