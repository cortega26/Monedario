# Paquete de math audit / compliance — plan 115 (correctitud)

Fecha: 2026-09-29
Estado: **PENDIENTE DE REVISIÓN HUMANA** — no marca gates de publicación.
Alcance: cambios de cálculo y copy YMYL de los PRs #556–#562 y #564.
Referencias: `docs/reports/AUDIT-CORRECTNESS-2026-09-28.md`,
`plans/115-correctness-remediation-2026-09-28.md`.

> Este paquete fue preparado por el agente que implementó los cambios. Por
> `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`, el audit y el compliance deben
> ejecutarlos una persona (u otro agente en sesión distinta). El resultado debe
> registrarse aquí o en el artefacto equivalente y firmarse antes de cerrar el
> gate de publicación.

## Qué revisar, por finding

| Finding | Cambio (archivos) | Fuente primaria | Vector / regresión |
|---|---|---|---|
| F01/F02 | `src/domain/taxation/TaxYearParameters.ts`, `TaxEngine.ts`, `src/pages/calculadoras/operacion-renta.astro` (#556) | Tabla AT2026 SII; Ley 21.830 (IMM); UF dic-2025 $39.643,59; UTA dic-2025 $834.504 | `tests/application/SimulateOperacionRenta.test.ts:32` ($18.000.000 ⇒ $269.367,84); `tests/domain/TaxYearParameters.test.ts` |
| Paso 3 | `src/domain/economic/EffectiveDatedParameters.ts`, `src/domain/taxation/TaxYearRegistry.ts` (#559) | ADR `ADR-20260929-effective-dated-economic-parameters` | `tests/domain/EffectiveDatedParameters.test.ts`, `tests/domain/TaxYearRegistry.test.ts` |
| F03 | `src/application/use-cases/CalculateTermDeposit.ts`, `deposito-a-plazo.astro` (#557) | SII FAQ 001.140.2738; art. 59 N°4 LIR (retención 4% solo Impuesto Adicional de no domiciliados) | `tests/application/CalculateTermDeposit.test.ts`; `CalculateTermDeposit.methodology.ts` |
| F04 | `src/utils/economicFreshness.ts`, `scripts/fetch-economic-history.mjs`, dataset IPC (#560, #573) | INE/BCCh `G073.IPC.VAR.2023.M` (empalme base 2023=100) | `tests/utils/economicFreshness.test.ts`; `tests/scripts/economic-history-ipc.test.ts`; `pnpm run check:economic-snapshot-freshness` |
| F05 | `src/pages/calculadoras/apv.astro` (#561) | Art. 42 bis N°3 LIR: tasa marginal ×1,1 + 3 pp; retención 15%; exención pensionados | `tests/domain/TaxEngine.test.ts`; `tests/accessibility/calculator-states.test.ts` |
| F06 | `src/application/use-cases/SimulateDebtRenegotiation.ts` + `.methodology.ts`, `simulador-renegociacion.astro` (#561) | Ley 20.720 art. 260 (≥2 acreedores distintos; `creditor` obligatorio) | `tests/application/FinancialUseCases.regression.test.ts:372`; `tests/application/SimulateDebtRenegotiation.test.ts` |
| F07 | `simulador-renegociacion.astro` (copy DICOM) (#561) | Ley 19.628 arts. 17-18; Ley 21.214 (solo alcance educacional) | Revisión de copy contra fuentes |
| F08 | `src/pages/calculadoras/sueldo-liquido.astro` (#562) | Parámetros AT2026 del motor | `tests/accessibility/calculator-states.test.ts:197` ($973.347 líquido / $213 impuesto); paridad runtime |
| F09/F10 | `conversor-utm.astro`, `dividendo-hipotecario.astro` (#562) | Ley 21.830 (UTA "diciembre de 2025"); condiciones de prepago | `tests/accessibility/calculator-states.test.ts` |
| Copy fix | `apv.astro`, `deposito-a-plazo.astro` (#564) | — | `SMALL_DETAILS_ENFORCE=1 pnpm run check:small-details` |

## Cómo reproducir

```bash
pnpm install --frozen-lockfile
pnpm run test
pnpm run build                      # 20 checks postbuild
SMALL_DETAILS_ENFORCE=1 pnpm run check:small-details
EDITORIAL_ENFORCE=1 pnpm run check:editorial
pnpm run check:economic-snapshot-freshness   # job programado; requiere snapshot
```

## Checklist del auditor (humano)

- [ ] Recalcular de forma independiente el vector dorado AT2026: $18.000.000 de
      renta neta ⇒ $269.367,84, con la tabla SII vigente y UTA dic-2025.
- [ ] Verificar UF dic-2025 ($39.643,59), UTA dic-2025 ($834.504) e IMM
      (Ley 21.830, retroactivo 01-05-2026).
- [ ] DAP: persona natural residente sin retención automática; 4% solo
      Impuesto Adicional (art. 59 N°4 LIR).
- [ ] APV: ×1,1 + 3 pp, retención 15%, excepción pensionados (art. 42 bis N°3).
- [ ] SuperIR: `creditor` obligatorio y ≥2 acreedores distintos (art. 260).
- [ ] DICOM: solo afirmaciones respaldadas por Ley 19.628 arts. 17-18; Ley
      21.214 tratada como educacional.
- [ ] Paridad de ejemplos publicados con el runtime (sueldo, UTA, prepago).
- [ ] Registrar resultado (APROBADO / defectos con detalle) y firmar.

## Resultado del audit

_(Pendiente: completar por el revisor humano con fecha y firma.)_
