# 00 — Topic Intake & Scoring

> Plantilla de Gate 00 (etapa pre-brief). Proceso autoritativo y rúbrica en
> [`docs/editorial/TOPIC_INTAKE_POLICY.md`](../../../../docs/editorial/TOPIC_INTAKE_POLICY.md).

## Identificación

| Campo | Valor |
|---|---|
| Candidato (id de trabajo) | `articulo-107-lir-ganancia-capital-acciones` |
| Intención dominante | ¿Qué es el art. 107 LIR, cuándo la ganancia de capital en venta de acciones/ETFs/cuotas de fondos con presencia bursátil está exenta, y qué requisitos hay que cumplir? |
| Alcance evaluado | Pilar educativo standalone (nueva URL) — lo solicitado originalmente por el usuario |
| Cluster propuesto | `ahorro-e-inversion` (cluster existente, no greenfield) |
| Fecha de evaluación | 2026-08-09 |
| Evaluador | Claude Code (sesión de intake, previa a cualquier draft) |

## Fase A — Kill-switches

| # | Kill-switch | Pregunta | Veredicto | Evidencia |
|---|---|---|---|---|
| 1 | De-dup vs repo | ¿Existe ya contenido publicado que cubra esta intención? | **FAIL** | `src/data/blog/como-elegir-inversion-segun-plazo-riesgo-objetivos.mdx:202-203` ya cita y enlaza el "Art. 107 de la LIR" (bcn.cl) al hablar de ETFs con presencia bursátil. `src/data/blog/operacion-renta-centro.md:77` ya menciona que "la ganancia de capital en venta de acciones con presencia bursátil sigue exenta" (Ley 21.210). No es un tratamiento profundo dedicado, pero la intención ya tiene presencia parcial en dos piezas publicadas. |
| 2 | Conflicto de autoridad | ¿La intención ya tiene owner en `CANONICAL_TOPIC_REGISTRY`? | **FAIL** | `src/config/editorial-topic-policy.mjs` registra, dentro del cluster `ahorro-e-inversion`: `elegir-instrumento-ahorro-inversion` → ownerSlug `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` (título literal: "¿ETF, DAP o fondo mutuo en Chile? Cómo elegir", `topicRole: owner`, tags incluyen `impuestos`); y `invertir-etfs-desde-chile` → ownerSlug `como-invertir-en-etfs-desde-chile`. Ambos son dueños de la intención de fondo (elegir/entender instrumentos con presencia bursátil, incluida su tributación). Revisé ambos archivos: **ninguno menciona hoy el art. 107 LIR explícitamente** pese a ser el lugar natural — es un vacío dentro del owner, no un vacío de cluster. |
| 3 | Viabilidad (`CRITERIO_VIABILIDAD.md`) | ¿Las fuentes requeridas son públicas, legales y suficientes? | PASS | Fuente primaria estable: art. 107 DL 824 (LIR), texto en bcn.cl/leychile; circulares/oficios SII sobre presencia bursátil y requisitos de la exención. No depende de scraping ni de fuentes de terceros. |
| 4 | Costo de mantención | ¿El formato evita datos volátiles o refresco insostenible? | **CONDICIONAL** | El texto legal del art. 107 es estable, pero el usuario califica el tema como "muy vigente hoy" (2026-08-09). Sin verificación aún de qué hace el tema vigente ahora mismo (¿proyecto de reforma tributaria en tramitación que modifica/deroga la exención? ¿circular SII reciente?). Si hay un cambio normativo en curso, el costo de mantención sube y el artículo debe declarar explícitamente el estado de tramitación con fecha de corte — esto se resuelve en la etapa de research/dossier, no bloquea el intake. |
| 5 | ¿Resuelve una decisión? | ¿Ayuda a tomar/ejecutar una decisión financiera concreta? | PASS | Ayuda a decidir si vender/mantener instrumentos con presencia bursátil, cómo verificar si la ganancia queda exenta, y cómo declararlo en Operación Renta. |

**Resultado Fase A:** `DESCARTADO como pilar standalone nuevo (KS1 + KS2 en FAIL) → RE-ENCUADRAR`

No se ejecuta Fase B (scoring): la política reserva el scoring para sobrevivientes de la Fase A, y aquí la señal de la Fase A ya es clara — el vacío no es de cluster (no hay un hueco greenfield), es un vacío de profundidad **dentro de contenido ya publicado y ya asignado a un owner**.

## Veredicto

| Campo | Valor |
|---|---|
| Decisión | **FOLD en owner existente** — no procede brief para artículo standalone nuevo |
| Prioridad relativa | Media-alta como refresh (gap real: el owner promete "impuestos" en el título/tags y no cubre la exención más citada del cluster de inversión en instrumentos con presencia bursátil) |
| Alcance aprobado | Sección nueva, rigurosa y verificada dentro de `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` (owner del cluster `ahorro-e-inversion` para "elegir instrumento") que explique el art. 107 LIR: qué es "presencia bursátil", requisitos de la exención, qué queda fuera, y estado normativo vigente a la fecha de corte. Reforzar de paso la cita ya existente en `como-elegir-inversion-segun-plazo-riesgo-objetivos.mdx`. |
| Alcance diferido | Artículo standalone dedicado a "107 LIR" como URL nueva — bloqueado por dos motivos independientes: (a) este intake (KS1/KS2), y (b) el freeze estratégico vigente 2026-08-02→2026-11-02 (`docs/governance/STRATEGIC_FOCUS_2026Q3.md`), que prohíbe crear artículos nuevos sin excepción `APPROVED` en `url-freeze-exceptions.json` (hoy vacío). Entrada de glosario "presencia bursátil" también diferida por el mismo freeze. |
| Próximo paso | Si se aprueba: tratar como **refresh sustantivo YMYL** del artículo owner existente (no crea URL nueva → no requiere excepción de freeze). Como cambia interpretación legal/elegibilidad, corre igual el pipeline completo de `context/EDITORIAL_AI_PIPELINE.md` con `regulatory_sensitivity=alta`: brief tipo refresh → research/dossier (confirmar estado normativo vigente hoy, con fetch directo a bcn.cl y sii.cl) → outline de la sección nueva → draft → math/compliance audit (sesión fresca) → sign-off humano antes de tocar `src/data/blog/`. |

## Notas

- Esta intake responde a una solicitud explícita del usuario de escribir "un artículo sobre 107 LIR". El resultado del Gate 00 redirige el alcance hacia un refresh del owner en vez de una pieza nueva; esto se reporta al usuario para confirmación antes de abrir `01-brief.yaml`, dado que cambia la forma del entregable frente a lo pedido originalmente.
- No se registró ningún cambio en `editorial-topic-policy.mjs`: el `canonicalTopic` (`elegir-instrumento-ahorro-inversion`) ya existe y no cambia de owner.
