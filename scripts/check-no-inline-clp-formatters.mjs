// check-no-inline-clp-formatters
//
// Enforces the rule "CLP output formatters live only in src/utils/formatCLP.ts":
// calculators must NOT redefine their own `const fmt`/`const fmtClp` CLP
// formatters (that's how divergent formatting crept in: iva/gratificacion
// rendered decimals while the rest rounded). The style guard scans the
// calculators directory for inline definitions and for "$" + toLocaleString
// usages without Math.round.
//
// NOT prohibited (by design): single-use inline expressions like
// "$" + Math.round(x).toLocaleString("es-CL") — they are equivalent to
// formatCLP and the plan 080 explicitly allows them; and non-CLP formatters
// (fmtUF, fmtUtm, fmtPct, fmtCurrency via Intl).
//
// Root is env-overridable for tests:
//   NO_INLINE_CLP_ROOT — repo root override (default: repo root)
//
// Exit 0 = clean, exit 1 = violations found (reports ALL of them).

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(
  process.env.NO_INLINE_CLP_ROOT || path.resolve(__dirname, "..")
);
const CALCULADORAS_DIR = path.join(REPO_ROOT, "src", "pages", "calculadoras");

const RULES = [
  {
    id: "inline-clp-formatter-def",
    message:
      "Formateador CLP inline prohibido: usa formatCLP (src/utils/formatCLP.ts).",
    regex: /const\s+(?:fmt|fmtClp)\s*=\s*(?:\([^)]*\)\s*=>\s*)?"\$"/g,
  },
  {
    id: "divergent-clp-no-round",
    message:
      "Formato CLP sin Math.round prohibido: usar formatCLP.",
    // Solo calls SIN options: `toLocaleString("es-CL")` omitió el Math.round
    // (el bug de iva/gratificacion). Los calls CON options explícitas
    // (p. ej. el histórico UF con 2 decimales en conversor-uf) son
    // formateos deliberados con precisión — no aplica formatCLP.
    regex: /(?<!Math\.round\()"\$"\s*\+\s*\w+(?:\.\w+)?\.toLocaleString\("es-CL"\)/g,
  },
];

function listSourceFiles(baseDir) {
  const files = [];
  const stack = [baseDir];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const absolutePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(absolutePath);
        continue;
      }
      if (!entry.name.endsWith(".astro")) continue;
      files.push(absolutePath);
    }
  }
  return files.sort();
}

function getLineNumber(source, index) {
  return source.slice(0, index).split("\n").length;
}

const files = listSourceFiles(CALCULADORAS_DIR);
const violations = [];

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const relativePath = path.relative(REPO_ROOT, file).replace(/\\/g, "/");

  for (const rule of RULES) {
    const matches = source.matchAll(rule.regex);
    for (const match of matches) {
      const index = match.index ?? 0;
      violations.push({
        file: relativePath,
        line: getLineNumber(source, index),
        rule: rule.id,
        message: rule.message,
      });
    }
  }
}

if (violations.length > 0) {
  console.error(
    `[check-no-inline-clp-formatters] Found ${violations.length} forbidden pattern(s):`
  );
  for (const violation of violations) {
    console.error(
      `- ${violation.file}:${violation.line} [${violation.rule}] ${violation.message}`
    );
  }
  process.exit(1);
}

console.log(
  `[check-no-inline-clp-formatters] OK. Scanned ${files.length} calculator files, no inline CLP formatters found.`
);
