#!/usr/bin/env node

/**
 * doctor
 *
 * Growth Engine Fase 0 (report-only): corre un subconjunto rápido de gates y
 * clasifica cada fallo por categoría de acción (mechanical, data, editorial,
 * contract, unknown). No corrige nada: en Fase 1 su clasificación alimentará
 * a self-heal (A1) y a la apertura de issues (resto).
 *
 * Uso:
 *   node scripts/doctor.mjs [--root .] [--out output/validation/doctor]
 *     [--only format,docs] [--strict]
 *
 * Siempre sale 0 salvo error interno. Con --strict sale 1 si hay fallos.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  DOCTOR_CATEGORIES,
  DOCTOR_CHECKS,
  classifyDoctorOutput,
} from "./lib/doctor-rules.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const args = { root: DEFAULT_ROOT, out: null, only: null, strict: false };
  for (let i = 2; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === "--root") args.root = path.resolve(argv[i + 1]);
    else if (flag === "--out") args.out = argv[i + 1];
    else if (flag === "--only") args.only = argv[i + 1].split(",");
    else if (flag === "--strict") args.strict = true;
    else {
      console.error(`[doctor] argumento desconocido: ${flag}`);
      process.exit(1);
    }
    if (flag !== "--strict") i += 1;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  const outDir = path.resolve(args.root, args.out ?? "output/validation/doctor");

  const checks = args.only
    ? DOCTOR_CHECKS.filter(check => args.only.includes(check.name))
    : DOCTOR_CHECKS;

  const results = [];
  for (const check of checks) {
    const [command, ...commandArgs] = check.command;
    const run = spawnSync(command, commandArgs, {
      cwd: args.root,
      encoding: "utf8",
      timeout: 180_000,
    });
    const output = `${run.stdout ?? ""}\n${run.stderr ?? ""}`;
    const failed = run.status !== 0;
    const findings = failed ? classifyDoctorOutput(output) : [];
    results.push({
      name: check.name,
      status: failed ? "fail" : "ok",
      exitCode: run.status,
      findings,
    });
  }

  const byCategory = {};
  for (const result of results) {
    for (const finding of result.findings) {
      byCategory[finding.category] = (byCategory[finding.category] ?? 0) + 1;
    }
  }
  const failed = results.filter(result => result.status === "fail");

  const report = {
    generatedAt: new Date().toISOString(),
    phase: "report-only",
    checks: results,
    summary: {
      checks: results.length,
      failed: failed.length,
      byCategory,
    },
  };

  mkdirSync(outDir, { recursive: true });
  const outJson = path.join(outDir, "report.json");
  writeFileSync(outJson, `${JSON.stringify(report, null, 2)}\n`);

  for (const result of failed) {
    const categories = result.findings
      .map(finding => `${finding.rule}:${finding.category}`)
      .join(", ");
    console.log(
      `[doctor] fail ${result.name} → ${categories} — ${result.findings
        .map(finding => DOCTOR_CATEGORIES[finding.category]?.action)
        .filter(Boolean)
        .join("; ")}`
    );
  }
  console.log(
    `[doctor] checks=${results.length} failed=${failed.length} byCategory=${JSON.stringify(
      byCategory
    )} report=${outJson}`
  );

  if (args.strict && failed.length > 0) process.exit(1);
}

main();
