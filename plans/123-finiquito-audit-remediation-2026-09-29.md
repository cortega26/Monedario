# Plan 123: Auditoría y corrección de finiquito-indemnización (TD-0109)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. Update the status row for this plan in `plans/README.md`.

## Status

- **Priority**: P2 (YMYL, dinero del lector)
- **Effort**: M
- **Risk**: MED (cambia montos calculados; fuentes primarias citadas)
- **Depends on**: none
- **Category**: correctitud YMYL / finiquito
- **Planned at**: commit `43de8b5e`, 2026-09-29
- **Status**: DONE — FIN-01..06 corregidos con vectores dorados (+19 tests;
  1767 en total), build 23 checks, a11y 196 y `check:ci` en verde. Pendiente
  para el gate de publicación YMYL: auditoría independiente IA del fix
  (`AI_AUDIT_PROTOCOL`) + firma humana.
- **Evidence**: `docs/TECH_DEBT_BACKLOG.md` (TD-0109),
  `docs/reports/AUDIT-indemnizacion-anos-de-servicio-chile-2026-09-17.md` (NHV-8)

## Auditoría (2026-09-29, fuentes primarias)

Textos verificados en SUSESO (espejo oficial del CT):

- **Art. 163 inc. 1**: indemnización "treinta días de la última remuneración
  mensual devengada por cada año de servicio y **fracción superior a seis
  meses**", solo "si el contrato hubiere estado vigente **un año o más**" y
  terminado por art. 161. Tope "**trescientos treinta días** de remuneración".
- **Art. 163 inc. 3**: contrato por **obra o faena** vigente **un mes o más**,
  término art. 159 N°5 → "**dos y medio días de remuneración por cada mes
  trabajado y fracción superior a quince días**".
- **Art. 172**: base = última remuneración mensual "con exclusión de la
  asignación familiar legal, **pagos por sobretiempo** y beneficios o
  asignaciones esporádicas o por una sola vez al año (gratificaciones,
  aguinaldos)"; variables → promedio últimos 3 meses; "no se considerará una
  remuneración mensual superior a **90 unidades de fomento del último día del
  mes anterior al pago**".
- **Art. 168**: recargo por despido declarado injustificado **según la causal
  de la declaración**: a) 30% improcedente art. 161; b) 50% injustificada
  art. 159 o sin causal invocada; c) 80% indebida art. 160. (El texto vigente
  post-Ley 19.759 no usa antigüedad.)

### Defectos encontrados en el código productivo

| ID | Defecto | Evidencia | Fix |
|---|---|---|---|
| FIN-01 | Sin tope de **90 UF** a la base (art. 172) → sobrestima rentas altas | `EstimateFiniquito.ts` no aplica cap | `baseSalary = min(salary, 90 × uf)`; cap aplica a indemnización 163/168 y aviso previo (162 inc. 4°), no a sueldo/vacaciones |
| FIN-02 | Sin requisito de **≥1 año** de contrato → paga indemnización a quien no le corresponde | `appliesYearsOfService` no mira `yearsWorked` | exigir `yearsWorked >= 1`; el aviso previo se mantiene (no depende de la antigüedad) |
| FIN-03 | Umbral de fracción con **≥6** en vez de **>6** (art. 163) → suma un año de más con exactamente 6 meses | `SERVICE_YEAR_ROUNDING_MONTH_THRESHOLD` con `>=` | comparación estricta `>` |
| FIN-04 | **Art. 168 con tramos por antigüedad (30/50/80)** = texto derogado → % incorrecto en todos los casos judiciales | `ART_168_SURCHARGE_BANDS` | recargo por causal declarada (30/50/80); sin tipo declarado → 0 y nota "lo fija el tribunal" |
| FIN-05 | **Obra/faena paga 0** pese al art. 163 inc. 3 → subestima | `vencimiento-obra` no suma | indemnización 2,5 días × mes trabajado (base con tope art. 172); fracción >15 días no modelada |
| FIN-06 | Base no advierte excluir **horas extra/bonos anuales** (art. 172) | UI sin advertencia | hint en el campo + supuesto explícito |

## Scope

- `src/application/use-cases/EstimateFiniquito.ts` (+ methodology si aplica).
- `src/pages/calculadoras/finiquito-indemnizacion.astro` (UF, tipo de
  declaración judicial, hint, línea de resultado obra).
- `tests/application/EstimateFiniquito.test.ts` (vectores dorados).
- `docs/TECH_DEBT_BACKLOG.md`, `plans/README.md`.

**Out of scope**: recargo del 100% (art. 160 N°1/5/6 carente de motivo
plausible), promedio de variables a 3 meses (requiere datos históricos),
fracción >15 días en obra.

## Done criteria

- [ ] FIN-01..06 corregidos con tests de regresión numérica.
- [ ] Fuentes primarias citadas en código/supuestos.
- [ ] `pnpm run test`, `pnpm run build` y `pnpm run check:ci` en verde.
- [ ] TD-0109 → Resuelto; auditoría independiente IA + firma humana
      registradas como pendientes del gate de publicación.

## STOP conditions

- Un vector dorado no coincide con el texto legal → detener y reportar (no
  ajustar el test al código).
- Cambios de UI que rompan accesibilidad → revisar con axe antes de seguir.

## Rollback

Revert del squash; sin migración de datos. Los montos vuelven al
comportamiento anterior (documentado como defectuoso).
