Status: DRAFT — pending ComplianceAgent review

Role: MathAuditAgent (Claude Code — fresh session, adversarial, sustituto de ChatGPT por indisponibilidad de herramienta, aprobado por editor humano 2026-08-12; ronda 2, re-auditoría post-corrección APV)

# Math Audit — Ronda 2 — rentas-mixtas-sueldo-honorarios (run 20260812-1345-lote0b)

## Nota de desviación de rol

El pipeline canónico (`context/EDITORIAL_AI_PIPELINE.md` §8, Etapa 05) asigna
`MathAuditAgent` a ChatGPT. Esta sesión usa Claude Code como sustituto porque
no hay acceso a ChatGPT en este entorno. Sustitución aprobada explícitamente
por el editor humano el 2026-08-12 — el mismo acuerdo usado en el math audit
original de este run (`05-math-audit.md`). Esta sesión es fresca: no tuvo
exposición a ninguna sesión previa de este pipeline (draft, math audit
ronda 1, ni las dos rondas de compliance).

## Por qué existe esta ronda 2

`05-math-audit.md` (ronda 1) terminó en veredicto **FAIL** por un hallazgo
fuera de alcance del brief original: inversión de las etiquetas Régimen
A/Régimen B del bloque APV, más una descripción incorrecta del mecanismo del
bono del 15% (lo describía como crédito en el F22 en vez de depósito directo
de la Tesorería General de la República). Después de ese FAIL, una sesión de
`DraftAgent` corrigió el bloque APV, y dos sesiones de `ComplianceAgent`
verificaron esa corrección (más un segundo hallazgo, el deferral de
"facilidades de pago") de forma independiente, con veredictos `CONDITIONAL`.
Ninguna de esas sesiones de compliance tiene autoridad para convertir un
`FAIL` de math audit en un veredicto aprobado — eso requiere un
`MathAuditAgent` fresco. Esta ronda 2 cierra esa brecha de proceso, señalada
correctamente por un bot revisor en el PR #423.

## Alcance de esta auditoría

Se re-auditó de forma adversarial y completamente independiente **toda**
cifra numérica del archivo publicado `src/data/blog/rentas-mixtas-sueldo-honorarios.md`
en su estado actual (post-fix APV, post-fix deferral de facilidades de
pago), no solo el bloque APV que motivó esta ronda. Para cada claim se
refetcheó la fuente oficial de forma independiente (`WebFetch`, `WebSearch`,
y `scrapling` como fallback cuando `WebFetch` fue bloqueado con HTTP 403),
sin apoyarse en las citas ya usadas por `05-math-audit.md` (ronda 1),
`06-compliance.md` ni `06-compliance-round2.md`, y se recalculó
aritméticamente cuando correspondía.

## Tabla de auditoría

