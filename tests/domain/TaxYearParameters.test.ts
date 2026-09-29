import { describe, expect, it } from "vitest";
import {
  AT2026,
  igcSecondBracketDeduction,
} from "@/domain/taxation/TaxYearParameters";

describe("TaxYearParameters.AT2026", () => {
  it("congela los años comercial, tributario y de presentación", () => {
    expect(AT2026.taxYear).toBe(2026);
    expect(AT2026.commercialYear).toBe(2025);
    expect(AT2026.filingYear).toBe(2026);
  });

  it("usa la UTA de cierre dic-2025 y la UF de diciembre", () => {
    expect(AT2026.uta).toBe(834_504);
    expect(AT2026.ufDecember).toBe(39_643.59);
  });

  it("reproduce la rebaja SII del segundo tramo ($450.632,16)", () => {
    expect(igcSecondBracketDeduction(AT2026)).toBeCloseTo(450_632.16, 2);
  });

  it("fija la retención de honorarios de boletas 2025 en 14,5%", () => {
    expect(AT2026.honorariosPpmRate).toBe(0.145);
  });
});
