// ---------------------------------------------------------------------------
// Formateo de valores monetarios y porcentajes
// ---------------------------------------------------------------------------

export function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CL");
}

export function fmtPct(n: number): string {
  return n.toFixed(2) + "%";
}

// ---------------------------------------------------------------------------
// Fila de detalle reutilizable
// ---------------------------------------------------------------------------

export function buildRow(
  label: string,
  value: string,
  colorClass = ""
): HTMLElement {
  const line = document.createElement("div");
  line.className =
    "flex items-center justify-between border-b border-border py-2 text-sm last:border-0";
  const labelElement = document.createElement("span");
  labelElement.className = "text-secondary";
  labelElement.textContent = label;
  const valueElement = document.createElement("span");
  valueElement.className = `font-mono font-semibold ${colorClass}`.trim();
  valueElement.textContent = value;
  line.append(labelElement, valueElement);
  return line;
}

// ---------------------------------------------------------------------------
// Resultado principal
// ---------------------------------------------------------------------------

export interface EconomicParams {
  uf: number;
  utm: number;
  imm: number;
}

export interface UpdateResultOptions {
  resultado: {
    grossSalary: number;
    taxableSalary: number;
    nonTaxableIncome: number;
    netSalary: number;
    effectiveRates: {
      afpPercent: number;
      healthPercent: number;
      unemploymentInsurancePercent: number;
      marginalTaxPercent: number;
    };
    deductions: {
      afp: number;
      health: number;
      unemploymentInsurance: number;
      tax: number;
      total: number;
      apvRegimenB: number;
    };
    cappedBases: {
      unemploymentInsurance: number;
    };
    contractType: "indefinido" | "plazo-fijo";
  };
  modoLabel: string;
  extraNote?: string;
  otrosDescuentos?: number;
  baseBruto?: number;
  jornadaFraction?: number;
  economicParameters: EconomicParams;
}

