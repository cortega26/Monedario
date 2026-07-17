# Plan: Issue #315 search operations, traffic analysis, and SEO/GEO improvement

Status: complete
Owner: repository owner
Started: 2026-07-16
Tracking issue: GitHub #315 (`Weekly search ops: 2026-W28`)

## Task Brief

- Objective: complete the 2026-W28 search-operations bundle, produce a durable
  and source-backed traffic/SEO/GEO analysis, perform a deep repository audit,
  implement only the highest-value evidence-backed improvements, and close
  Issue #315 with reproducible evidence.
- In scope: W28 GSC pages/queries/query-page/sitemaps data, Cloudflare traffic
  and RUM data, Google and Bing indexation notes, the weekly scorecard, a
  portable analytical report, a read-only `/improve deep` implementation plan,
  bounded follow-up changes justified by the analysis, tests, PR review, merge,
  and issue closure.
- Out of scope unless separately admitted by the evidence and governance gates:
  new public URLs, calculators, hubs, substantive YMYL copy, URL identity,
  canonical/RSS behavior, paid analytics providers, raw visitor events, and
  speculative SEO changes.
- Invariants/contracts: Constitution §§1, 4, 6, 9, and 10; repository data
  minimization rules; `URL.PUBLIC.NO_POST_ID`; `CONTRACT.PUBLIC_URLS`;
  `CONTRACT.ROUTES_SNAPSHOT`; `CONTRACT.RSS_POLICY`; the weekly search ritual;
  and `docs/development/CRITERIO_VIABILIDAD.md`.
- Required gates: source-data schema and coverage checks, report validation,
  relevant targeted tests, and the complete repository regression gate set for
  any source change. Route/RSS/canonical gates remain mandatory if their scope
  becomes affected.
- Deliverable: a green merged PR containing the completed W28 evidence bundle,
  validated report and deep-audit plan, plus any admitted improvement; Issue
  #315 closes only after the merged artifacts and 1–3 next actions are linked.

## Authority, assumptions, and decision boundary

- Authority order: `docs/AI_ENGINEERING_CONSTITUTION.md` > `AGENTS.md` >
  `context/*.md` > source.
- Rule 2.13 requires this plan because the task spans multiple sessions,
  generated data, analytical artifacts, source review, implementation, and
  remote GitHub closure.
- Work occurs in isolated worktree `/tmp/monedario-issue315-20260716` on branch
  `analysis/issue315-search-ops-2026-07`, based on `origin/main` at
  `efe021c7`. Existing user edits in the primary worktree are excluded.
- W28 (2026-07-06 through 2026-07-12) is the latest complete even ISO week and
  therefore the correct bundle under the biweekly ritual.
- On-site event analysis remains intentionally deferred until the repository's
  approximately 100 organic clicks/week threshold is reached. W28 recovery
  measured 498 organic clicks, so the threshold is now exceeded and the
  privacy-aggregated first-party export is admitted as supplementary evidence;
  raw events and personal data remain prohibited.
- A recommendation is not implementation authority. Any proposed new surface,
  YMYL refresh, or URL-affecting change must first pass its dedicated editorial,
  non-cannibalization, ownership, and contract checks.

## Source inventory and data-quality incident

- First-party sources: normalized GSC exports under
  `output/operations/data-signals/gsc/`, Cloudflare traffic and RUM exports under
  `output/operations/data-signals/cloudflare/`, existing weekly bundles, and
  repository-owned audit scripts.
- Workflow evidence: Weekly Search Ops run `29239057763` created artifact
  `weekly-search-ops-2026-W28` but could not build the scorecard because W28
  provider exports were absent from its checkout.
- Root cause: scheduled Data Signals runs on 2026-07-14 through 2026-07-16
  failed before creating any job steps, matching hosted-runner capacity
  exhaustion rather than an API, schema, or application failure.
- Recovery: fetch the same read-only provider data locally using the repository
  scripts and configured credentials, without logging secret values. This uses
  no GitHub-hosted runner minutes. Preserve the workflow artifact as provenance.
- Analytics incident: the deployed Cloudflare trigger is `57 7 * * 1`.
  Cloudflare defines weekday `1` as Sunday, while repository comments and export
  logic require Monday. The live Worker also predates the repository's change
  from query-string secret authentication to the `Authorization` header. W28
  will be recovered only after deploying the already-hardened handler with an
  unambiguous `MON` trigger; the secret will not be placed in a URL.
- Known limitations: historical weekly sources contain gaps and current organic
  click volume is low. Comparisons must disclose coverage, avoid false precision,
  and distinguish observation from inference.

## Execution phases and acceptance criteria

1. Recover and validate W28 data.
   - Download and inspect the original workflow artifact.
   - Fetch W28 GSC and Cloudflare signals with repository scripts.
   - Validate dates, schemas, row counts, URL sanitization, and absence of raw
     visitor data or credentials.
