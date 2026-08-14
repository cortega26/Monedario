# Dossier — rentas-mixtas-sueldo-honorarios (remediación Fase B, lote 0)

- Source article: `src/data/blog/rentas-mixtas-sueldo-honorarios.md`
- Run id: `20260812-1345-lote0b`
- Origen: ficha de auditoría `output/audits/corpus-2026-08-12/fichas/rentas-mixtas-sueldo-honorarios.md`
- Fecha de corte de este run: 2026-08-12

## Intención principal

Query ancla: "rentas mixtas sueldo y honorarios declarar". El lector necesita
dos cosas en la primera pantalla: (1) la regla de obligación de declarar
(permanente, no ligada a un año específico) y (2) el monto exacto del tramo
exento del Global Complementario, porque determina si generará impuesto
adicional.

## Riesgo YMYL

- Sensibilidad regulatoria: `alta` (materia tributaria, Impuesto Global
  Complementario, Operación Renta).
- Requiere cálculo: **sí** (`requires_calculation: true`). El tramo exento se
  deriva de 13,5 UTA × valor UTA de diciembre 2025. Por política, este run
  queda bloqueado antes de Fase C hasta que exista `05-math-audit.md` de una
  sesión fresca e independiente (`MathAuditAgent`).

## Hallazgos que originan este run (carry-forward desde la ficha de auditoría)

- **R5 exactitud — FAIL confirmado.** El artículo declaraba el tramo exento
  del IGC como "13,5 UTA anuales para AT 2026, aproximadamente $11.322.018
  anuales" en dos lugares: FAQ "¿Puedo tener sueldo, boletas y aun así quedar
  exento del Global Complementario?" y el bloque "Excepción relevante" dentro
  de "Respuesta rápida" en el cuerpo. El valor oficial es **$11.265.804**
  (diferencia +$56.214, +0,5%). La fórmula (13,5 UTA) y la tabla de tramos
  porcentuales del Art. 52 LIR (4%, 8%, 13,5%, 23%, 30,4%, 35%, 40%) ya
  estaban correctas; el error estaba solo en el monto en pesos del tramo
  exento.
- **R2 vigencia — FAIL (versión leve).** `articleLead.answer` y el bloque
  "Respuesta rápida" decían "debes declarar Operación Renta 2026
  obligatoriamente" en presente/imperativo, sin señalar que la ventana de
  declaración AT2026 ya cerró (30 de abril de 2026 con pago, 8 de mayo de
  2026 sin pago). `articleLead.validAsOf` estaba en 2026-05-11 — dentro de la
  ventana viva en su momento, pero hoy (2026-08-12) el efecto de lectura es
  que alguien que llega hoy puede creer que "declara ahora" sigue siendo la
  instrucción correcta para el ciclo AT2026 específico.
- **R4 deferral (línea ~216, facilidades de pago SII) — CONDITIONAL,** no se
  toca en este run (Bucket B, decisión separada, per instrucción explícita
  del brief operativo).
- **R7b estructura DoD (H2 faltantes)** — SHOULD no bloqueante, no se remedia
  en este run.

## Fuentes oficiales — refetcheadas para este run (sesión actual, 2026-08-12)

- SII, "Valores y fechas — Personas naturales AT2026":
  <https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html> —
  fetch 2026-08-12 (WebFetch, esta sesión). Cita literal: "Exención de
  impuesto global complementario (art. 52 y 52 bis de la LIR): 13,5 UTA del
  mes dic. de 2025 = $11.265.804" y "1 UTA del mes dic. de 2025 = $834.504".
  Verificación aritmética independiente: 834.504 × 13,5 = 11.265.804 (exacto,
  sin redondeo). Uso: corrige el monto del tramo exento en el FAQ y en el
  bloque "Respuesta rápida" del cuerpo.
- SII, comunicado 31 de marzo de 2026 — calendario Operación Renta AT2026:
  <https://www.sii.cl/noticias/2026/310326noti01pcr.htm> — fetch 2026-08-12
  (WebFetch, esta sesión). Cita literal: plazos sin pago (con devolución)
  "1 al 8 de abril" (devolución 29 de abril), "9 al 23 de abril" (devolución
  15 de mayo), "24 de abril al 8 de mayo" (devolución 27 de mayo); plazo con
  pago "08 de abril al 30 de abril". Confirma: con pago vence el 30 de abril
  de 2026; sin pago, el 8 de mayo de 2026. Uso: sustenta el "Estado del ciclo
  AT2026" agregado al bloque "Respuesta rápida" y a `articleLead.answer`.
  Esta misma fuente y estas mismas fechas ya fueron verificadas
  independientemente por la remediación previa de `operacion-renta-f22-checklist`
  (run `20260812-1312-lote0b`, mismo lote); se refetchean aquí para
  trazabilidad propia de este run, no se citan de memoria.