export function updateResultDisplay(options: UpdateResultOptions): void {
  const {
    resultado,
    modoLabel,
    extraNote,
    otrosDescuentos,
    baseBruto,
    jornadaFraction,
    economicParameters,
  } = options;

  const netFinal = resultado.netSalary - (otrosDescuentos ?? 0);
  const totalDed = resultado.deductions.total + (otrosDescuentos ?? 0);
  const isInverso = modoLabel === "Sueldo Bruto Estimado";
  const displayAmount = isInverso ? resultado.grossSalary : netFinal;

  // ── HEADLINE ──
  const headline = document.createElement("div");
  headline.className =
    "mb-5 rounded-lg border border-accent/20 bg-accent/10 p-4 text-center";
  const headlineLabel = document.createElement("p");
  headlineLabel.className =
    "mb-1 text-xs font-bold tracking-widest text-accent uppercase";
  headlineLabel.textContent = modoLabel;
  const headlineValue = document.createElement("p");
  headlineValue.className =
    "font-display text-5xl sm:text-6xl font-semibold tabular-nums";
  headlineValue.style.letterSpacing = "-0.02em";
  headlineValue.style.lineHeight = "1";
  headlineValue.textContent = fmt(displayAmount);
  if (isInverso) {
    const headlineSub = document.createElement("p");
    headlineSub.className =
      "mt-2 inline-block rounded-full border border-border bg-surface-muted/60 px-3 py-1 text-xs text-foreground/70";
    headlineSub.textContent = `Bruto estimado para recibir ${fmt(netFinal)} al mes`;
    headline.append(headlineLabel, headlineValue, headlineSub);
  } else {
    headline.append(headlineLabel, headlineValue);
  }

  // ── BARRA APILADA: bruto = descuentos + líquido ──
  const gross = resultado.grossSalary;
  // color: Tailwind class OR null to use cssColor inline style
  const stackSegments: {
    label: string;
    value: number;
    twColor: string | null;
    cssColor: string | null;
  }[] = [
    {
      label: "AFP",
      value: resultado.deductions.afp,
      twColor: "bg-accent",
      cssColor: null,
    },
    {
      label: "Salud",
      value: resultado.deductions.health,
      twColor: "bg-accent/60",
      cssColor: null,
    },
    {
      label: "Imp. 2ª cat.",
      value: resultado.deductions.tax,
      twColor: "bg-accent/35",
      cssColor: null,
    },
    {
      label: "Seg. cesantía",
      value: resultado.deductions.unemploymentInsurance,
      twColor: "bg-accent/15",
      cssColor: null,
    },
  ];
  if (resultado.deductions.apvRegimenB > 0)
    stackSegments.push({
      label: "APV",
      value: resultado.deductions.apvRegimenB,
      twColor: "bg-accent/10",
      cssColor: null,
    });
  if (otrosDescuentos && otrosDescuentos > 0)
    stackSegments.push({
      label: "Otros",
      value: otrosDescuentos,
      twColor: "bg-accent/8",
      cssColor: null,
    });
  // Líquido uses teal (accent-2) so it's clearly distinct from all deduction segments
  stackSegments.push({
    label: "Líquido",
    value: netFinal,
    twColor: null,
    cssColor: "var(--color-accent-2)",
  });

  const bars = document.createElement("div");
  bars.className = "mb-4";

  const stackBar = document.createElement("div");
  stackBar.className =
    "flex h-3 w-full gap-px overflow-hidden rounded-full bg-border";
  for (const { label, value, twColor, cssColor } of stackSegments) {
    const pct = (value / gross) * 100;
    const seg = document.createElement("div");
    seg.className = `h-full${twColor ? ` ${twColor}` : ""}`;
    if (cssColor) seg.style.backgroundColor = cssColor;
    seg.style.width = `${pct}%`;
    seg.title = `${label}: ${fmt(value)} (${pct.toFixed(1)}%)`;
    stackBar.append(seg);
  }

  const legend = document.createElement("div");
  legend.className = "mt-2 flex flex-wrap gap-x-3 gap-y-1";
  for (const { label, value, twColor, cssColor } of stackSegments) {
    const pct = (value / gross) * 100;
    const item = document.createElement("span");
    item.className = "flex items-center gap-1 text-xs";
    const dot = document.createElement("span");
    dot.className = `inline-block h-2 w-2 flex-shrink-0 rounded-full${twColor ? ` ${twColor}` : ""}`;
    if (cssColor) dot.style.backgroundColor = cssColor;
    const txt = document.createElement("span");
    txt.textContent = `${label} ${pct.toFixed(1)}%`;
    txt.className =
      label === "Líquido" ? "font-semibold text-foreground" : "text-muted";
    item.append(dot, txt);
    legend.append(item);
  }

  bars.append(stackBar, legend);

  // ── FILAS DE DETALLE ──
  const rows = [
    buildRow("Sueldo bruto", fmt(resultado.grossSalary), "text-green-500"),
    buildRow(
      "Sueldo imponible",
      fmt(resultado.taxableSalary),
      "text-secondary"
    ),
    buildRow(
      "No imponibles",
      fmt(resultado.nonTaxableIncome),
      "text-secondary"
    ),
    buildRow(
      `AFP (${fmtPct(resultado.effectiveRates.afpPercent)})`,
      `− ${fmt(resultado.deductions.afp)}`,
      "tabular-nums"
    ),
    buildRow(
      `Salud (${fmtPct(resultado.effectiveRates.healthPercent)})`,
      `− ${fmt(resultado.deductions.health)}`,
      "tabular-nums"
    ),
    buildRow(
      `Seg. cesantía (${fmtPct(resultado.effectiveRates.unemploymentInsurancePercent)})`,
      `− ${fmt(resultado.deductions.unemploymentInsurance)}`,
      "tabular-nums"
    ),
    buildRow(
      resultado.effectiveRates.marginalTaxPercent > 0
        ? `Imp. 2ª cat. (tramo ${resultado.effectiveRates.marginalTaxPercent.toFixed(0)}%)`
        : "Imp. 2ª cat. (exento)",
      `− ${fmt(resultado.deductions.tax)}`,
      "tabular-nums"
    ),
  ];

  if (resultado.deductions.apvRegimenB > 0) {
    rows.push(
      buildRow(
        "APV Régimen B",
        `− ${fmt(resultado.deductions.apvRegimenB)}`,
        "tabular-nums"
      )
    );
  }

  if (otrosDescuentos && otrosDescuentos > 0) {
    rows.push(
      buildRow(
        "Otros descuentos",
        `− ${fmt(otrosDescuentos)}`,
        "tabular-nums"
      )
    );
  }

  // ── TOTAL DESCUENTOS ──
  const totals = document.createElement("div");
  totals.className = "mt-3 flex justify-between pt-3 text-sm font-semibold";
  const totalsLabel = document.createElement("span");
  totalsLabel.textContent = "Total descuentos";
  const totalsValue = document.createElement("span");
  totalsValue.className = "tabular-nums";
  totalsValue.textContent = `${fmt(totalDed)} (${fmtPct((totalDed / resultado.grossSalary) * 100)})`;
  totals.append(totalsLabel, totalsValue);

  // ── FILAS INFORMATIVAS: ANUAL + COSTO EMPLEADOR ──
  const mkInfoRow = (
    label: string,
    value: string,
    tooltip?: string
  ): HTMLElement => {
    const row = document.createElement("div");
    row.className =
      "flex items-center justify-between rounded border border-border/50 bg-surface-muted/30 px-3 py-2 text-xs";
    const lbl = document.createElement("span");
    lbl.className = "text-muted";
    if (tooltip) lbl.title = tooltip;
    lbl.textContent = label;
    const val = document.createElement("span");
    val.className = "font-semibold tabular-nums";
    val.textContent = value;
    row.append(lbl, val);
    return row;
  };
  const extraRows = document.createElement("div");
  extraRows.className = "mt-2 space-y-1";
  if (jornadaFraction !== undefined && jornadaFraction < 1) {
    extraRows.append(
      mkInfoRow(
        `Jornada parcial (${Math.round(jornadaFraction * 100)}%)`,
        `Bruto proporcional aplicado: ${fmt(resultado.grossSalary)}`
      )
    );
  }
  extraRows.append(mkInfoRow("Al año (× 12)", fmt(displayAmount * 12)));
  const afcEmployerRate =
    resultado.contractType === "plazo-fijo" ? 0.03 : 0.024;
  const employerAfc =
    resultado.cappedBases.unemploymentInsurance * afcEmployerRate;
  extraRows.append(
    mkInfoRow(
      "Costo total para tu empleador ①",
      `≈ ${fmt(resultado.grossSalary + employerAfc)}`,
      `AFC empleador: ${fmt(employerAfc)}`
    )
  );

  // Gratificación legal estimada (art. 50 CT) — solo modo bruto→líquido
  const graticap = Math.round((4.75 / 12) * economicParameters.imm);
  if (baseBruto !== undefined) {
    const grati25 = Math.round(baseBruto * 0.25);
    const gratiLegal = Math.min(grati25, graticap);
    extraRows.append(
      mkInfoRow(
        "Gratificación legal máx. (art. 50 CT) ②",
        fmt(gratiLegal),
        `25% de ${fmt(baseBruto)} = ${fmt(grati25)} — tope ${fmt(graticap)} (4,75 IMM/12)`
      )
    );
  }

  // ── SUPUESTO Y NOTAS ──
  const assumption = document.createElement("p");
  assumption.className = "mt-3 text-xs text-muted";
  const baseNote =
    extraNote ??
    (resultado.taxableSalary === resultado.grossSalary
      ? "Supuesto aplicado: bruto total = imponible mensual."
      : "Usando imponible explícito distinto del bruto total.");
  const gratiNote =
    baseBruto !== undefined
      ? ` ② Tope gratificación = 25% bruto o ${fmt(graticap)}/mes (4,75 × IMM ${fmt(economicParameters.imm)} ÷ 12).`
      : "";
  assumption.textContent = `${baseNote} ① Solo AFC empleador; no incluye mutual de seguridad ni beneficios pactados.${gratiNote}`;

  document
    .getElementById("resultado-contenido")!
    .replaceChildren(headline, bars, ...rows, totals, extraRows, assumption);

  // Show action buttons after result renders
  const resultActions = document.getElementById("result-actions");
  if (resultActions) resultActions.classList.remove("hidden");
}
