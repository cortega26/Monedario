/**
 * growth-opportunities
 *
 * Detectores puros (sin I/O) del Growth Engine Fase 0. Convierten filas GSC y
 * eventos first-party ya normalizados en candidatos priorizados con hipótesis
 * y experimento recomendado. No ejecutan cambios: la Fase 0 es report-only.
 *
 * Reutiliza los helpers de `scripts/data-signals/gsc-utils.mjs` para striking
 * distance y canibalización, de modo que el scorecard semanal y este motor
 * compartan criterios.
 */

import {
  findCannibalizationGroups,
  findStrikingDistance,
} from "../data-signals/gsc-utils.mjs";

export const CALCULATOR_EVENTS = {
  view: "calculator_view",
  start: "calculator_start",
  complete: "calculator_complete",
};

/** Mínimo n para descartar un umbral p con 95% de confianza. */
export function nMinFor(p) {
  if (!(p > 0 && p < 1)) {
    throw new Error(`nMinFor: p debe estar en (0,1), recibido ${p}`);
  }
  return Math.ceil(Math.log(0.05) / Math.log(1 - p));
}

/** CTR esperado por posición según bandas [[maxPosition, ctr], ...]. */
export function expectedCtrForPosition(position, bands) {
  for (const [maxPosition, ctr] of bands) {
    if (position <= maxPosition) return ctr;
  }
  return bands[bands.length - 1][1];
}

