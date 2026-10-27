import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildUfHistoryResponse,
  GET,
  type UfSerieEntry,
} from "@/pages/api/uf-historico-lookup.json";

const FIXTURE: UfSerieEntry[] = [
  { fecha: "2026-01-01", valor: 40000.11 },
  { fecha: "2026-01-02", valor: 40001.22 },
  { fecha: "2026-01-03", valor: 40002.33 },
  // hueco intencional: 2026-01-04 sin dato
  { fecha: "2026-01-05", valor: 40004.55 },
];

const BASE = "http://localhost/api/uf-historico-lookup.json";
const SUCCESS_CACHE = "public, max-age=86400, stale-while-revalidate=604800";
const JSON_CONTENT_TYPE = "application/json; charset=utf-8";

// El dataset real se refresca con `pnpm run fetch:economic-history --solo=uf`;
// las expectativas se derivan del archivo para que un refresco legítimo no
// rompa el gate (misma convención que tests/data/*.test.ts).
const DATASET = JSON.parse(
  readFileSync(
    fileURLToPath(
      new URL(
        "../../src/data/economic-history/uf-historico.json",
        import.meta.url
      )
    ),
    "utf8"
  )
) as { serie: UfSerieEntry[] };

// Piso congelado del último dato: la serie solo crece, así que un `last`
// anterior a este piso indica truncado o regresión del refresh, nunca un
// dataset "más corto". Mismo patrón ratchet que `minEntries` en
// tests/data/economic-history.test.ts. Se sube oportunísticamente.
const LAST_DATE_FLOOR = "2026-11-09";

async function body(res: Response): Promise<Record<string, unknown>> {
  return (await res.json()) as Record<string, unknown>;
}

describe("uf-historico-lookup legado (sin params)", () => {
  it("devuelve el mapa completo con first/last", async () => {
    const res = buildUfHistoryResponse(FIXTURE, BASE);
    expect(res.status).toBe(200);
    expect(await body(res)).toEqual({
      lookup: {
        "2026-01-01": 40000.11,
        "2026-01-02": 40001.22,
        "2026-01-03": 40002.33,
        "2026-01-05": 40004.55,
      },
      first: "2026-01-01",
      last: "2026-01-05",
    });
  });

  it("preserva Content-Type y Cache-Control", () => {
    const res = buildUfHistoryResponse(FIXTURE, BASE);
    expect(res.headers.get("Content-Type")).toBe(JSON_CONTENT_TYPE);
    expect(res.headers.get("Cache-Control")).toBe(SUCCESS_CACHE);
  });
});

describe("uf-historico-lookup ?date=", () => {
  it("hit devuelve la fila exacta con first/last", async () => {
    const res = buildUfHistoryResponse(
      FIXTURE,
      `${BASE}?date=2026-01-02`
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe(SUCCESS_CACHE);
    expect(await body(res)).toEqual({
      fecha: "2026-01-02",
      valor: 40001.22,
      first: "2026-01-01",
      last: "2026-01-05",
    });
  });

  it("acepta URL como objeto", async () => {
    const res = buildUfHistoryResponse(
      FIXTURE,
      new URL(`${BASE}?date=2026-01-03`)
    );
    expect(res.status).toBe(200);
    expect(await body(res)).toMatchObject({
      fecha: "2026-01-03",
      valor: 40002.33,
    });
  });

  it("miss devuelve 404 con metadatos del rango", async () => {
    const res = buildUfHistoryResponse(
      FIXTURE,
      `${BASE}?date=2026-01-04`
    );
    expect(res.status).toBe(404);
    const payload = await body(res);
    expect(payload["fecha"]).toBe("2026-01-04");
    expect(payload["valor"]).toBeNull();
    expect(payload["first"]).toBe("2026-01-01");
    expect(payload["last"]).toBe("2026-01-05");
    expect(typeof payload["error"]).toBe("string");
  });

  it.each(["no-es-fecha", "2026-13-40", "2026-02-30", "", "2026/01/02"])(
    "400 con date inválido %p",
    async date => {
      const res = buildUfHistoryResponse(
        FIXTURE,
        `${BASE}?date=${encodeURIComponent(date)}`
      );
      expect(res.status).toBe(400);
      expect(res.headers.get("Cache-Control")).toBe("no-store");
      expect(typeof (await body(res))["error"]).toBe("string");
    }
  );

  it("date tiene precedencia sobre from/to", async () => {
    const res = buildUfHistoryResponse(
      FIXTURE,
      `${BASE}?date=2026-01-02&from=2026-01-01&to=2026-01-03`
    );
    expect(res.status).toBe(200);
    expect(await body(res)).toMatchObject({
      fecha: "2026-01-02",
      valor: 40001.22,
    });
  });
});

describe("uf-historico-lookup ?from=&to=", () => {
  it("devuelve el slice acotado con bounds del slice", async () => {
    const res = buildUfHistoryResponse(
      FIXTURE,
      `${BASE}?from=2026-01-02&to=2026-01-05`
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe(SUCCESS_CACHE);
    expect(await body(res)).toEqual({
      lookup: {
        "2026-01-02": 40001.22,
        "2026-01-03": 40002.33,
        "2026-01-05": 40004.55,
      },
      first: "2026-01-02",
      last: "2026-01-05",
    });
  });

  it("slice vacío devuelve lookup vacío con bounds null", async () => {
    const res = buildUfHistoryResponse(
      FIXTURE,
      `${BASE}?from=2020-01-01&to=2020-01-31`
    );
    expect(res.status).toBe(200);
    expect(await body(res)).toEqual({
      lookup: {},
      first: null,
      last: null,
    });
  });

  it.each([
    `${BASE}?from=2026-01-02`,
    `${BASE}?to=2026-01-03`,
    `${BASE}?from=ayer&to=2026-01-03`,
    `${BASE}?from=2026-01-03&to=2026-01-02`,
    `${BASE}?from=2026-02-30&to=2026-03-01`,
  ])("400 con rango inválido %p", async url => {
    const res = buildUfHistoryResponse(FIXTURE, url);
    expect(res.status).toBe(400);
    expect(typeof (await body(res))["error"]).toBe("string");
  });
});

describe("uf-historico-lookup serie vacía", () => {
  it.each([BASE, `${BASE}?date=2026-01-02`, `${BASE}?from=2026-01-01&to=2026-01-31`])(
    "503 con %p",
    async url => {
      const res = buildUfHistoryResponse([], url);
      expect(res.status).toBe(503);
      expect(res.headers.get("Cache-Control")).toBe("no-store");
      expect(await body(res)).toMatchObject({
        lookup: {},
        first: null,
        last: null,
      });
    }
  );
});

describe("uf-historico-lookup GET (dataset real)", () => {
  it("sirve el legado con el rango completo", async () => {
    const res = await GET({
      url: new URL(BASE),
    } as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const payload = (await res.json()) as {
      lookup: Record<string, number>;
      first: string;
      last: string;
    };
    expect(payload.first).toBe("2000-01-01");
    expect(payload.last.localeCompare(LAST_DATE_FLOOR)).toBeGreaterThanOrEqual(
      0
    );
    expect(Object.keys(payload.lookup)).toHaveLength(DATASET.serie.length);
    expect(payload.lookup["2000-01-01"]).toBeCloseTo(15067.93, 2);
  });

  it("resuelve ?date= contra el dataset real", async () => {
    const res = await GET({
      url: new URL(`${BASE}?date=2026-07-09`),
    } as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      fecha: "2026-07-09",
      valor: 40844.79,
    });
  });
});
