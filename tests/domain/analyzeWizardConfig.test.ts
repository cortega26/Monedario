import { describe, expect, it } from "vitest";

import { ARTICLE_ENTRY_GUIDES } from "@/config/articleEntryGuides";
import { findNonDiscriminativeSteps } from "@/domain/wizard/analyzeWizardConfig";
import type { WizardConfig } from "@/domain/wizard/WizardConfig";

describe("findNonDiscriminativeSteps", () => {
  it("flags a step when every option reaches the same result", () => {
    const config: WizardConfig = {
      id: "redundant",
      firstStep: "start",
      steps: {
        start: {
          id: "start",
          pregunta: "Pregunta redundante",
          opciones: [
            {
              label: "A",
              resultado: {
                resultKey: "same-result",
                titulo: "Mismo resultado",
                descripcion: "No cambia nada.",
              },
            },
            {
              label: "B",
              resultado: {
                resultKey: "same-result",
                titulo: "Mismo resultado",
                descripcion: "No cambia nada.",
              },
            },
          ],
        },
      },
    };

    expect(findNonDiscriminativeSteps(config)).toEqual([
      { stepId: "start", signatures: ["same-result"] },
    ]);
  });

  it("does not flag the ahorro entry guide after the early-exit refactor", () => {
    const config = ARTICLE_ENTRY_GUIDES["ahorro-inversion-entry-guide"].config;
    expect(findNonDiscriminativeSteps(config)).toEqual([]);
  });
});
