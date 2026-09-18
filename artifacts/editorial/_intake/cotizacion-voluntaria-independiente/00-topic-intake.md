# 00 — Topic Intake & Scoring

> Plantilla de Gate 00 (etapa pre-brief). Proceso autoritativo y rúbrica en
> [`docs/editorial/TOPIC_INTAKE_POLICY.md`](../../../../docs/editorial/TOPIC_INTAKE_POLICY.md).
> Gate 00 es **pre-brief, pre-slug, pre-registro**. No crea slugs, no registra
> `canonicalTopic` ni modifica `editorial-topic-policy.mjs`.

## Identificación

| Campo | Valor |
|---|---|
| Candidato (id de trabajo) | `cotizacion-voluntaria-independiente` |
| Intención dominante | "¿Puedo/me conviene cotizar voluntariamente en AFP y salud si no emito boletas suficientes, soy socio de mi propia empresa (retiros/dividendos, no boletas) o no tengo actividad remunerada formal, para no perder continuidad de pensión, seguro de invalidez/sobrevivencia o elegibilidad a PGU?" |
| Alcance evaluado | Pilar educativo (guía) — NO comparador en vivo, NO calculadora nueva en esta primera pasada |
| Cluster propuesto | `pensiones-afp` (existente) |
| Fecha de evaluación | 2026-09-17 |
| Evaluador | Claude Code (sesión de chat, a pedido del usuario) |

## Contexto — re-encuadre de un candidato previamente descartado

El worked example fundacional de `TOPIC_INTAKE_POLICY.md` §4.1 (corrida 2026-06-17)
evaluó el candidato **"Independientes"** (alcance amplio) y lo descartó como
contenido nuevo: *"Reorg/interlinking, no contenido nuevo — KS2: ya owned por
`boleta-honorarios` + rentas mixtas"*. Verificado vigente en `CANONICAL_TOPIC_REGISTRY`
(`src/config/editorial-topic-policy.mjs`): `honorarios-retencion-cobertura` →
`boleta-honorarios-2026-retencion-cobertura`; `rentas-mixtas` →
`rentas-mixtas-sueldo-honorarios`.

Este candidato **no es una repetición de "Independientes"**. Es un re-encuadre
angosto a un mecanismo legal distinto — **afiliación voluntaria** (para quien
NO está obligado a cotizar por boletas) — que el candidato original de 2026-06-17
no distinguía explícitamente y que ninguno de los dos owners existentes cubre.

## Fase A — Kill-switches (binarios, fail-any bloquea)

