import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import type { CollectionEntry } from "astro:content";
import {
  getBalancedHomepagePosts,
  getHomepageHubRail,
  getHomepageLeadPost,
} from "../../src/utils/homepage";

type BlogEntry = CollectionEntry<"blog">;

function makePost(
  slug: string,
  cluster: string,
  overrides: Partial<BlogEntry["data"]> = {}
): BlogEntry {
  return {
    id: `${slug}.md`,
    collection: "blog",
    body: "",
    data: {
      title: `Post ${slug}`,
      description: `Description ${slug}`,
      slug,
      pubDate: new Date("2026-03-01T12:00:00Z"),
      updatedDate: new Date("2026-03-01T12:00:00Z"),
      tags: [],
      category: "empleo-ingresos",
      cluster,
      lang: "es-CL",
      draft: false,
      unlisted: false,
      featured: false,
      homepagePriority: 0,
      author: "Equipo Monedario",
      inlineImageExceptions: [],
      ...overrides,
    },
    rendered: undefined,
    filePath: `/tmp/${slug}.md`,
    digest: slug,
  } as BlogEntry;
}

describe("homepage content helpers", () => {
  it("does not contain internal editorial-facing homepage copy", () => {
    const source = readFileSync("src/pages/index.astro", "utf8");
    const calcSource = readFileSync("src/pages/calculadoras/index.astro", "utf8");

    expect(source).not.toMatch(/taxonom[ií]a de Monedario/i);
    expect(source).not.toMatch(/apertura editorial/i);
    expect(source).not.toMatch(/lo dej[eé]/i);
    expect(source).not.toMatch(/abrir la portada con m[aá]s amplitud/i);
    // Audit 2026-03-24: metamessage guards
    expect(source).not.toMatch(/Abre la portada/i);
    expect(source).not.toMatch(/Actualizaciones que ampl[ií]an la portada/i);
    expect(source).not.toMatch(/lista m[aá]s compacta.*grilla de cajas/i);
    expect(source).not.toMatch(/del texto al n[uú]mero/i);
    expect(calcSource).not.toMatch(/portafolio ya no est[aá] ordenado/i);
    expect(calcSource).not.toMatch(/herramientas activas/i);
  });

  it("does not contain internal template labels in ArticleDecisionIntro", () => {
    const source = readFileSync(
      "src/components/ArticleDecisionIntro.astro",
      "utf8"
    );
    expect(source).not.toMatch(/>\s*Respuesta r[aá]pida\s*</i);
    expect(source).not.toMatch(/>\s*Vigencia\s*</i);
    // Note: \bUso\b to avoid matching 'Uso' inside longer words
    expect(source).not.toMatch(/>\s*Uso\s*</i);
    expect(source).not.toMatch(/>\s*Fuentes\s*<\/p>/i);
  });

  it("does not contain internal editorial-facing release notes in reader-facing content", () => {
    const articleSource = readFileSync(
      "src/data/blog/el-poder-del-interes-compuesto.md",
      "utf8"
    );
    const methodologySource = readFileSync(
      "src/data/blog/interes-compuesto-nota-metodologica.md",
      "utf8"
    );

    expect(articleSource).not.toMatch(/refuerzo editorial aplicado en esta revisi[oó]n/i);
    expect(articleSource).not.toMatch(/correcci[oó]n aplicada en esta revisi[oó]n/i);
    expect(methodologySource).not.toMatch(/correcci[oó]n aplicada en esta revisi[oó]n/i);
  });

  it("prefers explicit homepage priority over featured recency", () => {
    const featured = makePost("featured-post", "deuda-credito", {
      featured: true,
      updatedDate: new Date("2026-03-08T12:00:00Z"),
    });
    const lead = makePost("lead-post", "sueldo-remuneraciones", {
      homepagePriority: 100,
      updatedDate: new Date("2026-03-02T12:00:00Z"),
    });

    expect(getHomepageLeadPost([featured, lead])?.data.slug).toBe("lead-post");
  });

  it("falls back to a featured post when no homepage priority is present", () => {
    const regular = makePost("regular-post", "deuda-credito", {
      updatedDate: new Date("2026-03-09T12:00:00Z"),
    });
    const featured = makePost("featured-post", "sueldo-remuneraciones", {
      featured: true,
      updatedDate: new Date("2026-03-01T12:00:00Z"),
    });

    expect(getHomepageLeadPost([regular, featured])?.data.slug).toBe(
      "featured-post"
    );
  });

  it("falls back to the provided post order when neither priority nor featured exists", () => {
    const firstInFeed = makePost("first-in-feed", "deuda-credito", {
      updatedDate: new Date("2026-03-01T12:00:00Z"),
    });
    const newerButSecond = makePost("newer-but-second", "sueldo-remuneraciones", {
      updatedDate: new Date("2026-03-09T12:00:00Z"),
    });

    expect(getHomepageLeadPost([firstInFeed, newerButSecond])?.data.slug).toBe(
      "first-in-feed"
    );
  });

  it("balances the rich recent rail away from the hero cluster when variety exists", () => {
    const hero = makePost("hero-post", "sueldo-remuneraciones", {
      homepagePriority: 100,
      updatedDate: new Date("2026-03-09T12:00:00Z"),
    });
    const posts = [
      hero,
      makePost("salary-2", "sueldo-remuneraciones", {
        updatedDate: new Date("2026-03-08T12:00:00Z"),
      }),
      makePost("salary-3", "sueldo-remuneraciones", {
        updatedDate: new Date("2026-03-07T12:00:00Z"),
      }),
      makePost("investing-1", "ahorro-e-inversion", {
        updatedDate: new Date("2026-03-06T12:00:00Z"),
      }),
      makePost("debt-1", "deuda-credito", {
        updatedDate: new Date("2026-03-05T12:00:00Z"),
      }),
      makePost("security-1", "seguridad-financiera", {
        updatedDate: new Date("2026-03-04T12:00:00Z"),
      }),
    ];

    const balanced = getBalancedHomepagePosts(posts, {
      heroSlug: "hero-post",
      heroCluster: "sueldo-remuneraciones",
      richCount: 3,
      totalCount: 6,
    });

    expect(balanced.richPosts.map(post => post.data.cluster)).toEqual([
      "ahorro-e-inversion",
      "deuda-credito",
      "seguridad-financiera",
    ]);
    expect(balanced.compactPosts.map(post => post.data.slug)).toContain("salary-2");
  });

  it("excludes the hero from recent slots using normalized slug identity", () => {
    const hero = makePost("hero-entry", "sueldo-remuneraciones", {
      slug: " Hero-Post ",
      homepagePriority: 100,
      updatedDate: new Date("2026-03-09T12:00:00Z"),
    });
    const posts = [
      hero,
      makePost("recent-1", "deuda-credito", {
        updatedDate: new Date("2026-03-08T12:00:00Z"),
      }),
      makePost("recent-2", "ahorro-e-inversion", {
        updatedDate: new Date("2026-03-07T12:00:00Z"),
      }),
      makePost("recent-3", "seguridad-financiera", {
        updatedDate: new Date("2026-03-06T12:00:00Z"),
      }),
    ];

    const balanced = getBalancedHomepagePosts(posts, {
      heroSlug: "hero-post",
      heroCluster: "sueldo-remuneraciones",
      richCount: 2,
      totalCount: 4,
    });

    const selectedSlugs = [...balanced.richPosts, ...balanced.compactPosts].map(
      post => post.data.slug.trim().toLowerCase()
    );

    expect(selectedSlugs).not.toContain("hero-post");
    expect(selectedSlugs).toEqual(
      expect.arrayContaining(["recent-1", "recent-2", "recent-3"])
    );
  });

  it("builds the thematic rail from the hero and recent clusters before falling back", () => {
    const recentPosts = [
      makePost("investing-1", "ahorro-e-inversion"),
      makePost("debt-1", "deuda-credito"),
      makePost("security-1", "seguridad-financiera"),
    ];

    const rail = getHomepageHubRail("sueldo-remuneraciones", recentPosts, 4);

    expect(rail.map(entry => entry.slug)).toEqual([
      "empleo-ingresos",
      "presupuesto-control-financiero",
      "pensiones-afp",
      "uf-costo-de-vida",
    ]);
  });

  it("operacion-renta calculator page does not reference the outdated 12.25% PPM rate", () => {
    // Ley 21.133 raised the honorarios PPM retention to 15.25% for 2026.
    // This guard ensures stale copy never ships again.
    const source = readFileSync(
      "src/pages/calculadoras/operacion-renta.astro",
      "utf8"
    );
    expect(source).not.toContain("12.25%");
    expect(source).not.toContain("12.25");
  });
});

