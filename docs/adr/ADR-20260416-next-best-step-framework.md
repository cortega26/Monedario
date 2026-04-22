# ADR-20260416-next-best-step-framework

Date: 2026-04-16
Status: Accepted

## Context

Phase 1 (`ADR-20260416-calculator-profile-persistence.md`) dejó cableado `monedario_profile` en las 6 calculadoras, pero los CTAs entre calculadoras siguen siendo estáticos (ej. `CalculatorCTA.astro` apunta a una calculadora hardcoded, sin leer perfil). Dos deep researches externos (Gemini, ChatGPT) y el ritual de medición (`docs/operations/runbooks/weekly-search-performance-ritual.md`) convergen en que el loop "problema → owner page → support/tool → **siguiente paso**" es el cuello de botella retenido: sin CTAs contextuales, el perfil es un cajón sin uso.

El problema específico que este ADR resuelve:

- Cada calculadora debería, al producir un resultado, sugerir el siguiente paso más útil **según los datos que ya dio el usuario** (no una lista genérica de calculadoras).
- Las reglas deben estar centralizadas (editables por product/copy), no dispersas en el template de cada página.
- Los CTAs YMYL exigen: copy no-prescriptivo, vigencia visible cuando aplica, trazabilidad de por qué se muestra (debuggable), separación entre sugerencia y consejo.
- El stack actual es Astro (`is:inline` scripts, zero-JS por default). La decisión no puede asumir React/hydration.

Fuera de este ADR: generación personalizada de copy, backend de recomendaciones, A/B testing server-side.

## Decision

Introducir un **rule engine declarativo client-side** que lee `monedario_profile` + contexto de página y renderiza 0..N "Next Best Step" cards en un slot predefinido de cada calculadora.

Componentes:

1. **`src/components/NextBestStep.astro`** — componente de slot. Renderiza un `<section data-next-best-step>` vacío en SSR; la hidratación ocurre en cliente. Sin JS disponible, no se muestra nada (graceful degradation — invariante existente: la calculadora debe funcionar sin localStorage).
2. **`src/utils/nextBestStep.ts`** — evaluador de reglas puras:
   - Firma: `evaluate(profile, pageContext, rules) → Suggestion[]`.
   - `Suggestion` = `{ id, priority, href, headline, rationale, ctaLabel, ymylTag? }`.
   - Determinista, sin side effects. Testeable con vitest.
3. **`src/data/nextBestStep/rules.ts`** — catálogo centralizado de reglas. Cada regla declara: `id`, `when` (predicado sobre profile + context), `suggest` (factory de `Suggestion`), `priority`, `mutexGroup` (para evitar 3 CTAs redundantes).
4. **`src/scripts/next-best-step.ts`** — hidratador:
   - Lee perfil con `getProfile()`.
   - Deriva `pageContext` desde `data-analytics-page-type` + `data-calculator-slug`.
   - Llama `evaluate` → toma top N=2 por priority desc, respetando `mutexGroup`.
   - Renderiza dentro del slot usando `CalculatorCTA.astro` como shell visual (coherencia UI).
   - Emite `next_best_step_shown` y `next_best_step_click` (parámetros: `rule_id`, `calculator_slug`, `profile_signal`).
5. **YMYL guardrail**: cada `Suggestion` con `ymylTag` fuerza la inclusión de un micro-disclaimer inline ("Sugerencia orientativa — valida con fuente oficial") y un link a la fuente autoritativa (SII, Suseso, CMF, Sernac según corresponda). Reglas sin `ymylTag` no pueden sugerir acciones con consecuencia regulatoria (ej. "presenta tu declaración" no es válido sin tag).

Reglas iniciales (detalle en plan): sueldo-liquido → APV (si imponible > umbral), APV → operación-renta (si régimen B), operación-renta → sueldo-liquido (si faltan datos), etc.

## Consequences

**Positivo:**
- Retención medible: el loop calc→calc deja de depender del usuario recordando qué calculadora abrir.
- Copy y reglas separados del código → product/editorial pueden iterar sin tocar templates.
- Base testeable (evaluador puro) reduce regresión.
- Analytics limpia: `rule_id` permite comparar efectividad por regla.

**Trade-offs:**
- Bundle cliente sube ~3–4 KB minified (evaluador + reglas + hidratador). Mitigación: carga diferida con `requestIdleCallback` (patrón ya usado en `calculator-prefill.ts`).
- Riesgo YMYL si copy sugiere acción sin contexto. Mitigación: `ymylTag` obligatorio + PR review con `NORMA_YMYL.md`.
- Si las reglas crecen >30, el catálogo declarativo deja de escalar; migrar a un DSL o backend. Umbral explícito en plan.

**Costo operativo:**
- Product/copy debe mantener el catálogo de reglas (≤ 1 h/mes esperado).
- CI: agregar vitest suite para el evaluador; sin gate nuevo.

## Alternatives considered

1. **CTAs inline por página** (statu quo extendido): descartado — duplica lógica, no testeable, imposible de auditar YMYL.
2. **Backend de recomendación** (edge function que retorna JSON de sugerencias): descartado para Phase 2 — Monedario no tiene backend propio; agregar uno por este feature viola `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`. Revisitable en Phase 3+ si el rule engine cliente se queda corto.
3. **ML/embedding-based ranking**: descartado — no hay señal suficiente (tráfico y diversidad de perfiles), y el loop YMYL requiere reglas auditables, no pesos.

## Verification

- `pnpm exec vitest run tests/integration/nextBestStep.test.ts` — evaluador puro: snapshot de sugerencias para 6+ perfiles sintéticos.
- `pnpm exec astro check` — sin errores nuevos.
- Lighthouse mobile sobre `sueldo-liquido.astro` con NextBestStep visible: Perf ≥ 99, LCP ≤ 1.7 s, CLS = 0 (invariante existente).
- Manual QA: con perfil vacío, el slot queda vacío (sin hueco visual). Con perfil poblado, se ven 1–2 cards con rationale derivable.
- Analytics: `next_best_step_shown` aparece en el scorecard semanal (`build-weekly-search-report.mjs` extenderá su watchlist).

## Related

- `docs/adr/ADR-20260416-calculator-profile-persistence.md` — dependencia directa (Phase 1).
- `docs/backlog/PHASE_2_NEXT_BEST_STEP.md` — plan de implementación.
- `docs/backlog/PHASE_2_STRATEGY.md` — psicología de usuario y principios de copy.
- `docs/editorial/NORMA_YMYL.md` — política YMYL (copy, disclaimers).
- `CONTRACT.YMYL_RESPONSE_STRUCTURE` en `context/CONTRACTS.md`.