- SII — Boletas de honorarios: <https://www.sii.cl/destacados/boletas_honorarios/>
  — ya citada en el artículo publicado, sin cambios; no requirió refetch para
  este run porque no sustenta ninguna cifra corregida.

## Fuentes oficiales — refetcheadas para el fix de ERROR APV (sesión posterior, 2026-08-13)

- SII, Preguntas frecuentes — regímenes tributarios del APV (art. 42 bis LIR):
  <https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_5883.htm>
  — fetch 2026-08-13 (WebFetch, esta sesión). Confirma: Régimen A (letra a)
  no tiene deducción tributaria al momento del aporte y el retiro no se grava
  con Impuesto Único de Segunda Categoría (consistente con que el beneficio
  no es una rebaja de base imponible ni un crédito en el F22); Régimen B
  (letra b) otorga el beneficio de "rebajar la base imponible del Impuesto
  Único de Segunda Categoría o Global Complementario".
- Superintendencia de Pensiones — bonificación fiscal del APV:
  <https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2929.html>
  — fetch 2026-08-13 (WebFetch, esta sesión). Cita: "La bonificación será
  depositada por la Tesorería [General de la República]... la cual deberá
  ser ingresada en la cuenta individual de ahorro previsional voluntario
  colectivo" del trabajador que se acoge a Régimen A; tope anual "seis
  unidades tributarias mensuales (UTM)"; monto "equivalente al 15%" de los
  aportes de ahorro voluntario colectivo bajo Régimen A. Confirma que el
  bono del 15% de Régimen A se deposita directamente en la cuenta de ahorro
  previsional, no como crédito en el F22.
- Uso: corrige la inversión de etiquetas Régimen A/Régimen B y la descripción
  del mecanismo del bono del 15% en el bloque APV (líneas ~144 y ~197-200 del
  artículo), hallazgo reportado como ERROR (fila 9, fuera de alcance del run
  original) en `05-math-audit.md` de este mismo run.
- Corrobora adicionalmente (no como fuente primaria, sino como coherencia de
  corpus): `src/data/blog/que-es-el-apv.mdx`, artículo owner canónico del
  topic APV en Monedario — confirma Régimen A = bono 15% tope 6 UTM
  depositado en cuenta; Régimen B = rebaja base imponible tope 600 UF
  anuales, con cita de las mismas fuentes SII/Superintendencia de Pensiones.

## Fuentes ya presentes en el artículo, sin cambio de contenido

- SII — Impuesto Segunda Categoría 2026 (tabla de tramos):
  <https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm>
  — cita la estructura de tramos porcentuales del Art. 52 LIR, ya verificada
  correcta por la auditoría (no se toca).

## Decisiones editoriales

- La cifra corregida ($11.265.804) reemplaza $11.322.018 en las dos
  apariciones exactas, sin alterar la fórmula ni la tabla de tramos.
- El reencuadre de vigencia separa explícitamente: (a) la obligación de
  declarar con rentas mixtas, que es una regla permanente y no depende del
  año tributario, de (b) el estado del ciclo AT2026 específico, que ya cerró,
  con puntero al checklist F22 (`/posts/operacion-renta-f22-checklist/`,
  ya remediado en un run previo del mismo lote) para quien llegue fuera de
  plazo.
- No se inventa fecha de AT2027; se declara explícitamente que el SII aún no
  publica su calendario, siguiendo el mismo patrón verificado en el dossier
  de `operacion-renta-f22-checklist`.
- Ninguna otra cifra del artículo (retención 15,25%, tramos porcentuales,
  calendario de depósito de devolución en la sección "Cuándo esperar
  devolución") se modifica — fuera de alcance de este brief.

## TODO:SOURCE

Ninguno. Las dos afirmaciones nuevas o corregidas (monto del tramo exento,
estado del ciclo AT2026) citan fuente oficial fetcheada en esta sesión.

## Bloqueo declarado

`requires_calculation: true` → este run no puede avanzar a Fase C sin
`05-math-audit.md` de `MathAuditAgent` en sesión fresca. No se produce ese
archivo aquí. Ver `07-publish-packet.md` para la nota de bloqueo explícita.
