import { describe, expect, it } from "vitest";
import { calculateHonorariosNet } from "@/application/use-cases/CalculateHonorariosNet";
import { honorariosWorkedExample } from "@/application/use-cases/CalculateHonorariosNet.methodology";

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

describe("calculateHonorariosNet — ejemplo de metodología (anti-drift)", () => {
  it("la retención y el líquido reales coinciden con el ejemplo publicado", () => {
    const result = calculateHonorariosNet(honorariosWorkedExample.input);
    expect(result.withholdingAmount).toBe(
      honorariosWorkedExample.expected.withholdingAmount
    );
    expect(result.netFeeReceived).toBe(
      honorariosWorkedExample.expected.netFeeReceived
    );
  });
});

describe("calculateHonorariosNet — currentDate inválido", () => {
  it.each(["2026-08-19T15:00:00", "2026-8-5", "not-a-date"])(
    "lanza en vez de ventana NaN para %s",
    currentDate => {
      expect(() =>
        calculateHonorariosNet({ grossFee: 500000, currentDate })
      ).toThrow("currentDate must be an ISO date in YYYY-MM-DD format.");
    }
  );
});
