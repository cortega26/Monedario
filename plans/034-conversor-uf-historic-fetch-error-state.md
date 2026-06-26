# Plan 034: Mostrar un error real (no «Cargando…» eterno) cuando falla la carga del histórico UF

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> anything in "STOP conditions" occurs, stop and report — do not improvise. When
> done, update the status row in `plans/README.md` (and follow the repo's
> atomic-close/archive policy there) — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat a7bb8b2e..HEAD -- src/pages/calculadoras/conversor-uf.astro`
> If the file changed since this plan was written, compare the "Current state"
> excerpt against the live code before proceeding; on a mismatch, STOP.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug (UX correctness)
- **Planned at**: commit `a7bb8b2e`, 2026-06-26

## Why this matters

On the UF converter, the historical-lookup feature fetches a prerendered JSON
dataset on demand. If that fetch fails (offline, 404, 5xx), the `catch` block
swallows the error and the UI shows the message **"Cargando datos históricos…"**
indefinitely — a permanent fake loading state with no way for the user to
understand that the load failed or what to do. The change handler already
`await`s the load before rendering, so by the time the message is shown the fetch
has already settled: reaching the empty-data branch always means *failure*, never
*in progress*. The message is simply mislabeled. This is a small, contained fix
that turns a stuck spinner into an honest, actionable error.

## Current state

File: `src/pages/calculadoras/conversor-uf.astro` — a calculator page with an
inline client `<script>`. Relevant region:

`conversor-uf.astro:533-543` (the loader; empty catch):
```ts
  async function loadHistoricData(): Promise<void> {
    if (historicData) return;
    const endpoint = fechaInput?.dataset.historicoEndpoint;
    if (!endpoint) return;
    try {
      const res = await fetch(endpoint);
      historicData = (await res.json()) as HistoricoData;
    } catch {
      // si falla el fetch, buscarUfHistorica mostrará el error
    }
  }
```

`conversor-uf.astro:559-564` (the mislabeled branch):
```ts
  function buscarUfHistorica(date: string): void {
    if (!historicData) {
      resHistoricoError.textContent = "Cargando datos históricos…";
      resHistoricoError.classList.remove("hidden");
      return;
    }
```

`conversor-uf.astro:619-623` (the only caller — awaits the load first):
```ts
  fechaInput?.addEventListener("change", async () => {
    if (!fechaInput.value) return;
    await loadHistoricData();
    buscarUfHistorica(fechaInput.value);
  });
```

`resHistoricoError` is `document.getElementById("resultado-historico-error")`
(declared at lines 529-531). The focus listener (lines 546-552) only warms the
cache; it does not call `buscarUfHistorica`.

Repo conventions:
- Inline calculator scripts are plain TypeScript in `<script>` blocks; keep the
  existing style (no new imports, no framework).
- Reader-facing copy is neutral Chilean Spanish. There is a copy gate
  (`pnpm run check:reader-facing-copy`) — run it after editing user-visible text.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Typecheck | `pnpm exec astro check` | 0 errors |
| Lint | `pnpm exec eslint src/pages/calculadoras/conversor-uf.astro` | exit 0 |
| Format | `pnpm exec prettier --check src/pages/calculadoras/conversor-uf.astro` | exit 0 |
| Reader copy gate | `pnpm run check:reader-facing-copy` | exit 0 |
| Manual check | `pnpm run dev`, open `/calculadoras/conversor-uf/`, then simulate a failed load (see Test plan) | error message shown, not a spinner |

## Scope

**In scope** (only this file):
- `src/pages/calculadoras/conversor-uf.astro`

**Out of scope** (do NOT touch):
- The historic-UF API endpoint (`src/pages/api/uf-historico-lookup.json.ts`) — it
  works; this is a client-side error-handling fix.
- The other lookup branches (date-range / no-data-for-date messages at lines
  ~570-603) — they are already correct.
- Any other calculator. The empty-catch pattern elsewhere is out of scope here.

## Git workflow

- Branch: `advisor/034-conversor-uf-error-state`
- Conventional commit, e.g.
  `fix(calc): mostrar error real cuando falla la carga del histórico UF`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Record load failure in the loader

In `loadHistoricData()`, treat a non-OK HTTP response as a failure too, and reset
the warmed promise so a later attempt can retry. Replace the body:
```ts
  async function loadHistoricData(): Promise<void> {
    if (historicData) return;
    const endpoint = fechaInput?.dataset.historicoEndpoint;
    if (!endpoint) return;
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      historicData = (await res.json()) as HistoricoData;
    } catch {
      historicData = null;
      historicFetchPromise = null; // permite reintentar en el próximo change
    }
  }
