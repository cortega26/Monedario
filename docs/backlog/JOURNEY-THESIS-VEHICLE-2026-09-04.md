# Spike de dirección: vehículo y superficie para probar la tesis del recorrido

**Plan de origen:** `plans/085-journey-thesis-vehicle-spike.md` (planeado sobre commit `08a6b5b4`, 2026-09-04).
**Corte de datos:** export first-party `2026-W35` (ventana 2026-08-24 a 2026-08-30) y GSC `2026-W35-pages.json`. **Este corte es anterior a la instrumentación del plan 083** (commit `1a761389`, ya en `main`/`HEAD` al momento de ejecutar este spike). Ver nota de reconciliación al final de esta sección.
**Tipo:** documento de análisis, read-only. No cambia código, rutas, contenido ni contratos.

## Nota de reconciliación (083 ya aterrizó)

Este spike se planeó tratando la instrumentación de `NextSteps.astro` como un
escenario futuro ("si 083 aterriza primero..."). Al momento de ejecutar el
spike, **el plan 083 ya está en el historial de la rama base**
(`git merge-base --is-ancestor 1a761389 HEAD` confirma que el commit que
instrumentó `NextSteps.astro` es ancestro del `HEAD` actual). En consecuencia:

- `src/components/NextSteps.astro` **ya no** es "108 líneas, sin `<script>`":
  hoy tiene 186 líneas e incluye un `<script>` que emite
  `next_step_shown`/`next_step_click` con identidad de calculadora.
- Todos los números de este documento sobre "NextSteps.astro no emite
  impresiones" son una lectura correcta de los exports **W31–W35**, generados
  **antes** de que 083 aterrizara. No describen el comportamiento del código
  actual — describen el comportamiento del código que estuvo en producción
  durante la ventana medida.
- No existe todavía ningún export **posterior** a 083 (el más reciente
  disponible sigue siendo `2026-W35.json`). El desempeño real del vehículo
  `NextSteps.astro` ya instrumentado se conocerá recién con el export de la
  semana en que ese cambio esté sirviendo tráfico en producción (candidato:
  `2026-W36` en adelante).
- La opción de plan equivalente a "arreglar la instrumentación de
  `NextSteps.astro`" ya no es una opción disponible: ya se ejecutó. La
  Sección 4 refleja esto.

## 1. Resumen ejecutivo

Se midió, con los nueve eventos de embudo (`calculator_view` →
`calculator_complete` → `next_step_*` → `alert_interest_*` → `support_*`)
agregados por calculadora y semana sobre los cinco exports W31–W35, y
cruzados con el ranking de demanda de GSC W35, si la tesis del recorrido
(`consulta → respuesta → herramienta → siguiente decisión → confianza y
retorno`) es comprobable sobre el tráfico donde hoy se está probando.

Hallazgo: no lo es, por dos razones independientes y verificadas por
separado. **Vehículo**: el panel post-resultado de `conversor-utm`
(`UtmPostResultActions.astro`) solo se muestra al 6,7%–12,9% de quienes
completan la calculadora (frente a 141,9%–633,3% de la tarjeta dinámica en
`apv`/`impuesto-segunda-categoria`), porque vive 137 líneas de marcado más
abajo del resultado y depende de que la persona haga scroll hasta un
`IntersectionObserver` con `threshold: 0.25`. **Demanda**: `conversor-utm`
concentra 74% de los clics y 80% de las impresiones de búsqueda del sitio,
pero es una consulta de respuesta única (completitud 99%) con el CTR
orgánico más bajo del sitio (0,47%, posición 7,8) — el patrón inverso al del
tramo medio (`prepago-credito` 8,6%, `operacion-renta` 7,3%), donde la
persona sí llega con una decisión pendiente. Las 6 preguntas de la Sección 6
piden al operador elegir entre subir la entrega en `conversor-utm`, mudar el
vehículo dinámico al tramo medio, o declarar la superficie actual no apta
para esta tesis.

