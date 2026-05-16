# Plan: remediacion auditoria profunda 2026-05-15

Fuente: `docs/reports/AUDIT-DEEP-2026-05-15.md`.

## Alcance de esta sesion

- Implementar quick wins y el primer bloque de testabilidad: `TD-0064`, `TD-0068`, `TD-0070`, `TD-0071`, `TD-0072` parcial, `TD-0073`, `TD-0074`, `TD-0080`, `TD-0082`.
- Registrar decisiones o bloqueos cuando la auditoria ya no coincide con el estado real del repo.
- Preservar contratos publicos: no tocar rutas, RSS, canonicals, frontmatter ni contenido YMYL.

## Fuera de alcance

- `TD-0063`, `TD-0067`, `TD-0069`, `TD-0075`, `TD-0076`, `TD-0077`, `TD-0078`, `TD-0081`.
- Bumps de dependencias minor (`TD-0065`) salvo que sean consecuencia directa de `pnpm remove`.
- Cambios arquitecturales que requieran ADR o medicion LCP real.

## Invariantes y contratos preservados

- `URL.PUBLIC.NO_POST_ID` / `CONTRACT.PUBLIC_URLS`: no se modifica construccion de URLs publicas.
- `ROUTES.NO_SILENT_CHANGES` / `CONTRACT.ROUTES_SNAPSHOT`: no se agregan ni remueven rutas publicas.
- `RSS.NO_REMOVALS` / `CONTRACT.RSS_POLICY`: no se modifica RSS.
- `FRONTMATTER.VALID` / `CONTRACT.FRONTMATTER_POLICY`: no se modifica frontmatter.

## Progreso

- [x] Crear plan canónico en `docs/backlog/`.
- [x] `TD-0064`: eliminar `dayjs`, `node-fetch`, `remark-toc`.
- [x] `TD-0068`: configurar coverage y cubrir calculadoras huérfanas.
- [x] `TD-0070`: deduplicar `HeroPromptWorkspace.jsx`.
- [x] `TD-0071`: actualizar `context/MODULE_INDEX.md`.
- [x] `TD-0072`: archivar scripts one-off realmente no referenciados.
- [x] `TD-0073`: agregar `timeout-minutes: 15`.
- [x] `TD-0074`: crear READMEs faltantes.
- [x] `TD-0080`: etiquetar literales normativos/guardrails en top 3 use-cases.
- [x] `TD-0082`: clasificar planes vigentes y archivar planes cerrados.
- [x] Actualizar backlog con estado/evidencia.
- [x] Ejecutar verificaciones.

## Notas de ajuste contra auditoria

- `.claude/plans/peppy-chasing-toucan.md` no existe en el arbol actual; este plan reemplaza el punto de reanudacion operativo requerido por Rule 2.13.
- `scripts/editorial-copy-rules.mjs` no se puede archivar: esta importado por `scripts/check-editorial-guard.mjs` y `scripts/audit-reader-facing-copy.mjs`.
- `scripts/download-og-fonts.mjs` no se puede archivar en este lote: `src/utils/loadGoogleFont.ts` lo referencia como mecanismo de regeneracion de fuentes locales para OG.
- `TD-0079` queda bloqueado/pospuesto: `src/utils/loadGoogleFont.ts` rechaza WOFF2 para Satori, por lo que los `.ttf` de Inter no son redundantes para el flujo OG actual.
- `pnpm remove dayjs node-fetch remark-toc` tambien sincronizo parcialmente el lockfile con versiones ya declaradas en `package.json` para Astro/Tailwind/OpenAI/Playwright; no cierra `TD-0065`.

## Change Control Record

1. Scope declaration
- In scope: archivos listados en este plan y cambios puntuales de quick wins.
- Out of scope: rutas/RSS/canonical/YMYL/refactors grandes/ADR-dependent work.

