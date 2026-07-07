# PLAN: Issue 254 and PR 305 maintenance

Status: complete

Scope:
- Fix PR #305 by applying the `js-yaml` 5.1.0 upgrade on current `main` and updating incompatible imports.
- Fix issue #254 by resolving the actionable `knip` dead-code report without deleting live MDX-rendered UI.
- Keep changes limited to dependency metadata, import compatibility, `knip` configuration, and this plan artifact.

Authority:
- `docs/AI_ENGINEERING_CONSTITUTION.md` §1: preserve contracts, avoid unrelated refactors, keep typing intact.
- `docs/development/AGENT_EXECUTION_PROTOCOL.md` Rule 2.1 and Rule 2.13: declare scope and track multi-file work in `docs/backlog/`.

Progress:
- 2026-07-07: Open issue and PR inspected. CI root cause identified as `js-yaml` v5 default export removal. Dead-code root cause identified as `knip` not accounting for the live MDX component import.
- 2026-07-07: Updated `js-yaml` import sites to v5-compatible named imports. Added a targeted `knip` ignore for the live MDX-rendered component and removed the stale `@typescript-eslint/parser` ignore-dependency entry.
- 2026-07-07: Narrowed the repository `js-yaml` overrides so transitive v3/v4 ranges are patched to 4.2.0 instead of being forced onto the incompatible v5 export shape.
- 2026-07-07: Removed unused runtime date exports and disabled Knip's type-export reporting because these exported interfaces/types are contract surfaces rather than runtime dead code.

Closure evidence:
- `pnpm exec prettier --check package.json pnpm-lock.yaml pnpm-workspace.yaml knip.json src/utils/dates.ts scripts/compute-review-policies.mjs tests/scripts/frontmatter-schema.test.ts tests/static-analysis/security-supply-chain-config.e2e.test.ts docs/backlog/PLAN-issue-254-pr-305-maintenance-2026-07-07.md`
- `pnpm run check:dead-code`
- `pnpm run lint`
- `pnpm exec vitest run tests/scripts/frontmatter-schema.test.ts tests/static-analysis/security-supply-chain-config.e2e.test.ts tests/application/SimulateRetirementProjection.test.ts`
- `pnpm run test`
- `pnpm run check`
- `pnpm run check:boundaries`
- `pnpm run check:no-postid-urls`
- `pnpm run format:check`
- `pnpm run check:routes`
- `pnpm run build`

Regression risk:
- Low. The dependency bump is isolated to direct `js-yaml` consumers, while Astro's transitive dependency is explicitly kept on patched v4 to preserve its current default-import behavior.
- Public routes were unchanged by `pnpm run check:routes`.

Rollback:
- Revert the maintenance commit on `dependabot/npm_and_yarn/js-yaml-5.1.0` to restore the previous dependency graph and Knip configuration.