## 2. Evidencia

### 2.1 Tabla de vehículos (Paso 1 del plan) — recalculada desde los JSON crudos

Fuente: `output/operations/data-signals/analytics/2026-W3{1,2,3,4,5}.json`,
agregando `count` por `calculator_id` + `event_name`. Entrega =
`next_step_shown / calculator_complete`; CTR = `next_step_click /
next_step_shown` (solo semanas con denominador > 0).

**`apv`** (vehículo: tarjeta dinámica `next-best-step.ts`, vía `NextBestStep.astro`):

| Semana | complete | shown | click | entrega | CTR |
|---|---:|---:|---:|---:|---:|
| W31 | 8 | 23 | 3 | 287,5% | 13,0% |
| W32 | 14 | 32 | 3 | 228,6% | 9,4% |
| W33 | 19 | 45 | 6 | 236,8% | 13,3% |
| W34 | 4 | 13 | 0 | 325,0% | 0,0% |
| W35 | 3 | 19 | 2 | 633,3% | 10,5% |

**`impuesto-segunda-categoria`** (mismo vehículo):

| Semana | complete | shown | click | entrega | CTR |
|---|---:|---:|---:|---:|---:|
| W31 | 13 | 21 | 2 | 161,5% | 9,5% |
| W32 | 13 | 27 | 5 | 207,7% | 18,5% |
| W33 | 26 | 48 | 9 | 184,6% | 18,8% |
| W34 | 22 | 39 | 1 | 177,3% | 2,6% |
| W35 | 31 | 44 | 3 | 141,9% | 6,8% |

**`conversor-utm`** (vehículo: panel post-resultado `UtmPostResultActions.astro`):

| Semana | complete | shown | click | entrega | CTR |
|---|---:|---:|---:|---:|---:|
| W31 | 675 | 6 | 0 | 0,9% | 0,0% |
| W32 | 764 | 61 | 0 | 8,0% | 0,0% |
| W33 | 298 | 26 | 0 | 8,7% | 0,0% |
| W34 | 404 | 52 | 0 | 12,9% | 0,0% |
| W35 | 445 | 30 | 0 | 6,7% | 0,0% |

**Verificación de control (cifras exigidas por el plan) — coinciden exactas:**

| Semana | utm `next_step_shown` | utm `next_step_click` | isc `next_step_shown` |
|---|---:|---:|---:|
| W33 | 26 | 0 | 48 |
| W34 | 52 | 0 | 39 |
| W35 | 30 | 0 | 44 |

**`NextSteps.astro` (vehículo estático, pre-083)**: en los cinco exports
W31–W35, ninguna de las calculadoras que solo usan `NextSteps.astro`
(`seguro-cesantia`, `prepago-credito`, `credito-consumo`, `boleta-honorarios-liquido`,
`reajuste-arriendo`, `dividendo-hipotecario`, `gratificacion-legal`,
`tarjeta-credito`, `actualizador-inflacion`, `conversor-uf`,
`simulador-jubilacion`, `simulador-renegociacion`) registra un solo
`next_step_shown`. Entrega no computable (denominador de eventos = 0), no
"0%" — el vehículo, en ese período, no emitía la señal. Nota: algunas páginas
que sí incluyen `NextBestStep.astro` en su marcado (`deposito-a-plazo`,
`interes-compuesto`, `comisiones-afp`) también muestran 0 en todas las
semanas — el componente está presente pero sus reglas de elegibilidad
(`src/data/nextBestStep/rules.ts`) no lo activan para esos slugs en el
período medido; esto no cambia la conclusión sobre `NextSteps.astro`, pero
matiza que "tener el componente en la página" no es lo mismo que "el
componente decide mostrarse".

### 2.2 Buckets sin identidad real de calculadora

