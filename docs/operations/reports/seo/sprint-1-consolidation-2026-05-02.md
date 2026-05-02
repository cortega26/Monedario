# Sprint 1 SEO 2026 — Consolidaciones de alto impacto

Fecha: 2026-05-02

## Scope y autoridad

In-scope ejecutado:

- `src/data/blog/operacion-renta-centro.md`
- `src/data/blog/operacion-renta-f22-checklist.md`
- `src/data/blog/fondos-afp-a-b-c-d-e.md`
- `src/data/blog/cae-costo-real-credito-chile.md`
- `docs/operations/reports/seo/sprint-1-consolidation-2026-05-02.md`

Out-of-scope preservado:

- Rutas públicas, slugs, RSS baselines y snapshots canónicos
- Calculadoras runtime
- Publicación o refresh YMYL sin pipeline
- Hubs Astro y config de cluster

Autoridad aplicada:

- `INVARIANT.EDITORIAL.TOPIC_OWNER_UNIQUENESS`
- `INVARIANT.EDITORIAL.LINKING.INTER_CLUSTER_MAX_2_PER_EDIT`
- `CONTRACT.EDITORIAL.TOPIC_OWNERSHIP`
- `FRONTMATTER.VALID`
- `URL.PUBLIC.NO_POST_ID`

No se crearon rutas, calculadoras ni contenido YMYL nuevo.

## Resumen ejecutivo

Sprint 1 resuelve los dos bloqueadores identificados en Sprint 0:

1. **Decisión pública sobre `operacion-renta-centro`**: Se convierte en `support` indexable del cluster `impuestos-personas`. El artículo sale de la homepage (`featured: false`, `homepagePriority: 0`), su descripción se diferencia del subhub, y se agrega un enlace de cuerpo hacia la guía de impuestos personas. No se hace redirect ni noindex — la ruta permanece viva como soporte de larga cola. La decisión sobre fusion o redirect queda disponible para Sprint 2 o cuando el subhub tenga suficiente madurez de señales.

2. **Resolución de 4 artículos huérfanos**: `prepago-credito-cuando-conviene-chile`, `que-es-la-cuenta-2-afp`, `reforma-previsional-2025-que-cambia-y-como-te-afecta` y `tarjeta-credito-costo-real-chile` pasan a tener al menos un enlace entrante desde artículos del mismo cluster. El quinto huérfano (`operacion-renta-centro`) permanece sin inbound por decisión editorial — asignarle enlaces ahora reforzaría un artículo que acaba de ser reclasificado como support.

## Decisiones de Sprint 1

| Decisión | Justificación | Alternativas descartadas |
|---|---|---|
| `operacion-renta-centro` → `support indexable`, no redirect ni noindex | La ruta `/posts/operacion-renta-centro/` ya está en el snapshot RSS y en `routes_snapshot_before.json`. Un redirect exige ADR + actualización de snapshot; noindex elimina la cobertura de larga cola sin ventaja clara | Redirect (requiere infraestructura de ruta); noindex (pierde tráfico de larga cola sin ganancia de deduplicación) |
| `canonicalTopic: operacion-renta-centro-legacy` como topic del support | El topic real `operacion-renta-guia-completa` no tiene owner en frontmatter (el subhub es Astro, no blog). Usar un topic legacy evita warnings de `audit:topic-overlap` por support sin owner declarado en el mismo cluster | No agregar `canonicalTopic` (hubiera dejado el `topicRole: support` incompleto per policy) |
| Enlace de cuerpo en OR-centro apunta a `/guias/impuestos-personas/` en lugar de `/guias/impuestos-personas/operacion-renta/` | El script `check:links` solo valida slugs de primer nivel bajo `src/pages/guias/`. La ruta del subhub existe físicamente pero el validador la rechaza como broken. La hub padre es el destino correcto para un lector que busca más recursos | Parchear `check-internal-links.mjs` para soportar paths anidados (fuera de scope Sprint 1) |
| Huérfanos resueltos vía enlace intra-cluster desde artículo existente, no desde hub Astro | El script `check:links` no cuenta enlaces renderizados por componentes Astro ni `nextStepHref`. Solo los body links en `.md/.mdx` cuentan como inbound | Actualizar config de hub Astro (no resuelve el orphan per check:links) |

