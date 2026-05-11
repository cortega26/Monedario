# ADR-20260511-calculadora-interes-compuesto-ruta.md

**Date:** 2026-05-11
**Status:** Accepted
**Supersedes:** —
**Trigger condition:** New public URL added — requires ADR per `ROUTES.NO_SILENT_CHANGES`.

---

## Context

Sprint 3 SEO (MON-308) requiere una calculadora genérica de ahorro/inversión con interés compuesto. El `simulador-jubilacion` existente es AFP-específico y no puede absorber el caso de uso genérico (capital inicial + tasa + período + frecuencia de capitalización sin AFP).

El artículo owner `el-poder-del-interes-compuesto` (cluster `ahorro-e-inversion`, `topicRole: owner`) ya está publicado.

---

## Decision

Nueva ruta standalone: `/calculadoras/interes-compuesto/`

- **Familia:** `ahorro-prevision`
- **Slug:** `interes-compuesto`
- **Inputs:** capital inicial, tasa anual (%), período (años), frecuencia de capitalización (anual/semestral/trimestral/mensual)
- **Outputs:** monto final, interés generado, tabla de evolución año a año
- **Artículo owner vinculado:** `/posts/el-poder-del-interes-compuesto/`
- **Schema:** FAQPage vía `CalculatorJsonLd`
- **ShareCalculatorResult:** conectado

**No deriva URL de `post.id`** — slug fijo `/calculadoras/interes-compuesto/` (`URL.PUBLIC.NO_POST_ID` satisfecho).

---

## Alternatives considered

1. Extender `simulador-jubilacion` → rechazado: cambiaría la semántica de la URL y el JTBD de esa calc (proyección pensión AFP).
2. Hub genérico de ahorro → rechazado: no es una calc standalone, y el artículo owner ya existe para interés compuesto.

---

## Consequences

- Nueva entrada en `CALCULATOR_PORTFOLIO` y en sitemap.
- `pnpm run check:routes` detectará la nueva ruta en el diff del snapshot — actualizar snapshot post-merge.
- `pnpm run check:rss` no afectado (calculadoras no en RSS de blog).
- Revisar `pnpm run check:links` para que la vinculación desde el artículo owner resuelva correctamente.
