# Monedario

_Parte del [ecosistema Tooltician](https://tooltician.com) — educación financiera para Chile, clara y sin letra chica._

[![Parte de Tooltician](https://tooltician.com/badge.es.svg)](https://tooltician.com)

Proyecto educativo de finanzas personales para Chile. Su objetivo es explicar, con lenguaje claro y sin letra chica, temas como AFP, APV, impuestos, inversiones y herramientas prácticas (calculadoras) para que cualquier persona pueda comprender y tomar mejores decisiones con su dinero.

Este sitio es 100% educativo: no solicita datos personales, no ofrece asesoría personalizada ni promueve productos financieros. Todo su contenido busca informar y enseñar de forma responsable y accesible.

## Sitio en producción

- URL: https://monedario.cl/

## Tecnologías principales

- Astro 6 + TypeScript 6
- TailwindCSS (Vite plugin)
- Pagefind (búsqueda estática)
- Shiki (resaltado de código)

## Estructura relevante

- src/
  - pages/
    - index.astro (inicio)
    - posts/ (listado y detalles de artículos)
    - tags/ (índice y paginación de etiquetas)
    - calculadoras/ (índice y calculadoras financieras)
    - guias/ (hubs editoriales por cluster)
    - glosario/ (términos financieros)
    - leyes/ (referencias legales)
    - archives/ (archivo de artículos)
    - search.astro (búsqueda)
    - 404.astro (página de error)
  - dev-pages/ (herramientas internas inyectadas solo en dev)
  - data/
    - blog/ (contenido de artículos en Markdown/MDX)
    - glossary/ (entradas de glosario)
    - laws/ (referencias legales)
  - components/ (componentes UI como Header, Card, Pagination, etc.)
  - layouts/ (plantillas de páginas)
  - utils/ (utilidades para rutas, ordenamiento, etc.)

## Documentación de gobernanza

- Backlog técnico versionado: `docs/TECH_DEBT_BACKLOG.md`
- Baseline de medición Fase 1: `docs/operations/reports/phase1_measurement_baseline.md`
- Fronteras de dominio: `docs/architecture/DOMAIN_CONTRACT_BOUNDARIES.md`
- Constitución de ingeniería para agentes IA/humanos: `docs/AI_ENGINEERING_CONSTITUTION.md`

## Desarrollo local

Requisitos: Node 22

Inicio rapido:

- Ver [START_HERE.md](./START_HERE.md) para el flujo de bootstrap y los entry points operativos.
- Ver [docs/operations/runbooks/bootstrap-checklist.md](./docs/operations/runbooks/bootstrap-checklist.md) para validar un entorno local limpio antes de empezar a editar.

- Instalar dependencias:
  - pnpm install --frozen-lockfile
- Ejecutar en modo desarrollo:
  - pnpm run dev
- Abrir herramientas internas de desarrollo:
  - `/dev/hero-images/` está disponible en `pnpm run dev`.
  - Para incluir páginas dev en un build diagnóstico: `BUILD_DEV_PAGES=1 pnpm run build`.
- Compilar para producción y generar búsqueda:
  - pnpm run build
- Validar antes de proponer un cambio:
  - pnpm run lint
  - pnpm run check:boundaries
  - pnpm run format:check
  - pnpm run test
  - pnpm run check

Notas:

- El proyecto usa dominio raíz (`/`) en producción. Para evitar enlaces rotos, los componentes generan URLs usando `import.meta.env.BASE_URL` normalizada con barra final.
- La generación de páginas de artículos se basa en contenido Markdown dentro de src/data/blog.
- El runtime alineado con CI es Node 22; `.nvmrc` fija esa versión para bootstrap local.

## Editorial Artifact Gate (Phase 1)

- Comando: `pnpm run check:editorial-artifacts`
- Integración: se ejecuta dentro de `pnpm run check:editorial`.
- Modo por defecto: `warn-only` (reporta deuda sin romper el pipeline).
- Modo estricto: `EDITORIAL_ENFORCE=1 pnpm run check:editorial-artifacts` (falla por artefactos/campos obligatorios faltantes).
- Ubicación canónica de artefactos: `artifacts/editorial/<slug>/<run-id>/` (según `context/EDITORIAL_AI_PIPELINE.md` y `context/CONTRACTS.md`).

## CI y despliegue

El repositorio incluye workflows de GitHub Actions bajo `.github/workflows/` para CI, auditorías programadas y operaciones auxiliares. El workflow principal (`ci.yml`):

- Ejecuta `pnpm install --frozen-lockfile`.
- Corre lint, formato, tests, contratos de contenido, rutas/RSS/URLs y build.
- Sube artefactos de validación cuando corresponde.

No hay un workflow de deploy repo-managed activo en este árbol. La publicación productiva usa Cloudflare Pages para consumir este repositorio y servir el build estático; los workflows versionados aquí cubren CI y jobs operativos, no el paso final de publish.

Asegúrate de que:

- La configuración de Astro (`astro.config.ts`) deriva `base` desde `SITE.website` y debe permanecer alineada con el dominio público.
- La constante `SITE.website` en `src/config.ts` debe apuntar a `https://monedario.cl/`

## Economic Data Governance & Fallback Strategy

Fuente única:

- Todas las calculadoras que dependen de UF/UTM/TMC/AFC consumen `getEconomicParameters()` y, por debajo, `src/infrastructure/economic/EconomicParameterProvider.ts`.

Estrategia de datos y cache:

- Fuente principal por defecto en build/CI y desarrollo reproducible: `src/infrastructure/economic/economic-parameters.snapshot.json` (determinística, sin red).
- El modo live solo se activa con `TPI_ECONOMIC_PROVIDER_MODE=live`.
- En modo live, el provider intenta `https://mindicador.cl/api` y, si falla, vuelve al snapshot local.
- Se memoiza en módulo (`cachedBundlePromise`) para evitar múltiples lecturas/fetch en un mismo ciclo de ejecución.
- Telemetría mínima disponible vía `getEconomicProviderTelemetry()`:
  - `externalFetchCount`
  - `cacheHitCount`
  - `lastSource`
  - `lastFallbackReason`

Fallback controlado:

- Si falla el snapshot (archivo inválido/faltante), el provider retorna un bundle con:
  - `parameters.source = "fallback"`
  - `parameters.lastUpdated` en formato `YYYY-MM-DD`
  - `telemetryFlag = "economic_parameters_fallback"`
- La UI expone la fuente y fecha de datos en calculadoras e indicadores; cuando aplica fallback se muestra explícitamente el modo fallback.

Refresh del snapshot:

- Comando: `pnpm run economic:snapshot:refresh`
- Este script consulta `mindicador.cl` y actualiza `economic-parameters.snapshot.json` con sello temporal (`capturedAt`).

Validación automatizada:

- Pruebas de fallback y memoización: `tests/infrastructure/EconomicParameterProvider.test.ts`.
- Pruebas de regresión numérica de motores: `tests/application/FinancialUseCases.regression.test.ts`.
- Pruebas de dominio tributario e invariantes económicos: `tests/domain/*.test.ts`.

## Convenciones y accesibilidad

- Enlaces internos usan siempre la base del sitio y terminan con barra final.
- Etiquetas visibles están en español para reforzar el carácter educativo.
- Se incluyen atributos aria y estados activos consistentes.

## Alcance educativo

- El propósito es orientar y educar. El contenido no constituye asesoría financiera ni reemplaza el criterio profesional.
- Se fomenta el uso de herramientas (p. ej., calculadoras) para que cada persona realice sus propios números y comprenda conceptos clave.

## Contribuciones

- Sugerencias de contenido, correcciones y mejoras son bienvenidas mediante issues y pull requests.
- Se prioriza la claridad, precisión y responsabilidad en la comunicación financiera.

## Licencias

Este proyecto usa dos licencias distintas:

- **Código fuente y scripts**: [AGPL-3.0-only](./LICENSE.md).
  Si alguien modifica y ofrece el software como servicio, debe publicar el
  código fuente correspondiente bajo los términos de la AGPL.
- **Contenido editorial** (`src/data/`, artículos, guías, glosario):
  [CC BY-NC 4.0](./LICENSE-CONTENT.md) — libre para compartir y adaptar con
  atribución, prohibido uso comercial sin permiso.
- **Marca, nombre, logo, imágenes y activos de diseño**: no están cubiertos por
  la licencia del código; quedan reservados salvo autorización explícita.

---

_Parte del [ecosistema Tooltician](https://tooltician.com) — educación financiera para Chile, clara y sin letra chica._
