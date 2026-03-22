# ADR-20260322 Editorial Volatile Data Pipeline

- Status: Accepted
- Date: 2026-03-22

## Context

The repository already had:

1. Runtime economic snapshots for indicators such as `UF`, `UTM`, and `IPC`
2. A timeliness SLA guard for editorial review windows

That was not enough to stop real-world drift in articles that embed volatile claims such as AFP commissions, taxable caps, or other regulatory thresholds. We needed a deterministic link between:

- the official dataset or snapshot
- the article that depends on it
- the pipeline behavior when the dataset changes

This ADR is required because it introduces a new frontmatter field lifecycle (`volatileData`) and expands the semantics of the editorial freshness gate.

## Decision

We add a repository-level volatile data contract with four pieces:

1. A central registry in `src/config/editorial-volatile-data-registry.json`
2. A unified snapshot in `src/infrastructure/editorial/editorial-volatile-data.snapshot.json`
3. A refresh script `scripts/refresh-editorial-volatile-data.mjs`
4. An extended editorial gate in `scripts/check-editorial-timeliness.mjs`

## Contract

Articles may now declare:

```yaml
volatileData:
  - id: "pensions.afp.uno_commission"
    sync: strict
    expectedValue: 0.46
```

Rules:

- `id` must exist in the central registry.
- `sync: reference` means the article depends on the dataset but does not require value-equality blocking.
- `sync: strict` means the article must remain aligned with the snapshot's `reviewTriggerDate`, and when `expectedValue` is present it must equal the snapshot value.

## Snapshot semantics

Each dataset stores:

- `value`
- `lastObservedAt`
- `reviewTriggerDate`
- source metadata

`reviewTriggerDate` is the date that should force editorial refresh when the value changes materially. If a snapshot is observed again and the value is unchanged, the previous `reviewTriggerDate` is preserved.

This prevents false alarms from recurring refreshes where the source was checked but the underlying value did not change.

## Initial automated sources

- `mindicador.cl/api` via the existing economic snapshot
- `spensiones.cl` for:
  - AFP worker mandatory contribution (`10%`)
  - AFP Uno commission (`0.46%`, effective `2025-10-01`)

## Consequences

Positive:

- CI can now fail on real dataset drift, not only on elapsed time.
- Editorial review becomes traceable at claim level for sensitive numbers.
- Scheduled refresh can open PRs with updated snapshots before content diverges silently.

Tradeoffs:

- Articles with volatile claims now require frontmatter maintenance via `volatileData`.
- Not every volatile domain has an automated extractor yet; manual-review datasets still rely on SLA plus explicit source ownership until a source adapter exists.

## Enforcement

- `pnpm run editorial:volatile-data:refresh`
- `pnpm run check:frontmatter`
- `pnpm run check:editorial-timeliness`
- Scheduled workflow `refresh-economic-snapshot.yml` now refreshes both runtime economic and editorial volatile snapshots

## Rollback

Rollback requires:

1. Removing `volatileData` from content schema/frontmatter usage
2. Reverting `scripts/refresh-editorial-volatile-data.mjs`
3. Reverting the timeliness drift checks
4. Restoring the snapshot refresh workflow to economic-only mode
