export type CalculatorResultState = "example" | "invalid" | "result";

export interface InvalidStateModel {
  message: string;
  hint: string;
}

export interface RenderInvalidResultOptions {
  container?: string | HTMLElement | null;
  message?: string;
  hint?: string;
  hideSelectors?: string[];
}

export const INVALID_RESULT_MESSAGE = "Corrige los datos para calcular";
export const INVALID_RESULT_HINT =
  "Revisa los datos marcados y vuelve a intentarlo.";

const COMMON_ACTION_SELECTORS = [
  "#result-actions",
  "#calculator-result-next-actions",
  "#share-calculator-result",
];

export function buildInvalidStateModel(
  message: string = INVALID_RESULT_MESSAGE,
  hint: string = INVALID_RESULT_HINT
): InvalidStateModel {
  return { message, hint };
}

function resolveResultContainer(
  explicit?: string | HTMLElement | null
): HTMLElement | null {
  if (explicit instanceof HTMLElement) return explicit;
  if (typeof explicit === "string") {
    return document.querySelector<HTMLElement>(explicit);
  }
  return (
    document.querySelector<HTMLElement>(
      "[data-is-example='true'], [data-result-state]"
    ) ?? document.getElementById("resultado-contenido")
  );
}

function buildInvalidStateElement(model: InvalidStateModel): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className =
    "rounded-lg border border-dashed border-border bg-surface-muted/40 p-4 text-center";
  wrapper.setAttribute("data-result-invalid", "true");

  const message = document.createElement("p");
  message.className = "text-sm font-semibold text-foreground";
  message.textContent = model.message;

  const hint = document.createElement("p");
  hint.className = "mt-1 text-xs text-muted";
  hint.textContent = model.hint;

  wrapper.append(message, hint);
  return wrapper;
}

export function markResultState(
  container: HTMLElement | null,
  state: CalculatorResultState
): void {
  if (!container) return;
  container.setAttribute("data-result-state", state);
  if (state === "example") {
    container.setAttribute("data-is-example", "true");
  } else {
    container.removeAttribute("data-is-example");
  }
}

export function renderInvalidResultState(
  options: RenderInvalidResultOptions = {}
): void {
  const container = resolveResultContainer(options.container);
  if (!container) return;

  const model = buildInvalidStateModel(options.message, options.hint);
  container.replaceChildren(buildInvalidStateElement(model));
  markResultState(container, "invalid");

  for (const selector of [
    ...COMMON_ACTION_SELECTORS,
    ...(options.hideSelectors ?? []),
  ]) {
    document.querySelectorAll<HTMLElement>(selector).forEach(element => {
      element.classList.add("hidden");
    });
  }
}
