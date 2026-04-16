# Regression Prevention Framework

Rules and CI gates that prevent regressions across contracts, invariants, routes, and performance.
Referenced from `AGENTS.md §5`. Constitutional precedence applies — see `docs/AI_ENGINEERING_CONSTITUTION.md`.

## Definition: what qualifies as regression
A regression is any change that degrades previously valid behavior in contracts, invariants, boundaries, routes, build integrity, editorial outputs, or measured performance guardrails.

## Rule 5.1 - CI gate set is mandatory
- Rationale: Constitutional gates must be executable, not advisory.
- Enforcement: All commands below must pass for merge:
  - `pnpm run lint`
  - `pnpm run check:boundaries`
  - `pnpm run format:check`
  - `pnpm run test`
  - `pnpm run check:frontmatter`
  - `pnpm run check:routes`
  - `pnpm run astro check`
  - `pnpm run build`
- Compliant behavior: PR includes successful run evidence (CI or local command log).
- Violation: Merging after skipping `check:routes` on routing-related change.

## Rule 5.2 - Coverage thresholds (change-impact)
- Rationale: Numeric coverage tooling is not fully wired; regression risk still requires measurable thresholds.
- Enforcement: Thresholds for touched runtime layers:
  - If `src/domain/**` changes, at least one file in `tests/domain/**` must be added or modified in same PR. Threshold: 100% of domain-changing PRs.
  - If `src/application/**` changes, at least one file in `tests/application/**` must be added or modified in same PR. Threshold: 100%.
  - If `src/infrastructure/**` changes, at least one file in `tests/infrastructure/**` must be added or modified in same PR. Threshold: 100%.
- Compliant behavior: Update `tests/domain/TaxEngine.test.ts` when changing `src/domain/taxation/TaxEngine.ts`.
- Violation: Changing calculator use-case formulas with no test updates.

## Rule 5.3 - Static analysis enforcement
- Rationale: Boundary/type drift appears before runtime failures.
- Enforcement: `eslint`, `astro check`, and `check-domain-boundaries` must pass with no waivers in the same change.
- Compliant behavior: Fix forbidden import in domain before merge.
- Violation: Suppressing lint/type errors to merge quickly.

## Rule 5.4 - Performance guardrails for hot paths
- Rationale: Home and article entry paths are user-critical and historically performance-sensitive.
- Enforcement: For changes touching `src/layouts/**`, `src/pages/index.astro`, `src/pages/posts/**`, `src/styles/global.css`, or `public/fonts/**`, attach Lighthouse evidence and meet all thresholds:
  - Mobile Performance >= 99
  - LCP <= 1.7s
  - Speed Index <= 3.0s
  - CLS = 0
  - TBT = 0ms
- Compliant behavior: Provide JSON report in `artifacts/` meeting thresholds.
- Violation: Merging font/layout change without performance evidence.

## Rule 5.5 - Pre-change test baseline verification
- Rationale: Pre-existing failures must be distinguished from regressions introduced by the current change. Conflating them wastes investigation time and risks silently shipping pre-existing debt.
- Enforcement: Before editing any runtime file, run `pnpm run test` on the unmodified branch and record which tests fail. Any failure present in that baseline is pre-existing and must be logged in `docs/TECH_DEBT_BACKLOG.md` with severity; it does NOT block the current PR unless its fix falls within declared scope.
- Compliant behavior: "Baseline run shows 2 pre-existing failures in `FinancialUseCases.regression.test.ts`; logged as TD-0030; out of scope for this PR."
- Violation: Treating a pre-existing failure as a regression introduced by the current PR, or silently ignoring it without a backlog entry.

## Assumptions (explicit)

- A1: As of 2026-02-28, numeric line/function coverage gate is not configured in CI (`@vitest/coverage-v8` missing). This protocol therefore enforces change-impact coverage thresholds until a numeric coverage gate is added by ADR.
