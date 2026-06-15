# Arquitectura del sistema — Monedario

> Documento descriptivo. Autoridad normativa: `docs/AI_ENGINEERING_CONSTITUTION.md`.
> Fronteras de capa: `context/CONTRACTS.md`, `context/DOMAIN_CONTRACT_BOUNDARIES.md`.

---

## Modelo de capas

El sistema sigue una arquitectura limpia de cuatro capas con dependencias unidireccionales (hacia adentro):

```
┌──────────────────────────────────────────────────────┐
│  Presentation  (src/pages/, src/layouts/, src/components/)  │
├──────────────────────────────────────────────────────┤
│  Application   (src/application/use-cases/)          │
├──────────────────────────────────────────────────────┤
│  Domain        (src/domain/)                         │
├──────────────────────────────────────────────────────┤
│  Infrastructure (src/infrastructure/)                │
└──────────────────────────────────────────────────────┘
```

Regla de dependencias:
- **Presentation** → Application, Domain
- **Application** → Domain
- **Domain** → nada (cero imports de otras capas)
- **Infrastructure** → Domain

Esta regla se verifica en CI mediante `pnpm run check:boundaries` (ver `scripts/check-domain-boundaries.mjs`).

---

## Capa: Domain (`src/domain/`)

Contiene entidades, tipos, reglas y funciones puras sin efectos secundarios ni dependencias externas.

| Módulo | Archivo principal | Responsabilidad |
|---|---|---|
| `content` | `path.ts` | Helpers de ruta canónica basados en `slug` (invariante `URL.PUBLIC.NO_POST_ID`) |
| `economic` | `EconomicParameters.ts` | Tipo `EconomicParameters`, indicadores económicos (UF, UTM, IPC, TMC, dólar), validación con `assertEconomicParameters` |
| `taxation` | `TaxEngine.ts` | Motor de Impuesto de Segunda Categoría: tramos, cálculo de impuesto mensual y anual |
| `wizard` | `WizardConfig.ts`, `analyzeWizardConfig.ts` | Configuración y validación de pasos del wizard de decisión financiera |

**Regla clave:** `src/domain/**` **nunca** importa de `src/application/**`, `src/infrastructure/**`, ni de `@/config`.

---

## Capa: Application (`src/application/use-cases/`)

Casos de uso orquestados: reciben parámetros tipados, llaman al dominio, devuelven resultados calculados. Sin I/O ni side effects directos.

| Caso de uso | Descripción |
|---|---|
| `CalculateNetSalary` | Sueldo líquido desde bruto: AFP, salud, impuesto 2da categoría, AFC |
| `CalculateMonthlyPayrollBase` | Base imponible para contratos dependientes e independientes |
| `CalculateHonorariosNet` | Liquidación de boleta de honorarios (retención 13.75 %) |
| `CalculateConsumerCredit` | Cuota y costo total de crédito de consumo |
| `CalculateCompoundInterest` | Cálculo de interés compuesto con aportes periódicos |
| `CalculateMortgage` | Dividendo hipotecario con seguro de desgravamen/incendio |
| `CalculateApvComparison` | Comparativa APV Régimen A vs B |
| `CompareAfpCommissions` | Comparación de comisiones entre AFP |
| `CalculateRentAdjustment` | Reajuste de arriendo por IPC acumulado |
| `CalculateTermDeposit` | Simulación de depósito a plazo fijo |
| `ConvertUf` | Conversión CLP ↔ UF |
| `ConvertUtm` | Conversión CLP ↔ UTM |
| `EstimateFiniquito` | Estimación de finiquito e indemnización laboral |
| `EstimateUnemploymentCoverage` | Cobertura seguro de cesantía (AFC) |
| `SimulateCreditCardCost` | Simulación de costo real de tarjeta de crédito |
| `SimulateCreditPrepayment` | Impacto de prepago de crédito |
| `SimulateDebtRenegotiation` | Comparativa de renegociación de deuda |
| `SimulateOperacionRenta` | Estimación Operación Renta (Renta Anual) |
| `SimulateRetirementProjection` | Proyección de pensión de vejez |
| `GetEconomicParameters` | Obtiene parámetros económicos desde la infraestructura |

