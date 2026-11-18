# Plan: reparación de fallos sistémicos de CI (PRs Dependabot + workflows programados)

Status: en ejecución
Owner: repository owner
Started: 2026-11-18

## Task Brief

- Objective: eliminar las causas raíz que mantienen en rojo los 4 PRs abiertos
  y 7 workflows programados, sin relajar gates YMYL ni marcar gates humanos.
- In scope: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`,
  `.github/dependabot.yml`, `.github/actions/bootstrap-python/`,
  `.github/workflows/{self-heal,repo-doctor,guardrail-drift-audit,editorial-timeliness-audit,growth-opportunities,doc-gardening,check-afp-commissions,weekly-search-ops,refresh-uf-history}.yml`,
  `docs/operations/runbooks/actions-quota-bridge.md`,
  `docs/adr/ADR-20261026-weekly-uf-ingestion.md`,
  `docs/operations/ops-schedule.json`, `tests/static-analysis/`,
  `docs/backlog/`.
- Out of scope: `src/**` (runtime), rutas/URLs/RSS, contenido editorial YMYL
  (`src/data/blog/**`), imágenes, calculadoras, semántica de gates de
  publicación.
- Operation type: bugfix de CI/tooling con cambios mínimos y tests.

## Diagnóstico (evidencia)

1. **Tipos Shiki duplicados.** Astro 7.3.8/7.4.5/7.4.7 bundlean `shiki` 4.3.1;
   `@shikijs/transformers` resolvía 4.5.0 (main, #780) o 4.6.0 (#781) y pnpm
   instalaba dos copias de `@shikijs/types`. `astro check` falla con TS2322 en
   `astro.config.ts` (3 errores). Reproducido en worktrees de #780 y #781;
   el pin a 4.3.1 deja 0 errores.
2. **Wrangler hardcodeado en un test.** `analytics-collector-workflow.e2e.test.ts`
   exigía `wrangler === "4.153.0"`; cualquier bump de Dependabot falla sin
   aportar verificación (el `wrangler deploy --dry-run` ya valida contra la API).
3. **Cuota de storage agotada.** Los 6 workflows de reporte fallan en el último
   step con `Failed to CreateArtifact: Artifact storage quota has been hit`.
   La cuota de GitHub Free (500 MB) es de cuenta y se comparte con Packages;
   los artifacts de este repo suman 349 KB, así que el consumo es externo.
4. **ENOSPC en el runner.** `/home/runner` es tmpfs de 512 MiB; `uv` cacheaba en
   `~/.cache/uv` y `uv sync` murió con `os error 28` (python-deps-autoupdate).
5. **Heartbeat UF demasiado estricto.** La serie estaba 23 días adelantada; el
   workflow exige avance semanal → rojo permanente (ver enmienda del ADR).
6. **Lockfile Dependabot vs `minimumReleaseAge`.** #779 no instala porque
   postcss 8.5.33 es más joven que la política de 7 días. Es transitorio: el
   paquete madura y el PR se rebasa; no se toca la política.
7. **SLA editorial vencido.** 6 artículos fuera de ventana y
   `sueldo-imponible-chile.md` con `expectedValue` de UTM obsoleto. Requiere
   revisión editorial humana; no se modifica contenido en este cambio.

## Decisiones

- Alinear `@shikijs/transformers` al `shiki` de Astro con pin exacto + guard
  (`tests/static-analysis/shiki-single-type-identity.e2e.test.ts`) y `ignore`
  de Dependabot para que el bump sea coordinado.
- Mantener el test de wrangler intacto (es un pin validado) y sacar `wrangler`
  de Dependabot con recordatorio mensual en `ops-schedule.json`.
- `continue-on-error` a nivel de step en las subidas de artifacts
  **diagnósticas**, nunca en el step de auditoría (ver ADR-20261118).
- `UV_CACHE_DIR` al volumen de trabajo del runner.
- Heartbeat UF por horizonte (enmienda del ADR-20261026).

## Fases

1. Shiki: pin exacto + lockfile + guard. Verificación: `astro check` 0 errores
   y el guard falla con `^4.6.0`.
2. Dependabot: `ignore` de `@shikijs/transformers` y `wrangler` + recordatorios.
3. Artifacts: `continue-on-error` en uploads de diagnóstico + issue de
   weekly-search-ops refleja el estado de subida.
4. uv cache: `UV_CACHE_DIR` en `$RUNNER_TEMP/uv-cache`.
5. UF: heartbeat por horizonte.
6. Documentación: runbook de cuota, ADR, deuda técnica.
7. PR único; al mergear, recrear #781 y rebasar #779/#780.

## Verificación

- `pnpm exec vitest run tests/static-analysis` (incluye los guards nuevos).
- `pnpm run astro check`.
- `pnpm run check:ci` (sin build) y `pnpm run format:check`.
- `bash -n` sobre workflows no aplica; la validación es el parseo YAML de los
  tests de static-analysis.
- Revisión manual del diff de `pnpm-lock.yaml`: solo entradas shiki/core/
  primitive/transformers.

## Riesgos y rollback

- Riesgo: bajo. El pin de Shiki es reversible con un revert; los uploads
  diagnósticos siguen mostrando el step en rojo en la UI aunque el job no
  falle.
- Rollback: revert del commit único; no hay cambios de datos ni de rutas.
- Riesgo residual: si la cuota de Packages se restaura, hay que quitar
  `continue-on-error` (condición declarada en el ADR).
