import { describe, expect, it } from "vitest";

import {
  applyFeedback,
  buildOpportunityReport,
  calculatorFunnelCandidates,
  cannibalizationCandidates,
  competitorGapCandidates,
  competitorSitemapGapCandidates,
  contentGapCandidates,
  crossEngineQueryCandidates,
  ctrGapCandidates,
  decayCandidates,
  expectedCtrForPosition,
  nMinFor,
  renderOpportunityMarkdown,
  serpFeatureRiskCandidates,
  strikingDistanceCandidates,
  tokenize,
  tokensFromQueries,
} from "../../scripts/lib/growth-opportunities.mjs";
import {
  buildCompetitorPages,
  isSitemapIndex,
  resolveSitemapUrl,
} from "../../scripts/collect-competitor-sitemaps.mjs";
import { mergeExternalIntelligence } from "../../scripts/lib/external-intelligence.mjs";
import {
  normalizeBingQueryRows,
  parseEnvFile,
  pickSite,
} from "../../scripts/collect-bing-queries.mjs";

const BANDS = [
  [3, 0.08],
  [5, 0.05],
  [10, 0.025],
  [15, 0.012],
];

const REGISTRY = {
  phase: "report-only",
  policy: "docs/operations/GROWTH-ENGINE.md",
  maxCandidates: 20,
  expectedCtrBands: BANDS,
  detectors: {
    striking_distance_query: {
      enabled: true,
      tier: "A2",
      minPosition: 5,
      maxPosition: 15,
      minImpressions: 100,
      minCtrDeltaPp: 0.3,
      decisionP: 0.025,
      windowDays: 28,
    },
    ctr_gap_page: {
      enabled: true,
      tier: "A2",
      maxPosition: 10,
      minImpressions: 500,
      ctrFactor: 0.5,
      decisionP: 0.025,
      windowDays: 28,
    },
    decay_page: {
      enabled: true,
      tier: "A2",
      minImpressions: 200,
      minClicks: 10,
      maxClicksDrop: 0.25,
      maxImpressionsDelta: 0.15,
      decisionP: 0.2,
      windowDays: 14,
    },
    cannibalization_query: {
      enabled: true,
      tier: "A3",
      minImpressionsPerPage: 50,
      minPages: 2,
      decisionP: 0.05,
      windowDays: 28,
    },
    calculator_funnel: {
      enabled: true,
      tier: "A3",
      minViews: 100,
      minStartRate: 0.5,
      minCompleteRate: 0.9,
      decisionP: 0.05,
      windowDays: 14,
    },
    content_gap_query: {
      enabled: true,
      tier: "A3",
      minVolume: 300,
      maxDifficulty: 60,
      decisionP: 0.05,
      windowDays: 28,
    },
    competitor_gap_query: {
      enabled: true,
      tier: "A3",
      minVolume: 200,
      maxDifficulty: 65,
      maxOurPosition: 8,
      maxCompetitorPosition: 3,
      decisionP: 0.05,
      windowDays: 28,
    },
    serp_feature_risk: {
      enabled: true,
      tier: "A0",
      minVolume: 200,
      maxCtr: 0.02,
      decisionP: 0.05,
      windowDays: 28,
    },
  },
};

describe("nMinFor", () => {
  it("calcula el mínimo con 95% de confianza", () => {
    expect(nMinFor(0.025)).toBe(119);
    expect(nMinFor(0.05)).toBe(59);
    expect(() => nMinFor(0)).toThrow();
  });
});

describe("expectedCtrForPosition", () => {
  it("interpola por bandas y satura en la última", () => {
    expect(expectedCtrForPosition(2, BANDS)).toBe(0.08);
    expect(expectedCtrForPosition(4, BANDS)).toBe(0.05);
    expect(expectedCtrForPosition(8, BANDS)).toBe(0.025);
    expect(expectedCtrForPosition(12, BANDS)).toBe(0.012);
    expect(expectedCtrForPosition(40, BANDS)).toBe(0.012);
  });
});

