// check:legal-constants
//
// Fails (exit 1) when mirrored legal constants drift apart. The IMM
// ($553.553), its effective date, and the AFC/previsional UF caps live in
// multiple bundles (app runtime, snapshot Worker, Node script, use-cases)
// that cannot import each other — each reajuste legal requires editing them
// in lockstep. This check mechanically verifies the mirrors agree.
//
// Roots are env-overridable for tests:
//   LEGAL_CONSTANTS_ROOT — repo root override (default: repo root)
//
// Exit 0 = consistent, exit 1 = mismatch or missing mirror. Messages follow
// the repo's lint-script convention: file:rule.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(
  process.env.LEGAL_CONSTANTS_ROOT || path.resolve(__dirname, "..")
);

// Declarative mirror inventory. Each entry lists every file that mirrors the
// constant with the regex that captures its value at THAT site (constant names
// vary across bundles). Add a future legal constant as one entry.
const CONSTANT_MIRRORS = [
  {
    constant: "DEFAULT_IMM",
    files: [
      {
        path: "src/domain/economic/immConstants.ts",
        pattern: /DEFAULT_IMM\s*=\s*([\d_]+)/,
      },
      {
        path: "workers/economic-snapshot-refresh/src/buildSnapshot.ts",
        pattern: /DEFAULT_IMM\s*=\s*([\d_]+)/,
      },
      {
        path: "scripts/refresh-economic-snapshot.mjs",
        pattern: /DEFAULT_IMM\s*=\s*([\d_]+)/,
      },
    ],
  },
  {
    constant: "DEFAULT_IMM_EFFECTIVE_DATE",
    files: [
      {
        path: "src/domain/economic/immConstants.ts",
        pattern: /DEFAULT_IMM_EFFECTIVE_DATE\s*=\s*"([^"]+)"/,
      },
      {
        path: "workers/economic-snapshot-refresh/src/buildSnapshot.ts",
        pattern: /DEFAULT_IMM_EFFECTIVE_DATE\s*=\s*"([^"]+)"/,
      },
      {
        path: "scripts/refresh-economic-snapshot.mjs",
        pattern: /DEFAULT_IMM_EFFECTIVE_DATE\s*=\s*"([^"]+)"/,
      },
    ],
  },
  {
    constant: "AFC tope (135.2 UF)",
    files: [
      {
        path: "workers/economic-snapshot-refresh/src/buildSnapshot.ts",
        pattern: /DEFAULT_AFC_MONTHLY_TAXABLE_CAP_UF\s*=\s*([0-9.]+)/,
      },
      {
        path: "scripts/refresh-economic-snapshot.mjs",
        pattern: /DEFAULT_AFC_MONTHLY_TAXABLE_CAP_UF\s*=\s*([0-9.]+)/,
      },
      {
        path: "src/infrastructure/economic/EconomicParameterProvider.ts",
        pattern: /DEFAULT_AFC_MONTHLY_TAXABLE_CAP_UF\s*=\s*([0-9.]+)/,
      },
      {
        path: "src/application/use-cases/CalculateMonthlyPayrollBase.ts",
        pattern: /DEFAULT_UNEMPLOYMENT_MONTHLY_TAXABLE_CAP_UF\s*=\s*([0-9.]+)/,
      },
      {
        path: "src/application/use-cases/EstimateUnemploymentCoverage.ts",
        pattern: /DEFAULT_MONTHLY_TAXABLE_CAP_UF\s*=\s*([0-9.]+)/,
      },
    ],
  },
  {
    constant: "Previsional tope (90 UF)",
    files: [
      {
        path: "workers/economic-snapshot-refresh/src/buildSnapshot.ts",
        pattern: /DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF\s*=\s*([0-9.]+)/,
      },
      {
        path: "scripts/refresh-economic-snapshot.mjs",
        pattern: /DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF\s*=\s*([0-9.]+)/,
      },
      {
        path: "src/infrastructure/economic/EconomicParameterProvider.ts",
        pattern: /DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF\s*=\s*([0-9.]+)/,
      },
      {
        path: "src/application/use-cases/CalculateMonthlyPayrollBase.ts",
        pattern: /DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF\s*=\s*([0-9.]+)/,
      },
      {
        path: "src/application/use-cases/SimulateRetirementProjection.ts",
        pattern: /DEFAULT_PENSION_AND_HEALTH_MONTHLY_TAXABLE_CAP_UF\s*=\s*([0-9.]+)/,
      },
    ],
  },
];

const errors = [];

for (const entry of CONSTANT_MIRRORS) {
  const values = [];
  for (const mirror of entry.files) {
    const fullPath = path.join(REPO_ROOT, mirror.path);
    let source;
    try {
      source = readFileSync(fullPath, "utf8");
    } catch {
      errors.push(
        `check-legal-constants: missing mirror ${entry.constant} ${mirror.path}`
      );
      continue;
    }
    // Skip line-commented mirrors: a commented-out old value would match first
    // and shadow the real assignment, hiding drift (// comments only; the
    // mirrored files never use /* */ blocks around these constants).
    const activeSource = source
      .split("\n")
      .filter(line => !/^\s*\/\//.test(line))
      .join("\n");
    const match = activeSource.match(mirror.pattern);
    if (!match) {
      errors.push(
        `check-legal-constants: no match ${entry.constant} ${mirror.path}`
      );
      continue;
    }
    values.push({ value: match[1], file: mirror.path });
  }

  if (values.length > 0) {
    const expected = values[0].value;
    for (const { value, file } of values.slice(1)) {
      if (value !== expected) {
        errors.push(
          `check-legal-constants: mismatch ${entry.constant} ${values[0].file}:${expected} vs ${file}:${value}`
        );
      }
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log(
  `[check-legal-constants] OK. ${CONSTANT_MIRRORS.length} constantes verificadas en ${CONSTANT_MIRRORS.reduce((n, e) => n + e.files.length, 0)} mirrors.`
);
