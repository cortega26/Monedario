import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

import {
  applyVolumeGate,
  budgetStatus,
  buildSerpFeatureRows,
  addDays,
  cacheKey,
  countRunDays,
  discoverCandidates,
  domainOf,
  effectiveBudget,
  emptyLedger,
  fetchAccount,
  fetchSerp,
  historyRecord,
  isCiEnvironment,
  isFatalProviderStatus,
  isOfficialDomain,
  isoWeekday,
  ledgerUsed,
  loadGscQueryMap,
  localDate,
  mergeSerpIntoExternal,
  monthKey,
  nextRunDay,
  normalizeSerp,
  parseArgs,
  planRun,
  prioritize,
  projectMonthlySpend,
  queryScore,
  querySlug,
  readHistory,
  recordCall,
  renderBrief,
  renderDiscoverReport,
  resolveApiKey,
  runBudget,
  selectDue,
  tokenSimilarity,
  volatility,
  zeroClickVerdict,
} from "../../scripts/collect-serp-snapshot.mjs";

const market = {
  gl: "cl",
  hl: "es",
  google_domain: "google.cl",
  location: "Chile",
};

const rawResponse = {
  search_information: { total_results: 12400000 },
  ai_overview: {
    page_token: "abc",
    references: [
      { link: "https://www.sii.cl/valores_y_fechas/utm/utm2026.htm" },
      { link: "https://monedario.cl/calculadoras/conversor-utm/" },
    ],
  },
  answer_box: { type: "organic_result", link: "https://www.sii.cl/x" },
  related_questions: [{ question: "¿Cuánto vale la UTM hoy?" }],
  ads: [{ title: "anuncio" }],
  organic_results: [
    { position: 1, link: "https://www.sii.cl/valores_y_fechas/utm/utm2026.htm", title: "SII", snippet: "UTM" },
    { position: 2, link: "https://www.ine.gob.cl/ipc", title: "INE", snippet: "" },
    { position: 3, link: "https://www.monedario.cl/calculadoras/conversor-utm/", title: "Mon", snippet: "" },
  ],
  related_searches: [{ query: "utm noviembre" }],
};

describe("utilidades puras", () => {
  it("detecta CI", () => {
    expect(isCiEnvironment({ CI: "true" })).toBe(true);
    expect(isCiEnvironment({ GITHUB_ACTIONS: "true" })).toBe(true);
    expect(isCiEnvironment({})).toBe(false);
  });

  it("normaliza slugs y claves de caché de forma estable", () => {
    expect(querySlug("¿Cálculo UTM a Pesos?")).toBe("calculo-utm-a-pesos");
    expect(cacheKey(" UF hoy ", market)).toBe(cacheKey("uf hoy", market));
    expect(cacheKey("uf hoy", market)).not.toBe(
      cacheKey("uf hoy", { ...market, gl: "us" })
    );
  });

  it("extrae dominios y reconoce oficiales", () => {
    expect(domainOf("https://www.sii.cl/a")).toBe("sii.cl");
    expect(domainOf("no es url")).toBeNull();
    expect(isOfficialDomain("sii.cl")).toBe(true);
    expect(isOfficialDomain("www2.tesoreria.cl")).toBe(true);
    expect(isOfficialDomain("algo.gob.cl")).toBe(true);
    expect(isOfficialDomain("sii.cl.falso.com")).toBe(false);
  });
});

describe("presupuesto", () => {
  it("cuenta por mes y bloquea al llegar al tope", () => {
    let ledger = emptyLedger();
    for (let i = 0; i < 3; i += 1) {
      ledger = recordCall(ledger, { query: `q${i}`, at: "2026-11-25T10:00:00Z" });
    }
    ledger = recordCall(ledger, { query: "otro", at: "2026-12-01T00:00:00Z" });
    expect(ledgerUsed(ledger, "2026-11")).toBe(3);
    expect(ledgerUsed(ledger, "2026-12")).toBe(1);
    expect(budgetStatus({ used: 3, cap: 3 }).blocked).toBe(true);
    expect(budgetStatus({ used: 2, cap: 3 }).blocked).toBe(false);
  });

  it("nunca supera el límite del plan gratuito aunque el tope sea mayor", () => {
    const status = budgetStatus({ used: 0, cap: 9999 });
    expect(status.cap).toBe(250);
  });

  it("avisa al 80 % y no muta el libro original", () => {
    const ledger = emptyLedger();
    const next = recordCall(ledger, { query: "x", at: "2026-11-01T00:00:00Z" });
    expect(ledgerUsed(ledger, "2026-11")).toBe(0);
    expect(ledgerUsed(next, "2026-11")).toBe(1);
    expect(budgetStatus({ used: 48, cap: 60 }).warn).toBe(true);
    expect(budgetStatus({ used: 47, cap: 60 }).warn).toBe(false);
    expect(monthKey(new Date("2026-11-25T12:00:00Z"))).toBe("2026-11");
  });
});

