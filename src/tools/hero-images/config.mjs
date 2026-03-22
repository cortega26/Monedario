// src/tools/hero-images/config.mjs

export const SITE_NAME = "Monedario";

// Sistema de color canónico — sincronizado con global.css
// REGLA: usar solo colores oscuros o saturados — los colores claros (#f1f5f9 etc.)
// producen fondos con gradientes no controlados en gpt-image-1.
export const COLORS = {
  "navy-profundo": {
    hex: "#1a4f8a",
    label: "Navy principal",
    uso: "Sueldo, impuestos, AFP, crédito — artículos de peso",
    figura: "#ffffff",
    acento: "#4a9edd",
    detalle: "#0d3060",
  },
  "teal-confianza": {
    hex: "#0d9488",
    label: "Teal acción",
    uso: "Seguridad financiera, protección, herramientas, cesantía",
    figura: "#ffffff",
    acento: "#ccfbf1",
    detalle: "#065f52",
  },
  "slate-neutro": {
    hex: "#1e293b",
    label: "Slate editorial",
    uso: "Conceptos complejos, glosario, marco legal, liquidaciones",
    figura: "#f8fafc",
    acento: "#4a9edd",
    detalle: "#0f172a",
  },
  "indigo-inversion": {
    hex: "#312e81",
    label: "Indigo profundo",
    uso: "Inversión, APV, fondos mutuos, ETFs, interés compuesto",
    figura: "#e0e7ff",
    acento: "#818cf8",
    detalle: "#1e1b4b",
  },
  "amber-alerta": {
    hex: "#92400e",
    label: "Amber precaución",
    uso: "Fraude, estafas, alertas, DICOM, deuda problemática",
    figura: "#fef3c7",
    acento: "#f59e0b",
    detalle: "#78350f",
  },
  "forest-ahorro": {
    hex: "#14532d",
    label: "Forest ahorro",
    uso: "Ahorro, presupuesto, devolución impuestos, finiquito positivo",
    figura: "#dcfce7",
    acento: "#4ade80",
    detalle: "#052e16",
  },
};

// Ancla de estilo — va en TODOS los prompts
// Explícita y repetitiva a propósito — gpt-image-1 necesita refuerzo
const STYLE_ANCHOR = `Flat 2D editorial vector illustration. Scandinavian minimal financial design.
BACKGROUND: one single completely flat solid color fill — zero gradients, zero noise, zero vignette, zero texture, zero glow.
STYLE: clean geometric vector shapes only — zero 3D, zero drop shadows, zero glassmorphism, zero photorealism, zero blur.
COMPLEXITY: maximum 3 distinct visual elements total — one dominant, one supporting, one accent detail.`;

// Señal de industria — Chilean personal finance context
const INDUSTRY_SIGNAL = `This image is for a Chilean personal finance education website. The visual must immediately communicate financial concepts — money management, savings, taxes, or employment — not technology, healthcare, or generic business.`;

// Reglas de composición fijas
const COMPOSITION_RULES = `COMPOSITION: landscape 3:2 format. Main subject positioned in the left or center-left third of the frame. Right third is deliberately empty clean space for text overlay. One clear focal point only.`;

// Prohibiciones absolutas
const NEVER = `NEVER include: text, letters, numbers, words, labels, or symbols that read as text. NEVER use gradients or color transitions. NEVER use more than 3 visual elements. NEVER use photorealistic textures. NEVER use drop shadows or 3D effects.`;

// ─── TEMPLATE A: Escena con metáfora (artículos principales) ──────────────────
export function buildPromptA(colorKey, escena, nota = "") {
  const c = COLORS[colorKey];
  if (!c) throw new Error(`Color key "${colorKey}" no existe en COLORS`);

  return `${STYLE_ANCHOR}

${INDUSTRY_SIGNAL}

BACKGROUND COLOR: solid flat fill ${c.hex} — this exact hex, uniform edge to edge, no variation.
PRIMARY ELEMENT: ${escena}
Render the primary element as clean bold vector shapes in ${c.figura}.
Use ${c.acento} sparingly on one single accent detail only.
Use ${c.detalle} for one subtle dark edge or depth plane — flat, not shadowed.

${nota ? `CREATIVE DIRECTION: ${nota}` : ""}

${COMPOSITION_RULES}

Mood: calm financial confidence, clarity, approachability.

${NEVER}`;
}

