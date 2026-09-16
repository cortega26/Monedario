# PLAN — Panel post-resultado: siguiente paso, fuente, compartir y apoyo
(Conversión + confianza, inside FOCO)

**Estado:** F0 FIRMADO 2026-09-16 — F1 autorizado tras auditoría
measurement-integrity F0 (pre-requisito de emisores)
**Fecha:** 2026-09-16
**Owner de decisión:** Carlos Ortega
**Prioridad:** P0 (funnel) · **Esfuerzo:** M · **Riesgo:** MED (calculadora
top + eventos analytics)
**Fuente:** first-party W37 (`output/operations/data-signals/analytics/`),
planes 083–086 y reconciliación 2026-09-12 (vehículos incompatibles,
`next_step_click` 1/157, `support_shown` 9/sem, `source_click` 3/sem)

## Objetivo y límites

Convertir el `calculator_complete` existente (633/sem, ~92% de `start`)
en siguiente acción medible, sin crear superficies ni cuentas.

En alcance:

- Estandarizar `CalculatorResultPanel` + `CalculatorResultNextActions` /
  `UtmPostResultActions` en UTM, UF y top-5 calculadoras: respuesta grande,
  línea de vigencia/fuente, 2 siguientes pasos (1 calculadora + 1 guía),
  1 compartir (WhatsApp + copiar, payload sin PII), 1 nudge de apoyo
  post-resultado con `?src=calculadora-*`.
- Unificar taxonomía de eventos: impresiones `NextSteps.astro` hoy mudas +
  clics sin `calculator_id` (buckets fantasma `calculator`/`unknown`,
  precedente 083) → clics con identidad + `interaction_variant`.
- Mover 1–2 chips de fuente oficial (SII/CMF/Banco Central) al panel de
  resultado (subir `source_click`).
- Hacer visible el apoyo post-resultado (hoy `support_shown` 9/sem sobre
  ~68k visitas = invisible) sin banner global.
- Tests: visibilidad/dedupe, sanitización PII, a11y foco/`aria-live`,
  clipboard bloqueado y JS deshabilitado (precedente plan 082/utility-led).

Fuera de alcance (BLOCKED, ver
`UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md`):

- Ko-fi global en todas las páginas (prohibido; solo post-resultado o
  `/apoyar/`).
- Alertas reales, email, newsletter, cuentas, historial,
  personalización, cohortes, retorno individual.
- API, widget, white-label, auth, billing.
- Afiliación, publicidad, comparadores (decisión explícita post-Nov-02;
  plan monetización hermano).
- Rediseño profundo de AFC/prepago/crédito sin retroauditoría YMYL.

## Autoridad, invariantes y supuestos

- Precedencia: `docs/AI_ENGINEERING_CONSTITUTION.md` → `AGENTS.md` →
  `context/*.md` → implementación.
- Invariantes: `URL.PUBLIC.NO_POST_ID`, `ROUTES.NO_SILENT_CHANGES`,
  `RSS.NO_REMOVALS`, `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`.
- Contratos: `CONTRACT.PUBLIC_URLS`, `src/contracts/analytics-events.ts`
  (taxonomía v2, allowlist, rechazo PII, bodies ≤2048 B), YMYL response
  structure donde haya copy financiero.
- A1: eventos = acciones agregadas, no personas ni cohortes.
- A2: `support_confirmed` no se emite sin confirmación de pago fiable.
- A3: ceros con denominador chico no son evidencia (precedente 084:
  `alert 0/79` P(0)=0,203; `support 0/62` P(0)=0,733 → indecidibles; solo
  `next_step 0/108` al 3% era decidible). Toda decisión exige
  `n_min` declarado antes de medir.
- A4: no se amplía el patrón post-resultado a más calculadoras hasta
  cruzar umbrales (precedente 2026-09-04).

## Change Control Record

1. Scope declaration: ver arriba.
2. Impacted modules: `src/components/calculator/*`,
   `src/components/CalculatorResultNextActions.astro`,
   `src/components/UtmPostResultActions.astro`,
   `src/components/NextSteps.astro`, `src/components/SupportCallout.astro`,
   `src/scripts/next-best-step.ts`, `src/utils/analytics.ts`,
   `src/contracts/analytics-events.ts`, `workers/analytics-collector/**`
   (solo si cambia allowlist), `tests/**`.
