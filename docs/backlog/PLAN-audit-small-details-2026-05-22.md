# PLAN - Audit of the Small Details Program - 2026-05-22

Status: active
Owner: Codex
Scope type: audit program and remediation backlog

## Purpose

Create a repo-backed audit program that catches trust-eroding details across Monedario without turning into one shallow mega-audit.

This first implementation is audit-only. It creates the canonical backlog artifact, produces five lane reports, maps findings to `ASD-###` tickets, and records verification evidence. It does not remediate content, runtime code, routes, RSS, canonicals, calculator formulas, or YMYL claims.

## Authority

- `docs/AI_ENGINEERING_CONSTITUTION.md` section 1 and `URL.PUBLIC.NO_POST_ID`.
- `AGENTS.md` Rule 2.1, 2.2, 2.6, 2.8, 2.9, 2.13.
- `context/INVARIANTS.md`: `URL.PUBLIC.NO_POST_ID`, `ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS`, `FRONTMATTER.VALID`, `INVARIANT.EDITORIAL.*`, `INVARIANT.URLCHECK.EXTERNAL_LINK_POLICY`.
- `context/CONTRACTS.md`: `CONTRACT.PUBLIC_URLS`, `CONTRACT.ROUTES_SNAPSHOT`, `CONTRACT.RSS_POLICY`, `CONTRACT.FRONTMATTER_POLICY`, `CONTRACT.YMYL_RESPONSE_STRUCTURE`.
- `docs/editorial/NORMA_YMYL.md` for substantive editorial/YMYL refreshes.
- `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md` for visible surface or benchmark-informed changes.

## Scope

In scope:
- This plan artifact.
- Five audit lane reports in `docs/reports/`.
- Backlog mapping for `ASD-###` tickets.
- Baseline command evidence and non-remediation findings.
- `docs/backlog/README.md` active-plan index.

Out of scope:
- Runtime code changes.
- Article, glossary, law, or calculator content changes.
- Route, RSS, canonical, sitemap, slug, or schema changes.
- Calculator formula changes.
- Marking editorial publish-packet gates as approved.
- Formatting broad pre-existing files.

## Audit Lanes

| Lane | Report | Purpose |
|---|---|---|
| Editorial Trust Details | `docs/reports/AUDIT-SMALL-DETAILS-EDITORIAL-TRUST-2026-05-22.md` | Article answer anchors, dates, source labels, legal/YMYL disclaimers, freshness signals, FAQ consistency. |
| Calculator Experience Details | `docs/reports/AUDIT-SMALL-DETAILS-CALCULATORS-2026-05-22.md` | Labels, helper text, defaults, validation messages, result copy, methodology blocks, share/next actions, source alignment. |
| Discovery and SEO Details | `docs/reports/AUDIT-SMALL-DETAILS-DISCOVERY-SEO-2026-05-22.md` | Titles, descriptions, breadcrumbs, related posts, internal links, search labels, hub navigation, schema/RSS/route continuity. |
| UI Polish and Accessibility Details | `docs/reports/AUDIT-SMALL-DETAILS-UI-A11Y-2026-05-22.md` | Mobile spacing, focus states, tap targets, empty/error/loading states, contrast, repeated component copy, visual alignment. |
| Governance and Automation Details | `docs/reports/AUDIT-SMALL-DETAILS-GOVERNANCE-2026-05-22.md` | Hardcoded registries, warning budgets, duplicate source definitions, stale backlog notes, checks that should become scripts. |

## Findings Backlog

Status values:
- `fix-now`: can be remediated in the next bounded batch without extra product/legal decision.
- `batch-later`: valid but not urgent.
- `needs-human-review`: requires Carlos/legal/editorial decision before edits.
- `needs-editorial-pipeline`: substantive YMYL refresh; full editorial pipeline required.
- `needs-ADR`: architectural or contract change.
- `accepted-risk`: documented and intentionally deferred.

### Lane 1 - Editorial Trust Details

| ID | Priority | Severity | Status | Work item | Evidence | Required gates |
|---|---:|---:|---|---|---|---|
| ASD-001 | P0 | 4 | needs-editorial-pipeline | Audit top YMYL articles for concrete first answer, explicit vigencia, official source traceability, and no unjustified deferral. | `TD-0085`, `TD-0086`; `check:editorial` passes structurally but does not prove substantive source freshness. | Full editorial pipeline, `pnpm run check:editorial`, `pnpm run check:editorial-timeliness`. |
| ASD-002 | P0 | 4 | needs-human-review | Cross-check law/reference pages against source labels and freshness claims. | External audit reports `github.com` hard fail and official-host/network issues; existing `TD-0084`..`TD-0094`. | `pnpm run check:legal-citations`, `pnpm run check:urls:external:audit`, human/legal sign-off for policy text. |
| ASD-003 | P1 | 3 | batch-later | Audit FAQ sections for contradictions with article body and calculator methodology. | No blocking check exists for body/FAQ contradiction; structural checks pass. | Targeted manual review, `pnpm run check:editorial`, related calculator tests if methodology changes. |
| ASD-004 | P1 | 2 | batch-later | Audit glossary entries for stale definitions, internal link usefulness, and reader-facing clarity. | Glossary has 40 entries; current checks do not score definition freshness or link usefulness. | `pnpm run check`, focused reader-copy review. |

