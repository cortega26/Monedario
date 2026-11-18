#!/usr/bin/env bash
# Host-side liveness watchdog for the Monedario isolated CI runner.
#
# The runner is a one-job JIT container. A killed or wedged container can leave
# a registration that GitHub still reports as online+busy while no run is
# in_progress; queued jobs then wait behind a lease that will never finish.
# This watchdog detects that state, removes only Monedario-owned registrations,
# and restarts the dedicated service when no usable slot remains.
#
# Safe by default: without --apply it only reports what it would do. The
# systemd timer invokes it with --apply. It never touches pcp-local,
# pcp-i5-12600K or any runner outside the dedicated name prefix.
#
# Usage: watchdog.sh [--apply] [--status] [--help]

set -Eeuo pipefail

readonly repository="${WATCHDOG_REPOSITORY:-cortega26/Monedario}"
readonly label="${WATCHDOG_LABEL:-monedario-ci-isolated}"
readonly runner_prefix="${label}-"
readonly primary_service="${WATCHDOG_SERVICE:-monedario-isolated-ci.service}"
readonly secondary_service="${WATCHDOG_SECONDARY_SERVICE:-monedario-isolated-ci-2.service}"
readonly state_dir="${WATCHDOG_STATE_DIR:-${XDG_STATE_HOME:-$HOME/.local/state}/monedario/ci-watchdog}"
readonly log_file="${WATCHDOG_LOG:-$state_dir/watchdog.jsonl}"
readonly stale_busy_seconds="${WATCHDOG_STALE_BUSY_SECONDS:-180}"
readonly offline_grace_seconds="${WATCHDOG_OFFLINE_GRACE_SECONDS:-300}"
readonly queue_seconds="${WATCHDOG_QUEUE_SECONDS:-600}"
readonly no_runner_seconds="${WATCHDOG_NO_RUNNER_SECONDS:-120}"

now="${WATCHDOG_NOW:-$(date +%s)}"
apply=0
status_mode=0

usage() {
  cat <<'EOF'
Usage: watchdog.sh [--apply] [--status]

  --apply   Perform recovery actions (default: dry-run).
  --status  Print the current queue/runner summary and exit.
  --help    Show this help.
EOF
}

while (($# > 0)); do
  case "$1" in
    --apply) apply=1 ;;
    --dry-run) apply=0 ;;
    --status) status_mode=1 ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

mkdir -p "$state_dir"

log_event() {
  local level="$1" event="$2" detail="${3:-}" ts
  ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  if command -v jq >/dev/null 2>&1; then
    jq -cn \
      --arg ts "$ts" \
      --arg level "$level" \
      --arg event "$event" \
      --arg detail "$detail" \
      '{ts:$ts,level:$level,event:$event,detail:$detail}' >>"$log_file"
  else
    printf '%s\t%s\t%s\t%s\n' "$ts" "$level" "$event" "$detail" >>"$log_file"
  fi
  logger -t monedario-ci-watchdog "$level $event $detail" 2>/dev/null || true
}

rotate_log() {
  local size
  [[ -f "$log_file" ]] || return 0
  size="$(stat -c%s "$log_file" 2>/dev/null || printf '0')"
  if ((size > 5 * 1024 * 1024)); then
    mv -f "$log_file" "$log_file.1"
  fi
}

state_since() {
  local file="$1" signature="$2" stored_signature stored_since
  [[ -f "$file" ]] || return 1
  IFS='|' read -r stored_signature stored_since <"$file" || return 1
  [[ "$stored_signature" == "$signature" ]] || return 1
  [[ "$stored_since" =~ ^[0-9]+$ ]] || return 1
  printf '%s\n' "$stored_since"
}

mark_since() {
  printf '%s|%s\n' "$2" "$now" >"$1"
}

age_for() {
  local file="$1" signature="$2" since
  if since="$(state_since "$file" "$signature")"; then
    printf '%s\n' "$((now - since))"
  else
    mark_since "$file" "$signature"
    printf '0\n'
  fi
}

# Deletion is restricted to the dedicated prefix and an exact numeric id.
# The explicit deny list is redundant with the prefix but documents the
# boundary: the trusted PCP runners are never candidates.
delete_runner() {
  local id="$1" name="$2"
  [[ "$id" =~ ^[0-9]+$ ]] || return 1
  [[ "$name" == "$runner_prefix"* ]] || return 1
  [[ "$name" != "pcp-local" && "$name" != "pcp-i5-12600K" ]] || return 1
  gh api --method DELETE "repos/$repository/actions/runners/$id" \
    >/dev/null 2>&1
}

remove_container() {
  local name="$1"
  [[ "$name" == "$runner_prefix"* ]] || return 1
  docker rm --force "$name" >/dev/null 2>&1 || true
}

