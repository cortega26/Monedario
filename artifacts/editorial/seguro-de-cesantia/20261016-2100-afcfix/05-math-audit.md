# 05 — Auditoría matemática adversarial: seguro-de-cesantia

**Status: BLOCKED — FAIL (errores cuantitativos y valores sin validar).**
**Role:** MathAuditAgent — ChatGPT, sesión de revisión separada de la sesión redactora.
**Fecha de contraste:** 2026-10-17. **Objeto:** `src/data/blog/seguro-de-cesantia.md` en HEAD `b07601145adba5dd1d95f0db389d714d925a7f07`.
**Antecedentes revisados:** `01-brief.yaml`, `02-dossier.md`, `04-draft.md`, artículo íntegro, `docs/editorial/NORMA_YMYL.md` y fuentes primarias AFC leídas en esta revisión.
**Carácter:** dictamen adversarial sobre el borrador de la rama, NO autorización de publicar; no sustituye ComplianceAgent ni HumanEditor. Este agente no redactó la modificación editorial original.

## Matriz de claims cuantitativos

| Claim y ubicación | Cálculo o evidencia primaria | Estado | Acción |
| --- | --- | --- | --- |
| CIC: 10 cotizaciones indefinido/casa particular y 5 a plazo fijo/obra; respuesta rápida y requisitos | AFC requisitos: 10/5 desde afiliación o último cobro | VERIFIED (regla general) | Mantener; aclarar excepción de catástrofe |
| Definición de CIC: «Se financia con el 3% de tu remuneración imponible mensual» | AFC cotizaciones: 3% es **total del Seguro**, no de la CIC. Indefinido: CIC 0,6%+1,6%=2,2%; FCS 0,8%. Plazo fijo: CIC 2,8%, FCS 0,2%. Casa particular: CIC 2,2%, FCS 0,8% | **ERROR** | Reescribir definición: «El Seguro se financia con 3%; solo una fracción llega a la CIC según contrato» |
| Tabla de aportes: indefinido 0,6%+2,4%=3% | AFC cotizaciones: empleador 1,6% CIC+0,8% FCS=2,4%; trabajador 0,6% CIC; total 3% | VERIFIED | Mantener; preferir coma decimal coherente |
| Tabla de aportes: plazo fijo 0%+3%=3% | AFC: empleador 2,8% CIC+0,2% FCS=3% | VERIFIED | Mantener |
| Tabla de aportes: casa particular 0%+3%=3%; adicional 1,11% CAI | AFC: 2,2% CIC+0,8% FCS=3%; +1,11% CAI independiente (carga total empleador 4,11%) | VERIFIED | Mantener distinción: 4,11% es suma de Seguro + CAI, no todo Seguro |
| Tope imponible: «consulta afc.cl» sin valor 2026 | AFC cotizaciones: **135,2 UF desde remuneraciones de febrero de 2026** (enero 135,1 UF); valor oficial público. Norma YMYL §2.4 prohíbe diferir dato accesible | **ERROR (omisión cuantitativa)** | Publicar cifra con período y enlace oficial |
| FCS: 10 cotizaciones en 24 meses; tres últimas continuas mismo empleador | AFC requisitos, ambos tipos de contrato; cotizaciones FCS pagadas/registradas antes del fin | VERIFIED (regla general) | Especificar condición de registro/periodización |
| FCS «saldo insuficiente para los pagos que establece la ley» | AFC requisitos: no alcanza para cubrir **al menos 5 pagos** | TODO:SOURCE (umbral omitido en artículo, fuente disponible) | Precisar cinco pagos |
| Secuencia CIC meses 1 a 6+: 70%,60%,45%,40%,35%,30% | AFC beneficios: primer 70%; siguientes 60%,45%,40%,35%,30%. Promedio 10 remuneraciones indefinido / 5 plazo fijo. Serie decrece, no sumatoria de ingresos reales | VERIFIED | Mantener; recordar límite de saldo real |
| FCS 5 pagos regulares, con posibilidad excepcional de 2 adicionales | AFC beneficios: 5 regulares; hasta 2 adicionales ante desempleo elevado. AFC informaba condición activa al consultar | VERIFIED | Aclarar que los pagos adicionales requieren condiciones, no son automáticos siempre |
| Seguro de Lagunas 10,10% (2026) de cada pago | AFC beneficios y aviso reforma: 10% hasta julio 2025; 10,10% desde agosto 2025; 10,25% previsto para agosto 2027. Aporte no descontado del beneficio | VERIFIED | Mantener |
| «En 5 días hábiles AFC notifica» | No se localizó respaldo inequívoco de plazo fijo en fuentes AFC consultadas | TODO:SOURCE | Obtener URL oficial vigente o eliminar promesa temporal |
| «En los primeros 10 días corridos conserva fecha de primer pago» | No se localizó respaldo inequívoco en fuentes AFC consultadas | TODO:SOURCE | Obtener fuente oficial y condiciones o retirar afirmación |
| «Hasta 3 días hábiles antes del primer pago» para rectificar opción | AFC beneficios: se puede rectificar hasta 3 días hábiles antes del primer pago | VERIFIED | Mantener |
| Afiliación casa particular «desde 1 de octubre de 2020» | Fecha histórica no comprobada en fuentes consultadas en este pase | TODO:SOURCE | Contrastar norma/fecha oficial antes de certificar |

## Excepción de elegibilidad con cifras que falta en el texto

AFC informa que **en zonas cubiertas por declaración de catástrofe**, bajo las condiciones y períodos aplicables, los mínimos pueden bajar: CIC indefinido/casa particular **10→8**, CIC plazo fijo/obra **5→4**, FCS **10→8**; el requisito de tres cotizaciones continuas del FCS permanece. No presentar esta excepción como aplicable universalmente ni afirmar vigencia actual de un decreto específico sin verificarla.

## Reconciliación / evidencia

- Requisitos y FCS (incluida inscripción BNE): https://www.afc.cl/mi-seguro-de-cesantia/requisitos-y-documentos/
- CIC / FCS / escala de giros / 3 días / lagunas: https://www.afc.cl/mi-seguro-de-cesantia/beneficios/
- Distribución 3%, 1,11% y tope **135,2 UF**: https://www.afc.cl/empleadores/pagos-y-dudas-sobre-cotizaciones/cotizaciones-cuanto-y-como-se-paga/
- Calendario de tope enero/febrero 2026: https://www.afc.cl/afc-informa/noticias/empleador-conozca-el-nuevo-tope-imponible-para-2026/
- Ejemplo de beneficios excepcionales por catástrofe (2026): https://www.afc.cl/afc-informa/noticias/beneficios-en-estado-de-catastrofe-huasco-y-coquimbo/
- Reforma del Seguro de Lagunas: https://www.afc.cl/afc-informa/noticias/reforma-de-pensiones-asi-funcionara-el-seguro-de-lagunas-previsionales/

**Resumen:** 15 grupos de afirmaciones numéricas auditadas: **9 VERIFIED**, **4 TODO:SOURCE** (incluye el umbral FCS omitido aunque existe fuente oficial) y **2 ERROR**. Los grupos mixtos no son aprobaciones. El checklist de publicación permanece intacto.

**Verdict: FAIL.** Al menos dos errores de comunicación cuantitativa/omisión material y fuentes no resueltas. No marcar PASS ni permitir merge. Reauditar después de la corrección, registrar hashes/artefactos dependientes y ejecutar CI real.
