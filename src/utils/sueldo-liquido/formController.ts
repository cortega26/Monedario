import {
  calculateNetSalary,
  estimateGrossFromNet,
} from "@/application/use-cases/CalculateNetSalary";
import { DEFAULT_IMM } from "@/domain/economic/immConstants";
import { trackAnalyticsEvent } from "@/utils/analytics";
import { parseContractType } from "@/utils/contractType";
import { saveCalculatorResult } from "@/utils/resumeState";
import {
  initScenarioPanel,
  snapshotInputs,
} from "@/utils/calculatorScenariosUI";
import { createScenarioSaveAdapter } from "@/utils/calculatorScenarioSave";
import { parseCLNumber } from "@/utils/parseCLNumber";
import { renderInvalidResultState } from "@/utils/calculatorResultState";
import {
  renderAfpComparison,
  renderAfpComparisonInverso,
  hideAfpComparison,
} from "./afpComparison";
import { updateResultDisplay, fmt, fmtPct } from "./resultRenderer";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

type NetSalaryResult = ReturnType<typeof calculateNetSalary>;

let lastResultado: NetSalaryResult | null = null;
let lastScenarioInputs: Record<string, string> | null = null;
let lastOtrosDescuentos = 0;
let lastModoLabel = "";
let lastBaseBruto: number | undefined = undefined;
let _economicParams: ReturnType<typeof readEconomicParameters> | null = null;
let autoCalcTimer: ReturnType<typeof setTimeout> | undefined;

// ---------------------------------------------------------------------------
// Economic parameters helpers
// ---------------------------------------------------------------------------

function readEconomicParameters(): {
  uf: number;
  utm: number;
  imm: number;
} {
  const element = document.getElementById("economic-parameters");
  const utm = Number(element?.dataset?.utm);
  const uf = Number(element?.dataset?.uf);
  const imm = Number(element?.dataset?.imm);
  if (!Number.isFinite(utm) || utm <= 0 || !Number.isFinite(uf) || uf <= 0) {
    throw new Error("No se pudieron cargar los parámetros económicos.");
  }
  return {
    uf,
    utm,
    imm: Number.isFinite(imm) && imm > 0 ? imm : DEFAULT_IMM,
  };
}

function getParams() {
  if (!_economicParams) _economicParams = readEconomicParameters();
  return _economicParams;
}

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------

function showError(message: string) {
  const el = document.getElementById("calc-error");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
  const input = document.getElementById("sueldo");
  if (input) {
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", "calc-error");
  }
}

function hideError() {
  const el = document.getElementById("calc-error");
  if (!el) return;
  el.classList.add("hidden");
  el.textContent = "";
  const input = document.getElementById("sueldo");
  if (input) {
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
  }
}

