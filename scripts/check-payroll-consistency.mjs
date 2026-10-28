#!/usr/bin/env node
/**
 * check-payroll-consistency.mjs
 *
 * Fase 3 de `ADR-20261027-payroll-rules-single-source`: verifica que las cifras
 * que la prosa publica coincidan con el registro que las gobierna.
 *
 * ── Cobertura (deliberadamente parcial) ─────────────────────────────────────
 *
 * CUBRE: comisiones de AFP declaradas junto al nombre de la administradora,
 * contrastadas contra `src/config/afpCommissions.ts` (que a su vez se valida
 * contra Previred en `check:afp-commissions`).
 *
 * NO CUBRE, y por qué:
 *   - SIS: el cluster usa 1,49% (boletas/SII), 1,78% (dependientes e
 *     independientes/voluntarios desde agosto de 2026) y 2,5% (componente CEV
 *     del empleador desde agosto de 2026). Son **conceptos distintos por
 *     régimen**, no un único número. Un registro plano de "SIS" crearía un
 *     nuevo error de fuente única; requiere modelar régimen y período.
 *   - Ventana de cambio de AFP: la regla distingue primer cambio, cambios
 *     posteriores y traspaso por licitación. Un `months` plano sería incorrecto.
 *   - Bases y topes en prosa (D13, D14): dependen del motor, no de una tabla.
 *
 * Esta declaración existe para que nadie asuma que un exit 0 significa "todo
 * el clúster es correcto". Significa: las comisiones de AFP son coherentes.
 *
 * ── Uso ─────────────────────────────────────────────────────────────────────
 *
 *   node scripts/check-payroll-consistency.mjs
 *
 * Exit 0 = sin discrepancias en la cobertura declarada. Exit 1 = discrepancia.
 *
 * Estado: en `check:ci` desde la fase 4 (2026-10-28).
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const CONTENT_DIRS = ["src/data/blog", "src/data/glossary", "src/data/laws"];

const AFP_ENTRY_RE =
  /\{\s*name:\s*"([^"]+)",\s*commission:\s*([\d.]+),\s*total:\s*([\d.]+)\s*\}/g;

/** Lee el registro de comisiones desde `afpCommissions.ts`. */
export function loadAfpRegistry(root = ROOT) {
  const content = readFileSync(
    resolve(root, "src/config/afpCommissions.ts"),
    "utf8"
  );
  const registry = new Map();
  let match;
  while ((match = AFP_ENTRY_RE.exec(content)) !== null) {
    registry.set(match[1], {
      commission: parseFloat(match[2]),
      total: parseFloat(match[3]),
    });
  }
  if (registry.size === 0) {
    throw new Error("No se pudo leer afpCommissions.ts");
  }
  return registry;
}

function toNumber(raw) {
  return parseFloat(raw.replace(",", "."));
}

/**
 * Extrae afirmaciones de comisión de AFP asociadas a una administradora.
 *
 * Solo considera un porcentaje si el nombre de la AFP aparece a <= 90
 * caracteres de la palabra "comisión" o "total AFP". Un rango sin nombre
 * ("varía entre 0,46% y 1,45%") no se atribuye a nadie y no se evalúa.
 *
 * @returns {Array<{afp: string, kind: "commission"|"total", value: number, excerpt: string}>}
 */
export function extractAfpClaims(text, names = [...loadAfpRegistry().keys()]) {
  const claims = [];

  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const commissionRe = new RegExp(
      `${escaped}[^.\\n]{0,90}?comisi[oó]n\\s*(?:de\\s*)?(?:aprox\\.?\\s*)?([0-9]{1,2}[.,][0-9]{1,2})\\s*%`,
      "gi"
    );
    const totalRe = new RegExp(
      `${escaped}[^.\\n]{0,90}?total\\s+AFP\\s*(?:de\\s*)?([0-9]{1,2}[.,][0-9]{1,2})\\s*%`,
      "gi"
    );

    for (const re of [
      [commissionRe, "commission"],
      [totalRe, "total"],
    ]) {
      const [pattern, kind] = re;
      let m;
      while ((m = pattern.exec(text)) !== null) {
        claims.push({
          afp: name,
          kind,
          value: toNumber(m[1]),
          excerpt: m[0].replace(/\s+/g, " ").trim(),
        });
      }
    }
  }

  return claims;
}

/** Compara las afirmaciones contra el registro y devuelve discrepancias. */
export function findMismatches(text, registry = loadAfpRegistry()) {
  const problems = [];
  for (const claim of extractAfpClaims(text)) {
    const entry = registry.get(claim.afp);
    if (!entry) continue;
    const expected =
      claim.kind === "commission" ? entry.commission : entry.total;
    if (Math.abs(claim.value - expected) > 0.005) {
      problems.push({ ...claim, expected });
    }
  }
  return problems;
}

function filesToScan(root = ROOT) {
  const files = [];
  for (const dir of CONTENT_DIRS) {
    const abs = resolve(root, dir);
    let entries = [];
    try {
      entries = readdirSync(abs);
    } catch {
      continue;
    }
    for (const file of entries) {
      if (file.endsWith(".md")) files.push(join(abs, file));
    }
  }
  return files;
}

function main() {
  const registry = loadAfpRegistry();
  const files = filesToScan();
  const problems = [];

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const problem of findMismatches(text, registry)) {
      problems.push({ file: file.replace(`${ROOT}/`, ""), ...problem });
    }
  }

  console.log(
    `[payroll-consistency] ${files.length} archivos, ${registry.size} AFP en el registro`
  );

  if (problems.length === 0) {
    console.log(
      "[payroll-consistency] OK. Comisiones de AFP coherentes con el registro."
    );
    console.log(
      "[payroll-consistency] Cobertura: solo comisiones de AFP. SIS y ventana de cambio de AFP no están cubiertos (ver cabecera)."
    );
    return;
  }

  console.error(
    `[payroll-consistency] FAIL: ${problems.length} afirmación(es) no coinciden con el registro:`
  );
  for (const p of problems) {
    console.error(
      `  - ${p.file}: ${p.afp} ${p.kind} publicada ${p.value}% vs registro ${p.expected}%`
    );
    console.error(`    "${p.excerpt}"`);
  }
  process.exit(1);
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main();
}
