import { describe, expect, it } from "vitest";
import { estimateFiniquito } from "@/application/use-cases/EstimateFiniquito";

describe("estimateFiniquito", () => {
  it("estimates years of service, substitute notice and proportional vacation", () => {
    const result = estimateFiniquito({
      monthlySalary: 900000,
      yearsWorked: 4,
      additionalMonthsWorked: 7,
      pendingSalaryDays: 12,
      monthsSinceLastVacationCycle: 8,
      additionalVacationDaysWorked: 15,
      terminationCause: "necesidad",
      noticeGiven: false,
    });

    expect(result.serviceYearsCounted).toBe(5);
    expect(result.cappedServiceYears).toBe(5);
    expect(result.pendingSalaryAmount).toBe(360000);
    expect(result.proportionalVacationDays).toBeCloseTo(10.625, 6);
    expect(result.proportionalVacationAmount).toBeCloseTo(318750, 6);
    expect(result.yearsOfServiceIndemnity).toBe(4500000);
    expect(result.substituteNoticeIndemnity).toBe(900000);
    // No judicial cause → no surcharge, no gratificación
    expect(result.art168SurchargePercent).toBe(0);
    expect(result.art168SurchargeAmount).toBe(0);
    expect(result.gratificacionProporcionalAmount).toBe(0);
    expect(result.totalEstimate).toBeCloseTo(6078750, 6);
  });

  it("applies the 11-year cap and removes legal indemnities when the cause does not qualify", () => {
    const result = estimateFiniquito({
      monthlySalary: 1200000,
      yearsWorked: 14,
      additionalMonthsWorked: 2,
      monthsSinceLastVacationCycle: 3,
      terminationCause: "renuncia",
      noticeGiven: false,
    });

    expect(result.serviceYearsCounted).toBe(14);
    expect(result.cappedServiceYears).toBe(11);
    expect(result.yearsOfServiceIndemnity).toBe(0);
    expect(result.substituteNoticeIndemnity).toBe(0);
    expect(result.proportionalVacationAmount).toBeCloseTo(150000, 6);
  });

  it("marks judicial cases for professional review while keeping a base estimate", () => {
    const result = estimateFiniquito({
      monthlySalary: 1000000,
      yearsWorked: 2,
      additionalMonthsWorked: 6,
      terminationCause: "judicial",
      noticeGiven: true,
    });

    expect(result.compensationProfile.appliesYearsOfService).toBe(true);
    expect(result.compensationProfile.appliesSubstituteNotice).toBe(false);
    expect(result.compensationProfile.requiresProfessionalReview).toBe(true);
    expect(result.yearsOfServiceIndemnity).toBe(3000000);
  });

  // ── BUG-FINIQ-002: art. 168 CT surcharge — three tramos ─────────────────
  it("art. 168 tramo 1 (≤3 years): applies 30% surcharge on judicial dismissal", () => {
    // 2 years + 4 months → serviceYearsCounted = 2 (< 6 months, no round-up) → tramo ≤3 → 30%
    const result = estimateFiniquito({
      monthlySalary: 800000,
      yearsWorked: 2,
      additionalMonthsWorked: 4,
      terminationCause: "judicial",
      noticeGiven: true,
    });

    expect(result.serviceYearsCounted).toBe(2);
    expect(result.art168SurchargePercent).toBe(0.3);
    // yearsOfServiceIndemnity = 2 × 800000 = 1600000
    expect(result.yearsOfServiceIndemnity).toBe(1600000);
    // surcharge = 1600000 × 0.30 = 480000
    expect(result.art168SurchargeAmount).toBe(480000);
    expect(result.compensationProfile.requiresProfessionalReview).toBe(true);
    // totalEstimate includes the surcharge
    expect(result.totalEstimate).toBeCloseTo(
      result.yearsOfServiceIndemnity +
        result.art168SurchargeAmount +
        result.proportionalVacationAmount +
        result.pendingSalaryAmount,
      2
    );
  });

  it("art. 168 tramo 2 (>3 and ≤6 years): applies 50% surcharge on judicial dismissal", () => {
    // 4 years + 7 months → serviceYearsCounted = 5 → tramo >3 and ≤6 → 50%
    const result = estimateFiniquito({
      monthlySalary: 1000000,
      yearsWorked: 4,
      additionalMonthsWorked: 7,
      terminationCause: "judicial",
      noticeGiven: false,
    });

    expect(result.serviceYearsCounted).toBe(5);
    expect(result.art168SurchargePercent).toBe(0.5);
    // yearsOfServiceIndemnity = 5 × 1000000 = 5000000
    expect(result.yearsOfServiceIndemnity).toBe(5000000);
    // surcharge = 5000000 × 0.50 = 2500000
    expect(result.art168SurchargeAmount).toBe(2500000);
  });

  it("art. 168 tramo 3 (>6 years): applies 80% surcharge on judicial dismissal", () => {
    // 8 years + 0 months → serviceYearsCounted = 8 → tramo >6 → 80%
    const result = estimateFiniquito({
      monthlySalary: 1200000,
      yearsWorked: 8,
      terminationCause: "judicial",
      noticeGiven: true,
    });

    expect(result.serviceYearsCounted).toBe(8);
    expect(result.art168SurchargePercent).toBe(0.8);
    // yearsOfServiceIndemnity = 8 × 1200000 = 9600000
    expect(result.yearsOfServiceIndemnity).toBe(9600000);
    // surcharge = 9600000 × 0.80 = 7680000
    expect(result.art168SurchargeAmount).toBe(7680000);
  });

  it("non-judicial cause has zero art. 168 surcharge", () => {
    const result = estimateFiniquito({
      monthlySalary: 1000000,
      yearsWorked: 10,
      terminationCause: "necesidad",
      noticeGiven: false,
    });

    expect(result.art168SurchargePercent).toBe(0);
    expect(result.art168SurchargeAmount).toBe(0);
  });

  // ── BUG-FINIQ-001: gratificación proporcional ────────────────────────────
  it("art. 50 (gratificacionAnual = false): proportional gratification is zero", () => {
    const result = estimateFiniquito({
      monthlySalary: 900000,
      yearsWorked: 3,
      additionalMonthsWorked: 6,
      terminationCause: "renuncia",
      gratificacionAnual: false,
    });

    expect(result.gratificacionProporcionalAmount).toBe(0);
  });

  it("art. 47 (gratificacionAnual = true): adds proportional gratification to total", () => {
    // 3 years + 8 months; gratificacion pro-rated over 8 months
    const result = estimateFiniquito({
      monthlySalary: 900000,
      yearsWorked: 3,
      additionalMonthsWorked: 8,
      terminationCause: "necesidad",
      noticeGiven: true,
      gratificacionAnual: true,
    });

    // proportional gratification = 900000 × 8 / 12 = 600000
    expect(result.gratificacionProporcionalAmount).toBeCloseTo(600000, 6);
    // totalEstimate must include it
    expect(result.totalEstimate).toBeCloseTo(
      result.yearsOfServiceIndemnity +
        result.substituteNoticeIndemnity +
        result.proportionalVacationAmount +
        result.pendingSalaryAmount +
        result.art168SurchargeAmount +
        result.gratificacionProporcionalAmount,
      2
    );
  });

  it("art. 47 with zero additionalMonthsWorked results in zero proportional gratification", () => {
    const result = estimateFiniquito({
      monthlySalary: 900000,
      yearsWorked: 3,
      additionalMonthsWorked: 0,
      terminationCause: "necesidad",
      noticeGiven: true,
      gratificacionAnual: true,
    });

    expect(result.gratificacionProporcionalAmount).toBe(0);
  });
});
