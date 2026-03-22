// src/pages/calculadoras/hero-images/config.mjs

export const SITE_NAME = "Monedario";

// Sistema de color canonico — sincronizado con global.css
export const COLORS = {
  "navy-profundo": {
    hex: "#1a4f8a",
    label: "Navy principal",
    uso: "Artículos de peso: impuestos, AFP, crédito",
    figura: "#ffffff",
    acento: "#4a9edd",
    detalle: "#0d3060",
  },
  "teal-confianza": {
    hex: "#0d9488",
    label: "Teal acción",
    uso: "Seguridad financiera, protección, herramientas",
    figura: "#ffffff",
    acento: "#f0fdf4",
    detalle: "#065f52",
  },
  "slate-neutro": {
    hex: "#1e293b",
    label: "Slate editorial",
    uso: "Conceptos complejos, glosario, marco legal",
    figura: "#f8fafc",
    acento: "#4a9edd",
    detalle: "#0f172a",
  },
  "cream-claro": {
    hex: "#f1f5f9",
    label: "Cream accessible",
    uso: "Calculadoras, guías prácticas, sueldo",
    figura: "#1a4f8a",
    acento: "#0d9488",
    detalle: "#334155",
  },
  "indigo-inversion": {
    hex: "#312e81",
    label: "Indigo profundo",
    uso: "Inversión, APV, fondos mutuos, ETFs",
    figura: "#e0e7ff",
    acento: "#818cf8",
    detalle: "#1e1b4b",
  },
  "amber-alerta": {
    hex: "#92400e",
    label: "Amber precaución",
    uso: "Fraude, estafas, alertas, DICOM",
    figura: "#fef3c7",
    acento: "#f59e0b",
    detalle: "#78350f",
  },
};

// Ancla de estilo — va en TODOS los prompts
const STYLE_ANCHOR = `Flat editorial vector illustration. Scandinavian minimal financial design. Clean solid background, simple geometric forms, one dominant shape with one supporting element. Professional and approachable, not corporate. Zero photorealism.`;

// Reglas de composición fijas
const COMPOSITION_RULES = `16:9 landscape format. Main subject positioned center-left third. Right side deliberately open — clean negative space for text overlay. One clear focal point. Balanced whitespace.`;

// Lo que nunca debe aparecer
const NEVER = `No text, no letters, no numbers, no words. No gradients. No drop shadows. No more than 3 visual elements total. No photorealistic textures. No complex backgrounds. No multiple small icons scattered. No busy compositions.`;

// ─── TEMPLATE A: Escena con metáfora (artículos principales) ───────────────
export function buildPromptA(colorKey, escena, nota = "") {
  const c = COLORS[colorKey];
  if (!c) throw new Error(`Color key "${colorKey}" no existe en COLORS`);

  return `${STYLE_ANCHOR}

Background: solid fill ${c.hex}.
Primary form: ${escena} — rendered as clean white (${c.figura}) vector shape, bold and simple.
Accent color: ${c.acento} used sparingly on one detail only.
Deep tone: ${c.detalle} for subtle depth on one edge or shadow plane.

${COMPOSITION_RULES}

Mood: calm confidence, financial literacy, clarity.
${nota ? `Art direction note: ${nota}` : ""}

${NEVER}`;
}

// ─── TEMPLATE B: Ícono editorial (calculadoras, herramientas) ──────────────
export function buildPromptB(colorKey, icono, nota = "") {
  const c = COLORS[colorKey];
  if (!c) throw new Error(`Color key "${colorKey}" no existe en COLORS`);

  return `${STYLE_ANCHOR}

Background: solid ${c.hex}.
Single centered icon: ${icono} — drawn as large, bold, clean ${c.figura} vector form. Geometric, not decorative. Occupies 40–50% of frame height.
One accent detail in ${c.acento}.

Composition: icon perfectly centered, generous padding all sides. Symmetric and still.
Mood: tool-like precision, immediate recognition.
${nota ? `Art direction note: ${nota}` : ""}

${NEVER}`;
}

