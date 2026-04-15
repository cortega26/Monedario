# Testing — Monedario

> Documento descriptivo del harness de pruebas. Autoridad normativa: `docs/AI_ENGINEERING_CONSTITUTION.md` §5.
> Umbrales de cobertura por capa: `AGENTS.md` §5 Regla 5.2.

---

## Runner y configuración

| Herramienta | Versión | Configuración |
|---|---|---|
| **Vitest** | v4 | `vitest.config.ts` en raíz |
| **Node environment** | `node` (sin jsdom) | Definido en `vitest.config.ts` |
| **Alias** | `@` → `src/` | `resolve.alias` en `vitest.config.ts` |

Comando: `pnpm run test` → ejecuta todos los archivos `tests/**/*.test.ts`.

---

## Estructura de tests

```
tests/
├── domain/               # Tests unitarios de dominio
├── application/          # Tests unitarios de casos de uso
├── infrastructure/       # Tests de infraestructura (actualmente .gitkeep)
├── integration/          # Tests de integración del sistema
├── scripts/              # Tests de scripts de CI/QA
└── e2e/                  # Pruebas E2E de artefactos de workflow
```

---

## Tests de dominio (`tests/domain/`)

Pruebas de funciones puras del dominio. Cero mocks, cero I/O.

| Archivo | Qué prueba |
|---|---|
| `EconomicParameters.test.ts` | Validación e invariantes de `EconomicParameters`; `assertEconomicParameters` |
| `TaxEngine.test.ts` | Tramos del Impuesto de Segunda Categoría; cálculo de montos y tasas marginales |

**Convención:** Las pruebas de dominio son las más simples — entrada → cálculo → resultado esperado. No deben mockear nada.

---

## Tests de aplicación (`tests/application/`)

Pruebas de casos de uso con parámetros reales tomados del snapshot económico.

| Archivo | Caso de uso probado |
|---|---|
| `CalculateNetSalary.test.ts` | Sueldo líquido completo |
| `CalculateMonthlyPayrollBase.test.ts` | Base imponible por tipo de contrato |
| `CalculateHonorariosNet.test.ts` | Liquidación boleta honorarios |
| `CalculateConsumerCredit.test.ts` | Cuota y TAE crédito de consumo |
| `CalculateMortgage.test.ts` | Dividendo hipotecario |
| `CalculateApvComparison.test.ts` | Comparativa APV A vs B |
| `CalculateRentAdjustment.test.ts` | Reajuste arriendo IPC |
| `CreditAmortization.test.ts` | Tabla de amortización |
| `EstimateFiniquito.test.ts` | Finiquito e indemnización |
| `EstimateUnemploymentCoverage.test.ts` | Cobertura seguro de cesantía |
| `SimulateCreditCardCost.test.ts` | Costo real tarjeta de crédito |
| `SimulateCreditPrepayment.test.ts` | Impacto prepago |
| `SimulateDebtRenegotiation.test.ts` | Renegociación de deuda |
| `SimulateOperacionRenta.test.ts` | Operación Renta |
| `SimulateRetirementProjection.test.ts` | Proyección pensión |
| `CalculatorPortfolio.test.ts` | Portafolio de calculadoras (contrato de todas) |
| `FinancialUseCases.regression.test.ts` | Suite de regresión: valores esperados fijos para todos los cálculos |

**Convención:** Los tests de aplicación reciben `EconomicParameters` reales (sin mock). Los valores vienen del snapshot `src/infrastructure/economic/economic-parameters.snapshot.json`.

---

## Tests de integración (`tests/integration/`)

Verifican comportamiento del sistema completo sin levantar un servidor.

| Archivo | Qué verifica |
|---|---|
| `canonical-urls.test.ts` | Todas las URLs canónicas son correctas y no usan `post.id` |
| `slug-collision.test.ts` | No hay colisión de slugs entre artículos |
| `homepage-content.test.ts` | Contenido mínimo de la homepage |
| `editorial-topic-policy.test.ts` | Política de no-canibalización entre temas |
| `cluster-source-of-truth.test.ts` | Coherencia de clústeres de enlazado interno |
| `analytics-utils.test.ts` | Utilidades de analytics (formato y sanitización) |
| `security-txt.test.ts` | Presencia y formato de `security.txt` |
| `safeGlobLoader.test.ts` | Carga segura de glob de contenido |

---

## Tests de scripts (`tests/scripts/`)

Pruebas de los scripts de QA y CI. La mayoría son unitarios de funciones internas de los scripts.

Categorías principales:
- **Hero images**: `hero-image-pool.test.ts`, `hero-images-config.test.ts`, `hero-images-prompt-plan.test.ts`, `check-hero-prompts.test.ts`
- **URL check**: `urlcheck-classify-external.test.ts`, `urlcheck-context.test.ts`, `urlcheck-external-artifacts.test.ts`, `urlcheck-extract-external.test.ts`, `urlcheck-host-registry.test.ts`
- **Editorial**: `frontmatter-schema.test.ts`, `check-editorial-timeliness.test.ts`, `refresh-editorial-volatile-data.test.ts`, `audit-topic-overlap.test.ts`
- **Legal**: `legal-citations.test.ts`
- **Images**: `check-images.test.ts`, `generate-images.test.ts`, `png-to-avif` (covered in `generate-images.test.ts`)
- **URL baseline guard**: `check-urls-baseline-guard.test.ts`
- **Domain boundaries**: `check-domain-boundaries.test.ts`
- **Weekly search report**: `build-weekly-search-report.test.ts`

---

## Tests E2E (`tests/e2e/`)

| Archivo | Qué verifica |
|---|---|
| `workflow-artifacts.e2e.test.ts` | Presencia de artefactos de workflow editorial en `artifacts/` |

---

## Cobertura mínima requerida (AGENTS.md §5.2)

La cobertura numérica no está configurada en CI. El protocolo vigente exige:

- Si se cambia `src/domain/**` → **al menos un archivo** en `tests/domain/**` debe añadirse o modificarse en el mismo PR.
- Si se cambia `src/application/**` → **al menos un archivo** en `tests/application/**` debe añadirse o modificarse en el mismo PR.
- Si se cambia `src/infrastructure/**` → **al menos un archivo** en `tests/infrastructure/**` debe añadirse o modificarse en el mismo PR.

---

## Regresiones conocidas

La suite `FinancialUseCases.regression.test.ts` es el artefacto de regresión primario. Contiene valores esperados fijados para cada calculadora. Si una fórmula cambia, **deben actualizarse los valores esperados y documentarse el cambio en el commit**.

---

## Snapshot económico en tests

Los tests de aplicación usan `src/infrastructure/economic/economic-parameters.snapshot.json` directamente (no hacen fetch). Si se actualiza el snapshot, algunos valores en tests de regresión pueden necesitar actualización.

---

## Convención de nombres

```
tests/<capa>/<NombreModulo>.test.ts         # unitario
tests/<capa>/<NombreModulo>.regression.test.ts  # regresión
```

---

## Referencias

- Configuración del runner: `vitest.config.ts`
- Umbrales de cobertura: `AGENTS.md` §5.2
- Gate de CI: `pnpm run test` (bloqueante en CI — `ci.yml`)
- Snapshot económico: `src/infrastructure/economic/economic-parameters.snapshot.json`
