import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = path.resolve("scripts/validate-committed-artifacts.mjs");
const tempRoots: string[] = [];

const VALID_SNAPSHOT = {
  uf: 40846.11,
  utm: 71649,
  indicatorUpdatedAt: { utm: "2026-08-01" },
};

function buildRoot(opts: {
  snapshot?: unknown;
  dataSignals?: Array<{ name: string; content: string }>;
}) {
  const root = mkdtempSync(path.join(tmpdir(), "validate-artifacts-"));
  tempRoots.push(root);

  const snapshotPath = path.join(
    root,
    "src",
    "infrastructure",
    "economic",
    "economic-parameters.snapshot.json"
  );
  mkdirSync(path.dirname(snapshotPath), { recursive: true });
  writeFileSync(
    snapshotPath,
    opts.snapshot === undefined
      ? JSON.stringify(VALID_SNAPSHOT)
      : JSON.stringify(opts.snapshot),
    "utf8"
  );

  const signalsDir = path.join(root, "output", "operations", "data-signals");
  mkdirSync(signalsDir, { recursive: true });
  for (const file of opts.dataSignals ?? []) {
    writeFileSync(path.join(signalsDir, file.name), file.content, "utf8");
  }

  return root;
}

function run(root: string) {
  return spawnSync("node", [SCRIPT], {
    env: { ...process.env, VALIDATE_ARTIFACTS_ROOT: root },
    encoding: "utf8",
  });
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("validate-committed-artifacts", () => {
  it("passes on a valid snapshot and valid data-signals JSON", () => {
    const root = buildRoot({ dataSignals: [{ name: "2026-W32.json", content: "{}" }] });
    const r = run(root);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("OK");
  });

  it("fails on a snapshot with broken JSON", () => {
    const root = buildRoot({});
    writeFileSync(
      path.join(root, "src/infrastructure/economic/economic-parameters.snapshot.json"),
      '{"uf": ',
      "utf8"
    );
    const r = run(root);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("parse");
  });

  it("fails when a numeric field is not a finite number", () => {
    const root = buildRoot({ snapshot: { uf: 1, utm: "abc" } });
    const r = run(root);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('"utm"');
  });

  it("fails when a numeric field is NaN", () => {
    const root = buildRoot({ snapshot: { uf: null, utm: 1 } });
    const r = run(root);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('"uf"');
  });

  it("fails when indicatorUpdatedAt.utm is not YYYY-MM-DD", () => {
    const root = buildRoot({
      snapshot: { uf: 1, utm: 2, indicatorUpdatedAt: { utm: "01/08/2026" } },
    });
    const r = run(root);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("date-format");
  });

  it("fails when a data-signals JSON file is broken", () => {
    const root = buildRoot({
      dataSignals: [{ name: "broken.json", content: '{"clicks": ' }],
    });
    const r = run(root);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("data-signals");
    expect(r.stderr).toContain("broken.json");
  });

  it("passes when optional fields are absent", () => {
    const root = buildRoot({ dataSignals: [{ name: "valid.json", content: "{}" }] });
    const r = run(root);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("OK");
  });

  it("reports ALL failures, not only the first", () => {
    const root = buildRoot({
      snapshot: { uf: "x" },
      dataSignals: [{ name: "bad.json", content: "nope" }],
    });
    const r = run(root);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('"uf"');
    expect(r.stderr).toContain("bad.json");
  });
});
