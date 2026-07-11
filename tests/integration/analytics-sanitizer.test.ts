import { describe, expect, it } from "vitest";

import { sanitizeAnalyticsEvent } from "@/utils/analytics";

// ── Event allowlist: permitted event conserves only allowed fields ──

describe("sanitizeAnalyticsEvent — event allowlist", () => {
  it("calculator_view conserva solo page_type y calculator_slug", () => {
    const result = sanitizeAnalyticsEvent("calculator_view", {
      page_type: "calculator",
      calculator_slug: "sueldo-liquido",
      extra_field: "should-be-stripped",
      otro_dato: 123,
    });
    expect(result).not.toBeNull();
    expect(result!.event).toBe("calculator_view");
    expect(result!.params).toEqual({
      page_type: "calculator",
      calculator_slug: "sueldo-liquido",
    });
  });

  it("calculator_start conserva solo calculator_slug y interaction_type", () => {
    const result = sanitizeAnalyticsEvent("calculator_start", {
      calculator_slug: "seguro-cesantia",
      interaction_type: "input",
      calculator_name: "Seguro de Cesantía", // not in allowlist
      page_path: "/calculadoras/seguro-cesantia/", // not in allowlist
    });
    expect(result).not.toBeNull();
    expect(result!.params).toEqual({
      calculator_slug: "seguro-cesantia",
      interaction_type: "input",
    });
    expect(result!.params).not.toHaveProperty("calculator_name");
    expect(result!.params).not.toHaveProperty("page_path");
  });

  it("calculator_complete conserva solo calculator_slug y outcome_class", () => {
    const result = sanitizeAnalyticsEvent("calculator_complete", {
      calculator_slug: "apv",
      outcome_class: "success",
      result_value: 500_000, // forbidden
      monto: 1_000_000,
    });
    expect(result).not.toBeNull();
    expect(result!.params).toEqual({
      calculator_slug: "apv",
      outcome_class: "success",
    });
    expect(result!.params).not.toHaveProperty("result_value");
    expect(result!.params).not.toHaveProperty("monto");
  });

  it("calculator_error conserva solo calculator_slug y error_code", () => {
    const result = sanitizeAnalyticsEvent("calculator_error", {
      calculator_slug: "operacion-renta",
      error_code: "validation",
      error_message: "El sueldo debe ser mayor a 0", // not allowed
    });
    expect(result).not.toBeNull();
    expect(result!.params).toEqual({
      calculator_slug: "operacion-renta",
      error_code: "validation",
    });
    expect(result!.params).not.toHaveProperty("error_message");
  });

  it("next_best_step_shown conserva solo calculator_slug, rule_id y position", () => {
    const result = sanitizeAnalyticsEvent("next_best_step_shown", {
      calculator_slug: "sueldo-liquido",
      rule_id: "sl-to-apv-midhigh",
      position: 1,
      profile_signal: "sueldoImponible >= 1_500_000 en sueldo-liquido", // forbidden!
      rationale: "texto derivado",
    });
    expect(result).not.toBeNull();
    expect(result!.params).toEqual({
      calculator_slug: "sueldo-liquido",
      rule_id: "sl-to-apv-midhigh",
      position: 1,
    });
    expect(result!.params).not.toHaveProperty("profile_signal");
    expect(result!.params).not.toHaveProperty("rationale");
  });

  it("next_best_step_click conserva solo calculator_slug, rule_id y position", () => {
    const result = sanitizeAnalyticsEvent("next_best_step_click", {
      calculator_slug: "apv",
      rule_id: "apv-to-opren",
      position: 1,
      target_href: "/calculadoras/operacion-renta/", // not in allowlist
    });
    expect(result).not.toBeNull();
    expect(result!.params).toEqual({
      calculator_slug: "apv",
      rule_id: "apv-to-opren",
      position: 1,
    });
    expect(result!.params).not.toHaveProperty("target_href");
  });

  it("result_action_click conserva solo calculator_slug y action_id", () => {
    const result = sanitizeAnalyticsEvent("result_action_click", {
      calculator_slug: "credito-consumo",
      action_id: "share-result",
      destination_url: "https://monedario.cl/calculadoras/credito-consumo/?result=123", // forbidden
    });
    expect(result).not.toBeNull();
    expect(result!.params).toEqual({
      calculator_slug: "credito-consumo",
      action_id: "share-result",
    });
    expect(result!.params).not.toHaveProperty("destination_url");
  });

  it("share_result_click conserva solo calculator_slug y channel", () => {
    const result = sanitizeAnalyticsEvent("share_result_click", {
      calculator_slug: "seguro-cesantia",
      channel: "whatsapp",
      share_url: "https://monedario.cl/calculadoras/seguro-cesantia/", // not in allowlist
    });
    expect(result).not.toBeNull();
    expect(result!.params).toEqual({
      calculator_slug: "seguro-cesantia",
      channel: "whatsapp",
    });
  });

  it("scenario_action conserva solo calculator_slug y action", () => {
    const result = sanitizeAnalyticsEvent("scenario_action", {
      calculator_slug: "apv",
      action: "save",
      scenario_name: "Mi Escenario 1", // not in allowlist
    });
    expect(result).not.toBeNull();
    expect(result!.params).toEqual({
      calculator_slug: "apv",
      action: "save",
    });
  });

  it("resume_click conserva solo item_type y item_id", () => {
    const result = sanitizeAnalyticsEvent("resume_click", {
      item_type: "calculator",
      item_id: "sueldo-liquido",
      calculator_slug: "sueldo-liquido", // not in allowlist
    });
    expect(result).not.toBeNull();
    expect(result!.params).toEqual({
      item_type: "calculator",
      item_id: "sueldo-liquido",
    });
  });

  it("support_page_click conserva solo page_type y source_context", () => {
    const result = sanitizeAnalyticsEvent("support_page_click", {
      page_type: "post",
      source_context: "article",
      article_slug: "que-es-la-uf", // not in allowlist
    });
    expect(result).not.toBeNull();
    expect(result!.params).toEqual({
      page_type: "post",
      source_context: "article",
    });
  });

  it("official_source_click conserva solo page_type y source_domain", () => {
    const result = sanitizeAnalyticsEvent("official_source_click", {
      page_type: "post",
      source_domain: "sii.cl",
      source_url: "https://www.sii.cl/valores_y_fechas/", // not in allowlist
      source_label: "SII Valores", // not in allowlist
    });
    expect(result).not.toBeNull();
    expect(result!.params).toEqual({
      page_type: "post",
      source_domain: "sii.cl",
    });
  });

  it("retorna null para evento no permitido", () => {
    const result = sanitizeAnalyticsEvent("article_scroll_depth", {
      article_slug: "test",
      article_title: "Test",
      scroll_depth_percent: 50,
    });
    expect(result).toBeNull();
  });

  it("retorna null para evento desconocido/arbitrario", () => {
    const result = sanitizeAnalyticsEvent("custom_event", { key: "value" });
    expect(result).toBeNull();
  });
});