describe("strikingDistanceCandidates", () => {
  it("detecta query en banda con CTR bajo la curva y calcula ganancia", () => {
    const candidates = strikingDistanceCandidates(
      [
        {
          query: "utm hoy",
          page: "https://monedario.cl/calculadoras/conversor-utm/",
          impressions: 1000,
          clicks: 5,
          ctr: 0.005,
          position: 7,
        },
      ],
      REGISTRY.detectors.striking_distance_query,
      BANDS
    );
    expect(candidates).toHaveLength(1);
    const [candidate] = candidates;
    expect(candidate.type).toBe("striking_distance_query");
    expect(candidate.url).toBe("/calculadoras/conversor-utm/");
    expect(candidate.expectedGainClicks).toBe(20);
    expect(candidate.experiment.nMin).toBe(119);
  });

  it("descarta queries que ya rinden sobre la curva", () => {
    const candidates = strikingDistanceCandidates(
      [
        {
          query: "sueldo liquido",
          page: "https://monedario.cl/calculadoras/sueldo-liquido/",
          impressions: 1000,
          clicks: 100,
          ctr: 0.1,
          position: 7,
        },
      ],
      REGISTRY.detectors.striking_distance_query,
      BANDS
    );
    expect(candidates).toHaveLength(0);
  });
});

describe("ctrGapCandidates", () => {
  it("detecta página top-10 con CTR bajo la mitad de lo esperado", () => {
    const candidates = ctrGapCandidates(
      [
        {
          page: "https://monedario.cl/posts/x/",
          impressions: 2000,
          clicks: 20,
          ctr: 0.01,
          position: 5,
        },
      ],
      REGISTRY.detectors.ctr_gap_page,
      BANDS
    );
    expect(candidates).toHaveLength(1);
    expect(candidates[0].expectedGainClicks).toBe(80);
  });
});

describe("decayCandidates", () => {
  const current = [
    {
      page: "https://monedario.cl/posts/x/",
      impressions: 500,
      clicks: 60,
      ctr: 0.12,
      position: 8,
    },
    {
      page: "https://monedario.cl/posts/y/",
      impressions: 800,
      clicks: 40,
      ctr: 0.05,
      position: 9,
    },
  ];
  const previous = [
    { page: "https://monedario.cl/posts/x/", impressions: 500, clicks: 100 },
    { page: "https://monedario.cl/posts/y/", impressions: 300, clicks: 80 },
  ];

  it("detecta caída de clics con impresiones estables", () => {
    const candidates = decayCandidates(
      current,
      previous,
      REGISTRY.detectors.decay_page
    );
    expect(candidates).toHaveLength(1);
    expect(candidates[0].url).toBe("/posts/x/");
    expect(candidates[0].score).toBe(40);
  });

  it("descarta caída explicada por caída de impresiones", () => {
    const candidates = decayCandidates(
      current,
      previous,
      REGISTRY.detectors.decay_page
    );
    expect(candidates.map(c => c.url)).not.toContain("/posts/y/");
  });
});

describe("cannibalizationCandidates", () => {
  it("agrupa queries con varias URLs propias", () => {
    const candidates = cannibalizationCandidates(
      [
        {
          query: "dicom",
          page: "https://monedario.cl/posts/a/",
          impressions: 100,
          clicks: 5,
          ctr: 0.05,
          position: 8,
        },
        {
          query: "dicom",
          page: "https://monedario.cl/posts/b/",
          impressions: 60,
          clicks: 2,
          ctr: 0.03,
          position: 12,
        },
        {
          query: "dicom",
          page: "https://monedario.cl/posts/c/",
          impressions: 5,
          clicks: 0,
          ctr: 0,
          position: 20,
        },
      ],
      REGISTRY.detectors.cannibalization_query
    );
    expect(candidates).toHaveLength(1);
    expect(candidates[0].metrics.urlCount).toBe(2);
    expect(candidates[0].score).toBe(60);
  });
});

describe("calculatorFunnelCandidates", () => {
  it("detecta tasas bajo umbral en inicio y completitud", () => {
    const candidates = calculatorFunnelCandidates(
      [
        { event_name: "calculator_view", calculator_id: "sueldo-liquido", count: 200 },
        { event_name: "calculator_start", calculator_id: "sueldo-liquido", count: 80 },
        { event_name: "calculator_complete", calculator_id: "sueldo-liquido", count: 70 },
        { event_name: "calculator_view", calculator_id: "otra", count: 10 },
      ],
      REGISTRY.detectors.calculator_funnel
    );
    expect(candidates.map(c => c.metrics.stage).sort()).toEqual([
      "complete",
      "start",
    ]);
  });

  it("ignora calculadoras sin muestra suficiente", () => {
    const candidates = calculatorFunnelCandidates(
      [
        { event_name: "calculator_view", calculator_id: "chica", count: 10 },
        { event_name: "calculator_start", calculator_id: "chica", count: 1 },
      ],
      REGISTRY.detectors.calculator_funnel
    );
    expect(candidates).toHaveLength(0);
  });
});

