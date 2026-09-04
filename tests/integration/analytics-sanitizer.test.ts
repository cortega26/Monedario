import { describe, expect, it } from "vitest";

import {
  ANALYTICS_ALLOWED_PROPERTIES,
  ANALYTICS_EVENT_ALLOWLIST,
  sanitizeAnalyticsPayload,
} from "@/contracts/analytics-events";
import { sanitizeAnalyticsEvent } from "@/utils/analytics";

describe("analytics v2 contract", () => {
  it("defines the requested taxonomy and no extra transmitted properties", () => {
    expect(Object.keys(ANALYTICS_EVENT_ALLOWLIST)).toEqual([
      "calculator_view",
      "calculator_start",
      "calculator_complete",
      "calculator_error",
      "next_step_shown",
      "next_step_click",
      "source_click",
      "share_attempt",
      "share_success",
      "alert_interest_shown",
      "alert_interest_submit",
      "support_shown",
      "support_click",
      "support_confirmed",
      "article_calculator_cta_click",
    ]);
    expect(ANALYTICS_ALLOWED_PROPERTIES).toEqual([
      "calculator_id",
      "page_type",
      "cluster",
      "interaction_variant",
      "next_step_id",
      "source_type",
      "error_category",
      "share_method",
      "support_location",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "app_version",
      "cta_type",
      "cta_location",
      "destination_url",
    ]);
  });

  it("normalizes legacy producers before the transport boundary", () => {
    expect(
      sanitizeAnalyticsEvent("next_best_step_click", {
        calculator_slug: "conversor-utm",
        rule_id: "convert-uf",
        position: 1,
      })
    ).toEqual({
      event: "next_step_click",
      params: {
        calculator_id: "conversor-utm",
        next_step_id: "convert-uf",
      },
    });
  });

  it("strips every financial, personal, identifier and free-text trap", () => {
    const result = sanitizeAnalyticsEvent("calculator_complete", {
      calculator_slug: "conversor-utm",
      page_type: "calculator",
      monto: "1234567",
      resultado: "7654321",
      email: "persona@example.com",
      rut: "11.111.111-1",
      session_id: "session-secret",
      note: "texto libre",
      destination_url: "https://example.com/?secret=abc",
    });
    expect(result).toEqual({
      event: "calculator_complete",
      params: {
        calculator_id: "conversor-utm",
        page_type: "calculator",
      },
    });
    expect(JSON.stringify(result)).not.toMatch(
      /1234567|7654321|example\.com|11\.111|session-secret|texto libre|secret=abc/
    );
  });

  it.each([
    ["calculator_id", "conversor utm"],
    ["utm_campaign", "campaña con texto"],
    ["app_version", "latest"],
    ["support_location", "footer"],
    ["share_method", "email"],
  ])("drops invalid bounded value %s=%s on the client", (key, value) => {
    const result = sanitizeAnalyticsPayload("support_click", {
      calculator_id: "conversor-utm",
      support_location: "post_result",
      [key]: value,
    });
    expect(result).not.toBeNull();
    expect(result?.params[key]).toBeUndefined();
  });

  it("rejects unknown events and server-strict unknown fields", () => {
    expect(sanitizeAnalyticsPayload("custom_event", {})).toBeNull();
    expect(
      sanitizeAnalyticsPayload(
        "calculator_start",
        { calculator_id: "conversor-utm", arbitrary: "x" },
        { rejectUnknown: true }
      )
    ).toBeNull();
  });

  it("accepts only bounded string dimensions; never numeric results", () => {
    expect(
      sanitizeAnalyticsPayload("calculator_complete", {
        calculator_id: "conversor-utm",
        page_type: "calculator",
        app_version: "5.5.1",
      })
    ).toEqual({
      event: "calculator_complete",
      params: {
        calculator_id: "conversor-utm",
        page_type: "calculator",
        app_version: "5.5.1",
      },
    });
    expect(
      sanitizeAnalyticsPayload("calculator_complete", {
        calculator_id: 123456,
      })?.params
    ).toEqual({});
  });

  it("accepts the article calculator CTA click with only internal destinations", () => {
    expect(
      sanitizeAnalyticsPayload("article_calculator_cta_click", {
        cta_type: "article-calculator-cta",
        cta_location: "article_body",
        destination_url: "https://monedario.cl/calculadoras/iva/",
        page_type: "post",
        app_version: "5.5.1",
        cta_label: "Calcular mi IVA", // free text: fuera del contrato, se descarta
      })
    ).toEqual({
      event: "article_calculator_cta_click",
      params: {
        cta_type: "article-calculator-cta",
        cta_location: "article_body",
        destination_url: "https://monedario.cl/calculadoras/iva/",
        page_type: "post",
        app_version: "5.5.1",
      },
    });
  });

  it("passes the strict server boundary (rejectUnknown) with a full CTA payload", () => {
    expect(
      sanitizeAnalyticsPayload(
        "article_calculator_cta_click",
        {
          cta_type: "article-calculator-cta",
          cta_location: "article_body",
          destination_url: "https://monedario.cl/calculadoras/sueldo-liquido/",
          page_type: "post",
          app_version: "5.5.1",
        },
        { rejectUnknown: true }
      )
    ).not.toBeNull();
  });

  it.each([
    "https://www.monedario.cl/calculadoras/iva/",
    "https://monedario.cl/calculadoras/iva",
    "https://monedario.cl/",
  ])("accepts internal destination variant %s", (url) => {
    const result = sanitizeAnalyticsPayload("article_calculator_cta_click", {
      destination_url: url,
    });
    expect(result?.params.destination_url).toBe(url);
  });

  it.each([
    "https://monedario.cl.evil.com/calculadoras/",
    "https://monedario.cl:8443/calculadoras/",
    "https://monedario.cl/calculadoras/iva?utm_source=x",
    "https://monedario.cl/CALCULADORAS/",
    "https://example.com/calculadoras/",
    "https://monedario.cl.evil.com",
  ])("rejects non-canonical destination %s", (url) => {
    const lenient = sanitizeAnalyticsPayload("article_calculator_cta_click", {
      destination_url: url,
    });
    expect(lenient?.params.destination_url).toBeUndefined();
  });

  it("drops external destinations on the CTA click (strict and lenient)", () => {
    const payload = {
      cta_type: "article-calculator-cta",
      destination_url: "https://example.com/?secret=abc",
    };
    const lenient = sanitizeAnalyticsPayload("article_calculator_cta_click", payload);
    expect(lenient?.params.destination_url).toBeUndefined();
    expect(
      sanitizeAnalyticsPayload("article_calculator_cta_click", payload, {
        rejectUnknown: true,
      })
    ).toBeNull();
  });

  // Plan 083: el enum page_type no admitía "article" ni "calculator-index",
  // pese a que PostDetails.astro y el índice de calculadoras los emiten; el
  // sanitizador los descartaba en silencio en todos los eventos de esas páginas.
  it.each(["article", "calculator-index"])(
    'conserva page_type="%s" tras ampliar el enum',
    pageType => {
      expect(
        sanitizeAnalyticsPayload("calculator_view", {
          page_type: pageType,
          calculator_id: "conversor-uf",
          app_version: "5.5.1",
        })
      ).toEqual({
        event: "calculator_view",
        params: {
          page_type: pageType,
          calculator_id: "conversor-uf",
          app_version: "5.5.1",
        },
      });
    }
  );

  it("no descarta el payload en la ruta estricta del worker (rejectUnknown) con page_type=article", () => {
    const result = sanitizeAnalyticsPayload(
      "calculator_view",
      {
        page_type: "article",
        calculator_id: "conversor-uf",
        app_version: "5.5.1",
      },
      { rejectUnknown: true }
    );
    expect(result).not.toBeNull();
  });

  it("sigue rechazando un page_type que no está en el enum ampliado", () => {
    const result = sanitizeAnalyticsPayload("calculator_view", {
      page_type: "articulo",
      calculator_id: "conversor-uf",
      app_version: "5.5.1",
    });
    expect(result?.params.page_type).toBeUndefined();
  });
});