// ─── TEMPLATE C: Patrón de fondo (para texto superpuesto en Canva/Figma) ───
export function buildPromptC(colorKey, patron = "subtle geometric grid", nota = "") {
  const c = COLORS[colorKey];
  if (!c) throw new Error(`Color key "${colorKey}" no existe en COLORS`);

  return `${STYLE_ANCHOR}

Solid background: ${c.hex}.
Very subtle repeating pattern: ${patron} in ${c.detalle} at 8% opacity. Pattern should be nearly invisible, only sensed not seen.
No focal element. No subject. Pure texture layer.

Composition: uniform edge-to-edge, no gradient, no vignette.
Purpose: this image will have text and UI overlaid in post-production.
${nota ? `Art direction note: ${nota}` : ""}

${NEVER} No focal point. No subject matter.`;
}

// ─── ESCENAS CANÓNICAS ──────────────────────────────────────────────────────
// Organizadas por cluster editorial del sitio

export const SCENE_LIBRARY = {

  // SUELDO Y REMUNERACIONES
  "sueldo-remuneraciones": [
    {
      slug: "como-calcular-sueldo-liquido",
      label: "Sueldo líquido",
      template: "A",
      colorKey: "cream-claro",
      escena: "a clean document sheet with three horizontal lines representing salary items, with a bold downward arrow below indicating the final net amount",
      nota: "The document is the hero, arrow is secondary. Conveys deductions leading to a final number.",
    },
    {
      slug: "liquidacion-de-sueldo",
      label: "Liquidación",
      template: "A",
      colorKey: "cream-claro",
      escena: "a payslip document folded at an angle, showing clean horizontal lines, with a magnifying glass hovering over it",
      nota: "Audit / review feeling. Document is primary form.",
    },
    {
      slug: "cuanto-descuenta-la-afp-de-tu-sueldo",
      label: "Descuento AFP",
      template: "A",
      colorKey: "navy-profundo",
      escena: "a clean rectangle (salary bar) with a precise slice being separated from it, the slice moving toward a small circular coin form",
      nota: "Abstract but immediately readable: money being deducted.",
    },
    {
      slug: "descuentos-de-sueldo",
      label: "Descuentos legales",
      template: "A",
      colorKey: "slate-neutro",
      escena: "three clean horizontal bars of decreasing length stacked vertically, representing legal, voluntary, and prohibited deductions",
      nota: "Hierarchy of bars = hierarchy of deduction types.",
    },
  ],

  // PENSIONES Y AFP
  "pensiones-afp": [
    {
      slug: "fondos-afp-a-b-c-d-e",
      label: "Fondos A–E",
      template: "A",
      colorKey: "navy-profundo",
      escena: "five vertical bars of graduated heights from tall to short, each slightly different shade, representing risk spectrum from aggressive to conservative",
      nota: "The bar chart IS the metaphor. Keep it abstract, not data-viz.",
    },
    {
      slug: "como-cambiarse-de-afp",
      label: "Cambio AFP",
      template: "A",
      colorKey: "teal-confianza",
      escena: "two clean rectangular blocks side by side with a clean curved arrow flowing from left block to right block",
      nota: "Transition / portability. Simple movement metaphor.",
    },
    {
      slug: "reforma-previsional-2025-que-cambia-y-como-te-afecta",
      label: "Reforma previsional",
      template: "A",
      colorKey: "indigo-inversion",
      escena: "a clock face simplified to just the circle and two hands, with a small upward arrow beside it indicating change over time",
      nota: "Time + change. Do not add coins or people.",
    },
    {
      slug: "que-es-la-cuenta-2-afp",
      label: "Cuenta 2",
      template: "A",
      colorKey: "indigo-inversion",
      escena: "two stacked rectangular layers, the bottom larger (mandatory account), the top smaller and offset (voluntary layer), with a small plus symbol between them",
      nota: "Layered savings. Abstract, no currency symbols.",
    },
  ],

  // AHORRO E INVERSIÓN
  "ahorro-e-inversion": [
    {
      slug: "ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026",
      label: "Guía general inversión",
      template: "A",
      colorKey: "indigo-inversion",
      escena: "a simple upward-trending line on a clean plane, ending in a circle point, with three small geometric shapes below representing different instrument types",
      nota: "Growth + diversity. Line is the hero.",
    },
    {
      slug: "que-es-el-apv",
      label: "APV",
      template: "A",
      colorKey: "indigo-inversion",
      escena: "a clean shield shape with a small leaf or sprout inside, representing protected voluntary growth",
      nota: "Protection + growth. Shield should feel financial not security-tech.",
    },
    {
      slug: "deposito-a-plazo-uf-vs-pesos",
      label: "DAP UF vs Pesos",
      template: "A",
      colorKey: "slate-neutro",
      escena: "two identical rectangular blocks side by side, one with a small UF symbol-like form, one plain, with a balance scale beam connecting them at the top",
      nota: "Comparison / scale. Equal weight but different nature.",
    },
    {
      slug: "el-poder-del-interes-compuesto",
      label: "Interés compuesto",
      template: "A",
      colorKey: "indigo-inversion",
      escena: "a smooth exponential curve rising from bottom-left to upper-right, starting thin and ending bold, representing compound acceleration",
      nota: "The curve alone tells the story. No coins, no people.",
    },
    {
      slug: "fondos-mutuos-comisiones-rescate-impuestos",
      label: "Fondos mutuos",
      template: "A",
      colorKey: "indigo-inversion",
      escena: "a clean circle divided into three or four segments like a pie, with one segment slightly pulled out, representing portfolio allocation",
      nota: "Diversification metaphor. Keep segments clean and bold.",
    },
    {
      slug: "como-invertir-en-etfs-desde-chile",
      label: "ETFs",
      template: "A",
      colorKey: "indigo-inversion",
      escena: "a globe outline with a single clean arrow crossing its equator from left to right, representing international access",
      nota: "Global reach. Globe should be minimal — wireframe not detailed.",
    },
  ],

  // IMPUESTOS
  "impuestos-personas": [
    {
      slug: "operacion-renta-f22-checklist",
      label: "F22 Operación Renta",
      template: "A",
      colorKey: "slate-neutro",
      escena: "a clean form document with three checkboxes, two checked, one highlighted with an accent circle, representing a checklist in progress",
      nota: "Action in progress. The unchecked box is the focal tension.",
    },
    {
      slug: "devolucion-impuestos-fechas-compensaciones",
      label: "Devolución impuestos",
      template: "A",
      colorKey: "teal-confianza",
      escena: "a clean rightward arrow with a calendar grid simplified to a small rectangle with lines, positioned at the arrowhead",
      nota: "Date + return direction. Optimistic tone via teal.",
    },
    {
      slug: "boleta-honorarios-2026-retencion-cobertura",
      label: "Boleta honorarios",
      template: "A",
      colorKey: "slate-neutro",
      escena: "a receipt-style document with a bold percentage symbol as the dominant form, document sits behind it slightly",
      nota: "The retention rate is the hero concept.",
    },
  ],

  // DEUDA Y CRÉDITO
  "deuda-credito": [
    {
      slug: "cae-costo-real-credito-chile",
      label: "CAE / Costo crédito",
      template: "A",
      colorKey: "amber-alerta",
      escena: "two identical loan documents side by side, with a magnifying glass revealing that the right one has a larger hidden cost area highlighted",
      nota: "Hidden cost revelation. The reveal IS the message.",
    },
    {
      slug: "informe-deudas-cmf-vs-dicom",
      label: "Informe deudas CMF",
      template: "A",
      colorKey: "slate-neutro",
      escena: "a clean rectangular report sheet with a single bold horizontal line list, and a verified checkmark overlaid on the top-right corner",
      nota: "Official document + verification. Trust signal.",
    },
    {
      slug: "renegociacion-superir",
      label: "Renegociación Superir",
      template: "A",
      colorKey: "teal-confianza",
      escena: "two blocks facing each other with a mediating line between them meeting at center, representing negotiation and agreement",
      nota: "Mediation / bridge metaphor. Neutral, hopeful.",
    },
  ],

  // SEGURIDAD FINANCIERA
  "seguridad-financiera": [
    {
      slug: "fraude-tarjeta-que-hacer",
      label: "Fraude tarjeta",
      template: "A",
      colorKey: "amber-alerta",
      escena: "a credit card form with a bold X and a shield overlaid on it, the X in amber accent and the shield in the primary figure color",
      nota: "Alert + protection. Amber conveys urgency without panic.",
    },
    {
      slug: "estafas-financieras-chile-vishing-smishing-marketplace",
      label: "Estafas digitales",
      template: "A",
      colorKey: "amber-alerta",
      escena: "a phone outline with a warning triangle centered inside it, both forms clean and geometric",
      nota: "Digital threat. Phone is the vector, triangle is the alert.",
    },
    {
      slug: "suplantacion-identidad-creditos-no-reconocidos",
      label: "Suplantación identidad",
      template: "A",
      colorKey: "amber-alerta",
      escena: "two overlapping ID card outlines, one slightly offset and translucent, representing duplication or impersonation",
      nota: "Duality / shadow identity. Offset is the storytelling device.",
    },
  ],

  // UF / INFLACIÓN
  "uf-costo-de-vida": [
    {
      slug: "que-es-la-uf",
      label: "Qué es la UF",
      template: "A",
      colorKey: "navy-profundo",
      escena: "a bold UF-like circular symbol with a small rising arrow integrated into its form, clean and icon-like",
      nota: "Abstract currency unit feeling. No Chilean peso symbol.",
    },
    {
      slug: "que-es-el-ipc-chile-como-se-calcula",
      label: "IPC / Inflación",
      template: "A",
      colorKey: "navy-profundo",
      escena: "a clean shopping basket outline with a small upward arrow rising from inside it, representing rising prices",
      nota: "Classic inflation metaphor executed minimally.",
    },
    {
      slug: "reajuste-arriendo-uf-ipc-chile",
      label: "Reajuste arriendo",
      template: "A",
      colorKey: "navy-profundo",
      escena: "a house outline with a small rising bar chart element inside, the bars stepping upward",
      nota: "Home + increasing cost. House is minimal — roof + walls only.",
    },
  ],

  // EMPLEO E INGRESOS
  "empleo-ingresos": [
    {
      slug: "seguro-de-cesantia",
      label: "Seguro cesantía",
      template: "A",
      colorKey: "teal-confianza",
      escena: "a clean safety net form — horizontal parallel lines creating a net shape — with a single dot above it representing protection",
      nota: "Safety net metaphor, literal but abstracted. Reassuring tone.",
    },
    {
      slug: "finiquito-e-indemnizaciones-en-chile",
      label: "Finiquito",
      template: "A",
      colorKey: "slate-neutro",
      escena: "a document with a signature line at the bottom and a clean pen form crossing it, representing document signing",
      nota: "Signing moment. The pen is the action, document is context.",
    },
    {
      slug: "licencia-medica-desde-que-dia-pagan",
      label: "Licencia médica",
      template: "A",
      colorKey: "teal-confianza",
      escena: "a calendar grid with one cell highlighted and a clean medical cross form overlaid on that cell",
      nota: "Date + medical. Calendar is primary, cross is secondary.",
    },
  ],
};

