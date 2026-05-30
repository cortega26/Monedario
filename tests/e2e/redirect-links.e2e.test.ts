/**
 * E2E tests verifying SEO redirect fix (spec.md V1–V5).
 *
 * Validates that all links identified in the Ahrefs "Pages with links to
 * redirect" report (2026-04-15) have been updated to their final canonical
 * URLs and that no deprecated redirecting URLs remain in the source tree.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

/** Recursively collect all text-like source files under a directory. */
function collectSourceFiles(dir: string): string[] {
  const absDir = path.join(repoRoot, dir);
  if (!fs.existsSync(absDir)) return [];
  const result: string[] = [];
  const walk = (d: string) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        // skip node_modules, .git, dist
        if (!["node_modules", ".git", "dist", ".astro"].includes(entry.name)) {
          walk(full);
        }
      } else if (/\.(ts|tsx|astro|md|mdx|js|jsx)$/.test(entry.name)) {
        result.push(full);
      }
    }
  };
  walk(absDir);
  return result;
}

const srcFiles = collectSourceFiles("src");

function allSrcContent(): string {
  return srcFiles.map(f => fs.readFileSync(f, "utf8")).join("\n");
}

// ---------------------------------------------------------------------------
// V1 — No old redirecting URL should remain in src/
// ---------------------------------------------------------------------------

describe("V1 — no deprecated redirecting URLs remain in src/", () => {
  const DEPRECATED_URLS: Array<{ pattern: string; description: string }> = [
    // Internal redirect
    { pattern: 'href: "/cambios"', description: "Internal /cambios without trailing slash (HeroHomepage)" },
    // BCN leychile bare
    { pattern: "https://www.bcn.cl/leychile\"", description: "BCN leychile without trailing slash" },
    // CMF bare domain
    { pattern: "https://www.cmfchile.cl\"", description: "Bare CMF domain without path" },
    { pattern: "https://www.cmfchile.cl/\"", description: "Bare CMF domain with trailing slash only" },
    // DT bare domain
    { pattern: "https://www.dt.gob.cl\"", description: "Bare DT domain without path" },
    { pattern: "https://www.dt.gob.cl/\"", description: "Bare DT domain with trailing slash only (check calculators)" },
    // Old SUSESO domain
    { pattern: "https://www.suseso.cl", description: "Old suseso.cl domain (moved to suseso.gob.cl)" },
    // CSIRT with www
    { pattern: "https://www.csirt.gob.cl/", description: "CSIRT with www prefix (canonical is no-www)" },
    // CMF educa bare (no trailing slash)
    { pattern: "https://www.cmfeduca.cl/\"", description: "CMF Educa bare without /educa/ path" },
    // CMF conocetudeuda bare
    { pattern: "https://conocetudeuda.cmfchile.cl/\"", description: "conocetudeuda bare root (moved to /informe-deudas/)" },
    { pattern: "conocetudeuda.cmfchile.cl/)\"", description: "conocetudeuda bare root closing paren" },
    // CMF educa without trailing slash
    { pattern: "https://www.cmfchile.cl/educa\"", description: "CMF educa path without trailing slash" },
    // SERNAC old paths
    { pattern: "https://www.sernac.cl/app/consumidor\"", description: "SERNAC consumer app without trailing slash" },
    { pattern: "sernac.cl/proteccion-al-consumidor/consumidor-financiero", description: "SERNAC old consumer financiero path" },
    // Old spensiones article pages (removed, redirect to homepage)
    { pattern: "spensiones.cl/portal/institucional/594/w3-article-17026.html", description: "Spensiones article-17026 (page removed)" },
    { pattern: "spensiones.cl/portal/institucional/594/w3-article-16969.html", description: "Spensiones article-16969 (page removed)" },
    // BCN leyfacil reforma previsional (moved to leychile)
    { pattern: "bcn.cl/leyfacil/recurso/reforma-de-pensiones-de-2025", description: "BCN leyfacil reforma previsional (moved)" },
    // CMF educa old section (600 → 621)
    { pattern: "cmfchile.cl/educa/600/", description: "CMF educa section 600 (moved to 621)" },
    // CMF mascerca (moved to portal)
    { pattern: "cmfchile.cl/mascerca/", description: "CMF mascerca path (moved to portal)" },
    // INE old estadisticas path
    { pattern: "ine.gob.cl/estadisticas/economia/indices-de-precio-e-inflacion/indice-de-precios-al-consumidor", description: "INE old IPC path" },
    // Old suseso.cl specific paths
    { pattern: "https://www.suseso.cl/608/", description: "Old SUSESO /608/ path" },
  ];

  const content = allSrcContent();

  for (const { pattern, description } of DEPRECATED_URLS) {
    it(`should not contain: ${description}`, () => {
      expect(content).not.toContain(pattern);
    });
  }
});

