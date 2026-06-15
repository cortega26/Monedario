import {
  assertPlausibleDelta,
  buildSnapshot,
  createMindicadorFetchers,
  mergePrev,
  serializeSnapshot,
  type IndicatorOverride,
} from "./buildSnapshot";
import { getCurrentFile, putFile, type GitHubContentsConfig } from "./githubClient";
import { createIneIpcFetcher } from "./sources/ineIpc";
import { BCCH_SERIES, fetchBcchLatest } from "./sources/bcchSiete";

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

async function runRefresh(env: Env): Promise<void> {
  const config = assertEnv(env);
  const timeoutMs = env.MINDICADOR_TIMEOUT_MS
    ? Number(env.MINDICADOR_TIMEOUT_MS)
    : undefined;

  const fetchers = createMindicadorFetchers({ timeoutMs });

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

  const rawSnapshot = await buildSnapshot({
    fetchApi: fetchers.fetchApi,
    fetchDecemberUtm: fetchers.fetchDecemberUtm,
    fetchIpcOverride,
    fetchUfOverride: makeBcchOverride("uf", BCCH_SERIES.UF),
    fetchUsdOverride: makeBcchOverride("usd", BCCH_SERIES.USD_OBSERVED),
    now: () => new Date(),
  });

  const current = await getCurrentFile(config);
  assertPlausibleDelta(current.content, rawSnapshot);
  const snapshot = mergePrev(current.content, rawSnapshot);
  const serialized = serializeSnapshot(snapshot);

  // capturedAt always differs run-to-run; ignore it for the idempotency check.
  const stableContent = (raw: string): string =>
    raw.replace(/"capturedAt": "[^"]+",?\n?/, "");

  if (stableContent(current.content) === stableContent(serialized)) {
    log("info", "refresh.noop", {
      lastUpdated: snapshot.lastUpdated,
      reason: "payload unchanged (capturedAt excluded)",
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

  // Manual trigger for smoke tests. Requires `?secret=<GITHUB_TOKEN>` to avoid
  // public abuse; in practice the Worker is unrouted (no custom domain), but
  // workers.dev URLs are guessable, so we gate it.
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/__refresh") {
      return new Response("Not Found", { status: 404 });
    }
    const provided = url.searchParams.get("secret");
    if (!provided || provided !== env.GITHUB_TOKEN) {
      return new Response("Forbidden", { status: 403 });
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
