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
- **Status**: DONE — Pasos 1–6 completos. F04 cerrado end-to-end: fail-closed
  + serie IPC extendida a 2026-08 con fuente oficial BCCh/INE (`TD-0112`
  resuelto) y assertion de frescura serie↔snapshot en el check programado.
  Queda solo el math audit/compliance humano para el gate de publicación.
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

## Progress log

### 2026-09-28 — Paso 1 (F01 + F02) implementado

- **Bundle AT2026 congelado**: nuevo `src/domain/taxation/TaxYearParameters.ts`
  con UTA dic-2025 $834.504, UF dic-2025 $39.643,59, retención de honorarios
  14,5% y los años comercial/tributario/presentación, con fuente citada.
- **Motor**: `calculateAnnualIncomeTax` en `TaxEngine` deja explícito que la
  tabla IGC es la estructura progresiva en UTA (ya no se deriva `UTM × 12`).
- **Contrato**: `SimulateOperacionRenta` recibe `sueldosRentaNeta` (Renta Total
  Neta Pagada), `sueldosBaseMode` (`declarada`/`estimada`) y `taxYear`; el
  output expone `rentaNetaGlobal` y la trazabilidad del año/base.
- **Híbrido en la página**: input primario "Renta neta pagada por sueldos" con
  guía del certificado/F22; `<details>` "Estimar desde sueldo bruto" que usa el
  motor de planilla (`calculateNetSalary`) con AFP/salud/contrato y marca la
  base como estimada. Etiquetas de año comercial/tributario y PPM 14,5%
  corregidas; bloque de frescura con parámetros AT2026.
- **Tests**: vector dorado SII $18M ⇒ $269.367,84; aislamiento temporal (el
  contrato no acepta UTM vigente); golden de `TaxYearParameters`
  (0,54 × UTA = $450.632,16); regresión de casos A/B actualizada; Playwright
  con caso de estimación (195 en total).
- **Evidencia**: `pnpm run build` OK (8 guards, 332 páginas); `pnpm run test`
  1690 passed; Playwright 195 passed.
- **Pendiente de proceso**: math audit + compliance YMYL (firma humana) antes
  de considerar el cambio publicado como verificado; y pasos 2–6 del plan.

### 2026-09-29 — Paso 2 (F03 DAP) implementado

- **Fuente primaria verificada**: SII FAQ 001.140.2738 (actualizada
  2026-03-31): los intereses de DAP de una persona natural tributan en el
  Impuesto Global Complementario anual (tramo exento de 13,5 UTA; exención de
  hasta 20 UTM si solo hay rentas de sueldo o de pequeño contribuyente) y no
  hay retención del banco. El 4% del art. 59 N°4 LIR es Impuesto Adicional para
  personas sin domicilio ni residencia en Chile (SII, Oficio N° 2047).
- **Código**: `CalculateTermDeposit` ya no aplica retención
  (`applyWithholding` eliminado); devuelve interés pagado al vencimiento y
  monto final. Página sin el selector de retención, con ejemplo, FAQ, explicador
  y metodología reescritos y fuentes SII citadas.
- **Tests**: `CalculateTermDeposit` actualizado; snapshot de escenarios sin
  `r:aplica-impuesto`; 1690 unit + 195 Playwright en verde; build OK.

### 2026-09-29 — Paso 3 (registry effective-dated) implementado

- **ADR** `docs/adr/ADR-20260929-effective-dated-economic-parameters.md`
  (Accepted): parámetros fiscales congelados por año tributario; la capa
  tributaria no lee indicadores vigentes; modelo effective-dated con período
  obligatorio y fail-closed.
- **Modelo** `src/domain/economic/EffectiveDatedParameters.ts`:
  `EffectiveDatedEntry` (`periodId`, `effectiveFrom`, `effectiveTo`,
  `publicationDate`, `source`) y `resolveEffectiveValue()` con vigencia
  `[effectiveFrom, effectiveTo)` y sin cobertura → `undefined`.
- **Registry** `src/domain/taxation/TaxYearRegistry.ts`:
  `getTaxYearParameters(2026)` / `getTaxYearForCommercialYear(2025)`, falla
  cerrado para años no registrados. La página de Operación Renta ya accede vía
  registry (frontmatter y cliente).
- **Guarda** `tests/static-analysis/tax-current-params-guard.test.ts`: la capa
  tributaria no puede importar `GetEconomicParameters`, `infrastructure/economic`
  ni el snapshot.
- **Evidencia**: 1713 unit tests (incluye resolver, registry y guarda), build OK
  (9 guards), `astro check` 0 errores.

### 2026-09-29 — Paso 4 (F04 IPC) parcial

