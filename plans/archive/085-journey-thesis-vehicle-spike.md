# Plan 085: Spike de dirección — qué vehículo y qué superficie pueden probar la tesis del recorrido antes del 2026-11-02

> **DONE — verificado el 2026-09-12 contra `13c939ed`.** Integrado en `main`
> mediante `2935878f`. Archivado en esta reconciliación; no volver a ejecutar
> las instrucciones históricas de abajo.
> Dossier y correcciones integrados; spike terminado. Opciones de producto pendientes de decisión. Proyecciones con corte W35/2026-09-04. Los ~54 son exposiciones aproximadas, no personas únicas medidas.
> Evidencia y pendientes vigentes: [reconciliación](../RECONCILIATION-2026-09-12.md).

> **Instrucciones para el ejecutor**: este es un **spike de dirección read-only**.
> Produce **un documento de análisis** y se detiene en una compuerta de decisión
> humana. **NO toca código de producto, rutas, contenido ni contratos.** Ejecuta
> cada verificación y respeta las condiciones de STOP. Al terminar, actualiza la
> fila de este plan en `plans/README.md`.
>
> **Drift check (córrelo primero)**:
> ```bash
> git diff --stat 08a6b5b4..HEAD -- \
>   src/components/UtmPostResultActions.astro \
>   src/components/NextSteps.astro \
>   src/scripts/next-best-step.ts \
>   src/pages/calculadoras/conversor-utm.astro
> ls output/operations/data-signals/analytics/
> ```
> Si los extractos citados cambiaron, revalida antes de escribir. Si existe un
> export **posterior** a `2026-W35`, úsalo y dilo en el documento.

## Status

- **State**: DONE (verificado 2026-09-12; merge `2935878f`)

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW (documental; ningún cambio ejecutable)
- **Depends on**: ninguno para ejecutarse. Sus recomendaciones **suponen** que el plan 083 aterrice antes de medir de nuevo.
- **Category**: direction
- **Planned at**: commit `08a6b5b4`, 2026-09-04
- **Actualiza**: el encuadre reconciliado del plan `046` ("evaluar lo construido, no diseñar desde cero") y el hallazgo de `055` sobre APV

## Por qué importa

La tesis del proyecto —`consulta → respuesta → herramienta → siguiente decisión →
confianza y retorno`— se está probando en la superficie donde es **menos**
probable que se manifieste, con el vehículo que **peor** entrega.

Dos hechos medidos, ambos verificados contra los exports reales W33–W35:

**1. El vehículo importa más que el copy.** Tres superficies de "siguiente paso"
coexisten con rendimientos muy distintos:

| Vehículo | Dónde | Entrega (impresiones / completitudes) | CTR donde se entrega |
|---|---|---|---|
| Tarjeta dinámica en flujo (`src/scripts/next-best-step.ts`) | impuesto-2ª, APV | 140–630% (se ve ~siempre) | 2,6% – 18,8% |
| Panel post-resultado (`UtmPostResultActions.astro`) | solo conversor-utm | **6,7% – 12,9%** | **0% (0 de 108)** |
| `NextSteps.astro` estático | 10+ calculadoras | **no emite impresiones** | no computable |

El panel post-resultado está en `src/pages/calculadoras/conversor-utm.astro:340`,
mientras el bloque de resultado está en la línea 203 — unas 137 líneas de marcado
más arriba, con otra `<section>` intermedia en la 266. Su `IntersectionObserver`
usa `threshold: 0.25`, así que solo cuenta cuando la persona hace scroll hasta él.
Conclusión razonable: el 0 de 108 no dice "la gente no quiere un siguiente paso",
dice "este vehículo casi no se ve, y quien lo ve ya resolvió lo suyo".

**2. La superficie importa.** La concentración del tráfico es extrema y está en
consultas de respuesta única:

- GSC 2026-W35: 773 clics totales; `/calculadoras/conversor-utm/` se lleva **571
  (74%)** con 121.300 de 150.899 impresiones (**80%**) y CTR 0,47% en posición 7,8.
- First-party W35: conversor-utm + conversor-uf = ~70% de las vistas, con **99% y
  99% de completitud** — son conversores de un dato, se completan y se abandonan.
- El tramo medio se comporta al revés: `prepago-credito` CTR 8,6% (pos 5,7),
  `operacion-renta` 7,3% (pos 6,6), `impuesto-segunda-categoria` 1,79% con el mejor
  CTR de siguiente paso del sitio.

La pregunta de dirección, entonces, no es "¿qué copy ponemos en el panel?" sino
**¿la tesis del recorrido es siquiera comprobable sobre tráfico de conversor, o el
experimento debe mudarse al tramo medio?** Quedan ~8 semanas de ventana y el plan
082 dejó explícitamente diferida la ampliación del patrón post-resultado "hasta que
2 semanas comparables crucen los umbrales" — umbrales que, con la entrega actual,
pueden no cruzarse nunca por razones de vehículo y no de demanda.

## Estado actual

### Archivos y datos que debes leer (todos existen hoy)

- `src/components/UtmPostResultActions.astro` (184 líneas) — el panel; `BASE` en
  líneas 78-82, `IntersectionObserver` en 101-135, dos anclas `data-next-step-id`
  ("convert-uf" en línea 19, "adjust-inflation" en línea 31).
- `src/pages/calculadoras/conversor-utm.astro` — resultado en línea 203,
  `<UtmPostResultActions />` en línea 340, `calculator:result` despachado en 433.
- `src/scripts/next-best-step.ts` — tarjeta dinámica; emite `next_step_shown` y
  `next_step_click` con `calculator_id` (líneas 59-63) tomando el slug de
  `section.dataset.calculatorSlug` (línea 103).
- `src/components/NextSteps.astro` — 108 líneas, **sin `<script>`**.
- `output/operations/data-signals/analytics/2026-W3{1,2,3,4,5}.json` — exports
  first-party. Forma: `{source, schemaVersion, week, window, data:[{date,
  event_name, dimensions, count, calculator_id}]}`.
- `output/operations/data-signals/gsc/2026-W35-pages.json` — demanda por URL.
- `output/operations/weekly-search-performance/2026-W35/weekly-search-scorecard.md`
  — la síntesis que el repo ya genera; **no la contradigas sin decirlo**.
- `docs/backlog/CALCULATOR-CONSOLIDATION-2026-08-02.md` — dossier del spike 055,
  cuya recomendación sobre APV se apoyaba en datos de W32.
- `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md` — umbrales vigentes.
- `docs/backlog/UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md` — qué está bloqueado y
  por qué evidencia.

### Restricciones de gobernanza que el documento debe honrar

Inlineadas porque el ejecutor no ha leído esos documentos:

- **Freeze de URLs vigente hasta 2026-11-02**: no se proponen URLs, clusters,
  artículos, glosario, leyes ni calculadoras nuevas. Cualquier adición exige
  "excepción fechada y aprobada" (`UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md`).
- **`ROUTES.NO_SILENT_CHANGES` y `RSS.NO_REMOVALS`**: ninguna recomendación puede
  implicar cambiar un slug público sin snapshot de rutas/RSS y un ADR.
- **No tocar títulos ni descripciones SEO de superficies en medición** — decisión
  registrada tras revertir los títulos live UF/UTM: cualquier cambio de `<title>`
  en conversor-uf/utm contamina el baseline de CTR.
- **A2**: los eventos representan acciones agregadas, nunca personas ni cohortes.
  No propongas identificación persistente, cuentas ni medición de retorno individual.
- **Sin monetización ni afiliación** dentro de la ventana.
- Español neutral, sin voseo.

## Comandos que vas a necesitar