describe("Wave 1 structural guards", () => {
  it("HeroHomepage has exactly 4 hero CTAs (≤4 requirement)", () => {
    const source = readFileSync("src/components/HeroHomepage.astro", "utf8");
    const ctaMatches = source.match(/data-analytics-cta="home-hero-cta"/g);
    expect(ctaMatches).not.toBeNull();
    expect(ctaMatches!.length).toBeLessThanOrEqual(4);
  });

  it("all hero CTAs carry required analytics attributes", () => {
    const source = readFileSync("src/components/HeroHomepage.astro", "utf8");
    expect(source).toContain('data-analytics-location="home_hero"');
    expect(source).toContain('data-analytics-cta="home-hero-cta"');
    expect(source).toContain("data-analytics-label");
  });

  it("trust signals are present in HeroHomepage", () => {
    const source = readFileSync("src/components/HeroHomepage.astro", "utf8");
    expect(source).toMatch(/sin publicidad/i);
    expect(source).toMatch(/sin registro requerido/i);
    expect(source).toMatch(/fuentes oficiales/i);
  });

  it("buscar.astro uses grouped chip structure with intent groups", () => {
    const source = readFileSync("src/pages/buscar.astro", "utf8");
    expect(source).toContain("searchGroups");
    expect(source).toContain('"Ingresos"');
    expect(source).toContain('"Deudas"');
    expect(source).toContain('"Impuestos"');
    expect(source).toContain('"Previsión"');
  });

  it("buscar.astro chips preserve anonymous analytics attributes", () => {
    const source = readFileSync("src/pages/buscar.astro", "utf8");
    expect(source).toContain('data-analytics-cta="search-chip"');
    expect(source).toContain('data-analytics-location="search_chips"');
    expect(source).toContain("data-analytics-label");
    expect(source).not.toContain("user_id");
    expect(source).not.toContain("userId");
  });

  it("buscar.astro search input placeholder contains example queries", () => {
    const source = readFileSync("src/pages/buscar.astro", "utf8");
    expect(source).toContain("Ej:");
    expect(source).toContain("AFP");
    expect(source).toContain("DICOM");
  });

  it("GlossaryJsonLd does not emit a standalone BreadcrumbList schema block", () => {
    const source = readFileSync(
      "src/components/GlossaryJsonLd.astro",
      "utf8"
    );
    expect(source).toContain("DefinedTerm");
    expect(source).not.toContain("BreadcrumbList");
  });
});

