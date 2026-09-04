# Plan 046 (spike de dirección): Diseñar un return-hook de recurrencia privacy-safe anclado en los conversores de valor diario/mensual

> **Instrucciones para el ejecutor**: este es un plan de **spike de diseño**, no
> de implementación. NO construyes el feature ni tocas código de producto. Tu
> entregable es un **documento de diseño** en `docs/backlog/` que enumera
> opciones de return-hook, las evalúa contra el criterio de viabilidad y las
> restricciones de privacidad del repo, recomienda una y propone una métrica de
> recurrencia sin-PII. Corre cada verificación y detente en la compuerta de
> decisión humana. Al terminar, actualiza la fila de este plan en
> `plans/README.md`, salvo que un revisor te diga que él mantiene el índice.
>
> **Drift check (córrelo primero)**:
> ```bash
> git diff --stat 0102b11a..HEAD -- \
>   src/components/ResumeWidget.astro \
>   src/utils/resumeState.ts \
>   src/scripts/calculator-prefill.ts \
>   src/pages/calculadoras/conversor-utm.astro \
>   src/pages/calculadoras/conversor-uf.astro \
>   docs/backlog/PLAN-calculator-led-growth-2026-06-28.md \
>   output/operations/weekly-search-performance
> ```
> Si algún archivo citado en "Estado actual" cambió, revalida los extractos
> antes de escribir el documento. Mismatch = condición de STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW (spike de diseño; produce un documento, no código de producto)
- **Depends on**: none estricto. Relacionado con 045 (comparten el tema de
  confiabilidad de datos), pero la premisa de 046 usa rutas RUM **únicas**, no
  contaminadas por GROWTH-005, así que puede correr en paralelo.
- **Category**: direction
- **Planned at**: commit `0102b11a`, 2026-07-12

## Por qué importa

La auditoría canónica de dirección (`GROWTH-DIRECTION-AUDIT-2026-06-28.md`,
finding **GROWTH-007**) acepta tratar la recurrencia como experimento sobre los
pilotos existentes (Next Best Step, ResumeWidget, perfil local) *después* del
baseline, con **confianza MED sobre la demanda recurrente**.

El RUM de W27 (limpio para rutas **únicas** de monedario) aporta un dato que la
auditoría no tenía —en W25 el RUM estaba contaminado (finding GROWTH-005)—:
**los conversores son las superficies de mayor tráfico del sitio.**
`/calculadoras/conversor-utm/` es la ruta más visitada por lejos (310 visitas RUM,
más del doble que la siguiente), seguida de `/calculadoras/seguro-cesantia/` (150)
y `/calculadoras/conversor-uf/` (40).

**Cuidado con el salto lógico (esta es la primera pregunta del spike, no su
premisa):** un conteo de visitas RUM demuestra **tráfico**, no **retorno**. Las 310
visitas pueden ser 310 llegadas nuevas. Peor aún, la evidencia disponible apunta en
contra de leerlo como recurrencia: `conversor-utm` rankea para queries
**transaccionales** ("utm a peso chileno", "utm hoy", "utm a peso" — miles de
impresiones en el scorecard W27), y convertir un monto puntual de multa/impuesto es
un lookup clásico de **una sola vez**. Es *el mismo* tráfico UTM que el mantenedor
ya clasificó como zero-click/bajo valor (§8.2, métrica de vanidad). La hipótesis
"el valor cambia a diario → razón para volver" es plausible para un subconjunto
(quien sigue la UF), pero un conteo de una sola semana **no puede distinguir** eso
de tráfico SEO de una vez.

El valor de este spike: darle al mantenedor una investigación honesta de **si
existe recurrencia real** sobre los conversores y, solo si la hay, un menú de
opciones de return-hook privacy-safe (sin newsletter, sin cuentas, sin PII). La
infraestructura sin-PII para un eventual hook (localStorage vía `ResumeWidget` +
`resumeState` + `calculator-prefill`) **ya existe**. Pero el resultado por defecto,
salvo que se demuestre retorno, es **"medir un ciclo más antes de construir"** —
coherente con la confianza MED de GROWTH-007 y con la cautela del plan maestro.

## Estado actual (evidencia — re-verifícala, no la asumas)

