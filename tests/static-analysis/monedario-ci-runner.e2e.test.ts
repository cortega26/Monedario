import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const path = resolve(root, "ops/ci-runner/run-one.sh");
const dockerfilePath = resolve(root, "ops/ci-runner/Dockerfile");
const servicePath = resolve(root, "ops/ci-runner/monedario-isolated-ci.service");
const secondaryServicePath = resolve(
  root,
  "ops/ci-runner/monedario-isolated-ci-2.service"
);
const watchdogPath = resolve(root, "ops/ci-runner/watchdog.sh");
const watchdogServicePath = resolve(
  root,
  "ops/ci-runner/monedario-ci-watchdog.service"
);
const watchdogTimerPath = resolve(
  root,
  "ops/ci-runner/monedario-ci-watchdog.timer"
);
const source = readFileSync(path, "utf8");
const dockerfile = readFileSync(dockerfilePath, "utf8");
const service = readFileSync(servicePath, "utf8");
const secondaryService = readFileSync(secondaryServicePath, "utf8");
const watchdog = readFileSync(watchdogPath, "utf8");
const watchdogService = readFileSync(watchdogServicePath, "utf8");
const watchdogTimer = readFileSync(watchdogTimerPath, "utf8");

describe("Monedario disposable CI boundary", () => {
  it("accepts bash -n without executing GitHub registration", () => {
    for (const script of [path, watchdogPath]) {
      const result = spawnSync("bash", ["-n", script], { encoding: "utf8" });
      expect(result.error).toBeUndefined();
      expect(result.status, result.stderr).toBe(0);
    }
  });

  it("registers JIT for Monedario only, not the trusted PCP runner", () => {
    expect(source).toContain("readonly repository=cortega26/Monedario");
    expect(source).toContain("readonly label=monedario-ci-isolated");
    expect(source).toContain(
      'readonly image="${MONEDARIO_CI_IMAGE:-monedario-ci-isolated:2.338.0-a11y}"'
    );
    expect(source).toContain("generate-jitconfig");
    expect(source).toContain("pcp-i5-12600K");
    expect(source).not.toContain("readonly repository=cortega26/portfolio-control-plane");
  });

  it("bakes a warm pnpm store for lockfile-change installs", () => {
    expect(dockerfile).toContain("AS pnpm-store");
    expect(dockerfile).toContain("corepack pnpm fetch --frozen-lockfile");
    expect(dockerfile).toContain(
      "COPY --from=pnpm-store /pnpm-store /opt/pnpm-store"
    );
  });

  it("cleans stale idle runners for its slot before registering", () => {
    expect(source).toContain("cleanup_stale_slot");
    expect(source).toContain(
      'prefix_regex="^monedario-ci-isolated-[0-9]{10}-[0-9]+$"'
    );
    expect(source).toContain(
      'prefix_regex="^monedario-ci-isolated-${slot}-[0-9]{10}-[0-9]+$"'
    );
    expect(source).toContain("Cleaning stale slot runner");
    expect(source.indexOf("cleanup_stale_slot || true")).toBeLessThan(
      source.indexOf("actions/runners/generate-jitconfig")
    );
  });

  it("removes its own JIT registration on exit", () => {
    expect(source).toContain('runner_id=""');
    expect(source).toContain(
      "--jq '[.runner.id, .encoded_jit_config] | @tsv'"
    );
    expect(source).toContain(
      'gh api --method DELETE "repos/$repository/actions/runners/$runner_id"'
    );
    expect(source).toContain("Invalid JIT registration response");
  });

  it("enforces disposable host isolation and bounded resources", () => {
    expect(source).toContain("--rm --interactive");
    expect(source).toContain("--read-only");
    expect(source).toContain("--cap-drop ALL");
    expect(source).toContain("--security-opt no-new-privileges");
    expect(source).toContain("--memory 8g --memory-swap 8g");
    expect(source).toContain("--tmpfs /runner:");
    expect(source).not.toMatch(/--(?:volume|mount|privileged)\b/);
    expect(source).not.toContain("/var/run/docker.sock");
  });

  it("runs a second slot with its own systemd service", () => {
    expect(source).toContain('readonly slot="${MONEDARIO_CI_SLOT:-0}"');
    expect(source).toContain(
      'name="monedario-ci-isolated-${slot}-$(date -u +%s)-$$"'
    );
    expect(secondaryService).toContain("Environment=MONEDARIO_CI_SLOT=2");
    expect(secondaryService).toContain("Restart=always");
    expect(secondaryService).toContain(
      ".local/share/monedario/isolated-ci-runner/run-one.sh"
    );
    expect(secondaryService).not.toContain("portfolio-control-plane");
  });

  it("uses an independently managed service without stopping PCP", () => {
    expect(service).toContain(
      ".local/share/monedario/isolated-ci-runner/run-one.sh"
    );
    expect(service).toContain("Restart=always");
    expect(service).not.toContain("systemctl stop pcp");
    expect(service).not.toContain("portfolio-control-plane-isolated-ci.service");
  });
});

describe("Monedario CI liveness watchdog boundary", () => {
  it("is a dry run unless --apply is passed", () => {
    expect(watchdog).toContain("apply=0");
    expect(watchdog).toContain("--apply) apply=1");
    expect(watchdog).toContain("if ((!apply)); then");
  });

  it("only deletes the dedicated Monedario prefix by exact id", () => {
    expect(watchdog).toContain('readonly runner_prefix="${label}-"');
    expect(watchdog).toContain(
      '[[ "$name" == "$runner_prefix"* ]] || return 1'
    );
    expect(watchdog).toContain('[[ "$id" =~ ^[0-9]+$ ]] || return 1');
    expect(watchdog).toContain(
      '"pcp-local" && "$name" != "pcp-i5-12600K"'
    );
    expect(watchdog).toContain("gh api --method DELETE");
    expect(watchdog).not.toContain("runners[0]");
  });

  it("honors the routing variable and never restarts a disabled runner", () => {
    expect(watchdog).toContain("ACTIONS_RUNNER_LABEL");
    expect(watchdog).toContain(
      'if ((!status_mode)) && [[ "$configured_label" != "$label" ]]'
    );
  });

  it("uses a systemd timer and a separate oneshot unit", () => {
    expect(watchdogService).toContain("watchdog.sh --apply");
    expect(watchdogService).toContain("Type=oneshot");
    expect(watchdogTimer).toContain("monedario-ci-watchdog.service");
    expect(watchdogTimer).toContain("OnUnitActiveSec=2min");
  });
});
