# Cierre técnico de la renovación visual v5

Fecha: 2026-10-01
Rama: `wip/renovacion-visual-editorial-2026-10-01`
Worktree de cierre: `/tmp/monedario-visual-v5`

## Estado

La entrega técnica de imágenes editoriales queda completa en este worktree, sin
despliegue ni integración sobre el checkout compartido. El hallazgo del corte
independiente anterior —manifiesto vacío y 54 artículos pendientes— quedó
superado por la construcción posterior de la entrega.

El manifiesto contiene 54 artículos y `public/images/editorial/` contiene 54
directorios de entrega. Hay 24 selecciones nuevas con revisión `accepted`; las
30 portadas restantes se conservan deliberadamente conforme al plan. Para cada
artículo se verifican hero, tablet, mobile y OG desde una fuente coherente.

## Verificación final

- `check:hero-prompts`: 54/54, estilo `monedario-editorial-v5`.
- `check:image-curation`: prompts, fingerprints editoriales y bytes conformes.
- `check:image-delivery`: 54 artículos, 0 cambios pendientes.
- `check:hero-images`: 54 artículos publicados conformes.
- QA visual manual: las 54 portadas revisadas a aproximadamente 300 px; sin
  defectos bloqueantes de recorte, bandas negras o texto generado evidente.
- Suite focalizada de imagen/analítica: 116/116 tests aprobados.
- `pnpm run build`: PASS; 333 páginas, 7.269 enlaces revisados, 0 internos rotos,
  0 fallos externos y 24/24 comprobaciones post-build.
- Rutas: única adición aprobada
  `/posts/cotizacion-voluntaria-afp-independiente/`; ninguna eliminación.
- RSS: única adición correspondiente al mismo artículo; ninguna eliminación.
- `pnpm run check:ci`: PASS completo después de sincronizar los dos nuevos
  eventos editoriales en las allowlists de Data Signals.
- `astro check`: 630 archivos, 0 errores, 0 warnings, 0 hints.

## Corrección de cierre

La suite completa detectó que `editorial_image_impression` y
`editorial_image_click` existían en el contrato canónico, pero faltaban en
`scripts/data-signals/fetch-analytics-export.mjs` y
`scripts/build-weekly-search-report.mjs`. Se añadieron a ambas allowlists y el
test de sincronización pasó 2/2 antes de repetir la CI completa.

## Límites pendientes por diseño

Los candidatos de gráficos de interés compuesto permanecen fuera de `public/`.
Su paquete reproducible está preparado, pero su auditoría matemática independiente
y firma humana siguen pendientes. Este cierre no certifica esos checkpoints ni
autoriza publicar los gráficos.

No se realizó merge, rebase, reset, despliegue ni modificación del checkout
principal durante el cierre, porque existe trabajo concurrente de otro agente.
