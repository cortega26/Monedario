# Plan 027: Reemplazar la fecha de vigencia hardcodeada del refresco AFP por un extractor genérico

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 9a4eb37d..HEAD -- scripts/refresh-editorial-volatile-data.mjs`
> If that file changed since this plan was written, compare the "Current state"
> excerpts against the live code before proceeding; on a mismatch, treat it as a
> STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `9a4eb37d`, 2026-06-19

## Why this matters

`scripts/refresh-editorial-volatile-data.mjs` keeps the AFP-Uno commission and
its legal effective date fresh by scraping the Superintendencia de Pensiones
news page. But the effective-date extraction is pinned to a **literal date
string** — `A partir de hoy, miércoles 1 de octubre de 2025` — and the resulting
`effectiveDate` is the hardcoded literal `"2025-10-01"`. AFP-Uno won its bid with
a **scheduled commission ramp**, so the next commission step will publish a page
with a *different* date. When that happens the regex won't match, the script
throws "Unable to extract AFP Uno effective date", and `fetchAfpDatasetsWithFallback`
silently swallows the throw and **retains the previous (now stale) snapshot
values**. The one event this refresher exists to capture — an AFP commission
change — is exactly the event it will silently drop. On a YMYL finance site that
ships a wrong commission figure to readers.

This replaces the literal-date match with a generic Spanish long-date extractor,
in a pure, importable, unit-tested helper module.

## Current state

`scripts/refresh-editorial-volatile-data.mjs` is a Node ESM script. It defines
`extractAfpUnoDataset(html, overviewHtml, registry, previousSnapshot, observedAt)`,
whose date logic is the bug. The relevant excerpt (lines ~163–192):

```js
function extractAfpUnoDataset(html, overviewHtml, registry, previousSnapshot, observedAt) {
  const title = extractTitle(html) ?? "Superintendencia de Pensiones";
  const commissionMatch = html.match(
    /nueva comisión de\s*(\d+(?:,\d+)?)%\s*se aplicará/i
  );
  const previousCommissionMatch = html.match(
    /hasta ayer.*?comisión de\s*(\d+(?:,\d+)?)%/i
  );
  const effectiveDateMatch = html.match(
    /A partir de hoy,\s*miércoles\s*1\s*de\s*octubre\s*de\s*2025/i
  );
  const overviewContributionMatch = overviewHtml.match(
    /Cotización obligatoria<\/strong>\s*del\s*10%/i
  );

  if (!commissionMatch) {
    throw new Error("Unable to extract AFP Uno commission from official source.");
  }
  if (!effectiveDateMatch) {
    throw new Error("Unable to extract AFP Uno effective date from official source.");
  }
  if (!overviewContributionMatch) {
    throw new Error("Unable to confirm mandatory AFP contribution from overview source.");
  }

  const commission = Number(normalizeNumericString(commissionMatch[1]));
  const previousCommission = previousCommissionMatch
    ? Number(normalizeNumericString(previousCommissionMatch[1]))
    : null;
  const effectiveDate = "2025-10-01";
  // ... effectiveDate is then used in resolveReviewTriggerDate() and stored
  //     in the "pensions.afp.uno_commission" dataset (lines ~212–228).
}
```

The two problem lines are the `effectiveDateMatch` regex (hardcoded date) and
`const effectiveDate = "2025-10-01"` (hardcoded ISO).

**Repo conventions to follow:**

- Pure, side-effect-free helpers are extracted into their own importable module
  so tests can import them without running the script. The exemplar is
  `scripts/data-signals/gsc-utils.mjs`, whose header reads:
  `Pure utility functions ... No I/O, no side effects — safe to import in tests.`
  Its tests import the functions directly (see `tests/scripts/gsc-fetch.test.ts`,
  which does `import { ... } from "../../scripts/data-signals/gsc-utils.mjs"`).
- The refresh script CANNOT be imported directly in a test because it calls
  `main().catch(...)` at module top level — importing it would execute the
  fetch/write. That is precisely why the new logic must live in a separate pure
  module.
- Spanish month names carry **no accents** (`enero`…`diciembre`); only weekday
  names do (`miércoles`). The extractor must therefore not depend on accents.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Run the new unit test | `pnpm test -- spanish-date` | all pass |
| Full test suite | `pnpm run test` | exit 0, no new failures |
| Lint | `pnpm run lint` | exit 0 |
| Format check | `pnpm run format:check` | exit 0 |
| Typecheck (whole repo) | `pnpm run astro check` | exit 0, 0 errors |

The refresh script itself hits the live Superintendencia site; **do NOT run it**
(`editorial:volatile-data:refresh`). This plan is verified by unit tests against
sample HTML, not by a live run.

## Scope

**In scope** (the only files you should create or modify):

- `scripts/lib/spanish-date.mjs` (create — new pure helper module + new `scripts/lib/` dir)
- `scripts/refresh-editorial-volatile-data.mjs` (modify — only `extractAfpUnoDataset`)
- `tests/scripts/spanish-date.test.ts` (create)

**Out of scope** (do NOT touch, even though they look related):

- `tests/scripts/refresh-editorial-volatile-data.test.ts` — it asserts the
  *committed* snapshot's values (`reviewTriggerDate === "2025-10-01"`, commission
  `0.46`). This plan does NOT re-run the script, so the committed snapshot does
  not change and that test must stay green untouched.
- The `commissionMatch` / `previousCommissionMatch` / `overviewContributionMatch`
  regexes — only the *date* extraction is in scope.
- `src/infrastructure/editorial/editorial-volatile-data.snapshot.json` — the
  committed output; do not regenerate it.
- The two `DEFAULT_IMM` mirrors / any economic-snapshot code — unrelated.

## Git workflow

- Branch: `advisor/027-afp-refresh-effective-date-parser`
- Conventional commits, e.g. `fix(scripts): extraer fecha de vigencia AFP con parser genérico`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create the pure date-extraction module

Create `scripts/lib/spanish-date.mjs` with two exported pure functions and no
I/O. Target shape:

```js
/**
 * Pure helpers for parsing Spanish long-form dates out of scraped HTML/text.
 * No I/O, no side effects — safe to import in tests.
 */

