import { describe, expect, it } from "vitest";

import {
  getAnalyticsEventNameForCta,
  getReachedScrollMilestones,
  isOfficialSourceUrl,
} from "@/utils/analytics";

describe("analytics utilities", () => {
  it("returns only reached scroll milestones", () => {
    expect(getReachedScrollMilestones(0)).toEqual([]);
    expect(getReachedScrollMilestones(24.9)).toEqual([]);
    expect(getReachedScrollMilestones(25)).toEqual([25]);
    expect(getReachedScrollMilestones(80)).toEqual([25, 50, 75]);
    expect(getReachedScrollMilestones(130)).toEqual([25, 50, 75, 100]);
  });

  it("detects official Chilean source domains", () => {
    expect(isOfficialSourceUrl("https://www.sii.cl/portales")).toBe(true);
    expect(isOfficialSourceUrl("https://chileatiende.gob.cl/fichas/")).toBe(
      true
    );
    expect(
      isOfficialSourceUrl(
        "https://si3.bcentral.cl/Indicadoressiete/secure/Indicadoresdiarios.aspx"
      )
    ).toBe(true);
    expect(isOfficialSourceUrl("https://www.comparaonline.cl")).toBe(false);
    expect(isOfficialSourceUrl("/posts/que-es-la-uf/")).toBe(false);
  });

  it("maps continuity CTA identifiers to explicit analytics events", () => {
    expect(getAnalyticsEventNameForCta("next-step")).toBe("next_step_click");
    expect(getAnalyticsEventNameForCta("related-post")).toBe(
      "related_content_click"
    );
    expect(getAnalyticsEventNameForCta("calculator-trust-link")).toBe(
      "calculator_trust_link_click"
    );
    expect(getAnalyticsEventNameForCta("hub-route")).toBe("hub_route_click");
    expect(getAnalyticsEventNameForCta("search-chip")).toBe(
      "search_chip_click"
    );
    expect(getAnalyticsEventNameForCta("unknown-cta")).toBe("cta_click");
  });
});
