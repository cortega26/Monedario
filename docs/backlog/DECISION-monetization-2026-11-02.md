# DECISION — Monetización 2026-11-02

**Fecha:** 2026-09-25 · **Owner de decisión:** Carlos Ortega
**Estado:** PREPARACIÓN (no autoriza cambios de promesa ni implementación comercial)
**Precedencia:** `docs/AI_ENGINEERING_CONSTITUTION.md` → `AGENTS.md` → `context/*.md` → este documento.
**Plan madre (firmado):** `docs/backlog/PLAN-monetization-reevaluation-2026-09-16.md` (F0/F1 + F2 autorizados; F3/F4 hasta 2026-11-02).
**Ventana:** `FOCO ESTRICTO / VALIDACIÓN UTILITY-LED` 2026-08-02 → 2026-11-02 (`docs/governance/STRATEGIC_FOCUS_2026Q3.md`).

## 0. Para qué sirve este documento

Llegar al 2026-11-02 con una decisión reproducible — **perseverar / pilotar una
sola vía (B o D) / pausar expansión** — sin fabricar monetización y sin
ejecutar nada comercial antes de esa fecha. Este paquete es docs-only: no
cambia promesa, copy, URLs, tracking ni contratos.

Fuera de alcance hasta la decisión (BLOCKED, ver
`docs/backlog/UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md`):

- Afiliación, publicidad, comparadores, AdSense, sponsored ranking.
- API/widget/embed/auth/billing/white-label/multi-tenant.
- Alertas con correo, newsletter con identificadores, cuentas.
- Cualquier link con incentivo sin `rel=sponsored/nofollow` + disclosure +
  exclusión de veredictos YMYL.

## 1. Estado al 2026-09-25

| Hecho | Estado | Evidencia |
|---|---|---|
| Promesa "sin publicidad / sin conflicto" | Vigente en 9 puntos de copy público (6 archivos) + 1 doc interno | Anexo A |
| Ingresos | $0; sin contrato ni partner | plan madre §Objetivo |
| Analítica lista para monetizar | DONE: `affiliate_click`/`lead_submit` tipados sin emisores; transporte solo-producción | `PLAN-monetization-ready-analytics-2026-09-21.md`, ADR-20260921 |
| F1 apoyo voluntario | En acumulación; entrega ~9/sem en una calculadora; `n_min`=598 → se espera `SIN DATOS SUFICIENTES` | `UTILITY_LED_EXPERIMENT_REGISTRY.md`; W38 |
| F2 discovery B2B | Esqueleto creado, 0/10 conversaciones | `docs/reports/B2B-DISCOVERY-MEMO-2026-09-16.md` |
| F3 ADR borrador | Entregado con este paquete | `docs/adr/ADR-20261102-monetization-promise.md` |
| Gate D (horas/costo/agotamiento) | `null` → `INPUT_REQUIRED` | `utility-led-ops.json` W38 |
| Tráfico | W38 final: 617 clics / 175.481 impr (GSC); 1.004/622/567 first-party; 16,4k pageviews CF | `output/operations/data-signals/` W38 |

## 2. Reglas de lectura (no negociables)

- Tres fuentes, tres preguntas: GSC = demanda, recolector = comportamiento,
  Cloudflare = baseline. Prohibido mezclar denominadores
  (`docs/operations/analytics/METRICS_AUTHORITY.md`).
- Sin veredicto bajo `n_min` (`UTILITY_LED_EXPERIMENT_REGISTRY.md`):
  `SIN DATOS SUFICIENTES`, nunca HALT ni 0%.
- Ceros con n chico no deciden; intervalos, no puntos.
- La salida a un enlace no es el retorno de una persona; el clic de apoyo no
  es un pago.
- Separación de deberes YMYL: quien redacta no audita.

## 3. Checklist de evidencia (debe existir el 2026-11-02)

| # | Evidencia | Dueño | Fecha | Estado |
|---|---|---|---|---|
| E1 | F1 apoyo: `support_shown/click`, `donate_outbound/complete`, `share_success`, con IC | sistema | continuo | parcial |
| E2 | Gate D semanal: `weeklyHours`, `weeklyCostClp`, `burnoutLevel1To5` | owner | semanal W39–W43 | `INPUT_REQUIRED` |
| E3 | F5 UTM: CTR/posición W39 vs W36; clics vs W35; nota #401 (techo EMD) | sistema/owner | 2026-09-30 | pendiente |
| E4 | F4 panel: `next_step_click/shown` ≥3% con n≥99 en 2 semanas comparables; entrega ≥60% de `complete`; `complete/start` sin regresión | sistema | W39+W40 | parcial (W38 3,5%, 1 semana) |
| E5 | F2 B2B: memo con 10 conversaciones / 2 demos / 1 disposición a pagar con precio | owner | ≥2026-10-30 | 0/10 |
| E6 | Costo real de mantener la superficie a exponer (horas, auditoría YMYL, refresco normativo) | owner | ≥2026-10-30 | bloqueado por E2 |
| E7 | Copy-migration completo (Anexo A) y plan de disclosure por opción | sistema | 2026-09-25 | borrador hecho |
| E8 | ADR borrador A–E | sistema | 2026-09-25 | borrador hecho |

