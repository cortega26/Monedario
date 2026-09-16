# Metodología de comparación de medición

**Owner:** `docs/backlog/PLAN-measurement-integrity-2026-09-16.md` (F2) ·
**Fecha:** 2026-09-16 · **Estado:** FIRMADO por el owner 2026-09-16
**Precedencia:** `docs/AI_ENGINEERING_CONSTITUTION.md` → `AGENTS.md` →
`context/*.md` → implementación.

Este documento congela cómo se comparan las tres fuentes de medición
(Cloudflare, GSC, first-party) sin mezclarlas. Es doctrina, no código:
ningún gate decide con números que violen estas reglas.

## 1. Semántica de capas

Cada capa mide un instrumento distinto, con distinta unidad y distinta
noción de identidad. La tabla se lee de afuera (red) hacia adentro
(intención):

| # | Capa | Instrumento | Qué cuenta | Identidad |
|---|---|---|---|---|
| L1 | `CF requests` | Cloudflare edge | Peticiones HTTP (humanas vs bot según la propuesta) | ninguna (IP solo como clave efímera de rate limit, nunca exportada) |
| L2 | `CF visits` | Cloudflare | Visitas agregadas | ninguna; **visita ≠ usuario ≠ sesión** |
| L3 | `GSC clics/impr` | Google Search Console | Clics e impresiones en el buscador, por URL/query | ninguna (agregación + anonimización propia de GSC) |
| L4 | `First-party aggregate events` | `collector → R2 → scorecard` | Eventos agregados por `calculator_id` (`view/start/complete`, ver taxonomía v2) | ninguna (sin cookies de tracking, sin fingerprint, sin IDs persistentes) |
| L5 | `Intent outcomes` | Mismos eventos first-party | Activaciones explícitas (`next_step_click`, `source_click`, `support_click`, `share_success`, `alert_interest_submit`) | ninguna |

Fuentes semanales: `output/operations/data-signals/cloudflare/`,
`gsc/` y `analytics/` (ver `output/operations/data-signals/README.md`).

**Prohibiciones:**

- Nunca equivarar `CF visits` con usuarios ni con sesiones.
- Nunca forzar que los números cuadren entre capas (L2 ≠ L3 ≠ L4 por
  diseño: miden instrumentos distintos).
- Nunca interpretar un clic (L3 o L5) como aporte, retorno individual o
  cohorte; las UTM solo miden activaciones de enlaces propios en
  agregado (ver `docs/operations/analytics/UTILITY_LED_EVENT_DICTIONARY.md`).
- Nunca usar valores puntuales de una semana incompleta (ver §4).

## 2. Ratios diagnósticos (cinco)

Son **diagnósticos, no conversión** (ver §3). Cada ratio cruza dos capas
para detectar anomalías de instrumento, no para declarar embudos.

### R1 — Rendimiento edge → visita: `CF visits / CF requests` (humanas)

Mide higiene del edge (bots, caché, asset split). Baseline de la
propuesta externa (referencia no-autoritativa,
`EXTERNAL_PATTERNS_NON_AUTHORITATIVE`):

- 30 d: `68.486 / 369.363 = 18,5%`.
- 7 d: `68.342 / 302.318 = 22,6%`.

La diferencia 30 d ↔ 7 d es composición de ventana, no veredicto.

### R2 — Peso de búsqueda: `GSC clics sitio / CF visits`

Direccional: qué fracción del tráfico agregado viene atribuida a
búsqueda. **W36 no es computable sin violar doctrina**: el export
semanal de Cloudflare (`2026-W36-traffic.json`) trae `pageViews`
(17.353) y `requests` (88.101), no `visits`; sustituir `pageViews` por
`visits` es exactamente la equivalencia prohibida del §1. El proxy
ilustrativo `1.686 / 17.353 = 9,7%` se registra solo para mostrar el
orden de magnitud y **nunca entra como input de decisión**.