`next_step_click` con `calculator_id` en `"calculator"` o `"unknown"` (sin
`calculator_id` real, atribuible al fallback documentado en el commit
`1a761389` para páginas de artículo/`page_type` no-calculadora):

| Bucket | Clics W31–W35 |
|---|---:|
| `calculator` | 22 |
| `unknown` | 3 |
| **Total sin identidad** | **25 de 65 (38,5%)** |

Esto es aparte del hallazgo de entrega/demanda: casi cuatro de cada diez
clics de "siguiente paso" registrados en la ventana no se pueden atribuir a
una calculadora de origen, lo que limita cualquier lectura por calculadora
de la CTR agregada (no afecta las cifras de `apv`/`impuesto-2ª`/`conversor-utm`
de arriba, que sí tienen `calculator_id` real).

También se confirma, contando eventos en los cinco exports: `alert_interest_submit`
y `support_click` no aparecen **ni una sola vez** en W31–W35 (conteo total de
nombres de evento: `alert_interest_shown=79`, `support_shown=62`,
`source_click=54`, sin ningún `alert_interest_submit` ni `support_click`
registrado). Esto es consistente con la regla de denominador mínimo del
registro de experimentos (ver 2.4): con `alert_interest_shown` acumulado en
79 (< n_min=149) y `support_shown` en 62 (< n_min=598), cualquier lectura de
esas dos señales debe reportarse como `SIN DATOS SUFICIENTES`, no como 0%.

### 2.3 Demanda por URL (Paso 2 del plan)

Fuente: `output/operations/data-signals/gsc/2026-W35-pages.json` (159 filas),
filtrado a `/calculadoras/`.

**Verificación de control — coincide exacta:**
`/calculadoras/conversor-utm/`: 571 clics de 773 totales del sitio (73,9% ≈
74%) y 121.300 impresiones de 150.899 totales (80,4% ≈ 80%).

Top calculadoras por clics W35, ordenadas descendente:

| Página | Clics | Impresiones | CTR | Posición |
|---|---:|---:|---:|---:|
| conversor-utm | 571 | 121.300 | 0,47% | 7,8 |
| seguro-cesantia | 40 | 2.087 | 1,92% | 7,8 |
| impuesto-segunda-categoria | 35 | 1.955 | 1,79% | 9,1 |
| prepago-credito | 35 | 407 | 8,60% | 5,7 |
| operacion-renta | 23 | 315 | 7,30% | 6,6 |
| credito-consumo | 19 | 685 | 2,77% | 7,6 |
| deposito-a-plazo | 8 | 2.717 | 0,29% | 7,3 |
| comisiones-afp | 3 | 860 | 0,35% | 11,3 |
| simulador-jubilacion | 3 | 730 | 0,41% | 10,6 |
| sueldo-liquido | 2 | 1.144 | 0,17% | 27,2 |
| apv | 1 | 342 | 0,29% | 8,4 |
| conversor-uf | 1 | 8.453 | 0,01% | 10,4 |

Cruce con actividad first-party W35: `conversor-utm` (view=676) +
`conversor-uf` (view=234) = 910 de 1.294 vistas totales del sitio (70,3% ≈
70%), con completitud (`calculator_complete/calculator_start`) de 98,9% y
99,4% (≈ 99% y 99%) respectivamente — conversores de un dato: se completan
casi siempre y no dejan una decisión pendiente evidente.

En el tramo medio, el patrón se invierte: `prepago-credito` (CTR 8,6%,
posición 5,7) y `operacion-renta` (CTR 7,3%, posición 6,6) tienen CTR
orgánico 15–18 veces mayor que `conversor-utm` con una fracción de sus
impresiones, y `impuesto-segunda-categoria` combina demanda moderada (35
clics, 1.955 impresiones) con el mejor desempeño de "siguiente paso" del
sitio (entrega 141,9%–184,6%, CTR hasta 18,8%).

