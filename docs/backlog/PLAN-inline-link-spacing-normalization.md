# Plan: normalización global de espaciado de enlaces inline

## Objetivo

Impedir que el HTML estático publicado una palabras con enlaces inline cuando
Astro elimina el espacio de plantilla alrededor del elemento `<a>`.

## Alcance

- Implementar una integración de build que normalice el HTML publicado.
- Aplicarla desde `astro.config.ts`.
- Cubrir la normalización con pruebas unitarias.
- Revertir la corrección manual de `src/pages/autor.astro`.

## Fuera de alcance

- Cambios de rutas, URLs, contenido editorial, estilos o dependencias.

## Invariantes y contratos

- `URL.PUBLIC.NO_POST_ID` / `CONTRACT.PUBLIC_URLS`: no cambia construcción de URLs.
- `ROUTES.NO_SILENT_CHANGES` / `CONTRACT.ROUTES_SNAPSHOT`: no cambia el inventario de rutas.

## Decisión

Normalizar únicamente texto narrativo adyacente a enlaces dentro de elementos
de lectura (`p`, `li`, `blockquote`, `figcaption`, `dd`, `td`, `th`). La
transformación se ejecuta al finalizar el build sobre HTML estático, por lo que
no añade JavaScript de cliente ni usa CSS que pudiera separar erróneamente la
puntuación.

## Progreso

- [x] Diagnóstico: el HTML publicado contiene texto pegado a `<a>`.
- [x] Implementación y registro en Astro.
- [x] Pruebas y validación de build.

## Evidencia de cierre

- `pnpm run build`: pasó; la integración normalizó 13 páginas HTML estáticas.
- `pnpm run test`: 140 archivos y 1.187 pruebas pasaron.
- `pnpm run lint`, `pnpm run check:boundaries`, `pnpm run format:check`,
  `pnpm run check:no-postid-urls` y `pnpm run check:routes`: pasaron.
- La comprobación post-build confirmó que las 327 páginas HTML son idempotentes
  ante la normalización; por tanto, no quedan límites texto-enlace pendientes.
- La matriz unitaria cubre enlaces antes/después de palabras, puntuación española,
  enlaces consecutivos, formato inline y exclusiones de código/navegación.

## Rollback

Revertir `src/integrations/inline-link-spacing.ts` y su registro en
`astro.config.ts`. No requiere migración de datos ni de contenido.

## Despliegue

- Producción: `b21846f4-a496-4074-8e8b-f5af5c1859d1` de Cloudflare Pages.
- Commit de aplicación: `59c89bc2` (`fix(render): normalize inline link spacing`).
- Verificado en `https://monedario.cl/autor/`: el HTML servido contiene los
  espacios normalizados antes y después de los enlaces inline correspondientes.
