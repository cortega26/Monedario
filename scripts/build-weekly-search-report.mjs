import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { dateToIsoWeek, weekLabelToDateRange, isoWeekWindow } from "./lib/iso-week.mjs";

const DEFAULT_WATCHLIST_PATH = path.resolve(
  "docs/operations/runbooks/weekly-search-performance-watchlist.json"
);
const DEFAULT_GSC_JSON_DIR = "output/operations/data-signals/gsc";
const DEFAULT_CF_JSON_DIR = "output/operations/data-signals/cloudflare";
const DEFAULT_ANALYTICS_JSON_DIR = "output/operations/data-signals/analytics";
const ANALYTICS_EVENT_NAMES = new Set([
  "calculator_view",
  "calculator_start",
  "calculator_complete",
  "calculator_error",
  "next_best_step_shown",
  "next_best_step_click",
  "result_action_click",
  "share_result_click",
  "scenario_action",
  "resume_click",
  "support_page_click",
  "official_source_click",
  "next_step_shown",
  "next_step_click",
  "source_click",
  "share_attempt",
  "share_success",
  "alert_interest_shown",
  "alert_interest_submit",
  "support_shown",
  "support_click",
  "support_confirmed",
  "article_calculator_cta_click",
]);

function parseArgs(argv) {
  const options = {
    inputDir: null,
    outputFile: null,
    jsonFile: null,
    watchlistFile: DEFAULT_WATCHLIST_PATH,
    gscJsonDir: DEFAULT_GSC_JSON_DIR,
    cloudflareJsonDir: DEFAULT_CF_JSON_DIR,
    analyticsJsonDir: DEFAULT_ANALYTICS_JSON_DIR,
    init: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") {
      options.inputDir = argv[++index] ?? null;
      continue;
    }
    if (arg === "--out") {
      options.outputFile = argv[++index] ?? null;
      continue;
    }
    if (arg === "--json-out") {
      options.jsonFile = argv[++index] ?? null;
      continue;
    }
    if (arg === "--watchlist") {
      options.watchlistFile = argv[++index] ?? DEFAULT_WATCHLIST_PATH;
      continue;
    }
    if (arg === "--gsc-json-dir") {
      options.gscJsonDir = argv[++index] ?? DEFAULT_GSC_JSON_DIR;
      continue;
    }
    if (arg === "--cloudflare-json-dir") {
      options.cloudflareJsonDir = argv[++index] ?? DEFAULT_CF_JSON_DIR;
      continue;
    }
    if (arg === "--analytics-json-dir") {
      options.analyticsJsonDir = argv[++index] ?? DEFAULT_ANALYTICS_JSON_DIR;
      continue;
    }
    if (arg === "--init") {
      options.init = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printUsage(0);
    }

    printUsage(1, `Unknown argument: ${arg}`);
  }

  if (!options.inputDir) {
    printUsage(1, "Missing required argument: --input <directory>");
  }

  if (!options.outputFile) {
    options.outputFile = path.join(
      options.inputDir,
      "weekly-search-scorecard.md"
    );
  }

  if (!options.jsonFile) {
    options.jsonFile = path.join(
      options.inputDir,
      "weekly-search-scorecard.json"
    );
  }

  return options;
}

function printUsage(code, errorMessage) {
  if (errorMessage) {
    console.error(`[weekly-search-report] ${errorMessage}`);
  }
  console.log(`Usage:
  node scripts/build-weekly-search-report.mjs --input <directory> [options]

Options:
  --out <file>                    Output markdown path (default: <input>/weekly-search-scorecard.md)
  --json-out <file>               Output JSON path (default: <input>/weekly-search-scorecard.json)
  --watchlist <file>              Watchlist JSON (default: docs/operations/runbooks/weekly-search-performance-watchlist.json)
  --gsc-json-dir <path>           Dir for GSC JSON signals (default: ${DEFAULT_GSC_JSON_DIR})
  --cloudflare-json-dir <path>    Dir for Cloudflare JSON signals (default: ${DEFAULT_CF_JSON_DIR})
  --init                          Initialize an empty input bundle

Input directory files:
  - gsc-pages.csv          (fallback if no JSON found)
  - gsc-queries.csv        (fallback if no JSON found)
  - analytics-events.csv   (optional)
  - indexation-summary.json
`);
  process.exit(code);
}

function ensureDirectory(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

function writeTemplateFile(filePath, content) {
  if (existsSync(filePath)) {
    return;
  }
  writeFileSync(filePath, content, "utf8");
}






function previousIsoWeekLabel(weekLabel) {
  const range = weekLabelToDateRange(weekLabel);
  if (!range) return null;
  const previousMonday = new Date(`${range.previousStart}T00:00:00Z`);
  return dateToIsoWeek(previousMonday);
}

function initInputDirectory(inputDir) {
  ensureDirectory(inputDir);

  const weekLabel = path.basename(inputDir);

  writeTemplateFile(
    path.join(inputDir, "README.md"),
    `# Weekly Search Reporting Input Bundle

Drop the weekly exports in this folder, then run:

\`\`\`bash
node scripts/build-weekly-search-report.mjs --input ${inputDir}
\`\`\`

Required files:

- \`gsc-pages.csv\`
  - Google Search Console > Search results > Pages
  - Date comparison: last 7 days vs previous 7 days
  - Export with clicks / impressions / CTR / average position deltas
- \`gsc-queries.csv\`
  - Google Search Console > Search results > Queries
  - Same date comparison as pages
- \`indexation-summary.json\`
  - Fill the template with the current Google/Bing sitemap and coverage notes

Optional file:

- \`analytics-events.csv\`
  - GA4 export filtered to the same weekly window
  - Expected columns: \`page_path,event_name,event_count,event_count_previous\`
- \`utility-led-ops.json\`
  - Weekly sustainability inputs: hours, cost, tokens, burnout, incidents,
    learning, reputation, maintenance and blockers.

Notes:

- Keep one folder per week, for example \`output/operations/weekly-search-performance/${weekLabel}/\`.
- The script supports English or Spanish GSC column headers.
- If analytics export is missing, the scorecard still renders, but CTA/tool signals stay blank.
`,
  );

  const dateRange = weekLabelToDateRange(weekLabel) ?? {
    currentStart: "YYYY-MM-DD",
    currentEnd: "YYYY-MM-DD",
    previousStart: "YYYY-MM-DD",
    previousEnd: "YYYY-MM-DD",
  };

  writeTemplateFile(
    path.join(inputDir, "indexation-summary.json"),
    JSON.stringify(
      {
        weekLabel,
        dateRange,
        google: {
          property: "sc-domain:monedario.cl",
          sitemapStatus: "processing",
          indexedPages: null,
          excludedPages: null,
          coverageNotes:
            "Replace this text with what Google Search Console actually shows this week.",
          alerts: [],
          manualActions: "none",
          enhancementIssues: [],
        },
        bing: {
          site: "https://monedario.cl/",
          sitemapStatus: "processing",
          urlsDiscovered: null,
          coverageNotes:
            "Replace this text with what Bing Webmaster actually shows this week.",
          alerts: [],
        },
        notes: [],
      },
      null,
      2
    ) + "\n",
  );

  writeTemplateFile(
    path.join(inputDir, "utility-led-ops.json"),
    JSON.stringify(
      {
        schemaVersion: 1,
        week: weekLabel,
        weeklyHours: null,
        weeklyCostClp: null,
        tokenUsage: null,
        burnoutLevel1To5: null,
        qualityIncidents: [],
        learningSignal: null,
        reputationSignal: null,
        maintenanceTasks: [],
        blockers: [],
        revenueClpOptional: null,
        note: "Ingresos cero no son fallo; la sostenibilidad es el gate de continuidad.",
      },
      null,
      2
    ) + "\n"
  );

  console.log(
    `[weekly-search-report] Initialized input bundle at ${path.resolve(inputDir)}`
  );
}

function stripBom(value) {
  return value.replace(/^\uFEFF/, "");
}

function parseCsv(text) {
  const source = stripBom(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const nextChar = source[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if (char === "\n" && !inQuotes) {
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  const nonEmptyRows = rows.filter(cells =>
    cells.some(cell => cell.trim().length > 0)
  );
  if (nonEmptyRows.length === 0) {
    return [];
  }

  const [headerRow, ...bodyRows] = nonEmptyRows;
  const headers = headerRow.map(cell => cell.trim());

  return bodyRows.map(cells => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = (cells[index] ?? "").trim();
    });
    return record;
  });
}

function normalizeHeader(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeRecord(record) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [normalizeHeader(key), value])
  );
}

function firstValue(record, aliases) {
  for (const alias of aliases) {
    const value = record[alias];
    if (value !== undefined && `${value}`.trim() !== "") {
      return `${value}`.trim();
    }
  }
  return "";
}

