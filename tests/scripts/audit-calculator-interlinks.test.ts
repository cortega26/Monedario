import { describe, expect, it } from "vitest";
import {
  findUnderLinked,
  resolveFloor,
  STRATEGIC_LINK_FLOORS,
} from "../../scripts/audit-calculator-interlinks.mjs";

describe("resolveFloor", () => {
  it("uses the strategic floor for listed calculators", () => {
    expect(resolveFloor("iva")).toBe(STRATEGIC_LINK_FLOORS.iva);
    expect(resolveFloor("gratificacion-legal")).toBe(
      STRATEGIC_LINK_FLOORS["gratificacion-legal"]
    );
  });

  it("falls back to the provided minimum for the rest", () => {
    expect(resolveFloor("conversor-uf", 5)).toBe(5);
    expect(resolveFloor("conversor-uf")).toBe(3);
  });
});

describe("findUnderLinked", () => {
  it("flags rows below their floor", () => {
    const rows = [
      { slug: "iva", inboundEditorial: 2 },
      { slug: "gratificacion-legal", inboundEditorial: 3 },
      { slug: "conversor-uf", inboundEditorial: 2 },
    ];
    expect(
      findUnderLinked(rows).map((row: { slug: string }) => row.slug)
    ).toEqual(["iva", "conversor-uf"]);
  });

  it("respects a custom minimum", () => {
    const rows = [{ slug: "conversor-uf", inboundEditorial: 4 }];
    expect(findUnderLinked(rows, 5)).toHaveLength(1);
    expect(findUnderLinked(rows, 4)).toHaveLength(0);
  });
});
