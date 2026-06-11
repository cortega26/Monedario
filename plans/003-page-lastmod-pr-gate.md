# Plan 003: Convertir page-lastmod.yml a patrón PR-gate (en vez de push directo a main)

> **Executor instructions**: Sigue este plan paso a paso. Ejecuta cada comando
> de verificación antes de pasar al siguiente. Si ocurre cualquier condición de
> STOP, detente y reporta — no improvises. Al terminar, actualiza la fila de
> estado en `plans/README.md`.
>
> **Drift check (ejecutar primero)**:
> `git diff --stat 8256c9d2..HEAD -- .github/workflows/page-lastmod.yml .github/workflows/self-heal.yml`
> Si alguno de los dos archivos cambió desde que se escribió el plan, compara
> los excerpts de "Estado actual" con el código vivo. Si no coinciden, STOP.

## Estado

- **Prioridad**: P2
- **Esfuerzo**: M
- **Riesgo**: MED (toca dos workflows en producción)
- **Depende de**: ninguno (puede ejecutarse en paralelo con 001 y 002)
- **Categoría**: dx / governance
- **Planned at**: commit `8256c9d2`, 2026-06-11

## Por qué importa

`page-lastmod.yml` hace `git push` directo a `main` cada vez que cambia un
archivo bajo `src/pages/**`. Esto bypasea el gate CI: si `build-page-lastmod.mjs`
produjera un output erróneo (por un bug en el script o por una race condition
de git), el archivo `context/page-lastmod-index.json` quedaría corrupto en
`main` sin que ningún test lo haya revisado.

`self-heal.yml` — el otro workflow mecánico del repo — usa el patrón correcto:
crea un PR con `peter-evans/create-pull-request`, corre CI, y hace squash
auto-merge cuando está verde. Además, `self-heal.yml` ya ejecuta
`node scripts/build-page-lastmod.mjs` como uno de sus pasos (lo que duplica
el trabajo). Este plan convierte `page-lastmod.yml` al patrón PR-gate y
elimina la duplicación en `self-heal.yml`.

## Estado actual

**`page-lastmod.yml` completo** (44 líneas):
```yaml
name: Page lastmod index

on:
  push:
    branches: [main]
    paths:
      - "src/pages/**"

concurrency:
  group: page-lastmod-${{ github.ref }}
  cancel-in-progress: false

permissions:
  contents: write

jobs:
  refresh:
    name: Refresh page-lastmod index
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: Checkout
        uses: actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10 # v6.0.3
        with:
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version: "24"

      - name: Regenerate index
        run: node scripts/build-page-lastmod.mjs

      - name: Commit if changed
        shell: bash
        run: |
          set -euo pipefail
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add context/page-lastmod-index.json
          if git diff --cached --quiet; then
            echo "page-lastmod: index already up to date."
          else
            git commit -m "chore: refresh page-lastmod index"
            git push
        fi
```

**Step de `self-heal.yml` a eliminar** (`self-heal.yml:95-96`):
```yaml
      - name: "🕒 Regenerate page-lastmod index"
        run: node scripts/build-page-lastmod.mjs
```
Este step está en el job `self-heal` de `self-heal.yml`, junto con los demás
fixers mecánicos. Dado que `page-lastmod.yml` ya maneja la regeneración
triggereada por cambios en páginas, el step en self-heal es redundante y puede
causar PRs conflictivos si ambos workflows se disparan en la misma ventana.

**Acciones externas ya pineadas en el repo** (usar exactamente estos SHAs):
- `peter-evans/create-pull-request@5f6978faf089d4d20b00c7766989d076bb2fc7f1 # v8.1.1`
- `./.github/actions/enable-safe-automerge` (acción local — no cambia)

**Permisos usados en `self-heal.yml`** (referencia para el nuevo permissions block):
```yaml
permissions:
  contents: write
  pull-requests: write
  issues: write
```
`page-lastmod.yml` solo necesita `contents: write` (checkout) y
`pull-requests: write` (crear PR). No necesita `issues: write`.

