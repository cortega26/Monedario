import { describe, expect, it } from "vitest";
import {
  isExportOverdue,
  isoWeekToDateRange,
} from "../../scripts/data-signals/gsc-utils.mjs";

describe("isExportOverdue", () => {
  const week = "2026-W17";
  const day = 86_400_000;
  const sundayUtc = Date.parse(`${isoWeekToDateRange(week).to}T00:00:00Z`);

  it("is pending (false) on the Monday after the week ends", () => {
    expect(isExportOverdue(week, new Date(sundayUtc + 1 * day))).toBe(false);
  });
  it("is pending (false) on the Tuesday after the week ends", () => {
    expect(isExportOverdue(week, new Date(sundayUtc + 2 * day))).toBe(false);
  });
  it("is overdue (true) on the Wednesday after the week ends", () => {
    expect(isExportOverdue(week, new Date(sundayUtc + 3 * day))).toBe(true);
  });
  it("is overdue (true) a week later", () => {
    expect(isExportOverdue(week, new Date(sundayUtc + 10 * day))).toBe(true);
  });
});