describe("selectDue", () => {
  const now = new Date("2026-11-25T12:00:00Z").getTime();
  const config = { cadenceDays: { 1: 7, 2: 30 } };
  const queries = [
    { query: "uf hoy", tier: 1 },
    { query: "calculadora uf a pesos", tier: 2 },
    { query: "nunca capturada", tier: 1 },
  ];

  it("selecciona según cadencia por tier", () => {
    const last = new Map([
      ["uf-hoy", "2026-11-20T12:00:00Z"],
      ["calculadora-uf-a-pesos", "2026-11-10T12:00:00Z"],
    ]);
    const due = selectDue(queries, last, now, config).map(q => q.query);
    expect(due).toEqual(["nunca capturada"]);
  });

  it("vence cuando se cumple la cadencia", () => {
    const last = new Map([
      ["uf-hoy", "2026-11-17T12:00:00Z"],
      ["calculadora-uf-a-pesos", "2026-10-20T12:00:00Z"],
      ["nunca-capturada", "2026-11-24T12:00:00Z"],
    ]);
    const due = selectDue(queries, last, now, config).map(q => q.query);
    expect(due).toEqual(["uf hoy", "calculadora uf a pesos"]);
  });
});

describe("normalizeSerp", () => {
  const snap = normalizeSerp(rawResponse, {
    query: "utm hoy",
    retrievedAt: "2026-11-25T12:00:00Z",
  });

  it("detecta funciones del SERP", () => {
    expect(snap.features).toEqual([
      "ai_overview",
      "answer_box",
      "people_also_ask",
      "top_ads",
    ]);
    expect(snap.adsCount).toBe(1);
    expect(snap.peopleAlsoAsk).toEqual(["¿Cuánto vale la UTM hoy?"]);
  });

  it("ubica nuestra posición ignorando www y marca oficiales", () => {
    expect(snap.ours).toEqual({
      position: 3,
      url: "https://www.monedario.cl/calculadoras/conversor-utm/",
    });
    expect(
      snap.officialInTop10.map((o: { domain: string }) => o.domain)
    ).toEqual([
      "sii.cl",
      "ine.gob.cl",
    ]);
  });

  it("registra citas del AI Overview y que requiere seguimiento", () => {
    expect(snap.aiOverview?.citesUs).toBe(true);
    expect(snap.aiOverview?.needsFollowup).toBe(true);
    expect(snap.aiOverview?.citedDomains).toContain("sii.cl");
  });

  it("degrada sin fallar ante una respuesta vacía", () => {
    const empty = normalizeSerp({}, { query: "x", retrievedAt: "t" });
    expect(empty.features).toEqual([]);
    expect(empty.ours).toBeNull();
    expect(empty.organic).toEqual([]);
  });
});