2. Complete search operations and analysis.
   - Add a traceable Google+Bing indexation note.
   - Generate the W28 scorecard and choose no more than three next actions.
   - Compare W28 with W27 and an explicitly covered multi-week baseline.
   - Produce and validate one self-contained HTML traffic/SEO/GEO report with
     visible sources, caveats, recommendations, and at least one evidence chart.
3. Perform `/improve deep` in read-only audit mode.
   - During this phase source code remains untouched; the only write is a
     self-contained implementation plan under `plans/`.
   - Audit all required categories and connect findings to observed traffic and
     search evidence. Personally verify every admitted finding in repository
     source before ranking it.
4. Admit and implement bounded improvements.
   - Exit audit mode explicitly before editing source.
   - Apply viability, non-cannibalization, YMYL, and URL gates as applicable.
   - Prefer automation/data-quality fixes over speculative copy or surface
     expansion. It is acceptable to implement no source change if evidence does
     not support one.
5. Validate and close.
   - Run targeted and full gates proportional to the final diff.
   - Open one change-controlled PR, require blocking local-runner CI/security
     checks, merge by expected head SHA, then update and close Issue #315.

## Rollback

- Generated W28 exports and reports can be reverted with squash `ac0c4a17`.
- Before the analytics cutover, the bounded Worker/config change can be
  reverted. At or after 2026-07-20 00:00 CLT, set `ANALYTICS_DISABLED=1` and
  fix forward on v2; reverting the writer to v1 would split W30 counters.

## Progress log

- 2026-07-16: Remaining maintenance PRs completed; repository has no open PRs.
- 2026-07-16: Confirmed W28 artifact provenance and isolated the missing-export
  incident to hosted-runner capacity before job startup.
- 2026-07-16: Confirmed required GSC and Cloudflare configuration keys are
  available locally without exposing values; selected zero-minute local recovery.
- 2026-07-16: Recovered W28 GSC and Cloudflare signals. GSC recorded 498 clicks,
  crossing the first-party analytics review threshold.
- 2026-07-16: Diagnosed missing W28 analytics export as a numeric weekday error
  in the deployed Cron Trigger and confirmed production deployment drift from
  the repository's header-authenticated manual export handler.
- 2026-07-16: Merged hotfix PR #330 at `353fa875`, deployed that exact merged
  tree to Cloudflare (version `73e72057-cf67-430e-b4e4-2fa5610807a1`), and
  verified the live schedule is `57 7 * * MON`. Live smoke: missing/query-only
  credentials return 401; header-authenticated W28 export returns 200.
- 2026-07-16: Recovered and validated W28 first-party analytics from R2: 310
  aggregate rows, 2,044 events, six allowlisted event types, window
  2026-07-06 through 2026-07-12. No raw visitor events or personal data.
- 2026-07-16: Completed `/improve deep`; created plans 048–052 and confirmed
  existing plan 047 is viable with Cloudflare `requestHost`. Rejected bulk
  indexing/rewrites, a new UTM URL, universal 3.5% CTR forecasts, and unmeasured
  GEO expansion.
- 2026-07-16: Plan 047 implementation independently executed and reviewed,
  integrated as `a3ac9504`, and used to refetch W28 RUM scoped at source to
  `monedario.cl`; the route allowlist remains defense in depth.
- 2026-07-16: Plan 048 implementation independently executed, revised, and
  reviewed, then integrated as `e472ea43`. Focused tests passed 14/14 and the
  full suite passed 1,043/1,043; the real W28 run now reports `+1` click and
  `+11,703` impressions with explicit valid/missing/invalid source states.
- 2026-07-16: Plan 050 implementation independently executed and reviewed, then
  integrated as `e01d4a93`. The search-ops workflow now runs weekly through
  July, classifies analytics incidents explicitly, and requires the measured
  cadence decision on 2026-08-01; all 1,040 tests and workflow/docs gates passed.
- 2026-07-16: Plan 049 implemented as `ba33fb71` and locally reviewed. Ingestion dates and
  default export weeks now honor `America/Santiago`; aggregate completes/starts
  render as `results/start` event ratios rather than conversion, and the false
  `<35%` UX warning is removed. Focused tests passed 86/86 and the full suite
  passed 1,055/1,055; production deployment/smoke follows the final merge.
- 2026-07-16: Built the canonical W28 traffic/SEO/GEO report with six source
  records, four bounded datasets, five decision metrics, a multiweek chart,
  explicit questions/caveats, and three guarded actions. Artifact validation
  and exact structural verification passed. Shared-reader browser verification
  retained a documented horizontal-overflow limitation after both native tables
  were removed; the self-contained HTML and semantic fallback remain readable.