function parseLocaleNumber(value) {
  if (value === undefined || value === null) return null;
  let text = `${value}`.trim();
  if (!text || text === "-" || /^n\/a$/i.test(text)) return null;

  text = text
    .replace(/\s+/g, "")
    .replace(/\u00A0/g, "")
    .replace(/%$/, "")
    .replace(/^\+/, "");

  const lastComma = text.lastIndexOf(",");
  const lastDot = text.lastIndexOf(".");

  if (lastComma !== -1 && lastDot !== -1) {
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandSeparator = decimalSeparator === "," ? "." : ",";
    text = text.split(thousandSeparator).join("");
    if (decimalSeparator === ",") {
      text = text.replace(",", ".");
    }
  } else if (lastComma !== -1) {
    const decimalLike = text.length - lastComma - 1 <= 2;
    text = decimalLike ? text.replace(",", ".") : text.replace(/,/g, "");
  } else if (lastDot !== -1) {
    const decimalLike = text.length - lastDot - 1 <= 2;
    text = decimalLike ? text : text.replace(/\./g, "");
  }

  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizePathLabel(value) {
  const text = `${value ?? ""}`.trim();
  if (!text) return "";

  try {
    const url = new URL(text);
    return url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  } catch {
    if (text.startsWith("/")) {
      return text.endsWith("/") ? text : `${text}/`;
    }
    return text;
  }
}

function readSearchCsv(filePath, kind) {
  const content = readFileSync(filePath, "utf8");
  const rows = parseCsv(content).map(normalizeRecord);

  const labelAliases =
    kind === "pages"
      ? [
          "page",
          "pages",
          "top_pages",
          "paginas_principales",
          "pagina",
          "landing_page",
          "url",
        ]
      : ["query", "queries", "top_queries", "consultas_principales", "consulta"];

  return rows
    .map(record => {
      const label = firstValue(record, labelAliases);
      if (!label) return null;

      return {
        label,
        path: kind === "pages" ? normalizePathLabel(label) : null,
        clicks: parseLocaleNumber(firstValue(record, ["clicks", "clics"])) ?? 0,
        clicksDelta:
          parseLocaleNumber(
            firstValue(record, [
              "clicks_difference",
              "click_difference",
              "diferencia_de_clics",
              "delta_clicks",
            ])
          ) ?? 0,
        impressions:
          parseLocaleNumber(firstValue(record, ["impressions", "impresiones"])) ??
          0,
        impressionsDelta:
          parseLocaleNumber(
            firstValue(record, [
              "impressions_difference",
              "impression_difference",
              "diferencia_de_impresiones",
              "delta_impressions",
            ])
          ) ?? 0,
        ctr: parseLocaleNumber(firstValue(record, ["ctr"])) ?? 0,
        ctrDelta:
          parseLocaleNumber(
            firstValue(record, [
              "ctr_difference",
              "diferencia_de_ctr",
              "delta_ctr",
            ])
          ) ?? 0,
        position:
          parseLocaleNumber(
            firstValue(record, ["position", "average_position", "posicion"])
          ) ?? 0,
        positionDelta:
          parseLocaleNumber(
            firstValue(record, [
              "position_difference",
              "average_position_difference",
              "diferencia_de_posicion",
              "delta_position",
            ])
          ) ?? 0,
      };
    })
    .filter(Boolean);
}

function readAnalyticsCsv(filePath) {
  if (!existsSync(filePath)) {
    return {
      pageEvents: new Map(),
      totals: {
        cta_click: { current: 0, previous: 0 },
        calculator_start: { current: 0, previous: 0 },
        calculator_complete: { current: 0, previous: 0 },
        next_best_step_shown: { current: 0, previous: 0 },
        next_best_step_click: { current: 0, previous: 0 },
      },
      available: false,
    };
  }

  const rows = parseCsv(readFileSync(filePath, "utf8")).map(normalizeRecord);
  const pageEvents = new Map();
  const totals = {
    cta_click: { current: 0, previous: 0 },
    calculator_start: { current: 0, previous: 0 },
    calculator_complete: { current: 0, previous: 0 },
    next_best_step_shown: { current: 0, previous: 0 },
    next_best_step_click: { current: 0, previous: 0 },
  };

  for (const row of rows) {
    const pagePath = normalizePathLabel(
      firstValue(row, [
        "page_path",
        "page",
        "landing_page",
        "landing_page_query_string",
      ])
    );
    const eventName = firstValue(row, ["event_name", "event"]);
    if (!pagePath || !eventName) continue;

    const current =
      parseLocaleNumber(
        firstValue(row, [
          "event_count",
          "events",
          "event_total",
          "conteo_eventos",
        ])
      ) ?? 0;
    const previous =
      parseLocaleNumber(
        firstValue(row, [
          "event_count_previous",
          "previous_event_count",
          "event_count_prev",
          "conteo_eventos_previos",
        ])
      ) ?? 0;

    const perPage = pageEvents.get(pagePath) ?? {};
    perPage[eventName] = {
      current,
      previous,
    };
    pageEvents.set(pagePath, perPage);

    if (totals[eventName]) {
      totals[eventName].current += current;
      totals[eventName].previous += previous;
    }
  }

  return {
    pageEvents,
    totals,
    available: true,
  };
}

function extractWeekFromDir(inputDir) {
  const base = path.basename(inputDir);
  return /^\d{4}-W\d{2}$/.test(base) ? base : null;
}

function invalidArtifact(filePath, reason) {
  throw new Error(
    `[weekly-search-report] Invalid artifact ${path.resolve(filePath)}: ${reason}`
  );
}

function parseJsonArtifact(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return invalidArtifact(filePath, "invalid JSON");
  }
}

function validateSignalHeader(
  doc,
  filePath,
  { source, week, schemaVersions = [1] }
) {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
    invalidArtifact(filePath, "root must be an object");
  }
  if (!schemaVersions.includes(doc.schemaVersion)) {
    invalidArtifact(
      filePath,
      schemaVersions.length === 1
        ? `schemaVersion must be ${schemaVersions[0]}`
        : `schemaVersion must be one of ${schemaVersions.join(", ")}`
    );
  }
  if (doc.source !== source) {
    invalidArtifact(filePath, `source must be ${source}`);
  }
  if (doc.week !== week) {
    invalidArtifact(filePath, `week must be ${week}`);
  }
  const expectedWindow = isoWeekWindow(week);
  if (
    !expectedWindow ||
    doc.window?.from !== expectedWindow.from ||
    doc.window?.to !== expectedWindow.to
  ) {
    invalidArtifact(
      filePath,
      `window must be ${expectedWindow?.from ?? "n/d"} to ${expectedWindow?.to ?? "n/d"}`
    );
  }
}

function normalizeQueryIdentity(query) {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
}

function validateGscDocument(filePath, week, kind) {
  const doc = parseJsonArtifact(filePath);
  validateSignalHeader(doc, filePath, { source: "gsc", week });
  if (!Array.isArray(doc.data)) {
    invalidArtifact(filePath, "data must be an array");
  }

  const identityField = kind === "pages" ? "page" : "query";
  const seen = new Set();
  for (let index = 0; index < doc.data.length; index += 1) {
    const row = doc.data[index];
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      invalidArtifact(filePath, `data[${index}] must be an object`);
    }
    if (typeof row[identityField] !== "string" || !row[identityField].trim()) {
      invalidArtifact(filePath, `data[${index}].${identityField} must be a non-empty string`);
    }
    for (const metric of ["clicks", "impressions", "ctr", "position"]) {
      if (typeof row[metric] !== "number" || !Number.isFinite(row[metric]) || row[metric] < 0) {
        invalidArtifact(filePath, `data[${index}].${metric} must be a non-negative number`);
      }
    }
    if (row.ctr > 1) {
      invalidArtifact(filePath, `data[${index}].ctr must be between 0 and 1`);
    }
    const identity =
      kind === "pages"
        ? normalizePathLabel(row.page)
        : normalizeQueryIdentity(row.query);
    if (!identity) {
      invalidArtifact(filePath, `data[${index}].${identityField} has no usable identity`);
    }
    if (seen.has(identity)) {
      invalidArtifact(filePath, `data contains duplicate normalized ${identityField} identity`);
    }
    seen.add(identity);
  }
  return doc;
}

function loadGscWeek(gscJsonDir, week, required) {
  const pagesPath = path.join(gscJsonDir, `${week}-pages.json`);
  const queriesPath = path.join(gscJsonDir, `${week}-queries.json`);
  const hasPages = existsSync(pagesPath);
  const hasQueries = existsSync(queriesPath);

  if (!hasPages && !hasQueries) {
    if (required) {
      return null;
    }
    return { status: "missing", pagesPath, queriesPath };
  }
  if (!hasPages || !hasQueries) {
    invalidArtifact(
      hasPages ? queriesPath : pagesPath,
      `paired ${week} GSC pages and queries artifacts are required`
    );
  }

  return {
    status: "available",
    pages: validateGscDocument(pagesPath, week, "pages"),
    queries: validateGscDocument(queriesPath, week, "queries"),
  };
}

