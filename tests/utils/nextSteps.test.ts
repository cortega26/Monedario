import { describe, expect, it } from "vitest";

import { deriveCalculatorId, deriveNextStepId } from "@/utils/nextSteps";

// Mismo patrón de validación que aplica el sanitizador de analytics
// (src/contracts/analytics-events.ts), reproducido aquí a propósito para no
// importar un símbolo privado del contrato.
const SAFE_TOKEN = /^[a-z0-9][a-z0-9._-]{0,79}$/;

// Destinos reales que `NextSteps` recibe hoy (ver src/pages/calculadoras/*.astro
// y src/layouts/PostDetails.astro).
const REAL_NEXT_STEP_HREFS = [
  "/calculadoras/",
  "/calculadoras/apv/",
  "/calculadoras/conversor-uf/",
  "/calculadoras/credito-consumo/",
  "/calculadoras/finiquito-indemnizacion/",
  "/calculadoras/interes-compuesto/",
  "/calculadoras/operacion-renta/",
  "/calculadoras/prepago-credito/",
  "/calculadoras/seguro-cesantia/",
  "/calculadoras/simulador-jubilacion/",
  "/calculadoras/tarjeta-credito/",
  "/posts/deposito-a-plazo-uf-vs-pesos/",
  "/posts/el-poder-del-interes-compuesto/",
  "/posts/finiquito-e-indemnizaciones-en-chile/",
  "/posts/liquidacion-de-sueldo/",
  "/posts/operacion-renta-f22-checklist/",
  "/posts/que-es-el-apv/",
  "/posts/utm-chile-que-es-como-funciona/",
];

describe("deriveNextStepId", () => {
  it("deriva un token estable a partir del href", () => {
    expect(deriveNextStepId("/calculadoras/conversor-uf/")).toBe(
      "calculadoras-conversor-uf"
    );
  });

  it("trunca a 80 caracteres", () => {
    const longHref = `/posts/${"a".repeat(120)}/`;
    const result = deriveNextStepId(longHref);
    expect(result.length).toBeLessThanOrEqual(80);
  });

  it.each(REAL_NEXT_STEP_HREFS)(
    "produce un token válido (SAFE_TOKEN) para %s",
    href => {
      const result = deriveNextStepId(href);
      expect(result).toMatch(SAFE_TOKEN);
    }
  );
});

describe("deriveCalculatorId", () => {
  it('devuelve el slug para "/calculadoras/seguro-cesantia/"', () => {
    expect(deriveCalculatorId("/calculadoras/seguro-cesantia/")).toBe(
      "seguro-cesantia"
    );
  });

  it('devuelve undefined para el índice "/calculadoras/"', () => {
    expect(deriveCalculatorId("/calculadoras/")).toBeUndefined();
  });

  it('devuelve undefined para una página de artículo "/posts/algo/"', () => {
    expect(deriveCalculatorId("/posts/algo/")).toBeUndefined();
  });

  it('devuelve undefined sin barra final "/calculadoras/apv"', () => {
    expect(deriveCalculatorId("/calculadoras/apv")).toBeUndefined();
  });
});
