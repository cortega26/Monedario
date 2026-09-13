// Generic prefill wiring for calculator inputs that opt in via `data-profile-bind`.
// Authoritative spec: docs/adr/ADR-20260416-calculator-profile-persistence.md

import {
  clearProfile,
  getProfile,
  isKnownProfileField,
  updateProfile,
  type ProfilePatch,
  type UserProfileField,
} from "@/utils/userProfile";

const DEBOUNCE_MS = 500;
const HINT_ID = "profile-prefill-hint";

type BindableInput = HTMLInputElement | HTMLSelectElement;

const NUMERIC_FIELDS: ReadonlySet<UserProfileField> = new Set([
  "sueldoImponible",
  "isapreAdicionalPct",
  "gratificacion",
  "horasExtra",
  "apvRegimenBAnual",
]);

function isBindable(el: Element): el is BindableInput {
  return el instanceof HTMLInputElement || el instanceof HTMLSelectElement;
}

function toStoredValue(
  raw: string,
  field: UserProfileField
): ProfilePatch[UserProfileField] {
  if (raw === "") return undefined;
  if (NUMERIC_FIELDS.has(field)) {
    const parsed = Number(raw.replace(/\./g, "").replace(/,/g, "."));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return raw;
}

function readScalarField(
  el: BindableInput,
  field: UserProfileField
): ProfilePatch[UserProfileField] {
  if (
    NUMERIC_FIELDS.has(field) &&
    el instanceof HTMLInputElement &&
    el.type === "number"
  ) {
    const native = el.valueAsNumber;
    return Number.isFinite(native) ? native : undefined;
  }
  return toStoredValue(el.value.trim(), field);
}

function readRadioGroup(
  el: HTMLInputElement,
  field: UserProfileField
): ProfilePatch[UserProfileField] {
  const checked = el.form
    ? el.form.querySelector<HTMLInputElement>(
        `input[type='radio'][name='${CSS.escape(el.name)}']:checked`
      )
    : document.querySelector<HTMLInputElement>(
        `input[type='radio'][name='${CSS.escape(el.name)}']:checked`
      );
  return toStoredValue(checked?.value ?? "", field);
}

function writeScalarField(el: BindableInput, value: unknown): boolean {
  if (value === undefined || value === null || value === "") return false;
  const next = String(value);
  if (el.value !== "" || next === "") return false;
  el.value = next;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function writeSelectField(el: HTMLSelectElement, value: unknown): boolean {
  if (value === undefined || value === null || value === "") return false;
  const target = String(value);
  const hasOption = Array.from(el.options).some(opt => opt.value === target);
  if (!hasOption) return false;
  if (el.value === target) return false;
  el.value = target;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function writeRadioGroup(el: HTMLInputElement, value: unknown): boolean {
  if (value === undefined || value === null || value === "") return false;
  if (el.value !== String(value)) return false;
  if (el.checked) return false;
  el.checked = true;
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function ensureHint(): HTMLElement {
  const existing = document.querySelector<HTMLElement>(`#${HINT_ID}`);
  if (existing) return existing;

  const hint = document.createElement("div");
  hint.id = HINT_ID;
  hint.className =
    "fixed inset-x-4 top-28 z-50 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-xs text-secondary shadow-lg sm:inset-x-auto sm:end-4";
  hint.setAttribute("role", "status");

  const label = document.createElement("span");
  label.textContent = "✓ Pre-rellenado de tu última simulación";

  const button = document.createElement("button");
  button.type = "button";
  button.id = "profile-prefill-clear";
  button.className =
    "text-xs font-medium text-accent underline underline-offset-4 hover:opacity-80";
  button.textContent = "Limpiar";

  hint.appendChild(label);
  hint.appendChild(button);
  document.body.appendChild(hint);

  return hint;
}

function clearPrefilled(inputs: ReadonlyArray<BindableInput>): void {
  for (const el of inputs) {
    if (el.dataset.profilePrefilled !== "true") continue;
    delete el.dataset.profilePrefilled;
    if (el instanceof HTMLInputElement && el.type === "radio") {
      el.checked = el.defaultChecked;
      el.dispatchEvent(new Event("change", { bubbles: true }));
      continue;
    }
    if (el instanceof HTMLSelectElement) {
      const defaultOpt = Array.from(el.options).find(o => o.defaultSelected);
      el.value = defaultOpt?.value ?? "";
      el.dispatchEvent(new Event("change", { bubbles: true }));
      continue;
    }
    el.value = "";
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function init(): void {
  const root = document.querySelector<HTMLElement>(
    "[data-analytics-page-type='calculator']"
  );
  if (!root) return;
  if (root.dataset.profilePrefillHydrated === "true") return;
  root.dataset.profilePrefillHydrated = "true";

  const candidates = Array.from(
    root.querySelectorAll<Element>("[data-profile-bind]")
  ).filter(isBindable);

  if (candidates.length === 0) return;

  const profile = getProfile();
  let prefillCount = 0;
  const prefilledInputs: BindableInput[] = [];

  for (const el of candidates) {
    const field = el.dataset.profileBind ?? "";
    if (!isKnownProfileField(field)) continue;

    const stored = profile[field];

    if (el instanceof HTMLInputElement && el.type === "radio") {
      if (writeRadioGroup(el, stored)) {
        el.dataset.profilePrefilled = "true";
        prefilledInputs.push(el);
        prefillCount += 1;
      }
      const handler = debounce(() => {
        const value = readRadioGroup(el, field);
        updateProfile({ [field]: value } as ProfilePatch);
        delete el.dataset.profilePrefilled;
      }, DEBOUNCE_MS);
      el.addEventListener("change", handler);
      continue;
    }

    if (el instanceof HTMLSelectElement) {
      if (writeSelectField(el, stored)) {
        el.dataset.profilePrefilled = "true";
        prefilledInputs.push(el);
        prefillCount += 1;
      }
      const handler = debounce(() => {
        const value = readScalarField(el, field);
        updateProfile({ [field]: value } as ProfilePatch);
        delete el.dataset.profilePrefilled;
      }, DEBOUNCE_MS);
      el.addEventListener("change", handler);
      continue;
    }

    if (writeScalarField(el, stored)) {
      el.dataset.profilePrefilled = "true";
      prefilledInputs.push(el);
      prefillCount += 1;
    }

    const handler = debounce(() => {
      const value = readScalarField(el, field);
      updateProfile({ [field]: value } as ProfilePatch);
      delete el.dataset.profilePrefilled;
    }, DEBOUNCE_MS);

    el.addEventListener("input", handler);
    el.addEventListener("change", handler);
  }

  if (prefillCount > 0) {
    const hint = ensureHint();
    hint
      .querySelector<HTMLButtonElement>("#profile-prefill-clear")
      ?.addEventListener("click", () => {
        clearProfile();
        clearPrefilled(prefilledInputs);
        hint.remove();
      });
  }
}

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function schedule(): void {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(init, { timeout: 1200 });
    return;
  }
  setTimeout(init, 120);
}

schedule();
document.addEventListener("astro:page-load", () => {
  const root = document.querySelector<HTMLElement>(
    "[data-analytics-page-type='calculator']"
  );
  if (root) delete root.dataset.profilePrefillHydrated;
  schedule();
});
