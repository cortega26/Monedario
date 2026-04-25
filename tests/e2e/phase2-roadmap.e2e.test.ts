import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const roadmapPath =
  "docs/backlog/MONEDARIO_PHASE_2_HIGH_VALUE_ROADMAP_2026-04-24.md";
const ccrPath = "docs/backlog/MONEDARIO_WAVE1_CCR_2026-04-24.md";
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("Phase 2 high-value roadmap", () => {
  it("is versioned in docs/backlog and unignored explicitly", () => {
    expect(existsSync(join(root, roadmapPath))).toBe(true);

    const gitignore = read(".gitignore");
    expect(gitignore).toContain(
      "!docs/backlog/MONEDARIO_PHASE_2_HIGH_VALUE_ROADMAP_2026-04-24.md"
    );
  });

  it("documents governance, adaptation, rollback, verification, and closure", () => {
    const roadmap = read(roadmapPath);

    expect(roadmap).toContain("Scope Declaration");
    expect(roadmap).toContain("Authority Check");
    expect(roadmap).toContain("Competitive Adaptation Appendix");
    expect(roadmap).toContain("Rollback Strategy");
    expect(roadmap).toContain("Test Plan");
    expect(roadmap).toContain("Deterministic Closure Criteria");
  });

  it("preserves the required invariants and contracts", () => {
    const roadmap = read(roadmapPath);

    for (const requiredReference of [
      "URL.PUBLIC.NO_POST_ID",
      "ROUTES.NO_SILENT_CHANGES",
      "RSS.NO_REMOVALS",
      "FRONTMATTER.VALID",
      "CONTRACT.PUBLIC_URLS",
      "CONTRACT.EDITORIAL.META_DESCRIPTION",
      "CONTRACT.YMYL_RESPONSE_STRUCTURE",
    ]) {
      expect(roadmap).toContain(requiredReference);
    }
  });

  it("covers all five requested implementation waves", () => {
    const roadmap = read(roadmapPath);

    for (const wave of [
      "Wave 1: UX and Technical SEO Without New YMYL",
      "Wave 2: Calculators as Journeys",
      "Wave 3: Glossary and Interlinking Layer",
      "Wave 4: Hubs and Pillar-Page Pattern",
      "Wave 5: Editorial Pipeline Preparation",
    ]) {
      expect(roadmap).toContain(wave);
    }
  });

  it("keeps YMYL publication blocked until the editorial pipeline is complete", () => {
    const roadmap = read(roadmapPath);

    expect(roadmap).toContain(
      "This roadmap does not authorize publishing new YMYL content by itself."
    );
    expect(roadmap).toContain("docs/editorial/NORMA_YMYL.md");
    expect(roadmap).toContain("role separation");
    expect(roadmap).toContain("human sign-off");
  });

  it("defines the strategic editorial artifact opportunities without publishing them", () => {
    const roadmap = read(roadmapPath);

    for (const opportunity of [
      "salir de DICOM / Boletín Comercial",
      "revisar cotizaciones previsionales impagas",
      "wizard licencia médica",
      "centro Operación Renta",
      "comparador AFP ampliado",
      "fraude/cargo no reconocido 24 horas",
    ]) {
      expect(roadmap).toContain(opportunity);
    }

    expect(roadmap).toContain("unpublished");
  });

  it("preserves the strategic parking lot items from the benchmark", () => {
    const roadmap = read(roadmapPath);

    expect(roadmap).toContain("Strategic Parking Lot");

    for (const item of [
      "Public official sources page",
      '"Fuentes consultadas" disclosure',
      "Anonymous usefulness feedback",
      "More visible freshness indicators",
      "Cross-hub learning routes",
      "Orphan article remediation micro-backlog",
      "Lighthouse/Core Web Vitals design gate",
      "Lightweight comparators without live-market promises",
    ]) {
      expect(roadmap).toContain(item);
    }
  });
});

describe("Wave 1 CCR governance", () => {
  it("CCR file exists and is unignored in .gitignore", () => {
    expect(existsSync(join(root, ccrPath))).toBe(true);

    const gitignore = read(".gitignore");
    expect(gitignore).toContain("!docs/backlog/MONEDARIO_WAVE1_CCR_2026-04-24.md");
  });

  it("CCR contains all required governance sections", () => {
    const ccr = read(ccrPath);

    expect(ccr).toContain("Scope Declaration");
    expect(ccr).toContain("Authority Check");
    expect(ccr).toContain("Competitive Adaptation Appendix");
    expect(ccr).toContain("Rollback Strategy");
    expect(ccr).toContain("Test Plan");
    expect(ccr).toContain("Deterministic Closure Criteria");
  });

  it("CCR declares YMYL publication remains blocked", () => {
    const ccr = read(ccrPath);

    expect(ccr).toContain("NORMA_YMYL.md");
    expect(ccr).toContain("human sign-off");
  });

  it("CCR references all required invariants and contracts", () => {
    const ccr = read(ccrPath);

    for (const ref of [
      "URL.PUBLIC.NO_POST_ID",
      "ROUTES.NO_SILENT_CHANGES",
      "RSS.NO_REMOVALS",
      "FRONTMATTER.VALID",
      "CONTRACT.EDITORIAL.META_DESCRIPTION",
    ]) {
      expect(ccr).toContain(ref);
    }
  });
});

