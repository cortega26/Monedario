import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

  it("keeps the local Ko-fi image within the default image policy and never enables inline/eval scripts", () => {
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
    expect(supportBlock).toContain("img-src 'self' data:");
    expect(supportBlock).not.toContain("storage.ko-fi.com");

    for (const block of [globalBlock!, supportBlock!]) {
      const scriptSrc = block.match(/\bscript-src\s+([^;\n]+)/)?.[1] ?? "";
      const tokens = scriptSrc.trim().split(/\s+/);
      expect(tokens).not.toContain("'unsafe-inline'");
      expect(tokens).not.toContain("'unsafe-eval'");
      expect(tokens).toContain("'wasm-unsafe-eval'");
    }
  });

  it("keeps edge compression enabled — no Cache-Control rule carries no-transform", () => {
    // Cloudflare does not compress responses whose Cache-Control includes
    // `no-transform`. Between 2026-08-02 and 2026-08-18 every rule in this
    // file carried it (TD-0099 JSD workaround), so all HTML/CSS/JS was served
    // uncompressed: wire payload ~2.5-4x larger, which pushed 199 pages over
    // Ahrefs' 3s document-load threshold ("Slow pages" 2026-08-17/18).
    // Reversed 2026-08-19: the JSD source was confirmed as JavaScript
    // Detections (enable_js=true) via the bot_management API and explicitly
    // disabled (PUT {"enable_js": false}, HTTP 200; GET confirmed
    // fight_mode=false unchanged), so the CSP risk that motivated the
    // directive is no longer active. Rollback = restore no-transform
    // immediately if the injection ever reappears (documented in
    // docs/operations/runbooks/CSP_CLOUDFLARE_JSD_2026-08-02.md).
    // Invariant: NO Cache-Control rule in the file may carry no-transform,
    // so a silent re-introduction is caught before deploy.
    const content = readPublicHeaders();

    const cacheControlLines = content
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.startsWith("Cache-Control:"));
    expect(
      cacheControlLines.length,
      "HTML rules with Cache-Control must exist (e.g. /posts/*, /tags/*)"
    ).toBeGreaterThan(0);

    for (const line of cacheControlLines) {
      expect(
        line,
        "no Cache-Control rule may include no-transform (it disables Cloudflare edge compression)"
      ).not.toContain("no-transform");
    }

    // Safety net: the HTML rules must still pin their 5-minute TTL — the
    // compression reversal must not change freshness semantics.
    const htmlRules = cacheControlLines.filter(line =>
      line.includes("public, max-age=300")
    );
    expect(htmlRules.length).toBeGreaterThan(10);
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

// ── Caracterización de los internals (plan 073) ─────────────────────────────

describe("csp-hashes pure functions", () => {
  it("classifies executable vs data script types", async () => {
    const { isExecutable, sha256base64 } = await import("@/integrations/csp-hashes");
    expect(isExecutable("")).toBe(true);
    expect(isExecutable('type="application/ld+json"')).toBe(false);
    expect(isExecutable("type='application/json'")).toBe(false);
    expect(isExecutable('type="application/javascript"')).toBe(true);
    expect(isExecutable('type="text/javascript"')).toBe(true);
    expect(isExecutable('type="module"')).toBe(true);

    const first = sha256base64("const a = 1;");
    expect(first).toBe(sha256base64("const a = 1;"));
    expect(first).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it("collects only executable inline scripts across the dist tree", async () => {
    const { collectHashes, sha256base64 } = await import("@/integrations/csp-hashes");
    const dir = mkdtempSync(join(tmpdir(), "csp-hashes-"));
    tempDirs.push(dir);
    writeFileSync(
      join(dir, "page.html"),
      '<script>const a = 1;</script><script type="application/ld+json">{"x":"<"}</script>'
    );
    writeFileSync(join(dir, "other.html"), "<p>sin scripts</p>");
    mkdirSync(join(dir, "sub"));
    writeFileSync(join(dir, "sub", "nested.html"), '<script>const b = 2;</script>');

    const hashes = await collectHashes(dir);
    expect(hashes).toEqual(
      new Set([
        `'sha256-${sha256base64("const a = 1;")}'`,
        `'sha256-${sha256base64("const b = 2;")}'`,
      ])
    );
  });

  it("returns an empty set for a tree without inline scripts", async () => {
    const { collectHashes } = await import("@/integrations/csp-hashes");
    const dir = mkdtempSync(join(tmpdir(), "csp-hashes-empty-"));
    tempDirs.push(dir);
    writeFileSync(join(dir, "page.html"), "<p>nada</p>");
    expect(await collectHashes(dir)).toEqual(new Set());
  });
});

describe("cspHashesIntegration hook", () => {
  it("inyecta los hashes en _headers durante build:done", async () => {
    const { cspHashesIntegration } = await import("@/integrations/csp-hashes");
    const dir = mkdtempSync(join(tmpdir(), "csp-hook-"));
    tempDirs.push(dir);
    writeFileSync(
      join(dir, "index.html"),
      '<script>const a = 1;</script><script type="application/ld+json">{"x":1}</script>'
    );
    writeFileSync(
      join(dir, "_headers"),
      "/*\n  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline';\n"
    );

    const logs: string[] = [];
    await cspHashesIntegration().hooks["astro:build:done"]!({
      dir: new URL(`file://${dir}/`),
      logger: {
        info: (m: string) => logs.push(`info: ${m}`),
        warn: (m: string) => logs.push(`warn: ${m}`),
      },
    } as never);

    const headers = readFileSync(join(dir, "_headers"), "utf8");
    expect(headers).toContain("'sha256-");
    expect(headers).not.toContain("'unsafe-inline'");
    expect(logs.some(l => l.startsWith("info:"))).toBe(true);
  });

  it("advierte y deja _headers intacto cuando no hay scripts inline", async () => {
    const { cspHashesIntegration } = await import("@/integrations/csp-hashes");
    const dir = mkdtempSync(join(tmpdir(), "csp-hook-empty-"));
    tempDirs.push(dir);
    writeFileSync(join(dir, "index.html"), "<p>sin scripts</p>");
    writeFileSync(join(dir, "_headers"), "/*\n  Content-Security-Policy: script-src 'self';\n");

    const logs: string[] = [];
    await cspHashesIntegration().hooks["astro:build:done"]!({
      dir: new URL(`file://${dir}/`),
      logger: { info: () => {}, warn: (m: string) => logs.push(`warn: ${m}`) },
    } as never);

    expect(logs.some(l => l.startsWith("warn:"))).toBe(true);
    expect(readFileSync(join(dir, "_headers"), "utf8")).toContain("script-src 'self';");
  });
});
