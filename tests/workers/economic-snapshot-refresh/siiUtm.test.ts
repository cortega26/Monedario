import { describe, expect, it } from "vitest";
import {
  calendarPartsInTz,
  parseSiiUtm,
} from "../../../workers/economic-snapshot-refresh/src/sources/siiUtm";

describe("calendarPartsInTz", () => {
  it("resolves the Chilean calendar at the UTC month boundary", () => {
    // 2026-09-01T00:30Z = 2026-08-31T20:30 en Chile → agosto, no septiembre.
    expect(calendarPartsInTz(new Date("2026-09-01T00:30:00Z"))).toEqual({
      year: 2026,
      monthIndex: 7,
      day: 31,
    });
    expect(calendarPartsInTz(new Date("2026-09-01T04:30:00Z"))).toEqual({
      year: 2026,
      monthIndex: 8,
      day: 1,
    });
  });

  it("matches UTC outside the boundary window (regression)", () => {
    expect(calendarPartsInTz(new Date("2026-08-10T12:00:00Z"))).toEqual({
      year: 2026,
      monthIndex: 7,
      day: 10,
    });
  });
});

describe("parseSiiUtm", () => {
  const html = `
    <table><tr><th>Julio</th><td>71.649</td><td>859.788</td></tr>
    <tr><th>Agosto</th><td>71.649</td><td>859.788</td></tr></table>`;

  it("parses the official SII row for the requested month", () => {
    expect(parseSiiUtm(html, 2026, 7)).toEqual({
      value: 71_649,
      dateIso: "2026-08-01",
      sourceUrl: "https://www.sii.cl/valores_y_fechas/utm/utm2026.htm",
    });
  });

  it("does not fall through to another month or empty value", () => {
    expect(parseSiiUtm(html, 2026, 8)).toBeNull();
    expect(parseSiiUtm("<th>Agosto</th><td>&nbsp;</td>", 2026, 7)).toBeNull();
  });
});