function buildComparedRows(currentData, previousData, kind) {
  const identityFor = item =>
    kind === "pages"
      ? normalizePathLabel(item.page)
      : normalizeQueryIdentity(item.query);
  const labelFor = item => (kind === "pages" ? item.page : item.query);
  const previousByIdentity = new Map(
    (previousData ?? []).map(item => [identityFor(item), item])
  );
  const currentIdentities = new Set(currentData.map(identityFor));
  const comparisonAvailable = previousData !== null;
  const combined = [
    ...currentData.map(item => ({ current: item, previous: previousByIdentity.get(identityFor(item)) ?? null })),
    ...(previousData ?? [])
      .filter(item => !currentIdentities.has(identityFor(item)))
      .map(item => ({ current: null, previous: item })),
  ];

  return combined.map(({ current, previous }) => {
    const identityStatus = !comparisonAvailable
      ? "unavailable"
      : current && previous
        ? "existing"
        : current
          ? "new"
          : "removed";
    const currentMetrics = current ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    const previousMetrics = previous ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    return {
      label: labelFor(current ?? previous),
      path: kind === "pages" ? identityFor(current ?? previous) : null,
      clicks: currentMetrics.clicks,
      clicksDelta: comparisonAvailable ? currentMetrics.clicks - previousMetrics.clicks : null,
      impressions: currentMetrics.impressions,
      impressionsDelta: comparisonAvailable
        ? currentMetrics.impressions - previousMetrics.impressions
        : null,
      ctr: currentMetrics.ctr * 100,
      ctrDelta: comparisonAvailable
        ? (currentMetrics.ctr - previousMetrics.ctr) * 100
        : null,
      position: current?.position ?? null,
      positionDelta: comparisonAvailable && identityStatus === "existing"
        ? currentMetrics.position - previousMetrics.position
        : null,
      comparisonStatus: comparisonAvailable ? "available" : "unavailable",
      identityStatus,
    };
  });
}

function readGscJson(gscJsonDir, week) {
  const current = loadGscWeek(gscJsonDir, week, true);
  if (!current) return null;

  const previousWeek = previousIsoWeekLabel(week);
  const previous = loadGscWeek(gscJsonDir, previousWeek, false);
  const comparisonAvailable = previous.status === "available";

  return {
    pageRows: buildComparedRows(
      current.pages.data,
      comparisonAvailable ? previous.pages.data : null,
      "pages"
    ),
    queryRows: buildComparedRows(
      current.queries.data,
      comparisonAvailable ? previous.queries.data : null,
      "queries"
    ),
    comparison: {
      status: comparisonAvailable ? "available" : "unavailable",
      currentWeek: week,
      previousWeek,
    },
  };
}

function readAnalyticsJson(analyticsJsonDir, week) {
  const analyticsPath = path.join(analyticsJsonDir, `${week}.json`);
  if (!existsSync(analyticsPath)) {
    return {
      status: "missing",
      path: path.resolve(analyticsPath),
      value: null,
    };
  }

  const doc = parseJsonArtifact(analyticsPath);
  validateSignalHeader(doc, analyticsPath, {
    source: "first-party-events",
    week,
    schemaVersions: [1, 2],
  });
  if (!Array.isArray(doc.data)) {
    invalidArtifact(analyticsPath, "data must be an array");
  }
  for (let index = 0; index < doc.data.length; index += 1) {
    const row = doc.data[index];
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      invalidArtifact(analyticsPath, `data[${index}] must be an object`);
    }
    if (!ANALYTICS_EVENT_NAMES.has(row.event_name)) {
      invalidArtifact(analyticsPath, `data[${index}].event_name is not allowlisted`);
    }
    const calculatorId = row.calculator_id ?? row.calculator_slug;
    if (typeof calculatorId !== "string" || !calculatorId) {
      invalidArtifact(analyticsPath, `data[${index}] requires calculator_id or legacy calculator_slug`);
    }
    if (typeof row.count !== "number" || !Number.isFinite(row.count) || row.count < 0) {
      invalidArtifact(analyticsPath, `data[${index}].count must be a non-negative number`);
    }
    if (
      typeof row.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(row.date) ||
      row.date < doc.window.from ||
      row.date > doc.window.to
    ) {
      invalidArtifact(analyticsPath, `data[${index}].date must be inside the artifact window`);
    }
  }

  // Aggregate per calculator_slug from the flat data rows.
  const data = doc.data ?? [];
  const bySlug = new Map();

  for (const row of data) {
    const slug = row.calculator_id ?? row.calculator_slug ?? "unknown";
    if (!bySlug.has(slug)) {
      bySlug.set(slug, {
        views: 0,
        starts: 0,
        completes: 0,
        errors: 0,
        nextStepShown: 0,
        nextStepClicks: 0,
        shares: 0,
        supportClicks: 0,
        resultActionClicks: 0,
        scenarioActions: 0,
        resumeClicks: 0,
        officialSourceClicks: 0,
        shareSuccess: 0,
        alertInterestShown: 0,
        alertInterestSubmits: 0,
        supportShown: 0,
        supportConfirmed: 0,
      });
    }
    const acc = bySlug.get(slug);

    switch (row.event_name) {
      case "calculator_view":
        acc.views += row.count;
        break;
      case "calculator_start":
        acc.starts += row.count;
        break;
      case "calculator_complete":
        acc.completes += row.count;
        break;
      case "calculator_error":
        acc.errors += row.count;
        break;
      case "next_best_step_shown":
      case "next_step_shown":
        acc.nextStepShown += row.count;
        break;
      case "next_best_step_click":
      case "next_step_click":
        acc.nextStepClicks += row.count;
        break;
      case "share_result_click":
      case "share_attempt":
        acc.shares += row.count;
        break;
      case "share_success":
        acc.shareSuccess += row.count;
        break;
      case "support_page_click":
      case "support_click":
        acc.supportClicks += row.count;
        break;
      case "support_shown":
        acc.supportShown += row.count;
        break;
      case "support_confirmed":
        acc.supportConfirmed += row.count;
        break;
      case "alert_interest_shown":
        acc.alertInterestShown += row.count;
        break;
      case "alert_interest_submit":
        acc.alertInterestSubmits += row.count;
        break;
      case "result_action_click":
        acc.resultActionClicks += row.count;
        break;
      case "scenario_action":
        acc.scenarioActions += row.count;
        break;
      case "resume_click":
        acc.resumeClicks += row.count;
        break;
      case "official_source_click":
      case "source_click":
        acc.officialSourceClicks += row.count;
        break;
      // Other allowlisted events are counted but not surfaced individually
    }
  }

  // Totals across all calculators.
  const totals = {
    views: 0, starts: 0, completes: 0, errors: 0,
    nextStepShown: 0, nextStepClicks: 0, shares: 0,
    supportClicks: 0, resultActionClicks: 0, scenarioActions: 0,
    resumeClicks: 0, officialSourceClicks: 0,
    shareSuccess: 0, alertInterestShown: 0, alertInterestSubmits: 0,
    supportShown: 0, supportConfirmed: 0,
  };
  for (const acc of bySlug.values()) {
    totals.views += acc.views;
    totals.starts += acc.starts;
    totals.completes += acc.completes;
    totals.errors += acc.errors;
    totals.nextStepShown += acc.nextStepShown;
    totals.nextStepClicks += acc.nextStepClicks;
    totals.shares += acc.shares;
    totals.supportClicks += acc.supportClicks;
    totals.resultActionClicks += acc.resultActionClicks;
    totals.scenarioActions += acc.scenarioActions;
    totals.resumeClicks += acc.resumeClicks;
    totals.officialSourceClicks += acc.officialSourceClicks;
    totals.shareSuccess += acc.shareSuccess;
    totals.alertInterestShown += acc.alertInterestShown;
    totals.alertInterestSubmits += acc.alertInterestSubmits;
    totals.supportShown += acc.supportShown;
    totals.supportConfirmed += acc.supportConfirmed;
  }

  // Convert Map to plain object for JSON serialization.
  const bySlugObj = Object.fromEntries(bySlug);

  return {
    status: "available",
    path: path.resolve(analyticsPath),
    value: {
      available: true,
      week: doc.week,
      window: doc.window,
      totals,
      bySlug: bySlugObj,
      data,
    },
  };
}

