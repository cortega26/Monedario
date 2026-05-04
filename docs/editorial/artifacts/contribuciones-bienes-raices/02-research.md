# Gate 02 — Research Dossier: contribuciones-bienes-raices-chile

Status: DRAFT — pending MathAuditAgent (ChatGPT)
Role: ResearchAgent (Claude Code — Sprint 2B)
Slug: contribuciones-bienes-raices-chile
Fecha: 2026-05-03
requires_calculation: true
regulatory_sensitivity: media-alta

---

## Official Sources

| # | Fuente | URL | Tipo | Estado |
|---|---|---|---|---|
| S1 | SII — Contribuciones de bienes raíces: tasas, avalúo y portal | https://www.sii.cl/contribuyentes/bienes_raices/ | official_source | TODO:VERIFY_URL |
| S2 | TGR — Portal de pago de contribuciones y calendario de cuotas 2026 | https://www.tgr.cl/contribuciones/ | official_source | TODO:VERIFY_URL — confirmar fechas exactas 2026 |
| S3 | BCN — DL 3.063 Ley de Rentas Municipales | https://www.bcn.cl/leychile/navegar?idNorma=7999 | official_source | TODO:VERIFY_URL |
| S4 | BCN — DFL-2 de 1959 (exenciones vivienda económica) | https://www.bcn.cl/leychile/navegar?idNorma=5365 | official_source | TODO:VERIFY_URL |
| S5 | SII — Exención adultos mayores y primera vivienda | https://www.sii.cl/ | official_source | TODO:SOURCE — verificar tope de avalúo y condiciones exactas de exención |

---

## Claims Catalogue

| # | Claim | Fuente | Estado | Notas |
|---|---|---|---|---|
| C1 | Tasa general bienes raíces no agrícolas: 1,2% del avalúo fiscal anual | S1 (SII) | TODO:SOURCE — verificar que no ha cambiado post-2024 | Tasa históricamente estable pero debe confirmarse |
| C2 | Tasa DFL-2 (vivienda económica): 1,0% | S1/S4 | TODO:SOURCE — verificar vigencia DFL-2 y condiciones de aplicación | DFL-2 tiene restricciones de beneficiario y superficie |
| C3 | Cuotas de pago: 4 cuotas anuales (abril, junio, septiembre, noviembre) — fechas exactas 2026 a confirmar | S2 (TGR) | TODO:SOURCE — verificar calendario exacto 2026 con TGR | Las fechas exactas varían ligeramente cada año |
| C4 | Exención primera vivienda: propietarios con avalúo bajo cierto tope están exentos o con descuento | S1/S5 (SII) | TODO:SOURCE — verificar tope de avalúo vigente y porcentaje de exención | Los tramos de exención se actualizan |
| C5 | Exención adultos mayores (65+): condiciones de reducción según avalúo y situación socioeconómica | S5 (SII) | TODO:SOURCE — verificar condiciones exactas y tope | Hay que verificar si aplica automáticamente o requiere trámite SII |
| C6 | Las contribuciones son gasto deducible en F22 para propietarios que arriendan el bien raíz | S1/SII (instrucción F22) | TODO:SOURCE — verificar instrucción SII sobre deducibilidad en caso de arrendamiento | Solo aplica para propietarios que arriendan; no aplica a primera vivienda habitada por el dueño |
| C7 | El avalúo fiscal es determinado por el SII y puede reclamarse mediante tasación | S1 (SII) | VERIFIED (proceso conocido — pending URL) | El proceso de reclamo de avalúo tiene plazo específico |

---

## Open Research Questions

| # | Acción | Bloqueante |
|---|---|---|
| R1 | Confirmar tasa 1,2% y 1,0% DFL-2 vigentes | Sí |
| R2 | Obtener calendario exacto de cuotas TGR 2026 | Sí — estacional; publicar antes de primera cuota |
| R3 | Verificar tope de exención primera vivienda y adultos mayores | Sí |
| R4 | Confirmar condiciones de deducibilidad en F22 para arrendamiento | Sí — relevante para sección F22 |
