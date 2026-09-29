# Plan 115: Remediación de la auditoría de correctitud, consistencia y freshness 2026-09-28

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Update the status row for this plan in
> `plans/README.md` as work advances.

## Status

- **Priority**: P0
- **Effort**: L
- **Risk**: HIGH (contenido financiero/tributario YMYL)
- **Depends on**: none
- **Category**: correctness / datos / cumplimiento legal
- **Planned at**: commit `7226c0ce`, 2026-09-28
- **Evidence**: `docs/reports/AUDIT-CORRECTNESS-2026-09-28.md`

## Why this matters

El informe externo (brief 01) confirma 10 findings: 1 P0, 6 P1 y 3 P2. El P0
entrega una estimación tributaria construida con parámetros del período
equivocado; hay retenciones inexistentes, datasets congelados y atribuciones
legales incorrectas. La remediación es YMYL: cada afirmación normativa debe
verificarse contra fuente primaria antes de publicarse
(`INVARIANT.EDITORIAL.NO_UNSOURCED_NUMBERS`) y pasar por math audit y
compliance (`INVARIANT.EDITORIAL.MATH_AUDIT_REQUIRED_WHEN_CALC`,
`INVARIANT.EDITORIAL.COMPLIANCE_REVIEW_REQUIRED_WHEN_HIGH_RISK`).

## Scope

**In scope**

- `src/application/use-cases/SimulateOperacionRenta.ts` (+ methodology)
- `src/pages/calculadoras/operacion-renta.astro`
- `src/domain/taxation/TaxEngine.ts` (solo si se requiere tabla anual explícita)
- `src/application/use-cases/CalculateTermDeposit.ts` +
  `src/pages/calculadoras/deposito-a-plazo.astro`
- `src/data/economic-history/ipc-historico.json` + pipeline de ingesta
- `src/application/use-cases/SimulateDebtRenegotiation.ts` +
  `src/pages/calculadoras/simulador-renegociacion.astro`
- `src/pages/calculadoras/apv.astro`, `conversor-utm.astro`,
  `sueldo-liquido.astro`, `dividendo-hipotecario.astro`
- `src/infrastructure/economic/**` + `src/domain/economic/**` (registry
  effective-dated; requiere ADR)
- `tests/**` (vectores dorados SII, aislamiento temporal, contratos de
  contenido)

**Out of scope**

- Briefs 02–04 (SEO, privacidad, resiliencia) — auditorías externas
  independientes.
- Plan 114 (UX/UI) — cerrado.
- Refactors no relacionados; la migración de inputs legacy es `TD-0111`.

## Steps

### Paso 1 — F01 Operación Renta (P0)

1. **Contrato temporal explícito**: modelar `commercial_year`, `tax_year` y
   `filing_year` en la entrada del simulador. AT2026 ⇒ ingresos AC2025 ⇒
   parámetros fiscales de cierre dic-2025.
2. **Congelar el bundle AT2026**: usar la UTA con período dic-2025
   (`indicatorUpdatedAt.uta = 2025-12-01` ya existe en el snapshot) y la UF/UTM
   que correspondan al período del cálculo; nunca `utm × 12` con la UTM
   vigente.
3. **Corregir la base de entrada (F02)**: reemplazar "sueldos brutos" por
   renta neta F1887 (o reconstruirla con inputs suficientes). Es una decisión
   de contrato de datos: si no hay definición de producto, STOP (ver STOP
   conditions).
4. **Corregir etiquetado y PPM (F02)**: "Operación Renta 2026 (año comercial
   2025)" consistente en página y FAQ; PPM honorarios AT2026 = 14,5%
   (15,25% es para boletas emitidas en 2026 / AT2027).
5. **Vectores dorados SII**: $18M ⇒ IGC $269.368 (con el supuesto simplificado
   del sitio) y fronteras de tramo.

**Verify**: `pnpm exec vitest run tests/application/operacion-renta*.test.ts` →
verde; test de aislamiento temporal: cambiar `CURRENT_UTM` no altera AT2026.

### Paso 2 — F03 Depósito a plazo (P1)

1. Verificar la regla en fuente primaria SII (intereses DAP de persona natural
   residente no sujetos a retención del 4%).
