import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  checkIndexableUrlFreeze,
  findExpiringExceptions,
} from "../../scripts/check-indexable-url-freeze.mjs";

function fixture(urls = ["https://monedario.cl/"]) {
  const root = mkdtempSync(path.join(tmpdir(), "monedario-url-freeze-"));
  const dist = path.join(root, "dist");
  mkdirSync(dist, { recursive: true });
  writeFileSync(
    path.join(dist, "sitemap-0.xml"),
    `<urlset>${urls.map(url => `<url><loc>${url}</loc></url>`).join("")}</urlset>`
  );
  for (const value of urls) {
    const pathname = new URL(value).pathname;
    const output =
      pathname === "/"
        ? path.join(dist, "index.html")
        : path.join(dist, pathname.replace(/^\//, ""), "index.html");
    mkdirSync(path.dirname(output), { recursive: true });
    writeFileSync(output, "<!doctype html><title>Fixture</title>");
  }
  const baselineFile = path.join(root, "inventory.json");
  const exceptionsFile = path.join(root, "exceptions.json");
  writeFileSync(
    baselineFile,
    JSON.stringify({ urls: ["https://monedario.cl/"] })
  );
  writeFileSync(exceptionsFile, JSON.stringify({ exceptions: [] }));
  return { dist, baselineFile, exceptionsFile };
}

describe("indexable URL freeze", () => {
  it("passes an unchanged approved inventory", () => {
    const files = fixture();
    expect(checkIndexableUrlFreeze(files)).toMatchObject({
      status: "PASS",
      approved: 1,
      generated: 1,
    });
  });

  it("fails an unauthorized addition with an auditable remediation", () => {
    const files = fixture([
      "https://monedario.cl/",
      "https://monedario.cl/nueva/",
    ]);
    const result = checkIndexableUrlFreeze(files);
    expect(result.status).toBe("FAIL");
    expect(result.errors.join(" ")).toMatch(/\+ https:\/\/monedario\.cl\/nueva\//);
    expect(result.errors.join(" ")).toContain("url-freeze-exceptions.json");
  });

  it("accepts only a complete, active, explicitly approved exception", () => {
    const files = fixture([
      "https://monedario.cl/",
      "https://monedario.cl/nueva/",
    ]);
    writeFileSync(
      files.exceptionsFile,
      JSON.stringify({
        exceptions: [
          {
            url: "https://monedario.cl/nueva/",
            problem: "fixture",
            evidence: "fixture",
            hypothesis: "fixture",
            cost: "low",
            maintenance: "low",
            metric: "fixture",
            threshold: "fixture",
            decision: "APPROVED",
            approvedBy: "owner",
            approvedAt: "2026-08-02T00:00:00Z",
            expiresAt: "2026-11-02T00:00:00Z",
          },
        ],
      })
    );

    expect(
      checkIndexableUrlFreeze({
        ...files,
        now: new Date("2026-08-03T00:00:00Z"),
      })
    ).toMatchObject({ status: "PASS", approvedAdditions: 1 });
  });

  it("fails when a sitemap includes a noindex page regardless of attribute order", () => {
    const files = fixture();
    writeFileSync(
      path.join(files.dist, "index.html"),
      '<meta content="noindex, follow" name="robots"><title>Fixture</title>'
    );
    const result = checkIndexableUrlFreeze(files);
    expect(result.status).toBe("FAIL");
    expect(result.errors).toContain(
      "noindex page is present in sitemap: https://monedario.cl/"
    );
  });

  describe("expired and expiring exceptions", () => {
    const exception = (expiresAt: string) => ({
      url: "https://monedario.cl/nueva/",
      problem: "fixture",
      evidence: "fixture",
      hypothesis: "fixture",
      cost: "low",
      maintenance: "low",
      metric: "fixture",
      threshold: "fixture",
      decision: "APPROVED",
      approvedBy: "fixture",
      approvedAt: "2026-09-17",
      expiresAt,
    });
    const withException = (expiresAt: string) => {
      const files = fixture([
        "https://monedario.cl/",
        "https://monedario.cl/nueva/",
      ]);
      writeFileSync(
        files.exceptionsFile,
        JSON.stringify({ exceptions: [exception(expiresAt)] })
      );
      return files;
    };
    const now = new Date("2026-11-10T12:00:00Z");

    it("fails an expired exception in CI (strict mode)", () => {
      const result = checkIndexableUrlFreeze({
        ...withException("2026-11-02"),
        now,
      });
      expect(result.status).toBe("FAIL");
      expect(result.errors.join(" ")).toContain("expired or invalid exception");
    });

    it("downgrades an expired exception to a warning on the deploy build", () => {
      const result = checkIndexableUrlFreeze({
        ...withException("2026-11-02"),
        now,
        tolerateExpired: true,
      });
      expect(result.status).toBe("PASS");
      expect(result.warnings.join(" ")).toContain("expired on 2026-11-02");
    });

    it("still fails an unapproved URL on the deploy build", () => {
      const files = fixture([
        "https://monedario.cl/",
        "https://monedario.cl/otra/",
      ]);
      const result = checkIndexableUrlFreeze({
        ...files,
        now,
        tolerateExpired: true,
      });
      expect(result.status).toBe("FAIL");
    });

    it("warns, without failing, when an exception is about to expire", () => {
      const result = checkIndexableUrlFreeze({
        ...withException("2026-11-20"),
        now,
      });
      expect(result.status).toBe("PASS");
      expect(result.warnings.join(" ")).toContain("expires in 9 day(s)");
    });

    it("stays silent while the expiry is far away", () => {
      const result = checkIndexableUrlFreeze({
        ...withException("2027-09-29"),
        now,
      });
      expect(result.status).toBe("PASS");
      expect(result.warnings).toEqual([]);
    });

    it("findExpiringExceptions lists expired and soon-to-expire entries only", () => {
      const doc = {
        exceptions: [
          { ...exception("2026-11-02"), url: "https://monedario.cl/a/" },
          { ...exception("2026-11-15"), url: "https://monedario.cl/b/" },
          { ...exception("2027-09-29"), url: "https://monedario.cl/c/" },
          {
            ...exception("2026-11-01"),
            url: "https://monedario.cl/d/",
            decision: "DENIED",
          },
        ],
      };
      expect(
        findExpiringExceptions(doc, now, 14).map(e => [e.url, e.daysLeft])
      ).toEqual([
        ["https://monedario.cl/a/", -9],
        ["https://monedario.cl/b/", 4],
      ]);
    });
  });
});