**Intersección demanda + CTR + decisión pendiente**: `prepago-credito`,
`operacion-renta` e `impuesto-segunda-categoria` son las tres URLs donde
coinciden tráfico real, CTR de búsqueda alto (indicio de intención
específica, no solo curiosidad) y una decisión posterior de producto
(pagar antes o no, ajustar régimen, aportar a AFP) que ya tiene un vehículo
con datos que la respalda.

### 2.4 Confirmaciones cruzadas (para no duplicar análisis ya hecho)

- **Regla de denominador mínimo** (`docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md:26-30`):
  `next_step_shown` con `n_min=99` (umbral HALT 3%) y denominador acumulado
  W31–W35 de 108 → **suficiente**. `alert_interest_shown` con `n_min=149`
  (umbral GREEN 2%) y denominador acumulado de 79 → **insuficiente**.
  `support_shown` con `n_min=598` (umbral GREEN 0,5%) y denominador
  acumulado de 62 → **insuficiente**. Estas cifras se citan del registro, no
  se re-derivan.
- **APV (dossier 055, `docs/backlog/CALCULATOR-CONSOLIDATION-2026-08-02.md`)**:
  la recomendación MANTENER se apoyaba en completitud 82% (W32, confirmado:
  `calculator_complete/calculator_start` = 14/17 = 82,4%). Con W34/W35 esa
  completitud cayó a 19,0% (4/21) y 14,3% (3/21) — confirmado exacto contra
  `docs/backlog/DIAGNOSTICO-apv-completion-2026-09-04.md`, que ya investigó
  la causa (plan 086, ejecutado) y concluyó **causa no identificada** (ningún
  defecto reproducible en el código; hallazgo instrumental: `calculator_error`
  no se emite en ningún punto del sitio). Este spike no re-deriva esa causa —
  cita el diagnóstico ya hecho.
- **Archivo no encontrado**: el plan cita
  `output/operations/weekly-search-performance/2026-W35/weekly-search-scorecard.md`
  como síntesis de referencia. Ese directorio no existe en el checkout actual
  — solo `2026-W19/` y `2026-W28/` están presentes bajo
  `output/operations/weekly-search-performance/`. No se cita ni se contradice
  ese documento porque no está disponible; los números de este spike se
  recalcularon directamente desde los JSON crudos de `data-signals/`.

## 3. Diagnóstico separado en dos capas

### Capa 1 — Vehículo (entrega): ¿cuánta gente ve cada superficie?

El panel post-resultado de `conversor-utm` está en
`src/pages/calculadoras/conversor-utm.astro:340`; el bloque de resultado
está en la línea 203, con otra `<section>` intermedia en la 266 — 137 líneas
de marcado entre el resultado y el panel. `UtmPostResultActions.astro`
confirma un `IntersectionObserver` con `{ threshold: 0.25 }` (líneas 101-127
del componente) que solo dispara `next_step_shown` cuando el elemento
observado entra 25% en el viewport — es decir, solo cuenta a quienes hacen
scroll explícito más allá del resultado. Esto explica directamente por qué
la entrega es 6,7%–12,9% del `calculator_complete`, frente al 141,9%–633,3%
de la tarjeta dinámica (`NextBestStep.astro` + `next-best-step.ts`), que se
inyecta en el flujo de la propia calculadora sin depender de scroll
adicional más allá de completar el cálculo.

### Capa 2 — Demanda (CTR condicional a que sí se vio)

Aquí la evidencia es más ambigua de lo que sugiere el 0 crudo. De los 108
`next_step_shown` acumulados en `conversor-utm` durante W33–W35, el CTR
observado es exactamente 0% en las tres semanas — no "bajo", sino nulo. Con
una tasa de conversión hipotética igual al extremo bajo demostrado por la
tarjeta dinámica (2,6%, `impuesto-segunda-categoria` W34), la probabilidad
de observar cero clics en 108 intentos por puro azar es de
`(1-0,026)^108 ≈ 5,8%` — plausible pero no el resultado más probable. Con
una tasa media del rango demostrado (≈10%), esa probabilidad cae a
`(0,9)^108 ≈ 0,001%` — prácticamente imposible. Esto sugiere que **no basta
con "vehículo insuficiente"** para explicar el 0 total: si la demanda de
quien scrollea hasta el panel fuera comparable a la de quien recibe la
tarjeta dinámica en `apv`/`impuesto-2ª`, algún clic debería haber aparecido.

