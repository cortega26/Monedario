import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  INTERNAL_EDITORIAL_VISIBLE_RULES,
  shouldSkipRuleForPath,
} from "./editorial-copy-rules.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(
  process.env.SMALL_DETAILS_CHECK_ROOT || DEFAULT_ROOT
);
const ENFORCE = process.env.SMALL_DETAILS_ENFORCE === "1";
const OUTPUT_DIR = path.join(REPO_ROOT, "output", "validation", "small-details");
const REPORT_PATH = path.join(OUTPUT_DIR, "report.json");

const CALCULATOR_REQUIRED_SURFACES = [
  {
    id: "calculator-trust-badge",
    asd: "ASD-101",
    token: "CalculatorTrustBadge",
    remediation:
      "Add the shared calculator trust badge near the calculator header.",
  },
  {
    id: "calculator-share-result",
    asd: "ASD-104",
    token: "ShareCalculatorResult",
    remediation:
      "Add the shared result-sharing surface or document why this calculator cannot be shared.",
  },
  {
    id: "calculator-methodology",
    asd: "ASD-102",
    token: "MethodologyBlock",
    remediation:
      "Add a MethodologyBlock with formulas, assumptions, and source labels.",
  },
];

function toRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).replace(/\\/g, "/");
}

function listFilesRecursively(baseDir, allowedExtensions) {
  const files = [];
  let entries;

  try {
    entries = readdirSync(baseDir, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    const absolutePath = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursively(absolutePath, allowedExtensions));
      continue;
    }

    if (!allowedExtensions.has(path.extname(entry.name).toLowerCase())) {
      continue;
    }

    files.push(absolutePath);
  }

  return files.sort();
}

function lineForIndex(source, index) {
  return source.slice(0, index).split("\n").length;
}

function collectIdOccurrences(source) {
  const ids = [];
  const re = /<([a-z][\w:-]*)\b[^>]*\bid="([^"]+)"/g;
  let match;

  while ((match = re.exec(source)) !== null) {
    ids.push({
      id: match[2],
      line: lineForIndex(source, match.index),
    });
  }

  return ids;
}

function collectGetElementByIdSelectors(source) {
  const selectors = [];
  const re = /document\.getElementById\(\s*["']([^"']+)["']\s*\)/g;
  let match;

  while ((match = re.exec(source)) !== null) {
    selectors.push({
      id: match[1],
      line: lineForIndex(source, match.index),
    });
  }

  return selectors;
}

function createFinding({
  severity = "error",
  asd,
  file,
  line,
  rule,
  message,
  remediation,
}) {
  return {
    severity,
    asd,
    file,
    line,
    rule,
    message,
    remediation,
  };
}

function collectCalculatorFiles() {
  const calculatorsDir = path.join(REPO_ROOT, "src", "pages", "calculadoras");
  return listFilesRecursively(calculatorsDir, new Set([".astro"])).filter(
    filePath => path.basename(filePath) !== "index.astro"
  );
}

function checkCalculatorTrustSurfaces(filePath, source) {
  const findings = [];
  const relative = toRelative(filePath);

  for (const surface of CALCULATOR_REQUIRED_SURFACES) {
    if (source.includes(surface.token)) continue;

    findings.push(
      createFinding({
        asd: surface.asd,
        file: relative,
        line: 1,
        rule: surface.id,
        message: `Calculator page is missing ${surface.token}.`,
        remediation: surface.remediation,
      })
    );
  }

  return findings;
}

function checkCalculatorErrorWiring(filePath, source) {
  const findings = [];
  const relative = toRelative(filePath);
  const idOccurrences = collectIdOccurrences(source);
  const selectors = collectGetElementByIdSelectors(source);
  const ids = new Set(idOccurrences.map(entry => entry.id));
  const duplicateIds = new Map();

  for (const entry of idOccurrences) {
    const existing = duplicateIds.get(entry.id) || [];
    existing.push(entry.line);
    duplicateIds.set(entry.id, existing);
  }

  for (const [id, lines] of duplicateIds.entries()) {
    if (lines.length < 2) continue;
    findings.push(
      createFinding({
        asd: "ASD-101",
        file: relative,
        line: lines[0],
        rule: "duplicate-dom-id",
        message: `Duplicate DOM id "${id}" found on lines ${lines.join(", ")}.`,
        remediation:
          "Use one unique id per page so validation messages and labels target the intended element.",
      })
    );
  }

  const errorIds = idOccurrences.filter(entry => /error/i.test(entry.id));
  const selectorIds = new Set(selectors.map(entry => entry.id));

  for (const entry of errorIds) {
    if (selectorIds.has(entry.id)) continue;
    findings.push(
      createFinding({
        severity: "warn",
        asd: "ASD-101",
        file: relative,
        line: entry.line,
        rule: "error-node-without-selector",
        message: `Error container "${entry.id}" is not referenced by document.getElementById.`,
        remediation:
          "Confirm this is static copy; otherwise wire validation copy to the visible error container.",
      })
    );
  }

  for (const selector of selectors) {
    if (!/error/i.test(selector.id)) continue;
    if (ids.has(selector.id)) continue;
    findings.push(
      createFinding({
        asd: "ASD-101",
        file: relative,
        line: selector.line,
        rule: "missing-error-target",
        message: `document.getElementById("${selector.id}") has no matching error container.`,
        remediation:
          "Align the validation selector with the rendered error container id.",
      })
    );
  }

  return findings;
}

