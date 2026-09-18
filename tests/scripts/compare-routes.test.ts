import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { compareRoutes } from "../../scripts/compare-routes.mjs";

const tempRoots: string[] = [];

const VALID_EXCEPTION_FIELDS = {
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
  expiresAt: "2099-01-01T00:00:00Z",
};

function tempDir(): string {
  const root = mkdtempSync(path.join(tmpdir(), "compare-routes-"));
  tempRoots.push(root);
  return root;
}

function writeRoutesSnapshot(routes: string[]): string {
  const file = path.join(tempDir(), "snapshot.json");
  writeFileSync(
    file,
    JSON.stringify({ routes: routes.map(route => ({ route })) }),
    "utf8"
  );
  return file;
}

function writeExceptions(entries: unknown[]): string {
  const file = path.join(tempDir(), "exceptions.json");
  writeFileSync(file, JSON.stringify({ exceptions: entries }), "utf8");
  return file;
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

describe("compareRoutes", () => {
  it("passes with no route changes", () => {
    const beforePath = writeRoutesSnapshot(["/posts/a/", "/posts/b/"]);
    const afterPath = writeRoutesSnapshot(["/posts/a/", "/posts/b/"]);
    const exceptionsPath = writeExceptions([]);

    const result = compareRoutes({ beforePath, afterPath, exceptionsPath });

    expect(result.status).toBe("PASS");
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
  });

  it("passes a new route when it matches an approved exception (absolute URL normalized to pathname)", () => {
    const beforePath = writeRoutesSnapshot(["/posts/a/"]);
    const afterPath = writeRoutesSnapshot(["/posts/a/", "/posts/nueva/"]);
    const exceptionsPath = writeExceptions([
      { ...VALID_EXCEPTION_FIELDS, url: "https://monedario.cl/posts/nueva/" },
    ]);

    const result = compareRoutes({ beforePath, afterPath, exceptionsPath });

    expect(result.status).toBe("PASS");
    expect(result.approvedAdditions).toEqual(["/posts/nueva/"]);
    expect(result.unapprovedAdded).toEqual([]);
  });

  it("fails an unapproved new route", () => {
    const beforePath = writeRoutesSnapshot(["/posts/a/"]);
    const afterPath = writeRoutesSnapshot(["/posts/a/", "/posts/nueva/"]);
    const exceptionsPath = writeExceptions([]);

    const result = compareRoutes({ beforePath, afterPath, exceptionsPath });

    expect(result.status).toBe("FAIL");
    expect(result.unapprovedAdded).toEqual(["/posts/nueva/"]);
    expect(result.errors.join(" ")).toMatch(/Unapproved route additions/);
  });

  it("does not approve a route whose exception URL has a different pathname", () => {
    const beforePath = writeRoutesSnapshot(["/posts/a/"]);
    const afterPath = writeRoutesSnapshot(["/posts/a/", "/posts/nueva/"]);
    const exceptionsPath = writeExceptions([
      { ...VALID_EXCEPTION_FIELDS, url: "https://monedario.cl/posts/otra/" },
    ]);

    const result = compareRoutes({ beforePath, afterPath, exceptionsPath });

    expect(result.status).toBe("FAIL");
    expect(result.unapprovedAdded).toEqual(["/posts/nueva/"]);
  });

  it("fails on removed routes even if additions are approved", () => {
    const beforePath = writeRoutesSnapshot(["/posts/a/", "/posts/b/"]);
    const afterPath = writeRoutesSnapshot(["/posts/a/"]);
    const exceptionsPath = writeExceptions([]);

    const result = compareRoutes({ beforePath, afterPath, exceptionsPath });

    expect(result.status).toBe("FAIL");
    expect(result.removed).toEqual(["/posts/b/"]);
  });

  it("fails vacuously on an empty baseline instead of passing silently", () => {
    const beforePath = writeRoutesSnapshot([]);
    const afterPath = writeRoutesSnapshot(["/posts/a/"]);
    const exceptionsPath = writeExceptions([]);

    const result = compareRoutes({ beforePath, afterPath, exceptionsPath });

    expect(result.status).toBe("FAIL");
    expect(result.errors.join(" ")).toMatch(/Baseline is empty/);
  });

  it("throws a clear error when an exception URL is not a valid absolute URL", () => {
    const beforePath = writeRoutesSnapshot(["/posts/a/"]);
    const afterPath = writeRoutesSnapshot(["/posts/a/", "/posts/nueva/"]);
    const exceptionsPath = writeExceptions([
      { ...VALID_EXCEPTION_FIELDS, url: "/posts/nueva/" },
    ]);

    expect(() =>
      compareRoutes({ beforePath, afterPath, exceptionsPath })
    ).toThrow(/not a valid absolute URL/);
  });

  it("ignores expired or incomplete exceptions (same filtering as loadApprovedExceptionUrls)", () => {
    const beforePath = writeRoutesSnapshot(["/posts/a/"]);
    const afterPath = writeRoutesSnapshot(["/posts/a/", "/posts/nueva/"]);
    const exceptionsPath = writeExceptions([
      {
        ...VALID_EXCEPTION_FIELDS,
        url: "https://monedario.cl/posts/nueva/",
        expiresAt: "2020-01-01T00:00:00Z",
      },
    ]);

    const result = compareRoutes({ beforePath, afterPath, exceptionsPath });

    expect(result.status).toBe("FAIL");
    expect(result.unapprovedAdded).toEqual(["/posts/nueva/"]);
  });
});