- 2026-07-16: PR #331 passed all blocking build/test/security/URL checks and
  merged by expected head SHA as `ac0c4a17`. A late P1 review finding was fixed
  before merge with a versioned v1/UTC → v2/Santiago cutover at the W30 local
  boundary; the full suite passed 1,061/1,061.
- 2026-07-16: Deployed exact merge `ac0c4a17` as analytics Worker version
  `dbc273e9-4f89-48f8-b572-fff6e536ff81`. Live W28 export returned 310 rows /
  2,044 events; missing-header and query-only authentication returned 401.
  Plan 049 was closed and archived atomically. Issue #315 remote closure follows
  the merge of this final bookkeeping change.
- 2026-07-16: Final closure CI identified a real HTTP 410 from AFC's redesigned
  marketing root for non-browser clients. The two calculator links used solely
  to retrieve a real CIC balance now target AFC's official Sucursal Virtual at
  `https://personas.afc.cl/`; no formula, claim, route, or eligibility behavior
  changed. Focused tests passed 4/4, the 327-page build and 1,564-link internal
  URL gate passed, and the exact external CI-mode gate reported zero blocking
  failures across 462 unique external URLs.
- 2026-07-16: A later closure run exposed another referrer to AFC's marketing
  root returning HTTP 410 to the lightweight CI probe. Scrapling 0.4.7 fetched
  the same URL with browser-like headers at HTTP 200, title `AFC Chile - Le damos
  la bienvenida`, and a 69,003-byte body. The validator now records AFC
  403/410/429 responses as non-blocking automation issues while retaining AFC's
  `official_source` identity and blocking genuine 404/5xx failures. Authoritative
  AFC citations remain intact.

## Change Control Record

1. Scope declaration
- In scope: the paths and lifecycle stated in the Task Brief.
- Out of scope: public-surface expansion and speculative/YMYL/URL changes unless
  explicitly re-admitted after their mandatory policy gates.

2. Impacted modules
- Initially: `output/operations/data-signals/`,
  `output/operations/weekly-search-performance/2026-W28/`, `plans/`, and this
  plan. Admitted incident repair: `workers/analytics-collector/wrangler.toml`
  and its co-located test coverage under `tests/workers/analytics-collector/`.
  Admitted evidence-integrity improvement: `scripts/data-signals/cloudflare-fetch.mjs`
  plus `tests/scripts/cloudflare-rum-query.test.ts`; it filters account-level
  RUM by `requestHost` without changing the downstream row contract. Search
  scorecard integrity paths from plan 048 are implemented by
  `scripts/build-weekly-search-report.mjs` and
  `scripts/audit-ctr-opportunities.mjs`, with their focused tests and ADR.
  Current-scale weekly operating semantics from plan 050 update
  `.github/workflows/weekly-search-ops.yml`, its runbook/context/policy surfaces,
  one focused static test, and a time-bounded cadence ADR.
  Analytics calendar/interpretation paths from plan 049 update the collector,
  weekly report, focused Worker/report tests, and a data-contract ADR without
  changing the event payload, export schema, KV binding, or PII scope; internal
  key prefixes are versioned to prevent mixed calendar semantics. The final
  admitted CI repair covers the two official balance-retrieval links in
  `src/pages/calculadoras/seguro-cesantia.astro` plus the narrow AFC
  anti-automation classification in `scripts/urlcheck/` and its focused test.

3. Invariant preservation
- Referenced: Constitution §§1, 4, 6, 9, 10 and `URL.PUBLIC.NO_POST_ID`.
- Proof: recovery and analysis do not derive URLs from `post.id`; the admitted
  link repair changes no Monedario public path, canonical, route, RSS identity,
  calculator formula, or structured claim.

4. Contract preservation
- `CONTRACT.PUBLIC_URLS`, `CONTRACT.ROUTES_SNAPSHOT`, and
  `CONTRACT.RSS_POLICY`; no breaking change is currently planned.

5. Boundary integrity
- Data/report generation adds no production import. Any runtime edit requires
  `check:boundaries` and an updated impacted-module declaration.

6. Test coverage impact
- Generated data receives schema/coverage validation. Source changes, if any,
  require targeted tests plus the repository regression suite.

7. Rollback strategy
- Revert generated evidence/report changes as one unit. The analytics Worker is
  revertible before cutover; after cutover, disable ingestion and fix forward on
  v2. No destructive production-data migration is required.

8. Regression risk
- Current risk is low for production and medium for analytical interpretation:
  sparse clicks, historical gaps, and provider aggregation can overstate trends.
- Mitigations: explicit coverage, multi-window comparisons, data-quality checks,
  source-linked claims, report validation, bounded actions, and full gates for
  any admitted source change.

Competitive Adaptation Appendix: not applicable at plan start. If a competitor
benchmark or new public surface becomes part of an admitted recommendation, the
appendix and required governance policies must be completed before implementation.
