 
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadApprovedExceptionUrls } from "./lib/url-freeze-exceptions.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
// Gate rutas derivadas de contenido — requiere excepción aprobada (mismo
// módulo de esquema: scripts/lib/url-freeze-exceptions.mjs).

function resolveArg(input, fallback) {
  return path.resolve(REPO_ROOT, input ?? fallback);
}

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

function loadRoutes(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  const routes = new Set(parsed.routes.map(entry => entry.route));
  return routes;
}

const beforeRoutes = loadRoutes(beforePath);
const afterRoutes = loadRoutes(afterPath);

function loadApprovedExceptions(filePath) {
  return loadApprovedExceptionUrls(filePath);
}

const approvedExceptions = loadApprovedExceptions(exceptionsPath);

if (beforeRoutes.size === 0) {
  console.error(
    "[compare-routes] Baseline is empty — refusing to pass vacuously. " +
      "Regenerate the baseline snapshot before comparing."
  );
  process.exit(1);
}

const removed = [...beforeRoutes].filter(route => !afterRoutes.has(route)).sort();
const added = [...afterRoutes].filter(route => !beforeRoutes.has(route)).sort();

if (removed.length > 0) {
  console.error("[compare-routes] Removed routes detected:");
  for (const route of removed) {
    console.error(`- ${route}`);
  }
  process.exit(1);
}

const unapprovedAdded = added.filter(route => !approvedExceptions.has(route));
if (unapprovedAdded.length > 0) {
  console.error(
    `[compare-routes] Unapproved route additions detected: ${unapprovedAdded.length}`
  );
  for (const route of unapprovedAdded) console.error(`- ${route}`);
  console.error(
    `[compare-routes] Strategy freeze requires a complete, active entry in ${exceptionsPath}`
  );
  process.exit(1);
}

if (added.length > 0) {
  console.warn(`[compare-routes] Approved route additions: ${added.length}`);
  for (const route of added) console.warn(`- ${route}`);
} else {
  console.log("[compare-routes] No route changes detected.");
}

console.log(
  `[compare-routes] before=${beforeRoutes.size} after=${afterRoutes.size}`
);
