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

export function buildPromptA(colorKeyOrHex, postura, objetos = "") {
  const hex = resolveHex(colorKeyOrHex);
  return `Flat 2D editorial vector illustration.
Background: solid color ${hex}.
Scene: one geometric human figure ${postura}, shown from behind or as a faceless silhouette.
The figure is near ${objetos}. All objects are flat geometric shapes, same illustration style.
Lighting: none. Flat uniform background only. No shadows, no highlights, no depth.
Color palette: 3 colors maximum, all flat fills.
Composition: all elements within the central 80% of the canvas.
Canvas: 1200x630 pixels, landscape.
Do not add extra objects beyond the named scene props.`;
}

export function buildPromptB(colorKeyOrHex, icono) {
  const hex = resolveHex(colorKeyOrHex);
  return `Flat 2D editorial vector illustration.
Background: solid color ${hex}.
Scene: one simple geometric ${icono} icon, centered.
Color palette: 2 colors maximum, all flat fills.
Canvas: 1200x630 pixels, landscape.`;
}

export function buildPromptC(colorKeyOrHex, icono) {
  const hex = resolveHex(colorKeyOrHex);
  return `Flat 2D editorial vector illustration.
Background: solid color ${hex}
Scene: one simple geometric ${icono} icon, aligned to the right third; keep the left two-thirds of the canvas completely empty for text overlay.
Color palette: 2 colors maximum, all flat fills.
Canvas: 1200x630 pixels, landscape.`;
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
  ],
  B: [
    model("B", "afp-cotizacion", "AFP / Cotizacion", { icono: "pension shield icon" }),
    model("B", "cae-credito-educacion", "CAE / Credito", { icono: "education loan icon" }),
    model("B", "cuenta-corriente-banco", "Cuenta corriente / Banco", {
      icono: "bank account card icon",
    }),
    model("B", "dicom-alerta", "DICOM / Alerta", { icono: "warning document icon" }),
    model("B", "impuesto-documento", "Impuesto / Documento", {
      icono: "tax document icon",
    }),
    model("B", "calculadora-financiera", "Calculadora financiera", {
      icono: "calculator icon",
    }),
    model("B", "salud-documento", "Salud / Documento", { icono: "health document icon" }),
    model("B", "pension-shield", "Pension / Proteccion", { icono: "shield growth icon" }),
  ],
  C: [
    model("C", "uf-indicadores", "UF / Indicadores", { icono: "UF / Indicadores" }),
    model("C", "ipc-indicadores", "IPC / Indicadores", { icono: "IPC / Indicadores" }),
    model("C", "apv-crecimiento", "APV / Crecimiento", { icono: "APV growth icon" }),
    model("C", "ahorro-metas", "Ahorro / Metas", { icono: "savings target icon" }),
    model("C", "sueldo-barras", "Sueldo / Barras", { icono: "salary bars icon" }),
    model("C", "credito-comparador", "Credito / Comparador", { icono: "credit compare icon" }),
    model("C", "cesantia-fondo", "Cesantia / Fondo", { icono: "unemployment fund icon" }),
    model("C", "renta-calendario", "Renta / Calendario", { icono: "tax calendar icon" }),
  ],
};

export function findApprovedPromptModel(template, approvedModelId) {
  return (
    (APPROVED_PROMPT_MODELS[String(template)] ?? []).find(model => model.id === approvedModelId) ??
    null
  );
}
