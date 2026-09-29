import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = path.resolve("scripts/check-economic-snapshot-freshness.mjs");
const tempRoots: string[] = [];

function writeSnapshot(snapshot: unknown): string {
  const root = mkdtempSync(path.join(tmpdir(), "econ-fresh-"));
  tempRoots.push(root);
  const dir = path.join(root, "src", "infrastructure", "economic");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    path.join(dir, "economic-parameters.snapshot.json"),
    JSON.stringify(snapshot)
  );
  return root;
}

function writeIpcSeries(root: string, hastaFecha: string) {
  const dir = path.join(root, "src", "data", "economic-history");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    path.join(dir, "ipc-historico.json"),
    JSON.stringify({ hastaFecha, serie: [] })
  );
}

function run(root: string, now: string) {
  return spawnSync("node", [SCRIPT], {
    env: {
      ...process.env,
      ECONOMIC_SNAPSHOT_ROOT: root,
      ECONOMIC_SNAPSHOT_NOW: now,
    },
    encoding: "utf8",
  });
}

const fresh = {
  capturedAt: "2026-06-17T10:15:54.895Z",
  indicatorUpdatedAt: { uf: "2026-06-17", utm: "2026-06-01", dolar: "2026-06-17" },
};

afterEach(() => {
  for (const root of tempRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("check-economic-snapshot-freshness", () => {
  it("passes when capturedAt and indicators are within thresholds", () => {
    const r = run(writeSnapshot(fresh), "2026-06-19T00:00:00.000Z");
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("OK");
  });

  it("fails when capturedAt is older than CAPTURE_MAX_DAYS (worker stopped)", () => {
    const r = run(writeSnapshot(fresh), "2026-07-05T00:00:00.000Z");
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("capturedAt");
  });

  it("fails when a daily indicator (uf) is stale", () => {
    const stale = {
      capturedAt: "2026-06-17T10:15:54.895Z",
      indicatorUpdatedAt: { uf: "2026-05-20", utm: "2026-06-01", dolar: "2026-06-17" },
    };
    // NOW close to capturedAt so only uf trips:
    const r = run(writeSnapshot(stale), "2026-06-19T00:00:00.000Z");
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("uf");
  });

  it("does not age-check the managed IMM (no indicatorUpdatedAt.imm required)", () => {
    const r = run(writeSnapshot(fresh), "2026-06-19T00:00:00.000Z");
    expect(r.status).toBe(0); // fresh snapshot has no imm date and still passes
  });

  it("allows previous-month UTM only through day 7", () => {
    const snapshot = {
      capturedAt: "2026-07-06T10:00:00.000Z",
      indicatorUpdatedAt: {
        uf: "2026-07-06",
        utm: "2026-06-01",
        dolar: "2026-07-06",
      },
    };
    expect(run(writeSnapshot(snapshot), "2026-07-07T12:00:00.000Z").status).toBe(0);
    const stale = {
      ...snapshot,
      capturedAt: "2026-07-08T10:00:00.000Z",
      indicatorUpdatedAt: { ...snapshot.indicatorUpdatedAt, uf: "2026-07-08", dolar: "2026-07-08" },
    };
    const r = run(writeSnapshot(stale), "2026-07-08T12:00:00.000Z");
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("month-boundary grace");
  });

  it("fails when the ingested IPC series lags the snapshot period (TD-0112)", () => {
    const snapshot = {
      ...fresh,
      indicatorUpdatedAt: { ...fresh.indicatorUpdatedAt, ipc: "2026-06-01" },
    };
    const root = writeSnapshot(snapshot);
    writeIpcSeries(root, "2026-05-01");
    const r = run(root, "2026-06-19T00:00:00.000Z");
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("ipc-historico.json");
    expect(r.stderr).toContain("--solo=ipc");
  });

  it("passes when the IPC series matches the snapshot period", () => {
    const snapshot = {
      ...fresh,
      indicatorUpdatedAt: { ...fresh.indicatorUpdatedAt, ipc: "2026-06-01" },
    };
    const root = writeSnapshot(snapshot);
    writeIpcSeries(root, "2026-06-01");
    const r = run(root, "2026-06-19T00:00:00.000Z");
    expect(r.status).toBe(0);
  });

  it("fails clearly when the snapshot file is missing", () => {
    const root = mkdtempSync(path.join(tmpdir(), "econ-fresh-missing-"));
    tempRoots.push(root);
    const r = run(root, "2026-06-19T00:00:00.000Z");
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("cannot read/parse");
  });
});
