# Plan — Publish Signed-Off Sprint 2B Articles

Date: 2026-05-11
Status: done

## Scope

In scope:
- `src/data/blog/gratificacion-legal-chile.md`
- `src/data/blog/impuesto-global-complementario-chile.md`
- `src/data/blog/sueldo-imponible-chile.md`
- `src/data/blog/pgu-pension-garantizada-universal.md`
- `src/data/blog/contribuciones-bienes-raices-chile.md`
- `src/data/blog/fondo-emergencia-chile.md`
- `docs/backlog/README.md`
- `docs/backlog/PLAN-publish-signed-off-sprint-2b-articles-2026-05-11.md`

Out of scope:
- Editorial body copy
- Artifact gate checkboxes in `07-publish-packet.md`
- Any route, layout, or calculator code

## Why this plan exists

This task touches more than three files and changes publication state on visible article surfaces. Per `docs/development/AGENT_EXECUTION_PROTOCOL.md` Rule 2.13, execution must be tracked in a versioned backlog plan.

## Preconditions verified

- Human sign-off evidence exists in:
  - `docs/editorial/artifacts/gratificacion-legal/07-publish-packet.md`
  - `docs/editorial/artifacts/igc/07-publish-packet.md`
  - `docs/editorial/artifacts/sueldo-imponible/07-publish-packet.md`
  - `docs/editorial/artifacts/pgu/07-publish-packet.md`
  - `docs/editorial/artifacts/contribuciones-bienes-raices/07-publish-packet.md`
  - `docs/editorial/artifacts/fondo-emergencia/07-publish-packet.md`
- Hero images are already present in `public/images/hero/`.
- Working assumption: "poner mi firma igual que el resto" means publish these articles with the existing `author: "Equipo Monedario"` unchanged, because that is already the canonical byline used in published articles.

## Steps

1. Set `draft: false` in the six signed-off article files.
2. Update backlog state in `docs/backlog/README.md`.
3. Run publication-impact checks.
4. Record results here.

## Progress log

- 2026-05-11: Plan created after confirming six remaining Sprint 2B articles still had `draft: true` and their publish packets show `Status: SIGNED OFF — HumanEditor approved`.
- 2026-05-11: Set `draft: false` in the six signed-off articles without changing byline; `author: "Equipo Monedario"` remained unchanged because it already matches the canonical published signature.
- 2026-05-11: Updated `docs/backlog/README.md` to mark the Sprint 2B publication block as done.
- 2026-05-11: Verification completed:
  - `pnpm run check:frontmatter` → pass (1 pre-existing non-blocking warning on `operacion-renta-centro`)
  - `pnpm run check:hero-images` → pass
  - `pnpm run check:no-postid-urls` → pass
  - `pnpm run check:routes` → pass
  - `pnpm run check:rss` → pass
  - `pnpm run check:links` → pass (orphan warnings only)
  - `pnpm exec astro check` → pass

## Outcome

Published by frontmatter state change:
- `gratificacion-legal-chile`
- `impuesto-global-complementario-chile`
- `sueldo-imponible-chile`
- `pgu-pension-garantizada-universal`
- `contribuciones-bienes-raices-chile`
- `fondo-emergencia-chile`
