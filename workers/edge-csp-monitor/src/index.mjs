import {
  TARGETS, classifyHtml, classifyBatch, extractHtml, makeComment,
  parseLatestMonitorComment, shouldComment,
} from "./check.mjs";

const GITHUB_COMMENTS_API = "https://api.github.com/repos/cortega26/Monedario/issues/675/comments";
const SITE_ORIGIN = "https://monedario.cl";
// Browser Run Quick Actions on Workers Free: at most one request per 10 seconds.
// Use 11 seconds to leave headroom for enforcement/clock skew across the account.
export const QUICK_ACTION_SPACING_MS = 11_000;

const defaultSleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

async function githubRequest(env, url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + env.EDGE_MONITOR_GITHUB_TOKEN,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!response.ok) {
    // Only report fixed, non-secret fields. GitHub's response body can
    // distinguish insufficient token scope, API abuse limits and SSO policy.
    // Never log request headers, Authorization, or the token itself.
    const method = options.method ?? "GET";
    const body = await response.text();
    let message = "unavailable";
    try {
      const parsed = JSON.parse(body);
      if (typeof parsed.message === "string") {
        message = parsed.message
          .replace(/(?:github_pat_|gh[pousr]_)[A-Za-z0-9_]+/g, "[redacted-token]")
          .replace(/\\s+/g, " ")
          .slice(0, 240);
      }
    } catch {
      // Non-JSON errors are intentionally not reproduced in logs.
    }
    const accepted = response.headers.get("x-accepted-github-permissions") ?? "unspecified";
    const remaining = response.headers.get("x-ratelimit-remaining") ?? "unknown";
    const retryAfter = response.headers.get("retry-after") ?? "none";
    throw new Error(
      "GitHub issue notification " + method + " HTTP " + response.status +
      " message=" + JSON.stringify(message) +
      " accepted-permissions=" + JSON.stringify(accepted.slice(0, 160)) +
      " rate-limit-remaining=" + JSON.stringify(remaining.slice(0, 16)) +
      " retry-after=" + JSON.stringify(retryAfter.slice(0, 16))
    );
  }
  return response.json();
}

async function probe(env, target, stamp, sleep) {
  const url = SITE_ORIGIN + target.path + "?edge-guard=" + encodeURIComponent(stamp);
  try {
    const request = () => env.BROWSER.quickAction("content", {
      url,
      userAgent: UA,
      gotoOptions: { waitUntil: "domcontentloaded", timeout: 20000 },
      waitForTimeout: 1000, // Observe deferred Precursor/JSD injections.
      rejectResourceTypes: ["image", "font", "stylesheet"],
    });
    let response = await request();
    if (response.status === 429) {
      // Other Workers on the account may have used the shared rate budget.
      // One bounded retry, never a loop. Keep persistent 429 inconclusive.
      const retryAfterSeconds = Number(response.headers.get("retry-after"));
      const retryMs = Math.max(
        QUICK_ACTION_SPACING_MS,
        Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
          ? Math.min(retryAfterSeconds * 1000, 60_000)
          : 0
      );
      console.warn("[edge-csp-monitor] Quick Action 429; retry once", target.path, retryMs);
      await sleep(retryMs);
      response = await request();
    }
    if (!response.ok) {
      return {
        path: target.path, status: "inconclusive",
        findings: ["browser-http-" + response.status],
      };
    }
    const html = extractHtml(
      await response.text(), response.headers.get("content-type") ?? ""
    );
    return { path: target.path, ...classifyHtml(html, target) };
  } catch (error) {
    console.error("[edge-csp-monitor] browser probe failed", target.path, String(error?.message ?? error).slice(0, 150));
    return {
      path: target.path, status: "inconclusive",
      findings: ["browser-execution-failed"],
    };
  }
}

export async function runScheduled(env, now = new Date(), { sleep = defaultSleep } = {}) {
  if (!env.BROWSER || typeof env.BROWSER.quickAction !== "function") {
    throw new Error("BROWSER binding not configured");
  }
  if (!["shadow", "active"].includes(env.MONITOR_MODE)) {
    throw new Error("MONITOR_MODE must be shadow or active");
  }
  if (env.MONITOR_MODE === "active" && !env.EDGE_MONITOR_GITHUB_TOKEN) {
    throw new Error("EDGE_MONITOR_GITHUB_TOKEN secret required: fail closed");
  }
  const timestamp = now.toISOString();
  const results = [];
  for (let i = 0; i < TARGETS.length; i++) {
    // Minimum spacing between account-wide Quick Actions; each probe has
    // completed before the next delay, so request starts are >11 s apart.
    if (i > 0) await sleep(QUICK_ACTION_SPACING_MS);
    const result = await probe(env, TARGETS[i], String(now.getTime()) + "-" + i, sleep);
    results.push(result);
    console.log("[edge-csp-monitor] probe", JSON.stringify(result));
  }
  const status = classifyBatch(results);
  console.log("[edge-csp-monitor]", JSON.stringify({ timestamp, status, results }));
  if (env.MONITOR_MODE === "shadow") {
    return { timestamp, status, notified: false, results };
  }
  const comments = await githubRequest(env, GITHUB_COMMENTS_API + "?per_page=100");
  const previous = parseLatestMonitorComment(comments);
  if (shouldComment(status, previous, timestamp.slice(0, 10))) {
    await githubRequest(env, GITHUB_COMMENTS_API, {
      method: "POST",
      body: JSON.stringify({ body: makeComment({ status, results, timestamp }) }),
    });
    return { timestamp, status, notified: true, results };
  }
  return { timestamp, status, notified: false, results };
}

export default {
  async scheduled(_event, env) {
    // Cron Trigger allows up to 15 minutes of wall time. Returning the
    // promise keeps the invocation alive through all paced browser probes.
    // ctx.waitUntil() after returning was cancelled before the last probe
    // because its 30-second grace period is not a cron execution budget.
    await runScheduled(env);
  },
  async fetch() {
    return new Response("Not found", { status: 404 });
  },
};
