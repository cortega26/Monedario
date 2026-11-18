import {
  evaluateLiveFreshness,
  evaluateSnapshotHeartbeat,
} from "../../../scripts/lib/deploy-health-evaluators.mjs";

/** Keep in sync with the `[vars]` block in `wrangler.toml`. */
export interface Env {
  SITE_URL: string;
  HEALTH_URL: string;
}

export interface HealthStatus {
  ok: boolean;
  checkedAt: string;
  problems: string[];
}

const TIMEOUT_MS = 30_000;
const DEFAULT_HEALTH_URL =
  "https://monedario.cl/api/deploy-health.json";

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function fetchFresh(url: string, now: Date): Promise<Response> {
  const separator = url.includes("?") ? "&" : "?";
  return fetch(`${url}${separator}deploy-health=${now.getTime()}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "Cache-Control": "no-cache" },
  });
}

/**
 * Runs the public checks and returns a JSON-serializable status.
 *
 * The snapshot heartbeat and the site dates come from the published site: the
 * repository is private, so a Worker cannot read `raw.githubusercontent.com`
 * without a token. `/api/deploy-health.json` is generated at build time from
 * the committed snapshot and is public by design. The URL-freeze exceptions are
 * private governance data and stay in the GitHub workflow.
 */
export async function runChecks(
  env: Env,
  now = new Date()
): Promise<HealthStatus> {
  const problems: string[] = [];
  const siteUrl = env.SITE_URL;
  const healthUrl = env.HEALTH_URL || DEFAULT_HEALTH_URL;

  try {
    const response = await fetchFresh(siteUrl, now);
    if (!response.ok) {
      problems.push(`La portada publicada respondió HTTP ${response.status}.`);
    } else {
      problems.push(
        ...evaluateLiveFreshness({ html: await response.text(), now })
      );
    }
  } catch (error) {
    problems.push(`No se pudo consultar ${siteUrl}: ${describe(error)}`);
  }

  try {
    const response = await fetchFresh(healthUrl, now);
    if (!response.ok) {
      problems.push(
        `El artefacto de salud publicado respondió HTTP ${response.status}.`
      );
    } else {
      problems.push(
        ...evaluateSnapshotHeartbeat({ snapshot: await response.json(), now })
      );
    }
  } catch (error) {
    problems.push(
      `No se pudo consultar el artefacto de salud publicado: ${describe(error)}`
    );
  }

  return {
    ok: problems.length === 0,
    checkedAt: now.toISOString(),
    problems,
  };
}

export default {
  async scheduled(
    _event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    ctx.waitUntil(
      (async () => {
        const status = await runChecks(env);
        const line = JSON.stringify({ worker: "deploy-health", ...status });
        if (status.ok) {
          console.log(line);
        } else {
          console.error(line);
        }
      })()
    );
  },

  // Public, read-only status. It exposes only public site dates and the
  // snapshot heartbeat; the issue synchronization lives in the GitHub workflow.
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname !== "/status") {
      return new Response("Not Found", { status: 404 });
    }
    const status = await runChecks(env);
    return new Response(`${JSON.stringify(status, null, 2)}\n`, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  },
};
