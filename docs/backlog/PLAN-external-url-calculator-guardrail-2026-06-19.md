# Plan: guardrail de fuentes externas para nuevas calculadoras

Fecha: 2026-06-19
Estado: Completado

## Scope

- In scope: fuente SII de la calculadora IVA, gate PR de URLs externas, política/ADR asociados y procedimiento de cierre para nuevas calculadoras.
- Out of scope: fórmula IVA, diseño, rutas públicas, contenido editorial ajeno y reclasificación de hosts.
- Operaciones: parche mínimo, documentación contractual y verificación.

## Autoridad e invariantes

- `docs/AI_ENGINEERING_CONSTITUTION.md` §1, §5 y §6.
- `INVARIANT.URLCHECK.EXTERNAL_LINK_POLICY` y `CONTRACT.EXTERNAL_URLCHECK`.
- `URL.PUBLIC.NO_POST_ID`: no se modifica identidad ni construcción de URLs públicas.
- ADR aplicable: `docs/adr/ADR-20260412-external-link-ci-gate.md`.

## Diagnóstico

El checker externo detectaba enlaces oficiales rotos en cada PR, pero el job tenía `continue-on-error: true` por el rollout de fase 1. Por ello una URL SII con HTTP 404 pudo mergearse. Los tests del motor y del portafolio no sustituyen la validación HTTP de fuentes renderizadas.

## Pasos

- [x] Reemplazar la URL SII rota por una fuente oficial vigente y verificarla.
- [x] Promover el job PR a gate bloqueante.
- [x] Sincronizar ADR, contrato e invariante con fase 2.
- [x] Documentar el checklist de creación/publicación de calculadoras.
- [x] Ejecutar gates y registrar evidencia, riesgo y rollback.

## Riesgo y rollback

- Riesgo: una clasificación HTTP determinista incorrecta podría bloquear PRs.
- Mitigación: errores de red/timeout permanecen no bloqueantes; solo `hard_fail`, `soft_404` y `host_mismatch` de hosts oficiales/confiables bloquean.
- Rollback: restaurar temporalmente `continue-on-error: true` mediante un cambio explícito de política y registrar el motivo en este ADR; la corrección del enlace SII es independiente.

## Evidencia de cierre

- URL SII: HTTP 200, destino sin redirección fuera del host.
- `pnpm run check:urls:canary`: pass.
- `pnpm run build:ci`: pass; 307 páginas construidas.
- `pnpm run check:urls:external:ci`: pass; 421 URLs, `blocking=0`, un `redirect_mismatch` no bloqueante de `www.ingresa.cl`.
- `pnpm run test`: pass; 105 archivos, 770 tests.
- `pnpm run check:boundaries`: pass.
- `pnpm run format:check`: pass.
- `pnpm exec eslint src/pages/calculadoras/iva.astro`: pass.
- `pnpm run check:context` y `pnpm run check:docs`: pass.
- `pnpm run lint`: bloqueado por worktrees ajenos bajo `.claude/worktrees/` que generan múltiples candidatos a `tsconfigRootDir`; no causado por este diff.
- `pnpm run check`: avanza hasta `check:hero-prompts` y se bloquea por drift previo `.mdx`/`.md` de `el-poder-del-interes-compuesto`; fuera de scope.

## Resultado y rollback

- La fuente IVA ahora apunta a la FAQ oficial específica del SII.
- Los fallos deterministas de fuentes oficiales/confiables bloquean PR antes de merge.
- El checklist enlazado desde `AGENTS.md` convierte build + validación externa en condición explícita para futuras calculadoras.
- Rollback documentado arriba; no se requirió cambio de ruta, fórmula ni contrato público.
