# Plan 084: Hacer decidible la ventana utility-led — regla de denominador mínimo y captura del Gate D

> **DONE — verificado el 2026-09-12 contra `13c939ed`.** Integrado en `main`
> mediante `b02f0c70`. Archivado en esta reconciliación; no volver a ejecutar
> las instrucciones históricas de abajo.
> Mínimos, suficiencia y aviso Gate D presentes y probados. Captura operativa sin datos locales posteriores a W35; INPUT_REQUIRED → WATCH del titular queda como decisión separada.
> Evidencia y pendientes vigentes: [reconciliación](../RECONCILIATION-2026-09-12.md).

> **Instrucciones para el ejecutor**: sigue este plan paso a paso. Ejecuta cada
> comando de verificación y confirma el resultado esperado antes de pasar al
> siguiente. Si ocurre cualquier cosa de "Condiciones de STOP", detente y reporta.
> Al terminar, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (córrelo primero)**:
> ```bash
> git diff --stat 08a6b5b4..HEAD -- \
>   docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md \
>   docs/backlog/UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md \
>   scripts/build-weekly-search-report.mjs
> ```
> Mismatch con los extractos de "Estado actual" = STOP.

## Status

- **State**: DONE (verificado 2026-09-12; merge `b02f0c70`)

- **Priority**: P1
- **Effort**: S–M
- **Risk**: LOW (documentación de gobernanza + una columna derivada en el reporte; sin cambios de producto, rutas ni contenido)
- **Depends on**: ninguno (independiente del 083; ambos pueden ir en paralelo)
- **Category**: direction (calidad de la decisión)
- **Planned at**: commit `08a6b5b4`, 2026-09-04

## Por qué importa

