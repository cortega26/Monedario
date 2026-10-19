# ADR-20261019: runner self-hosted aislado para todo el CI

Date: 2026-10-19
Status: Accepted
Supersede operativamente a: `ADR-20260716-temporary-self-hosted-actions-bridge.md`
(en cuanto a alcance y etiqueta del runner; el ADR previo sigue documentando el
contexto histórico del puente).

## Context

El repo privado volvió a bloquear jobs de GitHub Actions por billing
(`The job was not started because recent account payments have failed or your
spending limit needs to be increased`). La migración al runner self-hosted
quedó incompleta: cuatro jobs seguían con `runs-on: ubuntu-latest`
(`validate-committed-artifacts`, `ops-reminders`, `gitleaks-pr` y el deploy
manual del collector). El test de portabilidad los excluía explícitamente, así
que la regresión no podía detectarse.

El runner `monedario-ci-isolated` está online y la variable
`ACTIONS_RUNNER_LABEL=monedario-ci-isolated` existe. Además, GitHub anunció que
`ubuntu-latest` migrará a Ubuntu 26 desde el 2026-10-19, lo que introduce otra
fuente de cambio no controlado.

## Decision

1. Todos los jobs de `.github/workflows/*.yml` resuelven el runner con:

   ```yaml
   runs-on: ${{ vars.ACTIONS_RUNNER_LABEL || 'ubuntu-24.04' }}
   ```

2. No se permite `runs-on: ubuntu-latest` hardcodeado. El fallback queda
   pinneado a `ubuntu-24.04` para no recibir Ubuntu 26 sin validación.
3. El test `tests/static-analysis/actions-runner-portability.e2e.test.ts`
   exige el patrón anterior para **todos** los jobs, sin allowlist por archivo
   ni por job.
4. Las acciones externas siguen pinneadas a SHA completo. El test de supply
   chain detecta también la sintaxis `- uses:` (no solo `uses:` en línea
   propia).
5. Los PRs de refresh editorial no se auto-mergean mientras `add-paths`
   incluya `src/data/blog`; requieren revisión humana.
6. El runner es de un solo host y ejecuta jobs en serie. Su disco, la caché de
   Playwright/Chromium y los workspaces deben monitorearse; el job de a11y no
   debe depender de descargas de navegador sin espacio.

## Consequences

- Con el runner online, los workflows no consumen minutos hosted.
- Si el runner está offline o la variable no existe, el fallback
  `ubuntu-24.04` vuelve a consumir minutos hosted y puede fallar por billing.
  Es un fallback de continuidad, no la ruta normal.
- Los jobs son seriales; el tiempo de pared aumenta frente a runners hosted
  paralelos.
- El host del runner es una frontera de seguridad: solo deben ejecutarse
  ramas internas confiables. No se deben ejecutar PRs de forks no confiables.
- El pin a `ubuntu-24.04` evita la migración silenciosa a Ubuntu 26; subir a
  26 requiere un PR explícito con validación de toolchain.

## Alternatives considered

1. Aumentar el spending limit de GitHub: no resuelve la dependencia estructural
   y vuelve a exponer el CI a interrupciones de pago.
2. Hacer público el repo: rechazado por exposición de historial y material
   privado.
3. Dejar los cuatro jobs en `ubuntu-latest`: rechazado; es la causa directa de
   los gates ciegos (`validate-committed-artifacts`) y de las fallas semanales
   de seguridad.
4. Esperar a que GitHub hosted vuelva: rechazado; el bloqueo ya se repitió
   varias veces en 2026.

## Rollback

- Revertir este PR restaura el patrón anterior y el test con allowlist.
- Para desactivar el runner sin revertir código: borrar
  `ACTIONS_RUNNER_LABEL`; los jobs caen a `ubuntu-24.04` (con costo hosted).
- Para volver a Ubuntu 26: cambiar el fallback en un PR separado y validar
  Node, Playwright, sharp y wrangler antes de mergear.
