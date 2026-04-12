import { describe, it, expect } from "vitest";
import {
  classifyHost,
  isSelfOrigin,
  isBlockingCategory,
  getAllowedFamily,
  isBinaryContentType,
  detectSoft404,
  isPrivateHostname,
  SELF_ORIGINS,
} from "../../scripts/urlcheck/host-registry.mjs";

describe("classifyHost", () => {
  it("classifies Chilean government institutions as official_source", () => {
    expect(classifyHost("www.bcentral.cl")).toBe("official_source");
    expect(classifyHost("bcentral.cl")).toBe("official_source");
    expect(classifyHost("www.cmfchile.cl")).toBe("official_source");
    expect(classifyHost("conocetudeuda.cmfchile.cl")).toBe("official_source");
    expect(classifyHost("www.sii.cl")).toBe("official_source");
    expect(classifyHost("www.spensiones.cl")).toBe("official_source");
    expect(classifyHost("www.bcn.cl")).toBe("official_source");
    expect(classifyHost("www.ine.cl")).toBe("official_source");
    expect(classifyHost("afc.cl")).toBe("official_source");
    expect(classifyHost("www.dt.gob.cl")).toBe("official_source");
    expect(classifyHost("www.tgr.cl")).toBe("official_source");
    expect(classifyHost("tesoreria.cl")).toBe("official_source");
    expect(classifyHost("www.afcchile.cl")).toBe("official_source");
  });

  it("classifies AFP sites as official_source", () => {
    expect(classifyHost("www.afpmodelo.cl")).toBe("official_source");
    expect(classifyHost("www.afphabitat.cl")).toBe("official_source");
    expect(classifyHost("www.cuprum.cl")).toBe("official_source");
    expect(classifyHost("www.primamerica.cl")).toBe("official_source");
  });

  it("classifies Wikipedia and international bodies as trusted_reference", () => {
    expect(classifyHost("es.wikipedia.org")).toBe("trusted_reference");
    expect(classifyHost("en.wikipedia.org")).toBe("trusted_reference");
    expect(classifyHost("www.imf.org")).toBe("trusted_reference");
    expect(classifyHost("www.oecd.org")).toBe("trusted_reference");
    expect(classifyHost("www.worldbank.org")).toBe("trusted_reference");
  });

  it("classifies social networks as brand_profile", () => {
    expect(classifyHost("www.instagram.com")).toBe("brand_profile");
    expect(classifyHost("www.facebook.com")).toBe("brand_profile");
    expect(classifyHost("www.youtube.com")).toBe("brand_profile");
    expect(classifyHost("x.com")).toBe("brand_profile");
  });

  it("classifies WhatsApp share endpoints as share_endpoint", () => {
    expect(classifyHost("api.whatsapp.com")).toBe("share_endpoint");
    expect(classifyHost("wa.me")).toBe("share_endpoint");
  });

  it("classifies Google as known_soft_nonblocking", () => {
    expect(classifyHost("www.google.com")).toBe("known_soft_nonblocking");
    expect(classifyHost("www.google.cl")).toBe("known_soft_nonblocking");
  });

  it("returns unknown for unregistered hosts", () => {
    expect(classifyHost("example.com")).toBe("unknown");
    expect(classifyHost("random-blog.cl")).toBe("unknown");
  });
});

describe("isSelfOrigin", () => {
  it("returns true for monedario.cl and www.monedario.cl", () => {
    expect(isSelfOrigin("monedario.cl")).toBe(true);
    expect(isSelfOrigin("www.monedario.cl")).toBe(true);
  });

  it("returns false for all other hosts", () => {
    expect(isSelfOrigin("www.bcentral.cl")).toBe(false);
    expect(isSelfOrigin("example.com")).toBe(false);
  });

  it("SELF_ORIGINS has exactly the expected entries", () => {
    expect([...SELF_ORIGINS].sort()).toEqual(["monedario.cl", "www.monedario.cl"]);
  });
});

