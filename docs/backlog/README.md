# Backlog Monedario.cl — Estado actual

> Generado el 2026-04-08. Última actualización: 2026-05-20.
> Lectura obligatoria antes de ejecutar cualquier ticket: `AGENTS.md` y `context/INVARIANTS.md`.

---

## Estado actual — 2026-05-20

Completado: Fases 0–3 salvo decisiones pendientes explícitas (`MON-301`, `MON-304`), auditorías de calculadoras, UX backlog (15/16), Phase 1 Profile Persistence, Phase 2 High-Value Roadmap (Waves 1–5), Optimization, Editorial Timeliness, Blog Advisory Standardization, Date Display Consistency, Guardrail Automation, GitHub Actions remediation, Next Best Step, Data Signals (parcial), modernización estratégica 2026-05-11, cierre mobile CWV/LCP (`TD-0039`), `TD-0057` backfill canónico YMYL (46 artículos), SEO roadmap Sprints 0, 2 y 3, publicación Sprint 2B firmada y quick wins de auditoría profunda 2026-05-15, **componentización de calculadoras `TD-0063` + `TD-0069`** (5 componentes, 15 calculadoras, markup duplication 0.84%→0.29%).

Deuda técnica: incluye los findings de drift `TD-0084`..`TD-0094` registrados el 2026-05-20 en `docs/TECH_DEBT_BACKLOG.md`.

### Siguiente orden recomendado

| Orden | Item | Por qué ahora |
|-------|------|---------------|
| 1 | `TD-0084`..`TD-0086` — Drift legal/YMYL alto | Requiere decisión humana/legal/editorial antes de tocar analytics o contenido sensible |
| 2 | `TD-0065` — Bump 8 deps minor outdated | Quick win: `pnpm update --latest` + CI smoke |

### Pendiente — implementación por código

| Plan | Archivo | Bloqueador |
|------|---------|------------|
| Phase 2 — Data Signals (MON-ENV-DATA3b..3c) | `PHASE_2_DATA_SIGNALS.md` | Requiere suscripción Ahrefs Advanced+ |
| Hero image system — remediación manual por lotes | `HERO_IMAGE_SYSTEM_REMEDIATION_2026-04-30.md` | Manual: assets finales pendientes |
| TypeScript 7 compatibility | `TS7_COMPATIBILITY_AUDIT_2026-04-30.md` | Blocked — esperando TS7 stable |
| Newsletter (MON-301) | `ux-backlog.md` | Decisión de plataforma pendiente |
| OWASP Security backlog | `OWASP_SECURITY_AUDIT_2026-05-11.md` | SEC-003 pendiente (verificar `.env` histórico) |
| Auditoría drift 2026-05-20 | `PLAN-drift-audit-2026-05-20.md` | Ejecutar `TD-0084`..`TD-0094` sin cambios automáticos YMYL/legal |
| LinkedIn strategy (MON-304) | `ux-backlog.md` | Fase 3, sin urgencia |
| Illustrations (MON-405) | `ux-backlog.md` | Diferido |
| Blog Advisory Architecture | `BLOG_ADVISORY_ARCHITECTURE_PLAN_2026-04-22.md` | Propuesta futuro mediano |

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
| MON-304 | Estrategia de distribución en LinkedIn | 3 | P3 | analytics | 🔲 pendiente |
| MON-305 | Extender ShareCalculatorResult a 13 calculadoras | 3 | P2 | frontend | ✅ done |
| MON-306 | Extender `sueldo-liquido` — output gratificación legal | 4 | P1 | calculator-ext | ✅ done |
| MON-307 | Extender `finiquito-indemnizacion` — modo vacaciones proporcionales | 4 | P1 | calculator-ext | ✅ done |
| MON-308 | Calculadora interés compuesto (nueva) | 4 | P1 | calculator | ✅ done |
| MON-309 | Calculadora depósito a plazo (nueva) | 4 | P2 | calculator | ✅ done |

---

## Active files in this directory

| File | Status |
|------|--------|
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
| `OWASP_SECURITY_AUDIT_2026-05-11.md` | 9 hallazgos (3🔴3🟠3🟡); SEC-003 verificar primero |
| `PLAN-drift-audit-2026-05-20.md` | Vigente; findings `TD-0084`..`TD-0094` |

## Status — planes vigentes

| Archivo | Estado | Última actualización | Bloqueador | Próximo paso |
|---|---|---:|---|---|
| `PLAN-audit-deep-remediation-2026-05-16.md` | Parcialmente cerrado | 2026-05-16 | `TD-0075`/`TD-0077` requieren medición/ADR; `TD-0079` bloqueado por flujo OG con TTF | Ejecutar `TD-0065` (deps bump) o preparar ADR para TD-0075/TD-0077 |
| `PLAN-calculator-componentization-td-0063-0069-2026-05-20.md` | **Completado** | 2026-05-20 | — | `TD-0063` + `TD-0069` cerrados; 5 componentes, 15 calculadoras refactorizadas |
| `PLAN-github-workflow-hardening-2026-05-13.md` | Parcialmente cerrado | 2026-05-13 | La fase 3 ya registra diminishing returns | Reabrir solo con hallazgo concreto de CI o archivar cuando se acepte el cierre operativo |
| `PLAN-heroimage-prompt-repair-2026-05-01.md` | Parcialmente cerrado | 2026-05-01 | Assets finales pendientes fuera del código | Coordinar lote manual de hero images y validar `pnpm run check:hero-images` |
| `PLAN-seo-cross-document-roadmap-2026-05-01.md` | Parcialmente cerrado | 2026-05-20 | Sprint 1 consolidaciones sigue parcial; Sprint 3 cerrado | Reabrir solo para cierre sistemático de Sprint 1 o archivar cuando se acepte el cierre parcial |
| `OWASP_SECURITY_AUDIT_2026-05-11.md` | Vigente | 2026-05-11 | `SEC-003` requiere verificar `.env` histórico antes de cambios | Verificar `SEC-003`; luego ejecutar orden recomendado del audit |
| `PLAN-drift-audit-2026-05-20.md` | Vigente | 2026-05-20 | `TD-0084`..`TD-0086` requieren revisión humana/legal/editorial | Ejecutar primero decisiones de analytics/legal y refresh YMYL controlado |
| `TS7_COMPATIBILITY_AUDIT_2026-04-30.md` | Bloqueado | 2026-04-30 | TypeScript 7 stable y soporte `@astrojs/check` TS7 | Esperar señal del workflow `check-ts7-readiness.yml` |
| `HERO_IMAGE_SYSTEM_REMEDIATION_2026-04-30.md` | Vigente | 2026-04-30 | Remediación manual de assets por lotes | Empezar batch Payroll / salary / deductions |

## Planes archivados en este pase

| Archivo | Motivo |
|---|---|
| `docs/archive/backlog/PLAN-publish-signed-off-sprint-2b-articles-2026-05-11.md` | Declaraba `Status: done` y outcome publicado |
| `docs/archive/backlog/PLAN-strategic-repository-modernization-2026-05-11.md` | Declaraba `Status: Completed` con closure notes y evidencia |

Archived completed plans → `docs/archive/backlog/`.
