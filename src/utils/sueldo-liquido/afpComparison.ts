import {
  calculateNetSalary,
  estimateGrossFromNet,
} from "@/application/use-cases/CalculateNetSalary";

type EconomicParams = { uf: number; utm: number; imm: number };
type FormatCLP = (n: number) => string;

// ---------------------------------------------------------------------------
// Modo bruto → líquido: comparación de sueldo líquido por AFP
// ---------------------------------------------------------------------------

export interface AfpComparisonOptions {
  grossSalary: number;
  taxableSalary: number | undefined;
  healthSystem: "fonasa" | "isapre";
  contractType: "indefinido" | "plazo-fijo";
  isapreAdicional: number;
  currentAfpRate: number;
  formatCLP: FormatCLP;
  economicParameters: EconomicParams;
}

export function renderAfpComparison(options: AfpComparisonOptions): void {
  const section = document.getElementById("afp-comparison");
  const container = document.getElementById("afp-comparison-body");
  if (!section || !container) return;

  const heading = document.getElementById("afp-comparison-heading");
  const subheading = document.getElementById("afp-comparison-subheading");
  if (heading) heading.textContent = "¿Cuánto ahorrarías cambiando de AFP?";
  if (subheading)
    subheading.textContent =
      "Con tu sueldo y configuración actuales, comparando las 7 AFPs. La AFP actual aparece resaltada.";

  const {
    grossSalary,
    taxableSalary,
    healthSystem,
    contractType,
    isapreAdicional,
    currentAfpRate,
    formatCLP,
    economicParameters,
  } = options;

  const afpSelect = document.getElementById("afp-tasa") as HTMLSelectElement;
  if (!afpSelect) return;

  const afpOptions = Array.from(afpSelect.options).map(opt => ({
    name: opt.text.split(" – ")[0].trim(),
    rate: parseFloat(opt.dataset.commission ?? "0"),
  }));

  const comparisons = afpOptions.map(({ name, rate }) => {
    const r = calculateNetSalary({
      grossSalary,
      taxableSalary,
      afpRatePercent: rate,
      healthSystem,
      contractType,
      isapreAdditionalPercent: isapreAdicional,
      economicParameters,
    });
    return { name, rate, net: r.netSalary };
  });

  comparisons.sort((a, b) => b.net - a.net);

  const firstComparison = comparisons[0];
  const lastComparison = comparisons[comparisons.length - 1];
  if (!firstComparison || !lastComparison) {
    section.classList.add("hidden");
    return;
  }
  const currentNet =
    comparisons.find(c => Math.abs(c.rate - currentAfpRate) < 0.01)?.net ??
    firstComparison.net;
  const bestNet = firstComparison.net;
  const worstNet = lastComparison.net;
  const maxSaving = bestNet - worstNet;

  container.innerHTML = "";

  for (const { name, rate, net } of comparisons) {
    const isCurrent = Math.abs(rate - currentAfpRate) < 0.01;
    const diff = net - currentNet;

    const row = document.createElement("div");
    row.className = [
      "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
      isCurrent
        ? "border-accent/30 bg-accent/5"
        : "border-border/50 bg-background",
    ].join(" ");

    const nameSpan = document.createElement("span");
    nameSpan.className = `min-w-0 flex-1 font-medium ${isCurrent ? "text-accent" : "text-foreground"}`;
    nameSpan.textContent = name + (isCurrent ? " ← actual" : "");

    const rateSpan = document.createElement("span");
    rateSpan.className = "shrink-0 text-xs text-muted tabular-nums";
    rateSpan.textContent = rate.toFixed(2) + "%";

    const netSpan = document.createElement("span");
    netSpan.className =
      "shrink-0 font-mono font-semibold tabular-nums text-foreground";
    netSpan.textContent = formatCLP(net);

    const diffSpan = document.createElement("span");
    diffSpan.className = "w-20 shrink-0 text-right text-xs tabular-nums";
    if (isCurrent) {
      diffSpan.textContent = "";
    } else if (diff > 0) {
      diffSpan.className += " text-success";
      diffSpan.textContent = "+" + formatCLP(diff);
    } else if (diff < 0) {
      diffSpan.className += " text-danger";
      diffSpan.textContent = formatCLP(diff);
    } else {
      diffSpan.className += " text-muted";
      diffSpan.textContent = "—";
    }

    row.append(nameSpan, rateSpan, netSpan, diffSpan);
    container.appendChild(row);
  }

  if (maxSaving > 500) {
    const note = document.createElement("p");
    note.className = "mt-3 text-xs text-muted";
    note.textContent = `La diferencia máxima entre AFPs para tu sueldo es ${formatCLP(maxSaving)}/mes (${formatCLP(maxSaving * 12)}/año). Los montos son orientativos y no incluyen beneficios adicionales de cada AFP.`;
    container.appendChild(note);
  }

  section.classList.remove("hidden");
}

// ---------------------------------------------------------------------------
// Modo líquido → bruto: qué bruto se necesita con cada AFP
// ---------------------------------------------------------------------------