// ── Forbidden keys — never appear in output ──

describe("sanitizeAnalyticsEvent — forbidden keys", () => {
  const forbiddenValuePairs: Record<string, unknown> = {
    profile_signal: "texto derivado de perfil",
    sueldo: 1_234_567,
    deuda: 5_000_000,
    monto: 999_999,
    resultado: 765_432,
    email: "test@example.com",
    rut: "11.111.111-1",
    user_id: "usr_abc123",
    session_id: "sess_xyz789",
    destination_url: "https://monedario.cl/?secret=abc",
    query_string: "?token=secret",
    inputs: { sueldo: 500_000 },
  };

  for (const [key, value] of Object.entries(forbiddenValuePairs)) {
    it(`la key prohibida "${key}" nunca aparece en el payload de calculator_start`, () => {
      const params: Record<string, unknown> = {
        calculator_slug: "test-tool",
        interaction_type: "click",
      };
      params[key] = value;

      const result = sanitizeAnalyticsEvent("calculator_start", params);
      expect(result).not.toBeNull();
      expect(result!.params).not.toHaveProperty(key);
      // Verify the value itself is also absent from all param values
      const values = Object.values(result!.params);
      const stringValues = values.map(String);
      for (const v of stringValues) {
        expect(v).not.toContain("1.111.111");
        expect(v).not.toContain("test@example.com");
      }
    });
  }

  it("profile_signal se elimina de next_best_step_shown", () => {
    const result = sanitizeAnalyticsEvent("next_best_step_shown", {
      calculator_slug: "test",
      rule_id: "r1",
      position: 1,
      profile_signal: "sueldoImponible >= 1_500_000 en sueldo-liquido",
      rationale: "some rationale text",
    });
    expect(result).not.toBeNull();
    expect(result!.params).not.toHaveProperty("profile_signal");
    expect(result!.params).not.toHaveProperty("rationale");
    // Verify the signal text doesn't appear anywhere in the payload
    const payload = JSON.stringify(result!.params);
    expect(payload).not.toContain("sueldoImponible");
    expect(payload).not.toContain("1_500_000");
  });

  it("valores financieros trampa no aparecen en el payload serializado", () => {
    // Privacy trampa test from plan §11.3
    const result = sanitizeAnalyticsEvent("calculator_start", {
      calculator_slug: "test",
      interaction_type: "click",
      email: "test@example.com",
      rut: "11.111.111-1",
      sueldo: "1234567",
      resultado: "7654321",
      profile_signal: "texto derivado",
      destination_url: "https://example.com/?secret=abc123",
    });

    expect(result).not.toBeNull();
    const body = JSON.stringify(result!.params);

    // None of the trap values should appear in the body
    expect(body).not.toContain("test@example.com");
    expect(body).not.toContain("11.111.111-1");
    expect(body).not.toContain("1234567");
    expect(body).not.toContain("7654321");
    expect(body).not.toContain("texto derivado");
    expect(body).not.toContain("secret=abc123");
    expect(body).not.toContain("destination_url");

    // Also check keys
    expect(result!.params).not.toHaveProperty("email");
    expect(result!.params).not.toHaveProperty("rut");
    expect(result!.params).not.toHaveProperty("sueldo");
    expect(result!.params).not.toHaveProperty("resultado");
  });
});

