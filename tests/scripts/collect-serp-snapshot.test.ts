import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

import {
  budgetStatus,
  buildSerpFeatureRows,
  cacheKey,
  domainOf,
  emptyLedger,
  fetchSerp,
  isCiEnvironment,
  isFatalProviderStatus,
  isOfficialDomain,
  ledgerUsed,
  loadGscQueryMap,
  mergeSerpIntoExternal,
  monthKey,
  normalizeSerp,
  parseArgs,
  querySlug,
  recordCall,
  renderBrief,
  resolveApiKey,
  selectDue,
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
  it("lee el mapa GSC de la última semana disponible", () => {
    const root = mkdtempSync(path.join(tmpdir(), "serp-"));
    const dir = path.join(root, "output/operations/data-signals/gsc");
    mkdirSync(dir, { recursive: true });
    const doc = (week: string, impressions: number) =>
      JSON.stringify({
        week,
        data: [{ query: "UF hoy", impressions, ctr: 0.01, position: 9 }],
      });
    writeFileSync(path.join(dir, "2026-W45-queries.json"), doc("2026-W45", 1));
    writeFileSync(path.join(dir, "2026-W46-queries.json"), doc("2026-W46", 999));
    const { week, map } = loadGscQueryMap(root);
    expect(week).toBe("2026-W46");
    expect(map.get("uf hoy")?.impressions).toBe(999);
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
  it("la lista es corta, válida y cabe en el tope mensual", () => {
    const watchlist = JSON.parse(
      readFileSync(path.resolve("src/config/serp-watchlist.json"), "utf8")
    );
    expect(watchlist.market).toMatchObject({ gl: "cl", hl: "es", google_domain: "google.cl" });
    const slugs = watchlist.queries.map((q: { query: string }) => querySlug(q.query));
    expect(new Set(slugs).size).toBe(slugs.length);
    const monthly = watchlist.queries.reduce(
      (sum: number, q: { tier: number }) =>
        sum + (q.tier === 1 ? 30 / watchlist.cadenceDays["1"] : 30 / watchlist.cadenceDays["2"]),
      0
    );
    expect(monthly).toBeLessThanOrEqual(60);
  });
});
