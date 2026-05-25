# Auditoria de alineamiento editorial y guardrails - 2026-05-25

> Tipo: auditoria interna repo-grounded.
> Alcance: policies, rules, invariants, contracts, guardrails, contenido, ownership, canibalizacion e interlinking.
> Fuera de alcance: SERP live, GSC, Cloudflare, benchmarking externo y remediacion de contenido.
> Backlog asociado: [`docs/backlog/PLAN-alignment-audit-remediation-2026-05-25.md`](../backlog/PLAN-alignment-audit-remediation-2026-05-25.md).

## Scope block

- In scope: `context/*.md`, `docs/editorial/*`, `docs/governance/*`, `docs/research/seo/strategy/topic_ownership_matrix.md`, `src/config/editorial-topic-policy.mjs`, `src/config/editorial-hub-model.mjs`, `src/data/blog/**`, hubs `src/pages/guias/**`, glosario, leyes y calculadoras relacionadas.
- Out of scope: cambios en articulos publicados, rutas, RSS baselines, policy registry, scripts, modelos de datos y automatizaciones nuevas.
- Operacion permitida: auditoria, documentacion y backlog accionable.
- Operacion prohibida en esta fase: corregir contenido, endurecer CI, crear nuevas superficies indexables o cambiar ownership operativo.

## Autoridad e invariantes preservados

Autoridad aplicada, en orden:

1. `docs/AI_ENGINEERING_CONSTITUTION.md`
2. `AGENTS.md`
3. `context/INVARIANTS.md`
4. `context/CONTRACTS.md`
5. `docs/editorial/NON_CANNIBALIZATION_PROCESS.md`
6. `docs/editorial/TOPIC_OWNERSHIP_POLICY.md`

Invariantes y contratos citados explicitamente:

- `URL.PUBLIC.NO_POST_ID`
- `FRONTMATTER.VALID`
- `ROUTES.NO_SILENT_CHANGES`
- `RSS.NO_REMOVALS`
- `INVARIANT.EDITORIAL.TOPIC_OWNER_UNIQUENESS`
- `INVARIANT.EDITORIAL.CLUSTER_INTERNAL_LINK_MIN`
- `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`
- `CONTRACT.PUBLIC_URLS`
- `CONTRACT.FRONTMATTER_POLICY`
- `CONTRACT.ARTICLE_STRUCTURE`
- `CONTRACT.YMYL_RESPONSE_STRUCTURE`

## Resumen ejecutivo

El corpus esta sano desde el punto de vista de guardrails bloqueantes: no hay conflicto constitucional, no hay derivacion publica desde `post.id`, no hay frontmatter bloqueante, no hay links internos rotos, no hay stale/drift editorial y no hay remociones RSS. La auditoria no detecta P0.

El principal riesgo no esta en gates rotos, sino en drift semantico de segundo orden: varios clusters ya crecieron lo suficiente como para que owners, supports, hubs y calculadoras necesiten una capa de curaduria manual mas fina. El caso mas sensible es `ahorro-e-inversion`, donde el owner general de instrumentos, el articulo de ETFs y la pieza de fondos mutuos comparten patrones de H2/snippet suficientes para requerir diferenciacion editorial visible. Esto no exige merge ni redirect inmediato, pero si una remediacion P1.

Tambien aparecen oportunidades P2 en clusters de sueldo, impuestos, pensiones, UF y deuda: piezas hermanas con promesas cercanas, backlinks bajos hacia owners recientes y un modelo de hub assignment que hoy cubre solo tres hubs en `src/config/editorial-hub-model.mjs`. La recomendacion es ejecutar remediaciones por batch, sin endurecer CI todavia.

## Evidencia de gates

