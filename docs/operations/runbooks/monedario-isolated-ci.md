# Monedario — isolated GitHub Actions bridge (October 2026)

**Status: ACTIVE on the `i5-12600K` since 2026-10-19.** The repository
variable routes jobs to the `monedario-ci-isolated` label. A host-side liveness
watchdog was added on 2026-10-31 for the stale-lease failure tracked in #745.

The 2026-09-04 `monedario-local-bridge` was retired and its image/registration volume removed. This version uses **one-job JIT containers** and reuses the tested `pcp-ci-isolated:2.338.0` image from `cortega26/portfolio-control-plane`, without sharing the persistent `pcp-local` identity. No VM or Fintual production resource is needed.

## Safety prerequisites (PC only)

- Trusted operator on the `i5-12600K`, with Docker, GitHub CLI and repository **runner administration** for Monedario.
- The existing image `pcp-ci-isolated:2.338.0` has been built and verified from the control-plane's `ops/ci-runner/Dockerfile`. Confirm: `docker image inspect pcp-ci-isolated:2.338.0`.
- Inspect free RAM, disk and CPU; each disposable job is bounded by 3 CPU, 8 GiB memory, 5 GiB runner tmpfs, +512 MiB home and temp. Do not run if resources are insufficient.
- No pull requests from untrusted contributors while using the bridge, because repository code executes with an Actions token inside the container. Keep token read-only for CI, no host secrets injected.
- Do not mount host home, code, SSH keys, Docker socket or service credentials. Do not change the existing `pcp-local` / `pcp-ci-isolated` services.

## Host installation

From a **trusted local checkout** of `cortega26/Monedario` containing these files:

```bash
git checkout <merged-commit-or-branch>
bash -n ops/ci-runner/run-one.sh
bash ops/ci-runner/run-one.sh --verify
bash ops/ci-runner/run-one.sh --verify
install -Dm700 ops/ci-runner/run-one.sh "$HOME/.local/share/monedario/isolated-ci-runner/run-one.sh"
install -Dm700 ops/ci-runner/watchdog.sh "$HOME/.local/share/monedario/isolated-ci-runner/watchdog.sh"
install -Dm600 ops/ci-runner/monedario-isolated-ci.service "$HOME/.config/systemd/user/monedario-isolated-ci.service"
install -Dm600 ops/ci-runner/monedario-ci-watchdog.service "$HOME/.config/systemd/user/monedario-ci-watchdog.service"
install -Dm600 ops/ci-runner/monedario-ci-watchdog.timer "$HOME/.config/systemd/user/monedario-ci-watchdog.timer"
systemctl --user daemon-reload
systemctl --user enable monedario-isolated-ci.service
systemctl --user enable --now monedario-ci-watchdog.timer
systemctl --user restart monedario-isolated-ci.service
```

Restarting `monedario-isolated-ci.service` kills any job that is currently
running. Do the installation in a quiet window, or stop the service first and
start it when no job is in flight.

The `--verify` calls check the exact isolation constraints of the existing PCP image; two invocations check clean workspaces. The launcher registers a **new JIT identity for Monedario only** and then runs it inside a throwaway container. The job is destroyed after one execution. Systemd creates a fresh slot. The launcher also deletes its own JIT registration on exit, so a killed container does not leave a permanent `online`/`busy` lease behind.

Confirm the target is online and carries **only** the dedicated label:

```bash
gh api repos/cortega26/Monedario/actions/runners --jq \
  '.runners[] | select(.name | startswith("monedario-ci-isolated-")) | {name,status,busy,labels:[.labels[].name]}'
systemctl --user status monedario-isolated-ci.service --no-pager
```

## Liveness watchdog (#745)

The runner is a **single disposable slot**. Each job gets a new JIT identity and
a new container name; that churn is expected, not a restart loop. The failure
mode in #745 is different: a container killed mid-job (or a runner whose
listener died) can leave a registration that GitHub still reports as
`online`/`busy` while `GET /actions/runs?status=in_progress` returns zero.
Queued jobs then wait behind a lease that will never finish.

`watchdog.sh` runs every two minutes from `monedario-ci-watchdog.timer` and
checks four things:

| Signal | Condition | Action with `--apply` |
| --- | --- | --- |
| Stale lease | A `monedario-ci-isolated-*` runner is `online` + `busy` and no run is `in_progress` for 3 min | Removes the exact registration, removes its container, and restarts the service when no idle slot remains |
| Dead service | Jobs are queued, no Monedario runner is online, and the service is inactive/failed for 2 min | `systemctl --user restart monedario-isolated-ci.service` |
| Offline clutter | A `monedario-ci-isolated-*` registration is `offline` for 5 min | Deletes the exact registration |
| Queue with an idle runner | Jobs are queued, no run is `in_progress`, an idle runner exists, and the oldest queue entry is older than 10 min | Reports `queue_unassigned` and exits non-zero; does not restart (a label mismatch or a zombie run is not fixed by a restart) |

Safety rules:

- Without `--apply` the script is a dry run. The timer passes `--apply`.
- It only deletes names starting with `monedario-ci-isolated-` and only by
  exact numeric runner id. `pcp-local` and `pcp-i5-12600K` are never candidates.
- It exits early when `ACTIONS_RUNNER_LABEL` is unset or points to another
  label, so a rollback is not fought by the timer.
- It never falls back to a hosted runner. That remains a manual decision
  (delete the variable; see Rollback).

Inspect it:

