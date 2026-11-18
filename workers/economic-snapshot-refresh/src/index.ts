import {
  assertPlausibleDelta,
  buildSnapshot,
  createMindicadorFetchers,
  mergePrev,
  serializeSnapshot,
  withMindicadorFallback,
  type IndicatorOverride,
} from "./buildSnapshot";
import { getCurrentFile, putFile, type GitHubContentsConfig } from "./githubClient";
import { createIneIpcFetcher } from "./sources/ineIpc";
import { BCCH_SERIES, fetchBcchLatest } from "./sources/bcchSiete";
import { createSiiUtmFetcher } from "./sources/siiUtm";

export interface Env {
  GITHUB_TOKEN: string;
  REPO_OWNER: string;
  REPO_NAME: string;
  TARGET_BRANCH: string;
  TARGET_PATH: string;
  COMMIT_AUTHOR_NAME: string;
  COMMIT_AUTHOR_EMAIL: string;
  COMMIT_MESSAGE: string;
  MINDICADOR_TIMEOUT_MS?: string;
  /** BCCh SiETE auth. Both optional — if absent, snapshot falls back to mindicador.cl. */
  BCCH_USER?: string;
  BCCH_PASSWORD?: string;
  /** Dedicated manual-trigger secret for /__refresh. NEVER the GitHub PAT. */
  TRIGGER_SECRET?: string;
}

type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, event: string, fields: Record<string, unknown> = {}): void {
  const entry = {
    level,
    event,
    timestamp: new Date().toISOString(),
    worker: "economic-snapshot-refresh",
    ...fields,
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

function assertEnv(env: Env): GitHubContentsConfig {
  const required: Array<keyof Env> = [
    "GITHUB_TOKEN",
    "REPO_OWNER",
    "REPO_NAME",
    "TARGET_BRANCH",
    "TARGET_PATH",
    "COMMIT_AUTHOR_NAME",
    "COMMIT_AUTHOR_EMAIL",
    "COMMIT_MESSAGE",
  ];
  for (const key of required) {
    if (!env[key]) {
      throw new Error(`Missing required env var: ${key}`);
    }
  }
  return {
    token: env.GITHUB_TOKEN,
    owner: env.REPO_OWNER,
    repo: env.REPO_NAME,
    branch: env.TARGET_BRANCH,
    path: env.TARGET_PATH,
    authorName: env.COMMIT_AUTHOR_NAME,
    authorEmail: env.COMMIT_AUTHOR_EMAIL,
  };
}

function constantTimeEqual(a: string, b: string): boolean {
  const maxLength = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;

  for (let i = 0; i < maxLength; i += 1) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }

  return diff === 0;
}

// Idempotency contract (ADR-20260516-economic-snapshot-cloudflare-worker): two
// payloads are equivalent when every data field matches, ignoring ONLY the
// observation instants — the root capture instant and the UTM provenance
// verification instant. Object key order and whitespace never matter (parsed
// JSON); array order does. Inputs are never mutated. Invalid JSON throws so a
// corrupt read is an observable failure, never a false no-op.
function isObservationInstant(path: Array<string | number>): boolean {
  if (path.length === 1 && path[0] === "capturedAt") return true;
  return (
    path.length === 3 &&
    path[0] === "provenance" &&
    path[1] === "utm" &&
    path[2] === "verifiedAt"
  );
}

function deepEqualJson(
  a: unknown,
  b: unknown,
  path: Array<string | number>
): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
    return false;
  }
  const aIsArray = Array.isArray(a);
  const bIsArray = Array.isArray(b);
  if (aIsArray || bIsArray) {
    if (!aIsArray || !bIsArray) return false;
    const aItems = a as Array<unknown>;
    const bItems = b as Array<unknown>;
    if (aItems.length !== bItems.length) return false;
    return aItems.every((item, i) => deepEqualJson(item, bItems[i], [...path, i]));
  }
  const aRecord = a as Record<string, unknown>;
  const bRecord = b as Record<string, unknown>;
  const keys = new Set([...Object.keys(aRecord), ...Object.keys(bRecord)]);
  for (const key of keys) {
    const child = [...path, key];
    if (isObservationInstant(child)) continue;
    if (!(key in aRecord) || !(key in bRecord)) return false;
    if (!deepEqualJson(aRecord[key], bRecord[key], child)) return false;
  }
  return true;
}

