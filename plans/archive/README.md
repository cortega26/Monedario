# Planes archivados (completados)

Planes de implementación cuyo trabajo ya está **hecho, verificado y mergeado en
`main`**. Se conservan como registro de auditoría; no son trabajo pendiente.

No uses material archivado como política vigente: si un plan archivado describe
un estado del código, verifica contra el código actual antes de actuar.

## Contenido

| Plan | Título | Auditoría | Mergeado en `main` |
|------|--------|-----------|--------------------|
| [001](001-csp-kofi-domain.md) | Agregar `storage.ko-fi.com` al CSP | 2026-06-11 | sí |
| [002](002-pin-setup-node-sha.md) | Pinear `actions/setup-node` por SHA | 2026-06-11 | sí |
| [003](003-page-lastmod-pr-gate.md) | Convertir `page-lastmod.yml` a PR-gate | 2026-06-11 | sí |
| [020](020-afp-comparison-cheapest-name.md) | Corregir nombre de AFP cableado en la nota de comparación | 2026-06-15 | sí (commits `e7e3aa72`, `439583e5`) |
| [021](021-economic-snapshot-hardening.md) | Endurecer worker de snapshot económico | 2026-06-15 | sí (commit `95f028ef`) |

## Planes 004–019 (completados, sin archivo en el árbol)

Los planes 004–019 de la auditoría 2026-06-11 también están **DONE e integrados**
(vía las ramas `advisor/0NN-*` → `advisor/integration-2026-06-15`). Sus archivos
nunca se conservaron en el árbol de trabajo; viven solo en el historial git de sus
ramas. Ver el detalle en `plans/README.md`.
