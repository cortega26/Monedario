# Module Index (Agent Quick Map)

Last updated: 2026-05-11

## 1. Repository map

| Path | What lives here | Agent note |
|---|---|---|
| `src/` | Runtime app (Astro pages/components/layouts/utils/content config) | Do not modify for context-only tasks. |
| `src/data/blog/` | Editorial content (`.md/.mdx`) | Out of scope unless explicit content task. |
| `src/data/glossary/` | Glossary entries for financial terms | Preserve reader-facing Spanish and collection schema. |
| `src/data/laws/` | Legal reference pages | Treat as YMYL-adjacent; prefer official sources. |
| `scripts/` | Quality gates and snapshots (`check:*`, `compare-*`, `snapshot-*`) | Primary enforcement source for context invariants/contracts. |
| `docs/` | Constitution, domain docs, reports, issue docs | Constitutional/domain source of truth. |
| `docs/governance/` | Stable governance policies and ADR-adjacent execution rules | Read for strategy/process changes before inventing new visible patterns. |
| `docs/reports/` | Canonical route and RSS baselines only | Inputs tracked for `check:routes` and `check:rss`. |
| `output/validation/` | Generated route/RSS validation snapshots | Local current snapshots emitted by validation scripts. |
| `context/` | Agent context layer and project state docs | Keep concise and cross-referenced. |
| `context/AGENT_PREFLIGHT.md` | Single-file session warm-up: hard stops, gate map, invariant IDs, env vars | Load first when starting any agent session to cut cold-start token cost. |
| `tests/` | Vitest suites by layer | Required when runtime layers change per AGENTS rules. |
| `artifacts/editorial/` | Canonical editorial pipeline artifacts | Required for new YMYL content and substantive refreshes. |
| `docs/editorial/artifacts/` | Legacy/SEO sprint editorial artifacts | Noncanonical evidence; do not use as full pipeline substitute. See ADR-20260511. |

## 2. Where key behaviors are defined

- Public URL identity guard:
  - `docs/AI_ENGINEERING_CONSTITUTION.md` (`URL.PUBLIC.NO_POST_ID`)
  - `scripts/check-no-postid-urls.mjs`
- Route snapshot policy:
  - `scripts/snapshot-routes.mjs`
  - `scripts/compare-routes.mjs`
  - `docs/reports/routes_snapshot_before.json`
  - `output/validation/routes_snapshot_after.json`
- RSS snapshot policy:
  - `scripts/rss-to-json.mjs`
  - `scripts/compare-rss.mjs`
  - `docs/reports/rss_snapshot.json`
  - `output/validation/rss_snapshot_after.json`
- Frontmatter policy:
  - `scripts/check-frontmatter.mjs`
  - `docs/domain/CONTENT/INVARIANTS.md`
- Competitive adaptation policy:
  - `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md`
  - `docs/editorial/NON_CANNIBALIZATION_PROCESS.md`
  - `docs/editorial/TOPIC_OWNERSHIP_POLICY.md`
- Editorial timeliness policy:
  - `src/config/editorial-timeliness-policy.json`
  - `src/config/editorial-volatile-data-registry.json`
  - `scripts/check-editorial-timeliness.mjs`
  - `scripts/refresh-editorial-volatile-data.mjs`
  - `src/infrastructure/editorial/editorial-volatile-data.snapshot.json`
  - `output/validation/editorial-timeliness/report.json`
  - `.github/workflows/editorial-timeliness-audit.yml`
- Deprecated redirect URL guard:
  - `tests/e2e/redirect-links.e2e.test.ts`
  - protects `src/` from reintroducing known redirecting official-source URLs

## 3. Context first-read sequence for agents

1. `docs/AI_ENGINEERING_CONSTITUTION.md`
2. `AGENTS.md`
3. `context/INVARIANTS.md`
4. `context/CONTRACTS.md`
5. Relevant script(s) in `scripts/`
6. `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md` for new visible features, editorial refreshes, hubs, or benchmark-driven work
