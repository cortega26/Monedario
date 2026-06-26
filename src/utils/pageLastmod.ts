import { readFileSync } from "node:fs";

type LastmodIndex = { pages?: Record<string, string> };

let cache: Record<string, string> | null = null;

function load(): Record<string, string> {
  if (cache) return cache;
  try {
    const raw = readFileSync("./context/page-lastmod-index.json", "utf-8");
    cache = (JSON.parse(raw) as LastmodIndex).pages ?? {};
  } catch {
    cache = {};
  }
  return cache;
}

/**
 * Fecha de última modificación (YYYY-MM-DD) de una ruta estática según el índice
 * generado `context/page-lastmod-index.json`. Normaliza la barra final.
 * Devuelve `undefined` si la ruta no está indexada (p. ej. una calculadora nueva
 * aún no incluida) — en ese caso no se emite `dateModified`, igual que hoy.
 */
export function getPageLastmod(pathname: string): string | undefined {
  const key = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return load()[key];
}
