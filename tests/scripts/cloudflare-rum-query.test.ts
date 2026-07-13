/**
 * Tests para el armado del query RUM de Cloudflare (GROWTH-005).
 *
 * `rumWebVitalsEventsAdaptiveGroups` es un dataset a nivel de CUENTA (no de
 * zona) en el schema GraphQL de Cloudflare Analytics: la cuenta aloja varios
 * sitios además de monedario.cl, así que sin un filtro de hostname, las
 * rutas compartidas (p. ej. `/`) mezclan tráfico cross-hostname en silencio.
 *
 * Como el query real hace red, no se ejercita contra la API — se testea:
 *  - el armado determinista del query/variables vía `buildRumQuery` (función
 *    pura exportada para este fin), y
 *  - que `fetchRumWebVitals` efectivamente envía `requestHost` en el POST
 *    real (mockeando `fetch`) y conserva el guard `?? []`.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildRumQuery,
  fetchRumWebVitals,
} from "../../scripts/data-signals/cloudflare-fetch.mjs";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("buildRumQuery", () => {
  it("incluye el hostname objetivo en las variables del filtro", () => {
    const { variables } = buildRumQuery(
      "account-tag-123",
      "monedario.cl",
      "2026-07-06T00:00:00Z",
      "2026-07-12T23:59:59Z"
    );

    expect(variables.host).toBe("monedario.cl");
    expect(variables.accountTag).toBe("account-tag-123");
    expect(variables.from).toBe("2026-07-06T00:00:00Z");
    expect(variables.to).toBe("2026-07-12T23:59:59Z");
  });

  it("declara $host y lo referencia en el filter del query GraphQL (fix GROWTH-005)", () => {
    const { query } = buildRumQuery(
      "account-tag-123",
      "monedario.cl",
      "2026-07-06T00:00:00Z",
      "2026-07-12T23:59:59Z"
    );

    expect(query).toContain("$host: string!");
    expect(query).toContain("requestHost: $host");
    // El query se mantiene scopeado a nivel de cuenta (Opción A) — no a zona.
    expect(query).toContain("accounts(filter: { accountTag: $accountTag })");
  });

  it("propaga un host distinto sin hardcodear monedario.cl en el armado del query", () => {
    const { variables } = buildRumQuery(
      "account-tag-123",
      "otro-sitio.cl",
      "2026-07-06T00:00:00Z",
      "2026-07-12T23:59:59Z"
    );

    expect(variables.host).toBe("otro-sitio.cl");
  });
});

describe("fetchRumWebVitals", () => {
  function mockFetchJson(body: unknown) {
    return vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => body,
    } as Response);
  }

  it("envía requestHost=monedario.cl en el body real del POST a la API de Cloudflare", async () => {
    const fetchSpy = mockFetchJson({
      data: { viewer: { accounts: [{ rumWebVitalsEventsAdaptiveGroups: [] }] } },
    });

    await fetchRumWebVitals(
      "fake-token",
      "account-tag-123",
      "monedario.cl",
      "2026-07-06T00:00:00Z",
      "2026-07-12T23:59:59Z"
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.cloudflare.com/client/v4/graphql");
    const sentBody = JSON.parse(init.body as string);
    expect(sentBody.variables.host).toBe("monedario.cl");
    expect(sentBody.query).toContain("requestHost: $host");
  });

  it("retorna [] cuando la cuenta no trae grupos (guard `?? []`)", async () => {
    mockFetchJson({ data: { viewer: { accounts: [{}] } } });

    const rows = await fetchRumWebVitals(
      "fake-token",
      "account-tag-123",
      "monedario.cl",
      "2026-07-06T00:00:00Z",
      "2026-07-12T23:59:59Z"
    );

    expect(rows).toEqual([]);
  });

  it("retorna [] cuando `accounts` viene vacío (sin match de accountTag)", async () => {
    mockFetchJson({ data: { viewer: { accounts: [] } } });

    const rows = await fetchRumWebVitals(
      "fake-token",
      "account-tag-123",
      "monedario.cl",
      "2026-07-06T00:00:00Z",
      "2026-07-12T23:59:59Z"
    );

    expect(rows).toEqual([]);
  });
});