describe("integración con Growth Engine", () => {
  const snap = normalizeSerp(rawResponse, { query: "utm hoy", retrievedAt: "t" });
  const gsc = new Map([["utm hoy", { impressions: 14740, ctr: 0.0081, position: 6.7 }]]);

  it("arma filas serpFeatures con volumen y CTR propios de GSC", () => {
    const rows = buildSerpFeatureRows([snap], gsc);
    expect(rows[0]).toMatchObject({
      query: "utm hoy",
      volume: 14740,
      ourCtr: 0.0081,
    });
    expect(rows[0].features).toContain("ai_overview");
  });

  it("deja volumen nulo si GSC no tiene la consulta", () => {
    const rows = buildSerpFeatureRows([snap], new Map());
    expect(rows[0].volume).toBeNull();
  });

  it("actualiza serpFeatures en cada corrida si la fuente es libre", () => {
    const first = mergeSerpIntoExternal(null, {
      source: "free",
      serpFeatures: [{ query: "a", features: [] }],
      freeSources: ["serpapi-google-cl"],
    });
    const second = mergeSerpIntoExternal(first, {
      source: "free",
      serpFeatures: [{ query: "b", features: [] }],
      freeSources: ["serpapi-google-cl"],
    });
    expect(second.serpFeatures).toEqual([{ query: "b", features: [] }]);
    expect(second.freeSources).toEqual(["serpapi-google-cl"]);
  });

  it("respeta las filas de un proveedor de pago", () => {
    const merged = mergeSerpIntoExternal(
      { source: "semrush", serpFeatures: [{ query: "pago", features: [] }] },
      { source: "free", serpFeatures: [{ query: "libre", features: [] }], freeSources: [] }
    );
    expect(merged.source).toBe("semrush");
    expect(merged.serpFeatures).toEqual([{ query: "pago", features: [] }]);
  });

  it("el brief incluye tabla, funciones y presupuesto", () => {
    const brief = renderBrief([snap], {
      week: "2026-W47",
      gscByQuery: gsc,
      budget: { used: 3, cap: 60, planLimit: 250 },
      gscWeek: "2026-W46",
    });
    expect(brief).toContain("# SERP Chile — brief 2026-W47");
    expect(brief).toContain("3/60");
    expect(brief).toContain("| utm hoy | 14740 | 0.81 % | 3 |");
    expect(brief).toContain("nos cita: sí");
  });
});

describe("E/S", () => {
  it("agrega las últimas semanas de GSC (ventana de 28 días)", () => {
    const root = mkdtempSync(path.join(tmpdir(), "serp-"));
    const dir = path.join(root, "output/operations/data-signals/gsc");
    mkdirSync(dir, { recursive: true });
    const doc = (week: string, impressions: number, clicks: number, position: number) =>
      JSON.stringify({
        week,
        data: [{ query: "UF hoy", impressions, clicks, ctr: clicks / impressions, position }],
      });
    writeFileSync(path.join(dir, "2026-W44-queries.json"), doc("2026-W44", 1000, 10, 10));
    writeFileSync(path.join(dir, "2026-W45-queries.json"), doc("2026-W45", 3000, 0, 8));
    writeFileSync(path.join(dir, "2026-W46-queries.json"), doc("2026-W46", 1000, 10, 6));
    const { week, map, rows } = loadGscQueryMap(root, 4);
    expect(week).toBe("2026-W44…2026-W46");
    const uf = map.get("uf hoy");
    expect(uf?.impressions).toBe(5000);
    expect(uf?.ctr).toBeCloseTo(20 / 5000, 6);
    // posición ponderada por impresiones: (10*1000 + 8*3000 + 6*1000) / 5000 = 8
    expect(uf?.position).toBeCloseTo(8, 6);
    expect(rows).toHaveLength(1);
    // solo la última semana
    expect(loadGscQueryMap(root, 1).map.get("uf hoy")?.impressions).toBe(1000);
    expect(loadGscQueryMap(mkdtempSync(path.join(tmpdir(), "serp-")), 4).map.size).toBe(0);
  });

  it("resuelve la clave desde el entorno o .env.local sin imprimirla", () => {
    const root = mkdtempSync(path.join(tmpdir(), "serp-"));
    writeFileSync(path.join(root, ".env.local"), 'SERPAPI_API_KEY="local-key"\n');
    expect(resolveApiKey(root, {})).toBe("local-key");
    expect(resolveApiKey(root, { SERPAPI_API_KEY: " env-key " })).toBe("env-key");
    expect(resolveApiKey(mkdtempSync(path.join(tmpdir(), "serp-")), {})).toBeNull();
  });

  it("interpreta argumentos", () => {
    const args = parseArgs(["node", "x", "--run", "--query", "uf hoy", "--force"]);
    expect(args).toMatchObject({ run: true, force: true, queries: ["uf hoy"] });
    expect(parseArgs(["node", "x"]).run).toBe(false);
  });

  it("fetchSerp usa el mercado de Chile y no filtra la clave en errores", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => rawResponse,
    });
    await fetchSerp("uf hoy", "SECRET", market, { fetchImpl });
    const url = String(fetchImpl.mock.calls[0][0]);
    expect(url).toContain("gl=cl");
    expect(url).toContain("hl=es");
    expect(url).toContain("google_domain=google.cl");

    const failing = vi.fn().mockResolvedValue({ ok: false, status: 401 });
    await expect(fetchSerp("x", "SECRET", market, { fetchImpl: failing })).rejects.toThrow(
      "SerpApi HTTP 401"
    );
    const caught = await fetchSerp("x", "SECRET", market, { fetchImpl: failing }).catch(
      (error: Error & { status?: number }) => error
    );
    expect((caught as Error & { status?: number }).status).toBe(401);
    expect(isFatalProviderStatus(401)).toBe(true);
    expect(isFatalProviderStatus(403)).toBe(true);
    expect(isFatalProviderStatus(429)).toBe(true);
    expect(isFatalProviderStatus(500)).toBe(false);
    const withError = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ error: "Your account has run out of searches." }),
    });
    await expect(
      fetchSerp("x", "SECRET", market, { fetchImpl: withError })
    ).rejects.toThrow("run out of searches");
  });
});

