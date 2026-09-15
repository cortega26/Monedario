# Spike: instrumentación mínima de errores APV (`calculator_error`)

**Fecha**: 2026-09-14
**Plan**: 112
**Tipo**: spike de diseño (no incluye código de producto)
**Estado**: diseño — sin emisores implementados
**Alcance**: APV primero (`src/pages/calculadoras/apv.astro`); generalización
al resto de calculadoras como opción, sin bifurcar la taxonomía del plan 100

## Contexto y pin de baseline

APV está en HALT (<50% dos semanas comparables; W35 3/21 = 14,3%, W36 6/18 =
33,3%, sin recuperación demostrada) con causa desconocida según el
diagnóstico 086. El evento `calculator_error` está declarado en el contrato
pero no tiene emisores, así que Gate B (error/inicio <5% GREEN) lee "cero
errores = saludable" sobre un punto ciego.

Pin re-verificado en la base `ab44d813` (2026-09-14):

- `grep -rn 'trackAnalyticsEvent("calculator_error"' src/ | wc -l` → **0**.
  Cero emisores en todo `src/`. Si este grep deja de dar 0, el hallazgo de
  este spike desaparece: STOP y re-alcanzar como verificación, no diseñar.
- Contradicción documentada: el diccionario
  (`docs/operations/analytics/UTILITY_LED_EVENT_DICTIONARY.md:12`)
  describía `calculator_error` como emitido ("una vez por intento/categoría
  en el emisor"). Fila anotada en este mismo plan con el caveat
  "contract-defined, unemitted sitewide as of 2026-09-14".
- `src/pages/calculadoras/apv.astro:648`:
  `const economicParameters = readEconomicParameters();` fuera de todo
  try/catch (re-verificado; el try de la línea 721 es del cálculo, no de
  esta llamada). Si el snapshot llega corrupto o el nodo
  `#economic-parameters` falta, el script muere antes de registrar el
  listener del botón: botón "Calcular" inerte, sin mensaje ni evento.
- Bloque de renderizado `apv.astro:742-991` (`buildCard` en `:742`,
  `replaceChildren` + `calculator:result` + `calculator_complete` en
  `:961-991`) sin manejo de excepciones. Un runtime error aquí deja
  `calculator_start` disparado y ningún `calculator_complete` ni
  `calculator_error`: indistinguible del abandono voluntario.
- Bloque de cálculo con try/catch existente `apv.astro:721-740`
  (`calculateApvComparison` → `showFormError` + `return`, sin evento).
- `error_category` es enum concreto en
  `src/contracts/analytics-events.ts:201-207`:
  `validation` / `calculation` / `network` / `timeout` / `stale_source`.
  Este spike reutiliza esos valores; `red` del lenguaje del diagnóstico
  mapea a `network`. Extensiones solo aditivas.
- Roturas de medición (no mezclar series sin nombrarlas):
  - Pre/post-100: el `calculator_complete` propio de APV (`apv.astro:985-991`,
    params legacy `calculator_slug`/`calculator_name`/`outcome`) ahora SE
    TRANSMITE gracias al plan 100 (normalización slug→id + descarte
    CLIENT_ONLY de `calculator_name`); pre-100 se rechazaba. Los
    denominadores de completitud de exports nuevos se miden bajo la
    taxonomía corregida.
  - Pre/post-112-emisión: Gate B antes de implementar este diseño mide
    "cero errores" por ausencia de instrumento; después mide errores
    reales. Nunca promediar Gate B a través del cambio de
    instrumentación.
- Fuente canónica de params: el CONTRATO
  (`src/contracts/analytics-events.ts`), no la línea "Propiedades
  permitidas" del diccionario (que no lista los params nuevos del plan
  100; fuera de alcance aquí — solo se anotó la fila `calculator_error`).

## Objetivos / no-objetivos

Objetivos: señal agregada mínima que distinga "intentó y falló" de
"nunca intentó", reutilizando `calculator_error` + `error_category`
existentes; corregir la fila del diccionario ya (hecho en este plan).

No-objetivos: matemática de la calculadora, cambio de `type="number"` /
placeholders, rutas, títulos, copy, extensión de ventana, re-litigar
055/046, cambios de allowlist del plan 100.

