#!/usr/bin/env node
// bcn-cite.mjs — LeyChile citation extractor (verificador de citas literales).
//
// Derivado del spike validado en /tmp/opencode/bcn-spike/ (extract.mjs +
// normalize.mjs, 13/13 EXACT en golden 2026-09-18). Cero dependencias, Node 22.
//
// Tecnica: el SPA de bcn.cl/leychile obtiene el texto completo de la norma
// desde https://nuevo.leychile.cl/servicios/Navegar/get_norma_json
// (requiere User-Agent de navegador; sin el, HTTP 401). Este script llama a
// ese API directamente, separa notas marginales a nivel HTML, segmenta
// incisos por div.p y resuelve fechas relativas contra fecha_publicacion.
//
// Contrato: cite(idNorma, {art|idParte|transitorio, inciso|numeral|final,
//   idVersion?}) -> {literal, locator, version, notes[], resolvedDate?}.
// FAIL-CLOSED: si el literal conserva restos de nota marginal, la cita falla
// con exit != 0 y motivo — nunca se devuelve una cita sucia.
//
// Cache: output/validation/bcn-cache/<idNorma>@<idVersion|latest>.json,
// TTL 30 dias, secuencial 1 req/1.5s (archivo .last-fetch + --sleep-ms).
// Sin vocab.json: el spike demostro 1321/1321 JOIN con 0 casos SPACE en el
// corpus de 6 normas (incluso sin vocab el golden da 13/13), asi que la
// resolucion de pegas es join por defecto documentado (ver ADR).
//
// Uso:
//   node scripts/bcn-cite.mjs <idNorma|norma.json> --art N|--idParte X|--transitorio T
//       [--inciso N|--numeral N|--final] [--idVersion YYYY-MM-DD]
//       [--resolve-dates] [--json] [--cache-dir DIR] [--no-cache]
//   node scripts/bcn-cite.mjs --golden [golden.json] [--sleep-ms N]
//       [--cache-dir DIR] [--no-cache]
//   node scripts/bcn-cite.mjs --versions <idNorma>
//   node scripts/bcn-cite.mjs --help
//
// Exit codes: 0 ok; 1 fallo de cita/red/parse/residuo (fail-closed);
// 2 args invalidos.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const SCRIPT_DIR = path.dirname(SCRIPT_PATH);
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const DEFAULT_GOLDEN = path.join(REPO_ROOT, "tests", "bcn-cite.golden.json");
const DEFAULT_CACHE_DIR = path.join(
  REPO_ROOT,
  "output",
  "validation",
  "bcn-cache"
);

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const API = "https://nuevo.leychile.cl/servicios/Navegar/get_norma_json";
const VERSIONS_API = "https://nuevo.leychile.cl/servicios/Consulta/get_versiones";
const FETCH_TIMEOUT_MS = 30000;
const MIN_INTERVAL_MS = 1500;
const CACHE_TTL_MS = 30 * 24 * 3600 * 1000;

// --- entidades + texto -------------------------------------------------------

const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function decodeEntities(s) {
  return String(s ?? "")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) =>
      String.fromCodePoint(parseInt(h, 16))
    )
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&([a-zA-Z]+);/g, (_, n) => NAMED[n] ?? `&${n};`);
}

const isWordChar = c => /[\p{L}\p{N}]/u.test(c || "");

// Resolucion de pegas en sitios de eliminacion de nota con caracteres de
// palabra a ambos lados. Join por defecto (sin parametros por diseno):
// validado 1321/1321 JOIN con 0 falsos SPACE en el corpus del spike
// (incluso sin vocabulario). Ver ADR-20260918.
export function resolveGlue() {
  return "";
}

// Remueve UN elemento de nota con manejo de pegamento. Opera sobre HTML
// crudo (los offsets se refieren a el); solo ventanas vecinas de +-80
// chars se decodifican para la decision, sin corrimiento de coordenadas.
function spliceNote(html, start, end) {
  const rawBefore = html.slice(0, start);
  const rawAfter = html.slice(end);
  const beforeTail = decodeEntities(rawBefore.slice(-80));
  const afterHead = decodeEntities(rawAfter.slice(0, 80));
  const cb = beforeTail.slice(-1);
  const ca = afterHead.slice(0, 1);
  let glue = "";
  if (isWordChar(cb) && isWordChar(ca)) {
    const tail = (beforeTail.match(/[\p{L}\p{N}]+$/u) || [""])[0];
    const head = (afterHead.match(/^[\p{L}\p{N}]+/u) || [""])[0];
    glue = resolveGlue(tail, head);
  }
  return rawBefore + glue + rawAfter;
}