function collectReaderFacingFiles() {
  const blogDir = path.join(REPO_ROOT, "src", "data", "blog");
  const pagesDir = path.join(REPO_ROOT, "src", "pages");
  const calculatorsDir = path.join(pagesDir, "calculadoras");
  const blogFiles = listFilesRecursively(blogDir, new Set([".md", ".mdx"]));
  const pageFiles = listFilesRecursively(pagesDir, new Set([".astro"])).filter(
    filePath => !filePath.startsWith(calculatorsDir + path.sep)
  );

  return [...blogFiles, ...pageFiles].sort();
}

function checkReaderFacingCopyWarnings() {
  const findings = [];
  const files = collectReaderFacingFiles();

  for (const filePath of files) {
    const relative = toRelative(filePath);
    const source = readFileSync(filePath, "utf8");

    for (const rule of INTERNAL_EDITORIAL_VISIBLE_RULES) {
      if (rule.severity !== "warn") continue;
      if (shouldSkipRuleForPath(rule, relative)) continue;

      const re = new RegExp(rule.regex.source, rule.regex.flags);
      let match;
      while ((match = re.exec(source)) !== null) {
        findings.push(
          createFinding({
            severity: "warn",
            asd: "ASD-004",
            file: relative,
            line: lineForIndex(source, match.index),
            rule: rule.id,
            message: `${rule.reason}: ${match[0].trim()}`,
            remediation:
              "Review whether implementation vocabulary belongs in reader-facing copy.",
          })
        );
      }
    }
  }

  return findings;
}

function readExternalUrlSummary() {
  const summaryPath = path.join(
    REPO_ROOT,
    "output",
    "validation",
    "urlcheck",
    "external-summary.json"
  );

  try {
    return JSON.parse(readFileSync(summaryPath, "utf8"));
  } catch {
    return null;
  }
}

function checkExternalUrlSummary() {
  const summary = readExternalUrlSummary();
  if (!summary) {
    return [
      createFinding({
        severity: "warn",
        asd: "ASD-002",
        file: "output/validation/urlcheck/external-summary.json",
        line: 1,
        rule: "external-url-summary-missing",
        message:
          "External URL audit summary is missing; run pnpm run check:urls:external:audit before trust-detail triage.",
        remediation:
          "Generate the external URL audit artifact before closing ASD source-trust work.",
      }),
    ];
  }

  if (Number(summary.blockingFailures || 0) > 0) {
    return [
      createFinding({
        asd: "ASD-002",
        file: "output/validation/urlcheck/external-summary.json",
        line: 1,
        rule: "external-url-blocking-failures",
        message: `External URL audit has ${summary.blockingFailures} blocking failure(s).`,
        remediation:
          "Resolve blocking source URL failures before closing source-trust remediation.",
      }),
    ];
  }

  if (Number(summary.totalNonOk || 0) > 0) {
    return [
      createFinding({
        severity: "warn",
        asd: "ASD-403",
        file: "output/validation/urlcheck/external-summary.json",
        line: 1,
        rule: "external-url-non-ok-budget",
        message: `External URL audit has ${summary.totalNonOk} non-OK non-blocking finding(s).`,
        remediation:
          "Triage the warning budget before promoting external URL findings to blocking checks.",
      }),
    ];
  }

  return [];
}

function runSmallDetailsCheck() {
  const calculatorFiles = collectCalculatorFiles();
  const findings = [];

  for (const filePath of calculatorFiles) {
    const source = readFileSync(filePath, "utf8");
    findings.push(...checkCalculatorTrustSurfaces(filePath, source));
    findings.push(...checkCalculatorErrorWiring(filePath, source));
  }

  findings.push(...checkReaderFacingCopyWarnings());
  findings.push(...checkExternalUrlSummary());

  const errors = findings.filter(finding => finding.severity === "error");
  const warnings = findings.filter(finding => finding.severity === "warn");
  const blockingErrors = ENFORCE ? errors : [];
  const report = {
    generatedAt: new Date().toISOString(),
    mode: ENFORCE ? "enforce" : "warn-only",
    root: REPO_ROOT,
    calculatorPages: calculatorFiles.length,
    errors: errors.length,
    warnings: warnings.length,
    blockingErrors: blockingErrors.length,
    findings,
  };

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n", "utf8");

  console.log(
    `[check-small-details] mode=${report.mode} calculator_pages=${calculatorFiles.length} errors=${errors.length} warnings=${warnings.length} blocking=${blockingErrors.length}`
  );
  console.log(`[check-small-details] report=${toRelative(REPORT_PATH)}`);

  for (const finding of errors) {
    console.log(
      `[check-small-details] ERROR ${finding.file}:${finding.line} ${finding.asd}/${finding.rule} - ${finding.message}`
    );
    console.log(`  remediation: ${finding.remediation}`);
  }

  for (const finding of warnings) {
    console.log(
      `[check-small-details] WARN ${finding.file}:${finding.line} ${finding.asd}/${finding.rule} - ${finding.message}`
    );
  }

  if (!ENFORCE && errors.length > 0) {
    console.log(
      "[check-small-details] WARN: Gate in warn-only mode. Set SMALL_DETAILS_ENFORCE=1 to fail on errors."
    );
  }

  return { report, errors, warnings, blockingErrors };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { blockingErrors } = runSmallDetailsCheck();
  if (blockingErrors.length > 0) {
    process.exitCode = 1;
  }
}

export {
  checkCalculatorErrorWiring,
  checkCalculatorTrustSurfaces,
  runSmallDetailsCheck,
};
