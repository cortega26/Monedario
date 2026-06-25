# Plan — integrar hero de elegir inversión

## Alcance

- In-scope: `src/data/blog/como-elegir-inversion-segun-plazo-riesgo-objetivos.mdx`,
  `public/images/hero/como-elegir-inversion-segun-plazo-riesgo-objetivos*.avif`,
  registros generados de `scripts/hero-images/`, `context/published-articles-index.json`
  y la nota de imagen del draft editorial.
- Out-of-scope: contenido sustantivo del artículo, rutas, componentes, gates editoriales
  y cualquier otro artículo.
- Operaciones permitidas: conversión/copia de asset, actualización mínima de metadata,
  regeneración de manifiestos y validación.

## Autoridad e invariantes

- `docs/AI_ENGINEERING_CONSTITUTION.md`
- `docs/development/AGENT_EXECUTION_PROTOCOL.md` Rule 2.10
- `URL.PUBLIC.NO_POST_ID`: el nombre público deriva exclusivamente del `slug`.

## Pasos

- [x] Convertir la fuente manual a AVIF canónico y variantes responsivas.
- [x] Enlazar `heroImage` y actualizar el estado del pipeline.
- [x] Regenerar manifiesto/prompts y ejecutar gates de imagen.
- [x] Registrar evidencia, riesgo y rollback.

## Evidencia de cierre

- Fuente manual: `/home/carlos/Descargas/elegir-inversion.png`.
- Hero canónico: 1200×630, 11.7 KB.
- Variantes: tablet 800×420, 7.2 KB; mobile 600×315, 5.2 KB.
- `check:images`: PASS.
- `check:hero-images`: PASS.
- `check:hero-prompts`: PASS después de corregir el falso positivo previsional con
  un `SLUG_OVERRIDES` específico para decisión de inversión.
- `check:frontmatter`: PASS.
- `check:editorial`: PASS; conserva advertencias preexistentes no relacionadas en
  otros artículos.
- `pnpm run check`: PASS (0 errores; Astro reportó 13 hints no bloqueantes).

## Riesgo y rollback

- Riesgo residual: bajo; el artículo sigue en `draft: true`, por lo que no crea una ruta
  pública ni entra en RSS.
- Rollback: eliminar los tres AVIF y JPEG derivados, retirar `heroImage`, el estado y el
  override del slug, y regenerar `manifest.json`, `prompts.json` y el índice publicado.
