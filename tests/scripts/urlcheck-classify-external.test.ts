import { describe, it, expect } from "vitest";
import { classifyExternalResult } from "../../scripts/urlcheck/classify-external.mjs";

// ---- Helpers ----

function makeLink(
  href: string,
  opts: { linkType?: "structured" | "inline"; anchorText?: string } = {}
) {
  return {
    href,
    referrers: ["https://monedario.cl/posts/test/"],
    linkType: opts.linkType ?? "inline",
    anchorText: opts.anchorText ?? "Test link",
  };
}

function makeProbe(
  url: string,
  opts: {
    status?: number | null;
    finalUrl?: string;
    contentType?: string;
    title?: string | null;
    h1?: string | null;
    bodySnippet?: string | null;
    error?: string | null;
  } = {}
) {
  return {
    url,
    finalUrl: opts.finalUrl ?? url,
    status: opts.status ?? 200,
    contentType: opts.contentType ?? "text/html; charset=utf-8",
    title: opts.title ?? "Normal Page Title",
    h1: opts.h1 ?? "Normal H1",
    bodySnippet: opts.bodySnippet ?? "Normal body content about financial topics.",
    error: opts.error ?? null,
  };
}

// ---- hard_fail tests ----

describe("classifyExternalResult – hard_fail", () => {
  it("classifies HTTP 404 on official_source as hard_fail blocking=true", () => {
    const result = classifyExternalResult(
      makeLink("https://www.bcentral.cl/documentos/no-existe/"),
      makeProbe("https://www.bcentral.cl/documentos/no-existe/", { status: 404 })
    );
    expect(result.classification).toBe("hard_fail");
    expect(result.blocking).toBe(true);
    expect(result.matched_signal).toBe("HTTP_404");
    expect(result.host_category).toBe("official_source");
  });

  it("classifies HTTP 410 on official_source as hard_fail blocking=true", () => {
    const result = classifyExternalResult(
      makeLink("https://www.sii.cl/documento-eliminado/"),
      makeProbe("https://www.sii.cl/documento-eliminado/", { status: 410 })
    );
    expect(result.classification).toBe("hard_fail");
    expect(result.blocking).toBe(true);
    expect(result.matched_signal).toBe("HTTP_410");
  });

  it("classifies HTTP 500 on official_source as hard_fail blocking=true", () => {
    const result = classifyExternalResult(
      makeLink("https://www.spensiones.cl/error/"),
      makeProbe("https://www.spensiones.cl/error/", { status: 500 })
    );
    expect(result.classification).toBe("hard_fail");
    expect(result.blocking).toBe(true);
  });

  it("classifies HTTP 404 on trusted_reference as hard_fail blocking=true", () => {
    const result = classifyExternalResult(
      makeLink("https://es.wikipedia.org/wiki/NoExiste"),
      makeProbe("https://es.wikipedia.org/wiki/NoExiste", { status: 404 })
    );
    expect(result.classification).toBe("hard_fail");
    expect(result.blocking).toBe(true);
  });

  it("classifies HTTP 404 on unknown host as hard_fail blocking=false", () => {
    const result = classifyExternalResult(
      makeLink("https://random-blog.cl/not-found/"),
      makeProbe("https://random-blog.cl/not-found/", { status: 404 })
    );
    expect(result.classification).toBe("hard_fail");
    expect(result.blocking).toBe(false);
  });
});

// ---- soft_404 tests ----

