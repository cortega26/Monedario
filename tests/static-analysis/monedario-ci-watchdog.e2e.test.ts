import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = path.resolve("ops/ci-runner/watchdog.sh");
const roots: string[] = [];

type Harness = {
  root: string;
  bin: string;
  state: string;
  calls: string;
  log: string;
};

function writeExecutable(file: string, content: string) {
  writeFileSync(file, content, "utf8");
  chmodSync(file, 0o755);
}

function makeHarness(): Harness {
  const root = mkdtempSync(path.join(tmpdir(), "ci-watchdog-"));
  roots.push(root);
  const bin = path.join(root, "bin");
  const state = path.join(root, "state");
  mkdirSync(bin);
  mkdirSync(state);

  writeExecutable(
    path.join(bin, "gh"),
    `#!/usr/bin/env bash
set -euo pipefail
printf 'gh %s\\n' "$*" >> "$FAKE_CALL_LOG"
case "$*" in
  *"variables/ACTIONS_RUNNER_LABEL"*)
    if [[ -n "\${FAKE_VARIABLE_LABEL+x}" ]]; then
      printf '%s\\n' "$FAKE_VARIABLE_LABEL"
    else
      printf 'monedario-ci-isolated\\n'
    fi
    ;;
  *"--method DELETE"*"actions/runners/"*) exit 0 ;;
  *"actions/runners"*) printf '%s\\n' "\${FAKE_RUNNERS:-}" ;;
  *"status=in_progress"*) printf '%s\\n' "\${FAKE_IN_PROGRESS:-0}" ;;
  *"status=queued"*) printf '%s\\n' "\${FAKE_QUEUED_DATES:-}" ;;
  *)
    printf 'unexpected gh invocation: %s\\n' "$*" >&2
    exit 1
    ;;
esac
`
  );

  writeExecutable(
    path.join(bin, "systemctl"),
    `#!/usr/bin/env bash
set -euo pipefail
printf 'systemctl %s\\n' "$*" >> "$FAKE_CALL_LOG"
if [[ "\${1:-}" == "--user" && "\${2:-}" == "is-active" ]]; then
  printf '%s\\n' "\${FAKE_SERVICE_STATE:-active}"
fi
exit 0
`
  );

  writeExecutable(
    path.join(bin, "docker"),
    `#!/usr/bin/env bash
set -euo pipefail
printf 'docker %s\\n' "$*" >> "$FAKE_CALL_LOG"
exit 0
`
  );

  writeExecutable(
    path.join(bin, "logger"),
    `#!/usr/bin/env bash
set -euo pipefail
printf 'logger %s\\n' "$*" >> "$FAKE_CALL_LOG"
exit 0
`
  );

  return {
    root,
    bin,
    state,
    calls: path.join(root, "calls.log"),
    log: path.join(root, "watchdog.jsonl"),
  };
}

