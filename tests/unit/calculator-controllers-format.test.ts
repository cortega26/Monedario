import { describe, expect, it } from "vitest";
import { fmt, fmtPct } from "@/utils/sueldo-liquido/resultRenderer";

describe("fmt (CLP formatter)", () => {
  it("formats whole pesos with es-CL thousands separators and a leading $", () => {
    expect(fmt(1200000)).toBe("$1.200.000");
  });
  it("rounds to the nearest peso (no decimals shown)", () => {
    expect(fmt(1200000.49)).toBe("$1.200.000");
    expect(fmt(1200000.5)).toBe("$1.200.001");
  });
  it("formats zero and small amounts", () => {
    expect(fmt(0)).toBe("$0");
    expect(fmt(999)).toBe("$999");
  });
  it("formats negative amounts (deltas/savings can be negative)", () => {
    expect(fmt(-4675827.73)).toBe("$-4.675.828");
  });
});

describe("fmtPct", () => {
  it("renders two decimals with a trailing %", () => {
    expect(fmtPct(1.27)).toBe("1.27%");
    expect(fmtPct(10)).toBe("10.00%");
  });
  it("rounds to two decimals", () => {
    expect(fmtPct(0.465)).toBe("0.47%");
  });
});
