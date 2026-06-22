# Plan — preparación del pilar finanzas para migrantes

Fecha: 2026-06-22
Estado: publicación aprobada y completada
Owner humano: Carlos Ortega

## Objetivo

Completar G8–G14 del publish packet de `finanzas-para-migrantes-chile` y publicar el
artículo después del sign-off explícito del HumanEditor. El hub enlaza la guía principal
y queda indexable; el artículo se publica con hero principal y variantes responsive.

## Change Control Record

1. Scope declaration

- In scope: `src/config/clusters.ts`, `src/pages/guias/finanzas-migrantes/`,
  `src/data/blog/finanzas-para-migrantes-chile.md`, ADR y registros de ownership
  asociados, hero G9, cierre documental Gate 07, este plan y verificaciones G11–G14.
- Out of scope: marcado automático de gates reservados al HumanEditor, push y despliegue.

2. Impacted modules

- `src/config/clusters.ts`: registrar el cluster sin incorporarlo aún a navegación.
- `src/pages/guias/finanzas-migrantes/index.astro`: shell noindex de preparación.
- `src/data/blog/finanzas-para-migrantes-chile.md`: materializar el draft aprobado.
- `docs/adr/`: documentar exposición, ownership y condición de lanzamiento.
- `docs/research/seo/strategy/topic_ownership_matrix.md`: registrar el owner futuro.
- `docs/editorial/TOPIC_OWNERSHIP_POLICY.md`: declarar la frontera del cluster.
- `scripts/legal-citations/registry.mjs`: registrar las dos leyes BCN citadas por el
  artículo y auditadas en Gate 06.
- `tests/integration/cluster-source-of-truth.test.ts`: actualizar el contrato de cantidad
  y presencia de clusters.
- `src/pages/como-usamos-los-datos.astro`: retirar un comentario HTML interno que el gate
  lector interpretaba como copy público; sin cambio renderizado.

3. Invariant preservation

- `URL.PUBLIC.NO_POST_ID`: toda identidad pública usa el `slug` explícito.
- `ROUTES.NO_SILENT_CHANGES`: ejecutar `check:routes` y reportar el alta.
- `RSS.NO_REMOVALS`: ejecutar `check:rss`; el draft no debe entrar al feed.
- `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`: owner y frontera definidos antes
  del lanzamiento.
- `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`: no se alteran auditorías ni gates.

4. Contract preservation

- `CONTRACT.PUBLIC_URLS`, `CONTRACT.ROUTES_SNAPSHOT`, `CONTRACT.RSS_POLICY`,
  `CONTRACT.FRONTMATTER_POLICY` y `CONTRACT.YMYL_RESPONSE_STRUCTURE`.
- Breaking changes: no.

5. Boundary integrity

- `pnpm run check:boundaries`: pass.
- Unauthorized cross-layer imports introduced: no.

6. Test coverage impact

- Changed runtime layers: configuración editorial y nueva página Astro.
- Related tests: test de source of truth de clusters actualizado y test legal ejecutado.
- Coverage threshold: suite completa pass, 111 archivos y 838 tests.

7. Rollback strategy

- Revert unit: eliminar artículo/hub/ADR y retirar cluster/ownership en un único
  revert coherente.
- Data/content rollback needed: no.

8. Regression risk

- Risk level: medio por alta de ruta y contenido YMYL, mitigado con fuentes oficiales,
  auditorías PASS, sign-off humano y gates completos.
- Primary vectors: exposición prematura, cluster inválido, enlaces rotos, drift de
  ownership y entrada accidental en RSS.
- Mitigations: ownership explícito, exclusión de `HubCluster`, rollback a draft y gates obligatorios.

## Competitive Adaptation Appendix

- benchmarkSet: ChileAtiende, BancoEstado y portales oficiales declarados en
  `01-brief.yaml`; se usan para packaging y trazabilidad, no como diseño copiado.
- patternHypothesis: un recorrido único por RUT, cuenta y arriendo reduce la
  fragmentación inicial de una persona migrante.
