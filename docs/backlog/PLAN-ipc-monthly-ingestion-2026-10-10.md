# PLAN — Ingesta mensual del IPC y serie al día (P1, 2026-10-10)

- **Estado:** DONE — mergeado en #663 (`8d474013`, 2026-10-10)
- **Owner:** Sin asignar
- **Origen:** defecto de producción confirmado — la calculadora
  `/calculadoras/actualizador-inflacion/` usa IPC solo hasta agosto 2026
  mientras el snapshot ya publica septiembre (INE, +0,4% del 2026-10-08).
- **Rama base:** `main@2b552bfe` (`origin/main`; el checkout local estaba 20
  commits atrás).
- **Segunda opinión:** `control-plane-advisor` (GLM 5.3) — verdicto
  `APPROVE_WITH_CHANGES`; los 5 cambios requeridos están incorporados.

## Evidencia del defecto

- Snapshot (origin/main): `ipc: 0.4`, `indicatorUpdatedAt.ipc: 2026-09-01`,
  `capturedAt: 2026-10-10`.
- Serie (origin/main): 320 entradas, `hastaFecha: 2026-08-01`, ago = 0.6.
- `pnpm run check:economic-snapshot-freshness` sobre el árbol post-merge:
  FAIL con `ipc-historico.json llega a 2026-08 pero el snapshot publica
  2026-09` (capturado antes de la ingesta).
- La calculadora renderiza el aviso ámbar "el INE ya publicó el IPC de
  septiembre 2026".

## Scope

**In-scope:** `src/data/economic-history/ipc-historico.json`,
`scripts/fetch-economic-history.mjs`, `scripts/check-economic-snapshot-freshness.mjs`,
`tests/data/economic-history.test.ts`, `tests/scripts/check-economic-snapshot-freshness.test.ts`,
`.github/workflows/refresh-ipc-history.yml` (nuevo), `docs/adr/`, este plan,
`docs/operations/ops-schedule.json`, `spec.md`, `todo.md`.

**Out-of-scope:** páginas/copy de calculadoras, otras series (UF/UTM),
worker `economic-snapshot-refresh`, contenido editorial, correcciones.json,
rutas/URLs/RSS.

## Fases y decisiones

1. **FF a `origin/main`** (`git merge --ff-only`): el diff trae 36 artículos,
   `data-signals` y los snapshots del worker; no toca scripts/tests/workflows.
2. **Ingesta** `pnpm run fetch:economic-history --solo=ipc` (mindicador +
   extensión BCCh `G073.IPC.VAR.2023.M` con credenciales de `.env.local`).
   Diff esperado y único: `+{fecha:"2026-09-01", valor:0.4}`,
   `totalEntradas 320→321`, `hastaFecha`, `actualizadoEl`, `fuente/nota`.
   Cualquier otro cambio ⇒ HALT y escalar divergencia de fuente.
3. **Guard anti-regresión** en `fetch-economic-history.mjs`: no escribir el
   archivo si alguna `fecha` existente en disco desaparece de la nueva serie
   (hoy, sin credenciales BCCh, el script reescribe la serie mindicador-only
   que termina en 2025-12 y borraría los 8 meses 2026). Flag de override
   explícito para encogimientos intencionales.
4. **Endurecer `check-economic-snapshot-freshness.mjs`**: comparar contra la
   última entrada real de `serie` (fallback a `hastaFecha` si falta), no solo
   contra metadatos. No se toca la rama UF (asimetría documentada en el ADR).
5. **Tests de regresión:** entrada `2026-09-01 → 0.4` en el dataset real;
   escenario `hastaFecha=sept` + `serie` termina en ago ⇒ FAIL.
6. **Workflow mensual** `refresh-ipc-history.yml`: cron `0 13 8-12 * *` UTC +
   `workflow_dispatch`; ingesta con `secrets.BCCH_USER/BCCH_PASSWORD`;
   `check:economic-snapshot-freshness` corre incondicionalmente después de la
   ingesta; PR revisable (sin auto-merge) vía `peter-evans/create-pull-request`;
   issue close-on-green vía `.github/actions/upsert-issue-by-title`
   (label `data-freshness`); `HUSKY=0` en el commit del bot; runner label
   `vars.ACTIONS_RUNNER_LABEL`.
