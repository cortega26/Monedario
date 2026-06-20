import { describe, expect, it } from "vitest";
import { simulateDebtRenegotiation } from "@/application/use-cases/SimulateDebtRenegotiation";
import { debtRenegotiationWorkedExample } from "@/application/use-cases/SimulateDebtRenegotiation.methodology";

const UF = 39300;

describe("simulateDebtRenegotiation", () => {
  it("requires more than 90 days of arrears, not just 90", () => {
    const result = simulateDebtRenegotiation({
      debts: [
        { amount: 2000000, overdueDays: 90 },
        { amount: 1800000, overdueDays: 91 },
      ],
      monthlyIncome: 1000000,
      termMonths: 36,
      monthlyRatePercent: 1.2,
      ufValue: UF,
      hasFirstCategoryActivityLast24Months: false,
      hasNotifiedExecutiveProceeding: false,
      hasRequiredDocuments: true,
    });

    expect(result.minimumOverdueDays).toBe(91);
    expect(result.qualifiedDebtCount).toBe(1);
    expect(result.meetsBasicEligibility).toBe(false);
    expect(result.canSubmitApplication).toBe(false);
  });

  it("blocks the legal filter when there was first-category activity in the last 24 months", () => {
    const result = simulateDebtRenegotiation({
      debts: [
        { amount: 2000000, overdueDays: 120 },
        { amount: 1800000, overdueDays: 150 },
      ],
      monthlyIncome: 1000000,
      termMonths: 36,
      monthlyRatePercent: 1.2,
      ufValue: UF,
      hasFirstCategoryActivityLast24Months: true,
      hasNotifiedExecutiveProceeding: false,
      hasRequiredDocuments: true,
    });

    expect(result.requirementChecks.hasNoFirstCategoryActivity).toBe(false);
    expect(result.meetsBasicEligibility).toBe(false);
    expect(result.canSubmitApplication).toBe(false);
  });

  it("distinguishes between meeting the basic filter and being ready to submit formally", () => {
    const result = simulateDebtRenegotiation({
      debts: [
        { amount: 2000000, overdueDays: 120 },
        { amount: 1800000, overdueDays: 150 },
      ],
      monthlyIncome: 1000000,
      termMonths: 36,
      monthlyRatePercent: 1.2,
      ufValue: UF,
      hasFirstCategoryActivityLast24Months: false,
      hasNotifiedExecutiveProceeding: false,
      hasRequiredDocuments: false,
    });

    expect(result.meetsBasicEligibility).toBe(true);
    expect(result.requirementChecks.hasRequiredDocuments).toBe(false);
    expect(result.canSubmitApplication).toBe(false);
  });

  describe("ejemplo de metodología — anti-drift", () => {
    it("la cuota consolidada real coincide con el ejemplo publicado", () => {
      // Si la fórmula cambia y el ejemplo mostrado al usuario queda
      // desactualizado, este test falla.
      const result = simulateDebtRenegotiation(
        debtRenegotiationWorkedExample.input
      );
      const expected = debtRenegotiationWorkedExample.expected;
      expect(result.totalDebtClp).toBe(expected.totalDebtClp);
      expect(result.monthlyPayment).toBeCloseTo(expected.monthlyPayment, 6);
      expect(result.totalInterest).toBeCloseTo(expected.totalInterest, 6);
      // La UI redondea a pesos enteros; comparamos lo que ve el usuario.
      expect(Math.round(result.monthlyPayment)).toBe(
        expected.monthlyPaymentRounded
      );
      expect(Math.round(result.totalInterest)).toBe(
        expected.totalInterestRounded
      );
    });
  });
});
