# ADR-20260716: Temporary self-hosted GitHub Actions quota bridge

Date: 2026-07-16
Status: Accepted
Retirement trigger: GitHub-hosted monthly allowance confirmed reset on or after
2026-08-01

## Context

The private repository exhausted its 2,000 included GitHub-hosted Actions
minutes before month end. GitHub blocks additional hosted execution when no
payment method or paid budget is available, while pull requests, issues,
repository operations, and Dependabot update generation remain available.

The default branch has 27 Linux jobs across 20 workflow files. Those jobs protect
the mandatory CI gates, security scans, data-signal collection, scheduled issue
automation, dependency maintenance, and search operations. Replacing GitHub
Actions or making the repository public for a short quota incident would create
more security and migration risk than the incident itself.

GitHub's current billing documentation states that self-hosted runner execution
does not consume the included GitHub-hosted allowance and that included minutes
reset at the start of each month:

- https://docs.github.com/en/billing/concepts/product-billing/github-actions
- https://docs.github.com/en/actions/concepts/runners/self-hosted-runners

This decision is subordinate to and does not replace
`ADR-20260516-economic-snapshot-cloudflare-worker.md`. The Worker remains the
permanent quota-independent writer for the economic snapshot. This ADR covers a
time-bounded incident bridge for the broader workflow fleet.

## Decision

1. Every current workflow job resolves its runner label from repository variable
   `ACTIONS_RUNNER_LABEL`, with `ubuntu-latest` as the empty/unset fallback:

   ```yaml
   runs-on: ${{ vars.ACTIONS_RUNNER_LABEL || 'ubuntu-latest' }}
   ```

2. During the incident, set the variable to a unique label assigned to one
   repository-scoped Linux x64 runner. Do not register an organization-wide or
   public-repository runner.
3. Run the service under a dedicated operating-system account without general
   `sudo`, personal SSH keys, cloud credentials, or access to the development
   user's home.
4. Install workflow-local tools under `RUNNER_TEMP` and expose them through
   `GITHUB_PATH`; workflow execution must not write to `/usr/local/bin` or depend
   on passwordless root.
5. Keep one runner instance. Serial job execution is acceptable for the bridge
   and avoids cross-worktree concurrency on one persistent host.
6. Only trusted internal branches may trigger workflows while the bridge is
   active. Existing third-party actions remain pinned to immutable SHAs.
7. On the retirement trigger, delete `ACTIONS_RUNNER_LABEL`, cancel/re-run jobs
   queued before deletion, and unregister/remove the local runner.

The variable fallback is retained after retirement as a disaster-recovery
control. With no variable set, default CI behavior is exactly `ubuntu-latest`.
Gate commands, permissions, triggers, timeouts, and pass/fail semantics do not
change.

## Consequences

- Native GitHub checks, schedules, artifacts, tokens, and PR integration remain
  available without purchasing hosted minutes.
- The runner host becomes a security boundary. Persistent self-hosted runners do
  not receive GitHub-hosted clean-VM guarantees, so account isolation and
  trusted-trigger restrictions are mandatory.
- Jobs execute serially and may take longer than hosted parallel execution.
- Scheduled jobs can wait for the runner to come online; GitHub documents a
  24-hour self-hosted job queue timeout.
- The fallback removes the need for a rollback commit on August 1 and makes the
  incident control testable before it is needed again.
- No public URL, content, application, deployment, or data schema changes.

## Alternatives considered

1. **Make the repository public.** Rejected: disclosure of private history and
   project material is disproportionate and not reliably reversible.
2. **Migrate to another CI provider.** Rejected: duplicates secrets, checks,
   schedules, and branch-policy integration for a two-week incident.
3. **Use a cloud free-tier VM.** Rejected: adds an external account, possible
   billing exposure, public network surface, and maintenance burden.
4. **Run checks only through local shell commands.** Rejected as the primary
   path: useful as fallback, but required GitHub check conclusions and scheduled
   automations would disappear.
5. **Disable all workflows until August.** Rejected: loses vulnerability,
   freshness, and regression detection during active development.
6. **Permanent self-hosting.** Rejected: the persistent security/maintenance
   cost is not justified once hosted minutes reset.

## Verification

- Focused static test proves all current `runs-on` declarations use the variable
  with `ubuntu-latest` fallback.
- Focused static test proves bootstrap/security installers avoid root-owned
  locations and publish temporary tool directories through `GITHUB_PATH`.
- Parse all workflow and composite-action YAML files.
- Run the mandatory gate set from
  `docs/development/REGRESSION_PREVENTION.md` Rule 5.1.
- Register the custom runner, set the repository variable, and complete one
  manually dispatched smoke workflow on the self-hosted label.
- Delete or override the variable in a controlled check to confirm fallback
  syntax before final retirement.

## Rollback

Delete repository variable `ACTIONS_RUNNER_LABEL`. New jobs immediately resolve
to `ubuntu-latest`. Cancel and re-run any older queued jobs because runner choice
is evaluated when their workflow run is created. Then stop, unregister, and
remove the dedicated runner account. No data or content rollback is required.