| Propósito | Comando | Procedencia | Esperado |
|---|---|---|---|
| Instalar | `pnpm install --frozen-lockfile` | declared | exit 0 |
| Estructura de docs | `pnpm run check:docs` | declared | exit 0 |
| Formato | `pnpm run format:check` | declared | exit 0 |

Este spike **no** necesita build ni tests: no toca código.

## Alcance

**En alcance** (único archivo que creas):
- `docs/backlog/JOURNEY-THESIS-VEHICLE-2026-09-04.md`

Si `pnpm run check:docs` exige registrar el archivo nuevo en una allowlist
(`scripts/check-docs-structure.mjs`) o `.gitignore` lo excluye, puedes hacer ese
ajuste mínimo — declaralo como desviación en tu reporte.

**Fuera de alcance** (NO tocar):
- Todo `src/`, `workers/`, `scripts/`, `public/` — este spike no cambia producto.
- `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md` — lo toca el plan 084.
- Los planes 046 y 055 y sus dossiers — **los referencias y actualizas su lectura
  dentro de tu documento**, pero no editas sus archivos.
- Cualquier artefacto ya generado bajo `output/`.

## Flujo git

- Rama: `advisor/085-journey-thesis-vehicle-spike`
- Un solo commit, estilo `docs(reports): ...` o `docs(backlog): ...` según dónde
  aterrice el archivo. Ejemplo real del repo:
  `docs(ops): record 2026-09-04 self-hosted runner bridge retirement (#452)`
- **No push ni PR** salvo instrucción del operador.

## Pasos

### Paso 0: baseline

`pnpm install --frozen-lockfile`, luego `pnpm run check:docs` sobre el checkout sin
modificar → exit 0. Si falla, **STOP y reporta**.

### Paso 1: reconstruir la tabla de vehículos con datos, no con memoria

Recalcula por tu cuenta, desde los JSON de `output/operations/data-signals/analytics/`,
para W31–W35 y por `calculator_id`: `calculator_view`, `calculator_start`,
`calculator_complete`, `next_step_shown`, `next_step_click`, `alert_interest_shown`,
`alert_interest_submit`, `support_shown`, `support_click`.

Reporta explícitamente:
- entrega = `next_step_shown / calculator_complete` por calculadora y semana;
- CTR = `next_step_click / next_step_shown` donde el denominador sea > 0;
- cuántos `next_step_click` caen en los buckets `calculator` y `unknown`
  (sin identidad real).

**Verifica**: tu tabla reproduce estas cifras de control; si alguna difiere en más
de ±1, revisa tu agregación antes de seguir:

| Semana | conversor-utm `next_step_shown` | conversor-utm `next_step_click` | impuesto-2ª `next_step_shown` |
|---|---:|---:|---:|
| 2026-W33 | 26 | 0 | 48 |
| 2026-W34 | 52 | 0 | 39 |
| 2026-W35 | 30 | 0 | 44 |

### Paso 2: contrastar con la demanda

Desde `output/operations/data-signals/gsc/2026-W35-pages.json`, arma el ranking de
URLs por clics e impresiones y su CTR/posición. Cruza con la actividad first-party
del Paso 1.

Responde con datos, no con intuición: **¿en qué URLs coinciden demanda suficiente,
CTR razonable y una decisión real que tomar después del resultado?** Esa
intersección es la superficie candidata para el experimento.

**Verifica**: la cifra de control es que `/calculadoras/conversor-utm/` concentra
571 de 773 clics (74%) y 121.300 de 150.899 impresiones (80%) en W35.

### Paso 3: escribir el documento con opciones y trade-offs

Crea `docs/backlog/JOURNEY-THESIS-VEHICLE-2026-09-04.md` con estas secciones:

1. **Resumen ejecutivo** (≤10 líneas): qué se midió, qué muestra, qué decisión pide.
2. **Evidencia** — las tablas de los pasos 1 y 2, con la ruta del archivo de origen
   de cada número.