- **Fail-closed implementado**: `evaluateIpcSeriesFreshness()` compara el último
  período de la serie con el publicado por la fuente
  (`resolveEconomicIndicatorDate(..., "ipc")` del snapshot). La página muestra
  un aviso (`role="status"`) cuando está atrasada y ya no afirma "última cifra
  disponible del INE"; en dist hoy se ve: "La serie de IPC cargada llega hasta
  diciembre 2025; el INE ya publicó el IPC de agosto 2026…".
- **Ingesta**: `scripts/fetch-economic-history.mjs` soporta `--solo=ipc`
  (refresco por serie sin reescribir UF/UTM/sidecars).
- **Bloqueo de fuente documentado** (`TD-0112`): mindicador.cl devuelve la serie
  IPC 2026 vacía y el consolidado con fecha dic-2025; datos.gob.cl no expone
  recursos del dataset INE. El refresco de 2026 queda pendiente de una ingesta
  INE primaria.
- **Tests**: `evaluateIpcSeriesFreshness` (fresh/stale/unknown) en
  `tests/utils/economicFreshness.test.ts`; build OK (9 guards).

### 2026-09-29 — Paso 5 (F06/F07/F05) implementado

- **Fuentes primarias verificadas**:
  - **F06**: Ley 20.720 art. 260 (BCN idNorma=1058072) y SuperIR: "dos o más
    obligaciones vencidas por más de 90 días corridos… provenientes de
    obligaciones diversas, cuyo monto total sea superior a 80 UF".
  - **F07**: Ley 19.628 arts. 17–18 (BCN idNorma=141599): 5 años desde que la
    obligación se hizo exigible; no comunicar después de pagada/extinguida; no
    comunicar repactadas/renegociadas/novadas con modalidad pendiente. Ley
    21.214 aplica solo a deudas educacionales.
  - **F05**: art. 42 bis N°3 LIR: impuesto único con tasa = tasa marginal del
    retiro × 1,1 + 3 pp; retención del 15% como abono; sin recargos para
    pensionados o quienes cumplen requisitos de edad/pensión.
- **Código**:
  - SuperIR: `DebtItemInput` exige `creditor`; nuevo check
    `hasTwoOrMoreDistinctCreditors` (deduplicado, case-insensitive) integrado a
    `meetsBasicEligibility`; la página pide acreedor por deuda (estática y
    dinámica), valida y muestra el requisito en el checklist; fuentes del
    MethodologyBlock corregidas (la de Superir apuntaba a CMF).
  - DICOM: párrafo reescrito desde Ley 19.628; se eliminó la atribución falsa a
    Ley 21.214 y la regla "5 años desde el pago".
  - APV: FAQ, tabla, explicador y FAQ final reescritos con la fórmula legal
    (× 1,1 + 3 pp, retención 15%, excepción de pensionados).
  - `LEGAL_CITATION_REGISTRY`: idNorma 1058072 registrado como conocido sin
    página de ley.
- **Tests**: 3 casos nuevos de elegibilidad/acreedor (7 en el archivo); build OK
  (9 guards); Playwright 195 passed.

### 2026-09-29 — Paso 6 (F08/F09/F10) implementado

- **F08**: el ejemplo ilustrativo de `sueldo-liquido` se genera en build con
  `calculateNetSalary` (mismos supuestos: $1.200.000, Habitat 11,27%, Fonasa,
  indefinido). Ahora muestra $973.347 e impuesto $213, igual que el runtime; el
  test de paridad compara ejemplo y resultado real.
- **F09**: el conversor UTM declara el período de la UTA: "12 × UTM de
  diciembre de 2025, cierre del año comercial" (derivado de
  `resolveEconomicIndicatorDate(..., "uta")`).
- **F10**: la fuente "Portabilidad Financiera (prepago sin costo)" pasa a
  "derecho a prepago sujeto a reglas y comisión aplicable".
- **Evidencia**: build OK (9 guards), 196 Playwright tests en verde.

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

- [x] AT2026 usa parámetros del período correcto; $18M ⇒ $269.368.
- [x] Cambiar la UTM vigente no altera AT2026 (test de aislamiento).
- [x] DAP sin retención automática para persona natural residente.
- [x] Freshness fail-closed en la calculadora de inflación (no afirma "última
      cifra disponible" cuando la serie está atrasada).
- [x] `ipc-historico.json` con el último período publicado (extensión oficial
      BCCh/INE; `TD-0112` resuelto) y assertion de frescura en CI.
- [x] SuperIR exige ≥2 acreedores distintos; DICOM y APV corregidos con fuente
      primaria.
- [x] Ejemplos publicados iguales al runtime (test de paridad).
- [ ] Math audit + compliance YMYL registrados para los cambios de contenido
      (tarea humana; separación de funciones).
- [x] Gates de la tabla en verde; plan 115 y `plans/README.md` actualizados.

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