// Quita notas marginales del HTML de la parte.
// Retorna { html, notes } con notes = [{kind, text}] en orden de documento.
export function stripNotes(html) {
  const notes = [];
  let s = String(html ?? "");
  // 1. Bloques de notas al pie (div.np hasta el proximo div.p/div.np o fin).
  s = s.replace(
    /<div class="np"[^>]*>([\s\S]*?)(?=<div class="(?:p|np)"|$)/g,
    (_, inner) => {
      const t = leafText(inner);
      if (t) notes.push({ kind: "nota-pie", text: t.slice(0, 300) });
      return "";
    }
  );
  // 2. Notas inline (span.n, div.n.rnp): de atras hacia adelante.
  const inline = [];
  const re =
    /<span class="n"[^>]*>([\s\S]*?)<\/span>|<div class="n rnp"[^>]*>([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(s)))
    inline.push({
      start: m.index,
      end: m.index + m[0].length,
      inner: m[1] ?? m[2] ?? "",
    });
  for (const n of inline) {
    const t = leafText(n.inner);
    const isRef = /NOTA/i.test(t);
    notes.push({
      kind: isRef ? "nota-ref" : "modificatoria",
      text: t.slice(0, 200),
    });
  }
  for (let i = inline.length - 1; i >= 0; i--)
    s = spliceNote(s, inline[i].start, inline[i].end);
  return { html: s, notes };
}

// Fragmento HTML crudo -> texto plano (tags de bloque dan saltos de linea).
export function leafText(html) {
  let s = String(html ?? "");
  s = s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li|ul|ol|tr|table|h\d)>/gi, "\n");
  s = s.replace(/<[^>]+>/g, "");
  s = decodeEntities(s);
  s = s.replace(/[ \t ]+/g, " ");
  s = s.replace(/\n[ \t ]+/g, "\n").replace(/[ \t ]+\n/g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

// HTML limpio -> bloques div.p (vacios descartados).
export function htmlToBlocks(cleanHtml) {
  const blocks = [];
  const re = /<div class="p"[^>]*>([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(cleanHtml))) {
    const t = leafText(m[1]);
    if (t) blocks.push(t);
  }
  return blocks;
}

// Quita el encabezado de articulo. Orden importa:
//   1. "Articulo <nombre>.- " (transitorios) -> hasta ".-"
//   2. "Art. 163. " / "Articulo 19o " / "Articulo 163 bis.- ".
export function stripArticleHeader(block) {
  const s = String(block).replace(/^Artículo\s+.+?\s*\.-\s+/, "");
  if (s !== block) return s;
  return block
    .replace(
      /^(Art\.|Artículo)\s+\d+\s*(?:bis|ter|quáter|quinquies)?\s*[º°.]?\s*(?:\.-|[-–—:.])?\s+/i,
      ""
    )
    .replace(
      /^Artículo\s+(primero|segundo|tercero|cuarto|quinto|sexto|séptimo|octavo|noveno|décimo|decimo|vigésimo|vigésimo?\w*|trigésimo|trigésimo?\w*|cuadragésimo\w*)\s*(?:transitorio)?\s*(?:\.-|[-–—:.])?\s+/i,
      ""
    );
}

// Marcador inicial de inciso/numeral/letra: "1) ", "1. ", "a) ", "N° 4 ".
export function detectMarker(text) {
  const m = String(text).match(/^(?:(N°\s*\d+)|(\d+\s*[).°.º])|([a-z])\))\s+/i);
  return m ? m[0].trim() : null;
}

export function splitArticle(leafHtml) {
  const { html, notes } = stripNotes(leafHtml);
  const rawBlocks = htmlToBlocks(html);
  const blocks = rawBlocks.map((t, i) => {
    const text = i === 0 ? stripArticleHeader(t) : t;
    return { i: i + 1, ordinal: `${i + 1}.°`, marker: detectMarker(text), text };
  });
  if (blocks.length) blocks[blocks.length - 1].final = true;
  return { blocks, notes };
}

