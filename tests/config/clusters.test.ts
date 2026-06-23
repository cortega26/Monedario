import { describe, expect, it } from "vitest";
import { GUIDE_HUBS, GUIDE_HUB_ORDER } from "@/config/clusters";

describe("guide hubs config", () => {
  it("has GUIDE_HUB_ORDER with at least 8 hub slugs", () => {
    expect(GUIDE_HUB_ORDER.length).toBeGreaterThanOrEqual(8);
  });

  it("has exactly 11 hub slugs in GUIDE_HUB_ORDER", () => {
    // Canary: if this changes, review the source and update the expectation.
    // 2026-06-23: 9 → 10 (bancos-fintech, ADR-20260617) → 11 (finanzas-migrantes
    // flip completed, ADR-20260622).
    expect(GUIDE_HUB_ORDER).toHaveLength(11);
  });

  it("does not duplicate slugs in GUIDE_HUB_ORDER", () => {
    const uniqueSlugs = new Set(GUIDE_HUB_ORDER);
    expect(uniqueSlugs.size).toBe(GUIDE_HUB_ORDER.length);
  });

  it("maps every slug in GUIDE_HUB_ORDER to an entry in GUIDE_HUBS", () => {
    const hubSlugs = Object.keys(GUIDE_HUBS) as Array<keyof typeof GUIDE_HUBS>;

    for (const slug of GUIDE_HUB_ORDER) {
      expect(hubSlugs).toContain(slug);
    }
  });

  it("does not have orphan entries in GUIDE_HUBS", () => {
    const hubSlugs = Object.keys(GUIDE_HUBS) as Array<keyof typeof GUIDE_HUBS>;

    for (const slug of hubSlugs) {
      expect(GUIDE_HUB_ORDER).toContain(slug);
    }
  });

  it("gives every hub a nombre, descripcion, capa, and homepageResumen", () => {
    for (const slug of GUIDE_HUB_ORDER) {
      const hub = GUIDE_HUBS[slug];
      expect(typeof hub.nombre).toBe("string");
      expect(hub.nombre.trim().length).toBeGreaterThan(0);
      expect(typeof hub.descripcion).toBe("string");
      expect(hub.descripcion.trim().length).toBeGreaterThan(0);
      expect(typeof hub.capa).toBe("string");
      expect(hub.capa.trim().length).toBeGreaterThan(0);
      expect(typeof hub.homepageResumen).toBe("string");
      expect(hub.homepageResumen.trim().length).toBeGreaterThan(0);
    }
  });

  it("assigns a valid HubLayer to every hub", () => {
    const validLayers = [
      "ingresos",
      "prevision",
      "ahorro-inversion",
      "impuestos",
      "deuda",
      "bolsillo",
      "otros",
    ] as const;

    for (const slug of GUIDE_HUB_ORDER) {
      expect(validLayers).toContain(GUIDE_HUBS[slug].capa);
    }
  });
});
