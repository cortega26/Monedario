# ADR-20261026-weekly-uf-ingestion

Date: 2026-10-26
Status: Proposed

## Context

La serie histórica diaria de la UF
(`src/data/economic-history/uf-historico.json`, 9.808 entradas, 2000-01-01 →
2026-11-09) alimenta `/calculadoras/conversor-uf/`, `/uf-hoy/`,
`/api/uf-historico-lookup.json` y el caso de uso `FetchHistoricalUf`. Es dato
YMYL: un valor equivocado o ausente se traduce en cálculos publicados.

El **snapshot** de indicadores (valores sueltos de UF/UTM/IPC/dólar) sí se
refresca a diario: el Worker de `ADR-20260516-economic-snapshot-cloudflare-worker`
lo commitea directo a `main`. Pero la **serie histórica** no tenía —hasta hoy—
ningún ingestor programado. El único workflow de ingesta es
`refresh-ipc-history.yml`, que corre `--solo=ipc` y solo entre los días 8 y 12
del mes, porque sigue el calendario de publicación del INE.

`ADR-20261010-monthly-ipc-ingestion` dejó constancia explícita de esta
asimetría: *"La rama UF conserva su comparación por metadatos (asimetría
deliberada: su serie no es objeto de esta remediación)."* Después, una
re-auditoría (2026-09-29) endureció
`scripts/check-economic-snapshot-freshness.mjs` con `UF_SERIES_MAX_LAG_DAYS =
14` sin agregar ingesta. El resultado fue un gate **que no podía sino fallar**:
detectaba el rezago, pero no existía camino automático para remediarlo.

Ocurrió el 2026-10-26. El CI programado de `main` quedó rojo:

```
[check-economic-snapshot-freshness] FAIL: 1 stale signal(s):
  - uf-historico.json llega a 2026-10-09 (rezago 17.0d vs snapshot 2026-10-26)
```