| # | Kill-switch | Pregunta | Veredicto | Evidencia |
|---|---|---|---|---|
| 1 | De-dup vs repo | ¿Existe ya contenido publicado que cubra esta intención? | **PASS** | `grep -rliE "afiliad[oa].{0,10}voluntari\|voluntari[oa].{0,15}(afp\|pensi[oó]n\|previsional)"` sobre `src/data/blog/*.md*`, `src/data/glossary/*.md`, `src/data/laws/*.md`: 0 artículos de blog. Único hit tangencial: `src/data/glossary/cuenta-2.md` ("cuenta voluntaria dentro de la AFP") — mecanismo distinto (ahorro adicional tipo APV, no afiliación/estatus previsional). `boleta-honorarios-2026-retencion-cobertura.md` cubre cotización **obligatoria** por boletas (umbral 5 IMM, exenciones) pero no menciona afiliación voluntaria en ningún punto (grep de "voluntari" sobre el archivo: 0 hits). `rentas-mixtas-sueldo-honorarios.md` es puramente tributario (F22/IGC), no toca mecánica previsional. |
| 2 | Conflicto de autoridad | ¿La intención ya tiene owner en `CANONICAL_TOPIC_REGISTRY`? | **PASS** | Revisión completa de entradas con `pension\|afp\|salud\|isapre\|fonasa\|previsional\|seguridad` en `src/config/editorial-topic-policy.mjs`: `cuanto-descuenta-la-afp-de-tu-sueldo` (descuento AFP dependiente), `como-cambiarse-de-afp`, `fondos-afp-a-b-c-d-e`, `que-es-la-cuenta-2-afp`, `reforma-previsional-2025...`, `como-leer-cartola-afp-chile`, `pgu-pension-garantizada-universal`, `fonasa-vs-isapre-comparativa`. Ninguna registra `afiliación voluntaria` como intención. Sin owner. |
| 3 | Viabilidad (`CRITERIO_VIABILIDAD.md`) | ¿Las fuentes requeridas son públicas, legales y suficientes? | **PASS** | WebSearch confirma fuente oficial dedicada y viva: Superintendencia de Pensiones tiene página específica "¿Qué se entiende por afiliada o afiliado voluntario?" (spensiones.cl/portal/institucional/594/w3-article-5947.html) que distingue expresamente afiliado voluntario (sin actividad remunerada, cotiza 10% de cualquier monto ≥ ingreso mínimo) de trabajador independiente obligado (boletas). Fuentes adicionales públicas: spensiones.cl (cotización previsional obligatoria, trabajadores independientes, afiliación a cualquier AFP), aafp.cl/tramites/como-cotizo-si-soy-independiente, sii.cl/boleta_honorarios/ayuda/cotizacion_previsional.htm, tasa SIS vigente (1,62% desde abril 2026) publicada por spensiones.cl. Sin necesidad de fuentes no públicas o de pago. **Fetch directo de estas URLs queda pendiente para el `02-dossier.md`** (esta fase solo evalúa accesibilidad declarada vía WebSearch, no hace fetch verbatim). |
| 4 | Costo de mantención | ¿El formato evita datos volátiles o refresco insostenible? | **PASS** | Como pilar educativo (no comparador en vivo), el mecanismo legal (categoría "afiliado voluntario", regla del 10% sobre monto ≥ ingreso mínimo) es estructural — no cambia cada mes. Los valores que sí cambian anualmente (ingreso mínimo, tasa SIS, tope imponible) ya tienen un patrón de refresco establecido en artículos hermanos del mismo cluster (`cuanto-descuenta-la-afp-de-tu-sueldo`, `reforma-previsional-2025...`); mismo cadence de auditoría/refresco aplicable aquí. No requiere calculadora nueva ni feed de datos en vivo. |
| 5 | ¿Resuelve una decisión? | ¿Ayuda a tomar o ejecutar una decisión financiera concreta? | **PASS** | Decisión concreta y con consecuencia real: "¿me afilio voluntariamente y cotizo aunque no esté obligado, para no perder continuidad de pensión/PGU/seguro de invalidez-sobrevivencia, o prefiero no cotizar y asumir el riesgo/gap?" — afecta a emprendedores con retiros/dividendos (no boletas), freelance bajo el umbral de 5 IMM, personas entre empleos, dueñas de casa que quieren pensión propia. |

**Resultado Fase A:** `SOBREVIVE`

## Fase B — Scoring 1–5 (solo sobrevivientes)