describe("Wave 2 structural guards", () => {
  const calculatorPages = [
    "sueldo-liquido",
    "finiquito-indemnizacion",
    "operacion-renta",
    "credito-consumo",
    "tarjeta-credito",
    "apv",
  ];

  it("CalculatorResultNextActions component exists with required container attributes", () => {
    const source = readFileSync(
      "src/components/CalculatorResultNextActions.astro",
      "utf8"
    );
    expect(source).toContain('data-testid="calculator-result-next-actions"');
    expect(source).toContain('class="mt-6 hidden"');
    expect(source).toContain("showCalculatorNextActions");
  });

  it("CalculatorResultNextActions component contains no PII field references", () => {
    const source = readFileSync(
      "src/components/CalculatorResultNextActions.astro",
      "utf8"
    );
    expect(source).not.toContain("salary");
    expect(source).not.toContain("sueldo");
    expect(source).not.toContain("deuda");
    expect(source).not.toContain("monto");
    expect(source).not.toContain("user_id");
    expect(source).not.toContain("userId");
    expect(source).not.toContain("rut");
    expect(source).not.toContain("email");
  });

  it("all 6 calculator pages import and use CalculatorResultNextActions", () => {
    for (const slug of calculatorPages) {
      const source = readFileSync(
        `src/pages/calculadoras/${slug}.astro`,
        "utf8"
      );
      expect(source).toContain(
        'import CalculatorResultNextActions from "@/components/CalculatorResultNextActions.astro"'
      );
      expect(source).toContain("<CalculatorResultNextActions");
      expect(source).toContain(`calculatorSlug="${slug}"`);
    }
  });

  it("all 6 calculator pages call showCalculatorNextActions after result", () => {
    for (const slug of calculatorPages) {
      const source = readFileSync(
        `src/pages/calculadoras/${slug}.astro`,
        "utf8"
      );
      expect(source).toContain("showCalculatorNextActions?.()");
    }
  });

  it("all 6 calculator pages fire calculator_completed with only calculator_slug", () => {
    for (const slug of calculatorPages) {
      const source = readFileSync(
        `src/pages/calculadoras/${slug}.astro`,
        "utf8"
      );
      expect(source).toContain('"calculator_completed"');
      expect(source).toContain(`calculator_slug: "${slug}"`);
    }
  });

  it("all 6 calculator pages still fire the original calculator_complete event", () => {
    for (const slug of calculatorPages) {
      const source = readFileSync(
        `src/pages/calculadoras/${slug}.astro`,
        "utf8"
      );
      expect(source).toContain('"calculator_complete"');
    }
  });

  it("calculator_result_action_click event payload contains no PII field names", () => {
    const source = readFileSync(
      "src/components/CalculatorResultNextActions.astro",
      "utf8"
    );
    const eventCallMatch = source.match(
      /calculator_result_action_click[\s\S]*?}\s*\)/
    );
    expect(eventCallMatch).not.toBeNull();
    const eventBlock = eventCallMatch![0];
    expect(eventBlock).not.toContain("salary");
    expect(eventBlock).not.toContain("sueldo");
    expect(eventBlock).not.toContain("deuda");
    expect(eventBlock).not.toContain("monto");
    expect(eventBlock).not.toContain("user_id");
    expect(eventBlock).not.toContain("userId");
  });

  it("all analytics attributes use data-analytics-location calculator_result_next_actions", () => {
    const source = readFileSync(
      "src/components/CalculatorResultNextActions.astro",
      "utf8"
    );
    expect(source).toContain('data-analytics-location="calculator_result_next_actions"');
    expect(source).toContain('data-analytics-cta="result-next-action"');
    expect(source).not.toContain("user_id");
    expect(source).not.toContain("userId");
  });
});