function runWatchdog(
  harness: Harness,
  env: Record<string, string>,
  args: string[] = []
) {
  return spawnSync("bash", [SCRIPT, ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${harness.bin}:${process.env.PATH ?? ""}`,
      FAKE_CALL_LOG: harness.calls,
      WATCHDOG_STATE_DIR: harness.state,
      WATCHDOG_LOG: harness.log,
      WATCHDOG_NOW: "1793459303",
      WATCHDOG_STALE_BUSY_SECONDS: "0",
      WATCHDOG_OFFLINE_GRACE_SECONDS: "0",
      WATCHDOG_QUEUE_SECONDS: "0",
      WATCHDOG_NO_RUNNER_SECONDS: "0",
      ...env,
    },
  });
}

function calls(harness: Harness): string[] {
  if (!existsSync(harness.calls)) return [];
  return readFileSync(harness.calls, "utf8").split("\n").filter(Boolean);
}

function clearCalls(harness: Harness) {
  writeFileSync(harness.calls, "", "utf8");
}

function events(harness: Harness): string[] {
  if (!existsSync(harness.log)) return [];
  return readFileSync(harness.log, "utf8").split("\n").filter(Boolean);
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("Monedario CI liveness watchdog", () => {
  it("is a dry run unless --apply is passed", () => {
    const harness = makeHarness();
    const result = runWatchdog(harness, {
      FAKE_RUNNERS: "42\tmonedario-ci-isolated-1\tonline\ttrue",
      FAKE_IN_PROGRESS: "0",
      FAKE_QUEUED_DATES: "",
    });

    expect(result.status, result.stderr).toBe(0);
    expect(calls(harness).some(call => call.includes("DELETE"))).toBe(false);
    expect(
      calls(harness).some(call => call.includes("systemctl --user restart"))
    ).toBe(false);
    expect(events(harness).join("\n")).toContain("would_recover_stale_busy");
  });

  it("deletes only the exact stale Monedario registration", () => {
    const harness = makeHarness();
    const result = runWatchdog(
      harness,
      {
        FAKE_RUNNERS:
          "1\tpcp-local\tonline\ttrue\n42\tmonedario-ci-isolated-1\tonline\ttrue",
        FAKE_IN_PROGRESS: "0",
        FAKE_QUEUED_DATES: "",
      },
      ["--apply"]
    );

    expect(result.status, result.stderr).toBe(0);
    const observed = calls(harness);
    expect(observed).toContain(
      "gh api --method DELETE repos/cortega26/Monedario/actions/runners/42"
    );
    expect(observed.some(call => call.includes("runners/1"))).toBe(false);
    expect(observed).toContain(
      "docker rm --force monedario-ci-isolated-1"
    );
    expect(observed.some(call => call.includes("pcp-local"))).toBe(false);
    expect(observed).toContain(
      "systemctl --user restart monedario-isolated-ci.service"
    );
  });

  it("restarts the service when work is queued and no runner is online", () => {
    const harness = makeHarness();
    const result = runWatchdog(
      harness,
      {
        FAKE_RUNNERS: "",
        FAKE_IN_PROGRESS: "0",
        FAKE_QUEUED_DATES: "2026-08-19T03:24:02Z",
        FAKE_SERVICE_STATE: "inactive",
      },
      ["--apply"]
    );

    expect(result.status, result.stderr).toBe(0);
    expect(calls(harness)).toContain(
      "systemctl --user restart monedario-isolated-ci.service"
    );
  });

  it("reports a queue that an idle runner is not picking up", () => {
    const harness = makeHarness();
    const result = runWatchdog(
      harness,
      {
        FAKE_RUNNERS: "42\tmonedario-ci-isolated-1\tonline\tfalse",
        FAKE_IN_PROGRESS: "0",
        FAKE_QUEUED_DATES: "2026-08-19T03:24:02Z",
      },
      ["--apply"]
    );

    expect(result.status).toBe(2);
    expect(
      calls(harness).some(call => call.includes("systemctl --user restart"))
    ).toBe(false);
    expect(events(harness).join("\n")).toContain("queue_unassigned");
  });

  it("does nothing when the routing label is disabled", () => {
    const harness = makeHarness();
    const result = runWatchdog(
      harness,
      {
        FAKE_VARIABLE_LABEL: "",
        FAKE_RUNNERS: "42\tmonedario-ci-isolated-1\tonline\ttrue",
        FAKE_IN_PROGRESS: "0",
        FAKE_QUEUED_DATES: "",
      },
      ["--apply"]
    );

    expect(result.status, result.stderr).toBe(0);
    expect(calls(harness).some(call => call.includes("DELETE"))).toBe(false);
    expect(events(harness).join("\n")).toContain("runner_disabled");
  });

  it("keeps a fresh offline registration during its grace period", () => {
    const harness = makeHarness();
    const offline = {
      FAKE_RUNNERS: "42\tmonedario-ci-isolated-1\toffline\tfalse",
      FAKE_IN_PROGRESS: "0",
      FAKE_QUEUED_DATES: "",
      WATCHDOG_OFFLINE_GRACE_SECONDS: "300",
      WATCHDOG_NOW: "1000",
    };

    const first = runWatchdog(harness, offline, ["--apply"]);
    expect(first.status, first.stderr).toBe(0);
    expect(calls(harness).some(call => call.includes("DELETE"))).toBe(false);
    expect(events(harness).join("\n")).toContain("offline_runner_pending");

    clearCalls(harness);
    const second = runWatchdog(
      harness,
      { ...offline, WATCHDOG_NOW: "1301" },
      ["--apply"]
    );
    expect(second.status, second.stderr).toBe(0);
    expect(calls(harness)).toContain(
      "gh api --method DELETE repos/cortega26/Monedario/actions/runners/42"
    );
  });
});
