import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  collectLockfilePackageSpecs,
  collectReleaseAgeExcludes,
  findDeadReleaseAgeExcludes,
} from "../../scripts/check-pnpm-release-age-excludes.mjs";

const SCRIPT_PATH = path.resolve("scripts/check-pnpm-release-age-excludes.mjs");
const tempRoots: string[] = [];

function createTempRoot(workspaceYaml: string, lockfileYaml: string) {
  const root = mkdtempSync(path.join(tmpdir(), "tpi-release-age-"));
  tempRoots.push(root);
  writeFileSync(path.join(root, "pnpm-workspace.yaml"), workspaceYaml, "utf8");
  writeFileSync(path.join(root, "pnpm-lock.yaml"), lockfileYaml, "utf8");
  return root;
}

function runGuard(root: string) {
  return spawnSync("node", [SCRIPT_PATH], {
    env: { ...process.env, PNPM_RELEASE_AGE_ROOT: root },
    encoding: "utf8",
  });
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("check-pnpm-release-age-excludes helpers", () => {
  it("reads the exclude list and tolerates its absence", () => {
    expect(
      collectReleaseAgeExcludes("minimumReleaseAgeExclude:\n  - 'a@1.0.0'\n")
    ).toEqual(["a@1.0.0"]);
    expect(collectReleaseAgeExcludes("minimumReleaseAge: 10080\n")).toEqual([]);
    expect(collectReleaseAgeExcludes("minimumReleaseAgeExclude: []\n")).toEqual(
      []
    );
  });

  it("collects package specs from the lockfile packages section", () => {
    const specs = collectLockfilePackageSpecs(
      "packages:\n\n  'a@1.0.0':\n    resolution: {integrity: sha512-x}\n\n  postcss@8.5.26:\n    resolution: {integrity: sha512-y}\n"
    );
    expect(specs.has("a@1.0.0")).toBe(true);
    expect(specs.has("postcss@8.5.26")).toBe(true);
    expect(specs.has("postcss@8.5.25")).toBe(false);
  });

  it("flags dead pinned entries and keeps live ones", () => {
    const specs = new Set(["postcss@8.5.26", "eslint-plugin-astro@3.1.0"]);
    expect(
      findDeadReleaseAgeExcludes(
        ["postcss@8.5.26", "postcss@8.5.25", "eslint-plugin-astro@2.1.1"],
        specs
      )
    ).toEqual(["postcss@8.5.25", "eslint-plugin-astro@2.1.1"]);
  });

  it("treats a bare package name as live if any version exists", () => {
    const specs = new Set(["postcss@8.5.26"]);
    expect(findDeadReleaseAgeExcludes(["postcss"], specs)).toEqual([]);
    expect(findDeadReleaseAgeExcludes(["gone"], specs)).toEqual(["gone"]);
  });
});

describe("check-pnpm-release-age-excludes script", () => {
  it("fails with the dead entries listed", () => {
    const root = createTempRoot(
      "minimumReleaseAgeExclude:\n  - 'postcss@8.5.25'\n",
      "packages:\n\n  postcss@8.5.26:\n    resolution: {integrity: sha512-y}\n"
    );
    const result = runGuard(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("postcss@8.5.25");
    expect(result.stderr).toContain("TD-0104");
  });

  it("passes when every entry is present in the lockfile", () => {
    const root = createTempRoot(
      "minimumReleaseAgeExclude:\n  - 'postcss@8.5.26'\n",
      "packages:\n\n  postcss@8.5.26:\n    resolution: {integrity: sha512-y}\n"
    );
    const result = runGuard(root);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("[check-pnpm-release-age-excludes] OK.");
  });

  it("passes on the real repository policy", () => {
    const result = spawnSync("node", [SCRIPT_PATH], { encoding: "utf8" });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("dead=0");
  });
});
