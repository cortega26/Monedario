# Reports

Canonical audit reports and validation baselines.

- Deep audit: `docs/reports/AUDIT-DEEP-2026-05-15.md`
- Alignment audit: `docs/reports/AUDIT-ALIGNMENT-2026-05-25.md`
- UX audit: `docs/reports/ux-audit-2026-04-09.md`
- AI citation tracking (recurring monthly checklist): `docs/reports/AI-CITATION-TRACKING.md`
- CTR opportunity audit (regenerate via `node scripts/audit-ctr-opportunities.mjs`): `docs/reports/CTR-AUDIT-*.md`
- Route baseline: `docs/reports/routes_snapshot_before.json`
- RSS baseline: `docs/reports/rss_snapshot.json`

Route and RSS snapshots are inputs to CI gates. Update them only when a public
route or feed change is intentional and documented.
