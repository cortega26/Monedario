# Backlog Monedario.cl — Estado actual

> Generado el 2026-04-08. Última actualización: 2026-08-02.
> Lectura obligatoria antes de ejecutar cualquier ticket: `AGENTS.md` y `context/INVARIANTS.md`.

---

## Estado actual — 2026-08-02

Desde 2026-08-02 rige `FOCO ESTRICTO / VALIDACIÓN UTILITY-LED`. Nuevas superficies permanecen en `UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md`; la continuidad del proyecto se evalúa por sostenibilidad, utilidad, aprendizaje y confianza, no por ingresos de corto plazo.

Completado: Fases 0–3 salvo decisiones pendientes explícitas (`MON-301`, `MON-304`), auditorías de calculadoras, UX backlog (15/16), Phase 1 Profile Persistence, Phase 2 High-Value Roadmap (Waves 1–5), Optimization, Editorial Timeliness, Blog Advisory Standardization, Date Display Consistency, Guardrail Automation, GitHub Actions remediation, Next Best Step, Data Signals (parcial), modernización estratégica 2026-05-11, cierre mobile CWV/LCP (`TD-0039`), `TD-0057` backfill canónico YMYL (46 artículos), SEO roadmap Sprints 0, 2 y 3, publicación Sprint 2B firmada, quick wins de auditoría profunda 2026-05-15, **componentización de calculadoras `TD-0063` + `TD-0069`** (5 componentes, 15 calculadoras, markup duplication 0.84%→0.29%) y la infraestructura de medición first-party (collector, export JSON y scorecard). W28 ya entrega una semana post-fix válida: 498 clics / 94.443 impresiones GSC y 310 filas / 2.044 eventos / 6 tipos en analytics agregado.

Deuda técnica: incluye los findings de drift `TD-0084`..`TD-0094` registrados el 2026-05-20 en `docs/TECH_DEBT_BACKLOG.md`.

### Siguiente orden recomendado

| Orden | Item | Por qué ahora |
|-------|------|---------------|
| 1 | Validar CSP/Cloudflare después del despliegue | Confirmar que `no-transform` evita JSD sin relajar la CSP hash-only |
| 2 | Cerrar guardrail LCP de UTM | Dos de tres corridas móviles superaron 1,7 s; conservar el umbral y corregir antes de cerrar |
| 3 | Ejecutar ritual utility-led por dos semanas comparables | Medir utilidad, carga, costo, calidad, aprendizaje y reputación; ingresos siguen siendo opcionales |
| 4 | Firmar (editor humano) el lote 0 de `impuestos-personas` | Los cuatro SLA vencidos ya se remediaron y verificaron (compliance adversarial en múltiples rondas): `CONDITIONAL` 9,3-9,45/10, cero defectos bloqueantes. `check:editorial-timeliness` ya no los reporta como stale. Falta solo la firma humana en `07-publish-packet.md` y decidir el merge de PR #423. Ver `PLAN-auditoria-corpus-publicado-2026-08-12.md` §18 |

### Pendiente — implementación por código