describe("configuración de la lista", () => {
  const watchlist = JSON.parse(
    readFileSync(path.resolve("src/config/serp-watchlist.json"), "utf8")
  );

  it("la lista es válida y no repite consultas", () => {
    expect(watchlist.market).toMatchObject({ gl: "cl", hl: "es", google_domain: "google.cl" });
    const slugs = watchlist.queries.map((q: { query: string }) => querySlug(q.query));
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const q of watchlist.queries) {
      expect([1, 2, 3]).toContain(q.tier);
      expect(typeof q.group).toBe("string");
    }
  });

  it("el seguimiento máximo deja cupo para el barrido y la reserva", () => {
    const monthly = projectMonthlySpend(watchlist.queries, watchlist.cadenceDays);
    expect(monthly).toBeLessThanOrEqual(60);
    expect(monthly + watchlist.budget.reserve).toBeLessThan(250);
    expect(watchlist.schedule.cacheTtlDays).toBeLessThan(watchlist.cadenceDays["1"]);
    expect(watchlist.schedule.weekdays).toEqual([1, 4]);
    expect(watchlist.schedule.discoverShare).toBeGreaterThan(0);
    expect(watchlist.schedule.discoverShare).toBeLessThan(1);
  });

  it("hay un único representante tier 1 por grupo de variantes", () => {
    const tier1ByGroup = new Map<string, number>();
    for (const q of watchlist.queries) {
      if (q.tier === 1) tier1ByGroup.set(q.group, (tier1ByGroup.get(q.group) ?? 0) + 1);
    }
    for (const count of tier1ByGroup.values()) expect(count).toBe(1);
  });
});

describe("presupuesto efectivo", () => {
  it("usa el menor entre el tope propio y el saldo del proveedor menos la reserva", () => {
    expect(effectiveBudget({ used: 0, cap: 60, providerLeft: 239, reserve: 30 }).remaining).toBe(60);
    expect(effectiveBudget({ used: 0, cap: 60, providerLeft: 50, reserve: 30 }).remaining).toBe(20);
    expect(effectiveBudget({ used: 0, cap: 60, providerLeft: 30, reserve: 30 }).blocked).toBe(true);
    expect(effectiveBudget({ used: 60, cap: 60, providerLeft: 200, reserve: 30 }).blocked).toBe(true);
  });

  it("sin saldo del proveedor se apoya solo en el tope propio", () => {
    const status = effectiveBudget({ used: 10, cap: 60, providerLeft: null });
    expect(status.remaining).toBe(50);
    expect(status.providerLeft).toBeNull();
  });

  it("separa el gasto de rutina del de barrido", () => {
    let ledger = emptyLedger();
    ledger = recordCall(ledger, { query: "a", at: "2026-11-25T10:00:00Z" });
    ledger = recordCall(ledger, { query: "b", at: "2026-11-25T10:00:00Z", kind: "discover" });
    ledger = recordCall(ledger, { query: "c", at: "2026-11-25T10:00:00Z", kind: "discover" });
    expect(ledgerUsed(ledger, "2026-11")).toBe(3);
    expect(ledgerUsed(ledger, "2026-11", "routine")).toBe(1);
    expect(ledgerUsed(ledger, "2026-11", "discover")).toBe(2);
  });

  it("las llamadas antiguas sin tipo cuentan como rutina", () => {
    const legacy = { version: 1, months: { "2026-11": { count: 2, calls: [{ query: "x", at: "t" }, { query: "y", at: "t" }] } } };
    expect(ledgerUsed(legacy, "2026-11", "routine")).toBe(2);
    expect(ledgerUsed(legacy, "2026-11", "discover")).toBe(0);
  });

  it("proyecta el gasto mensual según tier y cadencia", () => {
    const queries = [{ tier: 1 }, { tier: 2 }, { tier: 3 }];
    expect(projectMonthlySpend(queries, { 1: 15, 2: 30, 3: 90 })).toBeCloseTo(3.3, 1);
  });
});