3. **Diagnóstico separado en dos capas**, sin mezclarlas:
   - *vehículo* (entrega): cuánta gente ve cada superficie;
   - *demanda* (CTR donde sí se ve): cuánta gente actúa cuando la ve.
   Di explícitamente cuál de las dos explica mejor el 0 de 108, y qué evidencia
   te haría cambiar de opinión.
4. **Opciones**, mínimo tres, cada una con costo, riesgo, reversibilidad y qué
   mediría. Deben caber **dentro del freeze de URLs**. Por ejemplo, y sin que esta
   lista te limite: (A) subir el panel post-resultado junto al bloque de resultado
   en conversor-utm; (B) llevar el vehículo que sí funciona —la tarjeta en flujo—
   a las calculadoras del tramo medio; (C) mantener la entrega y extender la
   ventana de medición; (D) declarar la tesis no comprobable sobre tráfico de
   conversor y re-enfocar en el tramo medio.
   Para cada una: **cuántas impresiones semanales produciría** y si eso alcanza los
   mínimos de denominador (n≈149 para alertas, n≈598 para apoyo).
5. **Actualización explícita de dos recomendaciones previas**:
   - el encuadre del plan 046 ("evaluar lo construido"): tu evidencia **es** esa
     evaluación — dilo y deja 046 listo para cerrarse o reorientarse;
   - el hallazgo de APV del dossier 055 (recomendaba MANTENER con datos de W32):
     con W34/W35 la completitud de APV cayó a 19% y 14%. **No concluyas la causa**
     — eso es el plan 086 — pero deja constancia de que la premisa cambió.
6. **Compuerta de decisión del operador**: 4 a 6 preguntas cerradas, cada una con
   tu recomendación y el dato que la sustenta. El documento **termina aquí**: no
   implementa nada.
7. **Lo que este spike NO afirma**: lista honesta de los límites (denominadores
   chicos, una sola superficie instrumentada correctamente, sin datos de scroll).

**Verifica**:
```bash
pnpm run check:docs && pnpm run format:check
```
→ ambos exit 0, y el archivo existe.

## Criterios de terminado

- [ ] `docs/backlog/JOURNEY-THESIS-VEHICLE-2026-09-04.md` existe y tiene las 7 secciones
- [ ] `pnpm run check:docs` → exit 0
- [ ] `pnpm run format:check` → exit 0
- [ ] `git diff --name-only main...HEAD` lista **solo** el documento nuevo (más, si
      aplica, el ajuste mínimo de allowlist declarado como desviación)
- [ ] `git diff --name-only main...HEAD -- src/ workers/ scripts/ public/` → **vacío**
- [ ] Cada número del documento cita el archivo del que sale
- [ ] Fila de este plan actualizada en `plans/README.md`

## Condiciones de STOP

- Las cifras de control del Paso 1 o del Paso 2 no se reproducen: tu agregación o
  los datos cambiaron; reporta antes de escribir conclusiones.
- Concluyes que la recomendación correcta exige **crear o cambiar una URL pública**:
  eso choca con el freeze vigente — repórtalo como opción bloqueada que necesita
  excepción aprobada, no lo propongas como camino ejecutable.
- Te ves tentado a cambiar código para "probar rápido" una hipótesis: **prohibido**
  en este plan.
- Encuentras que el panel post-resultado **sí** se renderiza junto al resultado (es
  decir, la premisa de ubicación es falsa): entonces la explicación de entrega cae
  y debes reportarlo en vez de construir el documento sobre ella.
- Aparece un export posterior a `2026-W35` que contradice la dirección de los datos
  (por ejemplo, `next_step_click` > 0 en conversor-utm): reporta y no fuerces la
  narrativa.

## Notas de mantenimiento

- **Qué debe mirar un revisor**: que el documento separe con rigor *entrega* de
  *demanda* — es la distinción de la que depende toda la recomendación — y que
  ninguna opción propuesta viole el freeze de URLs ni toque títulos en medición.
