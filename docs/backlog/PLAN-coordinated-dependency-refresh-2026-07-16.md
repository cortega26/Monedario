# Plan: coordinated Astro and developer-tooling refresh

Status: locally validated — awaiting remote review
Owner: repository owner
Started: 2026-07-16

## Task Brief

- Objective: replace mutually incompatible Dependabot PRs #319 and #320 with one
  atomic dependency refresh whose Astro/Shiki versions are type-compatible.
- In scope: the eleven package declarations already proposed by #319 and #320,
  the generated pnpm lockfile, this plan, validation, pull-request review, merge,
  and supersession of the two original PRs.
- Out of scope: application/runtime source, public routes, URL identity, RSS,
  editorial/YMYL content, calculators, deployment configuration, CI semantics,
  and unrelated dependency PRs.
- Invariants/contracts: Constitution §§1, 6, and 9-10;
  `URL.PUBLIC.NO_POST_ID`; `CONTRACT.PUBLIC_URLS`;
  `CONTRACT.ROUTES_SNAPSHOT`; `CONTRACT.RSS_POLICY`.
- Required gates: frozen install, `astro check`, lint, boundaries, formatting,
  tests, context/policy/docs, frontmatter, no-post-ID URLs, production build,
  route/RSS comparisons, security scans, accessibility, external URL audit, and
  Cloudflare preview.
- Deliverable: one reviewed and merged dependency PR, with #319 and #320 closed
  as superseded only after the replacement is green and merged.

## Authority and decision

- Authority order: `docs/AI_ENGINEERING_CONSTITUTION.md` > `AGENTS.md` >
  `context/*.md` > source.
- Rule 2.13 requires this plan because the work spans local validation, remote
  CI, merge sequencing, and multiple repository artifacts.
- No ADR is required: package versions change, but no architectural layer,
  contract, URL policy, or CI pass/fail semantics changes.
- Existing user modifications in the primary worktree are excluded. All work
  occurs in an isolated worktree based on the latest `origin/main`.

## Compatibility diagnosis

- PR #319 updates Astro to 7.0.7 but the existing lock retains its allowed
  transitive Shiki resolution at 4.3.0; that PR remains internally compatible
  only because direct `@shikijs/transformers` also stays at 4.3.0.
- PR #320 updates direct `@shikijs/transformers` to 4.3.1 while Astro's locked
  Shiki remains 4.3.0. `astro check` rejects the transformer objects because the
  duplicated Shiki type identities differ.
- A naive union of #319 and #320 still preserves the stale transitive lock and
  therefore fails. The smallest atomic unit is the union plus a package-manager
  override that resolves Astro's compatible `shiki` range to 4.3.1. Neither
  broken intermediate will be introduced into `main`.

## Dependency scope

Runtime group from #319:

- `@astrojs/markdown-remark` 7.2.0 → 7.2.1
- `@astrojs/mdx` 7.0.0 → 7.0.2
- `@astrojs/react` 6.0.0 → 6.0.1
- `@astrojs/rss` 4.0.18 → 4.0.19
- `astro` 7.0.3 → 7.0.7
- `sharp` 0.35.2 → 0.35.3

Developer-tooling group from #320:

- `@shikijs/transformers` 4.3.0 → 4.3.1
- `@vitest/coverage-v8` 4.1.9 → 4.1.10
- `js-yaml` 5.1.0 → 5.2.1
- `prettier` 3.9.3 → 3.9.5
- `vitest` 4.1.9 → 4.1.10

Compatibility resolution:

- pnpm override: transitive `shiki` → 4.3.1, aligning Astro and the direct
  transformer package on one Shiki type family.

## Execution phases

1. Apply only the declared package versions and the Shiki compatibility override,
   then regenerate the lockfile with the repository-pinned pnpm version.
2. Prove the compatibility fix with `astro check`, then run the full local gate
   set and inspect the generated diff for undeclared changes.
3. Open one change-controlled PR that explicitly supersedes #319 and #320.
4. Require all blocking CI/security checks plus runtime-relevant browser,
   external-link, and Cloudflare preview evidence before merge.
5. Squash-merge the replacement, close #319/#320 with traceable comments, and
   continue the remaining dependency PR queue from the new `main`.

