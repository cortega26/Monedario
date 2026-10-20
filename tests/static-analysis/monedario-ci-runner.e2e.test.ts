import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const path = resolve(root, "ops/ci-runner/run-one.sh");
const servicePath = resolve(root, "ops/ci-runner/monedario-isolated-ci.service");
const source = readFileSync(path, "utf8");
const service = readFileSync(servicePath, "utf8");

describe("Monedario disposable CI boundary", () => {
  it("accepts bash -n without executing GitHub registration", () => {
    const result = spawnSync("bash", ["-n", path], { encoding: "utf8" });
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
  });

  it("registers JIT for Monedario only, not the trusted PCP runner", () => {
    expect(source).toContain("readonly repository=cortega26/Monedario");
    expect(source).toContain("readonly label=monedario-ci-isolated");
    expect(source).toContain("readonly image=monedario-ci-isolated:2.338.0-a11y");
    expect(source).toContain("generate-jitconfig");
    expect(source).toContain("pcp-i5-12600K");
    expect(source).not.toContain("readonly repository=cortega26/portfolio-control-plane");
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

  it("uses an independently managed service without stopping PCP", () => {
    expect(service).toContain(
      ".local/share/monedario/isolated-ci-runner/run-one.sh"
    );
    expect(service).toContain("Restart=always");
    expect(service).not.toContain("systemctl stop pcp");
    expect(service).not.toContain("portfolio-control-plane-isolated-ci.service");
  });
});