## 4. Opciones y criterios de elegibilidad (pre-declarados)

### A. Ko-fi post-resultado + compartir (sin cambio de promesa)

Se mantiene. No requiere elegibilidad; su evidencia (E1) informa énfasis, no
bloquea. La entrega visible ya está instrumentada en el panel post-resultado
(plan panel F4).

### B. Afiliado ético en 1–2 clusters

Elegible solo si:

- existe ≥1 partner dispuesto por escrito;
- el plan de neutralidad pasa: sin ranking por pago, veredictos YMYL
  excluidos, `rel=sponsored/nofollow`, disclosure `es-CL` visible antes del
  enlace;
- la comisión proyectada ≥ costo de mantenimiento (E6) con margen;
- D no es elegible (B es segunda opción, no simultánea).

### C. Display/AdSense

No elegible como primera oleada (LCP/CLS/CSP + erosión diferencial de la
promesa). Solo se revisita si A, B y D fallan y el owner decide explícitamente
priorizar ingreso de corto plazo; jamás en calculadoras YMYL críticas.

### D. B2B embed privado / licencia

Elegible solo si:

- E5 completo (10 conversaciones → 2 demos → 1 disposición a pagar);
- precio cubre E6 + margen;
- contrato de calidad de datos (frescura vía snapshot, fuentes primarias, SLO
  de exactitud);
- embed sin tracking del lector;
- `url-freeze-exceptions.json` completa (problema, evidencia, hipótesis,
  costo, mantenimiento, métrica, umbral, decisión `APPROVED`, aprobador,
  fechas).

### E. Freemium

Diferida: sin camino de evidencia en la ventana; no compite el 2026-11-02.

## 5. Matriz de decisión (resultado pre-declarado)

| Evidencia al 2026-11-02 | Resultado |
|---|---|
| D elegible (E5 + E6 + excepción + precio) | **Pilotar D** (una sola vía, reversible, kill-switch por cluster) |
| D no elegible y B elegible | **Pilotar B** (1–2 clusters, disclosure, exclusión YMYL) |
| Sin E5 (memo incompleto) o sin E2 (Gate D vacío) | **HALT de monetización**: no se infiere desinterés; decisión = perseverar utility-led o pausar expansión |
| Gate D adverso (burnout 4–5 dos semanas, costo > $25.000 CLP/mes sin aprendizaje) | **Pausar/reducir alcance** |
| A, B y D no elegibles y el owner prioriza ingreso | Revisar C con límites estrictos o mantener $0 (no forzar) |

Regla dura: ninguna celda autoriza ejecutar antes de que el owner firme la
decisión y se completen excepción + ADR final.

## 6. Calendario pre-decisión

| Fecha | Evento | Entregable |
|---|---|---|
| 2026-09-28 | Export W39 (data-signals) | GSC finalizado W39 |
| 2026-09-30 | Lectura primaria F5 | nota en `PLAN-growth-utm-ctr-2026-09-16.md` (keep/revert/extender; F2 UF se decide aquí) |
| 2026-10-01 | Refresco UTM (confound declarado) | — |
| 2026-10-05 | Export W40 | inicio semana 1 F4 |
| 2026-10-12 | Export W41 | cierre 2 semanas F4 → lectura E4 |
| Semanal | Gate D en cada bundle W39–W43 | `utility-led-ops.json` |
| 2026-10-13 → 10-30 | Conversaciones B2B (meta 10) | memo B2B actualizado |
| ≥2026-10-30 | Cierre E5/E6 + revisión del ADR | paquete completo |
| **2026-11-02** | Sesión de decisión | ADR `Aceptado/Rechazado` + siguiente paso |

## 7. Gate D — plantilla y cadencia

Campos obligatorios para decidir:

| Campo | Umbral |
|---|---|
| `weeklyHours` | ≤6 GREEN · 6–10 WATCH · >10 tres semanas detiene |
| `weeklyCostClp` | ≤$25.000 GREEN · sobre eso, decisión explícita de presupuesto |
| `burnoutLevel1To5` | 1–2 GREEN · 3 WATCH · 4–5 dos semanas detiene |
| `qualityIncidents`, `learningSignal`, `reputationSignal`, `maintenanceTasks`, `blockers` | cualitativos, sin inventar equivalencia monetaria |