| # | Claim | Fuente | Resultado de mi recálculo/refetch independiente | Estado |
|---|---|---|---|---|
| 1 | 1 UTA (dic. 2025) = $834.504; tramo exento IGC = 13,5 UTA = **$11.265.804** | SII — Información AT2026 Personas Naturales (`sii.cl/valores_y_fechas/renta/2026/personas_naturales.html`) | Refetch propio (`WebFetch`, esta sesión) confirma literalmente ambos valores. Recálculo aritmético propio: 834.504 × 13,5 = 11.265.804 exacto, sin redondeo. Coincide con las dos apariciones en el artículo (línea 55 FAQ, línea 73 cuerpo). | VERIFIED |
| 2 | Retención boletas de honorarios 15,25% vigente para 2026 (pasa de 14,5% en 2025) | SII — Boletas de honorarios (`sii.cl/destacados/boletas_honorarios/`) | Refetch independiente confirma "a partir del 1 de enero de 2026 el porcentaje de retención pasa de 14,5% a 15,25%". Escalonamiento completo confirmado (14,5% 2025 → 15,25% 2026 → 16% 2027 → meta final 17% 2028), aunque el artículo solo cita el valor 2026 — consistente, no es un claim incompleto porque el artículo no afirma el escalonamiento completo. | VERIFIED |
| 3 | Tabla mensual Impuesto Único 2ª Categoría enero 2026 (base para los tramos anuales del Art. 52 LIR): límites en UTM 13,5/30/50/70/90/120/310 | SII — Impuesto 2ª Categoría 2026 (`sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm`) | Refetch propio de la tabla oficial completa (Desde/Hasta/Factor/Cantidad a rebajar). Derivé 1 UTM enero 2026 = 941.638,50 ÷ 13,5 = 69.751,74 y confirmé que cada límite superior de la tabla, dividido por ese valor, reproduce exactamente 30 / 50 / 70 / 90 / 120 / 310, sin partir del número que aparece en el artículo. | VERIFIED |
| 4 | Tasas marginales por tramo: 4% / 8% / 13,5% / 23% / 30,4% / 35% / 40% | Misma fuente | Los 7 factores oficiales (0,04/0,08/0,135/0,23/0,304/0,35/0,4) coinciden exactamente y en el mismo orden. | VERIFIED |
| 5 | Tasas efectivas máximas por tramo: 2,2% / 4,5% / 7,1% / 10,6% / 15,6% / 27,5% (más de 27,5% en el último tramo) | Derivación propia a partir de la tabla oficial | Recalculé `(factor × límite_superior − cantidad_a_rebajar) / límite_superior` para cada tramo con los valores oficiales exactos: 2,20% / 4,52%≈4,5% / 7,08%≈7,1% / 10,62%≈10,6% / 15,57%≈15,6% / 27,48%≈27,5%. Los 6 valores coinciden con el artículo, y "más de 27,5%" para el último tramo es consistente (27,48% es el límite inferior de ese tramo, la tasa efectiva sigue subiendo asintóticamente hacia 40%). | VERIFIED |
| 6 | Calendario Operación Renta AT2026: con pago vence 30 de abril de 2026; sin pago (con devolución) vence 8 de mayo de 2026 | SII — comunicado 31-03-2026 (`sii.cl/noticias/2026/310326noti01pcr.htm`) | Refetch independiente confirma ambas fechas límite. | VERIFIED |
| 7 | Tabla de depósito de devolución AT2026: declaración 1-8 abril → depósito 29 abril; 9-23 abril → 15 mayo; 24 abril-8 mayo → 27 mayo | Misma fuente | Refetch independiente confirma las 3 filas exactas (columna transferencia directa). Coincide con el artículo. | VERIFIED |
| 8 | **APV Régimen A:** bonificación estatal del 15% de los aportes, tope 6 UTM anuales, depositada directamente por la Tesorería General de la República en la cuenta de ahorro previsional; **no** es crédito en el F22 (líneas ~144 y ~197 del archivo publicado) | SII — Preguntas frecuentes art. 42 bis LIR (`sii.cl/preguntas_frecuentes/declaracion_renta/001_140_5883.htm`); Superintendencia de Pensiones, Compendio Cap. XI "Tributación y Bonificación" (`spensiones.cl/portal/compendio/596/w3-propertyvalue-2929.html`) | Refetch propio de ambas fuentes oficiales, sin depender de las citas de `05-math-audit.md` ronda 1 ni de `06-compliance.md`. SII confirma textualmente: letra a) del art. 20 L DL 3.500 = "el trabajador no obtiene deducción en la base imponible al hacer aportes" (sin rebaja inmediata) — corresponde al Régimen A. Superintendencia de Pensiones confirma independientemente: bono fiscal 15%, tope 6 UTM, "la bonificación será depositada por la Tesorería... en la cuenta individual de ahorro previsional"; confirma también, sin ambigüedad, la nomenclatura "Régimen A (letra a)" = no deducible al aportar, elegible para el bono estatal. Ningún mecanismo de crédito en el F22 aparece en ninguna de las dos fuentes para este régimen. El texto publicado es correcto en etiqueta y en mecanismo. | VERIFIED |
| 9 | **APV Régimen B:** el aporte reduce la base imponible del IGC al momento de aportar, tope 600 UF anuales (líneas ~144 y ~198) | SII — misma fuente de preguntas frecuentes; Superintendencia de Pensiones, vía búsqueda independiente sobre topes conjuntos APV (600 UF anuales / 50 UF mensuales si es por planilla) | SII confirma textualmente: letra b) del art. 20 L DL 3.500 = "el trabajador sí deduce los aportes de su base imponible al depositarlos" — corresponde al Régimen B, tal como está etiquetado en el artículo. Verificación independiente adicional (búsqueda web, múltiples fuentes convergentes incluyendo referencias directas a Superintendencia de Pensiones) confirma el tope de 600 UF anuales (50 UF mensuales si el aporte es por descuento de planilla), aplicado de forma conjunta a todos los APV de la persona. El artículo cita correctamente el tope anual (600 UF); no menciona el sub-tope mensual (50 UF), pero eso es una omisión de detalle adicional, no un error — 600 UF anuales es el valor correcto y no contradice la fuente. | VERIFIED |
| 10 | "Genera o aumenta una devolución" atribuido exclusivamente a Régimen B, con Régimen A explícitamente excluido de ese efecto ("El Régimen A no participa de este cálculo", línea 144) | Coherencia interna del artículo, contrastada contra el mecanismo confirmado en las filas 8 y 9 | Verificación de coherencia: solo el Régimen B reduce la base imponible del IGC y por tanto solo Régimen B puede aumentar una devolución calculada en el F22. El bono de Régimen A se paga aparte (depósito TGR) y no altera el impuesto determinado del F22, tal como el artículo lo describe correctamente ("no reduce tu base imponible ni aparece como crédito en el F22"). El acotamiento está bien hecho: no hay generalización incorrecta a "el APV" como bloque único. | VERIFIED |
| 11 | Convenio de pago TGR (fuera de alcance de APV, checked por completitud): hasta 24 cuotas, pie entre 10% y 30%, deuda mínima 1 UTM | TGR — Convenios de pago (`tgr.gob.cl/convenios-de-pago/`) | `WebFetch` directo devolvió HTTP 403 (igual que reportó `06-compliance-round2.md`). Fallback con `scrapling extract get --impersonate chrome` (esta sesión) obtuvo 200 OK; `grep` sobre el HTML crudo descargado confirma literalmente "Plazo hasta 24 cuotas (de acuerdo al comportamiento de pago)", "Pie entre un 10% y un 30% (de acuerdo al comportamiento de pago, si tiene o no garantía)" y "Con un mínimo de 1 UTM puedes solicitar un convenio de pago en cuotas mensuales." Coincide exactamente con el texto publicado (línea 220). | VERIFIED |
| 12 | Certificado de remuneraciones del empleador disponible "antes de fin de marzo" (línea 153) | Búsqueda independiente sobre plazo DJ 1887 AT2026 | La Declaración Jurada 1887 (remuneraciones) para el ciclo AT2026 tuvo plazo de presentación el 27 de marzo de 2026 (Resolución SII N° 123, 25-09-2025), consistente con la afirmación general "antes de fin de marzo". No es una cifra central del cálculo, se verifica por completitud del alcance ("toda cifra"). | VERIFIED |