# Maps a runner to its systemd service. Slot 0 (legacy) has no slot segment;
# slot N (>=2) is encoded as monedario-ci-isolated-<N>-<epoch>-<pid>.
service_for_runner() {
  local name="$1"
  if [[ "$name" =~ ^monedario-ci-isolated-([1-9][0-9]*)- ]]; then
    printf 'monedario-isolated-ci-%s.service\n' "${BASH_REMATCH[1]}"
  else
    printf '%s\n' "$primary_service"
  fi
}

rotate_log

# The label variable is the operational switch. If it is unset or points
# elsewhere (rollback), the watchdog must not fight the operator.
configured_label=""
if ! configured_label="$(gh api \
  "repos/$repository/actions/variables/ACTIONS_RUNNER_LABEL" \
  --jq '.value' 2>/dev/null)"; then
  configured_label=""
fi

# The label variable is the operational switch. If it is unset or points
# elsewhere (rollback), the watchdog must not fight the operator. Status mode
# still reports the raw runner state for diagnosis.
if ((!status_mode)) && [[ "$configured_label" != "$label" ]]; then
  log_event info runner_disabled \
    "ACTIONS_RUNNER_LABEL=${configured_label:-<unset>}"
  exit 0
fi

if ! runners_tsv="$(gh api "repos/$repository/actions/runners" --paginate \
  --jq '.runners[] | [.id,.name,.status,(.busy|tostring)] | @tsv' 2>/dev/null)"; then
  log_event error runners_api_failed "repository=$repository"
  exit 1
fi

if ! in_progress="$(gh api \
  "repos/$repository/actions/runs?status=in_progress&per_page=1" \
  --jq '.total_count' 2>/dev/null)"; then
  log_event error runs_api_failed "status=in_progress"
  exit 1
fi
[[ "$in_progress" =~ ^[0-9]+$ ]] || in_progress=0

if ! queued_dates="$(gh api \
  "repos/$repository/actions/runs?status=queued&per_page=100" --paginate \
  --jq '.workflow_runs[].created_at' 2>/dev/null)"; then
  log_event error runs_api_failed "status=queued"
  exit 1
fi

queued_count="$(printf '%s\n' "$queued_dates" | grep -cE '^[0-9]{4}-' || true)"
oldest_queued="$(printf '%s\n' "$queued_dates" | grep -E '^[0-9]{4}-' |
  sort | head -n 1 || true)"
oldest_queued_epoch="$now"
if [[ -n "$oldest_queued" ]]; then
  oldest_queued_epoch="$(date -d "$oldest_queued" +%s 2>/dev/null ||
    printf '%s' "$now")"
fi

primary_state="$(systemctl --user is-active "$primary_service" 2>/dev/null || true)"
secondary_state="$(systemctl --user is-active "$secondary_service" 2>/dev/null || true)"
[[ -n "$primary_state" ]] || primary_state="unknown"
[[ -n "$secondary_state" ]] || secondary_state="unknown"
service_state="primary=${primary_state},secondary=${secondary_state}"

online_idle=0
online_busy=0
declare -a stale_busy=()
declare -a offline=()
declare -A seen_ids=()

while IFS=$'\t' read -r id name status busy; do
  [[ -n "${id:-}" && -n "${name:-}" ]] || continue
  [[ "$name" == "$runner_prefix"* ]] || continue
  seen_ids["$id"]=1
  case "${status:-}:${busy:-}" in
    online:false)
      online_idle=$((online_idle + 1))
      ;;
    online:true)
      online_busy=$((online_busy + 1))
      stale_busy+=("$id"$'\t'"$name")
      ;;
    offline:*)
      offline+=("$id"$'\t'"$name")
      ;;
  esac
done <<<"$runners_tsv"

if ((status_mode)); then
  printf 'service=%s label=%s queued=%s in_progress=%s oldest_queued=%s online_idle=%d online_busy=%d offline=%d\n' \
    "$service_state" "${configured_label:-<unset>}" "$queued_count" \
    "$in_progress" "${oldest_queued:-none}" "$online_idle" "$online_busy" \
    "${#offline[@]}"
  exit 0
fi

unrecovered=0
recovered=0

# Offline registrations do not block jobs, but they accumulate after hard
# kills and make the runner list unreadable. Give a starting JIT slot a grace
# period before removing it.
for entry in "${offline[@]}"; do
  id="${entry%%$'\t'*}"
  name="${entry#*$'\t'}"
  age="$(age_for "$state_dir/offline-$id.since" "offline")"
  if ((age < offline_grace_seconds)); then
    log_event info offline_runner_pending "$name id=$id age=${age}s"
    continue
  fi
  if ((!apply)); then
    log_event info would_delete_offline_runner "$name id=$id age=${age}s"
    continue
  fi
  if delete_runner "$id" "$name"; then
    log_event warn deleted_offline_runner "$name id=$id age=${age}s"
    rm -f "$state_dir/offline-$id.since"
  else
    log_event error delete_offline_runner_failed "$name id=$id"
    unrecovered=1
  fi
