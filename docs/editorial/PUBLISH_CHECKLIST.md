## Cláusula de precedencia normativa

Este checklist es una proyección operativa de
`docs/editorial/NORMA_YMYL.md`.

En caso de conflicto, ambigüedad o divergencia interpretativa, la
versión vigente de `NORMA_YMYL.md` prevalece.

El checklist no puede introducir reglas que contradigan la norma.

# Publish Checklist (Editorial Gate)

## 1) Gate automático (obligatorio)

Ejecutar antes de publicar:

```bash
pnpm run build
pnpm run lint
```

`build` ya incluye:

- `astro check`
- `astro build`
- `check:toc-i18n`
- `check:editorial-guard`

`check:editorial-guard` valida:

- aparición de `table of contents`
- strings en inglés visibles (patrones bloqueados)
- más de un `H1` por archivo

## 2) Revisión editorial mínima

- Frontmatter alineado con `docs/editorial/FRONTMATTER_SCHEMA.md`.
- Política pilar/tool respetada según `docs/editorial/SEO_ARCHITECTURE.md`.
- Si hubo benchmark externo, `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md` aplicado con separación explícita entre fuentes oficiales y observaciones competitivas.
- Cumplimiento de `docs/editorial/NORMA_YMYL.md` (todos los MUST, máximo 1 SHOULD fallido).
- Interlinking mínimo:
  - pilar -> tool
  - tool -> pilar
  - anchor explícito
- Conflicto de ownership/no-canibalización revisado contra `docs/editorial/NON_CANNIBALIZATION_PROCESS.md` y `docs/editorial/TOPIC_OWNERSHIP_POLICY.md`.

## 3) Gate YMYL (obligatorio para contenido YMYL)

- Completar checklist de la sección 6 de `docs/editorial/NORMA_YMYL.md`.
- Incluir scorecard (sección 7) en el PR con ponderación explícita.
- Puntaje mínimo exigido para publicar: `>= 9.5/10`.
- Si el refresh usó benchmark externo, el publish packet debe probar que el `localDelta` prometido sí quedó visible en la pieza final.

## 4) Criterios de bloqueo (NO PUBLICAR)

- Falla cualquier comando de gate (`build` o `lint`).
- Hay `table of contents` visible.
- Se detecta más de un `H1` en una pieza.
- Falta enlace pilar/tool en clusters con herramienta publicada.
- Falta checklist YMYL o scorecard en PR para piezas YMYL.
- Benchmark externo usado como respaldo normativo de una afirmación YMYL.
- Existe conflicto de ownership/no-canibalización no resuelto para la pieza.
- Scorecard YMYL `< 9.5/10`.
