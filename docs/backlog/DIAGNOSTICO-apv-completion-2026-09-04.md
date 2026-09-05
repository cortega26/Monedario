# Diagnóstico: caída de completitud de la calculadora APV (58% → 14%, W33–W35)

**Fecha**: 2026-09-04
**Plan**: 086
**Tipo**: diagnóstico (no incluye arreglo de producto)
**Resultado**: **causa no identificada** — ningún defecto reproducible en el
motor de cálculo ni en el renderizado de resultados para inputs plausibles.

## Resumen

`/calculadoras/apv/` pasó de completar 82% de sus inicios (W32) a 58% (W33), 19%
(W34) y 14% (W35), mientras el resto del sitio se mantuvo estable (87.9%–92.8%
global en la misma ventana). Se investigaron los tres candidatos de código
señalados en el plan y dos hipótesis adicionales (economic snapshot corrupto,
formato de moneda en inputs numéricos). Ninguno explica el patrón específico de
APV con evidencia reproducible. Se reprodujo el flujo completo en un servidor
local con Playwright (viewport móvil, Regímenes A/B/mixto, re-edición de
campos) sin lograr disparar un fallo: en todos los casos con inputs numéricos
válidos, `calculator_complete` se emitió correctamente. La recomendación es
instrumentar antes de seguir buscando a ciegas: el sitio no emite
`calculator_error` en ningún punto (hallazgo aparte, confirmado), así que un
fallo real en producción no dejaría rastro distinguible del abandono.

## Paso 0 — Baseline

- `pnpm install --frozen-lockfile` → exit 0.
- `pnpm run test` → **1406/1406 tests pasan** (160 archivos).
- `pnpm run build` → exit 0, incluyendo `check-indexable-url-freeze`,
  `check-toc-i18n`, `check-editorial-guard`, `check-urls` (7024 links, 0 rotos).

Baseline verde. Se puede distinguir un defecto de APV de un checkout roto.

## Paso 1 — ¿La caída es real, específica de APV, y no un artefacto de medición?

### 1.1 Reproducción de la serie diaria

Se agregó `output/operations/data-signals/analytics/2026-W3{1..5}.json` por
`date` + `calculator_id="apv"` + `event_name` (`calculator_start` /
`calculator_complete`). La serie diaria reconstruida **coincide exactamente**
con la tabla del plan para W33, W34 y W35 (ver script desechable usado, no
commiteado, en el scratchpad de la sesión — no forma parte del repo):

```
W33: 08-10 6/2 | 08-11 6/3 | 08-12 6/4 | 08-13 5/3 | 08-14 5/3 | 08-15 2/2 | 08-16 3/2
W34: 08-17 5/2 | 08-18 5/0 | 08-19 1/0 | 08-20 8/1 | 08-21 1/1 | 08-23 1/0
W35: 08-24 4/0 | 08-25 5/2 | 08-26 3/1 | 08-27 3/0 | 08-28 4/0 | 08-29 0/0 | 08-30 2/0
```

Sin discrepancias. No hay error de agregación ni cambio de forma de los datos.

### 1.2 Comparación global vs. APV (¿es un artefacto de medición o específico?)

Fuente: `output/operations/data-signals/analytics/2026-W{31,32,33,34,35}.json`
(campo `data[].event_name` sumado por semana, todas las calculadoras).

| Semana | Global start/complete | Global ratio | APV start/complete | APV ratio |
|---|---:|---:|---:|---:|
| 2026-W31 | 964 / 908 | 94.2% | 12 / 8 | 66.7% |
| 2026-W32 | 1084 / 1006 | 92.8% | 17 / 14 | 82.4% |
| 2026-W33 | 701 / 616 | 87.9% | 33 / 19 | 57.6% |
| 2026-W34 | 743 / 658 | 88.6% | 21 / 4 | **19.0%** |
| 2026-W35 | 844 / 775 | 91.8% | 21 / 3 | **14.3%** |

El sitio se mantiene entre 87.9% y 94.2% durante toda la ventana. APV es la
única calculadora que colapsa. **Descarta la hipótesis "es un problema
global"** (una de las condiciones de STOP del plan) — el problema es
específico de APV.