describe("detectores externos", () => {
  it("content gap prioriza volumen y dificultad", () => {
    const candidates = contentGapCandidates(
      {
        keywordGaps: [
          { query: "multa patente", volume: 1000, difficulty: 40 },
          { query: "descartada", volume: 100, difficulty: 10 },
          { query: "muy dura", volume: 900, difficulty: 90 },
        ],
      },
      REGISTRY.detectors.content_gap_query
    );
    expect(candidates).toHaveLength(1);
    expect(candidates[0].score).toBe(600);
  });

  it("competitor gap exige que el competidor esté top-3 y nosotros >8", () => {
    const candidates = competitorGapCandidates(
      {
        competitorGaps: [
          {
            query: "reajuste arriendo",
            volume: 900,
            difficulty: 40,
            ourUrl: "https://monedario.cl/posts/reajuste-arriendo-uf-ipc-chile/",
            ourPosition: 12.5,
            competitor: "competidor.cl",
            competitorPosition: 2,
          },
          {
            query: "ya vamos bien",
            volume: 500,
            difficulty: 30,
            ourPosition: 3,
            competitor: "otro.cl",
            competitorPosition: 2,
          },
        ],
      },
      REGISTRY.detectors.competitor_gap_query
    );
    expect(candidates).toHaveLength(1);
    expect(candidates[0].url).toBe("/posts/reajuste-arriendo-uf-ipc-chile/");
  });

  it("serp feature risk exige AI Overview y CTR bajo", () => {
    const candidates = serpFeatureRiskCandidates(
      {
        serpFeatures: [
          { query: "utm hoy", volume: 800, ourCtr: 0.004, features: ["ai_overview"] },
          { query: "otra", volume: 300, ourCtr: 0.1, features: ["ai_overview"] },
          { query: "sin aio", volume: 300, ourCtr: 0.001, features: [] },
        ],
      },
      REGISTRY.detectors.serp_feature_risk
    );
    expect(candidates).toHaveLength(1);
    expect(candidates[0].tier).toBe("A0");
  });
});

describe("buildOpportunityReport", () => {
  const baseInput = {
    week: "2026-W39",
    window: { from: "2026-09-21", to: "2026-09-27" },
    counts: { pages: 1, queries: 1, queryPage: 1, analytics: 3, external: 0 },
    pages: [
      {
        page: "https://monedario.cl/posts/x/",
        impressions: 2000,
        clicks: 20,
        ctr: 0.01,
        position: 5,
      },
    ],
    queries: [{ query: "utm", impressions: 500 }],
    ourRoutes: ["/calculadoras/conversor-utm/"],
    feedback: null,
    queryPage: [
      {
        query: "utm hoy",
        page: "https://monedario.cl/calculadoras/conversor-utm/",
        impressions: 1000,
        clicks: 5,
        ctr: 0.005,
        position: 7,
      },
    ],
    analytics: [
      { event_name: "calculator_view", calculator_id: "sueldo-liquido", count: 200 },
      { event_name: "calculator_start", calculator_id: "sueldo-liquido", count: 80 },
      { event_name: "calculator_complete", calculator_id: "sueldo-liquido", count: 70 },
    ],
    previousPages: [],
    previousWeekAvailable: false,
    registry: REGISTRY,
  };

  it("marca detectores externos como omitidos sin archivo", () => {
    const report = buildOpportunityReport({
      ...baseInput,
      external: null,
      externalAvailable: false,
    });
    const skipped = report.skipped.map(item => item.detector);
    expect(skipped).toContain("content_gap_query");
    expect(skipped).toContain("serp_feature_risk");
    expect(report.byType.striking_distance_query).toBe(1);
    expect(report.byType.ctr_gap_page).toBe(1);
    expect(report.byType.calculator_funnel).toBe(2);
  });

  it("incluye detectores externos cuando hay datos", () => {
    const report = buildOpportunityReport({
      ...baseInput,
      external: {
        keywordGaps: [{ query: "multa patente", volume: 1000, difficulty: 40 }],
        competitorGaps: [],
        serpFeatures: [
          { query: "utm hoy", volume: 800, ourCtr: 0.004, features: ["ai_overview"] },
        ],
      },
      externalAvailable: true,
    });
    expect(report.byType.content_gap_query).toBe(1);
    expect(report.byType.serp_feature_risk).toBe(1);
  });

  it("renderiza markdown con encabezado y fase report-only", () => {
    const report = buildOpportunityReport({
      ...baseInput,
      external: null,
      externalAvailable: false,
    });
    const markdown = renderOpportunityMarkdown(report);
    expect(markdown).toContain("# Growth opportunities — 2026-W39");
    expect(markdown).toContain("report-only");
    expect(markdown).toContain("striking_distance_query");
  });
});

