# Plan 039: Reparar la instrumentación del embudo de calculadoras (views ausentes, completes sobre-contados, evento typo)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 520a8685..HEAD -- src/scripts/analytics.ts src/utils/sueldo-liquido/formController.ts src/utils/analytics.ts`
> If any changed since this plan was written, compare the "Current state"
> excerpts against the live code before proceeding; on a mismatch, treat it as a
> STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `520a8685`, 2026-07-10

## Why this matters

The first-party analytics exist to steer "calculator-led growth", but the
weekly export shows the funnel is not measurable. From
`output/operations/data-signals/analytics/2026-W27.json` and its scorecard:

- **`calculator_view` = 0** across all 21 active calculators for two straight
  weeks, despite ~16,000 CDN pageviews/week — so start-rate and landing→start
  drop-off (the top of the funnel) cannot be computed.
- **completes > starts everywhere** (e.g. sueldo-liquido: 105 completes vs 30
  starts on 2026-07-02; scorecard renders "completion rate 340%"). A completion
  rate above 100% is impossible for a real funnel — the metric is noise.
- A **typo'd event `calculator_completed`** is emitted but is not in the event
  allowlist, so it is silently dropped (dead events).

Two of these have concrete, static root causes (fixed here); the third
(`view = 0`) is a runtime defect that needs diagnosis (a clearly-scoped spike
step that must NOT block the two certain fixes).

## Current state

**Defect B — `calculator_complete` fires on every recalculation.**
`src/utils/sueldo-liquido/formController.ts` recalculates on every keystroke —
input listeners re-run `handleCalculate` (around lines 583, 597-598):

```ts
  document.getElementById("sueldo")?.addEventListener("input", () => { /* recalculates */ });
  // ── Re-calcular cuando cambia el imponible ──
  document.getElementById("sueldo-imponible")?.addEventListener("input", () => { /* recalculates */ });
```

`handleCalculate` emits `calculator_complete` on each success (lines ~297 and
~410), so a user who edits an input five times generates five "completes" but
one "start". Additionally, `src/scripts/calculator-prefill.ts` dispatches
synthetic `input`/`change` events on page load (lines 68-69, 80-81, 137-138),
which auto-triggers the calculation and emits **another** `calculator_complete`
before any human interaction. This is why completes ≫ starts.

**Defect C — typo'd event.** Same file, right after each real complete (lines
~303 and ~416):

```ts
    trackAnalyticsEvent("calculator_complete", { calculator_slug: "sueldo-liquido", /* … */ });
    trackAnalyticsEvent("calculator_completed", { calculator_slug: "sueldo-liquido" });
```

`calculator_completed` (past tense) is not a key in `EVENT_ALLOWLIST`
(`src/utils/analytics.ts`), so `sanitizeAnalyticsEvent` returns `null` and the
transport drops it. Dead code that only adds noise.

**The transport path (shared by all events).** `src/scripts/analytics.ts`:

```ts
function track(eventName, params = {}) {
  // … pushes to dataLayer …
  sendAnalyticsEvent(eventName, params);   // first-party transport
}

function sendAnalyticsEvent(eventName, params) {
  if (!isTransportEnabled()) return;                 // Gate 1 (flag)
  if (!isTransmissibleEvent(eventName)) return;      // Gate 2 (allowlist)
  const sanitized = sanitizeAnalyticsEvent(eventName, params);  // Gate 3
  if (!sanitized) return;
  // … fetch POST /api/analytics/event, keepalive, silent-fail …
}
```

The transport flag is enabled in the SSR HTML
(`src/config.ts:30 analyticsTransport: true` → `src/layouts/Layout.astro:139`
sets `data-analytics-transport="enabled"` on `<html>`), so transport is on from
first paint. `calculator_view` is emitted once per calculator page from
`initCalculatorStartTracking` (lines 204-210), guarded by an element attribute
`data-analytics-calculator-view-tracked` that is set only at runtime (it is NOT
in any SSR HTML — verified). Yet the event never lands. **The cause is not
determinable from static reading** — Step 1 is a diagnosis.

**Repo convention**: browser analytics logic lives in `src/scripts/analytics.ts`
and `src/utils/analytics.ts`; integration tests live in
`tests/integration/analytics-*.test.ts` (happy-dom). Match those.

