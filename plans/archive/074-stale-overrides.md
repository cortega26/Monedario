# Plan 074: Limpiar overrides y excepciones de maduración muertos en `pnpm-workspace.yaml`

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- pnpm-workspace.yaml pnpm-lock.yaml package.json`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: deps (higiene de seguridad)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

`pnpm-workspace.yaml` acumula overrides de seguridad **vencidos** y
`minimumReleaseAgeExclude` con entradas muertas: el override `fast-uri` dice
"remover desde 2026-08-07" (3 días vencido), `nanoid@3.3.17` venció hoy
(2026-08-10), y ~20 entradas de versiones que ya no están en el lockfile
(satteri 0.9.4 vs 0.9.5, workerd 1.20260625.1 vs 1.20260722.1, @shikijs 4.3.0
vs 4.3.1, @tailwindcss 4.3.2 vs 4.3.3, etc.). Costo real: un override de pin
exacto **congela** la versión — un parche de seguridad futuro en el mismo
rango no se instala hasta que alguien edite el override a mano — y la
exclusión muerta destruye la señal de auditoría de la política de 7 días (no
se distingue lo load-bearing de lo cadáver). La resolución natural ya produce
las mismas versiones (verificado contra el registry): eliminarlos no cambia
nada hoy.

## Estado actual

- `pnpm-workspace.yaml:17-22`:
```yaml
  nanoid@^3.3.16: 3.3.17
  brace-expansion@^1.1.7: 1.1.18
  brace-expansion@^5.0.5: 5.0.9
  uuid: '>=11.1.1'
  # Seguridad (2026-08-03): parche de alert HIGH fast-uri, transitorio —
  # remover al cumplir la política de 7 días (desde 2026-08-07).
  fast-uri@^3.0.1: 3.1.5