### 1.3 ¿Cambió el `calculator_id` de APV? (¿artefacto de medición por renombre?)

Se extrajeron todos los valores únicos de `calculator_id` que coinciden con
`/apv/i` en cada export semanal (W31–W35). En las cinco semanas el único valor
es `"apv"` — sin variantes (`apv-chile`, `apv_v2`, etc.). **Descarta el
renombre de slug** como explicación (otra condición de STOP del plan).

### 1.4 Deduplicación por vista (`ONCE_PER_VIEW_EVENTS`)

`src/scripts/analytics.ts:22` confirma que `calculator_complete` está en
`ONCE_PER_VIEW_EVENTS`, deduplicado por clave `` `${eventName}:${slug}` `` en
memoria (`sentOncePerView`, `src/scripts/analytics.ts:99-108`). Esta lógica
existe desde antes de la ventana de deterioro (últimos cambios en
`src/scripts/analytics.ts`: commit `e17013b7`, 2026-08-02, y `9031429d`,
2026-07-10 — ambos anteriores al inicio de la caída en W33/2026-08-10). No
cambió durante la ventana investigada; no explica el patrón.

**Conclusión del Paso 1**: la caída es real, medible, específica de APV, y no
es un artefacto de agregación, renombre de slug, ni de la lógica de
deduplicación de eventos.

## Paso 2 — Reproducción del flujo en local

### Protocolo

- Servidor: `pnpm run dev` (Astro, puerto 4322 asignado automáticamente).
- Navegador: Playwright + Chromium (`@playwright/test` 1.62.1, ya instalado en
  el entorno — no requirió instalación adicional), viewport `iPhone 13`
  (dispositivo móvil emulado), confirmando primero que el tráfico del sitio es
  mayoritariamente móvil: `output/operations/data-signals/gsc/2026-W35-devices.json`
  reporta 501 clics MOBILE vs. 269 DESKTOP vs. 3 TABLET (~65% móvil).
- Se instrumentó un listener de `document.addEventListener("calculator:result", ...)`
  para detectar de forma no intrusiva si el cálculo llegó a completarse (este
  evento se dispara en `src/pages/calculadoras/apv.astro:979-985`,
  inmediatamente antes de `trackAnalyticsEvent("calculator_complete", ...)` en
  la línea 987) y se capturaron `pageerror`, `console` (nivel error) y
  respuestas HTTP ≥400 de la página.
- El transporte de analítica real (`/api/analytics/event`) no existe en dev
  local (404 esperado, no hay Worker corriendo) — esto NO impide observar si
  el código de tracking se ejecuta: las 4 peticiones a ese endpoint por
  escenario exitoso confirman que `trackAnalyticsEvent` sí se invoca hasta el
  final del flujo de cálculo.

### Escenarios probados

| Escenario | Resultado |
|---|---|
| Inputs numéricos normales (sueldo 1.500.000, imponible 1.350.000, ahorro 100.000) | `calculator:result` disparado, sin errores de página, `calculator_complete` invocado |
| Estrategia mixta forzada (sueldo alto + aporte alto para activar `mixedStrategy`) | Disparado correctamente, tarjeta mixta renderizada |
| Recalcular tras editar campos (segunda invocación en la misma vista, prueba de la dedup `ONCE_PER_VIEW_EVENTS`) | Ambas invocaciones disparan `calculator:result`; el evento de analítica se dedupica en la segunda (comportamiento esperado, no es un fallo) |
| Montos con puntos como separador de miles ("1.500.000") | **Playwright no pudo ni completar el `fill`**: un `<input type="number">` rechaza el segundo punto por sintaxis numérica inválida (HTML5). El campo queda vacío → `showFormError` visible ("Ingresa tu sueldo y al menos un aporte APV..."), sin lanzar excepción ni bloquear el resto de la página. |
| Monto pegado con símbolo de moneda ("$1.500.000") | Mismo resultado que el anterior: rechazado por el input, error de formulario visible. |
| Coma como separador ("100,000") | Mismo resultado: rechazado por el input, error de formulario visible. |

