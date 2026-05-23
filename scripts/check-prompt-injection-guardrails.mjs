import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(process.env.PROMPT_GUARDRAILS_ROOT ?? path.join(__dirname, ".."));

const CHECKS = [
  {
    file: "context/EDITORIAL_AI_PIPELINE.md",
    rule: "PIPELINE.PROMPT_INJECTION_DEFENSE",
    remediation:
      "Add the Prompt Injection Defense section declaring external and benchmark material as untrusted source content.",
    required: [
      "## 6A. Prompt Injection Defense",
      "untrusted source content",
      "PROMPT_INJECTION_CANDIDATE",
      "System/developer instructions and repository authority order",
      "role, scope, output format, tools, gates, citations, or publication decisions",
    ],
  },
  {
    file: "context/EDITORIAL_AI_PIPELINE.md",
    rule: "PIPELINE.ROLE_PROMPTS_UNTRUSTED_SOURCE_CONTENT",
    remediation:
      "Add the shared instruction hierarchy and untrusted-source warning to Stage 02, 04, 05, and 06 playbook prompts.",
    required: [
      "Stage 02",
      "Stage 04",
      "Stage 05",
      "Stage 06",
      "system/repo policy > task brief > pipeline role prompt > trusted artifact metadata > untrusted source content",
      "Source Trust / Prompt Injection Notes",
    ],
  },
  {
    file: "context/CONTRACTS.md",
    rule: "CONTRACTS.SOURCE_TRUST_NOTES",
    remediation:
      "Update CONTRACT.EDITORIAL.DOSSIER and CONTRACT.EDITORIAL.PUBLISH_PACKET with prompt-injection review requirements.",
    required: [
      "CONTRACT.EDITORIAL.DOSSIER",
      "CONTRACT.EDITORIAL.PUBLISH_PACKET",
      "Source Trust / Prompt Injection Notes",
      "PROMPT_INJECTION_CANDIDATE",
      "prompt-injection review was completed before publication decision",
    ],
  },
  {
    file: "scripts/scaffold-editorial-artifacts.mjs",
    rule: "SCAFFOLD.SOURCE_TRUST_TEMPLATE",
    remediation:
      "Update scaffold templates so new dossier, audit, compliance, and publish-packet artifacts include prompt-injection guardrails.",
    required: [
      "## Source Trust / Prompt Injection Notes",
      "untrusted source content",
      "PROMPT_INJECTION_CANDIDATE",
      "Prompt-injection review completo",
      "source-borne instructions were not followed",
    ],
  },
];

function readRequiredFile(relativePath) {
  const absolutePath = path.join(REPO_ROOT, relativePath);
  if (!existsSync(absolutePath)) {
    return {
      ok: false,
      content: "",
      issue: `${relativePath}: GUARDRAIL.FILE_MISSING: required file does not exist. Remediation: restore the file or update check-prompt-injection-guardrails.mjs if the canonical path changed.`,
    };
  }

  return {
    ok: true,
    content: readFileSync(absolutePath, "utf8"),
    issue: "",
  };
}

function evaluateCheck(check) {
  const file = readRequiredFile(check.file);
  if (!file.ok) return [file.issue];

  const issues = [];
  for (const phrase of check.required) {
    if (file.content.includes(phrase)) continue;
    issues.push(
      `${check.file}: ${check.rule}: missing required guardrail text "${phrase}". Remediation: ${check.remediation}`
    );
  }
  return issues;
}

const issues = CHECKS.flatMap(evaluateCheck);

if (issues.length > 0) {
  console.error("[check-prompt-injection-guardrails] FAIL:");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log(
  `[check-prompt-injection-guardrails] OK: ${CHECKS.length} guardrail group(s) validated.`
);
