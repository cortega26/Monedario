import { describe, expect, it } from "vitest";

import {
  ARTICLE_ENTRY_GUIDES,
  getArticleEntryGuide,
} from "@/config/articleEntryGuides";
import type { WizardConfig, WizardResult } from "@/domain/wizard/WizardConfig";

function walkPath(config: WizardConfig, labels: string[]): WizardResult {
  let stepId = config.firstStep;

  for (const label of labels) {
    const step = config.steps[stepId];
    expect(step, `Missing step ${stepId}`).toBeDefined();

    const option = step.opciones.find(candidate => candidate.label === label);
    expect(option, `Missing option "${label}" on step ${stepId}`).toBeDefined();

    if (option?.resultado) return option.resultado;
    expect(option?.next, `Option "${label}" on step ${stepId} must continue`).toBeTruthy();
    stepId = option!.next!;
  }

  throw new Error(`Path did not resolve to a result after labels: ${labels.join(" → ")}`);
}

function collectResults(config: WizardConfig): WizardResult[] {
  const queue = [config.firstStep];
  const visited = new Set<string>();
  const results: WizardResult[] = [];

  while (queue.length > 0) {
    const stepId = queue.shift()!;
    if (visited.has(stepId)) continue;
    visited.add(stepId);
    const step = config.steps[stepId];
    if (!step) continue;
    for (const option of step.opciones) {
      if (option.resultado) {
        results.push(option.resultado);
      } else if (option.next) {
        queue.push(option.next);
      }
    }
  }

  return results;
}

describe("articleEntryGuides", () => {
  const guide = getArticleEntryGuide("ahorro-inversion-entry-guide");

  it("registers the ahorro e inversion entry guide", () => {
    expect(guide).toBeTruthy();
    expect(ARTICLE_ENTRY_GUIDES["ahorro-inversion-entry-guide"]).toBeTruthy();
  });

  it("routes users without an emergency fund to the fondo de emergencia article", () => {
    const result = walkPath(guide!.config, [
      "No",
    ]);
    expect(result.resultKey).toBe("emergency-fund-first");
    expect(result.primaryCta?.href).toBe("/posts/fondo-emergencia-chile/");
  });

  it("routes short-term liquidity seekers to DAP content and calculator", () => {
    const readResult = walkPath(guide!.config, [
      "Sí",
      "No perder / mantener liquidez",
      "Menos de 12 meses",
      "Entender opciones",
    ]);
    expect(readResult.resultKey).toBe("short-term-liquidity-read");
    expect(readResult.primaryCta?.href).toBe("/posts/deposito-a-plazo-uf-vs-pesos/");

    const calcResult = walkPath(guide!.config, [
      "Sí",
      "No perder / mantener liquidez",
      "Menos de 12 meses",
      "Simular / calcular",
    ]);
    expect(calcResult.resultKey).toBe("short-term-liquidity-calc");
    expect(calcResult.primaryCta?.href).toBe("/calculadoras/deposito-a-plazo/");
  });

  it("routes long-term growth seekers to ETF education", () => {
    const result = walkPath(guide!.config, [
      "Sí",
      "Crecer a largo plazo",
      "Más de 5 años",
      "Entender opciones",
    ]);
    expect(result.resultKey).toBe("long-term-growth-read");
    expect(result.primaryCta?.href).toBe("/posts/como-invertir-en-etfs-desde-chile/");
  });

  it("routes tax-benefit seekers to APV content and calculator", () => {
    const readResult = walkPath(guide!.config, [
      "Sí",
      "Ahorrar con beneficio tributario",
      "Entender opciones",
    ]);
    expect(readResult.resultKey).toBe("apv-read");
    expect(readResult.primaryCta?.href).toBe("/posts/que-es-el-apv/");

    const calcResult = walkPath(guide!.config, [
      "Sí",
      "Ahorrar con beneficio tributario",
      "Simular / calcular",
    ]);
    expect(calcResult.resultKey).toBe("apv-calc");
    expect(calcResult.primaryCta?.href).toBe("/calculadoras/apv/");
  });

  it("exits early for growth goals with short or medium horizon", () => {
    const result = walkPath(guide!.config, [
      "Sí",
      "Crecer a largo plazo",
      "5 años o menos",
    ]);
    expect(result.resultKey).toBe("growth-short-horizon");
    expect(result.primaryCta?.href).toBe(
      "/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/"
    );
  });

  it("gives every terminal result a stable key and primary CTA", () => {
    const results = collectResults(guide!.config);
    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      expect(result.resultKey).toBeTruthy();
      expect(result.primaryCta?.href).toMatch(/^\/(posts|calculadoras|guias)\//);
      expect(result.primaryCta?.label).toBeTruthy();
    }
  });
});
