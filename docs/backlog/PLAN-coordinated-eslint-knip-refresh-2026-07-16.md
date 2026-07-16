# Plan: coordinated ESLint and Knip maintenance refresh

Status: locally validated — awaiting remote review
Owner: repository owner
Started: 2026-07-16

## Task Brief

- Objective: resolve remaining npm maintenance PRs #321, #322, and #324 in one
  compatible developer-tooling unit while avoiding duplicate CI consumption.
- In scope: `@typescript-eslint/parser` 8.63.0, `typescript-eslint` 8.63.0,
  Knip 6.25.0, the generated pnpm lockfile, validation, PR review/merge, and
  supersession of the three Dependabot PRs.
- Out of scope: application source, public routes, URL identity, RSS,
  editorial/YMYL content, calculators, workflows, deployments, and runtime
  dependencies.
- Invariants/contracts: Constitution §§1, 6, and 9-10;
  `URL.PUBLIC.NO_POST_ID`; `CONTRACT.PUBLIC_URLS`;
  `CONTRACT.ROUTES_SNAPSHOT`; `CONTRACT.RSS_POLICY`.
- Required gates: frozen install, dependency-family inspection, lint,
  formatting, dead-code analysis, boundaries, 1,036-test suite, repository
  policy/docs checks, Astro diagnostics, production build, route/RSS guards,
  security scans, and preview deployment.
- Deliverable: one green merged dependency PR; #321/#322/#324 close as
  superseded only after merge.

## Authority and decision

- Authority order: `docs/AI_ENGINEERING_CONSTITUTION.md` > `AGENTS.md` >
  `context/*.md` > source.
- Rule 2.13 requires this plan because the task spans local and remote validation,
  merge sequencing, and multiple repository artifacts.
- No ADR is required: developer-tool versions change without altering an
  architecture boundary, public contract, URL policy, or CI semantics.
- Work occurs in an isolated worktree from `origin/main` at `2dc1c0d9`. Existing
  user edits in the primary worktree are excluded.

## Compatibility rationale

- The `typescript-eslint` meta-package pins its parser/plugin/estree/utils family
  to the same exact release.
- Applying #321 or #322 independently leaves direct and meta-package lint
  internals on different 8.62.1/8.63.0 versions.
- Updating both declarations atomically produces one coherent 8.63.0 family for
  the repository's direct TypeScript ESLint tooling. `eslint-plugin-astro`
  retains its own transitive parser internals at the version selected by that
  package; those are not mixed into the direct lint stack. Knip is an independent
  development-only update from #324 and can share the same bounded validation
  unit, saving two full runner cycles without affecting runtime.

## Execution and controls

1. Change only the three declared versions and regenerate the lockfile with the
   repository-pinned pnpm 11.7.0.
2. Confirm one coherent direct TypeScript ESLint version family; run lint and
   `check:dead-code` before the full local gate set.
3. Open one change-controlled PR explicitly superseding #321/#322/#324.
4. Require blocking CI/security and Cloudflare preview before squash merge.
5. Close the original Dependabot PRs with traceable comments after merge.

Risk is low-to-medium and limited to lint rule/parser behavior and dead-code
classification. No runtime artifact should differ. Route/RSS guards remain
mandatory defense-in-depth.

## Rollback

- Revert the replacement PR's single squash merge.
- No data, content, URL, or deployment rollback is required.

## Progress log

- 2026-07-16: Diagnosed exact-version coupling between direct parser and the
  `typescript-eslint` meta-package.
- 2026-07-16: Created isolated branch `chore/deps-eslint-knip-2026-07` from
  merged PR #328 (`2dc1c0d9`).
- 2026-07-16: Frozen install and dependency inspection confirmed direct parser,
  plugin, estree, utilities, and meta-package alignment at 8.63.0; Knip resolves
  to 6.25.0. The independent Astro parser dependency remains isolated.
- 2026-07-16: Targeted validation passed: ESLint, Knip dead-code analysis,
  Prettier, domain boundaries, and 1,036/1,036 tests across 125 files.
- 2026-07-16: Full validation passed: repository policy/editorial/URL checks,
  Astro diagnostics with 0 errors, production build of 327 pages, 1,551 links
  with no failures, 53/53 unchanged public routes, and 52/52 unchanged RSS
  entries.
- 2026-07-16: Opened replacement PR #329; #321/#322/#324 remain open until
  #329 passes remote review and merges.

## Change Control Record

1. Scope declaration
- In scope: three development-tool declarations, generated lockfile, this plan,
  validation, and PR supersession.
- Out of scope: runtime/application code, URLs, content, workflows, deployment.

2. Impacted modules
- `package.json`, `pnpm-lock.yaml`, and this plan only.

3. Invariant preservation
- Referenced: Constitution §§1 and 6; `URL.PUBLIC.NO_POST_ID`.
- Proof: no public or URL-generating source is edited; URL and route guards run.

4. Contract preservation
- `CONTRACT.PUBLIC_URLS`, `CONTRACT.ROUTES_SNAPSHOT`, and
  `CONTRACT.RSS_POLICY`; no breaking change.

5. Boundary integrity
- No import or architecture edit; `check:boundaries` remains required.

6. Test coverage impact
- No test source changes; full existing suite validates parser/tool behavior.

7. Rollback strategy
- Revert the replacement squash merge; no content/data rollback.

8. Regression risk
- Low-to-medium: lint false positives/negatives or Knip classification drift.
- Mitigations: single-version inspection, targeted lint/dead-code checks, full
  tests/build/policy gates, security scans, and preview.

Competitive Adaptation Appendix: not applicable; no public or editorial surface.