7. **ADR** del cambio de CI: por qué GHA+PR (el worker commitea a main sin
   PR, lo que violaría "reviewable update"), desviación de no-auto-merge
   respecto de `enable-safe-automerge`, razonamiento §5.4 (refresh de dato
   oficial publicado no es "corrección"; precedente TD-0112 con 8 meses
   agregados sin registro), asimetría rama UF.
8. **Registro operativo:** ítem recurrente mensual en
   `docs/operations/ops-schedule.json` (recordatorio post-día 8).

## Riesgos y rollback

- **Merge lento del PR** se vuelve el nuevo vector de staleness; lo cubren el
  issue de fallo y el CI programado semanal.
- **Divergencia BCCh ≠ 0.4** o diff inesperado ⇒ HALT, no editar a mano.
- Rollback: `git checkout -- src/data/economic-history/ipc-historico.json` y
  revertir workflow/ADR; el snapshot no se toca.

## Progress log

- [x] 2026-10-10 — Reconocimiento, verificación del defecto, advisor
  (APPROVE_WITH_CHANGES), artefactos creados.
- [x] 2026-10-10 — FF a `2b552bfe`; check de frescura FAIL capturado
  (`ipc-historico.json llega a 2026-08 pero el snapshot publica 2026-09`).
- [x] 2026-10-10 — Guard por fechas (`findMissingDates` + abort con
  `--allow-series-shrink`) e ingesta `--solo=ipc`: 321 entradas, diff exacto
  (+`2026-09-01:0.4`, metadata). Valor cotejado con INE (0,4%, 2026-10-08).
- [x] 2026-10-10 — Check endurecido a la última entrada real de `serie`;
  tests de dataset y de frescura (43 verdes).
- [x] 2026-10-10 — Workflow `refresh-ipc-history.yml`, ADR, ops-schedule y
  README de ADR.

## Verificación (2026-10-10)

| # | Comando / evidencia | Resultado |
|---|---------------------|-----------|
| 1 | Check de frescura pre-fix (árbol post-merge) | FAIL: `ipc-historico.json llega a 2026-08 pero el snapshot publica 2026-09` |
| 2 | Ingesta `--solo=ipc` | 321 entradas; diff exacto: `+2026-09-01:0.4`, `hastaFecha`, `totalEntradas`, `actualizadoEl` |
| 3 | Cotejo INE (ine.gob.cl, 2026-10-08) | "IPC de septiembre presentó una variación mensual de 0,4%" |
| 4 | Guard sin credenciales BCCh (`BCCH_USER= BCCH_PASSWORD=`) | exit 1, archivo intacto (md5 igual); perdería 9 fechas |
| 5 | `pnpm exec vitest run` (dataset + helpers + frescura) | 43/43 verdes |
| 6 | `pnpm run check:economic-snapshot-freshness` | exit 0 "OK" |
| 7 | `pnpm run check:docs` | OK (adrFiles=61) |
| 8 | `pnpm run build` en worktree aislado (solo este diff) | verde; `check:urls` 0 roto; postbuild 24 checks |
| 9 | Dist: `dist/calculadoras/actualizador-inflacion/index.html` | `"last":"2026-09"`, `"fecha":"2026-09-01","valor":0.4`, copy "Datos actualizados al septiembre 2026", 0 avisos de serie atrasada |
| 10 | Cálculo directo con la serie real (100.000 de 2025-09) | factor 1,045835 / 13 meses → $104.584 |
| 11 | `pnpm run check:ci` en worktree aislado | verde salvo `check:editorial-timeliness` (SLA vencidos 2026-10-09 y UTM en 3 artículos): **idéntico FAIL en HEAD limpio**, preexistente y fuera de scope |
| 12 | `check:hero-prompts` | falla solo en el árbol principal por ediciones editoriales sin commit de otra sesión; verde en worktree |

**Notas de alcance:** no se registró en `src/data/correcciones.json` por
criterio §5.4 + precedente TD-0112 (ver ADR). `check:ci` del árbol principal
no puede quedar 100% verde mientras existan las ediciones editoriales en
curso de otra sesión; la evidencia aislada del diff es la referencia.
