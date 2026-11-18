#!/usr/bin/env bash
# Dedicated disposable CI slot for cortega26/Monedario.
# Derived from the verified pcp-ci-isolated image plus Chromium/Playwright system
# libraries required by the non-blocking a11y job; NEVER uses the trusted pcp-local runner.
set -Eeuo pipefail

readonly repository=cortega26/Monedario
readonly label=monedario-ci-isolated
readonly image="${MONEDARIO_CI_IMAGE:-monedario-ci-isolated:2.338.0-a11y}"
readonly network=monedario-ci-isolated
# Slot 0 keeps the legacy single-service runner name. Slot N (>=2) is encoded in
# the name so the host watchdog can map a stale lease to its systemd service.
readonly slot="${MONEDARIO_CI_SLOT:-0}"
if [[ ! "$slot" =~ ^[0-9]+$ ]]; then
  echo "Invalid MONEDARIO_CI_SLOT: ${slot}" >&2
  exit 2
fi
if [[ "$slot" == "0" ]]; then
  name="monedario-ci-isolated-$(date -u +%s)-$$"
else
  name="monedario-ci-isolated-${slot}-$(date -u +%s)-$$"
fi
runner_id=""

cleanup() {
  docker rm --force "$name" >/dev/null 2>&1 || true
  # JIT registrations are ephemeral, but a killed container can leave a stale
  # online/busy entry behind. Best-effort removal keeps the label clean.
  if [[ -n "${runner_id:-}" ]]; then
    gh api --method DELETE "repos/$repository/actions/runners/$runner_id" \
      >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT
trap 'exit 143' TERM INT

# Privileged registration is confined to the trusted host launcher. Neither the
# GitHub PAT nor any SSH/private host files are mounted into the job container.
command -v gh >/dev/null
command -v docker >/dev/null
docker image inspect "$image" >/dev/null
if ! docker network inspect "$network" >/dev/null 2>&1; then
  docker network create --driver bridge --opt com.docker.network.bridge.enable_icc=false "$network" >/dev/null
fi

# Do not accidentally attach an existing trusted runner to this repository.
trusted="$(gh api "repos/$repository/actions/runners" --paginate --jq '.runners[] | select(.name == "pcp-i5-12600K" or .name == "pcp-local") | .name')"
if [[ -n "$trusted" ]]; then
  echo "Trusted pcp-local runner found in Monedario: refusing registration" >&2
  exit 1
fi

args=(--rm --interactive --name "$name" --network "$network" --read-only
  --cap-drop ALL --cap-add NET_ADMIN --cap-add SETUID --cap-add SETGID --cap-add SETPCAP
  --security-opt no-new-privileges --pids-limit 1024
  --cpus 3 --memory 8g --memory-swap 8g
  --sysctl net.ipv6.conf.all.disable_ipv6=1
  --sysctl net.ipv6.conf.default.disable_ipv6=1
  --tmpfs /runner:rw,exec,nosuid,nodev,uid=1001,gid=1001,mode=0700,size=5g
  --tmpfs /home/runner:rw,exec,nosuid,nodev,uid=1001,gid=1001,mode=0700,size=512m
  --tmpfs /tmp:rw,exec,nosuid,nodev,mode=1777,size=512m)

if [[ "$#" -gt 0 && "$1" == "--verify" ]]; then
  docker run "${args[@]}" "$image" verify
  exit
fi

# JIT identity belongs only to Monedario; it is valid for exactly one job.
# Never pass a PAT to the untrusted container.
jit_response="$(gh api --method POST "repos/$repository/actions/runners/generate-jitconfig"   -f "name=$name" -F runner_group_id=1 -f "labels[]=$label" -f work_folder=_work   --jq '[.runner.id, .encoded_jit_config] | @tsv')"
IFS=$'\t' read -r runner_id jit_config <<< "$jit_response"
if [[ ! "$runner_id" =~ ^[0-9]+$ || -z "$jit_config" ]]; then
  echo "Invalid JIT registration response" >&2
  exit 1
fi
printf '%s\n' "$jit_config" | docker run "${args[@]}" "$image"