| Comando | Resultado | Lectura de auditoria |
|---|---:|---|
| `pnpm run check:frontmatter` | Pass | 50 articulos; 0 errores; 0 campos deprecados; preserva `FRONTMATTER.VALID` y `CONTRACT.FRONTMATTER_POLICY`. |
| `pnpm run check:links` | Pass | 50 articulos publicados; 220 links internos; 0 links rotos. |
| `pnpm run check:editorial-timeliness` | Pass | 50 publicados; `stale=0`; `drift=0`. |
| `pnpm run audit:topic-overlap` | Pass warning/manual | 50 articulos; `metadata_warnings=0`; `candidates=35`; top 20 impresos por el script. |
| `pnpm run check:editorial` | Pass | 50 validados; `cluster_link_warning=0`; 46/46 YMYL compliant; artifact gate en warn-only. |
| `pnpm run check:no-postid-urls` | Pass | 210 source files; 0 patrones prohibidos; preserva `URL.PUBLIC.NO_POST_ID` y `CONTRACT.PUBLIC_URLS`. |
| `pnpm run check:routes` | Pass con additions | `before=39 after=50`; 11 rutas agregadas; 0 remociones; preserva `ROUTES.NO_SILENT_CHANGES`. |
| `pnpm run check:rss` | Pass con additions | `baseline=14 current=49 removed=0 added=35`; preserva `RSS.NO_REMOVALS`. |

Nota: `check:routes` y `check:rss` no indican regresion; reportan crecimiento permitido contra baselines historicos. No se actualizaron baselines en esta auditoria.

## Matriz de hallazgos

| ID | Severidad | Hallazgo | Evidencia | Decision recomendada |
|---|---|---|---|---|
| ALIGN-001 | P1 | Overlap fuerte entre owner general de ahorro/inversion y articulo ETF | `audit:topic-overlap`: `candidate_strong_overlap`, score `0.393`, H2 similarity `0.245`; ambos son `owner` en `ahorro-e-inversion`. | `keep` + `retarget`: mantener ambas URLs, reforzar que el owner general decide entre instrumentos y que ETF es ejecucion/procedimiento. |
| ALIGN-002 | P1 | Owner general de ahorro/inversion tambien pisa fondos mutuos por estructura de secciones | `candidate_same_intent`, score `0.362`, desc `0.250`, H2 `0.308`; ambos enlazan bidireccionalmente, pero los H2 comparten marco de perfil/costos/errores. | `keep` + `retarget`: diferenciar fondos mutuos como friccion/costos/rescate, no como guia general de eleccion. |
| ALIGN-003 | P2 | Operacion Renta Centro y F22 Checklist comparten promesa suficiente para requerir boundary editorial | `candidate_same_intent`, score `0.424`; `operacion-renta-centro` es `support` y `operacion-renta-f22-checklist` es `owner` del mismo topic. | `support`: mantener centro como hub/entrada estacional y F22 como checklist owner; aclarar en intro/snippet. |
| ALIGN-004 | P2 | Seguro de cesantia owner y soporte CIC/FCS estan correctamente modelados, pero su title/snippet compiten por head term | `candidate_same_intent`, score `0.414`; support title empieza con el mismo head term. | `support` + `rename`: mantener soporte, pero bajar prominencia del head term en title/meta. |
| ALIGN-005 | P2 | Sueldo liquido, sueldo imponible y descuentos forman cluster sano pero con alta cercania de promesa | Scores `0.408`, `0.394`, `0.376`, `0.366`, `0.361`; todos owners distintos en `sueldo-remuneraciones`. | `keep`: reforzar bloques "si tu duda es otra" y links bidireccionales sin fusionar. |
| ALIGN-006 | P2 | Pensiones AFP tiene varios owners proximos por decision secuencial del usuario | `como-cambiarse-de-afp` cruza con fondos, cuenta 2 y cartola; scores `0.391`, `0.387`, `0.371`, `0.363`. | `keep`: agregar decision-routing visible, no cambiar ownership. |
| ALIGN-007 | P2 | UF/IPc/reajuste arriendo comparten vocabulario de costo de vida; coexistencia valida pero requiere boundary de tool-led page | IPC vs reajuste arriendo score `0.382`; ambos owners en `uf-costo-de-vida`. | `keep`: IPC explica indice; arriendo resuelve clausula/caso. |
| ALIGN-008 | P2 | Algunos owners recientes tienen bajo inbound editorial | 16 articulos con inbound `<=1`, incluyendo `pgu`, `sueldo-imponible`, `gratificacion`, `tarjeta-credito`, `prepago`, `fondo-emergencia`. | `backlink`: fortalecer enlaces desde owners/hubs/calculadoras sin cambiar rutas. |
| ALIGN-009 | P2 | Hub assignment config cubre solo `deuda-credito`, `pensiones-afp` y `uf-costo-de-vida` | `src/config/editorial-hub-model.mjs` no modela todos los hubs vivos; link graph existe en contenido pero no en config. | `needs-policy-update`: evaluar ampliar hub model warning-first. |
| ALIGN-010 | P3 | `audit:topic-overlap` detecta 35 candidatos pero solo imprime top 20 | Salida actual limita `candidates.slice(0, 20)`. | `needs-policy-update`: agregar modo `--all` o salida JSON para auditorias futuras. |

