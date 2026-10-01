/**
 * doctor-rules
 *
 * Reglas puras de clasificación del `doctor` (Growth Engine Fase 0). Traducen
 * la salida de un gate a una categoría de acción para que un humano (o, en
 * Fase 1, self-heal) sepa qué hacer sin leer el log completo.
 *
 * Categorías:
 *   mechanical — regenerable por herramienta (A1).
 *   data       — snapshot/worker o issue si no lo cubre el worker.
 *   editorial  — contenido: agente/humano con auditoría separada.
 *   contract   — URLs/rutas/freeze/postbuild: humano (arquitectura).
 *   unknown    — sin regla: humano, y añadir regla.
 */

export const DOCTOR_CATEGORIES = {
  mechanical: {
    action: "regenerar con herramienta (A1)",
    owner: "self-heal",
  },
  data: {
    action: "regenerar snapshot/worker o abrir issue",
    owner: "workers/editor",
  },
  editorial: {
    action: "agente/humano con auditoría en sesión separada",
    owner: "editor",
  },
  contract: {
    action: "revisión humana (arquitectura/contratos)",
    owner: "owner",
  },
  unknown: {
    action: "revisión humana y añadir regla al doctor",
    owner: "owner",
  },
};

export const DOCTOR_RULES = [
  {
    id: "prettier-format",
    pattern: /code style issues|prettier/i,
    category: "mechanical",
  },
  {
    id: "pnpm-lockfile-mismatch",
    pattern:
      /ERR_PNPM_LOCKFILE_CONFIG_MISMATCH|Cannot proceed with the frozen installation/i,
    category: "mechanical",
  },
  {
    id: "page-lastmod-missing",
    pattern: /missing lastmod/i,
    category: "mechanical",
  },
  {
    id: "docs-structure",
    pattern: /check-docs|docs structure|legacy .* path/i,
    category: "mechanical",
  },
  {
    id: "economic-snapshot-stale",
    pattern:
      /check-economic-snapshot-freshness|snapshot[^\n]*(stale|old)|capturedAt[^\n]*(old|stale)/i,
    category: "data",
  },
  {
    id: "economic-source-divergence",
    pattern:
      /check-economic-source-consistency|source of truth|divergen/i,
    category: "data",
  },
  {
    id: "frontmatter",
    pattern: /check-frontmatter|frontmatter/i,
    category: "editorial",
  },
  {
    id: "editorial-timeliness",
    pattern: /check-editorial-timeliness|stale=\d|drift=\d|validAsOf/i,
    category: "editorial",
  },
  {
    id: "risk-tiers",
    pattern: /check-risk-tiers|risk tier|R4 requiere|R4 sin/i,
    category: "editorial",
  },
  {
    id: "legal-citations",
    pattern: /check-legal-citations|legal citation|ley\b.*no (existe|encontrada)/i,
    category: "editorial",
  },
  {
    id: "no-postid-urls",
    pattern: /check-no-postid-urls|post\.id/i,
    category: "contract",
  },
  {
    id: "routes-freeze",
    pattern:
      /check-routes|check-indexable-url-freeze|unexpected route|url-freeze/i,
    category: "contract",
  },
  {
    id: "postbuild",
    pattern: /check-postbuild|\[check-postbuild\]/i,
    category: "contract",
  },
];

/**
 * Clasifica la salida de un gate. Devuelve una lista de hallazgos únicos por
 * regla. Si hay salida y ninguna regla coincide, devuelve un hallazgo
 * `unclassified` para que se añada una regla.
 */
export function classifyDoctorOutput(text, rules = DOCTOR_RULES) {
  const output = String(text ?? "");
  if (output.trim() === "") return [];

  const findings = [];
  const seen = new Set();
  for (const rule of rules) {
    if (!rule.pattern.test(output)) continue;
    if (seen.has(rule.id)) continue;
    seen.add(rule.id);
    findings.push({ rule: rule.id, category: rule.category });
  }

  if (findings.length === 0) {
    findings.push({ rule: "unclassified", category: "unknown" });
  }
  return findings;
}

/** Comandos que corre el doctor. Subconjunto rápido, sin build ni Playwright. */
export const DOCTOR_CHECKS = [
  { name: "format", command: ["pnpm", "run", "format:check"] },
  { name: "docs", command: ["pnpm", "run", "check:docs"] },
  { name: "policy-registry", command: ["pnpm", "run", "check:policy-registry"] },
  { name: "frontmatter", command: ["pnpm", "run", "check:frontmatter"] },
  { name: "risk-tiers", command: ["pnpm", "run", "check:risk-tiers"] },
  {
    name: "editorial-timeliness",
    command: ["pnpm", "run", "check:editorial-timeliness"],
  },
  {
    name: "economic-snapshot-freshness",
    command: ["pnpm", "run", "check:economic-snapshot-freshness"],
  },
  {
    name: "no-postid-urls",
    command: ["pnpm", "run", "check:no-postid-urls"],
  },
];