// --- nivel norma ---------------------------------------------------------------

export function extractLeaves(data) {
  const leaves = [];
  (function walk(node) {
    if (!node || typeof node !== "object") return;
    const kids = Array.isArray(node.h) ? node.h : null;
    if (kids) kids.forEach(walk);
    else if (typeof node.t === "string" && node.i != null)
      leaves.push({ idParte: String(node.i), html: node.t });
  })(Array.isArray(data.html) ? { h: data.html } : {});
  const names = new Map();
  (function walkE(list) {
    if (!Array.isArray(list)) return;
    for (const e of list) {
      if (e && e.i != null && e.n) names.set(String(e.i), String(e.n));
      if (e && Array.isArray(e.h)) walkE(e.h);
    }
  })(data.estructura);
  return leaves.map(l => ({ ...l, name: names.get(l.idParte) ?? "(sin nombre)" }));
}

export function findParts(data, { art, idParte, transitorio } = {}) {
  const leaves = extractLeaves(data);
  if (idParte) return leaves.filter(p => p.idParte === String(idParte));
  if (art)
    return leaves.filter(p =>
      new RegExp(`^art[íi]culo\\s+${art}(\\s|$|\\b)`, "i").test(p.name)
    );
  if (transitorio) {
    return leaves.filter(
      p =>
        /transitorio/i.test(p.name) &&
        p.name.toLowerCase().includes(String(transitorio).toLowerCase())
    );
  }
  return leaves;
}

// Normaliza una parte: texto completo + bloques direccionables.
export function normalizePart(leaf) {
  const { blocks, notes } = splitArticle(leaf.html);
  return {
    idParte: leaf.idParte,
    name: leaf.name,
    blocks,
    notes,
    fullText: blocks.map(b => b.text).join("\n\n"),
  };
}

// Locator: {inciso: N} (1-based sobre bloques no vacios),
// {numeral: "4"} (marcador "4)"/"N° 4"), {final: true}, o vacio (articulo).
export function selectBlock(article, locator = {}) {
  if (locator.inciso != null) return article.blocks[locator.inciso - 1] ?? null;
  if (locator.final) return article.blocks[article.blocks.length - 1] ?? null;
  if (locator.numeral != null) {
    const n = String(locator.numeral);
    return (
      article.blocks.find(
        b => b.marker && new RegExp(`^(N°\\s*)?${n}\\s*[).°º]`).test(b.marker)
      ) ?? null
    );
  }
  return null;
}

// --- fail-closed: residuos de nota ----------------------------------------------
// Patrones en MAYUSCULAS propios de notas marginales (el cuerpo legitimo
// usa "ley" minuscula y "Diario Oficial" desarrollado, asi que no hay
// falsos positivos sobre el golden 13/13).
const RESIDUE_PATTERNS = [
  { re: /<[a-zA-Z][^>]*>/, reason: "html-tag-residue" },
  { re: /LEY\s+\d/, reason: "nota-modificatoria-residue (LEY NNNNN)" },
  { re: /D\.O\.\s*\d/, reason: "nota-modificatoria-residue (D.O. fecha)" },
  { re: /\bNOTA\b\s*:/, reason: "nota-ref-residue (NOTA:)" },
];

export function checkNoteResidue(literal) {
  const text = String(literal ?? "");
  for (const { re, reason } of RESIDUE_PATTERNS) {
    if (re.test(text)) return reason;
  }
  return null;
}

export class CiteError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "CiteError";
    this.code = code;
  }
}

// --- resolutor de fechas relativas -----------------------------------------------

const UNITS = {
  primero: 1,
  primer: 1,
  segunda: 2,
  segundo: 2,
  tercer: 3,
  tercero: 3,
  tercera: 3,
};
const TENS = {
  decimo: 10,
  decima: 10,
  undecimo: 11,
  duodecimo: 12,
  decimotercero: 13,
  decimocuarto: 14,
  decimoquinto: 15,
  decimosexto: 16,
  decimoctavo: 18,
  vigesimo: 20,
  vigesima: 20,
  trigesimo: 30,
  trigesima: 30,
  cuadragesimo: 40,
  quincuagesimo: 50,
};
const ONES_F = {
  primera: 1,
  segunda: 2,
  tercera: 3,
  cuarta: 4,
  quinta: 5,
  sexto: 6,
  sexta: 6,
  septimo: 7,
  septima: 7,
  octavo: 8,
  octava: 8,
  noveno: 9,
  novena: 9,
  cuarto: 4,
  quinto: 5,
};

