# Plan 023: Guardas contra paso vacío en gates de rutas/RSS + alerta Reddit atómica

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`. This plan contains TWO independent fixes (A: gate
> guards; B: reddit alert atomicity); they share no files and can be done in
> either order, but complete both before marking the plan DONE.
>
> **Drift check (run first)**:
> `git diff --stat 57ad5261..HEAD -- scripts/compare-routes.mjs scripts/compare-rss.mjs workers/reddit-mention-monitor/src/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug (defense-in-depth)
- **Planned at**: commit `57ad5261`, 2026-06-15

## Why this matters

**A — Vacuous gate pass.** `compare-routes.mjs` and `compare-rss.mjs` are
differential gates that protect repo hard-stops (`ROUTES.NO_SILENT_CHANGES`,
`RSS.NO_REMOVALS`): they fail when a route/RSS item is *removed*. But they only
detect removals relative to a baseline. If the baseline file is empty (a
generator silently produced zero entries), there is nothing to remove, so the
gate logs "OK" and passes — exactly when something is most wrong. A cheap
floor-guard ("refuse to pass with an empty baseline") closes this.

**B — Non-atomic Reddit alert.** The reddit-mention-monitor sends Discord alerts
in batches of 10, then marks all matched posts as "seen". If a later batch fails
(rate limit, network) after earlier batches were delivered, `postAlert` throws
**before** any post is marked seen, so on the next run the already-delivered
posts are alerted again — duplicate pings. Marking only the posts that were
actually delivered makes the retry correct.

## Current state

**`scripts/compare-routes.mjs`** loads two `Set`s and checks removals
(lines ~22–41):

```js
function loadRoutes(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  const routes = new Set(parsed.routes.map(entry => entry.route));
  return routes;
}

const beforeRoutes = loadRoutes(beforePath);
const afterRoutes = loadRoutes(afterPath);

const removed = [...beforeRoutes].filter(route => !afterRoutes.has(route)).sort();
const added = [...afterRoutes].filter(route => !beforeRoutes.has(route)).sort();

if (removed.length > 0) {
  console.error("[compare-routes] Removed routes detected:");
  // ...
  process.exit(1);
}
```

**`scripts/compare-rss.mjs`** is the same shape with arrays (lines ~41–62):

```js
const baselineItems = loadSnapshot(baselinePath);
const currentItems = loadSnapshot(currentPath);
// ...maps + removed/added...
if (removed.length > 0) { /* ...console.error... */ process.exit(1); }
```

**`workers/reddit-mention-monitor/src/discord.ts`** `postAlert` (lines ~52–74)
throws on a failed batch and returns `void`; `chunkEmbeds` (lines ~44–50) is
exported and unit-tested — **do not remove or change `chunkEmbeds`**:

```ts
export async function postAlert(
  webhookUrl: string,
  matches: Match[],
  timeoutMs = 10_000
): Promise<void> {
  if (matches.length === 0) return;
  const embeds = matches.map(buildEmbed);
  for (const batch of chunkEmbeds(embeds)) {
    const res = await fetch(webhookUrl, { /* ... embeds: batch ... */ });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Discord webhook failed (${res.status}): ${await res.text()}`);
    }
  }
}
```

**`workers/reddit-mention-monitor/src/index.ts`** marks seen only after a full
success (lines ~99–103):

```ts
  if (matches.length > 0) {
    await postAlert(env.DISCORD_WEBHOOK_URL, matches);
    // Mark seen only after a successful alert, so a Discord failure retries next run.
    await Promise.all(matches.map(m => markSeen(env.REDDIT_SEEN, m.post.id)));
  }
