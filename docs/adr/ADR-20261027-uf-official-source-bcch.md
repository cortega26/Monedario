# ADR-20261027-uf-official-source-bcch

Date: 2026-10-27
Status: Proposed

## Context

`ADR-20260516-economic-snapshot-cloudflare-worker` ya estableció que la UF debe
tomarse del **Banco Central de Chile** (SiETE, serie `F073.UFF.PRE.Z.D`) y usar
`mindicador.cl` solo como respaldo. Esa decisión se aplicó al *snapshot*
(valor suelto) pero **no a la serie histórica diaria**
(`src/data/economic-history/uf-historico.json`), que siguió ingiriéndose desde
el agregador.

Esa inconsistencia tenía consecuencias medibles. Al comparar la serie actual
(9.808 entradas) contra el BCCh (9.810) el 2026-10-27:

- **9.806 valores coinciden**, 0 fechas del archivo faltan en el BCCh.
- **2 valores están corruptos**: `2014-12-29` y `2014-12-30` valen `608.15` y
  `607.38` en el archivo, con `24.627,1` en sus vecinos inmediatos. El BCCh y
  el SII coinciden en `24.627,1`. Es un error de ~40x, servido públicamente
  con HTTP 200 desde `/api/uf-historico-lookup.json?date=2014-12-29`.
- **2 fechas faltan**: `2015-12-12` y `2015-12-31`, ambas rodeadas de
  `25.629,09`.

Además, `mindicador.cl` es operativamente inestable: durante esta sesión
devolvió HTTP 500 y timeouts repetidos que, en la ingesta anterior, habrían
borrado 5 años de serie de no mediar el guard anti-regresión.

## Decision

1. **El BCCh es la fuente autoritativa de la serie UF diaria.** La ingesta
   consulta `F073.UFF.PRE.Z.D` entre `${FROM_YEAR}-01-01` y hoy + 30 días.
2. **`mindicador.cl` queda como respaldo y como señal de reconciliación, no
   como autoridad.** Si el BCCh responde, manda y rellena huecos con
   mindicador; las discrepancias se registran en el log y **no bloquean** la
   corrida (bloquear por culpa del agregador publicaría datos peores). Si el
   BCCh falla o viene vacío, se usa mindicador y la metadata lo declara.
3. **Parser propio, con reglas explícitas** (`scripts/economic-history-bcch.mjs`):
   - **2 decimales**, no 1. El parser de IPC redondea a 1 decimal porque el IPC
     es una variación mensual; aplicarlo a la UF convertiría `41189.24` en
     `41189.2` y corrompería 25 años de serie.
   - El BCCh emite ruido de coma flotante en algunas filas
     (`"23040.939999999"`); se normaliza a 2 decimales, que es la precisión con
     que se publica la UF (SII `2013-09-01` = `23.040,94`).
   - `statusCode` **ausente se acepta**; presente y distinto de `"OK"` se
     descarta. En una serie diaria de 27 años una fila sin el campo no debe
     convertirse en un hueco.
   - Fechas duplicadas **abortan** en vez de resolverse en silencio.
4. **La procedencia no puede mentir.** El campo `fuente` se deriva del camino
   que realmente produjo los datos. El workflow `refresh-uf-history.yml` valida
   las credenciales BCCh y ejecuta una aserción de procedencia: si la serie no
   vino del BCCh, la corrida **falla** en vez de quedar verde con un fallback
   silencioso (mismos datos, mismo formato, cero beneficio, nada que lo note).
5. **Guard de plausibilidad independiente del proveedor.** Un salto diario
   mayor a 5% aborta la escritura. La UF se reajusta por IPC mensual y no se ha
   movido así en su historia. Este control habría detectado el defecto de 2014
   sin necesitar una segunda fuente.
6. **Corrección aplicada una sola vez**, con `--allow-value-revision`, tras
   confirmar los dos valores contra el SII (`sii.cl/valores_y_fechas/uf/uf2014.htm`
   → `24.627,1` en ambas fechas). El diff resultante toca **exactamente** dos
   valores, añade **exactamente** dos fechas y actualiza metadata.
7. **Cobertura sin cambios:** `2000-01-01 → 2026-11-09`, 9.810 entradas. La
   serie del BCCh llega a 1999, pero extenderla hacia atrás queda **fuera de
   alcance**: no está cubierta por la comparación 1:1 que valida esta decisión,
   cambia el comportamiento público de `before_range` y merece su propio PR.

## Consequences

- La serie deja de depender de un agregador intermitente. Durante la
  implementación, `mindicador` falló en 5 de 27 años y la ingestión completó
  igual con 9.810 observaciones del BCCh.
