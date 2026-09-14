import { describe, expect, it } from "vitest";
import { parseCLNumber } from "../../src/utils/parseCLNumber";

describe("parseCLNumber", () => {
  it("strips Chilean thousands separators", () => {
    expect(parseCLNumber("1.500.000")).toBe(1500000);
    expect(parseCLNumber("18.000.000")).toBe(18000000);
  });

  it("treats the comma as the decimal separator", () => {
    expect(parseCLNumber("1.500,25")).toBe(1500.25);
    expect(parseCLNumber("2,5")).toBe(2.5);
  });

  it("passes plain numbers through", () => {
    expect(parseCLNumber("1500000")).toBe(1500000);
    expect(parseCLNumber("0")).toBe(0);
  });

  it("trims surrounding whitespace", () => {
    expect(parseCLNumber("  1.500  ")).toBe(1500);
  });

  it("returns undefined for empty or blank input", () => {
    expect(parseCLNumber("")).toBeUndefined();
    expect(parseCLNumber("   ")).toBeUndefined();
  });

  it("returns undefined for garbage instead of NaN", () => {
    expect(parseCLNumber("abc")).toBeUndefined();
    expect(parseCLNumber("1,5,25")).toBeUndefined();
  });
});
