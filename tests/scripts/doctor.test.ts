import { describe, expect, it } from "vitest";

import {
  DOCTOR_CATEGORIES,
  classifyDoctorOutput,
} from "../../scripts/lib/doctor-rules.mjs";

describe("classifyDoctorOutput", () => {
  it("clasifica formato como mechanical", () => {
    const findings = classifyDoctorOutput(
      "Checking formatting...\n[warn] src/pages/x.astro\nCode style issues found in 1 file."
    );
    expect(findings).toEqual([{ rule: "prettier-format", category: "mechanical" }]);
    expect(DOCTOR_CATEGORIES.mechanical.owner).toBe("self-heal");
  });

  it("clasifica lockfile desincronizado como mechanical", () => {
    const findings = classifyDoctorOutput(
      "[ERR_PNPM_LOCKFILE_CONFIG_MISMATCH] Cannot proceed with the frozen installation."
    );
    expect(findings).toEqual([
      { rule: "pnpm-lockfile-mismatch", category: "mechanical" },
    ]);
  });

  it("clasifica lastmod faltante como mechanical", () => {
    const findings = classifyDoctorOutput(
      "dist/sitemap-0.xml missing lastmod for https://monedario.cl/x/"
    );
    expect(findings).toEqual([
      { rule: "page-lastmod-missing", category: "mechanical" },
    ]);
  });

  it("clasifica snapshot vencido como data", () => {
    const findings = classifyDoctorOutput(
      "[check-economic-snapshot-freshness] snapshot capturedAt too old"
    );
    expect(findings).toEqual([
      { rule: "economic-snapshot-stale", category: "data" },
    ]);
  });

  it("clasifica frontmatter y timeliness como editorial", () => {
    const findings = classifyDoctorOutput(
      "[check-frontmatter] Field title is required\n[check-editorial-timeliness] stale=1"
    );
    expect(findings).toEqual([
      { rule: "frontmatter", category: "editorial" },
      { rule: "editorial-timeliness", category: "editorial" },
    ]);
  });

  it("clasifica riesgo R4 como editorial", () => {
    const findings = classifyDoctorOutput(
      "check-risk-tiers:r4-provenance articles/x: R4 requiere articleLead.officialSources"
    );
    expect(findings).toEqual([{ rule: "risk-tiers", category: "editorial" }]);
  });

  it("clasifica post.id y rutas como contract", () => {
    const findings = classifyDoctorOutput(
      "[check-no-postid-urls] forbidden post.id pattern\ncheck-indexable-url-freeze failed"
    );
    expect(findings).toEqual([
      { rule: "no-postid-urls", category: "contract" },
      { rule: "routes-freeze", category: "contract" },
    ]);
  });

  it("marca salida sin regla como unknown", () => {
    const findings = classifyDoctorOutput("algo raro pasó aquí");
    expect(findings).toEqual([{ rule: "unclassified", category: "unknown" }]);
  });

  it("devuelve vacío sin salida", () => {
    expect(classifyDoctorOutput("")).toEqual([]);
  });
});
