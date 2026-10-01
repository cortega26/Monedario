export const COLORS = {
  "Fraude / Perdida grave": {
    hex: "#d97706",
    label: "Fraude / Perdida grave",
  },
  "Credito / Deuda / Impuestos / Riesgo": {
    hex: "#d97706",
    label: "Credito / Deuda / Impuestos / Riesgo",
  },
  "Ahorro activo / Metas / Logros": {
    hex: "#059669",
    label: "Ahorro activo / Metas / Logros",
  },
  "Finanzas general / AFP / Empleo / Ahorro": {
    hex: "#0d9488",
    label: "Finanzas general / AFP / Empleo / Ahorro",
  },
  "Educativo / Conceptos / Guias": {
    hex: "#4f46e5",
    label: "Educativo / Conceptos / Guias",
  },
  "Banca / Instituciones / Referencia tecnica": {
    hex: "#475569",
    label: "Banca / Instituciones / Referencia tecnica",
  },
  "Advertencias / Errores comunes": {
    hex: "#b45309",
    label: "Advertencias / Errores comunes",
  },
  "Salud / FONASA / ISAPRE": {
    hex: "#0284c7",
    label: "Salud / FONASA / ISAPRE",
  },
};

function resolveHex(colorKeyOrHex) {
  if (typeof colorKeyOrHex !== "string" || colorKeyOrHex.trim() === "") {
    throw new Error(`Color key "${colorKeyOrHex}" no existe en COLORS`);
  }

  if (colorKeyOrHex.startsWith("#")) {
    return colorKeyOrHex;
  }

  const color = COLORS[colorKeyOrHex];
  if (!color) {
    throw new Error(`Color key "${colorKeyOrHex}" no existe en COLORS`);
  }

  return color.hex;
}

function normalizePromptOptions(options = {}) {
  return {
    styleBaseLine:
      options.styleBaseLine ??
      "Create a flat editorial vector illustration for a trusted personal finance publication.",
    styleGuardLine:
      options.styleGuardLine ??
      "Use simple controlled shapes, a minimal but expressive scene, and a calm human tone. Keep it unmistakably editorial, not photoreal, not stock-finance, and not app-marketing art.",
    backgroundNote:
      options.backgroundNote ??
      "Mostly flat color background with room for one gentle grounding shape or tonal separation if it improves hierarchy. No gradients, no glow, no texture noise, and no glossy effects.",
    sceneLine: options.sceneLine,
    propsLine: Object.prototype.hasOwnProperty.call(options, "propsLine")
      ? options.propsLine
      : undefined,
    humanAnchorLine: options.humanAnchorLine ?? "",
    richnessLine:
      options.richnessLine ??
      "Allow one controlled depth cue through overlap, scale contrast, or a simple grounding shape. Keep the illustration flat but not sterile.",
    lightingLine:
      options.lightingLine ??
      "Lighting: soft and even. One simple shadow block or grounding shape is allowed if it helps hierarchy. No cinematic lighting, no photoreal depth, and no glossy rendering.",
    shapeLine:
      options.shapeLine ??
      "Keep shapes crisp, controlled, and simplified, with enough variation in scale and overlap to feel editorial rather than diagrammatic clipart.",
    paletteLine: options.paletteLine ?? "",
    compositionLine: options.compositionLine ?? "",
    extraLines: Array.isArray(options.extraLines)
      ? options.extraLines.filter(Boolean)
      : [],
    noTextLine:
      options.noTextLine ??
      "No text, no letters, no numbers, no logos, and no symbols that read like UI labels anywhere in the image.",
    canvasLine: options.canvasLine ?? "Canvas: 1200x630 pixels, landscape.",
    negativeLine:
      options.negativeLine ??
      "Avoid photorealism, 3D rendering, CGI, neon, fake UI, clutter, golden-coin finance clichés, and malformed interfaces.",
  };
}

function joinPromptLines(lines) {
  return lines.filter(Boolean).join("\n");
}

export function buildPromptA(colorKeyOrHex, postura, objetos = "", options = {}) {
  const hex = resolveHex(colorKeyOrHex);
  const promptOptions = normalizePromptOptions(options);
  const defaultPropsLine = objetos
    ? `Place one dominant financial object near the figure: ${objetos}. Add at most one supporting contextual cue if it strengthens the moment.`
    : "Include one dominant financial object and keep any supporting cue secondary.";
  const propsLine =
    promptOptions.propsLine === undefined ? defaultPropsLine : promptOptions.propsLine;

  return joinPromptLines([
    promptOptions.styleBaseLine,
    promptOptions.styleGuardLine,
    `Background: solid color ${hex}.${promptOptions.backgroundNote ? ` ${promptOptions.backgroundNote}` : ""}`,
    promptOptions.sceneLine ??
      `Scene: one simplified human figure ${postura}, in a recognizable everyday money situation.`,
    propsLine,
    promptOptions.humanAnchorLine,
    promptOptions.richnessLine,
    promptOptions.lightingLine,
    promptOptions.shapeLine,
    promptOptions.paletteLine ||
      "Color palette: 4 to 5 flat colors maximum. Keep the palette restrained, with one softer accent allowed for warmth or hierarchy.",
    promptOptions.compositionLine ||
      "Composition: build the main action in the left or center-left area, with asymmetry, clear focal hierarchy, and breathing room on the right. Keep key elements inside the safe area.",
    ...promptOptions.extraLines,
    promptOptions.noTextLine,
    promptOptions.canvasLine,
    promptOptions.negativeLine,
  ]);
}