## Risk controls

- Medium risk: Astro and Sharp affect the production build; Vitest and Prettier
  affect validation behavior; Shiki type identity must remain singular.
- No package beyond the Dependabot-proposed union is intentionally upgraded.
- Route and RSS snapshots must remain unchanged.
- The live single self-hosted runner is kept serialized; stale Dependabot runs
  are cancelled before validation.
- Browser accessibility and external URL checks are required for this combined
  runtime update even when their workflow labels are non-blocking.

## Rollback

- Revert the replacement PR's single squash merge.
- No data, content, URL, or deployment rollback is required.
- Re-open dependency work only as a coordinated Astro/Shiki unit if upstream
  releases still resolve to distinct Shiki versions.

## Progress log

- 2026-07-16: Current `main` baseline already passed 1,036 tests, production
  build, security scans, accessibility, external URLs, and Cloudflare preview
  during PR #323 validation.
- 2026-07-16: Reproduced and diagnosed reciprocal Shiki type-identity failures
  in #319 and #320; cancelled redundant queued runs.
- 2026-07-16: A first combined install proved that Astro's compatible range
  retained locked Shiki 4.3.0. Added a narrow `shiki: 4.3.1` pnpm override to
  make the direct and transitive type families deterministic.
- 2026-07-16: Created isolated branch
  `chore/deps-runtime-tooling-2026-07` from merge commit `c62eae0c`.
- 2026-07-16: Frozen install passed with pnpm 11.7.0. Dependency inspection
  confirmed exactly one `@shikijs/types` resolution, at 4.3.1.
- 2026-07-16: Local gates passed: formatting, lint, boundaries, 125 test files
  / 1,036 tests, all repository policy/content checks, Astro diagnostics (0
  errors), 327-page production build, 1,607 checked internal links, unchanged
  route snapshot (53/53), and unchanged RSS snapshot (52/52).
- 2026-07-16: `pnpm peers check` reports three inherited repository warnings:
  Astro Shield's Astro 4 range, Wrangler's Workers Types 4 range, and a
  Tailwind Typography range that already includes installed Tailwind 4.3.2.
  No new peer family is introduced by this refresh; blocking gates pass.
- 2026-07-16: Opened PR #328 with the full change-control record. It supersedes
  Dependabot PRs #319 and #320 after successful merge.

## Change Control Record

1. Scope declaration
- In scope: declared dependency versions, generated lockfile, governance record,
  validation, and PR supersession.
- Out of scope: source code, routes, content, CI/workflows, and deployment.

2. Impacted modules
- `package.json`: eleven coordinated version declarations.
- `pnpm-workspace.yaml`: one narrow Shiki resolution override.
- `pnpm-lock.yaml`: deterministic resolution update.
- This plan: decision, evidence, risk, and rollback traceability.

3. Invariant preservation
- Referenced invariants: Constitution §§1 and 6; `URL.PUBLIC.NO_POST_ID`.
- Preservation proof: no route, canonical, content, or URL-generating code is
  edited; route and RSS comparisons remain mandatory.

4. Contract preservation
- Referenced contracts: `CONTRACT.PUBLIC_URLS`, `CONTRACT.ROUTES_SNAPSHOT`, and
  `CONTRACT.RSS_POLICY`.
- Breaking changes: no.

5. Boundary integrity
- No runtime imports or architectural boundaries are edited.
- `pnpm run check:boundaries` remains a required closure gate.

6. Test coverage impact
- No product behavior or test source changes are intended.
- Existing unit/integration suites and full build validate dependency behavior.
- Coverage result: 125/125 test files and 1,036/1,036 tests passed.

7. Rollback strategy
- Revert unit: the replacement PR's squash merge.
- Data/content rollback needed: no.

8. Regression risk
- Risk level: medium.
- Primary vectors: Astro/Shiki type duplication, rendered Markdown/MDX, image
  processing, formatting drift, and test-runner behavior.
- Mitigations: atomic version alignment, frozen install, full gate set, route/RSS
  comparisons, browser audit, external URL audit, and preview deployment.

Competitive Adaptation Appendix: not applicable. This is dependency maintenance
with no public product or editorial surface.
