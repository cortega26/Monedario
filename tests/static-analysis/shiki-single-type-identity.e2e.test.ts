/**
 * Astro bundles its own `shiki`, and `@shikijs/transformers` (direct
 * devDependency) declares its own `@shikijs/types`. When pnpm resolves two
 * copies of `@shikijs/types`, `astro check` fails with TS2322 in
 * `astro.config.ts`: the transformer objects come from one type identity and
 * `shikiConfig.transformers` expects the other.
 *
 * The invariant is a single Shiki type family: the `shiki` override in
 * `pnpm-workspace.yaml` pins the whole tree, and `@shikijs/transformers` must
 * be an exact match for it. Bump Astro, the `shiki` override and the
 * transformers pin together — this guard fails when they drift apart.
 */
import fs from "node:fs";
import path from "node:path";
import { load } from "js-yaml";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const workspace = load(
  fs.readFileSync(path.join(repoRoot, "pnpm-workspace.yaml"), "utf8")
) as { overrides?: Record<string, string> };
const packageJson = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "package.json"), "utf8")
) as { devDependencies?: Record<string, string> };
const lockfile = fs.readFileSync(path.join(repoRoot, "pnpm-lock.yaml"), "utf8");

const overrides = workspace.overrides ?? {};
const transformersPin = packageJson.devDependencies?.["@shikijs/transformers"];

function resolvedVersions(specifier: string): string[] {
  const escaped = specifier.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const pattern = new RegExp(`^  '?${escaped}@([^':(]+)'?:$`, "gmu");
  return [...new Set([...lockfile.matchAll(pattern)].map(match => match[1]))];
}

describe("shiki single type identity", () => {
  it("pins @shikijs/transformers to an exact version", () => {
    // A caret/tilde range lets pnpm pull a newer @shikijs/types than the one
    // Astro expects, which is the failure this guard exists to prevent.
    expect(transformersPin).toMatch(/^\d+\.\d+\.\d+$/u);
  });

  it("keeps the transformers pin equal to the shiki override", () => {
    expect(overrides.shiki).toMatch(/^\d+\.\d+\.\d+$/u);
    expect(transformersPin).toBe(overrides.shiki);
  });

  it("resolves exactly one @shikijs/types in the lockfile", () => {
    expect(resolvedVersions("@shikijs/types")).toEqual([overrides.shiki]);
  });

  it("resolves exactly one shiki in the lockfile", () => {
    expect(resolvedVersions("shiki")).toEqual([overrides.shiki]);
  });
});
