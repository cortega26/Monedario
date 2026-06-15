import { describe, expect, it } from "vitest";
import { AFP_COMMISSIONS_PERCENT } from "@/config/afpCommissions";

describe("AFP commissions config", () => {
  it("defines at least 6 AFPs", () => {
    expect(AFP_COMMISSIONS_PERCENT.length).toBeGreaterThanOrEqual(6);
  });

  it("has exactly 7 AFPs", () => {
    // Canary: if this changes, review the source and update the expectation
    expect(AFP_COMMISSIONS_PERCENT).toHaveLength(7);
  });

  it("gives every AFP a name and commission rate", () => {
    for (const afp of AFP_COMMISSIONS_PERCENT) {
      expect(typeof afp.name).toBe("string");
      expect(afp.name.trim().length).toBeGreaterThan(0);
      expect(typeof afp.commission).toBe("number");
      expect(typeof afp.total).toBe("number");
    }
  });

  it("keeps commission rates in valid range (0 < commission < 100)", () => {
    for (const afp of AFP_COMMISSIONS_PERCENT) {
      expect(afp.commission).toBeGreaterThan(0);
      expect(afp.commission).toBeLessThan(100);
    }
  });

  it("keeps total contribution in valid range (10 < total < 110)", () => {
    for (const afp of AFP_COMMISSIONS_PERCENT) {
      expect(afp.total).toBeGreaterThan(10);
      expect(afp.total).toBeLessThan(110);
    }
  });

  it("computes total as 10 + commission", () => {
    for (const afp of AFP_COMMISSIONS_PERCENT) {
      expect(afp.total).toBe(10 + afp.commission);
    }
  });

  it("does not duplicate AFP names", () => {
    const names = AFP_COMMISSIONS_PERCENT.map((afp) => afp.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });
});