```bash
systemctl --user list-timers monedario-ci-watchdog.timer
systemctl --user status monedario-ci-watchdog.service --no-pager
bash "$HOME/.local/share/monedario/isolated-ci-runner/watchdog.sh" --status
bash "$HOME/.local/share/monedario/isolated-ci-runner/watchdog.sh"          # dry run
journalctl --user -u monedario-ci-watchdog.service --since "1 hour ago"
tail -n 20 "$HOME/.local/state/monedario/ci-watchdog/watchdog.jsonl"
```

A persistent condition makes the oneshot unit fail (`systemctl --user --failed`)
and writes an `error` line to the JSONL log. The timer keeps running, so the
next successful run clears the failed state.

### Diagnosing a queue: slow vs wedged

The runner executes one job at a time (ADR-20261019). A queue of five jobs while
one 20-minute job runs is **slow, not wedged**: `in_progress` is greater than
zero and the runner is legitimately busy. The old 15-minute cancellations were
TD-0113 (bootstrap cost); blocking jobs now have a 30-minute timeout (#734).

Use these three queries together:

```bash
gh api repos/cortega26/Monedario/actions/runners --jq \
  '.runners[] | select(.name | startswith("monedario-ci-isolated-")) | {id,name,status,busy}'
gh api "repos/cortega26/Monedario/actions/runs?status=in_progress&per_page=1" --jq '.total_count'
gh api "repos/cortega26/Monedario/actions/runs?status=queued&per_page=20" --jq \
  '.workflow_runs[] | {id,name,head_branch,created_at}'
```

- `busy: true` + `in_progress > 0` → healthy, serialized.
- `busy: true` + `in_progress: 0` for more than a few seconds → stale lease;
  the watchdog recovers it after 3 minutes.
- No online runner + queued jobs → service down; the watchdog restarts it after
  2 minutes.
- Idle runner + queued jobs + `in_progress: 0` → GitHub is not assigning the
  queue. Check the workflow's `runs-on` label and cancel runs that have **zero
  jobs** (a queued run with no jobs can never execute; `gh run view <id>` shows
  the job list).

## Chromium dependencies for the a11y job

The base `pcp-ci-isolated` image does not include the shared libraries Chromium
needs (`libnss3`, `libatk`, `libgbm`, `libxkbcommon`, etc.). Playwright installs
the browser but it crashes at launch with `browserType.launch`.

Build the derived image **before** installing or restarting the launcher:

```bash
docker build -t monedario-ci-isolated:2.338.0-a11y ops/ci-runner
docker run --rm -v "$HOME/.cache/ms-playwright/chromium-1243/chrome-linux64:/chrome:ro" \
  --entrypoint sh monedario-ci-isolated:2.338.0-a11y -lc \
  'ldd /chrome/chrome | grep "not found" | sort -u'
```

The `ldd` command must print nothing. Then run `bash ops/ci-runner/run-one.sh --verify`
and restart the service. The CI workflow keeps `PLAYWRIGHT_BROWSERS_PATH` inside
`${{ github.workspace }}` so the browser does not fill the 512 MiB
`/home/runner` tmpfs.

## Routing / live acceptance

Do NOT set the label until a JIT runner is verified online. Then:

```bash
gh variable set ACTIONS_RUNNER_LABEL --repo cortega26/Monedario --body monedario-ci-isolated
gh variable list --repo cortega26/Monedario
```

Existing workflows use `runs-on: ${{ vars.ACTIONS_RUNNER_LABEL || 'ubuntu-24.04' }}`; the blocking `gitleaks-pr` was updated to use the same. Verify the CI, Python and Gitleaks checks on an existing trusted internal PR. A job should show a runner named `monedario-ci-isolated-...` and a **successful step-by-step log**; a queued or 0-step job is not a pass. Run the real editorial checks on PR #685 and resolve any findings rather than relaxing gates.

**Cloudflare Pages is separate**: the deployment may still fail independently. Inspect the exact failed deployment log in Cloudflare before attributing causes.

## Rollback

Always delete the repository variable first (future runs return to hosted runners):

```bash
gh variable delete ACTIONS_RUNNER_LABEL --repo cortega26/Monedario
systemctl --user disable --now monedario-ci-watchdog.timer
systemctl --user disable --now monedario-isolated-ci.service
```

Disabling the watchdog timer is part of the rollback: the script exits early
when the variable is unset, but the timer must not restart the service during
teardown. The JIT registration disappears after its job or launcher teardown.
Confirm absence of Monedario runner IDs in GitHub; unregister any **stale
Monedario-only IDs** by exact name/id after ensuring no job is active. Never delete `pcp-local` or `pcp-ci-isolated`. Remove only the Monedario dedicated Docker network if unused. Re-run queued checks when correct runner routing is restored. Do not re-enable Claude Code reviews as part of this incident.

## Evidence and outstanding controls

- PCP isolated CI success: https://github.com/cortega26/portfolio-control-plane/actions/runs/38979065016 (two independent disposable runners).
- Monedario PR #685: https://github.com/cortega26/Monedario/pull/685; its GitHub-hosted jobs are 0 steps / 0 billable ms.
- Full source and prior retirement history: `docs/operations/runbooks/actions-quota-bridge.md`.
- Host installation verified: the service is active and has executed Monedario
  jobs (journal on the `i5-12600K`). The liveness watchdog and timer are
  installed with the commands above; confirm with
  `systemctl --user list-timers monedario-ci-watchdog.timer`.
- The 15-minute cancellations from the #745 incident were the old blocking-job
  timeout (TD-0113). Blocking jobs now use 30 minutes (#734); a recurrence
  should be diagnosed as a timeout, not as a runner wedge.
- Not yet verified: the exact Cloudflare preview build error.