// ── Enum validation ──

describe("sanitizeAnalyticsEvent — enum validation", () => {
  it("interaction_type solo permite valores allowlisted", () => {
    const valid = sanitizeAnalyticsEvent("calculator_start", {
      calculator_slug: "test",
      interaction_type: "input",
    });
    expect(valid).not.toBeNull();

    const invalid = sanitizeAnalyticsEvent("calculator_start", {
      calculator_slug: "test",
      interaction_type: "arbitrary-value",
    });
    // Invalid enum value → param is stripped
    expect(invalid).not.toBeNull();
    expect(invalid!.params).toHaveProperty("calculator_slug");
    expect(invalid!.params).not.toHaveProperty("interaction_type");
  });

  it("outcome_class solo permite valores allowlisted", () => {
    const valid = sanitizeAnalyticsEvent("calculator_complete", {
      calculator_slug: "test",
      outcome_class: "success",
    });
    expect(valid).not.toBeNull();
    expect(valid!.params.outcome_class).toBe("success");

    const invalid = sanitizeAnalyticsEvent("calculator_complete", {
      calculator_slug: "test",
      outcome_class: "ganancia_alta", // no es un enum válido
    });
    expect(invalid).not.toBeNull();
    expect(invalid!.params).not.toHaveProperty("outcome_class");
  });

  it("action solo permite save/load/compare/delete", () => {
    const valid = sanitizeAnalyticsEvent("scenario_action", {
      calculator_slug: "test",
      action: "save",
    });
    expect(valid!.params.action).toBe("save");

    const invalid = sanitizeAnalyticsEvent("scenario_action", {
      calculator_slug: "test",
      action: "export",
    });
    expect(invalid!.params).not.toHaveProperty("action");
  });

  it("channel solo permite valores allowlisted", () => {
    const valid = sanitizeAnalyticsEvent("share_result_click", {
      calculator_slug: "test",
      channel: "whatsapp",
    });
    expect(valid!.params.channel).toBe("whatsapp");

    const invalid = sanitizeAnalyticsEvent("share_result_click", {
      calculator_slug: "test",
      channel: "facebook",
    });
    expect(invalid!.params).not.toHaveProperty("channel");
  });
});

