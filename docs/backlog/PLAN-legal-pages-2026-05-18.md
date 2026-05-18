# Plan: Legal Pages

Date: 2026-05-18
Status: Completed

## Scope

- In scope: `src/pages/privacidad.astro`, `src/pages/cookies.astro`, `src/pages/terminos.astro`, `src/components/Footer.astro`.
- Out of scope: analytics runtime changes, consent banner, article content, RSS generation logic, route helper refactors.

## Authority And Invariants

- Constitution: public contracts must be preserved unless versioned.
- `URL.PUBLIC.NO_POST_ID`: new public routes are static literal paths and do not derive from `post.id`.
- `ROUTES.NO_SILENT_CHANGES`: route additions must be verified with route checks.
- `CONTRACT.PUBLIC_ROUTE_REGISTRY`: added routes are expected public route additions.

## Implementation Notes

- Add three static Astro institutional pages: privacy, cookies, terms.
- Match existing institutional page style: `Layout`, `Header`, `Breadcrumb`, `Footer`, bordered sections, concise Monedario tone.
- Link the three pages from footer `Confianza`.
- Last updated date: 18 de mayo de 2026.

## Verification Plan

- `pnpm run astro check`
- `pnpm run check:no-postid-urls`
- `pnpm run check:routes`
- `pnpm run check:rss`
- `pnpm run check:links`
- `pnpm run format:check`

## Change Control Record

1. Scope declaration
- In scope: legal static pages, footer legal links, this plan artifact.
- Out of scope: analytics behavior, consent implementation, editorial/YMYL articles.

2. Impacted modules
- Paths: static pages and footer navigation.
- Reason for each path: expose legal information and make it discoverable.

3. Invariant preservation
- Referenced invariants: `URL.PUBLIC.NO_POST_ID`, `ROUTES.NO_SILENT_CHANGES`.
- Preservation proof: literal page routes only; route checks required.

4. Contract preservation
- Referenced contracts: `CONTRACT.PUBLIC_ROUTE_REGISTRY`, `CONTRACT.RSS_POLICY`.
- Breaking changes: no.

5. Boundary integrity
- Layer boundary check (`pnpm run check:boundaries`): not required for static page-only change.
- Unauthorized cross-layer imports introduced: no.

6. Test coverage impact
- Changed runtime layers: Astro static pages and footer navigation.
- Related tests added/updated: none; covered by Astro and route/link checks.
- Coverage threshold status: not applicable.

7. Rollback strategy
- Revert unit: remove the three page files, footer links, and this plan artifact.
- Data/content rollback needed: no.

8. Regression risk
- Risk level: low.
- Primary regression vectors: broken internal links, unexpected route snapshot delta, formatting.
- Mitigations: run Astro, route, RSS, link, and format checks.

## Progress Log

- 2026-05-18: Plan artifact created before edits per Rule 2.13.
- 2026-05-18: Added privacy, cookies, and terms static pages.
- 2026-05-18: Added footer links under `Confianza`.
- 2026-05-18: Verification passed:
  - `pnpm run astro check`
  - `pnpm run astro build`
  - `pnpm run check:no-postid-urls`
  - `pnpm run check:routes`
  - `pnpm run check:rss`
  - `pnpm run check:links`
  - `pnpm run check:urls`
  - `pnpm run format:check`

## Closure Notes

- `check:routes` currently snapshots only article routes from `src/data/blog`;
  the legal static routes were verified through `astro build` output and
  `check:urls`.
- Regression risk remains low: new pages are static, linked with `getPath`,
  and do not alter analytics, RSS, article rendering, or route helpers.
