# GitHub Actions quota bridge runbook

Status: active again 2026-10-19. The scheduled fleet moved to the isolated
self-hosted runner `monedario-ci-isolated`; see
`docs/adr/ADR-20261019-isolated-self-hosted-runner.md` and
`docs/operations/runbooks/monedario-isolated-ci.md` for host installation and
routing. The historical notes below describe the 2026-07/08 bridge and its old
`monedario-local-bridge` label. Current live configuration:

- Repository variable: `ACTIONS_RUNNER_LABEL=monedario-ci-isolated`
- Fallback: `ubuntu-24.04` (pinned; do not use `ubuntu-latest`, which migrates
  to Ubuntu 26 from 2026-10-19)
- Runner: `monedario-ci-isolated-*`
- Job routing: every workflow job, enforced by
  `tests/static-analysis/actions-runner-portability.e2e.test.ts`

History: added 2026-07-16 (minutes exhausted), retired 2026-08-01, reactivated
2026-08-19/20 (PR #433/#434, minutes exhausted again within 3 weeks of the
prior reset), retired again 2026-09-04 after the user confirmed the September
hosted-minute allowance had reset, reactivated 2026-10-19 after billing blocked
scheduled jobs again.
**This retirement is manual, not automatic — there is no scheduled job that
reverts `ACTIONS_RUNNER_LABEL` on the monthly reset.** If minutes run out
again, re-run the reactivation steps this doc used to describe (see PR #433's
diff for the exact restore pattern) and update this Status line again.

Authority: `docs/adr/ADR-20260716-temporary-self-hosted-actions-bridge.md`
and `docs/adr/ADR-20261019-isolated-self-hosted-runner.md`

## Current configuration (2026-10-19)

See `docs/operations/runbooks/monedario-isolated-ci.md` for the disposable JIT
container launcher, host prerequisites, and online verification. The
authoritative live values are the four bullets in the Status block above.

## Historical configuration (retired 2026-09-04)

- Repository: `cortega26/Monedario`
- Repository variable: `ACTIONS_RUNNER_LABEL=monedario-local-bridge`
- Runner name: `monedario-local-bridge-202607`
- Custom label: `monedario-local-bridge`
- Container: `monedario-actions-runner`
- Restart policy: `unless-stopped`
- Image: `monedario-actions-runner:2.335.1`
- Persistent credential/work volume: `monedario-actions-runner-data`
- Local build definition:
  `/home/carlos/.local/share/monedario-actions-runner/`
- Paused workflow: `.github/workflows/claude-code-review.yml`

The container mounts only the named runner volume. It does not mount the host
workspace, development home, SSH directory, cloud credentials, or Docker socket.
The runner listener and job processes execute as container user `runner` (UID
10001), not container root.

The image pins and checksum-verifies:

- GitHub Actions runner `2.335.1`;
- Node.js `24.15.0`.

Python 3.12.3 is installed for repository URL-check subprocesses, and Google
Chrome 150 is installed for Lighthouse compatibility. Workflow-local pnpm, uv,
Gitleaks, Opengrep, Playwright, and project dependencies are installed by the
existing workflow steps without root access.

## Routine operations

Check the local container and GitHub runner registration:

```bash
docker ps --filter name=monedario-actions-runner
gh api repos/cortega26/Monedario/actions/runners \
  --jq '.runners[] | select(.name=="monedario-local-bridge-202607") |
    {name,status,busy,labels:[.labels[].name]}'
```

Inspect logs:

```bash
docker logs --tail 200 monedario-actions-runner
```

Restart after host maintenance:

```bash
docker restart monedario-actions-runner
```

The `unless-stopped` policy starts the container with Docker after a host reboot.
If it was stopped manually, start it explicitly:

```bash
docker start monedario-actions-runner
```

Verify routing configuration:

```bash
gh variable list --repo cortega26/Monedario |
  grep '^ACTIONS_RUNNER_LABEL[[:space:]]'
```

Do not add the `dependabot` label or enable Dependabot self-hosting. GitHub's own
Dependabot update-generation jobs remain free on standard hosted runners; only
the repository's downstream PR checks use this bridge.

## Incident handling

If the runner is offline for less than 24 hours, start the container and allow
queued jobs to resume. If a job has expired or was created with the wrong runner
selection, cancel and re-run it.

If the container fails before starting the listener:

1. Read `docker logs monedario-actions-runner`.
2. Confirm the named volume still exists with
   `docker volume inspect monedario-actions-runner-data`.
3. Do not delete the volume; it contains the repository runner registration.
4. Rebuild from the local build definition and recreate the container with the
   same repository, name, label, and volume. A new registration token is not
   needed while `.runner` remains in the volume.

If compromise is suspected, immediately delete `ACTIONS_RUNNER_LABEL`, stop the
container, remove the runner in GitHub Settings, rotate repository secrets that
were available to jobs, and rebuild from an empty volume. Do not reuse the old
work volume.

## Retirement

This is a **manual checklist, not an automated process** — nothing reverts
`ACTIONS_RUNNER_LABEL` on its own when the monthly hosted-minute allowance
resets. Run this after confirming the reset (ask the user to check
github.com/settings/billing; there is no billing API scope available to
verify this directly).

