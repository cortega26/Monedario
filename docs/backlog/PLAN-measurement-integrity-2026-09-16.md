# PLAN — Integridad de medición first-party (Sprint 0 adaptado,
sin GA4)

**Estado:** FIRMADO 2026-09-16 — F0+F1 autorizados (pre-requisito
de panel F1)
**Fecha:** 2026-09-16
**Owner de decisión:** Carlos Ortega
**Prioridad:** P0 (pre-requisito de panel F1) · **Esfuerzo:** S/M ·
**Riesgo:** BAJO (auditoría + docs; código solo si hay hallazgo)
**Fuente:** propuesta externa "Sprint 0 Analytics" (veredicto arquitecto
2026-09-16: ADAPT — se rechaza §5 GA4, se conserva el resto sobre el
stack first-party existente)

## Objetivo y límites

Dejar la medición first-party auditada, documentada y validable
end-to-end antes de que el plan hermano de panel toque emisores (F1),
sin instalar ningún tracker de terceros.

En alcance:

- F0 auditoría de integridad: un solo path de inicialización,
  no-duplicación (`page_view` equivalente, `calculator_view` por
  sesión, dedupe), navegación SPA (`ClientRouter` deshabilitado en
  posts/guias/calculadoras — verificar, no asumir), `page_location` /
  `page_title` correctos, hostname productivo, supresión dev/test,
  fallo analítico nunca rompe la app, CSP solo con endpoints
  necesarios, cero regresión perf.
- F1 registro de calculadoras: verificar-o-crear documento central
  (`calculator_id`, nombre público, categoría, ruta) para las 22
  calculadoras reales; IDs estables, no derivados de strings visibles;
  sin renombrar rutas públicas.
- F2 docs: metodología de comparación Cloudflare↔GSC↔first-party
  (capas, ratios diagnósticos, doctrina "diagnóstico, no conversión",
  incidente W37-truncada como ejemplo canónico) + definiciones
  congeladas de métricas derivadas (activación, completitud,
  intent-rate, densidad de intent) con regla de poder 084
  (`SIN DATOS SUFICIENTES` bajo `n_min`, nunca HALT ni 0%).
- F3 procedimiento de validación post-deploy: acción real →
  evento → nombre/parámetros correctos → visible en export R2
  (vía `verify-analytics-worker-deployment.mjs` + check manual de
  filas), para view/start/complete/intent.
- F4 reporte de cierre (§15 de la propuesta, referencias GA4
  sustituidas).

Fuera de alcance (rechazado o BLOCKED):

- GA4/GTM/gtag, cookies de tracking, banner de consentimiento para
  trackers, ampliación de CSP a Google — RECHAZADO (veredicto;
  triplica veto: duplica sistema funcional, rompe promesa pública de
  privacidad, integración de terceros BLOCKED en FOCO).
- Modelos de negocio (lead-gen, afiliación, sponsored, premium) —
  BLOCKED hasta 2026-11-02 + decisión explícita; owned por
  `PLAN-monetization-reevaluation-2026-09-16.md`.
- Fingerprinting, identificadores persistentes, reconstrucción de
  journeys individuales desde agregados, valores financieros en
  eventos — PROHIBIDO (regla adicional §14).
- Fórmulas financieras, rutas SEO, rediseño, auth — intactos.

## Autoridad, invariantes y supuestos

- Precedencia: `docs/AI_ENGINEERING_CONSTITUTION.md` → `AGENTS.md` →
  `context/*.md` → implementación.
- Invariantes: `URL.PUBLIC.NO_POST_ID`, `ROUTES.NO_SILENT_CHANGES`,
  `RSS.NO_REMOVALS`, `OWNERSHIP_BEFORE_EXPANSION`,
  `EXTERNAL_PATTERNS_NON_AUTHORITATIVE` (la propuesta externa informa,
  nunca manda), `SEPARATION_OF_DUTIES` si hay copy YMYL.
- Contratos: `src/contracts/analytics-events.ts` (taxonomía v2,
  allowlist, rechazo PII, ≤2048 B), gates CSP/`_headers`, pipeline
  collector→R2→scorecard.
- Supuestos: A1 `dataLayer` local es bus de debug, no Google (verificado
  `src/scripts/analytics.ts:42-43`); A2 semanal completa = 7 días
  (W37-truncada no decide); A3 brecha `NextSteps.astro` (clics sin
  `calculator_id`) es owned por panel F1 — aquí solo se verifica, no
  se duplica el fix.

## Change Control Record

