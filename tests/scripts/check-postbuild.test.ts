import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";
import {
  collectSitemapLocs,
  countTags,
  extractJsonLdBlocks,
  findAuthorProfileSchemaIssues,
  findBreadcrumbIssues,
  findCspConnectSrcViolations,
  findDuplicateIds,
  findFutureLastmods,
  findGuideIntentIssues,
  findMixedContent,
  findPublicSourcemaps,
  findHeadingLevelJumps,
  findInvalidJsonLd,
  findNonCanonicalInternalHrefs,
  findParametrizedCanonicals,
  findRawEconomicInterpolations,
  findSitemapLastmodIssues,
  findTrackingParamLocs,
  hasNoindex,
  hasNoindexFollow,
  ogImageDistPath,
  parseScriptSrc,
  readCanonicalFromHtml,
  readH1FromHtml,
  readOgImageFromHtml,
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

describe("hasNoindexFollow", () => {
  it("accepts noindex,follow regardless of attribute order", () => {
    expect(
      hasNoindexFollow('<meta name="robots" content="noindex,follow">')
    ).toBe(true);
    expect(
      hasNoindexFollow('<meta content="noindex, follow" name="robots">')
    ).toBe(true);
  });

  it("rejects missing or different robots directives", () => {
    expect(hasNoindexFollow("<html></html>")).toBe(false);
    expect(
      hasNoindexFollow('<meta name="robots" content="index,follow">')
    ).toBe(false);
  });
});

describe("findNonCanonicalInternalHrefs", () => {
  it("flags internal paths without the trailing slash", () => {
    expect(
      findNonCanonicalInternalHrefs('<a href="/metodologia">x</a>')
    ).toEqual(["/metodologia"]);
  });

  it("allows canonical paths, files and external links", () => {
    const html =
      '<a href="/metodologia/">x</a>' +
      '<a href="/rss.xml">x</a>' +
      '<a href="https://example.com/metodologia">x</a>' +
      '<a href="#top">x</a>';
    expect(findNonCanonicalInternalHrefs(html)).toEqual([]);
  });

  it("deduplicates repeated offenders", () => {
    const html = '<a href="/metodologia">x</a><a href="/metodologia">y</a>';
    expect(findNonCanonicalInternalHrefs(html)).toEqual(["/metodologia"]);
  });
});

describe("findSitemapLastmodIssues", () => {
  it("flags urls without lastmod or with invalid dates", () => {
    const xml =
      "<urlset>" +
      "<url><loc>https://monedario.cl/a/</loc><lastmod>2026-09-01</lastmod></url>" +
      "<url><loc>https://monedario.cl/b/</loc></url>" +
      "<url><loc>https://monedario.cl/c/</loc><lastmod>ayer</lastmod></url>" +
      "</urlset>";
    expect(findSitemapLastmodIssues(xml)).toEqual([
      "https://monedario.cl/b/",
      "https://monedario.cl/c/",
    ]);
  });

  it("accepts a complete sitemap", () => {
    const xml =
      "<urlset><url><loc>https://monedario.cl/a/</loc>" +
      "<lastmod>2026-09-01T00:00:00.000Z</lastmod></url></urlset>";
    expect(findSitemapLastmodIssues(xml)).toEqual([]);
  });
});

describe("findGuideIntentIssues", () => {
  const canonicalRegistry = {
    "impuestos-personas": {
      "f22-revisar-enviar": { ownerSlug: "operacion-renta-f22-checklist" },
    },
  };

  it("accepts a hub landing present in dist with a registered topic", () => {
    const dist = buildDist();
    writePage(
      dist,
      "guias/impuestos-personas/operacion-renta/index.html",
      "<html></html>"
    );
    const registry = {
      "/guias/impuestos-personas/operacion-renta/": {
        cluster: "impuestos-personas",
        canonicalTopic: "f22-revisar-enviar",
        role: "hub",
      },
    };
    expect(findGuideIntentIssues(registry, canonicalRegistry, dist)).toEqual([]);
  });

  it("flags unknown topics, owner roles and missing pages", () => {
    const dist = buildDist();
    const registry = {
      "/guias/x/": {
        cluster: "nope",
        canonicalTopic: "nope",
        role: "owner",
      },
      "/posts/not-a-guide/": {
        cluster: "impuestos-personas",
        canonicalTopic: "f22-revisar-enviar",
        role: "hub",
      },
    };
    const issues = findGuideIntentIssues(registry, canonicalRegistry, dist);
    expect(issues).toHaveLength(4);
    expect(issues.join("\n")).toContain("no registrado");
    expect(issues.join("\n")).toContain("no puede declararse owner");
    expect(issues.join("\n")).toContain("no es una landing /guias/");
    expect(issues.join("\n")).toContain("página no encontrada");
  });
});

describe("findMixedContent", () => {
  it("detecta referencias http:// en atributos de recurso", () => {
    expect(findMixedContent('<img src="http://x/a.png">')).toEqual([
      "http://x/a.png",
    ]);
    expect(
      findMixedContent(
        '<a href="https://x/a">x</a><script src="/a.js"></script>'
      )
    ).toEqual([]);
  });
});

describe("findPublicSourcemaps", () => {
  it("detecta archivos .map y referencias sourceMappingURL", () => {
    const dist = buildDist();
    writePage(dist, "assets/a.js", "//# sourceMappingURL=a.js.map");
    writeFileSync(path.join(dist, "assets/a.js.map"), "{}");
    const issues = findPublicSourcemaps(dist).join("\n");
    expect(issues).toContain("a.js.map");
    expect(issues).toContain("sourceMappingURL");
  });

  it("pasa en un dist limpio", () => {
    const dist = buildDist();
    writePage(dist, "assets/a.js", "console.log(1)");
    expect(findPublicSourcemaps(dist)).toEqual([]);
  });
});

describe("findCspConnectSrcViolations", () => {
  it("marca orígenes fuera del allowlist", () => {
    const headers =
      "Content-Security-Policy: default-src 'self'; connect-src 'self' https://evil.example.com";
    expect(
      findCspConnectSrcViolations(headers, [
        "https://static.cloudflareinsights.com",
      ])
    ).toEqual(["https://evil.example.com"]);
  });

  it("acepta orígenes allowlisted", () => {
    const headers =
      "Content-Security-Policy: connect-src 'self' https://static.cloudflareinsights.com";
    expect(
      findCspConnectSrcViolations(headers, [
        "https://static.cloudflareinsights.com",
      ])
    ).toEqual([]);
  });
});

describe("hasNoindex", () => {
  it("accepts noindex with or without follow", () => {
    expect(hasNoindex('<meta name="robots" content="noindex">')).toBe(true);
    expect(hasNoindex('<meta name="robots" content="noindex,follow">')).toBe(
      true
    );
    expect(hasNoindex('<meta name="robots" content="index,follow">')).toBe(
      false
    );
    expect(hasNoindex("<html></html>")).toBe(false);
  });
});

describe("findTrackingParamLocs", () => {
  it("flags sitemap locs with query or fragment", () => {
    const xml =
      "<urlset>" +
      "<url><loc>https://monedario.cl/apoyar/?src=footer</loc></url>" +
      "<url><loc>https://monedario.cl/posts/a/</loc></url>" +
      "</urlset>";
    expect(findTrackingParamLocs(xml)).toEqual([
      "https://monedario.cl/apoyar/?src=footer",
    ]);
  });
});

describe("findParametrizedCanonicals", () => {
  it("flags canonicals with query or fragment", () => {
    expect(
      findParametrizedCanonicals(
        '<link rel="canonical" href="https://monedario.cl/a/?x=1">'
      )
    ).toEqual(["https://monedario.cl/a/?x=1"]);
    expect(
      findParametrizedCanonicals(
        '<link rel="canonical" href="https://monedario.cl/a/">'
      )
    ).toEqual([]);
  });
});

describe("findFutureLastmods", () => {
  it("flags only future dates", () => {
    const xml =
      "<urlset>" +
      "<url><loc>https://monedario.cl/a/</loc><lastmod>2026-01-01</lastmod></url>" +
      "<url><loc>https://monedario.cl/b/</loc><lastmod>2099-01-01</lastmod></url>" +
      "</urlset>";
    expect(findFutureLastmods(xml, new Date("2026-06-01"))).toEqual([
      "https://monedario.cl/b/ (2099-01-01)",
    ]);
  });
});

describe("findInvalidJsonLd", () => {
  it("accepts valid blocks and reports invalid ones", () => {
    const valid = '<script type="application/ld+json">{"@type":"WebPage"}</script>';
    const invalid = '<script type="application/ld+json">{oops</script>';
    expect(findInvalidJsonLd(valid)).toEqual([]);
    expect(findInvalidJsonLd(invalid)).toHaveLength(1);
  });
});

describe("readCanonicalFromHtml", () => {
  it("extracts the canonical URL regardless of attribute order", () => {
    expect(
      readCanonicalFromHtml(
        '<link rel="canonical" href="https://monedario.cl/posts/a/">'
      )
    ).toBe("https://monedario.cl/posts/a/");
    expect(
      readCanonicalFromHtml(
        '<link href="https://monedario.cl/posts/a/" rel="canonical">'
      )
    ).toBe("https://monedario.cl/posts/a/");
    expect(readCanonicalFromHtml("<html></html>")).toBeNull();
  });
});

describe("readOgImageFromHtml / ogImageDistPath", () => {
  it("extracts og:image regardless of attribute order", () => {
    expect(
      readOgImageFromHtml(
        '<meta property="og:image" content="https://monedario.cl/images/og/a.jpg">'
      )
    ).toBe("https://monedario.cl/images/og/a.jpg");
    expect(
      readOgImageFromHtml(
        '<meta content="https://monedario.cl/images/og/a.jpg" property="og:image">'
      )
    ).toBe("https://monedario.cl/images/og/a.jpg");
  });

  it("ignores og:image:secure_url and missing tags", () => {
    expect(
      readOgImageFromHtml(
        '<meta property="og:image:secure_url" content="https://monedario.cl/a.jpg">'
      )
    ).toBeNull();
    expect(readOgImageFromHtml("<html></html>")).toBeNull();
  });

  it("maps same-origin URLs into dist and leaves external URLs alone", () => {
    expect(
      ogImageDistPath(
        "https://monedario.cl/images/og/a.jpg",
        "https://monedario.cl/posts/a/",
        "/tmp/dist"
      )
    ).toBe("/tmp/dist/images/og/a.jpg");
    expect(
      ogImageDistPath(
        "https://cdn.example.com/a.jpg",
        "https://monedario.cl/posts/a/",
        "/tmp/dist"
      )
    ).toBeNull();
  });
});

describe("findBreadcrumbIssues", () => {
  const page = (breadcrumb: object) =>
    '<link rel="canonical" href="https://monedario.cl/posts/a/">' +
    `<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`;

  it("accepts a breadcrumb ending at the canonical URL", () => {
    expect(
      findBreadcrumbIssues(
        page({
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, item: "https://monedario.cl/" },
            {
              "@type": "ListItem",
              position: 2,
              item: "https://monedario.cl/posts/a/",
            },
          ],
        })
      )
    ).toEqual([]);
  });

  it("flags a breadcrumb ending elsewhere or missing its final item", () => {
    expect(
      findBreadcrumbIssues(
        page({
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, item: "https://monedario.cl/" },
          ],
        })
      )
    ).toHaveLength(1);
    expect(
      findBreadcrumbIssues(
        page({ "@type": "BreadcrumbList", itemListElement: [] })
      )
    ).toHaveLength(1);
  });

  it("finds breadcrumbs nested in @graph and ignores pages without one", () => {
    const nested = page({
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebSite", url: "https://monedario.cl/" },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              item: "https://monedario.cl/posts/b",
            },
          ],
        },
      ],
    });
    expect(findBreadcrumbIssues(nested)).toHaveLength(1);
    expect(findBreadcrumbIssues("<html></html>")).toEqual([]);
  });
});

