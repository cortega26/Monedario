---
name: Sprint 2 SEO 2026 — Estado de cierre
description: Sprint 2 cerrado 2026-05-03: 6 briefs P1 creados, ownership matrix actualizada, Sprint 2B = redacción de artículos
type: project
---

Sprint 2 cerrado el 2026-05-03. 6 briefs editoriales P1 creados en `docs/editorial/artifacts/briefs/`.

**Why:** Los P1 son owners sin contenido publicado que bloquean el crecimiento SEO de sus clusters.

**How to apply:** Sprint 2B abre el pipeline de redacción artículo por artículo, empezando por `fondo-emergencia` (menor YMYL). Cada artículo requiere gate PRE-02 (registrar canonicalTopic en `editorial-topic-policy.mjs`) antes de redactar.

## Briefs creados

| Brief | Cluster | canonicalTopic propuesto | Endurecido | YMYL |
|---|---|---|---|---|
| `fondo-emergencia.md` | `presupuesto-control-financiero` | `fondo-emergencia-colchon` | No | Bajo/Medio |
| `gratificacion-legal.md` | `sueldo-remuneraciones` | `gratificacion-legal-calculo-tope` | Sí | Medio |
| `sueldo-imponible.md` | `sueldo-remuneraciones` | `sueldo-imponible-base-descuentos` | Sí | Medio |
| `pgu.md` | `pensiones-afp` | `pgu-pension-garantizada` | Sí | Alto |
| `contribuciones-bienes-raices.md` | `impuestos-personas` | `contribuciones-bienes-raices-tramite` | No | Medio/Alto |
| `igc.md` | `impuestos-personas` | `igc-impuesto-global-complementario` | No | Alto |

## Gate crítico para clusters endurecidos

Registrar en `CANONICAL_TOPIC_REGISTRY` de `src/config/editorial-topic-policy.mjs` ANTES de redactar:
- `gratificacion-legal-calculo-tope` → `sueldo-remuneraciones`
- `sueldo-imponible-base-descuentos` → `sueldo-remuneraciones`
- `pgu-pension-garantizada` → `pensiones-afp`

## Archivos de referencia

- Briefs: `docs/editorial/artifacts/briefs/`
- Reporte: `docs/operations/reports/seo/sprint-2-briefs-p1-2026-05-03.md`
- Commit: `9a79e3b3`
