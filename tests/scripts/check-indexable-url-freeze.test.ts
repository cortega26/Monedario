import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkIndexableUrlFreeze } from "../../scripts/check-indexable-url-freeze.mjs";

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
});