Este spike nace de una auditoría `/improve next` (2026-07-12, commit `0102b11a`)
como **delta** sobre `GROWTH-DIRECTION-AUDIT-2026-06-28.md` (corte W25).

1. **Los conversores lideran el RUM W27 en TRÁFICO (rutas únicas, confiables).** En
   `output/operations/weekly-search-performance/2026-W27/weekly-search-scorecard.md`,
   sección "Performance real (Cloudflare RUM — 2026-W27)":
   - `/calculadoras/conversor-utm/` — **310 visitas** (LCP 1052ms ✅, CLS 0 ✅)
   - `/calculadoras/seguro-cesantia/` — 150
   - `/calculadoras/conversor-uf/` — 40
   Estas rutas son **únicas de monedario**, así que su conteo NO está contaminado
   por GROWTH-005 (que sí afecta rutas compartidas como `/`). Confírmalo: ninguna
   otra propiedad de la cuenta Cloudflare tiene `/calculadoras/conversor-*`.
   **Esto mide tráfico, no retorno** — un conteo de visitas no dice cuántas son
   repetidas. La sección "Query Quick Wins" del mismo scorecard muestra que las
   queries de conversor-utm son transaccionales ("utm a peso chileno", 4351
   impresiones; "utm hoy", 3841) — patrón de lookup de una sola vez.
2. **El valor de estos conversores cambia por calendario.** La UF se actualiza a
   diario y la UTM cada mes (fuente oficial SII/mindicador). El conversor muestra
   "el valor de hoy" — ver `src/pages/calculadoras/conversor-utm.astro:109-131`
   (title/description prometen "valor de hoy del SII"). Eso es un gancho de retorno
   natural: la respuesta correcta es distinta mañana.
3. **La infraestructura de retorno sin-PII ya existe:**
   - `src/components/ResumeWidget.astro` — widget que ofrece retomar la última
     simulación.
   - `src/utils/resumeState.ts` — estado de "resume" (localStorage, sin envío a
     servidor).
   - `src/scripts/calculator-prefill.ts` — prellenado del formulario desde el
     perfil local guardado en el navegador.
   Ninguno transmite datos a un servidor; son mecanismos client-side/localStorage.
4. **El newsletter está diferido por decisión de plataforma** (MON-301,
   `docs/backlog/README.md`), así que NO es la vía de retención disponible hoy.
   GROWTH-007 acota el rollout de escenarios/NBS a "después del baseline, sin
   rollout masivo anticipado".

**La observación central del delta:** *si* existe retención genuina en el sitio,
los datos frescos sugieren que el candidato más probable son los conversores de
valor diario/mensual (mayor tráfico + razón intrínseca de volver), no el newsletter
ni un rollout genérico de escenarios. Pero "mayor tráfico" no es "más retorno": la
existencia de recurrencia real es lo que este spike debe **verificar antes** de
recomendar construir nada.

## Restricciones que el diseño DEBE respetar (no negociables)

Tu documento tiene que evaluar cada opción contra esto y descartar cualquier
opción que las viole:

- **Cero PII / cero identificador persistente.** El plan maestro
  `PLAN-calculator-led-growth-2026-06-28.md` §3.2 prohíbe transmitir "inputs,
  montos, texto libre, perfil, rationale, email, IP, user-agent o identificador
  persistente". Ver también `ADR-20260628` (política del collector de analytics).
  Un return-hook basado en localStorage NO transmite nada — eso es aceptable;
  cualquier cosa que cree una cuenta, cookie de tracking o ID persistente
  cross-visita **NO es viable**, márcala así.
- **Ninguna URL pública nueva** salvo resolución explícita de ownership
  (`INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`,
  `context/INVARIANTS.md:193-208`). Si una opción exige una nueva superficie
  indexable, va con compuerta de ownership.
- **Criterio de viabilidad obligatorio** (`docs/development/CRITERIO_VIABILIDAD.md`):
  análisis realista, sin sesgo de optimismo; si un factor crítico (p. ej. datos no
  públicos, o dependencia de permiso de notificaciones que la gente no da) lo
  impide, la respuesta para esa opción es **NO viable**, con explicación.
- **YMYL y confianza**: cualquier gancho de "valor de hoy" debe apoyarse en la
  frescura real del dato (no prometer actualidad que el pipeline no garantiza —
  ver GROWTH-009 sobre frescura visible).

