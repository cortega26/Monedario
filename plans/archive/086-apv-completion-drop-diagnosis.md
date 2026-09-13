# Plan 086: Diagnosticar la caída de completitud de la calculadora APV (58% → 14% en tres semanas)

> **DONE — verificado el 2026-09-12 contra `13c939ed`.** Integrado en `main`
> mediante `d412aa57`. Archivado en esta reconciliación; no volver a ejecutar
> las instrucciones históricas de abajo.
> Causa no identificada: cierre válido según el Paso 3. W36 mejora a 6/18 completitudes, sin demostrar recuperación. Instrumentación calculator_error y placeholders siguen como seguimientos.
> Evidencia y pendientes vigentes: [reconciliación](../RECONCILIATION-2026-09-12.md).

> **Instrucciones para el ejecutor**: este plan es un **diagnóstico**, no un
> arreglo. El Paso 3 es una compuerta: si el diagnóstico no identifica una causa
> con evidencia reproducible, **te detienes y reportas** en vez de "arreglar" algo
> a ciegas. Ejecuta cada verificación. Al terminar, actualiza la fila de este plan
> en `plans/README.md`.
>
> **Drift check (córrelo primero)**:
> ```bash
> git diff --stat 08a6b5b4..HEAD -- src/pages/calculadoras/apv.astro
> ls output/operations/data-signals/analytics/
> ```
> Si existe un export posterior a `2026-W35`, inclúyelo: puede confirmar o
> descartar la persistencia de la caída.

## Status

- **State**: DONE (verificado 2026-09-12; merge `d412aa57`)

- **Priority**: P2
- **Effort**: S–M
- **Risk**: LOW mientras sea diagnóstico (el plan no autoriza cambios de producto)
- **Depends on**: ninguno
- **Category**: bug (a confirmar) — potencialmente una calculadora rota
- **Planned at**: commit `08a6b5b4`, 2026-09-04

## Por qué importa

La calculadora APV (`/calculadoras/apv/`) pasó de completar la mayoría de sus
inicios a completar casi ninguno, y es la **única** calculadora del sitio con ese
patrón en la ventana. Si es un defecto, hay personas que llegan a una herramienta
de decisión previsional y no obtienen resultado.

Datos de `output/operations/data-signals/analytics/` (`calculator_complete /
calculator_start` por semana):

| Semana | APV | conversor-utm | sueldo-liquido | operacion-renta |
|---|---:|---:|---:|---:|
| 2026-W31 | 8/12 = **67%** | 675/694 = 97% | 21/23 = 91% | 8/13 = 62% |
| 2026-W32 | 14/17 = **82%** | 764/781 = 98% | 24/28 = 86% | 18/25 = 72% |
| 2026-W33 | 19/33 = **58%** | 298/304 = 98% | 32/41 = 78% | 28/32 = 88% |
| 2026-W34 | 4/21 = **19%** | 404/409 = 99% | 8/10 = 80% | 4/7 = 57% |
| 2026-W35 | 3/21 = **14%** | 445/450 = 99% | 17/18 = 94% | 14/20 = 70% |

El registro de umbrales (`docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md`) fija
para "Resultado / inicio" un HALT en "<50% por 2 semanas comparables". APV lleva
**dos semanas consecutivas bajo ese piso** (19% y 14%).

Dos hechos que acotan el diagnóstico:

- **No es una caída de tráfico**: las vistas de APV se mantienen (53 → 29 → 30) y
  los inicios también (33 → 21 → 21). La gente entra y empieza; no termina.
- **No es un error capturado**: `calculator_error` es **0** en todas las semanas y
  en todas las calculadoras. Es abandono, o un fallo que no emite evento.

