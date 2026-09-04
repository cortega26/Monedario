# Plan: temporary GitHub Actions quota bridge

Status: retired 2026-09-04 (second retirement — see the "Lifecycle after
this plan" note in the Completion evidence section: retired 2026-08-01,
reactivated 2026-08-19/20 per PR #433/#434, retired again 2026-09-04)
Owner: repository owner
Started: 2026-07-16

## Task Brief

- Objective: preserve pull-request CI, security scanning, dependency maintenance,
  issue automation, and search/traffic operations after the private-repository
  GitHub-hosted runner allowance is exhausted.
- In scope: configurable runner routing in `.github/workflows/**`, portable
  bootstrap actions, repository-scoped self-hosted runner provisioning, GitHub
  Actions variable configuration, governance records, validation, and rollback.
- Out of scope: `src/**`, public routes, canonical/RSS behavior, editorial
  content, deployment targets, repository visibility, and paid services.
- Invariants/Contracts to preserve: Constitution §§1, 6, 9-10;
  `URL.PUBLIC.NO_POST_ID`; `CONTRACT.PUBLIC_URLS`; `CONTRACT.ROUTES_SNAPSHOT`;
  `CONTRACT.RSS_POLICY`; existing CI gate commands and failure semantics.
- Required gates: workflow YAML parse and focused workflow tests, then the full
  gate set from `docs/development/REGRESSION_PREVENTION.md` Rule 5.1.
- Deliverable: one repository-scoped Linux runner selected through a temporary
  repository variable, with a deterministic August 1 rollback.
- Benchmark observed: GitHub documents self-hosted Actions execution as outside
  the included hosted-minute allowance.
- Why it worked externally: jobs retain native GitHub checks, tokens, secrets,
  artifacts, schedules, and PR integration while compute runs on owned hardware.
- Proposed local delta: use a repository-only, custom-labeled, least-privilege
  runner and preserve `ubuntu-latest` as the automatic default.
- What will not be copied: no public-repository conversion, third-party CI
  migration, cloud free-tier VM, organization-wide runner, or unpinned action.
- Owner/surface affected: repository automation only; no public/indexable
  surface.
- Success signal: a GitHub workflow job completes on the custom self-hosted
  label without consuming hosted minutes, and deleting one repository variable
  restores `ubuntu-latest` routing.

## Authority and decisions

- Authority order: `docs/AI_ENGINEERING_CONSTITUTION.md` > `AGENTS.md` >
  `context/*.md` > source.
- Rule 2.13 requires this versioned plan because the implementation touches more
  than three files.
- Rule 4.3 requires an ADR because runner selection changes CI execution
  semantics even though the gate commands and pass/fail behavior remain stable.
- The long-term Cloudflare Worker decision in
  `docs/adr/ADR-20260516-economic-snapshot-cloudflare-worker.md` remains intact;
  this runner is a time-bounded incident bridge, not a replacement architecture.

## Implementation phases

1. Record the temporary routing decision and rollback in an ADR/change record.
2. Make all 27 default-branch jobs configurable with an `ubuntu-latest`
   default.
3. Remove hosted-image root-write assumptions from shared bootstrap/security
   installation steps.
4. Provision a container-isolated non-root runner, register it only to
   `cortega26/Monedario`, and select it through the repository variable.
5. Run repository gates and a live workflow smoke test.
6. Commit, push, open a draft PR, and record final evidence here.

## Risk controls

- The runner is repository-scoped and has a custom label.
- The runner account must not have general `sudo`, SSH keys, cloud credentials,
  or access to the normal development user's home directory.
- Only trusted internal branches may execute during the bridge.
- Third-party actions remain pinned to immutable commit SHAs.
- A single runner instance serializes jobs and reduces persistent-state races.
- Existing user modifications in the primary worktree are excluded.

## Rollback

1. Confirm the monthly hosted-minute allowance has reset on or after 2026-08-01.
2. Delete repository variable `ACTIONS_RUNNER_LABEL`.
3. Cancel and re-run any job that was queued before variable deletion.
4. Stop and unregister the repository runner.
5. Remove the runner container, named volume, and local image.

The workflow expressions then resolve to `ubuntu-latest`; no rollback commit is
required. The portability changes may remain because they do not alter default
behavior.

## Progress log

- 2026-07-16: Scope, authority, invariants, contracts, and rollback declared.
- 2026-07-16: Isolated worktree created from `origin/main` at branch
  `agent/actions-quota-bridge`; primary dirty worktree left untouched.
- 2026-07-16: Accepted
  `docs/adr/ADR-20260716-temporary-self-hosted-actions-bridge.md` as the durable
  CI execution decision; the existing Cloudflare Worker architecture remains
  unchanged.
- 2026-07-16: Updated 27 `runs-on` declarations to resolve
  `ACTIONS_RUNNER_LABEL` with `ubuntu-latest` fallback; moved pnpm, uv,
  Gitleaks, and Opengrep installation into runner-temporary paths.
- 2026-07-16: Focused portability tests passed (2/2); all workflow and composite
  action YAML parsed successfully; targeted formatting passed.
- 2026-07-16: Built a container-isolated runner image with checksum-verified
  GitHub runner 2.335.1 and Node 24.15.0. Non-root bootstrap probe passed for
  pnpm 11.7.0, uv 0.8.5, and Chrome 150.
- 2026-07-16: Registered repository-only runner
  `monedario-local-bridge-202607`; verified online, non-root listener UID 10001,
  named-volume-only mount, no Docker socket, and no retained registration token
  in the live container environment.
- 2026-07-16: Set repository variable
  `ACTIONS_RUNNER_LABEL=monedario-local-bridge` and temporarily disabled Claude
  Code Review to avoid unrelated AI usage during the bridge.
- 2026-07-16: Full mandatory validation passed: lint, boundaries, format, 1,036
  tests, frontmatter, routes (53 before/after; no changes), Astro check (0
  errors), and production build/URL check (327 pages; 1,543 links; 0 broken).
- 2026-07-16: PR #326 exercised every routed PR workflow on the custom
  runner label. The first full-build attempt exposed a missing system `python3`
  runtime in the image during URL checking; the image was rebuilt with Python
  3.12.3 and the failed job was re-run rather than weakening the gate.
- 2026-07-16: GitHub Actions run `29520310584` attempt 2 passed the complete
  CI chain on the self-hosted runner: code standards/tests, build, internal URL
  and RSS checks, accessibility audit, and the blocking external URL check.
  Python CI, Gitleaks, Opengrep, Trivy, and Cloudflare Pages also passed on the
  same PR head.
- 2026-07-16: After the live run drained, the runner container was recreated
  from its persistent registration volume without `RUNNER_TOKEN`; GitHub
  reports it online and idle with the intended custom label.

## Change Control Record

1. Scope declaration
- In scope: workflow runner routing, portable CI tool bootstrap, focused tests,
  governance records, and repository-scoped runner operations.
- Out of scope: runtime/application code, URLs, RSS, content, deployment,
  repository visibility, and paid resources.

2. Impacted modules
- `.github/workflows/**`: resolve the execution label without changing jobs.
- `.github/actions/bootstrap-{pnpm,python}/action.yml`: remove root-owned install
  path assumptions.
- `tests/static-analysis/**`: lock the runner-routing and portability contract.
- `docs/adr/**`, `docs/operations/runbooks/actions-quota-bridge.md`, this plan:
  decision, operations, evidence, and rollback traceability.

3. Invariant preservation
- Referenced invariants: Constitution §§1 and 6; `URL.PUBLIC.NO_POST_ID`.
- Preservation proof: no application, route, canonical, RSS, or content path is
  edited; all existing gate commands and blocking behavior remain present.

4. Contract preservation
- Referenced contracts: `CONTRACT.PUBLIC_URLS`, `CONTRACT.ROUTES_SNAPSHOT`,
  `CONTRACT.RSS_POLICY`.
- Breaking changes: no.

5. Boundary integrity
- Layer boundary check (`pnpm run check:boundaries`): pass.
- Unauthorized cross-layer imports introduced: no; no runtime imports changed.

6. Test coverage impact
- Changed runtime layers: none.
- Related tests added/updated:
  `tests/static-analysis/actions-runner-portability.e2e.test.ts`.
- Coverage threshold status: not applicable to domain/application/infrastructure;
  full test gate passed (125 files, 1,036 tests).

7. Rollback strategy
- Revert unit: delete `ACTIONS_RUNNER_LABEL`, then unregister the runner.
- Data/content rollback needed: no.

8. Regression risk
- Risk level: medium while self-hosted routing is active; low when variable is
  unset.
- Primary regression vectors: invalid expression syntax, missing host tools,
  privilege assumptions, persistent-runner compromise, stale queued jobs.
- Mitigations: YAML/static tests, temporary-path installation, isolated account,
  repo-only label, trusted branches, live smoke run, documented rollback.

Competitive Adaptation Appendix: not applicable. This is incident operations,
not benchmark-driven product/editorial work and creates no visible surface.

## Completion evidence

- Implementation commit: `521aaf82` (`chore(ci): add temporary self-hosted
  runner bridge`).
- Review surface: PR #326 on branch `agent/actions-quota-bridge`.
- Routing proof: repository variable resolves all 27 jobs to
  `monedario-local-bridge`; deleting the variable restores `ubuntu-latest`.
- Isolation proof: listener/job UID 10001, named runner volume only, no host
  workspace/home/SSH/cloud-credential/Docker-socket mounts, and no retained
  registration token.
- Local proof: all mandatory gates passed, including 125 test files / 1,036
  tests, 53 unchanged routes, 327 built pages, and 1,543 checked links with 0
  broken.
- Live proof: GitHub Actions run `29520310584` attempt 2 passed the full CI,
  browser accessibility, external URL, Python, and security workflow chain on
  the custom self-hosted label.
- Lifecycle after this plan: retired 2026-08-01 (`042c8766`), reactivated
  2026-08-19/20 (PR #433/#434, minutes exhausted again inside 3 weeks of the
  prior reset), retired again 2026-09-04 — see the runbook's "Retirement
  evidence — 2026-09-04" section for the second retirement's evidence.
  Retirement is a manual runbook execution each time, not automated.
- **If minutes are exhausted a third time, do NOT use PR #433's diff as the
  reactivation template** — it only restores the
  `${{ vars.ACTIONS_RUNNER_LABEL || 'ubuntu-latest' }}` fallback pattern in
  workflow files, which is already present in source (retirement only
  deletes the repository *variable*, never that pattern — see the runbook's
  "with no variable set, every job resolves to `ubuntu-latest`" note). That
  PR alone reactivates nothing: it does not rebuild the runner image, create
  the container/volume, or register a runner with GitHub. Full reactivation
  needs, in order: (1) rebuild the image from the local build definition
  (`/home/carlos/.local/share/monedario-actions-runner/`, pinned to GitHub
  Actions runner `2.335.1` + Node `24.15.0` — see the runbook's "Live
  configuration" section for the exact image/container/volume names and
  isolation constraints); (2) register a fresh repository-only runner named
  `monedario-local-bridge-202607` with label `monedario-local-bridge`
  (Implementation phase 4 above has the isolation requirements — non-root,
  named-volume-only, no Docker socket); (3) set the repository variable
  `ACTIONS_RUNNER_LABEL=monedario-local-bridge`; (4) run a live workflow
  smoke test (phase 5) before trusting it for real PR traffic.
