// check:audit-artifacts
//
// Fase 2 del protocolo de auditoría independiente por IA
// (docs/editorial/AI_AUDIT_PROTOCOL.md): valida el esquema de los artefactos
// `docs/editorial/audits/<scope>/02-result.json`.
//
// Estados válidos:
// - plantilla pendiente: verdict = null (aún sin ejecutar);
// - veredicto emitido: FAIL/CONDITIONAL/PASS con claims no vacíos;
//   FAIL/CONDITIONAL exigen al menos un defecto abierto.
//
// Exit 0 = artefactos válidos; exit 1 = esquema roto.

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VERDICTS = new Set(["FAIL", "CONDITIONAL", "PASS"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Issues de esquema de un artefacto de auditoría (vacío = válido). */
export function findAuditArtifactIssues(audit) {
  const issues = [];
  if (!isObject(audit)) return ["el artefacto no es un objeto JSON"];

  if (typeof audit.auditId !== "string" || !audit.auditId) {
    issues.push("auditId inválido");
  }
  if (
    typeof audit.protocolVersion !== "string" ||
    !audit.protocolVersion
  ) {
    issues.push("protocolVersion inválido");
  }
  if (!isObject(audit.scope)) issues.push("scope inválido");
  if (!isObject(audit.auditor)) issues.push("auditor inválido");
  if (!isObject(audit.method)) issues.push("method inválido");
  if (!Array.isArray(audit.claims)) issues.push("claims debe ser un array");
  if (!Array.isArray(audit.defects)) issues.push("defects debe ser un array");

  if (audit.verdict !== null && !VERDICTS.has(audit.verdict)) {
    issues.push(`verdict inválido: ${String(audit.verdict)}`);
  }

  if (audit.humanSignoff !== null && audit.humanSignoff !== undefined) {
    if (!isObject(audit.humanSignoff)) {
      issues.push("humanSignoff inválido");
    } else {
      if (!ISO_DATE.test(String(audit.humanSignoff.date ?? ""))) {
        issues.push("humanSignoff.date inválido");
      }
      if (
        typeof audit.humanSignoff.reviewer !== "string" ||
        !audit.humanSignoff.reviewer
      ) {
        issues.push("humanSignoff.reviewer inválido");
      }
    }
  }

  if (audit.verdict) {
    if (!Array.isArray(audit.claims) || audit.claims.length === 0) {
      issues.push(`verdict ${audit.verdict} sin claims verificados`);
    }
    if (audit.verdict !== "PASS" && Array.isArray(audit.defects)) {
      const open = audit.defects.filter(
        defect => isObject(defect) && defect.status === "open"
      );
      if (open.length === 0) {
        issues.push(`verdict ${audit.verdict} sin defectos abiertos`);
      }
    }
  }

  return issues;
}

/** Rutas de los `02-result.json` declarados bajo docs/editorial/audits/. */
export function listAuditArtifacts(root) {
  const base = path.join(root, "docs/editorial/audits");
  if (!statSync(base, { throwIfNoEntry: false })) return [];
  const out = [];
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(base, entry.name, "02-result.json");
    if (statSync(file, { throwIfNoEntry: false })) out.push(file);
  }
  return out.sort();
}

function main() {
  const root = process.cwd();
  const artifacts = listAuditArtifacts(root);
  let failures = 0;

  for (const file of artifacts) {
    const rel = path.relative(root, file).replace(/\\/g, "/");
    let audit;
    try {
      audit = JSON.parse(readFileSync(file, "utf8"));
    } catch (error) {
      failures += 1;
      console.error(`[check-audit-artifacts] FAIL ${rel}: ${error.message}`);
      continue;
    }
    const issues = findAuditArtifactIssues(audit);
    if (issues.length > 0) {
      failures += 1;
      console.error(`[check-audit-artifacts] FAIL ${rel}:`);
      for (const issue of issues) console.error(`  - ${issue}`);
    } else {
      console.log(
        `[check-audit-artifacts] OK ${rel} (verdict=${String(audit.verdict)})`
      );
    }
  }

  if (failures > 0) {
    console.error(`[check-audit-artifacts] ${failures} artefacto(s) con issues.`);
    process.exit(1);
  }
  console.log(
    `[check-audit-artifacts] ${artifacts.length} artefacto(s) válidos.`
  );
  process.exit(0);
}

const __filename = fileURLToPath(import.meta.url);
const isDirectRun =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectRun) {
  main();
}
