import { describe, expect, it } from "vitest";

import {
  buildOpportunityReport,
  calculatorFunnelCandidates,
  cannibalizationCandidates,
  competitorGapCandidates,
  contentGapCandidates,
  ctrGapCandidates,
  decayCandidates,
  expectedCtrForPosition,
  nMinFor,
  renderOpportunityMarkdown,
  serpFeatureRiskCandidates,
  strikingDistanceCandidates,
} from "../../scripts/lib/growth-opportunities.mjs";

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
