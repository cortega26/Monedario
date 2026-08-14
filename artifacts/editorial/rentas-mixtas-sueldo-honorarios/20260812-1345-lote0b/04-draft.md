# Draft — rentas-mixtas-sueldo-honorarios (remediación Fase B, lote 0)

Fecha de corte de este draft: **2026-08-12**.

## Respuesta rápida (regla general) — texto aplicado

Quien percibe sueldo _y_ emite boletas de honorarios en el mismo año **debe
declarar** Operación Renta (F22) obligatoriamente. Esta es una regla
permanente: aplica a quien cumpla ese criterio en cualquier año tributario,
no solo en 2026. El SII puede generar una propuesta, pero esa propuesta no
incluye automáticamente tus boletas de honorarios, porque cada pagador
retiene de forma independiente sin conocer tus otras fuentes de ingreso.

**Estado del ciclo AT2026:** la ventana de declaración para ingresos de 2025
ya cerró: 30 de abril de 2026 (declaraciones con pago) y 8 de mayo de 2026
(sin pago, con devolución). Si tuviste rentas mixtas en 2025, esta guía te
sirve igual para entender el cálculo, hayas declarado o no. Si no alcanzaste
a declarar dentro de plazo, revisa el checklist de Operación Renta F22 para
tus opciones fuera de ventana; el próximo ciclo (AT2027) aún no tiene
calendario publicado por el SII.

**Excepción relevante:** Si el total de tus ingresos anuales (sueldo +
honorarios brutos) no supera el tramo exento del Global Complementario
($11.265.804 anuales para AT 2026, equivalente a 13,5 UTA), no generarás
impuesto adicional. Aun así, **la obligación de declarar subsiste**.

**Vigencia:** La obligación de declarar con rentas mixtas es permanente. Las
cifras y el calendario de esta página corresponden al Año Tributario 2026
(ingresos enero–diciembre 2025), revisado el 2026-08-12.

**Fuentes:** SII — Boletas de honorarios; SII — Información AT 2026 Personas
Naturales; SII — Calendario Operación Renta AT2026.

Este texto es la base de `articleLead.answer` (versión resumida en
frontmatter) y del bloque "Respuesta rápida" en el cuerpo del blog file.

## Cambios aplicados al blog file (diff conceptual)

1. **Frontmatter — `updatedDate`:** `2026-05-11T00:00:00Z` →
   `2026-08-12T00:00:00Z`.
2. **Frontmatter — `articleLead.answer`:** reescrito para separar la regla
   permanente de declarar del estado del ciclo AT2026 (ventana cerrada) y
   agregar puntero al checklist F22 para quien no alcanzó a declarar. Antes
   decía "debes declarar Operación Renta 2026 obligatoriamente" en
   presente/imperativo sin marco temporal.
3. **Frontmatter — `articleLead.validAsOf`:** `2026-05-11` → `2026-08-12`.
4. **Frontmatter — FAQ "¿Puedo tener sueldo, boletas y aun así quedar exento
   del Global Complementario?" (línea 53 de la versión previa):** monto
   corregido de "aproximadamente $11.322.018" a "$11.265.804" (sin
   "aproximadamente": es el valor exacto). Fórmula (13,5 UTA) sin cambios.
5. **Cuerpo — bloque "Respuesta rápida (regla general)" (líneas 67-73 de la
   versión previa):**
   - Párrafo de regla general reescrito con el mismo mecanismo, marcado
     explícitamente como regla permanente.
   - Párrafo nuevo "Estado del ciclo AT2026" insertado entre la regla y la
     excepción: fechas de cierre de ventana (30-04-2026 con pago, 08-05-2026
     sin pago), puntero al checklist F22, nota de que AT2027 aún no tiene
     calendario publicado.
   - "Excepción relevante": monto corregido de "~$11.322.018" a
     "$11.265.804" (se retira el símbolo "~" porque ya no es aproximado).
   - "Vigencia": reescrita para distinguir la regla permanente de las cifras
     y calendario específicos de AT2026 (antes decía "vigente a 2026-04-09"
     sin distinguir regla de cifras).
   - "Fuentes": se agrega la fuente del calendario Operación Renta AT2026
     (comunicado SII 31-03-2026) que sustenta el párrafo nuevo.
