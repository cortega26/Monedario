# Integraciones externas — Monedario

> Documento descriptivo. Fuente de verdad de dependencias externas del sistema.
> No hay dependencias externas en runtime de navegador — el sitio es estático puro.

---

## Resumen ejecutivo

| Integración | Dirección | Cuándo | Fallback |
|---|---|---|---|
| **Mindicador** (indicadores económicos) | Outbound fetch | Build-time | Snapshot JSON en repo |
| **Pagefind** (búsqueda) | Bundled client-side | Runtime navegador | No aplica (JS propio) |
| **Astro Sitemap** (`@astrojs/sitemap`) | Build-time | Build | No aplica |
| **TailwindCSS v4** (`@tailwindcss/vite`) | Build-time | Build | No aplica |
| **Shiki** (syntax highlighting) | Build-time | Build | No aplica |

No hay llamadas a APIs externas en runtime de navegador ni servicios de backend propios.

---

## Mindicador (indicadores económicos de Chile)

**Propósito:** Proveer valores actualizados de UF, UTM, IPC, TMC y dólar para todas las calculadoras financieras.

**URL:** `https://mindicador.cl/api`

**Implementación:** `src/infrastructure/economic/EconomicParameterProvider.ts`

**Modo de operación:**
- La variable de entorno `TPI_ECONOMIC_PROVIDER_MODE` controla el modo:
  - `live` → fetch a Mindicador durante la build
  - `snapshot` → usa directamente el snapshot JSON (modo CI/test por defecto)
- Si la variable no está definida, el provider permanece en `snapshot`.

**Fallback en cascada:**
```
Modo por defecto (`snapshot`)
1. leer snapshot JSON  →  source: "snapshot"
2. Si snapshot falla → valores hardcoded de emergencia  →  source: "fallback"

Modo explícito (`live`)
1. fetch mindicador.cl/api  →  OK → source: "live"
2. Si falla → leer snapshot JSON  →  source: "snapshot"
3. Si snapshot falla → valores hardcoded de emergencia  →  source: "fallback"
```

**Snapshot de parámetros:**
- Ruta: `src/infrastructure/economic/economic-parameters.snapshot.json`
- Actualización: manual o via script `scripts/refresh-economic-snapshot.mjs`
- **Los tests de aplicación usan este snapshot directamente** (no hacen fetch real)

**Telemetría:** El provider expone un `EconomicTelemetryFlag` que indica la fuente usada (`economic_parameters_live | _snapshot | _fallback`). Se registra en build logs.

**Campos obtenidos:**

| Campo | Indicador Mindicador | Unidad |
|---|---|---|
| `uf` | `uf.valor` | CLP |
| `utm` | `utm.valor` | CLP |
| `ipc` | `ipc.valor` | % mensual |
| `tmc` | `tmc.valor` | % mensual |
| `dolar` | `dolar.valor` | CLP |

Los topes AFC y previsionales (`afcTopes`, `previsionalTopes`) se leen del snapshot, no de Mindicador.

---

## Pagefind (búsqueda estática)

**Propósito:** Búsqueda de texto completo client-side sin servidor.

**Implementación:** Integración automática de Astro build → genera índice en `public/pagefind/` en cada build.

**Página de búsqueda:** `src/pages/buscar.astro`

**Característica:** No hay API call en producción. El índice se sirve como assets estáticos.

---

## Astro integrations

Configuradas en `astro.config.ts`:

| Integración | Paquete | Función |
|---|---|---|
| Sitemap | `@astrojs/sitemap` | Genera `sitemap-index.xml` con prioridades y frecuencias de cambio |
| React | `@astrojs/react` | Soporte para componentes React (calculadoras interactivas, wizard) |
| MDX | `@astrojs/mdx` | Soporte para artículos en MDX con componentes Astro |
| TailwindCSS | `@tailwindcss/vite` | Estilos utility-first (v4 via plugin Vite) |

---

## Shiki (syntax highlighting)

**Paquete:** `shiki` (bundled con Astro)

**Transformadores configurados:**
- `transformerNotationDiff` — diffs de código con `+`/`-`
- `transformerNotationHighlight` — líneas resaltadas
- `transformerNotationWordHighlight` — palabras resaltadas
- `transformerFileName` (local, `src/utils/transformers/fileName.ts`) — nombre de archivo sobre el bloque

---

## Variables de entorno relevantes

| Variable | Valores válidos | Default | Descripción |
|---|---|---|---|
| `TPI_ECONOMIC_PROVIDER_MODE` | `live`, `snapshot` | `snapshot` | Controla si la build hace fetch a Mindicador |
| `SITE` (config interna) | — | — | Dominio y metadata del sitio en `src/config.ts` |

Definición de tipos de entorno: `src/env.d.ts` (schema Astro `envField`).

---

## CI y servicios de despliegue

El pipeline CI principal vive en `.github/workflows/ci.yml` y los jobs operativos programados viven en `.github/workflows/*.yml`. No hay un workflow de deploy repo-managed activo en este árbol: la publicación productiva la gestiona Cloudflare Pages a partir de este repositorio y del build estático generado. La configuración pública ligada al hosting sigue versionada en el repo, por ejemplo mediante `public/CNAME` y `public/_headers`.

El script `scripts/check-urls-external.mjs` audita URLs externas en el contenido editorial; su baseline se protege con `check-urls-baseline-guard.test.ts`.

---

## Dependencias sin integración activa

No hay dependencias externas de bases de datos, colas de mensajes, autenticación OAuth, ni servicios de email. El sitio es estático puro con un único punto de I/O externo en build: Mindicador.

---

## Referencias

- Provider económico: `src/infrastructure/economic/EconomicParameterProvider.ts`
- Snapshot: `src/infrastructure/economic/economic-parameters.snapshot.json`
- Config del build: `astro.config.ts`
- Variables de entorno: `src/env.d.ts`
- Script de actualización de snapshot: `scripts/refresh-economic-snapshot.mjs`
