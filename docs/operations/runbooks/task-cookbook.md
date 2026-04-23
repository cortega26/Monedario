# Task Cookbook

Referencia rápida para tareas operativas frecuentes en el repositorio. Este documento no reemplaza la autoridad canónica: si hay conflicto, mandan `docs/AI_ENGINEERING_CONSTITUTION.md`, `AGENTS.md`, `context/INVARIANTS.md` y `context/CONTRACTS.md`.

## Cómo agregar un artículo nuevo

Antes de empezar:
- Revisa `context/CONTRACTS.md` para el frontmatter requerido.
- Si el artículo es YMYL o refresh sustantivo, aplica además `context/EDITORIAL_AI_PIPELINE.md` y `docs/editorial/NORMA_YMYL.md`.

Pasos:

1. Crear `src/data/blog/{slug}.md` con frontmatter válido.
2. Ejecutar `node scripts/hero-images/scan-articles.mjs` para actualizar `scripts/hero-images/manifest.json`.
3. Ejecutar `node scripts/hero-images/build-prompts.mjs` para regenerar `scripts/hero-images/prompts.json`.
4. Generar manualmente la hero image desde el prompt y guardar `public/images/hero/{slug}.avif` con peso máximo de 80 KB.
5. Marcar la entrada correspondiente en `scripts/hero-images/status.json` como `{ "state": "done" }`.
6. Ejecutar `pnpm run check:frontmatter` y confirmar que pasa.
7. Ejecutar `pnpm run check:hero-prompts` y confirmar que pasa.
8. Ejecutar `pnpm run check:hero-images` y confirmar que pasa.
9. Ejecutar `node scripts/scaffold-editorial-artifacts.mjs {slug}` para crear los artefactos editoriales requeridos.
10. Ejecutar `pnpm run check:editorial-artifacts` y confirmar que pasa antes de merge.

Checklist mínimo de salida:

- Frontmatter válido.
- Hero prompt semánticamente consistente.
- Hero image publicada y registrada.
- Artefactos editoriales creados.
- Gates editoriales en verde.

## Cómo agregar o modificar una calculadora

Scope obligatorio:
- In scope: `src/pages/calculadoras/`, `src/domain/`, `tests/domain/`.
- Out of scope por defecto: cualquier refactor fuera de esas rutas.

Pasos:

1. Declarar scope antes de editar.
2. Agregar o actualizar la lógica de dominio en `src/domain/`.
3. Agregar o actualizar el test correspondiente en `tests/domain/`.
4. Ejecutar `pnpm run test` y confirmar que pasa.
5. Ejecutar `pnpm run check:boundaries` y confirmar que pasa.
6. Ejecutar `pnpm run lint` y confirmar que pasa.

Checklist mínimo de salida:
- Cambio de dominio cubierto por tests.
- Boundaries sin violaciones.
- Lint limpio.

## Cómo cambiar una URL pública o slug

Halt inicial:
- Leer `context/INVARIANTS.md` y preservar `URL.PUBLIC.NO_POST_ID`.

Reglas:
- Cambiar el slug solo en frontmatter.
- Nunca derivar URL pública desde `post.id`.

Pasos:

1. Cambiar `slug` en frontmatter.
2. Ejecutar `pnpm run check:no-postid-urls` y confirmar que pasa.
3. Ejecutar `pnpm run check:routes` y revisar el diff reportado.
4. Si el cambio es intencional, actualizar la baseline con `pnpm run routes:snapshot`.

Checklist mínimo de salida:
- Sin uso público de `post.id`.
- Diff de rutas revisado.
- Baseline actualizada solo si el cambio fue intencional.

## Suite pre-merge completa

```sh
pnpm run lint
pnpm run check:boundaries
pnpm run format:check
pnpm run test
pnpm run check
```

## Notas de uso

- Este cookbook resume ejecución. No redefine contratos.
- Si una tarea toca rutas, RSS, canonical o guard gates, relee `context/INVARIANTS.md` y `context/CONTRACTS.md` antes de editar.
- Si una tarea descubre deuda relevante fuera de scope, regístrala en `docs/TECH_DEBT_BACKLOG.md` en lugar de mezclar refactors oportunistas.