El 2026-11-02 se reevalúa la ventana utility-led y se decide si construir alertas,
ampliar CTA y mantener el apoyo voluntario. El registro de umbrales
(`docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md`) fija porcentajes GREEN/
WATCH/HALT y una regla de tiempo ("no se decide con menos de dos semanas
comparables o con integridad <95%"), pero **no fija un denominador mínimo**. Con
los volúmenes reales eso vuelve dos de los tres gates indecidibles, y el gate de
alertas es el que dispara trabajo irreversible.

Aritmética sobre los exports reales W31–W35
(`output/operations/data-signals/analytics/`), tomando P(0 clics) = (1−p)^n:

| Señal | Observado | Umbral del registry | P(0) si el umbral fuese cierto | Lectura |
|---|---|---|---|---|
| `next_step_click` (panel post-resultado) | 0 de 108 | HALT si <3% | **0,037** | Con poder suficiente: el hallazgo es real |
| `alert_interest_submit` | 0 de 79 | GREEN si ≥2% | **0,203** | **Indecidible** — 1 de cada 5 veces daría 0 aun siendo GREEN |
| `support_click` | 0 de 62 | GREEN si ≥0,5% | **0,733** | **Sin contenido informativo** |

Para descartar el umbral con 95% de confianza harían falta n≈149 impresiones de
alerta y n≈598 de apoyo; hoy se acumulan ~16 y ~12 por semana.

El riesgo concreto: en noviembre el operador lee "0% de interés en alertas → no
construir alertas" y cierra una línea de producto sobre una prueba que tenía una
probabilidad de 20% de dar cero **aunque la tasa real fuera la de GREEN**. La
tabla de `docs/backlog/UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md` convierte ese
número directamente en un desbloqueo o no ("≥2% en 2 semanas comparables").

Este plan no cambia los umbrales ni decide nada: **hace explícito cuándo hay
derecho a decidir**, y enciende la captura del Gate D (sostenibilidad), que hoy
está entera en `null` pese a ser el gate de continuidad declarado del proyecto.

## Estado actual

### Extracto 1 — `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md:6-15`

```markdown
| Señal | Denominador | GREEN | WATCH | HALT de expansión |
|---|---|---:|---:|---:|
| Resultado / inicio | `calculator_start` | ≥70% | 50–69,9% | <50% por 2 semanas comparables |
| Error / inicio | `calculator_start` | <5% | 5–10% | >10% |
| Siguiente paso / mostrado | `next_step_shown` | ≥8% señal inicial; ≥10% fuerte | 3–7,9% | <3%: no ampliar CTA |
| Interés aviso / mostrado | `alert_interest_shown` | ≥2% | 1–1,9% | <1%: no construir alertas |
| Apoyo click / mostrado | `support_shown` | ≥0,5% | 0,1–0,49% | nunca condiciona continuidad |
| Apoyo confirmado / completitud | `calculator_complete` | ≥0,1% | señal insuficiente | retirar tras 2.000 completitudes sin confirmación |

No se decide con menos de dos semanas comparables o con integridad <95%. `support_confirmed` permanece sin datos hasta una confirmación fiable. No se interpreta click como aporte ni UTM como retorno individual. El experimento de apoyo también se retira si `calculator_complete / calculator_start` cae más de 5 puntos porcentuales respecto del baseline comparable.
```

Nótese: hay piso de **tiempo** e **integridad**, no de **denominador**.

### Extracto 2 — `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md:17-24` (Gate D)

```markdown
## Gate de sostenibilidad semanal

- Horas: ≤6 GREEN; 6–10 WATCH; >10 durante tres semanas detiene expansión y obliga a reducir alcance.
- Costos directos: ≤$25.000 CLP/mes GREEN; sobre ese nivel requiere decisión explícita de presupuesto.
- Agotamiento (autoevaluación 1–5): 1–2 GREEN; 3 WATCH; 4–5 durante dos semanas detiene expansión.
- Calidad: cero incidentes críticos; un incidente crítico pone el estado en HALT hasta corregirlo.
- Aprendizaje/crecimiento: al menos una señal verificable mensual.
- Reputación: evidencia cualitativa permitida (menciones, feedback profesional, uso demostrable), sin inventar equivalencia monetaria.
```

### Extracto 3 — el artefacto que debería alimentar el Gate D, hoy vacío

`output/operations/weekly-search-performance/2026-W35/utility-led-ops.json`
(generado hoy, 2026-09-04):

```json
{
  "schemaVersion": 1,
  "week": "2026-W35",
  "weeklyHours": null,
  "weeklyCostClp": null,
  "tokenUsage": null,
  "burnoutLevel1To5": null,
  "qualityIncidents": [],
  "learningSignal": null,
  "reputationSignal": null,
  "maintenanceTasks": [],
  "blockers": [],
  "revenueClpOptional": null,
  "note": "Ingresos cero no son fallo; la sostenibilidad es el gate de continuidad."
}
```

Todos los campos que gobiernan la continuidad están en `null`. El generador ya lee
este archivo (`scripts/build-weekly-search-report.mjs:1390` y siguientes) y ya
agrega las señales por slug y en total (`scripts/build-weekly-search-report.mjs:855-925`).

### Convenciones del repo

- Español neutral en toda la documentación (sin voseo).
- `scripts/*.mjs` son ES modules de Node sin dependencias externas; sigue el estilo
  del archivo (funciones puras arriba, composición abajo, comentarios en español).
- Los documentos de `docs/operations/` pasan por `pnpm run check:docs`
  (`scripts/check-docs-structure.mjs`): si agregas un archivo nuevo puede exigir
  una entrada en su allowlist. Prefiere **editar** los documentos existentes.

## Comandos que vas a necesitar

| Propósito | Comando | Procedencia | Esperado |
|---|---|---|---|
| Instalar | `pnpm install --frozen-lockfile` | declared | exit 0 |
| Tests | `pnpm run test` | declared | todos pasan |
| Lint | `pnpm run lint` | declared | exit 0 |
| Formato | `pnpm run format:check` | declared | exit 0 |
| Estructura de docs | `pnpm run check:docs` | declared | exit 0 |
| Espejo de CI | `pnpm run check:ci` | declared | exit 0 |

Ninguno fue ejecutado durante la auditoría. Fallo en checkout limpio = STOP (Paso 0).

## Alcance

**En alcance**:
- `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md`
- `docs/backlog/UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md`
- `scripts/build-weekly-search-report.mjs`
- `tests/` — tests del cálculo nuevo

**Fuera de alcance** (NO tocar):
- Los **valores** de los umbrales GREEN/WATCH/HALT — este plan agrega una condición
  de suficiencia, no re-negocia los porcentajes. Cambiarlos es decisión del operador.
- `src/**` y `workers/**` — ningún cambio de producto ni de contrato de eventos.
- Los archivos `output/operations/**` ya generados — son artefactos, no fuentes.
  No edites a mano un scorecard pasado.
- `docs/backlog/PLAN-utility-led-validation-2026-08-02.md` — es el registro
  histórico del plan; no lo reescribas.

## Flujo git

- Rama: `advisor/084-utility-led-decision-readiness`
- Conventional commits (ejemplo real del repo:
  `docs(ops): record 2026-09-04 self-hosted runner bridge retirement (#452)`).
- **No push ni PR** salvo instrucción del operador.

## Pasos

### Paso 0: baseline verde

Ejecuta `Instalar` y luego cada comando de la tabla sobre el checkout sin modificar.
Todos deben pasar. Si un comando `declared` no existe o falla: **STOP y reporta**.

### Paso 1: añadir la regla de denominador mínimo al registry

En `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md`, inmediatamente **después**
del párrafo que empieza "No se decide con menos de dos semanas comparables"
(extracto 1), agrega una subsección corta con:

1. La regla: **ninguna señal se declara GREEN, WATCH o HALT si su denominador
   acumulado en la ventana comparable no alcanza el mínimo** que permita descartar
   el umbral con 95% de confianza.
2. La fórmula, para que sea reproducible sin este plan:
   `n_min = ceil( ln(0,05) / ln(1 − p_umbral) )`, donde `p_umbral` es el umbral
   GREEN de la fila.
3. La tabla de mínimos ya calculados:

   | Señal | Umbral de referencia | `n_min` | Denominador acumulado W31–W35 |
   |---|---:|---:|---:|
   | Siguiente paso / mostrado | 3% (HALT) | 99 | 108 — **suficiente** |
   | Interés aviso / mostrado | 2% (GREEN) | 149 | 79 — insuficiente |
   | Apoyo click / mostrado | 0,5% (GREEN) | 598 | 62 — insuficiente |

4. La consecuencia explícita, en una frase: **denominador insuficiente se reporta
   como `SIN DATOS SUFICIENTES`, nunca como HALT ni como 0%.** Un cero con
   denominador chico no es evidencia de ausencia de demanda.

Redacta en español neutral y no cambies ningún porcentaje existente.

**Verifica**:
```bash
pnpm run check:docs && grep -n "SIN DATOS SUFICIENTES" docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md
```
→ exit 0 y al menos una coincidencia.

### Paso 2: alinear la tabla de backlog bloqueado

En `docs/backlog/UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md`, la fila
"Alertas reales, email o newsletter" dice hoy:

```
| Alertas reales, email o newsletter | señal `alert_interest_submit / alert_interest_shown` | ≥2% en 2 semanas comparables + privacidad/costo | Carlos | 2026-11-02 |
```

Modifica **solo la celda de métrica/umbral** para que exija además el denominador
mínimo, por ejemplo: `≥2% en 2 semanas comparables con n ≥ 149 impresiones
acumuladas + privacidad/costo`. Haz lo propio con la fila de apoyo si existe una
equivalente con umbral porcentual.

No agregues, quites ni reordenes filas.

**Verifica**:
```bash
grep -n "149" docs/backlog/UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md
```
→ al menos una coincidencia.

### Paso 3: publicar el denominador y la suficiencia en el scorecard semanal

El **agregado** ya existe (`totals`, líneas ~855-925) — no lo toques. Lo que debes
modificar es el **render**, que está en otra parte del archivo:

- La sección de markdown se abre en la línea **1224**:
  `parts.push("### Experimentos utility-led\n");`
- Las razones se formatean justo debajo, con `safeRate(...)`, en las líneas
  **1247-1256** (y otra vez en **1287** para el resumen). Ahí se emiten hoy
  `nextStepShown`, `alertInterestShown`, `alertInterestSubmits`, `supportShown` y
  sus razones.

Localízalas con:

```bash
grep -n "Experimentos utility-led" scripts/build-weekly-search-report.mjs
grep -n "safeRate(a.alertInterestSubmits, a.alertInterestShown)" scripts/build-weekly-search-report.mjs
```

En **ese** punto de render, añade para cada señal con umbral porcentual:

- el **denominador** usado (no solo la razón),
- el `n_min` correspondiente,
- una etiqueta de suficiencia: `SUFICIENTE` o `SIN DATOS SUFICIENTES`.

Implementa el mínimo como función pura y exportable, para poder testearla:

```js
export function minimumDenominator(thresholdRate) {
  if (!(thresholdRate > 0 && thresholdRate < 1)) return null;
  return Math.ceil(Math.log(0.05) / Math.log(1 - thresholdRate));
}
```

Mantén el estilo del archivo y **no cambies** las razones ya publicadas: esto
agrega columnas/campos, no reemplaza los existentes.

**Verifica**:
```bash
pnpm run lint && pnpm run format:check
```
→ ambos exit 0.

### Paso 4: encender la captura del Gate D

El generador ya lee `utility-led-ops.json` (`readUtilityOps`, línea **1389**; se
invoca en la **2140**) y ya tiene una sección de render titulada
`## Utility-led operating gate` en la línea **2059**. Localízalas con:

```bash
grep -n "readUtilityOps\|Utility-led operating gate" scripts/build-weekly-search-report.mjs
```

El problema es que **nadie llena el archivo** y el reporte no lo hace notar. Haz que
el scorecard, cuando los campos que gobiernan la continuidad (`weeklyHours`,
`weeklyCostClp`, `burnoutLevel1To5`) vengan en `null`, imprima una línea inequívoca
del tipo
`Gate D: SIN REGISTRO — la sostenibilidad no se evaluó esta semana`, en vez de
omitir la sección en silencio.

Además, documenta en `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md` (bajo el
Gate de sostenibilidad, extracto 2) **dónde** se registran esos números —
la ruta `output/operations/weekly-search-performance/<semana>/utility-led-ops.json`
y qué campo corresponde a cada viñeta del gate. Hoy el vínculo entre el gate y el
archivo no está escrito en ninguna parte, que es la razón plausible de que lleve
semanas vacío.

**No inventes valores** para las semanas pasadas: dejar `null` y reportarlo es el
comportamiento correcto.

**Verifica**:
```bash
grep -n "utility-led-ops.json" docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md
```
→ al menos una coincidencia.

### Paso 5: suite completa

**Verifica**: `pnpm run check:ci` → exit 0.

## Plan de pruebas

Modélate sobre el archivo de tests que ya cubre `build-weekly-search-report.mjs`
(localízalo con `grep -rln "build-weekly-search-report" tests/`).

Casos nuevos:

1. `minimumDenominator(0.02)` → `149`.
2. `minimumDenominator(0.005)` → `598`.
3. `minimumDenominator(0.03)` → `99`.
4. Entradas inválidas (`0`, `1`, `-0.1`, `NaN`) → `null`, sin lanzar.
5. Una señal con denominador bajo el mínimo se rinde como `SIN DATOS SUFICIENTES`
   y **no** como `HALT`, aunque su razón observada sea 0%.
6. Una señal con denominador sobre el mínimo conserva su clasificación actual
   (regresión: este plan no debe cambiar veredictos ya bien fundados).
7. Gate D con los tres campos en `null` produce la línea `SIN REGISTRO`.

## Criterios de terminado

- [ ] `pnpm run test` → exit 0, con los ≥7 tests nuevos pasando
- [ ] `pnpm run check:docs` → exit 0
- [ ] `pnpm run check:ci` → exit 0
- [ ] `grep -c "SIN DATOS SUFICIENTES" docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md` → ≥1
- [ ] `grep -c "utility-led-ops.json" docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md` → ≥1
- [ ] Ningún porcentaje de umbral preexistente fue modificado:
      `git diff docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md` no muestra
      cambios en las celdas ≥70%, <5%, ≥8%, ≥2%, ≥0,5%, ≥0,1%
- [ ] `git diff --name-only main...HEAD` lista solo archivos en alcance
- [ ] Fila de este plan actualizada en `plans/README.md`

## Condiciones de STOP

- Los extractos de "Estado actual" no calzan con el código/documento vivo (drift).
- Un comando `declared` falla en el checkout sin modificar (Paso 0).
- Concluyes que para publicar la suficiencia hay que **cambiar** una razón ya
  publicada o un umbral: no lo hagas, reporta.
- Encuentras que ya existe una regla de denominador mínimo en otro documento de
  gobernanza: entonces esto es una duplicación — reporta antes de escribir.
- Te ves tentado a rellenar `utility-led-ops.json` de semanas pasadas con
  estimaciones: **prohibido**. Reporta y detente.

## Notas de mantenimiento

- **Qué debe mirar un revisor**: que ningún umbral haya cambiado de valor y que la
  etiqueta `SIN DATOS SUFICIENTES` no se pueda confundir con `HALT` en el render —
  el objetivo entero del plan es que esos dos estados nunca se lean igual.
- **Interacción con el plan 083**: cuando 083 haga emitir impresiones a
  `NextSteps.astro`, los denominadores de siguiente paso subirán mucho y la
  etiqueta de suficiencia cambiará sola. Es lo esperado; la serie no es comparable
  hacia atrás del corte.
- **Diferido**: no se ajusta la ventana de reevaluación del 2026-11-02. Si al
  acercarse la fecha los denominadores de alerta y apoyo siguen bajo el mínimo, la
  decisión correcta es *extender la medición o cambiar la entrega* (plan 085), no
  declarar HALT — pero esa es una decisión del operador, no de un ejecutor.

## Registro histórico de ejecución y revisión

Revisión registrada en el índice antes de la reconciliación. Sus menciones de
merge/push pendiente y de W36 como futuro quedan superadas por la nota de cierre
anterior; se conservan para trazabilidad, no como trabajo activo.

EJECUTADO Y APROBADO EN REVISIÓN (2026-09-04, vía `/improve execute 084`) — worktree `agent-a26957221acbfcbe2`, rama `advisor/084-utility-led-decision-readiness`, dos commits (`e7aa0845`, `9c7d0609`). **Revisión (tech lead) APROBADA** — reverificada de forma independiente en el worktree: `pnpm run test` 1406/1406, `check:docs`/`lint`/`format:check`/`check:ci` exit 0, y `--init` (ruta usada por `weekly-search-ops.yml`) probado aparte con exit 0 sin tocar el template de `utility-led-ops.json`. Scope limpio: exactamente los 4 archivos declarados (`UTILITY_LED_EXPERIMENT_REGISTRY.md`, `UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md`, `build-weekly-search-report.mjs`, `tests/scripts/utility-led-sufficiency.test.ts`), 0 líneas eliminadas en el registry — ningún umbral GREEN/WATCH/HALT preexistente se tocó. `minimumDenominator`/`sufficiencyLabel` exportadas y testeadas (149/598/99, entradas inválidas → `null`, regresión de clasificación conservada). **Autocorrección del ejecutor durante la ejecución**: detectó y arregló un bug propio (línea en blanco que partía la lista markdown del Gate D en dos cuando el gate SÍ está lleno) con test de regresión que discrimina el bug (commit `9c7d0609`). **Corrección de premisa del plan, aprobada en mérito**: el Paso 4 asumía que el estado `INPUT_REQUIRED` del Gate D se omitía en silencio; verificado que ya se imprimía (línea 2063 pre-cambio) — el ejecutor ajustó el paso a "aclarar la redacción", no "arreglar una omisión", y así lo documentó. **Ambigüedad del plan, no del ejecutor**: el Paso 3 no especificaba si la suficiencia va a nivel de totales, por calculadora, o ambos — el ejecutor implementó ambos niveles, consistente con el ejemplo trabajado del propio plan y con la instrucción literal "agrega columnas". **Hallazgo nuevo, verificado, NO corregido (fuera de alcance de 084 por diseño)**: `scripts/build-weekly-search-report.mjs:1839-1846` — el `utilityStatus` de titular colapsa `utilityOps.status === "INPUT_REQUIRED"` al mismo `WATCH` que un error rate real >10%, exactamente la confusión que el propio plan 084 previene para las señales individuales pero no para el veredicto de titular. Verificado leyendo el código: reclasificarlo cambiaría un veredicto ya publicado, por lo que corregirlo requiere una decisión del operador, no un ajuste de ejecutor. **Candidato a plan futuro, sin número reservado** (no escrito aún — a pedido del operador). Merge/push pendiente de decisión del operador.
