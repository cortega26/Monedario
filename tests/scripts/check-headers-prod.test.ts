import { describe, expect, it } from "vitest";
import { validateHeaders } from "../../scripts/check-headers-prod.mjs";

const valid = {
  "strict-transport-security":
    "max-age=31536000; includeSubDomains; preload",
  "content-security-policy":
    "default-src 'self'; script-src 'sha256-abc123=' 'self' https://static.cloudflareinsights.com; " +
    "style-src 'self' 'unsafe-inline'; img-src 'self' data:; " +
    "connect-src 'self' https://static.cloudflareinsights.com; font-src 'self'; " +
    "form-action 'self'; frame-ancestors 'none'; base-uri 'self'",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy":
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
};

describe("validateHeaders", () => {
  it("acepta el contrato completo", () => {
    expect(validateHeaders(valid)).toEqual([]);
  });

  it("exige HSTS con max-age suficiente e includeSubDomains", () => {
    const weak = {
      ...valid,
      "strict-transport-security": "max-age=600",
    };
    const issues = validateHeaders(weak);
    expect(issues.join("\n")).toContain("max-age");
    expect(issues.join("\n")).toContain("includeSubDomains");
  });

  it("exige los directivos CSP críticos y hashes sin unsafe-inline", () => {
    const weak = {
      ...valid,
      "content-security-policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self'",
    };
    const issues = validateHeaders(weak);
    expect(issues.join("\n")).toContain("frame-ancestors");
    expect(issues.join("\n")).toContain("base-uri");
    expect(issues.join("\n")).toContain("form-action");
    expect(issues.join("\n")).toContain("hashes");
    expect(issues.join("\n")).toContain("unsafe-inline");
  });

  it("exige Referrer-Policy, Permissions-Policy, nosniff y X-Frame-Options", () => {
    const issues = validateHeaders({});
    const joined = issues.join("\n");
    expect(joined).toContain("Strict-Transport-Security");
    expect(joined).toContain("Content-Security-Policy");
    expect(joined).toContain("Referrer-Policy");
    expect(joined).toContain("Permissions-Policy");
    expect(joined).toContain("X-Content-Type-Options");
    expect(joined).toContain("X-Frame-Options");
  });

  it("rechaza Permissions-Policy que no restringe camera/microphone", () => {
    const issues = validateHeaders({
      ...valid,
      "permissions-policy": "geolocation=()",
    });
    expect(issues.join("\n")).toContain("camera/microphone");
  });
});
