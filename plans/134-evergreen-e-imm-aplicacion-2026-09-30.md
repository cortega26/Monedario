# Plan 134 — Aplicación de la decisión evergreen + dataset IMM (TD-0095/0096)

- **Status**: DONE
- **Fecha**: 2026-09-30
- **Owner**: Carlos Ortega (decisión confirmada) / agente (implementación)
- **Scope in**: `src/config/editorial-timeliness-policy.json`,
  `src/config/editorial-volatile-data-registry.json`,
  `scripts/refresh-editorial-volatile-data.mjs`,
  `src/infrastructure/editorial/editorial-volatile-data.snapshot.json`,
  `src/data/blog/{gratificacion-legal-chile,boleta-honorarios-2026-retencion-cobertura,cotizacion-voluntaria-afp-independiente,fonasa-vs-isapre-comparativa}.md`,
  `tests/scripts/refresh-editorial-volatile-data.test.ts`,
  `docs/TECH_DEBT_BACKLOG.md`, `plans/README.md`.
- **Scope out**: PGU como dataset (decisión: mantener cadencia 90d), TD-0103,
  TD-0108, WIP de otras sesiones.

## Decisión aplicada (`DECISION-evergreen-tier-2026-09-30.md`, confirmada)

- **Evergreen (19)**: A1 (7) + A2 (9) + B condicionados (3).
- **Explícitos `manual_review` (5)**: bancos-y-fintech, fonasa-vs-isapre,
  cae-costo-real, fondos-mutuos, credito-hipotecario (para que ningún dudoso
  dependa del default implícito).
- **IMM**: dataset `economic.imm.value` (registry + mapping + snapshot) y
  `volatileData: strict` en los 4 artículos que citan el valor (drift
  automático cuando cambie el IMM).
- **PGU**: mantiene cadencia 90d (documentada).

## Criterios de cierre

- [x] `check:editorial-timeliness` verde con los 19 evergreen y el dataset IMM.
- [x] `editorial:volatile-data:refresh` puebla `economic.imm.value` (553.553,
      reviewTriggerDate 2026-05-01) sin error.
- [x] Suite completa (189 files, 1811 passed / 1 skipped), `check:ci` y build
      (24 checks / 332 páginas) verdes en worktree limpio.
- [x] TD-0095/0096 cerrados con la decisión registrada.

## Evidencia

- `node scripts/refresh-editorial-volatile-data.mjs` → snapshot con
  `economic.imm.value` (9 datasets).
- `check:editorial-timeliness` → OK (19 evergreen sin `dueDate`, 4 artículos
  con `sync: strict` sobre IMM).
- `check:ci` exit 0; `pnpm run build` 24 checks; tests 22/22 en los contratos
  tocados.
