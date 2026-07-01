# Plan: eliminate Opengrep CI findings

Date: 2026-07-01
Status: Complete

## Objective

Make the `Static analysis (Opengrep)` PR check pass without suppressing rules or
weakening the scanner.

## Scope

- Pin mutable `actions/cache` references to a verified full commit SHA.
- Add seven-day Dependabot cooldowns for every configured ecosystem.
- Raise pnpm `minimumReleaseAge` to seven days.
- Add regression tests for all three policies.

## Out of scope

- Application/runtime behavior.
- Changes to Opengrep rules, exclusions, or `continue-on-error`.
- Unrelated dependency upgrades.

## Verification

- `pnpm vitest run tests/static-analysis/security-supply-chain-config.e2e.test.ts`
- `pnpm run lint`
- `pnpm run check`
- `pnpm run test`
- `pnpm run format:check`

## Progress

- [x] Triaged the five Opengrep findings from PR #302.
- [x] Applied configuration fixes.
- [x] Added regression coverage.
- [x] Ran local gates.
- [x] Reproduced the exact CI Opengrep scan locally: 0 findings.

## Completion evidence

- `pnpm install --frozen-lockfile`: pass; 1,193 entries satisfy policy.
- Exact Opengrep v1.21.0 `p/ci` command: pass; 0 findings.
- `pnpm run lint`: pass.
- `pnpm run format:check`: pass.
- `pnpm run check`: pass.
- `pnpm run test`: pass; 120 files / 975 tests.
- `pnpm run build`: pass; URL report has 0 failures.

The seven-day pnpm policy includes version-pinned migration exceptions for the
63 packages already trusted in the lockfile. They do not exempt future package
versions and may be removed after the newest listed version is seven days old.

## Rollback

Revert the follow-up commit. No content, runtime, route, or data migration is
involved.