```
- `:26-33` (`minimumReleaseAgeExclude`): `nanoid@3.3.17` ("vence 2026-08-10"),
  `fast-uri@3.1.5` ("removible desde 2026-08-07"), y ~20 entradas de
  versiones ya no presentes en `pnpm-lock.yaml`.
- Overrides que SÍ se conservan (patrón correcto — rangos con floor):
  `undici >=7.28.0`, `qs >=6.15.2`, `uuid >=11.1.1`, `tmp`, `yaml`, `esbuild`,
  `shiki`, y los `js-yaml` v3/v4 → 4.3.1 (decisión #305 documentada).

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Resolución tras el cambio | `pnpm install` | lockfile sin cambios (git diff vacío) |
| Re-hielo | `pnpm install --frozen-lockfile` | exit 0 |
| Audit | `pnpm audit --prod` | 0 vulnerabilidades |
| Suite | `pnpm test` | todos pasan |

## Alcance

**En alcance**:
- `pnpm-workspace.yaml` (solo overrides/exclusiones listadas abajo)

**Fuera de alcance** (NO tocar):
- Los overrides de rango con floor (`undici`, `qs`, `uuid`, `tmp`, `yaml`, `esbuild`, `shiki`) y los `js-yaml` — se conservan
- `package.json`, `pnpm-lock.yaml` (deben quedar byte-idénticos)
- El resto de la política (`minimumReleaseAge: 10080`)

## Git workflow

- Rama: `advisor/074-stale-overrides`
- Commit: `chore(deps): eliminar overrides y excepciones de maduración vencidos`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Verificar qué exclusiones son inercia real

Para cada candidato de `minimumReleaseAgeExclude`, verifica si la versión
pinedada sigue en el lockfile:
**Verificar**:
- `grep -c "satteri-.*0.9.4" pnpm-lock.yaml` → 0 (inercia — removible).
- `grep -c "workerd@1.20260625.1\|workerd-.*1.20260625.1" pnpm-lock.yaml` → 0.
- `grep -c "shiki@4.3.0\|@shikijs/.*4.3.0" pnpm-lock.yaml` → 0.
- `grep -c "tailwindcss@4.3.2\|@tailwindcss/.*4.3.2" pnpm-lock.yaml` → 0.
- `grep -c "nanoid@3.3.17" pnpm-lock.yaml` → decide según resultado (si está
  en el lockfile, la exclusión sigue siendo necesaria hasta que envejezca por
  el minimumReleaseAge — hoy vence; si ya no está, es inercia).
- `grep -c "fast-uri" pnpm-lock.yaml` → ver cuál versión resuelve (3.1.5).
Si algún candidato que creías muerto SÍ está en el lockfile, NO lo quites del
exclude (reporta la discrepancia).

### Paso 2: Editar `pnpm-workspace.yaml`

1. Elimina el override `fast-uri@^3.0.1: 3.1.5` (y su comentario).
2. Elimina los overrides `nanoid@^3.3.16: 3.3.17` y ambos
   `brace-expansion@...` (verificar primero con `pnpm why brace-expansion` que
   la resolución natural es 1.1.18/5.0.9 — la dedupe del rango la da el
   propio rango del dependiente; si el audit o `pnpm why` muestra otra cosa,
   STOP y reporta).
3. Del `minimumReleaseAgeExclude`: elimina `nanoid@3.3.17` y `fast-uri@3.1.5`
   (vencidos hoy) y TODAS las entradas cuyo grep del Paso 1 dio 0.

**Verificar**: `git diff pnpm-workspace.yaml` → solo las líneas previstas.

### Paso 3: Re-resolver y verificar que el lockfile NO cambia

**Verificar**:
- `pnpm install` → exit 0.
- `git diff --stat pnpm-lock.yaml` → **vacío** (la resolución natural produce
  exactamente lo mismo). Si el lockfile cambia, STOP y reporta el diff (el
  cambio de versión es más de lo previsto).
- `pnpm install --frozen-lockfile` → exit 0.

### Paso 4: Audit y suite

**Verificar**:
- `pnpm audit --prod` → "No known vulnerabilities found" (0).
- `pnpm test` → todos pasan.

### Paso 5: Gates finales

**Verificar**:
- `pnpm run format:check` → exit 0
- `git status` → solo `pnpm-workspace.yaml` modificado
- `grep -n "fast-uri\|nanoid@3.3.17\|brace-expansion" pnpm-workspace.yaml` → sin matches (salvo `js-yaml`/los que se conservan)

## Test plan

No hay tests para el workspace; la verificación es el lockfile byte-idéntico
(Paso 3) + `pnpm audit` limpio + suite verde.

## Done criteria

- [ ] `pnpm-workspace.yaml` sin fast-uri/nanoid/brace-expansion y sin exclusiones muertas
- [ ] `pnpm install` no modifica `pnpm-lock.yaml`
- [ ] `pnpm audit --prod` → 0 vulnerabilidades
- [ ] `pnpm test` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- `pnpm install` cambia el lockfile (una resolución natural difiere de la
  versión pinedada — el override era load-bearing) — revierte el cambio y
  reporta con el diff.
- `pnpm audit --prod` muestra algo tras la limpieza (habría que volver al
  override) — reporta el advisory.
- La política del repo decide mantener el override fast-uri por precaución
  (los comentarios dicen "remover desde 2026-08-07", así que la intención es
  remover) — si hay instrucción contraria, STOP.

## Maintenance notes

- Regla: los overrides de seguridad son **transitorios con fecha en el
  comentario**; la fecha vencida es señal de limpieza. Los overrides de rango
  (`>=`) son el patrón correcto a largo plazo (dejan pasar parches).
- Si se agrega una política futura: un check CI que falle cuando un
  `minimumReleaseAgeExclude` apunta a una versión ausente del lockfile (hoy
  es manual).
- En review: verificar que `js-yaml` v3/v4 → 4.3.1 sobrevive (decisión #305,
  no es limpieza).