- localDelta: integra mecánica financiera chilena con límites explícitos y fuentes
  profundas, sin convertir la guía en asesoría migratoria.
- nonCopyBoundaries: no copiar texto, URL, claims ni estructura propietaria de terceros.
- ownerTarget: cluster y hub `finanzas-migrantes`; owner
  `finanzas-para-migrantes-chile`.
- successSignal: G8–G14 y gates de rutas/RSS pasan; el artículo entra al build y RSS solo
  después del sign-off humano.
- ownership conflict check: pass; bancos, empleo y UF quedan como relacionados, no core.

## Progreso

- [x] Overlap previo revisado.
- [x] G8 implementado.
- [x] G9 implementado con hero principal y variantes responsive.
- [x] G10 implementado con `draft: true`.
- [x] G11–G14 verificados.
- [x] Gates adicionales de cierre verificados.
- [x] Gate 07 firmado por Carlos Ortega y artículo cambiado a `draft: false`.

## Evidencia final

- G11 `pnpm run check:frontmatter`: pass; 51 artículos, 0 errores bloqueantes.
- G12 `pnpm run check:links`: pass; 50 artículos publicados, 248 links, 0 rotos.
- G13 `pnpm run check:dialect`: pass; 51 archivos.
- G14 `pnpm run check:editorial`: pass; 0 issues bloqueantes. Warnings aceptados:
  description de 175 caracteres y 0 links intra-cluster por ser el primer artículo.
- `pnpm run test`: pass; 111 archivos, 838 tests.
- `pnpm run check:boundaries`: pass.
- `pnpm run check:no-postid-urls`: pass; 252 archivos.
- `pnpm run audit:topic-overlap`: pass; 0 warnings de metadata y sin conflicto nuevo.
- `pnpm run check:legal-citations`: pass; registro actualizado para Ley 18.101 y
  Ley 20.609.
- `pnpm run build`: pass; 314 páginas, 0 errores Astro, URLs internas/externas sin fallos.
- La evidencia final de rutas, RSS y build tras publicación se registra en la ejecución de
  cierre posterior al sign-off humano.
- Exposición: `/guias/finanzas-migrantes/` queda indexable y enlaza la guía principal; el
  artículo es público bajo `/posts/finanzas-para-migrantes-chile/`.
- Cierre posterior al sign-off: `pnpm run test` pass (112 archivos, 840 tests),
  `pnpm run build` pass (319 páginas), `check:hero-images` pass (51 publicados),
  `check:no-postid-urls` pass y `check:rss` pass (50 items; el nuevo artículo presente).
- Verificación de salida: existe `dist/posts/finanzas-para-migrantes-chile/index.html`, el
  hub enlaza la guía y no contiene `noindex`.
- Warnings aceptados: descripción sobre el largo recomendado y ausencia de enlaces
  intra-cluster/orphan según checkers artículo-a-artículo; es el primer artículo del cluster
  y el hub público sí aporta el enlace de entrada.
- `pnpm run format:check`: pass.
- Lint acotado a todos los archivos ejecutables modificados: pass.
- `pnpm run lint` global: no ejecutable por un problema preexistente de tooling. ESLint
  detecta múltiples candidatos a `tsconfigRootDir` dentro de dos worktrees ajenos bajo
  `.claude/worktrees/` y falla con 1.671 errores de parsing antes del análisis. No se
  modificaron esos worktrees ni la configuración global porque están fuera del cambio.

## Resultado y rollback

G8–G14 quedan implementados y verificados. G9 se cerró con el hero manual y sus variantes.
Gate 05 y Gate 06 terminaron en PASS; Carlos Ortega registró su aprobación explícita como
HumanEditor el 2026-06-22. El artículo cambió a `draft: false` y entró al conjunto publicado.

El rollback seguro consiste en volver el artículo a `draft: true`, regenerar los índices y
revertir conjuntamente la exposición pública si aparece una regresión. No requiere migración
de datos.
