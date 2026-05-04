# Gate 02 — Research Dossier: sueldo-imponible-chile

Status: DRAFT — pending MathAuditAgent review (ChatGPT, fresh session)
Role: ResearchAgent (Claude Code — Sprint 2B session, stage 02 only)
Slug objetivo: sueldo-imponible-chile
Fecha de recuperación: 2026-05-03
requires_calculation: true
regulatory_sensitivity: media

---

## Official Sources

| # | Fuente | URL | Tipo | Estado |
|---|---|---|---|---|
| S1 | BCN — Código del Trabajo, art. 41 (definición de remuneración imponible) | https://www.bcn.cl/leychile/navegar?idNorma=207436 | official_source | TODO:VERIFY_URL — confirmar artículo 41 en versión vigente |
| S2 | SII — Impuesto de Segunda Categoría: tramos y tasas vigentes | https://www.sii.cl/servicios_online/1039-1265.html | official_source | TODO:VERIFY_URL — verificar URL de tabla ISC vigente para año tributario actual |
| S3 | Superintendencia de Pensiones — límite máximo imponible para cotizaciones AFP | https://www.spensiones.cl/ | official_source | TODO:SOURCE — verificar valor exacto del tope UF vigente (referencia: ~87,1 UF) |
| S4 | DT — Remuneraciones excluidas de la base imponible (colación, movilización) | https://www.dt.gob.cl/ | official_source | TODO:VERIFY_URL — circular o dictamen DT sobre exclusiones de la base |
| S5 | SII — Crédito APV Modalidad A y base imponible ISC | https://www.sii.cl/ | official_source | TODO:VERIFY_URL — instrucción SII sobre efecto APV en base imponible ISC |

---

## Claims Catalogue

| # | Claim | Fuente | Estado | Notas |
|---|---|---|---|---|
| C1 | La remuneración imponible es la base sobre la que se calculan las cotizaciones previsionales (AFP, salud, AFC) e ISC (art. 41 CT) | S1 | VERIFIED (principio legal conocido — pending URL) | El art. 41 define "remuneración" incluyendo los componentes imponibles |
| C2 | Componentes NO imponibles: asignación de colación, asignación de movilización, asignación familiar, viáticos acreditados | S4 (DT) | VERIFIED (práctica conocida — pending ordinario DT) | Fundamento: no son remuneración en sentido estricto del art. 41 CT |
| C3 | Componentes SÍ imponibles: sueldo base, horas extras, bonos de producción, gratificación legal, comisiones | S1 (CT) | VERIFIED (fuente conocida — pending URL) | Incluye la gratificación provisionada mensualmente |
| C4 | Límite máximo imponible para cotizaciones AFP/AFC: ~87,1 UF mensuales | S3 (S. Pensiones) | TODO:SOURCE — verificar valor exacto UF vigente al 2026-05-03 | El tope se actualiza con la UF; es el dato más volátil del artículo |
| C5 | Tramos ISC vigentes para el año tributario: estructura de 7 tramos desde 0% hasta 40% (en UTM) | S2 (SII) | TODO:SOURCE — verificar tabla completa vigente en SII para 2026 | Los tramos se actualizan con la UTM; incluir tabla solo con fuente verificada |
| C6 | APV Modalidad A reduce la base imponible del ISC (hasta 50 UTM anuales o 600 UTM) | S5 (SII) | TODO:SOURCE — verificar tope UTM vigente y condiciones exactas | Relevante para sección de optimización de base imponible |
| C7 | La asignación familiar NO es imponible; el bono de asistencia SÍ puede ser imponible | S4 (DT) | TODO:SOURCE — verificar distinción exacta DT / SII | Punto de confusión frecuente en trabajadores |
| C8 | El sueldo imponible no es igual al sueldo bruto (puede ser menor si hay componentes excluidos) | S1/S4 | VERIFIED (derivado lógico de C1+C2) | Distinción clave del artículo |

---

## Benchmark Observations

> Separados como input estratégico; no son fuente de claims.

- Artículos de competidores mezclan "imponible" con "bruto" o con "líquido" — diferenciación explícita es el localDelta.
- La sección de APV como reductor de base imponible aparece poco en competidores; incluirla como ventaja editorial sin prometer resultado tributario exacto.

---

## Open Research Questions

| # | Claim | Acción | Agente |
|---|---|---|---|
| R1 | C4 — Límite máximo imponible UF exacto al 2026-05-03 | Verificar en Superintendencia de Pensiones | Human / ChatGPT |
| R2 | C5 — Tabla ISC vigente 2026 | Verificar en SII tabla de impuesto de segunda categoría | Human / ChatGPT |
| R3 | C6 — Tope APV Modalidad A vigente | Verificar en SII instrucción circular APV | Human / ChatGPT |
| R4 | C7 — Bono de asistencia vs asignación familiar: distinción exacta | Verificar ordinario DT o instrucción SII | Human |

---

## Context Notes

- `requires_calculation: true` — hay tramos ISC, límite UF y ejemplo numérico. Gate 05 obligatorio.
- `regulatory_sensitivity: media` — datos tributarios actualizables (UF, UTM, tramos ISC).
- El artículo es "puente" del cluster: define la base técnica sin replicar el cálculo completo de sueldo líquido (owner: `como-calcular-sueldo-liquido`).
- topicRole: `owner` — canonicalTopic `sueldo-imponible-base-descuentos` registrado en PRE-02.