Los casos de uso viven en `src/application/use-cases/`. Comparten helpers en `src/application/use-cases/shared/`.

---

## Capa: Infrastructure (`src/infrastructure/`)

Implementa adaptadores de I/O que el dominio define como interfaces.

| Módulo | Descripción |
|---|---|
| `economic/EconomicParameterProvider.ts` | Obtiene indicadores económicos desde la API externa **Mindicador** (`mindicador.cl`); fallback a snapshot JSON y a valores hardcoded de emergencia |
| `economic/economic-parameters.snapshot.json` | Snapshot de parámetros usados como fallback en build y en tests |
| `editorial/editorial-volatile-data.snapshot.json` | Snapshot de datos editoriales volátiles (noticias, alertas) |

**Regla clave:** los efectos secundarios (fetch, filesystem, cache) **solo** viven en `src/infrastructure/**`.

---

## Capa: Presentation (`src/pages/`, `src/layouts/`, `src/components/`)

Astro SSG con generación estática completa. No hay SSR en producción (modo `output: "static"`).

### Páginas (`src/pages/`)

| Ruta | Descripción |
|---|---|
| `index.astro` | Homepage con indicadores y accesos directos |
| `posts/[slug].astro` | Artículos editoriales (blog/finanzas personales) |
| `calculadoras/` | 16 calculadoras financieras |
| `guias/` | Guías de contenido largo |
| `glosario/` | Glosario de términos financieros |
| `leyes/` | Compendio de normas relevantes |
| `tags/[tag].astro` | Páginas de etiquetas |
| `buscar.astro` | Búsqueda client-side (Pagefind) |
| `rss.xml.ts` | Feed RSS |
| `og.png.ts` | Generación dinámica de OG images |

### Componentes clave (`src/components/`)

| Componente | Rol |
|---|---|
| `DecisionWizard.astro` | Wizard de decisión financiera interactivo |
| `IndicadoresHoy.astro` | Widget de indicadores económicos en tiempo real |
| `TOCSidebar.astro` | Tabla de contenidos lateral para artículos |
| `ArticleJsonLd.astro` | Datos estructurados JSON-LD para artículos |
| `MethodologyBlock.astro` | Bloque de metodología y disclaimers YMYL |

---

## Generación de contenido

El contenido editorial vive en `src/data/blog/` (colección Astro Content Collections, schema en `src/content.config.ts`). La build genera HTML estático para cada artículo.

Parámetros económicos activos (`EconomicParameters`) se obtienen durante la **build** (no en runtime del navegador): el `EconomicParameterProvider` intenta Mindicador, cae a snapshot si la API falla.

---

## URLs canónicas

Todas las URLs públicas se derivan de `slug`, nunca de `post.id`. Ver invariante `URL.PUBLIC.NO_POST_ID` en `context/INVARIANTS.md`.

Helper de ruta: `src/domain/content/path.ts` → `getCanonicalPathFromSlug(slug)`.

---

## Diagrama de flujo de build

```
pnpm run build
  ├─ check:images + check:hero-images + check:frontmatter
  ├─ check:legal-citations
  ├─ astro check
  ├─ astro build
  │    ├─ EconomicParameterProvider
  │    │    ├─ → economic-parameters.snapshot.json (modo deterministico)
  │    │    └─ → mindicador.cl (solo modo live opcional)
  │    ├─ Colecciones Astro (blog, glossary, laws)
  │    └─ Páginas estáticas + assets
  ├─ check:toc-i18n + check:editorial-guard
  ├─ pagefind --site dist
  ├─ cp -r dist/pagefind public/
  └─ check:urls sobre dist/
```

---

## Dependencias externas en runtime de build

| Servicio | URL | Fallback |
|---|---|---|
| Mindicador | `https://mindicador.cl/api` | Snapshot JSON en repo |

No hay dependencias externas en runtime del navegador (sitio estático puro).

---

## Referencias

- Reglas de capa: `docs/AI_ENGINEERING_CONSTITUTION.md` §2
- Fronteras explícitas: `context/DOMAIN_CONTRACT_BOUNDARIES.md`
- Invariante URL: `context/INVARIANTS.md` → `URL.PUBLIC.NO_POST_ID`
- Contratos de dominio: `context/CONTRACTS.md`
