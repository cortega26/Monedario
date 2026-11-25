#!/usr/bin/env node

/**
 * collect-serp-snapshot
 *
 * Growth Engine (fuente libre, ejecución local): captura el SERP de Google Chile
 * (google.cl, gl=cl, hl=es) y lo normaliza. Responde lo que GSC no puede: qué
 * hay en la página de resultados (AI Overview, cuadro de respuesta, "otras
 * preguntas", quién ocupa el top 10) y por qué una consulta con buena posición
 * tiene CTR casi nulo.
 *
 * Proveedor: SerpApi, plan gratuito: 250 búsquedas al mes, ciclo de
 * facturación del 25 al 25 (verificado con la API de la cuenta el 2026-11-25).
 * Cupo mensual, no diario, y el no usado se pierde al renovar. Lo limitante no
 * es el cupo sino cuántas consultas valen la pena, así que el script lo gasta
 * donde más información aporta:
 *   - Saldo real del proveedor como tope (la consulta a la cuenta es gratis) y
 *     una reserva que nunca se gasta automáticamente.
 *   - Consultas casi duplicadas se agrupan (tier 3, cada 27 días).
 *   - Se omiten consultas de volumen irrelevante (salvo `pinned`).
 *   - El lote de cada corrida se llena por valor esperado: clics perdidos ×
 *     volatilidad (historial) × antigüedad.
 *   - `--discover`: barrido acotado de las consultas de GSC con más clics
 *     perdidos que aún no se conocen, para ver dónde manda una función del SERP.
 *   - Excedente móvil: con el cupo que sobra de cada corrida se repiten las
 *     consultas clave con `device=mobile` (donde está la mayor parte del
 *     tráfico) y el brief compara móvil contra escritorio.
 *
 * Reglas (ver docs/operations/runbooks/serp-snapshot.md):
 *   - Solo local: a mano o con el timer `systemd --user` de ops/serp/. Se omite
 *     en CI (EXTERNAL-INTELLIGENCE-CONTRACT).
 *   - Por defecto solo imprime el plan y el presupuesto; gasta cupo con --run.
 *   - Los datos son `internal-only` y viven en output/external-intelligence/
 *     (gitignoreado). La clave nunca se imprime ni se escribe en la salida.
 *
 * Ritmo recomendado: lunes y jueves (los días en que corre data-signals, para
 * comparar semana contra semana) con `--auto --run`, y cierre del ciclo el día
 * anterior a la renovación (el cupo no usado se pierde al renovar).
 *
 * Uso:
 *   node scripts/collect-serp-snapshot.mjs --auto             # plan de hoy (sin gastar)
 *   node scripts/collect-serp-snapshot.mjs --auto --run       # corrida de hoy
 *   node scripts/collect-serp-snapshot.mjs --run --query "uf hoy"
 *   node scripts/collect-serp-snapshot.mjs --run --force      # ignora cadencia/caché
 *   node scripts/collect-serp-snapshot.mjs --discover [N]     # plan del barrido
 *   node scripts/collect-serp-snapshot.mjs --run --mobile [N] # consultas clave en móvil
 *   node scripts/collect-serp-snapshot.mjs --auto --run --no-mobile
 *   node scripts/collect-serp-snapshot.mjs --auto --run --any-day   # fuera de lunes/jueves
 *   node scripts/collect-serp-snapshot.mjs --report           # reconstruye salidas
 *
 * Clave: SERPAPI_API_KEY (entorno, .env.local o .env en la raíz del repo).
 */

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnvFile } from "./collect-bing-queries.mjs";
import { previousCompleteISOWeek } from "./data-signals/gsc-utils.mjs";
import { mergeExternalIntelligence } from "./lib/external-intelligence.mjs";
import {
  expectedCtrForPosition,
  tokenize,
} from "./lib/growth-opportunities.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, "..");

export const SERPAPI_ENDPOINT = "https://serpapi.com/search.json";
export const SERPAPI_ACCOUNT_ENDPOINT = "https://serpapi.com/account.json";
export const FREE_PLAN_MONTHLY_SEARCHES = 250;
export const RESERVE_SEARCHES = 30;
// Tope propio por mes: todo el plan menos la reserva (el saldo real del
// proveedor manda; esto solo protege si la consulta a la cuenta falla).
export const DEFAULT_MONTHLY_CAP = FREE_PLAN_MONTHLY_SEARCHES - RESERVE_SEARCHES;
export const RUN_WEEKDAYS = [1, 4]; // lunes y jueves (ISO), como data-signals
export const CLOSE_MARGIN = 5;
export const SANTIAGO_TZ = "America/Santiago";
export const WARN_RATIO = 0.8;
// La caché debe vencer antes que la cadencia, o la corrida no vería datos nuevos.
export const CACHE_TTL_DAYS = 2;
export const FREE_SOURCE_ID = "serpapi-google-cl";
const DAY_MS = 86_400_000;
// Separación mínima (días) entre capturas de una misma consulta, por tier.
const DEFAULT_CADENCE = { 1: 3, 2: 9, 3: 27 };

const OFFICIAL_DOMAIN_SUFFIXES = [
  "sii.cl",
  "ine.gob.cl",
  "bcentral.cl",
  "cmfchile.cl",
  "spensiones.cl",
  "chileatiende.gob.cl",
  "tesoreria.cl",
  "dt.gob.cl",
  "bcn.cl",
];

const normQuery = query =>
  String(query ?? "")
    .trim()
    .toLowerCase();

// ---------------------------------------------------------------------------
// Utilidades puras
// ---------------------------------------------------------------------------

export function isCiEnvironment(env = process.env) {
  return env.CI === "true" || env.CI === "1" || Boolean(env.GITHUB_ACTIONS);
}

export function monthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