## Commands you will need

| Purpose            | Command                                                   | Expected              |
|--------------------|-----------------------------------------------------------|-----------------------|
| Analytics tests    | `pnpm exec vitest run tests/integration/analytics-script.test.ts tests/integration/analytics-sanitizer.test.ts` | all pass, incl. new |
| Full unit tests    | `pnpm test`                                               | exit 0                |
| Typecheck          | `astro check`                                             | 0 errors              |
| Lint (scoped)      | `pnpm exec eslint src/scripts/analytics.ts src/utils/sueldo-liquido/formController.ts` | exit 0 |
| Format             | `pnpm run format:check`                                   | exit 0                |
| Local dev (spike)  | `pnpm run dev`                                            | server on :4321       |

## Scope

**In scope**:
- `src/scripts/analytics.ts` (add once-per-view dedup for `calculator_complete`; the view fix IF Step 1 points here)
- `src/utils/sueldo-liquido/formController.ts` (remove the two `calculator_completed` emissions)
- `tests/integration/analytics-script.test.ts` (add dedup test)
- Possibly one more file **only** if Step 1's diagnosis proves the view fix lives there — if so, STOP and report the file first.

**Out of scope**:
- The 22 calculator page controllers' own emission logic — do NOT edit each page;
  the dedup is centralized in the transport layer.
- The worker (`workers/analytics-collector/`) — do not change server validation
  here (plans 036-038 own it).
- `calculator-prefill.ts` behavior — leave prefill as is; the dedup handles the
  extra emission it triggers.

## Git workflow

- Branch: `advisor/039-calculator-funnel-instrumentation`
- Conventional commits, e.g. `fix(analytics): dedupe calculator_complete y quitar evento typo`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1 (SPIKE — diagnose `calculator_view = 0`; time-box to ~1h)

Run `pnpm run dev`, open a calculator page (e.g. `/calculadoras/sueldo-liquido/`)
with DevTools open (Network + Console). The transport flag is already enabled in
prod HTML; confirm `<html data-analytics-transport="enabled">` in the dev page
too (if absent in dev, set `window.__monedarioAnalyticsTransport = true` in the
console before reloading). Then determine which of these is true:

- **H1 — the POST never fires for `calculator_view`.** Add a temporary
  `console.debug` at the top of `sendAnalyticsEvent` logging `eventName`; reload.
  If `calculator_view` never reaches `sendAnalyticsEvent`, the bug is in
  `initCalculatorStartTracking` (e.g. the idle callback or the
  `data-analytics-calculator-view-tracked` guard). If it reaches it but no POST
  goes out, log which gate returns.
- **H2 — the POST fires but the Worker rejects it.** Watch the Network tab for
  `POST /api/analytics/event` with the `calculator_view` body; check the status
  (202 = accepted; 422 = rejected). If 422, the payload shape is wrong.
- **H3 — Astro view-transition reuse.** Navigate away and back via an internal
  link (soft nav) and check whether `calculator_view` fires on the second visit.

Apply the **minimal** fix for whichever hypothesis holds, in
`src/scripts/analytics.ts` (H1/H3) — do not touch 22 pages. Remove your temporary
`console.debug` before finishing (the repo lints `no-console`).

**STOP and report** if: the cause lies outside H1-H3, or the fix would require
editing the Worker or every calculator page. In that case, land Steps 2-3 (which
are independent and certain) and report the view diagnosis separately — do **not**
let the view fix block them.

**Verify (if fixed)**: with the fix applied, loading a calculator page produces
exactly one `POST /api/analytics/event` with a `calculator_view` body returning
202.

### Step 2: Dedupe `calculator_complete` to once per page-view (transport layer)

In `src/scripts/analytics.ts`, add a per-page-view dedup so a terminal event is
transmitted at most once per calculator per page-view (recalcs and prefill-driven
recomputes no longer inflate the count). Add near the module state:

```ts
const ONCE_PER_VIEW_EVENTS = new Set(["calculator_complete"]);
let sentOncePerView = new Set<string>();
function resetOncePerViewDedup() {
  sentOncePerView = new Set();
}
```

