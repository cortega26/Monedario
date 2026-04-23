import { describe, expect, it } from "vitest";
import { formatMetadataDate, toMetadataDateTime } from "../../src/utils/metadataDate";

describe("metadataDate", () => {
  it("preserves the authored calendar date for midnight UTC refresh timestamps", () => {
    expect(formatMetadataDate("2026-04-22T00:00:00Z")).toBe("22 abr 2026");
    expect(formatMetadataDate("2026-04-22T00:00:00Z", "long")).toBe(
      "22 de abril de 2026"
    );
  });

  it("keeps non-midnight timestamps aligned to the site timezone", () => {
    expect(formatMetadataDate("2026-04-12T18:30:00Z")).toBe("12 abr 2026");
  });

  it("returns ISO datetime metadata for the rendered time element", () => {
    expect(toMetadataDateTime("2026-04-22T00:00:00Z")).toBe(
      "2026-04-22T00:00:00.000Z"
    );
  });
});
