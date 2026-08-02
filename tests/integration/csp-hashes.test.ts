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

function resolvePublicHeadersPath(): string {
  const rootDir = fileURLToPath(new URL("../../", import.meta.url));
  return join(rootDir, "public", "_headers");
}

function readPublicHeaders(): string {
  const path = resolvePublicHeadersPath();
  if (!existsSync(path)) {
    throw new Error(
      `public/_headers not found at ${path}. ` +
      "This file is required for Cloudflare Pages CSP configuration."
    );
  }
  return readFileSync(path, "utf8");
}

/**
 * Directives that MUST be present in the CSP for the site to function.
 *
 * Each entry is [directive, minimumRequiredSource]. If a directive is
 * missing or doesn't include its minimum source, the test fails.
 */
const MANDATORY_DIRECTIVES = {
  "default-src": "'self'",
  "script-src": "'wasm-unsafe-eval'",
  "style-src": "'self'",
  "img-src": "'self'",
  "connect-src": "'self'",
  "font-src": "'self'",
  "form-action": "'self'",
  "frame-ancestors": "'none'",
  "base-uri": "'self'",
} as const;

describe("public/_headers — Pagefind CSP invariants", () => {
  it("includes 'wasm-unsafe-eval' in script-src (Pagefind WASM requirement)", () => {
    // Pagefind uses WebAssembly for its search engine. Without
    // 'wasm-unsafe-eval' in the CSP script-src, Chrome and Firefox block
    // WebAssembly.instantiate() and all searches return zero results.
    //
    // This test reads the source-of-truth _headers file directly so any
    // accidental removal is caught before deploy.
    const content = readPublicHeaders();
    const scriptSrc = content.match(/\bscript-src\s+([^;\n]+)/)?.[0] ?? "";

    expect(
      scriptSrc,
      "public/_headers must include 'wasm-unsafe-eval' in script-src for Pagefind WASM"
    ).toContain("'wasm-unsafe-eval'");

    // Safety net: 'self' must still be present (don't accidentally drop it
    // while editing the directive).
    expect(scriptSrc).toContain("'self'");
  });

  it("keeps Ko-fi origins scoped to /apoyar and never enables inline/eval scripts", () => {
    const content = readPublicHeaders();
    const blocks = content
      .split(/(?=^\/[^\n]*$)/gm)
      .map(block => block.trim())
      .filter(Boolean);
    const globalBlock = blocks.find(block => block.startsWith("/*\n"));
    const supportBlock = blocks.find(block =>
      block.startsWith("/apoyar/*\n")
    );

    expect(globalBlock, "global /* header block is required").toBeTruthy();
    expect(
      supportBlock,
      "a path-specific /apoyar/* header block is required"
    ).toBeTruthy();
    expect(globalBlock).not.toContain("ko-fi.com");
    expect(globalBlock).not.toContain("storage.ko-fi.com");
    expect(globalBlock).not.toContain("cdn.ko-fi.com");
    expect(supportBlock).toContain("https://storage.ko-fi.com");

    for (const block of [globalBlock!, supportBlock!]) {
      const scriptSrc = block.match(/\bscript-src\s+([^;\n]+)/)?.[1] ?? "";
      const tokens = scriptSrc.trim().split(/\s+/);
      expect(tokens).not.toContain("'unsafe-inline'");
      expect(tokens).not.toContain("'unsafe-eval'");
      expect(tokens).toContain("'wasm-unsafe-eval'");
    }
  });

  it("prevents Cloudflare from injecting per-request JavaScript into static HTML", () => {
    const content = readPublicHeaders();
    const globalBlock = content
      .split(/(?=^\/[^\n]*$)/gm)
      .map(block => block.trim())
      .find(block => block.startsWith("/*\n"));

    expect(globalBlock).toContain("Cache-Control: no-transform");
  });

  it("CSP header is structurally intact — no merge-conflict corruption", () => {
    // Merge conflicts on the single-line CSP are common because every
    // branch touches _headers. A corrupted CSP can break the entire site
    // silently (browser CSP violations appear only in the console).
    //
    // This test catches the most common corruption patterns:
    // - File truncated or empty
    // - Merge markers present (<<<<<<<, =======, >>>>>>>)
    // - CSP line blank or missing
    // - Critical directives absent or empty

    const content = readPublicHeaders();

    // File must start with the Cloudflare Pages path pattern
    expect(
      content,
      "public/_headers must start with /* (Cloudflare Pages route pattern)"
    ).toMatch(/^\s*\/\*\s*$/m);

    // No git merge conflict markers anywhere
    for (const marker of ["<<<<<<<", "=======", ">>>>>>>"]) {
      expect(
        content,
        `public/_headers contains git merge-conflict marker "${marker}"`
      ).not.toContain(marker);
    }

    // Extract the full CSP value (everything between "Content-Security-Policy:"
    // and the next line that starts without leading whitespace)
    const cspMatch = content.match(
      /Content-Security-Policy:\s*([\s\S]+?)(?=\n\S|\n*$)/
    );
    expect(cspMatch, "Content-Security-Policy header not found").toBeTruthy();

    const cspValue = cspMatch![1].replace(/\n\s+/g, " ").trim();

    // The CSP value must not be empty
    expect(
      cspValue.length,
      "Content-Security-Policy value is empty or truncated"
    ).toBeGreaterThan(100);

    // Every mandatory directive must be present with its minimum source
    for (const [directive, minimumSource] of Object.entries(
      MANDATORY_DIRECTIVES
    )) {
      const directiveRx = new RegExp(
        `\\b${directive}\\s+([^;]+)`,
        "i"
      );
      const match = cspValue.match(directiveRx);
      expect(
        match,
        `CSP must include the ${directive} directive`
      ).toBeTruthy();

      const value = match![1].trim();
      expect(
        value.length,
        `${directive} directive value is empty`
      ).toBeGreaterThan(0);

      expect(
        value,
        `${directive} must include ${minimumSource}`
      ).toContain(minimumSource);
    }
  });
});
