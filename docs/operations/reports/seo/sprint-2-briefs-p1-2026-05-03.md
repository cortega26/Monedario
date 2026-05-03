# Sprint 2 SEO 2026 — Briefs editoriales P1

Fecha: 2026-05-03

## Scope y autoridad

In-scope ejecutado:

- `docs/editorial/artifacts/briefs/fondo-emergencia.md` (nuevo)
- `docs/editorial/artifacts/briefs/gratificacion-legal.md` (nuevo)
- `docs/editorial/artifacts/briefs/sueldo-imponible.md` (nuevo)
- `docs/editorial/artifacts/briefs/pgu.md` (nuevo)
- `docs/editorial/artifacts/briefs/contribuciones-bienes-raices.md` (nuevo)
- `docs/editorial/artifacts/briefs/igc.md` (nuevo)
- `docs/research/seo/strategy/topic_ownership_matrix.md` (actualizado: notas P1 + canonicalTopics propuestos)
- `docs/editorial/seo-owner-map-2026.md` (actualizado: pendientes + tabla Sprint 2)

Out-of-scope preservado:

- Redacción de artículos P1 (Sprint 2B o posterior)
- Rutas públicas, slugs, RSS baselines
- Calculadoras runtime
- Registro de canonicalTopics en `src/config/editorial-topic-policy.mjs` (gate pre-publicación)
- Frontmatter de artículos publicados
- Hubs Astro y config de cluster

Autoridad aplicada:

- `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`
- `INVARIANT.EDITORIAL.TOPIC_OWNER_UNIQUENESS`
- `CONTRACT.EDITORIAL.TOPIC_OWNERSHIP`
- `FRONTMATTER.VALID`
- `URL.PUBLIC.NO_POST_ID`

No se crearon rutas, calculadoras ni contenido YMYL publicado.

## Resumen ejecutivo

Sprint 2 crea los seis briefs editoriales P1 para owners sin contenido publicado,
resuelve los pre-requisitos de ownership y documenta las gates de pre-publicación bloqueantes
para los tres temas en clusters endurecidos.

Los briefs son el artefacto de input al pipeline YMYL — no son artículos publicados ni borradores.
Cada brief fija: slug objetivo, cluster, canonicalTopic propuesto, intención primaria, fuentes
oficiales requeridas, estructura H2, claims YMYL a verificar, calculadoras relacionadas y
mapa de enlaces internos (inbound/outbound).

La `topic_ownership_matrix.md` ya tenía las 6 filas P1 de Sprint 0. Sprint 2 las actualiza con
el canonicalTopic propuesto y el estado del brief.

## Decisiones de Sprint 2

| Decisión | Justificación | Alternativas descartadas |
|---|---|---|
| Briefs en `docs/editorial/artifacts/briefs/` (directorio único) | Separar los briefs de los pipeline artifacts por-artículo (`artifacts/<slug>/0x-*.md`); los briefs son pre-pipeline, no post-pipeline | Un archivo de brief por directorio de artefacto (hubiese creado 6 directorios sin artefactos downstream aún) |
| No registrar canonicalTopics en `editorial-topic-policy.mjs` en Sprint 2 | El registro es un gate de pre-publicación (Sprint 2B); hacerlo ahora sin draft ni compliance sería saltar el pipeline | Registrar preventivamente (registro sin owner publicado crea entradas fantasma en el registry) |
| `fondo-emergencia` primero por menor riesgo YMYL | Permite validar el formato de brief antes de los temas de mayor complejidad (PGU, IGC) | Empezar por IGC (mayor complejidad, mayor riesgo de error en el template) |
| `topicRole: owner` propuesto para los 6, con excepción documentada para `sueldo-imponible` | La matriz ya define cada uno como "futuro owner"; `sueldo-imponible` puede ser owner o support puente — decisión delegada al gate 01 del pipeline | Forzar support para sueldo-imponible sin evidencia de canibalización real |

## Briefs creados