function readCloudflarePerf(cloudflareJsonDir, week) {
  const rumPath = path.join(cloudflareJsonDir, `${week}-rum.json`);
  const trafficPath = path.join(cloudflareJsonDir, `${week}-traffic.json`);

  const readCloudflareArtifact = (filePath, source, kind) => {
    if (!existsSync(filePath)) {
      return { status: "missing", path: path.resolve(filePath), value: null };
    }
    const doc = parseJsonArtifact(filePath);
    validateSignalHeader(doc, filePath, { source, week });
    if (!Array.isArray(doc.data)) {
      invalidArtifact(filePath, "data must be an array");
    }
    if (kind === "rum") {
      for (let index = 0; index < doc.data.length; index += 1) {
        const row = doc.data[index];
        if (!row || typeof row !== "object" || Array.isArray(row)) {
          invalidArtifact(filePath, `data[${index}] must be an object`);
        }
        if (typeof row.path !== "string" || !row.path.startsWith("/")) {
          invalidArtifact(filePath, `data[${index}].path must be a site-relative path`);
        }
        if (typeof row.count !== "number" || !Number.isFinite(row.count) || row.count < 0) {
          invalidArtifact(filePath, `data[${index}].count must be a non-negative number`);
        }
        for (const metric of ["lcpP75Ms", "clsP75", "inpP75Ms"]) {
          const value = row[metric];
          if (
            value !== null &&
            (typeof value !== "number" || !Number.isFinite(value) || value < 0)
          ) {
            invalidArtifact(
              filePath,
              `data[${index}].${metric} must be null or a non-negative finite number`
            );
          }
        }
      }
    } else {
      if (!doc.summary || typeof doc.summary !== "object" || Array.isArray(doc.summary)) {
        invalidArtifact(filePath, "summary must be an object");
      }
      for (const metric of ["pageViews", "requests", "cacheRatioPct", "bandwidthMB"]) {
        const value = doc.summary[metric];
        if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
          invalidArtifact(filePath, `summary.${metric} must be a non-negative finite number`);
        }
      }
    }
    return { status: "available", path: path.resolve(filePath), value: doc };
  };

  const rumResult = readCloudflareArtifact(rumPath, "cloudflare-rum", "rum");
  const trafficResult = readCloudflareArtifact(
    trafficPath,
    "cloudflare-traffic",
    "traffic"
  );
  const availableCount = [rumResult, trafficResult].filter(
    result => result.status === "available"
  ).length;
  return {
    status:
      availableCount === 2
        ? "available"
        : availableCount === 1
          ? "partial"
          : "missing",
    artifacts: { rum: rumResult, traffic: trafficResult },
    value:
      availableCount > 0
        ? { rum: rumResult.value, traffic: trafficResult.value }
        : null,
  };
}

function readUrlInspection(gscJsonDir, week) {
  const inspectionPath = path.join(gscJsonDir, `${week}-url-inspection.json`);
  if (!existsSync(inspectionPath)) {
    return {
      status: "missing",
      path: path.resolve(inspectionPath),
      value: null,
    };
  }
  const doc = parseJsonArtifact(inspectionPath);
  validateSignalHeader(doc, inspectionPath, {
    source: "gsc-url-inspection",
    week,
  });
  if (!doc.summary || typeof doc.summary !== "object" || Array.isArray(doc.summary)) {
    invalidArtifact(inspectionPath, "summary must be an object");
  }
  if (!Array.isArray(doc.data)) {
    invalidArtifact(inspectionPath, "data must be an array");
  }
  for (const metric of ["total", "indexed", "notIndexed", "other"]) {
    const value = doc.summary[metric];
    if (!Number.isInteger(value) || value < 0) {
      invalidArtifact(inspectionPath, `summary.${metric} must be a non-negative integer`);
    }
  }
  if (
    doc.summary.indexedPct !== null &&
    (typeof doc.summary.indexedPct !== "number" ||
      !Number.isFinite(doc.summary.indexedPct) ||
      doc.summary.indexedPct < 0 ||
      doc.summary.indexedPct > 100)
  ) {
    invalidArtifact(inspectionPath, "summary.indexedPct must be null or a percentage");
  }
  if (doc.errors !== undefined && (!Number.isInteger(doc.errors) || doc.errors < 0)) {
    invalidArtifact(inspectionPath, "errors must be a non-negative integer");
  }
  for (let index = 0; index < doc.data.length; index += 1) {
    const row = doc.data[index];
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      invalidArtifact(inspectionPath, `data[${index}] must be an object`);
    }
    try {
      new URL(row.url);
    } catch {
      invalidArtifact(inspectionPath, `data[${index}].url must be an absolute URL`);
    }
    if (row.coverageState !== null && typeof row.coverageState !== "string") {
      invalidArtifact(inspectionPath, `data[${index}].coverageState must be null or a string`);
    }
    if (
      row.lastCrawl !== null &&
      (typeof row.lastCrawl !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(row.lastCrawl))
    ) {
      invalidArtifact(inspectionPath, `data[${index}].lastCrawl must be null or an ISO date`);
    }
  }
  return {
    status: "available",
    path: path.resolve(inspectionPath),
    value: doc,
  };
}

function rateLcp(ms) {
  if (ms === null || ms === undefined) return "—";
  if (ms < 2500) return `${ms}ms ✅`;
  if (ms < 4000) return `${ms}ms ⚠️`;
  return `${ms}ms ❌`;
}

function rateCls(score) {
  if (score === null || score === undefined) return "—";
  if (score < 0.1) return `${score} ✅`;
  if (score < 0.25) return `${score} ⚠️`;
  return `${score} ❌`;
}

function rateInp(ms) {
  if (ms === null || ms === undefined) return "—";
  if (ms < 200) return `${ms}ms ✅`;
  if (ms < 500) return `${ms}ms ⚠️`;
  return `${ms}ms ❌`;
}

function nDformat(value) {
  return value === null || value === undefined ? "n/d" : String(value);
}