- La UF queda alineada con la política ya vigente para el snapshot
  (`ADR-20260516`), eliminando una inconsistencia de procedencia.
- Se corrige un error de ~40x en dos fechas publicadas y se rellenan dos
  huecos.
- **Nueva dependencia**: el Siete REST WS del BCCh requiere
  `BCCH_USER`/`BCCH_PASSWORD` en el workflow semanal. Sin ellos el job falla
  explícitamente (no degrada en silencio).
- **Riesgo aceptado**: si el BCCh revisara valores ya publicados por
  anticipación (~14 días), el guard de inmutabilidad abortaría la corrida
  semanal y abriría issue. Es el comportamiento correcto — exige revisión
  humana, no publicación automática — pero genera ruido hasta confirmar si el
  BCCh revisa anticipados.
- `check:economic-source-consistency` sigue validando el registry y el
  snapshot; la coherencia de la *serie* con el BCCh queda cubierta por el nuevo
  test de regresión y por la aserción de procedencia del workflow.

### Registro en `src/data/correcciones.json`

Pendiente de decisión del owner. La corrección es material en sustancia (dos
valores publicados con error de ~40x) y `NORMA_YMYL` §5.4 dice "en caso de duda,
se registra"; además existe precedente de una entrada por un problema de
*dataset* (`ipc-serie-desactualizada`). El precedente de `ADR-20261010` (no
registrar un refresh rutinario) no transfiere: aquel describía datos atrasados
**con aviso fail-closed**, no valores numéricamente falsos servidos sin
advertencia. Este PR **no** modifica `correcciones.json`; queda a criterio del
owner.

## Alternatives considered

- **Seguir con mindicador y solo añadir reintentos** — rechazado: la
  inestabilidad es una parte del problema; los valores falsos son la otra, y
  los reintentos no los detectan.
- **Fetchear ambos y fallar si discrepan** — rechazado: la evidencia de 2014
  demuestra que el agregador publica datos falsos, así que un *fail-on-mismatch*
  haría que un bug de mindicador bloquee la publicación correcta del BCCh.
- **Eliminar mindicador por completo** — rechazado por ahora: se pierde la
  señal que detectó estas 4 discrepancias. Reevaluar cuando exista el
  cross-check SII de `ADR-20261026` fase 2.
- **Reutilizar `parseBcchIpcObservations`** — rechazado: redondea a 1 decimal.
  Habría abortado el guard de inmutabilidad y un operador podría haberlo leído
  como "el BCCh revisó la historia", destruyendo la serie con
  `--allow-value-revision`.
- **Extender la serie a 1999** — rechazado en este PR por alcance y porque no
  está validado por la comparación 1:1.

## Verification

- Reconciliación completa contra el BCCh tras la ingesta:
  `ours=9810 bcch=9810 value_diff=0 missing_in_bcch=0`.
- `pnpm run fetch:economic-history --solo=uf` **sin** el flag aborta listando
  exactamente las 2 revisiones (el guard funciona).
- `pnpm exec vitest run tests/scripts/economic-history-bcch.test.ts`
  — 15 casos: sin redondeo a 1 decimal, normalización de ruido, `statusCode`
  ausente/presente, duplicados, valores no numéricos, plausibilidad.
- `pnpm exec vitest run tests/data/economic-history.test.ts`
  — incluye regresión que fija `2014-12-29 = 24627.1`, `2014-12-30 = 24627.1`,
  `2015-12-12 = 25629.09`, `2015-12-31 = 25629.09` y ausencia de saltos > 5%
  en toda la serie.
- Cotejo de terceros: SII 2014 (`24.627,1` en ambas fechas) y SII 2013
  (`23.040,94`), coherentes con el BCCh.

## Follow-ups

- **Fase 2 de `ADR-20261026`**: con el BCCh como primario, el cross-check
  contra el SII deja de ser "scraper contra scraper" y pasa a ser una
  verificación independiente real antes de habilitar auto-merge.
- Registrar la corrección en `correcciones.json` si el owner lo decide.
- PR separado para extender la serie a 1999, con evidencia propia.
- Confirmar si el BCCh revisa valores publicados por anticipación; si lo hace,
  documentar el flujo de revisión de esos casos.
- Renombrar `scripts/economic-history-ipc.mjs`: ya aloja helpers genéricos
  (`findMissingDates`, `extendSeriesByDate`) y el nombre induce a error.

## Rollback

Revertir el commit de datos restaura los valores de mindicador
(incluidos los corruptos) y el de pipeline restaura la ingesta desde el
agregador. Asumir que `/api/uf-historico-lookup.json` se sirve con
`max-age=86400, stale-while-revalidate=604800`, por lo que un valor corregido
puede seguir circulando en cachés intermedias hasta ~8 días.
