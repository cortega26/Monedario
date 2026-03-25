import { describe, expect, it } from "vitest";
import { calculateHonorariosNet } from "@/application/use-cases/CalculateHonorariosNet";

describe("calculateHonorariosNet", () => {
  it("calculates monthly net and annual coverage base using the 2026 retention", () => {
    const result = calculateHonorariosNet({
      grossFee: 500000,
      issuedMonthsPerYear: 10,
      currentDate: "2026-03-25",
    });

    expect(result.withholdingRatePercent).toBe(15.25);
    expect(result.withholdingAmount).toBe(76250);
    expect(result.netFeeReceived).toBe(423750);
    expect(result.annualGrossFees).toBe(5000000);
    expect(result.annualCoverageBase).toBe(4000000);
    expect(result.monthlyCoverageBaseEquivalent).toBeCloseTo(333333.3333, 3);
    // Ventana fiscal vigente: julio 2025 – junio 2026
    expect(result.annualCoverageWindow.startsOn).toBe("2025-07-01");
    expect(result.annualCoverageWindow.endsOn).toBe("2026-06-30");
  });

  it("returns the next fiscal year window when called in July or later", () => {
    const result = calculateHonorariosNet({
      grossFee: 500000,
      currentDate: "2026-09-01",
    });

    expect(result.annualCoverageWindow.startsOn).toBe("2026-07-01");
    expect(result.annualCoverageWindow.endsOn).toBe("2027-06-30");
  });

  it("allows an explicit annual gross amount when monthly issuance is irregular", () => {
    const result = calculateHonorariosNet({
      grossFee: 250000,
      annualGrossFees: 3600000,
      withholdingRatePercent: 16,
    });

    expect(result.withholdingAmount).toBe(40000);
    expect(result.netFeeReceived).toBe(210000);
    expect(result.annualGrossFees).toBe(3600000);
    expect(result.annualWithholdingAmount).toBe(576000);
    expect(result.annualCoverageBase).toBe(2880000);
  });
});
