# Plan 041: Corregir el CLS de carga en `impuesto-segunda-categoria` (swap de resultado disparado por prefill)

> **Executor instructions**: Follow this plan step by step. This is a
> **diagnose-then-fix** plan — Step 1 confirms the shifting element before you
> change anything. If the diagnosis contradicts the hypothesis below, STOP and
> report. Run every verification and confirm the expected result. When done,
> update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 520a8685..HEAD -- src/pages/calculadoras/impuesto-segunda-categoria.astro src/scripts/calculator-prefill.ts`

## Status

- **Priority**: P2
- **Effort**: S–M (diagnosis + a small CSS/markup reserve-space fix)
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `520a8685`, 2026-07-10
- **Confidence**: MED — the RUM sample is small (20 visits) and the root element
  must be confirmed by measurement in Step 1 before fixing.

## Why this matters

Cloudflare RUM for 2026-W27 reports **`/calculadoras/impuesto-segunda-categoria/`
CLS p75 = 1.008** — catastrophic layout shift (the project's own guardrail in
`AGENTS.md` is **CLS = 0**, "good" is < 0.1). Layout shift hurts both Core Web
Vitals ranking and the reading experience.

**Where it is NOT** (rule these out — they do not count toward the metric):
RUM/CrUX CLS **excludes shifts within 500 ms of user input** (`hadRecentInput`).
So the error box shown on the "Calcular" click and the result panel updating when
the user clicks are **excluded** — they are red herrings.

**The load-time cause**: `src/scripts/calculator-prefill.ts` dispatches synthetic
`input` / `change` events on page load (lines 68-69, 80-81, 137-138). On a
prefilled load (a returning user with a saved profile, or a deep link), those
events auto-trigger the calculation, and `#resultado-contenido` swaps from its
SSR "example" content to the real result **without any user gesture** — so the
shift counts. If the real result is a different height than the example,
everything around it moves. That is the prime suspect.

## Current state

`src/pages/calculadoras/impuesto-segunda-categoria.astro` renders the result
panel with an SSR example that is later replaced (around lines 195-226):

```astro
      <!-- RESULTADO -->
      <div id="resultado" class="rounded-xl border border-border bg-background p-6">
        <h2 class="mb-5 text-lg font-semibold">Resultado</h2>
        <div id="resultado-contenido" data-is-example="true" aria-live="polite">
          <div class="mb-5 rounded-lg border border-border bg-surface-muted/40 p-4 text-center">
            <p class="mb-1 text-xs font-bold tracking-widest text-muted uppercase">…</p>
            <p class="text-4xl font-bold text-foreground/80">…</p>
            <!-- example rows: $1.200.000, etc. -->
          </div>
        </div>
      </div>
```

The page opts into prefill via `data-profile-prefill-host` (line ~139) and
`import "@/scripts/calculator-prefill";` (line ~393). `calculator-prefill.ts`
fills the inputs and dispatches `input`/`change`, which the page's calculator
listens to and recalculates — replacing `#resultado-contenido`'s inner HTML.

**Secondary suspect (also load-time)**: the `<h1>` uses Fraunces
(`impuesto-segunda-categoria.astro:142`). A late font swap reflows the heading.
The Fraunces preload was recently restored (commit `520a8685`), which should have
mitigated this — so treat it as secondary and only pursue it if Step 1 shows the
shift is in the heading, not the result panel.

**Note on who is affected**: prefill only runs when there is a saved profile / URL
data, so the CLS hits **returning / deep-linked** users, not first-time visitors
with an empty form. Reproduce that state in Step 1.

## Commands you will need

| Purpose            | Command                                                                 | Expected                         |
|--------------------|-------------------------------------------------------------------------|----------------------------------|
| Local dev          | `pnpm run dev`                                                           | server on :4321                  |
| Build + preview    | `pnpm run build && pnpm run preview`                                     | production-like build to measure |
| Lighthouse (mobile)| `npx lighthouse http://localhost:4321/calculadoras/impuesto-segunda-categoria/ --only-categories=performance --form-factor=mobile --screenEmulation.mobile --quiet` | CLS reported |
| Typecheck          | `astro check`                                                           | 0 errors                         |
| Format             | `pnpm run format:check`                                                 | exit 0                           |

## Scope

**In scope**:
- `src/pages/calculadoras/impuesto-segunda-categoria.astro` (markup/CSS of the
  result panel — reserve space so the example→real swap is height-neutral)
- At most one shared calculator style/component **only if** Step 1 proves the fix
  belongs there (if so, STOP and report the file first)

