# Plan 138: Alarmas de defensa en el scorecard semanal (N3 del informe SEO/SERP)

> **Executor instructions**: cambio acotado a un script de reporting y sus
> tests. No toca `src/`, contenido, rutas, indexabilidad ni superficies
> medidas. **Gate temporal: no iniciar antes de 2026-10-05 (post-W40)**; la
> cadencia N1 (primera corrida del mes) ya está definida en el ritual.

## Status

- **Priority**: P1
- **Effort**: S–M
- **Risk**: LOW (reporting; sin efecto en producción)
- **Depends on**: N1 (cadencia definida, plan 136) + plan 128 §8
- **Category**: medición SEO / scorecard
- **Planned at**: commit `b28c473b`, 2026-09-30
- **Status**: TODO — gate temporal post-W40 (2026-10-05)

## Contexto

El scorecard ya produce `Top Losers`, `Strategic Watchlist` y
`Query Quick Wins`, pero no tiene cohortes explícitas de **defensa** (páginas
en posiciones 1–3 que pierden posición/CTR) ni de **potencial** (4–10 con
CTR-gap). El plan 128 §8 mostró activos de conversión fuertes
(`calcular seguro de cesantia` 506i/28c pos 4,74; `calculo impuesto unico`
271i/13c) que hoy no tienen alarma si caen.

## Scope

**In scope**

- `scripts/build-weekly-search-report.mjs` — nueva sección de alarmas usando
  los datos que ya lee (`buildComparedRows`, `readGscJson`); sin fuentes nuevas.
- `tests/scripts/build-weekly-search-report.test.ts` — casos de las cohortes.
- `docs/operations/runbooks/weekly-search-performance-ritual.md` — documentar
  la sección y sus umbrales.
- `docs/backlog/SEO-SERP-STRATEGY-2026-09-29.md` §4 N3 y `plans/README.md`.

**Out of scope**

- Cambios de producto, contenido, títulos, rutas o indexabilidad.
- Nuevos eventos de analytics o identificadores.
- Alertas automáticas por email/issue fuera del scorecard.

## Umbrales pre-declarados (propuesta; confirmar al ejecutar)

| Cohorte | Condición | Mínimo | Acción en scorecard |
|---|---|---|---|
| Defensa 1–3 | posición actual ≤3 y (Δposición ≥ +1,5) o (ΔCTR relativo ≤ −30 %) | ≥50 impresiones en la semana | `ALERTA DEFENSA` con página/query, posición previa→actual y ΔCTR |
| Potencial 4–10 | posición 4–10 y CTR < 50 % del CTR mediano de la cohorte 4–10 | ≥100 impresiones en la semana | `OPORTUNIDAD` ordenada por impresiones × gap |
| Guardarraíl | cualquier cohorte | < mínimo | no emitir (evitar ruido de muestra chica) |

Nota: N3 no declara causalidad; las alertas encabezan la lista de revisión del
ritual, no disparan cambios automáticos.

## Steps

1. Leer `buildComparedRows` y `buildMarkdown`; definir
   `buildDefenseAlerts(pageRows, queryRows, weekLabel)` que devuelva ambas
   cohortes ordenadas y con guardarraíl de impresiones.
2. Insertar las secciones `## Alarmas de defensa (1–3)` y `## Oportunidad
   (4–10)` en el markdown, después de `## Top Losers`.
3. Tests: caída de posición, caída de CTR, sin cambios (no emite), mínimo de
   impresiones no alcanzado (no emite), empate estable.
4. Documentar en el ritual qué hacer con una alerta (revisar owner/packaging
   antes de tocar; registrar decisión de la semana).
5. Correr `pnpm exec vitest run tests/scripts/build-weekly-search-report.test.ts`
   y `pnpm run check:ci`.

## Verificación

| Comprobación | Criterio |
|---|---|
| Tests | Casos nuevos verdes; sin tocar casos existentes |
| Scorecard | Corrida sobre W39 real (read-only) incluye ambas secciones sin romper el resto |
| Cero producto | `git diff` solo en script, tests y runbook |
| Gates | `pnpm run check:ci` verde |

## STOP / HALT

- Si ya existe lógica equivalente en `watch`/`losers` que cubra la cohorte,
  integrarla en vez de duplicar.
- Si el umbral produce >10 alertas por semana de forma sostenida, recalibrar
  antes de seguir (ruido = ceremonia).
- No tocar superficies en medición ni publicar títulos/descriptions.
- No iniciar antes de 2026-10-05.

## Rollback

- Revertir script + tests + runbook; el scorecard vuelve a su salida actual sin
  efectos en producción.

## Progress log

- 2026-09-30 — Plan creado tras aprobación del owner; no ejecutado (gate
  post-W40).