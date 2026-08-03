/**
 * Tests unitarios del verifier de despliegue del worker analytics.
 *
 * Cubren los estados exigidos por el plan: paridad actual, versión stale,
 * cron stale, auth no autorizada (y build antiguo que acepta query-string),
 * y propagación del cron con polling. La red se reemplaza con un fetch fake.
 */
import { describe, expect, it, vi } from "vitest";

import {
  activeDeployment,
  checkActiveVersion,
  checkAuthenticatedExport,
  checkExactSchedule,
  checkQueryStringRejected,
  checkR2Freshness,
  EXPECTED_CRONS,
  QUERY_STRING_DECOY,
  R2_BUCKET,
  verifyDeploymentParity,
  WORKER_NAME,
} from "../../scripts/data-signals/verify-analytics-worker-deployment.mjs";

const ACCOUNT_ID = "fak3-account-id";
const TOKEN = "fak3-token";
const EXPORT_SECRET = "fak3-export-secret";
const EXPORT_URL = "https://monedario.cl/api/analytics/export";
const WEEK = "2026-W31";

function jsonResponse(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

/**
 * Fetch fake con enrutado por URL.
 * `routes`: arreglo de `{ match: (url) => boolean, handler: () => Response }`.
 */
function makeFakeFetch(routes) {
  return vi.fn(async (url, init) => {
    const parsed = new URL(url);
    for (const route of routes) {
      if (route.match(parsed)) {
        return route.handler(parsed, init);
      }
    }
    return new Response("no route", { status: 599 });
  });
}

function makeDeps(fetch, overrides = {}) {
  return {
    fetch,
    now: overrides.now ?? (() => new Date("2026-08-03T12:00:00Z")),
    sleep: overrides.sleep ?? (async () => {}),
    log: overrides.log ?? (() => {}),
  };
}

function deploymentsResponse(createdOn, versionId = "version-1") {
  return jsonResponse(200, {
    result: {
      deployments: [
        {
          id: "deployment-1",
          created_on: createdOn,
          source: "wrangler",
          strategy: "percentage",
          versions: [{ version_id: versionId, percentage: 100 }],
        },
      ],
    },
  });
}

function schedulesResponse(crons) {
  return jsonResponse(200, {
    result: {
      schedules: crons.map((cron) => ({ cron, created_on: "2026-07-16T00:00:00Z" })),
    },
  });
}

function r2Response(status, headers = {}) {
  return new Response(null, {
    status,
    headers: { "content-length": "1234", "last-modified": "Mon, 03 Aug 2026 12:00:00 GMT", ...headers },
  });
}

function baseConfig(overrides = {}) {
  return {
    accountId: ACCOUNT_ID,
    token: TOKEN,
    exportUrl: EXPORT_URL,
    week: WEEK,
    smokeExport: false,
    deployedNotBefore: null,
    maxWaitMs: 60_000,
    pollIntervalMs: 1,
    ...overrides,
  };
}

describe("activeDeployment", () => {
  it("toma el deployment más reciente y su version activa", () => {
    const active = activeDeployment([
      {
        id: "d2",
        created_on: "2026-08-03T10:00:00Z",
        versions: [{ version_id: "v2", percentage: 100 }],
      },
      {
        id: "d1",
        created_on: "2026-07-16T10:00:00Z",
        versions: [{ version_id: "v1", percentage: 100 }],
      },
    ]);
    expect(active).toEqual({
      deploymentId: "d2",
      versionId: "v2",
      createdOn: "2026-08-03T10:00:00Z",
    });
  });

  it("retorna null sin deployments", () => {
    expect(activeDeployment([])).toBeNull();
    expect(activeDeployment(undefined)).toBeNull();
  });
});

describe("checkActiveVersion", () => {
  it("pasa cuando el deployment activo es posterior a deployed-not-before", async () => {
    const fetch = makeFakeFetch([
      { match: (u) => u.pathname.endsWith(`/workers/scripts/${WORKER_NAME}/deployments`), handler: () => deploymentsResponse("2026-08-03T11:00:00Z") },
    ]);
    const result = await checkActiveVersion(
      makeDeps(fetch),
      ACCOUNT_ID,
      TOKEN,
      new Date("2026-08-03T10:00:00Z"),
    );
    expect(result.ok).toBe(true);
    expect(result.detail).toContain("version-1");
  });

  it("falla (stale) cuando el deployment activo es anterior a deployed-not-before", async () => {
    const fetch = makeFakeFetch([
      { match: (u) => u.pathname.endsWith(`/workers/scripts/${WORKER_NAME}/deployments`), handler: () => deploymentsResponse("2026-07-17T10:00:00Z") },
    ]);
    const result = await checkActiveVersion(
      makeDeps(fetch),
      ACCOUNT_ID,
      TOKEN,
      new Date("2026-08-03T10:00:00Z"),
    );
    expect(result.ok).toBe(false);
    expect(result.detail).toContain("STALE");
  });

  it("reporta sin fallar cuando no hay deployed-not-before", async () => {
    const fetch = makeFakeFetch([
      { match: () => true, handler: () => deploymentsResponse("2026-07-17T10:00:00Z") },
    ]);
    const result = await checkActiveVersion(makeDeps(fetch), ACCOUNT_ID, TOKEN, null);
    expect(result.ok).toBe(true);
    expect(result.detail).toContain("version-1");
  });

  it("falla si no hay deployment activo", async () => {
    const fetch = makeFakeFetch([
      { match: () => true, handler: () => jsonResponse(200, { result: { deployments: [] } }) },
    ]);
    const result = await checkActiveVersion(makeDeps(fetch), ACCOUNT_ID, TOKEN, null);
    expect(result.ok).toBe(false);
  });
});

describe("checkExactSchedule", () => {
  it("pasa cuando el cron es exactamente 57 7 * * MON", async () => {
    const fetch = makeFakeFetch([
      { match: (u) => u.pathname.endsWith(`/workers/scripts/${WORKER_NAME}/schedules`), handler: () => schedulesResponse(EXPECTED_CRONS) },
    ]);
    const result = await checkExactSchedule(makeDeps(fetch), ACCOUNT_ID, TOKEN, {
      maxWaitMs: 60_000,
      pollIntervalMs: 1,
    });
    expect(result.ok).toBe(true);
    expect(result.detail).toContain("57 7 * * MON");
  });

  it("falla si el cron no coincide (p. ej. build antiguo con domingo)", async () => {
    const fetch = makeFakeFetch([
      { match: (u) => u.pathname.endsWith(`/workers/scripts/${WORKER_NAME}/schedules`), handler: () => schedulesResponse(["57 7 * * SUN"]) },
    ]);
    const result = await checkExactSchedule(makeDeps(fetch), ACCOUNT_ID, TOKEN, {
      maxWaitMs: 5,
      pollIntervalMs: 1,
    });
    expect(result.ok).toBe(false);
    expect(result.detail).toContain("57 7 * * SUN");
  });

  it("reintenta (propagación) hasta que el cron coincide", async () => {
    let calls = 0;
    const fetch = makeFakeFetch([
      {
        match: (u) => u.pathname.endsWith(`/workers/scripts/${WORKER_NAME}/schedules`),
        handler: () => {
          calls += 1;
          return calls < 3
            ? schedulesResponse([])
            : schedulesResponse(EXPECTED_CRONS);
        },
      },
    ]);
    const sleep = vi.fn(async () => {});
    const result = await checkExactSchedule(makeDeps(fetch, { sleep }), ACCOUNT_ID, TOKEN, {
      maxWaitMs: 60_000,
      pollIntervalMs: 1,
    });
    expect(result.ok).toBe(true);
    expect(sleep).toHaveBeenCalledTimes(2);
    expect(calls).toBe(3);
  });

  it("falla por timeout cuando nunca coincide", async () => {
    const fetch = makeFakeFetch([
      { match: () => true, handler: () => schedulesResponse(["57 7 * * SUN"]) },
    ]);
    const result = await checkExactSchedule(makeDeps(fetch), ACCOUNT_ID, TOKEN, {
      maxWaitMs: 5,
      pollIntervalMs: 1,
    });
    expect(result.ok).toBe(false);
    expect(result.detail).toContain("min");
  });
});

describe("checkQueryStringRejected", () => {
  it("pasa cuando el worker responde 401 a credenciales en query-string", async () => {
    const fetch = makeFakeFetch([
      {
        match: (u) => u.searchParams.get("week") === WEEK && u.searchParams.get("secret") === QUERY_STRING_DECOY,
        handler: () => jsonResponse(401, { error: "missing_secret" }),
      },
    ]);
    const result = await checkQueryStringRejected(makeDeps(fetch), EXPORT_URL, WEEK);
    expect(result.ok).toBe(true);
  });

  it("falla si el build antiguo acepta query-string (HTTP 200)", async () => {
    const fetch = makeFakeFetch([
      { match: () => true, handler: () => jsonResponse(200, { week: WEEK }) },
    ]);
    const result = await checkQueryStringRejected(makeDeps(fetch), EXPORT_URL, WEEK);
    expect(result.ok).toBe(false);
  });

  it("falla si el worker responde 403 (error distinto)", async () => {
    const fetch = makeFakeFetch([
      { match: () => true, handler: () => jsonResponse(403, { error: "invalid_secret" }) },
    ]);
    const result = await checkQueryStringRejected(makeDeps(fetch), EXPORT_URL, WEEK);
    expect(result.ok).toBe(false);
  });
});

describe("checkAuthenticatedExport", () => {
  it("pasa con header válido y respuesta solo-metadatos", async () => {
    const fetch = makeFakeFetch([
      {
        match: (u) => u.pathname.endsWith("/export") && u.searchParams.get("week") === WEEK,
        handler: (_u, init) => {
          const auth = new Headers(init?.headers).get("Authorization");
          expect(auth).toBe(`Bearer ${EXPORT_SECRET}`);
          return jsonResponse(200, {
            week: WEEK,
            window: { from: "2026-07-27", to: "2026-08-02" },
            rows: 3,
            totalEvents: 10,
          });
        },
      },
    ]);
    const result = await checkAuthenticatedExport(makeDeps(fetch), EXPORT_URL, WEEK, EXPORT_SECRET);
    expect(result.ok).toBe(true);
  });

  it("falla cuando el export no autorizado responde 401 (secret no configurado)", async () => {
    const fetch = makeFakeFetch([
      { match: () => true, handler: () => jsonResponse(401, { error: "invalid_secret" }) },
    ]);
    const result = await checkAuthenticatedExport(makeDeps(fetch), EXPORT_URL, WEEK, EXPORT_SECRET);
    expect(result.ok).toBe(false);
    expect(result.detail).toContain("401");
  });

  it("falla si la respuesta expone data cruda o r2Key", async () => {
    const fetch = makeFakeFetch([
      {
        match: () => true,
        handler: () => jsonResponse(200, {
          week: WEEK,
          window: { from: "2026-07-27", to: "2026-08-02" },
          rows: 3,
          totalEvents: 10,
          data: [{ date: "2026-07-27", count: 10 }],
          r2Key: "analytics-exports/2026-W31.json",
        }),
      },
    ]);
    const result = await checkAuthenticatedExport(makeDeps(fetch), EXPORT_URL, WEEK, EXPORT_SECRET);
    expect(result.ok).toBe(false);
    expect(result.detail).toContain("data");
    expect(result.detail).toContain("r2Key");
  });

  it("falla si week no coincide con lo solicitado", async () => {
    const fetch = makeFakeFetch([
      {
        match: () => true,
        handler: () => jsonResponse(200, {
          week: "2026-W30",
          window: { from: "2026-07-20", to: "2026-07-26" },
          rows: 1,
          totalEvents: 1,
        }),
      },
    ]);
    const result = await checkAuthenticatedExport(makeDeps(fetch), EXPORT_URL, WEEK, EXPORT_SECRET);
    expect(result.ok).toBe(false);
    expect(result.detail).toContain("2026-W30");
  });
});

describe("checkR2Freshness", () => {
  const referenceTime = new Date("2026-08-03T07:57:00Z");

  it("pasa (200) cuando el objeto fue re-escrito después del instante de referencia", async () => {
    const fetch = makeFakeFetch([
      {
        match: (u) => u.pathname.endsWith(`/r2/buckets/${R2_BUCKET}/objects/analytics-exports/${WEEK}.json`),
        handler: () => r2Response(200),
      },
    ]);
    const result = await checkR2Freshness(
      makeDeps(fetch),
      ACCOUNT_ID,
      TOKEN,
      WEEK,
      referenceTime,
      () => new Date("2026-08-03T12:00:00Z"),
    );
    expect(result.ok).toBe(true);
    expect(result.detail).toContain(WEEK);
  });

  it("falla (304) cuando el objeto existe pero es anterior al instante de referencia", async () => {
    const fetch = makeFakeFetch([
      { match: () => true, handler: () => r2Response(304) },
    ]);
    const result = await checkR2Freshness(
      makeDeps(fetch),
      ACCOUNT_ID,
      TOKEN,
      WEEK,
      referenceTime,
      () => new Date("2026-08-03T12:00:00Z"),
    );
    expect(result.ok).toBe(false);
    expect(result.detail).toContain("304");
    expect(result.detail).toContain("stale");
  });

  it("falla (404) cuando el objeto no existe", async () => {
    const fetch = makeFakeFetch([
      { match: () => true, handler: () => r2Response(404) },
    ]);
    const result = await checkR2Freshness(
      makeDeps(fetch),
      ACCOUNT_ID,
      TOKEN,
      WEEK,
      referenceTime,
      () => new Date("2026-08-03T12:00:00Z"),
    );
    expect(result.ok).toBe(false);
    expect(result.detail).toContain("404");
  });

  it("queda pendiente (pasa) cuando el instante esperado aún no llega", async () => {
    const fetch = makeFakeFetch([
      { match: () => true, handler: () => r2Response(404) },
    ]);
    const result = await checkR2Freshness(
      makeDeps(fetch),
      ACCOUNT_ID,
      TOKEN,
      WEEK,
      new Date("2026-08-10T07:57:00Z"),
      () => new Date("2026-08-03T12:00:00Z"),
    );
    expect(result.ok).toBe(true);
    expect(result.detail).toContain("pendiente");
  });

  it("usa If-Modified-Since con el instante de referencia", async () => {
    const fetch = makeFakeFetch([
      {
        match: () => true,
        handler: (_u, init) => {
          expect(init?.headers["If-Modified-Since"]).toBe(referenceTime.toUTCString());
          return r2Response(200);
        },
      },
    ]);
    const result = await checkR2Freshness(
      makeDeps(fetch),
      ACCOUNT_ID,
      TOKEN,
      WEEK,
      referenceTime,
      () => new Date("2026-08-03T12:00:00Z"),
    );
    expect(result.ok).toBe(true);
  });
});

describe("verifyDeploymentParity — escenarios completos", () => {
  it("paridad completa OK (estado actual: version, cron, auth y R2 frescos)", async () => {
    const fetch = makeFakeFetch([
      { match: (u) => u.pathname.endsWith("/deployments"), handler: () => deploymentsResponse("2026-08-03T11:00:00Z") },
      { match: (u) => u.pathname.endsWith("/schedules"), handler: () => schedulesResponse(EXPECTED_CRONS) },
      { match: (u) => u.searchParams.has("secret"), handler: () => jsonResponse(401, { error: "missing_secret" }) },
      { match: (u) => u.pathname.endsWith("/export"), handler: () => jsonResponse(200, { week: WEEK, window: { from: "2026-07-27", to: "2026-08-02" }, rows: 3, totalEvents: 10 }) },
      { match: (u) => u.pathname.includes("/r2/buckets/"), handler: () => r2Response(200) },
    ]);
    const result = await verifyDeploymentParity(makeDeps(fetch), baseConfig({
      smokeExport: true,
      exportSecret: EXPORT_SECRET,
      deployedNotBefore: "2026-08-03T10:00:00Z",
    }));
    expect(result.ok).toBe(true);
    expect(result.results.map((r) => r.check)).toEqual([
      "version-activa",
      "cron-exacto",
      "auth-rechaza-query-string",
      "smoke-export-autenticado",
      "r2-frescura",
    ]);
  });

  it("falla el smoke sin EXPORT_SECRET", async () => {
    const fetch = makeFakeFetch([
      { match: () => true, handler: () => deploymentsResponse("2026-08-03T11:00:00Z") },
    ]);
    const result = await verifyDeploymentParity(makeDeps(fetch), baseConfig({
      smokeExport: true,
      exportSecret: undefined,
    }));
    expect(result.ok).toBe(false);
    const smoke = result.results.find((r) => r.check === "smoke-export-autenticado");
    expect(smoke?.ok).toBe(false);
    expect(smoke?.detail).toContain("EXPORT_SECRET");
  });

  it("un solo chequeo roto rompe la paridad (build antiguo con query-string)", async () => {
    const fetch = makeFakeFetch([
      { match: (u) => u.pathname.endsWith("/deployments"), handler: () => deploymentsResponse("2026-08-03T11:00:00Z") },
      { match: (u) => u.pathname.endsWith("/schedules"), handler: () => schedulesResponse(EXPECTED_CRONS) },
      // Build antiguo: acepta el secreto en query-string → 200 en vez de 401.
      { match: (u) => u.searchParams.has("secret"), handler: () => jsonResponse(200, { week: WEEK }) },
      { match: () => true, handler: () => r2Response(200) },
    ]);
    const result = await verifyDeploymentParity(makeDeps(fetch), baseConfig({}));
    expect(result.ok).toBe(false);
    const auth = result.results.find((r) => r.check === "auth-rechaza-query-string");
    expect(auth?.ok).toBe(false);
  });
});
