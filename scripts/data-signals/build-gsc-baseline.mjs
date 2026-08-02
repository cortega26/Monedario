#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const REQUIRED = [
  "28d-page.json",
  "28d-query.json",
  "28d-country.json",
  "28d-device.json",
  "previous-28d-page.json",
  "previous-28d-query.json",
  "3m-page.json",
  "3m-query.json",
  "sitemaps.json",
];
const OPTIONAL = ["28d-searchAppearance.json"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function normalizePage(value) {
  try {
    const url = new URL(value, "https://monedario.cl");
    return url.pathname === "/"
      ? "/"
      : `${url.pathname.replace(/\/+$/, "")}/`;
  } catch {
    return null;
  }
}

export function classifyPage(value) {
  const page = normalizePage(value) ?? "";
  if (page === "/") return "home";
  if (page.startsWith("/calculadoras/")) return "calculator";
  if (page.startsWith("/posts/")) return "article";
  if (page.startsWith("/guias/")) return "guide";
  if (page.startsWith("/glosario/")) return "glossary";
  if (page.startsWith("/leyes/")) return "law";
  return "other";
}

function aggregate(rows) {
  const clicks = rows.reduce((sum, row) => sum + Number(row.clicks ?? 0), 0);
  const impressions = rows.reduce(
    (sum, row) => sum + Number(row.impressions ?? 0),
    0
  );
  const weightedPosition = impressions
    ? rows.reduce(
        (sum, row) =>
          sum + Number(row.position ?? 0) * Number(row.impressions ?? 0),
        0
      ) / impressions
    : 0;
  return {
    clicks,
    impressions,
    ctr: impressions ? clicks / impressions : 0,
    position: weightedPosition,
  };
}

function ratio(numerator, denominator) {
  return denominator > 0 ? numerator / denominator : 0;
}

function trend(current, previous) {
  if (previous === 0) return current === 0 ? 0 : null;
  return (current - previous) / previous;
}

function rowIdentity(filename, row) {
  if (filename.endsWith("-page.json")) {
    return typeof row.page === "string" ? row.page.trim().toLowerCase() : null;
  }
  const dimension = filename
    .replace(/^(?:28d|previous-28d|3m)-/, "")
    .replace(/\.json$/, "");
  const value = row[dimension];
  return typeof value === "string" ? value.trim().toLowerCase() : null;
}

function validateDocument(filename, document) {
  const errors = [];
  const rows = Array.isArray(document?.data) ? document.data : null;
  if (!rows) {
    return {
      filename,
      valid: false,
      rows: 0,
      duplicates: 0,
      totals: aggregate([]),
      errors: ["data is not an array"],
    };
  }
  if (rows.length === 0) errors.push("empty required export");

  if (filename !== "sitemaps.json") {
    if (document.source !== "google-search-console") {
      errors.push("source must be google-search-console");
    }
    if (
      !DATE.test(document.window?.from ?? "") ||
      !DATE.test(document.window?.to ?? "") ||
      document.window.from > document.window.to
    ) {
      errors.push("window must contain ordered YYYY-MM-DD dates");
    }
  }

  const seen = new Set();
  const normalizedPages = new Set();
  let duplicates = 0;
  let normalizedCollisions = 0;
  for (const [index, row] of rows.entries()) {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      errors.push(`data[${index}] must be an object`);
      continue;
    }
    const identity =
      filename === "sitemaps.json"
        ? String(row.path ?? row.sitemap?.path ?? "").trim()
        : rowIdentity(filename, row);
    if (!identity) errors.push(`data[${index}] has no valid dimension value`);
    else if (seen.has(identity)) duplicates += 1;
    else seen.add(identity);

    if (filename.endsWith("-page.json") && identity) {
      const normalized = normalizePage(row.page);
      if (!normalized) errors.push(`data[${index}].page is not a valid URL`);
      else if (normalizedPages.has(normalized)) normalizedCollisions += 1;
      else normalizedPages.add(normalized);
    }

    if (filename === "sitemaps.json") continue;
    for (const key of ["clicks", "impressions", "ctr", "position"]) {
      const value = row[key];
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        errors.push(`data[${index}].${key} must be a non-negative number`);
      }
    }
  }
  if (duplicates > 0) errors.push(`${duplicates} duplicate dimension rows`);

  return {
    filename,
    valid: errors.length === 0,
    rows: rows.length,
    duplicates,
    normalizedCollisions,
    window: document.window ?? null,
    totals: filename === "sitemaps.json" ? null : aggregate(rows),
    errors,
  };
}

