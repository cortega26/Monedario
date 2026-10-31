# Housekeeping y book-keeping — 2026-10-29

**Fecha de ejecución:** 2026-10-29 11:30–11:33 (America/Santiago)
**Registro completado:** 2026-10-31
**Ejecutor:** agente `build` (OpenCode), sesión `ses_e7f99166fffe3R7k6CYziUMg6F`
**Alcance:** ramas locales y remotas, worktrees y paquete de evidencia de la
auditoría `descuentos-de-sueldo-20261020`

---

## 1. Resumen ejecutivo

| Operación | Cantidad | Resultado |
|---|---:|---|
| Ramas locales eliminadas | 29 | Todas con 0 commits únicos respecto de `main` |
| Ramas remotas eliminadas | 1 | `dependabot/npm_and_yarn/happy-dom-21.0.4` |
| Worktrees eliminados | 8 | 2 de ramas integradas + 6 de auditoría obsoletos |
| Espacio liberado (worktrees de auditoría) | ~5,76 GiB | Suma de `du -sh` por worktree |
| Archivos de evidencia recuperados | 4 | Referenciados por `02-result.json`, ausentes del repo |

Estado final verificado: 12 ramas locales (`main` + 11 retenidas), 3 ramas
remotas, 3 worktrees activos.

---

## 2. Criterio y método

Una rama se consideró eliminable solo si cumplía **ambas** condiciones:

1. `git rev-list --count main..<rama>` = 0 commits por delante, o bien
2. `git cherry main <rama>` no reporta ninguna línea `+`, es decir, todos sus
   commits ya están aplicados en `main` por contenido (patch-id), aunque no por
   ancestría.

Las ramas con al menos un commit único se conservaron, con o sin worktree.

Antes de eliminar un worktree se comparó cada archivo sucio contra `main` con
SHA-256. Los worktrees de auditoría tenían `02-result.json` modificado, pero su
contenido era un subconjunto del de `main`: sin passes, claims ni defects
únicos. La única excepción fueron cuatro archivos de evidencia presentes solo en
`wt-audit-descuentos-5`, que se preservaron antes de borrar (ver §6).

---

## 3. Ramas locales eliminadas (29)

Todas con 0 commits únicos respecto de `main` al momento de la limpieza.