6. **Frontmatter — `articleLead.officialSources`:** se agrega un tercer
   entry "SII — Calendario Operación Renta AT2026"
   (`https://www.sii.cl/noticias/2026/310326noti01pcr.htm`). El
   `articleLead.answer` reescrito ahora afirma fechas de cierre de ventana
   que no estaban sustentadas por ninguna de las dos fuentes previas.
7. **Cuerpo — coherencia interna (NORMA §1.1 MUST #8), dos correcciones
   adicionales detectadas en revisión de consistencia post-edición:** el
   bloque "Respuesta rápida" ya declara cerrada la ventana AT2026, pero dos
   sub-secciones más abajo seguían describiendo el mismo calendario en
   tiempo presente/futuro — el mismo defecto de clase R2 que motivó este
   run, sin corregir. Se ajustó:
   - `### Si te corresponde devolución`: "Los plazos típicos para AT 2026:"
     → "Este fue el calendario de depósito del ciclo AT2026 (ya
     ejecutado):". La tabla de fechas (cifra verificada R5) no se modifica.
   - `### Si debes pagar impuesto adicional`: "El plazo para pagar con
     rentas mixtas es hasta el 30 de abril de 2026" (presente) →
     "En el ciclo AT2026, el plazo para pagar con rentas mixtas venció el
     30 de abril de 2026" (pasado, cerrado). El párrafo siguiente sobre
     facilidades de pago (deferral Bucket B, fuera de alcance) no se toca.

## Elementos NO tocados (confirmación)

- `title`, `seoTitle`, `slug`, H1 (frontmatter.title), rutas, canonical: sin
  cambios.
- Retención 15,25% de boletas de honorarios: sin cambios (no es el hallazgo
  de este run; ya verificada correcta en ficha `boleta-honorarios-2026-retencion-cobertura`).
- Tabla de tramos porcentuales del Art. 52 LIR (4%, 8%, 13,5%, 23%, 30,4%,
  35%, 40%): sin cambios — ya verificada correcta por la auditoría.
- Las dos tablas "Resumen orientativo" (situaciones de declaración; tramos
  del Global Complementario): sin cambios de estructura ni contenido — no
  contenían la cifra corregida.
- Deferral de "facilidades de pago... consulta en sii.cl" (línea ~216): sin
  cambios — decisión Bucket B separada, fuera de alcance de este run.
- Estructura de encabezados / H2 faltantes (R7b): sin cambios — SHOULD no
  bloqueante, no se remedia en este run.
- Resto de secciones del cuerpo (mecanismo de cálculo, paso a paso F22, casos
  frecuentes, devolución y pago): sin cambios de contenido.
- Los otros artículos del corpus: no tocados en este run.

## VERIFIED carry-forward

No aplica formalmente: no existe un `05-math-audit.md` previo para este run
(este run es el que declara `requires_calculation=true` por primera vez para
esta remediación). La cifra corregida ($11.265.804) proviene de fetch directo
a la fuente oficial en esta sesión (ver `02-dossier.md`), no de un math audit
anterior. Este draft queda bloqueado hasta que `MathAuditAgent`, en sesión
fresca e independiente, produzca `05-math-audit.md` y verifique de forma
adversarial la cifra corregida y el resto de los valores numéricos del
artículo.

## TODO:SOURCE

Ninguno. Las dos afirmaciones nuevas/corregidas (monto del tramo exento IGC,
estado del ciclo AT2026) citan fuente oficial fetcheada en esta sesión (ver
`02-dossier.md`).

## Fix ERROR APV (sesión posterior, 2026-08-13) — fuera del alcance original de este draft

