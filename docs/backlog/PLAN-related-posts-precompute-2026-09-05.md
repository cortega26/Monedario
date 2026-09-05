# Cierre de related posts precompute — 2026-09-05

Estado: COMPLETADO localmente; sin publicación ni despliegue.

## Objetivo y alcance

Completar la integración pendiente en `advisor/007-related-posts-precompute`:
pasar el corpus y ranking calculados en `getStaticPaths` al layout y conservar
los tres relacionados, su orden y exclusiones por página.

En alcance: `src/utils/relatedPosts.ts`, `src/components/RelatedPosts.astro`,
`src/layouts/PostDetails.astro`, `src/pages/posts/[...slug]/index.astro`,
`tests/utils/relatedPosts.test.ts`, este plan y `todo.md` temporal.
Fuera: otros cambios locales, contenido editorial, URLs, despliegues y dependencias.

Autoridad: Constitución > AGENTS > context > código. Constitución §1 y §2.3;
`URL.PUBLIC.NO_POST_ID`, `ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS`.
Sin cambios de contratos públicos ni arquitectura: se completa el paso de props
internas existente. El fallback para artículos fuera del corpus se conserva.

## Aceptación y verificación

| Comprobación | Resultado esperado | Estado |
| --- | --- | --- |
| `pnpm exec vitest run tests/utils/relatedPosts.test.ts` | Equivalencia de ranking y exclusiones | PASS: 14 tests |
| `pnpm run check:ci` | Gates locales verdes | PASS: 162 archivos, 1438 tests; Astro sin diagnósticos |
| `pnpm run build` | Páginas renderizadas sin errores | PASS: 327 HTML, 7022 enlaces comprobados, cero internos rotos |
| `pnpm run check:rss` | Sin pérdida de entradas | PASS: 52 antes/después, cero añadidos o eliminados |
| `git diff --check` | Sin errores de whitespace | PASS |

## Change Control Record

- Scope y módulos: integración Astro de relacionados declarada arriba.
- Invariantes: URLs derivadas de slug; sin cambios editoriales ni nuevas rutas.
- Contratos y fronteras: sin API pública nueva, dependencias ni cambios de capas.
- Tests: ranking, exclusiones, fallback y build de integración.
- Riesgo: perder el ranking al pasar props o alterar exclusiones; verificar tests
  y renderizado real antes del cierre.
- Rollback: revertir conjuntamente los cuatro archivos de producto de relacionados
  y su test; no hay migraciones ni cambios de datos.
- Evidencia y revisión final: integración corregida para usar `posts` y pasar
  `relatedRankedSlugs` al layout. Revisado el diff completo de relacionados;
  ranking y exclusiones conservados, sin refactor adicional. La comparación de
  rutas confirmó 53 antes/después. Inspección con HTMLParser de los 53 artículos
  generados confirmó tres relacionados distintos por artículo, sin autorreferencia
  y con destinos existentes (excluyendo páginas numéricas de paginación).

## Límites de evidencia

Los primeros intentos de suite/build fallaron por restricciones del sandbox:
`spawnSync node` devolvía EPERM y el servidor de URLs no iniciaba. Repetidos fuera
del sandbox con autorización, ambos comandos finalizaron con exit 0.
Logs de sesión: `/tmp/monedario-007-ci.log`, `/tmp/monedario-007-build.log`,
`/tmp/monedario-007-rss.log` (temporales).

Los gates locales conservan sus avisos no bloqueantes de editorial/small-details;
esto no acredita ejecución de CI remota. Otros cambios locales preexistentes
permanecen fuera de esta unidad. Sin medición comparativa de tiempo de build:
la evidencia de amortización es el test del contador de construcción de matriz.