// "vigesimo quinto" / "trigesimo primero" -> 25 / 31 (tambien "25.º").
export function parseOrdinalEs(s) {
  s = String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  s = s.replace(/^primer d[ií]a del\s+/, "").replace(/^primer dia del\s+/, "");
  const dm = s.match(/(\d+)\s*[.º°]?(?=\s|$)/);
  if (dm) return parseInt(dm[1], 10);
  const parts = s.split(/[\s-]+/);
  let total = 0;
  let ones = 0;
  for (const p of parts) {
    if (UNITS[p] != null && total === 0 && ones === 0 && parts.length === 1)
      return UNITS[p];
    if (TENS[p] != null) total = TENS[p];
    else if (ONES_F[p] != null) ones = ONES_F[p];
    else if (UNITS[p] != null) ones = UNITS[p];
  }
  if (total && ones) return total + ones;
  if (total) return total;
  if (ones && parts.length > 1) return ones;
  return null;
}

// Resuelve "...primer dia del <ORD> mes siguiente a su publicacion..."
// contra una fecha ancla ISO (fecha_publicacion).
export function resolveRelativeDate(text, anchorIso) {
  const t = String(text ?? " ");
  const norm = t.toLowerCase().normalize("NFC");
  const m = norm.match(
    /(el primer d[ií]a del|primer d[ií]a del|a partir del|transcurridos?|dentro de los?|el)\s+(.{1,60}?)\s*(mes(?:es)?|a[ñn]os?|d[íi]as?(?:\s+h[áa]biles)?)\s+(siguientes?\s+a\s+su\s+publicaci[óo]n|siguiente\s+a\s+la\s+publicaci[óo]n|desde\s+(?:su|la)\s+publicaci[óo]n|contados?\s+desde\s+(?:su|la)\s+publicaci[óo]n)/i
  );
  if (!m) return { iso: null, reason: "no-relative-date-pattern" };
  const n = parseOrdinalEs(m[2]);
  if (n == null)
    return { iso: null, reason: `ordinal-no-parseable: "${m[2].trim()}"` };
  const unit = /^mes/.test(m[3]) ? "month" : /^a[ñn]o/.test(m[3]) ? "year" : "day";
  const a = new Date(anchorIso + "T12:00:00Z");
  if (Number.isNaN(a.getTime()))
    return { iso: null, reason: `bad-anchor: ${anchorIso}` };
  let y = a.getUTCFullYear();
  let mo = a.getUTCMonth();
  let d = a.getUTCDate();
  if (unit === "month") {
    const idx = y * 12 + mo + n;
    y = Math.floor(idx / 12);
    mo = idx % 12;
    d = 1;
  } else if (unit === "year") {
    y += n;
    d = 1;
  } else {
    const t2 = new Date(Date.UTC(y, mo, d + n));
    y = t2.getUTCFullYear();
    mo = t2.getUTCMonth();
    d = t2.getUTCDate();
  }
  const iso = `${y}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return { rule: m[0].trim().slice(0, 120), n, unit, anchor: anchorIso, iso };
}

// --- cache + fetch ---------------------------------------------------------------

function cacheFile(cacheDir, idNorma, idVersion) {
  const ver = idVersion || "latest";
  return path.join(cacheDir, `${idNorma}@${ver}.json`);
}

function readCache(cacheDir, idNorma, idVersion) {
  const file = cacheFile(cacheDir, idNorma, idVersion);
  try {
    const st = fs.statSync(file);
    if (Date.now() - st.mtimeMs > CACHE_TTL_MS) return null;
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function writeCache(cacheDir, idNorma, idVersion, data) {
  const file = cacheFile(cacheDir, idNorma, idVersion);
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data));
  fs.writeFileSync(path.join(cacheDir, ".last-fetch"), String(Date.now()));
}

function throttle(cacheDir) {
  try {
    const last = Number(
      fs.readFileSync(path.join(cacheDir, ".last-fetch"), "utf8")
    );
    const wait = MIN_INTERVAL_MS - (Date.now() - last);
    if (wait > 0)
      return new Promise(resolve => setTimeout(resolve, wait));
  } catch {
    // Sin marca previa: sin espera.
  }
  return Promise.resolve();
}

const memoryCache = new Map();

export async function fetchNorma(
  idNorma,
  { idVersion = "", cacheDir = DEFAULT_CACHE_DIR, noCache = false } = {}
) {
  const key = `${idNorma}@${idVersion || "latest"}`;
  if (memoryCache.has(key)) return memoryCache.get(key);
  if (!noCache) {
    const hit = readCache(cacheDir, idNorma, idVersion);
    if (hit) {
      memoryCache.set(key, hit);
      return hit;
    }
  }
  await throttle(cacheDir);
  const url =
    `${API}?idNorma=${idNorma}&idVersion=${encodeURIComponent(idVersion)}` +
    `&idLey=&tipoVersion=&cve=&agrupa_partes=1&r=`;
  let res;
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Referer: `https://www.bcn.cl/leychile/navegar?idNorma=${idNorma}`,
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (e) {
    throw new CiteError("FETCH", `red (${url}): ${e.message}`);
  }
  if (res.status === 401)
    throw new CiteError(
      "FETCH",
      "HTTP 401 — el servidor rechazo el User-Agent. Usa el UA de navegador incluido en el script."
    );
  const bodyText = await res.text();
  if (/no se encuentra en nuestra Base de Datos/i.test(bodyText.slice(0, 200)))
    throw new CiteError(
      "NOT_FOUND",
      `idNorma=${idNorma} no existe en LeyChile ("${bodyText.trim().slice(0, 120)}")`
    );
  if (!res.ok)
    throw new CiteError(
      "FETCH",
      `HTTP ${res.status} en get_norma_json para idNorma=${idNorma}`
    );
  let data;
  try {
    data = JSON.parse(bodyText);
  } catch {
    throw new CiteError(
      "FETCH",
      `respuesta no-JSON para idNorma=${idNorma} (primeros 120 chars: ${bodyText.slice(0, 120)})`
    );
  }
  memoryCache.set(key, data);
  if (!noCache) {
    try {
      writeCache(cacheDir, idNorma, idVersion, data);
    } catch {
      // Cache best-effort: un fallo de escritura no invalida la cita.
    }
  }
  return data;
}

