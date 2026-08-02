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
});