| Dimensión | Puntaje | Justificación |
|---|---|---|
| Vacío de cluster (gap) | 5 | Cobertura real = 0 en el sitio (confirmado KS1). Mecanismo legal distinto, sin solapamiento con los dos owners que mataron el candidato amplio "Independientes". |
| Utilidad / decisión-resolvencia | 4 | Decisión concreta con consecuencia patrimonial (continuidad previsional, PGU, SIS) pero de audiencia más acotada que "sueldo líquido" o "boletas" — no es una decisión que enfrente la mayoría de los visitantes del sitio cada mes. |
| Interlinking (hubs/calculadoras enlazables) | 5 | Enlaza naturalmente con `cuanto-descuenta-la-afp-de-tu-sueldo`, `como-cambiarse-de-afp`, `fondos-afp-a-b-c-d-e`, `pgu-pension-garantizada-universal`, `reforma-previsional-2025...`, `fonasa-vs-isapre-comparativa`, y sirve de diferenciador explícito frente a `boleta-honorarios-2026-retencion-cobertura` (cotización obligatoria) y `rentas-mixtas-sueldo-honorarios` (solo tributario). Cluster `pensiones-afp` ya tiene hub en `/guias/pensiones-afp/`. |
| Demanda / volumen | **3 (incierto — ver nota)** | `mcp__claude_ai_Ahrefs__keywords-explorer-overview` y `management-projects` devolvieron `"error": "Insufficient plan"` — no se pudo obtener volumen real ni datos GSC del proyecto vía Ahrefs en esta sesión. Sin muestra propia (la intención no tiene página existente en el sitio, así que GSC del dominio no aporta señal directa). Puntaje asignado de forma conservadora, no optimista, según `CRITERIO_VIABILIDAD.md` ("no asumir viabilidad solo por posibilidad técnica" / evitar sesgo de optimismo). Evidencia indirecta a favor: la Superintendencia de Pensiones, la Asociación de AFP (aafp.cl) y el SII mantienen páginas dedicadas a esta pregunta — señal de que es una pregunta recurrente lo bastante frecuente para justificar contenido oficial propio, pero no es un sustituto de volumen medido. |
| Viabilidad de datos | 5 | Fuentes oficiales públicas, vivas y con jurisdicción clara sobre el tema (spensiones.cl, aafp.cl, sii.cl); sin dependencia de datos privados o de pago. |
| Mantención (inverso: 5 = bajo costo) | 4 | Regla estructural estable; solo los valores indexados anuales (ingreso mínimo, tasa SIS) requieren refresco, con cadence ya operativo en artículos hermanos del cluster. |
| **Promedio** | **4.33** | Supera el umbral ≥ 3.5. Ninguna dimensión puntuó 1. |

## Veredicto

| Campo | Valor |
|---|---|
| Decisión | `PROCEDER A BRIEF` |
| Prioridad relativa | Media — por debajo de temas de audiencia masiva (sueldo líquido, boletas), pero con gap total y buen interlinking; no compite por prioridad con nada más en cola conocido en esta sesión. |
| Alcance aprobado | Pilar educativo (guía) sobre afiliación y cotización **voluntaria** en AFP y salud: quién califica (sin actividad remunerada / bajo el umbral de boletas / socios con retiros-dividendos), tasa (10% sobre monto ≥ ingreso mínimo), tasa SIS vigente, elección de AFP, efecto sobre PGU y seguro de invalidez-sobrevivencia, diferencia explícita con cotización obligatoria por boletas. |
| Alcance diferido | Calculadora dedicada de "cuánto cotizar voluntariamente" (no evaluada en este Gate 00; posible follow-up si el artículo confirma demanda vía GSC post-publicación). Comparador en vivo de AFP para afiliados voluntarios (no evaluado). |
| Próximo paso | Redactar `01-brief.yaml` bajo `artifacts/editorial/<slug>/<run-id>/`. `regulatory_sensitivity` propuesta: `alta` (interpreta obligaciones/derechos previsionales, DL 3.500 y normativa de Superintendencia de Pensiones — pipeline completo + compliance + sign-off humano obligatorios). Registrar `canonicalTopic` nuevo (p. ej. `afiliacion-cotizacion-voluntaria`) en `editorial-topic-policy.mjs` al decidir el owner, según política — no se hace en este Gate 00. |

## Notas

- Este intake NO reabre ni contradice el veredicto de 2026-06-17 sobre "Independientes" como pilar amplio: ese candidato sigue correctamente descartado como contenido nuevo (owned por `boleta-honorarios` + `rentas-mixtas`). Este es un candidato distinto y más angosto.
- Limitación declarada: sin acceso a volumen de búsqueda real en esta sesión (Ahrefs `Insufficient plan`). Si se dispone de acceso a un tier superior de Ahrefs o de exports GSC comparables antes de abrir el brief, correr la verificación de demanda y actualizar este documento — no bloquea `PROCEDER A BRIEF` dado que el resto de las dimensiones superan el umbral incluso con la lectura conservadora de demanda, pero sí debería informar la prioridad relativa frente a otros candidatos en cola.