export async function getVersions(idNorma) {
  const url = `${VERSIONS_API}?idNorma=${idNorma}&formato=json&idParte=&idsParte=`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Referer: `https://www.bcn.cl/leychile/navegar?idNorma=${idNorma}`,
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok)
    throw new CiteError(
      "FETCH",
      `HTTP ${res.status} get_versiones idNorma=${idNorma}`
    );
  return res.json();
}

// --- cita --------------------------------------------------------------------------

function validateSelector(sel) {
  const hasTarget = sel.art != null || sel.idParte != null || sel.transitorio != null;
  if (!hasTarget)
    throw new CiteError(
      "BAD_SELECTOR",
      "se requiere uno de --art | --idParte | --transitorio"
    );
  const locCount =
    (sel.inciso != null ? 1 : 0) +
    (sel.numeral != null ? 1 : 0) +
    (sel.final ? 1 : 0);
  if (locCount > 1)
    throw new CiteError(
      "BAD_SELECTOR",
      "solo uno de --inciso | --numeral | --final"
    );
  if (sel.inciso != null && (!Number.isInteger(sel.inciso) || sel.inciso < 1))
    throw new CiteError("BAD_SELECTOR", "--inciso debe ser un entero >= 1");
}

/**
 * @typedef {object} CiteResolvedDate
 * @property {string} iso
 * @property {string} rule
 * @property {number} [n]
 * @property {string} [unit]
 * @property {string} [anchor]
 */

/**
 * @typedef {object} CiteResult
 * @property {string} literal
 * @property {object} locator
 * @property {object} version
 * @property {object[]} notes
 * @property {CiteResolvedDate} [resolvedDate] Solo con resolveDates y fecha resoluble.
 */

/**
 * @typedef {object} CiteOptions
 * @property {string} [idVersion]
 * @property {boolean} [resolveDates]
 * @property {string} [cacheDir]
 * @property {boolean} [noCache]
 * @property {object} [data] Norma inyectada (fixture): evita la red.
 */

