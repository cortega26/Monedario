# PLAN — Evolución visual/UX (sistema CTA + onboarding + discovery,
sin rebrand)

**Estado:** FIRMADO 2026-09-16 — S1 autorizado tras panel F2
(coordinar CTAs, no duplicar)
**Fecha:** 2026-09-16
**Owner de decisión:** Carlos Ortega
**Prioridad:** P1 (UX) · **Esfuerzo:** M (por slices) · **Riesgo:** MED
(a11y/perf son el diferencial; no regresarlos)
**Fuente:** auditoría UX read-only (`index.astro` 125 líneas,
`LinkButton` inline sin variantes, hero CTAs subrayados, banda
calculadora `accent/5`, `ResumeWidget` oculto en primera visita,
`Card content-visibility:auto`), RUM W37 (LCP ~650–900 ms, INP 72 ms,
CLS ~0,008 — sano), LHCI desktop `perf ≥0,99 / LCP ≤1.700 ms / CLS = 0`

## Objetivo y límites

Subir activación y siguiente paso con una evolución del sistema
existente (tokens Tailwind v4, dark-mode AA, `Fraunces` + guarda LCP,
AVIF, axe/LHCI vigentes), sin rebrand ni ilustración por artículo.

En alcance (slices reversibles, sin URLs nuevas):

- S1 sistema CTA: variantes `LinkButton` (primary/ghost/danger,
  tamaños, foco visible) + aplicación a hero, banda `Calcula tu caso`
  y paneles de resultado; CTA sticky móvil en calculadoras.
- S2 router de onboarding (3 preguntas: empleo/deuda/ahorro) que
  enlaza a los 6 destinos `ProblemCards` existentes; sin lógica
  persistente más allá de `localStorage` agregada-anónima existente.
- S3 home discovery: mezcla 1 reciente + 1 tendencia (GSC build-time)
  + 1 evergreen owner en `getBalancedHomepagePosts()`; sin cambiar
  número de tarjetas ni rutas.
- S4 arte hero home (1 AVIF escena controlada, ≤80 KB, `fetchpriority`
  medido) + motion `prefers-reduced-motion`-safe + estilos print de
  paneles (finiquito/UF imprimibles).
- A11y/perf: `#skip-to-content`, `aria-live`, `tabindex=-1` en
  resultado, `fieldset/legend`, foco visible, `content-visibility`,
  preload condicional Fraunces intactos.

Fuera de alcance:

- Rebrand, nuevo sistema de ilustración por artículo, diseño global
  nuevo (defer; `MON-405` ya diferido).
- Nuevas URLs/páginas de onboarding (el router enlaza, no crea).
- Cuentas, historial servidor, personalización con PII, cohortes.
- Degradar LHCI/axe para widgets pesados; hero images automáticas por
  API (fuera de política: manual-only).

## Autoridad, invariantes y supuestos

- Precedencia: `docs/AI_ENGINEERING_CONSTITUTION.md` → `AGENTS.md` →
  `context/*.md` → implementación.
- Invariantes/contratos aplicables: `URL.PUBLIC.NO_POST_ID`,
  `ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS`,
  `HERO_IMAGE_PUBLISHED_REQUIRED` + `TEXT_MATCH_REQUIRED` (si se toca
  imagen), `INLINE_IMAGE_AVIF_REQUIRED`, `CONTRACT.PUBLIC_URLS`,
  política `trailingSlash: "always"`.
- Supuestos: A1 home actual convierte por lista estática; primera
  visita no recibe guía (gap verificado); A2 `ResumeWidget` solo ayuda
  al retorno; A3 CTA débil frena `start/view` y `next_step`.

## Change Control Record

1. Scope declaration: ver arriba (S1–S4).
2. Impacted modules: `src/components/LinkButton.astro`,
   `src/components/HeroHomepage.astro`, `src/components/ProblemCards.*`,
   `src/components/ResumeWidget.*`, `src/components/Card.astro`,
   `src/pages/index.astro`, `src/pages/calculadoras/*` (solo panel/CTA),
   `src/styles/global.css` + `typography.css`, `src/layouts/Layout.astro`
   (solo si el preload/CTA lo exige), `tests/accessibility/*`,
   `public/images/hero/*` (solo S4 + `check:hero-images`).
