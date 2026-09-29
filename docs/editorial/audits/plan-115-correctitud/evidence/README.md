# Evidencia

Salidas crudas del audit: outputs de comandos, extractos textuales de fuentes
primarias con fecha de consulta, harness independientes y capturas. Cada claim
de `02-result.json` debe apuntar aquí vía `reproduction.output` o
`source.quote`/`evidenceRef`.

## Versionado de harness

| Ruta | Qué audita | Estado |
|---|---|---|
| `reaudit.independent.audit.test.ts` (+ `vitest.reaudit.config.ts`) | Re-auditoría sobre `8b73793` (HEAD tras la remediación D1–D8) | **Actual** — debe pasar en HEAD |
| `audit-1/` (`recalc.audit.test.ts` + `vitest.audit.config.ts`) | Primera auditoría sobre `d1b12374` (pre-remediación) | **Histórico** — sus expectativas fijan el estado auditado; falla en HEAD por diseño (no corregir: es el registro) |

Comandos:

```bash
# Re-auditoría (debe pasar en HEAD)
pnpm exec vitest run --config docs/editorial/audits/plan-115-correctitud/evidence/vitest.reaudit.config.ts

# Primera auditoría (histórico, solo referencia)
pnpm exec vitest run --config docs/editorial/audits/plan-115-correctitud/evidence/audit-1/vitest.audit.config.ts
```