// Cita pura sobre datos ya cargados (sin red). Lanza CiteError en
// NOT_FOUND (parte/bloque ausente) o RESIDUE (resto de nota: fail-closed).
/**
 * @param {any} data
 * @param {any} selector
 * @param {{ idNorma?: string, idVersion?: string, resolveDates?: boolean }} [options]
 * @returns {CiteResult}
 */
export function citeFromData(
  data,
  selector,
  { idNorma = "?", idVersion = "", resolveDates = false } = {}
) {
  validateSelector(selector);
  const parts = findParts(data, selector);
  if (!parts.length)
    throw new CiteError(
      "NOT_FOUND",
      `parte no encontrada (art=${selector.art ?? "-"} idParte=${selector.idParte ?? "-"} transitorio=${selector.transitorio ?? "-"})`
    );
  const leaf = parts[0];
  const article = normalizePart(leaf);
  const wantsBlock =
    selector.inciso != null || selector.final || selector.numeral != null;
  const block = wantsBlock ? selectBlock(article, selector) : null;
  if (wantsBlock && !block)
    throw new CiteError(
      "NOT_FOUND",
      `bloque no encontrado (inciso=${selector.inciso ?? "-"} numeral=${selector.numeral ?? "-"} final=${selector.final ? "si" : "-"}) en ${article.blocks.length} bloques`
    );
  const literal = block ? block.text : article.fullText;
  const residue = checkNoteResidue(literal);
  if (residue)
    throw new CiteError(
      "RESIDUE",
      `cita rechazada (fail-closed): ${residue}. ` +
        `idParte=${article.idParte}. No se devuelve literal sucio.`
    );
  const meta = data.metadatos ?? {};
  const locator = {
    idNorma: String(idNorma),
    ...(selector.art != null && { art: String(selector.art) }),
    ...(selector.idParte != null && { idParte: String(selector.idParte) }),
    ...(selector.transitorio != null && {
      transitorio: String(selector.transitorio),
    }),
    ...(selector.inciso != null && { inciso: selector.inciso }),
    ...(selector.numeral != null && { numeral: String(selector.numeral) }),
    ...(selector.final ? { final: true } : {}),
    idParteResolved: article.idParte,
    name: article.name,
  };
  const version = {
    idNorma: String(idNorma),
    idVersion: idVersion || "latest",
    fechaPublicacion: meta.fecha_publicacion ?? null,
    tituloNorma: (meta.titulo_norma ?? "").slice(0, 160) || null,
  };
  const result = { literal, locator, version, notes: article.notes };
  if (resolveDates && meta.fecha_publicacion) {
    const info = resolveRelativeDate(literal, meta.fecha_publicacion);
    if (info.iso)
      result.resolvedDate = {
        iso: info.iso,
        rule: info.rule,
        n: info.n,
        unit: info.unit,
        anchor: info.anchor,
      };
  }
  return result;
}

// Cita con red + cache. Acepta data inyectada (fixture) para uso hermetico.
/**
 * @param {string} idNorma
 * @param {any} selector
 * @param {CiteOptions} [options]
 * @returns {Promise<CiteResult>}
 */
export async function cite(
  idNorma,
  selector,
  { idVersion = "", resolveDates = false, cacheDir, noCache, data } = {}
) {
  const norma = data ?? (await fetchNorma(idNorma, { idVersion, cacheDir, noCache }));
  return citeFromData(norma, selector, { idNorma, idVersion, resolveDates });
}

// --- CLI -----------------------------------------------------------------------------

function printHelp() {
  console.log(
    `Uso: node scripts/bcn-cite.mjs <idNorma|norma.json> --art N|--idParte X|--transitorio T
       [--inciso N|--numeral N|--final] [--idVersion YYYY-MM-DD]
       [--resolve-dates] [--json] [--cache-dir DIR] [--no-cache]
     node scripts/bcn-cite.mjs --golden [golden.json] [--sleep-ms N]
       [--cache-dir DIR] [--no-cache]
     node scripts/bcn-cite.mjs --versions <idNorma>
     node scripts/bcn-cite.mjs --help`
  );
}

function cliError(message) {
  console.error(`[bcn-cite] FALLO (args): ${message}`);
  printHelp();
  process.exit(2);
}

