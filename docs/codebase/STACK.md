# Stack

Descripcion factual del stack del repositorio para contributors y agentes.

## Runtime principal

- Node 22 (`.nvmrc`)
- pnpm 10.30.2 (`package.json` -> `packageManager`)
- ESM (`"type": "module"`)

## Frameworks y librerias de aplicacion

- Astro 6 (`astro`)
- React 19 (`react`, `react-dom`)
- MDX (`@astrojs/mdx`)
- RSS (`@astrojs/rss`)
- Sitemap (`@astrojs/sitemap`)
- TailwindCSS 4 (`tailwindcss`, `@tailwindcss/vite`)
- Sharp (`sharp`) para procesamiento de imagenes
- Satori y Resvg (`satori`, `@resvg/resvg-js`) para imagenes OG
- Day.js (`dayjs`) para fechas

## Tooling de calidad

- TypeScript 5
- Vitest 4
- ESLint 10
- Prettier 3
- Astro check (`@astrojs/check`)
- Pagefind para busqueda estatica

## Integraciones de build

- Mindicador como fuente externa opcional de datos economicos
- GitHub Actions para CI, deploy y jobs programados
- GitHub Pages como destino de despliegue

## Convenciones tecnicas visibles

- Alias `@` -> `src/`
- Runner de tests en entorno `node`
- Sitio estatico con validaciones de contenido, rutas, RSS, URLs e imagenes en build/CI

## Evidence

- `package.json`
- `.nvmrc`
- `vitest.config.ts`
- `eslint.config.js`
- `.github/workflows/ci.yml`
- `README.md`