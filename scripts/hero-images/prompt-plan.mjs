import {
  buildPromptA,
  buildPromptB,
  buildPromptC,
  COLORS,
  findApprovedPromptModel,
} from "./config.mjs";
import { normalizeForMatching } from "./lib.mjs";

export const DEFAULT_MODEL_PLAN = {
  provider: "openai",
  model: process.env.OPENAI_IMAGE_MODEL || process.env.DALL_E_MODEL || "gpt-image-1",
  quality: "auto",
  size: "1536x1024",
};

const CATEGORY_COLOR_FALLBACK = {
  "ahorro-inversion": "Ahorro activo / Metas / Logros",
  impuestos: "Credito / Deuda / Impuestos / Riesgo",
  prevision: "Finanzas general / AFP / Empleo / Ahorro",
  "deuda-credito": "Credito / Deuda / Impuestos / Riesgo",
  "seguridad-financiera": "Advertencias / Errores comunes",
  "empleo-ingresos": "Finanzas general / AFP / Empleo / Ahorro",
  general: "Banca / Instituciones / Referencia tecnica",
};

const RULES = [
  {
    id: "fraude",
    keywords: ["fraude", "estafa", "suplantacion", "vishing", "smishing"],
    colorKey: "Fraude / Perdida grave",
    template: "A",
    recipeId: "fraude-estafa",
    readerSituation: "Persona revisando una alerta o contacto sospechoso en su telefono.",
    toneClass: "alerta",
  },
  // prevision before renta: AFP/pension articles often mention "impuesto" (wage tax),
  // which would incorrectly trigger the renta rule if it came first.
  {
    id: "prevision",
    keywords: ["afp", "pension", "previsional", "cuenta 2"],
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    template: "A",
    recipeId: "afp-pension",
    readerSituation: "Persona evaluando ahorro previsional y decisiones de largo plazo.",
    toneClass: "educativo",
  },
  // liquidacion before renta: pay-stub articles mention "impuesto unico al trabajo"
  // which would incorrectly trigger the renta scene without this rule.
  {
    id: "liquidacion",
    keywords: ["liquidacion de sueldo", "liquidacion", "comprobante de pago"],
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    template: "A",
    recipeId: "liquidacion-documento",
    readerSituation: "Persona revisando o interpretando su liquidacion de sueldo.",
    toneClass: "neutral",
  },
  // sueldo before renta: salary-calculation articles also mention "impuesto"
  // in payroll context, not tax-declaration context.
  {
    id: "sueldo",
    keywords: ["sueldo liquido", "sueldo bruto", "sueldo neto", "calculo de sueldo"],
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    template: "A",
    recipeId: "sueldo-liquido",
    readerSituation: "Persona calculando o verificando su sueldo neto.",
    toneClass: "neutral",
  },
  {
    id: "empleo",
    keywords: ["sueldo", "finiquito", "cesantia", "desempleo", "honorarios"],
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    template: "A",
    recipeId: "cesantia",
    readerSituation: "Persona revisando ingresos laborales, pagos o periodos sin trabajo.",
    toneClass: "neutral",
  },
  {
    id: "renta",
    keywords: ["impuesto", "renta", "f22", "sii", "retencion"],
    colorKey: "Credito / Deuda / Impuestos / Riesgo",
    template: "A",
    recipeId: "declaracion-renta",
    readerSituation: "Persona completando o revisando formularios y fechas tributarias.",
    toneClass: "serio",
  },
  {
    id: "uf",
    keywords: ["uf", "ipc", "inflacion", "indicador"],
    colorKey: "Educativo / Conceptos / Guias",
    template: "C",
    recipeId: "uf-indicadores",
    readerSituation: "Persona entendiendo un indicador economico que afecta pagos cotidianos.",
    toneClass: "educativo",
  },
  {
    id: "deuda",
    keywords: ["deuda", "credito", "cae", "dicom", "renegociacion"],
    colorKey: "Credito / Deuda / Impuestos / Riesgo",
    template: "A",
    recipeId: "deuda-credito",
    readerSituation: "Persona enfrentando documentos, cuotas o decisiones de deuda.",
    toneClass: "serio",
  },
  {
    id: "ahorro",
    keywords: ["ahorro", "presupuesto", "fondo de emergencia", "meta"],
    colorKey: "Ahorro activo / Metas / Logros",
    template: "A",
    recipeId: "ahorro",
    readerSituation: "Persona organizando ahorro o controlando gastos cotidianos.",
    toneClass: "progreso",
  },
  {
    id: "salud",
    keywords: ["fonasa", "isapre", "salud", "licencia medica", "ges", "caec"],
    colorKey: "Salud / FONASA / ISAPRE",
    template: "A",
    recipeId: "fonasa-vs-isapre",
    readerSituation: "Persona comparando cobertura, documentos o protecciones de salud.",
    toneClass: "neutral",
  },
];

