import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const roots: string[] = [];
const SCRIPT_PATH = path.resolve("scripts/check-risk-tiers.mjs");

type FixtureOptions = {
  articles?: Record<string, string>;
  calculators?: Record<string, string>;
  registry?: unknown;
};

const BASE_ARTICLE_R4 = `---
title: "Artículo R4"
slug: articulo-r4
draft: false
articleLead:
  officialSources:
    - label: "SII"
      href: "https://www.sii.cl/"
  validAsOf: 2026-05-01
---
Cuerpo.
`;

const BASE_ARTICLE_R2 = `---
title: "Artículo R2"
slug: articulo-r2
draft: false
---
Cuerpo.
`;

function fixture(options: FixtureOptions = {}) {
  const root = mkdtempSync(path.join(tmpdir(), "monedario-risk-tiers-"));
  roots.push(root);
  mkdirSync(path.join(root, "src/data/blog"), { recursive: true });
  mkdirSync(path.join(root, "src/pages/calculadoras"), { recursive: true });
  mkdirSync(path.join(root, "src/config"), { recursive: true });
  mkdirSync(path.join(root, "docs/editorial"), { recursive: true });
  writeFileSync(path.join(root, "docs/editorial/RISK_TIERS.md"), "# Política\n");

  const articles = options.articles ?? {
    "articulo-r4.md": BASE_ARTICLE_R4,
    "articulo-r2.md": BASE_ARTICLE_R2,
  };
  for (const [file, content] of Object.entries(articles)) {
    writeFileSync(path.join(root, "src/data/blog", file), content);
  }

  const calculators = options.calculators ?? {
    "calc-uno.astro": '<MethodologyBlock sources={[]} notes="x" />\n',
  };
  for (const [file, content] of Object.entries(calculators)) {
    writeFileSync(path.join(root, "src/pages/calculadoras", file), content);
  }

  const registry = options.registry ?? {
    schemaVersion: 1,
    policy: "docs/editorial/RISK_TIERS.md",
    updated: "2026-10-01",
    articles: { "articulo-r4": "R4", "articulo-r2": "R2" },
    calculators: { "calc-uno": "R4" },
    waivers: [],
  };
  writeFileSync(
    path.join(root, "src/config/editorial-risk-registry.json"),
    JSON.stringify(registry)
  );

  const run = (env: Record<string, string> = {}) =>
    spawnSync("node", [SCRIPT_PATH], {
      encoding: "utf8",
      env: {
        ...process.env,
        RISK_TIERS_ROOT: root,
        RISK_TIERS_TODAY: "2026-10-01",
        ...env,
      },
    });

  return { root, run };
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("check-risk-tiers", () => {
  it("pasa con cobertura completa y R4 con provenance", () => {
    const { root, run } = fixture();
    const result = run();
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("[check-risk-tiers] OK");
    const report = JSON.parse(
      readFileSync(
        path.join(root, "output/validation/risk-tiers/report.json"),
        "utf8"
      )
    );
    expect(report.posts).toBe(2);
    expect(report.calculators).toBe(1);
    expect(report.byTier.R4).toBe(2);
  });

  it("excluye artículos en draft de la cobertura", () => {
    const { run } = fixture({
      articles: {
        "articulo-r4.md": BASE_ARTICLE_R4,
        "articulo-r2.md": BASE_ARTICLE_R2,
        "borrador.md": '---\ntitle: "B"\nslug: borrador\ndraft: true\n---\n',
      },
    });
    const result = run();
    expect(result.status, result.stderr).toBe(0);
  });

  it("falla si un artículo publicado no tiene nivel", () => {
    const { run } = fixture({
      registry: {
        schemaVersion: 1,
        policy: "docs/editorial/RISK_TIERS.md",
        articles: { "articulo-r2": "R2" },
        calculators: { "calc-uno": "R4" },
      },
    });
    const result = run();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("coverage");
  });

  it("falla si el registro referencia contenido inexistente", () => {
    const { run } = fixture({
      registry: {
        schemaVersion: 1,
        policy: "docs/editorial/RISK_TIERS.md",
        articles: {
          "articulo-r4": "R4",
          "articulo-r2": "R2",
          fantasma: "R3",
        },
        calculators: { "calc-uno": "R4" },
      },
    });
    const result = run();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("stale");
  });

  it("falla con un nivel inválido", () => {
    const { run } = fixture({
      registry: {
        schemaVersion: 1,
        policy: "docs/editorial/RISK_TIERS.md",
        articles: { "articulo-r4": "R9", "articulo-r2": "R2" },
        calculators: { "calc-uno": "R4" },
      },
    });
    const result = run();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("nivel inválido");
  });

  it("falla si un R4 no declara officialSources + validAsOf", () => {
    const { run } = fixture({
      articles: {
        "articulo-r4.md":
          '---\ntitle: "R4"\nslug: articulo-r4\ndraft: false\narticleLead:\n  officialSources:\n    - label: "SII"\n      href: "https://www.sii.cl/"\n---\n',
        "articulo-r2.md": BASE_ARTICLE_R2,
      },
    });
    const result = run();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("r4-provenance");
  });

  it("acepta un waiver vigente y lo reporta como advertencia", () => {
    const { run } = fixture({
      articles: {
        "articulo-r4.md":
          '---\ntitle: "R4"\nslug: articulo-r4\ndraft: false\n---\n',
        "articulo-r2.md": BASE_ARTICLE_R2,
      },
      registry: {
        schemaVersion: 1,
        policy: "docs/editorial/RISK_TIERS.md",
        articles: { "articulo-r4": "R4", "articulo-r2": "R2" },
        calculators: { "calc-uno": "R4" },
        waivers: [
          {
            id: "articulo-r4",
            tier: "R4",
            reason: "Backfill de fuentes pendiente en plan editorial.",
            expiresAt: "2026-12-01",
          },
        ],
      },
    });
    const result = run();
    expect(result.status, result.stderr).toBe(0);
    expect(result.stderr).toContain("r4-waiver");
  });

  it("falla si el waiver venció", () => {
    const { run } = fixture({
      articles: {
        "articulo-r4.md":
          '---\ntitle: "R4"\nslug: articulo-r4\ndraft: false\n---\n',
        "articulo-r2.md": BASE_ARTICLE_R2,
      },
      registry: {
        schemaVersion: 1,
        policy: "docs/editorial/RISK_TIERS.md",
        articles: { "articulo-r4": "R4", "articulo-r2": "R2" },
        calculators: { "calc-uno": "R4" },
        waivers: [
          {
            id: "articulo-r4",
            tier: "R4",
            reason: "Backfill de fuentes pendiente en plan editorial.",
            expiresAt: "2026-09-01",
          },
        ],
      },
    });
    const result = run();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("vencido");
  });

  it("falla si una calculadora R4 no usa MethodologyBlock", () => {
    const { run } = fixture({
      calculators: { "calc-uno.astro": "<div>sin fuentes</div>\n" },
    });
    const result = run();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("MethodologyBlock");
  });
});