1. Scope declaration: ver arriba.
2. Impacted modules: `src/scripts/analytics.ts`,
   `src/utils/analytics.ts`, `src/scripts/next-best-step.ts`,
   `src/components/UtmPostResultActions.astro`,
   `src/components/NextSteps.astro`, `src/contracts/analytics-events.ts`
   (solo lectura salvo hallazgo), `workers/analytics-collector/**`
   (solo lectura salvo hallazgo), `src/pages/privacidad.astro` +
   `cookies.astro` (solo si la auditoría exige precisión),
   `docs/operations/*`, `docs/reports/*`, `tests/**`.
3. Invariant preservation: sin URLs nuevas; sin `post.id` en URLs; sin
   superficie indexable; sin tracking individual.
4. Contract preservation: cambios de eventos versionados (schema);
   doble validación cliente + worker intacta; `_headers`/CSP sin
   relajar (cero orígenes nuevos = verificable en diff).
5. Boundary integrity: `pnpm run check:boundaries` al cierre de cada
   fase con código.
6. Test coverage impact: auditar cobertura (estabilidad de nombres,
   taxonomía, sanitización, supresión dev, anti-duplicado); rellenar
   gaps ligados a F1; `pnpm run test` + `test:a11y` verdes.
7. Rollback strategy: auditoría/docs = revert commit; fix con código =
   revert por unidad + re-correr gates; agregados append-only.
8. Regression risk: BAJO (mayoría read-only). Si F0 halla fuga de PII
   o duplicación real → se escala a fix con tests antes de panel F1.

## Competitive Adaptation Appendix

- benchmarkSet: propuesta externa "Sprint 0" (programa de medición
  genérico, sin acceso al repo).
- patternHypothesis: su esqueleto (auditar→taxonomía→probar→validar→
  reportar) es válido con backend first-party sustituido.
- localDelta: sin GA4; capas Cloudflare→GSC→first-party agregado;
  consentimiento innecesario por diseño (agregado, sin cookies de
  tracking); validación vía exports R2, no DebugView.
- nonCopyBoundaries: no se adopta su modelo de negocio, su stack
  (GA4/GTM), ni sus comandos (`npm`/`pytest` para TS — aquí `pnpm`).
- ownerTarget: pipeline de medición existente (sin owner nuevo).
- successSignal: auditoría firmada + registry verificado + docs
  metodología/derivadas + validación end-to-end demostrada + cero
  requests a terceros nuevos.
- ownership conflict check: pass; sin superficie nueva.

## Fases y gates

1. **F0 — Auditoría (read-only + tests).** Checklist §4/§5-adaptado/
   §9/§11: inicialización única, no-duplicados, SPA-nav, location/
   title/hostname, supresión dev, fail-safe, CSP mínima, perf,
   sanitización URLs/query-strings, `support_confirmed` sin
   confirmación fiable. Salida: informe de hallazgos (o limpio) +
   gaps de tests. Gate: informe firmado; hallazgo PII/duplicación →
   fix antes de panel F1.
2. **F1 — Registry (verificar-o-crear).** 22 calculadoras con id
   estable/categoría/ruta; categorías sugeridas (income, employment,
   pension, investment, debt, credit, housing, taxation, indexation)
   mapeadas a las reales. Gate: toda `calculator_id` del export W36
   resuelve en el registry.
3. **F2 — Docs metodología + derivadas.** Comparación por capas con
   baseline 30d/7d de la propuesta (requests 369.363/302.318 humanas;
   visitas 68.486/68.342 humanas) + definiciones congeladas con
   `n_min` del registry F0-panel. Gate: revisión owner (doctrina, no
   código).
4. **F3 — Validación end-to-end.** Procedimiento documentado +
   ejecución en preview/local contra collector (nunca PII real):
   view/start/complete/intent visibles en export. Gate: evidencia de
   corrida.
5. **F4 — Reporte.** Los 14 puntos del §15 con referencias GA4
   sustituidas + gaps + riesgos + experimentos Sprint-1 propuestos
   (no implementados).

STOP/HALT: PII/valor financiero en evento → `HALT` + fix; request a
terceros nuevo → `HALT`; semana <7 días como evidencia → no decidir;
cambio de ruta/slug necesario → salir a excepción, no colar; fix que
exija reescribir infraestructura → `HALT` (prohibido por §4 propio).

## Métricas

| Métrica | Meta |
|---|---|
| Emisores verificados vs registry | 22/22 |
| Duplicados / fuga PII | 0 |
| Requests terceros nuevos | 0 |
| Tests medición | verdes + gaps cerrados |
| Docs (metodología, derivadas, validación, reporte) | firmados |

## Rollback

Revert por fase; re-correr `test`, `check:boundaries`, `check:docs`,
`git diff --check`. Sin migración de datos.

## Progress log

- 2026-09-16 — Plan creado (TODO) desde veredicto ADAPT sobre
  propuesta externa. Secuencia: antes de panel F1 (emisores).
