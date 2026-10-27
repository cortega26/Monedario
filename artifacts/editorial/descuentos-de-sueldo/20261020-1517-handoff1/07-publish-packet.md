# Publish Packet

- Run id: `20261020-1517-handoff1`
- Slug: `descuentos-de-sueldo`
- Source article: `src/data/blog/descuentos-de-sueldo.md`
- Origen: `docs/backlog/PLAN-handoff-descuentos-sueldo-2026-10-20.md` (F01–F08) sobre el informe externo `2026-10-19-0200-descuentos-de-sueldo.md` (CAL-04).
- Autor de este paquete: DraftAgent (Claude Code, Claude Sonnet 5.5, sesión `20261020-1517-handoff1`).

## Estado del paquete

> **Ningún gate está marcado.** Solo un humano firma los gates de publicación (`INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`). La sección "Declaración del DraftAgent" de abajo describe qué existe; no es un sign-off.

- [ ] Brief listo
- [ ] Dossier listo
- [ ] Outline listo
- [ ] Draft listo
- [ ] Math audit listo o no aplica
- [ ] Compliance listo
- [ ] Fuentes completas
- [ ] Benchmark observations separadas de fuentes oficiales
- [ ] `localDelta` visible en el entregable final
- [ ] Ownership/no-canibalizacion revisado
- [ ] Fecha de corte visible para lectores
- [ ] Prompt-injection review completo: source-borne instructions were not followed; suspicious examples, if any, are labeled `PROMPT_INJECTION_CANDIDATE`
- [ ] `pnpm run check:hero-images` y `pnpm run check:hero-prompts` OK con el articulo ya en `draft: false` (`check:hero-images` excluye borradores: un OK con `draft: true` no cuenta)
- [ ] HumanEditor sign-off

## Declaración del DraftAgent (no es sign-off)

- Brief, dossier (con extractos literales), outline, draft y `sources.yaml` existen en esta carpeta; `draft-fix-CHANGELOG.md` registra los cambios por hallazgo.
- `05-math-audit.md` y `06-compliance.md` **no existen a propósito**: requieren sesión/modelo distintos (`requires_calculation: true`, `regulatory_sensitivity: alta`). El auditor debe arrancar fresco con este paquete y el informe externo, sin el historial de esta sesión, y de preferencia con otra familia de modelo.
- Ownership/canibalización: `descuentos-de-sueldo` conserva `topicRole: owner` y `canonicalTopic: clasificacion-descuentos-sueldo`; sin URL nueva.
- Fecha de corte visible: `articleLead.validAsOf: 2026-10-20` y "Revisado el: 2026-10-20".
- Prompt-injection: sin instrucciones sospechosas en las fuentes (ver dossier).
- Hero image: sin cambios; `check:hero-*` no se ejecutaron (la pieza ya está en `draft: false` y no se tocó el hero).
- Registro de actualización (NORMA_YMYL §5.3): qué cambió = clasificación de cuota sindical y CCAF, regla de atrasos, tabla de bases y topes, fuente principal del art. 58, matices AFC/salud; por qué = hallazgos P1/P2 confirmados en la calibración CAL-04; fuentes = ver `sources.yaml`.

## Pendiente para el HumanEditor / sesiones siguientes

1. Sesión fresca (otra familia de modelo): `05-math-audit.md`, `06-compliance.md` y `02-result.json` con `humanSignoff: null` hasta la revisión humana. Verificar en especial las divergencias 1–9 del dossier, O1 y O2.
2. Decidir: `computedAt`, `updatedDate` de las páginas relacionadas, `lastVerified` de `codigo-del-trabajo.md` y la fecha de la entrada de `correcciones.json` (hoy 2026-10-20).
3. Inspeccionar el build (JSON-LD de `FAQPage`/`Article`, orden de la tabla de bases, enlaces del callout a `/correcciones/`).
4. Causa siguiente: AFC / seguro de cesantía (incluye la línea del 0,6% universal en `liquidacion-de-sueldo` y todo `seguro-de-cesantia`).

## Decisiones de fechas y portadas (Codex, 2026-10-20)

- `reviewPolicy.computedAt` se mantiene en **2026-10-04** hasta que exista
  `humanSignoff`. Ese campo alimenta `lastReviewed` y no debe afirmar una
  revisión humana que todavía no ocurrió.
- `updatedDate` de las páginas relacionadas y `lastVerified` de
  `codigo-del-trabajo.md` se mantienen en su última revisión completa. Se
  actualizan al firmar/publicar, no en el draft.
- La entrada de `correcciones.json` conserva `date: 2026-10-20`; si el merge
  ocurre otro día, se ajusta a la fecha de publicación.
- Las portadas no se regeneran: los bytes de imagen no cambiaron. Las huellas
  actualizadas solo reflejan el nuevo `sourceContentHash`; la revisión visual
  existente sigue vigente.

## Evidencia de gates (ejecutados por el DraftAgent en el worktree; no equivalen a revisión independiente)

Corridas del 2026-10-20 en el worktree `/tmp/claude-1000/wt-descuentos` (rama `fix/descuentos-de-sueldo-art58-2026-10-20`, base `origin/main` aa29da3f). Son evidencia del DraftAgent, no del auditor.

| Gate | Resultado |
| --- | --- |
| `pnpm run check:ci` (espejo local: lint, `format:check`, `test:coverage`, boundaries, docs, `check:audit-artifacts`, frontmatter, legal-citations, hero-images, hero-prompts, image-curation, image-delivery, risk-tiers, correcciones, editorial, timeliness, no-postid-urls, routes, astro check, workers, economic-source-consistency, catalog-drift, article-registration, official-host-registry, homepage-surface-freshness, small-details) | exit 0; 204 archivos de test, 1975 pasan, 1 skipped. `small-details` solo advierte 2 puntos preexistentes ajenos a este cambio. |
| `EDITORIAL_ENFORCE=1 pnpm run check:editorial` | OK (`check-editorial-artifacts` strict: 48/48 YMYL compliant). |
| `pnpm run check:frontmatter` / `check:links` / `check:correcciones` / `check:dialect` / `check:editorial-timeliness` / `check:risk-tiers` | OK (links: 279 internos, 0 rotos; correcciones: 18 entradas válidas). |
| `pnpm exec vitest run tests/static-analysis/descuentos-clasificacion-guard.test.ts` | 8/8 (guarda nueva; las frases corregidas existen en `origin/main`, por lo que la guarda falla contra el texto anterior). |
| `pnpm exec astro build` + `check:indexable-url-freeze`, `check:toc-i18n`, `check:editorial-guard`, `check:no-postid-urls`, `check:routes`, `check:rss` | OK. HTML construido: canonical `https://monedario.cl/posts/descuentos-de-sueldo/` sin cambio, `dateModified` 2026-10-20, secciones nuevas presentes, sin la URL 60593. Rutas y RSS sin altas ni bajas atribuibles a este cambio (la alta `cotizacion-voluntaria-afp-independiente` es preexistente). |
| No ejecutados | `pnpm run build` completo (incluye `check:urls` con red), `check:urls:external:audit`, Playwright/a11y, `check:hero-images` con la pieza en `draft: false` (la pieza ya lo está y el hero no cambió; el gate pasó en `check:ci`). |

**Observación de datos estructurados:** el HTML construido contiene `BlogPosting`/`BreadcrumbList` y no `FAQPage`, porque este post usa preguntas en negrita y `ArticleJsonLd` solo autoextrae `###` (preexistente; no se cambió).