describe("tokenize y tokensFromQueries", () => {
  it("normaliza, quita stopwords y descarta números", () => {
    expect(tokenize("Valor UTM hoy para tu sueldo 2026")).toEqual([
      "valor",
      "utm",
      "hoy",
      "sueldo",
    ]);
    expect(tokenize("guía de trámites")).toEqual(["tramites"]);
  });

  it("construye vocabulario desde las queries con más impresiones", () => {
    const tokens = tokensFromQueries([
      { query: "utm hoy", impressions: 100 },
      { query: "valor uf", impressions: 500 },
    ]);
    for (const token of ["utm", "hoy", "valor", "uf"]) {
      expect(tokens.has(token)).toBe(true);
    }
  });
});

describe("competitorSitemapGapCandidates", () => {
  const config = {
    tier: "A0",
    minDistinctiveTokens: 2,
    decisionP: 0.05,
    windowDays: 28,
  };
  const ourTokens = new Set(["valor", "utm", "sueldo", "uf", "afp"]);

  it("descarta páginas con tokens compartidos con nuestras queries", () => {
    const candidates = competitorSitemapGapCandidates(
      {
        competitorPages: [
          { domain: "valor-utm.cl", url: "https://valor-utm.cl/valor-utm-hoy" },
        ],
      },
      ourTokens,
      config
    );
    expect(candidates).toHaveLength(0);
  });

  it("detecta un gap de cobertura sin tokens compartidos", () => {
    const candidates = competitorSitemapGapCandidates(
      {
        competitorPages: [
          { domain: "x.cl", url: "https://x.cl/guia-multas-municipales-2026" },
        ],
      },
      ourTokens,
      config
    );
    expect(candidates).toHaveLength(1);
    expect(candidates[0].type).toBe("competitor_sitemap_gap");
    expect(candidates[0].tier).toBe("A0");
    expect(candidates[0].url).toBe("/guia-multas-municipales-2026");
  });

  it("respeta minDistinctiveTokens y deduplica", () => {
    const candidates = competitorSitemapGapCandidates(
      {
        competitorPages: [
          { domain: "x.cl", url: "https://x.cl/abc/" },
          { domain: "x.cl", url: "https://x.cl/multas-municipales/" },
          { domain: "x.cl", url: "https://x.cl/multas-municipales/" },
        ],
      },
      ourTokens,
      config
    );
    expect(candidates).toHaveLength(1);
  });

  it("sin vocabulario propio no emite candidatos", () => {
    const candidates = competitorSitemapGapCandidates(
      {
        competitorPages: [
          { domain: "x.cl", url: "https://x.cl/multas-municipales/" },
        ],
      },
      new Set(),
      config
    );
    expect(candidates).toHaveLength(0);
  });

  it("ignora secciones de prensa/contacto y rutas con mes", () => {
    const candidates = competitorSitemapGapCandidates(
      {
        competitorPages: [
          { domain: "x.cl", url: "https://x.cl/medios/nota-especial" },
          { domain: "x.cl", url: "https://x.cl/vision-febrero-mercados" },
          { domain: "x.cl", url: "https://x.cl/contacto" },
        ],
      },
      ourTokens,
      config
    );
    expect(candidates).toHaveLength(0);
  });
});

