# Weekly Search Reporting Input Bundle

Drop the weekly exports in this folder, then run:

```bash
node scripts/build-weekly-search-report.mjs --input output/operations/weekly-search-performance/2026-W28
```

Primary source artifacts:

- `output/operations/data-signals/gsc/2026-W28-{pages,queries,query-page,sitemaps,url-inspection}.json`
- `output/operations/data-signals/cloudflare/2026-W28-{traffic,rum}.json`
- `output/operations/data-signals/analytics/2026-W28.json`
- `indexation-summary.json`
  - Google URL Inspection and sitemap summary, plus the bounded Bing caveat

CSV fallback inputs remain supported when normalized JSON is unavailable:

- `gsc-pages.csv`
- `gsc-queries.csv`
- `analytics-events.csv` (aggregate event counts only)

Notes:

- Keep one folder per week, for example `output/operations/weekly-search-performance/2026-W28/`.
- The JSON-backed scorecard compares W28 with the valid W27 artifacts and fails
  on present-but-invalid inputs.
- First-party analytics counters are events, not users/sessions; `results/start`
  is an event ratio and may exceed `1×`.
- The decision report lives under `traffic-seo-geo-report/` as a canonical
  artifact plus a self-contained HTML reader.
