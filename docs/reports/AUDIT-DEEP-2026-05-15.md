# Auditoría profunda Monedario — 2026-05-15

> **Tipo:** Auditoría estática del estado actual.
> **Alcance:** Técnico-código · Performance + dependencias · DevOps/Editorial/Docs.
> **Fuera de alcance:** Seguridad y SEO/A11y drift (recién auditados en mayo 2026), tendencias 90d, runtime profiling, aplicación de fixes.
> **Plan:** [.claude/plans/peppy-chasing-toucan.md](../../.claude/plans/peppy-chasing-toucan.md)

---

## Resumen ejecutivo

| Severidad | Conteo | Esfuerzo agregado |
|---|---|---|
| **P0** (bloqueante) | 0 | — |
| **P1** (alto impacto) | 4 | ~2 días-ingeniero |
| **P2** (mejora) | 9 | ~4 días-ingeniero |
| **P3** (higiene) | 6 | ~1.5 días-ingeniero |
| **Total** | **19** | **~7.5 días-ingeniero** |

**Estado general:** saludable. Arquitectura DDD limpia (0 dependencias circulares), 0 console.log y 0 TODOs reales en src/, type-safety estricta (3 escapes legítimos documentados), 0 vulnerabilidades, 0 drafts pendientes, 46/46 YMYL compliant. La auditoría confirma que **no hay deuda técnica P0** y los hallazgos son refinamientos de eficiencia y limpieza.