**Out of scope**:
- `src/scripts/calculator-prefill.ts` — do not change prefill behavior;
  prefilled auto-calc is intended UX. Fix the layout, not the trigger.
- The calculator's math or the other 21 calculator pages — this is one page's
  layout bug. (If Step 1 shows the same pattern is repo-wide, report it as a
  follow-up; do not fix 22 pages in this plan.)

## Git workflow

- Branch: `advisor/041-impuesto-cls-load-shift`
- Conventional commit, e.g. `fix(perf): reservar espacio del panel de resultado para eliminar CLS de carga`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Reproduce and CONFIRM the shifting element (do not fix yet)

1. `pnpm run build && pnpm run preview` (measure a production-like build, not dev).
2. Put the page in the **prefilled** state that returning users hit — set the saved
   profile the calculator reads (inspect `calculator-prefill.ts` to see whether it
   reads `localStorage` or URL params, then reproduce that: set the localStorage
   key it looks for, or open the page with the prefill URL params).
3. In Chrome DevTools → Performance, record a reload. Inspect the **Layout Shift**
   entries and their "Moved from/to" regions. Confirm the dominant shift is
   `#resultado` / `#resultado-contenido` swapping example→real.

**STOP and report** if the dominant shift is somewhere else (e.g. the `<h1>`
font, an image, the hero) — the fix differs and you should re-scope. Record what
you found either way.

### Step 2: Reserve space so the swap is height-neutral

Once confirmed, make the result panel not reflow on swap. Prefer the least-risky
option that Step 1's measurement supports:

- **Option A (preferred)**: give `#resultado-contenido` a `min-height` sized to the
  typical real result so the panel cannot grow/shrink on swap. Use a Tailwind
  `min-h-[…]` utility (match the repo's utility style) or a scoped style. Choose
  the value from the real result height you observed in Step 1.
- **Option B**: make the SSR example markup render the same number of rows / same
  structural height as a real result, so replacing the inner HTML does not change
  the panel height.

Keep the visible example content intact (it is intentional UX). Do not hide the
result panel — an empty reserved box that fills in is fine; a panel that pops into
existence is not.

### Step 3: Re-measure

Repeat Step 1's Lighthouse/DevTools measurement in the prefilled state.

**Verify**: CLS contribution from `#resultado` is gone; page CLS < 0.1 (target;
guardrail is 0). Also measure the **non-prefilled** first-visit path to confirm no
regression. `astro check` → 0 errors.

## Test plan

- This is a rendering/CWV fix; the verification is the before/after CLS
  measurement in Steps 1 and 3, recorded in the PR (numbers, not "looks better").
- No unit test is added (CLS is not unit-testable here). The durable regression
  signal is the next weekly Cloudflare RUM scorecard for this route.
- Confirm the existing perf gate still passes if it covers this route:
  `pnpm run perf:ci` (uses `lighthouserc.mobile.cjs`) — if the route is not in the
  lhci config, note that and rely on the RUM follow-up.

## Done criteria

- [ ] Step 1 diagnosis recorded in the PR (which element shifted, measured CLS before).
- [ ] Prefilled-load CLS for the route measured **< 0.1** after the fix (number in the PR).
- [ ] First-visit (empty form) path measured — no new shift introduced.
- [ ] `astro check` → 0 errors; `pnpm run format:check` → exit 0.
- [ ] `git status` shows only `impuesto-segunda-categoria.astro` modified (unless Step 1 justified one shared file, reported first).
- [ ] `plans/README.md` status row for 041 updated.

## STOP conditions

- Step 1 shows the dominant shift is NOT the result-panel swap → re-scope and report.
- The fix would require changing `calculator-prefill.ts` or every calculator page → report; this plan is one page.
- You cannot reproduce any load-time CLS in the prefilled state → report (the RUM
  sample is small; the metric may be dominated by a device/condition you can't
  reproduce locally) rather than changing markup blindly.

## Resultado de ejecución (BLOCKED, 2026-07-11, vía `/improve execute 041`)

Ejecutor despachado en worktree aislado (rama `advisor/041-impuesto-cls-load-shift`,
sin drift: `git diff --stat 520a8685..HEAD -- ...` vacío antes de despachar). **Step 1
contradijo la hipótesis del plan** — se detuvo correctamente en la condición de STOP
("Step 1 shows the dominant shift is NOT the result-panel swap"), sin tocar ningún
archivo. Verificado de forma independiente por el revisor, no solo confiando en el
reporte:

- **La hipótesis del swap `#resultado-contenido` está descartada por diseño, no solo
  por medición.** Grep del script inline de la página confirma que el cálculo/swap
  solo está enganchado al evento `click` de `#calcBtn` (línea 450) — no existe ningún
  listener `input`/`change` en los campos que dispare `calculateSecondCategoryTax`.
  Los eventos sintéticos `input`/`change` que `calculator-prefill.ts` despacha en
  carga (líneas 68-69, 80-81, 137-138) no tienen a quién notificar en esta página. El
  swap solo puede ocurrir dentro de un gesto de usuario real, lo que lo excluye de CLS
  por definición (`hadRecentInput`), no por casualidad de medición.
- **Medición empírica (Playwright + `PerformanceObserver({type:'layout-shift'})`,
  viewport móvil 390×844, build de producción vía `pnpm run preview`):**
  perfil prellenado en `localStorage` (`monedario_profile`) → 1 entrada de layout-shift,
  valor **0.0125**, en t=81ms, `hadRecentInput:false`; `data-is-example` permaneció
  `"true"` — el panel de resultado **nunca cambió**. La fuente real fue el bloque
  "✓ Pre-rellenado de tu última simulación" que `ensureHint()` en
  `calculator-prefill.ts:94-119` inserta con `host.prepend(hint)` dentro de
  `#calculator-form-card`, empujando el formulario hacia abajo. Confirmado por lectura
  directa del código (`ensureHint`, `host.prepend`). Carga sin prellenado (primera
  visita): 0 entradas, CLS 0.0000.
- **Sospechoso secundario (Fraunces) también descartado**, confirmado por lectura:
  `src/layouts/Layout.astro:28-30` fija `shouldPreloadDisplayFont = false`
  explícitamente para `/calculadoras/*` ("their hero H1 is not Fraunces"); el `<h1>`
  de esta página no usa ninguna clase de fuente de display.
- **Brecha de magnitud sin explicar — el hallazgo real, no un detalle menor:** el único
  shift de carga reproducible localmente es 0.0125, **~80× menor** que el p75 de campo
  reportado (1.008, RUM 2026-W27). El hint bar es geométrico (dispara a t=81ms sin
  depender de condiciones de red), así que *aunque se corrigiera*, no cerraría esa
  brecha. **La causa del 1.008 de campo sigue sin identificarse.** La muestra RUM es de
  solo 20 visitas — no está descartado que sea una sesión atípica en vez de un bug
  sistemático, pero tampoco hay evidencia para afirmar eso; sigue abierto.

**Decisión: BLOCKED, no REJECTED.** El problema de campo (CLS 1.008 en esta ruta) es
real y sigue sin causa identificada — no se está cerrando como "arreglado" ni como
"no reproducible sin más". Lo que cae es la hipótesis específica (`calculator-prefill`
→ swap del panel de resultado), que la propia compuerta de diagnóstico del plan atrapó
antes de escribir ningún código — el diseño "diagnose-then-fix" funcionó como estaba
pensado.

**No en alcance de esta ejecución (a decisión del operador, no del ejecutor):**
1. El hint bar de `ensureHint()` sí tiene un shift de carga real (0.0125, bajo impacto)
   y es un patrón compartido — cualquier calculadora con `data-profile-prefill-host`
   que reciba un hit de prellenado probablemente lo muestra. Candidato a limpieza de
   bajo riesgo si se decide seguir, pero está fuera del alcance de 041
   (`calculator-prefill.ts` es explícitamente out-of-scope en este plan).
2. La causa real del 1.008 de campo no se investigó más allá de esta página — el plan
   de seguimiento, si se decide, debería ampliar la búsqueda del Step 1 en vez de asumir
   que el hint bar es "el bug del 1.008" (no lo es, por la brecha de magnitud).

Rama `advisor/041-impuesto-cls-load-shift` verificada sin commits (idéntica a `main`,
`1be689b3`) y eliminada tras la verificación — no había trabajo que preservar.

## Maintenance notes

- If Step 1 shows the same example→real swap causes CLS on other prefilled
  calculators, open a follow-up to apply the same reserve-space pattern (or lift
  it into the shared `CalculatorResultPanel.astro`) — but measure per page; the
  height deltas differ.
- Watch the next 1–2 weekly RUM scorecards for this route to confirm p75 CLS
  dropped below 0.1 in the field (local measurement is necessary but not
  sufficient — the field sample is the source of truth).
- A reviewer should confirm the reserved height does not leave an awkward empty
  gap on the first-visit (non-prefilled) path.
