import { describe, expect, it } from "vitest";

import { getPageLastmod } from "@/utils/pageLastmod";

describe("getPageLastmod", () => {
  it("returns a YYYY-MM-DD date for a known route", () => {
    const result = getPageLastmod("/calculadoras/sueldo-liquido/");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result).not.toBe("2026-06-01");
  });

  it("normalizes trailing slash — sin barra produce igual resultado que con barra", () => {
    expect(getPageLastmod("/calculadoras/iva")).toBe(
      getPageLastmod("/calculadoras/iva/")
    );
  });

  it("returns undefined for an unknown route", () => {
    expect(getPageLastmod("/calculadoras/does-not-exist/")).toBeUndefined();
  });
});