function safeRate(numerator, denominator) {
  if (!denominator || denominator <= 0) return "n/d";
  if (numerator === null || numerator === undefined) return "n/d";
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function safeEventRatio(numerator, denominator) {
  if (!denominator || denominator <= 0) return "n/d";
  if (numerator === null || numerator === undefined) return "n/d";
  return `${(numerator / denominator).toFixed(2)}×`;
}

function buildSourceSummary(analyticsJson, cloudflarePerf) {
  const sources = [];

  // Cloudflare CDN pageviews (from traffic summary)
  if (cloudflarePerf?.traffic?.summary) {
    sources.push(`CDN pageviews: ${cloudflarePerf.traffic.summary.pageViews}`);
  } else {
    sources.push("CDN pageviews: n/d");
  }

  // Cloudflare RUM samples
  if (cloudflarePerf?.rum?.data?.length > 0) {
    sources.push(`RUM samples: ${cloudflarePerf.rum.data.reduce((s, r) => s + (r.count ?? 0), 0)}`);
  } else {
    sources.push("RUM samples: n/d");
  }

  // First-party events
  if (analyticsJson?.available) {
    const t = analyticsJson.totals;
    sources.push(`Eventos first-party: ${t.views} views · ${t.starts} starts · ${t.completes} completes · ${t.errors} errors`);
  } else {
    sources.push("Eventos first-party: n/d (export no disponible)");
  }

  return sources.join(" · ");
}

function buildCalculatorFunnelSection(analyticsJson, cloudflarePerf) {
  if (!analyticsJson?.available) {
    return `
## Señales de calculadoras (first-party)

_Export semanal de analytics no disponible para esta semana._
`;
  }

  const { bySlug, totals, week } = analyticsJson;
  const slugs = Object.keys(bySlug).sort();
  if (slugs.length === 0) {
    return `
## Señales de calculadoras (first-party) — ${week}

_Sin eventos registrados esta semana._
`;
  }

  // Build per-calculator rows
  const rows = slugs.map((slug) => {
    const a = bySlug[slug];
    const startsPerView = safeEventRatio(a.starts, a.views);
    const resultsPerStart = safeEventRatio(a.completes, a.starts);
    const errorRate = safeRate(a.errors, a.starts);
    const nextStepCTR = safeRate(a.nextStepClicks, a.nextStepShown);

    return [
      `\`${slug}\``,
      nDformat(a.views),
      nDformat(a.starts),
      nDformat(a.completes),
      nDformat(a.errors),
      startsPerView,
      resultsPerStart,
      errorRate,
      nDformat(a.shares),
      nDformat(a.nextStepClicks),
      nextStepCTR,
      nDformat(a.supportClicks),
    ];
  });

  const parts = [
    `\n## Señales de calculadoras (first-party) — ${week}\n`,
    `**Fuentes diferenciadas:** ${buildSourceSummary(analyticsJson, cloudflarePerf)}`,
    "",
    table(
      [
        "Calculadora",
        "Views",
        "Starts",
        "Completes",
        "Errors",
        "Starts/view",
        "Results/start",
        "Error rate",
        "Shares",
        "NBS clicks",
        "NBS CTR",
        "Support",
      ],
      rows,
    ),
    "",
    "**Totales first-party:** " +
      `views=${totals.views} · starts=${totals.starts} · completes=${totals.completes} · errors=${totals.errors} · ` +
      `shares=${totals.shares} · NBS shown=${totals.nextStepShown} · NBS clicks=${totals.nextStepClicks} · ` +
      `support clicks=${totals.supportClicks} · result actions=${totals.resultActionClicks} · ` +
      `scenario actions=${totals.scenarioActions} · resume clicks=${totals.resumeClicks} · ` +
      `official source clicks=${totals.officialSourceClicks} · share success=${totals.shareSuccess} · ` +
      `alert shown=${totals.alertInterestShown} · alert interest=${totals.alertInterestSubmits} · ` +
      `support shown=${totals.supportShown} · support confirmed=${totals.supportConfirmed}`,
    "",
    `_Starts/view y results/start son ratios de conteos de eventos agregados; pueden superar 1× y no representan usuarios, sesiones ni conversión de cohorte. Error rate = errors / starts. NBS CTR = next-step clicks / next-step shown. "n/d" indica denominador cero o fuente no disponible._`,
    "",
  ];

  parts.push("### Experimentos utility-led\n");
  parts.push(
    table(
      [
        "Calculadora",
        "Next shown",
        "Next clicks",
        "Next CTR",
        "Share success",
        "Alert shown",
        "Alert interest",
        "Alert ratio",
        "Support shown",
        "Support clicks",
        "Support CTR",
        "Support confirmed",
      ],
      rows.length === 0
        ? []
        : slugs.map(slug => {
            const a = bySlug[slug];
            return [
              `\`${slug}\``,
              nDformat(a.nextStepShown),
              nDformat(a.nextStepClicks),
              safeRate(a.nextStepClicks, a.nextStepShown),
              nDformat(a.shareSuccess),
              nDformat(a.alertInterestShown),
              nDformat(a.alertInterestSubmits),
              safeRate(a.alertInterestSubmits, a.alertInterestShown),
              nDformat(a.supportShown),
              nDformat(a.supportClicks),
              safeRate(a.supportClicks, a.supportShown),
              nDformat(a.supportConfirmed),
            ];
          })
    )
  );
  parts.push(
    '\n_"Support confirmed" solo cuenta confirmación fiable; un click externo nunca se interpreta como pago._',
    ""
  );

  // Per-calculator detailed funnel for priority tools
  const prioritySlugs = [
    "conversor-utm",
    "seguro-cesantia",
    "operacion-renta",
    "prepago-credito",
    "credito-consumo",
  ];
  const priorityData = prioritySlugs
    .filter((s) => bySlug[s])
    .map((s) => ({ slug: s, ...bySlug[s] }));

  if (priorityData.length > 0) {
    parts.push("### Journey prioritario\n");
    parts.push(
      table(
        ["Calculadora", "Views", "Starts", "Completes", "Starts/view", "Results/start", "Next-step CTR", "Share rate"],
        priorityData.map((a) => {
          const startsPerView = safeEventRatio(a.starts, a.views);
          const resultsPerStart = safeEventRatio(a.completes, a.starts);
          const nextStepCTR = safeRate(a.nextStepClicks, a.nextStepShown);
          const shareRate = safeRate(a.shares, a.completes);
          return [
            `\`${a.slug}\``,
            nDformat(a.views),
            nDformat(a.starts),
            nDformat(a.completes),
            startsPerView,
            resultsPerStart,
            nextStepCTR,
            shareRate,
          ];
        }),
      ),
    );
    parts.push("");
  }

  return parts.join("\n");
}

function buildPerformanceSection(cloudflarePerf, weekLabel) {
  if (!cloudflarePerf) return "";
  const { rum, traffic } = cloudflarePerf;
  const parts = [`\n## Performance real (Cloudflare RUM — ${weekLabel})\n`];

  if (rum?.data?.length > 0) {
    parts.push(table(
      ["Ruta", "Visitas RUM", "LCP p75", "CLS p75", "INP p75"],
      rum.data.map(row => [
        `\`${row.path}\``,
        String(row.count),
        rateLcp(row.lcpP75Ms),
        rateCls(row.clsP75),
        rateInp(row.inpP75Ms),
      ])
    ));
    parts.push("");
  }

  if (traffic?.summary) {
    const s = traffic.summary;
    parts.push(`**Tráfico semanal:** ${s.pageViews} pageviews · ${s.requests} requests · cache ${s.cacheRatioPct}% · ${s.bandwidthMB} MB\n`);
  }

  return parts.join("\n");
}

const INDEXED_COVERAGE_STATE = "Submitted and indexed";
const NOT_INDEXED_LIMIT = 20;

function buildIndexationCoverageSection(inspection, weekLabel) {
  if (!inspection) return "";
  const s = inspection.summary;
  const parts = [`\n## Indexación real (URL Inspection — ${weekLabel})\n`];
  parts.push(
    `- Indexadas: **${s.indexed}/${s.total}** (${s.indexedPct ?? "n/d"}%)`,
    `- No indexadas ("Crawled - currently not indexed"): **${s.notIndexed}**`,
    `- Otras (excluidas, errores, sin dato): ${s.other}`,
    ""
  );

  // Everything that is NOT "Submitted and indexed" (crawled-not-indexed +
  // excluded/error/unknown) — i.e. notIndexed + other from the summary.
  const notConfirmed = inspection.data
    .filter(row => row.coverageState !== INDEXED_COVERAGE_STATE)
    // Stalest crawl first — the pages Google saw long ago and still withholds
    // are the most concerning; nulls (never crawled) sort last.
    .sort((a, b) => (a.lastCrawl ?? "9999").localeCompare(b.lastCrawl ?? "9999"));

  if (notConfirmed.length > 0) {
    parts.push(`### Sin confirmar en el índice (${notConfirmed.length}) — más antiguas primero\n`);
    parts.push(table(
      ["URL", "Estado", "Último crawl"],
      notConfirmed.slice(0, NOT_INDEXED_LIMIT).map(row => [
        `\`${new URL(row.url).pathname}\``,
        row.coverageState ?? "n/d",
        row.lastCrawl ?? "n/d",
      ])
    ));
    if (notConfirmed.length > NOT_INDEXED_LIMIT) {
      parts.push(`\n_… y ${notConfirmed.length - NOT_INDEXED_LIMIT} más. Lista completa en \`${weekLabel}-url-inspection.json\`._`);
    }
    parts.push("");
  }

  if (inspection.errors) {
    parts.push(`_Nota: ${inspection.errors} URL(s) fallaron la inspección (throttle/quota) y no se contabilizan como indexadas._`);
  }

  return parts.join("\n");
}

function loadJson(filePath, label) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`[weekly-search-report] Failed to read ${label}: ${error}`);
    process.exit(1);
  }
}

function readUtilityOps(inputDir, week) {
  const file = path.join(inputDir, "utility-led-ops.json");
  if (!existsSync(file)) {
    return {
      status: "INPUT_REQUIRED",
      weeklyHours: null,
      weeklyCostClp: null,
      tokenUsage: null,
      burnoutLevel: null,
      qualityIncidents: [],
      learningSignal: null,
      reputationSignal: null,
      maintenanceTasks: [],
      blockers: [],
      note: "Zero revenue is not a failure; sustainability is the continuation gate.",
    };
  }
  const document = parseJsonArtifact(file);
  if (document.schemaVersion !== 1) invalidArtifact(file, "schemaVersion must be 1");
  if (week && document.week !== week) invalidArtifact(file, `week must be ${week}`);
  for (const key of ["weeklyHours", "weeklyCostClp", "tokenUsage", "revenueClpOptional"]) {
    if (
      document[key] !== null &&
      (typeof document[key] !== "number" ||
        !Number.isFinite(document[key]) ||
        document[key] < 0)
    ) {
      invalidArtifact(file, `${key} must be null or a non-negative number`);
    }
  }
  if (
    document.burnoutLevel1To5 !== null &&
    (![1, 2, 3, 4, 5].includes(document.burnoutLevel1To5) ||
      !Number.isInteger(document.burnoutLevel1To5))
  ) {
    invalidArtifact(file, "burnoutLevel1To5 must be null or an integer from 1 to 5");
  }
  for (const key of ["qualityIncidents", "maintenanceTasks", "blockers"]) {
    if (!Array.isArray(document[key])) invalidArtifact(file, `${key} must be an array`);
  }
  const complete =
    document.weeklyHours !== null &&
    document.weeklyCostClp !== null &&
    document.burnoutLevel1To5 !== null;
  const hasCriticalIncident = document.qualityIncidents.some(
    incident => incident?.severity === "critical"
  );
  const watch =
    document.weeklyHours > 6 ||
    document.weeklyCostClp > 25_000 ||
    document.burnoutLevel1To5 >= 3;
  return {
    status: !complete
      ? "INPUT_REQUIRED"
      : hasCriticalIncident
        ? "HALT"
        : watch
          ? "WATCH"
          : "GREEN",
    weeklyHours: document.weeklyHours,
    weeklyCostClp: document.weeklyCostClp,
    tokenUsage: document.tokenUsage,
    burnoutLevel: document.burnoutLevel1To5,
    qualityIncidents: document.qualityIncidents,
    learningSignal: document.learningSignal,
    reputationSignal: document.reputationSignal,
    maintenanceTasks: document.maintenanceTasks,
    blockers: document.blockers,
    revenueClpOptional: document.revenueClpOptional,
    note: document.note,
  };
}

