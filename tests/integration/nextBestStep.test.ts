import { describe, expect, it } from "vitest";

import { evaluate, type PageContext, type Rule } from "@/utils/nextBestStep";
import { RULES } from "@/data/nextBestStep/rules";
import type { UserProfileV1 } from "@/utils/userProfile";

// Minimal valid profile
function profile(overrides: Partial<UserProfileV1> = {}): UserProfileV1 {
  return { v: 1, ts: 0, ...overrides };
}

// ---------- evaluate() core mechanics ----------

describe("evaluate — core mechanics", () => {
  it("returns 0 suggestions for an empty profile", () => {
    const ctx: PageContext = {
      calculatorSlug: "sueldo-liquido",
      currentHref: "/calculadoras/sueldo-liquido/",
    };
    expect(evaluate(profile(), ctx, RULES)).toHaveLength(0);
  });

  it("respects maxSuggestions cap (default 2)", () => {
    // All three sl-* rules could fire with the right profile
    const ctx: PageContext = {
      calculatorSlug: "sueldo-liquido",
      currentHref: "/calculadoras/sueldo-liquido/",
    };
    const p = profile({ sueldoImponible: 2_000_000, contratoTipo: "plazo-fijo" });
    const results = evaluate(p, ctx, RULES);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it("respects explicit maxSuggestions=1", () => {
    const ctx: PageContext = {
      calculatorSlug: "sueldo-liquido",
      currentHref: "/calculadoras/sueldo-liquido/",
    };
    const p = profile({ sueldoImponible: 2_000_000, contratoTipo: "plazo-fijo" });
    const results = evaluate(p, ctx, RULES, 1);
    expect(results.length).toBe(1);
  });

  it("anti-circular: skips a rule whose href matches currentHref (no trailing slash)", () => {
    const rule: Rule = {
      id: "test-circular",
      priority: 99,
      when: () => true,
      suggest: () => ({
        href: "/calculadoras/sueldo-liquido",
        headline: "Loop",
        rationale: "test",
        ctaLabel: "Go →",
      }),
    };
    const ctx: PageContext = {
      calculatorSlug: "sueldo-liquido",
      currentHref: "/calculadoras/sueldo-liquido/",
    };
    expect(evaluate(profile(), ctx, [rule])).toHaveLength(0);
  });

  it("anti-circular: skips when currentHref has no trailing slash but rule href does", () => {
    const rule: Rule = {
      id: "test-circular-2",
      priority: 99,
      when: () => true,
      suggest: () => ({
        href: "/calculadoras/apv/",
        headline: "Loop",
        rationale: "test",
        ctaLabel: "Go →",
      }),
    };
    const ctx: PageContext = {
      calculatorSlug: "apv",
      currentHref: "/calculadoras/apv",
    };
    expect(evaluate(profile(), ctx, [rule])).toHaveLength(0);
  });

  it("mutexGroup: only 1 suggestion per group is emitted", () => {
    const rules: Rule[] = [
      {
        id: "a",
        priority: 90,
        mutexGroup: "shared",
        when: () => true,
        suggest: () => ({
          href: "/page-a",
          headline: "A",
          rationale: "r",
          ctaLabel: "Go A →",
        }),
      },
      {
        id: "b",
        priority: 80,
        mutexGroup: "shared",
        when: () => true,
        suggest: () => ({
          href: "/page-b",
          headline: "B",
          rationale: "r",
          ctaLabel: "Go B →",
        }),
      },
    ];
    const ctx: PageContext = {
      calculatorSlug: "x",
      currentHref: "/other/",
    };
    const results = evaluate(profile(), ctx, rules, 5);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("a");
  });

  it("different mutexGroups do not block each other", () => {
    const rules: Rule[] = [
      {
        id: "a",
        priority: 90,
        mutexGroup: "group1",
        when: () => true,
        suggest: () => ({
          href: "/page-a",
          headline: "A",
          rationale: "r",
          ctaLabel: "A →",
        }),
      },
      {
        id: "b",
        priority: 80,
        mutexGroup: "group2",
        when: () => true,
        suggest: () => ({
          href: "/page-b",
          headline: "B",
          rationale: "r",
          ctaLabel: "B →",
        }),
      },
    ];
    const ctx: PageContext = { calculatorSlug: "x", currentHref: "/other/" };
    const results = evaluate(profile(), ctx, rules, 5);
    expect(results).toHaveLength(2);
  });

  it("results are ordered by priority descending", () => {
    const rules: Rule[] = [
      {
        id: "low",
        priority: 30,
        when: () => true,
        suggest: () => ({
          href: "/low",
          headline: "Low",
          rationale: "r",
          ctaLabel: "→",
        }),
      },
      {
        id: "high",
        priority: 90,
        when: () => true,
        suggest: () => ({
          href: "/high",
          headline: "High",
          rationale: "r",
          ctaLabel: "→",
        }),
      },
    ];
    const ctx: PageContext = { calculatorSlug: "x", currentHref: "/other/" };
    const [first, second] = evaluate(profile(), ctx, rules, 5);
    expect(first.id).toBe("high");
    expect(second.id).toBe("low");
  });
});

// ---------- Per-rule when === true / when === false ----------

describe("rule: sl-to-apv-midhigh", () => {
  const ctx: PageContext = {
    calculatorSlug: "sueldo-liquido",
    currentHref: "/calculadoras/sueldo-liquido/",
  };

  it("fires when sueldoImponible >= 1_500_000", () => {
    const p = profile({ sueldoImponible: 2_000_000 });
    const results = evaluate(p, ctx, RULES);
    expect(results.some(s => s.id === "sl-to-apv-midhigh")).toBe(true);
  });

  it("does not fire when sueldoImponible < 1_500_000", () => {
    const p = profile({ sueldoImponible: 1_000_000 });
    const results = evaluate(p, ctx, RULES);
    expect(results.some(s => s.id === "sl-to-apv-midhigh")).toBe(false);
  });

  it("does not fire when sueldoImponible is absent", () => {
    const results = evaluate(profile(), ctx, RULES);
    expect(results.some(s => s.id === "sl-to-apv-midhigh")).toBe(false);
  });
});

describe("rule: sl-to-cesantia", () => {
  const ctx: PageContext = {
    calculatorSlug: "sueldo-liquido",
    currentHref: "/calculadoras/sueldo-liquido/",
  };

  it("fires when contratoTipo === 'plazo-fijo'", () => {
    const p = profile({ contratoTipo: "plazo-fijo" });
    const results = evaluate(p, ctx, RULES);
    expect(results.some(s => s.id === "sl-to-cesantia")).toBe(true);
  });

  it("does not fire when contratoTipo === 'indefinido'", () => {
    const p = profile({ contratoTipo: "indefinido" });
    const results = evaluate(p, ctx, RULES);
    expect(results.some(s => s.id === "sl-to-cesantia")).toBe(false);
  });

  it("does not fire when contratoTipo is absent", () => {
    const results = evaluate(profile(), ctx, RULES);
    expect(results.some(s => s.id === "sl-to-cesantia")).toBe(false);
  });
});

describe("rule: sl-to-finiquito", () => {
  const ctx: PageContext = {
    calculatorSlug: "sueldo-liquido",
    currentHref: "/calculadoras/sueldo-liquido/",
  };

  it("fires when contratoTipo === 'indefinido' and sueldoImponible present", () => {
    const p = profile({ contratoTipo: "indefinido", sueldoImponible: 900_000 });
    const results = evaluate(p, ctx, RULES, 5);
    expect(results.some(s => s.id === "sl-to-finiquito")).toBe(true);
  });

  it("does not fire when contratoTipo is 'plazo-fijo'", () => {
    const p = profile({ contratoTipo: "plazo-fijo", sueldoImponible: 900_000 });
    const results = evaluate(p, ctx, RULES, 5);
    expect(results.some(s => s.id === "sl-to-finiquito")).toBe(false);
  });

  it("does not fire when sueldoImponible is absent", () => {
    const p = profile({ contratoTipo: "indefinido" });
    const results = evaluate(p, ctx, RULES, 5);
    expect(results.some(s => s.id === "sl-to-finiquito")).toBe(false);
  });
});

describe("rule: apv-to-opren", () => {
  const ctx: PageContext = {
    calculatorSlug: "apv",
    currentHref: "/calculadoras/apv/",
  };

  it("fires when apvRegimenBAnual > 0", () => {
    const p = profile({ apvRegimenBAnual: 600_000 });
    const results = evaluate(p, ctx, RULES);
    expect(results.some(s => s.id === "apv-to-opren")).toBe(true);
  });

  it("does not fire when apvRegimenBAnual is 0", () => {
    const p = profile({ apvRegimenBAnual: 0 });
    const results = evaluate(p, ctx, RULES);
    expect(results.some(s => s.id === "apv-to-opren")).toBe(false);
  });

  it("does not fire when apvRegimenBAnual is absent", () => {
    const results = evaluate(profile(), ctx, RULES);
    expect(results.some(s => s.id === "apv-to-opren")).toBe(false);
  });
});

describe("rule: apv-to-sl", () => {
  const ctx: PageContext = {
    calculatorSlug: "apv",
    currentHref: "/calculadoras/apv/",
  };

  it("fires when sueldoImponible is absent", () => {
    const results = evaluate(profile(), ctx, RULES);
    expect(results.some(s => s.id === "apv-to-sl")).toBe(true);
  });

  it("does not fire when sueldoImponible is present", () => {
    const p = profile({ sueldoImponible: 1_200_000 });
    const results = evaluate(p, ctx, RULES);
    expect(results.some(s => s.id === "apv-to-sl")).toBe(false);
  });
});

describe("rule: isc-to-sl", () => {
  const ctx: PageContext = {
    calculatorSlug: "impuesto-segunda-categoria",
    currentHref: "/calculadoras/impuesto-segunda-categoria/",
  };

  it("fires when sueldoImponible is absent", () => {
    const results = evaluate(profile(), ctx, RULES);
    expect(results.some(s => s.id === "isc-to-sl")).toBe(true);
  });

  it("does not fire when sueldoImponible is present", () => {
    const p = profile({ sueldoImponible: 1_200_000 });
    const results = evaluate(p, ctx, RULES);
    expect(results.some(s => s.id === "isc-to-sl")).toBe(false);
  });
});

describe("rule: isc-to-apv", () => {
  const ctx: PageContext = {
    calculatorSlug: "impuesto-segunda-categoria",
    currentHref: "/calculadoras/impuesto-segunda-categoria/",
  };

  it("fires when sueldoImponible >= 1_500_000", () => {
    const p = profile({ sueldoImponible: 1_800_000 });
    const results = evaluate(p, ctx, RULES);
    expect(results.some(s => s.id === "isc-to-apv")).toBe(true);
  });

  it("does not fire when sueldoImponible < 1_500_000", () => {
    const p = profile({ sueldoImponible: 1_200_000 });
    const results = evaluate(p, ctx, RULES);
    expect(results.some(s => s.id === "isc-to-apv")).toBe(false);
  });

  it("does not fire when sueldoImponible is absent", () => {
    const results = evaluate(profile(), ctx, RULES);
    expect(results.some(s => s.id === "isc-to-apv")).toBe(false);
  });
});

describe("rule: afp-to-sl", () => {
  const ctx: PageContext = {
    calculatorSlug: "comisiones-afp",
    currentHref: "/calculadoras/comisiones-afp/",
  };

  it("fires when afpId is set but sueldoImponible is absent", () => {
    const p = profile({ afpId: "Habitat" });
    const results = evaluate(p, ctx, RULES);
    expect(results.some(s => s.id === "afp-to-sl")).toBe(true);
  });

  it("does not fire when sueldoImponible is also set", () => {
    const p = profile({ afpId: "Habitat", sueldoImponible: 1_000_000 });
    const results = evaluate(p, ctx, RULES);
    expect(results.some(s => s.id === "afp-to-sl")).toBe(false);
  });

  it("does not fire when afpId is absent", () => {
    const results = evaluate(profile(), ctx, RULES);
    expect(results.some(s => s.id === "afp-to-sl")).toBe(false);
  });
});

describe("rule: fin-to-cesantia", () => {
  const ctx: PageContext = {
    calculatorSlug: "finiquito-indemnizacion",
    currentHref: "/calculadoras/finiquito-indemnizacion/",
  };

  it("fires when contratoTipo === 'indefinido'", () => {
    const p = profile({ contratoTipo: "indefinido" });
    const results = evaluate(p, ctx, RULES);
    expect(results.some(s => s.id === "fin-to-cesantia")).toBe(true);
  });

  it("does not fire when contratoTipo === 'plazo-fijo'", () => {
    const p = profile({ contratoTipo: "plazo-fijo" });
    const results = evaluate(p, ctx, RULES);
    expect(results.some(s => s.id === "fin-to-cesantia")).toBe(false);
  });

  it("does not fire when contratoTipo is absent", () => {
    const results = evaluate(profile(), ctx, RULES);
    expect(results.some(s => s.id === "fin-to-cesantia")).toBe(false);
  });
});

describe("rule: opren-to-apv", () => {
  const ctx: PageContext = {
    calculatorSlug: "operacion-renta",
    currentHref: "/calculadoras/operacion-renta/",
  };

  it("fires when sueldoImponible >= 1_000_000 and apvRegimenBAnual absent", () => {
    const p = profile({ sueldoImponible: 1_200_000 });
    const results = evaluate(p, ctx, RULES);
    expect(results.some(s => s.id === "opren-to-apv")).toBe(true);
  });

  it("does not fire when apvRegimenBAnual is present", () => {
    const p = profile({ sueldoImponible: 1_200_000, apvRegimenBAnual: 300_000 });
    const results = evaluate(p, ctx, RULES);
    expect(results.some(s => s.id === "opren-to-apv")).toBe(false);
  });

  it("does not fire when sueldoImponible < 1_000_000", () => {
    const p = profile({ sueldoImponible: 800_000 });
    const results = evaluate(p, ctx, RULES);
    expect(results.some(s => s.id === "opren-to-apv")).toBe(false);
  });

  it("does not fire when sueldoImponible is absent", () => {
    const results = evaluate(profile(), ctx, RULES);
    expect(results.some(s => s.id === "opren-to-apv")).toBe(false);
  });
});

// ---------- Snapshot: 6+ synthetic profiles ----------

describe("suggestion snapshots for synthetic profiles", () => {
  it("profile: sueldo-liquido + high income → APV suggestion (sl-to-apv-midhigh)", () => {
    const ctx: PageContext = {
      calculatorSlug: "sueldo-liquido",
      currentHref: "/calculadoras/sueldo-liquido/",
    };
    const results = evaluate(
      profile({ sueldoImponible: 2_000_000 }),
      ctx,
      RULES
    );
    expect(results).toEqual([
      {
        id: "sl-to-apv-midhigh",
        priority: 80,
        href: "/calculadoras/apv",
        headline: "Podrías reducir tu impuesto con APV",
        rationale: "sueldoImponible >= 1_500_000 en sueldo-liquido",
        ctaLabel: "Calcular APV →",
        ymylTag: "tax",
      },
    ]);
  });

  it("profile: sueldo-liquido + plazo-fijo → cesantía suggestion (sl-to-cesantia)", () => {
    const ctx: PageContext = {
      calculatorSlug: "sueldo-liquido",
      currentHref: "/calculadoras/sueldo-liquido/",
    };
    const results = evaluate(
      profile({ contratoTipo: "plazo-fijo" }),
      ctx,
      RULES
    );
    expect(results).toEqual([
      {
        id: "sl-to-cesantia",
        priority: 60,
        href: "/posts/seguro-de-cesantia/",
        headline: "Calcula tu seguro de cesantía",
        rationale: "contratoTipo === 'plazo-fijo' en sueldo-liquido",
        ctaLabel: "Ver seguro de cesantía →",
        ymylTag: "labor",
      },
    ]);
  });

  it("profile: apv + has apvRegimenBAnual → operacion-renta suggestion (apv-to-opren)", () => {
    const ctx: PageContext = {
      calculatorSlug: "apv",
      currentHref: "/calculadoras/apv/",
    };
    const results = evaluate(
      profile({ apvRegimenBAnual: 1_200_000, sueldoImponible: 1_800_000 }),
      ctx,
      RULES
    );
    expect(results[0]).toMatchObject({ id: "apv-to-opren", ymylTag: "tax" });
  });

  it("profile: apv + no sueldoImponible → sueldo-liquido prereq (apv-to-sl)", () => {
    const ctx: PageContext = {
      calculatorSlug: "apv",
      currentHref: "/calculadoras/apv/",
    };
    const results = evaluate(profile(), ctx, RULES);
    expect(results).toEqual([
      {
        id: "apv-to-sl",
        priority: 70,
        href: "/calculadoras/sueldo-liquido",
        headline: "Primero calcula tu sueldo líquido",
        rationale: "sueldoImponible no disponible en perfil en apv",
        ctaLabel: "Calcular sueldo líquido →",
      },
    ]);
  });

  it("profile: impuesto-segunda-categoria + no sueldoImponible → prereq (isc-to-sl)", () => {
    const ctx: PageContext = {
      calculatorSlug: "impuesto-segunda-categoria",
      currentHref: "/calculadoras/impuesto-segunda-categoria/",
    };
    const results = evaluate(profile(), ctx, RULES);
    expect(results).toEqual([
      {
        id: "isc-to-sl",
        priority: 70,
        href: "/calculadoras/sueldo-liquido",
        headline: "Calcula tu sueldo líquido",
        rationale: "sueldoImponible no disponible en impuesto-segunda-categoria",
        ctaLabel: "Calcular sueldo líquido →",
      },
    ]);
  });

  it("profile: comisiones-afp + afpId no sueldoImponible → sl suggestion (afp-to-sl)", () => {
    const ctx: PageContext = {
      calculatorSlug: "comisiones-afp",
      currentHref: "/calculadoras/comisiones-afp/",
    };
    const results = evaluate(profile({ afpId: "Capital" }), ctx, RULES);
    expect(results).toEqual([
      {
        id: "afp-to-sl",
        priority: 70,
        href: "/calculadoras/sueldo-liquido",
        headline: "Ahora calcula tu líquido con esa AFP",
        rationale: "afpId presente pero sueldoImponible falta en comisiones-afp",
        ctaLabel: "Calcular sueldo líquido →",
      },
    ]);
  });

  it("profile: finiquito + indefinido → cesantía suggestion (fin-to-cesantia)", () => {
    const ctx: PageContext = {
      calculatorSlug: "finiquito-indemnizacion",
      currentHref: "/calculadoras/finiquito-indemnizacion/",
    };
    const results = evaluate(
      profile({ contratoTipo: "indefinido" }),
      ctx,
      RULES
    );
    expect(results).toEqual([
      {
        id: "fin-to-cesantia",
        priority: 60,
        href: "/posts/seguro-de-cesantia/",
        headline: "Verifica tu seguro de cesantía",
        rationale: "contratoTipo === 'indefinido' en finiquito-indemnizacion",
        ctaLabel: "Ver seguro de cesantía →",
        ymylTag: "labor",
      },
    ]);
  });

  it("profile: operacion-renta + sueldoImponible no APV → APV suggestion (opren-to-apv)", () => {
    const ctx: PageContext = {
      calculatorSlug: "operacion-renta",
      currentHref: "/calculadoras/operacion-renta/",
    };
    const results = evaluate(
      profile({ sueldoImponible: 1_500_000 }),
      ctx,
      RULES
    );
    expect(results).toEqual([
      {
        id: "opren-to-apv",
        priority: 50,
        href: "/calculadoras/apv",
        headline: "Podrías pagar menos el próximo año con APV",
        rationale:
          "apvRegimenBAnual ausente y sueldoImponible >= 1_000_000 en operacion-renta",
        ctaLabel: "Calcular APV →",
        ymylTag: "tax",
      },
    ]);
  });

  it("profile: sueldo-liquido + high income + indefinido → APV first, finiquito second", () => {
    const ctx: PageContext = {
      calculatorSlug: "sueldo-liquido",
      currentHref: "/calculadoras/sueldo-liquido/",
    };
    const results = evaluate(
      profile({ sueldoImponible: 2_000_000, contratoTipo: "indefinido" }),
      ctx,
      RULES
    );
    // sl-to-apv-midhigh (p=80, mutex next-saving) and sl-to-finiquito (p=40, mutex next-labor)
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe("sl-to-apv-midhigh");
    expect(results[1].id).toBe("sl-to-finiquito");
  });
});
