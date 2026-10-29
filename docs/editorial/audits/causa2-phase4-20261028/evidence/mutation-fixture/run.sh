#!/usr/bin/env bash
set -euo pipefail

fixture_dir="$(cd "$(dirname "$0")" && pwd)"
export TMPDIR="$fixture_dir"
work_dir="$(mktemp -d "$fixture_dir/run.XXXXXX")"
trap 'rm -rf "$work_dir"' EXIT

mkdir -p "$work_dir/scripts" "$work_dir/src/config" "$work_dir/src/data/blog"
cp "$fixture_dir/scripts/check-payroll-consistency.mjs" "$work_dir/scripts/"
cp "$fixture_dir/src/config/afpCommissions.ts" "$work_dir/src/config/"

printf '%s\n' 'AFP Capital: comisión de 1,44%, total AFP 11,44%.' \
  > "$work_dir/src/data/blog/d2-example.md"
(cd "$work_dir" && node scripts/check-payroll-consistency.mjs) \
  > "$fixture_dir/baseline-output.txt" 2>&1

printf '%s\n' 'AFP Capital: comisión de 0,58%, total AFP 10,58%.' \
  > "$work_dir/src/data/blog/d2-example.md"
set +e
(cd "$work_dir" && node scripts/check-payroll-consistency.mjs) \
  > "$fixture_dir/mutated-output.txt" 2>&1
mutated_status=$?
set -e

if [[ "$mutated_status" -ne 1 ]]; then
  printf 'Expected mutation exit 1, got %s\n' "$mutated_status" >&2
  exit 1
fi
cat "$fixture_dir/baseline-output.txt"
cat "$fixture_dir/mutated-output.txt"
