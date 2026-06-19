import { describe, expect, it } from "vitest";
import {
  parseSpanishLongDate,
  extractEffectiveDateFromHtml,
} from "../../scripts/lib/spanish-date.mjs";

describe("parseSpanishLongDate", () => {
  it("parses a plain long date", () => {
    expect(parseSpanishLongDate("1 de octubre de 2025")).toBe("2025-10-01");
  });
  it("ignores weekday prefix and trailing text", () => {
    expect(parseSpanishLongDate("hoy, miércoles 1 de octubre de 2025, ...")).toBe(
      "2025-10-01"
    );
  });
  it("zero-pads day and month", () => {
    expect(parseSpanishLongDate("3 de marzo de 2026")).toBe("2026-03-03");
  });
  it("accepts the 'setiembre' variant", () => {
    expect(parseSpanishLongDate("15 de setiembre de 2027")).toBe("2027-09-15");
  });
  it("returns null when no date is present", () => {
    expect(parseSpanishLongDate("no hay fecha aquí")).toBeNull();
  });
  it("rejects an impossible calendar date", () => {
    expect(parseSpanishLongDate("31 de febrero de 2025")).toBeNull();
  });
  it("returns null for non-string input", () => {
    expect(parseSpanishLongDate(undefined as unknown as string)).toBeNull();
  });
});

describe("extractEffectiveDateFromHtml", () => {
  it("extracts the date from the 'A partir de hoy' sentence (current page shape)", () => {
    const html =
      "<p>A partir de hoy, miércoles 1 de octubre de 2025, la nueva comisión de 0,46% se aplicará.</p>";
    expect(extractEffectiveDateFromHtml(html)).toBe("2025-10-01");
  });
  it("extracts a FUTURE date with a different weekday/day (the regression this fixes)", () => {
    const html =
      "<p>A partir de hoy, <strong>lunes 1 de diciembre de 2025</strong>, la nueva comisión de 0,49% se aplicará.</p>";
    expect(extractEffectiveDateFromHtml(html)).toBe("2025-12-01");
  });
  it("tolerates HTML tags between 'A partir de' and the date", () => {
    const html = 'A partir de <span class="x">hoy,</span> jueves 2 de enero de 2026, ...';
    expect(extractEffectiveDateFromHtml(html)).toBe("2026-01-02");
  });
  it("returns null when the anchor phrase is absent", () => {
    expect(extractEffectiveDateFromHtml("<p>otra noticia sin vigencia</p>")).toBeNull();
  });
});
