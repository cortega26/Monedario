# Plan 045 (spike de dirección): Re-secuenciar el crecimiento en dos carriles y verificar que el baseline de medición realmente arrancó

> **Instrucciones para el ejecutor**: este es un plan de **spike / decisión**, no
> de implementación. NO modificas código de producto ni de analytics. Tu
> entregable es un **brief de decisión** en `docs/reports/` (read-only, no
> autoriza cambios por sí solo — mismo estatus que
> `docs/reports/GROWTH-DIRECTION-AUDIT-2026-06-28.md`) más una re-verificación
> de la evidencia con datos frescos. Corre cada comando de verificación y
> confirma su salida antes de avanzar. Si ocurre una condición de la sección
> "STOP", detente y reporta — no improvises. Al terminar, actualiza la fila de
> este plan en `plans/README.md`, salvo que un revisor te haya despachado y te
> diga que él mantiene el índice.
>
> **Drift check (córrelo primero)**:
> ```bash
> git diff --stat 0102b11a..HEAD -- \
>   scripts/data-signals/cloudflare-fetch.mjs \
>   scripts/build-weekly-search-report.mjs \
>   docs/reports/GROWTH-DIRECTION-AUDIT-2026-06-28.md \
>   docs/backlog/PLAN-calculator-led-growth-2026-06-28.md \
>   output/operations/weekly-search-performance
> ```
> Si alguno de los archivos de estado citados abajo cambió desde este plan,
> compara el estado vivo contra los extractos de "Estado actual" antes de
> escribir el brief. Si una premisa se invalidó, trátalo como condición de STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW (produce un documento de análisis + verificación read-only; no toca producto)
- **Depends on**: none (independiente de 041 y de 046)
- **Category**: direction
- **Planned at**: commit `0102b11a`, 2026-07-12

## Por qué importa

Toda la estrategia canónica de crecimiento (`PLAN-calculator-led-growth-2026-06-28.md`)
descansa en una secuencia: **medir de forma agregada → establecer baseline por
calculadora → optimizar 3–5 journeys → capturar demanda SEO existente**. Esa
secuencia trata la medición como "PR-00", un desbloqueo rápido y previo a todo lo
demás.

La evidencia de W27 (última semana disponible al escribir este plan) dice que la
premisa "la medición es rápida y ya casi está lista" es **empíricamente falsa**, y
que por eso el motor de crecimiento lleva ~1 mes bloqueado sin haber capturado ni
una sola semana de baseline confiable. Mientras tanto, el **carril SEO/GSC** —que
NO necesita el embudo first-party— también quedó atrás por estar secuenciado
"después del baseline", pese a que el propio scorecard ya emite candidatos de
refresh que nadie acciona.

El valor de este spike: darle al mantenedor una **decisión de re-secuencia
explícita** (dos carriles con relojes independientes) fundamentada en datos
frescos, y un **checklist de verificación de baseline** para no volver a asumir
que "la medición ya está" sin comprobarlo semana a semana. Es la restricción que
hoy ata el resto del roadmap; desbloquearla o al menos verla con claridad tiene el
mayor leverage disponible.

## Estado actual (evidencia — re-verifícala, no la asumas)

Este spike NACE de una auditoría `/improve next` corrida el 2026-07-12 contra el
commit `0102b11a`. La auditoría canónica de dirección
(`docs/reports/GROWTH-DIRECTION-AUDIT-2026-06-28.md`) tiene **corte de datos en
W25**; este spike es un **delta** sobre esa auditoría con datos W27+. Los cuatro
pilares de evidencia:

1. **No hay baseline limpia todavía, un mes después.** El scorecard W27
   (`output/operations/weekly-search-performance/2026-W27/weekly-search-scorecard.md`,
   sección "Headline") reporta literalmente:
   > `First-party analytics: 2026-W27 — 21 calculators, 0 views · 568 starts · 916 completes`
   Dos defectos en una línea: `views=0` (la medición de vistas no llega) y
   `completes (916) > starts (568)` (tasa de conversión >100%, embudo imposible).
   Esa línea la construye
   `scripts/build-weekly-search-report.mjs:1361` a partir de
   `summary.analyticsJson.totals`.

