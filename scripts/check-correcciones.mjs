/**
 * Valida el registro público de correcciones (`src/data/correcciones.json`).
 *
 * Reglas:
 * - cada entrada tiene id único (kebab-case), fecha ISO válida y campos
 *   obligatorios no vacíos;
 * - `dateEnd` (opcional) es una fecha válida posterior o igual a `date`;
 * - las entradas están ordenadas por fecha descendente (canon del directorio);
 * - cada `pages[].href` es interna con `/` final y apunta a una ruta que
 *   existe en el repo (página Astro estática, ficha dinámica del glosario,
 *   post del blog o índice de sección).
 *
 * Toda corrección material a contenido publicado debe registrarse aquí
 * (ver mandato en `AGENTS.md`). Las erratas y cambios de estilo están
 * exentos y no se validan.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const REGISTRY_PATH = path.join(REPO_ROOT, "src", "data", "correcciones.json");

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const KEBAB_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isValidIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function resolveInternalHref(href) {
  const normalized = href.replace(/^\/+|\/+$/g, "");
  if (normalized === "") return null;
  const segments = normalized.split("/");

  if (
    segments[0] === "glosario" &&
    segments.length === 2 &&
    KEBAB_ID.test(segments[1])
  ) {
    const dynamicRoute = path.join(
      REPO_ROOT,
      "src",
      "pages",
      "glosario",
      "[slug].astro"
    );
    if (!existsSync(dynamicRoute)) return null;

    const glossaryEntryCandidates = ["md", "mdx"].map(extension =>
      path.join(
        REPO_ROOT,
        "src",
        "data",
        "glossary",
        segments[1] + "." + extension
      )
    );
    return glossaryEntryCandidates.find(candidate => existsSync(candidate)) ?? null;
  }

  const candidates =
    segments[0] === "posts"
      ? [
          path.join(
            REPO_ROOT,
            "src",
            "data",
            "blog",
            `${segments.slice(1).join("/")}.md`
          ),
          path.join(
            REPO_ROOT,
            "src",
            "data",
            "blog",
            `${segments.slice(1).join("/")}.mdx`
          ),
        ]
      : [
          path.join(REPO_ROOT, "src", "pages", `${normalized}.astro`),
          path.join(REPO_ROOT, "src", "pages", normalized, "index.astro"),
        ];
  return candidates.find(candidate => existsSync(candidate)) ?? null;
}

function validateEntry(entry, index, seenIds) {
  const errors = [];
  const where = `corrections[${index}]`;

  if (typeof entry !== "object" || entry === null) {
    return [`${where}: la entrada debe ser un objeto.`];
  }

  if (!KEBAB_ID.test(entry.id ?? "")) {
    errors.push(`${where}: id inválido (kebab-case requerido).`);
  } else if (seenIds.has(entry.id)) {
    errors.push(`${where}: id duplicado "${entry.id}".`);
  } else {
    seenIds.add(entry.id);
  }

  if (!isValidIsoDate(entry.date)) {
    errors.push(`${where} (${entry.id}): date inválida (ISO YYYY-MM-DD).`);
  }
  if (entry.dateEnd !== undefined) {
    if (!isValidIsoDate(entry.dateEnd)) {
      errors.push(`${where} (${entry.id}): dateEnd inválida.`);
    } else if (entry.dateEnd < entry.date) {
      errors.push(`${where} (${entry.id}): dateEnd anterior a date.`);
    }
  }

  for (const field of [
    "title",
    "affected",
    "sources",
    "prevention",
  ]) {
    if (typeof entry[field] !== "string" || entry[field].trim() === "") {
      errors.push(`${where} (${entry.id}): campo "${field}" vacío o ausente.`);
    }
  }
  for (const field of ["pages", "wrong", "fixed"]) {
    if (!Array.isArray(entry[field]) || entry[field].length === 0) {
      errors.push(`${where} (${entry.id}): "${field}" debe ser un arreglo no vacío.`);
    }
  }

  for (const [pageIndex, page] of (entry.pages ?? []).entries()) {
    const pageWhere = `${where} (${entry.id}) pages[${pageIndex}]`;
    if (typeof page?.label !== "string" || page.label.trim() === "") {
      errors.push(`${pageWhere}: label vacío o ausente.`);
    }
    if (typeof page?.href !== "string" || !page.href.startsWith("/")) {
      errors.push(`${pageWhere}: href debe ser una ruta interna absoluta.`);
      continue;
    }
    if (!page.href.endsWith("/")) {
      errors.push(`${pageWhere}: href debe terminar en "/" (trailingSlash).`);
      continue;
    }
    if (!resolveInternalHref(page.href)) {
      errors.push(
        `${pageWhere}: "${page.href}" no resuelve a ninguna página o post del repo.`
      );
    }
  }

  return errors;
}

function main() {
  let registry;
  try {
    registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
  } catch (error) {
    console.error(`[check-correcciones] No se pudo leer el registro: ${error.message}`);
    process.exit(1);
  }

  const entries = registry?.corrections;
  if (!Array.isArray(entries)) {
    console.error("[check-correcciones] El registro debe tener un arreglo `corrections`.");
    process.exit(1);
  }

  const errors = [];
  const seenIds = new Set();
  for (const [index, entry] of entries.entries()) {
    errors.push(...validateEntry(entry, index, seenIds));
  }

  const effectiveDates = entries.map(
    entry => entry.dateEnd ?? entry.date ?? ""
  );
  const sorted = [...effectiveDates].sort().reverse();
  if (JSON.stringify(effectiveDates) !== JSON.stringify(sorted)) {
    errors.push(
      "[check-correcciones] Las entradas deben estar ordenadas por fecha efectiva descendente (`dateEnd ?? date`, canon del directorio)."
    );
  }

  if (errors.length > 0) {
    console.error(
      `[check-correcciones] ${errors.length} problema(s) en ${entries.length} entradas:`
    );
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(
    `[check-correcciones] OK. ${entries.length} entradas válidas en el registro.`
  );
}

main();