In `sendAnalyticsEvent`, after the transmissible-event gate and before the
sanitize gate, add:

```ts
  if (ONCE_PER_VIEW_EVENTS.has(eventName)) {
    const slug = String(
      (params as Record<string, unknown>).calculator_slug ?? "",
    );
    const dedupKey = `${eventName}:${slug}`;
    if (sentOncePerView.has(dedupKey)) return;
    sentOncePerView.add(dedupKey);
  }
```

Reset the dedup on each new page-view. Change the navigation listeners at the
bottom of the file so they reset first:

```ts
document.addEventListener("astro:page-load", () => {
  resetOncePerViewDedup();
  scheduleAnalyticsInit();
});
document.addEventListener("astro:after-swap", () => {
  resetOncePerViewDedup();
  scheduleAnalyticsInit();
});
```

**Verify**: `astro check` → 0 errors; `pnpm exec eslint src/scripts/analytics.ts` → exit 0.

### Step 3: Remove the `calculator_completed` typo emissions

In `src/utils/sueldo-liquido/formController.ts`, delete the two
`trackAnalyticsEvent("calculator_completed", { … })` calls (around lines 303 and
416). Leave the adjacent real `calculator_complete` calls intact.

**Verify**: `grep -n "calculator_completed" src/` → **no matches**.

### Step 4: Tests

In `tests/integration/analytics-script.test.ts` (model on its existing cases),
add a test that drives the transport with the flag enabled and asserts:

- Emitting `calculator_complete` for the same `calculator_slug` twice in one
  page-view results in **one** POST (dedup).
- Emitting it again after an `astro:page-load` event (which calls
  `resetOncePerViewDedup`) results in a new POST.
- `calculator_start` is **not** deduped (two starts → the transport is invoked
  each time; assert it is not in `ONCE_PER_VIEW_EVENTS`).

If Step 1 produced a view fix, add a test asserting `calculator_view` reaches the
transport for a calculator page.

**Verify**: `pnpm exec vitest run tests/integration/analytics-script.test.ts` → all pass.

## Test plan

- New dedup tests as above. The "same slug twice → one POST" case is the
  regression guard against completion-rate > 100%.
- Verification: `pnpm test` → exit 0; `astro check` → 0 errors.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -n "calculator_completed" src/` → no matches.
- [ ] `grep -n "ONCE_PER_VIEW_EVENTS\|resetOncePerViewDedup" src/scripts/analytics.ts` → shows the dedup added and reset wired into both nav listeners.
- [ ] `grep -rn "console\." src/scripts/analytics.ts` → no leftover debug logging from Step 1.
- [ ] `pnpm test` exits 0 with the new dedup tests passing.
- [ ] `astro check` → 0 errors; scoped eslint exits 0; `pnpm run format:check` exits 0.
- [ ] Step 1 outcome recorded in the PR description: either the view fix (with the confirmed hypothesis) or a "view still 0 — diagnosis: …" report if it hit a STOP.
- [ ] `git status` shows only in-scope files modified.
- [ ] `plans/README.md` status row for 039 updated.

## STOP conditions

Stop and report back (do not improvise) if:

- The `sendAnalyticsEvent` / `initCalculatorStartTracking` code no longer matches
  the "Current state" excerpts.
- Step 1's view cause is outside H1-H3 or needs Worker/all-pages edits — land
  Steps 2-4 and report view separately.
- Deduping `calculator_complete` would suppress a genuinely-distinct completion
  the product wants counted (if so, the right move is a separate
  `calculator_recalculate` event — report, don't invent it here).
- Any verification fails twice after a reasonable fix attempt.

## Maintenance notes

- Once views land and completes are deduped, the scorecard's start-rate and
  completion-rate become meaningful for the first time — expect completion rate
  to drop below 100%. Sanity-check the next weekly export after deploy.
- `calculator-prefill.ts` will keep dispatching synthetic `input` events on load;
  that is fine — the dedup absorbs the extra `calculator_complete`, and prefilled
  auto-calc is intended UX. (It is also the load-time CLS source addressed by
  plan 041 on `impuesto-segunda-categoria`.)
- If recalculation volume ever becomes a desired signal, add a distinct
  `calculator_recalculate` event rather than un-deduping `calculator_complete`.
