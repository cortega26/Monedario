import {
  TARGETS, classifyHtml, classifyBatch, extractHtml, makeComment,
  parseLatestMonitorComment, shouldComment,
} from "./check.mjs";

const GITHUB_COMMENTS_API = "https://api.github.com/repos/cortega26/Monedario/issues/675/comments";
const SITE_ORIGIN = "https://monedario.cl";
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
  if (!response.ok) throw new Error("GitHub issue notification HTTP " + response.status);
  return response.json();
}

async function probe(env, target, stamp) {
  const url = SITE_ORIGIN + target.path + "?edge-guard=" + encodeURIComponent(stamp);
  try {
    const response = await env.BROWSER.quickAction("content", {
      url,
      userAgent: UA,
      gotoOptions: { waitUntil: "domcontentloaded", timeout: 20000 },
      waitForTimeout: 1000, // Observe deferred Precursor/JSD injections.
      rejectResourceTypes: ["image", "font", "stylesheet"],
    });
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

export async function runScheduled(env, now = new Date()) {
  if (!env.BROWSER || typeof env.BROWSER.quickAction !== "function") {
    throw new Error("BROWSER binding not configured");
  }
  if (!env.EDGE_MONITOR_GITHUB_TOKEN) {
    throw new Error("EDGE_MONITOR_GITHUB_TOKEN secret required: fail closed");
  }
  if (!["shadow", "active"].includes(env.MONITOR_MODE)) {
    throw new Error("MONITOR_MODE must be shadow or active");
  }
  const timestamp = now.toISOString();
  const results = [];
  for (let i = 0; i < TARGETS.length; i++) {
    results.push(await probe(env, TARGETS[i], String(now.getTime()) + "-" + i));
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
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runScheduled(env));
  },
  async fetch() {
    return new Response("Not found", { status: 404 });
  },
};