3. Invariant preservation: sin URLs nuevas; sin `post.id` en URLs; sin
   superficie indexable nueva; roles YMYL separados si hay copy
   sustantivo.
4. Contract preservation: cambios de eventos versionados (schema v2);
   doble validación cliente + worker (`rejectUnknown`); umbrales en
   `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md`.
5. Boundary integrity: `pnpm run check:boundaries` al cierre; sin imports
   cross-layer no autorizados.
6. Test coverage impact: unit (sanitizador, dedupe, variantes),
   integración (collector allowlist), E2E móvil + a11y + consola limpia;
   mantener `pnpm run test` y `test:a11y` verdes.
7. Rollback strategy: revert por componente; eventos nuevos detrás de
   allowlist (viejos siguen válidos); sin migración de datos (agregados
   append-only).
8. Regression risk: MED-ALTA (top calculator + CSP). Vectores:
   eventos perdidos/duplicados, fuga de valores a `dimensions`, bloqueo
   CSP, regresión `complete/start`, foco roto. Mitigación: dual
   allowlist, forbidden-key tests, `check:prompt-injection-guardrails`,
   E2E clipboard/JS-off, commits pequeños reversibles.

## Competitive Adaptation Appendix

- benchmarkSet: patrones internos existentes (tarjeta en flujo 2,6–18,8%
  CTR vs panel UTM 0%) + observación SERP/UX genérica; sin copiar
  implementación competidora.
- patternHypothesis: la entrega (6,7–12,9% impresiones, 0 clics) es el
  cuello, no la demanda; unificar vehículo + identidad + 2 opciones
  contextuales sube entrega y CTR.
- localDelta: provenance chilena visible, telemetría agregada sin PII,
  copy `es-CL` sin humo, `?src=` trazable a `/apoyar/`.
- nonCopyBoundaries: sin copy/URL/IA/diseño de terceros.
- ownerTarget: `/calculadoras/conversor-utm/` primero; luego UF + top-5
  solo si cruza umbral.
- successSignal: entrega post-resultado ≥60% de `complete`;
  `next_step_click/shown` ≥3% con n≥149; `support_click` reportado con
  intervalo (no punto); `source_click/complete` en subida.
- ownership conflict check: pass; sin owner nuevo.

## Fases y gates

1. **F0 — Regla de lectura (084 viva).** Fijar `n_min` por evento
   (P(0)=(1−p)^n) en el registry antes de tocar UI. Gate: umbrales
   firmados.
2. **F1 — Identidad de eventos (083).** `NextSteps.astro` emite
   impresiones; todo clic lleva `calculator_id` + variante. Tests
   allowlist ambos lados. Gate: cero buckets fantasma *inexplicados* en
   export semanal — omisiones en artículos son sentinelas esperadas
   (`unknown`/`calculator`, registry § Cross-check W36), no fallos;
   en superficies `/calculadoras/` el `calculator_id` es obligatorio.
   Enmienda firmada 2026-09-16 (identidad falsa peor que ausente).
3. **F2 — Panel UTM (piloto).** Estandarizar panel + 2 siguientes pasos
   + fuentes + compartir + apoyo `?src=calculadora-utm`. E2E + a11y +
   CSP. Gate C utility-led (experimentos habilitados).
4. **F3 — Réplica UF + top-5 solo si F2 cruza umbral.** Si no cruza:
   `HALT`, diagnosticar (plan 085/086), no replicar el problema.
5. **F4 — Medición 2 semanas comparables.** Scorecard semanal; no leer
   `support`/`alert` en cero como "no construir" sin poder (084).

STOP/HALT:

- Cobertura analítica <95% → `HALT` (Gate A).
- Dato financiero/PII en evento → `HALT` + fix inmediato.
- Regresión `complete/start` >5 pts vs baseline → revert.
- Semana <7 días o export truncado → no decidir.
- Cualquier URL nueva necesaria → salir a plan de excepción, no
  colarla aquí.

## Métricas

