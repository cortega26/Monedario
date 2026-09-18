import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadApprovedExceptionUrls } from "./lib/url-freeze-exceptions.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
// Gate rutas derivadas de contenido — requiere excepción aprobada (mismo
// módulo de esquema: scripts/lib/url-freeze-exceptions.mjs).

function loadRoutes(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  return new Set(parsed.routes.map(entry => entry.route));
}

// BUGFIX (2026-09-17): `url-freeze-exceptions.json` almacena `url` como URL
// absoluta (contrato probado en tests/scripts/url-freeze-exceptions.test.ts,
// todos los fixtures usan "https://monedario.cl/..."), pero este gate compara
// contra `route` — el pathname relativo que produce snapshot-routes.mjs
// (p. ej. "/posts/slug/"). Antes de este fix, la comparación era un
// set-membership crudo entre una URL absoluta y una ruta relativa, que nunca
// podía calzar salvo que alguien guardara deliberadamente una ruta relativa
// en `url` (rompiendo el contrato que sí espera check-indexable-url-freeze.mjs,
// que llama `new URL(entry.url)` y revienta con rutas relativas). Nunca se
// detectó porque el registro de excepciones estuvo vacío hasta la primera
// excepción real (2026-09-17). Este gate ahora deriva el pathname de la URL
// absoluta para comparar como corresponde, sin cambiar el esquema compartido
// ni el contrato de `loadApprovedExceptionUrls` (que sigue devolviendo URLs
// absolutas, como esperan sus otros consumidores).
function loadApprovedExceptions(filePath) {
  const absoluteUrls = loadApprovedExceptionUrls(filePath);
  const pathnames = new Set();
  for (const absoluteUrl of absoluteUrls) {
    try {
      pathnames.add(new URL(absoluteUrl).pathname);
    } catch {
      throw new Error(
        `Exception URL is not a valid absolute URL: ${absoluteUrl}`
      );
    }
  }
  return pathnames;
}

/**
 * Compara dos snapshots de rutas contra el registro de excepciones del
 * URL-freeze. Función pura (sin console.log ni process.exit) para poder
 * testearla directamente; `main()` es la única que hace I/O de reporte y
 * sale del proceso.
 *
 * @returns {{
 *   status: "PASS" | "FAIL",
 *   beforeCount: number,
 *   afterCount: number,
 *   removed: string[],
 *   added: string[],
 *   unapprovedAdded: string[],
 *   approvedAdditions: string[],
 *   errors: string[],
 * }}
 */
export function compareRoutes({ beforePath, afterPath, exceptionsPath }) {
  const errors = [];
  const beforeRoutes = loadRoutes(beforePath);
  const afterRoutes = loadRoutes(afterPath);
  const approvedExceptions = loadApprovedExceptions(exceptionsPath);

  if (beforeRoutes.size === 0) {
    errors.push(
      "Baseline is empty — refusing to pass vacuously. Regenerate the baseline snapshot before comparing."
    );
    return {
      status: "FAIL",
      beforeCount: beforeRoutes.size,
      afterCount: afterRoutes.size,
      removed: [],
      added: [],
      unapprovedAdded: [],
      approvedAdditions: [],
      errors,
    };
  }

  const removed = [...beforeRoutes].filter(route => !afterRoutes.has(route)).sort();
  const added = [...afterRoutes].filter(route => !beforeRoutes.has(route)).sort();
  const unapprovedAdded = added.filter(route => !approvedExceptions.has(route));
  const approvedAdditions = added.filter(route => approvedExceptions.has(route));

  if (removed.length > 0) {
    errors.push(`Removed routes detected: ${removed.join(", ")}`);
  }
  if (unapprovedAdded.length > 0) {
    errors.push(
      `Unapproved route additions detected: ${unapprovedAdded.join(", ")} ` +
        `(strategy freeze requires a complete, active entry in ${exceptionsPath})`
    );
  }

  return {
    status: errors.length === 0 ? "PASS" : "FAIL",
    beforeCount: beforeRoutes.size,
    afterCount: afterRoutes.size,
    removed,
    added,
    unapprovedAdded,
    approvedAdditions,
    errors,
  };
}

function resolveArg(input, fallback) {
  return path.resolve(REPO_ROOT, input ?? fallback);
}

function main() {
  const beforePath = resolveArg(
    process.argv[2],
    "docs/reports/routes_snapshot_before.json"
  );
  const afterPath = resolveArg(
    process.argv[3],
    "output/validation/routes_snapshot_after.json"
  );
  const exceptionsPath = resolveArg(
    process.argv[4],
    "docs/governance/url-freeze-exceptions.json"
  );

  const result = compareRoutes({ beforePath, afterPath, exceptionsPath });

  if (result.status === "FAIL") {
    for (const error of result.errors) {
      console.error(`[compare-routes] ${error}`);
    }
    process.exit(1);
  }

  if (result.added.length > 0) {
    console.warn(`[compare-routes] Approved route additions: ${result.added.length}`);
    for (const route of result.added) console.warn(`- ${route}`);
  } else {
    console.log("[compare-routes] No route changes detected.");
  }

  console.log(
    `[compare-routes] before=${result.beforeCount} after=${result.afterCount}`
  );
}

if (
  process.argv[1] &&
  import.meta.url === new URL(`file://${path.resolve(process.argv[1])}`).href
) {
  try {
    main();
  } catch (error) {
    console.error(
      `[compare-routes] ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}
