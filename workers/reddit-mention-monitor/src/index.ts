// Reddit mention monitor — Cloudflare Worker (cron + Discord).
//
// Every 15 min: app-only OAuth → search each keyword group on Reddit → drop posts
// already seen (KV) and below score/NSFW filters → push new matches to Discord →
// mark them seen. Listen-only: it never posts to Reddit. Closes the seeding loop
// (listen → reply with the kit → measure via GSC). See ADR + README.

import { getAppToken, searchReddit, type RedditPost } from "./redditClient";
import { KEYWORD_GROUPS, SUBREDDIT_SCOPE } from "./keywords";
import { filterUnseen, markSeen } from "./dedup";
import { postAlert, type Match } from "./discord";

export interface Env {
  REDDIT_SEEN: KVNamespace;
  REDDIT_CLIENT_ID: string;
  REDDIT_CLIENT_SECRET: string;
  DISCORD_WEBHOOK_URL: string;
  REDDIT_USER_AGENT: string;
  SEARCH_TIME_WINDOW?: string;
  SEARCH_LIMIT?: string;
  MIN_SCORE?: string;
  CHECK_SECRET?: string;
}

type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, event: string, fields: Record<string, unknown> = {}): void {
  const line = JSON.stringify({
    level,
    event,
    timestamp: new Date().toISOString(),
    worker: "reddit-mention-monitor",
    ...fields,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

function constantTimeEqual(a: string, b: string): boolean {
  const maxLength = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;

  for (let i = 0; i < maxLength; i += 1) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }

  return diff === 0;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body) + "\n", {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function assertEnv(env: Env): void {
  for (const key of [
    "REDDIT_CLIENT_ID",
    "REDDIT_CLIENT_SECRET",
    "DISCORD_WEBHOOK_URL",
    "REDDIT_USER_AGENT",
  ] as const) {
    if (!env[key]) throw new Error(`Missing required env var: ${key}`);
  }
}

/** Intent + quality filter. Pure given thresholds. Exported for tests. */
export function passesFilter(post: RedditPost, minScore: number): boolean {
  if (post.nsfw) return false;
  if (post.score < minScore) return false;
  return true;
}

async function runMonitor(env: Env): Promise<{ found: number; alerted: number }> {
  assertEnv(env);
  const minScore = Number(env.MIN_SCORE ?? "0");
  const limit = Number(env.SEARCH_LIMIT ?? "25");
  const timeWindow = env.SEARCH_TIME_WINDOW ?? "day";

  const token = await getAppToken(
    env.REDDIT_CLIENT_ID,
    env.REDDIT_CLIENT_SECRET,
    env.REDDIT_USER_AGENT
  );

  const matches: Match[] = [];
  let totalFound = 0;

  for (const group of KEYWORD_GROUPS) {
    let posts: RedditPost[];
    try {
      posts = await searchReddit(token, env.REDDIT_USER_AGENT, group.query, {
        timeWindow,
        limit,
        restrictSubreddit: SUBREDDIT_SCOPE,
      });
    } catch (err) {
      log("warn", "search.failed", {
        query: group.query,
        message: err instanceof Error ? err.message : String(err),
      });
      continue;
    }
    totalFound += posts.length;

    const candidates = posts.filter(p => passesFilter(p, minScore));
    const unseen = await filterUnseen(env.REDDIT_SEEN, candidates);
    for (const post of unseen) {
      matches.push({
        post,
        calculator: group.calculator,
        calculatorLabel: group.label,
      });
    }
  }

  if (matches.length > 0) {
    const { delivered, error } = await postAlert(env.DISCORD_WEBHOOK_URL, matches);
    await Promise.all(delivered.map(m => markSeen(env.REDDIT_SEEN, m.post.id)));
    if (error) {
      log("warn", "alert.partial_failure", {
        delivered: delivered.length,
        total: matches.length,
        message: error.message,
      });
    }
  }

  log("info", "run.complete", {
    keywordGroups: KEYWORD_GROUPS.length,
    found: totalFound,
    alerted: matches.length,
  });
  return { found: totalFound, alerted: matches.length };
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      runMonitor(env).catch(err => {
        log("error", "run.failed", {
          message: err instanceof Error ? err.message : String(err),
        });
        throw err;
      })
    );
  },

  // Manual smoke trigger. Auth via `Authorization: Bearer <CHECK_SECRET>`.
  // Query-string credentials are rejected: the old `?secret=` form returns
  // 401 because only the header is read. The workers.dev URL is guessable so
  // we require the secret even though the Worker is unrouted.
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/__check") {
      return new Response("Not Found", { status: 404 });
    }
    if (!env.CHECK_SECRET) {
      return jsonResponse({ error: "check_not_configured" }, 503);
    }
    const authHeader = request.headers.get("Authorization");
    const provided =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length).trim()
        : null;
    if (!provided) {
      return jsonResponse({ error: "missing_secret" }, 401);
    }
    if (!constantTimeEqual(provided, env.CHECK_SECRET)) {
      return jsonResponse({ error: "invalid_secret" }, 403);
    }
    try {
      const result = await runMonitor(env);
      return new Response(`${JSON.stringify(result)}\n`, { status: 200 });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log("error", "run.failed.manual", { message });
      return new Response(`error: ${message}\n`, { status: 500 });
    }
  },
};
