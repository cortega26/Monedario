#!/usr/bin/env node

/**
 * scorecard-opportunities.mjs
 *
 * Scorecard auto-verificable del plan de oportunidades
 * docs/archive/backlog/PLAN-opportunity-scan-2026-06-21.md (plan CERRADO 2026-06-25;
 * archivado tras alcanzar 16/16).
 *
 * Recalcula el estado de cada ítem code-verificable (OPP-01..OPP-12, OPP-15,
 * OPP-16) inspeccionando el código real del repo — no checkboxes — así que no
 * puede driftar: si el check no pasa, el ítem no está hecho. Los ítems gated por
 * contenido YMYL (OPP-13, OPP-14) se leen como estado MANUAL desde el propio
 * documento (read-only) para el porcentaje combinado.
 *
 * Uso:
 *   pnpm run scorecard:opportunities              # imprime estado + % (read-only)
 *   pnpm run scorecard:opportunities -- --write   # además reescribe el bloque
 *                                                 # AUTO del documento
 *
 * Salida exit 0 siempre que el scan corra; no es un gate de CI (es un tablero).
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const DOC = "docs/archive/backlog/PLAN-opportunity-scan-2026-06-21.md";
const WRITE = process.argv.includes("--write");

const AUTO_START = "<!-- SCORECARD:AUTO:START -->";
const AUTO_END = "<!-- SCORECARD:AUTO:END -->";

// ---------- helpers ----------

/** Lee un archivo; retorna "" si no existe. */
function read(rel) {
  const abs = join(ROOT, rel);
  return existsSync(abs) ? readFileSync(abs, "utf-8") : "";
}

function exists(rel) {
  return existsSync(join(ROOT, rel));
}

