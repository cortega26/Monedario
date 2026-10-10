# ADR-20261010-monthly-ipc-ingestion

Date: 2026-10-10
Status: Accepted

## Context

La calculadora `/calculadoras/actualizador-inflacion/` usa
`src/data/economic-history/ipc-historico.json` (variación mensual IPC, 2000 →
presente). El snapshot económico que refresca el Worker
(`ADR-20260516-economic-snapshot-cloudflare-worker`) ya publicaba septiembre
2026 (`0,4%`, INE 2026-10-08) mientras la serie seguía en agosto: 26.699
impresiones y 64 clics en 27 días recibieron cálculos que omitían el último
mes. La ingesta (`scripts/fetch-economic-history.mjs`) requiere la extensión
oficial del BCCh (`G073.IPC.VAR.2023.M`) porque mindicador.cl dejó de publicar
IPC tras dic-2025 (`TD-0112`), pero era manual y sin guardas: sin credenciales
BCCh el script reescribía la serie mindicador-only terminando en 2025-12,
borrando 8 meses oficiales de forma silenciosa.

## Decision

1. **Guard anti-regresión por conjunto de fechas** en la ingesta
   (`findMissingDates` en `scripts/economic-history-ipc.mjs`): si alguna
   `fecha` existente en disco desaparece de la serie nueva, el script aborta
   (exit 1) salvo `--allow-series-shrink` explícito.
2. **Frescura anclada al dato real**: `check-economic-snapshot-freshness`
   compara la última entrada de `serie` (fallback a `hastaFecha` solo si la
   serie está vacía o ausente). Un metadato adelantado ya no puede enmascarar
   un rezago real. La rama UF conserva su comparación por metadatos
   (asimetría deliberada: su serie no es objeto de esta remediación).
3. **Workflow mensual `refresh-ipc-history.yml`**: cron `0 13 8-12 * *` UTC
   (primera semana tras la publicación del INE) + `workflow_dispatch`. Corre
   la ingesta con secretos `BCCH_USER`/`BCCH_PASSWORD`, ejecuta la frescura
   **incondicionalmente** después de ingerir, abre un PR revisable (branch
   `chore/refresh-ipc-history`, sin auto-merge) y sincroniza un issue
   `data-freshness` (se abre en fallo, se cierra en verde). `HUSKY=0` evita
   que los hooks de pre-commit intervengan el commit del bot.

### Por qué GitHub Actions + PR (no el Worker ni auto-merge)

El Worker commitea el snapshot directo a `main`; extenderlo a la serie
histórica violaría el requisito de "actualización revisable" (el dato
editorialmente sensible debe pasar por PR). El runner self-hosted del repo
hace el costo en minutos despreciable, y el workflow es un canal separado del
`PLAN-migrate-scheduled-jobs-off-github-actions`: ese plan apunta a jobs
programados de bajo valor; este es un control de frescura YMYL con
notificación. La desviación del patrón `enable-safe-automerge` es deliberada:
el PR puede traer un valor nuevo publicado por el INE y la revisión humana
verifica el número contra la fuente antes de que los usuarios lo vean.

### Correcciones (§5.4)

Un refresh de datos oficiales ya publicados no es una "corrección de error"
bajo `NORMA_YMYL §5.4`: la página se declaraba "al día" contra el corte de su
propia serie y, cuando iba atrás, mostraba el aviso fail-closed. Precedente
directo: `TD-0112` agregó 8 meses de 2026 sin registro en
`src/data/correcciones.json`. Este refresh sigue el mismo criterio y no se
registra; si el owner lo interpreta distinto, es una línea en el registro.

## Consequences

- La serie entra a `main` con latencia de revisión humana; el nuevo vector de
  staleness queda cubierto por el issue `data-freshness` y por el
  `check:economic-snapshot-freshness` del CI programado semanal.
- Los fallos de credenciales/red del BCCh dejan de ser no-ops silenciosos.
- `check:economic-snapshot-freshness` ahora falla si `serie` retrocede aunque
  el metadato diga lo contrario (tests de regresión en
  `tests/scripts/check-economic-snapshot-freshness.test.ts`).
- Costo operativo: ~5 corridas cortas al mes; sin PR cuando no hay diff.

## Alternatives considered

- **Commit directo desde el Worker** — rechazado: sin revisión humana.
- **Auto-merge del PR** — rechazado: el valor mensual nuevo debe cotejarse
  contra el INE antes de publicarse; el volumen es 1 PR/mes.
- **Guard solo por `hastaFecha`** — rechazado: no detecta huecos internos ni
  borrados de meses ya ingestados.
- **Flag `--require-ipc-extension`** — rechazado: redundante con el guard por
  fechas + la frescura incondicional; un fallo de extensión con snapshot ya
  actualizado igualmente abre issue.
- **Registrar en `correcciones.json`** — rechazado por el criterio y
  precedente de §5.4 descritos arriba.

## Verification

- `pnpm exec vitest run tests/data/economic-history.test.ts
  tests/scripts/economic-history-ipc.test.ts
  tests/scripts/check-economic-snapshot-freshness.test.ts`
- `pnpm run check:economic-snapshot-freshness` (exit 0 con la serie en
  `2026-09-01`).
- `pnpm run build` + inspección de
  `dist/calculadoras/actualizador-inflacion/index.html` (`"last":"2026-09"`,
  copy de datos actualizados a septiembre 2026, sin aviso de serie atrasada).
- `pnpm run check:ci`.