2. Eliminar el descuento automático y la afirmación del art. 59 N°4; separar
   "interés pagado al vencimiento" de "eventual tributación anual" (con
   exención de 20 UTM cuando corresponda).
3. Mantener casos no residentes/empresas como escenarios aparte y testeados.

**Verify**: test de persona natural residente sin retención; axe del estado
calculado en verde.

### Paso 3 — Registry effective-dated (ADR)

1. Definir `value_effective_for(context)` con período obligatorio por
   indicador (`effective_from`/`effective_to`/`publication_date`/`period_id`).
2. Prohibir que calculadoras tributarias consulten constantes "current".
3. ADR en `docs/adr/` por cambio de contrato de datos.

**Verify**: `pnpm run check:boundaries` + test que impide lectura "current" en
contextos históricos.

### Paso 4 — F04 IPC

1. Refrescar `ipc-historico.json` desde INE (vía mindicador o fuente directa)
   hasta el último período publicado.
2. Publicar `latest_period` y fallar cerrado si el lag excede el ciclo
   esperado (warning visible, no "hoy").
3. Test: en septiembre 2026, `latest_ipc_period == 2026-08`.

### Paso 5 — F06/F07/F05 (legal, con verificación BCN)

1. **F06**: añadir identidad de acreedor al simulador SuperIR y exigir ≥2
   acreedores distintos (deduplicados).
2. **F07**: reescribir la sección DICOM desde Ley 19.628; Ley 21.214 solo para
   deudas educacionales. Cada claim con `source + article + effective_from`.
3. **F05**: corregir la fórmula de retiro anticipado APV B (3 pp + 1,1 × tasa
   incremental) y excepciones (pensionados).

### Paso 6 — Paridad contenido/runtime (F08/F09/F10)

1. Generar los ejemplos estáticos de calculadoras desde el mismo motor
   (fixtures de build) y fijarlos con test de igualdad byte a byte con el
   runtime.
2. Etiquetar período en toda renderización de UTA/UTM/UF (incluido
   conversor-UTM).
3. "Prepago sin costo" → "derecho a prepago sujeto a reglas/comisión
   aplicable".

## Verification table

| Purpose | Command | Expected |
|---|---|---|
| Unit | `pnpm run test` | verde, incluidos vectores SII |
| Aislamiento temporal | test dedicado | cambiar UTM vigente no altera AT2026 |
| Tipos | `pnpm run astro check` | 0 errors |
| Build + guards | `pnpm run build` | exit 0 |
| A11y resultados | `pnpm exec playwright test tests/accessibility/` | verde |
| CI mirror | `pnpm run check:ci` | exit 0 |
| Fuentes | `pnpm run check:legal-citations` | exit 0 |

## Done criteria

- [ ] AT2026 usa parámetros del período correcto; $18M ⇒ $269.368.
- [ ] Cambiar la UTM vigente no altera AT2026 (test de aislamiento).
- [ ] DAP sin retención automática para persona natural residente.
- [ ] `ipc-historico.json` con el último período publicado y freshness
      assertion.
- [ ] SuperIR exige ≥2 acreedores distintos; DICOM y APV corregidos con fuente
      primaria.
- [ ] Ejemplos publicados iguales al runtime (test de paridad).
- [ ] Math audit + compliance YMYL registrados para los cambios de contenido.
- [ ] Gates de la tabla en verde; plan 115 y `plans/README.md` actualizados.

## STOP conditions

- El contrato de entrada de F01 (renta neta F1887 vs reconstrucción) no tiene
  definición de producto: detener y consultar.
- Una fuente primaria (SII/BCN/INE) no puede verificarse: detener el finding
  correspondiente; no publicar la corrección.
- El cambio de registry effective-dated exige tocar más capas que las
  declaradas (domain/infrastructure/use-cases) sin ADR aprobado.
- CI de GitHub Actions sigue sin arrancar por facturación: los gates locales
  son la evidencia; no mergear cambios de contenido sin math audit/compliance.

## Rollback

Revertir por finding (commits atómicos por paso). Los cambios de parámetros se
pueden revertir sin migración de datos; el registry effective-dated requiere
ADR y migración versionada.
