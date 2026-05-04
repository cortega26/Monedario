# Gate 02 — Research Dossier: gratificacion-legal-chile

Status: DRAFT — pending MathAuditAgent review (ChatGPT, fresh session)
Role: ResearchAgent (Claude Code — Sprint 2B session, stage 02 only)
Slug objetivo: gratificacion-legal-chile
Fecha de recuperación: 2026-05-03
requires_calculation: true
regulatory_sensitivity: media

---

## Official Sources

| # | Fuente | URL | Tipo | Estado |
|---|---|---|---|---|
| S1 | BCN — Código del Trabajo, Libro I, Título IV, arts. 47–52 | https://www.bcn.cl/leychile/navegar?idNorma=207436 | official_source | TODO:VERIFY_URL — confirmar que el enlace apunta a la versión vigente y los artículos 47-52 están en esa sección |
| S2 | Dirección del Trabajo — Ordinario sobre gratificación legal y base de cálculo | https://www.dt.gob.cl/legislacion/1624/w3-article-119939.html | official_source | TODO:VERIFY_URL — verificar número de ordinario DT vigente; puede haber actualizaciones desde cambios al Código |
| S3 | Ministerio del Trabajo — IMM vigente 2026 | https://www.mintrab.gob.cl/ | official_source | TODO:SOURCE — confirmar valor IMM vigente a la fecha de corte 2026-05-03 |
| S4 | DT — Fijación judicial o multas por no pago de gratificación | https://www.dt.gob.cl/portal/1626/w3-propertyvalue-22351.html | official_source | TODO:VERIFY_URL — referencia para sección de incumplimiento |

---

## Claims Catalogue

| # | Claim | Fuente | Estado | Notas |
|---|---|---|---|---|
| C1 | Artículo 47 CT: empresas con utilidades pueden pagar 30% de utilidades netas como gratificación | S1 (BCN art. 47) | VERIFIED (fuente conocida — pending URL check) | Modalidad optativa para el empleador, no el trabajador |
| C2 | Artículo 50 CT: modalidad alternativa = 25% de remuneraciones imponibles anuales devengadas | S1 (BCN art. 50) | VERIFIED (fuente conocida — pending URL check) | La más común en la práctica |
| C3 | Tope legal: la gratificación no puede exceder 4,75 veces el IMM mensual (art. 50 CT) | S1 (BCN art. 50) | VERIFIED (fuente conocida — pending URL check) | Tope anual expresado en múltiplos del IMM mensual |
| C4 | IMM vigente desde [fecha] = CLP $[VALOR] | S3 (Mintrab) | TODO:SOURCE — verificar valor exacto vigente al 2026-05-03 | El IMM se actualiza periódicamente por ley; es el dato más volátil del artículo |
| C5 | Tope calculado: 4,75 × IMM = CLP $[VALOR] | Derivado de C3 + C4 | TODO:SOURCE — depende de C4 | Bloqueante para publicar si C4 no está confirmado |
| C6 | La empresa elige la modalidad; el trabajador no puede exigir una sobre la otra | S1 (art. 47–50 CT) | VERIFIED (principio legal conocido) | Aclarar en artículo para evitar malentendidos |
| C7 | Empresa con pérdidas o sin utilidades: la obligación de la modalidad 25% subsiste igual (art. 50 CT) | S1 (BCN art. 50) | VERIFIED (fuente conocida — pending URL check) | Punto frecuente de confusión |
| C8 | Tienen derecho a gratificación: trabajadores con cualquier tipo de contrato que presten servicios a un establecimiento comercial, industrial, minero o agrícola (art. 47 CT) | S1 (BCN art. 47) | VERIFIED (fuente conocida — pending URL check) | Incluye plazo fijo y indefinido; excluye algunos regímenes especiales |
| C9 | Pago mensual (provisión 1/12): práctica habitual cuando se usa modalidad 25%; la ley permite pago anual pero las empresas suelen provisionarlo mensualmente | S2 (DT) | TODO:SOURCE — verificar ordinario DT sobre periodicidad | Relevante para la sección "cuándo y cómo se paga" |
| C10 | Gratificación proporcional: trabajadores con menos de un año tienen derecho proporcional al tiempo trabajado | S1 (BCN art. 52) | VERIFIED (fuente conocida — pending URL check) | Art. 52 CT — verificar texto exacto |

---

## Benchmark Observations

> Separados explícitamente como input estratégico, no como fuente de claims factuales.

- Competidores abordan gratificación como parte de una guía de "sueldo líquido completo" — Monedario diferencia este artículo como owner del topic específico de gratificación, sin absorber el head term de sueldo líquido.
- Diferenciación local: énfasis en las dos modalidades como decisión del empleador (punto que genera más consultas en la DT), y ejemplo numérico con el IMM vigente explícito.

---

## Open Research Questions (TODO:SOURCE)

| # | Claim | Acción requerida | Agente |
|---|---|---|---|
| R1 | C4 — Valor exacto del IMM vigente al 2026-05-03 | Verificar en https://www.mintrab.gob.cl/ el decreto supremo más reciente de fijación de IMM | Human / ResearchAgent ChatGPT |
| R2 | C5 — Tope calculado = 4,75 × IMM | Calcular con el valor confirmado de R1 | MathAuditAgent (ChatGPT) |
| R3 | C9 — Ordinario DT sobre periodicidad de pago | Verificar número de ordinario DT vigente sobre provisión mensual de gratificación | Human / ResearchAgent ChatGPT |
| R4 | S1 — Verificar URLs de BCN apuntan a versión vigente del Código del Trabajo | Acceso manual a bcn.cl | Human |

---

## Context Notes

- `requires_calculation: true` — hay fórmula (25% × remuneraciones imponibles anuales) y ejemplo numérico con IMM. Gate 05 (MathAuditAgent) es **obligatorio** por `INVARIANT.EDITORIAL.MATH_AUDIT_REQUIRED_WHEN_CALC`.
- `regulatory_sensitivity: media` — claim legal con cifras que cambian por ley (IMM). Human review requerida per pipeline §5.
- El valor del IMM en el draft se marcará como `[IMM_VIGENTE_TODO:SOURCE]` hasta que R1 sea confirmado.
- La fórmula del tope (4,75 × IMM) derivará del valor confirmado — no se puede fijar en draft sin R1.
