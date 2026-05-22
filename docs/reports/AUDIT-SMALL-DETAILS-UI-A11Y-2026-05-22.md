# Audit Small Details - UI Polish and Accessibility Details - 2026-05-22

Source plan: `docs/backlog/PLAN-audit-small-details-2026-05-22.md`

## Scope

Audit UI polish and accessibility detail work without changing source. This lane covers mobile/desktop visual checks, focus states, tap targets, keyboard paths, empty/error/loading states, contrast, repeated component copy, and visual alignment.

## Evidence

- Existing report available: `docs/reports/ACCESSIBILITY-2026-05-18.md`.
- `pnpm run check`: pass.
- `pnpm run lint`: pass.
- `pnpm run format:check`: fail on 21 pre-existing files; several are UI/calculator pages/components.
- No Playwright screenshots were produced in this first audit artifact pass.

## Findings

| ASD | Priority | Severity | Finding | Disposition |
|---|---:|---:|---|---|
| ASD-301 | P0 | 3 | Need screenshot-backed visual pass across homepage, article, hub, calculator, search, legal, and glossary templates. | `batch-later`. |
| ASD-302 | P0 | 4 | Need keyboard/focus/tap-target pass for nav, search, calculators, accordions, share buttons, and CTAs. | `batch-later`. |
| ASD-303 | P1 | 3 | Empty/error/loading states are not audited by existing gates. | `batch-later`. |
| ASD-304 | P2 | 2 | Visual consistency and formatting drift should be separated from this audit-only pass and handled as a focused batch. | `batch-later`. |

## Required Screenshot Set

For the remediation audit pass, capture desktop and mobile screenshots for:

- `/`
- `/posts/pgu-pension-garantizada-universal/`
- `/guias/pensiones-afp/`
- `/calculadoras/sueldo-liquido/`
- `/buscar/`
- `/glosario/uf/`
- `/leyes/ley-19496-proteccion-consumidor/`

## Keyboard Paths To Verify

- Header menu open/close and navigation.
- Search input, result traversal, and fallback state.
- Calculator input sequence, error correction, and result actions.
- Article share buttons and back-to-top behavior.
- Footer/legal/support links.

## Remediation Boundaries

- UI polish should not rewrite page structure unless a specific overlap, accessibility, or usability finding requires it.
- Any visual remediation must preserve route/RSS/canonical behavior.
- Calculator visual fixes must not alter formulas.