## Cambios por archivo

### `src/data/blog/operacion-renta-centro.md`

Cambios de frontmatter:

- `description`: actualizada para eliminar "Todo para declarar" y "guía completa" — lenguaje que duplicaba el H1/snippet del subhub. Nueva descripción: "Respuestas clave sobre Operación Renta 2026 en Chile: quién debe declarar, los plazos del F22, cuándo llega la devolución y qué hacer si debes pagar."
- `featured`: `true` → `false`
- `homepagePriority`: `210` → `0` (ambos campos controlan homepage independientemente en `src/utils/homepage.ts`)
- `topicRole`: agregado `support`
- `canonicalTopic`: agregado `operacion-renta-centro-legacy`

Cambio de cuerpo:

- Párrafo introductorio antes del primer H2: enlace a `/guias/impuestos-personas/` como recurso de referencia estructurada. No se modificó ningún claim YMYL.

### `src/data/blog/operacion-renta-f22-checklist.md`

- `topicRole`: agregado `owner`
- `canonicalTopic`: agregado `f22-revisar-enviar`

Esto materializa en metadata el rol de owner operativo F22 que Sprint 0 ya documentaba en la matriz de ownership y el owner map.

### `src/data/blog/fondos-afp-a-b-c-d-e.md` (cluster: `pensiones-afp`)

Dos enlaces entrantes intra-cluster agregados en el cierre del artículo:

- `que-es-la-cuenta-2-afp`: nueva línea "Si evalúas ahorro voluntario previsional como complemento a tu cotización obligatoria, revisa [qué es la Cuenta 2 AFP](/posts/que-es-la-cuenta-2-afp/)."
- `reforma-previsional-2025-que-cambia-y-como-te-afecta`: mención existente de "guía de reforma previsional" convertida a enlace real: "revisa la [reforma previsional 2025: qué cambia y cómo te afecta](/posts/reforma-previsional-2025-que-cambia-y-como-te-afecta/)."

Ambos son intra-cluster (`pensiones-afp`), sin afectar el límite `INTER_CLUSTER_MAX_2_PER_EDIT`.

### `src/data/blog/cae-costo-real-credito-chile.md` (cluster: `deuda-credito`)

Dos enlaces entrantes intra-cluster agregados:

- `prepago-credito-cuando-conviene-chile`: al final de la sección "Prepago anticipado: tu derecho y cuándo conviene" — "Para evaluar si un abono extraordinario conviene en tu caso específico, revisa [cuándo y cuánto conviene prepagar un crédito en Chile](/posts/prepago-credito-cuando-conviene-chile/)."
- `tarjeta-credito-costo-real-chile`: al final del "Caso 3: Tarjeta de crédito con cupo" — "Para entender el costo real de la deuda rotativa y cómo calcular el total que terminas pagando, revisa [tarjeta de crédito: el costo real de la deuda rotativa en Chile](/posts/tarjeta-credito-costo-real-chile/)."

Ambos son intra-cluster (`deuda-credito`), sin afectar el límite `INTER_CLUSTER_MAX_2_PER_EDIT`.

## Validación ejecutada

