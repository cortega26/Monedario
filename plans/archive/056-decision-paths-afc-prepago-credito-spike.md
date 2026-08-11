# Plan 056 (spike de dirección): Rutas de decisión contextuales AFC/cesantía y prepago/crédito — diseño de siguientes pasos por cluster

> **Instrucciones para el ejecutor**: este es un plan de **spike de diseño**,
> no de implementación. NO modificas páginas ni componentes ni copy. Tu
> entregable es un **documento de diseño** en `docs/backlog/` que (a) mapea los
> recorridos de decisión del memo de viabilidad contra las superficies
> existentes del repo, (b) diseña los conjuntos de siguientes pasos
> (`NextSteps`) por página y la extensión del patrón post-resultado de UTM a
> seguro-cesantia y prepago, (c) define cómo se medirá cada paso con los
> eventos ya instrumentados, y (d) se detiene en una **compuerta de decisión
> humana** (aprobación de copy y elección de piloto). NO tocas código de
> producto. Al terminar, actualiza la fila de este plan en `plans/README.md`,
> salvo que un revisor te diga que él mantiene el índice.
>
> **Drift check (córrelo primero)**:
> ```bash
> git diff --stat 0bd51540..HEAD -- \
>   src/components/NextSteps.astro \
>   src/components/UtmPostResultActions.astro \
>   src/pages/calculadoras/seguro-cesantia.astro \
>   src/pages/calculadoras/prepago-credito.astro \
>   src/contracts/analytics-events.ts \
>   docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md \
>   plans/046-converter-recurrence-return-hook-spike.md
> ```
> Si alguno cambió desde `0bd51540`, revalida los extractos. Mismatch =
> condición de STOP. Además: si el spike 046 **ya se ejecutó** y su documento
> de diseño existe en `docs/backlog/`, léelo y reconcilia antes de escribir
> (comparten el embudo de conversores; el 046 diseña el return-hook de
> recurrencia, este spike diseña los siguientes pasos — no deben solaparse).

## Status

- **Priority**: P2
- **Effort**: M (spike read-only; la implementación posterior es M y pasa por compuertas humanas)
- **Risk**: LOW (spike de diseño; produce un documento, no código de producto)
- **Depends on**: none estricto. Relacionado con el spike 046 (return-hook de
  recurrencia) y con el plan 053 (baseline GSC): la medición de los umbrales
  del registry exige integridad de datos. Puede correr en paralelo con ambos.
- **Category**: direction
- **Planned at**: commit `0bd51540`, 2026-08-02

## Por qué importa

El memo de viabilidad estratégica del 2026-08-02
(`output/audits/strategic-viability-2026-08-02/monedario-strategic-viability-audit.html`,
untracked) define dos beachheads de seis meses con recorridos explícitos:

- **AFC/cesantía y salida laboral**: "cobertura CIC → causal/FCS → finiquito →
  trámite oficial → reempleo". Éxito: ≥250 clics/mes, complete/start ≥70%,
  internal CTR ≥10%, cero errores críticos.
- **Crédito, prepago y renegociación**: "costo → prepago → ahorro →
  renegociación → fuente CMF/SERNAC". Éxito: ≥250 clics/mes combinados,
  complete/start ≥65%, ≥10% siguiente paso.

Y el "Motor de crecimiento" del memo fija el principio: **"Siguiente decisión:
un CTA contextual, no una parrilla genérica. UTM conduce a reajuste; AFC a
causal/trámite; prepago a costo y renegociación."** El experimento de
concentración pide "+20% clics, cuota ≥30%, CTR interno ≥8%" con 24 h y
1,5M tokens de presupuesto.

La infraestructura ya existe (verificado): `NextSteps.astro` está cableado en
`seguro-cesantia.astro` y `prepago-credito.astro`; los eventos
`next_step_shown/click` están en el contrato de analytics; el patrón
post-resultado con apoyo/aviso está vivo en `UtmPostResultActions.astro` en
conversor-utm. Lo que falta es el **diseño específico por cluster**: qué
siguientes pasos, en qué orden, con qué copy, y dónde extender el patrón
post-resultado — todo sujeto a firma humana. Eso es lo que produce este spike.

## Estado actual (verificado el 2026-08-02)

