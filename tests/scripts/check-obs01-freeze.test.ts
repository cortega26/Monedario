import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = path.resolve("scripts/check-obs01-freeze.mjs");
const tempRoots: string[] = [];

function writePlanDoc(rows: Array<{ fecha: string; fase: string; estado: string }>): string {
  const root = mkdtempSync(path.join(tmpdir(), "obs01-freeze-"));
  tempRoots.push(root);
  const dir = path.join(root, "docs", "backlog");
  mkdirSync(dir, { recursive: true });

  const tableRows = rows
    .map(r => `| ${r.fecha} | ${r.fase} | ${r.estado} | abc123 | evidencia | decisión |`)
    .join("\n");

  const doc = `## 14. Progress Log

| Fecha | Fase | Estado | Commit/PR | Evidencia | Decisión/bloqueo |
| --- | --- | --- | --- | --- | --- |
${tableRows}
`;

  const docPath = path.join(dir, "PLAN-calculator-led-growth-2026-06-28.md");
  writeFileSync(docPath, doc, "utf8");
  return docPath;
}

function run(opts: {
  planPath?: string;
  changedFiles?: string[];
  override?: boolean;
}) {
  const env: NodeJS.ProcessEnv = { ...process.env };
  if (opts.planPath) env.OBS01_FREEZE_PLAN_PATH = opts.planPath;
  env.OBS01_FREEZE_CHANGED_FILES = (opts.changedFiles ?? []).join("\n");
  if (opts.override) env.OBS01_FREEZE_OVERRIDE = "1";
  else delete env.OBS01_FREEZE_OVERRIDE;

  return spawnSync("node", [SCRIPT], { env, encoding: "utf8" });
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("check-obs01-freeze", () => {
  it("passes when no freeze-scoped path changed", () => {
    const r = run({ changedFiles: ["src/pages/blog/some-post.md"] });
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("No freeze-scoped paths changed");
  });

  it("passes when a freeze-scoped page changed but OBS-01 is DONE", () => {
    const planPath = writePlanDoc([
      { fecha: "2026-06-28", fase: "OBS-01 — Activación", estado: "DONE" },
      { fecha: "2026-07-26", fase: "OBS-01 — Cierre de ventana", estado: "DONE" },
    ]);
    const r = run({
      planPath,
      changedFiles: ["src/pages/calculadoras/seguro-cesantia.astro"],
    });
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("OK");
    expect(r.stdout).toContain("2026-07-26");
  });

  it("blocks when a freeze-scoped page changed and OBS-01 is INCONCLUSIVE", () => {
    const planPath = writePlanDoc([
      { fecha: "2026-06-28", fase: "OBS-01 — Activación", estado: "DONE" },
      { fecha: "2026-07-12", fase: "OBS-01 — Revisión de fin de ventana", estado: "INCONCLUSIVE" },
    ]);
    const r = run({
      planPath,
      changedFiles: ["src/pages/calculadoras/seguro-cesantia.astro"],
    });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("BLOCKED");
    expect(r.stderr).toContain("§10");
    expect(r.stderr).toContain("obs01-freeze-override");
    expect(r.stderr).toContain("INCONCLUSIVE");
  });

  it("blocks on a shared freeze-scoped component (calculator-prefill.ts)", () => {
    const planPath = writePlanDoc([
      { fecha: "2026-07-12", fase: "OBS-01 — Revisión de fin de ventana", estado: "INCONCLUSIVE" },
    ]);
    const r = run({
      planPath,
      changedFiles: ["src/scripts/calculator-prefill.ts"],
    });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("src/scripts/calculator-prefill.ts");
  });

  it("uses the most recent OBS-01 row, not the first", () => {
    const planPath = writePlanDoc([
      { fecha: "2026-06-28", fase: "OBS-01 — Activación", estado: "INCONCLUSIVE" },
      { fecha: "2026-07-26", fase: "OBS-01 — Cierre de ventana", estado: "DONE" },
    ]);
    const r = run({
      planPath,
      changedFiles: ["src/data/nextBestStep/rules.ts"],
    });
    expect(r.status).toBe(0);
  });

  it("fails closed when the plan doc has no OBS-01 row", () => {
    const planPath = writePlanDoc([
      { fecha: "2026-06-28", fase: "PR-02 — Export semanal", estado: "DONE" },
    ]);
    const r = run({
      planPath,
      changedFiles: ["src/components/NextBestStep.astro"],
    });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("No OBS-01 row found");
  });

  it("fails closed when the plan doc is missing", () => {
    const r = run({
      planPath: path.join(tmpdir(), "does-not-exist", "PLAN.md"),
      changedFiles: ["src/scripts/analytics.ts"],
    });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("Cannot read plan doc");
  });

  it("passes with a warning when the human override is active", () => {
    const planPath = writePlanDoc([
      { fecha: "2026-07-12", fase: "OBS-01 — Revisión de fin de ventana", estado: "INCONCLUSIVE" },
    ]);
    const r = run({
      planPath,
      changedFiles: ["src/pages/calculadoras/credito-consumo.astro"],
      override: true,
    });
    expect(r.status).toBe(0);
    expect(r.stderr).toContain("OVERRIDE active");
  });
});
