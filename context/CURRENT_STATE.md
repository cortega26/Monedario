# Current State

Date: 2026-05-29

- Context layer added: `context/INVARIANTS.md`, `context/CONTRACTS.md`, `context/MODULE_INDEX.md`.
- Canonical URL identity invariant active: `URL.PUBLIC.NO_POST_ID`.
- Route/RSS guardrails active through snapshot comparison gates.
- Frontmatter gate active and blocking on schema/deprecation errors.
- Inline article image gate active through `pnpm run check:images` (AVIF by default with justified exception allowlist).
- Editorial timeliness gate active through `pnpm run check:editorial-timeliness`, with category-based review cadences and scheduled audit workflow support.
- Volatile editorial data pipeline active through `volatileData` frontmatter, unified snapshot refresh, and drift checks against registered datasets.
- Competitive adaptation policy active in warning-first mode through governance docs, AGENTS protocol, editorial artifacts, and prompt templates.
- Policy registry active through `docs/operations/POLICY_REGISTRY.json` and `pnpm run check:policy-registry`.
- Agent entrypoint map active through `context/AGENT_ENTRYPOINTS.{md,json}` to reduce cold-start overhead.
- Scheduled ops automation expanded with guardrail drift, doc-gardening, dependency automerge, and weekly search ops workflows.
- Editorial alignment remediation closed (`docs/backlog/PLAN-alignment-audit-remediation-2026-05-25.md`): owner/support boundaries, inter-cluster backlinks, and warning-first guardrails.
- Hygiene/staleness audit (2026-05-29): removed stray root artifacts and the orphaned `indicadoresDiarios` dataset (duplicate of the live `EconomicParameters` snapshot); refreshed economic fallback constants.
- Self-healing maintenance active (`docs/adr/ADR-20260529-repo-self-healing-maintenance.md`): `ci.yml` build gate now also runs daily against `main` (issue on failure); `self-heal.yml` auto-PRs mechanical drift (prettier, generated indexes, astro sync) daily; economic snapshot is refreshed daily by the deployed Cloudflare Worker (`monedario-snapshot-bot`), so `refresh-economic-snapshot.yml` stays manual-only (also the manual path for editorial-volatile-data/review-policies); dead-code/orphan detection via `knip` (`pnpm run check:dead-code`), warning-first with a clean baseline.
