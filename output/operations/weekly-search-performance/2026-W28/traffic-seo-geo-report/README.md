# W28 traffic, SEO, and GEO report

Decision-grade report for the complete ISO week 2026-W28 (2026-07-06 through
2026-07-12).

## Files

- `artifact.json`: canonical, bounded Data Analytics report artifact.
- `report.html`: generated self-contained portable reader; no network fetch,
  local server, runtime sidecar, or sibling data file is required.

## Validation

- Data Analytics artifact validator: passed (`surface=report`, four datasets,
  six canonical sources, snapshot status `ready`).
- Portable structural verification: passed exact artifact/payload equality,
  reader runtime, semantic fallback, visible title, 16 blocks, five metric
  cards, and one native chart.
- Browser verification rendered all content and chart data, but the packaged
  shared reader reported document-level horizontal overflow at the 1440 px
  viewport. Removing both native tables did not change the result, isolating the
  residual to the shared portable-reader layout rather than report data. The
  delivered HTML remains readable and self-contained, with semantic fallback;
  this limitation is not represented as a full browser-QA pass.

## Evidence boundary

The report uses repository-local aggregate GSC, Cloudflare, URL Inspection, and
first-party event artifacts only. It contains no raw visitor records, personal
data, secrets, or credential-bearing URLs. Bing index coverage is explicitly
unverified because no trustworthy Bing Webmaster Tools export was available.