Contexto que **descarta** al sospechoso obvio: `src/pages/calculadoras/apv.astro`
fue tocado por última vez el 2026-08-19 (`17fd9215`, "fix(ui): corregir negritas
pegadas"), pero el deterioro **empieza en W33 (2026-08-10)**, antes de ese commit.
No lo persigas como causa sin evidencia nueva.

Además esto actualiza una recomendación reciente: el dossier del spike 055
(`docs/backlog/CALCULATOR-CONSOLIDATION-2026-08-02.md`) recomendó **MANTENER** APV
apoyándose en su ascenso en W32 — justo antes de esta caída.

## Estado actual

### Datos y archivos

- `output/operations/data-signals/analytics/2026-W3{1,2,3,4,5}.json` — exports
  first-party. Forma de cada fila: `{date, event_name, dimensions, count, calculator_id}`.
- `src/pages/calculadoras/apv.astro` — la página; emite `calculator_start` y
  `calculator_complete`.
- `src/scripts/next-best-step.ts` — inyecta la tarjeta de siguiente paso en APV
  (APV es una de las dos páginas donde esa tarjeta sí aparece).
- `src/contracts/analytics-events.ts` — contrato de eventos; `calculator_complete`
  admite `{calculator_id, page_type, cluster, app_version}`.
- `src/scripts/analytics.ts:98-107` — **deduplicación por vista**: los eventos en
  `ONCE_PER_VIEW_EVENTS` se emiten una sola vez por vista, con clave
  `` `${eventName}:${slug}` ``. Relevante: si `calculator_complete` está en ese
  conjunto y el slug cambiara, el conteo cambiaría sin que cambie la conducta.

### Serie diaria de APV (para que reconozcas el punto de quiebre)

```
W33: 08-10 start=6 compl=2 | 08-11 6/3 | 08-12 6/4 | 08-13 5/3 | 08-14 5/3 | 08-15 2/2 | 08-16 3/2
W34: 08-17 5/2 | 08-18 5/0 | 08-19 1/0 | 08-20 8/1 | 08-21 1/1 | 08-23 1/0
W35: 08-24 4/0 | 08-25 5/2 | 08-26 3/1 | 08-27 3/0 | 08-28 4/0 | 08-29 0/0 | 08-30 2/0
```

### Commits candidatos en la ventana de inicio del deterioro (W32→W33)

Verificados como tocando código que APV usa, **ninguno confirmado como causa**:

- `050eb40b` — `feat(seo): extend glossary auto-linking to 7 calculator FAQ sections`
- `32bd56ce` — `refactor: 080 — unificar formateadores CLP en formatCLP + guard de estilo (#416)`
- `c7bf4832` — `seo(blog): seoTitle override mechanism + shorten 41 long titles (#409)`

Un cambio de formateador numérico en un formulario de varios pasos es un bloqueador
silencioso plausible (por ejemplo, un valor re-formateado que deja de parsear). Es
hipótesis, no conclusión.

### Convenciones

- Español neutral en comentarios y documentos.
- Este repo no acepta cambios de fórmula ni de parámetros normativos sin el
  pipeline editorial YMYL: **APV es contenido YMYL**. Un diagnóstico puede tocar
  UI/JS; **no** puede tocar la matemática previsional sin firma humana.

## Comandos que vas a necesitar

| Propósito | Comando | Procedencia | Esperado |
|---|---|---|---|
| Instalar | `pnpm install --frozen-lockfile` | declared | exit 0 |
| Tests | `pnpm run test` | declared | todos pasan |
| Build | `pnpm run build` | declared | exit 0 |
| Dev server | `pnpm run dev` | declared | sirve en local |
| E2E / Playwright | `pnpm exec playwright test` | declared | ver `playwright.config.ts` |
| Lint | `pnpm run lint` | declared | exit 0 |

Ninguno se ejecutó durante la auditoría.

## Alcance

**En alcance**:
- Lectura de cualquier archivo del repo.
- `docs/backlog/DIAGNOSTICO-apv-completion-2026-09-04.md` (crear) — el entregable.
- Scripts desechables de análisis, **fuera del repo** (usa un directorio temporal;
  no los commitees).

**Fuera de alcance en este plan** (NO modificar):
- `src/pages/calculadoras/apv.astro` y cualquier otro código de producto. Si
  identificas la causa, el arreglo es un plan posterior — este plan **diagnostica**.
- Toda la matemática previsional y los parámetros normativos (YMYL, requiere firma
  humana).
- `src/contracts/analytics-events.ts` — lo toca el plan 083.
- Los exports bajo `output/` — son evidencia, no se editan.

## Flujo git

- Rama: `advisor/086-apv-completion-drop-diagnosis`
- Un commit, estilo `docs(backlog): ...`.
- **No push ni PR** salvo instrucción del operador.

## Pasos

### Paso 0: baseline verde

`pnpm install --frozen-lockfile`, luego `pnpm run test` y `pnpm run build` sobre el
checkout sin modificar. Ambos deben pasar. Si algo falla: **STOP y reporta** — no
puedes distinguir un defecto de APV de un baseline roto.

### Paso 1: confirmar que la caída es real y no un artefacto de medición

Antes de buscar causas en el producto, descarta que sea el pipeline:

1. Reproduce la serie diaria de arriba desde los JSON. Si no calza, tu agregación
   o los datos cambiaron → STOP.
2. Verifica si `calculator_complete` está en `ONCE_PER_VIEW_EVENTS`
   (`src/scripts/analytics.ts`) y si el `calculator_id` de APV cambió de valor entre
   W32 y W33 en los exports (`grep` por `"apv"` y por cualquier slug parecido).
   Un renombre de slug produciría exactamente este patrón sin ningún defecto de UI.
3. Comprueba que **ninguna otra** calculadora comparte el patrón: la razón global
   `complete/start` del sitio se mantiene entre 88% y 93% en W33–W35. Si encuentras
   que sí es global, la hipótesis "APV específico" cae → STOP y reporta.

**Verifica**: escribe en el documento la razón `complete/start` global por semana y
la de APV, lado a lado, con la ruta del archivo de cada número.

### Paso 2: reproducir el flujo de APV en local

1. `pnpm run dev` y abre `/calculadoras/apv/`.
2. Completa el formulario como lo haría una persona: valores plausibles, en el
   orden natural, **en viewport móvil** (la mayoría del tráfico del sitio es móvil;
   confírmalo en `output/operations/data-signals/gsc/2026-W35-devices.json`).
3. Observa en la consola y en la pestaña de red si se emiten `calculator_start` y
   `calculator_complete` (el transporte tiene un feature flag: si está apagado en
   local, instrumenta con un `console.log` temporal **sin commitearlo**, o usa los
   tests).
4. Prueba explícitamente los caminos que un cambio de formateador rompería:
   montos con separador de miles, montos pegados desde el portapapeles, campos
   re-editados después de un primer cálculo, y el paso donde se combinan las
   Modalidades A/B del APV.

**Verifica**: documenta, para cada intento, si se alcanzó el resultado y si se
emitió `calculator_complete`. Si **no logras reproducir ningún fallo**, dilo con
todas sus letras — es un resultado válido y lleva al Paso 3.

### Paso 3 (compuerta): decidir con lo que encontraste

- **Si reproduces un fallo determinista**: documenta el paso exacto, el input que lo
  dispara y el commit sospechoso (usa `git log -S` sobre el símbolo implicado para
  fecharlo). **No lo arregles aquí**: escribe el diagnóstico y recomienda un plan
  de corrección acotado. Este plan termina.
- **Si no reproduces nada**: documenta qué descartaste y con qué evidencia, y
  propón el siguiente instrumento de diagnóstico (por ejemplo, emitir
  `calculator_error` donde hoy no se emite, o un evento de progreso por paso del
  formulario). **STOP y reporta** — no cambies producto por intuición.

### Paso 4: escribir el diagnóstico

Crea `docs/backlog/DIAGNOSTICO-apv-completion-2026-09-04.md` con: resumen, la
evidencia cuantitativa del Paso 1, el protocolo y resultados del Paso 2, la causa
identificada o la lista de causas descartadas, la recomendación, y una nota que
actualice la recomendación "MANTENER APV" del dossier 055 con esta evidencia nueva.

**Verifica**: `pnpm run check:docs` → exit 0.

## Criterios de terminado

- [ ] `docs/backlog/DIAGNOSTICO-apv-completion-2026-09-04.md` existe
- [ ] La serie diaria de APV del plan está reproducida y coincide (o la discrepancia
      está explicada)
- [ ] El documento dice explícitamente **causa identificada** o **causa no
      identificada**, sin ambigüedad
- [ ] `pnpm run check:docs` → exit 0
- [ ] `git diff --name-only main...HEAD -- src/ workers/ scripts/` → **vacío**
- [ ] `git status` limpio salvo el documento
- [ ] Fila de este plan actualizada en `plans/README.md`

## Condiciones de STOP

- El baseline del Paso 0 no está verde.
- La serie de datos no se reproduce.
- Descubres que la caída **es global** y no específica de APV: cambia por completo
  el marco del problema.
- Descubres que el `calculator_id` de APV cambió de valor: entonces es un artefacto
  de medición y no un defecto de producto.
- Concluyes que el arreglo exige tocar la matemática previsional o los parámetros
  normativos: es YMYL, requiere pipeline editorial y firma humana. Reporta; no lo
  toques.
- Te ves tentado a "arreglar" APV dentro de este plan: **prohibido**. El entregable
  es el diagnóstico.

## Notas de mantenimiento

- **Qué debe mirar un revisor**: que el diagnóstico distinga con evidencia entre
  *defecto de producto*, *artefacto de medición* y *cambio de conducta*. Los tres
  producen la misma curva y llevan a decisiones opuestas.
- **Denominadores chicos**: APV mueve ~21 inicios por semana. Dos semanas bajo el
  piso son suficientes para investigar, **no** para afirmar una regresión con
  confianza estadística. El documento debe decirlo.
- **Interacción futura**: si el plan 083 aterriza antes, APV empezará a emitir
  impresiones de `NextSteps` además de las de la tarjeta dinámica; no confundas ese
  cambio con movimiento en la completitud.
- **Seguimiento sugerido**: que `calculator_error` deje de ser 0 en todo el sitio
  es sospechoso por sí mismo — o ninguna calculadora falla nunca, o el evento no se
  emite. Vale como hallazgo aparte si este diagnóstico lo confirma.

## Registro histórico de ejecución y revisión

Revisión registrada en el índice antes de la reconciliación. Sus menciones de
merge/push pendiente y de W36 como futuro quedan superadas por la nota de cierre
anterior; se conservan para trazabilidad, no como trabajo activo.

EJECUTADO Y APROBADO EN REVISIÓN (2026-09-04, vía `/improve execute 086`) — worktree `agent-a93c175af00d3f961`, rama `advisor/086-apv-completion-drop-diagnosis`, commit `690ff53e`. Entregable `docs/backlog/DIAGNOSTICO-apv-completion-2026-09-04.md`. **Revisión (tech lead) APROBADA** — reverificada de forma independiente, no solo el reporte del ejecutor: tabla global-vs-APV recalculada desde los JSON crudos (coincide exacta: 94,2%/66,7% → 91,8%/14,3%), `calculator_id="apv"` confirmado constante en las 5 semanas, `calculator_error` confirmado con cero emisores en todo `src/` (grep propio), `readEconomicParameters()` confirmado fuera de cualquier try/catch en `apv.astro:648` (el try en línea 721 es del cálculo, no de esta llamada), equivalencia funcional de `formatCLP` confirmada byte a byte contra el diff real del commit `32bd56ce`, y valores UF/UTM muestreados como válidos en los commits de refresco de la ventana. **Veredicto: causa no identificada** — resultado válido según la propia compuerta del plan (Paso 3), no una ejecución fallida. Scope limpio: el documento + 1 línea de `.gitignore` (`!docs/backlog/DIAGNOSTICO-*.md`, mismo patrón que `CALCULATOR-CONSOLIDATION-*.md` — desviación aprobada en mérito, precedente idéntico al del plan 055). `check:docs` exit 0, `git diff --name-only -- src/ workers/ scripts/` vacío, sin procesos de dev server huérfanos. **El hallazgo instrumental es el resultado real de este plan**: `calculator_error` nunca se emite en ningún punto del sitio, y el bloque de renderizado de `apv.astro:742-991` (incluida la llamada sin guard de la línea 648) no tiene manejo de excepciones — un fallo real ahí dejaría `calculator_start` disparado y el botón "Calcular" inerte sin rastro distinguible del abandono, coincidiendo estructuralmente con el patrón observado pero sin evidencia que lo confirme con los datos actuales. **Candidato a plan futuro, sin número reservado** (junto con el hallazgo del `utilityStatus` de 084 — mismo número de plan candidato, dos hallazgos, no escrito aún). **Hallazgo secundario, sitewide, no causal**: `type="number"` + placeholders con puntos como separador de miles (`"Ej: 1.500.000"`) es rechazado por la validación nativa del navegador en 19 calculadoras, incluida `sueldo-liquido` (la de mejor completitud) — descarta por sí solo que sea la causa de APV, pero es un defecto de producto real e independiente. **Actualiza la recomendación del dossier 055**: MANTENER se sostiene, pero el argumento que la sostenía ("ascenso real W30→W32") ya no representa el estado actual; decisiones futuras deben usar datos posteriores a W35. **Nota de medición para W36**: `calculator_complete / calculator_start` de APV debe leerse limpio (no lo toca 083); pero `next_step_shown`/`next_step_click` de APV en W36 subirán por la instrumentación del plan 083, sin relación con esta caída — no confundir ambas señales. Commit/merge/push pendiente de instrucción del operador (alcance nuevo, no cubierto por el "haz lo que falta" del 084).