function fallbackRecipeId(category = "") {
  if (category === "prevision") return { template: "B", recipeId: "afp-cotizacion" };
  if (category === "deuda-credito") return { template: "B", recipeId: "cae-credito-educacion" };
  if (category === "impuestos") return { template: "A", recipeId: "declaracion-renta" };
  if (category === "ahorro-inversion") return { template: "A", recipeId: "ahorro" };
  if (category === "seguridad-financiera") return { template: "A", recipeId: "fraude-estafa" };
  return { template: "B", recipeId: "cuenta-corriente-banco" };
}

function buildArticleText(article) {
  return [
    article.title,
    article.summary,
    ...(article.leadParagraphs ?? []),
    ...(article.headings ?? []),
    article.bodyExcerpt,
  ]
    .filter(Boolean)
    .join(" ");
}

function normalizeTokens(values) {
  return values
    .filter(Boolean)
    .map(value => normalizeForMatching(value))
    .filter(Boolean);
}

function findRuleEvidence(article, articleText, rule) {
  const originalSegments = normalizeTokens([
    article.title,
    ...(article.leadParagraphs ?? []),
    ...(article.headings ?? []),
    article.summary,
    article.bodyExcerpt,
  ]);

  const matchedKeywords = rule.keywords.filter(keyword => {
    const norm = normalizeForMatching(keyword);
    return new RegExp(`\\b${norm}\\b`).test(articleText);
  });

  const evidence = [];
  for (const keyword of matchedKeywords) {
    const normalizedKeyword = normalizeForMatching(keyword);
    const match = originalSegments.find(segment => segment.includes(normalizedKeyword));
    if (match) {
      evidence.push(`text contains '${keyword}' in article body/title context`);
    }
  }

  return {
    matchedKeywords,
    evidence: Array.from(new Set(evidence)).slice(0, 3),
  };
}

function determinePrimaryIntent(article, matchedRuleId) {
  const title = normalizeForMatching(article.title ?? "");
  const combined = normalizeForMatching(
    [article.title, article.summary, ...(article.headings ?? []), ...(article.leadParagraphs ?? [])].join(" ")
  );

  if (matchedRuleId === "fraude") return "alertar";
  if (matchedRuleId === "uf" || matchedRuleId === "prevision") return "explicar";
  if (/\b(vs|versus|diferencia|comparar|conviene)\b/.test(combined)) return "comparar";
  if (/\b(calcula|calcular|simulador|cuanto|cuánto)\b/.test(combined)) return "calcular";
  if (title.startsWith("como ") || /\b(checklist|pasos|como )\b/.test(combined)) return "guiar";
  return "explicar";
}

function buildFallbackReaderSituation(category) {
  if (category === "impuestos") {
    return "Persona revisando documentos y fechas para cumplir una obligacion tributaria.";
  }
  if (category === "prevision") {
    return "Persona evaluando decisiones previsionales de largo plazo.";
  }
  if (category === "ahorro-inversion") {
    return "Persona revisando herramientas o conceptos para mejorar su posicion financiera.";
  }
  return "Persona revisando informacion financiera practica para tomar una decision.";
}

function buildSemanticProfile(article, rule, evidence) {
  const primaryIntent = determinePrimaryIntent(article, rule.id);
  const readerSituation =
    rule.readerSituation || buildFallbackReaderSituation(String(article.category ?? "general"));

  const visualEvidence = [
    ...evidence,
    `primary intent classified as '${primaryIntent}' from article text`,
    `reader situation anchored to scene rule '${rule.id}'`,
  ].slice(0, 4);

  return {
    readerSituation,
    primaryIntent,
    toneClass: rule.toneClass || "neutral",
    visualEvidence,
    sourceSignals: {
      title: String(article.title ?? "").trim(),
      headings: (article.headings ?? []).slice(0, 3),
      leadParagraphs: (article.leadParagraphs ?? []).slice(0, 2),
    },
  };
}