export function buildPromptB(colorKeyOrHex, icono, options = {}) {
  const hex = resolveHex(colorKeyOrHex);
  const promptOptions = normalizePromptOptions(options);

  return joinPromptLines([
    promptOptions.styleBaseLine,
    promptOptions.styleGuardLine,
    `Background: solid color ${hex}.${promptOptions.backgroundNote ? ` ${promptOptions.backgroundNote}` : ""}`,
    promptOptions.sceneLine ??
      `Scene: one clear editorial finance object built around ${icono}, dominant in frame and composed to feel like an article cover rather than a plain centered icon.`,
    promptOptions.humanAnchorLine,
    promptOptions.richnessLine,
    promptOptions.lightingLine,
    promptOptions.shapeLine,
    promptOptions.paletteLine ||
      "Color palette: 3 to 4 flat colors maximum, restrained and high-contrast enough for immediate recognition.",
    promptOptions.compositionLine ||
      "Composition: keep one dominant mechanism or document metaphor, slightly offset rather than perfectly centered, with enough negative space to stay calm.",
    ...promptOptions.extraLines,
    promptOptions.noTextLine,
    promptOptions.canvasLine,
    promptOptions.negativeLine,
  ]);
}

export function buildPromptC(colorKeyOrHex, icono, options = {}) {
  const hex = resolveHex(colorKeyOrHex);
  const promptOptions = normalizePromptOptions(options);

  return joinPromptLines([
    promptOptions.styleBaseLine,
    promptOptions.styleGuardLine,
    `Background: solid color ${hex}.${promptOptions.backgroundNote ? ` ${promptOptions.backgroundNote}` : ""}`,
    promptOptions.sceneLine ??
      `Scene: one strong editorial mechanism built around ${icono}, aligned to the right third of the canvas so the left side remains open for hierarchy or post-production type.`,
    promptOptions.humanAnchorLine,
    promptOptions.richnessLine,
    promptOptions.lightingLine ||
      "Lighting: soft and even. One controlled grounding shape or overlap is allowed. No photoreal depth or cinematic light.",
    promptOptions.shapeLine,
    promptOptions.paletteLine ||
      "Color palette: 3 to 4 flat colors maximum, with one accent allowed to create hierarchy or consequence.",
    promptOptions.compositionLine ||
      "Composition: keep the left two-thirds quiet enough for hierarchy, but make the visible mechanism feel alive through scale contrast or directional tension.",
    ...promptOptions.extraLines,
    promptOptions.noTextLine,
    promptOptions.canvasLine,
    promptOptions.negativeLine,
  ]);
}

function model(template, id, label, fields = {}) {
  return {
    id,
    label,
    sceneId: `${template}:${id}`,
    ...fields,
  };
}

