// check-pnpm-release-age-excludes
//
// Toda entrada de `minimumReleaseAgeExclude` (pnpm-workspace.yaml) debe
// corresponder a una versión presente en `packages:` de pnpm-lock.yaml. Las
// entradas muertas no eximen nada y pudren la señal de la política de 7 días:
// no se distingue una excepción load-bearing de un cadáver (TD-0104).
//
// Uso: node scripts/check-pnpm-release-age-excludes.mjs
// Exit 0 = todas las excepciones están vivas; exit 1 = lista de muertas.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as internalSafeLoad, JSON_SCHEMA } from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(
  process.env.PNPM_RELEASE_AGE_ROOT || path.resolve(__dirname, "..")
);
const WORKSPACE_PATH = path.join(REPO_ROOT, "pnpm-workspace.yaml");
const LOCKFILE_PATH = path.join(REPO_ROOT, "pnpm-lock.yaml");

export function collectReleaseAgeExcludes(workspaceText) {
  const workspace = internalSafeLoad(workspaceText, { schema: JSON_SCHEMA });
  const excludes = workspace?.minimumReleaseAgeExclude;
  return Array.isArray(excludes) ? excludes.map(entry => String(entry)) : [];
}

export function collectLockfilePackageSpecs(lockfileText) {
  const lockfile = internalSafeLoad(lockfileText, { schema: JSON_SCHEMA });
  return new Set(Object.keys(lockfile?.packages ?? {}));
}

/**
 * Una entrada es viva si `name@version` existe en el lockfile; una entrada sin
 * versión (nombre pelado) es viva si existe alguna versión de ese paquete.
 */
export function findDeadReleaseAgeExcludes(excludes, lockfileSpecs) {
  return excludes.filter(entry => {
    if (entry.includes("@", 1)) return !lockfileSpecs.has(entry);
    return ![...lockfileSpecs].some(spec => spec.startsWith(`${entry}@`));
  });
}

function main() {
  const excludes = collectReleaseAgeExcludes(
    readFileSync(WORKSPACE_PATH, "utf8")
  );
  const specs = collectLockfilePackageSpecs(readFileSync(LOCKFILE_PATH, "utf8"));
  const dead = findDeadReleaseAgeExcludes(excludes, specs);

  console.log(
    `[check-pnpm-release-age-excludes] excludes=${excludes.length} dead=${dead.length}`
  );

  if (dead.length > 0) {
    console.error(
      "[check-pnpm-release-age-excludes] FAIL: entradas muertas (no están en pnpm-lock.yaml):"
    );
    for (const entry of dead) {
      console.error(`- ${entry}`);
    }
    console.error(
      "Remuévelas o actualiza la versión a la vigente del lockfile (TD-0104)."
    );
    process.exit(1);
  }

  console.log("[check-pnpm-release-age-excludes] OK.");
}

const isDirectRun =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectRun) {
  main();
}