const MONTHS = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  setiembre: 9, // accepted variant
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

/**
 * Parses a Spanish long date like "1 de octubre de 2025" into ISO "2025-10-01".
 * Returns null if no such date is present. Month names are matched
 * case-insensitively; weekday prefixes and surrounding text are ignored.
 * @param {string} text
 * @returns {string | null}
 */
export function parseSpanishLongDate(text) {
  if (typeof text !== "string") return null;
  const match = text.match(
    /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i
  );
  if (!match) return null;
  const day = Number(match[1]);
  const month = MONTHS[match[2].toLowerCase()];
  const year = Number(match[3]);
  if (!month || day < 1 || day > 31) return null;
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  // Reject impossible calendar dates (e.g. 31 de febrero).
  const asDate = new Date(`${iso}T00:00:00.000Z`);
  if (Number.isNaN(asDate.getTime()) || asDate.toISOString().slice(0, 10) !== iso) {
    return null;
  }
  return iso;
}

/**
 * Locates the AFP "A partir de ..." effective-date sentence in the news HTML and
 * returns the parsed ISO date, or null if not found. Anchors on "A partir de" so
 * an unrelated date elsewhere on the page is not picked up.
 * @param {string} html
 * @returns {string | null}
 */
export function extractEffectiveDateFromHtml(html) {
  if (typeof html !== "string") return null;
  // Grab the text from "A partir de" up to the next period (sentence-bounded),
  // tolerant of intervening HTML tags and the "hoy, <weekday>" preamble.
  const sentence = html.match(/A partir de[\s\S]{0,160}?\d{4}/i);
  if (!sentence) return null;
  return parseSpanishLongDate(sentence[0]);
}
```

**Verify**: `node -e "import('./scripts/lib/spanish-date.mjs').then(m => { console.log(m.parseSpanishLongDate('hoy, miércoles 1 de octubre de 2025,')); console.log(m.extractEffectiveDateFromHtml('<p>A partir de hoy, <b>lunes 3</b> de noviembre de 2025, la nueva comisión.</p>')); })"`
→ prints `2025-10-01` then `2025-11-03`.

### Step 2: Wire the extractor into the refresh script

In `scripts/refresh-editorial-volatile-data.mjs`:

1. Add the import near the top, after the existing `import` lines (keep them
   grouped):
   ```js
   import { extractEffectiveDateFromHtml } from "./lib/spanish-date.mjs";
   ```
2. Inside `extractAfpUnoDataset`, **replace** the `effectiveDateMatch` regex
   block and the hardcoded `const effectiveDate = "2025-10-01";`. The new logic:
   ```js
   const effectiveDate = extractEffectiveDateFromHtml(html);
   ```
   …and change the date guard so it fires when the date cannot be parsed:
   ```js
   if (!effectiveDate) {
     throw new Error("Unable to extract AFP Uno effective date from official source.");
   }
   ```
   Place this guard in the same spot the old `if (!effectiveDateMatch)` guard
   was (after the `commissionMatch` guard, before the `overviewContributionMatch`
   guard is fine — preserve the existing guard order otherwise). Remove the old
   `effectiveDateMatch` declaration entirely. Do NOT change any other line.

After this step the file no longer contains the literal `"2025-10-01"` or the
`miércoles\s*1\s*de\s*octubre` regex.

**Verify**: `grep -n "2025-10-01\|miércoles.*octubre\|effectiveDateMatch" scripts/refresh-editorial-volatile-data.mjs` → no matches.
**Verify**: `pnpm run lint` → exit 0. `pnpm run format:check` → exit 0 (run `pnpm exec prettier --write scripts/lib/spanish-date.mjs scripts/refresh-editorial-volatile-data.mjs` first if format:check complains, then re-run format:check).

### Step 3: Add the unit test

Create `tests/scripts/spanish-date.test.ts`, modeled on the import style of
`tests/scripts/gsc-fetch.test.ts` (import the `.mjs` helpers directly):

```ts
import { describe, expect, it } from "vitest";
import {
  parseSpanishLongDate,
  extractEffectiveDateFromHtml,
} from "../../scripts/lib/spanish-date.mjs";