**Lectura más defendible**: quien scrollea 137 líneas más allá del resultado
en un conversor de un solo dato ya obtuvo lo que buscaba — es una población
auto-seleccionada de "curiosos que ya resolvieron su tarea", distinta de la
población que ve la tarjeta dinámica en `apv`/`impuesto-2ª` (calculadoras
donde el resultado deja abierta una decisión posterior real: ¿cotizar más en
AFP?, ¿ajustar el régimen tributario?). El vehículo explica la mayor parte
del 0 (87–93% de quienes completan `conversor-utm` nunca ven el panel), pero
el patrón de CTR-cero-en-108 apunta además a un componente de demanda
específico de esta superficie: la pregunta que resuelve `conversor-utm` no
deja, para la mayoría, una decisión pendiente del tipo que el panel ofrece.

**Qué evidencia cambiaría esta lectura**: si al subir el panel junto al
resultado (Opción A, Sección 4) la entrega sube a niveles comparables a la
tarjeta dinámica (>100% de `calculator_complete`) y el CTR sigue siendo 0%
o cercano a 0% durante dos semanas comparables con n ≥ 99, eso confirmaría
que el problema es de demanda específica de la superficie, no de vehículo —
y cerraría la pregunta sin necesidad de mudar el experimento al tramo medio.
Si en cambio el CTR sube a niveles comparables a `impuesto-segunda-categoria`
(6,8%–18,8%) apenas mejora la entrega, eso confirmaría que el problema
siempre fue vehículo.

## 4. Opciones

Todas caben dentro del freeze de URLs vigente hasta 2026-11-02: ninguna crea,
renombra ni elimina una URL pública, ni toca `<title>`/`<meta description>`
de superficies en medición.

### Opción A — Subir el panel post-resultado junto al bloque de resultado en `conversor-utm`

Mover (no rediseñar) `<UtmPostResultActions />` de la línea 340 a
inmediatamente después de la línea 203, eliminando la dependencia de scroll
más allá del propio resultado. Es un cambio de posición de un componente
existente, no de contenido, título ni ruta.

- **Costo**: bajo — mover un `<component />` dentro de una página ya
  instrumentada; no toca `UtmPostResultActions.astro` en sí.
- **Riesgo**: bajo — no cambia el contrato de eventos ni el `IntersectionObserver`
  (que seguiría existiendo, pero dispararía casi de inmediato al estar en
  viewport).
- **Reversibilidad**: alta — un solo commit revertible.
- **Qué mediría**: si la entrega sube a >100% de `calculator_complete` y el
  CTR sigue en 0%, confirma demanda baja específica de la superficie (ver
  Capa 2). Si el CTR sube junto con la entrega, confirma que era vehículo.
- **Impresiones semanales estimadas**: con `calculator_complete` de
  `conversor-utm` en 404–445/semana (W34–W35) y una entrega cercana al 90–100%
  (visibilidad inmediata, similar en orden de magnitud a la tarjeta
  dinámica, aunque sin garantía de igualar su 140%+ porque el panel ofrece
  solo 2 CTAs frente a la lógica contextual de la tarjeta), el `next_step_shown`
  semanal pasaría de ~30–52 a un rango estimado de **360–450/semana**. Esto
  cruza el `n_min=99` de `next_step_shown` en la primera semana, y
  acumularía el `n_min=149` de `alert_interest_shown` (si el bloque de
  interés en alertas también gana visibilidad) en menos de una semana, y el
  `n_min=598` de `support_shown` en 1,5–2 semanas. Esta es una proyección de
  orden de magnitud, no una medición — no reemplaza los datos reales que
  produciría el cambio.

