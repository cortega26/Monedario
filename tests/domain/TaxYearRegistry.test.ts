import { describe, expect, it } from "vitest";
import {
  getTaxYearForCommercialYear,
  getTaxYearParameters,
  TAX_YEAR_PARAMETERS,
} from "@/domain/taxation/TaxYearRegistry";
import { AT2026 } from "@/domain/taxation/TaxYearParameters";

describe("TaxYearRegistry", () => {
  it("exposes the registered tax years", () => {
    expect(TAX_YEAR_PARAMETERS).toContain(AT2026);
  });

  it("resolves parameters by tax year", () => {
    expect(getTaxYearParameters(2026)).toBe(AT2026);
  });

  it("resolves parameters by commercial year", () => {
    expect(getTaxYearForCommercialYear(2025)).toBe(AT2026);
  });

  it("fails closed for an unregistered tax year", () => {
    expect(() => getTaxYearParameters(2027)).toThrow(
      "No hay parámetros fiscales registrados para el año tributario 2027."
    );
  });

  it("fails closed for an unregistered commercial year", () => {
    expect(() => getTaxYearForCommercialYear(2024)).toThrow(
      "No hay parámetros fiscales registrados para el año comercial 2024."
    );
  });
});