## Comandos que vas a necesitar

| Propósito | Comando | Esperado |
|---|---|---|
| Drift check | ver encabezado | idealmente vacío |
| Confirmar el RUM W27 de conversores | `grep -n "conversor-utm\|conversor-uf\|seguro-cesantia" output/operations/weekly-search-performance/2026-W27/weekly-search-scorecard.md` | las 3 rutas con sus visitas |
| Leer la infra de retorno existente | `sed -n '1,80p' src/utils/resumeState.ts` | estado localStorage, sin `fetch` a servidor |
| Confirmar que resume/prefill no transmiten | `grep -rn "fetch(\|navigator.sendBeacon\|/api/analytics" src/utils/resumeState.ts src/scripts/calculator-prefill.ts src/components/ResumeWidget.astro` | sin envío de estado de resume a servidor (los eventos de analytics agregados son otra cosa) |
| Verificación de docs | `node scripts/check-docs-structure.mjs` | exit 0 |

Read-only. No corras builds ni generes assets.

## Suggested executor toolkit

- Lee antes de diseñar: `GROWTH-DIRECTION-AUDIT-2026-06-28.md` findings **GROWTH-007**
  (recurrencia, confianza MED) y **GROWTH-009** (frescura), y su **§8.1 Métricas
  accionables** (ahí, en `GROWTH-DIRECTION-AUDIT-2026-06-28.md:441`, ya existe
  `Resume adoption = resume_click / eligible_home_view` como métrica de recurrencia
  — tu propuesta debe alinearse con ese lenguaje, no inventar uno nuevo). Para
  privacidad, `PLAN-calculator-led-growth-2026-06-28.md` §3.2.
- `docs/development/CRITERIO_VIABILIDAD.md`.

## Scope

**In scope** (lo único que creas/modificas):
- `docs/backlog/PLAN-converter-recurrence-return-hook-2026-07-12.md` (crear — el
  documento de diseño/spike).
- `plans/README.md` (solo la fila de estado de este plan, al cerrar).

**Out of scope** (NO tocar):
- Todo `src/`, `workers/`, `scripts/` — este spike **no construye** el return-hook.
- El newsletter (diferido; no es la vía de este spike).
- Cualquier mecanismo con PII, cookie de tracking, cuenta o ID persistente — no se
  diseña "por si acaso"; se descarta explícitamente.
- `PLAN-calculator-led-growth-2026-06-28.md` — se referencia, no se reescribe.
- El plan 045 y su brief — independiente.

## Git workflow

- Branch: `advisor/046-converter-recurrence-return-hook-spike`.
- Commit único: `docs(backlog): spike de diseño de return-hook de recurrencia en conversores (spike 046)`.
- NO push ni PR salvo que el operador lo pida.

## Steps

### Step 1: Drift check y verificación de la premisa

Corre el drift check. Verifica los 4 puntos de "Estado actual" contra el código y
los datos vivos. Confirma en particular que las rutas de conversores siguen
liderando el RUM y que `resumeState.ts`/`calculator-prefill.ts` no transmiten
estado de resume a un servidor.

**Verify**: la premisa (conversores = mayor **tráfico** sobre rutas únicas — NO
"recurrencia", que es lo que el spike debe verificar; infra localStorage sin-PII
presente) se sostiene con los datos vivos, o anotaste el cambio.

### Step 2: Enumerar 3–4 opciones de return-hook

En el documento, describe 3–4 opciones concretas. Para cada una: **mecanismo**,
**cómo respeta cero-PII**, **costo de mantención**, y **veredicto de viabilidad**
(viable / viable-con-condiciones / NO viable) según `CRITERIO_VIABILIDAD.md`.
Opciones candidatas (puedes ajustar, pero cubre al menos estas categorías):

- **A — Indicador de cambio de valor**: mostrar en el conversor cuándo cambió por
  última vez el valor (UF/UTM) y un delta ("hoy la UF subió $X vs. ayer"),
  reforzando la razón intrínseca de volver. Sin estado de usuario; puro render de
  dato ya disponible. Debe apoyarse en frescura real (GROWTH-009).