export function pathFromUrl(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

/** Palabras vacías ES + tokens genéricos de sección/ruta. */
export const TOKEN_STOPWORDS = new Set([
  "de",
  "del",
  "la",
  "las",
  "el",
  "los",
  "en",
  "y",
  "o",
  "u",
  "a",
  "al",
  "para",
  "por",
  "con",
  "sin",
  "tu",
  "tus",
  "su",
  "sus",
  "un",
  "una",
  "unos",
  "unas",
  "que",
  "como",
  "mas",
  "más",
  "es",
  "son",
  "se",
  "lo",
  "te",
  "mi",
  "mis",
  "me",
  "si",
  "no",
  "ni",
  "ya",
  "guia",
  "guias",
  "blog",
  "post",
  "posts",
  "page",
  "pages",
  "index",
  "home",
  "inicio",
  "categoria",
  "categorias",
  "tag",
  "tags",
  "glosario",
  "ley",
  "leyes",
  "calculadora",
  "calculadoras",
  "autor",
  "autores",
  "www",
  "com",
  "cl",
  "es",
  "html",
  "php",
  "chile",
  "chileno",
  "chilena",
  "chilenos",
  "chilenas",
]);

/** Tokens cortos con significado propio en finanzas chilenas. */
export const SHORT_MEANINGFUL_TOKENS = new Set([
  "uf",
  "utm",
  "afp",
  "apv",
  "pgu",
  "ipc",
  "iva",
  "dap",
  "cae",
  "uta",
  "ing",
]);

function stripAccents(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

/** Convierte una ruta o query en tokens normalizados (minúsculas, sin stopwords). */
export function tokenize(value) {
  return stripAccents(String(value ?? ""))
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .filter(token => {
      if (/^\d+$/.test(token)) return false;
      if (TOKEN_STOPWORDS.has(token)) return false;
      if (token.length >= 3) return true;
      return SHORT_MEANINGFUL_TOKENS.has(token);
    });
}

/**
 * Construye el vocabulario propio (tokens) desde las queries GSC con más
 * impresiones. Es la señal libre que sustituye al volumen externo: si un
 * competidor publica una página cuyos tokens no aparecen en ninguna query
 * nuestra, es candidata a gap de cobertura.
 */
export function tokensFromQueries(queries, maxRows = 500) {
  const rows = [...(queries ?? [])]
    .filter(row => typeof row.query === "string")
    .sort((a, b) => (b.impressions ?? 0) - (a.impressions ?? 0))
    .slice(0, maxRows);
  const tokens = new Set();
  for (const row of rows) {
    for (const token of tokenize(row.query)) tokens.add(token);
  }
  return tokens;
}

export function competitorSitemapGapCandidates(external, ourTokens, config) {
  const pages = external?.competitorPages ?? [];
  if (!(ourTokens instanceof Set) || ourTokens.size === 0) return [];

  const ignoredSection =
    /(^|\/)(medios|noticias|prensa|news|eventos|contacto|equipo|nosotros|legal|privacidad|terminos|cookies|vision-semanal|analisis-de-mercado)(\/|$)/i;
  const monthName =
    /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i;

  const seen = new Set();
  const out = [];
  for (const page of pages) {
    if (!page?.url) continue;
    let pathname;
    let domain;
    try {
      const parsed = new URL(page.url);
      pathname = parsed.pathname;
      domain = page.domain ?? parsed.hostname;
    } catch {
      continue;
    }
    if (pathname === "/" || pathname === "") continue;
    if (ignoredSection.test(pathname) || monthName.test(pathname)) continue;

    const tokens = tokenize(pathname);
    const distinctive = tokens.filter(token => token.length >= 4);
    if (distinctive.length < (config.minDistinctiveTokens ?? 2)) continue;
    if (tokens.some(token => ourTokens.has(token))) continue;

    const key = `${domain}|${pathname}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const score = Math.min(distinctive.length, 6);
    out.push({
      id: `competitor_sitemap_gap:${key}`,
      type: "competitor_sitemap_gap",
      tier: config.tier,
      url: pathname,
      metrics: {
        domain,
        distinctiveTokens: distinctive.slice(0, 6).join(", "),
      },
      expectedGainClicks: 0,
      score,
      hypothesis: `${domain} publica ${pathname} sin tokens compartidos con nuestras queries GSC; evaluar cobertura con criterio editorial (fuente libre: sin volumen ni dificultad).`,
      experiment: {
        metric: "coverage_decision",
        threshold: "decisión editorial: cubrir, enlazar o descartar (sin volumen)",
        nMin: nMinFor(config.decisionP),
        windowDays: config.windowDays,
        rollback: "no aplica (observación)",
      },
    });
  }

  return out.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function formatCtr(ctr) {
  return `${(ctr * 100).toFixed(2)}%`;
}

function rowCtr(row) {
  if (typeof row.ctr === "number") return row.ctr;
  const impressions = row.impressions ?? 0;
  return impressions > 0 ? (row.clicks ?? 0) / impressions : 0;
}

export function strikingDistanceCandidates(queryPageRows, config, bands) {
  const hits = findStrikingDistance(queryPageRows, {
    minPosition: config.minPosition,
    maxPosition: config.maxPosition,
    minImpressions: config.minImpressions,
  });

  return hits
    .map(hit => {
      const ctr = rowCtr(hit);
      const expected = expectedCtrForPosition(hit.position, bands);
      const deltaPp = (expected - ctr) * 100;
      return {
        id: `striking_distance_query:${hit.query}|${hit.page}`,
        type: "striking_distance_query",
        tier: config.tier,
        query: hit.query,
        url: pathFromUrl(hit.page),
        metrics: {
          impressions: hit.impressions,
          clicks: hit.clicks,
          ctr: round(ctr, 4),
          position: round(hit.position, 1),
          expectedCtr: expected,
          ctrDeltaPp: round(deltaPp, 2),
        },
        expectedGainClicks: Math.max(0, Math.round(hit.impressions * (expected - ctr))),
        score: Math.max(0, Math.round(hit.impressions * (expected - ctr))),
        hypothesis: `«${hit.query}» está en posición ${round(hit.position, 1)} con ${hit.impressions} impresiones y CTR ${formatCtr(ctr)}; alinear título/meta con la intención puede subir el CTR sin ganar puestos.`,
        experiment: {
          metric: "ctr_query_page",
          threshold: `CTR ≥ ${formatCtr(expected)}`,
          nMin: nMinFor(config.decisionP),
          windowDays: config.windowDays,
          rollback: "restaurar title/meta previos si el CTR no mejora a la ventana declarada",
        },
      };
    })
    .filter(candidate => candidate.metrics.ctrDeltaPp >= config.minCtrDeltaPp)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function ctrGapCandidates(pageRows, config, bands) {
  const out = [];
  for (const row of pageRows ?? []) {
    const impressions = row.impressions ?? 0;
    const position = row.position;
    if (typeof position !== "number") continue;
    if (position > config.maxPosition || impressions < config.minImpressions) continue;

    const ctr = rowCtr(row);
    const expected = expectedCtrForPosition(position, bands);
    if (ctr >= expected * config.ctrFactor) continue;

    const gain = Math.max(0, Math.round(impressions * (expected - ctr)));
    out.push({
      id: `ctr_gap_page:${row.page}`,
      type: "ctr_gap_page",
      tier: config.tier,
      url: pathFromUrl(row.page),
      metrics: {
        impressions,
        clicks: row.clicks ?? 0,
        ctr: round(ctr, 4),
        position: round(position, 1),
        expectedCtr: expected,
      },
      expectedGainClicks: gain,
      score: gain,
      hypothesis: `${pathFromUrl(row.page)} rankea en posición ${round(position, 1)} con ${impressions} impresiones pero su CTR (${formatCtr(ctr)}) está muy por debajo de lo esperado (${formatCtr(expected)}); revisar snippet antes de tocar contenido (caso F5).`,
      experiment: {
        metric: "ctr_page",
        threshold: `CTR ≥ ${formatCtr(expected * config.ctrFactor)}`,
        nMin: nMinFor(config.decisionP),
        windowDays: config.windowDays,
        rollback: "restaurar el snippet previo si el CTR no mejora a la ventana declarada",
      },
    });
  }
  return out.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function decayCandidates(currentRows, previousRows, config) {
  const previous = new Map((previousRows ?? []).map(row => [row.page, row]));
  const out = [];
  for (const row of currentRows ?? []) {
    const before = previous.get(row.page);
    if (!before) continue;

    const prevImpressions = before.impressions ?? 0;
    const curImpressions = row.impressions ?? 0;
    if (prevImpressions < config.minImpressions || curImpressions < config.minImpressions) {
      continue;
    }
    const prevClicks = before.clicks ?? 0;
    if (prevClicks < config.minClicks) continue;

    const clicks = row.clicks ?? 0;
    const drop = (clicks - prevClicks) / prevClicks;
    if (drop > -config.maxClicksDrop) continue;

    const impressionsDelta = Math.abs(curImpressions - prevImpressions) / prevImpressions;
    if (impressionsDelta > config.maxImpressionsDelta) continue;

    const lost = prevClicks - clicks;
    out.push({
      id: `decay_page:${row.page}`,
      type: "decay_page",
      tier: config.tier,
      url: pathFromUrl(row.page),
      metrics: {
        previousClicks: prevClicks,
        clicks,
        clicksDropPct: round(drop * 100, 1),
        previousImpressions: prevImpressions,
        impressions: curImpressions,
        impressionsDeltaPct: round(impressionsDelta * 100, 1),
        position: typeof row.position === "number" ? round(row.position, 1) : null,
      },
      expectedGainClicks: lost,
      score: lost,
      hypothesis: `${pathFromUrl(row.page)} perdió ${lost} clics contra la semana previa con impresiones estables; revisar frescura, fuentes y vigencia antes de reescribir.`,
      experiment: {
        metric: "clicks_page",
        threshold: `clicks ≥ ${prevClicks}`,
        nMin: nMinFor(config.decisionP),
        windowDays: config.windowDays,
        rollback: "restaurar la versión previa si los clics siguen bajando a la ventana declarada",
      },
    });
  }
  return out.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function cannibalizationCandidates(queryPageRows, config) {
  const groups = findCannibalizationGroups(queryPageRows, {
    minImpressions: config.minImpressionsPerPage,
    minUrls: config.minPages,
  });

  return groups
    .map(group => {
      const [top, ...rest] = group.urls;
      const secondaryImpressions = rest.reduce((sum, url) => sum + url.impressions, 0);
      return {
        id: `cannibalization_query:${group.query}`,
        type: "cannibalization_query",
        tier: config.tier,
        query: group.query,
        metrics: {
          urlCount: group.urlCount,
          totalImpressions: group.totalImpressions,
          topUrl: pathFromUrl(top.page),
          topImpressions: top.impressions,
          secondaryImpressions,
        },
        expectedGainClicks: 0,
        score: secondaryImpressions,
        hypothesis: `«${group.query}» recibe impresiones de ${group.urlCount} URLs propias (${group.urls
          .map(url => pathFromUrl(url.page))
          .join(", ")}); definir owner y consolidar/enlazar para asignar intención.`,
        experiment: {
          metric: "impressions_share_top_url",
          threshold: "≥70% de las impresiones de la query en una sola URL",
          nMin: nMinFor(config.decisionP),
          windowDays: config.windowDays,
          rollback: "no aplica (cambio editorial revisado por humano)",
        },
      };
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function calculatorFunnelCandidates(analyticsRows, config) {
  const byCalculator = new Map();
  for (const row of analyticsRows ?? []) {
    const calculator = row.calculator_id;
    if (!calculator || calculator === "article") continue;
    const stage = Object.entries(CALCULATOR_EVENTS).find(
      ([, eventName]) => eventName === row.event_name
    )?.[0];
    if (!stage) continue;
    const entry = byCalculator.get(calculator) ?? { view: 0, start: 0, complete: 0 };
    entry[stage] += row.count ?? 0;
    byCalculator.set(calculator, entry);
  }

  const out = [];
  for (const [calculator, stage] of byCalculator) {
    if (stage.view < config.minViews) continue;

    const startRate = stage.view > 0 ? stage.start / stage.view : 0;
    if (startRate < config.minStartRate) {
      const lost = stage.view - stage.start;
      out.push({
        id: `calculator_funnel:${calculator}:start`,
        type: "calculator_funnel",
        tier: config.tier,
        calculator,
        metrics: {
          stage: "start",
          view: stage.view,
          start: stage.start,
          startRate: round(startRate, 4),
          threshold: config.minStartRate,
        },
        expectedGainClicks: 0,
        score: lost,
        hypothesis: `${calculator}: solo ${formatCtr(startRate)} de quienes ven la calculadora la inician (n=${stage.view}); revisar propuesta y primer campo del flujo.`,
        experiment: {
          metric: "start_rate",
          threshold: `start/view ≥ ${formatCtr(config.minStartRate)}`,
          nMin: nMinFor(config.decisionP),
          windowDays: config.windowDays,
          rollback: "restaurar el flujo previo si la tasa no mejora a la ventana declarada",
        },
      });
    }

    const completeRate = stage.start > 0 ? stage.complete / stage.start : 0;
    if (stage.start > 0 && completeRate < config.minCompleteRate) {
      const lost = stage.start - stage.complete;
      out.push({
        id: `calculator_funnel:${calculator}:complete`,
        type: "calculator_funnel",
        tier: config.tier,
        calculator,
        metrics: {
          stage: "complete",
          start: stage.start,
          complete: stage.complete,
          completeRate: round(completeRate, 4),
          threshold: config.minCompleteRate,
        },
        expectedGainClicks: 0,
        score: lost,
        hypothesis: `${calculator}: ${formatCtr(completeRate)} de quienes inician completan el cálculo (n=${stage.start}); revisar fricción del formulario y mensajes de error.`,
        experiment: {
          metric: "complete_rate",
          threshold: `complete/start ≥ ${formatCtr(config.minCompleteRate)}`,
          nMin: nMinFor(config.decisionP),
          windowDays: config.windowDays,
          rollback: "restaurar el formulario previo si la tasa no mejora",
        },
      });
    }
  }
  return out.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function contentGapCandidates(external, config) {
  const gaps = external?.keywordGaps ?? [];
  return gaps
    .filter(
      gap =>
        (gap.volume ?? 0) >= config.minVolume &&
        (gap.difficulty ?? 100) <= config.maxDifficulty
    )
    .map(gap => {
      const volume = gap.volume ?? 0;
      const difficulty = gap.difficulty ?? 0;
      const value = volume * (1 - difficulty / 100);
      return {
        id: `content_gap_query:${gap.query}`,
        type: "content_gap_query",
        tier: config.tier,
        query: gap.query,
        metrics: {
          volume,
          difficulty,
          cpc: gap.cpc ?? null,
          competitors: (gap.competitors ?? []).join(", ") || null,
        },
        expectedGainClicks: 0,
        score: Math.round(value),
        hypothesis: `«${gap.query}» tiene volumen ${volume} y dificultad ${difficulty}, y no tenemos URL propia cubriéndola; evaluar pieza o herramienta (sujeto a FOCO ESTRICTO y excepción de URL).`,
        experiment: {
          metric: "clicks_query",
          threshold: "≥1 clic o ≥50 impresiones en 4 semanas post-publicación",
          nMin: nMinFor(config.decisionP),
          windowDays: config.windowDays,
          rollback: "no publicar; la pieza queda en backlog si no pasa el umbral de la excepción",
        },
      };
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function competitorGapCandidates(external, config) {
  const rows = external?.competitorGaps ?? [];
  return rows
    .filter(
      row =>
        (row.volume ?? 0) >= config.minVolume &&
        (row.difficulty ?? 100) <= config.maxDifficulty &&
        (row.ourPosition ?? 0) > config.maxOurPosition &&
        (row.competitorPosition ?? 99) <= config.maxCompetitorPosition
    )
    .map(row => {
      const volume = row.volume ?? 0;
      const ourPosition = row.ourPosition ?? 0;
      const competitorPosition = row.competitorPosition ?? 0;
      const value = volume * ((ourPosition - competitorPosition) / ourPosition);
      return {
        id: `competitor_gap_query:${row.query}`,
        type: "competitor_gap_query",
        tier: config.tier,
        query: row.query,
        url: row.ourUrl ? pathFromUrl(row.ourUrl) : null,
        metrics: {
          volume,
          difficulty: row.difficulty ?? null,
          ourPosition: round(ourPosition, 1),
          competitor: row.competitor ?? null,
          competitorPosition: round(competitorPosition, 1),
        },
        expectedGainClicks: Math.round(value),
        score: Math.round(value),
        hypothesis: `«${row.query}» la gana ${row.competitor} en posición ${round(competitorPosition, 1)} mientras nuestra página está en ${round(ourPosition, 1)}; mejorar la pieza existente (intención, completitud, frescura) antes de crear nada nuevo.`,
        experiment: {
          metric: "position_query",
          threshold: `posición ≤ ${config.maxOurPosition}`,
          nMin: nMinFor(config.decisionP),
          windowDays: config.windowDays,
          rollback: "restaurar la versión previa si la posición no mejora a la ventana declarada",
        },
      };
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function serpFeatureRiskCandidates(external, config) {
  const rows = external?.serpFeatures ?? [];
  return rows
    .filter(
      row =>
        (row.volume ?? 0) >= config.minVolume &&
        Array.isArray(row.features) &&
        row.features.includes("ai_overview") &&
        (row.ourCtr ?? 1) <= config.maxCtr
    )
    .map(row => {
      const volume = row.volume ?? 0;
      const ctr = row.ourCtr ?? 0;
      return {
        id: `serp_feature_risk:${row.query}`,
        type: "serp_feature_risk",
        tier: config.tier,
        query: row.query,
        metrics: {
          volume,
          features: row.features.join(", "),
          ourCtr: round(ctr, 4),
        },
        expectedGainClicks: 0,
        score: volume,
        hypothesis: `«${row.query}» muestra ${row.features.join(", ")} con CTR propio ${formatCtr(ctr)}; señal GEO/zero-click: monitorear y reforzar estructura citable (no perseguir el clic a ciegas).`,
        experiment: {
          metric: "ctr_query",
          threshold: "observacional: sin umbral de acción en Fase 0",
          nMin: nMinFor(config.decisionP),
          windowDays: config.windowDays,
          rollback: "no aplica (observación)",
        },
      };
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function buildOpportunityReport({
  week,
  window,
  counts,
  pages,
  queries,
  queryPage,
  analytics,
  previousPages,
  previousWeekAvailable,
  external,
  externalAvailable,
  ourRoutes,
  registry,
}) {
  const bands = registry.expectedCtrBands;
  const detectors = registry.detectors ?? {};
  const candidates = [];
  const skipped = [];

  const run = (key, fn) => {
    const config = detectors[key];
    if (!config?.enabled) {
      skipped.push({ detector: key, reason: "disabled" });
      return;
    }
    candidates.push(...fn(config));
  };

  run("striking_distance_query", config =>
    strikingDistanceCandidates(queryPage ?? [], config, bands)
  );
  run("ctr_gap_page", config => ctrGapCandidates(pages ?? [], config, bands));
  if (previousWeekAvailable) {
    run("decay_page", config => decayCandidates(pages ?? [], previousPages ?? [], config));
  } else {
    skipped.push({ detector: "decay_page", reason: "previous_week_unavailable" });
  }
  run("cannibalization_query", config =>
    cannibalizationCandidates(queryPage ?? [], config)
  );
  run("calculator_funnel", config =>
    calculatorFunnelCandidates(analytics ?? [], config)
  );

  if (externalAvailable) {
    run("content_gap_query", config =>
      contentGapCandidates(external ?? {}, config)
    );
    run("competitor_gap_query", config =>
      competitorGapCandidates(external ?? {}, config)
    );
    run("serp_feature_risk", config =>
      serpFeatureRiskCandidates(external ?? {}, config)
    );

    const ourTokens = new Set([
      ...tokensFromQueries(queries),
      ...(ourRoutes ?? []).flatMap(route => tokenize(route)),
    ]);
    if (ourTokens.size > 0) {
      run("competitor_sitemap_gap", config =>
        competitorSitemapGapCandidates(external ?? {}, ourTokens, config)
      );
    } else if (detectors.competitor_sitemap_gap?.enabled) {
      skipped.push({
        detector: "competitor_sitemap_gap",
        reason: "no_own_tokens",
      });
    }
  } else {
    for (const key of [
      "content_gap_query",
      "competitor_gap_query",
      "serp_feature_risk",
      "competitor_sitemap_gap",
    ]) {
      if (detectors[key]?.enabled) {
        skipped.push({ detector: key, reason: "external_data_unavailable" });
      }
    }
  }

  const perTypeMax = registry.maxCandidatesPerType ?? 10;
  const byTypeSorted = new Map();
  for (const candidate of candidates.sort(
    (a, b) => b.score - a.score || a.id.localeCompare(b.id)
  )) {
    const list = byTypeSorted.get(candidate.type) ?? [];
    if (list.length < perTypeMax) {
      list.push(candidate);
      byTypeSorted.set(candidate.type, list);
    }
  }
  const sorted = [...byTypeSorted.values()]
    .flat()
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, registry.maxCandidates ?? 60);

  /** @type {Record<string, number>} */
  const byType = {};
  for (const candidate of sorted) {
    byType[candidate.type] = (byType[candidate.type] ?? 0) + 1;
  }

  return {
    schemaVersion: 1,
    phase: registry.phase ?? "report-only",
    policy: registry.policy,
    week,
    window,
    counts,
    previousWeekAvailable,
    candidates: sorted,
    byType,
    skipped,
  };
}

export function renderOpportunityMarkdown(report) {
  const lines = [];
  lines.push(`# Growth opportunities — ${report.week} (${report.phase})`);
  lines.push("");
  lines.push(`- Ventana: ${report.window?.from ?? "?"} → ${report.window?.to ?? "?"}`);
  lines.push(
    `- Datos: pages=${report.counts?.pages ?? 0} queries=${report.counts?.queries ?? 0} queryPage=${report.counts?.queryPage ?? 0} analytics=${report.counts?.analytics ?? 0}`
  );
  lines.push(
    `- Candidatos: ${report.candidates.length} (${Object.entries(report.byType)
      .map(([type, count]) => `${type}=${count}`)
      .join(", ") || "ninguno"})`
  );
  if (report.skipped?.length) {
    lines.push(
      `- Omitidos: ${report.skipped.map(item => `${item.detector} (${item.reason})`).join(", ")}`
    );
  }
  lines.push("");
  lines.push(
    "Fase 0 report-only: sin acciones automáticas. Promoción manual a experimento vía issue con spec."
  );
  lines.push("");

  const groups = new Map();
  for (const candidate of report.candidates) {
    if (!groups.has(candidate.type)) groups.set(candidate.type, []);
    groups.get(candidate.type).push(candidate);
  }

  for (const [type, candidates] of groups) {
    lines.push(`## ${type} (${candidates[0].tier}) — ${candidates.length}`);
    lines.push("");
    lines.push(
      "| Score | Objetivo | Evidencia | Ganancia est. | Hipótesis | Experimento (métrica / umbral / n_min / ventana) |"
    );
    lines.push("|---:|---|---|---:|---|---|");
    for (const candidate of candidates) {
      const target = candidate.query
        ? `\`${candidate.query}\`${candidate.url ? ` → ${candidate.url}` : ""}`
        : `${candidate.url ?? candidate.calculator}`;
      const evidence = Object.entries(candidate.metrics)
        .map(([key, value]) => `${key}=${value}`)
        .join(", ");
      const experiment = candidate.experiment
        ? `${candidate.experiment.metric} / ${candidate.experiment.threshold} / ${candidate.experiment.nMin} / ${candidate.experiment.windowDays}d`
        : "—";
      lines.push(
        `| ${candidate.score} | ${target} | ${evidence} | ${candidate.expectedGainClicks} | ${candidate.hypothesis} | ${experiment} |`
      );
    }
    lines.push("");
  }

  if (report.candidates.length === 0) {
    lines.push("Sin candidatos por encima de los umbrales vigentes.");
    lines.push("");
  }

  return lines.join("\n");
}

