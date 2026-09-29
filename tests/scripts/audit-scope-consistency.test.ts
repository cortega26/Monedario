import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AT2026 } from "@/domain/taxation/TaxYearParameters";

/**
 * Guarda del paquete de auditoría (plan 126): los claims del alcance deben
 * citar los valores y citas vigentes del motor/registro. Evita la cadena de
 * residuales D11/D13 (scope desincronizado tras cada remediación).
 */
const scope = JSON.parse(
  readFileSync("docs/editorial/audits/plan-115-correctitud/00-scope.json", "utf8")
) as {
  scope: {
    vectors: Array<{ id: string; claim: string }>;
    sources: Array<{ id: string; label: string }>;
  };
};

const claims = Object.fromEntries(
  scope.scope.vectors.map(vector => [vector.id, vector.claim])
);
const sources = Object.fromEntries(
  scope.scope.sources.map(source => [source.id, source.label])
);

describe("audit scope claims aligned with engine constants", () => {
  it("V6 cita la UF del 31-12-2025 (art. 42 bis), no la del 1-dic", () => {
    const uf = AT2026.ufDecember.toLocaleString("es-CL", {
      minimumFractionDigits: 2,
    });
    expect(claims.V6).toContain(uf);
    expect(claims.V6).not.toContain("39.643");
    expect(claims.V6).toContain(
      AT2026.uta.toLocaleString("es-CL", { maximumFractionDigits: 0 })
    );
  });

  it("V4 describe la tasa media del retiro (ΔIGC/retiro), no la marginal", () => {
    expect(claims.V4).toMatch(/tasa media/i);
    expect(claims.V4).not.toMatch(/tasa marginal/i);
  });

  it("V5/V3 y S2 no conservan citas derogadas", () => {
    // V5 puede mencionar "acreedores distintos" solo para negarlo.
    expect(claims.V5).toMatch(/obligaciones vencidas/);
    expect(claims.V5).not.toMatch(/≥2 acreedores/);
    expect(claims.V3).toMatch(/inciso 2° N°1/);
    expect(sources.S2).toMatch(/inciso 2° N°1/);
    expect(sources.S2).not.toMatch(/N°4/);
  });
});
