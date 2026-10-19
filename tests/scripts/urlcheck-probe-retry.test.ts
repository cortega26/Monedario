import { describe, expect, it } from "vitest";

import { isRetryableProbeResult } from "../../scripts/urlcheck/probe-external.mjs";

function result(overrides: Record<string, unknown> = {}) {
  return {
    url: "https://example.test/",
    finalUrl: "https://example.test/",
    status: 200,
    contentType: "text/html",
    title: null,
    h1: null,
    bodySnippet: null,
    error: null,
    ...overrides,
  };
}

describe("isRetryableProbeResult", () => {
  it("retries transient 5xx and 429", () => {
    for (const status of [429, 500, 502, 503, 504]) {
      expect(isRetryableProbeResult(result({ status }))).toBe(true);
    }
  });

  it("does not retry content-level 4xx", () => {
    for (const status of [400, 401, 403, 404, 410]) {
      expect(isRetryableProbeResult(result({ status }))).toBe(false);
    }
  });

  it("retries timeout, network, and dns errors", () => {
    for (const error of ["timeout", "network", "dns"]) {
      expect(isRetryableProbeResult(result({ status: null, error }))).toBe(
        true
      );
    }
  });

  it("does not retry security guards or invalid URLs", () => {
    for (const error of [
      "ssrf_guard_private_host",
      "ssrf_guard_private_redirect",
      "invalid_url",
      "unsupported_scheme",
      "invalid_final_url",
    ]) {
      expect(isRetryableProbeResult(result({ status: null, error }))).toBe(
        false
      );
    }
  });
});