describe("parseSpanishLongDate", () => {
  it("parses a plain long date", () => {
    expect(parseSpanishLongDate("1 de octubre de 2025")).toBe("2025-10-01");
  });
  it("ignores weekday prefix and trailing text", () => {
    expect(parseSpanishLongDate("hoy, miércoles 1 de octubre de 2025, ...")).toBe(
      "2025-10-01"
    );
  });
  it("zero-pads day and month", () => {
    expect(parseSpanishLongDate("3 de marzo de 2026")).toBe("2026-03-03");
  });
  it("accepts the 'setiembre' variant", () => {
    expect(parseSpanishLongDate("15 de setiembre de 2027")).toBe("2027-09-15");
  });
  it("returns null when no date is present", () => {
    expect(parseSpanishLongDate("no hay fecha aquí")).toBeNull();
  });
  it("rejects an impossible calendar date", () => {
    expect(parseSpanishLongDate("31 de febrero de 2025")).toBeNull();
  });
  it("returns null for non-string input", () => {
    expect(parseSpanishLongDate(undefined as unknown as string)).toBeNull();
  });
});

describe("extractEffectiveDateFromHtml", () => {
  it("extracts the date from the 'A partir de hoy' sentence (current page shape)", () => {
    const html =
      "<p>A partir de hoy, miércoles 1 de octubre de 2025, la nueva comisión de 0,46% se aplicará.</p>";
    expect(extractEffectiveDateFromHtml(html)).toBe("2025-10-01");
  });
  it("extracts a FUTURE date with a different weekday/day (the regression this fixes)", () => {
    const html =
      "<p>A partir de hoy, <strong>lunes 1 de diciembre de 2025</strong>, la nueva comisión de 0,49% se aplicará.</p>";
    expect(extractEffectiveDateFromHtml(html)).toBe("2025-12-01");
  });
  it("tolerates HTML tags between 'A partir de' and the date", () => {
    const html = 'A partir de <span class="x">hoy,</span> jueves 2 de enero de 2026, ...';
    expect(extractEffectiveDateFromHtml(html)).toBe("2026-01-02");
  });
  it("returns null when the anchor phrase is absent", () => {
    expect(extractEffectiveDateFromHtml("<p>otra noticia sin vigencia</p>")).toBeNull();
  });
});
```

**Verify**: `pnpm test -- spanish-date` → all pass (11 tests).

### Step 4: Full verification

**Verify**: `pnpm run test` → exit 0, no new failures (the existing
`refresh-editorial-volatile-data.test.ts` still passes — the committed snapshot
is unchanged).
**Verify**: `pnpm run astro check` → 0 errors.

## Test plan

- New file `tests/scripts/spanish-date.test.ts` covering: plain date, weekday
  prefix, zero-padding, `setiembre` variant, missing date, impossible date,
  non-string input (for `parseSpanishLongDate`); current page shape, a **future**
  date with a different weekday/day (the exact regression this plan fixes),
  tag-tolerance, and missing anchor (for `extractEffectiveDateFromHtml`).
- Structural pattern: `tests/scripts/gsc-fetch.test.ts` (direct `.mjs` import).
- Verification: `pnpm test -- spanish-date` → all pass; `pnpm run test` → green overall.

## Done criteria

ALL must hold:

- [ ] `scripts/lib/spanish-date.mjs` exists and exports `parseSpanishLongDate` + `extractEffectiveDateFromHtml`.
- [ ] `grep -n "2025-10-01\|effectiveDateMatch\|miércoles.*octubre" scripts/refresh-editorial-volatile-data.mjs` returns no matches.
- [ ] `pnpm test -- spanish-date` passes (all assertions).
- [ ] `pnpm run test` exits 0 with no new failures (existing AFP snapshot test still green).
- [ ] `pnpm run lint` and `pnpm run format:check` exit 0.
- [ ] `pnpm run astro check` exits 0.
- [ ] Only the three in-scope files changed (`git status`).
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report back (do not improvise) if:

- The `extractAfpUnoDataset` code in `scripts/refresh-editorial-volatile-data.mjs`
  no longer matches the "Current state" excerpt (someone already changed the date
  handling — the drift check should have caught this).
- The existing `tests/scripts/refresh-editorial-volatile-data.test.ts` starts
  failing — that means the committed snapshot was somehow regenerated; do not
  "fix" it by editing the snapshot.
- You find the refresh script is also invoked/imported somewhere that depends on
  the old `"2025-10-01"` literal (search `grep -rn "2025-10-01" scripts/ src/`
  before finishing; the committed snapshot JSON legitimately contains it as data
  and is out of scope).

## Maintenance notes

- This makes the AFP refresher robust to the *date wording* but it still depends
  on the `nueva comisión de N% se aplicará` and `A partir de` phrasings. If the
  Superintendencia restructures the page, both this and the commission regex need
  revisiting; the script's fallback (retain previous snapshot) means such a break
  is silent — consider a follow-up that logs a louder warning on fallback.
- Reviewer should scrutinize the `extractEffectiveDateFromHtml` anchor window
  (`{0,160}`) — too small and it misses the date, too large and it could capture a
  later unrelated date. The future-date test guards the common case.
- Deliberately deferred: making `extractAfpUnoDataset` itself unit-testable (it
  still lives in the un-importable script). Only the date logic was extracted,
  which is where the latent bug was.
