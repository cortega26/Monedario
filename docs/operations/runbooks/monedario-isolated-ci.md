# Monedario — isolated GitHub Actions bridge (October 2026)

**Status: PREPARED, NOT ACTIVATED.** The host installation and GitHub variable cannot be performed from the current GitHub-only connector. No runner is registered by merging this documentation.

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
install -Dm600 ops/ci-runner/monedario-isolated-ci.service "$HOME/.config/systemd/user/monedario-isolated-ci.service"
systemctl --user daemon-reload
systemctl --user enable --now monedario-isolated-ci.service
```

The `--verify` calls check the exact isolation constraints of the existing PCP image; two invocations check clean workspaces. The launcher registers a **new JIT identity for Monedario only** and then runs it inside a throwaway container. The job is destroyed after one execution. Systemd creates a fresh slot.

Confirm the target is online and carries **only** the dedicated label:

```bash
gh api repos/cortega26/Monedario/actions/runners --jq \
  '.runners[] | select(.name | startswith("monedario-ci-isolated-")) | {name,status,busy,labels:[.labels[].name]}'
systemctl --user status monedario-isolated-ci.service --no-pager
```

## Routing / live acceptance

Do NOT set the label until a JIT runner is verified online. Then:

```bash
gh variable set ACTIONS_RUNNER_LABEL --repo cortega26/Monedario --body monedario-ci-isolated
gh variable list --repo cortega26/Monedario
```

Existing workflows use `runs-on: ${{ vars.ACTIONS_RUNNER_LABEL || 'ubuntu-latest' }}`; the blocking `gitleaks-pr` was updated to use the same. Verify the CI, Python and Gitleaks checks on an existing trusted internal PR. A job should show a runner named `monedario-ci-isolated-...` and a **successful step-by-step log**; a queued or 0-step job is not a pass. Run the real editorial checks on PR #685 and resolve any findings rather than relaxing gates.

**Cloudflare Pages is separate**: the deployment may still fail independently. Inspect the exact failed deployment log in Cloudflare before attributing causes.

## Rollback

Always delete the repository variable first (future runs return to hosted runners):

```bash
gh variable delete ACTIONS_RUNNER_LABEL --repo cortega26/Monedario
systemctl --user disable --now monedario-isolated-ci.service
```

The JIT registration disappears after its job or launcher teardown. Confirm absence of Monedario runner IDs in GitHub; unregister any **stale Monedario-only IDs** by exact name/id after ensuring no job is active. Never delete `pcp-local` or `pcp-ci-isolated`. Remove only the Monedario dedicated Docker network if unused. Re-run queued checks when correct runner routing is restored. Do not re-enable Claude Code reviews as part of this incident.

## Evidence and outstanding controls

- PCP isolated CI success: https://github.com/cortega26/portfolio-control-plane/actions/runs/38979065016 (two independent disposable runners).
- Monedario PR #685: https://github.com/cortega26/Monedario/pull/685; its GitHub-hosted jobs are 0 steps / 0 billable ms.
- Full source and prior retirement history: `docs/operations/runbooks/actions-quota-bridge.md`.
- Not yet verified: host installation, live execution for Monedario, exact Cloudflare preview build error.
