# Estrategia E-E-A-T — evaluación y secuencia (2026-09-28)

Memo externo sobre E-E-A-T aplicado a Monedario. No existe un "score E-E-A-T":
lo que se construye es **evidencia verificable de confianza y autoridad**
(Google pondera Trust como el componente principal en YMYL). Este documento fija
el estado real de cada recomendación y **cuándo implementarla**; no es una orden
de ejecución inmediata.

## Estado real vs. recomendación

| # | Recomendación | Estado en el repo | Momento óptimo |
|---|---|---|---|
| 1 | Revisión experta externa en YMYL crítico | **Ausente**: `content.config.ts` sin campo `reviewer`; `ArticleJsonLd.reviewedBy` apunta al propio autor (auto-revisión); glosario solo tiene `reviewedDate` | **Reclutar ya** (lead time humano); **revisar al cerrar el plan 115**, sobre contenido ya corregido |
| 2 | Página auditable (bloque "Verificación") | **Parcial**: Metodología "Cómo verificarnos", `reviewPolicy`, "fecha de corte" (`ArticleDecisionIntro`), `CalculatorDataFreshness` | **Al cerrar el plan 115**; el enlace a changelog espera a #7 |
| 3 | Reputación externa verificable | **Ops**: plan de distribución/citación existente; sin assets citables públicos | **Tras correcciones + revisiones** (no promocionar cifras erróneas) |
| 4 | Investigación/datos originales | **Parcial**: datasets internos (`src/data/economic-history/*.json`, data-signals) sin página pública | **Ciclo dedicado post-2026-11-02** (URLs nuevas) |
| 5 | `/autor/` como entity home | **Casi**: Person schema rico (knowsAbout, hasCredential, alumniOf, sameAs LinkedIn/GitHub/Tooltician, worksFor) | Quick win de `ProfilePage` + `mainEntityOfPage` **hecho**; secciones de datasets/citas, después |
| 6 | Datos estructurados de autoría | **Mayormente**: Article→Person con `@id`/url/sameAs, `datePublished`/`dateModified`, `lastReviewed`/`reviewedBy`; falta revisor distinto y `ProfilePage` (hecho) | Junto con #1 y #2 |
| 7 | `/correcciones/` público | **Ausente** | **Al cerrar el plan 115**, sembrado con los fixes F01–F07; es URL nueva → **excepción o post-2026-11-02** |
| 8 | Freshness real, no cosmética | **Parcial y con fallos reales** (IPC congelado, UTA sin año, ejemplo estático divergente) | **Ya — en curso**: pasos 3–4 del plan 115 (registry + IPC) |

## Restricciones de calendario

1. **Correctitud primero**: no se construye autoridad externa ni revisiones
   sobre contenido con un P0 live (auditoría de correctitud 2026-09-28).
2. **FOCO ESTRICTO / VALIDACIÓN UTILITY-LED hasta 2026-11-02**: no se crean
   URLs indexables nuevas sin excepción aprobada. Afecta a #7 y #4. #2, #5, #6
   y #8 viven en URLs existentes.
3. **Lead time humano** de #1: semanas; por eso se inicia antes que el resto.
4. CI de GitHub Actions sin cupo por facturación hasta el 1°: los gates locales
   son la evidencia mientras tanto.

## Secuencia acordada

- **Ahora (en paralelo al plan 115)**: #5/#6 (`ProfilePage`/`sameAs`, hecho) ·
  #8 (ya en curso) · iniciar conversaciones de #1.
- **Al cerrar 115**: #2 (bloque de verificación con fuentes, tests y revisor) ·
  preparar #7 sembrado con las correcciones.
- **Post-2026-11-02 o con excepción**: publicar #7 y desarrollar #4.
- **Continuo tras correcciones**: #3 (citas, menciones, distribución).
- **Transversal**: auditorías externas 02 (SEO) y 03/04 pueden correr en
  paralelo; sus findings se pliegan cuando lleguen.

## Nota

La auditoría SEO 2026-09-28 (`docs/reports/AUDIT-SEO-2026-09-28.md`) refuerza
#2/#6 (schema y breadcrumbs) y aporta gobernanza de indexabilidad/linking, que
es el habilitante técnico para que #3 y #4 rindan.
