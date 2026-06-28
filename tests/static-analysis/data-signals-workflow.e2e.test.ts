/**
 * E2E tests for the Data Signals workflow configuration preflight.
 *
 * Verifies that `.github/workflows/data-signals.yml` centralizes provider
 * configuration at the job level and fails early with a clear message when
 * required GitHub Actions secrets or variables are missing.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const workflowPath = path.join(
  process.cwd(),
  ".github",
  "workflows",
  "data-signals.yml",
);

describe("data-signals workflow — configuration preflight", () => {
  it("workflow file exists and remains structurally valid", () => {
    expect(fs.existsSync(workflowPath)).toBe(true);
    const content = fs.readFileSync(workflowPath, "utf8");

    expect(content).toContain("jobs:");
    expect(content).toContain("steps:");
    expect(content.split("\n").length).toBeGreaterThan(20);
  });

  it("centralizes provider secrets and resolves workflow vars once", () => {
    const content = fs.readFileSync(workflowPath, "utf8");

    expect(content).toContain(
      "GOOGLE_APPLICATION_CREDENTIALS_JSON: ${{ secrets.GOOGLE_APPLICATION_CREDENTIALS_JSON }}",
    );
    expect(content).toContain(
      "CLOUDFLARE_ANALYTICS_TOKEN: ${{ secrets.CLOUDFLARE_ANALYTICS_TOKEN }}",
    );
    expect(content).toContain("name: Resolve Cloudflare configuration");
    expect(content).toContain("WORKFLOW_VARS_JSON: ${{ toJSON(vars) }}");
    expect(content).toContain("CLOUDFLARE_ZONE_ID=${workflowVars.CLOUDFLARE_ZONE_ID ?? \"\"}");
    expect(content).toContain("CLOUDFLARE_ACCOUNT_ID=${workflowVars.CLOUDFLARE_ACCOUNT_ID ?? \"\"}");
    expect(content).not.toContain("vars.CLOUDFLARE_ZONE_ID");
    expect(content).not.toContain("vars['CLOUDFLARE_ZONE_ID']");
    expect(content).not.toContain("vars.CLOUDFLARE_ACCOUNT_ID");
    expect(content).not.toContain("vars['CLOUDFLARE_ACCOUNT_ID']");
  });

  it("fails early with a clear configuration error before provider fetches", () => {
    const content = fs.readFileSync(workflowPath, "utf8");

    expect(content).toContain("name: Validate provider configuration");
    expect(content).toContain(
      "Missing GitHub Actions configuration:",
    );
    expect(content).toContain(
      "Expected secrets: GOOGLE_APPLICATION_CREDENTIALS_JSON, CLOUDFLARE_ANALYTICS_TOKEN, CLOUDFLARE_API_TOKEN",
    );
    expect(content).toContain(
      "Expected repository/environment variables: CLOUDFLARE_ZONE_ID, CLOUDFLARE_ACCOUNT_ID",
    );
  });

  it("includes analytics export fetch step", () => {
    const content = fs.readFileSync(workflowPath, "utf8");

    expect(content).toContain("name: Fetch analytics export from R2");
    expect(content).toContain("scripts/data-signals/fetch-analytics-export.mjs");
    expect(content).toContain("CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}");
  });

  it("validates analytics export has no secrets or raw events", () => {
    const content = fs.readFileSync(workflowPath, "utf8");

    expect(content).toContain("name: Validate analytics export — no secrets or raw events");
    expect(content).toContain("[validate-analytics]");
    // Should check for email-like patterns
    expect(content).toContain("email-like");
    // Should check for RUT-like patterns
    expect(content).toContain("RUT-like");
    // Should check for IP-like patterns
    expect(content).toContain("IP-like");
    // Should check schemaVersion
    expect(content).toContain("schemaVersion");
  });

  it("does not commit raw event payloads", () => {
    const content = fs.readFileSync(workflowPath, "utf8");

    // The validation step should reject PII patterns
    // and the fetch script only saves aggregate JSON — no raw events
    // Verify the workflow doesn't reference raw event files
    expect(content).not.toContain("raw-events");
    expect(content).not.toContain("event-payloads");
  });
});