### Opción B — Llevar el vehículo dinámico (`next-best-step.ts`) al tramo medio

Extender las reglas de `src/data/nextBestStep/rules.ts` para que la tarjeta
dinámica se active también en `prepago-credito`, `operacion-renta` y
`credito-consumo` (todas ya incluyen o podrían incluir `NextBestStep.astro`
sin tocar rutas), con destinos de "siguiente paso" que ya existen dentro del
propio sitio.

- **Costo**: medio — requiere definir reglas de elegibilidad y CTAs
  contextuales por calculadora, no solo mover un componente.
- **Riesgo**: bajo-medio — toca la lógica de reglas compartida
  (`rules.ts`), que ya sirve a `apv`/`impuesto-2ª`; un error de regla podría
  degradar la entrega ya demostrada en esas dos calculadoras si no se aísla
  bien por `calculatorSlug`.
- **Reversibilidad**: alta — reglas por slug, removibles sin tocar el
  componente base.
- **Qué mediría**: si el vehículo que ya funciona en `apv`/`impuesto-2ª`
  sostiene una entrega y CTR comparables en calculadoras con decisión
  pendiente real y mejor CTR orgánico, aislando el efecto de vehículo del
  efecto de superficie observado en la Sección 3.
- **Impresiones semanales estimadas**: sumando `calculator_complete` W35 de
  `prepago-credito` (22) + `operacion-renta` (14) + `credito-consumo` (15) =
  51/semana. Aplicando el rango de entrega demostrado (141,9%–633,3%), el
  `next_step_shown` combinado estimado sería de **~72–320/semana** — cruza
  el `n_min=99` en la primera o segunda semana, pero **no alcanza por sí
  solo** el `n_min=598` de `support_shown` ni el `n_min=149` de
  `alert_interest_shown` en un plazo corto salvo que se sostenga varias
  semanas dentro de la ventana restante (~8 semanas al 2026-09-04).

### Opción C — Mantener la entrega actual y extender la ventana de medición

No tocar código; seguir acumulando exports semanales de `conversor-utm` tal
como está hoy.

- **Costo**: nulo.
- **Riesgo**: nulo en el sentido técnico, pero alto en el sentido de
  oportunidad: consume semanas de la ventana utility-led sin cambiar la
  entrega.
- **Reversibilidad**: no aplica (no hay cambio que revertir).
- **Qué mediría**: nada nuevo estructuralmente — solo más de la misma señal
  débil.
- **Impresiones semanales estimadas**: ~30–52/semana, el ritmo ya observado.
  `next_step_shown` ya cruzó su propio `n_min=99` (108 acumulado en 3
  semanas), pero `alert_interest_shown` (79 acumulado en 5 semanas, n_min=149)
  tardaría aproximadamente 9–10 semanas más en alcanzar el mínimo al ritmo
  actual — **eso excede el cierre de la ventana utility-led (2026-11-02)**.
  Esta opción no permite decidir dentro del plazo disponible.

### Opción D — Declarar la tesis no comprobable sobre tráfico de `conversor-utm` y reenfocar en el tramo medio

Congelar el experimento de "siguiente paso" en `conversor-utm` como
aprendizaje (documentado, no borrado) y concentrar la instrumentación y el
análisis futuro en las calculadoras del tramo medio (`prepago-credito`,
`operacion-renta`, `impuesto-segunda-categoria`, `credito-consumo`), que ya
muestran CTR de búsqueda 6–18 veces mayor y, en el caso de
`impuesto-segunda-categoria`, el mejor desempeño de "siguiente paso" del
sitio con el vehículo dinámico ya existente.

- **Costo**: bajo — es una decisión de foco, no de construcción; puede
  combinarse con la Opción B para tener trabajo ejecutable.
