/**
 * Shared snapshot-pair handling for the calculator scenario-save adapters.
 *
 * Each calculator keeps the inputs + result of its last completed calculation
 * in two locals (the 089 pair) and hands them to `initScenarioPanel` through
 * three small adapters. Only the snapshot-pair handling is shared here — the
 * per-page `buildSummary` keeps living in each page script because the row
 * labels differ per calculator.
 */

import {
  restoreInputs,
  type ScenarioPanelOptions,
} from "./calculatorScenariosUI";

export interface ScenarioSaveAdapterOptions<TResult> {
  /** Live read of the page's last-calculated inputs (null until valid). */
  getLastInputs: () => Record<string, string> | null;
  /**
   * Live read of the page's last-calculated result (null until valid).
   * Part of the 089 pair: the per-page `buildSummary` guards on it. It is
   * listed here (rather than read inside the shared paths) to absorb the
   * per-page naming variance (`scenarioLastResult` vs `lastResultado`) at
   * the call site and to keep the signature stable for plan 107's
   * `makeStandardScenarioAdapter`.
   */
  getLastResult: () => TResult | null | undefined;
  /** The `#calculator-form-card` element the snapshot restores into. */
  formCard: HTMLElement;
  /** Recalculate button id. Defaults to `"calcBtn"`. */
  calcBtnId?: string;
}

/** The `initScenarioPanel` options this helper provides (sans summary). */
export type ScenarioSaveAdapter = Pick<
  ScenarioPanelOptions,
  "calculatorId" | "readInputs" | "applyInputs"
>;

export function createScenarioSaveAdapter<TResult>(
  options: ScenarioSaveAdapterOptions<TResult>
): ScenarioSaveAdapter {
  const { getLastInputs, formCard, calcBtnId = "calcBtn" } = options;
  return {
    calculatorId: window.location.pathname,
    readInputs: () => {
      const lastInputs = getLastInputs();
      return lastInputs ? { ...lastInputs } : null;
    },
    applyInputs: inputs => {
      restoreInputs(formCard, inputs);
      (document.getElementById(calcBtnId) as HTMLButtonElement | null)?.click();
    },
  };
}
