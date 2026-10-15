import {
  classifyHost,
  detectSoft404,
  getAllowedFamily,
  isBinaryContentType,
  isBlockingCategory,
  isAutomationBlockingHost,
} from "./host-registry.mjs";

/**
 * HTTP status codes that constitute a hard failure regardless of body content.
 */
const HARD_FAIL_STATUSES = new Set([404, 410, 500, 502, 503, 504]);

/**
 * HTTP status codes that indicate transient server issues; not blocking.
 */
const TRANSIENT_STATUSES = new Set([429, 503]);

/** Statuses used by verified anti-automation responses. */
const AUTOMATION_BLOCK_STATUSES = new Set([403, 410, 429]);

/**
 * @typedef {Object} ExternalResult
 * @property {string}       source_url            – original href from the HTML
 * @property {string}       final_url             – URL after all redirects
 * @property {string}       referrer_url          – first page that contained this link
 * @property {string}       anchor_text           – visible text of the original anchor
 * @property {'structured'|'inline'} link_type    – whether the link had explicit external markup
 * @property {string}       host_category         – from host-registry classifyHost()
 * @property {'hard_fail'|'soft_404'|'redirect_mismatch'|'host_mismatch'|'non_blocking_host_issue'|'network_error'|'ok'} classification
 * @property {boolean}      blocking              – whether this failure exits the CI gate
 * @property {string|null}  matched_signal        – phrase/pattern that triggered the failure
 * @property {string[]|null} expected_host_family – allowed final hostnames for this source
 * @property {number|null}  status                – final HTTP status
 * @property {string|null}  error                 – error code, or null
 */

/**
 * Classifies a single external link probe result into a structured result record.
 *
 * Blocking rules (phase 1 – per-result):
 *   hard_fail   on official_source / trusted_reference → blocking
 *   soft_404    on official_source / trusted_reference → blocking
 *   host_mismatch (structured link + official/trusted)  → blocking
 *   All other failures → non-blocking (telemetry / warning)
 *
 * The CI JOB uses continue-on-error:true during the initial rollout phase,
 * so even blocking=true results will not fail the workflow until the job is
 * promoted to hard-fail mode.
 *
 * @param {{ href: string, referrers: string[], linkType: 'structured'|'inline', anchorText: string }} link
 * @param {import('./probe-external.mjs').ProbeResult} probe
 * @returns {ExternalResult}
 */
