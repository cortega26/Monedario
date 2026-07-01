import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();
const GITHUB_DIR = path.join(REPO_ROOT, ".github");

function listYamlFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listYamlFiles(entryPath);
    return /\.ya?ml$/u.test(entry.name) ? [entryPath] : [];
  });
}

describe("supply-chain configuration", () => {
  it("pins every external GitHub Action to a full commit SHA", () => {
    const mutableReferences: string[] = [];

    for (const filePath of listYamlFiles(GITHUB_DIR)) {
      const source = fs.readFileSync(filePath, "utf8");
      for (const match of source.matchAll(/^\s*uses:\s*([^\s#]+)/gmu)) {
        const action = match[1];
        if (!action || action.startsWith("./") || action.startsWith("docker://")) continue;

        const separator = action.lastIndexOf("@");
        const reference = separator === -1 ? "" : action.slice(separator + 1);
        if (!/^[0-9a-f]{40}$/iu.test(reference)) {
          mutableReferences.push(
            `${path.relative(REPO_ROOT, filePath)}: ${action}`,
          );
        }
      }
    }

    expect(mutableReferences).toEqual([]);
  });

  it("applies a seven-day cooldown to every Dependabot ecosystem", () => {
    const config = yaml.load(
      fs.readFileSync(path.join(GITHUB_DIR, "dependabot.yml"), "utf8"),
    ) as {
      updates?: Array<{
        "package-ecosystem"?: string;
        cooldown?: { "default-days"?: number };
      }>;
    };

    expect(config.updates).toBeInstanceOf(Array);
    for (const update of config.updates ?? []) {
      expect(
        update.cooldown?.["default-days"],
        `${update["package-ecosystem"]} must wait at least seven days`,
      ).toBeGreaterThanOrEqual(7);
    }
  });

  it("prevents pnpm from resolving packages younger than seven days", () => {
    const config = yaml.load(
      fs.readFileSync(path.join(REPO_ROOT, "pnpm-workspace.yaml"), "utf8"),
    ) as {
      minimumReleaseAge?: number;
      minimumReleaseAgeExclude?: string[];
    };

    expect(config.minimumReleaseAge).toBeGreaterThanOrEqual(7 * 24 * 60);
    for (const selector of config.minimumReleaseAgeExclude ?? []) {
      expect(selector).toMatch(/^(@[^/]+\/)?[^@]+@[^@]+$/u);
    }
  });
});