| Brief | Slug objetivo | Cluster | canonicalTopic propuesto | Cluster endurecido | Riesgo YMYL | Calculadora existente |
|---|---|---|---|---|---|---|
| `fondo-emergencia.md` | `fondo-emergencia-chile` | `presupuesto-control-financiero` | `fondo-emergencia-colchon` | No | Bajo/Medio | Ninguna |
| `gratificacion-legal.md` | `gratificacion-legal-chile` | `sueldo-remuneraciones` | `gratificacion-legal-calculo-tope` | **Si** | Medio | Propuesta futura Sprint 3 |
| `sueldo-imponible.md` | `sueldo-imponible-chile` | `sueldo-remuneraciones` | `sueldo-imponible-base-descuentos` | **Si** | Medio | `/calculadoras/sueldo-liquido/`, `/calculadoras/impuesto-segunda-categoria/` |
| `pgu.md` | `pgu-pension-garantizada-universal` | `pensiones-afp` | `pgu-pension-garantizada` | **Si** | Alto | `/calculadoras/simulador-jubilacion/` |
| `contribuciones-bienes-raices.md` | `contribuciones-bienes-raices-chile` | `impuestos-personas` | `contribuciones-bienes-raices-tramite` | No | Medio/Alto | Ninguna |
| `igc.md` | `impuesto-global-complementario-chile` | `impuestos-personas` | `igc-impuesto-global-complementario` | No | Alto | `/calculadoras/operacion-renta/` |

## Clusters endurecidos — gate pre-publicación

Tres de los seis artículos caen en `HARDENED_OWNERSHIP_CLUSTERS`. Antes de abrir el pipeline
de redacción (gate 02 research), el agente debe registrar el `canonicalTopic` propuesto en
`CANONICAL_TOPIC_REGISTRY` dentro de `src/config/editorial-topic-policy.mjs`:

| Articulo | canonicalTopic a registrar | Cluster |
|---|---|---|
| `gratificacion-legal-chile` | `gratificacion-legal-calculo-tope` | `sueldo-remuneraciones` |
| `sueldo-imponible-chile` | `sueldo-imponible-base-descuentos` | `sueldo-remuneraciones` |
| `pgu-pension-garantizada-universal` | `pgu-pension-garantizada` | `pensiones-afp` |

Los otros tres topics (`fondo-emergencia`, `contribuciones-bienes-raices`, `igc`) no estan en
clusters endurecidos, pero sus `canonicalTopic` tampoco estan en el registry — deben registrarse
igualmente antes de publicar para cumplir `FRONTMATTER.VALID`.

## Mapa de anti-canibalización por brief

| Brief | Head term propio | Head terms prohibidos (ya tienen owner) |
|---|---|---|
| `fondo-emergencia` | "fondo de emergencia Chile" | "ahorro e inversión Chile", "instrumentos de ahorro" |
| `gratificacion-legal` | "gratificación legal Chile" | "calcular sueldo líquido", "descuentos de sueldo" |
| `sueldo-imponible` | "sueldo imponible Chile" | "calcular sueldo líquido completo", "liquidación de sueldo" |
| `pgu` | "PGU Chile", "pensión garantizada universal" | "reforma previsional", "cambio de AFP", "fondos AFP" |
| `contribuciones-bienes-raices` | "contribuciones bienes raíces Chile" | "operación renta F22", "IGC" |
| `igc` | "impuesto global complementario Chile" | "F22 operación renta", "rentas mixtas" (si ese owner existe) |

## Mapa de enlaces internos por brief (resumen)

| Brief | Inbound desde | Outbound a |
|---|---|---|
| `fondo-emergencia` | `como-hacer-presupuesto-mensual-chile`, `ahorro-e-inversion-...` | `como-hacer-presupuesto-mensual-chile`, `ahorro-e-inversion-...`, `deposito-a-plazo-uf-vs-pesos` |
| `gratificacion-legal` | `como-calcular-sueldo-liquido`, `liquidacion-de-sueldo` | `como-calcular-sueldo-liquido`, `liquidacion-de-sueldo`, `descuentos-de-sueldo` |
| `sueldo-imponible` | `como-calcular-sueldo-liquido`, `liquidacion-de-sueldo`, `descuentos-de-sueldo` | `como-calcular-sueldo-liquido`, `liquidacion-de-sueldo`, `/calculadoras/impuesto-segunda-categoria/` |
| `pgu` | `reforma-previsional-2025-...`, `fondos-afp-a-b-c-d-e` | `reforma-previsional-2025-...`, `/calculadoras/simulador-jubilacion/` |
| `contribuciones-bienes-raices` | `operacion-renta-f22-checklist`, `igc` (futuro) | `operacion-renta-f22-checklist` |
| `igc` | `boleta-honorarios-2026-...`, `operacion-renta-f22-checklist` | `operacion-renta-f22-checklist`, `devolucion-impuestos-...`, `contribuciones-bienes-raices` (futuro), `/calculadoras/operacion-renta/` |

