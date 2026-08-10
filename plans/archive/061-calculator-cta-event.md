# Plan 061: Reactivar el evento `article_calculator_cta_click` (onclick inline bloqueado por CSP)

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- src/components/CalculatorCTA.astro src/utils/analytics.ts src/scripts/analytics.ts src/contracts/analytics-events.ts tests/integration/homepage-content.test.ts`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: correctness (analytics)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

`CalculatorCTA.astro` (renderizado en todos los artículos vía
`PostDetails.astro`) declara el clic en un **handler inline**:
`onclick="window.monedarioAnalytics?.track('article_calculator_cta_click', …)"`.
La CSP del sitio (generada por `src/integrations/csp-hashes.ts`, que elimina
`'unsafe-inline'` de `script-src` y solo hashea `<script>` — los handlers
inline no se hashean) **bloquea ese handler**: el evento nunca se emite y cada
visitante recibe una violación CSP en consola. El handler global de clics de
`src/scripts/analytics.ts:148-163` ya rastrea todo elemento con
`data-analytics-cta`, pero `getAnalyticsEventNameForCta` mapea
`"article-calculator-cta"` a `"cta_click"` genérico porque
`CTA_EVENT_NAMES` no lo conoce. El fix: borrar el onclick inline y añadir el
mapeo para que el handler global emita el evento dedicado.

## Estado actual

- `src/components/CalculatorCTA.astro:22-31`:
```html
    <a
      href={getPath(href)}
      class="mt-3 inline-flex ..."
      data-analytics-cta="article-calculator-cta"
      data-analytics-label={label}
      data-analytics-location="article_body"
      onclick="window.monedarioAnalytics?.track('article_calculator_cta_click', { calculator_href: this.href, label: this.dataset.analyticsLabel })"
    >
```
- `src/utils/analytics.ts:42-48`:
```ts
const CTA_EVENT_NAMES: Record<string, string> = {
  "calculator-trust-link": "calculator_trust_link_click",
  "hub-route": "hub_route_click",
  "next-step": "next_step_click",
  "related-post": "related_content_click",
  "search-chip": "search_chip_click",
};
```
- `src/scripts/analytics.ts:148-163`: el handler global trackea `[data-analytics-cta]`
  con `getAnalyticsEventNameForCta(ctaElement.dataset.analyticsCta)`.
- `src/contracts/analytics-events.ts`: `ANALYTICS_EVENT_ALLOWLIST` (allowlist
  de eventos transmisibles — verifica si `article_calculator_cta_click` está).

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Verificación de allowlist | `grep -n "article_calculator_cta_click" src/contracts/analytics-events.ts src/utils/analytics.ts src/scripts/analytics.ts` | ver Pasos |
| Tests afectados | `pnpm exec vitest run tests/integration/homepage-content.test.ts` | todos pasan |
| Suite completa | `pnpm test` | todos pasan |
| Lint/format | `pnpm run lint && pnpm run format:check` | exit 0 |

## Alcance

**En alcance**:
- `src/components/CalculatorCTA.astro`
- `src/utils/analytics.ts` (CTA_EVENT_NAMES)
- `src/contracts/analytics-events.ts` (solo si el evento no está en la allowlist)
- `tests/integration/homepage-content.test.ts` (ajuste/confirmación del contrato)

**Fuera de alcance** (NO tocar):
- `src/scripts/analytics.ts` (el handler global ya existe y funciona)
- Otros componentes con `data-analytics-cta` (no usan onclick inline — verificar con grep)
- Cambiar la CSP o `csp-hashes.ts`

## Git workflow

- Rama: `advisor/061-calculator-cta-event`
- Commit: `fix(analytics): emitir article_calculator_cta_click vía handler global (CSP-safe)`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Verificar que el evento está en la allowlist de transmisión

**Verificar**: `grep -rn "article_calculator_cta_click" src/` →
- Si aparece en `src/contracts/analytics-events.ts` (allowlist): el evento es
  transmisible; sigue al Paso 2.
- Si NO aparece: agrégalo a `ANALYTICS_EVENT_ALLOWLIST` (y a su test de
  contrato si `homepage-content.test.ts` fija la lista por contrato) y luego
  sigue al Paso 2. Un evento fuera de la allowlist se descarta en el worker
  (Gate 2) y el fix quedaría incompleto — el grep es el control.

### Paso 2: Quitar el onclick inline

En `src/components/CalculatorCTA.astro`, elimina el atributo `onclick="..."`.
El anchor conserva `data-analytics-cta="article-calculator-cta"`,
`data-analytics-label` y `data-analytics-location` (el handler global los usa).

**Verificar**: `grep -rn "onclick=" src/components/CalculatorCTA.astro` → sin matches.
`grep -rn "onclick=" src/` → solo si hay otros (reporta cuáles en el reporte final).

### Paso 3: Mapear el CTA al evento dedicado

En `src/utils/analytics.ts`, agrega a `CTA_EVENT_NAMES`:
```ts
  "article-calculator-cta": "article_calculator_cta_click",