2. **Tres semanas seguidas, tres defectos de medición distintos.** Los planes
   039 (dedup de `calculator_complete` por page-view), 042 (quitar el evento typo
   `calculator_completed`) y 043 (validar la forma de `item_id`) se escribieron y
   mergearon 2026-07-10…12 — cada uno un bug distinto de la capa de instrumentación.
   Ver `plans/archive/039-*.md`, `plans/archive/042-*.md`,
   `plans/archive/043-*.md`. **Importante:** los tres se mergearon *después* de la
   ventana de W27 (2026-06-29→2026-07-05), así que el scorecard W27 aún refleja el
   estado pre-fix. La primera verificación real del embudo recién puede hacerse en
   el scorecard **W28** (o posterior).

3. **GROWTH-005 sigue sin implementarse.** La auditoría canónica aceptó, "como
   parte del primer ciclo", filtrar el RUM de Cloudflare por hostname (hoy
   contamina con `/llaveros/` y `/limpiezayaseo/`, otros sitios de la misma cuenta
   Cloudflare). El código sigue igual: `scripts/data-signals/cloudflare-fetch.mjs`
   función `fetchRumWebVitals` (líneas ~140-162) consulta
   `rumWebVitalsEventsAdaptiveGroups` con `filter: { datetime_geq, datetime_leq }`
   y `dimensions { requestPath }` — **filtrado solo por `accountTag`, sin dimensión
   de hostname/`requestHost`**. Consecuencia: rutas únicas de monedario
   (`/calculadoras/conversor-utm/`) son confiables, pero rutas compartidas (`/` =
   60 visitas en el scorecard W27) agregan cross-hostname en silencio y se
   presentan como dato limpio.

4. **El carril SEO tiene backlog surfaced-pero-no-accionado.** El scorecard W27
   generó una sección "Refresh Candidates" con tres tools (APV, conversor-uf,
   credito-consumo) que tienen impresiones en posición 4–15 y CTR débil. Solo
   `seguro-cesantia` (plan 040, ya archivado) fue accionado; los otros tres no
   tienen plan. Ese carril usa **GSC** (fiable, semanas W16–W27 todas presentes en
   `output/operations/data-signals/gsc/`), no el embudo first-party.

**La observación central del delta:** la secuencia canónica hace esperar la
captura SEO detrás del baseline first-party, pero **la captura SEO no depende del
first-party** — depende de GSC, que está sano. Y el baseline first-party, del que
sí dependen los journeys, no ha arrancado su reloj de "2 semanas limpias" un mes
después.

## Comandos que vas a necesitar

| Propósito | Comando | Esperado |
|---|---|---|
| Drift check | ver bloque del encabezado | idealmente vacío |
| Ver la última semana disponible | `ls -t output/operations/weekly-search-performance/` | primer resultado = semana más reciente |
| Leer la línea first-party de la última semana | `grep -n "First-party analytics" output/operations/weekly-search-performance/<WEEK>/weekly-search-scorecard.md` | una línea con `views · starts · completes` |
| Confirmar que el RUM sigue sin filtro de hostname | `grep -n "requestHost\|clientRequestHTTPHost\|hostname\|zoneTag" scripts/data-signals/cloudflare-fetch.mjs` | `fetchRumWebVitals` (≈líneas 140-162) NO menciona hostname; `zoneTag` solo aparece en `fetchDailyTraffic` |
| Confirmar candidatos de refresh sin plan | `grep -rln "conversor-uf\|credito-consumo\|/calculadoras/apv" plans/ | grep -v archive` | sin coincidencias de un plan de título activo |
| Verificación de docs | `node scripts/check-docs-structure.mjs` | exit 0 |

No corras `pnpm run build` ni ningún job que escriba en `output/` — este spike es
read-only sobre el estado; los scorecards los generan los workers/CI, no tú.

## Suggested executor toolkit

- Antes de escribir el brief, lee de punta a cabo:
  `docs/reports/GROWTH-DIRECTION-AUDIT-2026-06-28.md` (la auditoría canónica que
  estás actualizando) y `docs/backlog/PLAN-calculator-led-growth-2026-06-28.md`
  §2, §3 y la secuencia del veredicto. Tu brief es un **delta** sobre ellos, no un
  reemplazo: cítalos por sección.
- `docs/development/CRITERIO_VIABILIDAD.md` — el criterio obligatorio de viabilidad;
  tu recomendación debe ser honesta y sin sesgo de optimismo.

## Scope

**In scope** (lo único que creas/modificas):
- `docs/reports/GROWTH-DIRECTION-DELTA-2026-W28.md` (crear — el brief de decisión;
  si al ejecutar la semana más reciente no es W28, usa el label real, p. ej.
  `-2026-W29`).
- `plans/README.md` (solo la fila de estado de este plan, al cerrar).

