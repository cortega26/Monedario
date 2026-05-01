# Sprint 0 SEO 2026 - Verificacion y limpieza

Fecha: 2026-05-01

## Scope y autoridad

In-scope ejecutado:
- `docs/operations/reports/seo/**`
- `docs/editorial/seo-owner-map-2026.md`
- `docs/research/seo/strategy/topic_ownership_matrix.md`

Out-of-scope preservado:
- `src/data/blog/**`
- rutas publicas, slugs, RSS baselines y snapshots canonicos
- calculadoras runtime
- publicacion o refresh YMYL

Autoridad aplicada:
- `URL.PUBLIC.NO_POST_ID`
- `FRONTMATTER.VALID`
- `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`
- `INVARIANT.EDITORIAL.TOPIC_OWNER_UNIQUENESS`
- `CONTRACT.PUBLIC_URLS`
- `CONTRACT.FRONTMATTER_POLICY`
- `CONTRACT.YMYL_RESPONSE_STRUCTURE`

No se hicieron cambios de contenido publicado, rutas ni calculadoras.

## Resumen ejecutivo

Sprint 0 confirma que el repo puede avanzar hacia P1 sin crear contenido todavia, pero con dos restricciones:

1. Operacion Renta sigue siendo el unico conflicto real de canibalizacion de alta prioridad. Se protege a `/posts/operacion-renta-f22-checklist/` como owner operativo F22 y se deja `operacion-renta-centro` pendiente de consolidacion publica en Sprint 1.
2. Las calculadoras listadas existen. El trabajo P1 no debe recrearlas; debe resolver owner editorial, linking o packaging segun cada caso.

La matriz de ownership queda actualizada con filas futuras para PGU, gratificacion legal, sueldo imponible, IGC, contribuciones, fondo de emergencia y calculadoras de deuda/vivienda que necesitaban decision explicita.

## Validacion ejecutada

| Comando | Resultado | Observaciones |
|---|---|---|
| `pnpm run audit:topic-overlap` | Pasa | 44 articulos, 0 metadata warnings, 31 candidatos. Principales: `el-poder-del-interes-compuesto` vs `interes-compuesto-nota-metodologica`; `operacion-renta-centro` vs `operacion-renta-f22-checklist`; un `candidate_strong_overlap` entre pilar de inversion y ETFs que queda como falso positivo operativo por owner/satelite ya documentado |
| `pnpm run check:frontmatter` | Pasa | 44 articulos, 0 errores. Nota esperada: `como-hacer-presupuesto-mensual-chile` sigue como transitional placement hacia `presupuesto-control-financiero` |
| `pnpm run check:links` | Pasa con warnings | Sin links rotos. Orphans: `operacion-renta-centro`, `prepago-credito-cuando-conviene-chile`, `que-es-la-cuenta-2-afp`, `reforma-previsional-2025-que-cambia-y-como-te-afecta`, `tarjeta-credito-costo-real-chile` |
| `pnpm run check:routes` | Pasa con additions basales | 5 additions ya existentes: `/posts/como-salir-boletin-comercial-chile/`, `/posts/operacion-renta-centro/`, `/posts/prepago-credito-cuando-conviene-chile/`, `/posts/primer-empleo-chile-guia-completa/`, `/posts/tarjeta-credito-costo-real-chile/`; 0 removals |
| `pnpm run check:no-postid-urls` | Pasa | 177 source files escaneados, sin patrones forbidden de `post.id` para URLs publicas |
| `pnpm run check:context` | Pasa | `validated=4 invariantIds=40 contractIds=29` |
| `pnpm run check:boundaries` | Pasa | 4 domain files escaneados; boundary check passed |

## Decisiones de ownership