function getDeltaPercent(current, delta) {
  if (delta === null || delta === undefined) return null;
  const previous = current - delta;
  if (previous <= 0) {
    return delta > 0 ? 100 : 0;
  }
  return (delta / previous) * 100;
}

function formatSignedNumber(value, digits = 0) {
  if (value === null || value === undefined) return "n/d";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}`;
}

function formatMetricPair(current, delta, suffix = "", digits = 0) {
  if (current === null || current === undefined) return "n/d";
  if (delta === null || delta === undefined) {
    return `${current.toFixed(digits)}${suffix} (comparison n/d)`;
  }
  return `${current.toFixed(digits)}${suffix} (${formatSignedNumber(
    delta,
    digits
  )}${suffix})`;
}

function formatPercent(value) {
  if (value === null || value === undefined) return "n/d";
  return `${value.toFixed(1)}%`;
}

function formatPathForMarkdown(value) {
  return value ? `\`${value}\`` : "n/d";
}

function sanitizeMarkdownCell(value) {
  const stringValue = `${value ?? ""}`;
  // First escape backslashes, then escape pipe characters for Markdown tables.
  return stringValue.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
}

function table(headers, rows) {
  const headerLine = `| ${headers.join(" | ")} |`;
  const separatorLine = `| ${headers.map(() => "---").join(" | ")} |`;
  const bodyLines = rows.map(row => {
    const cells = row.map(cell => sanitizeMarkdownCell(cell));
    return `| ${cells.join(" | ")} |`;
  });
  return [headerLine, separatorLine, ...bodyLines].join("\n");
}

function sumMetric(rows, key) {
  return rows.reduce((total, row) => total + (row[key] ?? 0), 0);
}

function sumDeltaMetric(rows, key) {
  return rows.some(row => row[key] === null || row[key] === undefined)
    ? null
    : sumMetric(rows, key);
}

function aggregateQueryPulse(queryRows, queryThemes) {
  const loweredThemes = (queryThemes ?? []).map(theme => theme.toLowerCase());
  if (loweredThemes.length === 0) {
    return null;
  }

  const matches = queryRows.filter(row =>
    loweredThemes.some(theme => row.label.toLowerCase().includes(theme))
  );
  if (matches.length === 0) {
    return null;
  }

  const impressions = sumMetric(matches, "impressions");
  const clicks = sumMetric(matches, "clicks");
  const impressionsDelta = sumDeltaMetric(matches, "impressionsDelta");
  const clicksDelta = sumDeltaMetric(matches, "clicksDelta");
  const ctrWeighted =
    impressions > 0
      ? matches.reduce((total, row) => total + row.ctr * row.impressions, 0) /
        impressions
      : 0;
  const positionWeighted =
    impressions > 0
      ? matches.reduce(
          (total, row) => total + row.position * row.impressions,
          0
        ) / impressions
      : 0;

  return {
    queryCount: matches.length,
    clicks,
    clicksDelta,
    impressions,
    impressionsDelta,
    ctr: ctrWeighted,
    position: positionWeighted,
  };
}

function getAnalyticsMetrics(pageEvents, pagePath) {
  const perPage = pageEvents.get(pagePath) ?? {};
  const cta = perPage.cta_click ?? { current: 0, previous: 0 };
  const starts = perPage.calculator_start ?? { current: 0, previous: 0 };
  const completes = perPage.calculator_complete ?? { current: 0, previous: 0 };

  return {
    cta,
    starts,
    completes,
    resultsPerStart:
      starts.current > 0 ? completes.current / starts.current : null,
  };
}

function classifyTrackedPage(entry, pageRow, queryPulse, analyticsMetrics) {
  let status = "steady";
  const reasons = [];
  const actions = [];

  if (!pageRow) {
    status = "watch";
    reasons.push("No apareció en el export de páginas de GSC del rango.");
  }

  if (pageRow) {
    const hasComparison = pageRow.clicksDelta !== null;
    const hasPositionComparison = pageRow.positionDelta !== null;
    const clickDeltaPct = getDeltaPercent(pageRow.clicks, pageRow.clicksDelta);
    const winner =
      hasComparison &&
      (pageRow.clicksDelta >= 10 ||
        clickDeltaPct >= 20 ||
        (hasPositionComparison &&
          pageRow.impressions >= 150 &&
          pageRow.positionDelta <= -0.5 &&
          pageRow.ctrDelta >= 0.3));
    const loser =
      hasComparison &&
      (pageRow.clicksDelta <= -10 ||
        clickDeltaPct <= -20 ||
        (hasPositionComparison &&
          pageRow.impressions >= 150 &&
          pageRow.ctrDelta <= -0.7 &&
          pageRow.positionDelta >= 0.5));
    const watch =
      pageRow.impressions >= 150 &&
      ((pageRow.position >= 4 && pageRow.position <= 15) || pageRow.ctr < 3);

    if (loser) {
      status = "loser";
      reasons.push(
        `Clics ${formatSignedNumber(pageRow.clicksDelta)} y CTR ${formatSignedNumber(
          pageRow.ctrDelta,
          1
        )} pp.`
      );
    } else if (winner) {
      status = "winner";
      reasons.push(
        hasPositionComparison
          ? `Clics ${formatSignedNumber(pageRow.clicksDelta)} con posición ${formatSignedNumber(
              -pageRow.positionDelta,
              1
            )} puntos mejor respecto a la semana previa.`
          : `Clics ${formatSignedNumber(pageRow.clicksDelta)}; identidad ${pageRow.identityStatus} sin comparación de posición.`
      );
    } else if (watch) {
      status = "watch";
      reasons.push(
        `Impresiones ${pageRow.impressions.toFixed(
          0
        )} con posición ${pageRow.position.toFixed(
          1
        )}; todavía está en zona movible.`
      );
    }

    const refreshNeeded =
      pageRow.impressions >= 150 &&
      pageRow.position >= 4 &&
      pageRow.position <= 15 &&
      pageRow.ctr < 3.5;

    if (refreshNeeded) {
      actions.push({
        type: "refresh",
        text: "Refresh de title/snippet y apertura: hay impresiones con posición 4-15 y CTR débil.",
      });
    }
  }

  if (queryPulse && pageRow && queryPulse.clicksDelta > 0 && pageRow.clicksDelta < 0) {
    if (status === "steady" || status === "watch") {
      status = "action_needed";
    }
    actions.push({
      type: "refresh",
      text: "La demanda del query set sube, pero la landing cae. Revisar intención, snippet y primeras secciones.",
    });
  }

  if (
    entry.role !== "tool" &&
    entry.nextStepPaths?.length &&
    pageRow &&
    pageRow.clicksDelta > 0 &&
    analyticsMetrics.cta.current <= analyticsMetrics.cta.previous
  ) {
    if (status === "steady" || status === "watch") {
      status = "action_needed";
    }
    actions.push({
      type: "internal_linking",
      text: `El tráfico sube, pero los CTA no acompañan. Reforzar enlaces hacia ${entry.nextStepPaths.join(
        ", "
      )}.`,
    });
  }

  if (
    status === "steady" &&
    queryPulse &&
    queryPulse.impressions >= 150 &&
    queryPulse.position >= 4 &&
    queryPulse.position <= 15
  ) {
    status = "watch";
    reasons.push(
      "El query set ya está cerca de primera página completa y merece seguimiento."
    );
  }

  return {
    status,
    reasons,
    actions,
  };
}

function topMovers(rows, key, direction, limit = 5) {
  const comparable = rows.filter(row => Number.isFinite(row[key]));
  const sorted = comparable.sort((left, right) =>
    direction === "desc" ? right[key] - left[key] : left[key] - right[key]
  );
  return sorted.filter(row => (direction === "desc" ? row[key] > 0 : row[key] < 0)).slice(0, limit);
}

