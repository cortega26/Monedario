# ADR-20260622-finanzas-migrantes-hub

Date: 2026-06-22
Status: Accepted

## Context

El pipeline editorial de `finanzas-para-migrantes-chile` completó Gate 05 y Gate 06
sobre la quinta remediación. Carlos Ortega autorizó continuar la preparación técnica,
pero G9 sigue abierto: todavía no existe la imagen hero manual exigida por
`CONTRACT.EDITORIAL.HERO_IMAGE_PIPELINE`.

El brief define este pilar como owner de un cluster greenfield. Su necesidad dominante
es ordenar el recorrido financiero inicial de una persona migrante en Chile —RUT/RUN,
cuenta y arriendo—, no reemplazar los owners de bancos, empleo, UF o arriendos.

Crear un hub Astro publica una ruta aunque el artículo permanezca en draft. Por eso no
es correcto incorporarlo aún a navegación global ni presentarlo como una sección madura.

## Decision

1. Registrar `finanzas-migrantes` en `CLUSTERS` para validar el frontmatter y la carpeta
   del hub.
2. Mantenerlo fuera de `HubCluster`, `GUIDE_HUBS` y `GUIDE_HUB_ORDER` mientras G9 esté
   abierto. No aparece en Header, Footer ni rail de homepage.
3. Crear `/guias/finanzas-migrantes/` como shell no-YMYL con
   `<meta name="robots" content="noindex,follow">`. Solo explica la misión del cluster y
   enlaza recursos ya publicados; no replica claims del artículo en draft.
4. Crear `finanzas-para-migrantes-chile.md` con `draft: true`, `topicRole: owner` y
   `canonicalTopic: finanzas-iniciales-migrantes-chile`. No se enlaza desde el hub hasta
   que tenga hero y se publique.
5. Registrar el ownership en la matriz y la frontera editorial. Bancos, empleo y UF son
   destinos relacionados; no son absorbidos como core.

### Condición de lanzamiento

Después de resolver G9 y completar la revisión humana de gates:

- añadir la imagen hero canónica y sus metadatos de pipeline;
- quitar `finanzas-migrantes` del `Exclude` de `HubCluster`;
- añadir metadata a `GUIDE_HUBS` y orden a `GUIDE_HUB_ORDER`;
- reemplazar el shell por el hub indexable con el pilar como core;
- cambiar el artículo a `draft: false` solo tras verificar todos los gates.

## Consequences

- El cluster y el artículo pueden pasar validaciones estructurales sin publicación
  prematura.
- El hub existe como ruta noindex y no entra en navegación global.
- G9 sigue siendo un bloqueo real; esta decisión no lo simula ni lo elude.
- El rollback consiste en retirar cluster, hub, draft y registros de ownership juntos.

## Invariants and contracts

- `URL.PUBLIC.NO_POST_ID`: la futura URL usa el `slug` explícito.
- `ROUTES.NO_SILENT_CHANGES` y `RSS.NO_REMOVALS`: se verifican antes del cierre.
- `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`: owner definido antes de indexar.
- `CONTRACT.YMYL_RESPONSE_STRUCTURE`: el artículo materializa el draft aprobado.
- `CONTRACT.EDITORIAL.HERO_IMAGE_PIPELINE`: el artículo no se publica sin G9.

## Alternatives considered

- **Publicar artículo y hub sin hero:** descartado; viola el contrato de imagen.
- **Añadir el hub a navegación global como sección vacía:** descartado; expone una
  superficie incompleta y dispersa la IA.
- **Registrar solo el artículo en `general`:** descartado; ocultaría un owner ya decidido
  y contradiría la política de ownership.

## Verification

La evidencia de comandos queda registrada en
`docs/backlog/PLAN-finanzas-migrantes-launch-prep.md`.
