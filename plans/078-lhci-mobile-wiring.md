# Plan 078: Ejecutar la config Lighthouse mobile en el workflow de performance

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- package.json .github/workflows/lighthouse-ci.yml lighthouserc.cjs lighthouserc.mobile.cjs docs/development/REGRESSION_PREVENTION.md`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx (guardrail declarado sin enforcement)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

`docs/development/REGRESSION_PREVENTION.md:41-42` declara "Mobile Performance
≥ 99, LCP ≤ 1.7s" como guardrail obligatorio, pero `lighthouserc.mobile.cjs`
**no tiene ningún caller**: ni `package.json` ni `lighthouse-ci.yml` lo
ejecutan (el workflow corre solo `perf:ci` → `lighthouserc.cjs` desktop). El
presupuesto mobile existe en la doc y en el archivo, y nadie lo mide. Este
plan lo cablea en el workflow **scheduled** (no en PRs — el throttling mobile
CPU-4x en runners compartidos es flaky como gate) con sus assertions en modo
warn (así no rompe el run) y corrige la doc para que describa la realidad.

## Estado actual

- `package.json:68`: `"perf:ci": "lhci collect --config=lighthouserc.cjs && lhci assert --config=lighthouserc.cjs"`.
- `.github/workflows/lighthouse-ci.yml:31-32`: corre `pnpm run perf:ci` (solo desktop).
- `lighthouserc.mobile.cjs`: config completa con `emulatedFormFactor: "mobile"`,
  CPU throttle 4x, asserts en **warn** (perf ≥ 0.8, LCP ≤ 2500, CLS ≤ 0.1).
- `lighthouserc.cjs`: desktop, asserts en **error** (perf ≥ 0.99, LCP ≤ 1700, TBT 0, CLS 0).
- `docs/development/REGRESSION_PREVENTION.md:41-42`: declara el guardrail mobile sin matiz.

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Medir mobile | `pnpm exec lhci collect --config=lighthouserc.mobile.cjs` | exit 0 (requiere dist/ — si no existe, corre `pnpm run build:ci` antes) |
| Assert mobile | `pnpm exec lhci assert --config=lighthouserc.mobile.cjs` | exit 0 (warn-only) |
| Perf completo | `pnpm run perf:ci` | exit 0 (desktop asserts en error deben pasar en local sano; si fallan por flake, reporta) |

## Alcance

**En alcance**:
- `package.json` (script `perf:ci` o un script nuevo `perf:ci:mobile`)
- `.github/workflows/lighthouse-ci.yml` (step mobile después del desktop)
- `docs/development/REGRESSION_PREVENTION.md` (matizar el guardrail mobile)

**Fuera de alcance** (NO tocar):
- Los umbrales de ambos lighthouserc (cambiar presupuestos = decisión)
- `lighthouserc.cjs` (desktop — se mantiene como gate scheduled actual)
- Añadir mobile como gate de PR (no: flaky — se documenta)

## Git workflow

- Rama: `advisor/078-lhci-mobile-wiring`
- Commit: `feat(ci): medir performance mobile en el workflow scheduled de Lighthouse`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Script para el run mobile

En `package.json`, agrega:
```json
"perf:ci:mobile": "lhci collect --config=lighthouserc.mobile.cjs && lhci assert --config=lighthouserc.mobile.cjs",
```
**Verificar**: `pnpm run perf:ci:mobile` → exit 0 (si `dist/` existe; si no,
`pnpm run build:ci` primero). Los warnings de asserts mobile NO rompen el exit code.

### Paso 2: Cablear en el workflow

En `.github/workflows/lighthouse-ci.yml`, después del step `perf:ci` (desktop),
agrega:
```yaml
      - name: "📱 Lighthouse CI — mobile (warn-only, scheduled)"
        run: pnpm run perf:ci:mobile
        continue-on-error: true
```
(si el workflow ya tiene `continue-on-error` a nivel job, respeta la
estructura existente — léelo antes; lo importante: el step mobile corre
después del desktop y no puede tumbar el job).

**Verificar**: `grep -n "perf:ci:mobile" .github/workflows/lighthouse-ci.yml` → match.

### Paso 3: Corregir la doc

En `docs/development/REGRESSION_PREFENSION.md` (ruta real:
`docs/development/REGRESSION_PREVENTION.md:41-42`), ajusta la línea del
guardrail mobile para decir: desktop en error (scheduled), mobile en warn
(scheduled, CPU-4x) — los umbrales objetivo siguen siendo los declarados,
pero mobile es telemetría no-bloqueante por ahora.

**Verificar**: `grep -n "mobile" docs/development/REGRESSION_PREVENTION.md` → la línea matizada.

### Paso 4: Gates finales

**Verificar**:
- `pnpm run perf:ci` → exit 0 (desktop intacto)
- `pnpm run perf:ci:mobile` → exit 0
- `pnpm run format:check` → exit 0
- `git status` → solo archivos en alcance

## Test plan

No hay tests unitarios para LHCI; la verificación es ejecutar ambos runs
locales con `dist/` presente (o documentar que el run local requiere build).

## Done criteria

- [ ] `perf:ci:mobile` en `package.json` y en `lighthouse-ci.yml` (post-desktop, no-bloqueante)
- [ ] `REGRESSION_PREVENTION.md` describe el mobile como warn-only scheduled
- [ ] `pnpm run perf:ci` exit 0 (desktop sin cambios)
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- `lhci collect` mobile falla por infraestructura local (Chrome, throttling) —
  no "arregles" la config: reporta el error exacto.
- El workflow actual de lighthouse tiene una estructura que no admite el step
  nuevo sin cambiar su semántica (léelo completo antes).
- Los asserts mobile en warn devuelven exit ≠ 0 (comportamiento de LHCI
  distinto al esperado) — reporta la salida.

## Maintenance notes

- Cuando el presupuesto mobile se convierta en gate real (error), debe pasar a
  PR *después* de una base estable de mediciones scheduled — no antes.
- El plan 041 (CLS en impuesto-segunda-categoria) está BLOCKED por falta de
  reproducción de campo; el run mobile scheduled es una fuente nueva de datos
  lab para ese tipo de problemas (reportar si el CLS móvil aparece en el
  reporte de la página afectada).
- En review: verificar que el step mobile no duplica URLs ni cambia las
  assertions desktop.
