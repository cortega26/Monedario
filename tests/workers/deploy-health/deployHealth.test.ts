import { afterEach, describe, expect, it, vi } from "vitest";
import { runChecks, type Env } from "../../../workers/deploy-health/src/index";

const NOW = new Date("2026-11-18T20:00:00Z");
const ENV: Env = {
  SITE_URL: "https://site.test/",
  SNAPSHOT_URL: "https://snapshot.test/snapshot.json",
  EXCEPTIONS_URL: "https://exceptions.test/exceptions.json",
};

const site = (uf: string, dolar: string) =>
  `<span>UF al ${uf}</span><span>Dólar al ${dolar}</span>`;

type MockOptions = {
  siteHtml?: string;
  siteStatus?: number;
  snapshot?: unknown;
  snapshotStatus?: number;
  exceptions?: unknown;
  exceptionsStatus?: number;
};

function mockFetch(options: MockOptions = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: unknown) => {
      const url = String(input);
      if (url.startsWith(ENV.SITE_URL)) {
        return new Response(options.siteHtml ?? site("18/11/2026", "18/11/2026"), {
          status: options.siteStatus ?? 200,
        });
      }
      if (url.startsWith(ENV.SNAPSHOT_URL ?? "")) {
        return new Response(
          JSON.stringify(
            options.snapshot ?? { capturedAt: "2026-11-18T10:15:00Z" }
          ),
          { status: options.snapshotStatus ?? 200 }
        );
      }
      if (url.startsWith(ENV.EXCEPTIONS_URL)) {
        return new Response(
          JSON.stringify(options.exceptions ?? { exceptions: [] }),
          { status: options.exceptionsStatus ?? 200 }
        );
      }
      throw new Error(`unexpected fetch ${url}`);
    })
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("deploy-health worker", () => {
  it("passes when site, snapshot and exceptions are healthy", async () => {
    mockFetch();
    await expect(runChecks(ENV, NOW)).resolves.toEqual({
      ok: true,
      checkedAt: NOW.toISOString(),
      problems: [],
    });
  });

  it("flags stale site dates", async () => {
    mockFetch({ siteHtml: site("10/11/2026", "10/11/2026") });
    const status = await runChecks(ENV, NOW);
    expect(status.ok).toBe(false);
    expect(status.problems).toHaveLength(2);
    expect(status.problems.join("\n")).toContain("UF al 2026-11-10");
  });

  it("flags a stale snapshot heartbeat", async () => {
    mockFetch({ snapshot: { capturedAt: "2026-11-16T10:15:00Z" } });
    const status = await runChecks(ENV, NOW);
    expect(status.ok).toBe(false);
    expect(status.problems).toHaveLength(1);
    expect(status.problems[0]).toContain("no se refresca desde");
  });

  it("flags an exception close to expiry", async () => {
    mockFetch({
      exceptions: {
        exceptions: [
          {
            url: "https://example.test/x",
            decision: "APPROVED",
            expiresAt: "2026-11-20T00:00:00Z",
          },
        ],
      },
    });
    const status = await runChecks(ENV, NOW);
    expect(status.ok).toBe(false);
    expect(status.problems).toHaveLength(1);
    expect(status.problems[0]).toContain("vence en 1 día");
  });

  it("reports HTTP errors for each source", async () => {
    mockFetch({ siteStatus: 500, snapshotStatus: 404, exceptionsStatus: 503 });
    const status = await runChecks(ENV, NOW);
    expect(status.ok).toBe(false);
    expect(status.problems).toHaveLength(3);
    expect(status.problems.join("\n")).toContain("HTTP 500");
    expect(status.problems.join("\n")).toContain("HTTP 404");
    expect(status.problems.join("\n")).toContain("HTTP 503");
  });

  it("reports network failures without throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      })
    );
    const status = await runChecks(ENV, NOW);
    expect(status.ok).toBe(false);
    expect(status.problems).toHaveLength(3);
    expect(status.problems.join("\n")).toContain("network down");
  });
});