describe("collect-competitor-sitemaps helpers", () => {
  it("resuelve la URL del sitemap con fallback", () => {
    expect(resolveSitemapUrl({ domain: "x.cl" })).toBe(
      "https://x.cl/sitemap.xml"
    );
    expect(
      resolveSitemapUrl({ domain: "x.cl", sitemapUrl: "https://x.cl/map.xml" })
    ).toBe("https://x.cl/map.xml");
  });

  it("detecta sitemap index", () => {
    expect(
      isSitemapIndex(
        "<sitemapindex><sitemap><loc>https://x.cl/a.xml</loc></sitemap></sitemapindex>"
      )
    ).toBe(true);
    expect(
      isSitemapIndex("<urlset><url><loc>https://x.cl/a</loc></url></urlset>")
    ).toBe(false);
  });

  it("construye páginas filtrando sitemaps y deduplicando con tope", () => {
    const pages = buildCompetitorPages(
      [
        "https://x.cl/a/",
        "https://x.cl/a/",
        "https://x.cl/sitemap-2.xml",
        "not-a-url",
        "https://x.cl/b/",
      ],
      "x.cl",
      1
    );
    expect(pages).toEqual([{ domain: "x.cl", url: "https://x.cl/a/" }]);
  });

  it("mezcla preservando las listas de proveedor", () => {
    const merged = mergeExternalIntelligence(
      { source: "semrush", keywordGaps: [{ query: "x" }] },
      {
        source: "free",
        week: "2026-W39",
        competitorPages: [{ domain: "x.cl", url: "https://x.cl/a" }],
        freeSources: ["competitor-sitemaps"],
      }
    );
    expect(merged.source).toBe("semrush");
    expect(merged.keywordGaps).toEqual([{ query: "x" }]);
    expect(merged.freeSources).toContain("competitor-sitemaps");
    expect(merged.competitorPages).toHaveLength(1);
  });

  it("acumula freeSources de ambas fuentes libres", () => {
    const merged = mergeExternalIntelligence(
      { source: "free", freeSources: ["competitor-sitemaps"] },
      {
        source: "free",
        engineQueries: [{ engine: "bing", query: "x" }],
        freeSources: ["bing-webmaster"],
      }
    );
    expect(merged.freeSources.sort()).toEqual([
      "bing-webmaster",
      "competitor-sitemaps",
    ]);
    expect(merged.engineQueries).toHaveLength(1);
  });
});

describe("applyFeedback", () => {
  const candidates = [
    { id: "ctr_gap_page:x", type: "ctr_gap_page", url: "/x/" },
    {
      id: "competitor_sitemap_gap:patrimore.com|/blog/nota",
      type: "competitor_sitemap_gap",
      url: "/blog/nota",
      metrics: { domain: "patrimore.com" },
    },
    {
      id: "competitor_sitemap_gap:uf-hoy.com|/arriendos",
      type: "competitor_sitemap_gap",
      url: "/arriendos",
      metrics: { domain: "uf-hoy.com" },
    },
  ];

  it("suprime por ID exacto", () => {
    const { candidates: kept, suppressed } = applyFeedback(candidates, {
      dismissed: ["ctr_gap_page:x"],
    });
    expect(kept.map(candidate => candidate.id)).not.toContain("ctr_gap_page:x");
    expect(suppressed).toEqual([{ id: "ctr_gap_page:x", reason: "dismissed" }]);
  });

  it("suprime por patrón de dominio y ruta", () => {
    const { candidates: kept } = applyFeedback(candidates, {
      dismissedPatterns: [
        { domain: "patrimore.com", pathPattern: "^/blog/", reason: "PR" },
      ],
    });
    expect(kept.map(candidate => candidate.id)).toContain(
      "competitor_sitemap_gap:uf-hoy.com|/arriendos"
    );
    expect(kept).toHaveLength(2);
  });

  it("ignora regex inválidas sin romper", () => {
    const { candidates: kept } = applyFeedback(candidates, {
      dismissedPatterns: [{ domain: null, pathPattern: "[" }],
    });
    expect(kept).toHaveLength(3);
  });

  it("sin feedback no suprime nada", () => {
    const { candidates: kept, suppressed } = applyFeedback(candidates, null);
    expect(kept).toHaveLength(3);
    expect(suppressed).toHaveLength(0);
  });

  it("el reporte cuenta las supresiones", () => {
    const report = buildOpportunityReport({
      week: "2026-W39",
      window: { from: "2026-09-21", to: "2026-09-27" },
      counts: { pages: 1, queries: 1, queryPage: 0, analytics: 0, external: 0 },
      pages: [
        {
          page: "https://monedario.cl/posts/x/",
          impressions: 2000,
          clicks: 20,
          ctr: 0.01,
          position: 5,
        },
      ],
      queries: [{ query: "utm", impressions: 500 }],
      queryPage: [],
      analytics: [],
      previousPages: [],
      previousWeekAvailable: false,
      external: null,
      externalAvailable: false,
      ourRoutes: [],
      feedback: { dismissed: ["ctr_gap_page:https://monedario.cl/posts/x/"] },
      registry: REGISTRY,
    });
    expect(report.feedback.suppressed).toBe(1);
    expect(report.byType.ctr_gap_page).toBeUndefined();
  });
});