- **Interacción con el plan 083**: si 083 aterriza primero, las impresiones de
  `NextSteps` aparecerán y varias tablas de este documento quedarán desactualizadas
  en semanas. Anota la fecha de corte de los datos en el encabezado del documento.
- **Diferido a propósito**: este spike no decide ni implementa. La ejecución de la
  opción elegida es un plan posterior, después de la compuerta humana.

## Registro histórico de ejecución y revisión

Revisión registrada en el índice antes de la reconciliación. Sus menciones de
merge/push pendiente y de W36 como futuro quedan superadas por la nota de cierre
anterior; se conservan para trazabilidad, no como trabajo activo.

EJECUTADO Y APROBADO EN REVISIÓN (2026-09-05, vía `/improve execute 085`) — worktree `agent-ab29642198c76c51b`, rama `advisor/085-journey-thesis-vehicle-spike`, 4 commits (`a660ecc1`, `247be7e6`, `99db0341`, `65a2e02c`). Entregable `docs/backlog/JOURNEY-THESIS-VEHICLE-2026-09-04.md`. **Reconciliación previa al despacho**: el plan 083 ya había aterrizado, así que el ejecutor recibió instrucción explícita de tratar la instrumentación de `NextSteps.astro` como hecho consumado, no hipótesis — el documento lo refleja en su "Nota de reconciliación". **Autocorrección del propio ejecutor durante la ejecución (verificada, sustantiva)**: al desagregar `next_step_shown` de `conversor-utm` por `dimensions` encontró que las dos anclas del panel post-resultado disparan en lockstep exacto (W33 13/13, W34 26/26, W35 15/15) — los "0 de 108" citados en las revisiones de 083/084 son en realidad **~54 personas distintas**, no 108 eventos independientes. Recalculó P(0 clics) con el denominador correcto: 24,1% a la tasa baja demostrada (2,6%), lo que **debilita** (no descarta) la inferencia de demanda baja específica de la superficie. Esto no invalida el análisis de 084 (que usa eventos como unidad, consistente con su propia convención — A2: acciones agregadas, no personas) pero es una precisión real sobre un número que yo mismo usé sin esa distinción. **Revisión (tech lead) APROBADA tras 1 ronda de corrección**: reverificado de forma independiente — tablas de vehículos recalculadas desde los JSON crudos (coinciden exactas), probabilidades binomiales recalculadas y confirmadas, cruce de demanda GSC verificado (571/773 clics, 121.300/150.899 impresiones). **Encontré y corregí un error real durante la revisión**: la Opción C afirmaba que `alert_interest_shown` "excedía el cierre de la ventana" (9-10 semanas necesarias) — verificación independiente mostró 149/15,8=9,4 semanas **totales** desde cero, cuando la cifra correcta es (149−79)/15,8≈4,4 semanas **adicionales** desde el acumulado actual, contra ~8,4 semanas restantes de ventana: la conclusión se invertía. Enviado de vuelta al ejecutor (2 intentos por límite de sesión de la API), corregido con precisión en el commit `65a2e02c` — distingue `alert_interest_shown` (cruzaría con margen ajustado, ~4 semanas de colchón, sensible a varianza semanal 3–27) de `support_shown` (62 acumulado, ~43 semanas necesarias — claramente insuficiente, no afectado por el error). Scope limpio en ambas rondas: solo el documento + 1 línea de `.gitignore` (mismo patrón precedente que 055/086). `check:docs`/`format:check` exit 0 tras la corrección. **Compuerta humana con 6 preguntas cerradas** (Sección 6 del documento) — recomienda Opción A (subir el panel junto al resultado) como prioridad, con B condicional a que A confirme vehículo-no-demanda. Cierra 046 (SUPERSEDED, confirmado por este spike) y actualiza la cita de la recomendación MANTENER de APV (055) sin cambiar la decisión. Merge/push pendiente — a continuación.