- **`src/components/NextSteps.astro`** — componente compartido que renderiza
  hasta 3 ítems (`visibleItems.slice(0, 3)`), excluye la URL actual y
  duplicados, con `title`/`description`/`location` configurables y CTA por
  defecto según tipo de ruta (`defaultCta`: "/calculadoras/" → "Calcular →",
  "/posts/" → "Leer guía →", "/guias/" → "Explorar sección →"). Props:
  `currentHref`, `cluster`, `items`, `excludeHrefs`, `title`, `description`,
  `location`. Tipo `NextStepItem = { href, title, description?, label?, cta? }`.

- **`src/pages/calculadoras/seguro-cesantia.astro`** — usa `NextSteps` en la
  línea 402 (`location="calculator_next_steps"`); los ítems se derivan de
  `calculatorNextStepItems` (línea 42), que parte de `calculatorRelatedItems`
  y rellena con "Ver todas las calculadoras" si hay <2 ítems. La página ya
  explica CIC vs. FCS en sus FAQs (líneas 53-70) — la frontera de qué calcula y
  qué no está escrita.

- **`src/pages/calculadoras/prepago-credito.astro`** — usa `NextSteps` en la
  línea 390 (`location="calculator_next_steps"`). El memo reporta CTR 11,7% y
  posición 5,66 en W30 para prepago (señal de intención fuerte) con completion
  baja.

- **`src/components/UtmPostResultActions.astro`** — patrón post-resultado
  (solo en conversor-utm hoy): sección `hidden` con `data-analytics-post-result`
  que se muestra tras completar; contiene (a) 2 links de siguiente paso con
  `data-next-step-id` y UTM de atribución (`ATTRIBUTION` con
  `utm_source: "conversor-utm"` — valores fijos del conversor), (b) bloque de
  interés de aviso (`data-alert-interest`, botón `data-alert-interest-submit`
  que solo mide interés agregado; el texto lo dice explícitamente: "no activa
  avisos ni solicita su correo"), (c) bloque de apoyo (`data-support-block`,
  link a `/apoyar/`). El script usa IntersectionObserver con `threshold: 0.25`
  y dispara `next_step_shown`, `alert_interest_shown`, `support_shown` una vez
  (`recordShown`), y `next_step_click` en click. La sección se muestra vía el
  atributo `data-analytics-post-result` — cómo se revela (evento
  `calculator_complete` / clase `hidden`) está en la parte del script no
  citada aquí; léela completa antes de diseñar la generalización.

- **`src/contracts/analytics-events.ts`** — contrato v2: `next_step_shown` /
  `next_step_click` (params: `calculator_id`, `page_type`, `cluster`,
  `interaction_variant`, `next_step_id`, `app_version`; `next_step_click`
  añade UTM), `alert_interest_shown/submit`, `support_shown/click/confirmed`.
  Restricciones: `SAFE_TOKEN = /^[a-z0-9][a-z0-9._-]{0,79}$/` para
  `next_step_id` (línea 121), `interaction_variant ∈ {focus, input, button,
  contextual_v1}`, `support_location ∈ {post_result}`.

- **`docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md`** — umbrales
  GREEN/WATCH/HALT para los experimentos: "Siguiente paso / mostrado"
  (`next_step_shown`) ≥8% señal inicial, ≥10% fuerte, <3% = no ampliar CTA;
  "Interés aviso / mostrado" ≥2%; "Apoyo click / mostrado" ≥0,5%; "Apoyo
  confirmado / completitud" ≥0,1%. Denominadores: `calculator_start`,
  `next_step_shown`, `support_shown`, `calculator_complete`. No se decide con
  <2 semanas comparables ni con integridad <95%.

- **`docs/operations/`** también tiene `UTILITY_LED_EXPERIMENT_REGISTRY.md`
  (leído) y la scorecard semanal consume los eventos agregados.

## Comandos que necesitarás

