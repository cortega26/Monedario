/**
 * Análisis estático de los emisores de analytics del cliente.
 *
 * Cada literal de emisión — `trackAnalyticsEvent("…")`, `track("…")` o
 * `monedarioAnalytics.track("…")` — en src/scripts/*.ts, src/components/**
 * y src/utils/*.ts debe ser transmisible con la misma lógica del transporte:
 * `isAnalyticsEventName(normalizeLegacyAnalyticsEvent(nombre, {}).event)`.
 *
 * Motivo (auditoría post-950d13e9): emisores que dependen de la
 * normalización de LEGACY_EVENT_NAMES se romperían silenciosamente si esa
 * compatibilidad se limpiara en una migración completa a v2. Este test falla
 * si aparece un emisor no transmisible nuevo o no documentado.
 *
 * Se excluyen los nombres dinámicos por diseño (p. ej. el resultado de
 * `getAnalyticsEventNameForCta`): el patrón solo captura literales como
 * primer argumento de `track(` / `trackAnalyticsEvent(`.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  isAnalyticsEventName,
  normalizeLegacyAnalyticsEvent,
} from "../../src/contracts/analytics-events";

const SCAN_DIRS = ["src/scripts", "src/components", "src/utils"];

/** Solo literales: `track("nombre"` / `trackAnalyticsEvent('nombre'` / `monedarioAnalytics?.track("nombre"`. */
const EMITTER_PATTERN = /\btrack(?:AnalyticsEvent)?\(\s*(["'])([a-z0-9_]+)\1/g;

/**
 * Emisores no transmisibles aceptados, con su razón documentada.
 * Cualquier nombre no transmisible que NO esté aquí hace fallar el test.
 */
const NON_TRANSMISSIBLE_EXCEPTIONS: Readonly<Record<string, string>> = {
  resume_click:
    "KPI pausado — decisión del operador 2026-08-03; ResumeWidget sigue " +
    "emitiéndolo hasta el follow-up de producto (ver " +
    "LEGACY_UNMAPPED_EXPORT_EVENTS en el worker).",
  resume_cleared:
    "Misma instrumentación del ResumeWidget pausado (familia resume_click).",
  article_scroll_depth:
    "Evento dataLayer-only por diseño desde v1 (nunca estuvo en ninguna " +
    "allowlist); sin sucesor en la taxonomía v2; el transporte lo descarta " +
    "en Gate 2.",
  copy_template:
    "Evento dataLayer-only por diseño; sin sucesor en la taxonomía v2.",
  calculator_print_click:
    "No existe evento de impresión en la taxonomía v2.",
  calculator_share_click:
    "Clic pre-share (abre el modal); share_attempt/share_success ya cubren " +
    "el share real en ShareCalculatorResult con share_method.",
  calculator_result_action_click:
    "Clics de acción de resultado genéricos; sus params " +
    "(action_label/action_type/destination_href) no mapean a canónicos v2 " +
    "(next_step_click requiere next_step_id). El payload está fijado por " +
    "tests/integration/homepage-content.test.ts.",
  article_calculator_cta_click:
    "CTA inline (CalculatorCTA.astro) sin sucesor en la taxonomía v2; los " +
    "CTA dinámicos (getAnalyticsEventNameForCta) quedan fuera del patrón.",
};

function emitterFiles(): string[] {
  const files: string[] = [];
  for (const dir of SCAN_DIRS) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // src/components/ tiene subdirectorios (p. ej. calculator/)
        for (const nested of readdirSync(join(dir, entry.name))) {
          if (nested.endsWith(".astro")) {
            files.push(join(dir, entry.name, nested));
          }
        }
        continue;
      }
      if (entry.name.endsWith(".ts") || entry.name.endsWith(".astro")) {
        files.push(join(dir, entry.name));
      }
    }
  }
  return files;
}

function emittedNames(file: string): string[] {
  const source = readFileSync(file, "utf8");
  return [...source.matchAll(EMITTER_PATTERN)].map((match) => match[2]);
}

function isTransmissible(name: string): boolean {
  return isAnalyticsEventName(normalizeLegacyAnalyticsEvent(name, {}).event);
}

describe("emisores de analytics del cliente — transmisibilidad", () => {
  const files = emitterFiles();
  const allNames = files.flatMap(emittedNames);
  const uniqueNames = [...new Set(allNames)].sort();

  it("escanea los emisores de scripts, componentes (incl. subdirectorios) y utils", () => {
    expect(files.length).toBeGreaterThan(0);
    expect(allNames.length).toBeGreaterThan(0);
  });

  it.each(uniqueNames)(
    "%s es transmisible o está documentado como excepción",
    (name) => {
      expect(
        isTransmissible(name) || name in NON_TRANSMISSIBLE_EXCEPTIONS,
      ).toBe(true);
    },
  );

  it("falla si aparece un emisor no transmisible nuevo (no documentado)", () => {
    const undocumented = uniqueNames.filter(
      (name) =>
        !isTransmissible(name) && !(name in NON_TRANSMISSIBLE_EXCEPTIONS),
    );
    expect(undocumented).toEqual([]);
  });
});