describe("classifyExternalResult – soft_404", () => {
  it("classifies 200 with soft-404 title on official_source as soft_404 blocking=true", () => {
    const result = classifyExternalResult(
      makeLink("https://www.bcentral.cl/publicacion-antigua/"),
      makeProbe("https://www.bcentral.cl/publicacion-antigua/", {
        status: 200,
        title: "Página no encontrada",
        h1: "Página no encontrada",
      })
    );
    expect(result.classification).toBe("soft_404");
    expect(result.blocking).toBe(true);
    expect(result.matched_signal).toBe("página no encontrada");
  });

  it("classifies 200 with 'page not found' in H1 on trusted_reference as soft_404 blocking=true", () => {
    const result = classifyExternalResult(
      makeLink("https://es.wikipedia.org/wiki/Inexistente"),
      makeProbe("https://es.wikipedia.org/wiki/Inexistente", {
        status: 200,
        title: "Wikipedia",
        h1: "Page not found",
      })
    );
    expect(result.classification).toBe("soft_404");
    expect(result.blocking).toBe(true);
  });

  it("classifies 200 with soft-404 title on unknown host as soft_404 blocking=false", () => {
    const result = classifyExternalResult(
      makeLink("https://random-blog.cl/old-page/"),
      makeProbe("https://random-blog.cl/old-page/", {
        status: 200,
        title: "Page not found",
      })
    );
    expect(result.classification).toBe("soft_404");
    expect(result.blocking).toBe(false);
  });

  it("does NOT flag normal 200 page as soft_404", () => {
    const result = classifyExternalResult(
      makeLink("https://www.bcentral.cl/estadisticas/"),
      makeProbe("https://www.bcentral.cl/estadisticas/", {
        status: 200,
        title: "Estadísticas Banco Central",
        h1: "Indicadores económicos",
        bodySnippet: "El IPC correspondiente al mes de marzo 2026...",
      })
    );
    expect(result.classification).toBe("ok");
    expect(result.blocking).toBe(false);
  });

  it("skips soft-404 check for PDF content-type", () => {
    // A PDF that returns 200 should NOT trigger soft-404 phrase matching
    const result = classifyExternalResult(
      makeLink("https://www.bcentral.cl/documento.pdf"),
      makeProbe("https://www.bcentral.cl/documento.pdf", {
        status: 200,
        contentType: "application/pdf",
        title: "not found",
        bodySnippet: null,
      })
    );
    // PDF OK (200, binary skips soft-404)
    expect(result.classification).toBe("ok");
  });
});

// ---- redirect_mismatch / host_mismatch tests ----

describe("classifyExternalResult – redirect/host mismatch", () => {
  it("classifies structured link on official_source that redirects outside family as host_mismatch blocking=true", () => {
    const result = classifyExternalResult(
      makeLink("https://www.bcentral.cl/old-path/", { linkType: "structured" }),
      makeProbe("https://www.bcentral.cl/old-path/", {
        status: 200,
        finalUrl: "https://google.com/",
      })
    );
    expect(result.classification).toBe("host_mismatch");
    expect(result.blocking).toBe(true);
    expect(result.expected_host_family).toContain("www.bcentral.cl");
    expect(result.expected_host_family).toContain("bcentral.cl");
  });

  it("classifies inline link on official_source that redirects outside family as redirect_mismatch blocking=false", () => {
    const result = classifyExternalResult(
      makeLink("https://www.bcentral.cl/redirect/", { linkType: "inline" }),
      makeProbe("https://www.bcentral.cl/redirect/", {
        status: 200,
        finalUrl: "https://otherdomain.cl/",
      })
    );
    expect(result.classification).toBe("redirect_mismatch");
    expect(result.blocking).toBe(false);
  });

  it("does NOT flag redirect within same family (www → bare)", () => {
    const result = classifyExternalResult(
      makeLink("https://www.bcentral.cl/stats/", { linkType: "structured" }),
      makeProbe("https://www.bcentral.cl/stats/", {
        status: 200,
        finalUrl: "https://bcentral.cl/stats/",
      })
    );
    // bcentral.cl is in the allowed family for www.bcentral.cl
    expect(result.classification).toBe("ok");
    expect(result.blocking).toBe(false);
  });

  it("classifies redirect mismatch on unknown host as redirect_mismatch blocking=false", () => {
    const result = classifyExternalResult(
      makeLink("https://unknown-host.cl/page/"),
      makeProbe("https://unknown-host.cl/page/", {
        status: 200,
        finalUrl: "https://another-unknown.cl/page/",
      })
    );
    expect(result.classification).toBe("redirect_mismatch");
    expect(result.blocking).toBe(false);
  });
});