function focusResultado() {
  const heading = document.getElementById("resultado-heading");
  if (heading) {
    heading.focus();
    heading.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function setLoading(isLoading: boolean) {
  const btn = document.getElementById("calcBtn") as HTMLButtonElement;
  const label = document.getElementById("calcBtn-label");
  if (!btn || !label) return;
  btn.disabled = isLoading;
  label.textContent = isLoading ? "Calculando…" : "Calcular ahora";
}

// ---------------------------------------------------------------------------
// Form input readers
// ---------------------------------------------------------------------------

function getModo(): "bruto-a-liquido" | "liquido-a-bruto" {
  return (
    document.querySelector(
      "input[name='modo-calculo']:checked"
    ) as HTMLInputElement
  )?.value === "liquido-a-bruto"
    ? "liquido-a-bruto"
    : "bruto-a-liquido";
}

function getJornadaFraction(): number {
  const val = parseFloat(
    (document.getElementById("jornada-fraccion") as HTMLSelectElement)?.value
  );
  return Number.isFinite(val) && val > 0 && val <= 100 ? val / 100 : 1;
}

function getCommonInputs() {
  const afpSelect = document.getElementById("afp-tasa") as HTMLSelectElement;
  const afpTasaPercent = parseFloat(
    afpSelect.options[afpSelect.selectedIndex]?.dataset.commission ?? "0"
  );
  const healthSystem =
    (document.querySelector("input[name='salud']:checked") as HTMLInputElement)
      ?.value === "isapre"
      ? "isapre"
      : "fonasa";
  const contractType = parseContractType(
    (
      document.querySelector(
        "input[name='tipo-contrato']:checked"
      ) as HTMLInputElement
    )?.value
  );
  const isapreAdicional =
    parseFloat(
      (document.getElementById("isapre-adicional") as HTMLInputElement).value
    ) || 0;
  return {
    afpTasaPercent,
    healthSystem,
    contractType,
    isapreAdicional,
  } as const;
}

// ---------------------------------------------------------------------------
// Modo UI toggle
// ---------------------------------------------------------------------------

function updateModoUI() {
  const modo = getModo();
  const esLiquidoABruto = modo === "liquido-a-bruto";

  const label = document.getElementById("sueldo-label");
  const hint = document.getElementById("sueldo-hint");
  const input = document.getElementById("sueldo") as HTMLInputElement;
  const btnLabel = document.getElementById("calcBtn-label");
  const imponibleField = document.getElementById("imponible-field");
  const advancedFields = document.getElementById("advanced-fields");
  const advancedToggle = document.getElementById("advanced-toggle");

  if (label)
    label.textContent = esLiquidoABruto
      ? "Sueldo líquido deseado ($)"
      : "Sueldo bruto mensual ($)";
  if (hint)
    hint.textContent = esLiquidoABruto
      ? "Lo que quieres recibir depositado cada mes."
      : "El total antes de descuentos, incluyendo bonos o asignaciones no imponibles si vienen en tu liquidación.";
  if (input)
    input.placeholder = esLiquidoABruto ? "Ej: 900.000" : "Ej: 1.200.000";
  if (btnLabel)
    btnLabel.textContent = esLiquidoABruto
      ? "Estimar sueldo bruto necesario →"
      : "Calcular sueldo líquido →";
  if (imponibleField)
    imponibleField.classList.toggle("hidden", esLiquidoABruto);
  if (esLiquidoABruto) hideAfpComparison();

  // Advanced mode only works in bruto→líquido
  if (esLiquidoABruto && advancedFields && advancedToggle) {
    advancedFields.classList.add("hidden");
    advancedToggle.setAttribute("aria-expanded", "false");
    const arrow = document.getElementById("advanced-arrow");
    if (arrow) arrow.style.transform = "";
  }
  if (advancedToggle) {
    advancedToggle.classList.toggle("opacity-40", esLiquidoABruto);
    advancedToggle.classList.toggle("pointer-events-none", esLiquidoABruto);
  }
}

// ---------------------------------------------------------------------------
// Min-wage warning
// ---------------------------------------------------------------------------

function checkMinWage(rawInput: number, jornadaFraction = 1) {
  const warning = document.getElementById("min-wage-warning");
  if (!warning) return;
  const effectiveGross = rawInput * jornadaFraction;
  const minWage = getParams().imm * jornadaFraction;
  if (effectiveGross > 0 && effectiveGross < minWage) {
    const pctLabel =
      jornadaFraction < 1
        ? ` para ${Math.round(jornadaFraction * 100)}% de jornada`
        : "";
    warning.textContent = `El mínimo legal${pctLabel} es ${fmt(minWage)}. El monto ingresado está por debajo del mínimo legal para esa jornada.`;
    warning.classList.remove("hidden");
  } else {
    warning.classList.add("hidden");
  }
}

// ---------------------------------------------------------------------------
// Main calculate handler
// ---------------------------------------------------------------------------

function handleCalculate(): void {
  hideError();
  setLoading(true);
  lastScenarioInputs = null;
  const scenarioForm = document.getElementById("calculator-form-card");
  const scenarioCandidateInputs = scenarioForm
    ? snapshotInputs(scenarioForm)
    : null;
  const modo = getModo();
  const rawInput =
    parseFloat((document.getElementById("sueldo") as HTMLInputElement).value) ||
    0;
  hideError();
  if (rawInput <= 0) {
    showError("Por favor ingresa un monto válido.");
    renderInvalidResultState();
    setLoading(false);
    return;
  }

  const { afpTasaPercent, healthSystem, contractType, isapreAdicional } =
    getCommonInputs();

  if (modo === "liquido-a-bruto") {
    let resultado;
    try {
      resultado = estimateGrossFromNet({
        targetNetSalary: rawInput,
        afpRatePercent: afpTasaPercent,
        healthSystem,
        contractType,
        isapreAdditionalPercent: isapreAdicional,
        economicParameters: getParams(),
      });
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "No se pudo estimar el sueldo bruto."
      );
      renderInvalidResultState();
      setLoading(false);
      return;
    }
    setLoading(false);
    updateResultDisplay({
      resultado,
      modoLabel: "Sueldo Bruto Estimado",
      extraNote:
        "Estimación inversa: supuesto bruto = imponible. AFP, salud y contrato según tu selección.",
      economicParameters: getParams(),
    });
    lastResultado = resultado;
    lastScenarioInputs = scenarioCandidateInputs;
    lastOtrosDescuentos = 0;
    lastModoLabel = "Sueldo Bruto Estimado";
    lastBaseBruto = undefined;
    renderAfpComparisonInverso({
      targetNetSalary: rawInput,
      healthSystem,
      contractType,
      isapreAdicional,
      currentAfpRate: afpTasaPercent,
      formatCLP: fmt,
      economicParameters: getParams(),
    });
    focusResultado();
    saveCalculatorResult(
      window.location.pathname,
      "Calculadora de Sueldo Líquido y Bruto"
    );
    if (typeof window.showShareResult === "function") {
      window.showShareResult(
        `Sueldo Líquido y Bruto: bruto estimado ${fmt(resultado.grossSalary)}`
      );
    }
    window.showCalculatorNextActions?.();
    trackAnalyticsEvent("calculator_complete", {
      calculator_slug: "sueldo-liquido",
      calculator_name: "Calculadora de Sueldo Liquido",
      outcome: "success",
      mode: "liquido-a-bruto",
    });
  } else {
    const imponibleRaw = parseFloat(
      (document.getElementById("sueldo-imponible") as HTMLInputElement).value
    );
    const imponible =
      Number.isFinite(imponibleRaw) && imponibleRaw > 0
        ? imponibleRaw
        : undefined;

    // Advanced mode extras
    const jornadaFraction = getJornadaFraction();
    const rawInputEscalado = Math.round(rawInput * jornadaFraction);
    const gratificacion =
      parseFloat(
        (document.getElementById("gratificacion") as HTMLInputElement)?.value
      ) || 0;
    const horasExtra =
      parseFloat(
        (document.getElementById("horas-extra") as HTMLInputElement)?.value
      ) || 0;
    const colacion =
      parseFloat(
        (document.getElementById("colacion") as HTMLInputElement)?.value
      ) || 0;
    const movilizacion =
      parseFloat(
        (document.getElementById("movilizacion") as HTMLInputElement)?.value
      ) || 0;
    const otrosDescuentos =
      parseFloat(
        (document.getElementById("otros-descuentos") as HTMLInputElement)?.value
      ) || 0;
    const apvRegimenB =
      parseFloat(
        (document.getElementById("apv-regimen-b") as HTMLInputElement)?.value
      ) || 0;

    const grossBase = rawInputEscalado + gratificacion + horasExtra;
    const noImponiblesExtra = colacion + movilizacion;
    const taxableAdjusted =
      imponible !== undefined
        ? imponible + gratificacion + horasExtra
        : noImponiblesExtra > 0
          ? Math.max(0, rawInputEscalado - noImponiblesExtra) +
            gratificacion +
            horasExtra
          : undefined;

    let resultado;
    try {
      resultado = calculateNetSalary({
        grossSalary: grossBase,
        taxableSalary: taxableAdjusted,
        afpRatePercent: afpTasaPercent,
        healthSystem,
        contractType,
        isapreAdditionalPercent: isapreAdicional,
        apvRegimeB: apvRegimenB > 0 ? apvRegimenB : undefined,
        economicParameters: getParams(),
      });
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "No se pudo calcular el sueldo líquido."
      );
      renderInvalidResultState();
      setLoading(false);
      return;
    }
    setLoading(false);
    updateResultDisplay({
      resultado,
      modoLabel: "Sueldo Líquido",
      otrosDescuentos,
      baseBruto: rawInputEscalado,
      jornadaFraction,
      economicParameters: getParams(),
    });
    lastResultado = resultado;
    lastScenarioInputs = scenarioCandidateInputs;
    lastOtrosDescuentos = otrosDescuentos ?? 0;
    lastModoLabel = "Sueldo Líquido";
    lastBaseBruto = rawInputEscalado;
    renderAfpComparison({
      grossSalary: grossBase,
      taxableSalary: taxableAdjusted,
      healthSystem,
      contractType,
      isapreAdicional,
      currentAfpRate: afpTasaPercent,
      formatCLP: fmt,
      economicParameters: getParams(),
    });
    checkMinWage(rawInput, jornadaFraction);
    focusResultado();
    saveCalculatorResult(
      window.location.pathname,
      "Calculadora de Sueldo Líquido y Bruto"
    );
    if (typeof window.showShareResult === "function") {
      window.showShareResult(
        `Sueldo Líquido y Bruto: líquido ${fmt(resultado.netSalary - (otrosDescuentos ?? 0))}`
      );
    }
    window.showCalculatorNextActions?.();
    trackAnalyticsEvent("calculator_complete", {
      calculator_slug: "sueldo-liquido",
      calculator_name: "Calculadora de Sueldo Liquido",
      outcome: "success",
      mode: "bruto-a-liquido",
    });
  }
}

