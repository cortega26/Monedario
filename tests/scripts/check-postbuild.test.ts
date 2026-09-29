import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";
import {
  collectSitemapLocs,
  countTags,
  extractJsonLdBlocks,
  findDuplicateIds,
  findHeadingLevelJumps,
  parseScriptSrc,
  readH1FromHtml,
  readTitleFromHtml,
  sitemapUrlToDistPath,
} from "../../scripts/check-postbuild.mjs";

const SCRIPT = path.resolve("scripts/check-postbuild.mjs");
const tempRoots: string[] = [];

function buildDist() {
  const root = mkdtempSync(path.join(tmpdir(), "postbuild-"));
  tempRoots.push(root);
  return root;
}

function writePage(root: string, rel: string, html: string) {
  const abs = path.join(root, rel);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, html, "utf8");
}

function run(distDir: string) {
  return spawnSync("node", [SCRIPT, distDir], { encoding: "utf8" });
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("collectSitemapLocs + sitemapUrlToDistPath", () => {
  it("extracts only urlset <loc> values (not namespaced image/video locs)", () => {
    const xml =
      '<urlset><url><loc>https://monedario.cl/posts/a/</loc></url>' +
      '<url><loc>https://monedario.cl/</loc></url></urlset>';
    expect(collectSitemapLocs(xml)).toEqual([
      "https://monedario.cl/posts/a/",
      "https://monedario.cl/",
    ]);
  });

  it("maps sitemap URLs to dist index.html paths, normalizing trailing slash", () => {
    expect(sitemapUrlToDistPath("https://monedario.cl/posts/a/", "/tmp/x")).toBe(
      "/tmp/x/posts/a/index.html"
    );
    expect(sitemapUrlToDistPath("https://monedario.cl/", "/tmp/x")).toBe("/tmp/x/index.html");
  });
});

describe("readTitleFromHtml / readH1FromHtml", () => {
  it("reads a plain <title>", () => {
    expect(readTitleFromHtml("<html><head><title>Hola | Monedario</title></head></html>")).toBe(
      "Hola | Monedario"
    );
  });

  it("trims surrounding whitespace", () => {
    expect(readTitleFromHtml("<title>\n  Con espacios  \n</title>")).toBe("Con espacios");
  });

  it("returns null when <title> is absent", () => {
    expect(readTitleFromHtml("<html><body>x</body></html>")).toBeNull();
  });

  it("reads h1 text content with inner tags stripped", () => {
    const html = '<h1 class="font-bold">Costo <em>Real</em></h1>';
    expect(readH1FromHtml(html)).toBe("Costo Real");
  });
});

describe("countTags", () => {
  it("counts balanced <p> pairs without matching <pre>", () => {
    const html = "<p>uno</p><p>dos</p><pre>p x</pre>";
    expect(countTags(html, "p")).toEqual({ open: 2, close: 2 });
  });

  it("detects imbalance", () => {
    const html = "<p>uno<p>dos</p>";
    expect(countTags(html, "p")).toEqual({ open: 2, close: 1 });
  });
});

describe("parseScriptSrc", () => {
  it("detects hashes and forbids unsafe-inline/strict-dynamic", () => {
    const headers =
      'Content-Security-Policy: default-src \'self\'; script-src \'self\' \'sha256-abc=\'; style-src \'self\' \'unsafe-inline\'';
    const result = parseScriptSrc(headers);
    expect(result.hasHashes).toBe(true);
    expect(result.hasUnsafeInline).toBe(false);
    expect(result.hasStrictDynamic).toBe(false);
  });

  it("flags unsafe-inline in script-src only (not style-src)", () => {
    const headers =
      'Content-Security-Policy: script-src \'self\'; style-src \'unsafe-inline\'';
    const result = parseScriptSrc(headers);
    expect(result.hasHashes).toBe(false);
    expect(result.hasUnsafeInline).toBe(false);
  });
});

describe("findDuplicateIds", () => {
  it("flags a duplicated id with its count", () => {
    const html = '<div id="resultado"></div><p id="resultado"></p>';
    expect(findDuplicateIds(html)).toEqual([{ id: "resultado", count: 2 }]);
  });

  it("returns [] when every id is unique", () => {
    expect(
      findDuplicateIds('<div id="a"></div><p id="b"></p>')
    ).toEqual([]);
  });

  it("ignores ids inside script and style bodies", () => {
    const html =
      '<div id="a"></div><script>const x = \'id="a"\';</script>' +
      "<style>#a { color: red }</style>";
    expect(findDuplicateIds(html)).toEqual([]);
  });

  it("supports single-quoted attributes", () => {
    expect(findDuplicateIds("<div id='a'></div><p id='a'></p>")).toEqual([
      { id: "a", count: 2 },
    ]);
  });
});

describe("findHeadingLevelJumps", () => {
  it("flags an h1→h3 jump inside main", () => {
    const html =
      "<main><h1>Título</h1><h3>Ahorro anual estimado</h3></main>";
    expect(findHeadingLevelJumps(html)).toEqual([
      { from: 1, to: 3, text: "Ahorro anual estimado" },
    ]);
  });

  it("flags an h2→h4 jump with tags stripped from the label", () => {
    const html =
      "<main><h2>Atractivo</h2><h4>Régimen <strong>A</strong></h4></main>";
    expect(findHeadingLevelJumps(html)).toEqual([
      { from: 2, to: 4, text: "Régimen A" },
    ]);
  });

  it("accepts a strictly sequential hierarchy", () => {
    const html =
      "<main><h1>A</h1><h2>B</h2><h3>C</h3><h3>D</h3><h2>E</h2></main>";
    expect(findHeadingLevelJumps(html)).toEqual([]);
  });

  it("ignores headings outside main and pages without main", () => {
    expect(
      findHeadingLevelJumps("<header><h1>A</h1><h4>B</h4></header>")
    ).toEqual([]);
    expect(
      findHeadingLevelJumps("<body><h1>A</h1></body><main><h2>B</h2></main>")
    ).toEqual([]);
  });
});

describe("extractJsonLdBlocks", () => {
  it("extracts ld+json content and ignores other script types", () => {
    const html =
      '<script type="application/ld+json">{"a":1}</script>' +
      '<script>const x = 1;</script>' +
      '<script type="application/ld+json">{"b":2}</script>';
    expect(extractJsonLdBlocks(html)).toEqual(['{"a":1}', '{"b":2}']);
  });
});

describe("check-postbuild runner over a full mini-dist", () => {
  function writeValidMiniDist(root: string) {
    const headers =
      '/*\nContent-Security-Policy: default-src \'self\'; script-src \'self\' \'sha256-abc=\'; style-src \'self\' \'unsafe-inline\'\n*/';
    writeFileSync(path.join(root, "_headers"), headers, "utf8");

    const sitemap =
      "<urlset>" +
      "<url><loc>https://monedario.cl/posts/a/</loc></url>" +
      "<url><loc>https://monedario.cl/posts/b/</loc></url>" +
      "</urlset>";
    writeFileSync(path.join(root, "sitemap-0.xml"), sitemap, "utf8");

    writePage(
      root,
      "posts/a/index.html",
      '<html><head><title>A | Monedario</title></head><body><p>ok</p>' +
        '<script type="application/ld+json">{"a":"x"}</script></body></html>'
    );
    writePage(
      root,
      "posts/b/index.html",
      '<html><head><title>B | Monedario</title></head><body><p>ok</p></body></html>'
    );

    for (const [slug, seoTitle] of [
      ["operacion-renta-f22-checklist", "Operación Renta: Checklist del Formulario 22 | Monedario"],
      ["tarjeta-credito-costo-real-chile", "Costo Real de una Tarjeta de Crédito en Chile | Monedario"],
      ["informe-deudas-cmf-vs-dicom", "Informe de Deudas CMF: Por Qué no es DICOM | Monedario"],
    ]) {
      writePage(
        root,
        `posts/${slug}/index.html`,
        `<html><head><title>${seoTitle}</title></head><body><p>x</p></body></html>`
      );
    }
    writePage(
      root,
      "posts/deposito-a-plazo-uf-vs-pesos/index.html",
      '<html><head><title>Depósito a plazo: UF vs pesos — qué conviene y cuándo | Monedario</title></head>' +
        '<body><h1>Depósito a plazo: UF vs pesos — qué conviene y cuándo</h1><p>x</p></body></html>'
    );

    const pagefindDir = path.join(root, "pagefind");
    mkdirSync(pagefindDir, { recursive: true });
    writeFileSync(path.join(pagefindDir, "pagefind-entry.json"), "{}", "utf8");
    writeFileSync(path.join(pagefindDir, "tiny.js"), "/* small */", "utf8");
  }

  it("passes on a valid mini-dist", () => {
    const root = buildDist();
    writeValidMiniDist(root);
    const r = run(root);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("OK");
  });

  it("reports violations with rule ids on a broken dist", () => {
    const root = buildDist();
    writeValidMiniDist(root);
    // Break the CSP posture
    writeFileSync(
      path.join(root, "_headers"),
      "Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'",
      "utf8"
    );
    // Break tag balance in posts/b and put a literal </script> inside ld+json
    writePage(
      root,
      "posts/b/index.html",
      '<html><head><title>B | Monedario</title></head><body><p>unclosed' +
        '<script type="application/ld+json">{"x":"</script>"}</script></body></html>'
    );
    const r = run(root);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("csp-hashes-injected");
    expect(r.stderr).toContain("unsafe-inline");
    expect(r.stderr).toContain("spacing-sanity");
    expect(r.stderr).toContain("jsonld-no-script-breakout");
  });
});