describe("filtro de volumen y prioridad", () => {
  const gsc = new Map([
    ["alta", { impressions: 5000, ctr: 0, position: 8 }],
    ["baja", { impressions: 40, ctr: 0, position: 8 }],
    ["fija", { impressions: 10, ctr: 0, position: 8 }],
  ]);

  it("omite lo de bajo volumen salvo lo fijado o sin dato", () => {
    const { keep, skipped } = applyVolumeGate(
      [{ query: "alta" }, { query: "baja" }, { query: "fija", pinned: true }, { query: "nueva" }],
      gsc,
      100
    );
    expect(keep.map((e: { query: string }) => e.query)).toEqual(["alta", "fija", "nueva"]);
    expect(skipped.map((e: { query: string }) => e.query)).toEqual(["baja"]);
  });

  it("captura primero lo de mayor volumen", () => {
    const ordered = prioritize([
      { query: "b", impressions: 10 },
      { query: "a", impressions: 900 },
      { query: "c", impressions: null },
    ]);
    expect(ordered.map((e: { query: string }) => e.query)).toEqual(["a", "b", "c"]);
  });
});

describe("barrido de descubrimiento", () => {
  const bands = [[3, 0.08], [5, 0.05], [10, 0.025], [15, 0.012]];
  const rows = [
    { query: "valor utm hoy chile", impressions: 2000, ctr: 0.0005, position: 6.8 },
    { query: "tabla de retenciones honorarios", impressions: 3000, ctr: 0.004, position: 8 },
    { query: "sueldo minimo 2026", impressions: 1500, ctr: 0.001, position: 5 },
    { query: "sueldo minimo chile 2026", impressions: 1400, ctr: 0.001, position: 5 },
    { query: "poco volumen", impressions: 50, ctr: 0, position: 5 },
    { query: "buen ctr", impressions: 9000, ctr: 0.2, position: 1 },
  ];

  it("mide la similitud entre consultas", () => {
    expect(tokenSimilarity("valor utm hoy", "valor utm hoy chile")).toBeGreaterThan(0.6);
    expect(tokenSimilarity("calculadora ipc", "tabla retenciones")).toBe(0);
  });

  it("elige por clics perdidos y descarta duplicados, conocidas y de poco peso", () => {
    const picked = discoverCandidates(rows, {
      known: ["valor utm hoy"],
      bands,
      limit: 10,
    });
    const queries = picked.map((p: { query: string }) => p.query);
    expect(queries).not.toContain("valor utm hoy chile"); // casi duplicada de una conocida
    expect(queries).not.toContain("poco volumen");
    expect(queries).not.toContain("buen ctr");
    // de las dos variantes de sueldo mínimo solo entra una
    expect(queries.filter((q: string) => q.startsWith("sueldo minimo")).length).toBe(1);
    // ordenadas por clics perdidos: sueldo (1.500 x 4,9 pp = 74) > tabla (3.000 x 2,1 pp = 63)
    expect(queries[0]).toBe("sueldo minimo 2026");
    expect(queries[1]).toBe("tabla de retenciones honorarios");
  });

  it("respeta el límite", () => {
    const picked = discoverCandidates(rows, { known: [], bands, limit: 1 });
    expect(picked).toHaveLength(1);
  });

  it("resume qué manda en el SERP", () => {
    const base = { answerBox: null, aiOverview: null, officialInTop10: [], features: [], ours: null };
    expect(zeroClickVerdict({ ...base, answerBox: { type: "currency_converter" } })).toContain("currency_converter");
    expect(zeroClickVerdict({ ...base, aiOverview: { citesUs: false } })).toBe("AI Overview sin citarnos");
    expect(zeroClickVerdict({ ...base, aiOverview: { citesUs: true } })).toBe("AI Overview que nos cita");
    expect(zeroClickVerdict({ ...base, officialInTop10: [{ position: 2, domain: "sii.cl" }] })).toBe("fuente oficial en el top 3");
    expect(zeroClickVerdict(base)).toBe("SERP orgánico competitivo");
  });

  it("el mapa de cero clics ordena por clics perdidos", () => {
    const snap = (query: string) => normalizeSerp(rawResponse, { query, retrievedAt: "t" });
    const report = renderDiscoverReport(
      [
        { snapshot: snap("poco"), impressions: 300, ctr: 0.001, position: 8, lostClicks: 5 },
        { snapshot: snap("mucho"), impressions: 9000, ctr: 0.001, position: 8, lostClicks: 200 },
      ],
      { week: "2026-W47", gscWeek: "2026-W47" }
    );
    expect(report).toContain("# Mapa de cero clics — 2026-W47");
    expect(report.indexOf("| mucho |")).toBeLessThan(report.indexOf("| poco |"));
  });
});