## Resumen

- Total de claims auditados: **12**
- VERIFIED: **12**
- TODO:SOURCE: **0**
- ERROR: **0**

## Foco especial: bloque APV (motivo de esta ronda 2)

El hallazgo que produjo el `FAIL` de la ronda 1 (`05-math-audit.md`, fila 9)
tenía dos defectos independientes: (a) etiquetas Régimen A/Régimen B
invertidas, y (b) descripción incorrecta del mecanismo del bono de Régimen A
(descrito como crédito en el F22 en vez de depósito directo de TGR).

Mi refetch independiente de esta ronda (filas 8-10 de la tabla, con fuentes
primarias — SII preguntas frecuentes art. 42 bis LIR y Superintendencia de
Pensiones Compendio Cap. XI, más una corroboración adicional por búsqueda
web sobre el tope conjunto de 600 UF) confirma que **ambos defectos están
corregidos** en el texto actualmente publicado:

- Régimen A = bono estatal 15%, tope 6 UTM anuales, depositado directamente
  por la Tesorería General de la República en la cuenta de ahorro
  previsional del trabajador — **no** pasa por el F22 como crédito. Coincide
  con letra a) del art. 20 L DL 3.500 según fuente SII.
- Régimen B = rebaja de la base imponible del IGC al momento de aportar,
  tope 600 UF anuales. Coincide con letra b) del art. 20 L DL 3.500 según
  fuente SII.
- La afirmación "genera o aumenta una devolución" está correctamente
  acotada solo al Régimen B, con exclusión explícita del Régimen A en el
  mismo párrafo.

No encontré ninguna discrepancia nueva entre el texto publicado y las
fuentes oficiales primarias que refetcheé de forma independiente en esta
sesión.

## Veredicto

**PASS**

Los 12 claims numéricos auditados en el estado actual de
`src/data/blog/rentas-mixtas-sueldo-honorarios.md` están **VERIFIED** contra
fuente oficial primaria mediante refetch independiente de esta sesión, sin
ningún hallazgo `ERROR` ni `TODO:SOURCE`. El defecto que causó el `FAIL` de
`05-math-audit.md` (ronda 1) — inversión de etiquetas Régimen A/B y
mecanismo del bono mal descrito — está confirmado como corregido de forma
independiente por este `MathAuditAgent` fresco, no solo por las sesiones de
`ComplianceAgent` que lo revisaron previamente (que no tienen autoridad para
cerrar un veredicto de math audit).

Este veredicto `PASS` reemplaza, para efectos de la etapa 05 del pipeline,
el veredicto `FAIL` de `05-math-audit.md` (ronda 1), que se preserva sin
modificar como registro histórico. No implica que el resto del pipeline esté
cerrado: `06-compliance.md` y `06-compliance-round2.md` (veredictos
`CONDITIONAL`, no `PASS`) registran deuda no bloqueante fuera del alcance de
este audit matemático (deferral de facilidades de pago ya resuelto en
ronda 2 de compliance, y brechas estructurales de encabezados H2 — ninguna
de las dos es un defecto numérico). La firma humana y la revisión de
compliance de cierre siguen pendientes.

Hechos para `ComplianceAgent` (sesión de cierre, si se requiere una ronda
adicional): este archivo no marca ningún gate en `07-publish-packet.md` ni
declara el artículo publicable. El veredicto `PASS` de esta ronda 2 cubre
exclusivamente la etapa 05 (math audit); no sustituye la firma humana
requerida por `AGENTS.md` §2.8 para contenido YMYL.