describe("isBlockingCategory", () => {
  it("returns true only for official_source and trusted_reference", () => {
    expect(isBlockingCategory("official_source")).toBe(true);
    expect(isBlockingCategory("trusted_reference")).toBe(true);
  });

  it("returns false for non-blocking categories", () => {
    expect(isBlockingCategory("brand_profile")).toBe(false);
    expect(isBlockingCategory("share_endpoint")).toBe(false);
    expect(isBlockingCategory("known_soft_nonblocking")).toBe(false);
    expect(isBlockingCategory("unknown")).toBe(false);
  });
});

describe("getAllowedFamily", () => {
  it("returns a family set for known hosts", () => {
    const family = getAllowedFamily("www.bcentral.cl");
    expect(family.has("www.bcentral.cl")).toBe(true);
    expect(family.has("bcentral.cl")).toBe(true);
    expect(family.has("google.com")).toBe(false);
  });

  it("returns a single-element set for unknown hosts", () => {
    const family = getAllowedFamily("example.com");
    expect(family.has("example.com")).toBe(true);
    expect(family.size).toBe(1);
  });

  it("www. and non-www. entries share the same family", () => {
    const familyWww = getAllowedFamily("www.sii.cl");
    const familyBare = getAllowedFamily("sii.cl");
    expect([...familyWww].sort()).toEqual([...familyBare].sort());
  });

  it("tgr.cl and tesoreria.cl are treated as the same official family", () => {
    const family = getAllowedFamily("www.tesoreria.cl");
    expect(family.has("www.tesoreria.cl")).toBe(true);
    expect(family.has("tesoreria.cl")).toBe(true);
    expect(family.has("www.tgr.cl")).toBe(true);
    expect(family.has("tgr.cl")).toBe(true);
  });

  it("afc.cl and afcchile.cl are treated as the same official family", () => {
    const family = getAllowedFamily("www.afc.cl");
    expect(family.has("www.afc.cl")).toBe(true);
    expect(family.has("afc.cl")).toBe(true);
    expect(family.has("www.afcchile.cl")).toBe(true);
    expect(family.has("afcchile.cl")).toBe(true);
  });

  it("wikipedia variants are in the same family", () => {
    const esFamily = getAllowedFamily("es.wikipedia.org");
    expect(esFamily.has("en.wikipedia.org")).toBe(true);
    expect(esFamily.has("es.wikipedia.org")).toBe(true);
  });
});

describe("isBinaryContentType", () => {
  it("returns true for PDF, images, video, audio", () => {
    expect(isBinaryContentType("application/pdf")).toBe(true);
    expect(isBinaryContentType("application/pdf; charset=utf-8")).toBe(true);
    expect(isBinaryContentType("image/png")).toBe(true);
    expect(isBinaryContentType("image/jpeg")).toBe(true);
    expect(isBinaryContentType("video/mp4")).toBe(true);
    expect(isBinaryContentType("audio/mpeg")).toBe(true);
    expect(isBinaryContentType("application/octet-stream")).toBe(true);
    expect(isBinaryContentType("application/zip")).toBe(true);
  });

  it("returns false for HTML and text types", () => {
    expect(isBinaryContentType("text/html; charset=utf-8")).toBe(false);
    expect(isBinaryContentType("text/plain")).toBe(false);
    expect(isBinaryContentType("application/json")).toBe(false);
  });

  it("returns false for empty / null content type", () => {
    expect(isBinaryContentType("")).toBe(false);
    expect(isBinaryContentType(null)).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isBinaryContentType("Application/PDF")).toBe(true);
    expect(isBinaryContentType("IMAGE/PNG")).toBe(true);
  });
});