En **ningún escenario con inputs numéricos válidos** se observó una excepción,
un error de consola, ni un fallo en el disparo de `calculator_complete`.

### Hallazgo real pero no causal: `type="number"` + placeholder con puntos

`src/components/calculator/CalculatorField.astro:24` define `type = "number"`
como default. `apv.astro` usa placeholders como `"Ej: 1.500.000"`
(`src/pages/calculadoras/apv.astro:136`) que modelan un formato (puntos como
separador de miles) que un `<input type="number">` **no puede aceptar**: el
navegador interpreta el segundo punto como sintaxis inválida y vacía el campo.
Una persona que copie literalmente el formato del placeholder no puede
completar el formulario y ve un error visible, sin que quede rastro en
analítica (no existe `calculator_error`).

Este es un defecto real y reproducible, pero **no es específico de APV**: el
mismo patrón (`type="number"` + placeholder con puntos) está presente en 19
calculadoras del sitio, incluida `sueldo-liquido.astro` — la calculadora con
**mejor** completitud del sitio (78%–94% en la misma ventana). Si este defecto
fuera la causa dominante de la caída de APV, calculadoras que comparten el
mismo patrón deberían mostrar degradación comparable, y no la muestran. Se
documenta como hallazgo sitewide independiente, no como causa de este caso.

## Candidatos de código descartados (con evidencia fechada)

| Commit | Fecha | Qué toca | Por qué se descarta |
|---|---|---|---|
| `32bd56ce` (unificación `formatCLP`) | 2026-08-11 | `apv.astro:607-617`, cambia `fmt()` para llamar `formatCLP(n)` | `src/utils/formatCLP.ts` es **funcionalmente idéntico** al código inline que reemplazó: `"$" + Math.round(n).toLocaleString("es-CL")` en ambos casos. Sin cambio de comportamiento. |
| `050eb40b` (glosario en FAQ) | 2026-08-08 | Envuelve la respuesta FAQ de APV en `<GlossaryContentWrapper>` | Toca solo la sección FAQ (fuera del formulario). El mismo wrapper se aplicó a 6 calculadoras más (`conversor-utm`, `conversor-uf`, `comisiones-afp`, `gratificacion-legal`, `credito-consumo`, `operacion-renta`) en el mismo commit; ninguna de ellas muestra el patrón de colapso de APV (`conversor-utm` se mantiene en 97–99%). |
| `c7bf4832` (seoTitle blog) | 2026-08-10 | Solo `src/data/blog/*.md` y mecanismo de override de blog | **No toca ningún archivo de calculadoras** (`git show --stat -- src/pages/calculadoras/apv.astro` no devuelve nada). Candidato descartado por completo. |
| `economic-parameters.snapshot.json` (refrescos automáticos, ~57 commits entre 2026-08-08 y 2026-08-31) | continuo | `uf`, `utm` usados por `readEconomicParameters()` (`apv.astro:638-648`), que **lanza una excepción no capturada a nivel de módulo** si `uf<=0` o `utm<=0` o no son finitos | Se auditaron los valores de `uf`/`utm` en **todos** los commits de refresco del período: `uf` sube monotónicamente de 40844.79 (08-09) a 40873.77 (08-31), `utm` se mantiene fijo en 71649 durante toda la ventana. Nunca hay un valor nulo, cero o no numérico committeado. No hay evidencia de que este camino se haya disparado. |
| `406e8a82` (rename taxonomía `next_step_*`) | 2026-08-03 | `src/scripts/next-best-step.ts`, renombra parámetros de tracking (`rule_id`→`next_step_id`, etc.) | Cambio cosmético de nombres de parámetros sin efecto de comportamiento (documentado explícitamente en el propio commit: "sin cambio de comportamiento observado"). Además es anterior al inicio de la caída (2026-08-10). |
| Slug de `calculator_id` | — | — | Confirmado constante (`"apv"`) en las 5 semanas (Paso 1.3). |
| `ONCE_PER_VIEW_EVENTS` / dedup por vista | — | `src/scripts/analytics.ts:22,99-108` | Sin cambios desde 2026-08-02, antes del inicio de la caída. |

### Nota sobre un riesgo estructural real pero no confirmado