export const APPROVED_PROMPT_MODELS = {
  A: [
    model("A", "fraude-estafa", "Fraude / Estafa", {
      postura: "one hand raised to head",
      objetos: "smartphone alert icon",
    }),
    model("A", "declaracion-renta", "Declaracion / Renta", {
      postura: "seated at a desk reviewing a form",
      objetos: "tax form, calendar marker",
    }),
    model("A", "deuda-credito", "Deuda / Credito", {
      postura: "one hand raised to head",
      objetos: "pile of documents, credit card shape",
    }),
    model("A", "ahorro", "Ahorro / Presupuesto", {
      postura: "standing, reaching forward",
      objetos: "glass jar with coins",
    }),
    model("A", "cesantia", "Cesantia / Ingresos", {
      postura: "seated, shoulders slightly down",
      objetos: "closed laptop, document envelope",
    }),
    model("A", "afp-pension", "AFP / Pension", {
      postura: "standing upright",
      objetos: "shield, upward arrow",
    }),
    model("A", "fonasa-vs-isapre", "Salud / Cobertura", {
      postura: "standing, comparing two cards",
      objetos: "two health cards",
    }),
    model("A", "sueldo-liquido", "Sueldo liquido", {
      postura: "seated at a table, leaning slightly forward",
      objetos: "calculator, stacked papers",
    }),
    model("A", "liquidacion-documento", "Liquidacion", {
      postura: "standing, holding a document",
      objetos: "document sheet, magnifier",
    }),
    model("A", "fondos-afp", "Fondos AFP", {
      postura: "standing, pointing at bars",
      objetos: "five vertical bars",
    }),
    model("A", "cuenta-2-afp", "Cuenta 2 AFP", {
      postura: "standing, reviewing savings",
      objetos: "two layered savings blocks",
    }),
    model("A", "cambio-afp", "Cambio de AFP", {
      postura: "standing, holding two documents and looking between them",
      objetos: "two institution document sheets side by side",
    }),
  ],
  B: [
    model("B", "afp-cotizacion", "AFP / Cotizacion", { icono: "flat shield shape with a small clock dial inside" }),
    model("B", "cae-credito-educacion", "CAE / Credito", { icono: "graduation cap shape above a coin stack" }),
    model("B", "cuenta-corriente-banco", "Cuenta corriente / Banco", {
      icono: "rectangular card shape with two horizontal stripes and a small chip symbol",
    }),
    model("B", "dicom-alerta", "DICOM / Alerta", { icono: "document shape with a bold exclamation mark" }),
    model("B", "impuesto-documento", "Impuesto / Documento", {
      icono: "folded page shape with a percent symbol",
    }),
    model("B", "calculadora-financiera", "Calculadora financiera", {
      icono: "rectangular calculator shape with grid buttons and a display bar",
    }),
    model("B", "salud-documento", "Salud / Documento", { icono: "document shape with a cross symbol" }),
    model("B", "pension-shield", "Pension / Proteccion", { icono: "shield shape with an upward arrow inside" }),
  ],
  C: [
    model("C", "uf-indicadores", "UF / Indicadores", { icono: "rising line chart with a small coin symbol" }),
    model("C", "ipc-indicadores", "IPC / Indicadores", { icono: "bar chart with three rising bars" }),
    model("C", "apv-crecimiento", "APV / Crecimiento", { icono: "upward-trending arrow arcing over a savings stack" }),
    model("C", "ahorro-metas", "Ahorro / Metas", { icono: "target circle with a coin in the center" }),
    model("C", "sueldo-barras", "Sueldo / Barras", { icono: "three vertical bars of ascending heights" }),
    model("C", "credito-comparador", "Credito / Comparador", { icono: "two overlapping rectangles one with a checkmark" }),
    model("C", "cesantia-fondo", "Cesantia / Fondo", { icono: "safety net shape with coins above it" }),
    model("C", "renta-calendario", "Renta / Calendario", { icono: "calendar page with a date circled" }),
  ],
};

export function findApprovedPromptModel(template, approvedModelId) {
  return (
    (APPROVED_PROMPT_MODELS[String(template)] ?? []).find(model => model.id === approvedModelId) ??
    null
  );
}


// v5 article prompts use reviewed briefs; the model catalog above remains only
// for compatibility with the historical, explicitly curated image pool.
export const EDITORIAL_STYLE_VERSION = "monedario-editorial-v5";
export const EDITORIAL_PALETTE = {
  navy: "#16324f",
  teal: "#0d9488",
  paper: "#f5f1e8",
  accent: "#c77b55",
};

export function buildEditorialPrompt(brief) {
  return [
    "Create an original editorial illustration for Monedario, a Chilean personal-finance publication. The cover should help a reader recognize their situation, with clarity, warmth and professional restraint.",
    "Style: simple confident shapes, natural human proportions where people appear, expressive but understated gestures, moderate depth through overlap and soft shadows. Simplified facial features and a subtle paper texture are welcome. Avoid glossy stock-finance or generic app-marketing aesthetics.",
    `Palette: deep navy ${EDITORIAL_PALETTE.navy} and teal ${EDITORIAL_PALETTE.teal}, warm paper ${EDITORIAL_PALETTE.paper}, with a restrained terracotta ${EDITORIAL_PALETTE.accent} accent and natural skin tones. Keep the light background calm; do not paint every surface the category color.`,
    `Reader situation: ${brief.readerNeed}`,
    `Editorial promise: ${brief.editorialPromise}`,
    `Visual message: ${brief.visualMessage}`,
    `Scene: ${brief.scene}`,
    `Essential elements: ${brief.requiredElements.join("; ")}.`,
    `Avoid these interpretations: ${brief.avoidInterpretations.join("; ")}.`,
    "Composition: one clear focal action, purposeful asymmetry, distinguishable silhouettes and generous breathing room. Keep the essential subject inside the central 85% for responsive crops. The situation must remain recognizable at a 300-pixel card width. People belong only when they contribute to the scene; do not add a decorative avatar.",
    "Do not render text, letters, numbers, logos, watermarks, official seals, fabricated financial data or pseudo-legible interfaces. Documents can use simple unlettered marks. Do not use decorative golden coins, guaranteed-gain arrows, trophies or distress caricatures. No black framing bars.",
    "Canvas: 1200x630 pixels, landscape, edge-to-edge illustration. This is an editorial cover, not a data chart; numerical explanations will be rendered separately from verified data.",
  ].join("\n");
}