2. Impacted modules
- `package.json`, `pnpm-lock.yaml`: limpieza de dependencias.
- `.github/workflows/claude-code-review.yml`: timeout.
- `archive/scripts/`, `scripts/`: archivado reversible de one-offs sin referencias activas.
- `context/MODULE_INDEX.md`, `docs/*/README.md`, `docs/TECH_DEBT_BACKLOG.md`: gobernanza/documentacion.
- `src/tools/hero-images/HeroPromptWorkspace.jsx`: deduplicacion local en herramienta dev.
- `eslint.config.js`, `.gitignore`: excluir scripts archivados del lint activo y permitir versionar este plan.
- `astro.config.ts`, `src/dev-pages/hero-images.astro`, `README.md`: `TD-0066`, gate dev-only para `/dev/hero-images/`.
- `vitest.config.ts`, `package.json`, `.github/workflows/ci.yml`: `TD-0068`, coverage V8 y gate CI.
- `src/application/use-cases/CompareAfpCommissions.ts`, `CalculateTermDeposit.ts`, `CalculateCompoundInterest.ts`: `TD-0068`, fórmulas extraídas desde calculadoras Astro.
- `tests/application/*`, `tests/domain/*`: `TD-0068`, tests directos para calculadoras huérfanas y soporte de coverage de dominio.
- `src/application/use-cases/EstimateFiniquito.ts`, `src/application/use-cases/CalculateApvComparison.ts`, `src/application/use-cases/CalculateMortgage.ts`: `TD-0080`, constantes semanticas para bandas legales/topes/guardrails.
- `docs/backlog/README.md`, `docs/archive/backlog/`: `TD-0082`, tabla de estado de planes vigentes y archivado de planes cerrados.

3. Invariant preservation
- Referenced invariants: `URL.PUBLIC.NO_POST_ID`, `ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS`, `FRONTMATTER.VALID`.
- Preservation proof: no se editan helpers de URL, rutas, RSS, sitemap ni frontmatter.

4. Contract preservation
- Referenced contracts: `CONTRACT.PUBLIC_URLS`, `CONTRACT.ROUTES_SNAPSHOT`, `CONTRACT.RSS_POLICY`, `CONTRACT.FRONTMATTER_POLICY`.
- Breaking changes: no.

5. Boundary integrity
- Layer boundary check (`pnpm run check:boundaries`): pass.
- Unauthorized cross-layer imports introduced: no esperado.

6. Test coverage impact
- Changed runtime layers: herramienta dev React, utilidades de tooling/docs y use-cases de aplicacion sin cambio de formula esperado.
- Related tests added/updated: ninguno esperado.
- Coverage threshold status: no aplica a este lote; `pnpm run test` pasa.

7. Rollback strategy
- Revert unit: revertir este lote de archivos; scripts archivados pueden volver desde `archive/scripts/`.
- Data/content rollback needed: no.

8. Regression risk
- Risk level: bajo.
- Primary regression vectors: referencia oculta a script archivado, lockfile inconsistente, UI dev de hero prompts.
- Mitigations: busqueda `rg`, gates focalizados, `pnpm install --lockfile-only`, `pnpm run check:context`, `pnpm run test` o subset viable.

## Evidencia de verificacion

- `pnpm exec prettier --check ...`: pass.
- `pnpm run format:check`: pass.
- `pnpm run check:context`: pass.
- `pnpm run check:docs`: pass.
- `pnpm run check:boundaries`: pass.
- `pnpm run lint`: pass.
- `pnpm run test`: pass (76 files, 566 tests).
- `pnpm run check`: pass.
- `pnpm run build`: pass.
- `pnpm run check:routes`: pass; no removals, existing baseline reports 11 additions.
- `pnpm run check:rss`: pass; no removals, existing baseline reports 35 additions.
- `TD-0066`: `rm -rf dist && pnpm run build` pass; `find dist/dev -name '*.html'` sin salida; `find dist/_astro -name 'client.*.js'` sin salida.
- `TD-0066`: `pnpm run dev -- --host 127.0.0.1` + `curl -I http://localhost:4321/dev/hero-images/` respondio `200 OK`.
- `TD-0068`: `pnpm run test:coverage` pass; 82 test files, 586 tests, coverage lines 90.16% sobre `src/application/**` + `src/domain/**`.
- `TD-0068`: `pnpm run astro -- check`, `pnpm run lint`, `pnpm run check:boundaries` pass.
- `TD-0080`: `pnpm run test -- --run src/application/use-cases` pass.
- `TD-0082`: `pnpm run check:docs` pass.
- `npx --yes jscpd src/tools/hero-images/HeroPromptWorkspace.jsx --min-lines 15 --min-tokens 100 --reporters console`: 0 clones.
- `npx --yes depcheck --skip-missing`: target deps removed; remaining output is known tooling false positives.

## Competitive Adaptation Appendix

- benchmarkSet: no aplica.
- patternHypothesis: no aplica.
- localDelta: no aplica.
- nonCopyBoundaries: no aplica.
- ownerTarget: no aplica.
- successSignal: quick wins cerrados con gates locales.
- ownership conflict check: no aplica; no hay nueva superficie visible/indexable.