describe("cuenta del proveedor", () => {
  it("lee el saldo sin exponer la clave", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        plan_searches_left: 239,
        searches_per_month: 250,
        plan_renewal_date: "2026-12-25",
        this_month_usage: 11,
      }),
    });
    const account = await fetchAccount("SECRET", { fetchImpl });
    expect(account).toEqual({
      planSearchesLeft: 239,
      searchesPerMonth: 250,
      renewalDate: "2026-12-25",
      usage: 11,
    });
    expect(JSON.stringify(account)).not.toContain("SECRET");
  });

  it("falla en silencio ante error de red, HTTP o respuesta inesperada", async () => {
    expect(await fetchAccount("k", { fetchImpl: vi.fn().mockRejectedValue(new Error("red")) })).toBeNull();
    expect(await fetchAccount("k", { fetchImpl: vi.fn().mockResolvedValue({ ok: false, status: 500 }) })).toBeNull();
    expect(
      await fetchAccount("k", { fetchImpl: vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }) })
    ).toBeNull();
  });

  it("interpreta --discover con y sin número", () => {
    expect(parseArgs(["node", "x", "--discover"]).discover).toBe(0);
    expect(parseArgs(["node", "x", "--discover", "15"]).discover).toBe(15);
    expect(parseArgs(["node", "x", "--discover", "--run"])).toMatchObject({ discover: 0, run: true });
    expect(parseArgs(["node", "x"]).discover).toBeNull();
  });
});

describe("historial y volatilidad", () => {
  const rec = (over: Partial<{ features: string[]; ours: number | null; top3: string[] }> = {}) => ({
    at: "t",
    features: ["ai_overview"],
    ours: 5,
    top3: ["sii.cl", "a.cl", "b.cl"],
    answerBox: null,
    citesUs: null,
    ...over,
  });

  it("resume una captura en un registro compacto", () => {
    const snap = normalizeSerp(rawResponse, { query: "utm hoy", retrievedAt: "2026-11-25T12:00:00Z" });
    expect(historyRecord(snap)).toEqual({
      at: "2026-11-25T12:00:00Z",
      features: ["ai_overview", "answer_box", "people_also_ask", "top_ads"],
      ours: 3,
      top3: ["sii.cl", "ine.gob.cl", "monedario.cl"],
      answerBox: "organic_result",
      citesUs: true,
    });
  });

  it("sin historial suficiente la volatilidad es incierta (0,5)", () => {
    expect(volatility([])).toBe(0.5);
    expect(volatility([rec()])).toBe(0.5);
  });

  it("un SERP idéntico entre capturas es estable (0)", () => {
    expect(volatility([rec(), rec(), rec()])).toBe(0);
  });

  it("detecta cambios de funciones, posición y top 3", () => {
    const stable = volatility([rec(), rec()]);
    const changed = volatility([
      rec(),
      rec({ features: ["answer_box"], ours: 12, top3: ["x.cl", "y.cl", "z.cl"] }),
    ]);
    expect(changed).toBeGreaterThan(stable);
    expect(changed).toBeLessThanOrEqual(1);
    // entrar o salir del top 10 cuenta como cambio de posición
    expect(volatility([rec({ ours: null }), rec({ ours: 4 })])).toBeGreaterThan(0);
  });

  it("lee el historial en JSON por líneas ignorando líneas dañadas", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "serp-"));
    const file = path.join(dir, "h.jsonl");
    writeFileSync(file, `${JSON.stringify(rec())}\nno es json\n${JSON.stringify(rec({ ours: 9 }))}\n`);
    const history = readHistory(file);
    expect(history).toHaveLength(2);
    expect(history[1].ours).toBe(9);
    expect(readHistory(path.join(dir, "no-existe.jsonl"))).toEqual([]);
  });
});