| Plan | Archivo | Bloqueador |
|------|---------|------------|
| Auditoría del corpus publicado vs. estándares vigentes | `PLAN-auditoria-corpus-publicado-2026-08-12.md` | Lote 0 ejecutado y en PR #423 (`CONDITIONAL` 9,3-9,45/10, cero defectos bloqueantes); pendiente firma humana y decisión de merge. Lotes 1-5 (resto del corpus) sin iniciar |
| Validación utility-led, días 1–30 | `PLAN-utility-led-validation-2026-08-02.md` | Cierre parcial: CSP validada en producción (TD-0099) y guardrail LCP UTM cerrado (TD-0101); queda el contraste con RUM tras merge. Los nueve SLA editoriales se cerraron el 2026-08-03 (`TD-0098` resuelto) |
| Crecimiento liderado por calculadoras | `PLAN-calculator-led-growth-2026-06-28.md` | OBS-01 activo: W27 quedó parcial; W28 es la primera semana post-fix válida. Consolidar evidencia multiweek y aplicar el gate del plan antes de PR-03 |
| Phase 2 — Data Signals (MON-ENV-DATA3b..3c) | `PHASE_2_DATA_SIGNALS.md` | Requiere suscripción Ahrefs Advanced+ |
| Hero image system — remediación manual por lotes | `HERO_IMAGE_SYSTEM_REMEDIATION_2026-04-30.md` | Manual: assets finales pendientes |
| TypeScript 7 compatibility | `TS7_COMPATIBILITY_AUDIT_2026-04-30.md` | Blocked — esperando TS7 stable |
| Newsletter (MON-301) | `ux-backlog.md` | Decisión de plataforma pendiente |
| ~~OWASP Security backlog~~ | `OWASP_SECURITY_AUDIT_2026-05-11.md` | **Cerrado 2026-06-28** — 8/9 implementados, SEC-004 monitoreo preventivo |
| ~~Auditoría drift 2026-05-20~~ | `PLAN-drift-audit-2026-05-20.md` | **Cerrada 100%** 2026-05-30 (`TD-0084`..`TD-0094`) |
| ~~Auditoría alignment 2026-05-25~~ | `PLAN-alignment-audit-remediation-2026-05-25.md` | **Cerrada** 2026-05-25 (`ALIGN-001`..`ALIGN-010`) |
| ~~LinkedIn strategy (MON-304)~~ | `ux-backlog.md` | **Diferido 2026-05-30** — canal de baja afinidad para audiencia de finanzas de consumo; links `nofollow` (sin SEO). Página de empresa se mantiene pasiva por E-E-A-T. Distribución prioriza newsletter (MON-301) y canales visuales (IG/TikTok). |
| Illustrations (MON-405) | `ux-backlog.md` | Diferido |
| Blog Advisory Architecture | `BLOG_ADVISORY_ARCHITECTURE_PLAN_2026-04-22.md` | Propuesta futuro mediano |
| Audit of the Small Details | `PLAN-audit-small-details-2026-05-22.md` | Programa activo de auditoria y backlog `ASD-###`; primera pasada audit-only completa |
| ~~Trigger manual del export de analytics~~ | `PLAN-analytics-export-manual-trigger-2026-06-30.md` | **Cerrado 2026-07-07** — endpoint manual `GET /api/analytics/export?secret=&week=` implementado, desplegado y verificado contra R2 para W26/W27 |
| CTR UTM/UF (tráfico P0) | `PLAN-growth-utm-ctr-2026-09-16.md` | TODO — sign-off owner; FOCO hasta 2026-11-02, sin URLs nuevas |
| Panel post-resultado (funnel) | `PLAN-result-panel-conversion-2026-09-16.md` | TODO — sign-off owner; piloto UTM, no ampliar sin umbral |
| Refresco y consolidación contenido | `PLAN-content-refresh-consolidation-2026-09-16.md` | TODO — sign-off owner; lote 0 mergeado (PR #423), lotes 1–5 encolables |
| Reevaluación monetización | `PLAN-monetization-reevaluation-2026-09-16.md` | TODO — sign-off owner; evidencia + discovery + ADR borrador, sin implementar |
| Evolución visual/UX | `PLAN-ux-evolution-cta-2026-09-16.md` | TODO — sign-off owner; slices S1–S4, sin rebrand |

### Bloqueado — requiere acción humana

| Artefacto | Estado | Qué se necesita |
|-----------|--------|-----------------|
| Operación Renta Centro | BLOCKED | Verificación SII/TGR + sign-off |

---

## Tabla maestra de tickets

| ID | Título | Fase | Prioridad | Tipo | Estado |
|----|--------|------|-----------|------|--------|
| MON-001 | Reconciliar estado codebase vs producción | 0 | P0 | seo-tech | ✅ done |
| MON-002 | Auditoría GSC — indexación y cobertura | 0 | P0 | analytics | ✅ done |
| MON-003 | Baseline Core Web Vitals (3 templates) | 0 | P0 | frontend | ✅ done |
| MON-004 | Verificar schema estructurado en producción | 0 | P0 | seo-tech | ✅ done |
| MON-005 | Mapa de gaps real por silo | 0 | P1 | content | ✅ done |
| MON-101 | Hub UF/Costo de Vida en dropdown de Guías | 1 | P0 | frontend | ✅ done |
| MON-102 | Glosario en navegación principal | 1 | P0 | frontend | ✅ done |
| MON-103 | Instalar plataforma analytics privacy-friendly | 1 | P0 | analytics | ✅ done |
| MON-104 | Schema DefinedTerm en páginas de glosario | 1 | P1 | seo-tech | ✅ done |
| MON-105 | Registrar sitemap en GSC y verificar | 1 | P0 | seo-tech | ✅ done |
| MON-201 | Homepage — hero y propuesta de valor | 2 | P0 | frontend | ✅ done |
| MON-202 | Homepage — módulo "¿Qué necesitas resolver?" | 2 | P1 | frontend | ✅ done |
| MON-203 | Componente StartHere en todos los hubs | 2 | P1 | frontend | ✅ done |
| MON-204 | PrimaryCTA post-resultado en calculadoras | 2 | P1 | frontend | ✅ done |
| MON-205 | MethodologyBlock en calculadoras | 2 | P1 | frontend | ✅ done |
| MON-206 | TOC sticky auto-generado en artículos largos | 2 | P2 | frontend | ✅ done |
| MON-207 | Página /contacto/ | 2 | P2 | frontend | ✅ done |
| MON-208 | Artículo — Fonasa vs Isapre comparativa | 2 | P1 | content | ✅ done |
| MON-209 | Artículo — Primer empleo en Chile guía | 2 | P2 | content | ✅ done |
| MON-210 | Artículo — Crédito hipotecario paso a paso | 2 | P2 | content | ✅ done |
| MON-211 | Artículo — Cómo leer la cartola AFP | 2 | P2 | content | ✅ done |
| MON-212 | Artículo — Cómo salir del boletín comercial | 2 | P2 | content | ✅ done |
| MON-213 | Hub Operación Renta — página hub estacional | 2 | P1 | content | ✅ done |
| MON-214 | Glosario batch — 8 entradas faltantes | 2 | P1 | content | ✅ done |
| MON-215 | Auditoría calculadora finiquito-indemnizacion | 2 | P0 | calculator | ✅ done |
| MON-216 | Auditoría calculadora APV | 2 | P1 | calculator | ✅ done |
| MON-301 | Newsletter — setup plataforma + formulario | 3 | P1 | ux | 🔲 pendiente |
| MON-302 | Módulo "Compartir resultado" en calculadoras | 3 | P2 | frontend | ✅ done |
| MON-303 | Página /cambios/ — changelog editorial | 3 | P2 | content | ✅ done |
| MON-304 | Estrategia de distribución en LinkedIn | 3 | P3 | analytics | ⏸️ diferido (canal de baja afinidad; ver nota 2026-05-30) |
| MON-305 | Extender ShareCalculatorResult a 13 calculadoras | 3 | P2 | frontend | ✅ done |
| MON-306 | Extender `sueldo-liquido` — output gratificación legal | 4 | P1 | calculator-ext | ✅ done |
| MON-307 | Extender `finiquito-indemnizacion` — modo vacaciones proporcionales | 4 | P1 | calculator-ext | ✅ done |
| MON-308 | Calculadora interés compuesto (nueva) | 4 | P1 | calculator | ✅ done |
| MON-309 | Calculadora depósito a plazo (nueva) | 4 | P2 | calculator | ✅ done |

---

## Active files in this directory

| File | Status |
|------|--------|
| `PLAN-calculator-led-growth-2026-06-28.md` | **IN PROGRESS**; medición desplegada, W28 post-fix válida; consolidar OBS-01 sin saltar su gate |
| `PLAN-growth-utm-ctr-2026-09-16.md` | **TODO**; CTR UTM/UF, una URL por vez, baseline W37 firmado antes de editar |
| `PLAN-result-panel-conversion-2026-09-16.md` | **TODO**; identidad eventos + panel piloto UTM, umbrales pre-declarados |
| `PLAN-content-refresh-consolidation-2026-09-16.md` | **TODO**; lotes YMYL con pipeline + ownership, tras firma lote 0 |
| `PLAN-monetization-reevaluation-2026-09-16.md` | **TODO**; evidencia funnel + discovery B2B + ADR borrador, nada comercial sin gate |
| `PLAN-ux-evolution-cta-2026-09-16.md` | **TODO**; slices S1–S4 evolución, LHCI/axe sin regresión |
| `PHASE_2_DATA_SIGNALS.md` | Parcialmente completado; DATA3a..3c bloqueado |
| `HERO_IMAGE_SYSTEM_REMEDIATION_2026-04-30.md` | Pendiente remediación manual |
| `PLAN-heroimage-prompt-repair-2026-05-01.md` | Código completo; assets manuales pendientes |
| `PLAN-seo-cross-document-roadmap-2026-05-01.md` | Sprints 0, 2 y 3 completados; Sprint 1 consolidaciones sigue parcial |
| `PLAN-calculator-componentization-td-0063-0069-2026-05-20.md` | **Completado** 2026-05-20; `TD-0063` + `TD-0069` cerrados |
| `PLAN-audit-deep-remediation-2026-05-16.md` | Quick wins completados; quedan TD estructurales/ADR/medición |
| `PLAN-github-workflow-hardening-2026-05-13.md` | Parcialmente cerrado; fase 3 en diminishing returns |
| `TS7_COMPATIBILITY_AUDIT_2026-04-30.md` | Bloqueado |
| `ux-backlog.md` | 15/16 completado; MON-405 diferido |
| `BLOG_ADVISORY_ARCHITECTURE_PLAN_2026-04-22.md` | Propuesta |
| `prompt-*.md` | Plantillas reutilizables |
| `OWASP_SECURITY_AUDIT_2026-05-11.md` | ✅ Cerrado 2026-06-28 — 8/9 implementados, SEC-004 en monitoreo preventivo |
| `PLAN-drift-audit-2026-05-20.md` | **Completado** 2026-05-30; `TD-0084`..`TD-0094` cerrados |
| `PLAN-audit-small-details-2026-05-22.md` | Vigente; programa audit-only con cinco reportes en `docs/reports/` y backlog `ASD-###` |
| `PLAN-alignment-audit-remediation-2026-05-25.md` | Completado 2026-05-25; batches A-D cerrados |

## Status — planes vigentes

| Archivo | Estado | Última actualización | Bloqueador | Próximo paso |
|---|---|---:|---|---|
| `PLAN-organic-diversification-handoff-2026-07-27.md` | **READY FOR MERGE** | 2026-07-27 | WS-B piloto guide-only verificado (dos listas de prosa; sin calculadoras) | Merge y medir a +28 días; no ampliar a calculadoras sin una decisión nueva |
| `PLAN-calculator-led-growth-2026-06-28.md` | **IN PROGRESS** | 2026-07-16 | W28 entrega la primera semana post-fix válida; OBS-01 todavía exige una decisión explícita sobre suficiencia multiweek antes de PR-03 | Contrastar W27/W28, documentar suficiencia o inconclusión y aplicar el gate del plan antes de cambiar journeys |
| `PLAN-audit-deep-remediation-2026-05-16.md` | Parcialmente cerrado | 2026-05-16 | `TD-0075`/`TD-0077` requieren medición/ADR; `TD-0079` bloqueado por flujo OG con TTF | Ejecutar `TD-0065` (deps bump) o preparar ADR para TD-0075/TD-0077 |
| `PLAN-calculator-componentization-td-0063-0069-2026-05-20.md` | **Completado** | 2026-05-20 | — | `TD-0063` + `TD-0069` cerrados; 5 componentes, 15 calculadoras refactorizadas |
| `PLAN-github-workflow-hardening-2026-05-13.md` | Parcialmente cerrado | 2026-05-13 | La fase 3 ya registra diminishing returns | Reabrir solo con hallazgo concreto de CI o archivar cuando se acepte el cierre operativo |
| `PLAN-heroimage-prompt-repair-2026-05-01.md` | Parcialmente cerrado | 2026-05-01 | Assets finales pendientes fuera del código | Coordinar lote manual de hero images y validar `pnpm run check:hero-images` |
| `PLAN-seo-cross-document-roadmap-2026-05-01.md` | Parcialmente cerrado | 2026-05-20 | Sprint 1 consolidaciones sigue parcial; Sprint 3 cerrado | Reabrir solo para cierre sistemático de Sprint 1 o archivar cuando se acepte el cierre parcial |
| `OWASP_SECURITY_AUDIT_2026-05-11.md` | **Cerrado** | 2026-06-28 | 8/9 implementados; SEC-004 monitoreo preventivo | Auditoría completa — ver Progress Log |
| `PLAN-drift-audit-2026-05-20.md` | **Completado** | 2026-05-30 | — | `TD-0084`..`TD-0094` cerrados; ver `docs/TECH_DEBT_BACKLOG.md` |
| `PLAN-audit-small-details-2026-05-22.md` | Vigente | 2026-05-22 | Remediaciones deben ejecutarse por batch y respetar pipelines YMYL/URL/RSS | Empezar Batch 1: P0 no sustantivo + auditoria detallada de calculadoras |
| `PLAN-alignment-audit-remediation-2026-05-25.md` | **Completado** | 2026-05-25 | — | `ALIGN-001`..`ALIGN-010` cerrados; batches A-D con gates registrados |
| `TS7_COMPATIBILITY_AUDIT_2026-04-30.md` | Bloqueado | 2026-04-30 | TypeScript 7 stable y soporte `@astrojs/check` TS7 | Esperar señal del workflow `check-ts7-readiness.yml` |
| `HERO_IMAGE_SYSTEM_REMEDIATION_2026-04-30.md` | Vigente | 2026-04-30 | Remediación manual de assets por lotes | Empezar batch Payroll / salary / deductions |

## Planes archivados en este pase

| Archivo | Motivo |
|---|---|
| `docs/archive/backlog/PLAN-publish-signed-off-sprint-2b-articles-2026-05-11.md` | Declaraba `Status: done` y outcome publicado |
| `docs/archive/backlog/PLAN-strategic-repository-modernization-2026-05-11.md` | Declaraba `Status: Completed` con closure notes y evidencia |
| `docs/archive/backlog/PLAN-opportunity-scan-2026-06-21.md` | **CERRADO 2026-06-25** — 16/16 verificado (`pnpm run scorecard:opportunities`: AUTO 14/14; manuales OPP-13 bancos-fintech y OPP-14 migrantes con sign-off) |

Archived completed plans → `docs/archive/backlog/`.
