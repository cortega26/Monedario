import { describe, expect, it } from "vitest";
import { parseSiiUtm } from "../../../workers/economic-snapshot-refresh/src/sources/siiUtm";

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
