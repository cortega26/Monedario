# GitHub Actions quota bridge runbook

Status: active until the hosted-minute reset is confirmed on or after 2026-08-01

Authority: `docs/adr/ADR-20260716-temporary-self-hosted-actions-bridge.md`

## Live configuration

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

## Retirement on August 1

First confirm the GitHub-hosted allowance has reset. Then execute in this order:

```bash
gh variable delete ACTIONS_RUNNER_LABEL --repo cortega26/Monedario
gh workflow enable claude-code-review.yml --repo cortega26/Monedario
docker stop monedario-actions-runner
docker rm monedario-actions-runner
```

Cancel and re-run any workflow that was queued before the variable deletion so
the new run resolves to `ubuntu-latest`.

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