La remediación fue manual (`pnpm run fetch:economic-history --solo=uf`, PR
#729). Sin intervención humana, el próximo quiebre era cuestión de días.

## Decision

1. **Workflow semanal dedicado `refresh-uf-history.yml`**: cron
   `0 13 * * 1` (lunes 13:00 UTC, después del gate programado de las 05:00) +
   `workflow_dispatch`. Corre `pnpm run fetch:economic-history --solo=uf`,
   ejecuta la frescura **incondicionalmente** después de ingerir, abre un PR
   revisable (rama `chore/refresh-uf-history`, `HUSKY=0`) y sincroniza un issue
   `data-freshness`. `add-paths` incluye **los tres artefactos**
   (`uf-historico.json`, `uf-rango.json`, `uf-mensual.json`): los sidecars están
   acoplados por test y commitear solo el histórico reintroduce la misma clase de
   bug con otro mensaje de error.
2. **Heartbeat contra ingesta silenciosamente muerta.** Dos controles
   independientes del *por qué* murió:
   - `check-economic-snapshot-freshness` valida `actualizadoEl` del histórico
     contra el calendario de Chile (`America/Santiago`, con 1 día de holgura
     porque el script lo escribe como fecha UTC) con máximo 10 días.
   - El workflow falla si la última fecha ingerida **no avanzó** respecto de
     `HEAD`. Un ingestor que devuelve la misma serie sale con código 0, no
     produce diff y cerraría su propio issue como verde; esta aserción lo
     convierte en rojo.
3. **La rama UF de la frescura se ancla a `serie.at(-1).fecha`**, con
   `hastaFecha` solo como fallback si la serie está vacía —igual que la rama
   IPC desde `ADR-20261010`. La comparación por metadatos es el vector de
   enmascaramiento que ese ADR cerró para el IPC y que se mantuvo por excepción
   para la UF; la excepción deja de tener sentido cuando la serie sí es objeto
   de remediación.
4. **Guard de inmutabilidad de valores.** `fetch-economic-history.mjs`
   re-descarga 2000→presente y reescribe el archivo completo, pero
   `findMissingDates` solo compara **conjuntos de fechas**. Una revisión o
   redondeo aguas arriba reescribiría 25 años de valores con todos los gates en
   verde. Se agrega la verificación simétrica: ninguna tupla `(fecha, valor)` ya
   presente puede cambiar de valor sin `--allow-value-revision` explícito.
5. **Auto-merge acotado a diff verificado por máquina.** El PR semanal se
   auto-mergea solo si se cumplen **todas** estas condiciones:
   - ninguna fecha eliminada;
   - ningún valor preexistente modificado;
   - última fecha avanzó;
   - **cross-check contra la tabla UF oficial del SII** pasa para todas las
     fechas nuevas;
   - los tres artefactos presentes en el diff.

   Si cualquiera falla —incluido "no se pudo cotejar contra el SII"— el PR
   queda abierto para revisión humana. **Fail-closed.**

### Implementación por fases

**Fase 1 (este cambio):** workflow semanal, heartbeat (`actualizadoEl` + aserción
de avance), anclaje de la rama UF a `serie.at(-1)` y guard de inmutabilidad de
valores. El PR se abre sin auto-merge.

**Fase 2 (pendiente):** cross-check automático contra la tabla oficial del SII
y, solo entonces, auto-merge. Desde `ADR-20261027-uf-official-source-bcch` el
primario ya es el BCCh, así que ese cross-check pasa a ser una verificación
independiente real (dos emisores oficiales) y no un scraper contra otro. Mientras el check no exista, la condición 4 de la
decisión 5 no puede cumplirse y el merge queda en manos humanas — que es
exactamente el comportamiento *fail-closed* que este ADR exige. La fase 1 ya
elimina el modo de falla silencioso: si el PR semanal no se mergea,
`actualizadoEl` deja de avanzar y el gate se pone rojo a los ~11 días.

Separarlas es deliberado: un scraper de HTML en el camino crítico de publicación
multiplica los modos de falla, y conviene observarlo antes de darle permiso de
mergear.

### Por qué auto-merge aquí y no en el IPC

`ADR-20261010` rechazó el auto-merge porque un humano debe cotejar el valor
nuevo contra la publicación del INE antes de que lo vean los usuarios. Ese
argumento es correcto y aquí se conserva en sustancia: **la verificación sigue
existiendo, solo se automatiza**. Para la UF el cotejo es mecánico (tabla diaria
del SII), no interpretativo. Mantener un humano en el camino crítico no agrega
criterio, agrega latencia: la latencia humana es el modo de falla demostrado de
este repositorio (este mismo incidente; #719 bloqueado por semanas).

Por eso el alcance del auto-merge es **solo UF** y solo bajo las cinco
condiciones. `ADR-20261010` sigue vigente para el IPC sin cambios.

### Aritmética que justifica el heartbeat

La UF se publica con ~14 días de anticipación, y el gate dispara con
`lag > 14d`. Por lo tanto, tras la última ingesta exitosa el gate tarda **~28
días** en caer. El heartbeat de `actualizadoEl` (10d + 1d de holgura + cadencia
semanal del CI) acota la detección a **~11–17 días**. El heartbeat no es
decorativo: adelanta la detección casi una semana y media, y lo hace antes de
que los usuarios vean una serie incompleta.

## Consequences

- La ingesta de la UF deja de depender de que alguien recuerde ejecutar un
  script. Costo operativo: ~1 corrida semanal corta y ~1 PR/mes (la UF no cambia
  de valor más rápido que su publicación).
- El canal de fallo se vuelve explícito: issue `data-freshness` para fallos
  duros; aserción de avance para fallos silenciosos; `actualizadoEl` para
  workflow deshabilitado o nunca disparado.
- **Nueva dependencia frágil:** el cross-check parsea HTML del SII. Si el
  formato cambia, el cross-check falla y el PR **no** se auto-mergea — degrada a
  revisión humana, no a publicación de dato sin verificar. Riesgo aceptado y
  confinado.
- El guard de inmutabilidad puede bloquear una revisión legítima aguas arriba.
  Es intencional: un cambio de valores históricos exige PR explícito con
  `--allow-value-revision`, no un refresh rutinario.
- **Supersede** el considerando "la serie UF no es objeto de esta remediación"
  de `ADR-20261010-monthly-ipc-ingestion`. El resto de ese ADR (IPC) queda
  intacto.
- Riesgo residual: un runner self-hosted caído retrasa la ingesta. Lo cubre el
  heartbeat, no una esperanza.

## Alternatives considered

- **Extender `refresh-ipc-history.yml`** — rechazado: su cron es mensual
  (días 8–12) y su primer paso falla sin secretos `BCCH_USER`/`BCCH_PASSWORD`,
  que la UF no necesita. Mezclar cadencias exigiría pasos condicionales en un
  workflow que hoy funciona.
- **Que el Worker commitee la serie** — rechazado por ahora: la serie es dato
  editorialmente sensible y la actualización revisable es un requisito
  establecido. Además obliga al Worker a manejar un archivo de ~640 KB.
  Reevaluar si el auto-merge verificado demuestra que la revisión humana no
  aporta.
- **Ingesta manual / sin cron** — rechazado: es exactamente lo que falló.
- **Cron diario** — rechazado: la UF se publica con anticipación; semanal ya
  mantiene el rezago máximo por debajo de la mitad del umbral.
- **Bajar `UF_SERIES_MAX_LAG_DAYS`** — rechazado por principio: ajustar el
  umbral al desorden del pipeline es *gaming* del gate, no una corrección.
- **Mantener merge humano obligatorio** — rechazado por la razón expuesta
  arriba: convierte "no hay ingesta" en "hay ingesta que depende de que un
  humano aparezca en 14 días", y la evidencia local muestra que ese plazo no se
  cumple.
- **Workflow reutilizable con matriz de indicadores** — correcto a largo plazo,
  prematuro hoy: refactorizar `refresh-ipc-history.yml` en la misma semana en
  que se estabiliza agrega riesgo sin beneficio inmediato. Queda como deuda
  técnica con disparador: "cuando ambos workflows lleven 2 ciclos verdes".

## Verification

- `pnpm run check:economic-snapshot-freshness` — exit 0 con la serie al día; y
  exit 1 con un fixture de `actualizadoEl` > 11 días.
- `pnpm exec vitest run tests/scripts/check-economic-snapshot-freshness.test.ts`
  — incluye el test de regresión de metadato adelantado clonado del caso IPC, y
  los casos nuevos de heartbeat.
- `pnpm exec vitest run tests/data/economic-history.test.ts
  tests/data/uf-sidecars.test.ts tests/pages/uf-historico-lookup.test.ts`
  — el guard de inmutabilidad con un fixture de valor alterado debe abortar con
  exit 1 y mensaje accionable.
- `workflow_dispatch` manual del workflow: con serie al día no debe abrir PR;
  con la serie truncada a mano en una rama de prueba debe abrir PR y sincronizar
  el issue.
- `pnpm run check:ci` y `pnpm run build` (post-build: `check:rss`,
  `check:urls:ci`, `check:indexable-url-freeze`).

## Follow-ups

- Convertir `Status` a `Accepted` cuando el workflow, el heartbeat y el guard
  estén en `main` y hayan corrido un ciclo verde.
- Deuda técnica con disparador: unificar ambos workflows de ingesta en un
  workflow reutilizable con matriz de indicadores tras 2 ciclos verdes.
- Registrar en `docs/operations/ops-schedule.json` la revisión semanal del
  issue `data-freshness` si el owner quiere visibilidad en el calendario único.

## Amendment 2026-11-18 — heartbeat por horizonte, no por avance semanal

El control 2 de la sección *Decision* ("el workflow falla si la última fecha
ingerida no avanzó respecto de `HEAD`") produjo un falso positivo estructural.
El 2026-11-16 el run programado falló con:

```
La serie no avanzó (antes 2026-12-09, ahora 2026-12-09).
```

La serie ya estaba 23 días por delante de la fecha de corrida: el BCCh publica
la UF con varias semanas de anticipación, así que una semana sin fechas nuevas
es el comportamiento normal del emisor, no una ingesta rota. Un heartbeat que
exige movimiento semanal marca rojo permanente mientras la fuente esté
adelantada.

**Decisión:** la aserción mide el **horizonte de publicación**, no el
movimiento:

- falla si la última fecha **retrocede** respecto de `HEAD` (regresión de
  datos);
- falla si la última fecha queda **por detrás de `hoy + UF_MIN_HORIZON_DAYS`**
  (por defecto 10 días, configurable como variable de repositorio);
- si la serie ya cubre el horizonte, no exige fechas nuevas.

**Ventana residual aceptada:** con el lead observado (~23 días) y un horizonte
de 10 días, una ingesta congelada tarda ~13 días en ponerse roja. Es comparable
al umbral de 14 días de `check-economic-snapshot-freshness` y elimina el rojo
permanente. Si se necesita detección exacta (sin depender del lead del emisor),
el follow-up es persistir `ultimoAvanceEl` en el histórico y fallar cuando
`hoy - ultimoAvanceEl > 14`; requiere cambio de esquema del JSON y no se hace
en este bugfix.

**Verificación:** tabla de casos con reloj fijo — serie `hoy+23` → verde;
`hoy+2` → rojo; `hoy-1` (retroceso) → rojo; serie idéntica dentro del horizonte
→ verde.
