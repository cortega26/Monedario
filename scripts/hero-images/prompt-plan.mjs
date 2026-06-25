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

export const PROMPT_TRACK_LABELS = {
  A: "Human Editorial Scene",
  B: "Hybrid Scene + Mechanism",
  C: "Editorial Mechanism",
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
    promptTrack: "B",
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
    promptTrack: "B",
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
    promptTrack: "C",
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

function normalizePromptTrack(value, fallback = "A") {
  const track = String(value ?? "").trim().toUpperCase();
  return Object.prototype.hasOwnProperty.call(PROMPT_TRACK_LABELS, track) ? track : fallback;
}

function defaultPromptTrackForRule(rule) {
  if (rule?.promptTrack) {
    return normalizePromptTrack(rule.promptTrack);
  }
  if (rule?.template === "C" || rule?.template === "B") {
    return "C";
  }
  return "A";
}

function sceneAlreadyHasHumanAnchor(options = {}) {
  const combined = [options.sceneLine, options.propsLine, options.humanAnchorLine]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return /(human figure|person|worker|visible hand|visible hands|pair of hands|partial figure)/.test(combined);
}

function buildAutoHumanAnchorLine(promptTrack, semantic, humanAnchorAlreadyEmbedded = false) {
  if (humanAnchorAlreadyEmbedded) {
    if (promptTrack === "B") {
      return `The human interaction should make the mechanism feel lived, consequential, and relevant to ${semantic.readerSituation.toLowerCase()}`;
    }

    return "The gesture should make the image feel like an everyday financial moment, not a sterile diagram.";
  }

  if (promptTrack === "B") {
    return `Include one simplified person, partial figure, or visible hands actively interacting with the main object so the mechanism feels lived, consequential, and relevant to ${semantic.readerSituation.toLowerCase()}`;
  }

  return "Include one simplified human figure or visible hands performing a readable gesture so the image feels like an everyday financial moment, not a sterile diagram.";
}

function humanizeSceneLine(sceneLine, promptTrack) {
  if (typeof sceneLine !== "string" || sceneLine.trim() === "") return undefined;

  const body = sceneLine
    .replace(/^Scene:\s*/i, "")
    .replace(/^one\s+/i, "a ")
    .trim();

  if (promptTrack === "B") {
    return `Scene: a simplified person, partial figure, or visible hands are actively interacting with ${body}`;
  }

  return `Scene: a simplified person or visible hands are engaged in an everyday money moment built around ${body}`;
}

function softenObjectOnlyPropsLine(propsLine) {
  if (typeof propsLine !== "string" || propsLine.trim() === "") return undefined;
  if (!/^Use only /i.test(propsLine)) return propsLine;

  const body = propsLine.replace(/^Use only /i, "").replace(/\.\s*$/u, "").trim();
  return `Keep the supporting mechanism limited to ${body}, while the human presence stays secondary and the main moment stays readable.`;
}

function normalizeSceneToken(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildArticleSceneId(template, approvedModelId, slug) {
  const templateToken = normalizeSceneToken(template).toUpperCase();
  const modelToken = normalizeSceneToken(approvedModelId);
  const slugToken = normalizeSceneToken(slug);
  return `${templateToken}:${modelToken}--${slugToken}`;
}

// Slug-level overrides for articles whose content overlaps multiple keyword rules.
// These are checked before the RULES loop and take absolute precedence.
const SLUG_OVERRIDES = {
  "finanzas-para-migrantes-chile": {
    id: "finanzas-migrantes",
    template: "A",
    promptTrack: "A",
    recipeId: "ahorro",
    colorKey: "Educativo / Conceptos / Guias",
    readerSituation:
      "Persona migrante avanzando por los pasos practicos para obtener identificacion, abrir una cuenta y arrendar una vivienda en Chile.",
    toneClass: "educativo",
    overrideEvidence: [
      "slug override: migrant financial onboarding guide — SII mention is not an annual tax-filing topic",
    ],
    overrideKeywords: ["migrante", "rut", "cuentarut", "arriendo"],
    promptOptions: {
      sceneLine:
        "Scene: one simplified human figure moving along a clear three-step path toward a stable home.",
      propsLine:
        "Use an identity document, a bank card, and a house key as the three sequential milestones.",
      extraLines: [
        "Semantic focus: practical financial onboarding in Chile, from identification to banking and housing.",
      ],
    },
  },
  "boleta-honorarios-2026-retencion-cobertura": {
    id: "honorarios",
    template: "A",
    promptTrack: "B",
    recipeId: "liquidacion-documento",
    colorKey: "Credito / Deuda / Impuestos / Riesgo",
    readerSituation:
      "Persona que emite boletas de honorarios y necesita separar retencion, liquido recibido y cobertura anual.",
    toneClass: "educativo",
    overrideEvidence: ["slug override: honorarios cash-flow and retention article"],
    overrideKeywords: ["honorarios", "retencion", "liquido"],
  },
  "cae-costo-real-credito-chile": {
    id: "deuda",
    template: "C",
    promptTrack: "C",
    recipeId: "credito-comparador",
    colorKey: "Credito / Deuda / Impuestos / Riesgo",
    readerSituation:
      "Persona comparando el costo real de un credito mas alla de la tasa o la cuota mensual.",
    toneClass: "serio",
    overrideEvidence: ["slug override: CAE article is a debt-cost comparison, not an indicator article"],
    overrideKeywords: ["cae", "credito", "costo real"],
  },
  "como-calcular-sueldo-liquido": {
    id: "sueldo",
    template: "A",
    promptTrack: "B",
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
    promptTrack: "B",
    recipeId: "liquidacion-documento",
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    readerSituation: "Persona revisando o interpretando su liquidacion de sueldo.",
    toneClass: "neutral",
    overrideEvidence: ["slug override: pay-stub audit article"],
    overrideKeywords: ["liquidacion de sueldo"],
  },
  "cuanto-descuenta-la-afp-de-tu-sueldo": {
    id: "empleo",
    template: "A",
    promptTrack: "B",
    recipeId: "liquidacion-documento",
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
    promptTrack: "A",
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
    promptTrack: "A",
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
    promptTrack: "A",
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
    promptTrack: "A",
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
    promptTrack: "B",
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
    promptTrack: "A",
    recipeId: "ahorro",
    colorKey: "Ahorro activo / Metas / Logros",
    readerSituation: "Persona evaluando instrumentos de inversion para hacer crecer sus ahorros.",
    toneClass: "progreso",
    overrideEvidence: ["slug override: ETF investment article"],
    overrideKeywords: ["ahorro", "inversion"],
  },
  "como-elegir-inversion-segun-plazo-riesgo-objetivos": {
    id: "decision-inversion",
    template: "A",
    promptTrack: "A",
    recipeId: "ahorro",
    colorKey: "Educativo / Conceptos / Guias",
    readerSituation:
      "Persona ordenando plazo, riesgo, liquidez y objetivos antes de elegir una inversion.",
    toneClass: "educativo",
    overrideEvidence: [
      "slug override: investment decision guide — 'previsional' appears only in the advisory and must not select the pension scene",
    ],
    overrideKeywords: ["inversion", "plazo", "riesgo", "objetivos"],
    promptOptions: {
      sceneLine:
        "Scene: one simplified human figure with a checklist pauses before a path that branches into three clear directions.",
      propsLine:
        "Use only the checklist and the three-way path as the decision metaphor; do not depict a specific financial product.",
      extraLines: [
        "Semantic focus: evaluating horizon, risk, liquidity, and goals before choosing an investment.",
      ],
    },
  },
  "como-hacer-presupuesto-mensual-chile": {
    id: "ahorro",
    template: "A",
    promptTrack: "A",
    recipeId: "ahorro",
    colorKey: "Ahorro activo / Metas / Logros",
    readerSituation:
      "Persona ordenando gastos fijos, gastos variables y ahorro para construir un presupuesto mensual realista.",
    toneClass: "progreso",
    overrideEvidence: ["slug override: budgeting article — prevision false-positive on AFP mentions in cross-links"],
    overrideKeywords: ["presupuesto", "gastos", "ahorro"],
  },
  // IPC article: body mentions 'sueldo' triggering empleo rule before uf rule;
  // override to ipc-indicadores Template C for correct educational indicator framing.
  "que-es-el-ipc-chile-como-se-calcula": {
    id: "uf",
    template: "C",
    promptTrack: "C",
    recipeId: "ipc-indicadores",
    colorKey: "Educativo / Conceptos / Guias",
    readerSituation: "Persona entendiendo como el IPC mide la inflacion y afecta su poder adquisitivo.",
    toneClass: "educativo",
    overrideEvidence: ["slug override: IPC inflation indicator educational article"],
    overrideKeywords: ["ipc", "inflacion"],
  },
  // UTM article: tags include 'impuesto' triggering the renta rule (declaracion-renta scene)
  // before the uf rule; override to uf-indicadores Template C because UTM is an educational
  // monetary indicator article (monthly fiscal reference unit), not a tax-filing article.
  // promptOverride: rubric failures on v1/v2 images (grain, 3D coin, $ symbol) require explicit
  // per-slug prompt to enforce flat disc, anti-grain background, and composition correction.
  "utm-chile-que-es-como-funciona": {
    id: "uf",
    template: "C",
    promptTrack: "C",
    recipeId: "uf-indicadores",
    colorKey: "Educativo / Conceptos / Guias",
    readerSituation: "Persona entendiendo la UTM como unidad tributaria mensual: que es, su valor, como afecta multas e impuestos.",
    toneClass: "educativo",
    overrideEvidence: ["slug override: UTM monthly fiscal indicator educational article — renta rule false-positive on 'impuesto' tag"],
    overrideKeywords: ["utm", "tributaria", "indicador", "mensual"],
  },
  // Cesantia comparison article: body mentions 'afp' triggering prevision rule,
  // but the article is about unemployment insurance — use cesantia not afp-pension.
  "seguro-cesantia-cuenta-individual-vs-fondo-solidario": {
    id: "empleo",
    template: "A",
    promptTrack: "B",
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
    promptTrack: "B",
    recipeId: "deuda-credito",
    colorKey: "Credito / Deuda / Impuestos / Riesgo",
    readerSituation: "Persona negociando condiciones de deuda para mejorar su situacion financiera.",
    toneClass: "serio",
    overrideEvidence: ["slug override: debt renegotiation process article"],
    overrideKeywords: ["renegociacion", "deuda"],
  },
  // Credito hipotecario: body mentions 'uf' heavily (dividendo in UF, UF reajuste)
  // triggering the uf-indicadores scene before the deuda rule;
  // override to deuda-credito Template A because this is a debt-process article.
  "credito-hipotecario-chile-guia-completa": {
    id: "deuda",
    template: "A",
    promptTrack: "B",
    recipeId: "deuda-credito",
    colorKey: "Credito / Deuda / Impuestos / Riesgo",
    readerSituation: "Persona evaluando o solicitando un credito hipotecario para comprar su primera vivienda.",
    toneClass: "serio",
    overrideEvidence: ["slug override: mortgage process article — uf keyword false-positive on deuda rule"],
    overrideKeywords: ["credito-hipotecario", "dividendo", "hipoteca", "vivienda"],
  },
  // Fonasa vs Isapre comparison: body mentions 'sueldo' (7% health deduction context)
  // triggering the empleo rule before the salud rule; override to fonasa-vs-isapre scene.
  "fonasa-vs-isapre-comparativa": {
    id: "salud",
    template: "A",
    promptTrack: "B",
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
    promptTrack: "C",
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
    promptTrack: "B",
    recipeId: "declaracion-renta",
    colorKey: "Credito / Deuda / Impuestos / Riesgo",
    readerSituation: "Persona con sueldo y boletas de honorarios que necesita entender su declaracion anual de impuestos y si pagara mas o recuperara.",
    toneClass: "serio",
    overrideEvidence: ["slug override: mixed-income tax declaration article — empleo rule false-positive on 'sueldo'+'honorarios' keywords"],
    overrideKeywords: ["impuesto", "renta", "declaracion", "global complementario"],
  },
  "descuentos-de-sueldo": {
    id: "empleo",
    template: "A",
    promptTrack: "B",
    recipeId: "liquidacion-documento",
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    readerSituation:
      "Persona clasificando descuentos de sueldo para distinguir los legales, autorizados y prohibidos.",
    toneClass: "neutral",
    overrideEvidence: ["slug override: payroll-deductions classification article"],
    overrideKeywords: ["descuentos de sueldo", "descuento legal", "descuento prohibido"],
  },
  // Cartola AFP: generic afp-pension (shield+upward arrow) doesn't communicate
  // 'reading a document'; liquidacion-documento (figure holding a document with magnifier)
  // directly represents the act of inspecting a financial statement.
  "como-leer-cartola-afp-chile": {
    id: "prevision",
    template: "A",
    promptTrack: "B",
    recipeId: "liquidacion-documento",
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    readerSituation: "Persona revisando e interpretando la cartola AFP trimestral para verificar cotizaciones y rentabilidad.",
    toneClass: "educativo",
    overrideEvidence: ["slug override: AFP quarterly statement document-review article — afp-pension shield scene too generic for document-reading context"],
    overrideKeywords: ["afp", "cartola"],
  },  // Prepago credito: body mentions 'uf' in hipotecario context triggering the uf-indicadores
  // scene before the deuda rule; override to deuda-credito Template A because this is a
  // debt-management/prepayment article, not an economic indicator article.
  "prepago-credito-cuando-conviene-chile": {
    id: "deuda",
    template: "A",
    promptTrack: "B",
    recipeId: "deuda-credito",
    colorKey: "Credito / Deuda / Impuestos / Riesgo",
    readerSituation: "Persona con un credito vigente evaluando si conviene hacer un abono extraordinario para reducir intereses.",
    toneClass: "serio",
    overrideEvidence: ["slug override: prepago/early-repayment article — uf keyword false-positive from hipotecario context"],
    overrideKeywords: ["prepago", "credito", "deuda", "cuota"],
  },
  // Gratificacion legal: body mentions 'sueldo' triggering the empleo/sueldo rule,
  // but this article is about the annual legal bonus concept — use liquidacion-documento
  // (document review with payslip) because it's a payroll-document-type article.
  "gratificacion-legal-chile": {
    id: "empleo",
    template: "A",
    promptTrack: "B",
    recipeId: "liquidacion-documento",
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    readerSituation: "Persona revisando el calculo de su gratificacion legal anual en la liquidacion de sueldo.",
    toneClass: "neutral",
    overrideEvidence: ["slug override: gratificacion-legal annual bonus calculation article"],
    overrideKeywords: ["gratificacion", "sueldo"],
  },
  // Impuesto Global Complementario: body/tags contain 'impuesto' and 'renta' triggering
  // declaracion-renta scene correctly; override ensures IGC bracket framing is explicit.
  "impuesto-global-complementario-chile": {
    id: "renta",
    template: "A",
    promptTrack: "B",
    recipeId: "declaracion-renta",
    colorKey: "Credito / Deuda / Impuestos / Riesgo",
    readerSituation: "Persona entendiendo los tramos del Impuesto Global Complementario y como afecta su declaracion anual.",
    toneClass: "serio",
    overrideEvidence: ["slug override: IGC progressive tax brackets educational article"],
    overrideKeywords: ["impuesto", "global complementario", "declaracion"],
  },
  // Sueldo imponible: body mentions 'sueldo' triggering empleo rule (sueldo-liquido scene),
  // but this article is about the taxable wage base concept — use liquidacion-documento
  // to frame as document/concept review rather than net-pay calculation.
  "sueldo-imponible-chile": {
    id: "empleo",
    template: "A",
    promptTrack: "B",
    recipeId: "liquidacion-documento",
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    readerSituation: "Persona entendiendo que parte de su sueldo es imponible y como eso determina sus cotizaciones.",
    toneClass: "neutral",
    overrideEvidence: ["slug override: sueldo-imponible base concept article — document-review framing"],
    overrideKeywords: ["sueldo imponible", "sueldo"],
  },
  // PGU article: body mentions 'afp' triggering prevision/afp-pension rule correctly;
  // override clarifies this is an IPS/state pension article, not an AFP article.
  "pgu-pension-garantizada-universal": {
    id: "prevision",
    template: "A",
    promptTrack: "A",
    recipeId: "afp-pension",
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    readerSituation: "Persona mayor o proximo a jubilarse evaluando si califica para la pension basica garantizada por el Estado.",
    toneClass: "educativo",
    overrideEvidence: ["slug override: PGU state pension eligibility guide"],
    overrideKeywords: ["pension", "pgu", "garantizada universal"],
  },
  // Contribuciones bienes raices: body mentions 'impuesto' triggering the renta rule;
  // override to declaracion-renta with a property-tax calendar framing because this is
  // about property tax payment schedule, not income tax filing.
  "contribuciones-bienes-raices-chile": {
    id: "renta",
    template: "A",
    promptTrack: "B",
    recipeId: "declaracion-renta",
    colorKey: "Credito / Deuda / Impuestos / Riesgo",
    readerSituation: "Persona propietaria de un inmueble revisando el calendario y monto de sus contribuciones anuales.",
    toneClass: "serio",
    overrideEvidence: ["slug override: property tax (contribuciones) calendar-and-amount article — renta rule false-positive on impuesto body keywords"],
    overrideKeywords: ["contribuciones", "impuesto", "bienes raices"],
  },
  // Operacion renta centro: hub article — body mentions 'renta' and 'sii' triggering the
  // renta rule (declaracion-renta) correctly; override clarifies hub/navigation framing.
  "operacion-renta-centro": {
    id: "renta",
    template: "A",
    promptTrack: "A",
    recipeId: "declaracion-renta",
    colorKey: "Credito / Deuda / Impuestos / Riesgo",
    readerSituation: "Persona buscando informacion y recursos para completar su Operacion Renta anual.",
    toneClass: "serio",
    overrideEvidence: ["slug override: operacion-renta hub/support article — declaracion-renta scene appropriate for tax-hub context"],
    overrideKeywords: ["impuesto", "renta", "operacion renta"],
  },  // Primo empleo integral: body mentions 'afp' and 'previsional' triggering the prevision
  // rule (afp-pension shield+arrow) before the empleo rule; override to cesantia template
  // (empleo category) with a custom promptOverride — figure walking through an open doorway
  // holding a contract page — directly communicating 'starting a new job', not pension planning
  // and not document auditing (liquidacion scene already used by liquidacion-de-sueldo and cartola).
  "primer-empleo-chile-guia-completa": {
    id: "empleo",
    template: "A",
    promptTrack: "A",
    recipeId: "cesantia",
    colorKey: "Finanzas general / AFP / Empleo / Ahorro",
    readerSituation: "Persona recien contratada revisando su primer contrato de trabajo y entendiendo sus descuentos legales.",
    toneClass: "neutral",
    overrideEvidence: ["slug override: first-employment onboarding guide — prevision rule false-positive on 'afp'+'previsional' body keywords"],
    overrideKeywords: ["primer empleo", "contrato", "liquidacion"],
  },
};

const ARTICLE_PROMPT_VARIANTS = {
  "ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026": {
    promptOptions: {
      sceneLine:
        "Scene: three flat investment containers arranged side by side with clearly different profiles: one stable block, one medium stepped stack, and one taller volatile stack.",
      propsLine:
        "Use only geometric containers, divider blocks, and one small comparison arrow between the middle and right options.",
      compositionLine:
        "Composition: the three containers occupy the central 70% of the canvas with generous horizontal margins.",
      extraLines: ["Semantic focus: choosing between DAP, mutual funds, and ETFs according to risk and cost."],
      negativeLine:
        "Do not add extra objects beyond the three containers and the comparison arrow.",
    },
  },
  "boleta-honorarios-2026-retencion-cobertura": {
    promptTrack: "B",
    promptOptions: {
      sceneLine:
        "Scene: a simplified independent worker is reviewing a boleta de honorarios while the receipt remains the dominant object, split into a retained amount band and a final net amount block.",
      propsLine:
        "Use the receipt as the focal object, with one subtraction bar and one compact coverage marker shaping the explanation.",
      extraLines: ["Semantic focus: monthly retention and net cash received from honorarios."],
      negativeLine:
        "Avoid clutter, realistic app screens, tax-software UI, or decorative office props.",
    },
  },
  "cae-costo-real-credito-chile": {
    promptTrack: "C",
    promptOptions: {
      sceneLine:
        "Scene: one borrowing-cost comparison built from a smaller monthly-payment block and a much larger total-cost block, with a directional path connecting them so the hidden scale difference is immediately visible.",
      extraLines: [
        "Semantic focus: total borrowing cost versus the misleading monthly payment view.",
        "Use the size contrast as the tension device so the mechanism feels consequential, not generic.",
      ],
      negativeLine:
        "Avoid generic chart dashboards, screen UIs, or realistic bank-app framing.",
    },
  },
  "como-calcular-sueldo-liquido": {
    promptTrack: "B",
    promptOptions: {
      sceneLine:
        "Scene: a simplified person is reviewing a payslip at a table, with the document as the main focal object and a clean deduction-to-deposit flow integrated into the same composition.",
      propsLine:
        "Keep the payslip dominant; show a few clear deduction slices feeding into a smaller final deposit shape near the reader's hand or phone.",
      humanAnchorLine:
        "The emotional stake is understanding why the deposited salary feels lower than the headline salary, so the reader should sense recognition before calculation.",
      compositionLine:
        "Composition: keep the person and payslip in the left or center-left area, and let the embedded flow travel through the page rather than floating as a separate chart.",
      extraLines: [
        "Semantic focus: payroll calculation from gross salary to final net deposit.",
        "The mechanism must support the lived moment of checking a payslip, not replace it.",
      ],
      negativeLine:
        "Avoid standalone payroll diagrams, fake mobile UI, checklist layouts, dashboard tiles, or decorative office clutter.",
    },
  },
  "como-hacer-presupuesto-mensual-chile": {
    promptTrack: "A",
    promptOptions: {
      sceneLine:
        "Scene: a simplified person or visible hands are organizing a monthly budget at a home table, with one open notebook as the dominant object and grouped expenses being actively sorted.",
      propsLine:
        "Keep the notebook dominant, with a calculator, two grouped expense piles, and one small savings jar as supporting cues.",
      extraLines: [
        "Semantic focus: practical household budgeting with fixed expenses, variable expenses, and savings.",
        "The scene should feel lived-in and hopeful, not like a top-down still life.",
      ],
      negativeLine:
        "Avoid workspace stock-photo cues, realistic tabletop texture, excessive stationery, or a sterile flat-lay aesthetic.",
    },
  },
  "como-invertir-en-etfs-desde-chile": {
    promptOptions: {
      sceneLine:
        "Scene: one simplified brokerage window card beside a rising stack of flat ETF blocks.",
      propsLine:
        "Use only a rectangular platform card, three ascending blocks, and one small direction arrow.",
      extraLines: ["Semantic focus: entering ETFs through a broker while understanding fees and platform choice."],
      negativeLine:
        "Do not add extra objects beyond the brokerage card, ascending blocks, and arrow.",
    },
  },
  "como-leer-cartola-afp-chile": {
    promptOptions: {
      sceneLine:
        "Scene: one flat AFP statement page with a slim performance band and a magnifier positioned over contribution lines.",
      propsLine:
        "Use only the statement sheet, the magnifier, and three highlighted horizontal bars inside the document.",
      extraLines: ["Semantic focus: reading an AFP statement line by line."],
      negativeLine:
        "Do not add extra objects beyond the statement, the magnifier, and the highlighted bars.",
    },
  },
  "como-salir-boletin-comercial-chile": {
    promptOptions: {
      sceneLine:
        "Scene: one commercial bulletin document sliding out from behind a barrier line toward a clean approval circle.",
      propsLine:
        "Use only the document silhouette, one horizontal barrier, and one approval circle with a simple check shape.",
      extraLines: ["Semantic focus: leaving the commercial bulletin without criminalizing the user."],
      negativeLine:
        "Do not add extra objects beyond the document, barrier line, and approval circle.",
    },
  },
  "credito-hipotecario-chile-guia-completa": {
    promptOptions: {
      sceneLine:
        "Scene: one house silhouette anchored to a long amortization bar made of monthly blocks.",
      propsLine:
        "Use only the house, the amortization bar, and one small downward interest arrow at the far end.",
      extraLines: ["Semantic focus: the long-term structure of a mortgage credit."],
      negativeLine:
        "Do not add extra objects beyond the house, amortization bar, and interest arrow.",
    },
  },
  "cuanto-descuenta-la-afp-de-tu-sueldo": {
    promptOptions: {
      sceneLine:
        "Scene: a simplified worker is reviewing a payslip where one connected payroll line contains a large AFP deduction band and a smaller commission band.",
      propsLine:
        "Keep the payslip edge visible and let the two deduction bands stay aligned inside the same salary line so the split feels explanatory, not abstract.",
      compositionLine:
        "Composition: the payslip edge and split deduction bar occupy the left-center of the canvas; the large pension segment must visibly dominate the smaller commission segment; right third is clean solid background only.",
      extraLines: [
        "Semantic focus: separating mandatory AFP contribution from commission.",
        "Both segments must read as one split payroll deduction line, not as two unrelated blocks.",
        "The visual should explain ratio and separation at a glance, not imply a chart, badge set, or app widget.",
      ],
      negativeLine:
        "Do not add extra objects beyond the payslip edge and the split deduction bar. Avoid pie-chart logic, dashboard widgets, floating legends, app pills, or badge-like markers.",
    },
  },
  "deposito-a-plazo-uf-vs-pesos": {
    promptOptions: {
      sceneLine:
        "Scene: two flat deposit blocks side by side, one stable and one indexed upward, aligned to the right third of the canvas; left two-thirds is clean solid background only.",
      extraLines: ["Semantic focus: comparing fixed-rate pesos with inflation-indexed UF deposits."],
      negativeLine: "Do not add extra objects beyond the two deposit blocks and the small upward index cue.",
    },
  },
  "devolucion-impuestos-fechas-compensaciones": {
    promptOptions: {
      sceneLine:
        "Scene: a simplified person or visible hands are checking a tax-refund calendar page where one deposit cue and one offset block are embedded into the same date-driven scene.",
      propsLine:
        "Keep the calendar page dominant, with one compact deposit cue and one smaller offset block representing compensations or delays.",
      extraLines: [
        "Semantic focus: refund timing, status review, and possible offsets.",
        "The calendar must dominate; the offset block must remain secondary and diagnostic.",
        "The image should read as one official date-and-refund mechanism, not as an invoice, payment receipt, or banking dashboard.",
      ],
      negativeLine:
        "Do not add extra objects beyond the calendar page, deposit arrow, and offset block. Avoid invoice-like tables, mobile banking UI, receipt layouts, or floating date chips.",
    },
  },
  "descuentos-de-sueldo": {
    promptOptions: {
      sceneLine:
        "Scene: a simplified worker or visible hands are sorting three payroll deduction categories across one shared row: one mandatory, one consent-based, and one blocked.",
      propsLine:
        "Keep the three panels as part of one payroll review moment, with tiny embedded markers for approved, authorized, and prohibited deductions. The markers must stay secondary and never become badges.",
      compositionLine:
        "Composition: three panels of equal outer size and equal visual weight in one clear row; the markers must clarify category without turning the panels into app buttons, badges, or menu cards.",
      extraLines: [
        "Semantic focus: legal, authorized, and prohibited payroll deductions.",
        "The image must read as classification, not as one generic payroll panel.",
        "The three panels should feel like part of a real payroll decision moment, not UI components or a compliance poster.",
      ],
      negativeLine:
        "Do not add extra objects beyond the three panels and the three simple markers. Avoid app-button styling, rounded UI chips, menu-card aesthetics, floating labels, or dashboard tiles.",
    },
  },
  "donde-ver-si-estoy-en-dicom-gratis": {
    promptOptions: {
      sceneLine:
        "Scene: three flat report cards partially overlapped under one large magnifier.",
      propsLine:
        "Keep the front report brighter than the two rear cards to signal comparison without adding logos.",
      extraLines: ["Semantic focus: checking debt status across several report sources for free."],
      negativeLine:
        "Do not add extra objects beyond the three report cards and the magnifier.",
    },
  },
  "el-poder-del-interes-compuesto": {
    promptOptions: {
      sceneLine:
        "Scene: a stepped contribution staircase feeding one tall curved growth arc and a final large savings block.",
      propsLine:
        "Use only flat steps, one growth arc, and one final block at the top-right of the scene.",
      extraLines: ["Semantic focus: long-term compounding from repeated small contributions."],
      negativeLine:
        "Do not add extra objects beyond the steps, growth arc, and final savings block.",
    },
  },
  "estafas-financieras-chile-vishing-smishing-marketplace": {
    promptOptions: {
      sceneLine:
        "Scene: one smartphone receiving three flat alert shapes from different channels: call, message, and marketplace badge.",
      propsLine:
        "Use only the phone silhouette and the three incoming alert shapes with no logos or brand signals.",
      extraLines: ["Semantic focus: multi-channel scam detection within the first 24 hours."],
      negativeLine:
        "Do not add extra objects beyond the smartphone and the three alert shapes.",
    },
  },
  "finiquito-e-indemnizaciones-en-chile": {
    promptOptions: {
      sceneLine:
        "Scene: one closing folder with a checklist block stack and a signature line.",
      propsLine:
        "Use only the folder silhouette, the checklist bars, and one simple signing stroke.",
      extraLines: ["Semantic focus: reviewing a severance settlement before signing."],
      negativeLine:
        "Do not add extra objects beyond the folder, checklist bars, and signature line.",
    },
  },
  "fondos-mutuos-comisiones-rescate-impuestos": {
    promptOptions: {
      sceneLine:
        "Scene: one flat fund statement page with a fee funnel on the left and an exit tray on the right.",
      propsLine:
        "Use only the document, one funnel shape, one payout tray, and two small cost blocks between them.",
      extraLines: ["Semantic focus: fees, redemption, and taxes inside mutual funds."],
      negativeLine:
        "Do not add extra objects beyond the statement, funnel, payout tray, and cost blocks.",
    },
  },
  "fonasa-vs-isapre-comparativa": {
    promptOptions: {
      sceneLine:
        "Scene: two flat health cards balanced on a central axis with equal visual weight.",
      propsLine:
        "Use only the central axis, the two cards, and one small geometric medical cross above them.",
      extraLines: ["Semantic focus: comparing Fonasa and Isapre without implying one premium default."],
      negativeLine:
        "Do not add extra objects beyond the axis, two cards, and medical cross.",
    },
  },
  "fraude-tarjeta-que-hacer": {
    promptOptions: {
      sceneLine:
        "Scene: one blocked card shape beside a compact claim document and an alert badge.",
      propsLine:
        "Use only the card, the document, and one sharp alert badge to suggest the first 24-hour response.",
      extraLines: ["Semantic focus: immediate response to an unrecognized card charge."],
      negativeLine:
        "Do not add extra objects beyond the card, claim document, and alert badge.",
    },
  },
  "indemnizacion-anos-de-servicio-chile": {
    promptOptions: {
      sceneLine:
        "Scene: one employment timeline bar built from annual blocks ending in a final payout block.",
      propsLine:
        "Use only the timeline bar, the annual blocks, and one final settlement block at the right end.",
      extraLines: ["Semantic focus: years-of-service accumulation leading to severance pay."],
      negativeLine:
        "Do not add extra objects beyond the timeline bar, annual blocks, and payout block.",
    },
  },
  "informe-deudas-cmf-vs-dicom": {
    promptTrack: "B",
    promptOptions: {
      sceneLine:
        "Scene: a simplified person, visible hand, or partial figure is comparing two debt report sheets through one large magnifier, with the report cards remaining the dominant objects.",
      propsLine:
        "Keep the overlap crisp and geometric so the comparison reads instantly at thumbnail size. The report cards must read as simple report sheets, not app cards or mobile screens.",
      compositionLine:
        "Composition: the magnifier and two report cards occupy the left-center of the canvas; one card slightly in front of the other; right third clean solid background only.",
      extraLines: [
        "Semantic focus: distinguishing the CMF debt report from DICOM-style records.",
        "The image must communicate comparison and clarity, never panic or punishment.",
        "The overlap should feel investigative and neutral, not alarming or accusatory.",
      ],
      negativeLine:
        "Avoid warning sirens, prison metaphors, chains, crushed figures, red-alert drama, or mobile-app card styling.",
    },
  },
  "interes-compuesto-nota-metodologica": {
    promptOptions: {
      sceneLine:
        "Scene: one flat methodology board with a grid, stepped accumulation bars, and a final result block.",
      propsLine:
        "Use only the board, the grid lines, the stepped bars, and one final output block.",
      extraLines: ["Semantic focus: methodology and assumptions behind a compound-interest simulation."],
      negativeLine:
        "Do not add extra objects beyond the board, grid, bars, and output block.",
    },
  },
  "licencia-medica-desde-que-dia-pagan": {
    promptOptions: {
      sceneLine:
        "Scene: one horizontal calendar strip built from equal day blocks, with one contiguous leave band and one clearly marked payment-start block.",
      propsLine:
        "Use only the calendar strip, the payment-start block, and one smaller continuity marker. Keep every day cell rectangular and evenly spaced.",
      compositionLine:
        "Composition: the calendar strip occupies the left-center and reads horizontally in one glance; the payment-start block must stand out immediately from the other leave days.",
      extraLines: [
        "Semantic focus: subsidy payment starting day within a medical leave period.",
        "The image must explain timing, not illness or medical treatment.",
        "The reader should understand the exact start moment within a sequence of days, not a generic health concept.",
      ],
      negativeLine:
        "Do not add extra objects beyond the calendar strip and the two markers. Avoid hospital beds, medicine, doctors, faces, bodily suffering cues, or agenda-app styling.",
    },
  },
  "liquidacion-de-sueldo": {
    promptTrack: "B",
    promptOptions: {
      sceneLine:
        "Scene: a simplified worker is auditing a payroll document, with one tall payslip sheet as the main object and a magnifier revealing three key internal lines.",
      propsLine:
        "Use the payroll sheet as the focal object, with the magnifier and three highlighted bars embedded inside the same document.",
      compositionLine:
        "Composition: the payroll sheet and magnifier occupy the left-center; the three highlighted lines must feel embedded in the document, not like separate UI rows; right third clean solid background only.",
      extraLines: [
        "Semantic focus: auditing the key lines of a pay stub.",
        "The image must feel like document inspection, not gross-to-net calculation.",
        "The document should read as one inspected payroll artifact, never as a phone screen or dashboard panel.",
      ],
      negativeLine:
        "Do not add extra objects beyond the payroll sheet, magnifier, and highlighted bars. Avoid dashboard panels, list app screens, mobile-device framing, or decorative double borders.",
    },
  },
  "operacion-renta-f22-checklist": {
    promptOptions: {
      sceneLine:
        "Scene: one official rectangular tax-review form with five aligned square check boxes and one review magnifier.",
      propsLine:
        "Use only the form, the five square check boxes, and one compact magnifier over the lower section. Keep the form as one institutional object, not a floating checklist.",
      compositionLine:
        "Composition: the checklist form occupies the left-center and reads as one institutional workflow object; the magnifier stays secondary; right third clean solid background only.",
      extraLines: [
        "Semantic focus: reviewing, sending, and rectifying the F22 without mistakes.",
        "The image must feel methodical and official, not casual productivity UI.",
        "The check boxes must feel embedded in an official process form, not in a personal to-do app.",
      ],
      negativeLine:
        "Do not add extra objects beyond the form, check boxes, and magnifier. Avoid app-like to-do list aesthetics, soft paper texture, office stationery scenes, or floating productivity cards.",
    },
  },
  "prepago-credito-cuando-conviene-chile": {
    promptOptions: {
      sceneLine:
        "Scene: a descending staircase of debt blocks beside one calendar page.",
      propsLine:
        "Use only the debt staircase, the calendar page, and one small savings arrow pointing downward.",
      extraLines: ["Semantic focus: deciding whether an early prepayment reduces enough interest."],
      negativeLine:
        "Do not add extra objects beyond the debt staircase, calendar page, and savings arrow.",
    },
  },
  "primer-empleo-chile-guia-completa": {
    promptTrack: "A",
    promptOptions: {
      sceneLine:
        "Scene: a simplified person is stepping through an open doorway into a first-job moment, holding one contract page as the dominant financial object.",
      propsLine:
        "Keep the contract page clearly visible, with the doorway acting as the contextual cue for entering working life.",
      compositionLine:
        "Composition: place the figure and doorway in the left or center-left area so the forward motion feels optimistic and immediate.",
      extraLines: [
        "Semantic focus: entering a first job and understanding what the contract and legal deductions mean.",
      ],
      negativeLine:
        "Avoid pension-planning symbolism, generic office stock scenes, celebratory confetti, or corporate onboarding aesthetics.",
    },
  },
  "que-es-la-uf": {
    promptTrack: "C",
    promptOptions: {
      sceneLine:
        "Scene: one indexed unit marker beside a slim calendar strip with upward daily ticks, arranged so the daily progression feels clear and consequential rather than purely symbolic.",
      extraLines: [
        "Semantic focus: the UF as a daily indexed unit that affects common payments.",
        "Use the daily rise and the contract-time cue as the tension device.",
      ],
      negativeLine:
        "Avoid stock market dashboards, currency-symbol clutter, or generic fintech iconography.",
    },
  },
  "reajuste-arriendo-uf-ipc-chile": {
    promptTrack: "C",
    promptOptions: {
      sceneLine:
        "Scene: one house outline connected to an upward contract line and a calendar tick, arranged so the adjustment over time feels contractual and consequential, not like a generic housing icon.",
      extraLines: ["Semantic focus: rent adjustment by UF or IPC depending on the contract."],
      negativeLine:
        "Avoid generic real-estate marketing cues, mortgage dashboards, or decorative skyline motifs.",
    },
  },
  "renegociacion-superir": {
    promptOptions: {
      sceneLine:
        "Scene: two flat debt documents meeting at one central agreement bar.",
      propsLine:
        "Use only the two documents, the central agreement bar, and one small stabilization block underneath.",
      extraLines: ["Semantic focus: formal debt renegotiation for structural over-indebtedness."],
      negativeLine:
        "Do not add extra objects beyond the two documents, agreement bar, and stabilization block.",
    },
  },
  "reforma-previsional-2025-que-cambia-y-como-te-afecta": {
    promptOptions: {
      sceneLine:
        "Scene: one horizontal reform timeline with a present block, a future block, and a central gear node.",
      propsLine:
        "Use only the timeline rail, the two time blocks, one gear node, and one pension shield at the far end.",
      extraLines: ["Semantic focus: staged pension reform implementation over time."],
      negativeLine:
        "Do not add extra objects beyond the timeline rail, time blocks, gear node, and pension shield.",
    },
  },
  "rentas-mixtas-sueldo-honorarios": {
    promptOptions: {
      sceneLine:
        "Scene: two separate income sheets converging into one tax form block.",
      propsLine:
        "Use only the two input sheets, the central merge path, and the final tax form block.",
      extraLines: ["Semantic focus: combining salary and honorarios into one annual tax declaration."],
      negativeLine:
        "Do not add extra objects beyond the two income sheets, merge path, and final form block.",
    },
  },
  "seguro-cesantia-cuenta-individual-vs-fondo-solidario": {
    promptOptions: {
      sceneLine:
        "Scene: two payout containers side by side feeding one shared safety rail.",
      propsLine:
        "Use only the two containers, the safety rail, and one small flow connector from each source.",
      extraLines: ["Semantic focus: comparing the individual unemployment account with the solidarity fund."],
      negativeLine:
        "Do not add extra objects beyond the two containers, safety rail, and flow connectors.",
    },
  },
  "seguro-de-cesantia": {
    promptOptions: {
      sceneLine:
        "Scene: one unemployment account statement with stepped withdrawal bars.",
      propsLine:
        "Use only the statement page, the stepped withdrawal bars, and one compact balance block.",
      extraLines: ["Semantic focus: checking unemployment balance, eligibility, and payout sequence."],
      negativeLine:
        "Do not add extra objects beyond the statement page, withdrawal bars, and balance block.",
    },
  },
  "suplantacion-identidad-creditos-no-reconocidos": {
    promptOptions: {
      sceneLine:
        "Scene: one cracked identity card beside a warning document and a compact shield block.",
      propsLine:
        "Use only the ID card, the warning document, and the shield block with no faces or realistic features.",
      extraLines: ["Semantic focus: identity theft detection and immediate containment."],
      negativeLine:
        "Do not add extra objects beyond the ID card, warning document, and shield block.",
    },
  },
  "tarjeta-credito-costo-real-chile": {
    promptOptions: {
      sceneLine:
        "Scene: one credit card shape feeding a long payment path that ends in a larger total-cost block.",
      propsLine:
        "Use only the card, the payment path, and the final larger cost block.",
      extraLines: ["Semantic focus: the hidden long-term cost of revolving card debt."],
      negativeLine:
        "Do not add extra objects beyond the card, payment path, and total-cost block.",
    },
  },
  "utm-chile-que-es-como-funciona": {
    promptTrack: "C",
    promptOptions: {
      sceneLine:
        "Scene: one fiscal reference disc beside a restrained rising monthly line, arranged so the monthly reference function feels official and practical rather than speculative.",
      backgroundNote: "Mostly flat color background with one gentle grounding shape if it improves hierarchy. No gradients, no grain, and no texture noise.",
      extraLines: [
        "Semantic focus: the UTM as a monthly fiscal reference unit.",
        "Use the monthly cadence as the anchor, not a trader-chart aesthetic.",
      ],
      noTextLine:
        "No text, no letters, no numbers, no currency symbols ($, €, %) anywhere in the image.",
      negativeLine: "Avoid trader dashboards, stock-app styling, currency-symbol clutter, or speculative-finance cues.",
    },
  },
};

function mergePromptOptions(baseOptions, variantOptions) {
  if (!baseOptions && !variantOptions) return undefined;
  return {
    ...(baseOptions ?? {}),
    ...(variantOptions ?? {}),
    extraLines: [
      ...((baseOptions?.extraLines ?? []).filter(Boolean)),
      ...((variantOptions?.extraLines ?? []).filter(Boolean)),
    ],
  };
}

function maybeInjectHumanAnchor(plan) {
  const promptTrack = normalizePromptTrack(plan.promptTrack, defaultPromptTrackForRule(plan));

  if (plan.template !== "A" || promptTrack === "C") {
    return {
      ...plan,
      promptTrack,
    };
  }

  if (sceneAlreadyHasHumanAnchor(plan.promptOptions)) {
    return {
      ...plan,
      promptTrack,
    };
  }

  const humanizedSceneLine = humanizeSceneLine(plan.promptOptions?.sceneLine, promptTrack);

  return {
    ...plan,
    promptTrack,
    promptOptions: mergePromptOptions(plan.promptOptions, {
      sceneLine: humanizedSceneLine,
      propsLine: softenObjectOnlyPropsLine(plan.promptOptions?.propsLine),
      humanAnchorLine: buildAutoHumanAnchorLine(
        promptTrack,
        plan.semantic,
        Boolean(humanizedSceneLine)
      ),
    }),
  };
}

function applyArticlePromptVariant(article, plan) {
  const variant = ARTICLE_PROMPT_VARIANTS[article.slug];
  if (!variant) return maybeInjectHumanAnchor(plan);

  return maybeInjectHumanAnchor({
    ...plan,
    promptTrack: normalizePromptTrack(variant.promptTrack, plan.promptTrack ?? "A"),
    postura: variant.postura ?? plan.postura,
    objetos: variant.objetos ?? plan.objetos,
    icon: variant.icon ?? plan.icon,
    promptOptions: mergePromptOptions(plan.promptOptions, variant.promptOptions),
    promptOverride: variant.promptOverride ?? plan.promptOverride,
  });
}

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
      promptTrack: normalizePromptTrack(
        slugOverride.promptTrack,
        defaultPromptTrackForRule(slugOverride)
      ),
      semantic,
      matchedKeywords: slugOverride.overrideKeywords,
    };
    return applyArticlePromptVariant(article, {
      ...basePlan,
      template: slugOverride.template,
      approvedModelId: overrideModel.id,
      sceneId: buildArticleSceneId(slugOverride.template, overrideModel.id, article.slug),
      postura: slugOverride.postura ?? overrideModel.postura,
      objetos: slugOverride.objetos ?? overrideModel.objetos,
      icon: slugOverride.icon ?? overrideModel.icono,
      sceneChoice: overrideModel.label,
      promptOptions: slugOverride.promptOptions,
      ...(slugOverride.promptOverride ? { promptOverride: slugOverride.promptOverride } : {}),
    });
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
    promptTrack: defaultPromptTrackForRule(rule),
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
    return applyArticlePromptVariant(article, {
      ...basePlan,
      template: "A",
      approvedModelId: approvedModel.id,
      sceneId: buildArticleSceneId("A", approvedModel.id, article.slug),
      postura: approvedModel.postura,
      objetos: approvedModel.objetos,
      sceneChoice: approvedModel.label,
    });
  }

  return applyArticlePromptVariant(article, {
    ...basePlan,
    template: rule.template,
    approvedModelId: approvedModel.id,
    sceneId: buildArticleSceneId(rule.template, approvedModel.id, article.slug),
    icon: approvedModel.icono,
    iconChoice: approvedModel.label,
  });
}

export function buildPromptFromPlan(plan) {
  if (plan.promptOverride) {
    return plan.promptOverride;
  }
  if (plan.template === "A") {
    return buildPromptA(plan.hex, plan.postura, plan.objetos, plan.promptOptions);
  }
  if (plan.template === "C") {
    return buildPromptC(plan.hex, plan.icon, plan.promptOptions);
  }
  return buildPromptB(plan.hex, plan.icon, plan.promptOptions);
}
