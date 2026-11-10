import { describe, expect, it } from "vitest";
import {
  evaluateExceptionExpiry,
  evaluateLiveFreshness,
  parseSiteDates,
} from "../../scripts/check-deploy-health.mjs";

const page = (uf: string, dolar: string) =>
  `<span>UF al ${uf}</span><b>$41.252,94</b><span>Dólar al ${dolar}</span>`;

describe("deploy health: live site freshness", () => {
  const now = new Date("2026-11-10T16:00:00Z");

  it("parses the dates shown on the home page", () => {
    expect(parseSiteDates(page("01/11/2026", "30/10/2026"))).toEqual({
      uf: "2026-11-01",
      dolar: "2026-10-30",
    });
  });

  it("accepts a fresh site, including a UF published ahead of today", () => {
    expect(
      evaluateLiveFreshness({ html: page("11/11/2026", "10/11/2026"), now })
    ).toEqual([]);
  });

  it("flags the 2026-11 incident: UF and dolar stuck for days", () => {
    const problems = evaluateLiveFreshness({
      html: page("01/11/2026", "30/10/2026"),
      now,
    });
    expect(problems).toHaveLength(2);
    expect(problems[0]).toContain("UF al 2026-11-01");
    expect(problems[1]).toContain("Dólar al 2026-10-30");
  });

  it("tolerates a dollar that is a few days old (weekend or holiday)", () => {
    expect(
      evaluateLiveFreshness({ html: page("10/11/2026", "06/11/2026"), now })
    ).toEqual([]);
  });

  it("reports unreadable markup instead of passing silently", () => {
    const problems = evaluateLiveFreshness({ html: "<html></html>", now });
    expect(problems).toHaveLength(2);
    expect(problems[0]).toContain("No se pudo leer");
  });

  it("uses the Santiago calendar day, not UTC", () => {
    // 2026-11-11 01:00Z sigue siendo 10/11 en Santiago (UTC-3).
    expect(
      evaluateLiveFreshness({
        html: page("10/11/2026", "10/11/2026"),
        now: new Date("2026-11-11T01:00:00Z"),
      })
    ).toEqual([]);
  });
});

describe("deploy health: exception expiry", () => {
  const entry = (url: string, expiresAt: string) => ({
    url,
    decision: "APPROVED",
    expiresAt,
  });
  const now = new Date("2026-11-10T12:00:00Z");

  it("reports expired and soon-to-expire exceptions, not distant ones", () => {
    const problems = evaluateExceptionExpiry({
      document: {
        exceptions: [
          entry("https://monedario.cl/a/", "2026-11-02"),
          entry("https://monedario.cl/b/", "2026-11-15"),
          entry("https://monedario.cl/c/", "2027-09-29"),
        ],
      },
      now,
    });
    expect(problems).toHaveLength(2);
    expect(problems[0]).toContain("venció el 2026-11-02");
    expect(problems[1]).toContain("vence en 4 día(s)");
  });
});