// ── String length limits ──

describe("sanitizeAnalyticsEvent — string limits", () => {
  it("trunca strings mayores a 200 caracteres", () => {
    const longSlug = "a".repeat(300);
    const result = sanitizeAnalyticsEvent("calculator_view", {
      page_type: "calculator",
      calculator_slug: longSlug,
    });
    expect(result).not.toBeNull();
    expect(result!.params.calculator_slug).toHaveLength(200);
    expect(result!.params.calculator_slug).toBe("a".repeat(200));
  });

  it("conserva strings de 200 caracteres exactos", () => {
    const exactSlug = "b".repeat(200);
    const result = sanitizeAnalyticsEvent("calculator_view", {
      page_type: "calculator",
      calculator_slug: exactSlug,
    });
    expect(result!.params.calculator_slug).toHaveLength(200);
    expect(result!.params.calculator_slug).toBe(exactSlug);
  });
});

// ── Value type coercion ──

describe("sanitizeAnalyticsEvent — type handling", () => {
  it("convierte valores no string/number/boolean a string o los descarta", () => {
    const result = sanitizeAnalyticsEvent("calculator_start", {
      calculator_slug: "test",
      interaction_type: "click",
      nested_object: { key: "value" },
      array_value: [1, 2, 3],
    });
    expect(result).not.toBeNull();
    expect(result!.params).not.toHaveProperty("nested_object");
    expect(result!.params).not.toHaveProperty("array_value");
  });

  it("conserva valores number válidos", () => {
    const result = sanitizeAnalyticsEvent("next_best_step_shown", {
      calculator_slug: "test",
      rule_id: "r1",
      position: 3,
    });
    expect(result!.params.position).toBe(3);
  });

  it("conserva valores boolean", () => {
    const result = sanitizeAnalyticsEvent("calculator_view", {
      page_type: "calculator",
      calculator_slug: "test",
    });
    expect(result!.params.page_type).toBe("calculator");
  });
});

// ── Free-form token shape (calculator_slug, rule_id, action_id) ──

describe("sanitizeAnalyticsEvent — free-form token shape", () => {
  it("conserva un calculator_slug válido", () => {
    const result = sanitizeAnalyticsEvent("calculator_view", {
      page_type: "calculator",
      calculator_slug: "sueldo-liquido",
    });
    expect(result).not.toBeNull();
    expect(result!.params.calculator_slug).toBe("sueldo-liquido");
  });

  it("descarta un calculator_slug inválido pero conserva el evento", () => {
    const result = sanitizeAnalyticsEvent("calculator_view", {
      page_type: "calculator",
      calculator_slug: "sueldo liquido",
    });
    expect(result).not.toBeNull();
    expect(result!.params.calculator_slug).toBeUndefined();
  });

  it("conserva un item_id con forma de path (item_id queda fuera de este plan)", () => {
    const result = sanitizeAnalyticsEvent("resume_click", {
      item_type: "calculator",
      item_id: "/calculadoras/sueldo-liquido/",
    });
    expect(result).not.toBeNull();
    expect(result!.params.item_id).toBe("/calculadoras/sueldo-liquido/");
  });
});