/** Recorre un directorio recursivamente y retorna rutas relativas a ROOT. */
function walk(relDir) {
  const absDir = join(ROOT, relDir);
  if (!existsSync(absDir)) return [];
  const out = [];
  for (const name of readdirSync(absDir)) {
    const abs = join(absDir, name);
    const rel = `${relDir}/${name}`;
    if (statSync(abs).isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}

/** Lista archivos directos de un directorio que matchean un patrón en el nombre. */
function listCalculators() {
  const dir = "src/pages/calculadoras";
  if (!exists(dir)) return [];
  return readdirSync(join(ROOT, dir))
    .filter(f => f.endsWith(".astro") && f !== "index.astro")
    .map(f => `${dir}/${f}`);
}

// ---------- catálogo de ítems ----------
// check() retorna { done: boolean, detail: string }. Los ítems manuales no traen
// check (manual: true); su estado se lee del documento.

const ITEMS = [
  {
    id: "OPP-01",
    title: "Enlaces salientes en glosario (término → calc/owner/ley)",
    window: "7d",
    check() {
      const tpl = read("src/pages/glosario/[slug].astro");
      const tplLinks = /\/(calculadoras|posts|leyes)\//.test(tpl);
      const glossaryFiles = walk("src/data/glossary").filter(f => f.endsWith(".md"));
      const withFields = glossaryFiles.filter(f =>
        /related(Guides|Calculators|Laws)\s*:/.test(read(f))
      ).length;
      return {
        done: tplLinks && withFields >= 20,
        detail: `template enlaza fuera: ${tplLinks ? "sí" : "no"}; términos con campos: ${withFields}/20`,
      };
    },
  },
  {
    id: "OPP-02",
    title: 'Glosario index → "Herramientas relacionadas"',
    window: "7d",
    check() {
      const idx = read("src/pages/glosario/index.astro");
      const n = (idx.match(/\/calculadoras\//g) || []).length;
      return { done: n >= 3, detail: `enlaces a /calculadoras/ en index: ${n}/3` };
    },
  },
  {
    id: "OPP-03",
    title: "iva + impuesto-segunda-categoria: enlace a contenido",
    window: "7d",
    check() {
      const iva = read("src/pages/calculadoras/iva.astro");
      const isc = read("src/pages/calculadoras/impuesto-segunda-categoria.astro");
      const ok = s => /\/(posts|glosario)\//.test(s);
      const a = ok(iva);
      const b = ok(isc);
      return { done: a && b, detail: `iva: ${a ? "ok" : "falta"}; isc: ${b ? "ok" : "falta"}` };
    },
  },
  {
    id: "OPP-04",
    title: "Freshness visible en calculadoras (dateModified)",
    window: "7d",
    check() {
      const calcs = listCalculators();
      const n = calcs.filter(f => /dateModified/.test(read(f))).length;
      return { done: n >= 18, detail: `calculadoras con dateModified: ${n}/${calcs.length} (meta 18)` };
    },
  },
  {
    id: "OPP-05",
    title: "Calendario financiero /calendario (shell)",
    window: "14d",
    check() {
      const done = exists("src/pages/calendario.astro") || exists("src/pages/calendario/index.astro");
      return { done, detail: done ? "ruta /calendario presente" : "sin ruta /calendario" };
    },
  },
  {
    id: "OPP-06",
    title: 'Landing "UF/dólar hoy" reposicionada',
    window: "14d",
    check() {
      const EXISTING = "src/pages/guias/uf-costo-de-vida/indicadores-economicos.astro";
      const hits = walk("src/pages").filter(
        f =>
          f.endsWith(".astro") &&
          f !== EXISTING &&
          !f.startsWith("src/pages/api/") &&
          /(uf-hoy|indicadores)/i.test(f)
      );
      return { done: hits.length > 0, detail: hits.length ? `ruta nueva: ${hits[0]}` : "sin landing dedicada" };
    },
  },
  {
    id: "OPP-07",
    title: "Dataset histórico UF/UTM/IPC versionado",
    window: "14d",
    check() {
      const hits = walk("src/data").filter(f => /histor/i.test(f));
      return { done: hits.length > 0, detail: hits.length ? `dataset: ${hits[0]}` : "sin serie histórica en src/data" };
    },
  },
  {
    id: "OPP-08",
    title: "Conversor UF a una fecha pasada",
    window: "30d",
    check() {
      const page = read("src/pages/calculadoras/conversor-uf.astro");
      const comp = walk("src/components/calculator")
        .filter(f => /uf/i.test(f))
        .map(read)
        .join("\n");
      const blob = page + comp;
      const done = /type=["']date["']/.test(blob) || /(valorAFecha|fechaConsulta|ufHistoric|historic)/i.test(blob);
      return { done, detail: done ? "lookup por fecha presente" : "sin input de fecha histórica" };
    },
  },
  {
    id: "OPP-09",
    title: "Actualizador por inflación (IPC)",
    window: "30d",
    check() {
      const hits = listCalculators().filter(f => /(inflacion|actualizador|poder-adquisitivo)/i.test(f));
      return { done: hits.length > 0, detail: hits.length ? hits[0] : "sin calculadora de inflación" };
    },
  },
  {
    id: "OPP-10",
    title: "Gráfico histórico UF/UTM/dólar",
    window: "30d",
    check() {
      const hits = walk("src/components").filter(f => /(chart|grafico)/i.test(f));
      return { done: hits.length > 0, detail: hits.length ? hits[0] : "sin componente de gráfico" };
    },
  },
  {
    id: "OPP-11",
    title: "Calculadora de gratificación legal",
    window: "30d",
    check() {
      const done = exists("src/pages/calculadoras/gratificacion-legal.astro");
      return { done, detail: done ? "ruta presente" : "sin calculadora de gratificación" };
    },
  },
  {
    id: "OPP-12",
    title: "bancos-fintech: quitar noindex + GUIDE_HUB_ORDER",
    window: "14d",
    gatedBy: "OPP-13",
    check() {
      const hub = read("src/pages/guias/bancos-fintech/index.astro");
      const clusters = read("src/config/clusters.ts");
      const noNoindex = hub.length > 0 && !/noindex/i.test(hub);
      const orderMatch = clusters.match(/GUIDE_HUB_ORDER[^=]*=\s*\[([\s\S]*?)\]/);
      const inOrder = !!orderMatch && /["']bancos-fintech["']/.test(orderMatch[1]);
      return {
        done: noNoindex && inOrder,
        detail: `noindex retirado: ${noNoindex ? "sí" : "no"}; en GUIDE_HUB_ORDER: ${inOrder ? "sí" : "no"}`,
      };
    },
  },
  {
    id: "OPP-15",
    title: "Tooltips en links auto-inyectados de glosario",
    window: "14d",
    check() {
      const blob = read("src/utils/injectGlossaryLinks.ts") + read("src/components/GlossaryContentWrapper.astro");
      const done = /(data-tooltip|aria-describedby|data-glossary-def)/.test(blob);
      return { done, detail: done ? "atributos de tooltip presentes" : "auto-inject sin tooltip" };
    },
  },
  {
    id: "OPP-16",
    title: 'Página "Cómo usamos los datos" (trazabilidad)',
    window: "14d",
    check() {
      const route = walk("src/pages").some(f =>
        /(como-usamos-los-datos|fuentes-de-datos|trazabilidad-datos)/i.test(f)
      );
      const inMethod = /(c[oó]mo usamos los datos|trazabilidad de (los )?datos)/i.test(
        read("src/pages/metodologia.astro")
      );
      const done = route || inMethod;
      return { done, detail: done ? "página/sección de trazabilidad presente" : "sin página de trazabilidad" };
    },
  },
  // --- manuales (gated, contenido YMYL) ---
  { id: "OPP-13", title: "bancos-fintech: auditoría del pilar + sign-off", manual: true },
  { id: "OPP-14", title: 'Migrantes: brief pilar "abrir cuenta siendo extranjero"', manual: true },
];

// ---------- estado manual (leído del documento) ----------

function readManualState(doc) {
  /** @type {Record<string, boolean>} */
  const state = {};
  for (const line of doc.split("\n")) {
    const m = line.match(/\|\s*(OPP-\d+)\s*\|.*\|\s*\[([ xX])\]/);
    if (m) state[m[1]] = m[2].toLowerCase() === "x";
  }
  return state;
}

// ---------- ejecución ----------

const doc = read(DOC);
if (!doc) {
  console.error(`No se encontró ${DOC}. Corre el script desde la raíz del repo.`);
  process.exit(1);
}
const manualState = readManualState(doc);

const rows = ITEMS.map(item => {
  if (item.manual) {
    const done = manualState[item.id] === true;
    return { id: item.id, title: item.title, window: "manual", done, detail: done ? "sign-off registrado" : "pendiente de sign-off", manual: true };
  }
  let res;
  try {
    res = item.check();
  } catch (err) {
    res = { done: false, detail: `error en check: ${err.message}` };
  }
  return { id: item.id, title: item.title, window: item.window, gatedBy: item.gatedBy, ...res, manual: false };
});

const auto = rows.filter(r => !r.manual);
const manual = rows.filter(r => r.manual);
const autoDone = auto.filter(r => r.done).length;
const manualDone = manual.filter(r => r.done).length;
const totalDone = autoDone + manualDone;
const total = rows.length;
const pct = Math.round((totalDone / total) * 100);

// ---------- render ----------

function statusIcon(r) {
  if (r.done) return "✅";
  if (r.gatedBy) return "🔒"; // verificable pero gated por otro ítem
  if (r.manual) return "✋";
  return "⬜";
}

function renderTable() {
  const lines = [];
  lines.push(`**Avance:** ${totalDone}/${total} (${pct}%) · verificables ${autoDone}/${auto.length} · manuales ${manualDone}/${manual.length}`);
  lines.push("");
  lines.push("| Estado | ID | Oportunidad | Ventana | Evidencia |");
  lines.push("|---|---|---|---|---|");
  for (const r of auto) {
    const gate = r.gatedBy ? ` _(gated por ${r.gatedBy})_` : "";
    lines.push(`| ${statusIcon(r)} | ${r.id} | ${r.title}${gate} | ${r.window} | ${r.detail} |`);
  }
  return lines.join("\n");
}

const table = renderTable();

// salida de consola
console.log(`\nScorecard de oportunidades — ${DOC}\n`);
console.log(table);
console.log("\nManuales (gated — actualizar a mano en el doc):");
for (const r of manual) console.log(`  ${statusIcon(r)} ${r.id} — ${r.title}: ${r.detail}`);
console.log("");

// escritura del bloque AUTO
if (WRITE) {
  const startIdx = doc.indexOf(AUTO_START);
  const endIdx = doc.indexOf(AUTO_END);
  if (startIdx === -1 || endIdx === -1) {
    console.error("No se hallaron los marcadores SCORECARD:AUTO en el documento.");
    process.exit(1);
  }
  const stamp = new Date().toISOString().slice(0, 10);
  const block =
    `${AUTO_START}\n` +
    `<!-- Generado por scripts/scorecard-opportunities.mjs — no editar a mano este bloque.\n` +
    `     Corre: pnpm run scorecard:opportunities -- --write -->\n\n` +
    `_Última verificación automática: ${stamp}._\n\n` +
    `${table}\n\n` +
    `${AUTO_END}`;
  const next = doc.slice(0, startIdx) + block + doc.slice(endIdx + AUTO_END.length);
  writeFileSync(join(ROOT, DOC), next);
  console.log(`Bloque AUTO actualizado en ${DOC} (${stamp}).\n`);
}