```bash
gh variable delete ACTIONS_RUNNER_LABEL --repo cortega26/Monedario
gh workflow enable claude-code-review.yml --repo cortega26/Monedario
docker stop monedario-actions-runner
docker rm monedario-actions-runner
```

`gh workflow enable` only works if the file is still named
`claude-code-review.yml` (a workflow disabled via the API). If it was
disabled by renaming to `claude-code-review.yml.disabled` instead (as it was
2026-08-01, for an unrelated reason — see "Known deviations" below), that
step will 403 with "Unable to enable a workflow that is not active"; skip it
and handle the rename separately.

Cancel and re-run any workflow that was queued before the variable deletion so
the new run resolves to `ubuntu-latest` (a job's `runs-on` label is fixed at
queue time — deleting the variable afterward does not retarget an
already-queued job):

```bash
queued_ids="$(gh run list --status queued --json databaseId --jq '.[].databaseId')"
echo "${queued_ids}" | xargs -n1 gh run cancel
# Wait until every ID above shows a terminal status (gh run list --json status),
# then rerun the SAME captured IDs — do not re-query `--status cancelled`,
# which can return unrelated historical cancellations past this incident
# (including ones with deployment or repository-write side effects) and, if
# more than the default 20-result page qualify, can omit runs from this batch.
echo "${queued_ids}" | xargs -n1 gh run rerun
```

Remove the GitHub runner registration and local resources:

```bash
remove_token="$(gh api --method POST \
  repos/cortega26/Monedario/actions/runners/remove-token --jq .token)"

docker run --rm --user runner \
  --entrypoint /bin/bash \
  --env RUNNER_REMOVE_TOKEN="${remove_token}" \
  --volume monedario-actions-runner-data:/runner \
  monedario-actions-runner:2.335.1 \
  -lc 'cd /runner && ./config.sh remove --token "$RUNNER_REMOVE_TOKEN"'

unset remove_token
docker volume rm monedario-actions-runner-data
docker image rm monedario-actions-runner:2.335.1
```

If `config.sh remove` fails with "Runner ... is currently running a job and
cannot be deleted" even though no job is actually in progress (this happens
when the container was stopped mid-job and GitHub's server-side state didn't
clear), skip the token-based removal and force it from the admin side
instead, then still run the two `docker` cleanup commands above:

```bash
runner_ids="$(gh api repos/cortega26/Monedario/actions/runners \
  --jq '[.runners[] | select(.name == "monedario-local-bridge-202607")] | .[].id')"
runner_count="$(echo "${runner_ids}" | grep -c . || true)"
if [ "${runner_count}" != "1" ]; then
  echo "Expected exactly one runner named monedario-local-bridge-202607, found ${runner_count}. Aborting — do not delete blind." >&2
  exit 1
fi
gh api -X DELETE "repos/cortega26/Monedario/actions/runners/${runner_ids}"
```

Never delete by `.runners[0]` alone — with more than one registered runner
that can unregister an unrelated one while leaving the stale bridge
registration in place.

Finally verify:

```bash
gh api repos/cortega26/Monedario/actions/runners --jq '.runners'
gh variable list --repo cortega26/Monedario
gh workflow list --all --repo cortega26/Monedario |
  grep 'Claude Code Review'
```

Update `docs/backlog/PLAN-actions-quota-bridge-2026-07-16.md` with retirement
evidence. The workflow fallback remains in source as a dormant incident control;
with no variable set, every job resolves to `ubuntu-latest`.

## Known deviations from this runbook

- `claude-code-review.yml` was disabled by renaming to `.yml.disabled`
  (`2e6b8ee5`, 2026-08-01), not via `gh workflow disable`, and not solely
  because of this bridge — the stated reason was an expired
  `CLAUDE_CODE_OAUTH_TOKEN` (all runs were failing with `is_error:true`).
  Do not re-enable it as part of a routine retirement without first
  confirming the OAuth token has been renewed; it will otherwise resume
  failing on every run.

## Retirement evidence — 2026-09-04

- User confirmed the September hosted-minute allowance had reset before
  retirement began.
- `gh variable delete ACTIONS_RUNNER_LABEL` — done.
- `claude-code-review.yml` re-enable — skipped; still `.yml.disabled` for the
  unrelated OAuth-token reason above.
- Container stopped/removed while one job was still mid-execution (queue had
  built up to 13 jobs from same-session PR/issue work); this left the runner
  registration in a stale "busy" state that blocked the normal
  `config.sh remove --token` flow. Worked around with
  `DELETE /repos/{owner}/{repo}/actions/runners/{id}` (documented above as
  the new fallback path).
- 6 runs left queued against the deleted runner label were cancelled and
  rerun; confirmed resolving to `ubuntu-latest` (run `33885629878`, jobs
  reported `runner_name: "GitHub Actions ..."`, `labels: ["ubuntu-latest"]`).
- Docker volume `monedario-actions-runner-data` and image
  `monedario-actions-runner:2.335.1` removed.
- Verified: `gh api repos/cortega26/Monedario/actions/runners` → `[]`;
  `gh variable list` no longer lists `ACTIONS_RUNNER_LABEL`.
