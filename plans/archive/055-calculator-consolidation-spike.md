# Plan 055 (spike de dirección): Consolidación por URL de 5 calculadoras — dossier de evidencia y opciones de migración

> **Instrucciones para el ejecutor**: este es un plan de **spike de diseño y
> evidencia**, no de implementación. NO mueves rutas, NO editas páginas, NO
> tocas sitemap ni RSS. Tu entregable es un **dossier read-only por URL** en
> `docs/backlog/` que combina datos de tráfico/uso con el inventario de cada
> página, propone opciones de consolidación (incluida la de **no consolidar**),
> especifica el protocolo de ejecución que se usaría después y se detiene en
> una **compuerta de decisión humana por URL**. Al terminar, actualiza la fila
> de este plan en `plans/README.md`, salvo que un revisor te diga que él
> mantiene el índice.
>
> **Drift check (córrelo primero)**:
> ```bash
> git diff --stat 0bd51540..HEAD -- \
>   src/pages/calculadoras/apv.astro \
>   src/pages/calculadoras/comisiones-afp.astro \
>   src/pages/calculadoras/boleta-honorarios-liquido.astro \
>   src/pages/calculadoras/gratificacion-legal.astro \
>   src/pages/calculadoras/tarjeta-credito.astro \
>   output/operations/data-signals/gsc \
>   output/operations/data-signals/analytics \
>   scripts/snapshot-routes.mjs \
>   scripts/check-indexable-url-freeze.mjs
> ```
> Si alguno de los archivos en alcance cambió desde `0bd51540`, revalida los
> extractos antes de escribir. Mismatch = condición de STOP.

## Status

- **Priority**: P2
- **Effort**: M (spike read-only; la ejecución posterior de sus recomendaciones es MED, no parte de este plan)
- **Risk**: MED — el riesgo material está en la **ejecución futura** (rutas públicas + YMYL); este spike no la ejecuta y queda mitigado por los gates existentes del repo (route snapshot, RSS, ADR)
- **Depends on**: none estricto; la decisión informada mejora si el plan 053 (baseline GSC) ya aterrizó, porque los datos por URL serán más completos
- **Category**: direction
- **Planned at**: commit `0bd51540`, 2026-08-02

## Por qué importa