// ─── TEMPLATE B: Ícono editorial (calculadoras, herramientas) ─────────────────
export function buildPromptB(colorKey, icono, nota = "") {
  const c = COLORS[colorKey];
  if (!c) throw new Error(`Color key "${colorKey}" no existe en COLORS`);

  return `${STYLE_ANCHOR}

${INDUSTRY_SIGNAL}

BACKGROUND COLOR: solid flat fill ${c.hex} — uniform, zero variation.
SINGLE ICON: ${icono}
Render as one large bold clean ${c.figura} vector form. Geometric, not decorative. Occupies 40–50% of frame height.
One accent detail only in ${c.acento}.

${nota ? `CREATIVE DIRECTION: ${nota}` : ""}

COMPOSITION: icon perfectly centered, generous equal padding on all sides.
Mood: tool-like precision, immediate visual recognition.

${NEVER}`;
}

// ─── TEMPLATE C: Fondo para texto superpuesto (Canva/Figma) ───────────────────
export function buildPromptC(colorKey, patron = "subtle geometric grid", nota = "") {
  const c = COLORS[colorKey];
  if (!c) throw new Error(`Color key "${colorKey}" no existe en COLORS`);

  return `${STYLE_ANCHOR}

BACKGROUND COLOR: solid flat fill ${c.hex} — uniform, zero variation.
SUBTLE PATTERN: ${patron} rendered in ${c.detalle} at approximately 8% opacity — nearly invisible, only sensed not seen.
NO focal element. NO subject. NO icons. Pure texture background layer only.

${nota ? `CREATIVE DIRECTION: ${nota}` : ""}

COMPOSITION: uniform edge-to-edge coverage, no focal point, no vignette.
Purpose: background layer for text and UI overlay in post-production.

${NEVER} No focal point. No subject matter. No icons.`;
}

// ─── ESCENAS CANÓNICAS ─────────────────────────────────────────────────────────
// Organizadas por cluster editorial del sitio.
// REGLA DE COLOR: usar solo colores oscuros — navy, slate, indigo, teal, amber, forest.
// cream-claro (#f1f5f9) está ELIMINADO — produce BACKGROUND failures en gpt-image-1.