function snapshotsEqual(currentJson: string, serialized: string): boolean {
  const current: unknown = JSON.parse(currentJson);
  const next: unknown = JSON.parse(serialized);
  return deepEqualJson(current, next, []);
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body) + "\n", {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

async function runRefresh(env: Env): Promise<void> {
  const config = assertEnv(env);
  const timeoutMs = env.MINDICADOR_TIMEOUT_MS
    ? Number(env.MINDICADOR_TIMEOUT_MS)
    : undefined;

  const fetchers = createMindicadorFetchers({ timeoutMs });
  const siiUtm = createSiiUtmFetcher({ timeoutMs });

  const ineIpc = createIneIpcFetcher();
  const fetchIpcOverride = async (): Promise<IndicatorOverride | null> => {
    try {
      const reading = await ineIpc();
      if (!reading) {
        log("warn", "ipc.override.empty", {
          reason: "INE HTML parsed but no monthly IPC found",
        });
        return null;
      }
      log("info", "ipc.override.applied", {
        source: "INE",
        value: reading.value,
        dateIso: reading.dateIso,
      });
      return reading;
    } catch (err) {
      log("warn", "ipc.override.failed", {
        message: err instanceof Error ? err.message : String(err),
        fallback: "mindicador.cl IPC (may be stale)",
      });
      return null;
    }
  };

  const bcchCredentials =
    env.BCCH_USER && env.BCCH_PASSWORD
      ? { user: env.BCCH_USER, password: env.BCCH_PASSWORD }
      : null;
  if (!bcchCredentials) {
    log("warn", "bcch.disabled", {
      reason: "BCCH_USER or BCCH_PASSWORD secret missing; UF/USD will use mindicador.cl",
    });
  }

  const makeBcchOverride = (
    indicator: "uf" | "usd",
    seriesId: string
  ): (() => Promise<IndicatorOverride | null>) => {
    return async () => {
      if (!bcchCredentials) return null;
      try {
        const reading = await fetchBcchLatest(bcchCredentials, seriesId);
        if (!reading) {
          log("warn", `${indicator}.override.empty`, {
            source: "BCCh",
            seriesId,
            reason: "no observations in lookback window",
          });
          return null;
        }
        log("info", `${indicator}.override.applied`, {
          source: "BCCh",
          seriesId,
          value: reading.value,
          dateIso: reading.dateIso,
        });
        return reading;
      } catch (err) {
        log("warn", `${indicator}.override.failed`, {
          source: "BCCh",
          seriesId,
          message: err instanceof Error ? err.message : String(err),
          fallback: "mindicador.cl (may be stale)",
        });
        return null;
      }
    };
  };

  // Read the current snapshot BEFORE building: it is both the diff baseline
  // and the carry-forward payload when the aggregator is unreachable.
  const current = await getCurrentFile(config);
  let mindicadorDegraded = false;

  const fetchApiForBuild = () =>
    withMindicadorFallback(fetchers.fetchApi, current.content, err => {
      // The aggregator being down must not freeze every indicator. The
      // authoritative overrides (BCCh UF/USD, SII UTM, INE IPC) still apply;
      // only the fields mindicador owns are carried forward.
      mindicadorDegraded = true;
      log("warn", "mindicador.fallback", {
        message: err instanceof Error ? err.message : String(err),
        fallback: "carry-forward from the last committed snapshot",
      });
    });

  const rawSnapshot = await buildSnapshot({
    fetchApi: fetchApiForBuild,
    fetchDecemberUtm: fetchers.fetchDecemberUtm,
    fetchIpcOverride,
    fetchUfOverride: makeBcchOverride("uf", BCCH_SERIES.UF),
    fetchUsdOverride: makeBcchOverride("usd", BCCH_SERIES.USD_OBSERVED),
    fetchUtmOverride: async () => {
      try {
        const reading = await siiUtm();
        if (!reading) {
          log("warn", "utm.override.empty", {
            source: "SII",
            fallback: "mindicador.cl",
          });
          return null;
        }
        log("info", "utm.override.applied", {
          source: "SII",
          value: reading.value,
          dateIso: reading.dateIso,
        });
        return reading;
      } catch (err) {
        log("warn", "utm.override.failed", {
          source: "SII",
          message: err instanceof Error ? err.message : String(err),
          fallback: "mindicador.cl",
        });
        return null;
      }
    },
    now: () => new Date(),
  });

  assertPlausibleDelta(current.content, rawSnapshot);
  const merged = mergePrev(current.content, rawSnapshot);
  const snapshot = mindicadorDegraded
    ? { ...merged, source: "snapshot.carry-forward" as const }
    : merged;
  const serialized = serializeSnapshot(snapshot);

  if (snapshotsEqual(current.content, serialized)) {
    log("info", "refresh.noop", {
      lastUpdated: snapshot.lastUpdated,
      reason: "payload unchanged (observation instants excluded)",
    });
    return;
  }

  const result = await putFile(config, {
    content: serialized,
    sha: current.sha,
    message: env.COMMIT_MESSAGE,
  });
  log("info", "refresh.committed", {
    lastUpdated: snapshot.lastUpdated,
    commitSha: result.commit.sha,
    commitUrl: result.commit.html_url,
  });
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      runRefresh(env).catch(err => {
        log("error", "refresh.failed", {
          message: err instanceof Error ? err.message : String(err),
        });
        throw err;
      })
    );
  },

  // Manual trigger for smoke tests. Auth via `Authorization: Bearer
  // <TRIGGER_SECRET>` (dedicated secret — NEVER the GitHub PAT). Query-string
  // credentials are rejected: the old `?secret=` form returns 401 because
  // only the header is read. In practice the Worker is unrouted (no custom
  // domain), but workers.dev URLs are guessable, so we gate it.
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/__refresh") {
      return new Response("Not Found", { status: 404 });
    }
    if (!env.TRIGGER_SECRET) {
      return jsonResponse({ error: "trigger_not_configured" }, 503);
    }
    const authHeader = request.headers.get("Authorization");
    const provided =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length).trim()
        : null;
    if (!provided) {
      return jsonResponse({ error: "missing_secret" }, 401);
    }
    if (!constantTimeEqual(provided, env.TRIGGER_SECRET)) {
      return jsonResponse({ error: "invalid_secret" }, 403);
    }
    try {
      await runRefresh(env);
      return new Response("ok\n", { status: 200 });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log("error", "refresh.failed.manual", { message });
      return new Response(`error: ${message}\n`, { status: 500 });
    }
  },
};