**Out of scope** (NO tocar, aunque parezca relacionado):
- Cualquier archivo bajo `scripts/`, `src/`, `workers/` — este spike **no arregla
  GROWTH-005 ni el embudo**; solo los diagnostica y los deja especificados como
  follow-up. Escribir la corrección de `cloudflare-fetch.mjs` es un plan de
  implementación aparte, futuro.
- Cualquier título/description de calculadora (eso es el carril SEO, gestionado
  por planes tipo 040, con firma de copy humana).
- `PLAN-calculator-led-growth-2026-06-28.md` — no lo reescribas; tu brief lo
  referencia y recomienda, la edición del plan maestro la decide el mantenedor.
- `output/**` — datos generados; no los edites a mano.

## Git workflow

- Branch: `advisor/045-measurement-resequence-two-lanes`.
- Commit único (o uno por paso): estilo conventional commits, p. ej.
  `docs(reports): brief de re-secuencia de medición en dos carriles (spike 045)`.
- NO hagas push ni abras PR salvo que el operador lo pida.

## Steps

### Step 1: Drift check y lectura del estado

Corre el drift check del encabezado. Lee las cuatro piezas de evidencia de "Estado
actual" contra el código/datos vivos. Si el scorecard W27 ya no existe o la línea
first-party cambió de forma, ajústate al estado vivo y anótalo.

**Verify**: `git diff --stat 0102b11a..HEAD -- <paths del encabezado>` → revisado;
cualquier cambio, conciliado en tus notas.

### Step 2: Determinar si el baseline ya arrancó (dato fresco)

Lista las semanas disponibles (`ls -t output/operations/weekly-search-performance/`).
Si existe una semana **posterior a W27** (W28+), lee su línea "First-party
analytics" y clasifica:

- **Embudo sano** = `views > 0` **y** `completes ≤ starts`. → El reloj del baseline
  arrancó. Regístralo; esto **debilita** la premisa "medición estancada" y tu brief
  debe decirlo con honestidad (ver STOP).
- **Embudo aún roto** = `views = 0` **o** `completes > starts`. → Confirma que, pese
  a 039/042/043, la instrumentación sigue sin producir una semana confiable.

Si NO existe ninguna semana posterior a W27, el reloj del baseline sencillamente
**aún no arrancó**; documenta eso como el hallazgo principal.

**Verify**: tienes una clasificación escrita (sano / roto / sin-datos) citando el
`file:line` exacto de la semana más reciente.

### Step 3: Confirmar el estado de GROWTH-005 (RUM sin filtro de hostname)

Corre el grep de la tabla de comandos sobre `cloudflare-fetch.mjs`. Confirma que
`fetchRumWebVitals` sigue sin dimensión de hostname y que `zoneTag` solo se usa
para el tráfico diario, no para el RUM. Anota el `file:line`.

**Verify**: `grep -n "requestHost\|hostname\|zoneTag" scripts/data-signals/cloudflare-fetch.mjs`
→ RUM sin hostname; documentado.

### Step 4: Escribir el brief de decisión

Crea `docs/reports/GROWTH-DIRECTION-DELTA-2026-W28.md` (ajusta el label a la semana
real). Estructura obligatoria (sé conciso; es un delta, no una auditoría nueva):

1. **Ficha de control**: tipo = delta read-only sobre `GROWTH-DIRECTION-AUDIT-2026-06-28.md`;
   commit auditado; corte de datos = semana más reciente; "no autoriza cambios por
   sí solo".
2. **Premisa que se actualiza**: la secuencia canónica trata la medición como
   desbloqueo rápido; la evidencia W27+ muestra ~1 mes sin baseline confiable.
   Cita las 4 piezas de evidencia con `file:line`.
3. **Recomendación — dos carriles con relojes independientes**:
   - **Carril A (SEO/GSC), desbloqueado ya**: usa GSC (fiable); acciona los
     candidatos de refresh que el scorecard ya emite (hoy: APV, conversor-uf,
     credito-consumo) por el patrón del plan 040 (con firma de copy humana). NO
     espera el baseline first-party.
   - **Carril B (journeys first-party), correctamente aún tras baseline**: no
     desplegar cambios de journey hasta que el embudo dé ≥2 semanas confiables.
   - Deja claro que esto **no contradice** el veredicto canónico (crecimiento
     liderado por calculadoras); solo **desanuda** el orden serial que hace a A
     esperar por B sin necesidad.