### Lane 2 - Calculator Experience Details

| ID | Priority | Severity | Status | Work item | Evidence | Required gates |
|---|---:|---:|---|---|---|---|
| ASD-101 | P0 | 3 | fix-now | Audit every calculator label, helper text, validation copy, result units, rounding explanation, and exclusion copy. | 19 calculator pages exist; format drift touches calculator pages/components but formulas/tests pass. | Targeted component review, `pnpm run test`, `pnpm run check`. |
| ASD-102 | P0 | 4 | needs-human-review | Verify methodology/source blocks align with current official data policy and formulas. | `TD-0087`, `TD-0094`; source registry drift may affect calculator methodology labels. | Human source policy review, calculator tests, `pnpm run check:legal-citations`. |
| ASD-103 | P1 | 3 | batch-later | Audit defaults, placeholders, examples, and edge input states for misleading assumptions. | No current gate validates UX defaults or placeholder semantics. | Playwright/manual calculator pass, targeted Vitest where behavior changes. |
| ASD-104 | P2 | 2 | batch-later | Audit share/result next-action copy for clarity, no overpromising, and consistent tracking labels. | Share/result components exist and should be reviewed as trust surfaces. | `pnpm run test`, analytics/event review if labels change. |

### Lane 3 - Discovery and SEO Details

| ID | Priority | Severity | Status | Work item | Evidence | Required gates |
|---|---:|---:|---|---|---|---|
| ASD-201 | P0 | 3 | fix-now | Audit breadcrumbs, hub ownership, related posts, and internal links for cluster/canonical topic drift. | `audit:topic-overlap` reports 1 high overlap and multiple medium pairs; existing `TD-0088`, `TD-0090`, `TD-0092`. | `pnpm run audit:topic-overlap`, `pnpm run check:links`, route/RSS gates if navigation changes. |
| ASD-202 | P1 | 2 | batch-later | Audit meta titles/descriptions, snippets, and search-result promises for mismatch with page content. | `check-editorial-structure` now reports no long description warnings; mismatch still requires manual review. | `pnpm run check:editorial-structure`, manual snippet review. |
| ASD-203 | P1 | 3 | batch-later | Audit homepage, hubs, search, archives, tags, and calculators index for duplicated or stale destinations. | Existing `TD-0089`; home discovery dates and destinations can drift from content. | `pnpm run check`, screenshots if layout changes. |
| ASD-204 | P1 | 3 | accepted-risk | Verify route/RSS/schema-sensitive surfaces have no accidental public identity changes. | `check:routes` and `check:rss` pass with known additions and no removals; `check:no-postid-urls` passes. | `pnpm run check:no-postid-urls`, `pnpm run check:routes`, `pnpm run check:rss`. |

### Lane 4 - UI Polish and Accessibility Details

| ID | Priority | Severity | Status | Work item | Evidence | Required gates |
|---|---:|---:|---|---|---|---|
| ASD-301 | P0 | 3 | batch-later | Visual pass on homepage, article page, hub page, calculator page, search, legal/glossary pages across mobile and desktop. | This pass did not run screenshots; existing accessibility report is separate. | Playwright screenshots, `pnpm run check`, `pnpm run lint`. |
| ASD-302 | P0 | 4 | batch-later | Keyboard/focus/tap-target pass for nav, search, calculators, accordions, share buttons, and CTAs. | Existing audit program needs a dedicated keyboard pass before UI remediation. | Playwright keyboard checks, accessibility report update. |
| ASD-303 | P1 | 3 | batch-later | Audit empty/error/loading states, especially search, API-backed indicators, and calculator invalid input states. | No current gate validates state-copy completeness. | Manual/Playwright flow checks, targeted tests where behavior changes. |
| ASD-304 | P2 | 2 | batch-later | Audit visual consistency: spacing, button labels, icons, card density, repeated component alignment. | `format:check` baseline failure includes UI/calculator files; style consistency should be handled separately from code formatting. | Screenshots, `pnpm run format:check` after a dedicated formatting/remediation task. |

### Lane 5 - Governance and Automation Details

