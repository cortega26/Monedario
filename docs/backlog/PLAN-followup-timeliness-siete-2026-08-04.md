# PLAN — Follow-up 2026-08-04: cierre de issues y primer cron SiETE

**Estado:** PENDIENTE — verificación pasiva para 2026-08-04 (mañana tras el cron de las 10:15 UTC)
**Inicio:** 2026-08-03
**Fuente:** cierre de la re-auditoría de timeliness + verificación de credenciales SiETE (mismo día)
**Contexto:** `PLAN-reauditoria-timeliness-2026-08-03.md` (COMPLETADO) · worker `monedario-economic-snapshot-refresh` re-desplegado (versión `007d7cf5`) con secrets SiETE correctos

## Qué verificar (en orden)

### 1. Cierre automático de los issues #384 y #386

El upsert del workflow cierra ambos al ver `stale=0` en main. Verificar:

```bash
gh issue view 384 --json state,title
gh issue view 386 --json state,title
```

- Esperado: `state: CLOSED` en ambos.
- Si siguen `OPEN`: revisar el último run del audit/CI scheduled
  (`gh run list --limit 5`) y el checker local
  (`pnpm run check:editorial-timeliness` → debe dar `stale=0 · drift=0`).
  Si el checker da OK pero los issues siguen abiertos, el upsert del workflow
  es el problema — revisar su último run en `.github/workflows/`.

### 2. Primer cron del worker con SiETE (fuente primaria BCCh)

El cron de las 10:15 UTC (06:15 Chile) del 04-08 es el primero con los
secrets correctos. Verificar:

```bash
git log --author=monedario-snapshot-bot --oneline -3 -- src/infrastructure/economic/economic-parameters.snapshot.json
grep -o '"lastUpdated": "[^"]*"' src/infrastructure/economic/economic-parameters.snapshot.json
grep -o '"uf": [0-9.]*' src/infrastructure/economic/economic-parameters.snapshot.json
```

- Esperado: commit del bot fechado 2026-08-04, `lastUpdated` = 2026-08-04,
  UF ≈ 40.844,79 (período 10-jul → 09-ago; cambia el 10-08).
- Señal de SiETE: valor idéntico al de la serie oficial y, si la versión
  desplegada lo registra, `provenance` en el snapshot (la versión actual
  escribe `provenance.utm`; los overrides de UF/USD se loguean como
  `uf.override.applied` / `usd.override.applied` en observabilidad — el token
  de CF sin Observability:Read no puede leerlos; el valor es la señal práctica).
- Si el valor de UF no coincide con la serie oficial o el commit no aparece:
  revisar secrets (`wrangler secret list`) y el estado del worker
  (`wrangler deployments list`). Referencia de credenciales en memoria
  `bcch-siete-credentials`.

## Criterio de cierre

- Issues #384 y #386 en `CLOSED`.
- Snapshot económico del 04-08 con UF oficial (≈ 40.844,79) y commit del bot presente.
- Con ambos ✓, marcar este plan como completado (commit pequeño o nota en el archivo).

## Notas

- Si el issue #386 se cerró pero el #384 no (o viceversa), esperar un run más
  antes de investigar — el upsert es por-run del audit/CI.
- Recordatorio original de sesión (cron one-shot 08:37) reemplazado por este
  archivo para persistencia.