describe("Wave 2 CCR governance", () => {
  const wave2CcrPath = "docs/backlog/MONEDARIO_WAVE2_CCR_2026-04-24.md";

  it("Wave 2 CCR file exists and is unignored in .gitignore", () => {
    expect(existsSync(join(root, wave2CcrPath))).toBe(true);

    const gitignore = read(".gitignore");
    expect(gitignore).toContain("!docs/backlog/MONEDARIO_WAVE2_CCR_2026-04-24.md");
  });

  it("Wave 2 CCR contains all required governance sections", () => {
    const ccr = read(wave2CcrPath);

    expect(ccr).toContain("Scope Declaration");
    expect(ccr).toContain("Authority Check");
    expect(ccr).toContain("Competitive Adaptation Appendix");
    expect(ccr).toContain("Rollback Strategy");
    expect(ccr).toContain("Test Plan");
    expect(ccr).toContain("Deterministic Closure Criteria");
  });

  it("Wave 2 CCR declares YMYL publication remains blocked", () => {
    const ccr = read(wave2CcrPath);

    expect(ccr).toContain("NORMA_YMYL.md");
    expect(ccr).toContain("human sign-off");
  });

  it("Wave 2 CCR references all required invariants and contracts", () => {
    const ccr = read(wave2CcrPath);

    for (const ref of [
      "URL.PUBLIC.NO_POST_ID",
      "ROUTES.NO_SILENT_CHANGES",
      "RSS.NO_REMOVALS",
      "FRONTMATTER.VALID",
      "CONTRACT.EDITORIAL.META_DESCRIPTION",
    ]) {
      expect(ccr).toContain(ref);
    }
  });

  it("Wave 2 CCR documents the 6 target calculator surfaces", () => {
    const ccr = read(wave2CcrPath);

    for (const slug of [
      "sueldo-liquido",
      "finiquito-indemnizacion",
      "operacion-renta",
      "credito-consumo",
      "tarjeta-credito",
      "apv",
    ]) {
      expect(ccr).toContain(slug);
    }
  });
});

describe("Wave 3 CCR governance", () => {
  const wave3CcrPath = "docs/backlog/MONEDARIO_WAVE3_CCR_2026-04-24.md";

  it("Wave 3 CCR file exists and is unignored in .gitignore", () => {
    expect(existsSync(join(root, wave3CcrPath))).toBe(true);

    const gitignore = read(".gitignore");
    expect(gitignore).toContain("!docs/backlog/MONEDARIO_WAVE3_CCR_2026-04-24.md");
  });

  it("Wave 3 CCR contains all required governance sections", () => {
    const ccr = read(wave3CcrPath);

    expect(ccr).toContain("Scope Declaration");
    expect(ccr).toContain("Authority Check");
    expect(ccr).toContain("Competitive Adaptation Appendix");
    expect(ccr).toContain("Rollback Strategy");
    expect(ccr).toContain("Test Plan");
    expect(ccr).toContain("Deterministic Closure Criteria");
  });

  it("Wave 3 CCR declares YMYL publication remains blocked", () => {
    const ccr = read(wave3CcrPath);

    expect(ccr).toContain("NORMA_YMYL.md");
    expect(ccr).toContain("human sign-off");
  });

  it("Wave 3 CCR references all required invariants and contracts", () => {
    const ccr = read(wave3CcrPath);

    for (const ref of [
      "URL.PUBLIC.NO_POST_ID",
      "ROUTES.NO_SILENT_CHANGES",
      "RSS.NO_REMOVALS",
      "FRONTMATTER.VALID",
      "CONTRACT.EDITORIAL.META_DESCRIPTION",
    ]) {
      expect(ccr).toContain(ref);
    }
  });

  it("Wave 3 CCR documents all 11 allowlist terms", () => {
    const ccr = read(wave3CcrPath);

    for (const term of [
      "AFP",
      "AFC",
      "UF",
      "UTM",
      "CAE",
      "DICOM",
      "Finiquito",
      "APV",
      "IPC",
      "SII",
      "CMF",
    ]) {
      expect(ccr).toContain(term);
    }
  });
});
