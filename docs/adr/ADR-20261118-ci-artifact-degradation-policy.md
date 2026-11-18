# ADR-20261118-ci-artifact-degradation-policy

Date: 2026-11-18
Status: Accepted

## Context

Siete workflows programados de reporte fallan de forma sostenida en su último
step:

```
Failed to CreateArtifact: Artifact storage quota has been hit.
Unable to upload any new artifacts. Usage is recalculated every 6-12 hours.
```

La cuota de storage de GitHub Free es **de cuenta** (500 MB) y se comparte
entre artifacts y GitHub Packages. Los artifacts de este repositorio suman
~349 KB (67 artifacts, retención 14–30 días), así que el consumo que agota la
cuota está fuera de este repositorio. Desde este repo no se puede liberar.

El efecto actual es peor que la degradación: los runs quedan **permanentemente
rojos después de haber hecho su trabajo**. Un rojo permanente deja de ser
señal, y enmascara fallos reales de la auditoría en esos mismos runs. El
precedente ya existente en `ci.yml` (upload de URL-check con
`continue-on-error`) aplica la misma lógica.

## Decision

1. Las subidas de artifacts **diagnósticas** de workflows report-only toleran
   fallo: `continue-on-error: true` **en el step del workflow**, nunca dentro de
   una composite action.
2. El step de la auditoría (`run-single-report-audit`) y el step que convierte
   un `steps.audit.outputs.outcome == 'failure'` en rojo **no** toleran fallo.
   El test `run-single-report-audit-action.e2e.test.ts` lo verifica por step.
3. `weekly-search-ops` registra el resultado de la subida en el issue semanal:
   si el bundle no subió, el issue lo dice explícitamente en vez de apuntar a un
   artifact inexistente.
4. Los reportes siguen escribiéndose en el workspace y publicándose por issue o
   issue-comment, que es la superficie de consumo real. El artifact queda como
   transporte best-effort.

## Consequences

- Los workflows dejan de estar rojos por una causa externa y vuelven a señalar
  solo drift real.
- La degradación sigue siendo visible: el step aparece como fallido en la UI del
  run y el log conserva el error de cuota.
- Trade-off: un fallo de configuración de artifacts no rompe el job. Mitigación:
  el step fallido es visible y el runbook documenta qué significa.
- **Condición de reversión:** cuando la cuota de storage se restaure de forma
  sostenida, quitar los `continue-on-error` de los uploads diagnósticos.

## Alternatives considered

- **Eliminar los artifacts** y quedarse solo con issues: pierde el bundle
  descargable y obliga a reescribir los bodies de PR de self-heal.
- **Auto-borrar artifacts viejos** en cada run: no libera la cuota real
  (349 KB propios) y añade permisos de escritura sobre actions.
- **Subir a un almacenamiento externo** (R2/S3): introduce credenciales y un
  proveedor nuevo para datos de diagnóstico; desproporcionado.

## Verification

- `pnpm exec vitest run tests/static-analysis/run-single-report-audit-action.e2e.test.ts`
  — el step de auditoría no tolera fallo y existe propagación a rojo.
- `pnpm exec vitest run tests/static-analysis/upload-workflow-artifact-action.e2e.test.ts`
  — la action compartida no contiene `continue-on-error`.
- Un run programado de `repo-doctor` o `guardrail-drift-audit`: job verde con el
  step de upload en rojo cuando la cuota siga agotada.
