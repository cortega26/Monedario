# Weekly Search Reporting Input Bundle

Drop the weekly exports in this folder, then run:

```bash
node scripts/build-weekly-search-report.mjs --input output/operations/weekly-search-performance/2026-W19
```

Required files:

- `gsc-pages.csv`
  - Google Search Console > Search results > Pages
  - Date comparison: last 7 days vs previous 7 days
  - Export with clicks / impressions / CTR / average position deltas
- `gsc-queries.csv`
  - Google Search Console > Search results > Queries
  - Same date comparison as pages
- `indexation-summary.json`
  - Fill the template with the current Google/Bing sitemap and coverage notes

Optional file:

- `analytics-events.csv`
  - GA4 export filtered to the same weekly window
  - Expected columns: `page_path,event_name,event_count,event_count_previous`

Notes:

- Keep one folder per week, for example `output/operations/weekly-search-performance/2026-W19/`.
- The script supports English or Spanish GSC column headers.
- If analytics export is missing, the scorecard still renders, but CTA/tool signals stay blank.