| Tema | Decision | Resultado |
|---|---|---|
| Operacion Renta centro vs F22 | Pendiente con owner protegido | Mantener `/posts/operacion-renta-f22-checklist/` como owner operativo F22. `operacion-renta-centro` no debe recibir mas inbound hasta decidir fusion/redirect/support/noindex en Sprint 1 |
| Interes compuesto vs nota metodologica | Mantener coexistencia valida | Owner: `/posts/el-poder-del-interes-compuesto/`. Reference unlisted: `/posts/interes-compuesto-nota-metodologica/` |
| `credito-consumo` | Crear futuro owner editorial | Tool existe. Futuro owner propuesto: `/posts/credito-consumo-chile-cae-costo-total/`, diferenciado de `/posts/cae-costo-real-credito-chile/` |
| `dividendo-hipotecario` | Crear satelite futuro, no cluster nuevo | Tool existe. Owner de proceso actual: `/posts/credito-hipotecario-chile-guia-completa/`. Futuro satelite tool-led posible: `/posts/calcular-dividendo-hipotecario-chile/` |
| `tarjeta-credito` | Mantener owner actual | `/posts/tarjeta-credito-costo-real-chile/` + `/calculadoras/tarjeta-credito/`; resolver orfandad con interlinks |
| `prepago-credito` | Mantener owner actual | `/posts/prepago-credito-cuando-conviene-chile/` + `/calculadoras/prepago-credito/`; resolver orfandad con interlinks |
| `simulador-renegociacion` | Mantener como tool support | `/posts/renegociacion-superir/` posee requisitos/proceso; `/calculadoras/simulador-renegociacion/` filtra escenario |
| PGU | Crear futuro owner | Requiere fila de ownership antes del brief y registry/config antes de publicar por cluster endurecido |
| Gratificacion legal | Crear futuro owner + futura calculadora | Requiere fila antes del brief; no debe competir con sueldo liquido completo |
| Sueldo imponible | Crear futuro owner/support puente | Requiere fila antes del brief; debe apoyar sueldo/liquidacion/impuesto, no duplicar calculadora sueldo liquido |
| IGC | Crear futuro owner | Glosario y rentas mixtas no bastan como owner del head term |
| Contribuciones | Crear futuro owner tramite explicado | Debe enviar a SII/TGR y no competir como portal de pago |
| Fondo emergencia | Crear futuro owner | Puede activar `presupuesto-control-financiero` sin competir con ahorro/inversion |

## Conflictos resueltos

- Interes compuesto queda resuelto como owner + reference, sin accion de contenido.
- Calculadoras `tarjeta-credito`, `prepago-credito` y `simulador-renegociacion` quedan resueltas como owner existente + tool support.
- `credito-consumo` y `dividendo-hipotecario` quedan resueltas como futuras piezas editoriales, no como gaps de desarrollo de calculadora.

## Conflictos pendientes

| Conflicto | Motivo de pendiente | Siguiente decision permitida |
|---|---|---|
| `operacion-renta-centro` vs `operacion-renta-f22-checklist` | Resolverlo exige cambiar una superficie publicada, una ruta, estado indexable o linking publico; eso esta fuera de Sprint 0 | Convertir en support no indexable, fusionar con hub, redirigir, o mantener solo si se diferencia H1/snippet/intro y deja de competir |
| Orphan `operacion-renta-centro` | Darle enlaces ahora refuerza el conflicto anterior | Resolver junto con consolidacion Operacion Renta |
| Orphans de deuda/pensiones | Requieren editar hubs o articulos publicados | Sprint 1 debe agregar inbound links controlados sin cambiar ownership |

## Archivos modificados

- `docs/research/seo/strategy/topic_ownership_matrix.md`
- `docs/editorial/seo-owner-map-2026.md`
- `docs/operations/reports/seo/sprint-0-verification-cleanup-2026-05-01.md`

## Regression risk y rollback

Riesgo bajo: solo documentacion operativa y matriz de ownership. No cambia build, rutas, frontmatter, componentes, datos publicados ni calculadoras.

Rollback: revertir los tres archivos listados en esta seccion.

## Proximos pasos Sprint 1

1. Resolver publicamente `operacion-renta-centro` antes de cualquier nuevo contenido tributario.
2. Agregar inbound links para `prepago-credito`, `tarjeta-credito`, `que-es-la-cuenta-2-afp` y `reforma-previsional` desde hubs/articulos existentes.
3. Preparar briefs P1 solo para owners ya registrados en matriz: PGU, gratificacion legal, sueldo imponible, IGC, contribuciones, fondo emergencia y credito de consumo.
4. Antes de crear contenido en clusters endurecidos, actualizar `src/config/editorial-topic-policy.mjs` con el canonical topic correspondiente y ejecutar `pnpm run check:frontmatter` + `pnpm run audit:topic-overlap`.