3. Invariant preservation: sin rutas nuevas; sin `post.id` en URLs;
   contraste AA en variantes; `reduced-motion` + print sin romper
   layout.
4. Contract preservation: Pagefind (`data-pagefind-body/ignore`)
   intacto; OG/canonical/JSON-LD intactos; `inlineStylesheets:never`
   (ADR-20260625) respetado.
5. Boundary integrity: `pnpm run check:boundaries` al cierre de cada
   slice.
6. Test coverage impact: axe 13 URLs × 3 matrices debe seguir en 0
   `critical/serious`; añadir suite `calculator-semantics`-like para
   onboarding/CTA si introduce foco o radios; Playwright móvil 390px.
7. Rollback strategy: revert por slice; S4 revierte asset + preload.
8. Regression risk: MED — LCP (fuente/imagen), CLS (sticky CTA),
   foco/a11y. Mitigación: 1 slice por PR, LHCI desktop+móvil, RUM por
   ruta, E2E teclado/lector básico.

## Competitive Adaptation Appendix

- benchmarkSet: patrones genéricos de CTA/onboarding observados; sin
  copiar copy/IA/diseño competidor.
- patternHypothesis: CTA real + router de 3 preguntas + 1 hero con
  prueba (indicadores vivos) suben `start/view` sin cambiar tráfico.
- localDelta: copy `es-CL` sin humo,ith indicadores SII/BCCh reales,
  sin registro, sin PII.
- nonCopyBoundaries: sin ilustración/stock genérico financiero; escena
  controlada del sistema existente si hay arte.
- ownerTarget: `/` (home) + `/calculadoras/` + paneles existentes.
- successSignal: `start/view` +15%, `next_step_click/shown` en subida,
  home bounce −10%, RUM/LHCI sin regresión.
- ownership conflict check: pass; sin superficie nueva.

## Fases y gates

1. **S1 — CTA (1 PR).** Variantes + hero + banda + sticky móvil.
   Gates: `lint`, `format:check`, `astro check`, axe, LHCI, RUM base.
2. **S2 — Onboarding router (1 PR, tras S1).** 3 preguntas →
   destinos existentes; `role=search`/`fieldset`/`aria-describedby`
   correctos; sin persistencia nueva. Gate: E2E teclado + móvil.
3. **S3 — Discovery home (1 PR).** Mezcla reciente/tendencia/evergreen
   build-time desde GSC permitido + ownership; sin cambiar conteo.
   Gate: `check:homepage-surface-freshness` + fechas derivadas (no
   hardcodeadas).
4. **S4 — Arte + motion + print (1 PR, opcional).** 1 AVIF + motion
   seguro + print CSS. Gates: `check:images`, `check:hero-images` si
   aplica, LHCI (LCP ≤1.700 ms desktop / ≤2.500 móvil, CLS = 0/≤0,1).

STOP/HALT: axe `critical/serious` >0; LHCI bajo umbral; LCP p75 ruta
>1.700 ms desktop sostenido; cualquier slice que exija URL nueva →
  mover a excepción, no colar.

## Métricas

| Métrica | Meta por slice |
|---|---|
| `calculator_start/view`, `complete/start` | +15% / no regresión |
| `next_step_click/shown` | subida (con n) |
| Home bounce / scroll | −10% / +profundidad |
| RUM LCP/INP/CLS por ruta | sin regresión |
| Axe | 0 critical/serious |

## Rollback

Revert por slice; re-correr `test`, `test:a11y`, `perf:ci`,
`check:routes`. Assets: quitar AVIF + preload.

## Progress log

- 2026-09-16 — Plan creado (TODO). Decisión owner incorporada:
  evolución, no rebrand.
