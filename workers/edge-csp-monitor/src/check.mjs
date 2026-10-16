export const TARGETS = Object.freeze([
  { path: "/", marker: /id=["']main-content["']/i },
  { path: "/calculadoras/conversor-utm/", marker: /id=["']utm-input["']/i },
  { path: "/calculadoras/sueldo-liquido/", marker: /id=["']main-content["']/i },
]);

// These signatures identify edge-added scripts, not Astro's inline hashes.
// Do not flag Cloudflare Web Analytics: its beacon is explicitly allowed.
const INJECTION_SIGNATURES = Object.freeze([
  { id: "cloudflare-jsd-bootstrap", pattern: /__CF\$cv\$params/i },
  { id: "cloudflare-challenge-platform", pattern: /\/cdn-cgi\/challenge-platform\//i },
  { id: "cloudflare-precursor-path", pattern: /\/cdn-cgi\/(?:precursor|session-verification)\//i },
  { id: "cloudflare-challenges-script", pattern: /<script\b[^>]*\bsrc=["'][^"']*challenges\.cloudflare\.com\//i },
]);

export function extractHtml(raw, contentType = "") {
  if (/json/i.test(contentType) || raw.trimStart().startsWith("{")) {
    try {
      const parsed = JSON.parse(raw);
      const candidates = [
        parsed.result, parsed.content, parsed.html,
        parsed.data?.result, parsed.data?.content,
      ];
      const html = candidates.find(value => typeof value === "string" && /<html\b/i.test(value));
      if (html) return html;
    } catch {
      // Malformed JSON is handled below as an inconclusive document.
    }
  }
  return raw;
}

export function classifyHtml(html, target) {
  if (typeof html !== "string" || !/<html\b/i.test(html) || !target.marker.test(html)) {
    return { status: "inconclusive", findings: ["missing-or-invalid-document"] };
  }
  const findings = INJECTION_SIGNATURES.filter(item => item.pattern.test(html)).map(item => item.id);
  return { status: findings.length ? "drift" : "ok", findings };
}

export function classifyBatch(results) {
  if (results.some(result => result.status === "drift")) return "drift";
  if (results.some(result => result.status !== "ok")) return "inconclusive";
  return "ok";
}

export function parseLatestMonitorComment(comments) {
  for (const comment of [...comments].reverse()) {
    const match = String(comment.body ?? "").match(/<!-- monedario-edge-csp-monitor:status=(ok|drift|inconclusive);date=(\d{4}-\d{2}-\d{2}) -->/);
    if (match) return { status: match[1], date: match[2] };
  }
  return null;
}

export function shouldComment(status, previous, date) {
  // A single successful baseline comment proves GitHub Issues write access
  // when the monitor is first activated, without manufacturing a drift event.
  // Later clean runs stay silent until a state change.
  if (!previous) return true;
  if (previous.status !== status) return true;
  return status !== "ok" && previous.date !== date;
}

export function makeComment({ status, results, timestamp }) {
  const date = timestamp.slice(0, 10);
  const headline = status === "ok" ? "CLEAN BASELINE / RECOVERY" : status === "drift" ? "DRIFT DETECTED" : "CHECK INCONCLUSIVE";
  const rows = results.map(result =>
    "- `" + result.path + "`: **" + result.status + "**" +
    (result.findings.length ? " — " + result.findings.join(", ") : "")
  );
  return [
    "<!-- monedario-edge-csp-monitor:status=" + status + ";date=" + date + " -->",
    "### Edge CSP guard — " + headline,
    "- Checked at: " + timestamp + " (UTC)",
    "- Method: Cloudflare Browser Run Chromium rendering; cache-busted URLs; independent of GitHub Actions.",
    ...rows, "",
    status === "drift"
      ? "**Action:** inspect Cloudflare Security → Settings → Precursor and Security → Bots → JavaScript Detections. Keep CSP strict and Brotli enabled."
      : status === "inconclusive"
        ? "**Action:** investigate challenge, browser service, or page availability; this is NOT proof that Precursor is enabled."
        : "No injection signatures detected in this baseline/recovery. Independently verify in a normal Chromium browser.",
    "",
    "Limit: Browser Run is identifiable as automation; this does not replace a normal-visitor Chromium smoke or authenticated zone settings audit.",
  ].join("\n");
}