## Validacion ejecutada

| Comando | Resultado | Observaciones |
|---|---|---|
| `pnpm run audit:topic-overlap` | Pasa | 44 articulos; 31 candidatos — mismo total que Sprint 1. Sin candidatos nuevos introducidos por los briefs (son docs, no articulos). |
| `pnpm run check:frontmatter` | Pasa | 44 articulos, 0 errores. 1 warning basal no bloqueante (OR-centro sin owner declarado). |
| `pnpm run check:links` | Pasa con 1 huerfano | Sin links rotos. 1 huerfano: `operacion-renta-centro` (intencional Sprint 1). |
| `pnpm run check:routes` | Pasa con additions basales | 5 additions basales; 0 removals. Sprint 2 no creo ni elimino rutas. |
| `pnpm run check:no-postid-urls` | Pasa | 177 source files, sin patrones forbidden. |

## Estado de inheritance de Sprint 1

Las siguientes decisiones de Sprint 1 permanecen sin cambios y no se reabrieron:

- `operacion-renta-centro` → `topicRole: support`, huerfano intencional.
- `operacion-renta-f22-checklist` → `topicRole: owner` F22.
- 4 huerfanos resueltos: `prepago-credito`, `tarjeta-credito-costo-real`, `que-es-la-cuenta-2-afp`, `reforma-previsional-2025`.
- `scripts/check-internal-links.mjs` parchado para paths anidados.

## Archivos modificados o creados

Nuevos:
- `docs/editorial/artifacts/briefs/fondo-emergencia.md`
- `docs/editorial/artifacts/briefs/gratificacion-legal.md`
- `docs/editorial/artifacts/briefs/sueldo-imponible.md`
- `docs/editorial/artifacts/briefs/pgu.md`
- `docs/editorial/artifacts/briefs/contribuciones-bienes-raices.md`
- `docs/editorial/artifacts/briefs/igc.md`

Actualizados:
- `docs/research/seo/strategy/topic_ownership_matrix.md` (6 filas P1: canonicalTopic + estado brief)
- `docs/editorial/seo-owner-map-2026.md` (pendientes + tabla Sprint 2)

No modificados (fuera de scope):
- `src/config/editorial-topic-policy.mjs` (registro de canonicalTopics es gate Sprint 2B)
- Todo archivo de `src/data/blog/`
- Todo archivo de `src/pages/`

## Regression risk y rollback

Riesgo nulo para el sitio: solo se crearon/actualizaron archivos de documentacion. Ningun
frontmatter de articulo fue tocado; ningun script de validacion fue modificado; ninguna ruta
publica fue agregada o eliminada.

Rollback: borrar los 6 archivos de brief en `docs/editorial/artifacts/briefs/` y revertir las
actualizaciones en `topic_ownership_matrix.md` y `seo-owner-map-2026.md`.

## Pendientes para Sprint 2B (redaccion de articulos)

Para cada articulo P1, en este orden recomendado:

1. Gate 01: Humano aprueba el brief correspondiente.
2. PRE-02: Agente registra el `canonicalTopic` en `src/config/editorial-topic-policy.mjs`.
3. Gate 02: Agente + humano completan el dossier de fuentes oficiales.
4. Gate 03: Agente produce el outline.
5. Gate 04: Agente redacta el borrador.
6. Gate 05: Agente ejecuta el math audit.
7. Gate 06: Agente ejecuta compliance YMYL.
8. Gate 07: Solo humano marca las gates en el publish packet.

Orden recomendado por riesgo YMYL y complejidad:
1. `fondo-emergencia` (menor riesgo, activa cluster dormido)
2. `gratificacion-legal` (riesgo medio, calculadora Sprint 3 depende del owner)
3. `sueldo-imponible` (riesgo medio, artículo puente sueldo-remuneraciones)
4. `contribuciones-bienes-raices` (riesgo medio/alto, estacional por cuotas)
5. `pgu` (riesgo alto, beneficio estatal con montos actualizables)
6. `igc` (mayor complejidad, requiere diferenciación clara vs F22)

## Pendientes para Sprint 3 (calculadoras)

Calculadoras bloqueadas por owner faltante que Sprint 2 desbloquea:
- `/calculadoras/gratificacion-legal/` (P1 Sprint 3) — requiere owner `gratificacion-legal-chile` publicado.
- `/calculadoras/presupuesto-mensual/` (P2 Sprint 3) — requiere owner `fondo-emergencia-chile` o segundo activo en cluster.
