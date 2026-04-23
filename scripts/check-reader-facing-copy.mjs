import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(REPO_ROOT, "src", "data", "blog");
const PAGES_DIR = path.join(REPO_ROOT, "src", "pages");
const CALCULATORS_DIR = path.join(PAGES_DIR, "calculadoras");

const EDITORIAL_SCOPE = normalizeToken(process.env.EDITORIAL_SCOPE || "all");
const EDITORIAL_DIFF_BASE_REF = String(process.env.EDITORIAL_DIFF_BASE_REF ?? "").trim();
const FAQ_MAX_ITEMS = 5;
const TRAILING_INLINE_ADVISORY_MAX_LENGTH = 280;
const TRAILING_INLINE_ADVISORY_PATTERNS = [
  /\bno reemplaza\b/i,
  /\bno sustituye\b/i,
  /\bcontenido educativo\b/i,
  /\bcontenido informativo\b/i,
  /\bverifica siempre\b/i,
  /\bfecha de corte\b/i,
  /\bultima actualizaci[oó]n\b/i,
  /\bvigencia\b/i,
];

const BLOCKING_PATTERNS = [
  {
    id: "meta-prompt",
    reason: "Internal prompt wording leaked to reader-facing copy",
    regex: /\bprompt(?:s)?\b/gi,
  },
  {
    id: "meta-pipeline",
    reason: "Internal pipeline wording leaked to reader-facing copy",
    regex: /\bpipeline\b/gi,
  },
  {
    id: "meta-gatilla-actualizacion",
    reason: "Internal maintenance wording leaked to reader-facing copy",
    regex: /\bgatilla actualizaci[oó]n\b/gi,
  },
  {
    id: "meta-fuentes-declaradas",
    reason: "Internal methodology wording leaked to reader-facing copy",
    regex: /\bfuentes base declaradas por el ejercicio\b/gi,
  },
];

function normalizeToken(value) {
  return String(value ?? "").trim().toLowerCase();
}

function runGit(args) {
  try {
    return execFileSync("git", args, {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function listFilesRecursively(baseDir, allowedExtensions) {
  const files = [];
  const stack = [baseDir];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(absolutePath);
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();
      if (!allowedExtensions.has(ext)) continue;
      files.push(absolutePath);
    }
  }

  return files.sort();
}

function collectTargetFiles() {
  const blogFiles = listFilesRecursively(BLOG_DIR, new Set([".md", ".mdx"]));
  const pageFiles = listFilesRecursively(PAGES_DIR, new Set([".astro"])).filter(
    filePath => !filePath.startsWith(CALCULATORS_DIR + path.sep)
  );
  const allTargets = [...blogFiles, ...pageFiles];

  if (EDITORIAL_SCOPE !== "changed") {
    return {
      scope: "all",
      diffRange: "",
      files: allTargets,
    };
  }

  const candidateRanges = [];
  if (EDITORIAL_DIFF_BASE_REF) {
    candidateRanges.push(`origin/${EDITORIAL_DIFF_BASE_REF}...HEAD`);
    candidateRanges.push(`${EDITORIAL_DIFF_BASE_REF}...HEAD`);
  }
  candidateRanges.push("HEAD^1...HEAD");
  candidateRanges.push("HEAD^...HEAD");

  for (const diffRange of candidateRanges) {
    const output = runGit([
      "diff",
      "--name-only",
      "--diff-filter=ACMR",
      diffRange,
      "--",
      "src/data/blog",
      "src/pages",
    ]);
    if (output === null) continue;

    const changed = new Set(
      output
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
    );

    const files = allTargets.filter(filePath => {
      const relative = path.relative(REPO_ROOT, filePath).replace(/\\/g, "/");
      return changed.has(relative);
    });

    return { scope: "changed", diffRange, files };
  }

  return { scope: "all", diffRange: "", files: allTargets };
}

function findPatternMatches(source, rule) {
  const findings = [];
  const re = new RegExp(rule.regex.source, rule.regex.flags);
  let match;

  while ((match = re.exec(source)) !== null) {
    const line = source.slice(0, match.index).split("\n").length;
    findings.push({
      id: rule.id,
      line,
      reason: rule.reason,
      snippet: match[0].trim(),
    });
  }

  return findings;
}

function countFaqItems(body) {
  const sectionMatch = body.match(
    /##\s+Preguntas frecuentes[^\n]*\n([\s\S]*?)(?=\n##\s+|\n---\n|$)/i
  );
  if (!sectionMatch?.[1]) return 0;
  const section = sectionMatch[1];
  return (section.match(/<details>/gi) ?? []).length;
}

function splitFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { body: source };
  return { body: source.slice(match[0].length) };
}

function normalizeTrailingBlock(block) {
  return block
    .replace(/^>\s?/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getTrailingContentBlock(body) {
  const blocks = body
    .trimEnd()
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) return null;

  return blocks[blocks.length - 1];
}

function isStandaloneTrailingAdvisoryBlock(block) {
  if (!block) return false;
  if (/^(?:#{1,6}\s|[-*]\s|\d+\.\s|```|~~~|\|)/m.test(block)) {
    return false;
  }

  const normalized = normalizeTrailingBlock(block);
  if (!normalized || normalized.length > TRAILING_INLINE_ADVISORY_MAX_LENGTH) {
    return false;
  }

  return TRAILING_INLINE_ADVISORY_PATTERNS.some(pattern =>
    pattern.test(normalized)
  );
}

const target = collectTargetFiles();
const issues = [];

for (const filePath of target.files) {
  const relative = path.relative(REPO_ROOT, filePath).replace(/\\/g, "/");
  const source = readFileSync(filePath, "utf8");

  for (const rule of BLOCKING_PATTERNS) {
    const matches = findPatternMatches(source, rule);
    for (const finding of matches) {
      issues.push({
        file: relative,
        line: finding.line,
        id: finding.id,
        reason: finding.reason,
        snippet: finding.snippet,
      });
    }
  }

  if (/^src\/data\/blog\/.+\.(md|mdx)$/i.test(relative)) {
    const { body } = splitFrontmatter(source);
    const faqItems = countFaqItems(body);
    if (faqItems > FAQ_MAX_ITEMS) {
      issues.push({
        file: relative,
        line: 1,
        id: "faq-too-long",
        reason: `FAQ section exceeds max ${FAQ_MAX_ITEMS} items`,
        snippet: `<details> count: ${faqItems}`,
      });
    }

    const trailingBlock = getTrailingContentBlock(body);
    if (isStandaloneTrailingAdvisoryBlock(trailingBlock)) {
      issues.push({
        file: relative,
        line: body.split("\n").length,
        id: "inline-closing-advisory",
        reason:
          "Inline closing advisory detected in article body; move it to frontmatter articleAdvisory or the shared fallback.",
        snippet: normalizeTrailingBlock(trailingBlock).slice(0, 140),
      });
    }
  }
}

console.log(
  `[check-reader-facing-copy] scope=${target.scope} diff="${target.diffRange || "-"}" scanned=${target.files.length} issues=${issues.length}`
);

if (issues.length > 0) {
  console.error("[check-reader-facing-copy] FAIL. Blocking reader-facing copy issues:");
  for (const issue of issues) {
    console.error(
      `- ${issue.file}:${issue.line} [${issue.id}] ${issue.reason} -> ${issue.snippet}`
    );
  }
  process.exit(1);
}

console.log("[check-reader-facing-copy] OK. No blocking issues found.");
