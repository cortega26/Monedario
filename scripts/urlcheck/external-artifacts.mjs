import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { URLCHECK_ARTIFACT_DIR } from "./constants.mjs";

const EXTERNAL_HARD_FAIL_JSON = "external-hard-fail.json";
const EXTERNAL_SOFT_404_JSON = "external-soft-404.json";
const EXTERNAL_HOST_MISMATCH_JSON = "external-host-mismatch.json";
const EXTERNAL_NON_BLOCKING_JSON = "external-non-blocking.json";
const EXTERNAL_SUMMARY_JSON = "external-summary.json";
const EXTERNAL_FULL_CSV = "external-full.csv";

/**
 * Writes all external-link audit artifacts to URLCHECK_ARTIFACT_DIR.
 *
 * @param {import('./classify-external.mjs').ExternalResult[]} results
 * @param {{ mode: string }} opts
 * @returns {Promise<Record<string, string>>} map of artifact name → file path
 */
export async function writeExternalArtifacts(results, { mode }) {
  await mkdir(URLCHECK_ARTIFACT_DIR, { recursive: true });

  const hardFail = results.filter((r) => r.classification === "hard_fail");
  const soft404 = results.filter((r) => r.classification === "soft_404");
  const hostMismatch = results.filter(
    (r) => r.classification === "host_mismatch" || r.classification === "redirect_mismatch"
  );
  const nonBlocking = results.filter(
    (r) => r.classification === "non_blocking_host_issue" || r.classification === "network_error"
  );

  const summary = buildSummaryPayload(results, mode);

  const paths = {
    hardFailJson: path.join(URLCHECK_ARTIFACT_DIR, EXTERNAL_HARD_FAIL_JSON),
    soft404Json: path.join(URLCHECK_ARTIFACT_DIR, EXTERNAL_SOFT_404_JSON),
    hostMismatchJson: path.join(URLCHECK_ARTIFACT_DIR, EXTERNAL_HOST_MISMATCH_JSON),
    nonBlockingJson: path.join(URLCHECK_ARTIFACT_DIR, EXTERNAL_NON_BLOCKING_JSON),
    summaryJson: path.join(URLCHECK_ARTIFACT_DIR, EXTERNAL_SUMMARY_JSON),
    fullCsv: path.join(URLCHECK_ARTIFACT_DIR, EXTERNAL_FULL_CSV),
  };

  const rows = results.filter((r) => r.classification !== "ok");

  await Promise.all([
    writeFile(paths.hardFailJson, `${JSON.stringify(normaliseRows(hardFail), null, 2)}\n`, "utf8"),
    writeFile(paths.soft404Json, `${JSON.stringify(normaliseRows(soft404), null, 2)}\n`, "utf8"),
    writeFile(
      paths.hostMismatchJson,
      `${JSON.stringify(normaliseRows(hostMismatch), null, 2)}\n`,
      "utf8"
    ),
    writeFile(
      paths.nonBlockingJson,
      `${JSON.stringify(normaliseRows(nonBlocking), null, 2)}\n`,
      "utf8"
    ),
    writeFile(paths.summaryJson, `${JSON.stringify(summary, null, 2)}\n`, "utf8"),
    writeFile(paths.fullCsv, toCsv(rows), "utf8"),
  ]);

  await assertArtifactIntegrity(Object.values(paths));
  return paths;
}

// ---- Helpers ----

/**
 * Normalise a result row to the stable artifact schema.
 * Only the fields listed in the contract are emitted.
 */
function normaliseRow(r) {
  return {
    source_url: r.source_url,
    final_url: r.final_url,
    referrer_url: r.referrer_url ?? null,
    anchor_text: r.anchor_text ?? null,
    link_type: r.link_type,
    host_category: r.host_category,
    classification: r.classification,
    blocking: r.blocking,
    matched_signal: r.matched_signal ?? null,
    expected_host_family: r.expected_host_family ?? null,
    status: r.status ?? null,
    error: r.error ?? null,
  };
}

function normaliseRows(rows) {
  return rows.map(normaliseRow);
}

function buildSummaryPayload(results, mode) {
  const nonOk = results.filter((r) => r.classification !== "ok");
  const blockingCount = nonOk.filter((r) => r.blocking).length;

  const byClassification = {};
  const byHost = {};

  for (const r of nonOk) {
    const cls = r.classification;
    byClassification[cls] = (byClassification[cls] ?? 0) + 1;

    let host;
    try {
      host = new URL(r.source_url).hostname;
    } catch {
      host = "unknown";
    }
    if (!byHost[host]) byHost[host] = { total: 0 };
    byHost[host].total += 1;
    byHost[host][cls] = (byHost[host][cls] ?? 0) + 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    mode,
    scannedExternalLinks: results.length,
    blockingFailures: blockingCount,
    totalNonOk: nonOk.length,
    byClassification,
    byHost,
  };
}

const CSV_HEADERS = [
  "source_url",
  "final_url",
  "referrer_url",
  "link_type",
  "host_category",
  "classification",
  "blocking",
  "matched_signal",
  "status",
  "error",
];

function toCsv(rows) {
  const lines = [CSV_HEADERS.join(",")];
  for (const r of rows) {
    const norm = normaliseRow(r);
    lines.push(CSV_HEADERS.map((h) => csvEscape(norm[h])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function csvEscape(value) {
  const s = value == null ? "" : String(value);
  if (s.includes(",") || s.includes("\n") || s.includes('"')) {
    return `"${s.replaceAll('"', '""')}"`;
  }
  return s;
}

async function assertArtifactIntegrity(filePaths) {
  const missing = [];

  for (const filePath of filePaths) {
    try {
      await access(filePath);
    } catch (error) {
      const detail =
        error instanceof Error && "code" in error && typeof error.code === "string"
          ? error.code
          : error instanceof Error
            ? error.message
            : "unknown_error";
      missing.push(`${filePath} (${detail})`);
    }
  }

  if (missing.length > 0) {
    throw new Error(`external_artifact_generation_failed:${missing.join(", ")}`);
  }
}