```

`markSeen(kv, id)` is in `dedup.ts`; `Match` has shape `{ post: { id, ... }, calculator, calculatorLabel }`. The `log(level, event, data)` helper is already imported in `index.ts`.

## Commands you will need

| Purpose       | Command                                                        | Expected on success |
|---------------|---------------------------------------------------------------|---------------------|
| Typecheck     | `pnpm exec astro check`                                        | 0 errors            |
| Worker tests  | `pnpm test -- tests/workers/reddit-mention-monitor`           | all pass (incl. new)|
| Full suite    | `pnpm test`                                                    | all pass            |
| Lint / format | `pnpm run lint` ; `pnpm run format:check`                      | exit 0              |
| Gate A smoke  | see Step 1/2 verify (run the script against an empty baseline) | exit code 1         |

## Scope

**In scope**:
- `scripts/compare-routes.mjs`
- `scripts/compare-rss.mjs`
- `workers/reddit-mention-monitor/src/discord.ts`
- `workers/reddit-mention-monitor/src/index.ts`
- `tests/workers/reddit-mention-monitor/logic.test.ts` (extend) OR a new
  sibling test file in that directory

**Out of scope** (do NOT touch):
- `chunkEmbeds` and `buildEmbed` in `discord.ts` — keep their signatures (tests
  depend on them).
- The economic-snapshot worker, the snapshot generators, or the route/RSS
  snapshot producers — only the *comparison* gates change.
- The committed baselines (`docs/reports/routes_snapshot_before.json`,
  `docs/reports/rss_snapshot.json`) — do not edit them.

## Git workflow

- Branch: `advisor/023-gate-floor-and-reddit-alert-atomicity`
- Commit per fix (A then B) or one commit; conventional-commit style:
  `fix: rechazar baseline vacío en gates y marcar seen sólo lo entregado (Plan 023)`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Floor-guard `compare-routes.mjs`

After `beforeRoutes` is loaded (and before computing `removed`), add:

```js
if (beforeRoutes.size === 0) {
  console.error(
    "[compare-routes] Baseline is empty — refusing to pass vacuously. " +
      "Regenerate the baseline snapshot before comparing."
  );
  process.exit(1);
}
```

**Verify** (the guard fires on an empty baseline):
```
printf '{"routes":[]}' > /tmp/empty-routes.json
printf '{"routes":[{"route":"/"}]}' > /tmp/after-routes.json
node scripts/compare-routes.mjs /tmp/empty-routes.json /tmp/after-routes.json; echo "exit=$?"
```
Expected: prints the "Baseline is empty" error and `exit=1`.

### Step 2: Floor-guard `compare-rss.mjs`

After `baselineItems` is loaded, add the equivalent guard:

```js
if (baselineItems.length === 0) {
  console.error(
    "[compare-rss] Baseline is empty — refusing to pass vacuously. " +
      "Regenerate the RSS snapshot before comparing."
  );
  process.exit(1);
}
```

**Verify**: confirm the new guard is present and `pnpm exec astro check` passes
(these are `.mjs` scripts; astro check won't lint them, so also run
`pnpm run lint` which covers `.mjs` per the repo eslint config).

### Step 3: Make `postAlert` report what it actually delivered

In `discord.ts`, change `postAlert` to chunk the **matches** (size 10), build
embeds per batch, and return the matches it successfully delivered plus any
error — instead of throwing mid-loop. Keep `chunkEmbeds`/`buildEmbed` as-is.

```ts
export interface PostAlertResult {
  delivered: Match[];
  error: Error | null;
}

export async function postAlert(
  webhookUrl: string,
  matches: Match[],
  timeoutMs = 10_000
): Promise<PostAlertResult> {
  const delivered: Match[] = [];
  if (matches.length === 0) return { delivered, error: null };

  for (let i = 0; i < matches.length; i += 10) {
    const batch = matches.slice(i, i + 10);
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        signal: AbortSignal.timeout(timeoutMs),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Monedario · escucha Reddit",
          embeds: batch.map(buildEmbed),
        }),
      });
      if (!res.ok && res.status !== 204) {
        return {
          delivered,
          error: new Error(`Discord webhook failed (${res.status}): ${await res.text()}`),
        };
      }
      delivered.push(...batch);
    } catch (err) {
      return { delivered, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }
  return { delivered, error: null };
}
```

### Step 4: Mark only delivered posts as seen

In `index.ts`, update the alert block to mark only delivered posts and log a
partial-failure warning instead of relying on a thrown error:

```ts
  if (matches.length > 0) {
    const { delivered, error } = await postAlert(env.DISCORD_WEBHOOK_URL, matches);
    await Promise.all(delivered.map(m => markSeen(env.REDDIT_SEEN, m.post.id)));
    if (error) {
      log("warn", "alert.partial_failure", {
        delivered: delivered.length,
        total: matches.length,
        message: error.message,
      });
    }
  }