function buildIndexationStatus(indexation) {
  const sections = [];

  const googleAlerts = [
    ...(indexation.google?.alerts ?? []),
    ...((indexation.google?.enhancementIssues ?? []).map(
      issue => `Enhancement: ${issue}`
    ) ?? []),
  ];
  if (
    indexation.google?.manualActions &&
    indexation.google.manualActions !== "none"
  ) {
    googleAlerts.push(`Manual action: ${indexation.google.manualActions}`);
  }

  sections.push({
    platform: "Google Search Console",
    status: indexation.google?.sitemapStatus ?? "n/d",
    coverage: indexation.google?.coverageNotes ?? "Sin nota cargada.",
    alerts: googleAlerts,
  });

  sections.push({
    platform: "Bing Webmaster",
    status: indexation.bing?.sitemapStatus ?? "n/d",
    coverage: indexation.bing?.coverageNotes ?? "Sin nota cargada.",
    alerts: indexation.bing?.alerts ?? [],
  });

  return sections;
}

function buildSummary({ watchlist, indexation, pageRows, queryRows, analytics, analyticsJson, gscSource, gscComparison, cloudflarePerf, urlInspection, inputStatus, utilityOps }) {
  const pageByPath = new Map(pageRows.map(row => [row.path, row]));

  const trackedPages = watchlist.pages.map(entry => {
    const pageRow = pageByPath.get(entry.path) ?? null;
    const queryPulse = aggregateQueryPulse(queryRows, entry.queryThemes);
    const analyticsMetrics = getAnalyticsMetrics(analytics.pageEvents, entry.path);
    const decision = classifyTrackedPage(
      entry,
      pageRow,
      queryPulse,
      analyticsMetrics
    );

    return {
      ...entry,
      pageRow,
      queryPulse,
      analyticsMetrics,
      ...decision,
    };
  });

  const topPageWinners = topMovers(pageRows, "clicksDelta", "desc");
  const topPageLosers = topMovers(pageRows, "clicksDelta", "asc");
  const topQueryWinners = topMovers(queryRows, "clicksDelta", "desc");
  const topQueryLosers = topMovers(queryRows, "clicksDelta", "asc");

  const refreshCandidates = trackedPages
    .flatMap(item =>
      item.actions
        .filter(action => action.type === "refresh")
        .map(action => ({ path: item.path, label: item.label, text: action.text }))
    );

  const linkingCandidates = trackedPages
    .flatMap(item =>
      item.actions
        .filter(action => action.type !== "refresh")
        .map(action => ({ path: item.path, label: item.label, text: action.text }))
    );

  const queryQuickWins = queryRows
    .filter(
      row =>
        row.impressions >= 150 &&
        row.position >= 4 &&
        row.position <= 15 &&
        row.ctr < 3.5
    )
    .sort((left, right) => right.impressions - left.impressions)
    .slice(0, 5);

  const utilityStatus =
    !analyticsJson || utilityOps.status === "HALT"
      ? "HALT"
      : utilityOps.status === "INPUT_REQUIRED" ||
          utilityOps.status === "WATCH" ||
          (analyticsJson.totals.starts > 0 &&
            analyticsJson.totals.errors / analyticsJson.totals.starts > 0.1)
        ? "WATCH"
        : "GREEN";
  const utilityActions = (
    !analyticsJson
      ? ["Restaurar o validar el export first-party antes de interpretar el funnel."]
      : [
          "Contrastar adquisición UTM con complete/start antes de ampliar superficies.",
          ...(analyticsJson.totals.alertInterestSubmits > 0
            ? ["Revisar interés agregado en avisos sin construir email ni backend."]
            : []),
          ...(analyticsJson.totals.supportClicks > 0
            ? ["Revisar clics de apoyo como señal agregada; no inferir pagos ni retorno individual."]
            : []),
        ]
  ).slice(0, 3);

  return {
    generatedAt: new Date().toISOString(),
    site: watchlist.site,
    weekLabel: indexation.weekLabel ?? "weekly-review",
    source: gscSource ?? "csv",
    comparison: gscComparison,
    inputStatus,
    dateRange: indexation.dateRange ?? null,
    totals: {
      clicks: sumMetric(pageRows, "clicks"),
      clicksDelta: sumDeltaMetric(pageRows, "clicksDelta"),
      impressions: sumMetric(pageRows, "impressions"),
      impressionsDelta: sumDeltaMetric(pageRows, "impressionsDelta"),
      trackedWinnerCount: trackedPages.filter(item => item.status === "winner")
        .length,
      trackedLoserCount: trackedPages.filter(item => item.status === "loser")
        .length,
      trackedActionCount: trackedPages.filter(
        item => item.status === "action_needed"
      ).length,
    },
    analyticsTotals: analytics.totals,
    trackedPages,
    topPageWinners,
    topPageLosers,
    topQueryWinners,
    topQueryLosers,
    queryQuickWins,
    refreshCandidates,
    linkingCandidates,
    indexationStatus: buildIndexationStatus(indexation),
    indexationCoverage: urlInspection ?? null,
    notes: indexation.notes ?? [],
    analyticsAvailable: analytics.available,
    analyticsJson: analyticsJson ?? null,
    cloudflarePerf: cloudflarePerf ?? null,
    utilityLed: {
      status: utilityStatus,
      acquisition: {
        clicks: sumMetric(pageRows, "clicks"),
        impressions: sumMetric(pageRows, "impressions"),
      },
      product: analyticsJson?.totals ?? null,
      integrity: {
        gsc: "available",
        analytics: analyticsJson ? "available" : "missing",
      },
      operations: utilityOps,
      actions: utilityActions,
    },
  };
}

function buildHeadline(summary) {
  const dateLine = summary.dateRange
    ? `${summary.dateRange.currentStart} -> ${summary.dateRange.currentEnd} vs ${summary.dateRange.previousStart} -> ${summary.dateRange.previousEnd}`
    : "Rango no definido en indexation-summary.json";

  return [
    `- Week label: \`${summary.weekLabel}\``,
    `- Date comparison: \`${dateLine}\``,
    summary.comparison.status === "unavailable"
      ? `- GSC comparison: \`unavailable\` — previous artifact ${summary.comparison.previousWeek} is missing; deltas and movers are not inferred.`
      : `- GSC comparison: \`${summary.comparison.currentWeek} vs ${summary.comparison.previousWeek}\``,
    `- GSC clicks total: \`${formatMetricPair(
      summary.totals.clicks,
      summary.totals.clicksDelta
    )}\``,
    `- GSC impressions total: \`${formatMetricPair(
      summary.totals.impressions,
      summary.totals.impressionsDelta
    )}\``,
    `- Tracked assets: \`${summary.trackedPages.length}\` (\`${summary.totals.trackedWinnerCount}\` winners, \`${summary.totals.trackedLoserCount}\` losers, \`${summary.totals.trackedActionCount}\` action-needed)`,
    summary.analyticsAvailable
      ? `- Analytics totals (CSV): \`cta_click ${summary.analyticsTotals.cta_click.current}\`, \`calculator_start ${summary.analyticsTotals.calculator_start.current}\`, \`calculator_complete ${summary.analyticsTotals.calculator_complete.current}\`, \`next_best_step_shown ${summary.analyticsTotals.next_best_step_shown?.current ?? 0}\`, \`next_best_step_click ${summary.analyticsTotals.next_best_step_click?.current ?? 0}\``
      : "- Analytics totals (CSV): `analytics-events.csv` not provided",
    summary.analyticsJson?.available
      ? `- First-party analytics: \`${summary.analyticsJson.week}\` — ${Object.keys(summary.analyticsJson.bySlug).length} calculators, ${summary.analyticsJson.totals.views} views · ${summary.analyticsJson.totals.starts} starts · ${summary.analyticsJson.totals.completes} completes`
      : "- First-party analytics: export not available for this week",
    `- Optional input status: \`analytics=${summary.inputStatus.analytics.status}\`, \`cloudflare-rum=${summary.inputStatus.cloudflare.rum.status}\`, \`cloudflare-traffic=${summary.inputStatus.cloudflare.traffic.status}\`, \`url-inspection=${summary.inputStatus.urlInspection.status}\``,
  ];
}

function renderMoverTable(rows, kind) {
  if (rows.length === 0) {
    return "_No rows matched this criterion in the current export._";
  }

  return table(
    kind === "pages"
      ? ["URL", "Clicks", "Impressions", "CTR", "Position"]
      : ["Query", "Clicks", "Impressions", "CTR", "Position"],
    rows.map(row => [
      kind === "pages" ? formatPathForMarkdown(row.path) : `\`${row.label}\``,
      formatMetricPair(row.clicks, row.clicksDelta),
      formatMetricPair(row.impressions, row.impressionsDelta),
      `${formatPercent(row.ctr)} (${formatSignedNumber(row.ctrDelta, 1)} pp)`,
      row.identityStatus === "new"
        ? `${row.position.toFixed(1)} (new identity; prior position n/d)`
        : row.identityStatus === "removed"
          ? "n/d (removed identity; current position n/d)"
          : row.positionDelta === null
            ? `${row.position.toFixed(1)} (comparison n/d)`
        : `${row.position.toFixed(1)} (${formatSignedNumber(
            -row.positionDelta,
            1
          )} better)`,
    ])
  );
}

