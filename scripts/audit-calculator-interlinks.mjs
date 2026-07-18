// audit:calculator-interlinks
//
// SEO/indexation tooling. Every active calculator is an owner surface that must
// earn internal inbound links to get and stay indexed. A calculator that Google
// crawls but does not index is often under-linked relative to its siblings
// (real case: `/calculadoras/reajuste-arriendo/`, W28 crawled-not-indexed, had
// ~half the inbound links of the indexed `/calculadoras/conversor-uf/`).
//
// This audit reports, per active calculator, how many distinct internal files
// link to it, splitting structural references (portfolio config, the
// `/calculadoras/` hub, the search page) from *editorial* links (guides, blog,
// glossary, other calculators). Editorial links are the signal that
// differentiates a well-supported tool from an orphan.
//
// Source of truth for "active" = the real page files under
// `src/pages/calculadoras/*.astro` (excluding `index.astro`), so the audit can
// never drift from what actually ships.
//
// Informational by default (exit 0). Pass `--strict` to exit 1 when any active
// calculator falls below the editorial-link floor (a candidate CI guardrail).
//
// Flags: --json | --strict | --min=<n> (editorial floor, default 3)

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const args = new Set(process.argv.slice(2));
const JSON_OUTPUT = args.has("--json");
const STRICT = args.has("--strict");
const MIN_EDITORIAL = (() => {
  const flag = [...args].find(a => a.startsWith("--min="));
  const n = flag ? Number.parseInt(flag.slice("--min=".length), 10) : 3;
  return Number.isFinite(n) && n >= 0 ? n : 3;
})();

const REPO_ROOT = process.env.CALC_INTERLINKS_ROOT || process.cwd();
const CALC_PAGES_DIR = path.join(REPO_ROOT, "src", "pages", "calculadoras");
const SRC_DIR = path.join(REPO_ROOT, "src");
const CONTENT_EXTENSIONS = new Set([".astro", ".ts", ".tsx", ".md", ".mdx"]);

// Structural surfaces reference many/all calculators automatically; excluding
// them isolates the editorial link signal.
const STRUCTURAL_PREFIXES = [
  path.join("src", "config") + path.sep,
];
const STRUCTURAL_FILES = new Set([
  path.join("src", "pages", "calculadoras", "index.astro"),
  path.join("src", "pages", "buscar.astro"),
]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walk(full));
    } else if (CONTENT_EXTENSIONS.has(path.extname(entry))) {
      out.push(full);
    }
  }
  return out;
}

function activeCalculatorSlugs() {
  return readdirSync(CALC_PAGES_DIR)
    .filter(f => f.endsWith(".astro") && f !== "index.astro")
    .map(f => f.slice(0, -".astro".length))
    .sort();
}

function isStructural(relPath) {
  if (STRUCTURAL_FILES.has(relPath)) return true;
  return STRUCTURAL_PREFIXES.some(prefix => relPath.startsWith(prefix));
}

function main() {
  const slugs = activeCalculatorSlugs();
  const corpus = walk(SRC_DIR).map(full => ({
    rel: path.relative(REPO_ROOT, full),
    text: readFileSync(full, "utf8"),
  }));

  const rows = slugs
    .map(slug => {
      const needle = `/calculadoras/${slug}/`;
      const selfPage = path.join("src", "pages", "calculadoras", `${slug}.astro`);
      let inboundTotal = 0;
      let inboundEditorial = 0;
      const editorialSources = [];
      for (const file of corpus) {
        if (file.rel === selfPage) continue;
        if (!file.text.includes(needle)) continue;
        inboundTotal += 1;
        if (!isStructural(file.rel)) {
          inboundEditorial += 1;
          editorialSources.push(file.rel);
        }
      }
      return { slug, inboundEditorial, inboundTotal, editorialSources };
    })
    .sort((a, b) => a.inboundEditorial - b.inboundEditorial || a.slug.localeCompare(b.slug));

  const underLinked = rows.filter(r => r.inboundEditorial < MIN_EDITORIAL);

  if (JSON_OUTPUT) {
    console.log(
      JSON.stringify({ minEditorial: MIN_EDITORIAL, underLinked: underLinked.map(r => r.slug), rows }, null, 2)
    );
  } else {
    console.log(`[audit-calculator-interlinks] active calculators: ${rows.length}`);
    console.log(`[audit-calculator-interlinks] editorial-link floor (min): ${MIN_EDITORIAL}`);
    console.log("");
    console.log("  editorial  total  calculator");
    for (const r of rows) {
      const flag = r.inboundEditorial < MIN_EDITORIAL ? " ⚠ under-linked" : "";
      console.log(
        `  ${String(r.inboundEditorial).padStart(9)}  ${String(r.inboundTotal).padStart(5)}  ${r.slug}${flag}`
      );
    }
    console.log("");
    if (underLinked.length === 0) {
      console.log(
        `[audit-calculator-interlinks] under-linked calculators (< ${MIN_EDITORIAL} editorial): none`
      );
    } else {
      console.log(
        `[audit-calculator-interlinks] under-linked calculators (< ${MIN_EDITORIAL} editorial): ${underLinked
          .map(r => r.slug)
          .join(", ")}`
      );
    }
  }

  if (STRICT && underLinked.length > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main();