4. **Checklist de verificación de baseline** (para correr cada semana antes de
   confiar en un número first-party para decidir):
   - [ ] `views > 0` en la línea first-party del scorecard.
   - [ ] `completes ≤ starts` (tasa de conversión ≤100%).
   - [ ] Dos semanas consecutivas cumpliendo lo anterior antes de fijar baseline.
   - [ ] GROWTH-005 cerrado (RUM filtrado por hostname) antes de usar cualquier
     métrica RUM de rutas compartidas como `/`.
5. **Follow-up especificado (no ejecutado aquí)**: la corrección de GROWTH-005 en
   `cloudflare-fetch.mjs:fetchRumWebVitals` — añadir dimensión/filtro de hostname
   `requestHost = "monedario.cl"`. Especifícalo lo suficiente para que se convierta
   en su propio plan de implementación, pero **no lo implementes**.
6. **Compuerta de decisión humana**: la adopción de la re-secuencia y de accionar
   los candidatos de refresh es decisión del owner (Carlos Ortega). El brief
   recomienda; no cambia el plan maestro.

**Verify**: `node scripts/check-docs-structure.mjs` → exit 0; el archivo existe y
cubre las 6 secciones.

### Step 5: Detenerte en la compuerta de decisión

No edites `PLAN-calculator-led-growth-2026-06-28.md` ni acciones ningún carril.
Reporta el brief y detente. La decisión de re-secuenciar es del mantenedor.

## Test plan

No hay tests de código (spike documental). Verificación:
- `node scripts/check-docs-structure.mjs` → exit 0 (el brief respeta la estructura
  de docs del repo).
- `git status` → solo el nuevo archivo en `docs/reports/` (y, al cierre,
  `plans/README.md`).

## Done criteria

Todas deben cumplirse:

- [ ] Existe `docs/reports/GROWTH-DIRECTION-DELTA-<WEEK>.md` con las 6 secciones.
- [ ] El brief clasifica el estado del embudo de la semana más reciente con
  `file:line` (sano / roto / sin-datos).
- [ ] El brief confirma el estado de GROWTH-005 con `file:line`.
- [ ] El brief incluye el checklist de verificación de baseline y el spec de
  follow-up de GROWTH-005 (sin implementarlo).
- [ ] `node scripts/check-docs-structure.mjs` exit 0.
- [ ] `git status`: no hay archivos fuera de scope modificados.
- [ ] Fila de este plan actualizada en `plans/README.md`.

## STOP conditions

Detente y reporta (no improvises) si:

- **El embudo ya está sano en W28+** (`views > 0` y `completes ≤ starts` por ≥1
  semana): la premisa "medición estancada" se debilita. NO fuerces la narrativa de
  re-secuencia; reporta el hallazgo positivo (039/042/043 funcionaron) y deja que el
  brief lo diga. El carril-A/carril-B sigue siendo una recomendación válida de
  sequencing aunque el embudo sane, pero el énfasis cambia.
- **Los docs del mantenedor ya contienen una separación de carriles explícita** (o
  el plan maestro ya fue re-secuenciado): entonces esto es owned; para y repórtalo
  en vez de duplicar.
- **El drift check muestra que `cloudflare-fetch.mjs` o el generador del scorecard
  cambiaron** de forma que invalida los extractos: revalida antes de escribir.
- Cualquier paso te empuja a tocar un archivo fuera de scope (código de producto o
  el plan maestro).

## Maintenance notes

Para quien tome la decisión después:

- Este brief NO cierra GROWTH-005 ni el embudo; los diagnostica. Si se adopta la
  re-secuencia, abrir dos ítems: (1) plan de implementación de GROWTH-005
  (hostname filter en `cloudflare-fetch.mjs`), (2) accionar los candidatos de
  refresh del carril A vía el patrón del plan 040 (cada uno con firma de copy).
- El checklist de verificación de baseline debería correrse cada semana hasta
  acumular 2 semanas limpias; recién ahí tiene sentido pasar a los journeys
  (carril B) del plan maestro.
- Un revisor debe escrutar que el brief **no** haya editado producto ni el plan
  maestro, y que su tono sea honesto si el embudo sanó (no forzar la tesis).
- Relación con el plan 046 (retención en conversores): 046 depende de datos RUM
  confiables por ruta; su premisa (conversores = motor de recurrencia) usa rutas
  **únicas** de monedario, no contaminadas por GROWTH-005, así que es válida aun
  antes de cerrar GROWTH-005 — pero cualquier métrica de recurrencia de rutas
  compartidas debe esperar ese fix.