function normalizePageRows(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const page = normalizePage(row.page);
    if (!page) continue;
    const current = grouped.get(page) ?? {
      page: `https://monedario.cl${page}`,
      clicks: 0,
      impressions: 0,
      positionWeight: 0,
    };
    current.clicks += Number(row.clicks ?? 0);
    current.impressions += Number(row.impressions ?? 0);
    current.positionWeight +=
      Number(row.position ?? 0) * Number(row.impressions ?? 0);
    grouped.set(page, current);
  }
  return [...grouped.values()].map(row => ({
    page: row.page,
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: ratio(row.clicks, row.impressions),
    position: row.impressions ? row.positionWeight / row.impressions : 0,
  }));
}

function comparePages(currentRows, previousRows) {
  const previous = new Map(
    previousRows.map(row => [normalizePage(row.page), Number(row.clicks ?? 0)])
  );
  const changes = currentRows.map(row => {
    const page = normalizePage(row.page);
    const currentClicks = Number(row.clicks ?? 0);
    const previousClicks = previous.get(page) ?? 0;
    previous.delete(page);
    return {
      page,
      currentClicks,
      previousClicks,
      deltaClicks: currentClicks - previousClicks,
    };
  });
  for (const [page, previousClicks] of previous) {
    changes.push({
      page,
      currentClicks: 0,
      previousClicks,
      deltaClicks: -previousClicks,
    });
  }
  return {
    winners: [...changes]
      .filter(row => row.deltaClicks > 0)
      .sort((a, b) => b.deltaClicks - a.deltaClicks)
      .slice(0, 10),
    losers: [...changes]
      .filter(row => row.deltaClicks < 0)
      .sort((a, b) => a.deltaClicks - b.deltaClicks)
      .slice(0, 10),
  };
}

