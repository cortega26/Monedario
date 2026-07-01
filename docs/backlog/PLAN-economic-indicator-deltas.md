# Plan: restore economic indicator deltas

Status: complete

## Scope

- Preserve `prev.uf`, `prev.utm`, and `prev.dolar` in the manual economic snapshot refresh path.
- Restore the last verified previous-period values in the committed snapshot.
- Keep the homepage indicator rows aligned whether deltas are present or absent.
- Add an infrastructure regression guard for complete previous-period data.

Out of scope: indicator formulas, routes, editorial copy, dependencies, and Cloudflare Worker deployment.

## Authority and contracts

- `docs/AI_ENGINEERING_CONSTITUTION.md` §§1, 4, 10: bounded change, preserve typed public data contracts, and verify tests.
- `docs/architecture/DOMAIN_CONTRACT_BOUNDARIES.md`: `EconomicParameters` is the economic source-of-truth contract; `EconomicParameterProvider` is the snapshot-first adapter.
- `EconomicParameters.prev` remains optional for first-run resilience, while committed production snapshots must retain all available delta entries.

## Steps

- [x] Make the manual refresher merge the existing snapshot's previous-period values.
- [x] Restore the verified `prev` block removed by the 2026-07-01 manual refresh.
- [x] Add a regression test requiring complete, older `prev` entries in the committed snapshot.
- [x] Verify targeted tests, full repository gates, and rendered delta alignment.

## Risk and rollback

- Risk: low; changes affect snapshot refresh serialization and homepage presentation only.
- Rollback: revert the refresher, snapshot, test, and component hunks as one unit.

## Progress log

- 2026-07-01: Initial targeted run exposed a test-API mismatch: Vitest 4's `toBeLessThan` is numeric-only. Production merge tests passed; ISO date assertions were changed to explicit lexicographic comparisons.
- 2026-07-01: First lint run rejected an unused destructured test variable used to omit `prev`; the fixture now uses an explicit copy and property deletion.
- 2026-07-01: Browser verification rendered all three deltas with matching label, value, and delta baselines at 1144 px.

## Change control record

1. Scope: component alignment, manual refresh merge, committed snapshot, infrastructure tests, and this plan only.
2. Impacted modules: homepage economic indicators and the secondary economic snapshot refresh path.
3. Invariants: the `EconomicParameters` source-of-truth and snapshot-first adapter boundaries are preserved.
4. Contracts: no breaking change; the existing optional `prev` contract is populated when comparison data exists.
5. Boundaries: `pnpm run check:boundaries` passed; no cross-layer imports were added.
6. Tests: 120 files and 977 tests passed; infrastructure regression coverage was extended.
7. Rollback: revert these five scoped files as one unit; no data migration is required.
8. Regression risk: low; mitigated by snapshot completeness tests, manual merge tests, browser verification, and a successful production build.

## Completion evidence

- `pnpm run lint`
- `pnpm run check:boundaries`
- `pnpm run format:check`
- `pnpm run test` — 120 files, 977 tests
- `pnpm run check:frontmatter`
- `pnpm run check:routes` — no route changes
- `pnpm exec astro check` — 0 errors, 0 warnings, 1 unrelated deprecation hint
- `pnpm run build` — 327 pages, URL check clean
- Playwright: UF, UTM, and dólar deltas rendered and vertically aligned at 1144 px
