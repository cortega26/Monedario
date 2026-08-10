# Plan 066: Scan de secretos real por PR y limpieza del allowlist de gitleaks

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- .github/workflows/security-scans.yml .gitleaks.toml`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security (secret scanning)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

`security-scans.yml` se dispara en `pull_request` pero **los 4 jobs corren
solo en schedule** (`if: github.event_name == 'schedule' || ...`): el check
"Security Scans" aparece verde en cada PR sin ejecutar nada. Un secret
commiteado en un PR se detecta a lo sumo el miércoles siguiente, post-merge, y
solo como summary de un job con `continue-on-error: true` — sin issue, sin
bloqueo. Además `.gitleaks.toml` allowlista `.env` y `.env.local`:
exactamente los archivos que más importa detectar (si se commitean, están en
`git archive` y gitleaks los escanearía — la allowlist los oculta). El costo
de un job gitleaks por PR sobre el diff es ~1 minuto de Actions; el costo de
un PAT filtrado es una rotación de emergencia.

## Estado actual

- `.github/workflows/security-scans.yml:7-13` — trigger `pull_request`
  (opened/edited/synchronize/reopened) + `workflow_dispatch` + `schedule`.
- `:32-33` (gitleaks): `continue-on-error: true` + `if: github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'`. Mismo patrón en opengrep (`:92-93`), trivy (`:154`) y pip-audit (`:214-215`). El comentario en `:31` dice: "Per-PR scanning was removed to conserve GitHub Actions minutes."
- `:56`: gitleaks corre sobre `git archive --format=tar HEAD` (rama por defecto, post-merge).
- `.gitleaks.toml:5-7`:
```toml
paths = [
  '''(^|/)\.claude/''',
  '''(^|/)\.env$''',
  '''(^|/)\.env\.local$''',
  ...
```

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Validar YAML del workflow | `node -e "require('js-yaml').load(require('fs').readFileSync('.github/workflows/security-scans.yml','utf8'))"` (o el parser usado en `tests/static-analysis/*.e2e.test.ts` — reutilízalo) | parsea sin error |
| Tests de e2e estáticos de workflows | `pnpm exec vitest run tests/static-analysis` | todos pasan (hay tests que inspeccionan los workflows) |

## Alcance

**En alcance**:
- `.github/workflows/security-scans.yml`
- `.gitleaks.toml`
- Tests estáticos de workflows si asertan sobre el trigger (`tests/static-analysis/*.e2e.test.ts`)

**Fuera de alcance** (NO tocar):
- Los otros 3 scans (opengrep/trivy/pip-audit): solo se les quita el trigger
  fantasma si hace falta — NO cambies su `continue-on-error` ni su schedule.
- El runtime de gitleaks (versión 8.30.1 pineada — mantener).
- `.env`, `.env.local`, valores de secrets (nunca reproducir valores).

## Git workflow

- Rama: `advisor/066-secret-scan-pr`
- Commit: `fix(ci): scan gitleaks bloqueante por PR y quitar allowlist de .env`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Añadir job gitleaks bloqueante por PR

En `security-scans.yml`, agrega un job nuevo:
```yaml
  gitleaks-pr:
    name: Secret scan (Gitleaks, PR diff)
    runs-on: ubuntu-latest
    timeout-minutes: 5
    if: github.event_name == 'pull_request'

    steps:
      - name: "☁️ Checkout repository"
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          fetch-depth: 0

      - name: "🔐 Install Gitleaks"
        run: |
          bin_dir="${RUNNER_TEMP}/security-tools/bin"
          mkdir -p "${bin_dir}"
          curl -fsSL https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/gitleaks_8.30.1_linux_x64.tar.gz \
            | tar -xz
          install -m 0755 gitleaks "${bin_dir}/gitleaks"
          echo "${bin_dir}" >> "${GITHUB_PATH}"

      - name: "🕵️ Scan PR diff (blocking)"
        run: |
          git diff "$(git merge-base origin/${GITHUB_BASE_REF:-main} HEAD)" HEAD \
            | gitleaks protect --source=. --staged=false --stdin --config=.gitleaks.toml --no-banner --verbose
```
(si el flag `--stdin` no existe en 8.30.1, usa el approach de scan sobre
`git archive` de HEAD del PR: `git archive HEAD | tar -x -C <dir>` y
`gitleaks dir <dir> ...` — sin `continue-on-error`; el job bloquea por
construcción al fallar). El job NO lleva `continue-on-error`.

**Verificar**: `grep -n "gitleaks-pr" .github/workflows/security-scans.yml` → match.
`grep -n "continue-on-error" .github/workflows/security-scans.yml` → solo en los jobs schedule existentes, no en el nuevo.

### Paso 2: Quitar la allowlist de `.env`

En `.gitleaks.toml`, elimina las líneas:
```toml
  '''(^|/)\.env$''',
  '''(^|/)\.env\.local$''',
```
(se mantienen las demás rutas: `.claude/`, `.venv/`, `node_modules/`, `output/...`, y los falsos positivos documentados).

**Verificar**: `grep -n "\.env" .gitleaks.toml` → sin matches.

### Paso 3: Verificar los tests estáticos de workflows

**Verificar**: `pnpm exec vitest run tests/static-analysis` → todos pasan.
Si algún test aserta el conjunto de jobs o triggers de `security-scans.yml`,
actualiza la expectativa para incluir `gitleaks-pr` (sin debilitar otras aserciones).

### Paso 4: Validez final del workflow

**Verificar**: el workflow parsea (usa el mismo método que los tests estáticos
del repo para YAML, p. ej. js-yaml del repo) y `pnpm test` → todos pasan.

## Test plan

- Los tests estáticos existentes (`tests/static-analysis/*.e2e.test.ts`) se
  mantienen o se extienden para el job nuevo.
- No hay tests unitarios para workflows: la verificación es el parse YAML +
  la inspección manual del job (sin `continue-on-error`).

## Done criteria

- [ ] Job `gitleaks-pr` existe, corre solo en `pull_request`, sin `continue-on-error`
- [ ] `.gitleaks.toml` no allowlista `.env`/`.env.local`
- [ ] `pnpm exec vitest run tests/static-analysis` exit 0
- [ ] `pnpm test` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- El scan por diff (`git diff ... | gitleaks protect`) no es soportado por la
  versión pineada — usa el fallback de `git archive` del Paso 1; si ninguno
  funciona, deja el job sin escanear y reporta.
- Un test estático exige que el workflow NO tenga jobs en PR (política
  contradictoria) — no borres el test, reporta.
- El job nuevo no cabe en el presupuesto de minutos (timeout 5 min): reporta
  el run, no lo conviertas en no-bloqueante.

## Maintenance notes

- El scan semanal full-tree se mantiene (cubre CVEs de DB fresca); el scan PR
  usa reglas default — la pareja es la configuración intencional.
- Regla: **nunca** allowlistear archivos de entorno en gitleaks — la detección
  de `.env` commiteado es exactamente el objetivo.
- Si el repo migra a branch protection con required checks, `gitleaks-pr`
  debe agregarse a la lista de checks requeridos (paso operativo, no código).
- En review: verificar que el job nuevo no copia el `if: schedule` de los demás
  y que el checkout usa `fetch-depth: 0` (necesario para `merge-base`).