export function buildMetrics(documents) {
  const pages = normalizePageRows(documents["28d-page.json"].data);
  const queries = [...documents["28d-query.json"].data];
  const previousPages = normalizePageRows(
    documents["previous-28d-page.json"].data
  );
  const threeMonthPages = normalizePageRows(documents["3m-page.json"].data);
  const byType = {};
  for (const row of pages) {
    const type = classifyPage(row.page);
    byType[type] ??= [];
    byType[type].push(row);
  }
  const queryTotal = aggregate(queries);
  const pageTotal = aggregate(pages);
  const previousTotal = aggregate(previousPages);
  const brand = aggregate(
    queries.filter(row => /\bmonedario(?:\.cl)?\b/i.test(row.query))
  );
  const utm = aggregate(queries.filter(row => /\butm\b/i.test(row.query)));
  const positions = Object.fromEntries(
    [1, 3, 5, 10].map(limit => [
      `top${limit}`,
      ratio(
        aggregate(queries.filter(row => Number(row.position) <= limit))
          .impressions,
        queryTotal.impressions
      ),
    ])
  );
  const pageTypes = Object.fromEntries(
    Object.entries(byType).map(([type, rows]) => [type, aggregate(rows)])
  );
  const pageMovers = comparePages(pages, previousPages);

  return {
    acquisition: {
      current28d: pageTotal,
      previous28d: previousTotal,
      trailing3m: aggregate(threeMonthPages),
      trend: {
        clicks: trend(pageTotal.clicks, previousTotal.clicks),
        impressions: trend(pageTotal.impressions, previousTotal.impressions),
      },
      queryReported: queryTotal,
      hiddenQueryClicks: Math.max(0, pageTotal.clicks - queryTotal.clicks),
      brand,
      nonBrand: {
        clicks: Math.max(0, queryTotal.clicks - brand.clicks),
        impressions: Math.max(
          0,
          queryTotal.impressions - brand.impressions
        ),
      },
      utm,
      utmShare: ratio(utm.clicks, pageTotal.clicks),
      nonUtmShare: ratio(
        Math.max(0, pageTotal.clicks - utm.clicks),
        pageTotal.clicks
      ),
      topPageShare: ratio(
        Math.max(...pages.map(row => Number(row.clicks ?? 0)), 0),
        pageTotal.clicks
      ),
      top3PageShare: ratio(
        pages
          .map(row => Number(row.clicks ?? 0))
          .sort((a, b) => b - a)
          .slice(0, 3)
          .reduce((sum, value) => sum + value, 0),
        pageTotal.clicks
      ),
      positions,
    },
    pageTypes,
    pageTypeShares: Object.fromEntries(
      Object.entries(pageTypes).map(([type, value]) => [
        type,
        ratio(value.clicks, pageTotal.clicks),
      ])
    ),
    pages: pages.sort((a, b) => b.clicks - a.clicks),
    queries: queries.sort((a, b) => b.clicks - a.clicks),
    opportunities: {
      ...pageMovers,
      highImpressionLowCtr: queries
        .filter(row => row.impressions >= 100 && row.ctr < 0.01)
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 20),
      usefulPositionLowVolume: queries
        .filter(row => row.position <= 10 && row.clicks <= 2)
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 20),
    },
    segments: {
      countries: documents["28d-country.json"].data,
      devices: documents["28d-device.json"].data,
      searchAppearance:
        documents["28d-searchAppearance.json"]?.data ?? [],
    },
  };
}