```

**Verificar**: `grep -n "article-calculator-cta" src/utils/analytics.ts` → match en CTA_EVENT_NAMES.

### Paso 4: Actualizar el test de contrato si corresponde

Si `tests/integration/homepage-content.test.ts` o `tests/integration/analytics-script.test.ts`
fijan expectativas sobre `CTA_EVENT_NAMES` o sobre los eventos de CTA, ajusta
las expectativas para el nuevo mapeo (los nombres de eventos NO cambian — solo
se conecta un CTA_type que antes caía a `cta_click`). Si no hay expectativa
sobre `article-calculator-cta`, agrega una aserción mínima: el mapeo existe y
apunta al nombre canónico.

**Verificar**: `pnpm exec vitest run tests/integration/homepage-content.test.ts tests/integration/analytics-script.test.ts` → todos pasan.

### Paso 5: Gates finales

**Verificar**:
- `pnpm test` → todos pasan
- `pnpm run lint` y `pnpm run format:check` → exit 0
- `pnpm run astro check` → 0 errores (puede haber el hint preexistente de `content.config.ts` — no es tuyo)
- `git status` → solo archivos en alcance

## Test plan

- Ajustar/agregar aserciones en los tests de contrato de analytics (Paso 4),
  modeladas sobre las aserciones existentes de `homepage-content.test.ts`.
- No se requiere test del navegador: el handler global ya está cubierto por
  `analytics-script.test.ts` para `[data-analytics-cta]`.

## Done criteria

- [ ] `grep -rn "onclick=" src/components/CalculatorCTA.astro` → sin matches
- [ ] `grep -n "article-calculator-cta" src/utils/analytics.ts` → en `CTA_EVENT_NAMES`
- [ ] `grep -n "article_calculator_cta_click" src/contracts/analytics-events.ts` → presente
- [ ] `pnpm test` exit 0
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- Otro componente usa `onclick` inline (reporta cuál — decide el operador si
  entra en otro plan; no lo toques).
- `homepage-content.test.ts` fija por contrato que el evento NO debe existir
  (test que falla al agregarlo) — no borres el test: reporta.
- La allowlist del worker (`workers/analytics-collector`) tiene su propia copia
  del allowlist — verifica con grep; si el evento no está tampoco allí, añádelo
  (es parte del mismo contrato) y anótalo.

## Maintenance notes

- El patrón "data-analytics-cta + CTA_EVENT_NAMES" es el canal canónico de
  CTA: los componentes nuevos deben usar atributos, nunca `onclick`.
- En review: confirmar que el handler global no duplica el evento (un solo
  listener `data-analytics-click-handler-attached` por página).
- Los datos `calculator_href`/`label` del onclick viejo se pierden; el handler
  global envía `destination_url` + `cta_label` en su lugar (equivalente).
