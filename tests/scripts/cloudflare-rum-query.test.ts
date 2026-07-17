import { describe, expect, it } from "vitest";
import {
  DEFAULT_SITE_HOST,
  buildRumWebVitalsQuery,
  extractRumWebVitalsGroups,
} from "../../scripts/data-signals/cloudflare-fetch.mjs";

describe("Cloudflare RUM query", () => {
  it("scopes account-level RUM to the canonical Monedario hostname", () => {
    const { query, variables } = buildRumWebVitalsQuery(
      "account-test",
      DEFAULT_SITE_HOST,
      "2026-07-06T00:00:00Z",
      "2026-07-12T23:59:59Z"
    );

    expect(DEFAULT_SITE_HOST).toBe("monedario.cl");
    expect(variables.host).toBe("monedario.cl");
    expect(variables.host).not.toBe("www.monedario.cl");
    expect(query).toContain("$host: string!");
    expect(query).toContain("requestHost: $host");
    expect(query).toContain("dimensions { requestHost requestPath }");
  });

  it("returns an empty list when the account has no RUM groups", () => {
    expect(extractRumWebVitalsGroups({ viewer: { accounts: [] } })).toEqual([]);
  });
});