function optValue(argv, name) {
  const i = argv.indexOf(name);
  if (i < 0) return undefined;
  const v = argv[i + 1];
  if (v == null || v.startsWith("--")) cliError(`${name} requiere un valor`);
  return v;
}

const hasFlag = (argv, name) => argv.includes(name);

function parseSelector(argv) {
  const art = optValue(argv, "--art");
  const idParte = optValue(argv, "--idParte");
  const transitorio = optValue(argv, "--transitorio");
  const incisoRaw = optValue(argv, "--inciso");
  const numeral = optValue(argv, "--numeral");
  const final = hasFlag(argv, "--final");
  if (art != null && !/^\d+\s*(bis|ter)?$/i.test(art))
    cliError(`--art invalido: "${art}"`);
  if (idParte != null && !/^\d+$/.test(idParte))
    cliError(`--idParte invalido: "${idParte}" (solo digitos)`);
  let inciso;
  if (incisoRaw != null) {
    inciso = Number(incisoRaw);
    if (!Number.isInteger(inciso) || inciso < 1)
      cliError(`--inciso invalido: "${incisoRaw}" (entero >= 1)`);
  }
  const idVersion = optValue(argv, "--idVersion");
  if (idVersion != null && !/^\d{4}-\d{2}-\d{2}$/.test(idVersion))
    cliError(`--idVersion invalido: "${idVersion}" (YYYY-MM-DD)`);
  return { art, idParte, transitorio, inciso, numeral, final, idVersion };
}

async function loadNorma(spec, { idVersion, cacheDir, noCache }) {
  if (/^\d+$/.test(spec)) return fetchNorma(spec, { idVersion, cacheDir, noCache });
  return JSON.parse(fs.readFileSync(spec, "utf8"));
}

function formatHuman(result) {
  const lines = [];
  lines.push(
    `NORMA idNorma=${result.locator.idNorma} :: ${result.version.tituloNorma ?? ""}`.trim()
  );
  lines.push(
    `locator: ${result.locator.name} (idParte=${result.locator.idParteResolved}) version=${result.version.idVersion} publicacion=${result.version.fechaPublicacion ?? "?"}`
  );
  lines.push(`===== CITA LITERAL =====`);
  lines.push(result.literal);
  if (result.resolvedDate)
    lines.push(
      `fecha-resuelta: ${result.resolvedDate.iso} (regla: "${result.resolvedDate.rule}")`
    );
  lines.push(
    `--- notas marginales separadas (${result.notes.length}): ` +
      (result.notes
        .map(n => `[${n.kind}] ${n.text}`.slice(0, 90))
        .join(" // ") || "(ninguna)")
  );
  return lines.join("\n");
}

async function runGolden(goldenFile, { sleepMs, cacheDir, noCache }) {
  const golden = JSON.parse(fs.readFileSync(goldenFile, "utf8"));
  const byNorma = new Map();
  for (const q of golden.quotes) {
    const k = `${q.idNorma}@${q.idVersion || ""}`;
    if (!byNorma.has(k)) byNorma.set(k, []);
    byNorma.get(k).push(q);
  }
  let pass = 0;
  let fail = 0;
  const failures = [];
  for (const [key, qs] of byNorma) {
    const [idNorma, idVersion] = key.split("@");
    const data = await fetchNorma(idNorma, { idVersion, cacheDir, noCache });
    await new Promise(r => setTimeout(r, sleepMs));
    for (const q of qs) {
      try {
        const idP = q.idParte ?? q.locator.idParte;
        const sel = { ...(idP ? { idParte: idP } : {}), ...q.locator };
        const result = citeFromData(data, sel, {
          idNorma,
          idVersion,
          resolveDates: Boolean(q.expectDate),
        });
        const okText = result.literal === q.expected;
        let okDate = true;
        if (q.expectDate) okDate = result.resolvedDate?.iso === q.expectDate;
        if (okText && okDate) {
          pass++;
          console.log(`PASS ${q.id} — ${q.locatorLabel}`);
        } else {
          fail++;
          failures.push(q.id);
          console.log(
            `FAIL ${q.id} — ${q.locatorLabel} (texto:${okText ? "ok" : "DIFIERE"} fecha:${q.expectDate ? (okDate ? "ok" : `DIFIERE got=${result.resolvedDate?.iso} want=${q.expectDate}`) : "n/a"})`
          );
        }
      } catch (e) {
        fail++;
        failures.push(q.id);
        console.log(
          `FAIL ${q.id} — ${e instanceof CiteError ? `[${e.code}] ${e.message}` : e.message}`
        );
      }
    }
  }
  const total = pass + fail;
  console.log(`\nGOLDEN: ${pass}/${total} EXACT`);
  if (failures.length) console.log("fallos:", failures.join(", "));
  process.exit(fail ? 1 : 0);
}

