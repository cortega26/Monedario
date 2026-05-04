# Gate 02 — Research Dossier: impuesto-global-complementario-chile

Status: DRAFT — pending MathAuditAgent (ChatGPT)
Role: ResearchAgent (Claude Code — Sprint 2B)
Slug: impuesto-global-complementario-chile
Fecha: 2026-05-03
requires_calculation: true
regulatory_sensitivity: alta

---

## Official Sources

| # | Fuente | URL | Tipo | Estado |
|---|---|---|---|---|
| S1 | SII — IGC: tramos, tasas y formulario F22 | https://www.sii.cl/contribuyentes/renta/igc/ | official_source | TODO:VERIFY_URL — verificar URL sección IGC en SII |
| S2 | BCN — Ley de Impuesto a la Renta, arts. 52–57 (IGC) | https://www.bcn.cl/leychile/navegar?idNorma=8657 | official_source | TODO:VERIFY_URL — confirmar artículos del IGC en versión vigente |
| S3 | SII — UTA vigente para año tributario actual | https://www.sii.cl/valores_y_fechas/uta/uta2026.htm | official_source | TODO:VERIFY_URL + TODO:SOURCE — verificar UTA vigente 2026 |
| S4 | SII — Instrucciones F22 (año tributario correspondiente) | https://www.sii.cl/declaraciones_juradas/declaracion_renta/instrucciones_f22.html | official_source | TODO:VERIFY_URL |

---

## Claims Catalogue

| # | Claim | Fuente | Estado | Notas |
|---|---|---|---|---|
| C1 | El IGC grava la totalidad de las rentas anuales de personas naturales domiciliadas en Chile (arts. 52–57 LIR) | S2 (BCN) | VERIFIED (principio legal conocido — pending URL) | Suma todos los tipos de renta del año |
| C2 | El IGC aplica cuando la renta global anual supera el primer tramo exento (expresado en UTA) | S1/S2 | TODO:SOURCE — verificar umbral exacto en UTA vigente | La mayoría de trabajadores con solo sueldo no lo paga directamente (ya cubierto por ISC) |
| C3 | Los tramos del IGC son 7, desde 0% hasta 40%, expresados en UTA | S1 (SII) | TODO:SOURCE — verificar tabla completa con valores UTA 2026 | Tabla cambia cada año tributario |
| C4 | UTA 2026 = CLP $[VALOR_TODO:SOURCE] | S3 (SII) | TODO:SOURCE — verificar valor exacto UTA 2026 | UTA = 12 × UTM; UTM varía mensualmente |
| C5 | El ISC retenido mensualmente es crédito contra el IGC | S1/S2 | VERIFIED (mecanismo legal conocido) | El ISC ya pagado se descuenta del IGC final |
| C6 | Las retenciones de boleta de honorarios son crédito contra el IGC | S1/S2 | VERIFIED (mecanismo conocido — pending URL) | Tasa de retención 2026 a verificar |
| C7 | El APV Modalidad A genera crédito tributario; el Modalidad B reduce la base del IGC | S4 (SII instrucción F22) | TODO:SOURCE — verificar distinción exacta Modalidad A vs B en IGC | Las condiciones exactas dependen de las instrucciones SII vigentes |
| C8 | Contribuciones de bienes raíces son crédito deducible del IGC para arrendadores | S4 (SII) | TODO:SOURCE — verificar condiciones exactas y límite | Detallar sin expandir head term de contribuciones |
| C9 | Ganancias de capital: out of scope en esta versión del artículo (complejidad excesiva) | — | DECISIÓN EDITORIAL | Mencionadas como excluidas, con enlace futuro |

---

## Open Research Questions

| # | Acción | Bloqueante |
|---|---|---|
| R1 | Tabla completa de tramos IGC en UTA vigente 2026 | Sí — corazón del artículo |
| R2 | Valor UTA 2026 exacto | Sí — todos los tramos expresados en UTA dependen de este valor |
| R3 | Distinción APV Modalidad A vs B en contexto IGC | Sí |
| R4 | Tasa retención honorarios 2026 | Alta |

---

## Context Notes

- `regulatory_sensitivity: alta` — tramos y tasas anuales que cambian. Requiere ComplianceAgent obligatorio.
- `requires_calculation: true` — tablas UTA, créditos y ejemplo numérico.
- Ganancias de capital: excluidas explícitamente del scope de esta versión del artículo.
- El artículo es owner del topic IGC; el F22 es el vehículo pero el head term del F22 pertenece a `operacion-renta-f22-checklist`.
