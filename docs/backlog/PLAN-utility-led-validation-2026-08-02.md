# PLAN — Validación utility-led, días 1–30

**Estado:** PARTIALLY_COMPLETED
**Inicio:** 2026-08-02
**Reevaluación:** 2026-11-02
**Fuente:** auditoría estratégica de viabilidad del 2026-08-02
**Decisión:** CONTINUAR CON FOCO ESTRICTO

## Objetivo y límites

Convertir la superficie existente de Monedario en un sistema medible y confiable para validar el recorrido `consulta → respuesta → herramienta → siguiente decisión → confianza y retorno`, sin expandir el producto ni el inventario indexable. La monetización queda como opción futura, subordinada a utilidad, confianza y sostenibilidad.

En alcance:

- congelación estratégica y gate ligero sobre el inventario indexable existente;
- baseline GSC reproducible y scorecard semanal;
- taxonomía first-party tipada, minimización de datos y QA;
- precisión pública de privacidad y metodología;
- vigencia/provenance del ejemplo UTM;
- diagnóstico y corrección mínima de CSP/Cloudflare;
- hasta dos siguientes pasos, interés agregado en alertas y apoyo voluntario, solo después de un resultado UTM válido;
- auditoría de evidencia editorial y discovery B2B estrictamente documental;
- pruebas unitarias, integración, E2E, accesibilidad, rutas, RSS, build y rollback.

Fuera de alcance:

- nuevas URLs indexables, clusters, calculadoras, artículos, leyes o glosario;
- cambios de slugs, canonical, títulos SEO, fórmulas o parámetros normativos;
- rediseño amplio de AFC o prepago;
- alertas reales, correo, newsletter, identificadores persistentes o cohortes de personas;
- afiliación, publicidad, comparadores, API, widget, auth, billing, multi-tenant, white label o producto B2B.

## Autoridad, invariantes y supuestos

- Precedencia: `docs/AI_ENGINEERING_CONSTITUTION.md` → `AGENTS.md` → `context/*.md` → implementación.
- Invariantes: `URL.PUBLIC.NO_POST_ID`, `ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS`, `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`.
- Contratos: `CONTRACT.PUBLIC_URLS`, `CONTRACT.ROUTES_SNAPSHOT`, `CONTRACT.RSS_POLICY`, contratos editoriales y económicos vigentes.
- A1: toda URL pública actual se conserva byte-for-byte; solo se endurece la autorización de adiciones.
- A2: eventos representan acciones agregadas, no personas, usuarios ni cohortes.
- A3: `support_confirmed` queda definido pero no se emite sin una confirmación de pago fiable.
- A4: no se modifica contenido YMYL sustantivo ni se marcan gates humanos; la reconciliación editorial describe evidencia real.
- A5: cero ingresos no implica fracaso ni cierre. El límite es la sostenibilidad de tiempo, costo, energía, exactitud, aprendizaje y reputación.

## Change Control Record

1. Scope declaration
- In scope: las rutas descritas en “Objetivo y límites”.
- Out of scope: las exclusiones anteriores.

2. Impacted modules
- `scripts/**`, `tests/**`, `.github/workflows/**`: gates, ingestión, reporte y cobertura.
- `src/utils/analytics.ts`, `src/scripts/analytics.ts`, `workers/analytics-collector/**`: contrato de eventos y doble validación.
- `src/pages/calculadoras/conversor-utm.astro` y componentes post-resultado reutilizables: experimento UTM.
- `src/pages/{index,privacidad,metodologia}.astro`, `README.md`: claims precisos.
- `public/_headers`, documentación Cloudflare: CSP mínimo y rollback.
- `docs/**`, `context/**`: gobernanza, diccionario, auditorías, gates y bitácora.

3. Invariant preservation
- Public URL identity remains slug-based; no `post.id` URL construction.
- Route/RSS snapshots must have zero removals and zero unauthorized additions.
- No historical editorial artifact or human sign-off will be manufactured.

4. Contract preservation
- Breaking changes: no.
- Existing economic formulas and public route identities remain unchanged.

5. Boundary integrity
- `pnpm run check:boundaries`: baseline pass; repeat at closure.
- Unauthorized cross-layer imports introduced: no (pending final verification).

6. Test coverage impact
- Runtime analytics and UTM surfaces require unit/integration/E2E updates.
- Coverage status: pending final verification.

7. Rollback strategy
- Revert units: governance/gate; analytics; reporting; trust copy; UTM UI; CSP/Cloudflare.
- Data rollback: not required; analytics accepts only the new allowlist and stores aggregate rows.
- Cloudflare rollback: restore the documented zone setting and prior `_headers` line independently.

8. Regression risk
- Risk: high, because analytics, CSP and the highest-traffic calculator are touched.
- Vectors: lost/duplicated events, accidental value leakage, stale UTM copy, unauthorized route delta, CSP block, post-result completion regression.
- Mitigation: dual allowlist, forbidden-key tests, visibility/dedupe tests, economic freshness gate, route/RSS snapshots, E2E mobile/a11y/console checks and small reversible commits/diffs.

