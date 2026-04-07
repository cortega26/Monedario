// src/tools/hero-images/config.mjs

export const SITE_NAME = "Monedario";

// Sistema de color canónico — sincronizado con global.css
// REGLA: usar solo colores oscuros o saturados — los colores claros (#f1f5f9 etc.)
// producen fondos con gradientes no controlados en gpt-image-1.
export const COLORS = {
  "navy-profundo": {
    hex: "#1a4f8a",
    label: "Navy principal",
    uso: "Sueldo, impuestos, AFP, crédito — artículos de peso institucional",
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
// Define el lenguaje visual propio de Monedario — no modificar sin revisión editorial.
const STYLE_ANCHOR = `STYLE: Monedario Flat Editorial — the proprietary visual language of monedario.cl.
Flat 2D vector illustration. Deep solid background. One bold primary geometric form in white or light figure color, occupying 50–60% of the frame height. One supporting element. One accent detail only.
VISUAL GRAMMAR: every image is a visual sentence — a primary subject and a visible action (arrow, cut, overlap, separation, growth, comparison). The action must be immediately readable without labels.
WEIGHT AND CHARACTER: forms are architectural, weighted, and precise — not decorative, not cute, not illustrative. Think editorial diagram, not icon pack.
BACKGROUND: one single completely flat solid color fill — zero gradients, zero noise, zero vignette, zero texture, zero glow.
COMPLEXITY: maximum 3 distinct visual objects. Repeating elements that form a single visual unit (grouped bars, document lines, grid cells, staircase steps) count as one object.
LEGIBILITY: the financial concept must be identifiable at 300×170px thumbnail size. One unambiguous focal point — the supporting element must never compete with the primary form.`;

// Señal de industria y audiencia
const INDUSTRY_SIGNAL = `This image appears on monedario.cl, a Chilean personal finance education website. Readers range from 18-year-olds entering the workforce for the first time to adults approaching retirement — no financial literacy assumed. The image must communicate the core financial concept in under 3 seconds, without text, labels, or captions. A first-time viewer with no prior context must identify the topic area instantly.`;

// Reglas de composición — Template A (escenas narrativas)
const COMPOSITION_RULES = `COMPOSITION: landscape 16:9 format. Primary subject anchored in the left or center-left third of the frame. Right third is deliberately clean empty space reserved for text overlay in post-production. One unambiguous focal point — the supporting element must not compete with the primary form for visual weight.`;

// Prohibiciones absolutas — no negociar
const NEVER = `NEVER include: text, letters, numbers, words, labels, or any symbol that reads as text. NEVER use gradients, color transitions, or tints within any single element. NEVER use more than 3 distinct visual objects. NEVER use photorealistic textures, materials, or lighting. NEVER use drop shadows, glow, blur, or any 3D effect. NEVER use decorative, organic, or ornamental detail.`;

// ─── TEMPLATE A: Escena con metáfora narrativa (artículos principales) ─────────
export function buildPromptA(colorKey, escena, nota = "") {
  const c = COLORS[colorKey];
  if (!c) throw new Error(`Color key "${colorKey}" no existe en COLORS`);

  return `${STYLE_ANCHOR}

${INDUSTRY_SIGNAL}

BACKGROUND COLOR: solid flat fill ${c.hex} — this exact hex, uniform edge to edge, zero variation.
PRIMARY FORM: ${escena}
Render all forms as clean bold vector shapes in ${c.figura}.
Use ${c.acento} sparingly on one single accent detail only — never on the primary form.
Use ${c.detalle} for one structural dark plane that adds weight — flat, never shadowed.

${nota ? `CREATIVE DIRECTION: ${nota}` : ""}

${COMPOSITION_RULES}

Mood: authoritative clarity. The image feels like a well-designed explanation — confident, structured, trustworthy. Not alarming, not clinical, not corporate.

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
Render as one large bold ${c.figura} vector form. Geometric, not decorative. Occupies 40–50% of frame height. The icon IS the entire message — it requires no caption.
One accent detail only in ${c.acento}.

${nota ? `CREATIVE DIRECTION: ${nota}` : ""}

COMPOSITION: icon perfectly centered, generous equal padding on all sides.
Mood: precision and immediacy — the form is self-explanatory.

${NEVER}`;
}

// ─── TEMPLATE C: Fondo para texto superpuesto (Canva/Figma) ───────────────────
export function buildPromptC(
  colorKey,
  patron = "subtle geometric grid",
  nota = ""
) {
  const c = COLORS[colorKey];
  if (!c) throw new Error(`Color key "${colorKey}" no existe en COLORS`);

  return `${STYLE_ANCHOR}

BACKGROUND COLOR: solid flat fill ${c.hex} — uniform, zero variation.
SUBTLE PATTERN: ${patron} rendered in ${c.detalle} at approximately 8% opacity — nearly invisible, sensed not seen.
NO focal element. NO subject. NO icons. Pure texture background layer for post-production text overlay.

${nota ? `CREATIVE DIRECTION: ${nota}` : ""}

COMPOSITION: uniform edge-to-edge coverage, no focal point, no vignette.
Purpose: background layer for text and UI overlay in post-production.

${NEVER} No focal point. No subject matter. No icons.`;
}

// ─── ESCENAS CANÓNICAS ─────────────────────────────────────────────────────────
// Organizadas por cluster editorial del sitio.
// REGLA DE COLOR: usar solo colores oscuros — navy, slate, indigo, teal, amber, forest.
// cream-claro (#f1f5f9) está ELIMINADO — produce BACKGROUND failures en gpt-image-1.
// REGLA DE ESCENA: máximo 3 objetos visuales distintos. Elementos repetidos que forman
// una unidad (barras agrupadas, líneas de documento, pasos de escalera) cuentan como 1.
// REGLA DE NOTA: solo art direction — qué enfatizar y por qué. Nunca re-explicar la escena.

export const SCENE_LIBRARY = {
  // ── SUELDO Y REMUNERACIONES ──────────────────────────────────────────────────
  "sueldo-remuneraciones": [
    {
      slug: "como-calcular-sueldo-liquido",
      label: "Sueldo líquido",
      template: "A",
      colorKey: "navy-profundo",
      escena:
        "a bold circular coin disc form on the left, with three horizontal bars of decreasing length stacked vertically on the right — top bar is longest in figura color, middle bar is medium in figura color, bottom bar is shortest in acento color",
      nota: "The shrinking bars are the argument — each step down is a deduction, no explanation needed. Bottom bar in accent color is the point of arrival: the take-home amount. Coin establishes the monetary context without any text or currency symbol.",
    },
    {
      slug: "liquidacion-de-sueldo",
      label: "Liquidación",
      template: "A",
      colorKey: "slate-neutro",
      escena:
        "a clean rectangular payslip document with five horizontal lines of varying length inside it, and a bold magnifying glass overlaid on the lower half of the document",
      nota: "Document is the primary form. Magnifying glass = careful examination and verification, not suspicion or investigation. The action is understanding what is already there — scrutiny in service of knowledge.",
    },
    {
      slug: "cuanto-descuenta-la-afp-de-tu-sueldo",
      label: "Descuento AFP",
      template: "A",
      colorKey: "navy-profundo",
      escena:
        "a wide horizontal rectangle representing a full salary, split cleanly by a bold vertical cut — the smaller right portion is detached and falls away with a downward arrow below it, becoming a visually separated deducted amount",
      nota: "The cut and the falling portion are the entire story — no containers or vessels needed. The separation IS the deduction. The falling arrow gives the detached piece a clear destination: away from the worker's pocket and into the pension fund.",
    },
    {
      slug: "descuentos-de-sueldo",
      label: "Descuentos legales",
      template: "A",
      colorKey: "slate-neutro",
      escena:
        "three clean horizontal bars stacked vertically — top bar is full width in figura color, middle bar is 70% width in acento color, bottom bar is 40% width in detalle color — all bars the same height, each bar a single flat solid color with zero internal variation",
      nota: "Width encodes importance — broadest means mandatory and unavoidable. Three tiers, three colors, decreasing: the classification reads as a hierarchy at a glance, not a chart. No shade variation within any single bar.",
    },
  ],

  // ── PENSIONES Y AFP ──────────────────────────────────────────────────────────
  "pensiones-afp": [
    {
      slug: "fondos-afp-a-b-c-d-e",
      label: "Fondos A–E",
      template: "A",
      colorKey: "navy-profundo",
      escena:
        "exactly five — not four, not six, exactly five — clean vertical bars of strictly increasing heights from left to right. All bars identical width, equally spaced. Color assignment: bar 1 (shortest, leftmost) is #4a9edd; bar 2 is #0d3060; bar 3 is #0d3060; bar 4 is #0d3060; bar 5 (tallest, rightmost) is #ffffff. Every bar is a single flat solid color with zero internal variation. One thin flat horizontal baseline plane in #0d3060 running under all five bars. No arrows, no curves, no lines, no sixth bar.",
      nota: "The accent color on the shortest bar marks the entry point — most conservative, most common starting place. The white tallest bar is aspirational — highest potential, highest risk. The three detalle bars form a neutral middle spectrum. No chart axes, no labels, no values. Five bars read as a family. Height is the only message: a spectrum from cautious to bold. No decorative arrows or curves of any kind.",
    },
    {
      slug: "como-cambiarse-de-afp",
      label: "Cambio AFP",
      template: "A",
      colorKey: "teal-confianza",
      escena:
        "two identical clean rectangular blocks side by side, with a bold curved arrow arcing from the top of the left block over to land on top of the right block",
      nota: "Both blocks are equal weight — no hierarchy, no better or worse implied. The arc carries all meaning: smooth, voluntary movement from one to the other. The action is simple, accessible, and reversible.",
    },
    {
      slug: "reforma-previsional-2025-que-cambia-y-como-te-afecta",
      label: "Reforma previsional",
      template: "A",
      colorKey: "indigo-inversion",
      escena:
        "a clean circle outline representing the existing system, with a bold forward-pointing arrow emerging from its right edge and crossing beyond the circle's boundary into open space on the right",
      nota: "The arrow exits the circle — the reform extends past the current system's boundary. No coins, no people, no buildings. Circle = existing structure, exiting arrow = a structural change that goes beyond what is already there.",
    },
    {
      slug: "que-es-la-cuenta-2-afp",
      label: "Cuenta 2",
      template: "A",
      colorKey: "indigo-inversion",
      escena:
        "two clean rectangular slabs stacked vertically — the bottom slab is wider and taller, the top slab is narrower and offset slightly to the right — a bold plus sign floats in the gap between them",
      nota: "Bottom slab is the foundation — heavier, wider, non-optional. Top slab is lighter and offset — it belongs to the worker, not the system. The plus sign is an invitation, not a requirement. Optionality is the concept.",
    },
  ],

  // ── AHORRO E INVERSIÓN ───────────────────────────────────────────────────────
  "ahorro-e-inversion": [
    {
      slug: "ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026",
      label: "Guía general inversión",
      template: "A",
      colorKey: "indigo-inversion",
      escena:
        "a bold ascending staircase of three equal steps — each step taller than the previous, forming a clear upward progression from left to right — a small accent circle rests on the topmost step as a destination marker",
      nota: "Steps represent the progression from basic savings to advanced investment instruments. Not a chart — a journey with a clear direction and a reachable destination. Three steps communicates accessible, not overwhelming.",
    },
    {
      slug: "que-es-el-apv",
      label: "APV",
      template: "A",
      colorKey: "indigo-inversion",
      escena:
        "a bold shield outline with a small upward-growing sprout shape centered inside it — the shield represents protection, the sprout represents voluntary pension growth happening inside the protected layer",
      nota: "Shield = tax protection. Sprout = long-term growth happening inside the protection, not despite it. The sprout is intentionally small — early stage, not yet matured. This is a patient instrument, not an instant return.",
    },
    {
      slug: "deposito-a-plazo-uf-vs-pesos",
      label: "DAP UF vs Pesos",
      template: "A",
      colorKey: "slate-neutro",
      escena:
        "two identical clean rectangular blocks of the same height, connected at the top by a thin horizontal bar and a small triangular fulcrum at the center forming a perfect balance scale in equilibrium — the left block has a small circle accent on its surface, the right block is plain",
      nota: "The level bar is the key message: neither instrument is universally better — context decides. The only visual difference between the blocks is the accent circle on the left. Neither side tips. The decision is the reader's, not the image's.",
    },
    {
      slug: "el-poder-del-interes-compuesto",
      label: "Interés compuesto",
      template: "A",
      colorKey: "indigo-inversion",
      escena:
        "a single bold exponential curve in figura color — thin at the bottom-left, sweeping upward steeply and growing progressively thicker toward the upper-right, ending nearly vertical",
      nota: "The curve alone makes the argument. No coins, no charts, no annotations behind it. The growing line weight reinforces the acceleration. Start slow, end steep — that IS compound interest. One form, one idea.",
    },
    {
      slug: "fondos-mutuos-comisiones-rescate-impuestos",
      label: "Fondos mutuos",
      template: "A",
      colorKey: "indigo-inversion",
      escena:
        "a clean circle divided into four equal pie segments — one segment is pulled outward and slightly separated from the circle, highlighted in acento color, representing a redemption extraction from the portfolio",
      nota: "The extracted segment breaks the symmetry of the whole circle — that disruption IS the rescate concept. The circle had integrity until one part was pulled out. The separation creates the visual tension that tells the story.",
    },
    {
      slug: "como-invertir-en-etfs-desde-chile",
      label: "ETFs",
      template: "A",
      colorKey: "indigo-inversion",
      escena:
        "a minimal globe wireframe — a circle outline with two or three horizontal latitude lines only — with a single bold straight arrow crossing horizontally through its center from left to right",
      nota: "Globe is context, arrow is the action. The arrow crosses the globe without detour — direct, accessible, no intermediary. No continents, no country borders, no flags — a pure geometric wireframe. International access made simple.",
    },
  ],

  // ── IMPUESTOS ────────────────────────────────────────────────────────────────
  "impuestos-personas": [
    {
      slug: "operacion-renta-f22-checklist",
      label: "F22 Operación Renta",
      template: "A",
      colorKey: "slate-neutro",
      escena:
        "a clean rectangular form document with three rows — each row has a small square checkbox on the left and a horizontal line on the right — top two checkboxes are filled solid, the bottom checkbox is empty with an accent color circle highlighting it",
      nota: "Two checked boxes signal progress already made. The empty highlighted box is the reader's one remaining action. That single incomplete box creates the action tension that drives the article — and the reassurance that completion is close.",
    },
    {
      slug: "devolucion-impuestos-fechas-compensaciones",
      label: "Devolución impuestos",
      template: "A",
      colorKey: "forest-ahorro",
      escena:
        "a bold rightward arrow with a small calendar rectangle at its tail end — the calendar shows a simple grid of lines — and a small circular coin form at the arrowhead",
      nota: "Calendar triggers the movement, coin is the destination. The arrow is the promise: on this specific date, money returns. Forest green signals money arriving, not being deducted — a positive financial event.",
    },
    {
      slug: "boleta-honorarios-2026-retencion-cobertura",
      label: "Boleta honorarios",
      template: "A",
      colorKey: "slate-neutro",
      escena:
        "a clean receipt-style document with four horizontal lines inside, and a bold percentage sign as a large foreground element overlapping the top-right corner of the document",
      nota: "The percentage sign dominates because the retention rate IS the article's central question. Document provides context — a freelancer's work invoice, not a bill. The percentage overlaps and claims authority over the document: it is the number that matters most.",
    },
  ],

  // ── DEUDA Y CRÉDITO ──────────────────────────────────────────────────────────
  "deuda-credito": [
    {
      slug: "cae-costo-real-credito-chile",
      label: "CAE / Costo crédito",
      template: "A",
      colorKey: "amber-alerta",
      escena:
        "a single clean rectangular loan document with four horizontal lines inside — the bottom section has a bold highlighted rectangle in acento color revealing a hidden cost area, as if the fine print is being exposed — a bold magnifying glass overlaid precisely on that highlighted zone",
      nota: "One document, one revelation. The CAE was always in the contract but hidden by complexity. The magnifying glass focuses on what was hiding in plain sight. Amber creates urgency without alarm — this is actionable knowledge, not a warning to avoid.",
    },
    {
      slug: "informe-deudas-cmf-vs-dicom",
      label: "Informe deudas CMF",
      template: "A",
      colorKey: "slate-neutro",
      escena:
        "a clean rectangular report document with four horizontal lines of varying length inside, and a bold circular checkmark badge overlaid on the top-right corner of the document",
      nota: "Document lines are the data, badge is the authority. The checkmark signals official verified status — this is the public registry, not a personal credit score. Trust through institutional weight, not personal judgment.",
    },
    {
      slug: "renegociacion-superir",
      label: "Renegociación Superir",
      template: "A",
      colorKey: "teal-confianza",
      escena:
        "two clean equal rectangular blocks positioned on opposite sides of the frame facing each other, with a bold circular checkmark badge floating at the exact midpoint between them",
      nota: "Two equal parties, one outcome. The blocks are equidistant from the checkmark — no winner, no loser. The agreement IS the product of the mediation. Teal signals a constructive, trust-based resolution.",
    },
  ],

  // ── SEGURIDAD FINANCIERA ─────────────────────────────────────────────────────
  "seguridad-financiera": [
    {
      slug: "fraude-tarjeta-que-hacer",
      label: "Fraude tarjeta",
      template: "A",
      colorKey: "amber-alerta",
      escena:
        "a clean credit card rectangle outline with a bold X mark centered inside it in acento color, and a shield outline in figura color overlaid on top of the card",
      nota: "X inside the card = the fraud event. Shield over it = the response and resolution path. Amber signals urgency without panic — this is actionable, not hopeless. The shield reclaims authority over the card.",
    },
    {
      slug: "estafas-financieras-chile-vishing-smishing-marketplace",
      label: "Estafas digitales",
      template: "A",
      colorKey: "amber-alerta",
      escena:
        "a clean smartphone rectangle outline with a bold triangular warning sign centered inside the screen area — the triangle contains a bold vertical exclamation mark shape — both forms flat and geometric",
      nota: "Phone = universal digital threat vector. Warning triangle = universal danger signal. Their combination identifies digital financial threat immediately. Simplicity IS the message — one surface, one warning, zero ambiguity.",
    },
    {
      slug: "suplantacion-identidad-creditos-no-reconocidos",
      label: "Suplantación identidad",
      template: "A",
      colorKey: "amber-alerta",
      escena:
        "two identical ID card rectangle outlines — one solid in the foreground positioned normally, one semi-transparent offset diagonally behind and to the right — representing a duplicate shadow identity",
      nota: "The shadow duplicate IS the impersonation. Front card = the victim's identity. Offset ghost = the attacker using it without permission. Semi-transparency signals falseness without requiring text. Amber = threat requiring immediate action.",
    },
  ],

  // ── UF / INFLACIÓN ───────────────────────────────────────────────────────────
  "uf-costo-de-vida": [
    {
      slug: "que-es-la-uf",
      label: "Qué es la UF",
      template: "A",
      colorKey: "navy-profundo",
      escena:
        "a bold circular form with a small upward arrow emerging directly from its upper-right edge — the arrow and circle form one continuous unified outline, as if the arrow grows from the circle itself",
      nota: "The arrow is non-detachable from the circle — the daily upward adjustment IS the UF's nature, built in, not applied externally. One unified form communicates the concept: a monetary unit that automatically adjusts with inflation.",
    },
    {
      slug: "que-es-el-ipc-chile-como-se-calcula",
      label: "IPC / Inflación",
      template: "A",
      colorKey: "navy-profundo",
      escena:
        "a clean shopping basket outline — a simple trapezoid with a handle arc — with a bold upward-pointing arrow rising from inside the basket",
      nota: "Classic inflation basket executed as pure geometry. Basket = the measured consumer goods. Arrow = price level rising from within them. No products, no prices, no coins inside — pure form communicates the concept universally.",
    },
    {
      slug: "reajuste-arriendo-uf-ipc-chile",
      label: "Reajuste arriendo",
      template: "A",
      colorKey: "navy-profundo",
      escena:
        "a minimal house outline — an inverted-V roofline over a rectangular base — with three small horizontal bars ascending like a staircase from left to right inside the house shape, each step higher than the previous",
      nota: "House shape establishes rental context immediately. Ascending staircase inside = periodic rent increases over renewal periods. Each step is one adjustment cycle. Purely geometric — no lease documents, no keys, no people.",
    },
  ],

  // ── EMPLEO E INGRESOS ────────────────────────────────────────────────────────
  "empleo-ingresos": [
    {
      slug: "seguro-de-cesantia",
      label: "Seguro cesantía",
      template: "A",
      colorKey: "teal-confianza",
      escena:
        "a clean safety net shape — five or six horizontal parallel lines spanning the width, curved downward in the center like a taut net — with a single bold circle above it representing a person or asset being caught safely",
      nota: "The net is already curved — it has already caught the load, not waiting to catch it. Reassurance over alarm: the safety net is active and proven. Teal reinforces trust and protection. This image must feel like relief, not warning.",
    },
    {
      slug: "finiquito-e-indemnizaciones-en-chile",
      label: "Finiquito",
      template: "A",
      colorKey: "slate-neutro",
      escena:
        "a clean rectangular document form with four horizontal lines inside and a long horizontal line at the bottom representing a signature line — a bold diagonal pen shape crosses over the signature line at an angle",
      nota: "The pen crossing the signature line is the definitive moment — the finiquito is being signed right now. Pen diagonal = active, in-motion. This is completion and closure, not termination or loss.",
    },
    {
      slug: "licencia-medica-desde-que-dia-pagan",
      label: "Licencia médica",
      template: "A",
      colorKey: "teal-confianza",
      escena:
        "a clean calendar grid — a rectangle divided into rows and columns of small squares — with one cell highlighted in acento color, and a bold medical cross shape overlaid on top of that highlighted cell",
      nota: "The highlighted cell locates the medical event in time — this specific day is the answer to the article's question. Medical cross on the highlighted cell = from this day, pay begins. Calendar grid = bureaucratic precision paired with the reassurance of a clear answer.",
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
  const r = Math.min(
    255,
    Math.round(((n >> 16) & 255) + (255 - ((n >> 16) & 255)) * amount)
  );
  const g = Math.min(
    255,
    Math.round(((n >> 8) & 255) + (255 - ((n >> 8) & 255)) * amount)
  );
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
