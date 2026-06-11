# Plan 002: Pinear actions/setup-node por SHA en los 5 lugares que usan el tag mutable

> **Executor instructions**: Sigue este plan paso a paso. Ejecuta cada comando
> de verificación antes de pasar al siguiente paso. Si ocurre alguna condición
> de STOP, detente y reporta — no improvises. Al terminar, actualiza la fila
> de estado en `plans/README.md`.
>
> **Drift check (ejecutar primero)**:
> `git diff --stat 8256c9d2..HEAD -- .github/workflows/indexnow.yml .github/workflows/data-signals.yml .github/workflows/page-lastmod.yml .github/workflows/check-ts7-readiness.yml .github/actions/bootstrap-pnpm/action.yml`
> Si alguno de esos archivos cambió desde que se escribió el plan, compara los
> excerpts de "Estado actual" con el código vivo. Si no coinciden, STOP.

## Estado

- **Prioridad**: P2
- **Esfuerzo**: S
- **Riesgo**: LOW
- **Depende de**: ninguno (puede ejecutarse en paralelo con 001)
- **Categoría**: security
- **Planned at**: commit `8256c9d2`, 2026-06-11

## Por qué importa

El repo pina todas sus acciones críticas por SHA de commit, no por tag mutable:
```
actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10 # v6.0.3
```
Cinco lugares usan `actions/setup-node@v6` sin SHA. Si el tag `v6` fuera
redirigido a un commit malicioso (compromiso de supply chain del repositorio
de GitHub Actions), esos 5 workflows ejecutarían código arbitrario con
`GITHUB_TOKEN` en scope. La probabilidad es baja para una acción mantenida
por GitHub, pero la inconsistencia con el estándar propio del repo es el
problema concreto a resolver.

## Estado actual

Los 5 lugares con el tag sin pinear:

| Archivo | Línea | Contexto |
|---------|-------|----------|
| `.github/actions/bootstrap-pnpm/action.yml` | 19 | Acción compartida reutilizada por 10+ workflows |
| `.github/workflows/indexnow.yml` | 36 | Workflow de notificación IndexNow |
| `.github/workflows/data-signals.yml` | 41 | Workflow diario de señales GSC/Cloudflare |
| `.github/workflows/page-lastmod.yml` | 34 | Workflow de refresco del índice de lastmod |
| `.github/workflows/check-ts7-readiness.yml` | 30 | Workflow semanal de check de TS7 |

**Excerpt de cada uso (verificar que coincidan antes de editar)**:

`bootstrap-pnpm/action.yml:17-20`:
```yaml
    - name: Setup Node.js
      uses: actions/setup-node@v6
      with:
        node-version: ${{ inputs.node-version }}
```

`indexnow.yml:34-39`:
```yaml
      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version: "24"
```

`data-signals.yml:39-43`:
```yaml
      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version: "24"
```

`page-lastmod.yml:32-37`:
```yaml
      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version: "24"
```

`check-ts7-readiness.yml:28-33`:
```yaml
      - name: "🟢 Setup Node.js"
        uses: actions/setup-node@v6
        with:
          node-version: 22
```

**Convención del repo**: el formato canónico es
`actions/action-name@<full-40-char-sha> # vX.Y.Z` en una misma línea.
Ejemplo vivo: `actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10 # v6.0.3`.

## Comandos necesarios

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Resolver SHA del tag v6 | `gh api 'repos/actions/setup-node/git/ref/tags/v6' --jq '.object.sha'` | SHA de 40 chars; puede ser SHA del tag object (si es annotated) |
| Resolver SHA del commit (si annotated) | `gh api 'repos/actions/setup-node/git/tags/<SHA-del-paso-anterior>' --jq '.object.sha'` | SHA del commit real |
| Verificar versión del tag | `gh api 'repos/actions/setup-node/releases' --jq '.[0] \| {tag: .tag_name, sha: .target_commitish}'` | versión más reciente del tag v6 |
| Lint/formato | `pnpm run format:check` | exit 0 |
| Tests | `pnpm test` | exit 0 |

**Nota sobre SHA resolution**: `actions/setup-node@v6` es un tag mutable que
apunta a la última versión `v6.x.x`. Debes resolver el SHA del commit que está
detrás de ese tag en el momento de la ejecución. El resultado del paso 1 te
dará ese SHA. Si el tag `v6` apunta a un tag anotado, ejecuta el segundo
comando para llegar al commit SHA real (el que debes usar).

## Scope

**En scope** (los únicos archivos a modificar):
- `.github/actions/bootstrap-pnpm/action.yml`
- `.github/workflows/indexnow.yml`
- `.github/workflows/data-signals.yml`
- `.github/workflows/page-lastmod.yml`
- `.github/workflows/check-ts7-readiness.yml`