describe("detectSoft404", () => {
  const defaultOpts = { hostname: "www.example.com", contentType: "text/html" };

  it("detects Spanish soft-404 phrase in title", () => {
    const result = detectSoft404(
      { title: "Página no encontrada", h1: null, bodySnippet: null },
      defaultOpts
    );
    expect(result.detected).toBe(true);
    expect(result.matchedPhrase).toBe("página no encontrada");
  });

  it("is case-insensitive for soft-404 phrases", () => {
    const result = detectSoft404(
      { title: "PÁGINA NO ENCONTRADA", h1: null, bodySnippet: null },
      defaultOpts
    );
    expect(result.detected).toBe(true);
  });

  it("detects English soft-404 phrase in H1", () => {
    const result = detectSoft404(
      { title: null, h1: "Page not found", bodySnippet: null },
      defaultOpts
    );
    expect(result.detected).toBe(true);
    expect(result.matchedPhrase).toBe("page not found");
  });

  it("detects 404 bare number in title", () => {
    const result = detectSoft404(
      { title: "Error 404", h1: null, bodySnippet: null },
      defaultOpts
    );
    expect(result.detected).toBe(true);
  });

  it("does NOT detect bare '404' in body (too broad)", () => {
    const result = detectSoft404(
      { title: "Calculadora AFP 2024", h1: "Tasas AFP 2024", bodySnippet: "El monto es 404 pesos" },
      defaultOpts
    );
    expect(result.detected).toBe(false);
  });

  it("detects discriminating body phrase", () => {
    const result = detectSoft404(
      {
        title: "Banco Central",
        h1: "Publicaciones",
        bodySnippet: "Lo sentimos, la página que buscas ya no existe aquí.",
      },
      defaultOpts
    );
    expect(result.detected).toBe(false); // "lo sentimos, la página" is not in body SOFT_404_BODY_PHRASES
  });

  it("detects 'no encontramos la página' body phrase", () => {
    const result = detectSoft404(
      {
        title: "Banco Central",
        h1: "Publicaciones",
        bodySnippet: "no encontramos la página que buscabas.",
      },
      defaultOpts
    );
    expect(result.detected).toBe(true);
    expect(result.matchedPhrase).toBe("no encontramos la página");
  });

  it("returns detected=false for binary content types", () => {
    const result = detectSoft404(
      { title: "404 Not Found", h1: null, bodySnippet: null },
      { hostname: "www.example.com", contentType: "application/pdf" }
    );
    expect(result.detected).toBe(false);
  });

  it("returns detected=false for normal pages", () => {
    const result = detectSoft404(
      {
        title: "¿Cuánto descuenta la AFP?",
        h1: "Descuentos AFP 2025",
        bodySnippet: "Los descuentos obligatorios son del 10% del sueldo bruto.",
      },
      defaultOpts
    );
    expect(result.detected).toBe(false);
  });

  it("detects host-specific markers for bcentral.cl", () => {
    const result = detectSoft404(
      { title: "Página no encontrada en bcentral", h1: null, bodySnippet: null },
      { hostname: "www.bcentral.cl", contentType: "text/html" }
    );
    expect(result.detected).toBe(true);
  });

  it("returns null matchedPhrase when not detected", () => {
    const result = detectSoft404(
      { title: "Guía AFP 2025", h1: "Todo sobre la AFP", bodySnippet: null },
      defaultOpts
    );
    expect(result.detected).toBe(false);
    expect(result.matchedPhrase).toBeNull();
  });
});

describe("isPrivateHostname", () => {
  it("identifies loopback addresses", () => {
    expect(isPrivateHostname("localhost")).toBe(true);
    expect(isPrivateHostname("127.0.0.1")).toBe(true);
    expect(isPrivateHostname("127.1.2.3")).toBe(true);
    expect(isPrivateHostname("::1")).toBe(true);
  });

  it("identifies private IP ranges", () => {
    expect(isPrivateHostname("10.0.0.1")).toBe(true);
    expect(isPrivateHostname("192.168.1.1")).toBe(true);
    expect(isPrivateHostname("172.16.0.1")).toBe(true);
    expect(isPrivateHostname("172.31.255.255")).toBe(true);
    expect(isPrivateHostname("0.0.0.0")).toBe(true);
  });

  it("returns false for public IP and hostnames", () => {
    expect(isPrivateHostname("www.bcentral.cl")).toBe(false);
    expect(isPrivateHostname("8.8.8.8")).toBe(false);
    expect(isPrivateHostname("example.com")).toBe(false);
  });

  it("identifies non-private 172.x addresses correctly", () => {
    // 172.15.x.x is NOT in the private range
    expect(isPrivateHostname("172.15.0.1")).toBe(false);
    // 172.32.x.x is NOT in the private range
    expect(isPrivateHostname("172.32.0.1")).toBe(false);
  });
});