describe("findAuthorProfileSchemaIssues", () => {
  const graph = (profile: unknown, person: unknown) =>
    `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [profile, person],
    })}</script>`;

  it("accepts a linked ProfilePage + Person graph", () => {
    const html = graph(
      {
        "@type": "ProfilePage",
        "@id": "https://monedario.cl/autor/#profilepage",
        mainEntity: { "@id": "https://monedario.cl/autor/" },
      },
      {
        "@type": "Person",
        "@id": "https://monedario.cl/autor/",
        mainEntityOfPage: {
          "@id": "https://monedario.cl/autor/#profilepage",
        },
      }
    );
    expect(findAuthorProfileSchemaIssues(html)).toEqual([]);
  });

  it("flags a missing ProfilePage", () => {
    const html = graph(null, {
      "@type": "Person",
      "@id": "https://monedario.cl/autor/",
    });
    expect(findAuthorProfileSchemaIssues(html)).toContain(
      "missing ProfilePage node"
    );
  });

  it("flags an unlinked mainEntity reference", () => {
    const html = graph(
      {
        "@type": "ProfilePage",
        "@id": "https://monedario.cl/autor/#profilepage",
        mainEntity: { "@id": "https://monedario.cl/otro/" },
      },
      {
        "@type": "Person",
        "@id": "https://monedario.cl/autor/",
        mainEntityOfPage: {
          "@id": "https://monedario.cl/autor/#profilepage",
        },
      }
    );
    expect(findAuthorProfileSchemaIssues(html)).toContain(
      "ProfilePage.mainEntity must reference the Person @id"
    );
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

describe("findRawEconomicInterpolations", () => {
  it("detects raw interpolation templates and ignores resolved text", () => {
    expect(
      findRawEconomicInterpolations("UTM [[utm * 13.5 | clp]] y $968.234")
    ).toEqual(["[[utm * 13.5 | clp]]"]);
    expect(findRawEconomicInterpolations("UTM $968.234 ya interpolado")).toEqual(
      []
    );
  });
});

describe("check-postbuild runner over a full mini-dist", () => {
  function writeValidMiniDist(root: string) {
    const ogMeta =
      '<meta property="og:image" content="https://monedario.cl/images/og/post.jpg">';
    const headers =
      '/*\nContent-Security-Policy: default-src \'self\'; script-src \'self\' \'sha256-abc=\'; style-src \'self\' \'unsafe-inline\'\n*/';
    writeFileSync(path.join(root, "_headers"), headers, "utf8");

    const sitemap =
      "<urlset>" +
      "<url><loc>https://monedario.cl/posts/a/</loc><lastmod>2026-09-01</lastmod></url>" +
      "<url><loc>https://monedario.cl/posts/b/</loc><lastmod>2026-09-01</lastmod></url>" +
      "</urlset>";
    writeFileSync(path.join(root, "sitemap-0.xml"), sitemap, "utf8");

    writePage(
      root,
      "posts/a/index.html",
      '<html><head><title>A | Monedario</title>' +
        '<link rel="canonical" href="https://monedario.cl/posts/a/">' +
        ogMeta +
        '</head><body><p>ok</p>' +
        '<script type="application/ld+json">{"a":"x"}</script></body></html>'
    );
    writePage(
      root,
      "posts/b/index.html",
      '<html><head><title>B | Monedario</title>' +
        '<link rel="canonical" href="https://monedario.cl/posts/b/">' +
        ogMeta +
        "</head><body><p>ok</p></body></html>"
    );

    for (const [slug, seoTitle] of [
      ["operacion-renta-f22-checklist", "Operación Renta: Checklist del Formulario 22 | Monedario"],
      ["tarjeta-credito-costo-real-chile", "Costo Real de una Tarjeta de Crédito en Chile | Monedario"],
      ["informe-deudas-cmf-vs-dicom", "Informe de Deudas CMF: Por Qué no es DICOM | Monedario"],
    ]) {
      writePage(
        root,
        `posts/${slug}/index.html`,
        `<html><head><title>${seoTitle}</title>${ogMeta}</head><body><p>x</p></body></html>`
      );
    }
    writePage(
      root,
      "posts/deposito-a-plazo-uf-vs-pesos/index.html",
      '<html><head><title>Depósito a plazo: UF vs pesos — qué conviene y cuándo | Monedario</title>' +
        ogMeta +
        "</head>" +
        '<body><h1>Depósito a plazo: UF vs pesos — qué conviene y cuándo</h1><p>x</p></body></html>'
    );

    writePage(root, "images/og/post.jpg", "jpg");

    writePage(
      root,
      "guias/impuestos-personas/operacion-renta/index.html",
      '<html><head><title>Centro Operación Renta | Monedario</title></head>' +
        "<body><p>ok</p></body></html>"
    );

    writeFileSync(
      path.join(root, "llms-full.txt"),
      "Artículo con $968.234 ya interpolado\n",
      "utf8"
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

  it("fails when a post has no per-post og:image", () => {
    const root = buildDist();
    writeValidMiniDist(root);
    writePage(
      root,
      "posts/a/index.html",
      '<html><head><title>A | Monedario</title>' +
        '<link rel="canonical" href="https://monedario.cl/posts/a/">' +
        "</head><body><p>ok</p></body></html>"
    );
    const r = run(root);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("post-og-image");
  });

  it("fails when llms-full.txt exposes raw interpolation syntax", () => {
    const root = buildDist();
    writeValidMiniDist(root);
    writeFileSync(
      path.join(root, "llms-full.txt"),
      "Tramo exento hasta [[utm * 13.5 | clp]]\n",
      "utf8"
    );
    const r = run(root);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("llms-full-no-raw-interpolation");
  });
});
