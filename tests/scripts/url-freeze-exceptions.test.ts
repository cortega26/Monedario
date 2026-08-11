import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  loadApprovedExceptionUrls,
  validateExceptionSchema,
} from "../../scripts/lib/url-freeze-exceptions.mjs";

const tempRoots: string[] = [];

const VALID_ENTRY = {
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
};

function writeRegistry(entries: unknown[]): string {
  const root = mkdtempSync(path.join(tmpdir(), "url-freeze-"));
  tempRoots.push(root);
  const file = path.join(root, "exceptions.json");
  writeFileSync(file, JSON.stringify({ exceptions: entries }), "utf8");
  return file;
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

describe("loadApprovedExceptionUrls (compare-routes behavior)", () => {
  const NOW = new Date("2026-08-03T00:00:00Z").getTime();

  it("returns only approved, complete, non-expired URLs", () => {
    const file = writeRegistry([
      VALID_ENTRY,
      { ...VALID_ENTRY, url: "https://monedario.cl/vencida/", expiresAt: "2026-01-01T00:00:00Z" },
      { ...VALID_ENTRY, url: "https://monedario.cl/denegada/", decision: "DENIED" },
      { ...VALID_ENTRY, url: "https://monedario.cl/incompleta/", evidence: "" },
    ]);
    expect(loadApprovedExceptionUrls(file, NOW)).toEqual(
      new Set(["https://monedario.cl/nueva/"])
    );
  });

  it("filters expired entries (expiresAt before now)", () => {
    const file = writeRegistry([
      { ...VALID_ENTRY, expiresAt: "2026-11-02T00:00:00Z" },
      { ...VALID_ENTRY, url: "https://monedario.cl/otra/", expiresAt: "2026-08-02T12:00:00Z" },
    ]);
    expect(loadApprovedExceptionUrls(file, NOW)).toEqual(
      new Set(["https://monedario.cl/nueva/"])
    );
  });

  it("filters entries with unparseable expiresAt (silent, routes behavior)", () => {
    const file = writeRegistry([
      { ...VALID_ENTRY, expiresAt: "no-es-fecha" },
    ]);
    expect(loadApprovedExceptionUrls(file, NOW)).toEqual(new Set());
  });
});

describe("validateExceptionSchema (indexable gate behavior)", () => {
  it("reports nothing for a valid registry", () => {
    const file = writeRegistry([VALID_ENTRY]);
    expect(validateExceptionSchema(file)).toEqual([]);
  });

  it("reports each violation with its index (missing fields, decision, dates)", () => {
    const file = writeRegistry([
      { ...VALID_ENTRY, evidence: "" },
      { ...VALID_ENTRY, url: "https://monedario.cl/d/", decision: "DENIED" },
      { ...VALID_ENTRY, url: "https://monedario.cl/a/", approvedAt: "nope" },
      { ...VALID_ENTRY, url: "https://monedario.cl/e/", expiresAt: "nope" },
    ]);
    const errors = validateExceptionSchema(file);
    expect(errors).toHaveLength(4);
    expect(errors[0]).toContain("exceptions[0]");
    expect(errors[0]).toContain("evidence");
    expect(errors[1]).toContain("decision != APPROVED");
    expect(errors[2]).toContain("approvedAt inválido");
    expect(errors[3]).toContain("expiresAt inválido");
  });

  it("does not flag expired-but-parseable expiresAt (expiry is the gate's runtime check)", () => {
    const file = writeRegistry([
      { ...VALID_ENTRY, expiresAt: "2026-01-01T00:00:00Z" },
    ]);
    expect(validateExceptionSchema(file)).toEqual([]);
  });
});