function renderTrackedTable(trackedPages) {
  return table(
    ["URL", "Rol", "Organic", "Query pulse", "Analytics", "Status", "Next move"],
    trackedPages.map(item => {
      const organic = item.pageRow
        ? item.pageRow.clicksDelta === null
          ? "Comparison unavailable"
          : `Clicks ${formatSignedNumber(item.pageRow.clicksDelta)}, CTR ${formatSignedNumber(
              item.pageRow.ctrDelta,
              1
            )} pp`
        : "n/d";
      const queryPulse = item.queryPulse
        ? item.queryPulse.clicksDelta === null
          ? `Clicks comparison n/d, Pos ${item.queryPulse.position.toFixed(1)}`
          : `Clicks ${formatSignedNumber(
              item.queryPulse.clicksDelta
            )}, Pos ${item.queryPulse.position.toFixed(1)}`
        : "n/d";
      const analytics =
        item.role === "tool"
          ? `starts ${item.analyticsMetrics.starts.current}, completes ${item.analyticsMetrics.completes.current}, results/start ${
              item.analyticsMetrics.resultsPerStart === null
                ? "n/d"
                : `${item.analyticsMetrics.resultsPerStart.toFixed(2)}×`
            }`
          : `cta_click ${item.analyticsMetrics.cta.current} (${formatSignedNumber(
              item.analyticsMetrics.cta.current -
                item.analyticsMetrics.cta.previous
            )})`;
      const nextMove =
        item.actions[0]?.text ?? item.reasons[0] ?? "Seguir igual una semana más.";

      return [
        formatPathForMarkdown(item.path),
        item.role,
        organic,
        queryPulse,
        analytics,
        item.status,
        nextMove,
      ];
    })
  );
}

function renderActionList(items) {
  if (items.length === 0) {
    return "_No action candidates were generated from the current data._";
  }

  return items.map(item => `- ${item.label} (${item.path}): ${item.text}`).join("\n");
}

function buildMarkdown(summary) {
  return `# Weekly Search Performance Scorecard

Generated: \`${summary.generatedAt}\`

## Headline

${buildHeadline(summary).join("\n")}

## Indexation Health

${summary.indexationStatus
  .map(section => {
    const alerts =
      section.alerts.length > 0
        ? section.alerts.map(alert => `  - ${alert}`).join("\n")
        : "  - No explicit alerts logged.";
    return `### ${section.platform}

- Sitemap status: \`${section.status}\`
- Coverage note: ${section.coverage}
- Alerts:
${alerts}`;
  })
  .join("\n\n")}
${buildIndexationCoverageSection(summary.indexationCoverage, summary.weekLabel)}

## Top Winners

### Pages

${renderMoverTable(summary.topPageWinners, "pages")}

### Queries

${renderMoverTable(summary.topQueryWinners, "queries")}

## Top Losers

### Pages

${renderMoverTable(summary.topPageLosers, "pages")}

### Queries

${renderMoverTable(summary.topQueryLosers, "queries")}

## Strategic Watchlist

${renderTrackedTable(summary.trackedPages)}

## Refresh Candidates

${renderActionList(summary.refreshCandidates)}

## Internal Linking / Packaging / Tool UX

${renderActionList(summary.linkingCandidates)}

## Query Quick Wins

${renderMoverTable(summary.queryQuickWins, "queries")}

## Notes

${
  summary.notes.length > 0
    ? summary.notes.map(note => `- ${note}`).join("\n")
    : "- No additional manual notes were logged in `indexation-summary.json`."
}
${buildPerformanceSection(summary.cloudflarePerf, summary.weekLabel)}
${buildCalculatorFunnelSection(summary.analyticsJson, summary.cloudflarePerf)}

## Utility-led operating gate

- Status: **${summary.utilityLed.status}**
- Integrity: GSC **${summary.utilityLed.integrity.gsc}** · analytics **${summary.utilityLed.integrity.analytics}**
- Operations/sustainability: **${summary.utilityLed.operations.status}** — record weekly hours, cost, burnout, quality incidents, learning and reputation before deciding expansion.
- Revenue: not a continuation gate; zero revenue is compatible with a sustainable learning period.

### Next actions (maximum 3)

${summary.utilityLed.actions.map(action => `- ${action}`).join("\n")}`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.init) {
    initInputDirectory(options.inputDir);
    return;
  }

  const watchlist = loadJson(options.watchlistFile, "watchlist config");
  const indexation = loadJson(
    path.join(options.inputDir, "indexation-summary.json"),
    "indexation summary"
  );

  const week = extractWeekFromDir(options.inputDir);
  const gscJson = week ? readGscJson(options.gscJsonDir, week) : null;
  const pagesCsvPath = path.join(options.inputDir, "gsc-pages.csv");
  const queriesCsvPath = path.join(options.inputDir, "gsc-queries.csv");
  const hasCsv = existsSync(pagesCsvPath) && existsSync(queriesCsvPath);

  let pageRows, queryRows, gscSource, gscComparison;
  if (hasCsv) {
    pageRows = readSearchCsv(pagesCsvPath, "pages");
    queryRows = readSearchCsv(queriesCsvPath, "queries");
    gscSource = "csv";
    gscComparison = {
      status: "available",
      currentWeek: week ?? indexation.weekLabel ?? "current",
      previousWeek: "embedded-in-csv",
    };
  } else if (gscJson) {
    pageRows = gscJson.pageRows;
    queryRows = gscJson.queryRows;
    gscSource = "json";
    gscComparison = gscJson.comparison;
    console.log(
      `[weekly-search-report] GSC source: JSON (${path.resolve(options.gscJsonDir)}/${week}-*.json)`
    );
  } else {
    pageRows = readSearchCsv(pagesCsvPath, "pages");
    queryRows = readSearchCsv(queriesCsvPath, "queries");
    gscSource = "csv";
    gscComparison = {
      status: "available",
      currentWeek: week ?? indexation.weekLabel ?? "current",
      previousWeek: "embedded-in-csv",
    };
  }

  const analytics = readAnalyticsCsv(
    path.join(options.inputDir, "analytics-events.csv")
  );
  const noWeekResult = { status: "missing", path: null, value: null };
  const analyticsResult = week
    ? readAnalyticsJson(options.analyticsJsonDir, week)
    : noWeekResult;
  const cloudflareResult = week
    ? readCloudflarePerf(options.cloudflareJsonDir, week)
    : {
        status: "missing",
        artifacts: { rum: noWeekResult, traffic: noWeekResult },
        value: null,
      };
  const inspectionResult = week
    ? readUrlInspection(options.gscJsonDir, week)
    : noWeekResult;
  const analyticsJson = analyticsResult.value;
  const cloudflarePerf = cloudflareResult.value;
  const urlInspection = inspectionResult.value;
  const utilityOps = readUtilityOps(options.inputDir, week);
  const inputStatus = {
    analytics: {
      status: analyticsResult.status,
      path: analyticsResult.path,
    },
    cloudflare: {
      status: cloudflareResult.status,
      rum: {
        status: cloudflareResult.artifacts.rum.status,
        path: cloudflareResult.artifacts.rum.path,
      },
      traffic: {
        status: cloudflareResult.artifacts.traffic.status,
        path: cloudflareResult.artifacts.traffic.path,
      },
    },
    urlInspection: {
      status: inspectionResult.status,
      path: inspectionResult.path,
    },
  };

  const summary = buildSummary({
    watchlist,
    indexation,
    pageRows,
    queryRows,
    analytics,
    analyticsJson,
    gscSource,
    gscComparison,
    cloudflarePerf,
    urlInspection,
    inputStatus,
    utilityOps,
  });
  const markdown = buildMarkdown(summary);

  ensureDirectory(path.dirname(options.outputFile));
  ensureDirectory(path.dirname(options.jsonFile));
  writeFileSync(options.outputFile, markdown, "utf8");
  writeFileSync(options.jsonFile, JSON.stringify(summary, null, 2) + "\n", "utf8");

  console.log(
    `[weekly-search-report] Scorecard written to ${path.resolve(options.outputFile)}`
  );
  console.log(
    `[weekly-search-report] JSON summary written to ${path.resolve(options.jsonFile)}`
  );
  console.log(
    `[weekly-search-report] Inputs loaded: pages=${pageRows.length} queries=${queryRows.length} analytics=${
      analytics.available ? "yes" : "no"
    } analytics-json=${analyticsJson?.available ? `yes (${Object.keys(analyticsJson.bySlug).length} tools)` : "no"} gsc-source=${gscSource} cloudflare=${cloudflarePerf ? "yes" : "no"}`
  );
}

main();