export interface AfpInversoOptions {
  targetNetSalary: number;
  healthSystem: "fonasa" | "isapre";
  contractType: "indefinido" | "plazo-fijo";
  isapreAdicional: number;
  currentAfpRate: number;
  formatCLP: FormatCLP;
  economicParameters: EconomicParams;
}

export function renderAfpComparisonInverso(options: AfpInversoOptions): void {
  const section = document.getElementById("afp-comparison");
  const container = document.getElementById("afp-comparison-body");
  const heading = document.getElementById("afp-comparison-heading");
  const subheading = document.getElementById("afp-comparison-subheading");
  if (!section || !container) return;

  if (heading) heading.textContent = "¿Qué bruto necesitarías con cada AFP?";
  if (subheading)
    subheading.textContent = `Para recibir ${options.formatCLP(options.targetNetSalary)} líquidos. Menor bruto = mejor. La AFP actual aparece resaltada.`;

  container.innerHTML =
    '<p class="text-xs text-muted animate-pulse">Calculando comparación AFP…</p>';
  section.classList.remove("hidden");

  const {
    targetNetSalary,
    healthSystem,
    contractType,
    isapreAdicional,
    currentAfpRate,
    formatCLP,
    economicParameters,
  } = options;

  // Defer heavy computation (7 × 60-iter binary search) to not block result render
  setTimeout(() => {
    const afpSelect = document.getElementById("afp-tasa") as HTMLSelectElement;
    if (!afpSelect) return;

    const afpOptions = Array.from(afpSelect.options).map(opt => ({
      name: opt.text.split(" – ")[0].trim(),
      rate: parseFloat(opt.dataset.commission ?? "0"),
    }));

    const comparisons = afpOptions.map(({ name, rate }) => {
      const r = estimateGrossFromNet({
        targetNetSalary,
        afpRatePercent: rate,
        healthSystem,
        contractType,
        isapreAdditionalPercent: isapreAdicional,
        economicParameters,
      });
      return { name, rate, gross: r.grossSalary };
    });

    // Lower gross needed = better: sort ascending
    comparisons.sort((a, b) => a.gross - b.gross);

    const firstComparison = comparisons[0];
    const lastComparison = comparisons[comparisons.length - 1];
    if (!firstComparison || !lastComparison) {
      section.classList.add("hidden");
      return;
    }
    const cheapestAfpName = firstComparison.name;
    const currentGross =
      comparisons.find(c => Math.abs(c.rate - currentAfpRate) < 0.01)?.gross ??
      firstComparison.gross;
    const bestGross = firstComparison.gross;
    const worstGross = lastComparison.gross;
    const maxDiff = worstGross - bestGross;

    container.innerHTML = "";

    for (const { name, rate, gross } of comparisons) {
      const isCurrent = Math.abs(rate - currentAfpRate) < 0.01;
      const diff = gross - currentGross;

      const row = document.createElement("div");
      row.className = [
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
        isCurrent
          ? "border-accent/30 bg-accent/5"
          : "border-border/50 bg-background",
      ].join(" ");

      const nameSpan = document.createElement("span");
      nameSpan.className = `min-w-0 flex-1 font-medium ${isCurrent ? "text-accent" : "text-foreground"}`;
      nameSpan.textContent = name + (isCurrent ? " ← actual" : "");

      const rateSpan = document.createElement("span");
      rateSpan.className = "shrink-0 text-xs text-muted tabular-nums";
      rateSpan.textContent = rate.toFixed(2) + "%";

      const grossSpan = document.createElement("span");
      grossSpan.className =
        "shrink-0 font-mono font-semibold tabular-nums text-foreground";
      grossSpan.textContent = formatCLP(gross);

      const diffSpan = document.createElement("span");
      diffSpan.className = "w-20 shrink-0 text-right text-xs tabular-nums";
      if (isCurrent) {
        diffSpan.textContent = "";
      } else if (diff < 0) {
        // Less bruto needed => better
        diffSpan.className += " text-success";
        diffSpan.textContent = formatCLP(diff);
      } else if (diff > 0) {
        diffSpan.className += " text-danger";
        diffSpan.textContent = "+" + formatCLP(diff);
      } else {
        diffSpan.className += " text-muted";
        diffSpan.textContent = "—";
      }

      row.append(nameSpan, rateSpan, grossSpan, diffSpan);
      container.appendChild(row);
    }

    if (maxDiff > 500) {
      const note = document.createElement("p");
      note.className = "mt-3 text-xs text-muted";
      note.textContent = `Con ${cheapestAfpName} necesitarías ${formatCLP(maxDiff)} menos de bruto que con la AFP más cara para recibir el mismo líquido.`;
      container.appendChild(note);
    }
  }, 0);
}

// ---------------------------------------------------------------------------
// Ocultar la sección de comparación AFP
// ---------------------------------------------------------------------------

export function hideAfpComparison(): void {
  document.getElementById("afp-comparison")?.classList.add("hidden");
}
