/**
 * external-intelligence
 *
 * Helpers compartidos por los colectores de fuente libre (sitemaps de
 * competidores, Bing Webmaster) para escribir el archivo normalizado
 * `output/external-intelligence/<semana>.json` sin pisar datos de proveedor.
 */

/**
 * Mezcla el archivo existente con los datos entrantes:
 * - Preserva las listas de proveedor ya presentes (keywordGaps,
 *   competitorGaps, serpFeatures).
 * - Une `freeSources` de ambos lados.
 * - Mantiene `source` del proveedor si existe; si no, "free".
 */
export function mergeExternalIntelligence(existing, incoming) {
  const base = existing && typeof existing === "object" ? existing : {};
  const merged = { ...base, ...incoming };
  for (const key of ["keywordGaps", "competitorGaps", "serpFeatures"]) {
    if (Array.isArray(base[key])) merged[key] = base[key];
  }
  merged.freeSources = Array.from(
    new Set([...(base.freeSources ?? []), ...(incoming.freeSources ?? [])])
  );
  if (base.source && base.source !== "free") {
    merged.source = base.source;
  } else {
    merged.source = "free";
  }
  return merged;
}