function parseArgs(argv) {
  const input = argv.find(arg => arg.startsWith("--input="))?.slice(8);
  if (!input) throw new Error("--input=<baseline-directory> is required");
  const unknown = argv.filter(
    arg => arg !== "--json" && !arg.startsWith("--input=")
  );
  if (unknown.length > 0) throw new Error(`unknown argument: ${unknown[0]}`);
  return { input: path.resolve(input), json: argv.includes("--json") };
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function runBaseline(input) {
  const documents = {};
  const fileValidation = [];
  const warnings = [];
  for (const filename of REQUIRED) {
    const file = path.join(input, filename);
    if (!existsSync(file)) {
      fileValidation.push({
        filename,
        valid: false,
        rows: 0,
        duplicates: 0,
        errors: ["missing file"],
      });
      continue;
    }
    try {
      documents[filename] = JSON.parse(readFileSync(file, "utf8"));
      fileValidation.push(
        validateDocument(filename, documents[filename])
      );
    } catch (error) {
      fileValidation.push({
        filename,
        valid: false,
        rows: 0,
        duplicates: 0,
        errors: [
          `invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
        ],
      });
    }
  }
  for (const filename of OPTIONAL) {
    const file = path.join(input, filename);
    if (!existsSync(file)) {
      warnings.push("searchAppearance dimension unavailable");
      continue;
    }
    try {
      const document = JSON.parse(readFileSync(file, "utf8"));
      const validation = validateDocument(filename, document);
      if (validation.valid) documents[filename] = document;
      else
        warnings.push(
          `${filename} ignored: ${validation.errors.join("; ")}`
        );
      fileValidation.push({ ...validation, required: false });
    } catch (error) {
      warnings.push(
        `${filename} ignored: invalid JSON (${error instanceof Error ? error.message : String(error)})`
      );
    }
  }

  const requiredValidation = fileValidation.filter(item =>
    REQUIRED.includes(item.filename)
  );
  const validRequired = requiredValidation.filter(item => item.valid).length;
  const integrity = Math.round((validRequired / REQUIRED.length) * 100);
  const errors = requiredValidation.flatMap(item =>
    item.errors.map(error => `${item.filename}: ${error}`)
  );
  for (const item of requiredValidation) {
    if (item.normalizedCollisions > 0) {
      warnings.push(
        `${item.filename}: ${item.normalizedCollisions} trailing-slash URL variants were normalized and aggregated`
      );
    }
  }
  const status = integrity >= 95 ? "GREEN" : "HALT";
  const generatedAt = new Date().toISOString();
  const validation = {
    schemaVersion: 1,
    generatedAt,
    status,
    integrityPercent: integrity,
    thresholdPercent: 95,
    files: fileValidation,
    errors,
    warnings,
  };
  mkdirSync(input, { recursive: true });
  writeJson(path.join(input, "validation.json"), validation);
  if (status === "HALT") {
    throw new Error(`integrity ${integrity}% < 95%: ${errors.join("; ")}`);
  }

  const metrics = buildMetrics(documents);
  const discrepancies = {
    pageVsQueryClicks:
      metrics.acquisition.current28d.clicks -
      metrics.acquisition.queryReported.clicks,
    pageVsQueryImpressions:
      metrics.acquisition.current28d.impressions -
      metrics.acquisition.queryReported.impressions,
    explanation:
      "GSC may suppress query rows for privacy; page totals are the acquisition denominator.",
  };
  const manifest = {
    schemaVersion: 1,
    generatedAt,
    input,
    requiredFiles: REQUIRED,
    optionalFiles: OPTIONAL,
    provenance:
      "Google Search Console API; final data with a three-day lag",
  };
  const indexation = {
    sitemaps: documents["sitemaps.json"].data,
    warning:
      "GSC sitemap counts are not a URL Inspection export and must not be interpreted as per-URL index status.",
  };
  const actions = [
    "Review the UTM query/page segment against calculator completion before changing acquisition surfaces.",
    "Investigate only the largest non-brand opportunity whose evidence is stable across 28d and 3m.",
  ];
  const scorecard = {
    status,
    integrityPercent: integrity,
    acquisition: metrics.acquisition,
    opportunities: metrics.opportunities,
    discrepancies,
    actions,
    warnings,
  };
  for (const [filename, value] of [
    ["manifest.json", manifest],
    ["page-metrics.json", metrics.pages],
    ["query-metrics.json", metrics.queries],
    ["page-type-metrics.json", metrics.pageTypes],
    ["segment-metrics.json", metrics.segments],
    ["indexation.json", indexation],
    ["scorecard.json", scorecard],
  ]) {
    writeJson(path.join(input, filename), value);
  }
  writeFileSync(
    path.join(input, "scorecard.md"),
    `# GSC baseline\n\n**Status:** ${status}  \n**Integrity:** ${integrity}%\n\n- 28d clicks: ${metrics.acquisition.current28d.clicks}\n- 28d impressions: ${metrics.acquisition.current28d.impressions}\n- Query-hidden clicks: ${metrics.acquisition.hiddenQueryClicks}\n- UTM query clicks: ${metrics.acquisition.utm.clicks}\n- Brand query clicks: ${metrics.acquisition.brand.clicks}\n- UTM click share: ${(metrics.acquisition.utmShare * 100).toFixed(2)}%\n- Non-UTM click share: ${(metrics.acquisition.nonUtmShare * 100).toFixed(2)}%\n\n## Actions\n\n${actions.map(action => `- ${action}`).join("\n")}\n`
  );
  return { validation, scorecard, output: input };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = runBaseline(options.input);
  if (options.json) {
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } else {
    console.error(
      `[gsc-baseline] ${result.validation.status} integrity=${result.validation.integrityPercent}% clicks=${result.scorecard.acquisition.current28d.clicks}`
    );
  }
}

if (
  process.argv[1] &&
  import.meta.url === new URL(`file://${path.resolve(process.argv[1])}`).href
) {
  try {
    main();
  } catch (error) {
    console.error(
      `[gsc-baseline] HALT: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}