```

If `run.complete`'s `alerted` field references `matches.length`, leave it — it
counts matches found this run; the new warning captures partial delivery.

**Verify**: `pnpm exec astro check` → 0 errors.

## Test plan

Add a new `tests/workers/reddit-mention-monitor/discord.test.ts`. **Heads-up:**
the existing reddit tests cover only pure functions (`normalizeListing`,
`passesFilter`, `chunkEmbeds`, `filterUnseen` with a fake KV) — there is **no
existing `fetch`-mock pattern to copy**. Stub the global `fetch` with Vitest
yourself, restoring it after each test. Construct `Match` objects matching the
shape the helpers use elsewhere (`{ post: { id, title, subreddit, score, permalink, ... }, calculator, calculatorLabel }` — see how `buildEmbed` is tested in `logic.test.ts` for a valid `Match`). Pattern:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { postAlert, type Match } from "../../../workers/reddit-mention-monitor/src/discord";

afterEach(() => vi.unstubAllGlobals());

function makeMatches(n: number): Match[] {
  return Array.from({ length: n }, (_, i) => ({
    post: { id: `t3_${i}`, title: `t${i}`, subreddit: "chile", score: 10, permalink: "https://example/" },
    calculator: "sueldo-liquido",
    calculatorLabel: "Sueldo líquido",
  })) as Match[];
}
```

Cases:
- **All batches succeed**: `vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 204 })))`;
  `postAlert(url, makeMatches(12))` → `delivered.length === 12`, `error === null`,
  fetch called twice (two batches of 10 + 2).
- **Second batch fails**: a `fetch` mock that returns `204` on the first call and
  `new Response("rate limited", { status: 429 })` on the second; `postAlert(url, makeMatches(15))`
  → `delivered.length === 10` (first batch only), `error` is truthy.
- **Empty matches**: `postAlert(url, [])` → `{ delivered: [], error: null }`,
  fetch not called.

(If a `Match` field is required that the snippet omits, read `buildEmbed` in
`discord.ts` to see exactly which `post` fields it reads, and include those.)

Verification: `pnpm test -- tests/workers/reddit-mention-monitor` → all pass
incl. new cases; `pnpm test` → full suite green.

## Done criteria

ALL must hold:

- [ ] `compare-routes.mjs` exits 1 on an empty baseline (Step 1 smoke shows `exit=1`)
- [ ] `compare-rss.mjs` has the equivalent empty-baseline guard
- [ ] `postAlert` returns `{ delivered, error }` and never throws on a batch HTTP failure
- [ ] `index.ts` marks seen only `delivered` and logs `alert.partial_failure` on error
- [ ] `chunkEmbeds`/`buildEmbed` signatures unchanged (existing tests still pass)
- [ ] New reddit tests cover full-success, mid-batch-failure, and empty cases
- [ ] `pnpm exec astro check`, `pnpm test`, `pnpm run lint`, `pnpm run format:check` exit 0
- [ ] Only in-scope files modified/created (`git status`)
- [ ] `plans/README.md` status row for 023 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The "Current state" excerpts don't match the live files (drift).
- A test currently asserts that `postAlert` returns `void` or throws — report it;
  it must be updated to the new contract, but confirm there are no *other*
  callers of `postAlert` beyond `index.ts` first (`grep -rn "postAlert" workers/ tests/`).
- The empty-baseline guard would break an existing legitimate workflow (e.g. a
  documented "first run with no baseline" path) — report rather than forcing it.
- Any verification fails twice after a reasonable fix attempt.

## Maintenance notes

- For the reviewer: fix B changes `postAlert`'s contract from throw-on-failure to
  return-`{delivered,error}`. Confirm `index.ts` is the only caller and that the
  partial-failure path now logs (`alert.partial_failure`) so a silently-degraded
  worker is still observable. The behavioral guarantee: a post is marked seen
  **iff** its batch was delivered, so undelivered posts retry next run without
  re-alerting delivered ones.
- Fix A's guard assumes a non-empty baseline is always correct. If the project
  ever intentionally ships an empty route/RSS surface, this guard must be
  revisited.