**Nota sobre workflows Claude:** `claude.yml` fue removido en mayo 2026 (PR #155) pero `claude-code-review.yml` (workflow distinto, integración oficial `anthropics/claude-code-action@v1`) sigue activo. Es deseable; solo le falta `timeout-minutes`. Ver TD-0073.

---

## Top 5 quick wins

Recomendados para una sesión corta de implementación (estimación: <3 horas total):

1. **Eliminar `dayjs`, `node-fetch`, `remark-toc` de `package.json`** — 0 imports reales, reduce supply chain. Ver TD-0064.
2. **Archivar 6 scripts one-off completados** (`backfill-td-0057.mjs` y 5 más) a `archive/scripts/`. Ver TD-0072.
3. **Añadir `timeout-minutes: 15` a `claude-code-review.yml`** — única inconsistencia entre 14 workflows. Ver TD-0073.
4. **Crear READMEs faltantes** en `docs/{archive,domain,editorial,reports}/`. Ver TD-0074.
5. **Excluir `/dev/hero-images/` del build de producción** (env flag `BUILD_DEV_PAGES=0`) — 214 KB HTML + 186 KB JS no necesarios en prod. Ver TD-0066.

---

## 1. Calidad de código y arquitectura

### 1.1 Métricas baseline

| Métrica | Valor | Interpretación |
|---|---|---|
| LOC src/ | ~32,000 | Mediano |
| LOC tests/ | ~8,700 | Ratio test/src ≈ 1:3.7 — saludable |
| Archivos src/ (ts/tsx/astro/mjs) | 186 | — |
| Archivos test (.test.ts) | 80 | 17 application + 9 infrastructure + 13 a11y + 11 integration + 7 e2e + otros |
| Calculadoras `.astro` | 19 (+ index) | — |
| Use-cases TS | 17 (+5 shared) | 14 con test directo, 3 sin |
| Dependencias circulares | **0** | Excelente |
| Type assertions (`as any`/`as unknown as`) | 2 | Ambas legítimas (mutación local + BodyInit) |
| `@ts-ignore`/`@ts-expect-error` | 1 | `pagefind` sin tipos — legítimo |
| `eslint-disable` en src/ | 1 | Página dev — legítimo |
| `console.log\|warn\|error` en src/ | **0** | Limpio |
| Duplicación (jscpd, min 15 lines/100 tokens) | 18 clones · 0.84% | Bajo; algunos extraíbles |

### 1.2 Hallazgos

| ID | Severidad | Hallazgo | Evidencia | Esfuerzo |
|---|---|---|---|---|
| TD-0063 | P2 | **Páginas `.astro` >500 LOC** | 14 páginas >500 LOC; top: [sueldo-liquido.astro](../../src/pages/calculadoras/sueldo-liquido.astro) **2134 LOC**, [apv.astro](../../src/pages/calculadoras/apv.astro) 1026, [finiquito-indemnizacion.astro](../../src/pages/calculadoras/finiquito-indemnizacion.astro) 936 | M |
| TD-0067 | P2 | **Use-cases >200 LOC mezclan domain + formatting** | [SimulateRetirementProjection.ts](../../src/application/use-cases/SimulateRetirementProjection.ts) 301, [CalculateApvComparison.ts](../../src/application/use-cases/CalculateApvComparison.ts) 271, [EstimateFiniquito.ts](../../src/application/use-cases/EstimateFiniquito.ts) 234 | M |
| TD-0068 | P2 | **Cobertura de tests no medida** | `vitest.config` sin `coverage.provider`. 5 calculadoras sin test directo: comisiones-afp, conversor-uf, conversor-utm, deposito-a-plazo, interes-compuesto | S |
| TD-0069 | P3 | **Duplicación local entre calculadoras pares** | jscpd: deposito-a-plazo ↔ interes-compuesto (35 líneas), credito-consumo ↔ tarjeta-credito (32 líneas), conversor-uf ↔ conversor-utm (27 líneas), boleta-honorarios-liquido ↔ finiquito-indemnizacion (37 líneas) | S |
| TD-0070 | P3 | **Duplicación interna `HeroPromptWorkspace.jsx`** | Líneas 446-490 ≈ 462-511 (50 líneas casi idénticas) | XS |
| TD-0080 | P3 | **Hardcoded literals en use-cases sin etiqueta semántica** | Ej. `EstimateFiniquito.ts:145-147` (`0.3 / 0.5 / 0.8`), `CalculateMortgage.ts:82-83` (`0.001, 29.999`). Algunos ya tienen constantes (`DEFAULT_*`); homologar el resto | XS |

**Observación adicional:** la arquitectura DDD (`domain/` → `application/use-cases/` → `infrastructure/`) está bien respetada. El `slugifyStr()` y `fmt()` están centralizados. **No se observa duplicación de utilidades de formato CLP/UF/UTM/fecha.**

---

## 2. Performance y dependencias

### 2.1 Métricas baseline

| Métrica | Valor |
|---|---|
| `pnpm build:ci` (warm) | **8.7 s** |
| `dist/` total | 47 MB |
| HTML generados | 280 |
| Páginas indexadas Pagefind | 49 (3958 palabras) |
| Top JS chunk | `client.DTojXMD-.js` (React runtime) — **186 KB** |
| Top CSS chunk | `Footer.CSkDFKvF.css` (CSS global Tailwind) — **103 KB** |
| Top HTML | `tags/index.html` — **379 KB** (noindex) |
| Imágenes >200 KB en `public/` | **0** |
| Hero images total | 150 archivos · 5 MB |
| Vulnerabilidades (`pnpm audit --prod`) | **0** |
| Deps outdated | 8 (todas minor/patch) |

### 2.2 Hallazgos

| ID | Severidad | Hallazgo | Evidencia | Esfuerzo |
|---|---|---|---|---|
| TD-0064 | **P1** | **3 deps sin uso en `package.json`** | `dayjs` (0 imports en src/), `node-fetch` (`probe-external.mjs` usa fetch nativo), `remark-toc` (solo en comentario de [astro.config.ts:50](../../astro.config.ts#L50)) | XS |
| TD-0065 | P2 | **8 deps minor outdated** | `pnpm outdated`: astro 6.2→6.3, @astrojs/mdx 5.0.4→5.0.6, @astrojs/react 5.0.4→5.0.5, tailwindcss + @tailwindcss/vite 4.2→4.3, @playwright/test 1.59→1.60, eslint 10.3→10.4, openai 6.36→6.38 | S |
| TD-0066 | **P1** | **`/dev/hero-images/` se publica en prod (214 KB HTML + 186 KB JS)** | [src/pages/dev/hero-images.astro](../../src/pages/dev/hero-images.astro) tiene `<meta robots noindex,nofollow>` ✓ y no entra en `sitemap.xml` ✓ pero sí se renderiza en `dist/dev/hero-images/index.html`. El único `client:only="react"` del proyecto vive aquí, lo que tira `client.DTojXMD-.js` (186 KB) | S |
| TD-0075 | P2 | **`Footer.CSkDFKvF.css` 103 KB = CSS global Tailwind 4 sin inlining crítico** | [astro.config.ts:115](../../astro.config.ts#L115) `inlineStylesheets: "never"`. Tailwind 4 emite muchas `--tw-*` variables; el archivo aparece bajo nombre `Footer.*` porque es el primer componente del Layout que lo carga | M |
| TD-0076 | P2 | **HTML hotspots: `tags/index.html` 379 KB, `archives/index.html` 176 KB** | Tags ya tiene `noindex,follow` ✓. Archives lista todos los posts por año/mes sin lazy. Comprimibles con paginación o truncado | S |
| TD-0077 | P2 | **Astro features no adoptadas** | `astro.config.ts` no usa `prefetch`, `experimental.viewTransitions` ni `inlineStylesheets: "auto"`. Cada una requiere decisión documentada (adoptar/posponer/descartar) | M |
| TD-0078 | P3 | **Service Worker cache version manual sin auto-bump** | [public/sw.js](../../public/sw.js) `CACHE = "monedario-v1"`. Sin bump automático por build (hash de `package.json` o git SHA). Riesgo de cache stale tras deploy de cambios en `index.html` | S |
| TD-0079 | P3 | **Inter font dual `.ttf` + `.woff2` redundante** | [public/fonts/](../../public/fonts/) tiene `inter-latin-400.ttf` (23 KB) + `.woff2` (11 KB) y `inter-latin-900.ttf` (23 KB) + `.woff2` (11 KB). Los `.ttf` no son necesarios (woff2 cubre todos los navegadores soportados) | XS |
| TD-0081 | P3 | **Build secuencial: posible paralelización de checks pre-build** | Script [`build`](../../package.json) ejecuta `check:images && check:hero-images && check:frontmatter && check:legal-citations` secuencial. Build CI completo solo tarda 8.7 s warm, pero cold-build podría bajar 2-3 s paralelizando. Bajo impacto | S |

**Observación:** la decisión de mantener `inlineStylesheets: "never"` es probablemente **intencional** para maximizar cache HTTP de CSS (un solo `Footer.*.css` cacheado, no inline por página). Antes de cambiarla a `"auto"`, medir LCP en producción real y comparar.

---

## 3. DevOps, scripts y gobernanza editorial

### 3.1 Métricas baseline

| Métrica | Valor |
|---|---|
| Workflows GH Actions | **14** |
| Workflows con `timeout-minutes` | 13/14 (falta `claude-code-review.yml`) |
| Workflows con cron | 12 |
| Acciones reutilizables (`.github/actions/`) | 8 (`bootstrap-pnpm`, `enable-safe-automerge`, `upload-urlcheck-artifacts`, etc.) |
| Scripts `.mjs` totales | 78 (~20 K LOC) |
| Scripts huérfanos (sin referencia) | **6** |
| Top 3 scripts grandes (LOC) | `hero-images/prompt-plan.mjs` 1411 · `build-weekly-search-report.mjs` 1246 · `backfill-td-0057.mjs` 1106 |
| Subdirs `docs/` sin README | **4** de 12 |
| ADRs | 8 vigentes (última 2026-05-13) + README + template |
| Planes activos `docs/backlog/` | 7 |
| Editorial enforcement | **46/46 YMYL compliant** · 0 drafts vivos |
| Posts `reviewPolicy.computedAt` >60 días | **0** |

### 3.2 Mapa de crons (UTC)

```
DIARIOS:
  05:00 ci.yml
  05:30 security-scans.yml
  06:00 data-signals.yml
  10:15 refresh-economic-snapshot.yml

LUNES (concentración matutina):
  07:00 hero-images-generate.yml
  08:15 weekly-search-ops.yml
  09:00 editorial-timeliness-audit.yml
  09:30 check-ts7-readiness.yml
  10:00 lighthouse-ci.yml

MARTES: 08:30 guardrail-drift-audit.yml
JUEVES: 08:00 doc-gardening.yml
MENSUAL (día 1): 09:15 check-afp-commissions.yml
```

Concentración lunes 07-10 UTC = 5 workflows escalonados cada 15-45 min. **No es concurrencia real** (están separados), pero un fallo de runner GH ese rango impacta el 35% del calendario semanal.

### 3.3 Hallazgos

| ID | Severidad | Hallazgo | Evidencia | Esfuerzo |
|---|---|---|---|---|
| TD-0071 | **P1** | **`MODULE_INDEX.md` referencia `tests/` y `output/validation/` correctamente, pero los 6 scripts huérfanos no aparecen ni en index ni en archivo** | Drift implícito de gobernanza | XS |
| TD-0072 | **P1** | **6 scripts one-off completados siguen vivos en `scripts/`** | `backfill-td-0057.mjs` (1106 LOC, completado 2026-05-11), `download-og-fonts.mjs`, `editorial-copy-rules.mjs`, `lighthouse-audit.mjs` (wrapper viejo, ahora hay `lhci`), `migrate-responsive-heroes.mjs`, `normalize-frontmatter.mjs`. Ninguno referenciado en `package.json` ni en workflows | XS |
| TD-0073 | P2 | **`claude-code-review.yml` sin `timeout-minutes`** | Único workflow sin timeout entre 14. Usa `anthropics/claude-code-action@v1` (vigente y deseable). Solo falta el timeout-minutes para evitar runaway runs | XS |
| TD-0074 | P2 | **4 subdirs `docs/` sin README** | `docs/archive/`, `docs/domain/`, `docs/editorial/`, `docs/reports/`. Cada uno requiere README con propósito + tabla de contenidos | S |
| TD-0082 | P3 | **Backlog `docs/backlog/` tiene 7 planes vigentes — clasificar** | Algunos parcialmente cerrados (`PLAN-publish-signed-off-sprint-2b-articles-2026-05-11.md` ya ejecutado per README backlog). Crear `docs/backlog/STATUS.md` o tabla en `README.md` que clasifique vigente / parcialmente cerrado / archivable | S |

**Observaciones positivas:**
- **Editorial pipeline saludable:** `EDITORIAL_ENFORCE=1 pnpm run check:editorial-artifacts` = `compliant=46 non_compliant=0`. Todos los YMYL tienen artefactos canónicos en `artifacts/editorial/<slug>/<run-id>/`. Separation of duties enforced en código.
- **`bootstrap-pnpm` action correctamente ordenada** (`npm install pnpm` → `setup-node@v6 cache:pnpm` → `pnpm install --frozen-lockfile`) — el fix previo (memoria `feedback_bootstrap_pnpm_cache_order.md`) está vigente.
- **0 posts con `computedAt` >60 días** — contenido activamente fresco.
- **`MODULE_INDEX.md` coherente** con estructura actual.

---

## 4. Backlog generado para `TECH_DEBT_BACKLOG.md`

Los IDs siguen el formato vigente (`TD-0063` continúa la secuencia tras `TD-0062`). Se proponen agrupados por dimensión.

| ID | Título corto | Sev. | Esfuerzo |
|---|---|---|---|
| **TD-0063** | Componentizar páginas `.astro` >500 LOC (top 3: sueldo-liquido, apv, finiquito) | P2 | M |
| **TD-0064** | Eliminar deps unused: `dayjs`, `node-fetch`, `remark-toc` | P1 | XS |
| **TD-0065** | Bump 8 deps minor outdated (Astro 6.2→6.3, Tailwind 4.2→4.3, Playwright 1.59→1.60, etc.) | P2 | S |
| **TD-0066** | Excluir `/dev/hero-images/` del build de producción | P1 | S |
| **TD-0067** | Refactor use-cases >200 LOC: extraer formateo de domain logic | P2 | M |
| **TD-0068** | Configurar `vitest --coverage` y cubrir 5 calculadoras sin test directo | P2 | S |
| **TD-0069** | Extraer layout/componente compartido entre calculadoras-pares duplicadas | P3 | S |
| **TD-0070** | Deduplicar `HeroPromptWorkspace.jsx:446-511` | P3 | XS |
| **TD-0071** | Sincronizar `MODULE_INDEX.md` tras archivado de scripts one-off | P1 | XS |
| **TD-0072** | Archivar 6 scripts one-off completados a `archive/scripts/` | P1 | XS |
| **TD-0073** | Añadir `timeout-minutes` a `claude-code-review.yml` + actualizar memoria | P2 | XS |
| **TD-0074** | Crear README en `docs/{archive,domain,editorial,reports}/` | P2 | S |
| **TD-0075** | Evaluar `inlineStylesheets: "auto"` vs `"never"` con medición LCP real | P2 | M |
| **TD-0076** | Comprimir `tags/index.html` (379 KB) y `archives/index.html` (176 KB) | P2 | S |
| **TD-0077** | Decisión documentada sobre Astro features: prefetch, viewTransitions, inlineStylesheets | P2 | M |
| **TD-0078** | Auto-bump `CACHE` version en `public/sw.js` por build | P3 | S |
| **TD-0079** | Eliminar `.ttf` redundantes de `public/fonts/inter-latin-{400,900}.ttf` | P3 | XS |
| **TD-0080** | Etiquetar magic numbers en use-cases (extraer a constantes nombradas) | P3 | XS |
| **TD-0081** | Paralelizar checks pre-build (`Promise.all` o `concurrently`) | P3 | S |
| **TD-0082** | Tabla `STATUS` en `docs/backlog/README.md` clasificando 7 planes vigentes | P3 | S |

**Total: 20 entradas TD nuevas.** Cuando se redacten al backlog, cada una debe seguir el formato canónico (`Descripción`, `Evidencia`, `Impacto`, `Riesgo`, `Severidad 1-5`, `Urgencia P0-P3`, `Esfuerzo XS/S/M/L`, `Propuesta de solución`, `Criterios de cierre (checklist)`).

---

## 5. Métricas baseline (para próximas auditorías)

Capturadas el 2026-05-15. Comparar en próximas auditorías para detectar drift.

```yaml
codebase:
  loc_src: ~32000
  loc_tests: ~8700
  files_src: 186
  files_tests: 80
  calculadoras: 19
  use_cases_with_test: 14/17
  circular_deps: 0
  type_escapes: 3
  jscpd_percentage: 0.84

performance:
  build_ci_seconds: 8.7
  dist_total_mb: 47
  html_count: 280
  top_js_chunk_kb: 186  # client.DTojXMD-.js
  top_css_chunk_kb: 103  # Footer.CSkDFKvF.css
  top_html_kb: 379  # tags/index.html
  vulnerabilities: 0
  deps_outdated: 8

devops:
  workflows: 14
  workflows_with_timeout: 13
  scripts_total: 78
  scripts_orphan: 6
  docs_subdirs_no_readme: 4
  adrs_total: 8

editorial:
  posts_published: 50
  posts_draft: 0
  ymyl_compliant: 46/46
  computed_at_stale: 0
```

---

## 6. Verificación

Esta auditoría se ejecutó con los siguientes comandos reproducibles:

```bash
# Fase 1
grep -rEn "as\s+any|as\s+unknown\s+as" src/
grep -rn "@ts-ignore|@ts-expect-error|@ts-nocheck" src/
grep -rn "eslint-disable" src/
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.astro" \) -exec wc -l {} \;
grep -rEn "client:(load|idle|visible|media|only)" src/ --include="*.astro"
npx --yes madge --circular --extensions ts,tsx,astro src/
npx --yes depcheck --skip-missing
npx --yes jscpd src/ --min-lines 15 --min-tokens 100 --reporters json --output /tmp/jscpd-out

# Fase 2
time pnpm build:ci
du -sh dist/
find dist/_astro -name "*.js" -exec du -b {} \; | sort -n | tail -15
find dist -name "*.html" -exec du -b {} \; | sort -n | tail -10
pnpm audit --prod
pnpm outdated --long

# Fase 3
for f in .github/workflows/*.yml; do grep -E "^[[:space:]]+- cron:" "$f"; done
for f in scripts/*.mjs; do grep -l "$(basename $f)" package.json .github/workflows/*.yml; done
for d in docs/*/; do test -f "${d}README.md" || echo "missing $d"; done
EDITORIAL_ENFORCE=1 pnpm run check:editorial-artifacts
```

Para validar este informe: ejecutar los comandos anteriores y contrastar contra la sección 5 (baseline).

---

## 7. No abordado en esta sesión

Por acuerdo de alcance:

- **Seguridad y SEO/A11y drift:** recién auditados en mayo 2026 — ver `OWASP_SECURITY_AUDIT_2026-05-11.md` (SEC-003 pendiente), `project_a11y_audit_2026-05-11`, `project_seo_audit_may2026`.
- **Tendencias 90 días:** sin git log evolution, sin churn vs complexity.
- **Runtime profiling:** sin Playwright traces, sin dev-server warnings, sin Lighthouse en runtime (solo bundle estático).
- **Aplicación de fixes:** este informe es base de planificación; los TDs se ejecutan en sesiones siguientes.

---

**Generado por:** Claude Code (Opus 4.7) · 2026-05-15
**Plan original:** `.claude/plans/peppy-chasing-toucan.md`
**Próximo paso sugerido:** revisión humana (Carlos Ortega) y promoción de TD-0063..TD-0082 a `docs/TECH_DEBT_BACKLOG.md`.
