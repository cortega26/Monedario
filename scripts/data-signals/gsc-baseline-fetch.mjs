#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fetchAccessToken } from "./gsc-auth.mjs";

const SITE = "sc-domain:monedario.cl";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const ROW_LIMIT = 25_000;

export function baselineWindows(now = new Date()) {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 3));
  const iso = date => date.toISOString().slice(0, 10);
  const start = days => new Date(end.getTime() - (days - 1) * 86_400_000);
  const priorEnd = new Date(start(28).getTime() - 86_400_000);
  const priorStart = new Date(priorEnd.getTime() - 27 * 86_400_000);
  return {
    "28d": { from: iso(start(28)), to: iso(end) },
    "previous-28d": { from: iso(priorStart), to: iso(priorEnd) },
    "3m": { from: iso(start(91)), to: iso(end) },
  };
}

async function fetchRows(site, window, dimension, token) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`;
  const rows = [];
  for (let startRow = 0; ; startRow += ROW_LIMIT) {
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: window.from,
        endDate: window.to,
        dimensions: [dimension],
        rowLimit: ROW_LIMIT,
        startRow,
        dataState: "final",
      }),
    });
    if (!response.ok) throw new Error(`${dimension} ${response.status}: ${await response.text()}`);
    const batch = (await response.json()).rows ?? [];
    rows.push(...batch);
    if (batch.length < ROW_LIMIT) return rows;
  }
}

function normalizeRows(rows, dimension) {
  return rows.map(row => ({
    [dimension]: String(row.keys?.[0] ?? ""),
    clicks: Number(row.clicks ?? 0),
    impressions: Number(row.impressions ?? 0),
    ctr: Number(row.ctr ?? 0),
    position: Number(row.position ?? 0),
  }));
}

async function main() {
  const credentialsRaw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentialsRaw) throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON is required");
  const credentials = JSON.parse(credentialsRaw);
  const token = await fetchAccessToken(credentials, SCOPE);
  const asOf = process.argv.find(arg => arg.startsWith("--as-of="))?.split("=")[1] ?? new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) throw new Error("--as-of must be YYYY-MM-DD");
  const windows = baselineWindows(new Date(`${asOf}T12:00:00Z`));
  const output = path.resolve(`output/operations/data-signals/gsc/baselines/${asOf}`);
  mkdirSync(output, { recursive: true });
  const manifest = { schemaVersion: 1, fetchedAt: new Date().toISOString(), site: SITE, asOf, windows, files: [], warnings: [] };

  const dimensions = ["page", "query", "country", "device", "searchAppearance"];
  for (const [windowName, window] of Object.entries(windows)) {
    for (const dimension of dimensions) {
      if (windowName !== "28d" && !["page", "query"].includes(dimension)) continue;
      try {
        const data = normalizeRows(await fetchRows(SITE, window, dimension, token), dimension);
        const filename = `${windowName}-${dimension}.json`;
        writeFileSync(path.join(output, filename), `${JSON.stringify({ schemaVersion: 1, source: "google-search-console", site: SITE, windowName, window, dimension, fetchedAt: manifest.fetchedAt, data }, null, 2)}\n`);
        manifest.files.push({ filename, rows: data.length, required: dimension !== "searchAppearance" });
      } catch (error) {
        const message = `${windowName}/${dimension}: ${error instanceof Error ? error.message : String(error)}`;
        if (dimension === "searchAppearance") manifest.warnings.push(message);
        else throw new Error(message);
      }
    }
  }

  const sitemapResponse = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/sitemaps`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!sitemapResponse.ok) throw new Error(`sitemaps ${sitemapResponse.status}`);
  const sitemaps = (await sitemapResponse.json()).sitemap ?? [];
  writeFileSync(path.join(output, "sitemaps.json"), `${JSON.stringify({ schemaVersion: 1, source: "google-search-console", fetchedAt: manifest.fetchedAt, data: sitemaps }, null, 2)}\n`);
  manifest.files.push({ filename: "sitemaps.json", rows: sitemaps.length, required: true });
  writeFileSync(path.join(output, "fetch-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.error(`[gsc-baseline-fetch] wrote ${manifest.files.length} files to ${output}`);
}

if (process.argv[1] && import.meta.url === new URL(`file://${path.resolve(process.argv[1])}`).href) {
  main().catch(error => {
    console.error(`[gsc-baseline-fetch] HALT: ${error.message}`);
    process.exit(1);
  });
}