## Competitive Adaptation Appendix

- benchmarkSet: no external competitor implementation is being copied; the source is the owner-approved audit and existing Monedario patterns.
- patternHypothesis: a contextual post-result choice can expose demand without expanding the product.
- localDelta: Chile-specific UTM provenance, privacy-minimized first-party telemetry and explicit evidence gates.
- nonCopyBoundaries: no competitor copy, URL, IA, design or commercial recommendation.
- ownerTarget: existing `/calculadoras/conversor-utm/`.
- successSignal: next-step CTR, alert-interest ratio and support click/confirmation thresholds defined in the experiment registry.
- ownership conflict check: pass; no new surface owner or URL.

## Fases y gates

1. Discovery + baseline técnico.
2. Freeze + inventario URL aprobado.
3. GSC baseline + scorecard semanal.
4. Taxonomía, schema, collector, privacidad y retorno etiquetado.
5. UTM freshness/provenance y CSP.
6. Reconciliación editorial/metodológica.
7. CTA, interés y apoyo post-resultado.
8. B2B discovery y backlog bloqueado.
9. Validación completa y cierre.

No se avanza al despliegue si falla cualquiera de estos gates:

- **Gate A — integridad:** cobertura analítica ≥95%; de lo contrario `HALT`.
- **Gate B — seguridad y confianza:** cero datos financieros en eventos, UTM vigente, CSP sin debilitamiento, claims precisos, metodología demostrable y cero regresiones.
- **Gate C — experimentos habilitados:** baseline, eventos, reporte, CTA UTM, interés y apoyo post-resultado existentes; no exige alcanzar umbrales todavía.
- **Gate D — sostenibilidad:** registrar carga, costo, agotamiento, calidad, aprendizaje y reputación. Un proyecto sostenible puede continuar con ingresos cero; monetización no es un gate de supervivencia.

## Baseline técnico previo a cambios

| Verificación | Resultado 2026-08-02 |
|---|---|
| `pnpm run test` | PASS — 132 archivos, 1.083 pruebas |
| `pnpm run lint` | PASS |
| `pnpm run check:boundaries` | PASS — 9 archivos de dominio |
| `pnpm run format:check` | PASS |
| `pnpm run build` | PASS — 327 páginas, 0 URLs rotas |
| `pnpm run check:routes` | PASS — 53/53, sin cambios |
| `pnpm run check:rss` | PASS — 52/52, sin cambios |
| `pnpm run check:no-postid-urls` | PASS — 257 archivos |
| `pnpm run check:dead-code` | PASS con 2 hints de configuración existentes |
| `pnpm run test:a11y` | PASS — 53/53 tras instalar Chromium local |
| `pnpm run check` | PRE-EXISTING FAIL — 9 SLA editoriales vencidos; no se alterarán fechas sin revisión real |

## Riesgos y dependencias

- Cloudflare puede inyectar JavaScript después del build; una política CSP hash-only no puede anticipar un bootstrap por-request. Se debe verificar la configuración efectiva de Bot/Javascript Detections y documentar cualquier cambio de zona.
- Exportaciones GSC pueden omitir consultas por privacidad; se reportará como cobertura, no como cero.
- Medir retorno real 7/30 días requeriría identificación persistente; queda fuera de alcance. Solo se habilitan señales agregadas o enlaces voluntarios etiquetados.
- La revisión sustantiva de nueve artículos vencidos exige el pipeline editorial aplicable; se registra como deuda preexistente y no se falsifica una revisión.

## Progress log

- 2026-08-02 — Discovery iniciado. Código limpio salvo artefactos de auditoría estratégica bajo `output/audits/`.
- 2026-08-02 — Baseline funcional completado. Build, rutas, RSS, unit/integration, lint, format, boundaries, dead-code y 53 E2E/a11y pasan.
- 2026-08-02 — Hallazgo preexistente: `check:editorial-timeliness` bloquea `pnpm run check` por nueve SLA vencidos. Pendiente registrar deuda sin alterar contenido.
- 2026-08-02 — El propietario precisó el principio rector: perseverar y construir confianza a mediano/largo plazo mientras el proyecto sea sostenible. Se agregó Gate D; ingresos cero no constituyen causal de cierre.
- 2026-08-02 — Implementación completada en código: freeze de 184 URLs indexables, baseline GSC reproducible, contrato analytics v2, scorecard semanal, UTM vigente con fuente primaria SII, acciones postresultado, auditoría editorial, backlog bloqueado y pack B2B documental.
- 2026-08-02 — Cierre parcial: la configuración de origen CSP está lista pero requiere comprobar la respuesta final de Cloudflare; LCP UTM superó 1,7 s en dos de tres corridas; nueve SLA editoriales preexistentes siguen vencidos.
- 2026-08-02 — Guardrail LCP UTM cerrado (TD-0101): causa raíz = fuente display Fraunces en el camino crítico de calculadoras por los h2 del footer (regla base compartida); fix = override de tipografía extendido a toda la página en calculadoras (`body:has`) + preload condicional. LCP móvil 1.353/1.352/1.204 ms en tres corridas (≤1,7 s), Performance 100, CLS 0, TBT 0; build, 1.076 tests unitarios, 58/58 Playwright y gates de rutas/RSS/freeze pasan. Commit `perf(utm): close mobile lcp guardrail` enviado a la rama del PR #382 (sin merge). Pendiente: validación CSP en producción tras merge y nueve SLA editoriales.

