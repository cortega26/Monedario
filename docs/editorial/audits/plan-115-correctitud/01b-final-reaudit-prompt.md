# Addendum — re-auditoría final (commit `e56ad995`)

> Pega el prompt base (`01-auditor-prompt.md`) y **a continuación este
> addendum** en la misma sesión fresca. Rol: `MathAuditAgent` (adversarial).
> Este audit es el cierre del ciclo: si queda limpio, el veredicto pasa a
> `PASS` (sujeto a firma humana).

## Alcance de esta pasada

- Commit a auditar: **`e56ad995`** (incluye `#589` D1–D8, `#590` D9–D12 +
  obs. 2, `#591` obs. 1).
- Contexto: la pasada anterior (`reaudit-plan115-2026-09-29`, commit
  `8b73793`) dejó **CONDITIONAL** con D9–D12; `02-result.json` los marca
  `resolved`. Verifica que así sea en el código y busca residuales del mismo
  patrón (copy/UI/artefacto) en las áreas tocadas.

## Qué verificar (además de re-ejecutar V1–V6)

1. **D9**: mensaje de validación de `simulador-renegociacion.astro` y JSDoc de
   `DebtItemInput.creditor` alineados con art. 260 (sin "acreedores
   distintos"); el mensaje del bundle construido también.
2. **D10**: evidencia versionada — `evidence/audit-1/` es histórico (falla por
   diseño en HEAD) y `vitest.reaudit.config.ts` es el actual (debe pasar).
3. **D11**: `00-scope.json` V3 (art. 59 inc. 2° N°1 a)/g)) y V5 (≥2
   obligaciones) actualizados.
4. **D12**: resaltado de tramo en `/calculadoras/impuesto-segunda-categoria/`
   coherente con la tabla general — **reproducir en navegador/DOM**, no solo
   leer el código (200 UTM → fila 120–310; 320 UTM → fila 310+; 100 → 90–120).
5. **Obs. 1**: `src/data/blog/renegociacion-superir.md` sin el claim de
   "acreedores distintos" y coherente con art. 260 y con el motor.
6. **Obs. 2**: `uf-historico.json` al día (no detrás del snapshot >14 días) y
   la nueva assertion del gate operativa (`check:economic-snapshot-freshness`).
7. **Regresiones**: re-ejecutar la verificación de D1–D8 (tabla 310/38,82;
   UF 39.727,96; SuperIR estricto >80 UF; citas art. 59 y Ley 18.010; scope S6;
   `calculateApvWithdrawalRate`) y confirmar que `pnpm run test` pasa en un
   worktree limpio de HEAD (el checkout principal puede tener WIP ajeno).

## Salida

- Actualizar `02-result.json`: `verdict` (**`PASS` solo si 0 defectos
  abiertos**), `defects` (nuevos como D13+ si aparecen; los resueltos se
  mantienen `resolved`), `auditor` con modelo/sesión/fecha, `humanSignoff:
  null`.
- `03-report.md`: método, vectores independientes vs motor, estado de
  D1–D12/obs, defectos nuevos si hay, veredicto y limitaciones.
- Evidencia nueva numerada desde `21-` (no pisar la anterior).

No modifiques `src/` (R8): los hallazgos se registran, no se arreglan aquí.