`05-math-audit.md` (fila 9) reportó un hallazgo `ERROR` fuera del alcance
declarado en `01-brief.yaml` (que marca APV como "out" para este run): las
etiquetas de Régimen A y Régimen B del bloque APV estaban invertidas, y
además el mecanismo del bono del 15% de Régimen A estaba mal descrito (como
crédito aplicado en el F22, cuando en realidad es un depósito directo de la
Tesorería General de la República en la cuenta de ahorro previsional). Este
hallazgo bloquea el veredicto de `05-math-audit.md` (`FAIL`) y por tanto todo
avance hacia Fase C para este archivo, independientemente del estado de R5 y
R2. Se remedia en esta misma sesión porque el bloqueo es sobre el mismo
archivo publicado y el mismo run.

**Cambios aplicados al blog file** (`src/data/blog/rentas-mixtas-sueldo-honorarios.md`):

1. **Línea 144 (sección "Cuándo normalmente recuperas", bullet "APV Régimen
   B"):**
   - Antes: "**APV Régimen B:** Si realizaste aportes a APV bajo Régimen B
     (crédito fiscal del 15% sobre los aportes, directamente en el F22), eso
     reduce tu impuesto final y puede generar o aumentar una devolución. O si
     aportaste en Régimen A, el APV reduce tu base imponible del IGC."
   - Después: "**APV Régimen B:** Si realizaste aportes a APV bajo Régimen B
     (rebaja de tu base imponible del IGC, con tope de 600 UF anuales), eso
     reduce tu impuesto determinado y puede generar o aumentar una
     devolución. El Régimen A no participa de este cálculo: su beneficio es
     una bonificación estatal del 15% sobre los aportes (tope 6 UTM anuales)
     que la Tesorería General de la República deposita directamente en tu
     cuenta de ahorro previsional, no un crédito en el F22."
   - Motivo del ajuste adicional a "genera o aumenta una devolución": esa
     consecuencia solo aplica al Régimen B (rebaja la base imponible, lo que
     puede bajar el impuesto determinado por debajo de lo ya retenido). El
     bono de Régimen A no pasa por el cálculo del F22, así que no contribuye
     a una devolución en ese sentido; se reescribió la frase para no
     atribuirle ese efecto.
2. **Líneas 197-200 (sección "APV y cómo puede reducir tu impuesto final"):**
   - Antes: "**Régimen A:** El aporte reduce tu base imponible del IGC (se
     descuenta de la renta gravada antes de aplicar los tramos).
     Especialmente útil si estás en un tramo intermedio. **Régimen B:**
     Generas un crédito fiscal del 15% sobre los aportes, que se aplica
     directamente en el F22 reduciendo el impuesto determinado. En ambos
     casos, debes declarar (no sirve solo aceptar la propuesta) para que el
     beneficio se aplique."
   - Después: "**Régimen A:** Recibes una bonificación estatal equivalente al
     15% de los aportes, con tope de 6 UTM anuales. La Tesorería General de
     la República la deposita directamente en tu cuenta de ahorro
     previsional; no reduce tu base imponible ni aparece como crédito en el
     F22. **Régimen B:** El aporte reduce tu base imponible del IGC (se
     descuenta de la renta gravada antes de aplicar los tramos), con tope de
     600 UF anuales. Especialmente útil si tu tasa marginal supera el 15%.
     Para el Régimen B, debes declarar (no sirve solo aceptar la propuesta)
     para que la rebaja se refleje en el impuesto determinado del F22. El
     bono del Régimen A se calcula y paga aparte, a partir de la información
     que reporta tu AFP o institución autorizada, y no depende de tu
     declaración de renta."
   - Motivo del ajuste adicional a "en ambos casos, debes declarar...": esa
     frase asumía (incorrectamente) que el bono de Régimen A se aplicaba en
     el F22. Como el bono se calcula y paga por una vía separada (Tesorería,
     a partir de información reportada por la AFP), no depende de que el
     contribuyente declare su renta; se separó la frase para no afirmar una
     dependencia que no está sustentada por la fuente.

**No se tocó:** la corrección de la cifra IGC ($11.265.804) ni el reencuadre
de vigencia (R2) de este mismo run; slug, title, seoTitle, H1, canonical;
`src/data/blog/que-es-el-apv.mdx` (artículo de referencia, no editado);
`docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md`.

Ver fuentes fetcheadas para este fix en `02-dossier.md` (sección "Fuentes
oficiales — refetcheadas para el fix de ERROR APV").