- **Riesgo**: bajo — no descarta reabrir `conversor-utm` más adelante si la
  Opción A cambia el panorama.
- **Reversibilidad**: alta.
- **Qué mediría**: nada por sí sola — es la decisión de dónde invertir la
  medición, no un experimento.
- **Impresiones semanales**: no aplica directamente; el efecto se mide a
  través de la Opción B si se ejecuta en paralelo.

**Opción bloqueada, no propuesta como ejecutable**: cualquier variante que
implique crear una nueva URL de "siguiente paso" dedicada, o un artículo
puente entre `conversor-utm` y el tramo medio, choca con el freeze de URLs
vigente hasta 2026-11-02 (`docs/backlog/UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md:7`)
y requeriría una excepción fechada y aprobada — no se incluye como camino
disponible en esta compuerta.

## 5. Actualización explícita de dos recomendaciones previas

### Encuadre del plan 046 ("evaluar lo construido, no diseñar desde cero")

El plan 046 (`plans/archive/046-converter-recurrence-return-hook-spike.md`,
ya marcado `SUPERSEDED` en `plans/README.md:1242`) partía de la pregunta de
si valía la pena construir un "hook de retorno" para conversores. La
respuesta correcta, como el propio archivo de planes ya anota, es que **el
hook ya existe y está instrumentado** (`UtmPostResultActions.astro`) —
faltaba entrega, no diseño. Este spike **es** esa evaluación pedida por 046:
midió la entrega real del hook ya construido (6,7%–12,9%) y encontró la
causa estructural (distancia de marcado + umbral de scroll). Con este
documento, 046 queda listo para cerrarse definitivamente sin abrir una
Fase 2 de diseño — lo que sigue es una decisión de entrega (Sección 4), no
de arquitectura.

### Hallazgo de APV del dossier 055 (recomendaba MANTENER con datos de W32)

El dossier 055 (`docs/backlog/CALCULATOR-CONSOLIDATION-2026-08-02.md`)
recomendó **mantener** APV como candidata a consolidación, apoyado en una
completitud de 82% y una tendencia ascendente de completes (2→8→14) en
W30–W32. Con W34/W35 esa completitud cayó a 19,0% y 14,3% — confirmado
contra los mismos JSON crudos. **Este spike no investiga la causa**: eso ya
lo hizo el plan 086, ejecutado y documentado en
`docs/backlog/DIAGNOSTICO-apv-completion-2026-09-04.md`, con veredicto
**causa no identificada** (sin defecto reproducible; hallazgo instrumental
sobre `calculator_error`, que nunca se emite en el sitio). La recomendación
MANTENER del dossier 055 sigue siendo correcta como decisión de no
consolidar, pero el argumento que la sostenía (tendencia ascendente W30→W32)
ya no representa el estado actual — cualquier decisión futura sobre APV debe
usar datos posteriores a W35, tal como el propio plan 086 ya señaló.

## 6. Compuerta de decisión del operador

1. **¿Se autoriza mover `<UtmPostResultActions />` de la línea 340 a
   inmediatamente después de la línea 203 en `conversor-utm.astro`
   (Opción A)?**
   Recomendación: sí. Es el cambio de menor costo y mayor poder
   diagnóstico — en una semana separa vehículo de demanda con datos, sin
   tocar rutas, títulos ni contenido.

2. **¿Se autoriza extender las reglas de `next-best-step.ts` a
   `prepago-credito`, `operacion-renta` y `credito-consumo` (Opción B)?**
   Recomendación: sí, pero después de la Opción A y solo si esta última
   confirma que el problema es de vehículo y no de demanda — si el problema
   fuera de demanda, mudar el mismo vehículo a otra superficie sin cambiar
   el diagnóstico de fondo repetiría el experimento sin nueva información.