// Slug-level overrides for articles whose content overlaps multiple keyword rules.
// These are checked before the RULES loop and take absolute precedence.
const SLUG_OVERRIDES = {
  "como-calcular-sueldo-liquido": {
    id: "sueldo",
    template: "A",
    recipeId: "sueldo-liquido",
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    readerSituation: "Persona calculando o verificando su sueldo neto.",
    toneClass: "neutral",
    overrideEvidence: ["slug override: payroll-calculation article"],
    overrideKeywords: ["sueldo liquido"],
  },
  "liquidacion-de-sueldo": {
    id: "liquidacion",
    template: "A",
    recipeId: "liquidacion-documento",
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    readerSituation: "Persona revisando o interpretando su liquidacion de sueldo.",
    toneClass: "neutral",
    overrideEvidence: ["slug override: pay-stub audit article"],
    overrideKeywords: ["liquidacion de sueldo"],
  },
  "cuanto-descuenta-la-afp-de-tu-sueldo": {
    id: "prevision",
    template: "A",
    recipeId: "afp-pension",
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    readerSituation: "Persona evaluando el descuento previsional en su liquidacion.",
    toneClass: "educativo",
    overrideEvidence: ["slug override: AFP deduction article"],
    overrideKeywords: ["afp", "descuento afp"],
  },
  // AFP switching article: use dedicated cambio-afp scene (comparing two institution docs)
  // instead of the generic afp-pension shield+arrow which doesn't communicate 'choice'.
  "como-cambiarse-de-afp": {
    id: "prevision",
    template: "A",
    recipeId: "cambio-afp",
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    readerSituation: "Persona decidiendo cambiarse de AFP y comparando sus opciones.",
    toneClass: "educativo",
    overrideEvidence: ["slug override: AFP switching decision article"],
    overrideKeywords: ["afp", "cambio de afp"],
  },
  // Fondos AFP A-B-C-D-E: use the specific fondos-afp model (figure pointing at 5 bars)
  // instead of generic afp-pension; clearly communicates the fund comparison concept.
  "fondos-afp-a-b-c-d-e": {
    id: "prevision",
    template: "A",
    recipeId: "fondos-afp",
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    readerSituation: "Persona comparando los cinco fondos AFP para elegir el mas adecuado.",
    toneClass: "educativo",
    overrideEvidence: ["slug override: AFP funds A-B-C-D-E comparison article"],
    overrideKeywords: ["afp", "fondos afp"],
  },
  // Cuenta 2 AFP: use dedicated cuenta-2-afp model (two layered savings blocks)
  // instead of generic afp-pension which gives no 'second account' visual signal.
  "que-es-la-cuenta-2-afp": {
    id: "prevision",
    template: "A",
    recipeId: "cuenta-2-afp",
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    readerSituation: "Persona descubriendo la Cuenta 2 de AFP como herramienta de ahorro voluntario.",
    toneClass: "educativo",
    overrideEvidence: ["slug override: Cuenta 2 AFP voluntary savings article"],
    overrideKeywords: ["cuenta 2", "afp"],
  },
  // Compound interest: body mentions 'sueldo liquido' triggering the sueldo rule,
  // but the article is about long-term growth — use ahorro (savings growth) scene.
  "el-poder-del-interes-compuesto": {
    id: "ahorro",
    template: "A",
    recipeId: "ahorro",
    colorKey: "Ahorro activo / Metas / Logros",
    readerSituation: "Persona visualizando el crecimiento de su ahorro a largo plazo.",
    toneClass: "progreso",
    overrideEvidence: ["slug override: compound interest long-term growth article"],
    overrideKeywords: ["ahorro", "interes compuesto"],
  },
  // Compound interest methodology note: same body-text false-positive as main article.
  "interes-compuesto-nota-metodologica": {
    id: "ahorro",
    template: "A",
    recipeId: "ahorro",
    colorKey: "Ahorro activo / Metas / Logros",
    readerSituation: "Persona entendiendo la mecanica del interes compuesto y su efecto acumulativo.",
    toneClass: "progreso",
    overrideEvidence: ["slug override: compound interest methodology note"],
    overrideKeywords: ["ahorro", "interes compuesto"],
  },
  // ETF investment: body mentions 'sii' triggering the renta rule,
  // but this is an investment/growth article — use ahorro scene over tax-form scene.
  "como-invertir-en-etfs-desde-chile": {
    id: "ahorro",
    template: "A",
    recipeId: "ahorro",
    colorKey: "Ahorro activo / Metas / Logros",
    readerSituation: "Persona evaluando instrumentos de inversion para hacer crecer sus ahorros.",
    toneClass: "progreso",
    overrideEvidence: ["slug override: ETF investment article"],
    overrideKeywords: ["ahorro", "inversion"],
  },
  // IPC article: body mentions 'sueldo' triggering empleo rule before uf rule;
  // override to ipc-indicadores Template C for correct educational indicator framing.
  "que-es-el-ipc-chile-como-se-calcula": {
    id: "uf",
    template: "C",
    recipeId: "ipc-indicadores",
    colorKey: "Educativo / Conceptos / Guias",
    readerSituation: "Persona entendiendo como el IPC mide la inflacion y afecta su poder adquisitivo.",
    toneClass: "educativo",
    overrideEvidence: ["slug override: IPC inflation indicator educational article"],
    overrideKeywords: ["ipc", "inflacion"],
  },
  // Cesantia comparison article: body mentions 'afp' triggering prevision rule,
  // but the article is about unemployment insurance — use cesantia not afp-pension.
  "seguro-cesantia-cuenta-individual-vs-fondo-solidario": {
    id: "empleo",
    template: "A",
    recipeId: "cesantia",
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    readerSituation: "Persona comparando las dos modalidades del seguro de cesantia.",
    toneClass: "neutral",
    overrideEvidence: ["slug override: cesantia insurance comparison article"],
    overrideKeywords: ["cesantia"],
  },
  // Debt renegotiation: body mentions 'uf' triggering indicator rule,
  // but the article is about restructuring debt — use deuda-credito scene.
  "renegociacion-superir": {
    id: "deuda",
    template: "A",
    recipeId: "deuda-credito",
    colorKey: "Credito / Deuda / Impuestos / Riesgo",
    readerSituation: "Persona negociando condiciones de deuda para mejorar su situacion financiera.",
    toneClass: "serio",
    overrideEvidence: ["slug override: debt renegotiation process article"],
    overrideKeywords: ["renegociacion", "deuda"],
  },
  // Fonasa vs Isapre comparison: body mentions 'sueldo' (7% health deduction context)
  // triggering the empleo rule before the salud rule; override to fonasa-vs-isapre scene.
  "fonasa-vs-isapre-comparativa": {
    id: "salud",
    template: "A",
    recipeId: "fonasa-vs-isapre",
    colorKey: "Salud / FONASA / ISAPRE",
    readerSituation: "Persona comparando Fonasa e Isapre para elegir el sistema de salud que mejor se adapta a su situacion.",
    toneClass: "neutral",
    overrideEvidence: ["slug override: Fonasa vs Isapre health system comparison article"],
    overrideKeywords: ["fonasa", "isapre"],
  },
  // APV article: generic afp-pension (shield+arrow) doesn't communicate voluntary savings;
  // use apv-crecimiento Template C (upward-trending arrow over savings stack) instead.
  "que-es-el-apv": {
    id: "prevision",
    template: "C",
    recipeId: "apv-crecimiento",
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    readerSituation: "Persona evaluando el APV como herramienta de ahorro previsional voluntario.",
    toneClass: "educativo",
    overrideEvidence: ["slug override: APV voluntary pension savings article"],
    overrideKeywords: ["apv", "ahorro previsional voluntario"],
  },
  // Rentas mixtas article: body mentions 'sueldo' and 'honorarios' triggering the empleo
  // rule (cesantia scene) before the renta rule; override to declaracion-renta scene because
  // this is a tax-declaration article (Impuesto Global Complementario, F22, Operacion Renta).
  "rentas-mixtas-sueldo-honorarios": {
    id: "renta",
    template: "A",
    recipeId: "declaracion-renta",
    colorKey: "Credito / Deuda / Impuestos / Riesgo",
    readerSituation: "Persona con sueldo y boletas de honorarios que necesita entender su declaracion anual de impuestos y si pagara mas o recuperara.",
    toneClass: "serio",
    overrideEvidence: ["slug override: mixed-income tax declaration article — empleo rule false-positive on 'sueldo'+'honorarios' keywords"],
    overrideKeywords: ["impuesto", "renta", "declaracion", "global complementario"],
  },
  // Cartola AFP: generic afp-pension (shield+upward arrow) doesn't communicate
  // 'reading a document'; liquidacion-documento (figure holding a document with magnifier)
  // directly represents the act of inspecting a financial statement.
  "como-leer-cartola-afp-chile": {
    id: "prevision",
    template: "A",
    recipeId: "liquidacion-documento",
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    readerSituation: "Persona revisando e interpretando la cartola AFP trimestral para verificar cotizaciones y rentabilidad.",
    toneClass: "educativo",
    overrideEvidence: ["slug override: AFP quarterly statement document-review article — afp-pension shield scene too generic for document-reading context"],
    overrideKeywords: ["afp", "cartola"],
  },
};

