# Plan 079: Validar el snapshot económico y los artefactos de data-signals al llegar a `main`

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- .github/workflows/data-signals.yml .github/workflows/refresh-economic-snapshot.yml workers/economic-snapshot-refresh/src/githubClient.ts`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none (pero NO convierte a los bots a PRs — ver Alcance)
- **Category**: governance/ci (escribidores directos a `main`)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Progress

- 2026-08-11 — Implementación completa (sin commit/merge aún, a la espera del
  operador): validador + 8 tests + workflow + `[skip ci]` removido +
  `check:committed-artifacts`. Verificado: exit 0 sobre el repo real, suite
  1322/1322, format + lint verdes. Adversarial check: el worker de snapshot
  commitea con `COMMIT_MESSAGE = "chore(editorial): refresh economic snapshot
  (worker)"` (sin `[skip ci]` en `wrangler.toml:20`) — el push del worker
  dispara el validador en la ruta crítica. Los 119 JSON de data-signals parsean.

## Por qué importa

Dos botas escriben directo a `main` sin pasar por CI: el worker de snapshot
económico (`githubClient.ts` → Contents API, 3×/día, archivo build-crítico
`src/infrastructure/economic/economic-parameters.snapshot.json` que Cloudflare
Pages auto-despliega) y el job de data-signals (`.github/workflows/data-signals.yml:219-232`,
commit con `[skip ci]` que **opta fuera de CI**). Un snapshot malformado
(JSON roto, valor NaN, fecha inválida) despliega a producción sin ningún
chequeo — la clase de fallo silencioso que el repo más teme. Este plan NO
cambia el mecanismo de escritura (los PRs romperían la SLA de frescura 3×/día
y es decisión de governance); agrega una **validación ligera post-push** que
falle rápido y ruidosamente.

## Estado actual

- `workers/economic-snapshot-refresh/src/githubClient.ts:69-96`: `putFile` vía
  Contents API con `message: args.message`, `branch: config.branch` (main),
  committer `monedario-snapshot-bot`.
- `.github/workflows/data-signals.yml:219-232`:
```yaml
          git add output/operations/data-signals/
          if git diff --cached --quiet; then
            echo "No new signal files to commit."
          else
            git commit -m "data-signals: $WEEK [skip ci]"
            git push
          fi
```
- `ci.yml` no tiene trigger `push:` — los commits directos nunca corren CI.
- Existe `scripts/check-economic-snapshot-freshness.mjs` (fechas/frescura) —
  valida el snapshot **trackeado** pero solo en schedule.
- `output/operations/data-signals/` — artefactos JSON/CSV semanales.

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Validador (local) | `node scripts/validate-committed-artifacts.mjs` | exit 0 sobre el repo actual |
| Suite | `pnpm test` | todos pasan |
| Tests del validador | `pnpm exec vitest run tests/scripts/validate-committed-artifacts.test.ts` | todos pasan |

## Alcance

**En alcance**:
- `scripts/validate-committed-artifacts.mjs` (nuevo)
- `tests/scripts/validate-committed-artifacts.test.ts` (nuevo)
- `.github/workflows/validate-committed-artifacts.yml` (nuevo — trigger `push: branches: [main]`, paths filtrados)
- `.github/workflows/data-signals.yml` (quitar `[skip ci]` del mensaje de commit)
- `package.json` (script `check:committed-artifacts`)

**Fuera de alcance** (NO tocar):
- Convertir los bots a PRs (decisión de governance — ver Maintenance)
- El worker (ningún cambio de código en `githubClient.ts`)
- `data-signals.yml` salvo la línea `[skip ci]`
- Los gates de frescura existentes

## Git workflow

- Rama: `advisor/079-push-validation`
- Commit: `feat(ci): validar artefactos commiteados a main (snapshot económico y data-signals)`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Escribir el validador

`scripts/validate-committed-artifacts.mjs` (estilo `check-*.mjs` del repo,
mensajes `archivo:regla`):

1. **Snapshot económico** (`src/infrastructure/economic/economic-parameters.snapshot.json`):
   - parsea JSON (error → FAIL con el error del parser).
   - campos numéricos finitos: `uf`, `utm`, `uta` (si presente), `ipc` (si
     presente), `tmc` (si presente), `dolar` (si presente) — `Number.isFinite`.
   - `indicatorUpdatedAt`: si `utm` está presente, debe matchear
     `^\d{4}-\d{2}-\d{2}$`.
