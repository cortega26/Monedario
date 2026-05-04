# Gate 02 — Research Dossier: pgu-pension-garantizada-universal

Status: DRAFT — pending MathAuditAgent (ChatGPT)
Role: ResearchAgent (Claude Code — Sprint 2B)
Slug: pgu-pension-garantizada-universal
Fecha: 2026-05-03
requires_calculation: true
regulatory_sensitivity: alta

---

## Official Sources

| # | Fuente | URL | Tipo | Estado |
|---|---|---|---|---|
| S1 | IPS — PGU: requisitos, monto y trámite | https://www.ips.gob.cl/servlet/internet/content/1421456739900/pgu | official_source | TODO:VERIFY_URL — verificar URL IPS sección PGU vigente |
| S2 | BCN — Ley 21.015 (Pensión Básica Solidaria, modificada por Ley 21.419 que crea la PGU) | https://www.bcn.cl/leychile/navegar?idNorma=1187765 | official_source | TODO:VERIFY_URL — confirmar ley que formalmente crea la PGU |
| S3 | Ministerio de Desarrollo Social — criterios de elegibilidad y percentil | https://www.chileatiende.gob.cl/fichas/76500-pension-garantizada-universal-pgu | official_source | TODO:VERIFY_URL — ChileAtiende como portal oficial |
| S4 | Superintendencia de Pensiones — interacción PGU con pensión AFP | https://www.spensiones.cl/ | official_source | TODO:SOURCE — verificar fórmula de complemento/reducción PGU según pensión base |

---

## Claims Catalogue

| # | Claim | Fuente | Estado | Notas |
|---|---|---|---|---|
| C1 | Monto PGU vigente al [FECHA_CORTE]: CLP $[MONTO_TODO:SOURCE] mensual | S1 (IPS) | TODO:SOURCE — verificar monto exacto vigente; se reajusta por ley | El monto más volátil y crítico del artículo |
| C2 | Requisito de edad: 65 años cumplidos | S2/S3 | VERIFIED (conocido — pending URL) | Aplica desde el mes del cumpleaños |
| C3 | Requisito de residencia: 20 años de residencia en Chile a partir de los 20 años de edad (mínimo) | S2/S3 | TODO:SOURCE — verificar texto exacto vigente de la ley; puede haber modificaciones | Dato sensible; citar texto legal exacto |
| C4 | Percentil de ingresos: el solicitante debe pertenecer al 90% de menores ingresos | S3 (Ministerio Desarrollo Social) | TODO:SOURCE — verificar si el percentil y el instrumento de medición siguen vigentes | El percentil puede haberse ampliado o modificado |
| C5 | La PGU se reduce si se tiene pensión AFP base superior a cierto umbral (fórmula de complemento) | S4 (Superpensiones) | TODO:SOURCE — verificar fórmula exacta de reducción; es la sección más compleja del artículo | Sin este dato no se puede explicar correctamente la interacción AFP-PGU |
| C6 | El trámite se realiza ante el IPS (Instituto de Previsión Social) | S1 (IPS) | VERIFIED (proceso conocido — pending URL) | IPS puede tramitar automáticamente al cumplir requisitos |
| C7 | Extranjeros residentes pueden acceder si cumplen el requisito de residencia | S2/S3 | TODO:SOURCE — verificar si el criterio de residencia es igual para extranjeros o tiene condiciones adicionales | Caso frecuente en consultas |

---

## Open Research Questions

| # | Acción | Bloqueante |
|---|---|---|
| R1 | Monto PGU exacto vigente | Sí — dato principal del artículo |
| R2 | Fórmula de complemento/reducción según pensión AFP | Sí — Gate 05 obligatorio |
| R3 | Texto exacto del requisito de residencia (20 años) | Sí — claim legal sensible |
| R4 | Percentil 90% vigente y cómo se acredita | Sí |

---

## Context Notes

- `regulatory_sensitivity: alta` — beneficio estatal con monto, requisitos y calendario de pagos. Requiere Gate 06 obligatorio con ComplianceAgent.
- `requires_calculation: true` — fórmula de interacción PGU/AFP.
- No prometer monto definitivo individual — cada caso lo resuelve el IPS.
- No recomendar AFP ni instrumento para maximizar PGU.