## Evidencia de cierre

**Estado:** `PARTIALLY_COMPLETED`. La capacidad del plan quedó implementada y los gates funcionales pasan; no se autoriza declarar cierre completo ni despliegue verde hasta resolver las excepciones explícitas.

### Evidencia funcional y de datos

- Inventario indexable: 184/184 sin adiciones ni remociones; toda adición futura exige excepción fechada y aprobada.
- GSC 28 días: 2.513 clics, 479.325 impresiones, integridad 100%; ventana anterior 797/123.913 y ventana de tres meses 3.416/624.052. UTM concentra 57,38% de clics de páginas y la principal página 70,75%; se preserva la discrepancia de 853 clics de consultas ocultas.
- Analytics: schema v2 compartido entre cliente, collector y export; eventos estrictamente permitidos, deduplicación visible y rechazo de claves financieras o identificadoras.
- UTM: valor mensual vigente al 2026-08-02, fuente primaria SII y fallback explícito; ejemplo público derivado del snapshot, no codificado a mano.
- Experimentos: máximo dos siguientes pasos, interés agregado en avisos y apoyo voluntario aparecen solo después de resultado válido; no existen alertas reales, email, confirmaciones inferidas ni tracking individual.

### Verificaciones ejecutadas

- `pnpm run test`: PASS — 136 archivos, 1.076 pruebas.
- `pnpm run lint`, `check:boundaries`, `format:check`, `check:context`, `check:policy`, `check:docs`, `check:frontmatter`, `check:links`, `check:economic-consistency`, `check:economic-snapshot-freshness`: PASS.
- `pnpm run build`: PASS — 327 páginas, freeze 184/184, Pagefind 52 páginas y cero enlaces rotos.
- `check:routes`: PASS 53/53; `check:rss`: PASS 52/52; `check:no-postid-urls`: PASS 260 archivos.
- Playwright completo: PASS 58/58; las 5 pruebas UTM cubren camino válido/inválido, deduplicación, privacidad, accesibilidad, clipboard bloqueado y JavaScript deshabilitado.
- Lighthouse UTM móvil, tres corridas: performance 99, accesibilidad 100, SEO 100, CLS 0, TBT 0; LCP 1.657/1.807/1.807 ms, por lo que el guardrail ≤1,7 s no está cerrado.
- `pnpm run check`: falla únicamente por nueve SLA editoriales preexistentes registrados como `TD-0098`; no se alteraron fechas sin revisión.

### Pendientes y rollback

1. ~~Desplegar `Cache-Control: no-transform` y verificar ausencia de JSD inyectado/error CSP.~~ **Resuelto 2026-08-02:** deploy del PR #382 + fix de override en `public/_headers` (commit `09dc219d`) — `no-transform` en todas las reglas Cache-Control porque Cloudflare no combina valores del mismo header entre reglas. Validado en producción: header efectivo con `no-transform`, cero `__CF$cv$params`, cero violaciones CSP en Chromium limpio, consola sin errores (TD-0099 `VALIDATED`). Rollback si regresara: retirar solo esa directiva o desactivar Bot Fight Mode; nunca relajar CSP.
2. ~~Diagnosticar LCP UTM dentro del ADR vigente, repetir tres corridas y contrastar con RUM.~~ **Resuelto 2026-08-02:** causa raíz = fuente display Fraunces en el camino crítico de calculadoras (h2 del footer fuera de `main[data-layout]`); corrección en `global.css` + `Layout.astro` (commit `86669710`, PR #382, TD-0101). Tres corridas de cierre: LCP 1.353/1.352/1.204 ms, Performance 100, CLS 0, TBT 0. **Queda solo el contraste con RUM tras un merge controlado.** Rollback: revertir el commit; retirar el bloque `UtmPostResultActions` ya no aplica como rollback del LCP.
3. Ejecutar las nueve revisiones vencidas con roles independientes y firma humana. No existe rollback de contenido porque esta tarea no fabricó ni modificó sus gates.

El gate de sostenibilidad comienza con el template semanal. Cero ingresos es un resultado admisible mientras horas, costos, agotamiento y calidad permanezcan dentro de umbral y exista aprendizaje, crecimiento o reputación verificable.
