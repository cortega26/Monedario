#!/usr/bin/env node

/**
 * collect-serp-snapshot
 *
 * Growth Engine (fuente libre, uso manual): captura el SERP de Google Chile
 * (google.cl, gl=cl, hl=es) para una lista corta de consultas objetivo y lo
 * normaliza. Responde lo que GSC no puede: qué hay en la página de resultados
 * (AI Overview, cuadro de respuesta, "otras preguntas", quién ocupa el top 10)
 * y por qué una consulta con buena posición tiene CTR casi nulo.
 *
 * Proveedor: SerpApi, plan gratuito (250 búsquedas al mes; verificado en
 * serpapi.com/pricing el 2026-11-25). El cupo es mensual, no diario.
 *
 * Reglas (ver docs/operations/runbooks/serp-snapshot.md):
 *   - Solo manual/local. Se omite en CI (EXTERNAL-INTELLIGENCE-CONTRACT).
 *   - Por defecto solo imprime el plan y el presupuesto; gasta cupo con --run.
 *   - Tope mensual propio (SERP_MONTHLY_CAP, 60 por defecto) y caché de 7 días.
 *   - Los datos son `internal-only` y viven en output/external-intelligence/
 *     (gitignoreado). La clave nunca se imprime ni se escribe en la salida.
 *
 * Uso:
 *   node scripts/collect-serp-snapshot.mjs                  # plan (sin gastar)
 *   node scripts/collect-serp-snapshot.mjs --run            # consultas vencidas
 *   node scripts/collect-serp-snapshot.mjs --run --query "uf hoy"
 *   node scripts/collect-serp-snapshot.mjs --run --force    # ignora cadencia/caché
 *   node scripts/collect-serp-snapshot.mjs --report         # reconstruye brief
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, "..");

export const SERPAPI_ENDPOINT = "https://serpapi.com/search.json";
export const FREE_PLAN_MONTHLY_SEARCHES = 250;
export const DEFAULT_MONTHLY_CAP = 60;
export const WARN_RATIO = 0.8;
export const CACHE_TTL_DAYS = 7;
export const FREE_SOURCE_ID = "serpapi-google-cl";
const DAY_MS = 86_400_000;

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

export function cacheKey(query, market) {
  return createHash("sha1")
    .update(
      [
        String(query).trim().toLowerCase(),
        market.gl,
        market.hl,
        market.google_domain,
        market.location,
      ].join("|")
    )
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
  return Boolean(domain) && (domain === suffix || domain.endsWith(`.${suffix}`));
}

export function isOfficialDomain(domain) {
  if (!domain) return false;
  if (domain.endsWith(".gob.cl") || domain === "gob.cl") return true;
  return OFFICIAL_DOMAIN_SUFFIXES.some(suffix => matchesDomain(domain, suffix));
}

// ---------------------------------------------------------------------------
// Presupuesto (libro mensual)
// ---------------------------------------------------------------------------

export function emptyLedger() {
  return { version: 1, months: {} };
}

export function ledgerUsed(ledger, month) {
  return ledger?.months?.[month]?.count ?? 0;
}

export function recordCall(ledger, { query, at }) {
  const next = structuredClone(ledger ?? emptyLedger());
  const month = monthKey(new Date(at));
  const bucket = next.months[month] ?? { count: 0, calls: [] };
  bucket.count += 1;
  bucket.calls.push({ query, at });
  next.months[month] = bucket;
  return next;
}

export function budgetStatus({ used, cap, planLimit = FREE_PLAN_MONTHLY_SEARCHES }) {
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

// ---------------------------------------------------------------------------
// Selección de consultas vencidas
// ---------------------------------------------------------------------------

/**
 * @param {{query:string, tier?:number}[]} queries
 * @param {Map<string,string>} lastRetrieved slug -> ISO date
 */
export function selectDue(queries, lastRetrieved, now, config) {
  const cadence = config?.cadenceDays ?? { 1: 7, 2: 30 };
  const due = [];
  for (const entry of queries) {
    const last = lastRetrieved.get(querySlug(entry.query));
    const days = cadence[String(entry.tier ?? 1)] ?? 7;
    const age = last ? (now - new Date(last).getTime()) / DAY_MS : Infinity;
    if (age >= days) due.push({ ...entry, ageDays: Number.isFinite(age) ? Math.floor(age) : null });
  }
  return due;
}

// ---------------------------------------------------------------------------
// Normalización de la respuesta del proveedor
// ---------------------------------------------------------------------------

/**
 * Convierte la respuesta cruda de SerpApi (engine=google) al formato interno.
 * El esquema sigue la documentación del proveedor; si cambia un campo, la
 * función degrada a "ausente" en vez de fallar.
 */