Dónde: `output/operations/weekly-search-performance/<semana>/utility-led-ops.json`
(evidence local, ignorada por git). Sin registro → `INPUT_REQUIRED` y no se
decide expansión.

## 8. STOP / HALT

- Link incentivado sin disclosure/`sponsored` → STOP.
- Ko-fi global → STOP.
- Tracking individual, PII en payload o mezcla de denominadores → HALT + fix.
- Dato insuficiente presentado como veredicto, o presión por "fabricar
  monetización" → HALT.
- Cambio de promesa/copy antes del 2026-11-02 sin este paquete firmado → STOP.

## 9. Change Control Record

1. **Scope:** docs-only (este documento, memo B2B, ADR borrador, README de
   backlog). Cero código, rutas, RSS, tracking o copy público.
2. **Impacted modules:** `docs/backlog/*`, `docs/reports/*`, `docs/adr/*`,
   `docs/backlog/README.md`.
3. **Invariantes:** `URL.PUBLIC.NO_POST_ID`, `ROUTES.NO_SILENT_CHANGES`,
   `NO_SILENT_CHANGES`, `EXTERNAL_PATTERNS_NON_AUTHORITATIVE`,
   `DIFFERENTIATED_ADOPTION_REQUIRED`; YMYL sin cambios.
4. **Contratos:** ninguno.
5. **Boundary integrity:** `pnpm run check:docs` + `format:check` verdes.
6. **Tests:** n/a (docs). No se toca código funcional.
7. **Rollback:** revert del commit docs; ningún estado productivo cambia.
8. **Regression risk:** BAJO mientras sea docs; ALTO si se salta a implementar
   sin gate.

## 10. Anexo A — Inventario de promesa (copy-migration)

Base grep: `sin publicidad|sin anuncios|publicidad financiera|sin conflictos|sin conflicto de interés|comisiones`.

| # | Archivo:línea | Texto actual (extracto) | Superficie |
|---|---|---|---|
| 1 | `src/utils/llmsTxt.ts:16` | "…sin conflictos de interés y sin publicidad…" | `llms.txt` |
| 2 | `src/components/HeroHomepage.astro:11` | "…Sin opinión, sin gurú, sin conflicto de interés…" | home hero |
| 3 | `src/components/HeroHomepage.astro:93` | "Sin publicidad. Sin registro requerido. Métricas agregadas…" | home hero |
| 4 | `src/pages/acerca-de.astro:58` | "…sin letra chica, sin conflictos de interés." | `/acerca-de/` |
| 5 | `src/pages/autor.astro:277` | "…no está condicionado por comisiones, publicidad financiera ni acuerdos…" | `/autor/` |
| 6 | `src/pages/metodologia.astro:557` | "…no está condicionado por comisiones, publicidad financiera…" | `/metodologia/` |
| 7 | `src/pages/calculadoras/conversor-uf.astro:117` | "Sin registro, sin publicidad." | calculadora UF |
| 8 | `src/pages/calculadoras/iva.astro:50` | "Sin registro, sin publicidad." | calculadora IVA |
| 9 | `src/pages/calculadoras/iva.astro:69` | "Sin registro, sin publicidad." | calculadora IVA |
| — | `src/components/CalculatorTrustBadge.astro:23` | privacidad: cálculo local, sin montos ni resultados | badge en calculadoras |
| — | `docs/operations/COMMUNITY_SEEDING_KIT.md:22` | "gratis, sin registro, sin publicidad…" | doc interno |

Cualquier opción elegida debe actualizar todas las filas que su copy toque en
un solo PR atómico, con snapshot de rutas/RSS si cambiara metadata.

## 11. Anexo B — Reglas de no-contaminación

- El embed B2B no captura comportamiento del lector; usa métricas agregadas
  existentes o ninguna.
- El afiliado nunca ordena por pago ni toca veredictos YMYL; disclosure
  visible en `es-CL` antes del enlace.
- Ninguna opción agrega identificadores persistentes, cookies de terceros ni
  GA4 sin contrato firmado (ADR-20260921).
- Una sola vía por decisión, reversible, con kill-switch; no se arrastran
  opciones.
- Discovery y demos no exponen datos individuales de lectores (no existen; no
  se crearán).

## Progress log

- 2026-09-25 — Paquete creado (docs-only) desde el plan madre firmado: brief
  de decisión, kit B2B y ADR borrador. Sin cambios de promesa ni
  implementación.