| ID | Priority | Severity | Status | Work item | Evidence | Required gates |
|---|---:|---:|---|---|---|---|
| ASD-401 | P0 | 3 | fix-now | Reconcile existing audit findings with `docs/TECH_DEBT_BACKLOG.md` to avoid duplicate tickets. | Existing `TD-0084`..`TD-0094` overlap this program and should remain authoritative. | Backlog review, no duplicate TD creation. |
| ASD-402 | P1 | 3 | batch-later | Identify repeated findings that deserve checks instead of manual memory. | Existing drift plan proposes checks for legal claims, YMYL freshness, source consistency, catalog drift, homepage freshness, official hosts, topic ownership, and meta budgets. | Proposed check spec before implementation; tests for any new script. |
| ASD-403 | P1 | 3 | batch-later | Audit warning budgets from current gates: editorial structure, URL checks, topic overlap, external URLs, timeliness. | External audit has 6 non-OK non-blocking findings; topic overlap has 35 candidates. | `pnpm run check:urls:external:audit`, `pnpm run audit:topic-overlap`, policy decision on warning budgets. |
| ASD-404 | P2 | 2 | fix-now | Keep active/closed backlog plan status current. | This plan was added to `docs/backlog/README.md`; deeper cleanup remains future remediation. | `pnpm run check:docs`. |

## Execution Plan

1. Create program artifact and lane reports.
2. Run audit-only baseline commands.
3. Convert findings into `ASD-###` backlog rows.
4. Remediate later in bounded batches:
   - Batch 1: P0 non-substantive trust fixes and calculator copy/validation details.
   - Batch 2: discovery/SEO drift and internal link/breadcrumb details.
   - Batch 3: UI/accessibility polish with screenshots.
   - Batch 4: automation/backlog hygiene.
5. Close each remediation batch by updating this plan and any touched TD/backlog entries.

## Progress Log

- 2026-05-22: Program plan created.
- 2026-05-22: Five lane reports created in `docs/reports/`.
- 2026-05-22: Audit-only command evidence recorded.
- 2026-05-22: `docs/backlog/README.md` updated to include this active plan.

## Verification Evidence

- `pnpm run check`: pass; 389 Astro files, 0 errors/warnings/hints.
- `pnpm run test`: pass; 87 files, 639 tests.
- `pnpm run lint`: pass.
- `pnpm run check:editorial`: pass; 50 articles validated, 46 YMYL artifacts compliant in warn-only mode.
- `pnpm run check:routes`: pass; 11 known additions, 0 removals, before=39 after=50.
- `pnpm run check:rss`: pass; 35 known additions, 0 removals, baseline=14 current=49.
- `pnpm run check:urls:external:audit`: pass non-blocking; scanned=412, blocking=0, totalNonOk=6.
- `pnpm run audit:topic-overlap`: pass non-blocking; articles=50, candidates=35, 1 high overlap.
- `pnpm run audit:reader-copy`: pass non-blocking; scanned=84, warnings=16.
- `pnpm run format:check`: fail on 21 pre-existing files before this audit artifact edit. Not remediated in this audit-only scope.

## Change Control Record

1. Scope declaration
- In scope: this plan, five audit reports, `docs/backlog/README.md`.
- Out of scope: source/runtime/content remediation, public URLs, RSS, canonicals, formulas, YMYL claims.

2. Impacted modules
- Documentation and audit artifacts only.

3. Invariant preservation
- Referenced invariants: `URL.PUBLIC.NO_POST_ID`, `ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS`, `FRONTMATTER.VALID`, `INVARIANT.EDITORIAL.*`, `INVARIANT.URLCHECK.EXTERNAL_LINK_POLICY`.
- Preservation proof: no runtime route/RSS/canonical/frontmatter/formula/content edits.

4. Contract preservation
- Referenced contracts: `CONTRACT.PUBLIC_URLS`, `CONTRACT.ROUTES_SNAPSHOT`, `CONTRACT.RSS_POLICY`, `CONTRACT.FRONTMATTER_POLICY`, `CONTRACT.YMYL_RESPONSE_STRUCTURE`.
- Breaking changes: no.

5. Boundary integrity
- Runtime layer changes: none.
- Boundary risk: none introduced.

6. Test coverage impact
- Tests changed: none.
- Runtime behavior changed: none.

7. Rollback strategy
- Revert this plan, the five reports, and the `docs/backlog/README.md` entry.
- No data/content rollback required.

8. Regression risk
- Risk level: low.
- Primary risk: audit backlog duplication or stale plan status.
- Mitigation: existing TDs are linked instead of duplicated, and plan is indexed in `docs/backlog/README.md`.

## Competitive Adaptation Appendix

- benchmarkSet: no external benchmarks used.
- patternHypothesis: not applicable.
- localDelta: audit program formalizes local trust details into repo-owned lanes and tickets.
- nonCopyBoundaries: no competitor copy, claims, URLs, or IA adopted.
- ownerTarget: repo governance and existing surfaces only.
- successSignal: findings become bounded `ASD-###` tickets with gate evidence and no silent URL/RSS/content changes.
