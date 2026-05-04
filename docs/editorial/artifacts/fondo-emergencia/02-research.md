# Gate 02 — Research Dossier: fondo-emergencia-chile

Status: DRAFT — pending MathAuditAgent review (ChatGPT, fresh session)
Role: ResearchAgent (Claude Code — Sprint 2B session, stage 02 only)
Slug objetivo: fondo-emergencia-chile
Fecha de recuperación: 2026-05-03
requires_calculation: false
regulatory_sensitivity: baja

---

## Official Sources

| # | Fuente | URL | Tipo | Estado |
|---|---|---|---|---|
| S1 | CMF Chile — Educación Financiera: Fondo de emergencia | https://www.cmfchile.cl/educa/621/w3-propertyvalue-48004.html | official_source | TODO:VERIFY_URL — confirmar que esta URL resuelve y es la sección vigente |
| S2 | CMF Chile — Educación Financiera: Instrumentos de ahorro | https://www.cmfchile.cl/educa/621/w3-channel.html | official_source | TODO:VERIFY_URL — navegar desde el portal de educación financiera CMF |
| S3 | Banco Central de Chile — Estadísticas e informes sobre ahorro de hogares | https://www.bcentral.cl/estadisticas | official_source | Referencia de contexto macroeconómico; no fuente de regla normativa |
| S4 | BancoEstado — Productos de ahorro con liquidez | https://www.bancoestado.cl/ | trusted_reference | Referencia de instrumentos; no endorsement de banco específico |
| S5 | Ley 19.628 y reglamento CMF sobre depósito a plazo — penalización por retiro anticipado | Circular CMF aplicable al DAP | official_source | TODO:VERIFY_URL — verificar número de circular vigente para DAP con penalización |

---

## Claims Catalogue

| # | Claim | Fuente | Estado | Notas |
|---|---|---|---|---|
| C1 | El rango recomendado de un fondo de emergencia es 3 a 6 meses de gastos esenciales | S1 (CMF educa) | TODO:SOURCE | Rango ampliamente usado en educación financiera; verificar si CMF Chile usa exactamente este rango o uno distinto |
| C2 | La cuenta vista entrega liquidez inmediata (retiro el mismo día) | S2/S4 | VERIFIED (operatoria bancaria estándar conocida) | Sin tasa relevante de interés |
| C3 | La cuenta de ahorro bancaria permite retiros inmediatos o con plazos muy cortos | S2/S4 | VERIFIED (operatoria estándar) | Puede tener límite de retiros sin costo |
| C4 | El Depósito a Plazo (DAP) tiene penalización por retiro anticipado | S5 | TODO:SOURCE | Verificar circular CMF aplicable; el mecanismo de penalización debe quedar explícito en el artículo |
| C5 | El fondo de emergencia NO es un instrumento de inversión y no debe quedar en fondos mutuos de renta variable | S1 (principio de liquidez) | VERIFIED (razonamiento de política, no claim numérico) | Principio derivado de la naturaleza del fondo: prioridad = disponibilidad, no rentabilidad |
| C6 | El artículo no recomienda un banco ni producto específico | — | VERIFIED (por restricción editorial, no claim factual) | Restricción del brief: sin naming comercial |
| C7 | "Gastos esenciales" = arriendo/dividendo, alimentación, salud, transporte, servicios básicos | — | VERIFIED (definición educativa estándar) | No existe definición legal normativa; es orientación educativa |

---

## Benchmark Observations

> Separados explícitamente como input estratégico, no como fuente de claims factuales.

- Competidores chilenos (sin nombrar) usan el rango "3–6 meses" como ancla; algunos mencionan "hasta 6" para ingresos variables.
- Algunos sitios regionalesincluyen una calculadora de "cuánto debo ahorrar". Monedario diferirá esto a Sprint 3 (`/calculadoras/presupuesto-mensual/`).
- La diferenciación local: énfasis en instrumentos chilenos con liquidez real (cuenta RUT BancoEstado como opción de bajo costo), sin recomendar productos comerciales.

---

## Open Research Questions (TODO:SOURCE)

| # | Claim | Acción requerida | Agente |
|---|---|---|---|
| R1 | C1 — ¿Usa CMF exactamente "3 a 6 meses" o un rango distinto? | Navegar https://www.cmfchile.cl/educa/ y verificar la sección sobre ahorro de emergencia | Human / ResearchAgent ChatGPT |
| R2 | C4 — Mecanismo exacto de penalización por retiro anticipado de DAP | Verificar circular CMF vigente sobre depósitos a plazo y documentar el tipo de penalización | Human / ResearchAgent ChatGPT |
| R3 | S1/S5 — Verificar que las URLs de CMF resuelven correctamente | Acceso manual a CMF educa | Human |

---

## Context Notes

- `requires_calculation: false` — no hay fórmulas ni cálculos normativos en este artículo.
- `regulatory_sensitivity: baja` — educación financiera básica; no hay beneficios estatales, no hay cálculos tributarios, no hay interpretación de ley laboral.
- Los TODO:SOURCE (C1, C4) deben resolverse antes de publicar. No son bloqueantes para drafting, pero sí para 07-publish-packet.
- Artículo debe incluir `Fecha de corte` visible en el cuerpo (`INVARIANT.EDITORIAL.CUT_OFF_DATE_REQUIRED`).
