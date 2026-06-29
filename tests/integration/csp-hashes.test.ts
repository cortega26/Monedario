import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { updateHeadersFile } from "@/integrations/csp-hashes";

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { force: true, recursive: true });
  }
});

describe("csp-hashes integration", () => {
  it("keeps self-hosted Astro bundles allowed when injecting inline hashes", () => {
    const dir = mkdtempSync(join(tmpdir(), "monedario-csp-"));
    tempDirs.push(dir);
    const headersPath = join(dir, "_headers");
    writeFileSync(
      headersPath,
      [
        "/*",
        "  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'",
        "",
      ].join("\n"),
      "utf8"
    );

    updateHeadersFile(headersPath, new Set(["'sha256-testhash'"]));

    const headers = readFileSync(headersPath, "utf8");
    const scriptSrc = headers.match(/\bscript-src\s+([^;]+)/)?.[0] ?? "";
    expect(scriptSrc).toContain("script-src 'sha256-testhash' 'self'");
    expect(scriptSrc).toContain("https://static.cloudflareinsights.com");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'strict-dynamic'");
  });

  it("preserves 'wasm-unsafe-eval' through hash injection (Pagefind needs WASM)", () => {
    // Regression test for SHA f9c9d83d: the CSP script-src must allow WASM
    // compilation because Pagefind uses WebAssembly for its search engine.
    // updateHeadersFile strips 'unsafe-inline' and 'strict-dynamic' but MUST
    // leave 'wasm-unsafe-eval' untouched.
    const dir = mkdtempSync(join(tmpdir(), "monedario-csp-wasm-"));
    tempDirs.push(dir);
    const headersPath = join(dir, "_headers");
    writeFileSync(
      headersPath,
      [
        "/*",
        "  Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'",
        "",
      ].join("\n"),
      "utf8"
    );

    updateHeadersFile(headersPath, new Set(["'sha256-testhash'"]));

    const headers = readFileSync(headersPath, "utf8");
    const scriptSrc = headers.match(/\bscript-src\s+([^;]+)/)?.[0] ?? "";
    expect(scriptSrc).toContain("'wasm-unsafe-eval'");
    expect(scriptSrc).toContain("'self'");
    expect(scriptSrc).toContain("'sha256-testhash'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });
});

describe("public/_headers — Pagefind CSP invariants", () => {
  it("includes 'wasm-unsafe-eval' in script-src (Pagefind WASM requirement)", () => {
    // Pagefind uses WebAssembly for its search engine. Without
    // 'wasm-unsafe-eval' in the CSP script-src, Chrome and Firefox block
    // WebAssembly.instantiate() and all searches return zero results.
    //
    // This test reads the source-of-truth _headers file directly so any
    // accidental removal is caught before deploy.
    const rootDir = fileURLToPath(new URL("../../", import.meta.url));
    const headersPath = join(rootDir, "public", "_headers");

    if (!existsSync(headersPath)) {
      throw new Error(
        `public/_headers not found at ${headersPath}. ` +
        "This file is required for Cloudflare Pages CSP configuration."
      );
    }

    const content = readFileSync(headersPath, "utf8");
    const scriptSrc = content.match(/\bscript-src\s+([^;\n]+)/)?.[0] ?? "";

    expect(
      scriptSrc,
      "public/_headers must include 'wasm-unsafe-eval' in script-src for Pagefind WASM"
    ).toContain("'wasm-unsafe-eval'");

    // Safety net: 'self' must still be present (don't accidentally drop it
    // while editing the directive).
    expect(scriptSrc).toContain("'self'");
  });
});
