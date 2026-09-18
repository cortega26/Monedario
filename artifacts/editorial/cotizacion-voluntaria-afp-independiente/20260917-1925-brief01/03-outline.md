Status: DRAFT — pending MathAuditAgent and ComplianceAgent review
Role: OutlineAgent (Claude, esta sesión — sin sesión fresca separada; no aplica requisito de SoD para esta etapa, ver EDITORIAL_AI_PIPELINE.md §2)

Slug: `cotizacion-voluntaria-afp-independiente` · run `20260917-1925-brief01` · corte `2026-09-17`

## Respuesta ancla (articleLead.answer)

- Regla concreta: si NO estás obligado a cotizar por boletas de honorarios
  (no ejerces actividad remunerada, tus boletas anuales no llegan a 5 IMM
  brutos, o eres socio/a de tu empresa y recibes retiros/dividendos en vez
  de boletas), puedes afiliarte **voluntariamente** a una AFP y cotizar el
  10% de cualquier monto **mayor** al ingreso mínimo mensual vigente — cita
  literal de spensiones.cl, no "igual o mayor" (dossier claim a).
- Excepción/matiz: esto NO te da PGU garantizada (es no contributiva, no
  exige historial de cotizaciones — corrección verificada, dossier claim
  d-quater) ni cobertura de salud automática (trámite aparte en Fonasa/
  Isapre, 7%, dossier claim d-ter). Sí te da continuidad de pensión propia y
  acceso al SIS **condicional** a haber cotizado el mes calendario anterior
  al siniestro (claim b-quater).
- Vigencia: mecanismo estructural (art. 92 J DL 3.500), vigente a la fecha
  de corte 2026-09-17. Cifra de tasa SIS (1,62%/1,49%) vigente desde abril
  2026 (fuente #7, spensiones.cl) — NO usar 1,53% (aafp.cl, sin fecha) ni
  1,15% (sii.cl, obsoleta).
- Fuente: Superintendencia de Pensiones (spensiones.cl, fuentes #1, #7, #9
  del dossier).

## Diferenciación visible (localDelta)

- Sin benchmark externo — la diferenciación es 100% interna, frente a dos
  owners existentes que casi absorbieron este tema en Gate 00 (2026-06-17):
  - `boleta-honorarios-2026-retencion-cobertura` cubre la cotización
    **obligatoria** por boletas (retención SII, umbral 5 IMM). Este artículo
    cubre lo opuesto: quien NO tiene esa obligación y quiere cotizar igual.
  - `rentas-mixtas-sueldo-honorarios` es puramente tributario (F22/IGC), no
    toca mecánica previsional.
  - Glosario `cuenta-2.md`: "cotización voluntaria" también se usa para el
    aporte adicional tipo APV de quien YA cotiza obligatoriamente (hasta 50
    UF, dossier claim e-quater) — **desambiguación obligatoria en el primer
    H2**, con link cruzado, para no duplicar ese glosario ni confundir al
    lector con dos sentidos del mismo término.
- Promesa visible sin scroll: bloque "Respuesta rápida" con la corrección
  PGU explícita (evita el gancho equivocado que traía el brief original) +
  tabla comparativa "voluntario vs. obligatorio" etiquetada "Resumen
  orientativo".

## Secciones (intención + fuente dossier)

1. **Respuesta rápida** — regla + excepciones (PGU, salud) + vigencia +
   corte visible. Fuente: dossier claims a, b-quater, d-quater, d-ter.
2. **¿Quién califica como afiliado/a voluntario/a?** — no ejercer actividad
   remunerada; quién entra en la práctica (freelance bajo 5 IMM, socios con
   retiros/dividendos, personas sin actividad formal). Fuente: claims
   a-bis, a-ter (base legal art. 92 J).
3. **Desambiguación de término** ("cotización voluntaria" no es lo mismo
   que el aporte adicional tipo APV/Cuenta 2) — H2 temprano, con link a
   `que-es-la-cuenta-2-afp`. Fuente: claim e-quater.
4. **Cuánto y cómo cotizar** — base 10% sobre monto > ingreso mínimo
   mensual vigente, con un ejemplo numérico concreto (monto elegido ×10%).
   **Nota para DraftAgent:** el dossier NO fetcheó el valor en pesos del
   ingreso mínimo mensual 2026 — antes de calcular el ejemplo, fetchear
   cifra oficial vigente (MinTrab/ChileAtiende) y citarla; no usar el valor
   del brief original sin verificar. Este ejemplo es el input principal
   para `05-math-audit.md` (`requires_calculation=true`). Fuente: claim a.
5. **Elección de AFP** — regla de "AFP adjudicataria de la licitación"
   (hoy AFP Planvital) para primera afiliación. **Flag abierto (Pregunta
   Abierta 3 del dossier):** no verificado si esta regla aplica igual al
   afiliado voluntario puro (sin boletas) — el draft debe presentar esto
   como pendiente de verificar o acotar la afirmación a lo que sí está
   verificado (afiliados por boletas), no generalizar sin más. Fuente:
   claim c.
6. **Qué cubre y qué no cubre** — pensión (acumulación en cuenta de
   capitalización individual, misma lógica que la obligatoria); SIS
   condicional al mes cotizado antes del siniestro; salud como trámite
   aparte (Fonasa/Isapre, 7%, no automático). Fuente: claims d, d-bis,
   d-ter, b-quater.
7. **Tasa SIS vigente** — 1,62% (afiliados voluntarios/independientes,
   desde abril 2026) vs. 1,49% (independientes vía retención SII, año
   tributario 2026). **TODO:SOURCE** heredado del dossier: número exacto de
   oficio/circular (solo corroborado por fuente secundaria no oficial,
   teced.cl) — no citar el número de oficio en el draft sin verificación
   oficial adicional; sí citar la tasa y fecha de vigencia, que están
   VERIFIED. Fuente: claims b, b-bis, b-ter.
8. **Tabla comparativa "voluntario vs. obligatorio por boletas"** — síntesis
   con etiqueta visible "Resumen orientativo" + limitador de alcance
   (CONTRACT.YMYL_RESPONSE_STRUCTURE requisito 4). Ejes: quién está
   obligado, base de cálculo, mecanismo de pago (directo a AFP vs.
   retención SII + Operación Renta), posibilidad de renunciar (voluntario sí
   / obligatorio no). Fuente: claims e, e-bis, e-ter. **Alerta de vigencia**:
   no usar cifras de sii.cl (tope 867,6 UF, SIS 1,15%, ingreso mínimo
   $225.000 — obsoletas); usar tope 90 UF mensual y SIS 1,49%/1,62% de
   spensiones.cl.
9. **¿Sirve esto para la Pensión Garantizada Universal (PGU)?** — H2
   dedicado a la corrección explícita: la PGU es no contributiva (edad +
   residencia + focalización por ingresos), NO exige historial de
   cotizaciones. Este H2 existe específicamente para no dejar que el lector
   se quede con el gancho equivocado que traía el brief original antes de
   la corrección. **No incluir** la hipótesis no verificada sobre efecto de
   la pensión autofinanciada (PAFE) en el monto complementario (dossier
   claim d-quinquies, etiquetado "inferencia sin verificar" — se omite del
   draft en vez de presentarse como hecho, salvo que se consiga fuente
   oficial que describa la fórmula de cálculo). Link a
   `pgu-pension-garantizada-universal`. Fuente: claim d-quater.
10. **Cotización de salud voluntaria (aparte de la AFP)** — Fonasa/Isapre,
    7%, trámite independiente de la afiliación en AFP. Link a
    `fonasa-vs-isapre-comparativa`. Fuente: claim d-ter.
11. **Paso a paso para afiliarte** — trámite en la AFP correspondiente
    (adjudicataria si es primera afiliación); qué documentos/plazos aplican.
    **TODO:SOURCE**: el dossier no fetcheó el paso a paso operativo
    detallado (formularios, canal presencial/online) — si no se verifica
    antes del draft, marcar explícitamente como pendiente en vez de
    inventar el procedimiento.
12. **FAQ** — mínimo: "¿Es lo mismo que la Cuenta 2 o el APV?" (no),
    "¿Cotizar voluntariamente me da PGU?" (no, ver H2 dedicado), "¿Puedo
    dejar de cotizar cuando quiera?" (sí, a diferencia del obligatorio por
    boletas — claim e-ter), "¿Y si después empiezo a emitir boletas por
    sobre el umbral?" (transición a obligatorio, remite a
    `boleta-honorarios-2026-retencion-cobertura`).
