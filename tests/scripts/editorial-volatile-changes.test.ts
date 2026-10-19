import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { load } from "js-yaml";
import { describe, expect, it } from "vitest";

import {
  articleHasChangedTrigger,
  detectChangedDatasetIds,
} from "../../scripts/lib/editorial-volatile-changes.mjs";

const scriptPath = path.resolve(
  process.cwd(),
  "scripts/compute-review-policies.mjs"
);

function snapshot(value: number) {
  return {
    lastUpdated: "2026-10-04",
    datasets: {
      "economic.utm.value": { value },
    },
  };
}

function writeJson(filePath: string, value: unknown) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function createFixtureRoot(previousValue: number, currentValue: number) {
  const root = mkdtempSync(
    path.join(os.tmpdir(), "monedario-review-policies-")
  );
  writeJson(path.join(root, "src/config/editorial-timeliness-policy.json"), {
    defaultCadenceDays: 30,
    defaultSourceMode: "manual_review",
    categoryPolicies: {},
    slugOverrides: {},
  });
  writeJson(
    path.join(
      root,
      "src/infrastructure/editorial/editorial-volatile-data.snapshot.json"
    ),
    snapshot(currentValue)
  );
  const previousSnapshotPath = path.join(root, "previous-snapshot.json");
  writeJson(previousSnapshotPath, snapshot(previousValue));

  mkdirSync(path.join(root, "src/data/blog"), { recursive: true });
  writeFileSync(
    path.join(root, "src/data/blog/fixture-utm.md"),
    `---
title: "Fixture UTM"
slug: fixture-utm
category: empleo-ingresos
pubDate: 2026-01-01T00:00:00Z
draft: false
volatileData:
  - id: economic.utm.value
    sync: strict
    expectedValue: ${currentValue}
reviewPolicy:
  cadenceLabel: monthly
  maxDays: 30
  dataTriggers:
    - economic.utm.value
  derivationFactors:
    - registry:defaultPolicy
    - template:utm
  computedAt: "2026-10-04"
updatedDate: 2026-10-04T00:00:00Z
---

El valor de referencia es [[utm | clp]].
`,
    "utf8"
  );

  return { root, previousSnapshotPath };
}

function runCompute(root: string, previousSnapshotPath: string) {
  return execFileSync(process.execPath, [scriptPath], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      COMPUTE_REVIEW_POLICIES_ROOT: root,
      EDITORIAL_PREVIOUS_VOLATILE_SNAPSHOT: previousSnapshotPath,
    },
  });
}

function readFrontmatter(root: string): Record<string, unknown> {
  const source = readFileSync(
    path.join(root, "src/data/blog/fixture-utm.md"),
    "utf8"
  );
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error("fixture lost its frontmatter");
  return load(match[1]) as Record<string, unknown>;
}

describe("editorial volatile data change detection", () => {
  it("returns no changed datasets when values are identical", () => {
    const changed = detectChangedDatasetIds(snapshot(72151), snapshot(72151));
    expect([...changed]).toEqual([]);
  });

  it("detects a real value change", () => {
    const changed = detectChangedDatasetIds(snapshot(71721), snapshot(72151));
    expect([...changed]).toEqual(["economic.utm.value"]);
  });

  it("ignores datasets that did not exist in the previous snapshot", () => {
    const changed = detectChangedDatasetIds({ datasets: {} }, snapshot(72151));
    expect([...changed]).toEqual([]);
  });

  it("matches only triggers whose dataset actually changed", () => {
    const changed = new Set(["economic.utm.value"]);
    expect(articleHasChangedTrigger(["economic.utm.value"], changed)).toBe(
      true
    );
    expect(
      articleHasChangedTrigger(
        ["pensions.afp.worker_mandatory_contribution"],
        changed
      )
    ).toBe(false);
    expect(articleHasChangedTrigger([], changed)).toBe(false);
  });
});

describe("compute-review-policies freshness rules", () => {
  it("does not bump updatedDate or computedAt when the value is unchanged", () => {
    const { root, previousSnapshotPath } = createFixtureRoot(72151, 72151);
    try {
      const output = runCompute(root, previousSnapshotPath);
      const data = readFrontmatter(root);
      const policy = data.reviewPolicy as { computedAt?: string };

      expect(
        new Date(data.updatedDate as string | Date).toISOString().slice(0, 10)
      ).toBe("2026-10-04");
      expect(policy.computedAt).toBe("2026-10-04");
      expect(output).not.toContain("updatedDate→");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("bumps updatedDate but preserves computedAt when the value changes", () => {
    const { root, previousSnapshotPath } = createFixtureRoot(71721, 72151);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const output = runCompute(root, previousSnapshotPath);
      const data = readFrontmatter(root);
      const policy = data.reviewPolicy as { computedAt?: string };

      expect(
        new Date(data.updatedDate as string | Date).toISOString().slice(0, 10)
      ).toBe(today);
      expect(policy.computedAt).toBe("2026-10-04");
      expect(output).toContain(`updatedDate→${today}`);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("uses the article review anchor, not today, on first computation", () => {
    const { root, previousSnapshotPath } = createFixtureRoot(72151, 72151);
    try {
      const fixturePath = path.join(root, "src/data/blog/fixture-utm.md");
      const source = readFileSync(fixturePath, "utf8")
        .replace("  cadenceLabel: monthly\n", "  cadenceLabel: annual\n")
        .replace('  computedAt: "2026-10-04"\n', "")
        .replace(
          "reviewPolicy:\n",
          "articleLead:\n  validAsOf: 2026-09-12\nreviewPolicy:\n"
        );
      writeFileSync(fixturePath, source, "utf8");

      runCompute(root, previousSnapshotPath);
      const data = readFrontmatter(root);
      const policy = data.reviewPolicy as { computedAt?: string };

      expect(policy.computedAt).toBe("2026-09-12");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