```

**Verify**: `pnpm exec astro check` → 0 errors.

### Step 2: Replace the mislabeled "loading" message with a real error

In `buscarUfHistorica()`, change the empty-data branch so it states the load
failed and what to do (the caller awaits the load, so empty data here = failure):
```ts
  function buscarUfHistorica(date: string): void {
    if (!historicData) {
      resHistoricoError.textContent =
        "No pudimos cargar los datos históricos. Revisa tu conexión e inténtalo nuevamente.";
      resHistoricoError.classList.remove("hidden");
      return;
    }
```

**Verify**:
`grep -n "No pudimos cargar los datos históricos" src/pages/calculadoras/conversor-uf.astro` → one match.
`grep -n "Cargando datos históricos" src/pages/calculadoras/conversor-uf.astro` → no matches.

### Step 3: Lint, format, copy gate

**Verify**:
`pnpm exec eslint src/pages/calculadoras/conversor-uf.astro` → exit 0
`pnpm exec prettier --check src/pages/calculadoras/conversor-uf.astro` → exit 0 (run `--write` then re-check if it drifts)
`pnpm run check:reader-facing-copy` → exit 0

## Test plan

This is inline client-script logic; the repo has no unit harness for these
`<script>` blocks (consistent with how the other calculators are structured), so
verification is manual + gate-based:

1. `pnpm run dev`, open `/calculadoras/conversor-uf/`.
2. In DevTools, block the historic endpoint (Network → block request URL matching
   the `data-historico-endpoint` value, or set the Network panel to Offline),
   then pick a date in the «UF histórica» field to fire the `change` handler.
3. Confirm the UI shows **"No pudimos cargar los datos históricos. Revisa tu
   conexión e inténtalo nuevamente."** and NOT a persistent "Cargando…".
4. Un-block / go back Online, pick a date again, and confirm a value renders
   (the retry path works because `historicFetchPromise` was reset).

If a dev server cannot be run in the environment, STOP and report that the manual
behavior could not be confirmed; the grep checks in Step 2 verify the copy change
but not the runtime behavior.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm exec astro check` exits 0
- [ ] `grep -c "Cargando datos históricos" src/pages/calculadoras/conversor-uf.astro` → 0
- [ ] `grep -c "No pudimos cargar los datos históricos" src/pages/calculadoras/conversor-uf.astro` → 1
- [ ] `loadHistoricData` checks `res.ok` and resets `historicFetchPromise` on failure
- [ ] eslint + prettier + `check:reader-facing-copy` exit 0
- [ ] Manual failure→error and recovery→value confirmed (or STOP per Test plan)
- [ ] No files outside `conversor-uf.astro` modified (`git status`)
- [ ] `plans/README.md` status row updated (and archive policy followed)

## STOP conditions

Stop and report back (do not improvise) if:
- The "Current state" excerpts don't match the live code (drift since planning).
- `buscarUfHistorica` has gained a non-awaiting caller (e.g. it's now invoked
  before `loadHistoricData` resolves) — then the empty-data branch could
  legitimately mean "still loading" and this message change would be wrong.
  Report so the branch can distinguish loading vs. failed explicitly.
- The reader-copy gate rejects the new message — adjust wording to satisfy it and
  note what changed.

## Maintenance notes

- Minor follow-up deliberately left out: the `change` handler calls
  `loadHistoricData()` directly while the focus listener may already have a fetch
  in flight, so two fetches can race on first use. Harmless (idempotent GET), but
  if this is ever tidied, have the `change` handler await the shared
  `historicFetchPromise` instead of starting a new load.
- If the historic-lookup feature gains its own test harness, add a regression
  test for the failed-fetch → error-message path.
- Reviewer should confirm the message is announced to assistive tech: the
  `#resultado-historico-error` element should already be a polite/assertive live
  region or be reachable — verify it during review (out of scope to add here).