export const SCENE_LIBRARY = {

  // ── SUELDO Y REMUNERACIONES ──────────────────────────────────────────────────
  "sueldo-remuneraciones": [
    {
      slug: "como-calcular-sueldo-liquido",
      label: "Sueldo líquido",
      template: "A",
      colorKey: "navy-profundo",
      escena: "a bold Chilean peso coin symbol on the left, with three horizontal white bars of decreasing length stacked vertically on the right — the top bar is longest (gross salary), middle is medium (after deductions), bottom is shortest and highlighted in teal (net salary received)",
      nota: "The three bars and peso symbol together communicate salary calculation immediately. The shrinking bars ARE the deduction logic.",
    },
    {
      slug: "liquidacion-de-sueldo",
      label: "Liquidación",
      template: "A",
      colorKey: "slate-neutro",
      escena: "a clean rectangular payslip document with five horizontal lines of varying length inside it, and a bold magnifying glass overlaid on the lower half of the document",
      nota: "Audit and verification of a financial document. Document is primary, magnifying glass shows scrutiny.",
    },
    {
      slug: "cuanto-descuenta-la-afp-de-tu-sueldo",
      label: "Descuento AFP",
      template: "A",
      colorKey: "navy-profundo",
      escena: "a wide horizontal rectangle representing a salary bar, with a clean vertical cut separating a smaller portion on the right — the separated portion has a downward arrow pointing into a small circular savings vessel below it",
      nota: "Money being deducted from salary into a pension fund. The cut and arrow are the story.",
    },
    {
      slug: "descuentos-de-sueldo",
      label: "Descuentos legales",
      template: "A",
      colorKey: "slate-neutro",
      escena: "three clean horizontal bars stacked vertically with clear space between them — top bar is full width labeled implicitly as mandatory, middle bar is 70% width as voluntary, bottom bar is 40% width as prohibited — each bar a slightly different shade",
      nota: "Three tiers of deductions. The decreasing width IS the classification hierarchy.",
    },
  ],

  // ── PENSIONES Y AFP ──────────────────────────────────────────────────────────
  "pensiones-afp": [
    {
      slug: "fondos-afp-a-b-c-d-e",
      label: "Fondos A–E",
      template: "A",
      colorKey: "navy-profundo",
      escena: "five clean vertical bars of strictly decreasing heights from left to right — leftmost bar is tallest and boldest (aggressive fund A), rightmost is shortest and thinnest (conservative fund E) — bars in graduated shades from bright to muted",
      nota: "The five bars ARE the five funds. Height equals risk/return. Abstract, not a data chart.",
    },
    {
      slug: "como-cambiarse-de-afp",
      label: "Cambio AFP",
      template: "A",
      colorKey: "teal-confianza",
      escena: "two identical clean rectangular blocks side by side, with a bold curved arrow arcing from the top of the left block over to land on top of the right block",
      nota: "Simple portability metaphor. The arc IS the transfer. Both blocks are equal — no better/worse implied.",
    },
    {
      slug: "reforma-previsional-2025-que-cambia-y-como-te-afecta",
      label: "Reforma previsional",
      template: "A",
      colorKey: "indigo-inversion",
      escena: "a clean circle (clock face) with two bold hands indicating time, with a bold upward-right arrow emerging from the circle's right edge indicating forward change",
      nota: "Time moving forward plus positive change direction. No coins, no people, no buildings.",
    },
    {
      slug: "que-es-la-cuenta-2-afp",
      label: "Cuenta 2",
      template: "A",
      colorKey: "indigo-inversion",
      escena: "two clean rectangular slabs stacked vertically — the bottom slab is wider and taller representing the mandatory AFP account, the top slab is narrower and slightly offset to the right representing the voluntary layer — a bold plus sign floats between them",
      nota: "Two account layers clearly distinct. Bottom is foundation, top is the voluntary addition.",
    },
  ],

  // ── AHORRO E INVERSIÓN ───────────────────────────────────────────────────────
  "ahorro-e-inversion": [
    {
      slug: "ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026",
      label: "Guía general inversión",
      template: "A",
      colorKey: "indigo-inversion",
      escena: "a clean upward-trending line chart with three distinct data points marked as bold circles — each circle slightly larger than the previous — representing growth over time across different investment instruments",
      nota: "Growth trajectory with distinct milestones. The ascending line with three nodes represents diversified instruments over time.",
    },
    {
      slug: "que-es-el-apv",
      label: "APV",
      template: "A",
      colorKey: "indigo-inversion",
      escena: "a bold shield outline on the left with a small upward-growing sprout shape centered inside it — the shield represents protection, the sprout represents voluntary growth",
      nota: "Protected voluntary savings. Shield = tax benefit protection. Sprout = pension growth.",
    },
    {
      slug: "deposito-a-plazo-uf-vs-pesos",
      label: "DAP UF vs Pesos",
      template: "A",
      colorKey: "slate-neutro",
      escena: "two identical clean rectangular blocks side by side connected at the top by a thin horizontal balance beam — the left block has a small circle accent (representing UF), the right block is plain (representing pesos) — the beam is perfectly level",
      nota: "Equal comparison scale. Neither side tips — the decision depends on inflation context.",
    },
    {
      slug: "el-poder-del-interes-compuesto",
      label: "Interés compuesto",
      template: "A",
      colorKey: "indigo-inversion",
      escena: "a single bold exponential curve starting thin and flat at the bottom-left, sweeping upward steeply toward the upper-right — the curve starts in accent color and ends in the figure color, growing visibly thicker as it rises",
      nota: "The curve alone tells the compound interest story. No coins, no people, no charts behind it.",
    },
    {
      slug: "fondos-mutuos-comisiones-rescate-impuestos",
      label: "Fondos mutuos",
      template: "A",
      colorKey: "indigo-inversion",
      escena: "a clean circle divided into four equal pie segments — one segment is pulled outward and slightly separated from the circle, highlighted in the accent color, representing a redemption or extraction from a diversified portfolio",
      nota: "Portfolio allocation with one segment being extracted. The pulled segment = rescate concept.",
    },
    {
      slug: "como-invertir-en-etfs-desde-chile",
      label: "ETFs",
      template: "A",
      colorKey: "indigo-inversion",
      escena: "a minimal globe wireframe (just the outline circle and two or three latitude lines) with a single bold straight arrow crossing horizontally through its center from left to right — representing cross-border investment access",
      nota: "Global reach from Chile. Arrow crosses the globe = international ETF access. Globe is wireframe only — no continents, no detail.",
    },
  ],

  // ── IMPUESTOS ────────────────────────────────────────────────────────────────
  "impuestos-personas": [
    {
      slug: "operacion-renta-f22-checklist",
      label: "F22 Operación Renta",
      template: "A",
      colorKey: "slate-neutro",
      escena: "a clean rectangular form document with three rows — each row has a small square checkbox on the left and a horizontal line on the right — top two checkboxes are filled solid, the bottom checkbox is empty and highlighted with an accent color circle around it",
      nota: "Two done, one pending. The empty highlighted checkbox creates the action tension that drives the article.",
    },
    {
      slug: "devolucion-impuestos-fechas-compensaciones",
      label: "Devolución impuestos",
      template: "A",
      colorKey: "forest-ahorro",
      escena: "a bold rightward arrow with a small calendar rectangle at its tail end — the calendar shows a simple grid of lines — and a small circular coin form at the arrowhead, representing money returning on a specific date",
      nota: "Date triggers money return. Calendar → arrow → coin. Green/forest color signals positive financial outcome.",
    },
    {
      slug: "boleta-honorarios-2026-retencion-cobertura",
      label: "Boleta honorarios",
      template: "A",
      colorKey: "slate-neutro",
      escena: "a clean receipt-style document with horizontal lines, and a bold percentage sign as a large foreground element overlapping the top-right corner of the document",
      nota: "The retention percentage IS the hero. Document provides context. Percentage symbol dominates.",
    },
  ],

  // ── DEUDA Y CRÉDITO ──────────────────────────────────────────────────────────
  "deuda-credito": [
    {
      slug: "cae-costo-real-credito-chile",
      label: "CAE / Costo crédito",
      template: "A",
      colorKey: "amber-alerta",
      escena: "two clean rectangular loan document forms side by side — the left document is simple and plain, the right document has a large bold highlighted rectangle at the bottom revealing a hidden cost area in amber accent color — a small magnifying glass hovers over the right document",
      nota: "The hidden cost revelation is the message. Right document reveals what left document hides.",
    },
    {
      slug: "informe-deudas-cmf-vs-dicom",
      label: "Informe deudas CMF",
      template: "A",
      colorKey: "slate-neutro",
      escena: "a clean rectangular report document with four horizontal lines of text represented as bars, and a bold circular checkmark badge overlaid on the top-right corner of the document",
      nota: "Official verified financial report. The checkmark badge signals trust and official status.",
    },
    {
      slug: "renegociacion-superir",
      label: "Renegociación Superir",
      template: "A",
      colorKey: "teal-confianza",
      escena: "two clean rectangular blocks facing each other from opposite sides — a bold horizontal line extends from each block toward the center where they meet and connect — above the connection point is a small circular checkmark indicating agreement reached",
      nota: "Two parties reaching agreement. The meeting point with checkmark = successful mediation.",
    },
  ],

  // ── SEGURIDAD FINANCIERA ─────────────────────────────────────────────────────
  "seguridad-financiera": [
    {
      slug: "fraude-tarjeta-que-hacer",
      label: "Fraude tarjeta",
      template: "A",
      colorKey: "amber-alerta",
      escena: "a clean credit card rectangle outline — inside it, a bold X mark in amber accent color — overlaid on top of the card, a shield outline in the figure color providing protection context",
      nota: "Card fraud (X) plus protection response (shield). Amber urgency, shield offers resolution path.",
    },
    {
      slug: "estafas-financieras-chile-vishing-smishing-marketplace",
      label: "Estafas digitales",
      template: "A",
      colorKey: "amber-alerta",
      escena: "a clean smartphone rectangle outline with a bold triangular warning sign centered inside the screen area — the triangle has an exclamation mark shape inside it — both forms are geometric and flat",
      nota: "Phone as the attack vector, warning triangle as the threat signal. Clean and immediately alarming.",
    },
    {
      slug: "suplantacion-identidad-creditos-no-reconocidos",
      label: "Suplantación identidad",
      template: "A",
      colorKey: "amber-alerta",
      escena: "two identical ID card rectangle outlines — one solid and positioned normally, one semi-transparent and offset diagonally behind and slightly to the right of the first — representing a duplicate or shadow identity",
      nota: "The offset duplicate IS the impersonation metaphor. One real, one shadow.",
    },
  ],

  // ── UF / INFLACIÓN ───────────────────────────────────────────────────────────
  "uf-costo-de-vida": [
    {
      slug: "que-es-la-uf",
      label: "Qué es la UF",
      template: "A",
      colorKey: "navy-profundo",
      escena: "a bold circular coin-like form with a small upward arrow integrated into its upper-right edge — the circle represents the UF unit, the arrow represents its daily upward adjustment with inflation",
      nota: "The UF as an adjustable unit. Circle = monetary unit, integrated arrow = automatic daily adjustment.",
    },
    {
      slug: "que-es-el-ipc-chile-como-se-calcula",
      label: "IPC / Inflación",
      template: "A",
      colorKey: "navy-profundo",
      escena: "a clean shopping basket outline — a simple trapezoid with a handle arc — with a bold upward-pointing arrow rising from inside the basket, representing the price level of consumer goods increasing",
      nota: "Classic inflation basket metaphor executed minimally. Basket = consumer goods, arrow = price rise.",
    },
    {
      slug: "reajuste-arriendo-uf-ipc-chile",
      label: "Reajuste arriendo",
      template: "A",
      colorKey: "navy-profundo",
      escena: "a minimal house outline — an inverted V roofline with a rectangle below for walls — inside the house shape, three small horizontal bars step upward like a staircase from left to right, representing rent increasing over time",
      nota: "House = rent context, ascending bars inside = periodic adjustment upward. Purely geometric.",
    },
  ],

  // ── EMPLEO E INGRESOS ────────────────────────────────────────────────────────
  "empleo-ingresos": [
    {
      slug: "seguro-de-cesantia",
      label: "Seguro cesantía",
      template: "A",
      colorKey: "teal-confianza",
      escena: "a clean safety net shape — five or six horizontal parallel lines spanning the width, slightly curved downward in the center like a hammock or net — with a single bold circle above it representing a person or asset being caught",
      nota: "Safety net catching something that fell. The net curves = it has caught the load. Reassuring and protective.",
    },
    {
      slug: "finiquito-e-indemnizaciones-en-chile",
      label: "Finiquito",
      template: "A",
      colorKey: "slate-neutro",
      escena: "a clean rectangular document form with four horizontal lines inside and a long horizontal line at the bottom representing a signature line — a bold diagonal pen shape crosses over the signature line",
      nota: "The signing moment. Document with signature line and pen = final settlement document being signed.",
    },
    {
      slug: "licencia-medica-desde-que-dia-pagan",
      label: "Licencia médica",
      template: "A",
      colorKey: "teal-confianza",
      escena: "a clean calendar grid — a rectangle divided into rows and columns of small squares — with one cell highlighted in the accent color, and a bold medical cross shape overlaid on top of that highlighted cell",
      nota: "Specific date plus medical event. The highlighted cell with cross = the day the medical leave starts and pay begins.",
    },
  ],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

// UI helpers ───────────────────────────────────────────────────────────────────

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
