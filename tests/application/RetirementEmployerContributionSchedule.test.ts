import { describe, expect, it } from "vitest";
import { getEmployerContributionToIndividualAccountPercentForDate } from "@/application/use-cases/shared/retirementEmployerContributionSchedule";

describe("retirement employer contribution schedule", () => {
  it("returns 0 for dates before the first band (before 2025-08-01)", () => {
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2025-03-01"),
    ).toBe(0);
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2024-12-31"),
    ).toBe(0);
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2024-01-01"),
    ).toBe(0);
  });

  it("returns 0.1 for the first band (2025-08-01 to 2026-07-31)", () => {
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2025-08-01"),
    ).toBe(0.1);
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2026-01-15"),
    ).toBe(0.1);
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2026-07-31"),
    ).toBe(0.1);
  });

  it("returns 0.25 for the second band (2026-08-01 to 2027-07-31)", () => {
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2026-08-01"),
    ).toBe(0.25);
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2027-05-01"),
    ).toBe(0.25);
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2027-07-31"),
    ).toBe(0.25);
  });

  it("returns 0.5 for the third band (2027-08-01 to 2028-07-31)", () => {
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2027-08-01"),
    ).toBe(0.5);
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2028-01-01"),
    ).toBe(0.5);
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2028-07-31"),
    ).toBe(0.5);
  });

  it("returns 0.75 for the fourth band (2028-08-01 to 2029-07-31)", () => {
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2028-08-01"),
    ).toBe(0.75);
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2029-07-31"),
    ).toBe(0.75);
  });

  it("returns 1 for the fifth band (2029-08-01 to 2030-07-31)", () => {
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2029-08-01"),
    ).toBe(1);
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2030-07-31"),
    ).toBe(1);
  });

  it("returns 1.5 for the sixth band (2030-08-01 to 2031-07-31)", () => {
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2030-08-01"),
    ).toBe(1.5);
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2031-07-31"),
    ).toBe(1.5);
  });

  it("returns 2 for the seventh band (2031-08-01 to 2032-07-31)", () => {
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2031-08-01"),
    ).toBe(2);
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2032-07-31"),
    ).toBe(2);
  });

  it("returns 3 for the eighth band (2032-08-01 to 2033-07-31)", () => {
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2032-08-01"),
    ).toBe(3);
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2033-07-31"),
    ).toBe(3);
  });

  it("returns 4.5 for the open-ended band (2033-08-01 and later)", () => {
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2033-08-01"),
    ).toBe(4.5);
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2040-01-01"),
    ).toBe(4.5);
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("2050-12-31"),
    ).toBe(4.5);
  });

  it("returns 0 for an invalid date string", () => {
    expect(
      getEmployerContributionToIndividualAccountPercentForDate("not-a-date"),
    ).toBe(0);
    expect(
      getEmployerContributionToIndividualAccountPercentForDate(""),
    ).toBe(0);
  });

  it("transition at startsOn boundary belongs to the new band, not the old", () => {
    // 2026-08-01 is the startsOn of band 2 (0.25), not band 1 (0.1)
    const beforeTransition =
      getEmployerContributionToIndividualAccountPercentForDate("2026-07-31");
    const atTransition =
      getEmployerContributionToIndividualAccountPercentForDate("2026-08-01");

    expect(beforeTransition).toBe(0.1);
    expect(atTransition).toBe(0.25);
  });
});