**Fuera de scope** (NO tocar):
- Cualquier otro workflow o acción — hay muchos con `actions/checkout` ya pineados; no tocar
- Código de aplicación bajo `src/`, `scripts/`, `workers/`

## Flujo git

- Rama: `fix/pin-setup-node-sha`
- Commit: un solo commit con los 5 archivos. Mensaje: `fix(ci): pin actions/setup-node to SHA`
- NO hacer push ni PR a menos que el operador lo pida.

## Pasos

### Paso 1: Resolver el SHA actual del tag `v6`

Ejecuta:
```bash
gh api 'repos/actions/setup-node/git/ref/tags/v6' --jq '.object.sha'
```

Si el resultado es un SHA de 40 chars que **no** está en el repositorio de
acciones como SHA de commit (podría ser el SHA de un tag anotado), ejecuta:
```bash
gh api 'repos/actions/setup-node/git/tags/<SHA>' --jq '.object.sha'
```

Guarda el SHA final (40 chars). Lo llamaremos `SETUP_NODE_SHA` en los pasos
siguientes. También anota la versión exacta (`v6.x.x`) del release que
corresponde a ese commit:
```bash
gh api 'repos/actions/setup-node/releases' --jq '.[:5] | .[] | {tag: .tag_name}'
```
Elige la última versión `v6.x.x`. Esto irá en el comentario `# vX.Y.Z`.

**Verifica**: `SETUP_NODE_SHA` tiene exactamente 40 caracteres hexadecimales.

### Paso 2: Reemplazar los 5 usos

En cada archivo, cambia `uses: actions/setup-node@v6` por
`uses: actions/setup-node@<SETUP_NODE_SHA> # vX.Y.Z`.

Las 5 ediciones son de formato idéntico — solo cambia el archivo y la
indentación ya existente. Ejemplo de resultado:
```yaml
      uses: actions/setup-node@<SETUP_NODE_SHA> # v6.x.x
```

Edita en orden:
1. `.github/actions/bootstrap-pnpm/action.yml:19`
2. `.github/workflows/indexnow.yml:36`
3. `.github/workflows/data-signals.yml:41`
4. `.github/workflows/page-lastmod.yml:34`
5. `.github/workflows/check-ts7-readiness.yml:30`

**Verifica** (sustituye `<SETUP_NODE_SHA>` con el SHA real):
```bash
grep -r "setup-node@" .github/ | grep -v "#"
```
Resultado esperado: **sin output** (todas las referencias tienen el `#` del comentario).

### Paso 3: Verificar formato

```bash
pnpm run format:check
```
Resultado esperado: exit 0. Los archivos YAML no suelen ser reformateados por
Prettier en este repo, pero verifica.

### Paso 4: Correr tests

```bash
pnpm test
```
Resultado esperado: exit 0, **689 tests pasando** (línea base verificada).
Este cambio es puramente en archivos de CI — los tests de aplicación no
deberían verse afectados.

## Plan de tests

No hay tests de unidad para archivos de workflow YAML en este repo. La
verificación es el comando `grep` del paso 2 — ninguna referencia sin SHA.

Si existe un test de e2e que valide la estructura de los workflows
(busca en `tests/e2e/` archivos con "workflow" en el nombre), revísalo
para asegurarte de que no dependa del string literal `setup-node@v6`.

## Criterios de cierre

- [ ] `grep -r "setup-node@" .github/ | grep -v "#"` no produce output
- [ ] Los 5 archivos del scope tienen `uses: actions/setup-node@<40-char-sha> # v6.x.x`
- [ ] `pnpm run format:check` exit 0
- [ ] `pnpm test` exit 0 (689 tests pasando)
- [ ] Ningún archivo fuera del scope fue modificado (`git diff --name-only HEAD`)
- [ ] Fila de estado actualizada en `plans/README.md`

## Condiciones de STOP

- Los excerpts de "Estado actual" no coinciden con el código vivo.
- El comando `gh api` falla (sin permisos, sin `gh` CLI, sin conexión) — en ese
  caso reporta el obstáculo; no adivines el SHA.
- `pnpm test` falla por razones no relacionadas con este cambio — investiga
  antes de concluir que el cambio lo causó.

## Notas de mantenimiento

- Los tags `v6` de `actions/setup-node` se actualizan cuando hay nuevas releases
  `v6.x.x`. Cuando Dependabot abra un PR para actualizar este SHA, seguirá el
  mismo proceso de este plan. El patrón está documentado aquí para referencia.
- El archivo `bootstrap-pnpm/action.yml` es el de mayor impacto: al pinearlo,
  todos los workflows que usan esa acción compartida (10+ workflows) se benefician
  automáticamente.