describe("Wave 3 structural guards", () => {
  it("glossaryAllowlist has exactly 11 terms", () => {
    const source = readFileSync("src/utils/glossaryAllowlist.ts", "utf8");
    const termMatches = source.match(/\bterm:\s*"/g) ?? [];
    expect(termMatches.length).toBe(11);
  });

  it("GlossaryInlineLink component exists with required analytics attributes", () => {
    const source = readFileSync(
      "src/components/GlossaryInlineLink.astro",
      "utf8"
    );
    expect(source).toContain('data-analytics-cta="glossary-inline-link"');
    expect(source).toContain('data-analytics-location="article_body"');
    expect(source).toContain("data-analytics-label");
  });

  it("GlossaryInlineLink component contains no PII field references", () => {
    const source = readFileSync(
      "src/components/GlossaryInlineLink.astro",
      "utf8"
    );
    expect(source).not.toContain("salary");
    expect(source).not.toContain("sueldo");
    expect(source).not.toContain("user_id");
    expect(source).not.toContain("userId");
    expect(source).not.toContain("email");
    expect(source).not.toContain("rut");
  });

  it("PostDetails.astro imports and uses GlossaryContentWrapper", () => {
    const source = readFileSync("src/layouts/PostDetails.astro", "utf8");
    expect(source).toContain(
      'import GlossaryContentWrapper from "@/components/GlossaryContentWrapper.astro"'
    );
    expect(source).toContain("<GlossaryContentWrapper>");
  });

  it("injectGlossaryLinks utility has no imports from domain or application layers", () => {
    const source = readFileSync(
      "src/utils/injectGlossaryLinks.ts",
      "utf8"
    );
    expect(source).not.toContain("@/domain/");
    expect(source).not.toContain("@/application/");
  });
});

describe("Wave 4 structural guards", () => {
  const hubSlugs = [
    "sueldo-remuneraciones",
    "deuda-credito",
    "empleo-ingresos",
    "impuestos-personas",
    "pensiones-afp",
  ];

  it("hubPillarConfig.ts exists and has no domain or application imports", () => {
    expect(existsSync("src/config/hubPillarConfig.ts")).toBe(true);

    const source = readFileSync("src/config/hubPillarConfig.ts", "utf8");
    expect(source).not.toContain("@/domain/");
    expect(source).not.toContain("@/application/");
  });

  it("all 5 hub pages carry data-hub-section=recommended-route marker", () => {
    for (const slug of hubSlugs) {
      const source = readFileSync(`src/pages/guias/${slug}/index.astro`, "utf8");
      expect(source).toContain('data-hub-section="recommended-route"');
    }
  });

  it("all 5 hub pages carry data-hub-section=related-calculators marker", () => {
    for (const slug of hubSlugs) {
      const source = readFileSync(`src/pages/guias/${slug}/index.astro`, "utf8");
      expect(source).toContain('data-hub-section="related-calculators"');
    }
  });
});

describe("Wave 5 structural guards", () => {
  const artifactSlugs = [
    "contribuciones-bienes-raices",
    "fondo-emergencia",
    "gratificacion-legal",
    "igc",
    "operacion-renta-centro",
    "pgu",
    "sueldo-imponible",
  ];

  it("operacion-renta-centro has 01-artifact.md with Status: PUBLISHED", () => {
    const artifactPath = "docs/editorial/artifacts/operacion-renta-centro/01-artifact.md";
    expect(existsSync(artifactPath)).toBe(true);
    const content = readFileSync(artifactPath, "utf8");
    expect(content).toContain("Status: PUBLISHED");
  });

  it("all artifact folders contain 07-publish-packet.md with status signed off or approved", () => {
    for (const slug of artifactSlugs) {
      const packetPath = `docs/editorial/artifacts/${slug}/07-publish-packet.md`;
      expect(existsSync(packetPath)).toBe(true);

      const content = readFileSync(packetPath, "utf8");
      if (slug === "operacion-renta-centro") {
        expect(content).toContain("Status: APPROVED");
      } else {
        expect(content).toContain("Status: SIGNED OFF");
      }
    }
  });

  it("no .astro or .ts source files exist in artifact folders", () => {
    for (const slug of artifactSlugs) {
      const folderPath = `docs/editorial/artifacts/${slug}`;
      const files = readdirSync(folderPath);
      for (const file of files) {
        expect(file).not.toMatch(/\.(astro|ts)$/);
      }
    }
  });
});

describe("Phase 3 structural guards", () => {
  const artifactDir = "docs/editorial/artifacts/operacion-renta-centro";

  it("artifact folder contains 02-research.md with Status: DRAFT", () => {
    const path = `${artifactDir}/02-research.md`;
    expect(existsSync(path)).toBe(true);

    const content = readFileSync(path, "utf8");
    expect(content).toContain("Status: DRAFT");
  });

  it("artifact folder contains 03-outline.md with Status: DRAFT", () => {
    const path = `${artifactDir}/03-outline.md`;
    expect(existsSync(path)).toBe(true);

    const content = readFileSync(path, "utf8");
    expect(content).toContain("Status: DRAFT");
  });

  it("artifact folder contains 04-draft.md with Status: DRAFT", () => {
    const path = `${artifactDir}/04-draft.md`;
    expect(existsSync(path)).toBe(true);

    const content = readFileSync(path, "utf8");
    expect(content).toContain("Status: DRAFT");
  });

  it("artifact folder contains 05-math-audit.md with Status: REMEDIATED", () => {
    const path = `${artifactDir}/05-math-audit.md`;
    expect(existsSync(path)).toBe(true);

    const content = readFileSync(path, "utf8");
    expect(content).toContain("Status: REMEDIATED");
  });

  it("artifact folder contains 06-compliance.md with Status: CONDITIONAL PASS", () => {
    const path = `${artifactDir}/06-compliance.md`;
    expect(existsSync(path)).toBe(true);

    const content = readFileSync(path, "utf8");
    expect(content).toContain("Status: CONDITIONAL PASS");
  });

  it("07-publish-packet.md status remains APPROVED — listo para publicar", () => {
    const path = `${artifactDir}/07-publish-packet.md`;
    expect(existsSync(path)).toBe(true);

    const content = readFileSync(path, "utf8");
    expect(content).toContain("Status: APPROVED");
    expect(content).toContain("human sign-off");
  });

  it("no .astro or .ts source files exist in the operacion-renta-centro artifact folder", () => {
    const files = readdirSync(artifactDir);
    for (const file of files) {
      expect(file).not.toMatch(/\.(astro|ts)$/);
    }
  });
});