// ---------------------------------------------------------------------------
// V2 — Internal /cambios link has trailing slash
// ---------------------------------------------------------------------------

describe("V2 — HeroHomepage does not reference deprecated /cambios route", () => {
  // The "última actualización" link was removed from HeroHomepage during the
  // /cambios → /metodologia migration cleanup (commits 53b2c92e, c9d6677d).
  // The durable regression guard is that the deprecated route never reappears.
  it('HeroHomepage.astro does not link to deprecated "/cambios"', () => {
    const content = readFile("src/components/HeroHomepage.astro");
    expect(content).not.toContain('"/cambios"');
  });
});

// ---------------------------------------------------------------------------
// V3 — analytics.ts uses suseso.gob.cl not suseso.cl
// ---------------------------------------------------------------------------

describe("V3 — analytics trusted-domain set", () => {
  it('official-hosts registry uses suseso.gob.cl not suseso.cl', () => {
    // Official hosts moved to the canonical registry (TD-0094); analytics derives from it.
    const content = readFile("src/config/official-hosts.json");
    expect(content).toContain('"suseso.gob.cl"');
    expect(content).not.toContain('"suseso.cl"');
  });
});

// ---------------------------------------------------------------------------
// V4 — Canonical replacement URLs are present in source
// ---------------------------------------------------------------------------

describe("V4 — canonical replacement URLs are present in source", () => {
  const EXPECTED_REPLACEMENTS: Array<{ url: string; description: string }> = [
    { url: "https://www.bcn.cl/leychile/", description: "BCN leychile with trailing slash" },
    { url: "https://www.cmfchile.cl/portal/principal/613/w3-channel.html", description: "CMF portal URL" },
    { url: "https://www.dt.gob.cl/portal/1626/w3-channel.html", description: "DT portal URL" },
    { url: "https://www.suseso.gob.cl", description: "SUSESO gob.cl domain" },
    { url: "https://csirt.gob.cl/", description: "CSIRT no-www" },
    { url: "https://www.cmfeduca.cl/educa/", description: "CMF Educa /educa/ path" },
    { url: "https://conocetudeuda.cmfchile.cl/informe-deudas/", description: "conocetudeuda /informe-deudas/" },
    { url: "https://www.cmfchile.cl/educa/", description: "CMF educa with trailing slash" },
    { url: "https://www.sernac.cl/app/consumidor/", description: "SERNAC consumer with trailing slash" },
    { url: "https://www.sernac.cl/portal/618/w3-propertyname-688.html", description: "SERNAC financiero portal URL" },
    { url: "https://www.bcn.cl/leychile/navegar?idNorma=1212060", description: "BCN Ley 21.735 direct URL" },
    { url: "https://www.cmfchile.cl/educa/621/w3-propertyvalue-988.html", description: "CMF educa section 621 fondos mutuos" },
    { url: "https://www.cmfchile.cl/portal/principal/613/w3-article-1264", description: "CMF portal corredores URL" },
    { url: "https://www.ine.gob.cl/estadisticas-por-tema/precios-e-inflacion/indice-de-precios-al-consumidor", description: "INE new IPC path" },
  ];

  const content = allSrcContent();

  for (const { url, description } of EXPECTED_REPLACEMENTS) {
    it(`source should contain canonical URL: ${description}`, () => {
      expect(content).toContain(url);
    });
  }
});

// ---------------------------------------------------------------------------
// V5 — WhatsApp wa.me links are unchanged
// ---------------------------------------------------------------------------

describe("V5 — WhatsApp share links are unchanged", () => {
  it("wa.me links still present (not erroneously removed)", () => {
    const content = allSrcContent();
    // These links are 302 by design and should remain
    expect(content).toContain("https://wa.me/?text=");
  });
});
