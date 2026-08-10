import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// The service worker's VOLATILE_HTML_PATHS and public/_headers are two
// independent copies of the same volatile-page policy (plan 058 + maintenance
// note: "todo lo que el CDN trata como volátil debe estar también en
// VOLATILE_HTML_PATHS", y viceversa). These guards prevent them drifting
// apart: a path added to one without the other means the page is either served
// stale by the SW or cached too long by the CDN.

const SW_PATH = path.resolve("public/sw.js");
const HEADERS_PATH = path.resolve("public/_headers");
const PAGES_ROOT = path.resolve("src/pages");

function volatilePathsFromSw(): string[] {
  const source = readFileSync(SW_PATH, "utf8");
  const block = source.match(
    /VOLATILE_HTML_PATHS = new Set\(\[([\s\S]*?)\]\)/
  )?.[1];
  if (!block) throw new Error("VOLATILE_HTML_PATHS block not found in sw.js");
  return [...block.matchAll(/"([^"]+)"/g)].map(match => match[1]);
}

function volatileRulesFromHeaders(): Array<{ path: string; headers: string }> {
  const source = readFileSync(HEADERS_PATH, "utf8");
  const rules: Array<{ path: string; headers: string }> = [];
  let current: { path: string; headers: string } | null = null;
  for (const line of source.split("\n")) {
    if (line.startsWith("/")) {
      current = { path: line.trim(), headers: "" };
      rules.push(current);
    } else if (current) {
      current.headers += line + "\n";
    }
  }
  return rules;
}

// Trailing-slash normalization for Cloudflare _headers rule keys.
function normalizeRuleKey(key: string): string {
  const withoutWildcard = key.replace(/\*$/, "");
  return withoutWildcard.endsWith("/") ? withoutWildcard : `${withoutWildcard}/`;
}

describe("service worker volatile HTML paths (plan 058)", () => {
  const paths = volatilePathsFromSw();

  it("only contains routes that map to a real page (trailingSlash: always)", () => {
    for (const entry of paths) {
      const route = entry.replace(/\/index\.html$/, "").replace(/\/$/, "");
      const page = path.join(PAGES_ROOT, `${route}.astro`);
      expect(
        existsSync(page),
        `VOLATILE_HTML_PATHS entry "${entry}" has no page at ${page}`
      ).toBe(true);
    }
  });

  it("keeps the three daily money-value pages in the set (conversor-uf, conversor-utm, uf-hoy)", () => {
    const basePaths = paths
      .filter(entry => !entry.endsWith("/index.html"))
      .sort();
    expect(basePaths).toEqual([
      "/calculadoras/conversor-uf/",
      "/calculadoras/conversor-utm/",
      "/guias/uf-costo-de-vida/indicadores-economicos/",
      "/uf-hoy/",
    ]);
  });

  it("keeps every SW volatile path covered by a CDN max-age=300 rule in _headers", () => {
    const volatileRules = volatileRulesFromHeaders().filter(rule =>
      rule.headers.includes("max-age=300")
    );
    for (const entry of paths) {
      const covered = volatileRules.some(rule => {
        const key = normalizeRuleKey(rule.path);
        return entry === key || entry.startsWith(key);
      });
      expect(
        covered,
        `VOLATILE_HTML_PATHS entry "${entry}" has no max-age=300 rule in public/_headers`
      ).toBe(true);
    }
  });
});
