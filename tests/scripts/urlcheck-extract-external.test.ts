import { describe, it, expect } from "vitest";
import { extractAnchorsFromHtml } from "../../scripts/urlcheck/extract-external.mjs";

const PAGE_URL = "https://monedario.cl/posts/ejemplo/";
const SELF_ORIGINS = new Set(["monedario.cl", "www.monedario.cl"]);

describe("extractAnchorsFromHtml – self-origin filtering", () => {
  it("excludes links to monedario.cl", () => {
    const html = `<a href="https://monedario.cl/posts/otro/">Otro artículo</a>`;
    const result = extractAnchorsFromHtml(html, PAGE_URL, SELF_ORIGINS);
    expect(result).toHaveLength(0);
  });

  it("excludes links to www.monedario.cl", () => {
    const html = `<a href="https://www.monedario.cl/calculadoras/">Calculadoras</a>`;
    const result = extractAnchorsFromHtml(html, PAGE_URL, SELF_ORIGINS);
    expect(result).toHaveLength(0);
  });

  it("includes links to other external domains", () => {
    const html = `<a href="https://www.bcentral.cl/estadisticas/">Banco Central</a>`;
    const result = extractAnchorsFromHtml(html, PAGE_URL, SELF_ORIGINS);
    expect(result).toHaveLength(1);
    expect(result[0].href).toBe("https://www.bcentral.cl/estadisticas/");
  });
});

describe("extractAnchorsFromHtml – scheme filtering", () => {
  it("excludes mailto: links", () => {
    const html = `<a href="mailto:info@example.com">Email</a>`;
    const result = extractAnchorsFromHtml(html, PAGE_URL, SELF_ORIGINS);
    expect(result).toHaveLength(0);
  });

  it("excludes javascript: links", () => {
    const html = `<a href="javascript:void(0)">Click</a>`;
    const result = extractAnchorsFromHtml(html, PAGE_URL, SELF_ORIGINS);
    expect(result).toHaveLength(0);
  });

  it("excludes fragment-only links", () => {
    const html = `<a href="#section-1">Section</a>`;
    const result = extractAnchorsFromHtml(html, PAGE_URL, SELF_ORIGINS);
    expect(result).toHaveLength(0);
  });

  it("includes http: links", () => {
    const html = `<a href="http://www.sii.cl/documentos/resoluciones/2023.pdf">SII Doc</a>`;
    const result = extractAnchorsFromHtml(html, PAGE_URL, SELF_ORIGINS);
    expect(result).toHaveLength(1);
  });

  it("includes https: links", () => {
    const html = `<a href="https://es.wikipedia.org/wiki/AFP">AFP Wikipedia</a>`;
    const result = extractAnchorsFromHtml(html, PAGE_URL, SELF_ORIGINS);
    expect(result).toHaveLength(1);
  });
});

describe("extractAnchorsFromHtml – linkType classification", () => {
  it("classifies target=_blank rel=noopener as structured", () => {
    const html = `<a href="https://www.bcentral.cl/" target="_blank" rel="noopener noreferrer">Banco Central</a>`;
    const result = extractAnchorsFromHtml(html, PAGE_URL, SELF_ORIGINS);
    expect(result[0].linkType).toBe("structured");
  });

  it("classifies plain anchor as inline", () => {
    const html = `<a href="https://www.bcentral.cl/">Banco Central</a>`;
    const result = extractAnchorsFromHtml(html, PAGE_URL, SELF_ORIGINS);
    expect(result[0].linkType).toBe("inline");
  });

  it("classifies rel=noopener without target as structured", () => {
    const html = `<a href="https://www.cmfchile.cl/" rel="noopener">CMF</a>`;
    const result = extractAnchorsFromHtml(html, PAGE_URL, SELF_ORIGINS);
    expect(result[0].linkType).toBe("structured");
  });
});

describe("extractAnchorsFromHtml – URL normalisation", () => {
  it("strips fragment from external link", () => {
    const html = `<a href="https://es.wikipedia.org/wiki/AFP#Historia">Historia AFP</a>`;
    const result = extractAnchorsFromHtml(html, PAGE_URL, SELF_ORIGINS);
    expect(result[0].href).toBe("https://es.wikipedia.org/wiki/AFP");
  });

  it("resolves relative href using pageUrl", () => {
    const html = `<a href="/guias/afp">Guía AFP</a>`;
    const result = extractAnchorsFromHtml(html, "https://external.cl/page/", SELF_ORIGINS);
    // /guias/afp resolved against a non-self origin page URL = external.cl
    expect(result[0].href).toContain("external.cl");
  });
});

describe("extractAnchorsFromHtml – anchor text", () => {
  it("extracts plain text from anchor", () => {
    const html = `<a href="https://www.bcentral.cl/">Banco Central de Chile</a>`;
    const result = extractAnchorsFromHtml(html, PAGE_URL, SELF_ORIGINS);
    expect(result[0].anchorText).toBe("Banco Central de Chile");
  });

  it("strips inner HTML tags from anchor text", () => {
    const html = `<a href="https://www.bcentral.cl/"><span>Banco Central</span> de Chile</a>`;
    const result = extractAnchorsFromHtml(html, PAGE_URL, SELF_ORIGINS);
    expect(result[0].anchorText).toBe("Banco Central de Chile");
  });

  it("decodes HTML entities in anchor text", () => {
    const html = `<a href="https://www.sii.cl/">Servicio &amp; Impuestos</a>`;
    const result = extractAnchorsFromHtml(html, PAGE_URL, SELF_ORIGINS);
    expect(result[0].anchorText).toBe("Servicio & Impuestos");
  });
});

describe("extractAnchorsFromHtml – multiple links", () => {
  it("extracts multiple external links from one page", () => {
    const html = [
      `<a href="https://www.bcentral.cl/">BCCh</a>`,
      `<a href="https://www.cmfchile.cl/">CMF</a>`,
      `<a href="https://monedario.cl/interno/">Interno</a>`,
      `<a href="https://www.sii.cl/" target="_blank" rel="noopener noreferrer">SII</a>`,
    ].join("\n");

    const result = extractAnchorsFromHtml(html, PAGE_URL, SELF_ORIGINS);
    expect(result).toHaveLength(3);
    const urls = result.map((r) => r.href);
    expect(urls).toContain("https://www.bcentral.cl/");
    expect(urls).toContain("https://www.cmfchile.cl/");
    expect(urls).toContain("https://www.sii.cl/");
    // Confirm structured classification for SII
    const sii = result.find((r) => r.href === "https://www.sii.cl/");
    expect(sii?.linkType).toBe("structured");
  });
});