## Revision de pares candidatos principales

| Par | Clasificacion manual | Razon |
|---|---|---|
| `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` vs `como-invertir-en-etfs-desde-chile` | `keep` + `retarget` | Coexistencia valida: owner general vs procedimiento ETF. Riesgo por H2 compartidos "perfil", "costos" y "errores"; requiere diferenciacion visible. |
| `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` vs `fondos-mutuos-comisiones-rescate-impuestos` | `keep` + `retarget` | Coexistencia valida: comparacion general vs instrumento especifico. Riesgo de que fondos mutuos reabra "que invertir" en lugar de costos/rescate/impuestos. |
| `el-poder-del-interes-compuesto` vs `interes-compuesto-nota-metodologica` | `keep` | Modelo correcto: owner/caso inspiracional + reference metodologica. No requiere merge; si acaso, reforzar canonical wording en la nota. |
| `operacion-renta-centro` vs `operacion-renta-f22-checklist` | `support` | Misma familia de intencion, pero roles correctos: centro estacional/entrada y checklist F22 owner. Requiere copy boundary. |
| `seguro-cesantia-cuenta-individual-vs-fondo-solidario` vs `seguro-de-cesantia` | `support` + `rename` | Soporte util, pero title/meta heredan head term del owner. Mejor diferenciar como "CIC vs FCS". |
| `como-calcular-sueldo-liquido` vs `sueldo-imponible-chile` | `keep` | La relacion es causal y esperada. Mantener sueldo liquido como calculo final; sueldo imponible como base legal/tributaria. |
| `descuentos-de-sueldo` vs `sueldo-imponible-chile` | `keep` | Coexistencia valida: clasificacion de descuentos vs base imponible. Reforzar crosslinks contextuales. |
| `como-cambiarse-de-afp` vs `fondos-afp-a-b-c-d-e` | `keep` | Decision secuencial natural: cambiar AFP vs elegir fondo. No fusionar. |
| `que-es-el-ipc-chile-como-se-calcula` vs `reajuste-arriendo-uf-ipc-chile` | `keep` | IPC es concepto; reajuste es aplicacion contractual/tool-led. Coexistencia sana si el snippet lo deja claro. |
| `cae-costo-real-credito-chile` vs `tarjeta-credito-costo-real-chile` | `keep` | CAE general de credito vs deuda rotativa de tarjeta. Requiere enlaces de salida correctos, no merge. |

## Mapa de concordancia por cluster

| Cluster | Articulos | Roles | Link graph observado | Riesgo |
|---|---:|---|---|---|
| `ahorro-e-inversion` | 7 | 6 owner, 1 reference | 22 intra, 3 inter, 5 hub links, 3 calculator links | P1 por overlap entre owner general e instrumentos especificos. |
| `deuda-credito` | 8 | 7 owner, 1 support | 16 intra, 1 inter, 2 hub links, 10 calculator links | P2 por owners recientes con inbound bajo y hub config parcial. |
| `empleo-ingresos` | 6 | 3 owner, 2 support, 1 untyped | 13 intra, 8 inter, 1 hub link, 5 calculator links | P2 por support CIC/FCS muy cercano al head term del owner. |
| `impuestos-personas` | 7 | 5 owner, 1 support, 1 untyped | 19 intra, 0 inter, 2 hub links, 10 calculator links | P2 por Centro Operacion Renta vs F22 owner. |
| `pensiones-afp` | 6 | 6 owner | 10 intra, 3 inter, 1 hub link, 2 calculator links | P2 por decision-routing entre cambio AFP, fondos, cuenta 2 y cartola. |
| `presupuesto-control-financiero` | 2 | 2 owner | 2 intra, 4 inter, 1 hub link, 0 calculator links | P2 por cluster joven: reforzar backlinks hacia `fondo-emergencia`. |
| `seguridad-financiera` | 4 | 1 owner, 3 untyped | 9 intra, 2 inter, 3 hub links, 0 calculator links | P3/P2: cluster no endurecido; revisar si `fonasa-vs-isapre` pertenece aqui o requiere policy futura. |
| `sueldo-remuneraciones` | 6 | 6 owner | 10 intra, 7 inter, 2 hub links, 0 calculator links | P2 por muchas piezas vecinas con promesas cercanas pero roles validos. |
| `uf-costo-de-vida` | 4 | 4 owner | 8 intra, 1 inter, 5 hub links, 8 calculator links | Sano; mantener boundaries concepto vs caso aplicado. |