2. **Artefactos data-signals** (`output/operations/data-signals/`):
   - todo archivo `*.json` del directorio (recursivo, excluyendo `**/node_modules`)
     parsea como JSON válido.
3. Exit 0 si todo ok; exit 1 con el primer fallo (reporta TODOS los fallos, no
   solo el primero).

**Verificar**: `node scripts/validate-committed-artifacts.mjs` → exit 0 sobre el repo actual.

### Paso 2: Tests del validador

`tests/scripts/validate-committed-artifacts.test.ts` (patrón spawn+fixtures):
1. Snapshot válido → exit 0.
2. Snapshot con JSON roto → exit 1.
3. Snapshot con `utm: "abc"` o `uf: NaN` → exit 1.
4. `indicatorUpdatedAt.utm` con fecha inválida → exit 1.
5. JSON de data-signals roto → exit 1 (fixture en temp dir — el validador
   debe aceptar un root env, p. ej. `VALIDATE_ARTIFACTS_ROOT`, con default al
   repo, patrón de los planes 068/069).
6. Snapshot con campos opcionales ausentes (sin `dolar`) → exit 0.

**Verificar**: `pnpm exec vitest run tests/scripts/validate-committed-artifacts.test.ts` → todos pasan.

### Paso 3: Workflow de validación post-push

`.github/workflows/validate-committed-artifacts.yml` (nuevo):
```yaml
name: Validate committed artifacts

on:
  push:
    branches: [main]
    paths:
      - "src/infrastructure/economic/economic-parameters.snapshot.json"
      - "output/operations/data-signals/**"

permissions:
  contents: read

concurrency:
  group: validate-committed-artifacts
  cancel-in-progress: false

jobs:
  validate:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - name: "📦 Setup Node 22"
        uses: actions/setup-node@<sha-pinned-version>  # usa la versión SHA-pineada que usen los otros workflows
        with:
          node-version: 22
      - name: "🧾 Validate committed artifacts"
        run: node scripts/validate-committed-artifacts.mjs
```
(pinea `actions/setup-node` al SHA usado en `.github/actions/bootstrap-pnpm` o
al que usen los workflows existentes — réplica la convención del repo).

### Paso 4: Quitar `[skip ci]` del commit de data-signals

En `data-signals.yml:226`, cambia el mensaje a
`git commit -m "data-signals: $WEEK"` (sin `[skip ci]`) para que el push
dispare el validador. El validador es barato (<1 min) y cubre el caso del
artefacto roto.

**Verificar**: `grep -n "skip ci" .github/workflows/data-signals.yml` → sin matches.

### Paso 5: Cablear en package.json y gates finales

- `package.json`: `"check:committed-artifacts": "node scripts/validate-committed-artifacts.mjs"`.
- **Verificar**:
  - `pnpm run check:committed-artifacts` → exit 0
  - `pnpm test` → todos pasan
  - `pnpm run format:check` → exit 0
  - `git status` → solo archivos en alcance

## Test plan

- 6 casos en `tests/scripts/validate-committed-artifacts.test.ts` (patrón
  spawn+fixtures de check-obs01-freeze.test.ts).
- El validador corre contra el repo real en CI (Paso 3) y local (Paso 5).

## Done criteria

- [ ] `scripts/validate-committed-artifacts.mjs` valida snapshot + JSON de data-signals
- [ ] Workflow nuevo con trigger `push` + paths filtrados
- [ ] `data-signals.yml` sin `[skip ci]`
- [ ] 6 tests pasando; `node scripts/validate-committed-artifacts.mjs` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- `output/operations/data-signals/` contiene JSON deliberadamente no-parseable
  (p. ej. plantillas) — ajusta el validador para ese caso y anótalo.
- El snapshot actual del repo falla la validación (deriva real) — NO lo
  edites: reporta el campo exacto y deja el validador a la espera del
  próximo refresh del worker.
- Algún workflow existente ya tiene un job de validación post-push que
  duplique esto — reconcilia (reporta la ubicación).
- Cambiar a PRs aparece como la solución "correcta" — NO: es governance, se
  reporta como recomendación separada.

## Maintenance notes

- La conversión de ambos bots a PR + auto-merge sigue abierta como decisión de
  governance (trade-off: SLA de frescura 3×/día vs gate completo). Si se hace,
  el `[skip ci]` no debe reaparecer y el validador puede moverse al PR.
- Cualquier nuevo archivo build-crítico escrito por bots debe sumarse a los
  `paths` del workflow.
- En review: verificar que el validador no depende de la red y que el
  workflow no usa `permissions: write` (no debe poder auto-commitea).