export function selectPromptPlan(article) {
  const category = String(article.category ?? "general").trim().toLowerCase();
  const articleText = normalizeForMatching(buildArticleText(article));
  const metadataText = normalizeForMatching(
    [article.slug, ...(article.tags ?? []), article.cluster ?? ""].join(" ")
  );

  // Check slug overrides first — these take precedence over keyword rules.
  const slugOverride = SLUG_OVERRIDES[article.slug];
  if (slugOverride) {
    const colorEntry = COLORS[slugOverride.colorKey] ?? COLORS["Banca / Instituciones / Referencia tecnica"];
    const semantic = buildSemanticProfile(
      article,
      { id: slugOverride.id, readerSituation: slugOverride.readerSituation, toneClass: slugOverride.toneClass },
      slugOverride.overrideEvidence
    );
    const overrideModel = findApprovedPromptModel(slugOverride.template, slugOverride.recipeId);
    if (!overrideModel) {
      throw new Error(
        `[hero-images] Missing approved prompt model for slug override '${article.slug}': template '${slugOverride.template}', recipe '${slugOverride.recipeId}'.`
      );
    }
    const basePlan = {
      ruleId: slugOverride.id,
      colorKey: slugOverride.colorKey,
      hex: colorEntry.hex,
      modelPlan: { ...DEFAULT_MODEL_PLAN },
      semantic,
      matchedKeywords: slugOverride.overrideKeywords,
    };
    return {
      ...basePlan,
      template: slugOverride.template,
      approvedModelId: overrideModel.id,
      sceneId: overrideModel.sceneId,
      postura: overrideModel.postura,
      objetos: overrideModel.objetos,
      icon: overrideModel.icono,
      sceneChoice: overrideModel.label,
    };
  }

  let rule = null;
  let evidence = [];
  let matchedKeywords = [];

  for (const candidate of RULES) {
      const textMatch = findRuleEvidence(article, articleText, candidate);
    if (textMatch.matchedKeywords.length > 0) {
      rule = candidate;
      matchedKeywords = textMatch.matchedKeywords;
      evidence = textMatch.evidence;
      break;
    }
  }

  if (!rule) {
    for (const candidate of RULES) {
      const metadataMatches = candidate.keywords.filter(keyword => {
        const norm = normalizeForMatching(keyword);
        return new RegExp(`\\b${norm}\\b`).test(metadataText);
      });
      if (metadataMatches.length > 0) {
        rule = candidate;
        matchedKeywords = metadataMatches;
        evidence = [
          `metadata fallback matched '${metadataMatches[0]}'`,
          "article text did not produce a stronger scene signal",
        ];
        break;
      }
    }
  }

  if (!rule) {
    rule = {
      id: "fallback",
      colorKey:
        CATEGORY_COLOR_FALLBACK[category] ?? "Banca / Instituciones / Referencia tecnica",
      ...fallbackRecipeId(category),
      readerSituation: buildFallbackReaderSituation(category),
      toneClass: "neutral",
    };
    evidence = [
      "used fallback scene after reading article without a dominant visual cue",
      `category fallback applied for '${category || "general"}'`,
    ];
  }

  const colorEntry = COLORS[rule.colorKey] ?? COLORS["Banca / Instituciones / Referencia tecnica"];
  const semantic = buildSemanticProfile(article, rule, evidence);
  const basePlan = {
    ruleId: rule.id,
    colorKey: rule.colorKey,
    hex: colorEntry.hex,
    modelPlan: { ...DEFAULT_MODEL_PLAN },
    semantic,
    matchedKeywords,
  };

  const approvedModel = findApprovedPromptModel(rule.template, rule.recipeId);
  if (!approvedModel) {
    throw new Error(
      `[hero-images] Missing approved prompt model for template '${rule.template}' and recipe '${rule.recipeId}'.`
    );
  }

  if (rule.template === "A") {
    return {
      ...basePlan,
      template: "A",
      approvedModelId: approvedModel.id,
      sceneId: approvedModel.sceneId,
      postura: approvedModel.postura,
      objetos: approvedModel.objetos,
      sceneChoice: approvedModel.label,
    };
  }

  return {
    ...basePlan,
    template: rule.template,
    approvedModelId: approvedModel.id,
    sceneId: approvedModel.sceneId,
    icon: approvedModel.icono,
    iconChoice: approvedModel.label,
  };
}

export function buildPromptFromPlan(plan) {
  if (plan.template === "A") {
    return buildPromptA(plan.hex, plan.postura, plan.objetos);
  }
  if (plan.template === "C") {
    return buildPromptC(plan.hex, plan.icon);
  }
  return buildPromptB(plan.hex, plan.icon);
}
