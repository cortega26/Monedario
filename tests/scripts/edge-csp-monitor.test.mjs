import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TARGETS, classifyHtml, classifyBatch, extractHtml, makeComment,
  parseLatestMonitorComment, shouldComment,
} from "../../workers/edge-csp-monitor/src/check.mjs";
import { runScheduled } from "../../workers/edge-csp-monitor/src/index.mjs";

const good = '<!DOCTYPE html><html><head><script src="/_astro/client.js"></script><script src="https://static.cloudflareinsights.com/beacon.min.js"></script></head><body><main id="main-content"><input id="utm-input"/></main></body></html>';
const utm = TARGETS.find(target => target.path.includes("utm"));

test("accepts Astro HTML with the legitimate Cloudflare analytics beacon", () => {
  assert.deepEqual(classifyHtml(good, utm), { status: "ok", findings: [] });
});

test("detects injected JSD bootstrap and challenge path", () => {
  const html = good.replace("</head>", '<script>window.__CF$cv$params={}</script><script src="/cdn-cgi/challenge-platform/scripts/jsd/main.js"></script></head>');
  assert.deepEqual(classifyHtml(html, utm), {
    status: "drift",
    findings: ["cloudflare-jsd-bootstrap", "cloudflare-challenge-platform"],
  });
});

test("detects Precursor-related dynamic script paths", () => {
  const html = good.replace("</head>", '<script src="/cdn-cgi/precursor/monitor.js"></script></head>');
  assert.equal(classifyHtml(html, utm).status, "drift");
});

test("treats challenge pages and missing markup as inconclusive", () => {
  assert.equal(classifyHtml("<html>Challenge</html>", utm).status, "inconclusive");
  assert.equal(classifyHtml("<p>Bad gateway</p>", utm).status, "inconclusive");
  assert.equal(extractHtml(JSON.stringify({ result: good }), "application/json"), good);
});

test("drift wins over transport failure; failures are never healthy", () => {
  assert.equal(classifyBatch([{ status: "ok" }, { status: "inconclusive" }]), "inconclusive");
  assert.equal(classifyBatch([{ status: "inconclusive" }, { status: "drift" }]), "drift");
});

test("deduplicates alerts, reminds daily, and reports recovery once", () => {
  const day = "2026-10-15";
  assert.equal(shouldComment("ok", null, day), false);
  assert.equal(shouldComment("drift", null, day), true);
  assert.equal(shouldComment("drift", { status: "drift", date: day }, day), false);
  assert.equal(shouldComment("drift", { status: "drift", date: "2026-10-14" }, day), true);
  assert.equal(shouldComment("ok", { status: "drift", date: day }, day), true);
  const body = makeComment({
    status: "drift", results: [{ path: utm.path, status: "drift", findings: ["cloudflare-jsd-bootstrap"] }],
    timestamp: "2026-10-15T19:00:00.000Z",
  });
  assert.deepEqual(parseLatestMonitorComment([{ body: "hello" }, { body }]), { status: "drift", date: day });
});

test("shadow mode checks all pages without posting to GitHub", async () => {
  let calls = 0;
  const env = {
    MONITOR_MODE: "shadow",
    BROWSER: { async quickAction() { calls++; return new Response(good); } },
  };
  const result = await runScheduled(env, new Date("2026-10-15T19:00:00Z"));
  assert.equal(result.status, "ok");
  assert.equal(result.notified, false);
  assert.equal(calls, TARGETS.length);
});

test("refuses to run without notification token", async () => {
  const env = { MONITOR_MODE: "active", BROWSER: { async quickAction() { throw Error("unexpected"); } } };
  await assert.rejects(runScheduled(env), /secret required/);
});

test("active mode comments only on existing incident and never leaks token", async () => {
  const savedFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, opts = {}) => {
    calls.push({ url: String(url), method: opts.method || "GET", body: opts.body || "" });
    return new Response(JSON.stringify(opts.method === "POST" ? { id: 123 } : []));
  };
  try {
    const bad = good.replace("</head>", '<script>window.__CF$cv$params={}</script></head>');
    const env = {
      MONITOR_MODE: "active", EDGE_MONITOR_GITHUB_TOKEN: "not-a-real-secret",
      BROWSER: { async quickAction() { return new Response(bad); } },
    };
    const result = await runScheduled(env, new Date("2026-10-15T19:00:00Z"));
    assert.equal(result.status, "drift");
    assert.equal(result.notified, true);
    assert.equal(calls.length, 2);
    assert.match(calls[0].url, /\/issues\/675\/comments/);
    assert.equal(calls[1].method, "POST");
    assert.ok(!calls[1].body.includes("not-a-real-secret"));
  } finally {
    globalThis.fetch = savedFetch;
  }
});

test("fails loudly if GitHub refuses to deliver an alert", async () => {
  const savedFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("Forbidden", { status: 403 });
  try {
    const env = {
      MONITOR_MODE: "active", EDGE_MONITOR_GITHUB_TOKEN: "test",
      BROWSER: { async quickAction() { return new Response(good); } },
    };
    await assert.rejects(runScheduled(env), /notification HTTP 403/);
  } finally {
    globalThis.fetch = savedFetch;
  }
});
