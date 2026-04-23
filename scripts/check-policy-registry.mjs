#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

const DEFAULT_REPORT_PATH = path.join(
  REPO_ROOT,
  "output/validation/policy-registry/report.json"
);

const REQUIRED_FILES = {
  registry: "docs/operations/POLICY_REGISTRY.json",
  gateManifest: "docs/operations/GATE_MANIFEST.json",
  taskIndex: "docs/operations/AGENT_TASK_INDEX.md",
  preflight: "context/AGENT_PREFLIGHT.md",
  entrypointsJson: "context/AGENT_ENTRYPOINTS.json",
  entrypointsMd: "context/AGENT_ENTRYPOINTS.md",
  packageJson: "package.json",
  startHere: "START_HERE.md",
};

const VALID_MODES = new Set(["advisory", "warn", "block"]);

function parseArgs(argv) {
  const options = {
    reportPath: DEFAULT_REPORT_PATH,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--report") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("Missing value for --report");
      }
      options.reportPath = path.isAbsolute(value)
        ? value
        : path.resolve(REPO_ROOT, value);
      index += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      printUsage(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printUsage(code) {
  console.log(`Usage:
  node scripts/check-policy-registry.mjs [--report <path>]
`);
  process.exit(code);
}

function ensureParentDir(filePath) {
  mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJson(relativePath) {
  const absolutePath = path.resolve(REPO_ROOT, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing required JSON file: ${relativePath}`);
  }
  return JSON.parse(readFileSync(absolutePath, "utf8"));
}

function readText(relativePath) {
  const absolutePath = path.resolve(REPO_ROOT, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing required text file: ${relativePath}`);
  }
  return readFileSync(absolutePath, "utf8");
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => String(item ?? "").trim())
    .filter(Boolean);
}

function extractPnpmScript(command) {
  const match = /^pnpm run ([a-z0-9:-]+)$/i.exec(String(command ?? "").trim());
  return match ? match[1] : null;
}

function textContainsCommand(text, command) {
  const normalizedText = String(text ?? "");
  const normalizedCommand = String(command ?? "").trim();
  if (!normalizedCommand) {
    return false;
  }

  const shortCommand = normalizedCommand.replace(/^pnpm run\s+/i, "");
  return (
    normalizedText.includes(normalizedCommand) ||
    normalizedText.includes(`\`${normalizedCommand}\``) ||
    normalizedText.includes(shortCommand) ||
    normalizedText.includes(`\`${shortCommand}\``)
  );
}

function push(collection, level, policyId, message, remediation) {
  collection.push({
    level,
    policyId,
    message,
    remediation,
  });
}

function assertFileExists(relativePath, policyId, remediation, failures) {
  if (!existsSync(path.resolve(REPO_ROOT, relativePath))) {
    push(
      failures,
      "error",
      policyId,
      `Referenced file does not exist: ${relativePath}`,
      remediation
    );
  }
}

function buildReportPathSummary(reportPath) {
  return path.relative(REPO_ROOT, reportPath) || reportPath;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const generatedAt = new Date().toISOString();
  const findings = [];

  for (const relativePath of Object.values(REQUIRED_FILES)) {
    if (!existsSync(path.resolve(REPO_ROOT, relativePath))) {
      push(
        findings,
        "error",
        "bootstrap",
        `Missing required registry dependency file: ${relativePath}`,
        "Restore the missing source-of-truth file before running check:policy-registry."
      );
    }
  }

  const registry = readJson(REQUIRED_FILES.registry);
  const gateManifest = readJson(REQUIRED_FILES.gateManifest);
  const entrypoints = readJson(REQUIRED_FILES.entrypointsJson);
  const packageJson = readJson(REQUIRED_FILES.packageJson);
  const taskIndex = readText(REQUIRED_FILES.taskIndex);
  const preflight = readText(REQUIRED_FILES.preflight);
  const entrypointsMd = readText(REQUIRED_FILES.entrypointsMd);
  const startHere = readText(REQUIRED_FILES.startHere);

  const policies = Array.isArray(registry.policies) ? registry.policies : [];
  const manifestGates = Array.isArray(gateManifest.gates) ? gateManifest.gates : [];
  const manifestGateById = new Map(manifestGates.map(gate => [gate.id, gate]));
  const packageScripts = packageJson.scripts ?? {};
  const entrypointList = Array.isArray(entrypoints.entrypoints) ? entrypoints.entrypoints : [];
  const entrypointIds = new Set(entrypointList.map(entrypoint => entrypoint.id));
  const seenPolicyIds = new Set();

  if (policies.length === 0) {
    push(
      findings,
      "error",
      "registry",
      "POLICY_REGISTRY.json does not define any policies.",
      "Add at least one policy entry to docs/operations/POLICY_REGISTRY.json."
    );
  }

  for (const policy of policies) {
    const policyId = String(policy.id ?? "").trim();
    const remediation =
      String(policy.remediation ?? "").trim() ||
      "Update docs/operations/POLICY_REGISTRY.json and its linked files together.";

    if (!policyId) {
      push(findings, "error", "*", "Policy entry is missing a non-empty id.", remediation);
      continue;
    }

    if (seenPolicyIds.has(policyId)) {
      push(findings, "error", policyId, "Duplicate policy id.", remediation);
      continue;
    }
    seenPolicyIds.add(policyId);

    const mode = String(policy.mode ?? "").trim();
    if (!VALID_MODES.has(mode)) {
      push(
        findings,
        "error",
        policyId,
        `Invalid mode '${mode}'. Expected one of advisory|warn|block.`,
        remediation
      );
    }

    if (!String(policy.owner ?? "").trim()) {
      push(findings, "error", policyId, "Policy is missing owner.", remediation);
    }

    for (const source of normalizeStringArray(policy.source_of_truth)) {
      assertFileExists(source, policyId, remediation, findings);
    }

    for (const filePath of normalizeStringArray(policy.workflow)) {
      assertFileExists(filePath, policyId, remediation, findings);
    }

    for (const filePath of normalizeStringArray(policy.docs)) {
      assertFileExists(filePath, policyId, remediation, findings);
    }

    const command = String(policy.command ?? "").trim();
    const packageScript = extractPnpmScript(command);
    if (packageScript && !(packageScript in packageScripts)) {
      push(
        findings,
        "error",
        policyId,
        `Command '${command}' references missing package.json script '${packageScript}'.`,
        remediation
      );
    }

    const manifestId = String(policy.gateManifestId ?? "").trim();
    if (manifestId) {
      const manifestGate = manifestGateById.get(manifestId);
      if (!manifestGate) {
        push(
          findings,
          "error",
          policyId,
          `gateManifestId '${manifestId}' was not found in docs/operations/GATE_MANIFEST.json.`,
          remediation
        );
      } else if (command && manifestGate.command !== command) {
        push(
          findings,
          "error",
          policyId,
          `Command mismatch vs GATE_MANIFEST. registry='${command}' manifest='${manifestGate.command}'.`,
          remediation
        );
      }
    }

    const sync = policy.sync ?? {};
    if (sync.agentTaskIndex && command && !textContainsCommand(taskIndex, command)) {
      push(
        findings,
        "error",
        policyId,
        `AGENT_TASK_INDEX is missing command '${command}'.`,
        remediation
      );
    }

    if (sync.agentPreflight && command && !textContainsCommand(preflight, command)) {
      push(
        findings,
        "error",
        policyId,
        `AGENT_PREFLIGHT is missing command '${command}'.`,
        remediation
      );
    }

    const requiredEntrypoints = normalizeStringArray(sync.entrypoints);
    for (const entrypointId of requiredEntrypoints) {
      if (!entrypointIds.has(entrypointId)) {
        push(
          findings,
          "error",
          policyId,
          `AGENT_ENTRYPOINTS.json is missing entrypoint '${entrypointId}'.`,
          remediation
        );
      }
      if (!entrypointsMd.includes(`\`${entrypointId}\``)) {
        push(
          findings,
          "error",
          policyId,
          `AGENT_ENTRYPOINTS.md is missing entrypoint marker '${entrypointId}'.`,
          remediation
        );
      }
    }
  }

  for (const gate of manifestGates) {
    if (!seenPolicyIds.has(gate.id)) {
      push(
        findings,
        "warning",
        gate.id,
        "Gate exists in GATE_MANIFEST but has no policy registry entry.",
        "Add a corresponding policy entry or intentionally document why the gate is excluded."
      );
    }
  }

  for (const entrypoint of entrypointList) {
    const entrypointId = String(entrypoint.id ?? "").trim();
    if (!entrypointId) {
      push(
        findings,
        "error",
        "entrypoints",
        "AGENT_ENTRYPOINTS.json contains an entry without id.",
        "Add a stable id to every entrypoint."
      );
      continue;
    }

    for (const readPath of normalizeStringArray(entrypoint.readFirst)) {
      assertFileExists(
        readPath,
        entrypointId,
        `Fix the readFirst list for entrypoint '${entrypointId}'.`,
        findings
      );
    }

    for (const gateCommand of normalizeStringArray(entrypoint.requiredGates)) {
      const packageScript = extractPnpmScript(gateCommand);
      if (packageScript && !(packageScript in packageScripts)) {
        push(
          findings,
          "error",
          entrypointId,
          `AGENT_ENTRYPOINTS references missing package script '${packageScript}'.`,
          `Fix requiredGates for entrypoint '${entrypointId}'.`
        );
      }
    }
  }

  if (!startHere.includes("context/AGENT_ENTRYPOINTS.md")) {
    push(
      findings,
      "error",
      "docs.entrypoints.consistency",
      "START_HERE.md must reference context/AGENT_ENTRYPOINTS.md.",
      "Add the canonical agent entrypoint map to START_HERE.md."
    );
  }

  const report = {
    generatedAt,
    status: findings.some(item => item.level === "error") ? "fail" : "ok",
    summary: {
      policyCount: policies.length,
      manifestGateCount: manifestGates.length,
      entrypointCount: entrypointList.length,
      errorCount: findings.filter(item => item.level === "error").length,
      warningCount: findings.filter(item => item.level === "warning").length,
    },
    findings,
  };

  ensureParentDir(options.reportPath);
  writeFileSync(options.reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`[check-policy-registry] Registry: ${REQUIRED_FILES.registry}`);
  console.log(`[check-policy-registry] Report: ${buildReportPathSummary(options.reportPath)}`);
  console.log(
    `[check-policy-registry] Policies=${report.summary.policyCount} ManifestGates=${report.summary.manifestGateCount} Entrypoints=${report.summary.entrypointCount}`
  );

  const warnings = findings.filter(item => item.level === "warning");
  if (warnings.length > 0) {
    console.warn(`[check-policy-registry] WARN: ${warnings.length} warning(s)`);
    for (const warning of warnings) {
      console.warn(`- ${warning.policyId}: ${warning.message}`);
    }
  }

  const errors = findings.filter(item => item.level === "error");
  if (errors.length > 0) {
    console.error(`[check-policy-registry] FAIL: ${errors.length} error(s)`);
    for (const error of errors) {
      console.error(`- ${error.policyId}: ${error.message}`);
      if (error.remediation) {
        console.error(`  Remediation: ${error.remediation}`);
      }
    }
    process.exit(1);
  }

  console.log("[check-policy-registry] OK");
}

main().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[check-policy-registry] FAIL: ${message}`);
  process.exit(1);
});