`document.getElementById("calcBtn")?.addEventListener(...)` se registra en la
**misma ejecución síncrona** del `<script>` de `apv.astro`, después de
`const economicParameters = readEconomicParameters();` (línea 648), que **no
está envuelta en try/catch**. Si esa línea lanzara una excepción (parámetros
económicos ausentes o inválidos en el HTML servido), **todo el resto del
script no se ejecutaría**, incluyendo el registro del listener del botón
"Calcular" — el botón quedaría inerte, sin mostrar ningún error, mientras que
`calculator_start` (que se dispara desde `src/scripts/analytics.ts`, un script
independiente, con solo un `focus`/`input`/`click` en el formulario) seguiría
registrándose con normalidad. Este patrón coincide estructuralmente con la
anomalía observada (starts altos, completes ~0, sin errores). **No se encontró
evidencia de que esto haya ocurrido**: los valores de `uf`/`utm` en el
snapshot commiteado fueron válidos durante toda la ventana. Queda como un
punto frágil del código (falta de try/catch alrededor de
`readEconomicParameters()` y de todo el bloque de renderizado de
resultado en `apv.astro:742-991`) que vale la pena blindar en un plan de
arreglo, no como causa confirmada de esta caída específica.

## Paso 3 (compuerta): decisión

**No se reprodujo un fallo determinista** en el motor de cálculo
(`CalculateApvComparison`) ni en el renderizado de resultados para ningún
input numérico plausible probado (valores normales, estrategia mixta,
re-edición de campos, viewport móvil). Todos los candidatos de código
señalados en el plan fueron descartados con evidencia fechada (tabla arriba).
No se detectó cambio global del sitio ni renombre de slug.

Conforme al Paso 3 del plan: **STOP, causa no identificada**. No se
autoriza ni se realiza ningún cambio de producto en esta sesión.

### Qué se descartó (resumen)

- Artefacto de agregación/medición (Paso 1: serie reproducida exactamente).
- Caída global del sitio (Paso 1.2: ratio global estable 87.9%–94.2%).
- Renombre de `calculator_id` (Paso 1.3: siempre `"apv"`).
- Cambio en la lógica de deduplicación de eventos (sin cambios en la ventana).
- Refactor de formateador de moneda `32bd56ce` (funcionalmente idéntico).
- Envoltura de glosario en FAQ `050eb40b` (mismo patrón en calculadoras sanas).
- Mecanismo de `seoTitle` de blog `c7bf4832` (no toca código de calculadoras).
- Corrupción del snapshot económico (valores válidos en todos los commits de
  refresco de la ventana).
- Rename de taxonomía en `next-best-step.ts` (cosmético, previo a la ventana).
- Defecto de fallo silencioso del motor de cálculo para inputs válidos
  (probado explícitamente con Playwright en viewport móvil, sin reproducirse).

### Qué NO se descartó / hallazgos que quedan abiertos

- **`calculator_error` es 0 en todo el sitio, siempre.** El evento está
  declarado en el contrato (`src/contracts/analytics-events.ts:13`) pero
  **ningún archivo de página o script lo invoca**: `grep -rn '"calculator_error"'`
  sobre `src/**/*.astro` y `src/**/*.ts` solo encuentra la declaración del
  contrato, cero llamadas a `trackAnalyticsEvent("calculator_error", ...)`.
  Esto significa que **cualquier**
  fallo silencioso de cálculo o de renderizado en producción —en APV o en
  cualquier otra calculadora— sería indistinguible del abandono voluntario en
  los datos actuales. Esta es la brecha instrumental más importante detectada
  en esta sesión.
- **El bloque de renderizado de resultado de `apv.astro` (líneas 742–991) no
  tiene manejo de excepciones**, a diferencia del bloque de cálculo (que sí
  tiene try/catch, líneas 721–740). Un error de runtime en cualquier punto de
  ese bloque (incluida la lectura de `economicParameters` en la línea 648, que
  ocurre antes de registrar el listener del botón) dejaría el botón "Calcular"
  inerte o el cálculo sin completar, sin mensaje visible ni evento de
  analítica. No hay evidencia de que esto haya ocurrido en la ventana
  investigada, pero el código lo permite.