describe("lote adaptativo", () => {
  const bands = [[3, 0.08], [5, 0.05], [10, 0.025], [15, 0.012]];
  const now = new Date("2026-11-25T18:00:00Z").getTime();
  const DAY = 86_400_000;

  it("el puntaje sube con volumen, brecha de CTR, volatilidad y antigüedad", () => {
    const base = { impressions: 10000, ctr: 0.004, position: 7, volatility: 0.2, ageDays: 3, minGapDays: 3, bands };
    const score = (over = {}) => queryScore({ ...base, ...over });
    expect(score({ impressions: 20000 })).toBeGreaterThan(score());
    expect(score({ ctr: 0.0001 })).toBeGreaterThan(score());
    expect(score({ volatility: 0.9 })).toBeGreaterThan(score());
    expect(score({ ageDays: 9 })).toBeGreaterThan(score());
    expect(score({ ageDays: 1000 })).toBe(score({ ageDays: 9 })); // la antigüedad se acota
  });

  it("una consulta nunca capturada tiene la máxima antigüedad", () => {
    const never = queryScore({ impressions: 1000, ctr: 0, position: 8, volatility: 0.5, ageDays: null, minGapDays: 3, bands });
    const old = queryScore({ impressions: 1000, ctr: 0, position: 8, volatility: 0.5, ageDays: 30, minGapDays: 3, bands });
    expect(never).toBe(old);
  });

  const entries = [
    { query: "reciente", tier: 1 },
    { query: "estable", tier: 1 },
    { query: "volatil", tier: 1 },
    { query: "poco volumen", tier: 2 },
    { query: "fija", tier: 3, pinned: true },
  ];
  const gsc = new Map([
    ["reciente", { impressions: 9000, ctr: 0, position: 8 }],
    ["estable", { impressions: 9000, ctr: 0, position: 8 }],
    ["volatil", { impressions: 9000, ctr: 0, position: 8 }],
    ["poco volumen", { impressions: 20, ctr: 0, position: 8 }],
    ["fija", { impressions: 10, ctr: 0, position: 8 }],
  ]);
  const last = new Map([
    ["reciente", new Date(now - 1 * DAY).toISOString()],
    ["estable", new Date(now - 4 * DAY).toISOString()],
    ["volatil", new Date(now - 4 * DAY).toISOString()],
    ["poco-volumen", new Date(now - 40 * DAY).toISOString()],
    ["fija", new Date(now - 40 * DAY).toISOString()],
  ]);
  const same = { at: "t", features: ["ai_overview"], ours: 5, top3: ["a", "b", "c"], answerBox: null, citesUs: null };
  const histories = new Map([
    ["estable", [same, same, same]],
    ["volatil", [same, { ...same, features: [], ours: null, top3: ["x", "y", "z"] }]],
  ]);
  const plan = (slots: number) =>
    planRun({ entries, lastRetrieved: last, histories, gscByQuery: gsc, now, minGapDays: { 1: 3, 2: 9, 3: 27 }, minImpressions: 100, slots, bands });

  it("excluye lo capturado hace poco y lo de bajo volumen (salvo fijadas)", () => {
    const queries = plan(10).map((e: { query: string }) => e.query);
    expect(queries).not.toContain("reciente");
    expect(queries).not.toContain("poco volumen");
    expect(queries).toContain("fija");
  });

  it("prioriza lo volátil sobre lo estable y respeta los cupos", () => {
    const queries = plan(10).map((e: { query: string }) => e.query);
    expect(queries.indexOf("volatil")).toBeLessThan(queries.indexOf("estable"));
    expect(plan(1)).toHaveLength(1);
    expect(plan(0)).toHaveLength(0);
  });
});

