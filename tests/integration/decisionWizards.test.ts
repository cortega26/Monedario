import { describe, expect, it } from "vitest";

import {
  FRAUDE_CARGO_NO_RECONOCIDO_WIZARD_CONFIG,
  LICENCIA_MEDICA_WIZARD_CONFIG,
} from "@/config/decisionWizards";
import { ARTICLE_ENTRY_GUIDES } from "@/config/articleEntryGuides";
import { findNonDiscriminativeSteps } from "@/domain/wizard/analyzeWizardConfig";

describe("published decision wizards", () => {
  it("do not contain non-discriminative steps", () => {
    const configs = [
      LICENCIA_MEDICA_WIZARD_CONFIG,
      FRAUDE_CARGO_NO_RECONOCIDO_WIZARD_CONFIG,
      ARTICLE_ENTRY_GUIDES["ahorro-inversion-entry-guide"].config,
    ];

    for (const config of configs) {
      expect(findNonDiscriminativeSteps(config)).toEqual([]);
    }
  });

  it("keeps the fraud wizard product-type question discriminative", () => {
    const firstStep =
      FRAUDE_CARGO_NO_RECONOCIDO_WIZARD_CONFIG.steps[
        FRAUDE_CARGO_NO_RECONOCIDO_WIZARD_CONFIG.firstStep
      ];
    expect(firstStep.opciones).toHaveLength(2);
    expect(firstStep.opciones[0].next).toBe("aviso-banco-tarjeta");
    expect(firstStep.opciones[1].next).toBe("aviso-banco-transferencia");
  });
});