### R3 — Captura on-page: `first-party calculator_view / CF pageViews`

Direccional: qué fracción de las vistas de página agrega el pipeline
propio. W36 (proxy ilustrativo, no KPI):
`1.704 / 17.353 = 9,8%`. Caídas bruscas entre semanas comparables
sugieren fallo de emisión o de ingesta, nunca "menos interés".

### R4 — Rendimiento búsqueda → resultado: `first-party complete / GSC clics`

Por URL de calculadora, direccional. W36:

- Sitio: `1.091 / 1.686 = 64,7%`.
- UTM: `842 / 1.484 = 56,7%`.
- UF: `141 / 6 = 2.350%`.

El caso UF es el ejemplo canónico de la doctrina: un ratio >100%
demuestra que el numerador y el denominador **no forman un embudo**
(el grueso de los completitudes UF llega por tráfico directo u otras
vías, no por los 6 clics GSC). Quien lo lea como "conversión 2.350%"
no entendió este documento.

### R5 — Densidad de intent: `intent events / complete`

Puente hacia las métricas derivadas (definición congelada en
`docs/operations/DERIVED-METRICS-DEFINITIONS.md`). W36:
`(4 + 8 + 0 + 0 + 0) / 1.091 = 12 / 1.091 = 1,10%`
(`next_step_click` 4 + `source_click` 8 + `support_click`,
`share_success`, `alert_interest_submit` en 0).

## 3. Doctrina "diagnóstico, no conversión"

1. Los ratios R1–R5 detectan **anomalías de instrumento** (emisor caído,
   ingesta pausada, export truncado, cambio de composición). No miden
   éxito de producto.
2. El éxito de producto se decide solo con las métricas derivadas
   congeladas + umbrales del
   `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md`, con regla de
   poder (`SIN DATOS SUFICIENTES` bajo `n_min`, nunca HALT ni 0%).
3. Un cero con denominador chico no es evidencia de ausencia
   (p. ej. `share_success` 0 en W36 con cero eventos share emitidos:
   falta instrumentación/emisión, no falta demanda).
4. Los buckets `calculator` / `unknown` del export son esperados
   (fallback `page_type` del worker, eventos de artículo) y se reportan
   como tales, no como error (ver `CALCULATOR-REGISTRY.md` § Cross-check
   W36).
5. La propuesta externa informa, nunca manda: sus baselines 30 d/7 d
   son referencia, no autoridad local.

## 4. Regla de semana completa (7/7 o no decidir)

Una semana comparable tiene **7 días presentes en cada fuente que se
use como evidencia**. Semana <7 días → no decidir (STOP del plan,
precedente plan 111). La completitud se verifica por fuente, no por
ventana declarada: que el `window` diga 7 días no basta si los `date`
distintos son menos.

## 5. Incidente canónico: W37 truncada a 5 días

`output/operations/data-signals/analytics/2026-W37.json` declara
`window: 2026-09-07 → 2026-09-13` pero contiene solo 5 fechas
(09-07 → 09-11, 321 filas). GSC W37 declara la misma ventana
(`fetchedAt` 2026-09-14) y Cloudflare W37 sí trae 7 días de tráfico:
la truncación es del export first-party, no del sitio. Por §4, **W37
queda excluida como evidencia y como denominador** (ya aplicado en
`docs/reports/CTR-BASELINE-W36-2026-09-16.md`, que congela W36 como
única semana de comparación, y en
`docs/reports/CONTENT-REFRESH-QUEUE-2026-09-16.md`, que usa W37 solo
como contraste direccional). Toda comparación futura que cite W37 como
baseline repite este incidente.

## STOP triggers de este documento

- Semana <7 días usada como evidencia → no decidir.
- `CF visits` leídos como usuarios/sesiones → `HALT` de la lectura.
- Ratio cruzado presentado como conversión o embudo → `HALT`.
- Buckets `calculator`/`unknown` tratados como fallo de medición → corregir
  lectura, no el pipeline.
