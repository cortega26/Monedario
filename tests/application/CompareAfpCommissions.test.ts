import { describe, expect, it } from "vitest";
import { compareAfpCommissions } from "@/application/use-cases/CompareAfpCommissions";
import { AFP_COMMISSIONS_PERCENT } from "@/config/afpCommissions";

describe("compareAfpCommissions", () => {
  it("sorts AFPs by commission and computes max savings from taxable salary", () => {
    const result = compareAfpCommissions(1_200_000, AFP_COMMISSIONS_PERCENT);

    expect(result.rows[0]).toMatchObject({
      name: "Uno",
      commission: 0.46,
      isCheapest: true,
    });
    expect(result.rows.at(-1)).toMatchObject({
      name: "ProVida",
      commission: 1.45,
      isCheapest: false,
    });
    expect(result.maxExtraMonthlyCost).toBeCloseTo(11_880, 6);
    expect(result.maxExtraAnnualCost).toBeCloseTo(142_560, 6);
  });

  it("returns zero peso costs when taxable salary is omitted", () => {
    const result = compareAfpCommissions(0, AFP_COMMISSIONS_PERCENT);

    expect(result.maxExtraMonthlyCost).toBe(0);
    expect(result.rows.every(row => row.monthlyCommissionCost === 0)).toBe(
      true
    );
  });

  it("rejects invalid salary or empty commission data", () => {
    expect(() =>
      compareAfpCommissions(Number.NaN, AFP_COMMISSIONS_PERCENT)
    ).toThrow("taxableSalary");
    expect(() => compareAfpCommissions(1_000_000, [])).toThrow("commissions");
  });
});