| Rama | Tip | Fecha | Subject |
|---|---|---|---|
| `agent/utm-freshness-decision-record` | `44e332bd2` | 2026-10-01 | docs(adr): record UTM month-boundary freshness policy |
| `chore/ops-536-w39` | `5a9027aad` | 2026-09-29 | chore(ops): cerrar ítem gitignore-b2b y anotar bloqueo de Actions W39 (#536) |
| `chore/ruff-format-ops-reminders` | `aa99ccf04` | 2026-09-30 | chore: align Python files with Ruff 3.14 |
| `chore/satori-0-51` | `21ff19642` | 2026-10-27 | fix(data): refresh UF historical series through 2026-11-09 (#729) |
| `chore/satori-0.51` | `85e29d4cf` | 2026-10-27 | chore(deps): bump satori 0.35 -> 0.51 with OG golden test |
| `docs/adr-mark-correccion-registered` | `6bcc05883` | 2026-10-27 | docs(adr): mark the UF correction as registered |
| `docs/adr-weekly-uf-ingestion` | `d934bedf0` | 2026-10-26 | docs(adr): propose weekly UF ingestion with heartbeat and verified auto-merge |
| `docs/causa2-phase4-handoff` | `72b6c3b8b` | 2026-10-27 | docs(backlog): add the phase 4 handoff for the AFC cluster |
| `docs/close-d18-record` | `1667d172e` | 2026-10-27 | docs(editorial): mark D18 resolved after #743 |
| `docs/correccion-uf-2014` | `4784852ac` | 2026-10-27 | docs(editorial): register the 2014 UF correction in the public registry |
| `docs/payroll-single-source-adr` | `14c943960` | 2026-10-27 | docs(adr): propose a single source for payroll rules, with a consistency gate |
| `feat/monedario-private-visual-polish` | `23f2cf1fb` | 2026-10-01 | feat: polish Monedario Privado experience |
| `feat/payroll-consistency-gate` | `c8eea8ede` | 2026-10-27 | feat(payroll): add the consistency gate and declare its real coverage |
| `feat/payroll-rules-registry` | `ceb8bc46a` | 2026-10-27 | feat(payroll): add the PayrollRules registry and wire the rates to it |
| `feat/uf-ingestion-pipeline` | `7c7d24eca` | 2026-10-27 | feat(data): schedule UF ingestion with heartbeat and value guard |
| `fix/analytics-deploy-undici-isolation` | `3bde56ccb` | 2026-10-01 | fix(deploy): harden undici isolation for wrangler |
| `fix/analytics-wrangler-workflow-2026-10-01` | `04c85630b` | 2026-10-01 | fix(deploy): estabiliza Wrangler del analytics collector |
| `fix/article-structured-data-review-claim` | `ef9f324ab` | 2026-10-27 | fix(seo): stop publishing review claims nobody made in article JSON-LD |
| `fix/audit-125-article` | `6f5c36d91` | 2026-09-29 | content(superir): corregir requisito de acreedores distintos (art. 260) — re-auditoría obs. 1 |
| `fix/audit-125-article-only` | `dbc1bdfe5` | 2026-09-29 | content(superir): corregir requisito de acreedores distintos (art. 260) — re-auditoría obs. 1 |
| `fix/audit-127-surfaces` | `a997ee553` | 2026-09-29 | fix(reauditoría-115): barrido de superficies D14/D15, guardas y prompt v2 (plan 127) |
| `fix/ci-bootstrap-timeout` | `df7eea3b7` | 2026-10-26 | fix(ci): raise blocking job timeouts above the bootstrap cost |
| `fix/geo-review-checkout` | `fe9bed231` | 2026-10-01 | fix(ci): añade checkout antes del action local en GEO review |
| `fix/pin-wrangler-deploy-4.146.0` | `395986487` | 2026-10-01 | merge: integra renovación visual editorial v5 |
| `fix/plan-115-pass4-d17-d21` | `d80b37391` | 2026-09-29 | fix(remediación-115): D17–D21 pass4 (taxonomía AT, DAP en contenido, isPeriodId, glosario IUSC) |
| `fix/plan-115-pass6-d25` | `2c326003d` | 2026-09-29 | fix(remediación-115): D25 interpolación económica en llms-full.txt + check postbuild |
| `fix/uf-source-bcch` | `7153b0454` | 2026-10-27 | fix(data): source the UF series from BCCh and correct 4 published defects |
| `integration/visual-v5-2026-10-01` | `395986487` | 2026-10-01 | merge: integra renovación visual editorial v5 |
| `wip/renovacion-visual-editorial-2026-10-01` | `62d34b723` | 2026-10-01 | feat(editorial): finalize visual v5 delivery |

Dos de estas ramas (`chore/ruff-format-ops-reminders` y
`feat/monedario-private-visual-polish`) tenían worktree; ambos estaban limpios y
se retiraron antes de borrar la rama.

---

## 4. Rama remota eliminada (1)

| Rama | Resultado |
|---|---|
| `dependabot/npm_and_yarn/happy-dom-21.0.4` | Eliminada en `origin` |

`git branch -r --no-merged main` quedó vacío después de la operación.

---

## 5. Worktrees eliminados (8)

| Path | Rama / HEAD | Tamaño | Motivo |
|---|---|---:|---|
| `…/monedario-python-format-fix` | `chore/ruff-format-ops-reminders` | — | Rama integrada, worktree limpio |
| `…/monedario-private-polish` | `feat/monedario-private-visual-polish` | — | Rama integrada, worktree limpio |
| `/tmp/opencode/wt-audit-descuentos` | `1bcbe16c` (detached) | 1001M | Auditoría cerrada, contenido duplicado |
| `/tmp/opencode/wt-audit-descuentos-2` | `4fd605b8` (detached) | 1001M | Auditoría cerrada, contenido duplicado |
| `/tmp/opencode/wt-audit-descuentos-3` | `53c7aa5d` (detached) | 964M | Auditoría cerrada, contenido duplicado |
| `/tmp/opencode/wt-audit-descuentos-4` | `d3897fad` (detached) | 964M | Auditoría cerrada, contenido duplicado |
| `/tmp/opencode/wt-audit-descuentos-5` | `da2277ae` (detached) | 964M | Auditoría cerrada; 4 archivos únicos preservados (§6) |
| `/tmp/opencode/wt-audit-descuentos-6` | `332edf28` (detached) | 1001M | Auditoría cerrada, contenido duplicado |

Total de los seis worktrees de auditoría: 5895 MiB (~5,76 GiB). Los directorios
se verificaron ausentes después de `git worktree remove --force`.

Los worktrees restantes (`main`, `monedario-private-mvp`, `wt-descuentos`)
corresponden a ramas con commits únicos y se conservaron.

---

## 6. Hallazgo de book-keeping: evidencia R5 ausente del paquete de auditoría

`docs/editorial/audits/descuentos-de-sueldo-20261020/02-result.json` registra
comandos que invocan cuatro archivos de evidencia que **no existían en el
repositorio**:

| Archivo | Líneas | Referencias en `02-result.json` |
|---|---:|---|
| `evidence/20-r5-vitest.config.ts` | 14 | 97, 1870, 1893 |
| `evidence/21-r5-engine-probe.test.ts` | 129 | 97, 567, 1870, 1893 |
| `evidence/22-r5-public-url-probe.py` | 103 | 95, 568, 2014 |
| `evidence/25-r5-guard-mutation-probe.py` | 74 | 98, 571, 1996 |

Los cuatro archivos se recuperaron desde `/tmp/opencode/wt-audit-descuentos-5`
(HEAD `da2277ae`, el target declarado en `11-delta-reaudit-r5.md`) y se
restauraron en `docs/editorial/audits/descuentos-de-sueldo-20261020/evidence/`.

**Por qué importa:** son los probes que producen `evidence/23`, `evidence/24` y
`evidence/26`. Sin ellos, los comandos que el JSON de auditoría declara como
reproducibles no se pueden volver a ejecutar, y el paquete queda incompleto
aunque el veredicto CONDITIONAL de R5 siga siendo válido. No se alteró ningún
veredicto, claim, defect ni `humanSignoff`; solo se restauraron los insumos
faltantes.

---

## 7. Ramas retenidas (11)

| Rama | Commits únicos | Ahead | Fecha | Subject |
|---|---:|---:|---|---|
| `chore/td-0107-0108-timeliness` | 4 | 4 | 2026-09-29 | chore: destrackear symlink node_modules (patrón node_modules/ no cubre symlinks) |
| `docs/audit-inbox-reconciliation-2026-10-20` | 2 | 2 | 2026-10-20 | docs(audit): complete 15/15 calibration sample |
| `docs/f5-utm-reading-w39` | 2 | 2 | 2026-10-01 | docs(f5): registra decisión Revert del owner (ejecución en PR #627) |
| `feat/eeat-arquitectura-confianza` | 1 | 2 | 2026-09-29 | feat(confianza): registro público /correcciones/ con 9 correcciones materiales |
| `feat/monedario-privado-mvp` | 2 | 2 | 2026-09-30 | fix: harden Monedario Privado before merge |
| `fix/descuentos-de-sueldo-art58-2026-10-20` | 19 | 22 | 2026-10-27 | docs(editorial): record the owner waiver for publishing with open out-of-scope defects |
| `fix/devolucion-reaudit-2026-10-02` | 2 | 2 | 2026-10-02 | docs(editorial): registra firma HumanEditor en packets F22 y rentas mixtas |
| `fix/plan-115-pass5-d23-d24` | 3 | 3 | 2026-09-29 | chore: destrackear OG jpg generados por build |
| `fix/uf-historico-refresh-2026-10-26` | 2 | 3 | 2026-10-27 | Merge remote-tracking branch 'origin/main' into fix/uf-historico-refresh-2026-10-26 |
| `pr-687` | 1 | 1 | 2026-10-18 | chore(editorial): refresh volatile data snapshots |
| `wip/local-backup-20261020` | 1 | 1 | 2026-10-20 | wip: backup local tree before syncing main |

Ninguna se borró: todas tienen al menos un commit cuyo patch no está en `main`.

---

## 8. Estado final verificado

```
main                     d7418fc2 chore(editorial): refresh economic snapshot (worker)
ramas locales            12 (main + 11 retenidas)
ramas remotas            3 (origin/HEAD, origin/main, origin/copilot/check-codacy-sync-issues)
worktrees                3 (main, monedario-private-mvp, wt-descuentos)
git count-objects -vH    count 4575 · size-pack 139.63 MiB · garbage 0 bytes
```

`git branch -r --no-merged main` vacío. `git status --short` mostró únicamente
los cuatro archivos de evidencia sin trackear.

---

## 9. Interrupción y recuperación

La sesión que ejecutó la limpieza terminó con un error de cuota del proveedor
(`GoUsageLimitError`, `limitName: weekly`, HTTP 429) a las 11:33 del 2026-10-29,
justo después de capturar el estado final y antes de escribir este informe. No
hubo corrupción de datos ni pérdida de trabajo: el transcript completo quedó
disponible y el 2026-10-31 se retomó desde `ses_e7110a3b6ffekyTRnVjrX57iTM`
para restaurar la evidencia y redactar este registro.

---

## 10. Límites

- No se ejecutó `build` ni la suite E2E; la verificación fue de estado de git.
- No se hizo `push` de este trabajo. Al 2026-10-31, `main` local está 3 commits
  detrás de `origin/main` (refrescos automáticos del worker de snapshot).
- El commit de este informe incluye solo los cuatro archivos de evidencia y este
  documento. El resto del working tree (trabajo UTM en curso) quedó intacto y
  fuera del commit.