| Comando | Resultado | Observaciones |
|---|---|---|
| `pnpm run check:frontmatter` | Pasa | 44 artículos, 0 errores. 1 warning no bloqueante: support sin owner declarado para `impuestos-personas::operacion-renta-centro-legacy` (esperado — el owner es el subhub Astro, que no tiene frontmatter). Nota transitional placement de presupuesto sin cambios. |
| `pnpm run audit:topic-overlap` | Pasa | 44 artículos, 0 metadata warnings, 31 candidatos — mismo total que baseline Sprint 0. OR centro/F22 pasa de `candidate_same_intent` con score alto a score 0.424 por diferenciación de roles. Sin candidatos nuevos introducidos. |
| `pnpm run check:links` | Pasa con 1 huérfano | Sin links rotos. 1 huérfano: `operacion-renta-centro` (intencional por decisión Sprint 0/Sprint 1). 4 huérfanos resueltos: `prepago-credito`, `tarjeta-credito`, `que-es-la-cuenta-2-afp`, `reforma-previsional`. |
| `pnpm run check:routes` | Pasa con additions basales | 5 additions ya existentes del baseline; 0 removals. Sprint 1 no creó ni eliminó rutas. |
| `pnpm run check:no-postid-urls` | Pasa | 177 source files, sin patrones forbidden de `post.id`. |
| `pnpm run check:context` | Pasa | `validated=4 invariantIds=40 contractIds=29` — idéntico a baseline. |
| `pnpm exec prettier --check <4 archivos>` | Pasa | Todos los archivos tocados cumplen code style. |
| `pnpm run test` | 5 fallos (estado basal) | Mismos 5 fallos documentados en Sprint 0: artefactos de `operacion-renta-centro` con status `PUBLISHED/APPROVED` cuando los tests esperan `UNPUBLISHED/BLOCKED`. Sprint 1 no introdujo fallos nuevos. |

## Estado de huérfanos

| Artículo | Estado antes | Estado después | Mecanismo |
|---|---|---|---|
| `operacion-renta-centro` | Huérfano (sin inbound) | Huérfano intencional | Decisión Sprint 1: no asignar inbound hasta consolidación OR |
| `prepago-credito-cuando-conviene-chile` | Huérfano | Resuelto | Link desde `cae-costo-real-credito-chile` (intra-cluster deuda-credito) |
| `tarjeta-credito-costo-real-chile` | Huérfano | Resuelto | Link desde `cae-costo-real-credito-chile` (intra-cluster deuda-credito) |
| `que-es-la-cuenta-2-afp` | Huérfano | Resuelto | Link desde `fondos-afp-a-b-c-d-e` (intra-cluster pensiones-afp) |
| `reforma-previsional-2025-que-cambia-y-como-te-afecta` | Huérfano | Resuelto | Link desde `fondos-afp-a-b-c-d-e` (intra-cluster pensiones-afp) |

## Archivos modificados

- `src/data/blog/operacion-renta-centro.md`
- `src/data/blog/operacion-renta-f22-checklist.md`
- `src/data/blog/fondos-afp-a-b-c-d-e.md`
- `src/data/blog/cae-costo-real-credito-chile.md`
- `docs/operations/reports/seo/sprint-1-consolidation-2026-05-02.md`

## Regression risk y rollback

Riesgo bajo: solo metadata de frontmatter y un párrafo introductorio en OR-centro. Los cambios de linking son adiciones de texto plano en secciones de cierre; no modifican la estructura ni los claims de ningún artículo.

Rollback: revertir los cuatro archivos de blog listados arriba. El reporte puede conservarse como evidencia de decisión.

## Pendientes para Sprint 2

1. **OR-centro consolidación final**: Decidir si se fusiona con el subhub, se redirige, o permanece como support indexable de larga cola. Disponible una vez que el subhub tenga señales de Search Console (GSC) suficientes para comparar.
2. **Parchear `check-internal-links.mjs`** para validar paths anidados bajo `/guias/` (subhubs). Actualmente cualquier enlace a `/guias/<cluster>/<subhub>/` falla la validación aunque la ruta exista.
3. **Briefs P1** para owners sin contenido publicado: PGU, gratificación legal, sueldo imponible, IGC, contribuciones, fondo de emergencia. Cada uno requiere fila en matriz antes del brief y registro/config si el cluster está endurecido.
4. **Inbound link a `operacion-renta-centro`** (cuando proceda): solo asignar después de decidir el rol final del artículo.
