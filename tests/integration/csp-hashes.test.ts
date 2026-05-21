import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
});