## Comandos necesarios

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Validar YAML | `python3 -c "import yaml, sys; yaml.safe_load(open('.github/workflows/page-lastmod.yml'))"` | exit 0, sin output |
| Validar YAML self-heal | `python3 -c "import yaml, sys; yaml.safe_load(open('.github/workflows/self-heal.yml'))"` | exit 0, sin output |
| Formato | `pnpm run format:check` | exit 0 |
| Tests | `pnpm test` | exit 0 |
| Verificar sin step duplicado | `grep "build-page-lastmod" .github/workflows/self-heal.yml` | sin output |

## Scope

**En scope** (los únicos archivos a modificar):
- `.github/workflows/page-lastmod.yml` — reemplazar completamente
- `.github/workflows/self-heal.yml` — eliminar el step de `build-page-lastmod`

**Fuera de scope** (NO tocar):
- `scripts/build-page-lastmod.mjs` — el script no necesita cambios
- `context/page-lastmod-index.json` — no tocar; se regenera vía workflow
- Código de aplicación bajo `src/`
- Cualquier otro workflow

## Flujo git

- Rama: `fix/page-lastmod-pr-gate`
- Commit: un solo commit con los 2 archivos. Mensaje:
  `fix(ci): convert page-lastmod to PR-gate; remove duplicate step from self-heal`
- NO hacer push ni PR a menos que el operador lo pida.

## Pasos

### Paso 1: Reemplazar `page-lastmod.yml` con la versión PR-gate

Reemplaza el contenido completo de `.github/workflows/page-lastmod.yml` con:

```yaml
name: Page lastmod index

# Regenerates context/page-lastmod-index.json after page files change on main,
# so the sitemap carries accurate <lastmod> for calculators, guide hubs and
# static pages. The index must be committed because the production build runs
# on a shallow clone where git history is unavailable.
#
# Opens a reviewable PR (auto-squash-merges when CI is green) instead of
# pushing directly to main. Follows the same pattern as self-heal.yml.

env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true

on:
  push:
    branches: [main]
    paths:
      - "src/pages/**"

concurrency:
  group: page-lastmod-${{ github.ref }}
  cancel-in-progress: false

permissions:
  contents: write
  pull-requests: write

jobs:
  refresh:
    name: Refresh page-lastmod index
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: Checkout
        uses: actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10 # v6.0.3
        with:
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version: "24"

      - name: Regenerate index
        run: node scripts/build-page-lastmod.mjs

      - name: Create pull request
        id: create-pr
        uses: peter-evans/create-pull-request@5f6978faf089d4d20b00c7766989d076bb2fc7f1 # v8.1.1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: "chore: refresh page-lastmod index"
          title: "chore: refresh page-lastmod index"
          body: |
            Automated regeneration of `context/page-lastmod-index.json` after a
            page file changed on main.

            - Trigger: push to `src/pages/**` on main.
            - Script: `node scripts/build-page-lastmod.mjs`

            No content, route, RSS, or contract changes. Runs through the CI gate
            and squash auto-merges when green. A clean tree produces no PR.
          branch: chore/page-lastmod-index
          delete-branch: true

      - name: Attempt safe auto-merge
        if: steps.create-pr.outputs.pull-request-number != ''
        uses: ./.github/actions/enable-safe-automerge
        with:
          pull-request: ${{ steps.create-pr.outputs.pull-request-number }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

**Nota sobre `setup-node@v6`**: este plan no pina el SHA porque el plan 002
cubre ese cambio. Si el plan 002 ya se ejecutó, usa el SHA pineado que ese plan
instaló. Si todavía no se ejecutó, deja `@v6` — no bloquea este plan.

**Verifica** que el YAML es válido:
```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/page-lastmod.yml'))"
```
Resultado esperado: exit 0, sin output.

### Paso 2: Eliminar el step duplicado de `self-heal.yml`

En `self-heal.yml`, localiza y elimina únicamente estas 2 líneas (el step de
regeneración del índice de lastmod):
```yaml
      - name: "🕒 Regenerate page-lastmod index"
        run: node scripts/build-page-lastmod.mjs
```

Para ubicarlas con exactitud:
```bash
grep -n "page-lastmod\|build-page-lastmod" .github/workflows/self-heal.yml
```
El resultado te dará el número de línea exacto.

El step está en el bloque de "fixers deterministas" entre `scan-articles.mjs`
y el bloque de creación del PR. Elimina solo esas 2 líneas; no toques los steps
de arriba ni de abajo.

**Verifica** que el step ya no existe:
```bash
grep "build-page-lastmod" .github/workflows/self-heal.yml
```
Resultado esperado: sin output.

**Verifica** que el YAML de `self-heal.yml` sigue siendo válido:
```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/self-heal.yml'))"
```
Resultado esperado: exit 0, sin output.

### Paso 3: Actualizar el body del PR en `self-heal.yml`

El body del PR de `self-heal.yml` lista los pasos que ejecuta. Ahora que
eliminas `build-page-lastmod.mjs`, actualiza la lista en el campo `body:`:

Elimina esta línea del body (aprox. línea 112 de `self-heal.yml`):
```
            - `node scripts/build-page-lastmod.mjs`
```

Para ubicarla:
```bash
grep -n "build-page-lastmod" .github/workflows/self-heal.yml
```
(Si el paso 2 ya la eliminó del step, este grep puede no dar resultado.
Busca entonces en el bloque `body:` del step `create-pr`.)

**Verifica** que el body no menciona el script:
```bash
grep "build-page-lastmod" .github/workflows/self-heal.yml
```
Resultado esperado: sin output.

### Paso 4: Verificar formato y tests

```bash
pnpm run format:check
```
Resultado esperado: exit 0.

```bash
pnpm test
```
Resultado esperado: exit 0, **689 tests pasando** (línea base verificada).
Si algún test de e2e valida la estructura de `self-heal.yml` o
`page-lastmod.yml`, revisa que siga pasando. El test en
`tests/e2e/refresh-snapshot-workflow.e2e.test.ts` puede ser relevante —
léelo si falla para entender qué verifica.

## Plan de tests

No hay tests de unidad para los archivos de workflow. La verificación correcta
es funcional: el PR se abre cuando cambia una página en main, corre CI, y se
auto-mergea. Eso se validará en la próxima ejecución real del workflow.

Si existe el test `tests/e2e/run-command-with-log-action.e2e.test.ts` o similar
que valida la estructura de workflows, verifica que pase antes de declarar done.

## Criterios de cierre

- [ ] `grep "build-page-lastmod" .github/workflows/self-heal.yml` → sin output
- [ ] `page-lastmod.yml` contiene `peter-evans/create-pull-request@5f6978faf089d4d20b00c7766989d076bb2fc7f1`
- [ ] `page-lastmod.yml` contiene `enable-safe-automerge`
- [ ] `page-lastmod.yml` NO contiene `git push` ni `git commit`
- [ ] Los YAML de ambos archivos son válidos (python3 yaml.safe_load sin error)
- [ ] `pnpm run format:check` exit 0
- [ ] `pnpm test` exit 0 (689 tests pasando)
- [ ] Ningún archivo fuera del scope fue modificado (`git diff --name-only HEAD`)
- [ ] Fila de estado actualizada en `plans/README.md`

## Condiciones de STOP

- Los excerpts de "Estado actual" no coinciden con el código vivo (el repo
  drifteó desde que se escribió el plan — en particular si `self-heal.yml` ya
  fue modificado para eliminar el step de lastmod, o si `page-lastmod.yml` ya
  fue convertido a PR-gate).
- El YAML de alguno de los dos workflows queda inválido tras la edición y no
  logras identificar el error sintáctico.
- `pnpm test` falla específicamente en tests de e2e de workflows con mensajes
  que sugieren dependencia en la estructura actual de `self-heal.yml`.
- Descubres que `self-heal.yml` tiene más de una referencia a
  `build-page-lastmod.mjs` (lo que sugeriría un diseño diferente al documentado
  aquí) — reporta antes de editar.

## Notas de mantenimiento

- Si en el futuro se agrega un nuevo workflow mecánico que haga push directo a
  main, seguir este mismo patrón: `peter-evans/create-pull-request` +
  `enable-safe-automerge` en vez de `git push`.
- El branch name fijo (`chore/page-lastmod-index`) hace que múltiples disparos
  del workflow en corto tiempo converjan en el mismo PR, evitando acumulación de
  PRs. `peter-evans/create-pull-request` actualiza el PR existente si el branch
  ya existe.
- Si se cambia `scripts/build-page-lastmod.mjs` para depender de módulos npm,
  habrá que agregar el step `bootstrap-pnpm` antes de `Setup Node`.