export function querySlug(query) {
  return String(query ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function cacheKey(query, market, device = "desktop") {
  const parts = [
    normQuery(query),
    market.gl,
    market.hl,
    market.google_domain,
    market.location,
  ];
  // El hash de escritorio se mantiene idéntico: no invalida la caché previa.
  if (device !== "desktop") parts.push(device);
  return createHash("sha1")
    .update(parts.join("|"))
    .digest("hex")
    .slice(0, 16);
}

/** 401/403 (clave) y 429 (límite): reintentar otras consultas no sirve. */
export function isFatalProviderStatus(status) {
  return status === 401 || status === 403 || status === 429;
}

export function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

function matchesDomain(domain, suffix) {
  return (
    Boolean(domain) && (domain === suffix || domain.endsWith(`.${suffix}`))
  );
}

export function isOfficialDomain(domain) {
  if (!domain) return false;
  if (domain.endsWith(".gob.cl") || domain === "gob.cl") return true;
  return OFFICIAL_DOMAIN_SUFFIXES.some(suffix => matchesDomain(domain, suffix));
}

// ---------------------------------------------------------------------------
// Presupuesto (libro mensual + saldo real del proveedor)
// ---------------------------------------------------------------------------

export function emptyLedger() {
  return { version: 1, months: {} };
}

export function ledgerUsed(ledger, month, kind) {
  const bucket = ledger?.months?.[month];
  if (!bucket) return 0;
  if (!kind) return bucket.count ?? 0;
  return (bucket.calls ?? []).filter(call => (call.kind ?? "routine") === kind)
    .length;
}

export function recordCall(ledger, { query, at, kind = "routine" }) {
  const next = structuredClone(ledger ?? emptyLedger());
  const month = monthKey(new Date(at));
  const bucket = next.months[month] ?? { count: 0, calls: [] };
  bucket.count += 1;
  bucket.calls.push({ query, at, kind });
  next.months[month] = bucket;
  return next;
}

export function budgetStatus({
  used,
  cap,
  planLimit = FREE_PLAN_MONTHLY_SEARCHES,
}) {
  const effectiveCap = Math.min(cap, planLimit);
  return {
    used,
    cap: effectiveCap,
    remaining: Math.max(0, effectiveCap - used),
    blocked: used >= effectiveCap,
    warn: used >= Math.floor(effectiveCap * WARN_RATIO),
    planLimit,
  };
}

/**
 * Presupuesto efectivo: el menor entre el tope propio y el saldo real del
 * proveedor menos una reserva que el script nunca gasta por su cuenta.
 */
export function effectiveBudget({
  used,
  cap,
  providerLeft,
  reserve = RESERVE_SEARCHES,
  planLimit = FREE_PLAN_MONTHLY_SEARCHES,
}) {
  const base = budgetStatus({ used, cap, planLimit });
  const providerRoom =
    typeof providerLeft === "number"
      ? Math.max(0, providerLeft - reserve)
      : Number.POSITIVE_INFINITY;
  const remaining = Math.min(base.remaining, providerRoom);
  return {
    ...base,
    providerLeft: typeof providerLeft === "number" ? providerLeft : null,
    reserve,
    remaining,
    blocked: remaining <= 0,
  };
}

/** Gasto rutinario esperado por mes según tier y cadencia. */
export function projectMonthlySpend(queries, cadenceDays = DEFAULT_CADENCE) {
  const total = queries.reduce((sum, entry) => {
    const days = cadenceDays[String(entry.tier ?? 1)] ?? 14;
    return sum + 30 / days;
  }, 0);
  return Math.round(total * 10) / 10;
}

// ---------------------------------------------------------------------------
// Selección de consultas
// ---------------------------------------------------------------------------

/**
 * @param {{query:string, tier?:number}[]} queries
 * @param {Map<string,string>} lastRetrieved slug -> ISO date
 */
export function selectDue(queries, lastRetrieved, now, config) {
  const cadence = { ...DEFAULT_CADENCE, ...(config?.cadenceDays ?? {}) };
  const due = [];
  for (const entry of queries) {
    const last = lastRetrieved.get(querySlug(entry.query));
    const days = cadence[String(entry.tier ?? 1)] ?? 14;
    const age = last ? (now - new Date(last).getTime()) / DAY_MS : Infinity;
    if (age >= days) {
      due.push({ ...entry, ageDays: Number.isFinite(age) ? Math.floor(age) : null });
    }
  }
  return due;
}

/** Omite consultas de volumen irrelevante, salvo las marcadas `pinned`. */
export function applyVolumeGate(entries, gscByQuery, minImpressions) {
  const keep = [];
  const skipped = [];
  for (const entry of entries) {
    const gsc = gscByQuery.get(normQuery(entry.query));
    const impressions = gsc?.impressions ?? null;
    if (entry.pinned || impressions === null || impressions >= minImpressions) {
      keep.push({ ...entry, impressions });
    } else {
      skipped.push({ ...entry, impressions });
    }
  }
  return { keep, skipped };
}

/** Mayor volumen primero: si el cupo no alcanza, se gasta en lo que más pesa. */
export function prioritize(entries) {
  return [...entries].sort(
    (a, b) =>
      (b.impressions ?? 0) - (a.impressions ?? 0) ||
      a.query.localeCompare(b.query)
  );
}

// ---------------------------------------------------------------------------
// Historial y asignación adaptativa del lote de cada corrida
// ---------------------------------------------------------------------------

/** Resumen compacto de una captura para el historial (una línea por captura). */
export function historyRecord(snapshot) {
  return {
    at: snapshot.retrievedAt,
    features: [...snapshot.features].sort(),
    ours: snapshot.ours?.position ?? null,
    top3: snapshot.organic.slice(0, 3).map(row => row.domain),
    answerBox: snapshot.answerBox?.type ?? null,
    citesUs: snapshot.aiOverview?.citesUs ?? null,
  };
}

/**
 * Volatilidad 0..1 según cuánto cambió el SERP entre las últimas capturas
 * (funciones, nuestra posición, top 3). Con menos de 2 capturas devuelve 0,5:
 * no se sabe, así que vale la pena volver a mirar.
 */
export function volatility(records) {
  const recent = (records ?? []).slice(-5);
  if (recent.length < 2) return 0.5;
  let total = 0;
  for (let i = 1; i < recent.length; i += 1) {
    const prev = recent[i - 1];
    const cur = recent[i];
    const before = new Set(prev.features);
    const after = new Set(cur.features);
    const union = new Set([...before, ...after]);
    const featureDiff = union.size
      ? [...union].filter(f => before.has(f) !== after.has(f)).length /
        union.size
      : 0;
    let positionDiff;
    if (prev.ours === null || cur.ours === null) {
      positionDiff = prev.ours === cur.ours ? 0 : 1;
    } else {
      positionDiff = Math.min(1, Math.abs(prev.ours - cur.ours) / 5);
    }
    const topDiff =
      prev.top3.filter(domain => !cur.top3.includes(domain)).length /
      Math.max(1, prev.top3.length);
    total += (featureDiff + positionDiff + topDiff) / 3;
  }
  return Math.min(1, total / (recent.length - 1));
}

/**
 * Valor esperado de volver a capturar una consulta: clics perdidos estimados
 * (impresiones por la brecha de CTR) × (0,5 + volatilidad) × antigüedad
 * relativa a su separación mínima. Lo estable y barato pierde prioridad solo.
 */
export function queryScore({
  impressions,
  ctr,
  position,
  volatility: vol,
  ageDays,
  minGapDays,
  bands,
}) {
  const imp = impressions ?? 0;
  const expected = expectedCtrForPosition(position ?? 10, bands);
  const lost = imp * Math.max(0, expected - (ctr ?? 0));
  const value = lost > 0 ? lost : imp * 0.005;
  const staleness = Math.min(3, (ageDays ?? minGapDays * 3) / minGapDays);
  return Math.round((value + 1) * (0.5 + vol) * staleness * 100) / 100;
}

/** Elige, de la lista, las consultas que más conviene capturar en esta corrida. */
export function planRun({
  entries,
  lastRetrieved,
  histories,
  gscByQuery,
  now,
  minGapDays,
  minImpressions,
  slots,
  bands,
}) {
  const scored = [];
  for (const entry of entries) {
    const slug = querySlug(entry.query);
    const last = lastRetrieved.get(slug);
    const ageDays = last ? (now - new Date(last).getTime()) / DAY_MS : null;
    const gap = minGapDays[String(entry.tier ?? 2)] ?? 9;
    if (ageDays !== null && ageDays < gap) continue;
    const gsc = gscByQuery.get(normQuery(entry.query));
    if (!entry.pinned && gsc && gsc.impressions < minImpressions) continue;
    const score = queryScore({
      impressions: gsc?.impressions ?? null,
      ctr: gsc?.ctr ?? null,
      position: gsc?.position ?? null,
      volatility: volatility(histories.get(slug) ?? []),
      ageDays,
      minGapDays: gap,
      bands,
    });
    scored.push({ ...entry, impressions: gsc?.impressions ?? null, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.query.localeCompare(b.query))
    .slice(0, Math.max(0, slots));
}

// ---------------------------------------------------------------------------
// Calendario: corridas fijas (lunes y jueves) y cierre del ciclo de facturación
// ---------------------------------------------------------------------------

/** Fecha y día ISO de la semana (lunes = 1 … domingo = 7) en la zona dada. */
export function localDate(now, timeZone = SANTIAGO_TZ) {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(now));
  return { ymd, weekday: isoWeekday(ymd) };
}

export function isoWeekday(ymd) {
  const day = new Date(`${ymd}T00:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

export function addDays(ymd, delta) {
  const date = new Date(`${ymd}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

/** Corridas programadas en [from, toExclusive). */
export function countRunDays(fromYmd, toExclusiveYmd, weekdays) {
  let count = 0;
  for (let day = fromYmd; day < toExclusiveYmd; day = addDays(day, 1)) {
    if (weekdays.includes(isoWeekday(day))) count += 1;
  }
  return count;
}

/** Próximo día de corrida (o el de cierre) después de la fecha dada. */
export function nextRunDay(fromYmd, weekdays, closingYmd) {
  for (let i = 1; i <= 14; i += 1) {
    const day = addDays(fromYmd, i);
    if (day === closingYmd || weekdays.includes(isoWeekday(day))) return day;
  }
  return null;
}

/**
 * Tamaño del lote de hoy. Corridas fijas (p. ej. lunes y jueves) comparables
 * entre semanas; el saldo gastable (saldo real menos reserva) se reparte entre
 * las que quedan y lo que no se use se acumula. El día anterior a la renovación
 * del plan (cierre del ciclo) se barre todo lo que quede, con un margen mínimo:
 * el cupo no usado se pierde al renovar, así que ya no hace falta la reserva.
 */
export function runBudget({
  providerLeft,
  reserve = RESERVE_SEARCHES,
  renewalDate,
  now,
  weekdays = RUN_WEEKDAYS,
  maxPerRun = 30,
  closeMargin = CLOSE_MARGIN,
  fallbackCap = DEFAULT_MONTHLY_CAP,
  timeZone = SANTIAGO_TZ,
}) {
  const today = localDate(now, timeZone);
  const closingDay = renewalDate ? addDays(renewalDate, -1) : null;
  const isClosingDay = closingDay !== null && today.ymd === closingDay;
  const isRunDay = isClosingDay || weekdays.includes(today.weekday);
  const known = typeof providerLeft === "number" && closingDay !== null;
  if (!known) {
    // Sin dato del plan: lote estimado con el tope propio.
    return {
      mode: "routine",
      perRun: Math.floor(fallbackCap / (weekdays.length * 4.3)),
      runsLeft: null,
      isRunDay: weekdays.includes(today.weekday),
      isClosingDay: false,
      closingDay,
      next: nextRunDay(today.ymd, weekdays, null),
    };
  }
  if (isClosingDay) {
    return {
      mode: "close",
      perRun: Math.max(0, providerLeft - closeMargin),
      runsLeft: 0,
      isRunDay: true,
      isClosingDay: true,
      closingDay,
      next: null,
    };
  }
  const runsLeft = countRunDays(today.ymd, closingDay, weekdays);
  const spendable = Math.max(0, providerLeft - reserve);
  return {
    mode: "routine",
    perRun: runsLeft > 0 ? Math.min(maxPerRun, Math.floor(spendable / runsLeft)) : 0,
    runsLeft,
    isRunDay,
    isClosingDay: false,
    closingDay,
    next: nextRunDay(today.ymd, weekdays, closingDay),
  };
}

/**
 * Diferencias entre el SERP de escritorio y el móvil de una consulta: función
 * que aparece solo en uno, cambio de nuestra posición y del top 3.
 */
export function compareDevices(desktop, mobile) {
  const d = new Set(desktop.features);
  const m = new Set(mobile.features);
  const dPos = desktop.ours?.position ?? null;
  const mPos = mobile.ours?.position ?? null;
  const dTop = desktop.organic.slice(0, 3).map(row => row.domain);
  const mTop = mobile.organic.slice(0, 3).map(row => row.domain);
  return {
    onlyMobile: [...m].filter(f => !d.has(f)),
    onlyDesktop: [...d].filter(f => !m.has(f)),
    desktopPosition: dPos,
    mobilePosition: mPos,
    positionDelta: dPos !== null && mPos !== null ? mPos - dPos : null,
    enteredOrLeftTop10: (dPos === null) !== (mPos === null),
    top3Changed: dTop.some(domain => !mTop.includes(domain)),
  };
}

/**
 * Pasada móvil con el excedente de la corrida: consultas clave (tier 1 y 2, o
 * fijadas) ordenadas por valor esperado, con su propia separación mínima desde
 * la última captura móvil. Nunca incluye las descubiertas ni las de tier 3.
 */
export function planMobile({
  entries,
  lastMobile,
  gscByQuery,
  now,
  gapDays,
  minImpressions,
  slots,
  bands,
}) {
  const scored = [];
  for (const entry of entries) {
    if ((entry.tier ?? 2) > 2 && !entry.pinned) continue;
    const last = lastMobile.get(querySlug(entry.query));
    const ageDays = last ? (now - new Date(last).getTime()) / DAY_MS : null;
    if (ageDays !== null && ageDays < gapDays) continue;
    const gsc = gscByQuery.get(normQuery(entry.query));
    if (!entry.pinned && gsc && gsc.impressions < minImpressions) continue;
    const score = queryScore({
      impressions: gsc?.impressions ?? null,
      ctr: gsc?.ctr ?? null,
      position: gsc?.position ?? null,
      volatility: 0.5,
      ageDays,
      minGapDays: gapDays,
      bands,
    });
    scored.push({ ...entry, impressions: gsc?.impressions ?? null, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.query.localeCompare(b.query))
    .slice(0, Math.max(0, slots));
}

export function tokenSimilarity(a, b) {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (!setA.size || !setB.size) return 0;
  let shared = 0;
  for (const token of setA) if (setB.has(token)) shared += 1;
  return shared / (setA.size + setB.size - shared);
}

/**
 * Consultas de GSC con más clics perdidos (impresiones por la brecha entre el
 * CTR esperado para su posición y el propio) que aún no se conocen. Evita
 * gastar en variantes casi idénticas de lo ya capturado o ya elegido.
 */
export function discoverCandidates(rows, options) {
  const {
    known = [],
    minImpressions = 200,
    maxCtr = 0.02,
    similarityMax = 0.6,
    bands,
    limit = 20,
  } = options;
  const knownNorm = new Set(known.map(normQuery));
  const pool = rows
    .filter(
      row =>
        typeof row.query === "string" &&
        (row.impressions ?? 0) >= minImpressions &&
        (row.ctr ?? 0) <= maxCtr &&
        !knownNorm.has(normQuery(row.query))
    )
    .map(row => {
      const expected = expectedCtrForPosition(row.position ?? 10, bands);
      return {
        query: row.query,
        impressions: row.impressions,
        ctr: row.ctr ?? 0,
        position: row.position ?? null,
        lostClicks: Math.round(
          row.impressions * Math.max(0, expected - (row.ctr ?? 0))
        ),
      };
    })
    .sort((a, b) => b.lostClicks - a.lostClicks || b.impressions - a.impressions);

  const picked = [];
  for (const candidate of pool) {
    if (picked.length >= limit) break;
    const clash = [...known, ...picked.map(p => p.query)].some(
      other => tokenSimilarity(candidate.query, other) >= similarityMax
    );
    if (!clash) picked.push(candidate);
  }
  return picked;
}

// ---------------------------------------------------------------------------
// Normalización de la respuesta del proveedor
// ---------------------------------------------------------------------------

/**
 * Convierte la respuesta cruda de SerpApi (engine=google) al formato interno.
 * El esquema se validó con capturas reales (2026-11-25); si un campo cambia,
 * la función degrada a "ausente" en vez de fallar.
 */
export function normalizeSerp(
  raw,
  { query, retrievedAt, ourDomain = "monedario.cl", device = "desktop" }
) {
  const organic = (raw?.organic_results ?? [])
    .slice(0, 10)
    .map((row, index) => ({
      position: row.position ?? index + 1,
      domain: domainOf(row.link),
      url: row.link ?? null,
      title: row.title ?? "",
      snippet: row.snippet ?? "",
    }));

  const features = [];
  const ai = raw?.ai_overview ?? null;
  if (ai) features.push("ai_overview");
  if (raw?.answer_box) features.push("answer_box");
  if (raw?.related_questions?.length) features.push("people_also_ask");
  if (raw?.knowledge_graph) features.push("knowledge_graph");
  if (raw?.ads?.length) features.push("top_ads");
  if (raw?.local_results) features.push("local_pack");
  if (raw?.inline_videos?.length || raw?.short_videos?.length)
    features.push("videos");
  if (raw?.discussions_and_forums?.length) features.push("forums");
  if (raw?.top_stories?.length) features.push("top_stories");
  if (raw?.shopping_results?.length) features.push("shopping");

  const ours = organic.find(
    row => row.domain && matchesDomain(row.domain, ourDomain)
  );
  const aiCited = [
    ...new Set(
      (ai?.references ?? []).map(ref => domainOf(ref.link)).filter(Boolean)
    ),
  ];

  return {
    query,
    retrievedAt,
    device,
    market: { gl: "cl", hl: "es", google_domain: "google.cl" },
    totalResults: raw?.search_information?.total_results ?? null,
    features,
    answerBox: raw?.answer_box
      ? {
          type: raw.answer_box.type ?? null,
          source: domainOf(raw.answer_box.link) ?? null,
        }
      : null,
    aiOverview: ai
      ? {
          needsFollowup: Boolean(ai.page_token),
          citedDomains: aiCited,
          citesUs: aiCited.some(domain => matchesDomain(domain, ourDomain)),
        }
      : null,
    adsCount: raw?.ads?.length ?? 0,
    ours: ours ? { position: ours.position, url: ours.url } : null,
    officialInTop10: organic
      .filter(row => isOfficialDomain(row.domain))
      .map(row => ({ position: row.position, domain: row.domain })),
    peopleAlsoAsk: (raw?.related_questions ?? [])
      .map(item => item.question)
      .filter(Boolean)
      .slice(0, 8),
    relatedSearches: (raw?.related_searches ?? [])
      .map(item => item.query)
      .filter(Boolean)
      .slice(0, 8),
    organic,
  };
}

/** Lectura corta de qué manda en el SERP (para el mapa de cero clics). */
export function zeroClickVerdict(snapshot) {
  if (snapshot.answerBox) {
    return `cuadro de respuesta de Google (${snapshot.answerBox.type ?? "s/d"})`;
  }
  if (snapshot.aiOverview) {
    return snapshot.aiOverview.citesUs
      ? "AI Overview que nos cita"
      : "AI Overview sin citarnos";
  }
  if (snapshot.officialInTop10.some(item => item.position <= 3)) {
    return "fuente oficial en el top 3";
  }
  return "SERP orgánico competitivo";
}

// ---------------------------------------------------------------------------
// Integración con Growth Engine
// ---------------------------------------------------------------------------

/**
 * Filas `serpFeatures` del contrato de inteligencia externa. `volume` es la
 * demanda propia (impresiones GSC de la semana) y `ourCtr` el CTR propio; el
 * detector `serp_feature_risk` exige AI Overview, volumen y CTR bajo.
 */
export function buildSerpFeatureRows(snapshots, gscByQuery) {
  return snapshots
    .map(snapshot => {
      const gsc = gscByQuery.get(normQuery(snapshot.query));
      return {
        query: snapshot.query,
        volume: gsc?.impressions ?? null,
        ourCtr: gsc?.ctr ?? null,
        features: snapshot.features,
      };
    })
    .sort(
      (a, b) =>
        (b.volume ?? 0) - (a.volume ?? 0) || a.query.localeCompare(b.query)
    );
}

/**
 * Como `mergeExternalIntelligence`, pero las filas `serpFeatures` de este
 * colector se actualizan en cada corrida mientras la fuente sea libre. Si el
 * archivo ya trae datos de un proveedor de pago, se respetan los suyos.
 */
export function mergeSerpIntoExternal(existing, incoming) {
  const merged = mergeExternalIntelligence(existing, incoming);
  const providerOwned = existing?.source && existing.source !== "free";
  if (!providerOwned) merged.serpFeatures = incoming.serpFeatures;
  return merged;
}

/**
 * Demanda y CTR propios agregando las últimas N semanas de GSC (28 días con
 * N = 4, la ventana del contrato de inteligencia externa). Una semana sola es
 * ruidosa: con varias, el volumen y el CTR de cada consulta son más estables.
 * Posición ponderada por impresiones.
 */
export function loadGscQueryMap(root, weeks = 4) {
  const dir = path.join(root, "output/operations/data-signals/gsc");
  const empty = { week: null, map: new Map(), rows: [] };
  if (!existsSync(dir)) return empty;
  const files = readdirSync(dir)
    .filter(name => /-queries\.json$/.test(name))
    .sort()
    .slice(-Math.max(1, weeks));
  if (!files.length) return empty;
  const totals = new Map();
  const labels = [];
  for (const file of files) {
    const doc = JSON.parse(readFileSync(path.join(dir, file), "utf8"));
    labels.push(doc.week ?? file.replace(/-queries\.json$/, ""));
    for (const row of Array.isArray(doc.data) ? doc.data : []) {
      if (typeof row.query !== "string") continue;
      const key = normQuery(row.query);
      const acc = totals.get(key) ?? {
        query: row.query,
        impressions: 0,
        clicks: 0,
        positionSum: 0,
      };
      const impressions = row.impressions ?? 0;
      acc.impressions += impressions;
      acc.clicks += row.clicks ?? (row.ctr ?? 0) * impressions;
      acc.positionSum += (row.position ?? 0) * impressions;
      totals.set(key, acc);
    }
  }
  const map = new Map();
  const rows = [];
  for (const [key, acc] of totals) {
    const entry = {
      query: acc.query,
      impressions: acc.impressions,
      ctr: acc.impressions ? acc.clicks / acc.impressions : 0,
      position: acc.impressions ? acc.positionSum / acc.impressions : null,
    };
    map.set(key, entry);
    rows.push(entry);
  }
  const week =
    labels.length > 1 ? `${labels[0]}…${labels.at(-1)}` : (labels[0] ?? null);
  return { week, map, rows };
}

// ---------------------------------------------------------------------------
// Salidas legibles
// ---------------------------------------------------------------------------

function pct(value) {
  return typeof value === "number" ? `${(value * 100).toFixed(2)} %` : "s/d";
}

function providerLine(provider) {
  if (!provider) return null;
  return (
    `Saldo del proveedor: ${provider.planSearchesLeft}/${provider.searchesPerMonth ?? "s/d"}` +
    (provider.renewalDate ? `, renueva ${provider.renewalDate}` : "")
  );
}

/**
 * @param {any[]} snapshots
 * @param {{ week: string, gscByQuery: Map<string, any>, budget: any, gscWeek?: string | null, provider?: any, mobile?: Map<string, any> }} options
 */
export function renderBrief(
  snapshots,
  { week, gscByQuery, budget, gscWeek, provider, mobile }
) {
  const lines = [
    `# SERP Chile — brief ${week}`,
    "",
    "Uso interno (`internal-only`). Fuente: SerpApi, google.cl, es-CL. " +
      "Heurístico: es una muestra puntual, no una medición de ranking.",
    `Presupuesto propio del mes: ${budget.used}/${budget.cap} (plan gratuito: ${budget.planLimit}/mes).`,
    providerLine(provider),
    `Demanda y CTR propios: GSC ${gscWeek ?? "s/d"}.`,
    "",
    "| Consulta | Impr. GSC | CTR propio | Pos. SERP | Funciones | Oficiales en top 10 |",
    "|---|---:|---:|---:|---|---|",
  ].filter(line => line !== null);
  for (const snap of snapshots) {
    const gsc = gscByQuery.get(normQuery(snap.query));
    lines.push(
      `| ${snap.query} | ${gsc?.impressions ?? "s/d"} | ${pct(gsc?.ctr)} | ` +
        `${snap.ours?.position ?? "fuera"} | ${snap.features.join(", ") || "—"} | ` +
        `${snap.officialInTop10.map(o => `${o.domain}#${o.position}`).join(", ") || "—"} |`
    );
  }
  lines.push("");
  const comparisons = snapshots.flatMap(snap => {
    const mobileSnap = mobile?.get(querySlug(snap.query));
    return mobileSnap
      ? [{ snap, mobileSnap, diff: compareDevices(snap, mobileSnap) }]
      : [];
  });
  if (comparisons.length) {
    lines.push(
      "## Móvil frente a escritorio",
      "",
      "| Consulta | Pos. escritorio | Pos. móvil | Solo en móvil | Solo en escritorio | Top 3 distinto |",
      "|---|---:|---:|---|---|---|"
    );
    for (const { snap, diff } of comparisons) {
      lines.push(
        `| ${snap.query} | ${diff.desktopPosition ?? "fuera"} | ${diff.mobilePosition ?? "fuera"} | ` +
          `${diff.onlyMobile.join(", ") || "—"} | ${diff.onlyDesktop.join(", ") || "—"} | ` +
          `${diff.top3Changed ? "sí" : "no"} |`
      );
    }
    lines.push("");
  }
  for (const snap of snapshots) {
    lines.push(`## ${snap.query}`, "");
    lines.push(`- Capturado: ${snap.retrievedAt}`);
    if (snap.answerBox) {
      lines.push(
        `- Cuadro de respuesta: tipo \`${snap.answerBox.type ?? "s/d"}\`, fuente ${snap.answerBox.source ?? "s/d"}`
      );
    }
    if (snap.aiOverview) {
      lines.push(
        `- AI Overview: cita ${snap.aiOverview.citedDomains.join(", ") || "sin referencias"}; ` +
          `nos cita: ${snap.aiOverview.citesUs ? "sí" : "no"}` +
          (snap.aiOverview.needsFollowup
            ? " (el proveedor requiere una segunda consulta para el detalle; no se gastó)"
            : "")
      );
    }
    lines.push(
      `- Top 10: ${
        snap.organic.map(row => `${row.position}. ${row.domain}`).join(" · ") ||
        "sin resultados"
      }`
    );
    if (snap.peopleAlsoAsk.length) {
      lines.push(`- Otras preguntas: ${snap.peopleAlsoAsk.join(" | ")}`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

/** Mapa de cero clics del barrido: qué función del SERP manda en cada consulta. */
/**
 * @param {{ snapshot: any, impressions?: number, ctr?: number, position?: number | null, lostClicks?: number }[]} entries
 * @param {{ week: string, gscWeek?: string | null, provider?: any }} options
 */
export function renderDiscoverReport(entries, { week, gscWeek, provider }) {
  const sorted = [...entries].sort(
    (a, b) => (b.lostClicks ?? 0) - (a.lostClicks ?? 0)
  );
  const lines = [
    `# Mapa de cero clics — ${week}`,
    "",
    "Uso interno (`internal-only`). Barrido de consultas de GSC con más clics " +
      "perdidos que no estaban en la lista de seguimiento. Una captura por " +
      "consulta: heurístico, no medición de ranking.",
    providerLine(provider),
    `Demanda y CTR propios: GSC ${gscWeek ?? "s/d"}.`,
    "",
    "| Consulta | Impr. | CTR | Pos. GSC | Clics perdidos est. | Funciones | Pos. SERP | Qué manda |",
    "|---|---:|---:|---:|---:|---|---:|---|",
  ].filter(line => line !== null);
  for (const item of sorted) {
    lines.push(
      `| ${item.snapshot.query} | ${item.impressions ?? "s/d"} | ${pct(item.ctr)} | ` +
        `${item.position ?? "s/d"} | ${item.lostClicks ?? "s/d"} | ` +
        `${item.snapshot.features.join(", ") || "—"} | ` +
        `${item.snapshot.ours?.position ?? "fuera"} | ${zeroClickVerdict(item.snapshot)} |`
    );
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

// ---------------------------------------------------------------------------
// E/S
// ---------------------------------------------------------------------------

export function resolveApiKey(root, env = process.env) {
  if (env.SERPAPI_API_KEY) return env.SERPAPI_API_KEY.trim();
  for (const name of [".env.local", ".env"]) {
    const file = path.join(root, name);
    if (existsSync(file)) {
      const value = parseEnvFile(readFileSync(file, "utf8")).SERPAPI_API_KEY;
      if (value) return value;
    }
  }
  return null;
}

export async function fetchSerp(
  query,
  apiKey,
  market,
  { fetchImpl = fetch, timeoutMs = 30_000, device = "desktop" } = {}
) {
  const search = new URLSearchParams({
    engine: "google",
    q: query,
    google_domain: market.google_domain,
    gl: market.gl,
    hl: market.hl,
    location: market.location,
    api_key: apiKey,
  });
  // Escritorio es el valor por defecto del proveedor: solo se envía si cambia.
  if (device !== "desktop") search.set("device", device);
  const response = await fetchImpl(`${SERPAPI_ENDPOINT}?${search}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    // El cuerpo puede incluir la URL con la clave: no se propaga.
    const error = new Error(`SerpApi HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  const body = await response.json();
  if (body?.error)
    throw new Error(`SerpApi: ${String(body.error).slice(0, 160)}`);
  return body;
}

/**
 * Saldo real del plan. El endpoint de cuenta no consume búsquedas. Falla en
 * silencio (devuelve null): el tope propio sigue protegiendo el gasto.
 */
export async function fetchAccount(
  apiKey,
  { fetchImpl = fetch, timeoutMs = 15_000 } = {}
) {
  try {
    const response = await fetchImpl(
      `${SERPAPI_ACCOUNT_ENDPOINT}?${new URLSearchParams({ api_key: apiKey })}`,
      {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(timeoutMs),
      }
    );
    if (!response.ok) return null;
    const body = await response.json();
    if (typeof body?.plan_searches_left !== "number") return null;
    return {
      planSearchesLeft: body.plan_searches_left,
      searchesPerMonth: body.searches_per_month ?? null,
      renewalDate: body.plan_renewal_date ?? null,
      usage: body.this_month_usage ?? null,
    };
  } catch {
    return null;
  }
}

function readJson(file, fallback) {
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : fallback;
}

function writeJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function readHistory(file) {
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function appendHistory(file, record) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(record)}\n`, { flag: "a" });
}

function readDir(dir) {
  return existsSync(dir)
    ? readdirSync(dir)
        .filter(name => name.endsWith(".json"))
        .map(name => readJson(path.join(dir, name), null))
        .filter(Boolean)
    : [];
}

export function parseArgs(argv) {
  const args = {
    root: DEFAULT_ROOT,
    run: false,
    force: false,
    report: false,
    auto: false,
    anyDay: false,
    mobile: null,
    noMobile: false,
    discover: null,
    queries: [],
    week: null,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === "--run") args.run = true;
    else if (flag === "--auto") args.auto = true;
    else if (flag === "--any-day") args.anyDay = true;
    else if (flag === "--no-mobile") args.noMobile = true;
    else if (flag === "--mobile") {
      const next = argv[i + 1];
      if (next && /^\d+$/.test(next)) {
        args.mobile = Number(next);
        i += 1;
      } else {
        args.mobile = 0; // 0 = lo que permita la separación mínima
      }
    }
    else if (flag === "--force") args.force = true;
    else if (flag === "--report") args.report = true;
    else if (flag === "--discover") {
      const next = argv[i + 1];
      if (next && /^\d+$/.test(next)) {
        args.discover = Number(next);
        i += 1;
      } else {
        args.discover = 0; // 0 = usar el tamaño por defecto de la lista
      }
    } else if (flag === "--query") args.queries.push(argv[(i += 1)]);
    else if (flag === "--week") args.week = argv[(i += 1)];
    else if (flag === "--root") args.root = path.resolve(argv[(i += 1)]);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  if (isCiEnvironment()) {
    console.warn(
      "[serp] entorno de CI detectado; colector omitido (solo ejecución local)"
    );
    return;
  }

  const root = args.root;
  const watchlist = readJson(
    path.join(root, "src/config/serp-watchlist.json"),
    null
  );
  if (!watchlist) {
    console.warn("[serp] falta src/config/serp-watchlist.json; colector omitido");
    return;
  }
  const market = watchlist.market;
  const settings = {
    reserve: watchlist.budget?.reserve ?? RESERVE_SEARCHES,
    minImpressions: watchlist.budget?.minImpressions ?? 100,
    weekdays: watchlist.schedule?.weekdays ?? RUN_WEEKDAYS,
    closeMargin: watchlist.schedule?.closeMargin ?? CLOSE_MARGIN,
    gscWeeks: watchlist.schedule?.gscWeeks ?? 4,
    mobileEnabled: watchlist.mobile?.enabled ?? true,
    mobileGapDays: watchlist.mobile?.gapDays ?? 7,
    maxMobilePerRun: watchlist.mobile?.maxPerRun ?? 10,
    maxPerRun: watchlist.schedule?.maxPerRun ?? 30,
    discoverShare: watchlist.schedule?.discoverShare ?? 0.4,
    cacheTtlDays: watchlist.schedule?.cacheTtlDays ?? CACHE_TTL_DAYS,
    minGapDays: { ...DEFAULT_CADENCE, ...(watchlist.cadenceDays ?? {}) },
    discoverDefault: watchlist.discover?.defaultCount ?? 20,
    discoverMinImpressions: watchlist.discover?.minImpressions ?? 200,
    discoverMaxCtr: watchlist.discover?.maxCtr ?? 0.02,
    discoverSimilarity: watchlist.discover?.similarityMax ?? 0.6,
  };
  const registry = readJson(
    path.join(root, "src/config/growth-opportunity-registry.json"),
    {}
  );
  const bands = registry.expectedCtrBands ?? [
    [3, 0.08],
    [5, 0.05],
    [10, 0.025],
    [15, 0.012],
  ];

  const outDir = path.join(root, "output/external-intelligence");
  const serpDir = path.join(outDir, "serp");
  const normalizedDir = path.join(serpDir, "normalized");
  const discoveredDir = path.join(serpDir, "discovered");
  const historyDir = path.join(serpDir, "history");
  const mobileDir = path.join(serpDir, "mobile");
  const rawDir = path.join(serpDir, "raw");
  const ledgerFile = path.join(serpDir, "ledger.json");
  const now = Date.now();
  const cap = Number(process.env.SERP_MONTHLY_CAP) || DEFAULT_MONTHLY_CAP;
  const thisMonth = monthKey(new Date(now));

  const apiKey = resolveApiKey(root);
  const account = apiKey ? await fetchAccount(apiKey) : null;
  let providerLeft = account?.planSearchesLeft ?? null;

  let ledger = readJson(ledgerFile, emptyLedger());
  // Un solo tope: el menor entre el propio y el saldo real del proveedor
  // menos la reserva (que el script nunca gasta por su cuenta).
  const budget = () =>
    effectiveBudget({
      used: ledgerUsed(ledger, thisMonth),
      cap,
      providerLeft,
      reserve: settings.reserve,
    });

  const {
    week: gscWeek,
    map: gscByQuery,
    rows: gscRows,
  } = loadGscQueryMap(root, settings.gscWeeks);

  const lastRetrieved = new Map();
  for (const entry of watchlist.queries) {
    const snap = readJson(
      path.join(normalizedDir, `${querySlug(entry.query)}.json`),
      null
    );
    if (snap?.retrievedAt)
      lastRetrieved.set(querySlug(entry.query), snap.retrievedAt);
  }
  // Las consultas descubiertas pasan a seguimiento (tier 2) y compiten por
  // cupo con las de la lista según su valor esperado.
  const followUp = readDir(discoveredDir).map(snap => ({
    query: snap.query,
    tier: 2,
    group: "discovered",
    page: null,
  }));
  for (const snap of readDir(discoveredDir)) {
    if (snap.retrievedAt)
      lastRetrieved.set(querySlug(snap.query), snap.retrievedAt);
  }

  const gscMetaFor = query => {
    const gsc = gscByQuery.get(normQuery(query));
    if (!gsc) return null;
    const expected = expectedCtrForPosition(gsc.position ?? 10, bands);
    return {
      impressions: gsc.impressions,
      ctr: gsc.ctr,
      position: gsc.position,
      lostClicks: Math.round(
        gsc.impressions * Math.max(0, expected - gsc.ctr)
      ),
    };
  };

  const adHoc = args.queries.map(query => ({
    query,
    tier: 1,
    page: null,
    why: "manual",
  }));
  // Modo automático: corridas fijas (lunes y jueves) y cierre del ciclo el día
  // anterior a la renovación. El lote sale del saldo real; la lista se ordena
  // por valor esperado según el historial.
  let autoPlan = null;
  if (args.auto && !adHoc.length) {
    const sizing = runBudget({
      providerLeft,
      reserve: settings.reserve,
      renewalDate: account?.renewalDate ?? null,
      now,
      weekdays: settings.weekdays,
      maxPerRun: settings.maxPerRun,
      closeMargin: settings.closeMargin,
      fallbackCap: cap,
    });
    const closing = sizing.mode === "close";
    const entries = [...watchlist.queries, ...followUp];
    const routineSlots = closing
      ? sizing.perRun
      : Math.ceil(sizing.perRun * (1 - settings.discoverShare));
    const histories = new Map(
      entries.map(entry => [
        querySlug(entry.query),
        readHistory(path.join(historyDir, `${querySlug(entry.query)}.jsonl`)),
      ])
    );
    const picked = planRun({
      entries,
      lastRetrieved,
      histories,
      gscByQuery,
      now,
      // El día de cierre se barre todo, sin esperar la separación mínima.
      minGapDays: closing ? { 1: 1, 2: 1, 3: 1 } : settings.minGapDays,
      minImpressions: settings.minImpressions,
      slots: routineSlots,
      bands,
    });
    autoPlan = {
      sizing,
      picked,
      discoverSlots: Math.max(0, sizing.perRun - picked.length),
    };
    if (autoPlan.discoverSlots > 0 && args.discover === null) {
      args.discover = autoPlan.discoverSlots;
    }
    if (!sizing.isRunDay && args.run && !args.anyDay) {
      console.warn(
        `[serp] hoy no es día de corrida (lunes y jueves); próxima: ${sizing.next ?? "s/d"}. ` +
          "Usa --any-day para forzarla."
      );
      return;
    }
  }

  let due;
  let skipped = [];
  if (autoPlan) {
    due = autoPlan.picked;
  } else if (adHoc.length) {
    due = adHoc;
  } else if (args.force) {
    due = prioritize(
      applyVolumeGate(watchlist.queries, gscByQuery, 0).keep
    );
  } else {
    const dueAll = selectDue(watchlist.queries, lastRetrieved, now, watchlist);
    const gated = applyVolumeGate(dueAll, gscByQuery, settings.minImpressions);
    due = prioritize(gated.keep);
    skipped = gated.skipped;
  }

  const status = budget();
  const projection = projectMonthlySpend(
    watchlist.queries,
    settings.minGapDays
  );
  console.log(
    `[serp] presupuesto propio ${status.used}/${status.cap} este mes; ` +
      (account
        ? `saldo del proveedor ${account.planSearchesLeft}/${account.searchesPerMonth ?? "s/d"}` +
          (account.renewalDate ? ` (renueva ${account.renewalDate})` : "") +
          `, reserva ${settings.reserve}`
        : "saldo del proveedor no disponible (sin clave o sin red)")
  );
  if (autoPlan) {
    console.log(
      `[serp] modo auto: lote de ${autoPlan.sizing.perRun} ` +
        `(${due.length} de seguimiento + ${autoPlan.discoverSlots} de barrido)` +
        (autoPlan.sizing.mode === "close"
          ? "; CIERRE DE CICLO: se barre todo el cupo restante (la renovación es mañana)"
          : autoPlan.sizing.runsLeft !== null
            ? `; quedan ${autoPlan.sizing.runsLeft} corridas (lunes y jueves) hasta el cierre del ${autoPlan.sizing.closingDay}`
            : "; sin dato de renovación: lote estimado con el tope propio") +
        (autoPlan.sizing.isRunDay
          ? ""
          : `; hoy no es día de corrida, próxima: ${autoPlan.sizing.next ?? "s/d"}`)
    );
  } else {
    console.log(
      `[serp] gasto de seguimiento máximo: ~${projection}/mes con ${watchlist.queries.length} consultas; ` +
        `elegibles ahora: ${due.length}`
    );
  }
  if (status.warn) console.warn("[serp] aviso: más del 80 % del tope mensual usado");
  for (const entry of due) {
    const volume = entry.impressions ? ` ${entry.impressions} impr.` : "";
    const score = entry.score !== undefined ? `, valor ${entry.score}` : "";
    console.log(
      `  - ${entry.query}${entry.page ? `  (${entry.page})` : ""}${volume}${score}`
    );
  }
  for (const entry of skipped) {
    console.log(
      `  · omitida por bajo volumen (${entry.impressions} impr. < ${settings.minImpressions}): ${entry.query}`
    );
  }

  // Barrido de descubrimiento (plan y, con --run, captura).
  let discoverPlan = [];
  if (args.discover !== null) {
    const known = [
      ...watchlist.queries.map(entry => entry.query),
      ...readDir(discoveredDir).map(snap => snap.query),
    ];
    const limit = args.discover || settings.discoverDefault;
    discoverPlan = discoverCandidates(gscRows, {
      known,
      minImpressions: settings.discoverMinImpressions,
      maxCtr: settings.discoverMaxCtr,
      similarityMax: settings.discoverSimilarity,
      bands,
      limit,
    });
    console.log(
      `[serp] descubrimiento: ${discoverPlan.length} candidatas (máx. ${limit}); ` +
        `cupo disponible: ${budget().remaining} (reserva ${settings.reserve})`
    );
    for (const item of discoverPlan) {
      console.log(
        `  ~ ${item.query}  ${item.impressions} impr., CTR ${pct(item.ctr)}, pos. ${typeof item.position === "number" ? item.position.toFixed(1) : "s/d"}, ~${item.lostClicks} clics perdidos`
      );
    }
  }

  // Pasada móvil: usa el excedente de la corrida con las consultas clave.
  const lastMobile = new Map();
  for (const snap of readDir(mobileDir)) {
    if (snap.retrievedAt)
      lastMobile.set(querySlug(snap.query), snap.retrievedAt);
  }
  let mobilePlan = [];
  if (
    !args.noMobile &&
    settings.mobileEnabled &&
    (autoPlan || args.mobile !== null)
  ) {
    const closing = autoPlan?.sizing.mode === "close";
    let mobileSlots;
    if (args.mobile !== null) {
      mobileSlots = args.mobile || watchlist.queries.length;
    } else {
      const surplus = Math.max(
        0,
        autoPlan.sizing.perRun - due.length - discoverPlan.length
      );
      mobileSlots = closing
        ? surplus
        : Math.min(surplus, settings.maxMobilePerRun);
    }
    mobilePlan = planMobile({
      entries: watchlist.queries,
      lastMobile,
      gscByQuery,
      now,
      gapDays: closing ? 1 : settings.mobileGapDays,
      minImpressions: settings.minImpressions,
      slots: mobileSlots,
      bands,
    });
    console.log(
      `[serp] móvil: ${mobilePlan.length} consultas clave con el excedente (${mobileSlots} cupos)`
    );
    for (const entry of mobilePlan) {
      console.log(`  [móvil] ${entry.query}  valor ${entry.score}`);
    }
  }

  if (!args.run && !args.report) {
    console.log("[serp] plan solamente. Usa --run para gastar cupo.");
    return;
  }

  const state = { stop: false };

  async function capture(entry, { kind, dir, room, device = "desktop" }) {
    if (state.stop) return null;
    if (room() <= 0) {
      console.warn("[serp] sin cupo disponible; se detiene la captura");
      state.stop = true;
      return null;
    }
    const key = cacheKey(entry.query, market, device);
    const label = device === "desktop" ? "" : ` (${device})`;
    const cacheFile = path.join(rawDir, `${key}.json`);
    const cached =
      !args.force && existsSync(cacheFile) ? readJson(cacheFile, null) : null;
    const fresh =
      cached &&
      now - new Date(cached.cachedAt).getTime() <
        settings.cacheTtlDays * DAY_MS;
    let raw;
    let retrievedAt;
    if (fresh) {
      raw = cached.response;
      retrievedAt = cached.cachedAt;
      console.log(`[serp] caché: ${entry.query}${label}`);
    } else {
      try {
        raw = await fetchSerp(entry.query, apiKey, market, { device });
      } catch (error) {
        console.warn(`[serp] error en «${entry.query}»: ${error.message}`);
        if (isFatalProviderStatus(error.status)) {
          console.warn(
            "[serp] clave inválida o límite del proveedor: se detiene la captura"
          );
          state.stop = true;
        }
        return null;
      }
      retrievedAt = new Date().toISOString();
      writeJson(cacheFile, { cachedAt: retrievedAt, response: raw });
      ledger = recordCall(ledger, { query: entry.query, at: retrievedAt, kind });
      writeJson(ledgerFile, ledger);
      if (typeof providerLeft === "number") providerLeft -= 1;
      console.log(`[serp] capturado: ${entry.query}${label}`);
    }
    const snapshot = normalizeSerp(raw, {
      query: entry.query,
      retrievedAt,
      ourDomain: watchlist.ourDomain,
      device,
    });
    writeJson(path.join(dir, `${querySlug(entry.query)}.json`), snapshot);
    if (!fresh) {
      // Historial: base de la volatilidad y del puntaje de próximas corridas.
      appendHistory(
        path.join(
          historyDir,
          `${querySlug(entry.query)}${device === "desktop" ? "" : `.${device}`}.jsonl`
        ),
        historyRecord(snapshot)
      );
    }
    return snapshot;
  }

  if (args.run && (due.length || discoverPlan.length || mobilePlan.length)) {
    if (!apiKey) {
      console.warn("[serp] sin SERPAPI_API_KEY; colector omitido");
      return;
    }
    for (const entry of due) {
      const discovered = entry.group === "discovered";
      const snapshot = await capture(entry, {
        kind: discovered ? "discover" : "routine",
        dir: discovered ? discoveredDir : normalizedDir,
        room: () => budget().remaining,
      });
      if (snapshot && discovered) {
        writeJson(path.join(discoveredDir, `${querySlug(entry.query)}.json`), {
          ...snapshot,
          gsc: gscMetaFor(entry.query),
        });
      }
    }
    for (const item of discoverPlan) {
      const snapshot = await capture(item, {
        kind: "discover",
        dir: discoveredDir,
        room: () => budget().remaining,
      });
      if (snapshot) {
        writeJson(path.join(discoveredDir, `${querySlug(item.query)}.json`), {
          ...snapshot,
          gsc: gscMetaFor(item.query),
        });
      }
    }
    for (const entry of mobilePlan) {
      await capture(entry, {
        kind: "mobile",
        dir: mobileDir,
        device: "mobile",
        room: () => budget().remaining,
      });
    }
  }

  // Reconstruye salida agregada con lo último disponible.
  const snapshots = watchlist.queries
    .map(entry =>
      readJson(path.join(normalizedDir, `${querySlug(entry.query)}.json`), null)
    )
    .filter(Boolean);
  const discovered = readDir(discoveredDir);
  if (!snapshots.length && !discovered.length) {
    console.log("[serp] sin capturas todavía; nada que agregar");
    return;
  }
  const week = args.week ?? previousCompleteISOWeek();
  const outFile = path.join(outDir, `${week}.json`);
  const incoming = {
    source: "free",
    week,
    retrievedAt: new Date(now).toISOString(),
    license: "internal-only",
    scale: {
      volume: "gsc_impressions_28d",
      difficulty: "not_available_free_source",
    },
    serpFeatures: buildSerpFeatureRows([...snapshots, ...discovered], gscByQuery),
    freeSources: [FREE_SOURCE_ID],
  };
  writeJson(outFile, mergeSerpIntoExternal(readJson(outFile, null), incoming));
  const finalBudget = budget();
  if (snapshots.length) {
    const briefFile = path.join(serpDir, `brief-${week}.md`);
    writeFileSync(
      briefFile,
      renderBrief(snapshots, {
        week,
        mobile: new Map(
          readDir(mobileDir).map(snap => [querySlug(snap.query), snap])
        ),
        gscByQuery,
        budget: finalBudget,
        gscWeek,
        provider: account ? { ...account, planSearchesLeft: providerLeft ?? account.planSearchesLeft } : null,
      })
    );
    console.log(`[serp] brief para /seo sxo → ${briefFile}`);
  }
  if (discovered.length) {
    const reportFile = path.join(serpDir, `discover-${week}.md`);
    writeFileSync(
      reportFile,
      renderDiscoverReport(
        discovered.map(snap => ({
          snapshot: snap,
          impressions: snap.gsc?.impressions,
          ctr: snap.gsc?.ctr,
          position: snap.gsc?.position,
          lostClicks: snap.gsc?.lostClicks,
        })),
        { week, gscWeek, provider: account }
      )
    );
    console.log(`[serp] mapa de cero clics → ${reportFile}`);
  }
  console.log(
    `[serp] ${snapshots.length + discovered.length} capturas → ${outFile}`
  );
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  main().catch(error => {
    console.error(`[serp] error: ${error.message}`);
    process.exit(1);
  });
}