// Helpers para la UI ──────────────────────────────────────────────────────────

export function getAllScenes() {
  return Object.entries(SCENE_LIBRARY).flatMap(([cluster, scenes]) =>
    scenes.map(s => ({ ...s, cluster }))
  );
}

export function getSceneBySlug(slug) {
  return getAllScenes().find(s => s.slug === slug) ?? null;
}

export function buildPromptFromScene(scene) {
  const { template, colorKey, escena, nota } = scene;
  if (template === "A") return buildPromptA(colorKey, escena, nota);
  if (template === "B") return buildPromptB(colorKey, escena, nota);
  if (template === "C") return buildPromptC(colorKey, escena, nota);
  throw new Error(`Template "${template}" no reconocido`);
}

// Derivaciones de color (UI helpers) ─────────────────────────────────────────

export function lightenHex(hex, amount = 0.3) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) + (255 - ((n >> 16) & 255)) * amount));
  const g = Math.min(255, Math.round(((n >> 8) & 255) + (255 - ((n >> 8) & 255)) * amount));
  const b = Math.min(255, Math.round((n & 255) + (255 - (n & 255)) * amount));
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, "0")).join("")}`;
}

export function darkenHex(hex, amount = 0.3) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.round(((n >> 16) & 255) * (1 - amount)));
  const g = Math.max(0, Math.round(((n >> 8) & 255) * (1 - amount)));
  const b = Math.max(0, Math.round((n & 255) * (1 - amount)));
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, "0")).join("")}`;
}