describe("calendario de corridas", () => {
  it("calcula día ISO y fechas en la zona de Chile", () => {
    // 2026-11-25 es miércoles; a las 18:00 UTC sigue siendo el 25 en Santiago
    expect(localDate(new Date("2026-11-25T18:00:00Z").getTime())).toEqual({ ymd: "2026-11-25", weekday: 3 });
    // pasada la medianoche UTC todavía es el día anterior en Chile
    expect(localDate(new Date("2026-11-26T01:00:00Z").getTime()).ymd).toBe("2026-11-25");
    expect(isoWeekday("2026-11-29")).toBe(7); // domingo
    expect(isoWeekday("2026-11-30")).toBe(1); // lunes
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-12-25", -1)).toBe("2026-12-24");
  });

  it("cuenta las corridas de lunes y jueves hasta el cierre", () => {
    // desde miércoles 25-nov hasta antes del 24-dic: jue 26, lun 30, jue 3, lun 7, jue 10, lun 14, jue 17, lun 21
    expect(countRunDays("2026-11-25", "2026-12-24", [1, 4])).toBe(8);
    expect(countRunDays("2026-11-26", "2026-11-27", [1, 4])).toBe(1);
    expect(countRunDays("2026-11-27", "2026-11-30", [1, 4])).toBe(0);
  });

  it("encuentra el próximo día de corrida o el cierre", () => {
    expect(nextRunDay("2026-11-25", [1, 4])).toBe("2026-11-26");
    expect(nextRunDay("2026-11-26", [1, 4])).toBe("2026-11-30");
    expect(nextRunDay("2026-12-22", [1, 4], "2026-12-24")).toBe("2026-12-24");
  });
});

describe("tamaño del lote por corrida", () => {
  const wed = new Date("2026-11-25T18:00:00Z").getTime();
  const thu = new Date("2026-11-26T15:00:00Z").getTime();
  const closing = new Date("2026-12-24T15:00:00Z").getTime();

  it("reparte el saldo gastable entre las corridas que quedan y avisa si hoy no toca", () => {
    // 239 de saldo, reserva 30 => 209 gastables; 8 corridas hasta el cierre del 24-dic
    const result = runBudget({ providerLeft: 239, reserve: 30, renewalDate: "2026-12-25", now: wed });
    expect(result.mode).toBe("routine");
    expect(result.runsLeft).toBe(8);
    expect(result.perRun).toBe(26);
    expect(result.isRunDay).toBe(false); // miércoles
    expect(result.next).toBe("2026-11-26");
    expect(result.closingDay).toBe("2026-12-24");
  });

  it("en jueves toca corrida", () => {
    const result = runBudget({ providerLeft: 239, reserve: 30, renewalDate: "2026-12-25", now: thu });
    expect(result.isRunDay).toBe(true);
  });

  it("el día anterior a la renovación barre todo menos un margen", () => {
    const result = runBudget({ providerLeft: 120, reserve: 30, renewalDate: "2026-12-25", now: closing, closeMargin: 5 });
    expect(result.mode).toBe("close");
    expect(result.isClosingDay).toBe(true);
    expect(result.isRunDay).toBe(true);
    expect(result.perRun).toBe(115);
  });

  it("respeta el máximo por corrida de rutina y nunca gasta la reserva", () => {
    const capped = runBudget({ providerLeft: 250, reserve: 30, renewalDate: "2026-11-30", now: wed, maxPerRun: 10 });
    expect(capped.perRun).toBe(10);
    expect(runBudget({ providerLeft: 30, reserve: 30, renewalDate: "2026-12-25", now: wed }).perRun).toBe(0);
    expect(runBudget({ providerLeft: 10, reserve: 30, renewalDate: "2026-12-25", now: wed }).perRun).toBe(0);
  });

  it("si se saltó una corrida, el lote de las siguientes crece", () => {
    const early = runBudget({ providerLeft: 200, reserve: 30, renewalDate: "2026-12-25", now: thu });
    const late = runBudget({
      providerLeft: 200,
      reserve: 30,
      renewalDate: "2026-12-25",
      now: new Date("2026-12-14T15:00:00Z").getTime(),
    });
    expect(late.perRun).toBeGreaterThan(early.perRun);
  });

  it("sin datos del proveedor estima con el tope propio", () => {
    const result = runBudget({ providerLeft: null, renewalDate: null, now: wed, fallbackCap: 220 });
    expect(result.runsLeft).toBeNull();
    expect(result.mode).toBe("routine");
    expect(result.perRun).toBe(25);
  });
});