## Emit table — puntos de emisión (diseño, no implementado)

| # | Punto | Código vivo | `error_category` | Notas |
|---|---|---|---|---|
| E1 | Validación de formulario (retorno temprano sin excepción) | `apv.astro:688-693` (`bruto <= 0 \|\| ahorro + aporteDirectoAnual <= 0` → `showFormError` + `return`) | `validation` | Hoy es salida silenciosa para analítica. Emitir `calculator_error` antes del `return`, una vez por intento. |
| E2 | Cálculo lanza | `apv.astro:721-740` (`try { calculateApvComparison(...) } catch → showFormError + return`) | `calculation` | Agregar emisión en el `catch` existente. No capturar ni reenviar `error.message`: solo la categoría. |
| E3 | Parámetros económicos ilegibles (snapshot corrupto / nodo ausente) | `apv.astro:638-648` (`readEconomicParameters()` lanza; llamada sin guard en `:648`) | `stale_source` | La implementación debe decidir: envolver la llamada `:648` en try/catch con emisión + mensaje visible, o mover la lectura dentro del handler del click. Si la fuente distingue "red" de "vencida", `network` vs `stale_source`; por defecto `stale_source`. |
| E4 | Renderizado de resultado lanza | `apv.astro:742-991` (nuevo try/catch envolviendo el bloque: `buildCard`, `summary`, `replaceChildren`, `dispatchEvent`, `calculator_complete`) | `calculation` | `catch`: `showFormError` genérico + emisión `calculation`. No emitir `calculator_complete` en ese camino. |
| E5 (opcional) | Timeout de fuente viva, si APV llegara a fetchear | Ninguno hoy (snapshot embebido) | `timeout` / `network` | Reservado para generalización; en APV no hay fetch, no inventar uno. |

Reglas para todos los puntos: una emisión por intento/categoría (dedupe del
diccionario); payload solo con params allowlistados de `calculator_error`
(`calculator_id`, `page_type`, `cluster`, `error_category`,
`app_version`); **no input-value capture, ever** — nunca montos,
resultados, valores pegados, ni texto del `error.message`.

## Taxonomy — taxonomía (reutilizar plan 100, no bifurcar)

- Evento: `calculator_error` (ya allowlistado,
  `src/contracts/analytics-events.ts:20-26`). Sin evento nuevo para
  errores.
- Param: `error_category` con los valores existentes
  (`validation` / `calculation` / `network` / `timeout` / `stale_source`).
  Mapeo diagnóstico→enum: validación→`validation`, calc→`calculation`,
  red→`network`, fuente vencida→`stale_source`, timeout→`timeout`.
- Aditividad: si la implementación necesita una categoría nueva (p. ej.
  distinguir "placeholder pegado rechazado por `type=number`" de
  validación genérica), se propone como valor enum aditivo nuevo con
  revisión de privacidad, nunca renombrando los cinco existentes ni
  creando un param paralelo (p. ej. NO `error_code`: ya es legacy de
  `error_category` vía `LEGACY_PARAM_NAMES`).
- Nombres Tier-A del plan 100 (`calculator_id`, `page_type`, `cluster`,
  `interaction_variant`, `app_version`, `outcome`, `mode`, etc.) se
  reutilizan tal cual. El payload de error NO lleva `outcome`/`mode` (no
  están en su allowlist); no "ensanchar" el allowlist aquí — eso lo
  decidiría el plan de implementación con su propio ADR si hiciera falta,
  no este spike.
- El diccionario sigue diciendo "Propiedades permitidas, sin excepciones"
  sin los params del plan 100: citar el CONTRATO como canónico (el propio
  header del diccionario lo dice). No "arreglar" esa lista aquí.

## Progress event — propuesta (no decidida) para separar "nunca intentó" de "intentó y falló"

