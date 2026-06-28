/**
 * Tests para el saneamiento de rutas Cloudflare RUM.
 *
 * Verifica que:
 *  - Rutas ajenas al sitio se excluyen y cuentan en discarded
 *  - Rutas válidas del sitio se conservan
 *  - Rutas dinámicas válidas (/posts/slug/, /calculadoras/slug/) se conservan
 */
import { describe, expect, it } from "vitest";
import {
  SITE_ROUTE_ALLOWLIST,
  isKnownSiteRoute,
  sanitizeRumRoutes,
} from "../../scripts/data-signals/gsc-utils.mjs";

/** RUM row shape used in sanitization tests. */
interface RumRow {
  path: string;
  count: number;
  lcpP75Ms?: number | null;
  clsP75?: number | null;
  inpP75Ms?: number | null;
  [key: string]: unknown;
}

describe("isKnownSiteRoute", () => {
  it("accepts known site routes", () => {
    expect(isKnownSiteRoute("/")).toBe(true);
    expect(isKnownSiteRoute("/calculadoras/sueldo-liquido/")).toBe(true);
    expect(isKnownSiteRoute("/posts/articulo-ejemplo/")).toBe(true);
    expect(isKnownSiteRoute("/guias/pensiones-afp/")).toBe(true);
    expect(isKnownSiteRoute("/privacidad/")).toBe(true);
    expect(isKnownSiteRoute("/cookies/")).toBe(true);
    expect(isKnownSiteRoute("/apoyar/")).toBe(true);
    expect(isKnownSiteRoute("/metodologia/")).toBe(true);
    expect(isKnownSiteRoute("/buscar/")).toBe(true);
    expect(isKnownSiteRoute("/api/analytics/event")).toBe(true);
  });

  it("accepts dynamic calculator paths", () => {
    // All calculator paths should be preserved
    expect(isKnownSiteRoute("/calculadoras/seguro-cesantia/")).toBe(true);
    expect(isKnownSiteRoute("/calculadoras/operacion-renta/")).toBe(true);
    expect(isKnownSiteRoute("/calculadoras/prepago-credito/")).toBe(true);
    expect(isKnownSiteRoute("/calculadoras/credito-consumo/")).toBe(true);
    expect(isKnownSiteRoute("/calculadoras/sueldo-liquido/")).toBe(true);
    // Random valid calculator path
    expect(isKnownSiteRoute("/calculadoras/alguna-calculadora-nueva/")).toBe(true);
  });

  it("accepts dynamic post paths", () => {
    expect(isKnownSiteRoute("/posts/como-calcular-sueldo-liquido/")).toBe(true);
    expect(isKnownSiteRoute("/posts/guia-completa-afp/")).toBe(true);
    expect(isKnownSiteRoute("/posts/any-article-slug/")).toBe(true);
  });

  it("rejects routes outside site inventory", () => {
    expect(isKnownSiteRoute("/wp-admin/")).toBe(false);
    expect(isKnownSiteRoute("/some-other-site")).toBe(false);
    expect(isKnownSiteRoute("/cdn-cgi/")).toBe(false);
    expect(isKnownSiteRoute("/.env")).toBe(false);
    expect(isKnownSiteRoute("/static/")).toBe(false);
  });

  it("rejects empty or null paths", () => {
    expect(isKnownSiteRoute("")).toBe(false);
    expect(isKnownSiteRoute(null as unknown as string)).toBe(false);
    expect(isKnownSiteRoute(undefined as unknown as string)).toBe(false);
  });

  it("does not accept partial prefix matches that aren't real", () => {
    // "/calculadora" (without trailing slash) is NOT in the allowlist
    expect(isKnownSiteRoute("/calculadora")).toBe(false);
    // "/post" is NOT in the allowlist (only "/posts/")
    expect(isKnownSiteRoute("/post")).toBe(false);
  });
});

describe("sanitizeRumRoutes", () => {
  it("keeps valid site routes", () => {
    const rows = [
      { path: "/calculadoras/tool-a/", count: 100, lcpP75Ms: 1200 },
      { path: "/posts/article-1/", count: 50, lcpP75Ms: 980 },
      { path: "/", count: 200, lcpP75Ms: 850 },
    ];

    const { kept, discarded } = sanitizeRumRoutes(rows);
    expect(kept.length).toBe(3);
    expect(discarded.length).toBe(0);
    const k0 = kept[0] as RumRow;
    expect(k0.path).toBe("/calculadoras/tool-a/");
  });

  it("discards routes outside site inventory and reports reason", () => {
    const rows: RumRow[] = [
      { path: "/calculadoras/tool-a/", count: 100, lcpP75Ms: 1200 },
      { path: "/wp-admin/login", count: 5, lcpP75Ms: 3000 },
      { path: "/external-site/page", count: 10, lcpP75Ms: 2500 },
    ];

    const { kept, discarded } = sanitizeRumRoutes(rows);
    expect(kept.length).toBe(1);
    expect((kept[0] as RumRow).path).toBe("/calculadoras/tool-a/");

    expect(discarded.length).toBe(2);
    expect(discarded[0].path).toBe("/wp-admin/login");
    expect(discarded[0].reason).toBe("route_not_in_site_inventory");
    expect(discarded[1].path).toBe("/external-site/page");
    expect(discarded[1].reason).toBe("route_not_in_site_inventory");
  });

  it("preserves all row data for kept routes", () => {
    const rows: RumRow[] = [
      { path: "/calculadoras/tool-a/", count: 100, lcpP75Ms: 1200, clsP75: 0.05, inpP75Ms: 48 },
    ];

    const { kept } = sanitizeRumRoutes(rows);
    const k0 = kept[0] as RumRow;
    expect(k0.lcpP75Ms).toBe(1200);
    expect(k0.clsP75).toBe(0.05);
    expect(k0.inpP75Ms).toBe(48);
  });

  it("returns empty kept array when all routes are external", () => {
    const rows = [
      { path: "/other-site/", count: 10 },
      { path: "/cdn-cgi/trace", count: 5 },
    ];

    const { kept, discarded } = sanitizeRumRoutes(rows);
    expect(kept.length).toBe(0);
    expect(discarded.length).toBe(2);
  });

  it("returns empty arrays for empty input", () => {
    const { kept, discarded } = sanitizeRumRoutes([]);
    expect(kept.length).toBe(0);
    expect(discarded.length).toBe(0);
  });
});

describe("SITE_ROUTE_ALLOWLIST", () => {
  it("contains the minimum expected route prefixes", () => {
    const required = [
      "/",
      "/calculadoras/",
      "/guias/",
      "/posts/",
      "/privacidad/",
      "/cookies/",
      "/apoyar/",
      "/metodologia/",
    ];
    for (const prefix of required) {
      expect(SITE_ROUTE_ALLOWLIST).toContain(prefix);
    }
  });

  it("has no duplicate entries", () => {
    const seen = new Set();
    for (const entry of SITE_ROUTE_ALLOWLIST) {
      expect(seen.has(entry)).toBe(false);
      seen.add(entry);
    }
  });
});