describe("Bing collector helpers", () => {
  it("parsea .env sin exigir dependencias", () => {
    const env = parseEnvFile(
      '# comentario\nBING_WEBMASTER_API_KEY="abc123"\nOTRA=sin-comillas\n'
    );
    expect(env.BING_WEBMASTER_API_KEY).toBe("abc123");
    expect(env.OTRA).toBe("sin-comillas");
  });

  it("elige el sitio verificado por hostname, ignorando www", () => {
    const sites = [
      { Url: "https://otro.cl/", IsVerified: true },
      { Url: "https://monedario.cl/", IsVerified: true },
      { Url: "https://no-verificado.cl/", IsVerified: false },
    ];
    expect(pickSite(sites, "https://monedario.cl/")).toBe(
      "https://monedario.cl/"
    );
    expect(pickSite(sites, "https://www.monedario.cl/")).toBe(
      "https://monedario.cl/"
    );
    expect(pickSite([])).toBeNull();
  });

  it("normaliza filas de Bing y descarta impresiones cero", () => {
    const rows = normalizeBingQueryRows({
      d: [
        {
          Query: "utm hoy",
          Clicks: 2,
          Impressions: 10,
          AvgImpressionPosition: 5,
          AvgClickPosition: -1,
        },
        {
          Query: "sin datos",
          Clicks: 0,
          Impressions: 0,
          AvgImpressionPosition: 3,
          AvgClickPosition: -1,
        },
        {
          Query: "pos click",
          Clicks: 1,
          Impressions: 2,
          AvgImpressionPosition: -1,
          AvgClickPosition: 7,
        },
      ],
    });
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      query: "utm hoy",
      impressions: 10,
      ctr: 0.2,
      position: 5,
    });
    expect(rows[1]).toMatchObject({ query: "pos click", position: 7 });
  });
});

describe("crossEngineQueryCandidates", () => {
  const config = {
    tier: "A0",
    minImpressions: 10,
    maxPosition: 15,
    decisionP: 0.05,
    windowDays: 28,
  };
  const external = {
    engineQueries: [
      {
        engine: "bing",
        query: "consulta nueva",
        impressions: 40,
        clicks: 0,
        ctr: 0,
        position: 6,
      },
      {
        engine: "bing",
        query: "ya en gsc",
        impressions: 50,
        clicks: 1,
        ctr: 0.02,
        position: 4,
      },
      {
        engine: "bing",
        query: "poca muestra",
        impressions: 3,
        clicks: 0,
        ctr: 0,
        position: 2,
      },
      {
        engine: "bing",
        query: "muy abajo",
        impressions: 30,
        clicks: 0,
        ctr: 0,
        position: 40,
      },
    ],
  };
  const gsc = [
    { query: "Ya en GSC", impressions: 100, clicks: 5, position: 3 },
  ];

  it("detecta demanda de Bing ausente en GSC", () => {
    const candidates = crossEngineQueryCandidates(external, gsc, config);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].query).toBe("consulta nueva");
    expect(candidates[0].tier).toBe("A0");
  });

  it("considera cubierta una variante con tildes/stopwords", () => {
    const candidates = crossEngineQueryCandidates(
      {
        engineQueries: [
          {
            engine: "bing",
            query: "seguro de cesantía",
            impressions: 100,
            clicks: 0,
            ctr: 0,
            position: 5,
          },
        ],
      },
      [{ query: "seguro de cesantia requisitos", impressions: 200 }],
      config
    );
    expect(candidates).toHaveLength(0);
  });

  it("deduplica variantes por firma de tokens", () => {
    const candidates = crossEngineQueryCandidates(
      {
        engineQueries: [
          {
            engine: "bing",
            query: "seguro de cesantía",
            impressions: 100,
            clicks: 0,
            ctr: 0,
            position: 5,
          },
          {
            engine: "bing",
            query: "seguro de cesantia",
            impressions: 80,
            clicks: 0,
            ctr: 0,
            position: 6,
          },
        ],
      },
      [],
      config
    );
    expect(candidates).toHaveLength(1);
    expect(candidates[0].score).toBe(100);
  });

  it("sin engineQueries no emite candidatos", () => {
    expect(crossEngineQueryCandidates({}, gsc, config)).toHaveLength(0);
  });
});