export function normalizeSerp(raw, { query, retrievedAt, ourDomain = "monedario.cl" }) {
  const organic = (raw?.organic_results ?? []).slice(0, 10).map((row, index) => ({
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
  if (raw?.inline_videos?.length || raw?.short_videos?.length) features.push("videos");
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
      const gsc = gscByQuery.get(String(snapshot.query).trim().toLowerCase());
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

export function loadGscQueryMap(root) {
  const dir = path.join(root, "output/operations/data-signals/gsc");
  if (!existsSync(dir)) return { week: null, map: new Map() };
  const files = readdirSync(dir)
    .filter(name => /-queries\.json$/.test(name))
    .sort();
  const latest = files.at(-1);
  if (!latest) return { week: null, map: new Map() };
  const doc = JSON.parse(readFileSync(path.join(dir, latest), "utf8"));
  const rows = Array.isArray(doc.data) ? doc.data : [];
  const map = new Map();
  for (const row of rows) {
    if (typeof row.query === "string") {
      map.set(row.query.trim().toLowerCase(), {
        impressions: row.impressions ?? 0,
        ctr: row.ctr ?? 0,
        position: row.position ?? null,
      });
    }
  }
  return { week: doc.week ?? latest.replace(/-queries\.json$/, ""), map };
}

// ---------------------------------------------------------------------------
// Brief legible (insumo para /seo sxo)
// ---------------------------------------------------------------------------

function pct(value) {
  return typeof value === "number" ? `${(value * 100).toFixed(2)} %` : "s/d";
}

export function renderBrief(snapshots, { week, gscByQuery, budget, gscWeek }) {
  const lines = [
    `# SERP Chile — brief ${week}`,
    "",
    "Uso interno (`internal-only`). Fuente: SerpApi, google.cl, es-CL. " +
      "Heurístico: es una muestra puntual, no una medición de ranking.",
    `Presupuesto del mes: ${budget.used}/${budget.cap} (plan gratuito: ${budget.planLimit}/mes).`,
    `Demanda y CTR propios: GSC ${gscWeek ?? "s/d"}.`,
    "",
    "| Consulta | Impr. GSC | CTR propio | Pos. SERP | Funciones | Oficiales en top 10 |",
    "|---|---:|---:|---:|---|---|",
  ];
  for (const snap of snapshots) {
    const gsc = gscByQuery.get(snap.query.trim().toLowerCase());
    lines.push(
      `| ${snap.query} | ${gsc?.impressions ?? "s/d"} | ${pct(gsc?.ctr)} | ` +
        `${snap.ours?.position ?? "fuera"} | ${snap.features.join(", ") || "—"} | ` +
        `${snap.officialInTop10.map(o => `${o.domain}#${o.position}`).join(", ") || "—"} |`
    );
  }
  lines.push("");
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
        snap.organic.map(row => `${row.position}. ${row.domain}`).join(" · ") || "sin resultados"
      }`
    );
    if (snap.peopleAlsoAsk.length) {
      lines.push(`- Otras preguntas: ${snap.peopleAlsoAsk.join(" | ")}`);
    }
    lines.push("");
  }
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

export async function fetchSerp(query, apiKey, market, { fetchImpl = fetch, timeoutMs = 30_000 } = {}) {
  const search = new URLSearchParams({
    engine: "google",
    q: query,
    google_domain: market.google_domain,
    gl: market.gl,
    hl: market.hl,
    location: market.location,
    api_key: apiKey,
  });
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
  if (body?.error) throw new Error(`SerpApi: ${String(body.error).slice(0, 160)}`);
  return body;
}

function readJson(file, fallback) {
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : fallback;
}

function writeJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function parseArgs(argv) {
  const args = {
    root: DEFAULT_ROOT,
    run: false,
    force: false,
    report: false,
    queries: [],
    week: null,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === "--run") args.run = true;
    else if (flag === "--force") args.force = true;
    else if (flag === "--report") args.report = true;
    else if (flag === "--query") args.queries.push(argv[(i += 1)]);
    else if (flag === "--week") args.week = argv[(i += 1)];
    else if (flag === "--root") args.root = path.resolve(argv[(i += 1)]);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  if (isCiEnvironment()) {
    console.warn("[serp] entorno de CI detectado; colector omitido (uso solo manual)");
    return;
  }

  const root = args.root;
  const watchlist = readJson(path.join(root, "src/config/serp-watchlist.json"), null);
  if (!watchlist) {
    console.warn("[serp] falta src/config/serp-watchlist.json; colector omitido");
    return;
  }
  const market = watchlist.market;
  const outDir = path.join(root, "output/external-intelligence");
  const serpDir = path.join(outDir, "serp");
  const normalizedDir = path.join(serpDir, "normalized");
  const rawDir = path.join(serpDir, "raw");
  const ledgerFile = path.join(serpDir, "ledger.json");
  const now = Date.now();
  const cap = Number(process.env.SERP_MONTHLY_CAP) || DEFAULT_MONTHLY_CAP;

  let ledger = readJson(ledgerFile, emptyLedger());
  const budget = () =>
    budgetStatus({ used: ledgerUsed(ledger, monthKey(new Date(now))), cap });

  const lastRetrieved = new Map();
  for (const entry of watchlist.queries) {
    const snap = readJson(path.join(normalizedDir, `${querySlug(entry.query)}.json`), null);
    if (snap?.retrievedAt) lastRetrieved.set(querySlug(entry.query), snap.retrievedAt);
  }

  const adHoc = args.queries.map(query => ({ query, tier: 1, page: null, why: "manual" }));
  const candidates = adHoc.length ? adHoc : watchlist.queries;
  const due = args.force || adHoc.length
    ? candidates
    : selectDue(candidates, lastRetrieved, now, watchlist);

  const b = budget();
  console.log(
    `[serp] presupuesto ${b.used}/${b.cap} este mes (plan gratuito ${b.planLimit}); ` +
      `consultas vencidas: ${due.length}`
  );
  if (b.warn) console.warn("[serp] aviso: más del 80 % del tope mensual usado");
  for (const entry of due) {
    console.log(`  - ${entry.query}${entry.page ? `  (${entry.page})` : ""}`);
  }

  if (!args.run && !args.report) {
    console.log("[serp] plan solamente. Usa --run para gastar cupo.");
    return;
  }

  if (args.run && due.length) {
    const apiKey = resolveApiKey(root);
    if (!apiKey) {
      console.warn("[serp] sin SERPAPI_API_KEY; colector omitido");
      return;
    }
    for (const entry of due) {
      if (budget().blocked) {
        console.warn("[serp] tope mensual alcanzado; se detiene la captura");
        break;
      }
      const key = cacheKey(entry.query, market);
      const cacheFile = path.join(rawDir, `${key}.json`);
      const cached = !args.force && existsSync(cacheFile) ? readJson(cacheFile, null) : null;
      const fresh = cached && now - new Date(cached.cachedAt).getTime() < CACHE_TTL_DAYS * DAY_MS;
      let raw;
      let retrievedAt;
      if (fresh) {
        raw = cached.response;
        retrievedAt = cached.cachedAt;
        console.log(`[serp] caché: ${entry.query}`);
      } else {
        try {
          raw = await fetchSerp(entry.query, apiKey, market);
        } catch (error) {
          console.warn(`[serp] error en «${entry.query}»: ${error.message}`);
          if (isFatalProviderStatus(error.status)) {
            console.warn(
              "[serp] clave inválida o límite del proveedor: se detiene la captura"
            );
            break;
          }
          continue;
        }
        retrievedAt = new Date().toISOString();
        writeJson(cacheFile, { cachedAt: retrievedAt, response: raw });
        ledger = recordCall(ledger, { query: entry.query, at: retrievedAt });
        writeJson(ledgerFile, ledger);
        console.log(`[serp] capturado: ${entry.query}`);
      }
      writeJson(
        path.join(normalizedDir, `${querySlug(entry.query)}.json`),
        normalizeSerp(raw, {
          query: entry.query,
          retrievedAt,
          ourDomain: watchlist.ourDomain,
        })
      );
    }
  }

  // Reconstruye salida agregada con lo último disponible de la lista.
  const snapshots = watchlist.queries
    .map(entry => readJson(path.join(normalizedDir, `${querySlug(entry.query)}.json`), null))
    .filter(Boolean);
  if (!snapshots.length) {
    console.log("[serp] sin capturas todavía; nada que agregar");
    return;
  }
  const { week: gscWeek, map: gscByQuery } = loadGscQueryMap(root);
  const week = args.week ?? previousCompleteISOWeek();
  const outFile = path.join(outDir, `${week}.json`);
  const incoming = {
    source: "free",
    week,
    retrievedAt: new Date(now).toISOString(),
    license: "internal-only",
    scale: {
      volume: "gsc_weekly_impressions",
      difficulty: "not_available_free_source",
    },
    serpFeatures: buildSerpFeatureRows(snapshots, gscByQuery),
    freeSources: [FREE_SOURCE_ID],
  };
  writeJson(outFile, mergeSerpIntoExternal(readJson(outFile, null), incoming));
  const briefFile = path.join(serpDir, `brief-${week}.md`);
  writeFileSync(
    briefFile,
    renderBrief(snapshots, { week, gscByQuery, budget: budget(), gscWeek })
  );
  console.log(`[serp] ${snapshots.length} capturas → ${outFile}`);
  console.log(`[serp] brief para /seo sxo → ${briefFile}`);
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  main().catch(error => {
    console.error(`[serp] error: ${error.message}`);
    process.exit(1);
  });
}