// ---- non_blocking_host_issue tests ----

describe("classifyExternalResult – non_blocking_host_issue", () => {
  it("classifies 403 from brand_profile as non_blocking_host_issue", () => {
    const result = classifyExternalResult(
      makeLink("https://www.instagram.com/monedario/"),
      makeProbe("https://www.instagram.com/monedario/", { status: 403 })
    );
    expect(result.classification).toBe("non_blocking_host_issue");
    expect(result.blocking).toBe(false);
  });

  it("classifies 429 from share_endpoint as non_blocking_host_issue", () => {
    const result = classifyExternalResult(
      makeLink("https://api.whatsapp.com/send?text=hola"),
      makeProbe("https://api.whatsapp.com/send?text=hola", { status: 429 })
    );
    expect(result.classification).toBe("non_blocking_host_issue");
    expect(result.blocking).toBe(false);
  });

  it("classifies 403 from known_soft_nonblocking as non_blocking_host_issue", () => {
    const result = classifyExternalResult(
      makeLink("https://www.google.cl/search?q=afp"),
      makeProbe("https://www.google.cl/search?q=afp", { status: 403 })
    );
    expect(result.classification).toBe("non_blocking_host_issue");
    expect(result.blocking).toBe(false);
  });

  it("classifies OK response from brand_profile as ok", () => {
    const result = classifyExternalResult(
      makeLink("https://www.youtube.com/@monedario"),
      makeProbe("https://www.youtube.com/@monedario", { status: 200 })
    );
    expect(result.classification).toBe("ok");
    expect(result.blocking).toBe(false);
  });
});

// ---- network_error tests ----

describe("classifyExternalResult – network_error", () => {
  it("classifies DNS error as network_error non-blocking", () => {
    const result = classifyExternalResult(
      makeLink("https://www.bcentral.cl/dns-fail/"),
      makeProbe("https://www.bcentral.cl/dns-fail/", {
        status: null,
        error: "dns",
      })
    );
    expect(result.classification).toBe("network_error");
    expect(result.blocking).toBe(false);
    expect(result.matched_signal).toBe("dns");
  });

  it("classifies timeout error as network_error non-blocking", () => {
    const result = classifyExternalResult(
      makeLink("https://www.sii.cl/timeout/"),
      makeProbe("https://www.sii.cl/timeout/", {
        status: null,
        error: "timeout",
      })
    );
    expect(result.classification).toBe("network_error");
    expect(result.blocking).toBe(false);
  });
});

// ---- stable artifact fields ----

describe("classifyExternalResult – artifact field contract", () => {
  it("returns all required stable fields", () => {
    const result = classifyExternalResult(
      makeLink("https://www.bcentral.cl/page/"),
      makeProbe("https://www.bcentral.cl/page/", { status: 200 })
    );

    const requiredFields = [
      "source_url",
      "final_url",
      "referrer_url",
      "anchor_text",
      "link_type",
      "host_category",
      "classification",
      "blocking",
      "matched_signal",
      "expected_host_family",
      "status",
      "error",
    ];
    for (const field of requiredFields) {
      expect(result).toHaveProperty(field);
    }
  });

  it("uses first referrer as referrer_url", () => {
    const link = {
      href: "https://www.bcentral.cl/",
      referrers: ["https://monedario.cl/p1/", "https://monedario.cl/p2/"],
      linkType: "inline" as const,
      anchorText: "Banco Central",
    };
    const result = classifyExternalResult(link, makeProbe("https://www.bcentral.cl/", {}));
    expect(result.referrer_url).toBe("https://monedario.cl/p1/");
  });
});
