import { describe, expect, it } from "vitest";
import {
  CALCULATOR_DECISION_GUIDES,
  CALCULATOR_FAMILIES,
  CALCULATOR_FOOTER_SHORTCUTS,
  CALCULATOR_FAMILY_ORDER,
  CALCULATOR_PORTFOLIO,
} from "@/config/calculatorPortfolio";

describe("calculator portfolio registry", () => {
  it("keeps every calculator in a declared family", () => {
    const familyIds = new Set(CALCULATOR_FAMILY_ORDER);

    expect(CALCULATOR_PORTFOLIO).toHaveLength(19);
    expect(CALCULATOR_FAMILY_ORDER).toHaveLength(4);

    for (const calculator of CALCULATOR_PORTFOLIO) {
      expect(familyIds.has(calculator.family)).toBe(true);
      expect(calculator.primaryJtbd.trim().length).toBeGreaterThan(10);
      expect(calculator.whenToUse.trim().length).toBeGreaterThan(10);
      expect(calculator.notFor.trim().length).toBeGreaterThan(10);
    }
  });

  it("does not duplicate calculator routes and keeps every family populated", () => {
    const hrefs = CALCULATOR_PORTFOLIO.map(calculator => calculator.href);
    const uniqueHrefs = new Set(hrefs);

    expect(uniqueHrefs.size).toBe(hrefs.length);

    for (const familyId of CALCULATOR_FAMILY_ORDER) {
      expect(CALCULATOR_FAMILIES[familyId]).toBeDefined();
      expect(
        CALCULATOR_PORTFOLIO.some(calculator => calculator.family === familyId)
      ).toBe(true);
    }

    for (const calculator of CALCULATOR_PORTFOLIO) {
      for (const related of calculator.related) {
        expect(uniqueHrefs.has(related.href)).toBe(true);
        expect(related.label.trim().length).toBeGreaterThan(3);
        expect(related.when.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it("keeps chooser guides aligned with existing calculators", () => {
    const hrefs = new Set(CALCULATOR_PORTFOLIO.map(calculator => calculator.href));

    expect(CALCULATOR_DECISION_GUIDES.length).toBeGreaterThanOrEqual(8);

    for (const guide of CALCULATOR_DECISION_GUIDES) {
      expect(guide.title.trim().length).toBeGreaterThan(5);
      expect(guide.situation.trim().length).toBeGreaterThan(10);
      expect(guide.why.trim().length).toBeGreaterThan(10);
      expect(hrefs.has(guide.recommendedHref)).toBe(true);
    }
  });

  it("derives footer shortcuts from selected calculator entries", () => {
    const hrefs = new Set(CALCULATOR_PORTFOLIO.map(calculator => calculator.href));
    const shortcutHrefs = CALCULATOR_FOOTER_SHORTCUTS.map(shortcut => shortcut.href);

    expect(shortcutHrefs).toEqual([
      "/calculadoras/sueldo-liquido/",
      "/calculadoras/apv/",
      "/calculadoras/credito-consumo/",
      "/calculadoras/conversor-uf/",
    ]);

    for (const shortcut of CALCULATOR_FOOTER_SHORTCUTS) {
      expect(hrefs.has(shortcut.href)).toBe(true);
      expect(shortcut.label.trim().length).toBeGreaterThan(3);
    }
  });
});