| Propósito | Comando | Salida esperada |
|---|---|---|
| Leer el patrón post-resultado completo | `sed -n '1,220p' src/components/UtmPostResultActions.astro` | componente completo |
| Inventario de posts por cluster | `ls src/data/blog/ \| grep -iE "cesantia\|finiquito\|afp\|prepago\|credito\|deuda\|renegociacion\|ahorro"` | lista de superficies de contenido |
| ítems actuales de NextSteps en seguro-cesantia | `sed -n '30,55p' src/pages/calculadoras/seguro-cesantia.astro` | `calculatorRelatedItems` + `calculatorNextStepItems` |
| ítems actuales en prepago | `sed -n '370,400p' src/pages/calculadoras/prepago-credito.astro` | bloque NextSteps |
| Eventos del embudo (W29/W30) | `node -e "…"` sobre `output/operations/data-signals/analytics/2026-W30.json` | starts/completes por calculadora |
| Audit de interlinks existente | `pnpm run audit:calculator-interlinks` (o `sed -n '1,40p' scripts/audit-calculator-interlinks.mjs` si el comando toca red) | qué interlinks ya existen (no duplicar el diseño) |

## Alcance

**In scope** (únicos archivos que puedes crear/modificar):
- `docs/backlog/DECISION-PATHS-AFC-PREPAGO-CREDITO-2026-08-02.md` — el entregable (crear)
- `plans/README.md` — fila de estado (una línea)

**Out of scope** (NO tocar, aunque parezcan relacionados):
- `src/components/NextSteps.astro`, `UtmPostResultActions.astro` y las páginas
  de calculadoras — el diseño puede proponer cambios, pero la implementación
  es un plan futuro separado con copy firmado.
- `src/contracts/analytics-events.ts` y el worker de analytics — si el diseño
  requiere eventos nuevos, se documenta como decisión, no se implementa.
- El spike 046 — su diseño de return-hook no se duplica; se referencia.
- El plan 053 (baseline GSC) — fuente de datos futura, no se ejecuta.

## Git workflow

- Rama: `advisor/056-decision-paths-afc-prepago-credito`
- Commit único al final (estilo del repo):
  `docs(backlog): diseño de rutas de decisión AFC/prepago/crédito (spike 056)`
- NO hagas push ni abras PR salvo que el operador lo indique.

## Steps

### Step 1: mapear los recorridos del memo contra las superficies existentes

1. Cita en el documento los dos recorridos del memo (texto literal de las
   secciones "Beachheads de seis meses").
2. Para cada paso de cada recorrido, inventaría la superficie existente:
   - Calculadora: ¿existe una página en `src/pages/calculadoras/`? (p. ej.
     CIC/cobertura → seguro-cesantia; finiquito → finiquito-indemnizacion;
     costo de crédito → credito-consumo; prepago → prepago-credito;
     renegociación → simulador-renegociacion.)
   - Contenido: posts en `src/data/blog/` (p. ej. `seguro-de-cesantia.md`,
     `finiquito-e-indemnizaciones-en-chile.md`, posts de deuda/credito),
     glosario (`src/data/glossary/`), guías (`src/pages/guias/`), leyes
     (`src/data/laws/`).
   - Trámite/fuente oficial: páginas de "trámite" si existen, y qué enlace
     oficial externo aplica (AFC, CMF, SERNAC — solo como referencias, sin
     inventar URLs; usa las que el repo ya cita en las páginas).
3. Entrega una **tabla de brechas** por recorrido: paso → superficie existente
   (con ruta) → hueco (paso sin superficie) → tipo de hueco (contenido nuevo /
   CTA nuevo / superficie nueva).

**Verify**: cada paso de ambos recorridos tiene una fila; los huecos están
explícitos.

### Step 2: diseñar los conjuntos de siguientes pasos por página

1. Lee los ítems actuales de `NextSteps` en `seguro-cesantia.astro` (líneas
   ~30–55) y `prepago-credito.astro` (~370–400) y regístralos como baseline.
2. Propón, para cada página, el conjunto objetivo de 3 ítems (`NextStepItem`:
   `href`, `title`, `description`, `label`, `cta?`) con:
   - `next_step_id` propuesto por ítem (kebab, debe matchear
     `SAFE_TOKEN` — verifica cada uno con el regex del contrato; p. ej.
     `afc-causal-fcs`, `finiquito`, `tramite-afc`, `costo-credito`,
     `ahorro-meta`, `renegociacion`, `fuente-cmf`).
   - El porqué del orden (el recorrido del memo, no una parrilla genérica).
   - El copy **exacto** propuesto (título + descripción, en español neutral,
     siguiendo el tono del repo — ver el copy existente de
     `UtmPostResultActions.astro`).
