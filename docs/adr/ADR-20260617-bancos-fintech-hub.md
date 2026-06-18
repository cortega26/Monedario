# ADR-20260617-bancos-fintech-hub

Date: 2026-06-17
Status: Accepted

## Context

Gate 00 (topic intake) aprobó el pilar educativo **bancos y fintech** como cluster
greenfield (`artifacts/editorial/_intake/bancos-y-fintech-chile/00-topic-intake.md`),
y el pipeline editorial avanzó hasta `04-draft.md`
(`artifacts/editorial/bancos-y-fintech-chile/20260617-1749-topic-intake/`).

Para que el futuro blog file del pilar tenga un `cluster` válido, el cluster debe
estar registrado en `src/config/clusters.ts`: `scripts/check-editorial-structure.mjs`
falla si un post usa un cluster que no está ahí, y también si existe una carpeta en
`src/pages/guias/<cluster>/` que no está registrada. No existía ni el cluster ni el hub.

Restricción dura: un hub `.astro` **no tiene estado `draft`** — crear el archivo publica
la ruta de inmediato y no está cubierto por `check:editorial`. Por lo tanto, **no** puede
contener afirmaciones YMYL (tipos de cuenta, tarifas, articulado de la Ley Fintech) antes
de que el pilar pase math-audit + compliance + sign-off humano; hacerlo sería evadir los
gates que el propio `04-draft.md` declara pendientes.

## Decision

1. Registrar `bancos-fintech` en `CLUSTERS` (`src/config/clusters.ts`). Esto valida el
   frontmatter del futuro pilar y la carpeta del hub.
2. Mantenerlo **fuera** de `GUIDE_HUBS` y `GUIDE_HUB_ORDER`, y excluirlo de `HubCluster`
   (`Exclude<Cluster, "general" | "bancos-fintech">`). Así NO aparece en la navegación
   global (Header dropdown, Footer) ni en la homepage.
3. Crear `src/pages/guias/bancos-fintech/index.astro` como **shell de navegación
   NO-YMYL**: misión de la sección + enlaces a recursos ya publicados y vetados
   (`/leyes/ley-21521-fintech/`, `/glosario/cuenta-rut/`) + bridges a hubs vecinos.
   Sin tablas de tipos de cuenta, sin tarifas, sin citar el articulado de la ley.
4. Marcar el hub con `<meta name="robots" content="noindex,follow">` hasta el lanzamiento
   del pilar.
5. **No** se enlaza el pilar no publicado (`/posts/bancos-y-fintech-chile/` = 404 mientras
   sea `draft`), para no introducir un enlace interno roto.

Decisión de exposición tomada por el HumanEditor (Carlos): unlisted + noindex.

### Plan de "flip" al publicar el pilar

Cuando el pilar pase auditoría + compliance + sign-off:
- quitar `bancos-fintech` del `Exclude` de `HubCluster`;
- agregar su metadata a `GUIDE_HUBS` y su orden en `GUIDE_HUB_ORDER`;
- quitar el `noindex` del hub y enriquecerlo (enlace al pilar, registro en
  `HUB_ARTICLE_ASSIGNMENTS`).

## Consequences

- Positivo: el cluster queda válido sin shippear contenido YMYL sin vetar; el hub es un
  shell honesto y útil (enlaza recursos vetados) sin riesgo de gate-evasion.
- Trade-off: el hub aparece listado en `/guias/` (la página de índice detecta la carpeta
  por glob y la muestra como sección "fallback" con nombre autogenerado "Bancos Fintech").
  Es aceptable y `noindex`; se normaliza al flip.
- Costo operativo: bajo. El flip es un cambio acotado en `clusters.ts` + el hub.

## Alternatives considered

- **Hub completo en nav + indexado ahora:** descartado. Expondría una página liviana en
  navegación global e indexada antes de existir contenido vetado (thin-page + presión a
  llenar con YMYL sin gates).
- **Solo registrar el cluster sin crear el hub:** descartado. El usuario pidió el hub como
  paso de preparación; además deja la carpeta/registro coherentes para el flip.
- **Llenar el hub con datos "verificados" de CMF/Ley:** descartado explícitamente — sería
  publicar YMYL `high` sin math-audit/compliance/sign-off.

## Verification

- `pnpm run build` (incluye `astro check`) → exit 0 (el `Exclude` evita el error de tipo
  por `GUIDE_HUBS` incompleto).
- `pnpm run check:editorial` → cluster folder ↔ `clusters.ts` consistente; cobertura sin
  fallos.
- `pnpm run check:routes` → `snapshot-routes.mjs` solo enumera rutas `/posts/`; los hubs
  de `/guias/` **no** están en el snapshot, por lo que el alta no altera el baseline.
  Además `compare-routes.mjs` solo falla en rutas **removidas** (las añadidas son warning).
  Es decir, no hay regresión de rutas que documentar para este hub.
- `pnpm run check:rss` → el hub no es un post; no entra al feed, sin cambios en RSS.
- `pnpm run check:frontmatter` / `check:dialect` → sin posts nuevos en este cambio.
