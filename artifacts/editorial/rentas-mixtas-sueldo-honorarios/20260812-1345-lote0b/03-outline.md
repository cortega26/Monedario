# Outline — rentas-mixtas-sueldo-honorarios (remediación Fase B)

## Respuesta ancla (articleLead.answer)

Regla permanente: quien tiene sueldo y boletas de honorarios en el mismo año
debe declarar Operación Renta obligatoriamente, porque el SII no puede
precalcular el impuesto (retenciones independientes por pagador). Estado del
ciclo AT2026: ventana ya cerrada (30-04-2026 con pago, 08-05-2026 sin pago);
puntero al checklist F22 para quien no alcanzó a declarar. Excepción: tramo
exento del IGC = $11.265.804 (13,5 UTA, dic-2025). Vigencia: regla permanente
+ cifras/calendario AT2026, revisado 2026-08-12. Fuentes: SII (información AT
2026 personas naturales, boletas de honorarios, calendario Operación Renta).

## Línea de diferenciación (no aplica adaptación competitiva)

Este run no usa benchmark externo. La diferenciación es frente a la versión
anterior del propio artículo: separa explícitamente la regla permanente de
declarar de la vigencia específica del ciclo AT2026, y corrige la cifra del
tramo exento a su valor oficial exacto. Ambos cambios son visibles sin scroll
(articleLead.answer + primer bloque del cuerpo).

## Secciones (cambios respecto de la versión publicada)

1. **Frontmatter — `articleLead.answer`.** Reescrito para separar regla
   permanente / estado del ciclo AT2026 / puntero de qué hacer si el plazo ya
   pasó. `validAsOf` movido a 2026-08-12.
2. **Frontmatter — FAQ "¿Puedo tener sueldo, boletas y aun así quedar exento
   del Global Complementario?".** Corrige el monto a $11.265.804, elimina
   "aproximadamente" (ya no es una aproximación).
3. **Cuerpo — H2 "Regla general: con rentas mixtas siempre debes declarar",
   bloque "Respuesta rápida (regla general)".** Se agrega un párrafo nuevo
   "Estado del ciclo AT2026" entre la regla y la excepción, con las fechas de
   cierre y el puntero al checklist F22. Se corrige el monto en "Excepción
   relevante". Se reescribe "Vigencia" para distinguir regla permanente de
   cifras del año tributario. Se agrega la fuente del calendario AT2026 a
   "Fuentes".
4. **Cuerpo — "Cuándo esperar devolución y cuándo pagar" (coherencia
   interna, NORMA §1.1 MUST #8).** El bloque "Respuesta rápida" ya declara
   cerrada la ventana AT2026, pero dos sub-secciones más abajo seguían
   presentando el mismo calendario en tiempo presente/futuro, lo que crea
   una contradicción interna del mismo tipo que motivó el hallazgo R2:
   - `### Si te corresponde devolución`: la frase de apertura de la tabla de
     depósito ("Los plazos típicos para AT 2026:") se reencuadra a "Este fue
     el calendario de depósito del ciclo AT2026 (ya ejecutado):". La tabla
     (filas de fecha de declaración / depósito, cifra verificada R5) no se
     modifica.
   - `### Si debes pagar impuesto adicional`: "El plazo... es hasta el 30 de
     abril de 2026" (presente) se reescribe en pasado: "En el ciclo AT2026,
     el plazo... venció el 30 de abril de 2026." El párrafo siguiente sobre
     facilidades de pago (deferral Bucket B) no se toca.
   Resto de las secciones (cálculo del Global Complementario, tramos del
   Art. 52 LIR, paso a paso para declarar, casos frecuentes) sin cambio de
   contenido: son atemporales o no contienen fechas de la ventana AT2026.
5. **Frontmatter — `articleLead.officialSources`.** Se agrega un tercer
   entry (SII, calendario Operación Renta AT2026) que sustenta las fechas
   de cierre de ventana introducidas en `articleLead.answer`.
6. **Frontmatter — `updatedDate`.** `2026-05-11T00:00:00Z` →
   `2026-08-12T00:00:00Z`, con registro NORMA §5.3 en `07-publish-packet.md`.

## Elementos que NO cambian

- Slug, title, seoTitle, H1, rutas, canonical.
- La retención 15,25% de boletas y la tabla de tramos porcentuales del Art.
  52 LIR.
- Las dos tablas "Resumen orientativo" (estructura y contenido; no contienen
  la cifra corregida).
- El deferral de "facilidades de pago... consulta en sii.cl" (línea ~216).
- Estructura de encabezados (H2 faltantes de R7b no se remedian aquí).
