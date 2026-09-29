import { describe, expect, it } from "vitest";
import { findAuditArtifactIssues } from "../../scripts/check-audit-artifacts.mjs";

const template = {
  auditId: "plan-115-correctitud",
  protocolVersion: "v1",
  scope: { commit: null, files: [], vectors: [] },
  auditor: { role: "MathAuditAgent", model: null, session: null, date: null },
  method: { commands: [], edgeCases: [] },
  claims: [],
  defects: [],
  verdict: null,
  humanSignoff: null,
};

const passing = {
  ...template,
  scope: { commit: "abc123", files: ["a.ts"], vectors: ["V1"] },
  auditor: {
    role: "MathAuditAgent",
    model: "gpt-x",
    session: "s1",
    date: "2026-09-29",
  },
  claims: [
    {
      id: "C1",
      claim: "vector",
      source: { url: "https://x", quote: "q", retrievedAt: "2026-09-29" },
      reproduction: { command: "pnpm test", output: "evidence/C1.txt" },
      status: "OK",
    },
  ],
  verdict: "PASS",
};

describe("findAuditArtifactIssues", () => {
  it("acepta la plantilla pendiente (verdict null)", () => {
    expect(findAuditArtifactIssues(template)).toEqual([]);
  });

  it("acepta un PASS con claims verificados", () => {
    expect(findAuditArtifactIssues(passing)).toEqual([]);
  });

  it("exige defectos abiertos para FAIL/CONDITIONAL", () => {
    const conditional = { ...passing, verdict: "CONDITIONAL" };
    expect(findAuditArtifactIssues(conditional).join("\n")).toContain(
      "sin defectos abiertos"
    );
    const withDefect = {
      ...conditional,
      defects: [{ id: "D1", severity: "alta", status: "open" }],
    };
    expect(findAuditArtifactIssues(withDefect)).toEqual([]);
  });

  it("exige claims cuando hay veredicto", () => {
    const noClaims = { ...passing, claims: [] };
    expect(findAuditArtifactIssues(noClaims).join("\n")).toContain(
      "sin claims"
    );
  });

  it("rechaza verdict inválido y esquema roto", () => {
    expect(
      findAuditArtifactIssues({ ...template, verdict: "OK" }).join("\n")
    ).toContain("verdict inválido");
    expect(findAuditArtifactIssues({}).join("\n")).toContain("auditId");
    expect(
      findAuditArtifactIssues({ ...template, claims: "no" }).join("\n")
    ).toContain("claims debe ser un array");
  });

  it("valida humanSignoff cuando existe", () => {
    expect(
      findAuditArtifactIssues({
        ...passing,
        humanSignoff: { date: "ayer", reviewer: "" },
      }).join("\n")
    ).toContain("humanSignoff.date");
    expect(
      findAuditArtifactIssues({
        ...passing,
        humanSignoff: { date: "2026-09-29", reviewer: "C. Ortega" },
      })
    ).toEqual([]);
  });
});