13. **Fuentes oficiales** — listar las fuentes VERIFIED del dossier con URL
    (spensiones.cl ×9, aafp.cl, sii.cl solo como contraste marcado). No
    incluir sii.cl como fuente de cifras (solo de contexto de contraste).

## Excepciones y casos borde a cubrir

- Texto operativo completo del art. 92 J DL 3.500 sigue `TODO:SOURCE`
  (BCN LeyChile bloqueado por render JS, tampoco resuelto vía Compendio de
  Normas en el research) — el draft cita el artículo por número y remite a
  spensiones.cl como fuente de la definición operativa, sin inventar el
  texto legal completo.
- Conflicto de tres cifras SIS entre fuentes (1,62%/1,49% vs 1,53% vs
  1,15%) — el draft usa solo la de spensiones.cl con fecha explícita y
  puede mencionar brevemente, si aporta valor, que otras fuentes del sector
  muestran cifras desactualizadas, sin citarlas como alternativas válidas.
- Ambigüedad "cotización voluntaria" (dos sentidos) — resuelta en sección 3,
  no debe reaparecer sin aclarar en ningún otro H2.
- Regla de AFP adjudicataria para afiliado voluntario puro — sin verificar;
  no generalizar sin fuente.
- Corrección PGU — no contributiva; H2 dedicado, no una nota al margen.
- Ingreso mínimo mensual 2026 en pesos — no fetcheado en el dossier; debe
  verificarse antes de construir el ejemplo numérico de la sección 4.

## Separación aprobado / vigencia / aplicación (CONTRACT.YMYL_RESPONSE_STRUCTURE req. 3)

N/A — no hay reforma normativa pendiente identificada sobre afiliación
voluntaria en este dossier (distinto de la Reforma Previsional 2025, que no
se menciona en las fuentes fetcheadas para este tema específico). Si el
draft encuentra que la Reforma Previsional 2025 modifica algo de este
mecanismo, debe agregarse esta sección con la separación explícita
aprobado/vigencia/aplicación antes de publicar.
