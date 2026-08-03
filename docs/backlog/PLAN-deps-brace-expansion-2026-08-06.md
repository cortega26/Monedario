# PLAN — Cerrar alerts brace-expansion (1.1.17 / 5.0.8) el 2026-08-06

**Estado:** PENDIENTE — programado para 2026-08-06 (cumplen 7 días las parcheadas)
**Inicio:** 2026-08-03
**Fuente:** alerts #95/#96 (GHSA-rgw5-rvv9-x895, HIGH) · límite de pnpm descubierto el 03-08
**Contexto:** fast-uri 3.1.5 ya cerrada (commit `aba4f475`). brace-expansion no se pudo forzar el 03-08 porque `minimumReleaseAgeExclude` de pnpm solo exime **una versión por paquete**, y el lockfile necesita dos versiones de brace-expansion (1.1.x legacy vía `@lhci/cli@0.15.1` → chrome-launcher → rimraf@3 → glob@7 → minimatch@3; y 5.x vía eslint → minimatch@10), ambas publicadas el 2026-07-30 dentro de la ventana de 7 días.

## Qué hacer el 2026-08-06 (o después)

1. **Quitar la exclusión transitoria** de `brace-expansion@1.1.17` en
   `pnpm-workspace.yaml` (`minimumReleaseAgeExclude`) — 1.1.18 y 5.0.9 ya
   cumplen la política y la resolución natural las elegirá.
2. **Actualizar**: `pnpm update brace-expansion` (sin flags — la política deja
   pasar 1.1.18 y 5.0.9 desde el 06-08).
3. **Verificar**:
   ```bash
   pnpm why brace-expansion   # → 1.1.18 y 5.0.9
   pnpm audit                 # → 0 vulnerabilidades
   pnpm install               # check de política OK
   ```
4. **Commit** tipo `fix(deps): cerrar alerts brace-expansion 1.1.18/5.0.9`.
5. Las alerts #95/#96 de GitHub se cierran solas al re-escanear el lockfile.

## Notas

- El 07-08: quitar también el override + exclusión de `fast-uri@^3.0.1: 3.1.5`
  (ya madura; un `pnpm update fast-uri` natural la mantiene).
- No reintentar overrides de brace-expansion antes del 06-08: el exclude de
  pnpm no admite 2 versiones del mismo paquete (verificado empíricamente el
  03-08 con `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` en ambas direcciones de
  orden).
- `@lhci/cli@0.15.1` es la última versión: la rama legacy 1.1.x no se elimina
  por bump (solo parcheando brace-expansion).
