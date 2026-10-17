# 05 — Auditoría matemática adversarial: seguro-cesantia-cuenta-individual-vs-fondo-solidario

**Status: BLOCKED — FAIL (umbral financiero omitido y afirmaciones cuantitativas inexactas).**
**Role:** MathAuditAgent — ChatGPT, sesión de revisión separada de la sesión redactora.
**Fecha de contraste:** 2026-10-17. **Objeto:** `src/data/blog/seguro-cesantia-cuenta-individual-vs-fondo-solidario.md` en HEAD `b07601145adba5dd1d95f0db389d714d925a7f07`.
**Insumos:** `01-brief.yaml`, `02-dossier.md`, `04-draft.md`, artículo íntegro, NORMA_YMYL y AFC. No sustituye auditoría de ComplianceAgent de Claude Code ni aprobación HumanEditor.

## Matriz de claims cuantitativos

| Claim y ubicación | Comprobación independiente / fuente | Estado | Acción |
| --- | --- | --- | --- |
| Mínimos CIC indefinido/casa particular 10 y plazo fijo/obra 5 | AFC requisitos: 10/5, desde afiliación/último cobro | VERIFIED (regla general) | Incorporar nota de excepción por catástrofe |
| Requisito FCS 10 cotizaciones/24 meses, 3 últimas continuas mismo empleador | AFC requisitos: 10 pagadas en últimos 24 meses, 3 últimas continuas con mismo empleador; plazos fijos con registro previo a término | VERIFIED (regla general) | Aclarar alcance y obligación de registro |
| «Si tu saldo individual alcanza para financiar los pagos ... AFC ni lo evalúa» | AFC: FCS solo puede complementar si CIC no cubre **al menos cinco pagos**, y la persona debe optar al fondo; no respalda la aseveración tajante sobre proceso interno «ni lo evalúa» | **ERROR** | Sustituir por condición exacta de cinco pagos y elección, sin especular sobre evaluación administrativa |
| Filtro FCS «CIC insuficiente para los pagos del seguro» | Falta el umbral calculable oficial de **cinco pagos** | **ERROR (omisión material)** | Incluir regla precisa y fuente AFC |
| Cotización indefinido: 0,6% trabajador + 1,6% empleador CIC + 0,8% empleador FCS = 3% | Suma 0,6+1,6+0,8=3,0; CIC 2,2; FCS 0,8. AFC cotizaciones | VERIFIED | Mantener |
| Cotización plazo fijo: 2,8% CIC+0,2% FCS=3% (empleador 100%) | Suma 2,8+0,2=3,0; trabajador 0. AFC cotizaciones | VERIFIED | Mantener |
| Serie de pagos CIC en FAQ: 70%,60%,45%,40%,35%,30% | AFC beneficios confirma secuencia y promedio de últimas 10 remuneraciones indefinidos o 5 plazo fijo | VERIFIED | Mantener; explicar que saldo real limita pagos |
| Frase «si tuviste dos empleadores distintos en los últimos 3 meses ... no se cumple continuidad» | Regla legal se refiere a **las 3 últimas cotizaciones continuas**, no necesariamente a cada uno de los últimos tres meses calendario; caso ilustrativo podría inducir error | TODO:SOURCE | Reformular sobre últimas 3 cotizaciones y el mismo empleador, sin equiparar directamente a 3 meses calendarios |
| Pagos FCS «tienen topes mínimos y máximos distintos según contrato» | AFC beneficios confirma tablas diferenciadas; para indefinido/casa particular primer giro 70%, para plazo fijo primer giro 60%; esta distinción numérica no aparece en artículo | VERIFIED (texto parcial) | Añadir regla orientativa y valores vigentes cuando se expongan tablas, distinguir FCS de CIC |
| Mínimos especiales en zonas de catástrofe (no cubiertos por el texto) | AFC 2026 describe CIC 8/4 y FCS 8 en determinadas zonas/períodos | TODO:SOURCE (omisión importante) | Añadir excepción delimitada por decreto/territorio y enlaces |

## Findings normativos observados por MathAuditAgent (fuera del score ComplianceAgent)

- Se omite que la inscripción en la Bolsa Nacional de Empleo es una condición adicional del FCS y que AFC exige activar su cuenta en plazo; fuente AFC requisitos.
- Se omiten causales de la Ley 21.109 para asistentes de la educación, listadas por AFC, cuando el texto presenta una lista categórica completa de causales habilitantes. Revisar alcance.
- «Primero la CIC» describe fuente de pagos, no opción elegida por titular; evitar sugerir que la AFC decide por el trabajador sin su opción.
- La fórmula «FCS no entra si tu CIC alcanza» carece de magnitud y puede inducir expectativas equivocadas.

## Fuentes primarias leídas el 17-10-2026

1. https://www.afc.cl/mi-seguro-de-cesantia/requisitos-y-documentos/
2. https://www.afc.cl/mi-seguro-de-cesantia/beneficios/
3. https://www.afc.cl/empleadores/pagos-y-dudas-sobre-cotizaciones/cotizaciones-cuanto-y-como-se-paga/
4. https://www.afc.cl/afc-informa/noticias/beneficios-en-estado-de-catastrofe-huasco-y-coquimbo/
5. https://www.afc.cl/afc-informa/noticias/reforma-de-pensiones-asi-funcionara-el-seguro-de-lagunas-previsionales/

**Resumen:** 10 grupos cuantitativos examinados; **6 VERIFIED**, **2 TODO:SOURCE** (matiz temporal y excepción), **2 ERROR**. Criterio conservador ante falta de fuente de precisión; no se contabiliza como conformidad jurídica.

**Verdict: FAIL.** Hay errores/omisiones materialmente relevantes para decisión del lector. Preservar draft, registrar y corregir sin inventar aprobación; requiere reauditoría y ComplianceAgent genuinamente independiente.