- **B — "Mis conversiones frecuentes" local**: guardar en localStorage las últimas
  conversiones/montos del usuario para prellenarlas al volver (extiende el patrón
  de `calculator-prefill.ts`). Sin envío a servidor.
- **C — Prompt de guardar/PWA/bookmark**: sugerir agregar el conversor a inicio /
  marcadores. Evalúa fricción y tasa real de adopción (probable baja) con honestidad.
- **D — Notificación opt-in de cambio de valor**: notificación del navegador cuando
  cambia la UF/UTM. Evalúa dependencia de permiso (mucha gente no lo da → posible
  NO viable), costo de un service worker de push, y si rompe la promesa "sin
  registro/sin ruido".

### Step 3: Proponer una métrica de recurrencia sin-PII

Alineada con la §8.1 de la auditoría canónica
(`GROWTH-DIRECTION-AUDIT-2026-06-28.md:441`, que ya define `Resume adoption =
resume_click / eligible_home_view`). Propón cómo medir el retorno a conversores sin
identificador persistente — p. ej. un evento agregado existente/nuevo dentro del
`EVENT_ALLOWLIST`, o el uso de la señal RUM por ruta (una vez cerrado GROWTH-005
para rutas compartidas). Deja claro qué se puede medir hoy y qué requiere el fix de
GROWTH-005 (ver plan 045).

### Step 4: Emitir el veredicto — por defecto, "medir antes de construir"

**El resultado por defecto de este spike es "medir un ciclo más antes de
construir", salvo que encuentres evidencia concreta de retorno.** Un conteo de
visitas de una sola semana (310) NO es evidencia de recurrencia. Solo recomienda
construir una opción si puedes citar una señal real de retorno — p. ej. `resume_click`
agregado > 0 sobre estos conversores en el export first-party, o dos semanas de RUM
con la ruta sostenida tras excluir el pico SEO transaccional. Si no la tienes,
recomienda explícitamente **no construir todavía** y especifica exactamente qué
métrica habría que instrumentar/observar primero (alineada con el Step 3). Recién
si hay evidencia de retorno, recomienda **una** opción (o combinación mínima) como
la de mejor leverage/menor riesgo y marca el resto como "no ahora" con el porqué.
Esta cautela es coherente con la confianza **MED** de GROWTH-007 sobre demanda
recurrente.

### Step 5: Detenerte en la compuerta de decisión humana

El documento recomienda; NO autoriza construir. Cualquier implementación requiere
firma del owner (Carlos Ortega) y, si toca superficie visible YMYL o crea una
superficie nueva, pasar por el pipeline editorial y `OWNERSHIP_BEFORE_EXPANSION`.
Reporta y detente.

**Verify**: `node scripts/check-docs-structure.mjs` → exit 0.

## Test plan

Sin tests de código (spike documental). Verificación:
- `node scripts/check-docs-structure.mjs` → exit 0.
- `git status` → solo el nuevo doc en `docs/backlog/` (y `plans/README.md` al cierre).

## Done criteria

Todas deben cumplirse:

- [ ] Existe `docs/backlog/PLAN-converter-recurrence-return-hook-2026-07-12.md`.
- [ ] Documenta 3–4 opciones, cada una con mecanismo + cumplimiento cero-PII +
  costo de mantención + veredicto de viabilidad citando `CRITERIO_VIABILIDAD.md`.
- [ ] Incluye una propuesta de métrica de recurrencia sin-PII alineada con §8.1 de
  la auditoría canónica (`GROWTH-DIRECTION-AUDIT-2026-06-28.md:441`).
