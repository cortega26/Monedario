# ADR-20260511-calculadora-deposito-a-plazo-ruta.md

**Date:** 2026-05-11
**Status:** Accepted
**Supersedes:** —
**Trigger condition:** New public URL added — requiere ADR per `ROUTES.NO_SILENT_CHANGES`.

---

## Context

Sprint 3 SEO (MON-309) requiere una calculadora de depósito a plazo (DAP) con tasas de referencia BCCh/CMF. Ninguna calculadora existente tiene lógica de tasas de interés bancario de corto plazo ni el impuesto del 4% sobre intereses (art. 59 LIR).

El artículo owner `deposito-a-plazo-uf-vs-pesos` (cluster `ahorro-e-inversion`, `topicRole: owner`) ya está publicado.

---

## Decision

Nueva ruta standalone: `/calculadoras/deposito-a-plazo/`

- **Familia:** `ahorro-prevision`
- **Slug:** `deposito-a-plazo`
- **Inputs:** monto (CLP), plazo (días), tasa TIR (% anual)
- **Outputs:** monto final, interés bruto, impuesto 4% (retención art. 59 LIR si plazo < 1 año y monto aplica), interés neto
- **Artículo owner vinculado:** `/posts/deposito-a-plazo-uf-vs-pesos/`
- **Schema:** FAQPage vía `CalculatorJsonLd`
- **ShareCalculatorResult:** conectado

**No deriva URL de `post.id`** — slug fijo `/calculadoras/deposito-a-plazo/` (`URL.PUBLIC.NO_POST_ID` satisfecho).

---

## Alternatives considered

1. Extender `credito-consumo` con vista de inversión → rechazado: JTBD opuesto (deuda vs ahorro).
2. Incluir múltiples monedas (UF/USD) → diferido: complejidad adicional; la decisión UF vs pesos ya la cubre el artículo owner.

---

## Consequences

- Nueva entrada en `CALCULATOR_PORTFOLIO` y en sitemap.
- `pnpm run check:routes` detectará la nueva ruta — actualizar snapshot post-merge.
- `pnpm run check:rss` no afectado.
- Revisar `pnpm run check:links` para que la vinculación desde el artículo owner resuelva correctamente.
- Nota legal: el impuesto del 4% se aplica sobre intereses de depósitos a plazo según art. 59 Nº4 LIR cuando el beneficiario es persona natural sin actividad de primera categoría. La calculadora muestra el estimado con aviso de verificación profesional.
