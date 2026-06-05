import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SCRIPT_PATH = path.resolve("scripts/check-docs-structure.mjs");

describe("check-docs-structure script", () => {
  it("passes against the current repository markdown layout", () => {
    const result = spawnSync("node", [SCRIPT_PATH], { encoding: "utf8" });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("[check-docs-structure] OK");
  });
});