done

# Drop state for runners that no longer exist.
for state_file in "$state_dir"/offline-*.since; do
  [[ -e "$state_file" ]] || continue
  id="${state_file##*/offline-}"
  id="${id%.since}"
  if [[ -z "${seen_ids[$id]:-}" ]]; then
    rm -f "$state_file"
  fi
done

# online + busy + no in_progress run is the stale-lease signature. A single
# sample can be a job that is starting, so require the condition to persist.
if ((online_busy > 0 && in_progress == 0)); then
  signature="$(printf '%s\n' "${stale_busy[@]}" | cut -f1 | sort |
    paste -sd, -)"
  age="$(age_for "$state_dir/stale-busy.since" "$signature")"
  if ((age < stale_busy_seconds)); then
    log_event warn stale_busy_pending "runners=$signature age=${age}s"
  elif ((!apply)); then
    log_event warn would_recover_stale_busy \
      "runners=$signature age=${age}s"
  else
    for entry in "${stale_busy[@]}"; do
      id="${entry%%$'\t'*}"
      name="${entry#*$'\t'}"
      remove_container "$name"
      delete_runner "$id" "$name" || true
    done
    if ((online_idle == 0)); then
      for entry in "${stale_busy[@]}"; do
        name="${entry#*$'\t'}"
        svc="$(service_for_runner "$name")"
        if systemctl --user restart "$svc" >/dev/null 2>&1; then
          log_event warn recovered_stale_busy \
            "runners=$signature action=restart_service service=$svc"
        else
          log_event error restart_failed "runners=$signature service=$svc"
          unrecovered=1
        fi
      done
    else
      log_event warn recovered_stale_busy \
        "runners=$signature action=deleted_registration"
    fi
    rm -f "$state_dir/stale-busy.since"
    recovered=1
  fi
else
  rm -f "$state_dir/stale-busy.since"
fi

# No runner at all while work is queued: the service is stopped, failed or
# crash-looping. Give systemd's 10s restart a short grace, then restart.
if ((queued_count > 0 && in_progress == 0 && online_idle == 0 &&
  online_busy == 0)); then
  age="$(age_for "$state_dir/no-runner.since" "no-runner")"
  if ((age < no_runner_seconds)); then
    log_event warn no_runner_pending \
      "queued=$queued_count age=${age}s service=$service_state"
  elif ((!apply)); then
    log_event warn would_restart_no_runner \
      "queued=$queued_count age=${age}s service=$service_state"
  else
    services=("$primary_service")
    if systemctl --user cat "$secondary_service" >/dev/null 2>&1; then
      services+=("$secondary_service")
    fi
    for svc in "${services[@]}"; do
      if systemctl --user restart "$svc" >/dev/null 2>&1; then
        log_event warn recovered_no_runner \
          "queued=$queued_count action=restart_service service=$svc"
        recovered=1
      else
        log_event error restart_failed "queued=$queued_count service=$svc"
        unrecovered=1
      fi
    done
    rm -f "$state_dir/no-runner.since"
  fi
else
  rm -f "$state_dir/no-runner.since"
fi

# An idle runner plus queued work and no in_progress run means GitHub is not
# assigning jobs to it (label mismatch, workflow targeting another label, or a
# zombie run with no jobs). Restarting does not fix that, so report it.
if ((queued_count > 0 && in_progress == 0 && online_idle > 0)); then
  signature="queued=$queued_count oldest=$oldest_queued"
  age="$(age_for "$state_dir/queue-unassigned.since" "$signature")"
  if ((age >= queue_seconds)); then
    log_event error queue_unassigned \
      "queued=$queued_count oldest=$oldest_queued age=${age}s idle=$online_idle"
    unrecovered=1
  else
    log_event warn queue_unassigned_pending \
      "queued=$queued_count oldest=$oldest_queued age=${age}s"
  fi
else
  rm -f "$state_dir/queue-unassigned.since"
fi

oldest_age=$((now - oldest_queued_epoch))
if ((oldest_age < 0)); then
  oldest_age=0
fi

log_event info heartbeat \
  "service=$service_state queued=$queued_count in_progress=$in_progress oldest_queued=${oldest_queued:-none} oldest_age=${oldest_age}s idle=$online_idle busy=$online_busy offline=${#offline[@]} recovered=$recovered"

if ((unrecovered)); then
  exit 2
fi
exit 0
