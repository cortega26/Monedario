# 00 — Topic Intake & Scoring

> Plantilla de Gate 00 (etapa pre-brief). Proceso autoritativo y rúbrica en
> [`docs/editorial/TOPIC_INTAKE_POLICY.md`](../TOPIC_INTAKE_POLICY.md).
> Gate 00 es **pre-brief, pre-slug, pre-registro**: su salida es un veredicto
> go/no-go + recomendación de alcance que alimenta `01-brief.yaml`. No crea
> slugs, no registra `canonicalTopic` ni modifica `editorial-topic-policy.mjs`.

## Identificación

| Campo | Valor |
|---|---|
| Candidato (id de trabajo) | `<kebab-case, no es un slug>` |
| Intención dominante | `<la pregunta/decisión del usuario>` |
| Alcance evaluado | `<pilar educativo / spoke / comparador en vivo / calculadora / …>` |
| Cluster propuesto | `<greenfield o cluster existente>` |
| Fecha de evaluación | `YYYY-MM-DD` |
| Evaluador | `<rol/sesión>` |

## Fase A — Kill-switches (binarios, fail-any bloquea)

Cualquier `FAIL` detiene el candidato o fuerza un re-encuadre de alcance antes de
seguir. Registra la evidencia, no solo el veredicto.

| # | Kill-switch | Pregunta | Veredicto | Evidencia |
|---|---|---|---|---|
| 1 | De-dup vs repo | ¿Existe ya contenido publicado que cubra esta intención? | PASS/FAIL | |
| 2 | Conflicto de autoridad | ¿La intención ya tiene owner en `CANONICAL_TOPIC_REGISTRY`? | PASS/FAIL | |
| 3 | Viabilidad (`CRITERIO_VIABILIDAD.md`) | ¿Las fuentes requeridas son públicas, legales y suficientes? | PASS/FAIL | |
| 4 | Costo de mantención | ¿El **formato** evita datos volátiles o refresco insostenible? | PASS/FAIL | |
| 5 | ¿Resuelve una decisión? | ¿Ayuda al usuario a tomar o ejecutar una decisión concreta? | PASS/FAIL | |

> Nota: los kill-switches 3 y 4 a menudo no matan el **tema** sino un **alcance**
> (p. ej. "comparador en vivo" falla por volatilidad, pero "pilar educativo"
> pasa). Re-encuadra el alcance y vuelve a correr la Fase A antes de matar.

**Resultado Fase A:** `SOBREVIVE / DESCARTADO / RE-ENCUADRAR`

## Fase B — Scoring 1–5 (solo sobrevivientes)

Solo se puntúan los candidatos que pasaron las 5 kill-switches. Escala 1
(muy débil) a 5 (muy fuerte). Justifica cada celda.

| Dimensión | Puntaje | Justificación |
|---|---|---|
| Vacío de cluster (gap) | | |
| Utilidad / decisión-resolvencia | | |
| Interlinking (hubs/calculadoras enlazables) | | |
| Demanda / volumen | | |
| Viabilidad de datos | | |
| Mantención (inverso: 5 = bajo costo) | | |
| **Promedio** | | |

> **GSC es confirmatorio-solo** a la escala actual del sitio (ver política):
> apóyate en gap de cluster + SERP de competidores + Reddit para estimar demanda.
> Si una dimensión puntúa **1**, re-encuadra el alcance antes de proceder.

## Veredicto

| Campo | Valor |
|---|---|
| Decisión | `PROCEDER A BRIEF / DIFERIR / DESCARTAR / FOLD en owner existente` |
| Prioridad relativa | `<alta/media/baja + frente a qué otros candidatos>` |
| Alcance aprobado | `<el alcance que pasó, explícito>` |
| Alcance diferido | `<lo que se difiere y por qué>` |
| Próximo paso | `<p. ej. redactar 01-brief.yaml; registrar canonicalTopic al decidir owner>` |

## Notas