async function main() {
  const argv = process.argv.slice(2);
  if (hasFlag(argv, "--help") || hasFlag(argv, "-h")) {
    printHelp();
    return;
  }
  if (hasFlag(argv, "--versions")) {
    const id = argv[argv.indexOf("--versions") + 1];
    if (!id || !/^\d+$/.test(id)) cliError("--versions requiere un idNorma numerico");
    const v = await getVersions(id);
    console.log(JSON.stringify(v, null, 2).slice(0, 3000));
    return;
  }
  if (hasFlag(argv, "--golden")) {
    const gi = argv.indexOf("--golden");
    const maybeFile =
      argv[gi + 1] && !argv[gi + 1].startsWith("--") ? argv[gi + 1] : DEFAULT_GOLDEN;
    const sleepRaw = optValue(argv, "--sleep-ms");
    const sleepMs = sleepRaw != null ? Number(sleepRaw) : 1500;
    if (!Number.isFinite(sleepMs) || sleepMs < 0)
      cliError(`--sleep-ms invalido: "${sleepRaw}"`);
    const cacheDir = optValue(argv, "--cache-dir") ?? DEFAULT_CACHE_DIR;
    await runGolden(maybeFile, {
      sleepMs,
      cacheDir,
      noCache: hasFlag(argv, "--no-cache"),
    });
    return;
  }
  const known = new Set([
    "--art",
    "--idParte",
    "--transitorio",
    "--inciso",
    "--numeral",
    "--final",
    "--idVersion",
    "--resolve-dates",
    "--json",
    "--cache-dir",
    "--no-cache",
  ]);
  for (const a of argv) {
    if (a.startsWith("--") && !known.has(a)) cliError(`flag desconocido: "${a}"`);
  }
  const spec = argv[0];
  if (!spec) cliError("se requiere <idNorma|norma.json>");
  if (!/^\d+$/.test(spec) && !fs.existsSync(spec))
    cliError(`idNorma invalido o archivo inexistente: "${spec}"`);
  const sel = parseSelector(argv);
  if (sel.art == null && sel.idParte == null && sel.transitorio == null)
    cliError("se requiere uno de --art | --idParte | --transitorio");
  const locCount =
    (sel.inciso != null ? 1 : 0) + (sel.numeral != null ? 1 : 0) + (sel.final ? 1 : 0);
  if (locCount > 1) cliError("solo uno de --inciso | --numeral | --final");
  const cacheDir = optValue(argv, "--cache-dir") ?? DEFAULT_CACHE_DIR;
  const noCache = hasFlag(argv, "--no-cache");
  try {
    const data = await loadNorma(spec, {
      idVersion: sel.idVersion || "",
      cacheDir,
      noCache,
    });
    const idNorma = /^\d+$/.test(spec) ? spec : (data.metadatos?.id_norma ?? spec);
    const result = citeFromData(
      data,
      {
        art: sel.art ?? undefined,
        idParte: sel.idParte ?? undefined,
        transitorio: sel.transitorio ?? undefined,
        inciso: sel.inciso,
        numeral: sel.numeral ?? undefined,
        final: sel.final || undefined,
      },
      {
        idNorma: String(idNorma),
        idVersion: sel.idVersion || "",
        resolveDates: hasFlag(argv, "--resolve-dates"),
      }
    );
    if (hasFlag(argv, "--json")) console.log(JSON.stringify(result, null, 2));
    else console.log(formatHuman(result));
  } catch (e) {
    if (e instanceof CiteError) {
      console.error(`[bcn-cite] FALLO [${e.code}]: ${e.message}`);
      process.exit(1);
    }
    throw e;
  }
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH;
if (isDirectRun) {
  main().catch(error => {
    console.error(`[bcn-cite] FALLO: ${error.message}`);
    process.exit(1);
  });
}