Problema: `calculator_start` ("primera interacción sustantiva con input o
botón") no distingue abandono pre-intento de fallo silencioso
post-intento. Propuesta PARA EL PLAN DE IMPLEMENTACIÓN (con revisión de
privacidad; no presentada como decidida, no bifurca la taxonomía):

- Candidato: `calculator_attempt` emitido al click de "Calcular", antes
  del cálculo (alternativas a evaluar: reutilizar `calculator_start` con
  `interaction_variant: button` si el etiquetado actual ya lo cubre — la
  implementación debe auditar qué emite hoy APV en ese click antes de
  crear un nombre nuevo).
- Si requiere nombre nuevo: params solo con nombres Tier-A ya
  allowlistados (`calculator_id`, `page_type`, `cluster`,
  `interaction_variant`, `app_version`); payload vacío o constante,
  nunca inputs; dedupe una vez por vista o por intento (decisión del
  plan de implementación, documentada en el diccionario); actualizar
  contrato + worker + ambos Sets de data-signals + sync test juntos
  (regla del plan 100: las cuatro copias se mueven juntas).
- Lectura con el evento: `attempt_sin_complete_sin_error` = abandono
  post-intento sin rastro (sospechoso); `attempt_con_error` = fallo
  explicado; `sin_attempt` = nunca intentó (fricción previa al intento).

## Dedupe

Una emisión de `calculator_error` por intento y categoría, según el
diccionario. El `ONCE_PER_VIEW_EVENTS` de `src/scripts/analytics.ts`
hoy solo contiene `calculator_complete`: NO agregar `calculator_error`
a ese set (múltiples intentos en una vista deben poder emitir de nuevo
si cambian de categoría o de intento). La implementación pinnea: dos
clicks fallidos distintos → dos errores; un click con dos categorías →
máximo una emisión por categoría; recalcular exitoso tras error no
re-emite el error.

## Volumen vs rate-limit (30/min) y cardinalidad de export

- Rate limit: `RATE_LIMIT_MAX = 30` requests por IP por ventana móvil de
  60 s (`workers/analytics-collector/src/index.ts:31-32`; falla abierto
  si KV cae). Cada intento APV emite como máximo 1 vista + 1 inicio +
  1 intento (si se crea) + 1 error o 1 complete: <6 requests por sesión
  interactiva normal. APV mueve 12–33 inicios/semana (diagnóstico §Paso 1);
  incluso con 100% de error y reintentos agresivos (5 intentos/usuario),
  el techo realista es <200 eventos/semana para APV: tres órdenes de
  magnitud bajo el límite por IP. Sin riesgo de 429 por este diseño.
- Cardinalidad de export: 1 calculadora × 5 valores de `error_category`
  = 5 series nuevas en el export semanal (`ALLOWED_EVENTS` y
  `ANALYTICS_EVENT_NAMES` ya incluyen `calculator_error`, verificado en
  este spike — sin cambio de Sets requerido para el APV-first). Si se
  generaliza a N calculadoras: N×5 series acotadas, sin free-text, sin
  explosión de cardinalidad. Prohibido agregar el mensaje de error o
  cualquier param libre: rompería esta cota.

## Allowlist / contrato — qué debe (y no debe) cambiar la implementación

- APV-first: NINGÚN cambio de allowlist/contrato/worker/Sets. Verificado:
  `calculator_error` está en `ANALYTICS_EVENT_ALLOWLIST` (`:20-26`), en
  `ANALYTICS_ALLOWED_PROPERTIES`, en el enum `error_category`
  (`:201-207`), y en ambos Sets de pipeline
  (`fetch-analytics-export.mjs:40`, `build-weekly-search-report.mjs:16`).
  La implementación solo toca emisores en `apv.astro` (alcance del plan
  que sigue, no este spike).
- Si se crea el evento de progreso con nombre nuevo: entonces sí —
  contrato + `index.ts`/`worker-v2.ts` (reutilizando las constantes del
  contrato, patrón `../../../src/contracts/analytics-events`) + ambos
  Sets + relax/roundtrip tests del plan 100, todo junto. Nombres y
  params coordinados con el Tier-A del plan 100; ante conflicto de
  nombres: STOP y reconciliar primero (taxonomía única).
- No tocar `CLIENT_ONLY_PARAMS`, `LEGACY_*`, ni el threshold de
  cobertura en el plan de implementación salvo ADR propio.

## Privacy checklist — revisión de privacidad (agregado puro)

- [ ] Sin montos, resultados, texto libre, PII ni IDs persistentes en
  ningún payload (header del diccionario; `FORBIDDEN_KEY_PATTERN` en
  `analytics-events.ts:243-244` bloquea `amount/input/value/sueldo/...`).
- [ ] **No input-value capture, ever**: nunca el valor del input
  (incluido el texto pegado con `$`, puntos o comas que `type="number"`
  rechaza), nunca `error.message` (puede interpolar datos), nunca clases
  de validación con datos. Solo `error_category` enum.
- [ ] La telemetría del rechazo de `type="number"` + placeholder (si se
  mide algún día) es conteo agregado por categoría, jamás el valor
  pegado. Diseño pendiente — congelado, fuera de aquí.
- [ ] `calculator_name`/`cta_label`/`article_title` siguen CLIENT_ONLY
  (descarte en normalización, plan 100): no reintroducirlos por la vía
  del error.
- [ ] IP solo como clave efímera de rate-limit 120 s fuera del payload
  (diccionario); no exportar ni cruzar con contadores.
- [ ] Si la implementación propone capturar algo más que la categoría
  (p. ej. mensajes): STOP — violación de privacidad, rediseñar
  agregado-puro.

## Implementation-plan handoff — pruebas que debe traer la implementación

El plan de implementación (separado) debe traer, como mínimo:

1. Emisión por categoría: un test por punto E1–E4 (validación,
   cálculo, `stale_source` por snapshot ilegible, cálculo-en-render)
   que fuerce el fallo y aserte `trackAnalyticsEvent("calculator_error",
   { error_category: <valor> })` con payload solo-allowlist (roundtrip
   por ambos sanitizadores, patrón plan 100).
2. Dedupe: doble click fallido mismo intento/categoría → una emisión;
   dos intentos → dos; camino de éxito no emite error y no suprime el
   `calculator_complete` existente.
3. Gate-B split pre/post: el readout de Error/inicio se reporta
   separado antes/después de la instrumentación; nunca promediado a
   través del cambio. Criterio: GREEN <5%, WATCH 5–10%, HALT >10%
   (`UTILITY_LED_EXPERIMENT_REGISTRY.md:9`), con `n_min` por
   denominador (`:23`) — con ~21 inicios/semana APV tarda en tener
   denominador suficiente; reportar `SIN DATOS SUFICIENTES`, nunca 0%
   como GREEN, hasta alcanzar `n_min`.
4. Progreso: si se crea el evento propuesto, test de
   transmisibilidad + no-PII + dedupe documentado; si se reutiliza
   `calculator_start`, test que lo demuestre sin nombre nuevo.
5. Gates: `pnpm run test`, `check:docs`, prettier del diff, sin
   matemática/ruta/copy tocadas; el diff de emisores confinado a
   `apv.astro` (+ tests).

## Notas de mantenimiento

- El plan de implementación debe dividir períodos pre/post emisión —
  nunca mezclar Gate B a través del cambio de instrumentación.
- Si `calculator_error` se generaliza más allá de APV, las categorías
  APV-first quedan estables; agregados solo aditivos al enum.
- **Diferido**: medición de fricción placeholder/input de texto
  (necesita diseño de telemetría de incidencia primero — adyacente a
  congelamiento, no aquí).

## Archivos consultados (evidencia)

- `docs/backlog/DIAGNOSTICO-apv-completion-2026-09-04.md:58-62,206-215,244-252,126-143,260-278`
- `src/contracts/analytics-events.ts:20-27,201-207,243-244,306-333`
- `docs/operations/analytics/UTILITY_LED_EVENT_DICTIONARY.md:12`
- `src/pages/calculadoras/apv.astro:638-648,664-693,721-740,742-991,985-991`
- `plans/archive/086-apv-completion-drop-diagnosis.md:262`
- `plans/archive/100-analytics-taxonomy-tests.md` (Tier-A/Tier-B, cierre
  2026-09-14, merge `29856700`)
- `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md:6-32`
- `workers/analytics-collector/src/index.ts:31-32`
- `scripts/data-signals/fetch-analytics-export.mjs:35-40`,
  `scripts/build-weekly-search-report.mjs:12-16`
