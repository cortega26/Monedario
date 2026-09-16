# Definiciones congeladas de métricas derivadas

**Owner:** `docs/backlog/PLAN-measurement-integrity-2026-09-16.md` (F2) ·
**Fecha:** 2026-09-16 · **Estado:** registrado, pendiente de firma del owner
**Contrato:** `src/contracts/analytics-events.ts` (taxonomía v2) ·
**Diccionario:** `docs/operations/analytics/UTILITY_LED_EVENT_DICTIONARY.md`
**Registro de umbrales:** `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md`

Definiciones congeladas: cambiar una fórmula exige ADR, no edición
silenciosa. Fuente de números: `output/operations/data-signals/analytics/2026-W36.json`
(semana completa 7/7, schema v2, 357 filas). W37 truncada excluida (§4
de la metodología).

Regla de poder (084, vigente en todas): bajo `n_min` el veredicto es
`SIN DATOS SUFICIENTES`, nunca HALT ni 0%. Tabla `n_min` firmada en el
registry (F0, plan 2026-09-16): `next_step` 99 @3%, `alert` 149 @2%,
`support` 598 @0,5%, `share` 299 @1% interino, `source_click`
direccional vía Wilson.

## 1. Activación — `start / view`

Fórmula: `activation = calculator_start / calculator_view`,
agregado por `calculator_id` y semana. Campos usados: `event_name`,
`calculator_id`, `count` (el `dimensions` distingue `focus/input/button`
solo para diagnóstico, no para la fórmula). `n_min`: no aplica umbral
de registry (denominadores en miles); se reporta con el n.

Ejemplo W36 (sitio): `1.163 / 1.704 = 68,3%`.

- `conversor-utm`: `856 / 1.280 = 66,9%`.
- `conversor-uf`: `144 / 169 = 85,2%`.

## 2. Completitud — `complete / start`

Fórmula: `completion = calculator_complete / calculator_start`,
agregado por `calculator_id` y semana. Campos usados: `event_name`,
`calculator_id`, `count`. Dedupe del contrato: un `complete` por
calculadora/vista (recalcular no suma), por lo que el ratio puede
acercarse a 100% en calculadoras de resultado inmediato sin que eso
indique duplicación. `n_min`: no aplica umbral de registry; se reporta
con el n.

Ejemplo W36 (sitio): `1.091 / 1.163 = 93,8%`.

- `conversor-utm`: `842 / 856 = 98,4%`.
- `conversor-uf`: `141 / 144 = 97,9%`.

## 3. Intención CTA — `next_step_click / next_step_shown`

Fórmula: `cta_intent = next_step_click / next_step_shown`, agregado por
`calculator_id` y semana. Nota de vocabulario: el plan la nombra
`intent-rate`; aquí usa vocabulario `next_step` consistente con la
taxonomía v2 (el denominador es el contexto post-resultado mostrado,
`next_step_shown` exige ≥25% en viewport tras un resultado válido).
Campos usados: `event_name`, `calculator_id`, `next_step_id`
(vía `dimensions`), `count`. `n_min`: **99** (p = 3% HALT, tabla F0
firmada; el cálculo vale sobre el pedido original —ver registry §
Discrepancia resuelta).

Ejemplo W36 (sitio): `4 / 117 = 3,4%`, n = 117 ≥ 99 → denominador
suficiente (el veredicto GREEN/WATCH/HALT lo owns el registry, no este
documento). Advertencia de atribución: 2 de los 4 clics caen en el
bucket `calculator` (sin `calculator_id`, gap NextSteps owned por el
plan panel F1), por lo que el ratio por calculadora subestima el sitio:
`apv` 1/14, `impuesto-segunda-categoria` 1/25 — el resto no es
atribuible hasta el fix F1.

## 4. Densidad de intent — `intent events / complete`

Fórmula:
`intent_density = (next_step_click + source_click + support_click + share_success + alert_interest_submit) / calculator_complete`,
agregada por semana (sitio o `calculator_id`). Solo activaciones
explícitas; los `*_shown` no entran al numerador. Campos usados:
`event_name`, `calculator_id`, `count`.

**Desviación explícita del plan (documentada con rationale):** el plan
pedía densidad sobre usuarios activos, pero la identidad de usuario no
existe en first-party por diseño (sin cookies de tracking, sin
fingerprint, sin IDs persistentes —ver taxonomía v2 y diccionario).
El denominador congelado es `calculator_complete`, no usuarios. En
consecuencia:

- La métrica se lee "intents por resultado completado", nunca "por
  usuario" ni "por sesión".
- Puede superar 100% en teoría (varios intents por un mismo resultado);
  eso es aritmética válida, no anomalía.
- No admite cohortes 7/30 días ni retorno individual (misma restricción
  que las UTM, ver diccionario).

`n_min`: el registry no fija umbral para densidad; como convención
interina (no registry) se exige el `n_min` más estricto entre sus
componentes con umbral (99) sobre el denominador `complete` antes de
cualquier lectura direccional.

Ejemplo W36 (sitio): `(4 + 8 + 0 + 0 + 0) / 1.091 = 12 / 1.091 = 1,10%`,
n = 1.091 ≥ 99 → lectura direccional permitida, veredicto según
registry. (`source_click` 8 vive en buckets `calculator`/`unknown`:
atribuible al sitio, no a calculadora —misma advertencia que §3.)
Referencia direccional citada del registry (no veredicto):
`source_click` W36 8/1.091 = 0,73%, Wilson 95% [0,37%, 1,44%].

## Congelamiento

Estas cuatro fórmulas, sus campos y sus denominadores quedan
congelados el 2026-09-16. Cambio futuro = ADR + re-verificación contra
`CALCULATOR-REGISTRY.md` (toda `calculator_id` del export resuelve
22/22 en W36).