## Backlinks internos bajos

No hay articulos huerfanos reales segun `check:links`, pero 16 piezas tienen inbound editorial `<=1`. Esto no es bloqueo; es senal de descubrimiento y autoridad interna.

Prioridad para refuerzo:

- `tarjeta-credito-costo-real-chile`, `prepago-credito-cuando-conviene-chile`, `donde-ver-si-estoy-en-dicom-gratis`
- `sueldo-imponible-chile`, `gratificacion-legal-chile`
- `pgu-pension-garantizada-universal`, `que-es-la-cuenta-2-afp`
- `contribuciones-bienes-raices-chile`, `impuesto-global-complementario-chile`, `operacion-renta-centro`
- `fondo-emergencia-chile`

## Guardrail gaps

- `audit:topic-overlap` es util pero su salida de candidatos es incompleta para auditorias profundas; deberia ofrecer `--all` o JSON.
- El modelo de hubs centralizado no cubre todos los hubs activos, lo que deja parte del control core/related en contenido/manual review.
- El inbound bajo no tiene reporte dedicado en CI ni auditoria recurrente; por ahora debe seguir warning-first.
- Clusters no endurecidos todavia permiten `untyped` razonables, pero `seguridad-financiera`, `empleo-ingresos` e `impuestos-personas` ya muestran tamano suficiente para evaluar endurecimiento gradual.

## Change Control Record

1. Scope declaration
- In scope: este informe y el backlog asociado.
- Out of scope: contenido publicado, rutas, RSS, scripts, policy registry, calculadoras y hubs.

2. Impacted modules
- Paths: `docs/reports/AUDIT-ALIGNMENT-2026-05-25.md`, `docs/backlog/PLAN-alignment-audit-remediation-2026-05-25.md`.
- Reason: registrar auditoria y remediacion planificada.

3. Invariant preservation
- Referenced invariants: `URL.PUBLIC.NO_POST_ID`, `FRONTMATTER.VALID`, `ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS`, `INVARIANT.EDITORIAL.TOPIC_OWNER_UNIQUENESS`, `INVARIANT.EDITORIAL.CLUSTER_INTERNAL_LINK_MIN`, `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`.
- Preservation proof: no se modificaron rutas, slugs, contenido, feed, helpers URL ni ownership runtime.

4. Contract preservation
- Referenced contracts: `CONTRACT.PUBLIC_URLS`, `CONTRACT.FRONTMATTER_POLICY`, `CONTRACT.ARTICLE_STRUCTURE`, `CONTRACT.YMYL_RESPONSE_STRUCTURE`.
- Breaking changes: no.

5. Boundary integrity
- Layer boundary check: no runtime layers changed.
- Unauthorized cross-layer imports introduced: no.

6. Test coverage impact
- Changed runtime layers: none.
- Related tests added/updated: none; audit-only.
- Coverage threshold status: not applicable.

7. Rollback strategy
- Revert unit: revert this report and associated backlog document.
- Data/content rollback needed: no.

8. Regression risk
- Risk level: low.
- Primary regression vectors: documentation drift if remediation backlog is not executed or closed.
- Mitigations: backlog includes acceptance criteria and verification commands.

## Conclusiones

- Status general: `PASS with editorial remediation backlog`.
- P0: 0.
- P1: 2 actionable findings, both in `ahorro-e-inversion`.
- P2: 7 actionable findings across clusters, mostly link graph, snippets and support/owner boundaries.
- P3: 1 automation/documentation finding.
- HALT: none.

