# 00 — Topic Intake & Scoring

> Plantilla de Gate 00 (pre-brief). Proceso y rúbrica:
> [`docs/editorial/TOPIC_INTAKE_POLICY.md`](../../../../docs/editorial/TOPIC_INTAKE_POLICY.md).
> Gate 00 es pre-brief, pre-slug, pre-registro: salida = go/no-go + alcance.

## Identificación

| Campo | Valor |
|---|---|
| Candidato (id de trabajo) | `finanzas-para-migrantes-chile` |
| Intención dominante | "¿Cómo obtengo RUT, me bancarizo y arriendo siendo migrante en Chile?" |
| Alcance evaluado | Pilar greenfield de trámites estables (RUT, bancarización, arriendo) |
| Cluster propuesto | **greenfield** (`finanzas-migrantes`) |
| Fecha de evaluación | 2026-06-17 |
| Evaluador | Topic-intake (sesión Claude Code) |

## Fase A — Kill-switches (binarios, fail-any bloquea)

| # | Kill-switch | Pregunta | Veredicto | Evidencia |
|---|---|---|---|---|
| 1 | De-dup vs repo | ¿Existe contenido publicado que cubra esta intención? | **PASS** | Ninguno de los 48 posts ni el glosario/leyes cubre finanzas de migrantes. Greenfield total. |
| 2 | Conflicto de autoridad | ¿La intención tiene owner en `CANONICAL_TOPIC_REGISTRY`? | **PASS** | No figura en los 8 clusters del registro. |
| 3 | Viabilidad (`CRITERIO_VIABILIDAD.md`) | ¿Fuentes públicas, legales y suficientes? | **PASS** | RUT (SII/Registro Civil), bancarización (CuentaRUT, cuentas para extranjeros) y arriendo son trámites estables con fuentes públicas. |
| 4 | Costo de mantención | ¿El formato evita datos volátiles/refresco insostenible? | **PASS** | Trámites estables → refresco bajo; sin datos volátiles. |
| 5 | ¿Resuelve una decisión? | ¿Ayuda a tomar/ejecutar una decisión concreta? | **PASS** | Cómo obtener RUT, qué cuenta abrir siendo migrante, cómo arrendar. |

**Resultado Fase A:** SOBREVIVE.

## Fase B — Scoring 1–5

| Dimensión | Puntaje | Justificación |
|---|---|---|
| Vacío de cluster (gap) | 5 | Greenfield total, sin cobertura previa. |
| Utilidad / decisión-resolvencia | 4 | Trámites concretos y de alto impacto para el segmento. |
| Interlinking | 3 | Enlaza al futuro pilar de bancos/fintech, a sueldo y a arriendo (`reajuste-arriendo`), pero es un nicho con menos puntos de cruce. |
| Demanda / volumen | 2 | Doc 2 lo ubicó en prioridad 3; volumen menor que bancos/fintech. |
| Viabilidad de datos | 5 | Trámites estables, fuentes oficiales públicas. |
| Mantención (inverso) | 5 | Muy baja; contenido evergreen de trámite. |
| **Promedio** | **4.00** | |

## Veredicto

| Campo | Valor |
|---|---|
| Decisión | **PROCEDER A BRIEF** (prioridad menor). |
| Prioridad relativa | **Media** — detrás de `bancos-y-fintech-chile`; idealmente después de que exista el pilar de bancos para enlazar la bancarización. |
| Alcance aprobado | Pilar de trámites estables: obtención de RUT, bancarización del migrante, arriendo. |
| Alcance diferido | Subtemas de alta volatilidad regulatoria (visados/permisos), fuera del foco financiero. |
| Próximo paso | Redactar `01-brief.yaml` tras el pilar de bancos; registrar `canonicalTopic` al decidir owner (fuera de Gate 00). |

## Notas

Menor volumen pero la viabilidad y el bajo mantenimiento son los más altos de los dos
candidatos: buen segundo pilar evergreen una vez exista el cruce con bancos/fintech.
