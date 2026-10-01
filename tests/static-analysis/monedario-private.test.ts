import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { indexabilityFor } from "@/config/indexability";

const root = process.cwd();

describe("Monedario Privado contracts", () => {
  it("keeps the experimental route out of the index and sitemap", () => {
    expect(indexabilityFor("/privado/")).toMatchObject({
      indexable: false,
      inSitemap: false,
      robotsMeta: "noindex,follow",
    });
  });

  it("opts into the privacy-mode layout", () => {
    const page = readFileSync(
      path.join(root, "src/pages/privado/index.astro"),
      "utf8"
    );
    expect(page).toContain("privacyMode={true}");
    expect(page).not.toMatch(
      /\b(fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB)\b/
    );
  });

  it("privacy mode suppresses analytics and service-worker bootstrapping", () => {
    const layout = readFileSync(
      path.join(root, "src/layouts/Layout.astro"),
      "utf8"
    );
    expect(layout).toContain(
      '!privacyMode && <script src="../scripts/analytics.ts" />'
    );
    expect(layout).toContain(
      '!privacyMode && <script is:inline src="/sw-register.js" defer />'
    );
  });

  it("labels future capabilities without presenting them as available", () => {
    const page = readFileSync(
      path.join(root, "src/pages/privado/index.astro"),
      "utf8"
    );

    expect(page).toContain('data-roadmap-status="available"');
    expect(page).toContain('data-roadmap-status="planned"');
    expect(page).toContain('data-roadmap-status="evaluating"');
    expect(page.replace(/\s+/g, " ")).toContain(
      "intención de producto, no funciones disponibles hoy ni fechas comprometidas."
    );
  });

  it("denies runtime network connections at the route boundary", () => {
    const headers = readFileSync(path.join(root, "public/_headers"), "utf8");
    const block = headers.match(
      /\/privado\/\*[\s\S]*?(?=\n# Hashed assets)/
    )?.[0];

    expect(block).toBeTruthy();
    expect(block).toContain("connect-src 'none'");
    expect(block).toContain("form-action 'none'");
    expect(block).toContain("Referrer-Policy: no-referrer");
    expect(block).not.toContain("wasm-unsafe-eval");
  });
});
