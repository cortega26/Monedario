# 00 — Topic Intake & Scoring

> Plantilla de Gate 00 (pre-brief). Proceso y rúbrica:
> [`docs/editorial/TOPIC_INTAKE_POLICY.md`](../../../../docs/editorial/TOPIC_INTAKE_POLICY.md).
> Gate 00 es pre-brief, pre-slug, pre-registro: salida = go/no-go + alcance.

## Identificación

| Campo | Valor |
|---|---|
| Candidato (id de trabajo) | `bancos-y-fintech-chile` |
| Intención dominante | "¿Qué banco o fintech me conviene y cómo abro/uso una cuenta básica?" |
| Alcance evaluado | Pilar educativo + spokes de cuenta básica (no comparador en vivo) |
| Cluster propuesto | **greenfield** (`bancos-fintech`) |
| Fecha de evaluación | 2026-06-17 |
| Evaluador | Topic-intake (sesión Claude Code) |

## Fase A — Kill-switches (binarios, fail-any bloquea)

| # | Kill-switch | Pregunta | Veredicto | Evidencia |
|---|---|---|---|---|
| 1 | De-dup vs repo | ¿Existe contenido publicado que cubra esta intención? | **PASS** | 48 posts en `src/data/blog/`; ninguno es owner de bancos/fintech/cuenta básica. Solo existen `glossary/cuenta-rut.md`, `laws/ley-21521-fintech.md` y una mención de paso en `fondo-emergencia-chile.md` → soporte/referencia, no pilar. |
| 2 | Conflicto de autoridad | ¿La intención tiene owner en `CANONICAL_TOPIC_REGISTRY`? | **PASS** | Los 8 clusters del registro no incluyen bancos/fintech. Es greenfield. |
| 3 | Viabilidad (`CRITERIO_VIABILIDAD.md`) | ¿Fuentes públicas, legales y suficientes? | **PASS** (educativo) | Conceptos estables y públicos: cuenta vista/CuentaRUT, RUT bancario, comisiones generales, Ley 21.521 Fintech. **El alcance "comparador en vivo" FALLA** (tarifas/promos volátiles, requeriría refresco continuo). |
| 4 | Costo de mantención | ¿El formato evita datos volátiles/refresco insostenible? | **PASS** (educativo) | Pilar educativo = bajo refresco. Comparador de tarifas en vivo = alto e insostenible → ese formato se descarta aquí. |
| 5 | ¿Resuelve una decisión? | ¿Ayuda a tomar/ejecutar una decisión concreta? | **PASS** | Elegir entre banco tradicional y fintech, abrir y usar una cuenta básica, entender comisiones. |

**Resultado Fase A:** SOBREVIVE (con re-encuadre de alcance: educativo, no comparador en vivo).

## Fase B — Scoring 1–5

| Dimensión | Puntaje | Justificación |
|---|---|---|
| Vacío de cluster (gap) | 5 | La mayor ausencia de cluster del sitio hoy; sin owner en el registro. |
| Utilidad / decisión-resolvencia | 4 | Decisión frecuente y de alto impacto cotidiano (dónde recibir el sueldo, comisiones). |
| Interlinking | 5 | Enlaza con sueldo-remuneraciones, ahorro-e-inversion, deuda-credito y presupuesto; recibe el glosario `cuenta-rut` y la ley Fintech. |
| Demanda / volumen | 4 | Alta demanda inferida por gap de cluster + SERP de competidores + Reddit (GSC confirmatorio-solo). |
| Viabilidad de datos | 4 | Alta si se restringe a conceptos estables y se evitan cifras volátiles de tarifas. |
| Mantención (inverso) | 4 | Baja si el pilar evita comparador en vivo; revisión anual ligera. |
| **Promedio** | **4.33** | |

## Veredicto

| Campo | Valor |
|---|---|
| Decisión | **PROCEDER A BRIEF** |
| Prioridad relativa | **Alta** — primer candidato, por encima de `finanzas-para-migrantes-chile`. |
| Alcance aprobado | Pilar educativo `bancos-fintech` + spokes de cuenta básica (qué es, cómo abrir, banco vs fintech, comisiones explicadas). |
| Alcance diferido | Comparador de tarifas/productos **en vivo** (volatilidad de datos + neutralidad/monetización sin resolver). |
| Próximo paso | Redactar `01-brief.yaml` para el pilar; registrar `canonicalTopic` solo al decidir owner (fuera de Gate 00). |

## Notas

El comparador en vivo queda en HOLD junto con la comparativa Fintual/Racional hasta
tener política de monetización/neutralidad (ver `TOPIC_INTAKE_POLICY.md`, calibración 3).