- [ ] Recomienda una opción y descarta el resto con razones (o recomienda "medir un
  ciclo más" con fundamento).
- [ ] Marca explícitamente como NO viable cualquier opción que exija PII / ID
  persistente / cuenta.
- [ ] `node scripts/check-docs-structure.mjs` exit 0.
- [ ] `git status`: sin archivos fuera de scope modificados.
- [ ] Fila de este plan actualizada en `plans/README.md`.

## STOP conditions

Detente y reporta (no improvises) si:

- **No hay evidencia de retorno** (el caso esperado): si no encuentras una señal
  concreta de recurrencia (ver Step 4), NO es una condición de pánico — es el
  resultado por defecto. Emite el veredicto "medir antes de construir" y detente ahí;
  no manufactures una narrativa de recurrencia a partir de un conteo de tráfico.
  (Ojo: "los conversores lideran el tráfico" seguirá siendo cierto — eso no valida
  recurrencia, así que no lo uses como luz verde.)
- **La premisa de tráfico no se sostiene**: si al re-verificar el RUM los
  conversores ya no lideran en visitas, o si su conteo depende de una ruta
  compartida contaminada por GROWTH-005 (no debería — son rutas únicas — pero
  confírmalo), el fundamento del spike se debilita aún más; repórtalo.
- **`resumeState.ts`/`calculator-prefill.ts` SÍ transmiten estado a un servidor**:
  eso cambiaría el análisis de privacidad de la infra existente; para y reporta.
- **El plan maestro o los docs del mantenedor ya contienen un diseño de return-hook
  de conversores**: owned; para y reporta.
- Cualquier paso te empuja a escribir código de producto o a crear una URL/superficie
  nueva: fuera de scope de un spike.

## Reconciliación (2026-08-11)

Drift verificado contra `0102b11a..HEAD` antes de cualquier ejecución:

- **`conversor-utm.astro` cambió sustancialmente (+49 líneas):** ahora importa
  `UtmPostResultActions` (patrón post-resultado vivo: 2 links de siguiente paso,
  bloque de interés de aviso, bloque de apoyo — los mismos mecanismos que este
  spike preveía diseñar), añade `evaluateCriticalMonthlyFreshness` (gate: build
  falla si la UTM está stale — GROWTH-009 implementado en la página) y
  `buildUtmWorkedExample`, y actualiza el banner/metodología a "valor oficial
  SII". **El spike se reencuadra**: ya no es "diseñar un return-hook desde
  cero" sino "evaluar si el patrón post-resultado existente constituye un
  return-hook de recurrencia y qué opciones de extensión tiene" — la pregunta
  de recurrencia (Step 4) sigue intacta y es la primera.
- **`conversor-uf.astro` (+6)**: solo `GlossaryContentWrapper` en FAQs y
  `formatCLP` — cosmético, sin efecto en la premisa.
- **Infra sin-PII intacta**: `ResumeWidget.astro`, `resumeState.ts`,
  `calculator-prefill.ts` sin cambios desde `0102b11a` — el punto 3 del
  "Estado actual" sigue verificándose.
- **Datos**: el scorecard citado (W27) sigue existiendo; W28 ya está
  disponible (y W29–W32 con analytics v2). La métrica de recurrencia debe
  leerse de los exports W28+ con el contrato v2, no del RUM W27.
- **`PLAN-calculator-led-growth-2026-06-28.md` (+2)**: cambios menores, la
  referencia §3.2 (cero-PII) sigue vigente.
- Relación con la fundación utility-led (`e17013b7`, 2026-08-02): el contrato
  v2 (`next_step_*`, `alert_interest_*`, `support_*`) y
  `UTILITY_LED_EXPERIMENT_REGISTRY.md` ya instrumentan la medición que este
  spike pedía — el documento de diseño debe partir de esos umbrales, no
  proponer métricas nuevas incompatibles.

Estado tras reconciliación: **TODO** — premisa viva con reencuadre (evaluar lo
construido, no diseñar desde cero). El resto del plan (steps, scope, STOP
conditions) aplica sin cambios.

## Maintenance notes

Para quien decida después:

- Este spike NO construye nada. Si se aprueba una opción, abrir un plan de
  implementación aparte que pase por: firma de copy si toca superficie visible,
  `CALCULATOR_CREATION_CHECKLIST.md` si aplica, y verificación de que ningún payload
  nuevo viole la lista de cero-PII de §3.2.
- La métrica de recurrencia de rutas compartidas depende de cerrar GROWTH-005 (ver
  plan 045). Para las rutas únicas de conversores, la señal RUM ya es utilizable.
- Un revisor debe escrutar que el documento NO haya tocado producto y que su
  veredicto de viabilidad sea honesto (sin sesgo de "construyamos"): la opción
  "medir un ciclo más" debe seguir sobre la mesa.
- Relación con GROWTH-007: si esto avanza, actualizar GROWTH-007 en el plan maestro
  para que apunte al activo concreto (conversores) en vez de "pilotos existentes"
  genéricos — pero esa edición del plan maestro la decide el owner.