export function classifyExternalResult(link, probe) {
  const sourceHost = safeHostname(link.href);
  const finalHost = safeHostname(probe.finalUrl);
  const category = classifyHost(sourceHost);
  const blocking = isBlockingCategory(category);
  const referrer = link.referrers[0] ?? null;

  const base = {
    source_url: link.href,
    final_url: probe.finalUrl,
    referrer_url: referrer,
    anchor_text: link.anchorText,
    link_type: link.linkType,
    host_category: category,
    blocking: false,
    matched_signal: null,
    expected_host_family: null,
    status: probe.status,
    error: probe.error,
  };

  // ---- Network / DNS errors ----
  if (probe.error) {
    // Transient errors (timeout, dns) are non-blocking for stability
    return {
      ...base,
      classification: "network_error",
      blocking: false,
      matched_signal: probe.error,
    };
  }

  // ---- Non-blocking host categories (social/share/anti-bot) ----
  if (
    category === "brand_profile" ||
    category === "share_endpoint" ||
    category === "known_soft_nonblocking"
  ) {
    const hasIssue =
      probe.status === null || probe.status >= 400 || TRANSIENT_STATUSES.has(probe.status);
    if (hasIssue) {
      return {
        ...base,
        classification: "non_blocking_host_issue",
        blocking: false,
        matched_signal: probe.status !== null ? `HTTP_${probe.status}` : "no_response",
      };
    }
    return { ...base, classification: "ok", blocking: false };
  }

  // ---- Verified anti-automation responses ----
  // Keep the host classified as an official source and preserve 404/5xx
  // blocking semantics. Only statuses independently verified as automation
  // blocks are downgraded to telemetry.
  if (
    probe.status !== null &&
    AUTOMATION_BLOCK_STATUSES.has(probe.status) &&
    isAutomationBlockingHost(sourceHost)
  ) {
    return {
      ...base,
      classification: "non_blocking_host_issue",
      blocking: false,
      matched_signal: `automation_block_HTTP_${probe.status}`,
    };
  }

  // ---- Hard fail: 404 / 410 / 5xx ----
  if (probe.status !== null && HARD_FAIL_STATUSES.has(probe.status)) {
    return {
      ...base,
      classification: "hard_fail",
      blocking,
      matched_signal: `HTTP_${probe.status}`,
    };
  }

  // ---- Soft-404: 200/3xx but page content matches 404 pattern ----
  if (probe.status !== null && probe.status < 400 && !isBinaryContentType(probe.contentType)) {
    const soft = detectSoft404(
      { title: probe.title, h1: probe.h1, bodySnippet: probe.bodySnippet },
      { hostname: finalHost, contentType: probe.contentType }
    );
    if (soft.detected) {
      return {
        ...base,
        classification: "soft_404",
        blocking,
        matched_signal: soft.matchedPhrase,
      };
    }
  }

  // ---- Host / redirect mismatch ----
  if (finalHost && sourceHost !== finalHost) {
    const allowedFamily = getAllowedFamily(sourceHost);
    const expectedFamilyList = [...allowedFamily];

    if (!allowedFamily.has(finalHost)) {
      // Structured links on official/trusted hosts → hard host_mismatch (blocking)
      // Inline links or non-blocking hosts → redirect_mismatch (non-blocking)
      const isHighConfidence = blocking && link.linkType === "structured";
      return {
        ...base,
        classification: isHighConfidence ? "host_mismatch" : "redirect_mismatch",
        blocking: isHighConfidence,
        matched_signal: `redirected_to:${finalHost}`,
        expected_host_family: expectedFamilyList,
      };
    }
  }

  return { ...base, classification: "ok", blocking: false };
}

/**
 * Counts results by classification and constructs workflow summary text.
 *
 * @param {ExternalResult[]} results
 * @returns {string}
 */
export function buildExternalSummary(results) {
  const countByClass = {};
  const countByHost = {};
  let blockingCount = 0;

  for (const r of results) {
    if (r.classification === "ok") continue;
    countByClass[r.classification] = (countByClass[r.classification] ?? 0) + 1;
    const host = safeHostname(r.source_url) ?? "unknown";
    countByHost[host] = (countByHost[host] ?? 0) + 1;
    if (r.blocking) blockingCount += 1;
  }

  const lines = ["EXTERNAL URL CHECK SUMMARY"];
  lines.push(`blocking_failures: ${blockingCount}`);
  lines.push("");
  lines.push("by_classification:");
  for (const [cls, n] of Object.entries(countByClass).sort()) {
    lines.push(`  ${cls}: ${n}`);
  }
  lines.push("");
  lines.push("by_host:");
  for (const [host, n] of Object.entries(countByHost).sort()) {
    lines.push(`  ${host}: ${n}`);
  }

  // CI logs are available even when artifact downloads are not.
  // Include actionable samples without exposing query strings or fragments.
  const findings = results.filter(r => r.classification !== "ok");
  lines.push("");
  lines.push("findings_sample (up to 20; query strings and fragments removed):");
  for (const r of findings.slice(0, 20)) {
    lines.push(
      `  ${r.blocking ? "BLOCKING" : "notice"} ${r.classification} ` +
        `HTTP=${r.status ?? "-"} source=${displayAuditUrl(r.source_url)} ` +
        `final=${displayAuditUrl(r.final_url)} ` +
        `referrer=${displayAuditUrl(r.referrer_url)}`
    );
  }
  if (findings.length > 20) {
    lines.push(`  ... ${findings.length - 20} more findings in external-full.csv`);
  }
  return lines.join("\n");
}

// Strip URL queries, fragments and credentials before logging.
function displayAuditUrl(rawUrl) {
  if (!rawUrl) return "unknown";
  try {
    const url = new URL(rawUrl);
    return `${url.origin}${url.pathname}`;
  } catch {
    return "unknown";
  }
}

// ---- Helpers ----

function safeHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