// ---------------------------------------------------------------------------
// Listeners setup — call once on page load
// ---------------------------------------------------------------------------

export function setupFormListeners(): void {
  // ── Toggle Modo ──
  document.querySelectorAll("input[name='modo-calculo']").forEach(radio => {
    radio.addEventListener("change", () => {
      updateModoUI();
      trackAnalyticsEvent("calculator_mode_toggle", {
        calculator_slug: "sueldo-liquido",
        mode: getModo(),
      });
    });
  });

  // ── Toggle Isapre ──
  document.querySelectorAll("input[name='salud']").forEach(radio => {
    radio.addEventListener("change", () => {
      const isIsapre =
        (
          document.querySelector(
            "input[name='salud']:checked"
          ) as HTMLInputElement
        )?.value === "isapre";
      const field = document.getElementById("isapre-field");
      if (field) field.classList.toggle("hidden", !isIsapre);
    });
  });

  // ── Toggle Modo Avanzado ──
  document.getElementById("advanced-toggle")?.addEventListener("click", () => {
    const fields = document.getElementById("advanced-fields");
    const arrow = document.getElementById("advanced-arrow");
    const btn = document.getElementById("advanced-toggle");
    if (!fields) return;
    const isHidden = fields.classList.toggle("hidden");
    btn?.setAttribute("aria-expanded", String(!isHidden));
    if (arrow) arrow.style.transform = isHidden ? "" : "rotate(180deg)";
  });

  // ── Calcular ──
  document
    .getElementById("calcBtn")
    ?.addEventListener("click", handleCalculate);

  // ── Copy link ──
  document
    .getElementById("copy-link-btn")
    ?.addEventListener("click", async () => {
      const p = new URLSearchParams();
      const modo = getModo();
      const sueldoVal =
        (document.getElementById("sueldo") as HTMLInputElement)?.value ?? "";
      p.set(modo === "liquido-a-bruto" ? "liquido" : "bruto", sueldoVal);

      const afpSelect = document.getElementById(
        "afp-tasa"
      ) as HTMLSelectElement | null;
      const afpName =
        afpSelect?.options[afpSelect.selectedIndex]?.text?.split(" ")?.[0];
      if (afpName) p.set("afp", afpName);

      const saludChecked = document.querySelector(
        "input[name='salud']:checked"
      ) as HTMLInputElement | null;
      if (saludChecked) p.set("salud", saludChecked.value);

      const contratoChecked = document.querySelector(
        "input[name='tipo-contrato']:checked"
      ) as HTMLInputElement | null;
      if (contratoChecked) p.set("contrato", contratoChecked.value);

      const btn = document.getElementById("copy-link-btn") as HTMLButtonElement;
      const btnDefault = btn?.innerHTML ?? "";
      try {
        await navigator.clipboard.writeText(
          `${location.origin}${location.pathname}?${p}`
        );
        btn.textContent = "¡Enlace copiado!";
        trackAnalyticsEvent("calculator_copy_link", {
          calculator_slug: "sueldo-liquido",
        });
      } catch {
        btn.textContent = "No se pudo copiar";
      }
      setTimeout(() => {
        btn.innerHTML = btnDefault;
      }, 2000);
    });

  // ── Copy result ──
  document.getElementById("copy-btn")?.addEventListener("click", async () => {
    if (!lastResultado) return;

    const r = lastResultado;
    const netFinal = r.netSalary - lastOtrosDescuentos;
    const totalDed = r.deductions.total + lastOtrosDescuentos;
    const pctDed = ((totalDed / r.grossSalary) * 100).toFixed(2);
    const isInverso = lastModoLabel === "Sueldo Bruto Estimado";

    const pad = (s: string, n = 24) => s.padEnd(n, " ");

    const lines = [
      `Calculadora de Sueldo Líquido — ${document.getElementById("main-content")?.dataset.siteTitle ?? "Monedario"}`,
      "─".repeat(44),
      `${pad("Bruto:")}${fmt(r.grossSalary)}`,
      `${pad("Imponible:")}${fmt(r.taxableSalary)}`,
      `${pad("No imponibles:")}${fmt(r.nonTaxableIncome)}`,
      "─".repeat(44),
      `${pad(`AFP (${fmtPct(r.effectiveRates.afpPercent)}):`)}−${fmt(r.deductions.afp)}`,
      `${pad(`Salud (${fmtPct(r.effectiveRates.healthPercent)}):`)}−${fmt(r.deductions.health)}`,
      `${pad(`Seg. cesantía (${fmtPct(r.effectiveRates.unemploymentInsurancePercent)}):`)}−${fmt(r.deductions.unemploymentInsurance)}`,
      `${pad("Imp. 2ª categoría:")}−${fmt(r.deductions.tax)}`,
      ...(r.deductions.apvRegimenB > 0
        ? [`${pad("APV Régimen B:")}−${fmt(r.deductions.apvRegimenB)}`]
        : []),
      ...(lastOtrosDescuentos > 0
        ? [`${pad("Otros descuentos:")}−${fmt(lastOtrosDescuentos)}`]
        : []),
      "─".repeat(44),
      `${pad("Total descuentos:")}−${fmt(totalDed)} (${pctDed}%)`,
      isInverso
        ? `${pad("BRUTO ESTIMADO:")}${fmt(r.grossSalary)}`
        : `${pad("SUELDO LÍQUIDO:")}${fmt(netFinal)}`,
      ...(lastBaseBruto !== undefined
        ? [
            "─".repeat(44),
            `${pad("Gratif. legal máx.:")}${fmt(Math.min(Math.round(lastBaseBruto * 0.25), Math.round((4.75 / 12) * getParams().imm)))} (art. 50 CT)`,
          ]
        : []),
    ];

    const text = lines.join("\n");
    const btn = document.getElementById("copy-btn") as HTMLButtonElement;
    const btnDefault = btn?.innerHTML ?? "";

    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "¡Copiado!";
      trackAnalyticsEvent("calculator_copy_result", {
        calculator_slug: "sueldo-liquido",
      });
    } catch {
      btn.textContent = "No se pudo copiar";
    }

    setTimeout(() => {
      btn.innerHTML = btnDefault;
    }, 2000);
  });

  // ── Enter key on sueldo input ──
  document
    .getElementById("sueldo")
    ?.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter")
        (document.getElementById("calcBtn") as HTMLButtonElement)?.click();
    });

  // ── Auto-cálculo en tiempo real (debounced 600 ms) ──
  document.getElementById("sueldo")?.addEventListener("input", () => {
    const val = parseFloat(
      (document.getElementById("sueldo") as HTMLInputElement).value
    );
    if (getModo() === "bruto-a-liquido")
      checkMinWage(val, getJornadaFraction());
    clearTimeout(autoCalcTimer);
    autoCalcTimer = setTimeout(() => {
      if (val > 0) {
        (document.getElementById("calcBtn") as HTMLButtonElement)?.click();
      }
    }, 600);
  });

  // ── Re-calcular cuando cambia el imponible ──
  document.getElementById("sueldo-imponible")?.addEventListener("input", () => {
    clearTimeout(autoCalcTimer);
    autoCalcTimer = setTimeout(() => {
      const sueldoVal = parseFloat(
        (document.getElementById("sueldo") as HTMLInputElement).value
      );
      if (sueldoVal > 0) {
        (document.getElementById("calcBtn") as HTMLButtonElement)?.click();
      }
    }, 600);
  });

  // ── URL parameter pre-fill ──
  const prefillFromUrl = () => {
    const params = new URLSearchParams(window.location.search);

    const bruto = params.get("bruto");
    const liquido = params.get("liquido");
    const imponible = params.get("imponible");
    const afpParam = params.get("afp");
    const contrato = params.get("contrato");
    const salud = params.get("salud");

    // Set mode and fill amount
    if (bruto || liquido) {
      const targetMode = liquido ? "liquido-a-bruto" : "bruto-a-liquido";
      const radio = document.querySelector(
        `input[name='modo-calculo'][value='${targetMode}']`
      ) as HTMLInputElement | null;
      if (radio) {
        radio.checked = true;
        updateModoUI();
      }
      // Shared Chilean parser (plan 107): standardizes the legacy
      // first-comma-only replace on global comma handling. Identical on
      // healthy inputs; malformed multi-comma params now reject
      // (undefined) instead of parseFloat's partial parse.
      const amount = parseCLNumber((bruto ?? liquido)!);
      if (amount !== undefined && amount > 0) {
        const sueldoInput = document.getElementById(
          "sueldo"
        ) as HTMLInputElement | null;
        if (sueldoInput) sueldoInput.value = String(amount);
      }
    }

    // Pre-fill imponible (bruto mode only)
    if (imponible && !liquido) {
      // Shared Chilean parser (plan 107): see first-comma-only note above.
      const amount = parseCLNumber(imponible);
      if (amount !== undefined && amount > 0) {
        const imponibleInput = document.getElementById(
          "sueldo-imponible"
        ) as HTMLInputElement | null;
        if (imponibleInput) imponibleInput.value = String(amount);
      }
    }

    // Select AFP by case-insensitive startsWith match
    if (afpParam) {
      const select = document.getElementById(
        "afp-tasa"
      ) as HTMLSelectElement | null;
      if (select) {
        const needle = afpParam.toLowerCase();
        for (const option of Array.from(select.options)) {
          if (option.text.toLowerCase().startsWith(needle)) {
            option.selected = true;
            break;
          }
        }
      }
    }

    // Select contract type radio and trigger change
    if (contrato === "plazo-fijo" || contrato === "indefinido") {
      const radio = document.querySelector(
        `input[name='tipo-contrato'][value='${contrato}']`
      ) as HTMLInputElement | null;
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    // Select health system radio and trigger change
    if (salud === "fonasa" || salud === "isapre") {
      const radio = document.querySelector(
        `input[name='salud'][value='${salud}']`
      ) as HTMLInputElement | null;
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    // Auto-calculate only when a main amount is provided
    if (bruto || liquido) {
      setTimeout(() => {
        (
          document.getElementById("calcBtn") as HTMLButtonElement | null
        )?.click();
      }, 100);
    }
  };
  document.addEventListener("DOMContentLoaded", prefillFromUrl);

  // ── Scenario panel ──
  const scenarioFormCard = document.getElementById("calculator-form-card");
  if (scenarioFormCard) {
    initScenarioPanel({
      ...createScenarioSaveAdapter({
        getLastInputs: () => lastScenarioInputs,
        getLastResult: () => lastResultado,
        formCard: scenarioFormCard,
      }),
      buildSummary: () => {
        if (!lastScenarioInputs || !lastResultado) return null;
        const r = lastResultado;
        return [
          {
            label: "Sueldo líquido",
            value: fmt(r.netSalary - lastOtrosDescuentos),
          },
          { label: "Sueldo bruto", value: fmt(r.grossSalary) },
          { label: "AFP", value: fmt(r.deductions.afp) },
          { label: "Salud", value: fmt(r.deductions.health) },
          {
            label: "Seguro cesantía",
            value: fmt(r.deductions.unemploymentInsurance),
          },
          {
            label: "Impuesto 2ª cat.",
            value: fmt(r.deductions.tax),
          },
        ];
      },
    });
  }
}
