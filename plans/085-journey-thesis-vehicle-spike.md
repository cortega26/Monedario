# Plan 085: Spike de dirección — qué vehículo y qué superficie pueden probar la tesis del recorrido antes del 2026-11-02

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