3. Marca explícitamente qué ítems son **reutilización de superficies
   existentes** vs. **contenido nuevo que faltaría** (del Step 1).

**Verify**: por página, 3 ítems con `next_step_id` válido, copy propuesto y
referencia a superficie existente o hueco.

### Step 3: evaluar la extensión del patrón post-resultado a seguro-cesantia y prepago

1. Lee `UtmPostResultActions.astro` completo (incluida la parte del script que
   revela la sección — evento que dispara el reveal, clase `hidden`) y registra
   los mecanismos.
2. Diseña la generalización (solo en el documento):
   - Qué prop/parámetro diferenciaría los componentes por calculadora
     (`calculator_id`, `ATTRIBUTION` hoy fijos a conversor-utm — propuesta de
     parametrización).
   - Qué bloques aplican a cada página según el registry: apoyo y siguientes
     pasos (bloques condicionados al umbral del registry); aviso de interés
     solo donde el recorrido lo justifica (AFC: aviso de cambios regulatorios
     de cesantía es un candidato; el memo lista "alerta de cambio regulatorio
     del cluster" como relación directa).
   - Regla de colocación del memo: "tras completar UTM, AFC o prepago; nunca
     antes ni en modal" — cómo se traduce a la implementación (revelado
     post-`calculator_complete`).
3. Anota la decisión pendiente: ¿componente nuevo parametrizado o extensión
   del existente? (decisión de implementación futura — aquí solo se evalúan
   las opciones con trade-offs).

**Verify**: el documento contiene la propuesta de generalización con
`calculator_id`/`ATTRIBUTION` parametrizables y la regla de colocación.

### Step 4: definir la medición de cada paso

1. Con los eventos ya instrumentados (`next_step_shown/click`,
   `alert_interest_*`, `support_*` — contrato v2) y los umbrales del registry,
   define por página: denominador (`calculator_start` o `calculator_complete`),
   métrica objetivo (p. ej. `next_step_click / next_step_shown` ≥ X), y qué
   decisión dispara cada umbral (ampliar / mantener / retirar), citando el
   registry línea por línea.
2. Verifica que los `next_step_id` propuestos no colisionen con los ya
   emitidos (grep de `data-next-step-id` en `src/`) y que no dupliquen los
   interlinks del audit W28 (corre o lee `scripts/audit-calculator-interlinks.mjs`).
3. Indica qué datos harían falta para decidir el piloto (2 semanas
   comparables, integridad ≥95% — del registry; relación con el plan 053).

**Verify**: cada página tiene una fila de medición con denominador y umbral
citando `UTILITY_LED_EXPERIMENT_REGISTRY.md`; los `next_step_id` propuestos
pasan el `SAFE_TOKEN` (verifícalo con un script de una línea).

### Step 5: compuerta humana

1. Recomendación preliminar: qué página pilotea primero (el memo sugiere
   AFC y prepago; la elección final es del operador), con el porqué basado en
   los datos W29/W30 de starts/completes por calculadora (léelos del export).
2. Lista las decisiones que solo el operador puede tomar:
   - Aprobación del copy de cada CTA (superficie YMYL — por NORMA_YMYL, el
     contenido financiero nuevo requiere firma humana).
   - Elección del piloto y del orden de despliegue.
   - Si la alerta de interés debe construirse tras superar su umbral (hoy es
     medición solamente) — decisión de producto.
3. Cierra con la compuerta explícita: "ningún ítem de este diseño se
   implementa sin firma del operador".

**Verify**: el documento termina con la sección "Decisión del operador" que
lista los tres puntos.

## Plan de test

Spike read-only: sin tests de código. Verificación = los comandos de lectura
del Step 2–4 ejecutados y registrados, y `git status --short` limpio salvo el
entregable + `plans/README.md`.

**Verify**: `git status --short` → solo `docs/backlog/DECISION-PATHS-AFC-PREPAGO-CREDITO-2026-08-02.md`
y `plans/README.md` modificados.

## Criterios de terminado

Machine-checkable. ALL deben cumplirse:

- [ ] `docs/backlog/DECISION-PATHS-AFC-PREPAGO-CREDITO-2026-08-02.md` existe con: recorridos mapeados (Step 1), conjuntos de siguientes pasos (Step 2), evaluación post-resultado (Step 3), medición (Step 4), compuerta humana (Step 5)
- [ ] Cada `next_step_id` propuesto verificado contra `SAFE_TOKEN` (resultado en el documento)
- [ ] Los umbrales citados del registry coinciden con `UTILITY_LED_EXPERIMENT_REGISTRY.md` (cita file:line)
- [ ] Los `next_step_id` propuestos no colisionan con los existentes (grep registrado)
- [ ] `git status --short` limpio salvo el entregable + `plans/README.md`
- [ ] Ningún archivo de `src/` modificado
- [ ] Fila del plan en `plans/README.md` actualizada (salvo instrucción en contrario del reviewer)

## Condiciones de STOP

Detente y reporta (no improvises) si:

- Los archivos en "Estado actual" no coinciden con los extractos (drift desde `0bd51540`).
- `UtmPostResultActions.astro` ya no es el único emisor post-resultado (otra
  página lo importa) — el patrón se generalizó por otro camino; reconcilia o reporta.
- El spike 046 ya se ejecutó y su diseño entra en conflicto con este (ambos
  tocan el embudo de conversores) — reporta el conflicto en vez de resolverlo tú.
- Los exports de analytics W29/W30 no tienen la forma esperada — registra lo
  disponible y marca la limitación; no inventes números.
- El copy propuesto contradice el tono editorial del repo (ver
  `check:reader-facing-copy` / `check:dialect` como gates) — ajústalo al tono
  y anótalo; no dejes copy que falle los checks en el diseño.

## Reconciliación (2026-08-11)

Drift verificado contra `0bd51540..HEAD` antes de cualquier ejecución:

- **`src/contracts/analytics-events.ts` +35**: contrato ampliado con el evento
  `article_calculator_cta_click` (params `cta_type`, `cta_location`,
  `destination_url` — este último con regex `INTERNAL_URL` de solo URLs
  monedario.cl) y `LEGACY_EVENT_NAMES` ahora exportado, que añade
  `result_action_click → next_step_click` y `support_page_click → support_click`.
  Los eventos que este spike usa (`next_step_shown/click`, `alert_interest_*`,
  `support_*`) **siguen existiendo sin cambios**; el `SAFE_TOKEN` citado
  (línea ~130 ahora, antes 121) conserva su regex.
- **`seguro-cesantia.astro` / `prepago-credito.astro`**: solo `formatCLP`
  (+3/+6 líneas) — el bloque `NextSteps` está en `seguro-cesantia.astro:403`
  (el plan citaba 402) y `prepago-credito.astro:386` (citaba 390); extractos
  del "Estado actual" verificados idénticos en contenido.
- **`NextSteps.astro`, `UtmPostResultActions.astro` y
  `UTILITY_LED_EXPERIMENT_REGISTRY.md`: sin cambios** — los extractos citados
  siguen vigentes byte a byte.
- El spike 046 **no se ha ejecutado** (sigue TODO en `plans/`), así que la
  condición "si 046 ya se ejecutó, reconcilia" no aplica; su sección de
  reconciliación reencuadra el patrón post-resultado, lo que refuerza la
  premisa de este spike (el patrón ya existe y está instrumentado).
- El evento `article_calculator_cta_click` es un insumo nuevo para el Step 4
  (medición): los CTAs de página de resultado ya tienen su propio evento;
  verificar que los `next_step_id` propuestos no colisionen con los
  `cta_type`/`destination_url` de ese evento.

Estado tras reconciliación: **TODO** — premisa intacta y **más viable** (la
instrumentación que pedía medir ya está completa). El resto del plan aplica
sin cambios.

## Notas de mantenimiento

- La implementación de este diseño (componentes, copy, pilotos) será un plan
  futuro separado con firma humana previa — este documento es el insumo.
- Si el spike 046 aterriza (return-hook de recurrencia), su métrica de
  retorno comparte denominadores con la medición del Step 4 — reconciliar
  ambos diseños antes de implementar.
- El plan 053 (baseline GSC) proveerá la integridad de datos que el registry
  exige (≥95%) — hasta entonces, cualquier lectura del embudo es provisional.
- La extensión post-resultado debe respetar el umbral del registry para
  `support_*` (≥0,5% click/shown): si una página no cruza el umbral, el bloque
  no se despliega — el diseño debe prever esa condición.