- **Denominadores pequeños**: APV mueve 12–33 inicios por semana. La caída de
  W32 (82%, n=17) a W33 (58%, n=33) por sí sola no es concluyente
  estadísticamente; el patrón se vuelve mucho más claro y sostenido en W34–W35
  (19% y 14%, n=21 ambas), que es lo que activó el umbral HALT del registro de
  umbrales. El diagnóstico no descarta que parte de la variación semanal sea
  ruido de muestra pequeña combinado con un cambio de conducta de usuarios
  (por ejemplo, una fuente de tráfico distinta que llega con menor intención
  de completar) que este plan no tenía instrumentos para medir.
- **El defecto sitewide de `type="number"` + placeholder con separador de
  miles** es real y afecta potencialmente a toda persona que copie el formato
  sugerido en cualquiera de las 19 calculadoras que lo comparten. No explica
  el patrón específico de APV, pero es un hallazgo de producto independiente
  que vale la pena resolver en un plan propio (fuera de alcance aquí).

### Siguiente instrumento de diagnóstico recomendado

Dado que no se pudo reproducir el fallo y que `calculator_error` no existe,
se recomienda un plan de seguimiento (no ejecutado aquí) que añada
observabilidad **antes** de intentar cualquier arreglo:

1. Emitir un evento `calculator_error` real desde los bloques `catch` de
   cálculo (ya existentes) y desde un `try/catch` nuevo que envuelva el
   bloque de renderizado de resultado (líneas 742–991 de `apv.astro`), de
   forma que un fallo real en producción deje rastro distinguible del
   abandono voluntario. Este cambio se puede generalizar al resto de
   calculadoras, no solo APV.
2. Considerar un evento de progreso por paso del formulario (o al menos un
   evento en el momento del click de "Calcular", antes del cálculo) para
   poder distinguir "abandonó antes de intentar calcular" de "intentó
   calcular y algo falló silenciosamente" — hoy `calculator_start` no
   distingue estos dos casos.
3. Mantener la observación semanal: si W36 muestra una recuperación sin
   ningún cambio de código, la hipótesis de "ruido de muestra pequeña +
   variación de fuente de tráfico" gana peso frente a un defecto de producto
   latente.

## Actualización de la recomendación del dossier 055

`docs/backlog/CALCULATOR-CONSOLIDATION-2026-08-02.md` recomendó **MANTENER**
APV (no consolidar) basándose en su ascenso en W32 (37 views / 17 starts / 14
completes, 82% complete/start, "ascenso real: completes 2→8→14" entre W30 y
W32). Esa evidencia ya no representa el estado actual: W33–W35 muestran un
colapso a 58%, 19% y 14% respectivamente, dos semanas consecutivas (W34, W35)
por debajo del piso de HALT de 50% definido en
`docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md` para la métrica
"Resultado / inicio".

Esta actualización **no revierte** la recomendación de mantener APV — este
diagnóstico no encontró un defecto de producto que justifique consolidar o
retirar la calculadora — pero sí anula el argumento específico ("ascenso
real, completes en subida") que sostenía esa recomendación en el dossier 055.
Cualquier decisión futura de consolidación/mantención de APV debe apoyarse en
datos posteriores a W35, no en la serie W30–W32 citada en el dossier
original, y debe considerar que la métrica de completitud está actualmente en
HALT sin causa de producto identificada.

## Archivos consultados (evidencia)

- `output/operations/data-signals/analytics/2026-W{31,32,33,34,35}.json`
- `output/operations/data-signals/gsc/2026-W35-devices.json`
- `src/pages/calculadoras/apv.astro`
- `src/application/use-cases/CalculateApvComparison.ts`
- `src/utils/formatCLP.ts`
- `src/components/calculator/CalculatorField.astro`
- `src/scripts/analytics.ts`
- `src/scripts/next-best-step.ts`
- `docs/backlog/CALCULATOR-CONSOLIDATION-2026-08-02.md`
- `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md`
- Historial de `src/infrastructure/economic/economic-parameters.snapshot.json`
  entre 2026-08-08 y 2026-08-31 (commits automáticos de refresco)
