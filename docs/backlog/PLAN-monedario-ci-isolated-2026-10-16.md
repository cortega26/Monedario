# October 2026 — monedario isolated runner recovery

**Status:** PREPARED — HOST ACTIVATION AND LIVE VERIFICATION BLOCKED BY REMOTE-ACCESS LIMITATION

## Goal / Spec
Restore private-repository CI without GitHub-hosted minutes using existing PC resources, **not** Oracle VM and **not** the privileged `pcp-local` runner. Minimize operational burden by reusing the exact already-tested JIT image and its isolated-container security profile.

## Scope
In: `.github/workflows/security-scans.yml`, `tests/static-analysis/actions-runner-portability.e2e.test.ts`, `ops/ci-runner/{run-one.sh,monedario-isolated-ci.service}`, `docs/operations/runbooks/{actions-quota-bridge.md,monedario-isolated-ci.md}`, this plan.
Out: application, analytics, routes, article content, PCP repo, Fintual, Oracle production, global GitHub settings, review automation, Cloudflare prod.

## Baseline evidence
- Github Actions PR #685: run 38989358641, 38989358640, 38989358654 — no assigned runner / no steps / 0 billed ms.
- PCP private-repo CI passed on JIT image from `ops/ci-runner/`, run 38979065016 (on PC).
- Desktop Commander `i5-12600K`: offline from this session on 2026-10-16; it cannot install local Docker/systemd.
- Previous Monedario repository-scoped self-hosted runner was explicitly decommissioned 2026-09-04; already established workflow variable fallback remains in source.
- VM last documented available memory ~2923 MiB and shared critical workloads. Excluded.

## Verification table
| Proof | Command or source | Status |
|---|---|---|
| YAML/runner portability invariant | `pnpm exec vitest run tests/static-analysis/actions-runner-portability.e2e.test.ts` | Pending local/CI |
| Shell syntax | `bash -n ops/ci-runner/run-one.sh` | Pending local/CI |
| Disposable runner image containment | `bash ops/ci-runner/run-one.sh --verify` twice | Pending PC |
| Correct repo JIT identity | `gh api repos/cortega26/Monedario/actions/runners` | Pending PC |
| Live PR jobs & check logs | PR #685 GitHub Checks | Pending runner/variable |
| Cloudflare failure diagnosis | Cloudflare Pages deployment build log | Blocked by dashboard login |
| Infra rollback | unset repository var, stop dedicated Monedario service only | Documented, not executed |

## DoD / status
- [x] Existing retired bridge and active PCP JIT design identified.
- [x] Blocking PR Gitleaks job given configurable runner label.
- [x] Existing portability test updated without weakening invariant.
- [x] Dedicated repo-scoped launcher/service and incident runbook prepared.
- [ ] PC installation with two verified isolation canaries.
- [ ] Set GitHub repo variable after runner online.
- [ ] CI PR checks pass on exact revision (no skipped tests).
- [ ] Cloudflare Pages preview diagnostics separately.
- [ ] Reconcile editorial review and human gates before PR #685 merge.

## Change Control Record
1. Scope: CI-only workflow, static test, launcher/service, docs.
2. Modules: Gitleaks runner routing, monedario JIT runner, manual operations, regression test.
3. Invariants: no direct access to pcp-local, temporary GitHub token not passed from host, read-only Docker image, private/LAN egress blocked, no mounted host assets.
4. Contracts: native workflows keep their commands and original triggers; `ACTIONS_RUNNER_LABEL` fallback retained.
5. Boundaries: no production application imports or workflows altered except blocking Gitleaks routing.
6. Tests: portability test expectation updated, smoke required. Not claimed green.
7. Rollback: delete one repo variable and stop one Monedario-only systemd service.
8. Risk: medium/high infrastructure/security, no deployment change; require independent verification of isolation and GitHub runner jobs.