3. **¿Se acepta que la ventana utility-led restante (~8 semanas al
   2026-09-04) es insuficiente para que `alert_interest_shown` y
   `support_shown` crucen sus mínimos de denominador (149 y 598) al ritmo
   actual de `conversor-utm` (Opción C descartada)?**
   Recomendación: sí — los cálculos de la Sección 4 muestran que, sin subir
   la entrega, `alert_interest_shown` no alcanzaría su mínimo antes del
   cierre de la ventana.

4. **¿Se declara la tesis del recorrido "no comprobable con evidencia
   suficiente sobre tráfico de `conversor-utm` tal como está hoy" y se
   reenfoca el esfuerzo de medición en el tramo medio (Opción D)?**
   Recomendación: parcial — no cerrar `conversor-utm` (la Opción A todavía
   no se ha probado), pero sí priorizar el tramo medio como superficie
   principal de aprendizaje mientras se ejecuta A.

5. **¿Se da por cerrado el plan 046 con este documento como su evaluación
   pendiente, sin abrir una fase de diseño nueva?**
   Recomendación: sí — el plan 086 ya cerró la investigación de causa de
   APV, este documento cierra la pregunta de entrega de 046; ninguno de los
   dos requiere trabajo de diseño adicional, solo la decisión de entrega de
   la pregunta 1.

6. **¿Se acepta que la recomendación MANTENER de APV (dossier 055) sigue
   vigente como decisión de no consolidar, pero que su justificación debe
   re-escribirse citando W34/W35 y el diagnóstico 086 en vez de la tendencia
   ascendente W30–W32 ya superada?**
   Recomendación: sí — es una corrección de cita, no un cambio de decisión.

Este documento termina en esta compuerta. No implementa ninguna opción.

## 7. Lo que este spike NO afirma

- **No afirma** que `conversor-utm` carezca de demanda para "siguiente
  paso" — el análisis de la Sección 3 muestra que la evidencia actual (n=108,
  CTR=0%) es compatible con una demanda baja específica de la superficie,
  pero también con un vehículo tan pobre que ni siquiera mide bien a quien
  sí tendría intención. No se puede separar ambas explicaciones sin ejecutar
  la Opción A.
- **No afirma** que el problema de completitud de APV esté resuelto o
  explicado — eso lo dejó abierto, explícitamente, el plan 086
  (`causa no identificada`). Este spike solo actualiza la cita de la
  recomendación previa de 055.
- **Denominadores chicos**: `alert_interest_shown` (79) y `support_shown`
  (62) acumulados en cinco semanas están por debajo de sus mínimos
  estadísticos (149 y 598) — cualquier lectura de esas dos señales en este
  documento es descriptiva, no una conclusión GREEN/WATCH/HALT.
- **Una sola superficie con vehículo correctamente ubicado en el flujo**:
  el vehículo dinámico (`next-best-step.ts`) solo tiene datos de
  entrega/CTR confiables en `apv` e `impuesto-segunda-categoria`; su
  comportamiento en calculadoras nuevas del tramo medio (Opción B) es una
  proyección de orden de magnitud (Sección 4), no una medición.
  `NextSteps.astro`, aunque ya instrumentado por el plan 083, no tiene
  todavía ningún export que mida su desempeño real en producción.
- **Sin datos de scroll ni de tiempo en página**: la explicación de "quien
  scrollea hasta el panel ya resolvió su tarea" (Sección 3, Capa 2) es una
  hipótesis consistente con los datos disponibles, no una medición directa
  de comportamiento de scroll — el sitio no instrumenta profundidad de
  scroll ni tiempo de permanencia.
- **No se identifican personas ni cohortes** (invariante A2): todos los
  números de este documento son eventos agregados por calculadora y semana,
  nunca sesiones ni usuarios individuales. Ninguna opción de la Sección 4
  propone identificación persistente, cuentas, ni medición de retorno
  individual.
- **No hay monetización ni afiliación** en ninguna opción propuesta.
