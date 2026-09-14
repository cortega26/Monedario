# Plan 102: Serve UF history by range and stop importing 638 KB for two dates

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cee0b53f..HEAD -- src/pages/api/uf-historico-lookup.json.ts src/pages/calculadoras/conversor-uf.astro src/pages/uf-hoy.astro src/data/economic-history/ scripts/fetch-economic-history.mjs`
> On mismatch with "Current state", STOP. (NOTE: the original check also
> covered `tests/`; reconciled to drop it — the only `tests/` movement since
> planning is unrelated suites from plans 097–104, and this plan's tests are
> new files. If a same-named endpoint/client test appears, treat as drift.)

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `0e506a8b`, 2026-09-14
- **Reconciled at**: commit `cee0b53f`, 2026-09-14 — in-scope source files
  untouched since planning (drift empty; `tests/` movement is unrelated
  suites from 097–104); excerpts re-read against live code, both findings
  intact; three reconciliation notes inline (entry count, writer lines,
  uf-hoy SSG constraint)
- **Issue**: —

## Why this matters

Two payload problems share one 638 KB source. The `uf-historico-lookup.json`
endpoint builds the full `{fecha: valor}` map (~9,600 keys, 211,968 bytes in
`dist/`) on every request/build, and the conversor-uf client downloads and
parses all of it to resolve one date (+7-day fallback). Separately,
`conversor-uf.astro` and `uf-hoy.astro` import the entire
`uf-historico.json` (638,325 bytes) into the Astro SSR module graph for two
boundary strings (first/last) — paid twice plus a third full import in the
API route itself. A `?date=` single-row response plus a tiny generated
`first/last/count` sidecar removes ~99% of the transfer and the build-time
parse triplication without changing any figure.

## Current state

Files and roles:

- `src/pages/api/uf-historico-lookup.json.ts:1-55` — full-map endpoint
- `src/pages/calculadoras/conversor-uf.astro:21,27-35,547` — full import +
  full-file `fetch` + `res.json()`
- `src/pages/uf-hoy.astro:13,20-27` — full import, keeps ~60 monthly points
  via double `.filter`
- `src/data/economic-history/uf-historico.json` — 638,325-byte source
  (measured 9,685 entries, `2000-01-01` → `2026-07-09`; file shape
  `{fuente, ..., desdeFecha, hastaFecha, totalEntradas, serie}` — the
  sidecar can derive straight from `desdeFecha/hastaFecha/totalEntradas`)
- `scripts/fetch-economic-history.mjs:138-148` — data-fetch writer (files
  array `:138-142`, write loop `:144-148`; sidecar home)
- `src/application/use-cases/LookupHistoricalUf.ts:62-77` — 7-day fallback
  logic (exact match + up-to-7-days-backward loop over a `lookup` map;
  stays client-side AND plan-unchanged)

Excerpts as of `cee0b53f` (re-read; in-scope sources byte-identical to planning):

```ts
// src/pages/api/uf-historico-lookup.json.ts:2
import ufHistoricoRaw from "@/data/economic-history/uf-historico.json";
// :23-26
const lookup: Record<string, number> = {};
for (const entry of serie) {
  lookup[entry.fecha] = entry.valor;
}
```

```ts
// src/pages/api/uf-historico-lookup.json.ts:49-54
return new Response(JSON.stringify({ lookup, first, last }), {
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
  },
});
```

`conversor-uf.astro:21` imports the full JSON; only `serie[0]`/`.at(-1)`
are used at `:27-28,34-35` (min/max input attrs); client `:542-554`
fetches the endpoint once then `await res.json()` over the whole map, and
`:570-577+` resolves via the map (`const { lookup, first, last } =
historicData`, `HistoricoData` type at `:521-525`). Source 638,325 bytes;
built lookup ~212 KB.

Conventions: API routes are Astro `APIRoute`; `Cache-Control: public,
max-age=86400` is the established caching idiom here; `trailingSlash:
"always"` for internal links (no URL change in this plan); no new indexable
URL (query params on an existing endpoint are not new routes — keep it that
way); conventional commits.

## Commands you will need

| Purpose | Command | Provenance | Expected on success |
|---|---|---|---|
| Install | `pnpm install --frozen-lockfile` | declared | exit 0 |
| Typecheck | `pnpm run astro check` | declared | exit 0 |
| Unit tests | `pnpm run test` | declared | all pass |
| Lint (scoped) | `pnpm exec eslint src/pages/api/uf-historico-lookup.json.ts src/pages/calculadoras/conversor-uf.astro src/pages/uf-hoy.astro scripts/fetch-economic-history.mjs` | declared | exit 0 |

## Scope

**In scope**:

- `src/pages/api/uf-historico-lookup.json.ts` (add `?date=`/`?from=&to=`; keep full file as legacy default)
- `src/pages/calculadoras/conversor-uf.astro` (use range query + sidecar)
- `src/pages/uf-hoy.astro` (use sidecar for first/last; keep monthly filter)
- `scripts/fetch-economic-history.mjs` (emit `uf-rango.json` `{first,last,count}`)
- `src/data/economic-history/uf-rango.json` (create, generated)
- Tests for the endpoint + client fallback (new or extended)

**Out of scope**:

- Changing any UF value, the 7-day fallback rule (`LookupHistoricalUf.ts`
  logic stays), cache durations, response `Cache-Control` semantics beyond
  reusing them, new routes/pages, title/meta changes (OBS-01 freeze on
  conversor surfaces — do not touch `<title>`/description/H1).

## Git workflow

- Branch: `advisor/102-uf-history-range`
- Commits: e.g. `perf(uf-historico): range query plus first/last sidecar`
- Do NOT push/PR unless instructed.

## Steps

### Step 0: Green baseline

Install, `astro check`, unit tests unmodified. Record. `declared` failure on
clean tree → STOP + report.

**Verify**: all pass unmodified.

### Step 1: Emit the tiny sidecar at data-fetch time

In `scripts/fetch-economic-history.mjs` (around `:139-141`), write
`src/data/economic-history/uf-rango.json` as `{first, last, count}` derived
from the same `serie` that produces `uf-historico.json`. Regenerate once and
commit the sidecar.

**Verify**: `cat src/data/economic-history/uf-rango.json` shows three fields
matching `serie[0].fecha`, `serie.at(-1).fecha`, `serie.length`.

### Step 2: Add the range query, keep legacy default

Extend the endpoint: `?date=YYYY-MM-DD` returns the single row (with the
same 7-day-backward fallback the client currently implements? No — keep
fallback client-side per `LookupHistoricalUf.ts:64`; the endpoint returns the
exact row or 404-with-nearest-metadata, documented). `?from=&to=` returns the
bounded slice. No params → legacy full `{lookup, first, last}` unchanged.
Same `Content-Type` + `Cache-Control`. Validate date format (400 on garbage).

**Verify**: `astro check` exit 0; new endpoint tests pass (see Test plan).

### Step 3: Switch the two pages to sidecar + range query

`conversor-uf.astro`: replace the full-JSON import (`:21`) with the
sidecar import for first/last (`:27-28,34-35`); rework the client
(`:521-554,570+`) from fetch-once-full-map to `fetch(endpoint + "?date=" +
iso)` per candidate date, keeping the 7-day client fallback loop bounded
to 8 tries (reshape the `HistoricoData` type at `:521-525` accordingly —
same file, in scope).
RECONCILIATION NOTE (uf-hoy SSG constraint): `uf-hoy.astro` frontmatter
executes at BUILD time (SSG) — it CANNOT fetch its own API route. So the
`?from=&to=` path is for the conversor CLIENT only. For uf-hoy's ~60
monthly chart points choose: (i) a second tiny sidecar (e.g. monthly
`{fecha,valor}` points emitted by the fetch script — additive, same step,
preferred), or (ii) keep the ONE full import in uf-hoy with a comment
(the plan's documented fallback). Do not attempt build-time self-fetch.

**Verify**: `astro check` + unit tests pass; `grep -n "uf-historico.json" src/pages/calculadoras/conversor-uf.astro src/pages/uf-hoy.astro` → only the API route (or documented single remaining) imports the full serie.

## Test plan

- Endpoint tests (new file or extended suite, model on existing API-route
  tests): full legacy shape unchanged; `?date=` hit/miss/400; `?from=&to=`
  slice bounds; cache headers preserved; empty-serie 503 preserved.
- Client: fallback sequence still resolves within 7 days (unit-test the URL
  builder + fallback loop against a stubbed fetch).
- Verification: `pnpm run test` → all pass including new tests.

## Done criteria

- [ ] `uf-rango.json` exists, generated by the fetch script, committed
- [ ] `?date=`/`?from=&to=` work; legacy no-param shape byte-compatible
- [ ] Neither page parses 638 KB for two strings (grep-clean per Step 3)
- [ ] `astro check`, `pnpm run test`, scoped eslint all green
- [ ] No title/meta/H1/route change (`git diff` shows none in those blocks)
- [ ] Diff lists only in-scope files; `plans/README.md` updated

## STOP conditions

- Drift; double verification failure; out-of-scope touch needed (fallback-rule
  change, cache-semantics change, new route); assumption false (monthly table
  genuinely needs the full serie in SSR — then keep one full import, document,
  and still ship the `?date=` path); `declared` baseline broken.

## Maintenance notes

- If new historical series (ipc/utm) adopt this pattern, copy the
  sidecar + range-query shape — do not triplicate full imports again.
- Reviewer: check the 8-try client fallback can't fan out into 8 full
  downloads (it must hit the range endpoint per try).
- **Deferred:** per-year shards / CDN edge caching — only if range queries
  prove insufficient; not in this plan.