| Métrica | Baseline W37 | Umbral |
|---|---|---|
| Entrega post-resultado / `complete` | 6,7–12,9% (UTM) | ≥60% |
| `next_step_click/shown` | 1/157 (0,6%) | ≥3%, n≥99 (firmado 2026-09-16) |
| `support_shown/sem` | 9 | visible post-`complete` en piloto |
| `source_click/complete` | 3/633 | subida sostenida 4 sem |
| `share_success/complete` | a fijar en F0 | +50% vs base |
| `complete/start` | ~92% | no regresión |

## Rollback

Revert del componente/variante; allowlist mantiene compat; re-correr
`test`, `test:a11y`, `check:boundaries`, `check:routes`. Datos
agregados no requieren rollback.

## Progress log

- 2026-09-16 — Plan creado (TODO). Precedentes 082–086 y Gate D
  (horas/costo/agotamiento en `utility-led-ops.json`) incorporados.
- 2026-09-16 — F0 en curso (TODO, no completa): `n_min` calculados
  (3%→99, 2%→149, 0,5%→598, share 1% supuesto→299; fuente
  direccional con intervalo Wilson) y tabla F0 añadida al registry con
  n semanal W36 (última semana completa; W37 truncada a 5 días, no
  usada). Firma del owner pendiente; discrepancia a firmar: plan pide
  `next_step` n≥149 pero la fórmula da 99 al 3%.
- 2026-09-16 — Sign-off owner: F0 FIRMADO. Discrepancia resuelta a
  favor del cálculo (`next_step n_min` = 99 @3%); supuesto share p=1%
  aceptado como interino. F1 autorizado tras auditoría
  measurement-integrity F0.
- 2026-09-16 — F1 ejecutado (TODO, pendiente gate semanal): `NextSteps.astro`
  basePayload ahora incluye `interaction_variant: "contextual_v1"` +
  `cluster` (cuando la página lo declara) en cada `next_step_shown`/`click`;
  `calculator_id` se mantiene cuando `currentHref` resuelve a
  `/calculadoras/<slug>/` y se omite a propósito en artículos (identidad
  falsa peor que ausente; registry § Cross-check W36). Sin cambio de
  taxonomía: los 4 campos ya estaban allowlisted en v2 (cliente + worker
  comparten `sanitizeAnalyticsPayload`; paridad fijada en
  `tests/utils/nextSteps.test.ts`). Nota: el gap "sin impresiones" de la
  orden ya estaba cerrado por 083 (`e3bd14b3`/`1a761389`); lo restante era
  la variante. Gate: cero buckets fantasma en export semanal (no decidible
  con semana <7 días).
- 2026-09-16 — F2 ejecutado en piloto UTM ONLY (TODO, pendiente E2E/a11y):
  `conversor-utm.astro` panel `#resultado` con heading `#resultado-heading`
  (`tabindex=-1`), respuesta `text-4xl`, `aria-live=polite` conservado,
  línea `Fuente: SII · Vigente al …` (reusa `utmDateDisplay` +
  `economicSourceLabel`; sin claims numéricos nuevos; `MethodologyBlock` +
  Fecha de corte intactos); foco no robado en cada tecla (conversor en vivo;
  heading queda para foco programático). `UtmPostResultActions.astro`: 2
  acciones = 1 calculadora (`conversor-uf`, `convert-uf`) + 1 guía
  (`/posts/utm-chile-que-es-como-funciona/`, `guia-utm`); apoyo
  `/apoyar/?src=calculadora-utm` solo dentro de `#utm-post-result-actions`
  (revelado por `calculator:result`; sin banner global; whitelist
  `calculadora-utm` añadida en `apoyar.astro` espejando `calculadora`);
  share WhatsApp + copiar sin PII en payload (`ShareCalculatorResult`
  intacto). No replicado a UF ni otras (umbral F3 no cruzado). Sin URLs
  nuevas, sin cambios de slugs/canonical/fórmulas/snapshot/routes/RSS.
- 2026-09-16 — Deploy (push `cfaaf738`): day-0 F4. Dos semanas comparables de 7 días vs regla de poder F0; ceros bajo `n_min` no deciden.
