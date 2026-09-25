import { describe, expect, it } from "vitest";

import {
  ANALYTICS_ALLOWED_PROPERTIES,
  ANALYTICS_EVENT_ALLOWLIST,
  sanitizeAnalyticsPayload,
} from "@/contracts/analytics-events";
import {
  getAnalyticsEventNameForCta,
  isTransmissibleEvent,
  sanitizeAnalyticsEvent,
} from "@/utils/analytics";
import { validateEventPayload } from "../../workers/analytics-collector/src/index";

describe("analytics v2 contract", () => {
  // Plan 100: la taxonomía crece por adición; el orden de claves no es
  // contrato. Se afirma pertenencia de conjuntos (orden-insensible) para que
  // agregar un evento no rompa el gate.
  it("defines the requested taxonomy and no extra transmitted properties", () => {
    expect([...Object.keys(ANALYTICS_EVENT_ALLOWLIST)].sort()).toEqual(
      [
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
        // Plan 100 Tier A (emitidos pero no allowlisted → pérdida silenciosa).
        "calculator_mode_toggle",
        "calculator_copy_link",
        "calculator_copy_result",
        "article_scroll_depth",
        "cta_click",
        "calculator_trust_link_click",
        "hub_route_click",
        "related_content_click",
        "search_chip_click",
        // Plan 100 Tier B (params provablemente PII-free).
        "calculator_print_click",
        "calculator_share_click",
        "resume_cleared",
        // Pre-contrato de monetización (ADR-20260921): tipados, sin emisores.
        "affiliate_click",
        "lead_submit",
      ].sort()
    );
    expect([...ANALYTICS_ALLOWED_PROPERTIES].sort()).toEqual(
      [
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
        // Plan 100 Tier A/B.
        "outcome",
        "mode",
        "article_slug",
        "scroll_depth_percent",
        // Pre-contrato de monetización (ADR-20260921).
        "affiliate_slot",
        "lead_type",
      ].sort()
    );
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

// Plan 100: un roundtrip estricto por evento allowlisted, a través de ambos
// sanitizadores (cliente lenient + worker rejectUnknown). Si alguno deja de
// pasar, la telemetría de ese evento se pierde en silencio.
describe("plan 100: every allowlisted event round-trips through both sanitizers", () => {
  const APP = "1.2.3";
  const CASES: Array<[string, Record<string, unknown>]> = [
    [
      "calculator_view",
      {
        calculator_id: "sueldo-liquido",
        page_type: "calculator",
        cluster: "tributario",
        app_version: APP,
      },
    ],
    [
      "calculator_start",
      {
        calculator_id: "sueldo-liquido",
        page_type: "calculator",
        cluster: "tributario",
        interaction_variant: "input",
        app_version: APP,
      },
    ],
    [
      "calculator_complete",
      {
        calculator_id: "sueldo-liquido",
        page_type: "calculator",
        cluster: "tributario",
        outcome: "success",
        mode: "bruto-a-liquido",
        app_version: APP,
      },
    ],
    [
      "calculator_error",
      {
        calculator_id: "sueldo-liquido",
        page_type: "calculator",
        cluster: "tributario",
        error_category: "validation",
        app_version: APP,
      },
    ],
    [
      "next_step_shown",
      {
        calculator_id: "conversor-utm",
        page_type: "calculator",
        cluster: "tributario",
        interaction_variant: "contextual_v1",
        next_step_id: "convierte-uf",
        app_version: APP,
      },
    ],
    [
      "next_step_click",
      {
        calculator_id: "conversor-utm",
        page_type: "calculator",
        cluster: "tributario",
        interaction_variant: "contextual_v1",
        next_step_id: "convierte-uf",
        utm_source: "conversor-utm",
        utm_medium: "post-result",
        utm_campaign: "utility-led-v1",
        app_version: APP,
      },
    ],
    [
      "source_click",
      {
        calculator_id: "sueldo-liquido",
        page_type: "calculator",
        source_type: "official",
        app_version: APP,
      },
    ],
    [
      "share_attempt",
      {
        calculator_id: "sueldo-liquido",
        page_type: "calculator",
        share_method: "copy",
        app_version: APP,
      },
    ],
    [
      "share_success",
      {
        calculator_id: "sueldo-liquido",
        page_type: "calculator",
        share_method: "whatsapp",
        app_version: APP,
      },
    ],
    [
      "alert_interest_shown",
      {
        calculator_id: "conversor-utm",
        page_type: "calculator",
        interaction_variant: "contextual_v1",
        app_version: APP,
      },
    ],
    [
      "alert_interest_submit",
      {
        calculator_id: "conversor-utm",
        page_type: "calculator",
        interaction_variant: "contextual_v1",
        app_version: APP,
      },
    ],
    [
      "support_shown",
      {
        calculator_id: "conversor-utm",
        page_type: "calculator",
        support_location: "post_result",
        app_version: APP,
      },
    ],
    [
      "support_click",
      {
        calculator_id: "conversor-utm",
        page_type: "calculator",
        support_location: "post_result",
        utm_source: "conversor-utm",
        utm_medium: "post-result",
        utm_campaign: "utility-led-v1",
        app_version: APP,
      },
    ],
    [
      "support_confirmed",
      {
        calculator_id: "conversor-utm",
        page_type: "calculator",
        support_location: "post_result",
        app_version: APP,
      },
    ],
    [
      "article_calculator_cta_click",
      {
        cta_type: "article-calculator-cta",
        cta_location: "article_body",
        destination_url: "https://monedario.cl/calculadoras/iva/",
        page_type: "post",
        app_version: APP,
      },
    ],
    [
      "calculator_mode_toggle",
      {
        calculator_id: "sueldo-liquido",
        page_type: "calculator",
        mode: "bruto-a-liquido",
        app_version: APP,
      },
    ],
    [
      "calculator_copy_link",
      {
        calculator_id: "sueldo-liquido",
        page_type: "calculator",
        app_version: APP,
      },
    ],
    [
      "calculator_copy_result",
      {
        calculator_id: "sueldo-liquido",
        page_type: "calculator",
        app_version: APP,
      },
    ],
    [
      "calculator_print_click",
      {
        calculator_id: "sueldo-liquido",
        page_type: "calculator",
        app_version: APP,
      },
    ],
    [
      "calculator_share_click",
      {
        calculator_id: "sueldo-liquido",
        page_type: "calculator",
        app_version: APP,
      },
    ],
    [
      "resume_cleared",
      { page_type: "calculator", app_version: APP },
    ],
    [
      "article_scroll_depth",
      {
        article_slug: "como-calcular-el-iva",
        scroll_depth_percent: "50",
        page_type: "article",
        app_version: APP,
      },
    ],
    [
      "cta_click",
      {
        cta_type: "donate",
        cta_location: "apoyar_page",
        destination_url: "https://monedario.cl/calculadoras/iva/",
        page_type: "support",
        app_version: APP,
      },
    ],
    [
      "calculator_trust_link_click",
      {
        cta_type: "calculator-trust-link",
        cta_location: "footer_trust",
        destination_url: "https://monedario.cl/calculadoras/iva/",
        page_type: "calculator",
        app_version: APP,
      },
    ],
    [
      "hub_route_click",
      {
        cta_type: "hub-route",
        cta_location: "header_primary",
        destination_url: "https://monedario.cl/calculadoras/iva/",
        page_type: "home",
        app_version: APP,
      },
    ],
    [
      "related_content_click",
      {
        cta_type: "related-post",
        cta_location: "related_posts",
        destination_url: "https://monedario.cl/calculadoras/iva/",
        page_type: "post",
        app_version: APP,
      },
    ],
    [
      "search_chip_click",
      {
        cta_type: "search-chip",
        cta_location: "search_chips",
        destination_url: "https://monedario.cl/calculadoras/iva/",
        page_type: "home",
        app_version: APP,
      },
    ],
    // Pre-contrato de monetización (ADR-20260921): tipados, sin emisores.
    // El slot es un token de desarrollo; lead_type una etiqueta.
    [
      "affiliate_click",
      {
        calculator_id: "conversor-utm",
        page_type: "calculator",
        affiliate_slot: "utm-bajo-resultado",
        app_version: APP,
      },
    ],
    [
      "lead_submit",
      {
        calculator_id: "conversor-utm",
        page_type: "calculator",
        lead_type: "newsletter",
        app_version: APP,
      },
    ],
  ];

  it.each(CASES)("%s passes the client and the strict server boundary", (event, params) => {
    const client = sanitizeAnalyticsEvent(event, params);
    expect(client).not.toBeNull();
    expect(client?.event).toBe(event);
    const server = validateEventPayload({
      event: client?.event,
      params: client?.params,
    });
    expect(server.valid).toBe(true);
    expect(server.event).toBe(event);
  });

  it("both sueldo-liquido calculator_complete call sites produce 202-shaped payloads", () => {
    // formController.ts:304-309 (liquido-a-bruto) y :415-420 (bruto-a-liquido):
    // params legacy que el worker rechazaba con 422 antes del plan 100.
    for (const mode of ["liquido-a-bruto", "bruto-a-liquido"]) {
      const client = sanitizeAnalyticsEvent("calculator_complete", {
        calculator_slug: "sueldo-liquido",
        calculator_name: "Calculadora de Sueldo Liquido",
        outcome: "success",
        mode,
        page_type: "calculator",
        app_version: APP,
      });
      expect(client).not.toBeNull();
      const server = validateEventPayload({
        event: client?.event,
        params: client?.params,
      });
      expect(server.valid).toBe(true);
      expect(server.params).toMatchObject({
        calculator_id: "sueldo-liquido",
        outcome: "success",
        mode,
      });
    }
  });

  it("strips client-only companions without losing the event (strict)", () => {
    const server = validateEventPayload({
      event: "calculator_complete",
      params: {
        calculator_id: "sueldo-liquido",
        calculator_name: "Display Name",
        outcome: "success",
        page_type: "calculator",
        app_version: APP,
      },
    });
    expect(server.valid).toBe(true);
    expect(server.params).not.toHaveProperty("calculator_name");

    const cta = validateEventPayload({
      event: "cta_click",
      params: {
        cta_type: "hub-route",
        cta_label: "Texto libre del botón",
        cta_location: "header_primary",
        page_type: "home",
        app_version: APP,
      },
    });
    expect(cta.valid).toBe(true);
    expect(cta.params).not.toHaveProperty("cta_label");

    const scroll = validateEventPayload({
      event: "article_scroll_depth",
      params: {
        article_slug: "como-calcular-el-iva",
        article_title: "Cómo calcular el IVA, guía completa 2026",
        scroll_depth_percent: "25",
        page_type: "article",
        app_version: APP,
      },
    });
    expect(scroll.valid).toBe(true);
    expect(scroll.params).not.toHaveProperty("article_title");
  });

  it("affiliate_slot rejects 6+ digit runs that the weekly export would flag as PII", () => {
    const params = (slot: string) => ({
      calculator_id: "conversor-utm",
      page_type: "calculator",
      affiliate_slot: slot,
      app_version: APP,
    });
    expect(
      sanitizeAnalyticsPayload("affiliate_click", params("slot-123456"), {
        rejectUnknown: true,
      })
    ).toBeNull();
    expect(
      sanitizeAnalyticsPayload("affiliate_click", params("slot-12345"), {
        rejectUnknown: true,
      })
    ).not.toBeNull();
  });

  it("scroll percent must be stringified at the emitter: raw numbers never transmit", () => {
    const strict = sanitizeAnalyticsPayload(
      "article_scroll_depth",
      {
        article_slug: "como-calcular-el-iva",
        scroll_depth_percent: 50,
        page_type: "article",
        app_version: APP,
      },
      { rejectUnknown: true }
    );
    expect(strict).toBeNull();
    const lenient = sanitizeAnalyticsEvent("article_scroll_depth", {
      article_slug: "como-calcular-el-iva",
      scroll_depth_percent: 50,
      page_type: "article",
      app_version: APP,
    });
    expect(lenient?.params.scroll_depth_percent).toBeUndefined();
  });

  it("every CTA mapping resolves to a transmissible event", () => {
    for (const ctaType of [
      "article-calculator-cta",
      "calculator-trust-link",
      "hub-route",
      "next-step",
      "related-post",
      "search-chip",
      "calculator-guide",
      "share",
      "donate",
      undefined,
      "unknown-future-cta",
    ]) {
      expect(isTransmissibleEvent(getAnalyticsEventNameForCta(ctaType))).toBe(
        true
      );
    }
    // El fallback único preserva la distinción vía param, no vía nombre.
    expect(getAnalyticsEventNameForCta("unknown-future-cta")).toBe("cta_click");
    expect(getAnalyticsEventNameForCta(undefined)).toBe("cta_click");
    expect(getAnalyticsEventNameForCta("hub-route")).toBe("hub_route_click");
    expect(getAnalyticsEventNameForCta("search-chip")).toBe("search_chip_click");
    expect(
      getAnalyticsEventNameForCta("article-calculator-cta")
    ).toBe("article_calculator_cta_click");
  });
});

describe("plan 100: Tier-B deferred events stay non-transmissible", () => {
  // Emisores fuera de alcance con params de texto libre o forma de historial:
  // search_term (input de usuario), result_url/item_url (URLs con query),
  // action_label/destination_href (texto libre). Agregarlos requiere revisión
  // de privacidad; hasta entonces se pinean NO transmisibles.
  it.each([
    "search_submit",
    "search_result_click",
    "resume_click",
    "calculator_result_action_click",
    // Hallazgo de ejecución: DecisionWizard emite estos con option_label
    // (texto editorial libre) y source_page/target_href (rutas/URLs) — fuera
    // del inventario Tier A/B, mismo tratamiento hasta revisión de producto.
    "wizard_start",
    "wizard_step",
    "wizard_complete",
    "wizard_cta_click",
  ])("%s is pinned non-transmissible (deferred follow-up)", eventName => {
    expect(isTransmissibleEvent(eventName)).toBe(false);
    expect(
      sanitizeAnalyticsPayload(eventName, { anything: "x" })
    ).toBeNull();
  });
});
