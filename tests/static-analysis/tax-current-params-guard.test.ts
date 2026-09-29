import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Plan 115 / ADR-20260929: la capa tributaria no puede leer parámetros
 * económicos "vigentes". Debe usar `TaxYearRegistry` (bundle congelado por año
 * tributario).
 */

const REPO_ROOT = process.cwd();

const TAX_SOURCES = [
  ...readdirSync(path.join(REPO_ROOT, "src", "domain", "taxation"))
    .filter(file => file.endsWith(".ts"))
    .map(file => path.join("src", "domain", "taxation", file)),
  path.join("src", "application", "use-cases", "SimulateOperacionRenta.ts"),
  path.join(
    "src",
    "application",
    "use-cases",
    "SimulateOperacionRenta.methodology.ts"
  ),
];

const FORBIDDEN_TOKENS = [
  "@/application/use-cases/GetEconomicParameters",
  "@/infrastructure/economic/",
  "economic-parameters.snapshot",
];

describe("tax calculations never read current economic parameters", () => {
  it("scans the tax sources", () => {
    expect(TAX_SOURCES.length).toBeGreaterThanOrEqual(4);
  });

  for (const file of TAX_SOURCES) {
    it(`${file} no importa parámetros vigentes`, () => {
      const source = readFileSync(path.join(REPO_ROOT, file), "utf8");
      for (const token of FORBIDDEN_TOKENS) {
        expect(
          source.includes(token),
          `${file} contiene "${token}"`
        ).toBe(false);
      }
    });
  }
});