El memo de viabilidad estratégica del 2026-08-02
(`output/audits/strategic-viability-2026-08-02/monedario-strategic-viability-audit.html`,
untracked) clasifica las 22 calculadoras y propone **"Consolidar"** para cinco:
APV, Comisiones AFP, Boleta de honorarios, Gratificación legal y Tarjeta de
crédito ("activación baja y alto costo regulatorio", "convertir en dato
comparativo, no calculadora", "integrar en impuesto/renta", "integrar en
sueldo/finiquito", "integrar en costo de crédito"). El mismo memo fija un
inventario objetivo de ~80 URLs activas (hoy 184) y un kill criterion de
mantenimiento (>32 h/mes; hoy estimado 44–64) que solo baja consolidando. Pero
el memo también impone la regla de oro: **"Ninguna retirada debe ejecutarse sin
evidencia por URL y plan de migración"** — y el repo tiene invariantes que
prohíben cambios de ruta silenciosos (`ROUTES.NO_SILENT_CHANGES`,
`RSS.NO_REMOVALS`, `context/INVARIANTS.md:51-52`).

Este spike produce la evidencia por URL y las opciones; no decide nada.

## Estado actual (verificado el 2026-08-02)

- **Las 5 páginas** existen en `src/pages/calculadoras/`:
  `apv.astro`, `comisiones-afp.astro`, `boleta-honorarios-liquido.astro`,
  `gratificacion-legal.astro`, `tarjeta-credito.astro` (inventario de 22
  calculadoras en esa carpeta; `src/pages/calculadoras/index.astro` es el hub).
  Cada una sigue el patrón compartido: `CalculatorHero`, motor en
  `src/domain/` (use-cases), `formController` en `src/scripts/`, imports de
  `CalculatorJsonLd`, `NextSteps`, etc. — ver p. ej. `seguro-cesantia.astro`
  como página ejemplar del patrón (no es candidata, es referencia).

- **Datos de tráfico disponibles** (untracked del repo — los exports son
  trackeados por el workflow de data-signals):
  - `output/operations/data-signals/gsc/2026-W30-pages.json` — clics/impresiones/CTR/posición por página (W30, 20–26 jul).
  - `output/operations/data-signals/gsc/2026-W30-queries.json` — por consulta.
  - `output/operations/data-signals/analytics/2026-W29.json` y `2026-W30.json` — eventos agregados por calculadora (`calculator_view/start/complete/error`).
  - Nota: el export GSC de 2026-W29 no existe (ver plan 053); usa W27/W28 si
    los archivos existen y márcalo como limitación.
  - El memo ya agregó las cifras W30: p. ej. tarjeta-credito no aparece en el
    top-10 de páginas; APV/comisiones/gratificación tampoco (top-10 va de
    conversor-utm 643 clics a simulador-renegociacion 6). Verifica por tu
    cuenta; no copies los números del memo sin cruzar con el JSON.

- **Gates de ruta del repo** (a citar en el dossier, NO a ejecutar):
  - `ROUTES.NO_SILENT_CHANGES` — `context/INVARIANTS.md:51`; comando
    `pnpm run check:routes` (snapshot `scripts/snapshot-routes.mjs` →
    `output/validation/routes_snapshot_after.json` + `compare-routes.mjs` contra
    `docs/reports/routes_snapshot_before.json`).
  - `RSS.NO_REMOVALS` — `context/INVARIANTS.md:52`; `pnpm run check:rss`
    (`rss-to-json.mjs` + `compare-rss.mjs`).
  - `check:indexable-url-freeze` (`scripts/check-indexable-url-freeze.mjs`) —
    congela el set indexable (184 URLs en el build reciente).
  - Proceso ADR: `docs/adr/_TEMPLATE.md` + numeración `ADR-YYYYMMDD-<slug>.md`
    (ver `docs/adr/` — 8 ADRs vigentes; p. ej.
    `ADR-20260716-weekly-search-ops-at-current-scale.md`).
  - La política de viabilidad del repo: `docs/development/CRITERIO_VIABILIDAD.md`
    (obligatoria antes de recomendar desarrollos que dependen de fuentes externas).

## Comandos que necesitarás

| Propósito | Comando | Salida esperada |
|---|---|---|
| Datos GSC por página (W30) | `node -e "const d=require('./output/operations/data-signals/gsc/2026-W30-pages.json'); for (const r of d.data) if (r.key.includes('calculadoras/')) console.log(r.key, r.clicks, r.impressions, r.ctr, r.position)"` | filas por URL de calculadora |
| Eventos por calculadora | `node -e "const d=require('./output/operations/data-signals/analytics/2026-W30.json'); console.log(JSON.stringify(d,null,2).slice(0,2000))"` (inspecciona la forma real primero) | eventos agregados |
| Enlaces internos a una página | `grep -rln "calculadoras/<slug>" src/ --include="*.astro" --include="*.ts" --include="*.md" --include="*.mdx"` | lista de emisores |
| Rutas snapshot (solo lectura del protocolo) | `sed -n '1,60p' scripts/snapshot-routes.mjs` | estructura del script |
| ADR template | `cat docs/adr/_TEMPLATE.md` | plantilla a citar |

## Alcance

**In scope** (únicos archivos que puedes crear/modificar):
- `docs/backlog/CALCULATOR-CONSOLIDATION-2026-08-02.md` — el entregable (crear)
- `plans/README.md` — fila de estado (una línea)

**Out of scope** (NO tocar, aunque parezcan relacionados):
- Cualquier página en `src/pages/calculadoras/` — no se mueve, edita ni borra nada en este spike.
- `src/`, `scripts/`, `workers/`, `.github/`, `public/`, sitemap y RSS — intactos.
- Los `snapshot`/`compare` (routes/rss) — solo se citan como protocolo; no se corren para modificar baselines.
- Las 17 calculadoras no candidatas — fuera de este dossier (pueden aparecer solo como destino de integración).
- El plan 053 (baseline GSC) — mencionar como dependencia de datos, no ejecutar.

## Git workflow

- Rama: `advisor/055-calculator-consolidation`
- Commit único al final (estilo del repo):
  `docs(backlog): dossier de consolidación de calculadoras (spike 055)`
- NO hagas push ni abras PR salvo que el operador lo indique.

## Steps

### Step 1: datos por URL (GSC + analytics)

Para cada una de las 5 páginas, extrae y registra en el dossier:
1. Del export GSC W30 (`2026-W30-pages.json`): clics, impresiones, CTR,
   posición media (si la URL no aparece, registra "sin fila en W30" — dato, no
   error). Cruza además con `2026-W30-queries.json` (las queries que traen
   clics a esa URL, si hay).
2. De los exports de analytics W29 y W30: conteo de `calculator_view`,
   `calculator_start`, `calculator_complete`, `calculator_error` por
   calculadora (inspecciona primero la forma del JSON — son agregados
   semanales por calculadora).
3. Enlaces internos entrantes: `grep -rln "<ruta>" src/` (todas las superficies:
   posts, glosario, hubs, otras calculadoras). Anota cuántos y cuáles.
4. Marca la limitación W29 (sin export GSC) en el dossier.

**Verify**: para cada URL, el dossier tiene una fila con los 4 datos (aunque
sea "sin fila" / "0"). El grep de enlaces se corrió para las 5 rutas.

### Step 2: inventario funcional de cada página

Para cada una de las 5, lee la página y registra:
1. `title`/`description` del `<Layout>` y del frontmatter/hero (propósito
   declarado).
2. El motor/use-case que usa (imports de `src/domain/`, p. ej. nombre del
   use-case o módulo `shared`).
3. Parámetros que consume (¿`economicParameters`? ¿constantes legales?) — útil
   para estimar el costo de mantenimiento que la consolidación eliminaría.
4. Destinos naturales de integración (candidatos del memo, a validar con lo
   que veas):
   - `apv.astro` → `simulador-jubilacion` (pensiones) — el memo sugiere "integrar con jubilación"
   - `comisiones-afp.astro` → contenido comparativo AFP (posts/cartolas), no calculadora
   - `boleta-honorarios-liquido.astro` → `operacion-renta` / `impuesto-segunda-categoria` (tributario)
   - `gratificacion-legal.astro` → `sueldo-liquido` / `finiquito-indemnizacion` (remuneración)
   - `tarjeta-credito.astro` → `credito-consumo` (costo de crédito)
   (No asumas estos destinos: valídalos contra el contenido real de cada
   página y anota los desajustes.)

**Verify**: el dossier tiene una subsección por página con los 4 puntos.

### Step 3: opciones por URL con trade-offs

Para cada página, propón **3–4 opciones** (al menos las siguientes) con
esfuerzo (S/M/L), riesgo y trade-off:
- **Mantener tal cual** (con su costo de mantenimiento estimado y por qué
  podría ser correcto pese al memo).
- **Integrar la utilidad en la página destino + redirigir la URL** — especifica
  qué se migra (motor, contenido, datos), qué muere (URL, schema, backlinks) y
  el protocolo del Step 4.
- **Noindex + mantener la página** (útil cuando hay demanda residual pero no
  se quiere el costo de un redirect).
- **Convertir en dato/contenido comparativo** (p. ej. comisiones-afp como
  sección de un post/hub, no calculadora).
Cada opción debe referenciar los datos del Step 1 (si la página tiene ~0
clics y 0 completes, decirlo; si tiene demanda residual, decirlo también).

**Verify**: 5 subsecciones × ≥3 opciones con esfuerzo/riesgo explícitos.

### Step 4: protocolo de ejecución (para después, no ejecutar)

Escribe UNA sección del dossier que especifique, para cualquier opción que
toque una ruta pública, el protocolo obligatorio (citando los invariantes y
scripts, con sus comandos):
1. ADR previo: `docs/adr/ADR-YYYYMMDD-consolidar-<slug>.md` siguiendo
   `docs/adr/_TEMPLATE.md` (decisión por URL, con la evidencia del dossier).
2. Snapshot de rutas: `pnpm run routes:snapshot` (baseline) y el gate
   `pnpm run check:routes` (el diff debe ser el esperado y aprobado, no
   silencioso).
3. RSS: `pnpm run rss:snapshot` + gate `pnpm run check:rss`
   (RSS.NO_REMOVALS: una URL en RSS **no se puede quitar** — la opción de
   "redirigir" debe prever mantener o mover la entrada, y la de noindex no
   toca RSS).
4. Freeze de indexables: `pnpm run check:indexable-url-freeze` (el set
   indexable cambia → requiere actualización deliberada del freeze, no
   silenciosa).
5. Canónicos/redirects: a qué URL canónica apuntar, manejo de `canonical`,
   y verificación post-deploy con URL Inspection.
6. YMYL: qué copy/firma humana requiere cada cambio de superficie (por
   NORMA_YMYL — el contenido financiero nuevo requiere el pipeline editorial).

**Verify**: la sección existe y lista los 6 puntos con los comandos exactos
del repo.

### Step 5: recomendación por URL + compuerta humana

1. Por cada página, da una **recomendación preliminar** (una línea) anclada a
   la evidencia del Step 1, marcando claramente la incertidumbre cuando los
   datos sean débiles (p. ej. sin fila en W30).
2. Cierra el dossier con la **compuerta de decisión humana**: las preguntas
   por URL (¿consolidar o mantener? ¿qué opción?), qué evidencia nueva
   cambiaría la recomendación (p. ej. datos de W31/W32 tras el plan 053), y la
   nota del memo: "Ninguna retirada debe ejecutarse sin evidencia por URL y
   plan de migración". NO ejecutes nada.

**Verify**: el dossier termina con la sección "Decisión del operador".

## Plan de test

Spike read-only: sin tests de código. Verificación = los comandos de datos del
Step 1 ejecutados con sus salidas registradas, y `git status --short` limpio
salvo el entregable + `plans/README.md`.

**Verify**: `git status --short` → solo `docs/backlog/CALCULATOR-CONSOLIDATION-2026-08-02.md`
y `plans/README.md` modificados.

## Criterios de terminado

Machine-checkable. ALL deben cumplirse:

- [ ] `docs/backlog/CALCULATOR-CONSOLIDATION-2026-08-02.md` existe con: datos por URL (Step 1), inventario funcional (Step 2), opciones por URL (Step 3), protocolo de ejecución (Step 4), recomendaciones + compuerta (Step 5)
- [ ] Los datos citados del export W30 coinciden con el JSON real (verificado por el ejecutor con los comandos del Step 1, no copiados del memo sin cruzar)
- [ ] Los grep de enlaces internos se corrieron para las 5 rutas y sus resultados están en el dossier
- [ ] El dossier cita los 3 invariantes (`ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS`, freeze indexable) con `file:line`
- [ ] `git status --short` limpio salvo el entregable + `plans/README.md`
- [ ] Ningún archivo de `src/`, `scripts/`, `workers/`, `.github/` modificado
- [ ] Fila del plan en `plans/README.md` actualizada (salvo instrucción en contrario del reviewer)

## Condiciones de STOP

Detente y reporta (no improvises) si:

- Los archivos en "Estado actual" no coinciden con los extractos (drift desde `0bd51540`).
- `output/operations/data-signals/gsc/2026-W30-pages.json` no existe (o su forma es distinta a `{ data: [{ key, clicks, impressions, ctr, position }] }`) — el plan 053 aún no aterrizó y los datos disponibles son otros; reporta con lo que haya.
- Alguna de las 5 páginas ya no existe o fue renombrada — el inventario base cambió.
- Descubres que alguna de las 5 tiene demanda real en W30 (p. ej. está en el top-10 de páginas) — regístralo tal cual y refuerza la opción "mantener" con ese dato; no lo ocultes para que el memo "tenga razón".
- El protocolo del Step 4 contradice un invariante (p. ej. si RSS.NO_REMOVALS impide una opción que propusiste) — ajústalo en el dossier y explícalo; no silencies la contradicción.

## Reconciliación (2026-08-11)

Drift verificado contra `0bd51540..HEAD` antes de cualquier ejecución:

- **Las 5 páginas candidatas cambiaron SOLO cosméticamente** (`formatCLP`
  unificado + `GlossaryContentWrapper` en FAQs; `apv.astro` +6, `comisiones-afp`
  +6, `boleta-honorarios-liquido` +3, `gratificacion-legal` +9, `tarjeta-credito`
  +6): inventario, motores y estructura intactos. Las líneas citadas de
  patrones (CalculatorHero, domain use-cases, NextSteps) siguen siendo válidas.
- **Datos disponibles más frescos**: los exports GSC **2026-W32** ya existen
  (`2026-W32-pages.json`/`queries.json`/`query-page.json`/`sitemaps.json`/
  `url-inspection.json`), y analytics llega a `2026-W32.json`. El dossier debe
  usar W32 como corte (el plan citaba W30 por ser lo más reciente al escribir).
  La limitación W29 (sin export GSC) queda obsoleta.
- **`check-indexable-url-freeze.mjs` refactorizado**: las excepciones ya no
  llevan los 13 campos inline; se validan vía `isCompleteException()` desde
  `scripts/lib/url-freeze-exceptions.mjs` (mismo esquema, mecanismo extraído).
  El gate sigue activo — la cita del protocolo (Step 4, punto 4) debe apuntar
  al lib, no al script.
- **`scripts/snapshot-routes.mjs` sin cambios** — el protocolo de snapshot de
  rutas citado sigue byte-idéntico.
- 053 (baseline GSC) aterrizó (W32 url-inspection existe) — la dependencia de
  datos declarada en Status se cumple; los datos por URL serán completos.

Estado tras reconciliación: **TODO** — premisa viva, inventario intacto, datos
actualizados a W32. El resto del plan aplica sin cambios.

## Notas de mantenimiento

- La ejecución de cualquier opción elegida será un plan futuro separado (con
  su propio despacho, ADR y gates). Este dossier es el insumo, no la orden.
- Si el plan 053 aterriza antes de la decisión, actualizar los datos por URL
  con W31+ y país/dispositivo refinará las recomendaciones — el dossier debe
  registrar la fecha de corte de sus datos.
- Las 5 páginas comparten el patrón de mantenimiento (parámetros legales,
  snapshot económico); consolidar reduce la superficie de riesgo YMYL además
  del costo de horas — decirlo en el dossier con el cálculo del memo (44–64
  h/mes → 22–32).
