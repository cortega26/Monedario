FICHA DE AUDITORÍA — boleta-honorarios-2026-retencion-cobertura — 2026-08-12
Revisión efectiva previa: 2026-05-11 · Cluster: impuestos-personas · topicRole: owner
Estándares posteriores aplicables: ninguno adicional a los ya vigentes en 2026-05-11 (última revisión es posterior a NORMA_YMYL v1.0, timeliness, competitive adaptation, pipeline v2 y política de deferral — ver PLAN §3)

R1 respuesta ancla    : PASS — `articleLead.answer` da la regla concreta (retención vs. cobertura) y el cuerpo entrega el número (15,25%) y el ejemplo ($100.000 → $84.750) en la primera sección ("Qué hacer ahora"), dentro de las 2 pantallas.
R2 vigencia           : CONDITIONAL — `validAsOf=2026-05-11`, `updatedDate=2026-05-11`, `reviewPolicy.maxDays=90` → SLA venció 2026-08-09 (hoy 2026-08-12, 3 días vencido). El contenido en sí **no está desactualizado**: la retención 15,25% aplica durante todo 2026 y el artículo no describe un ciclo cerrado como si estuviera abierto (a diferencia de los otros tres del lote). El defecto es de vigencia formal (SLA), no de exactitud del contenido.
R3 fuentes oficiales  : PASS — 6 fuentes oficiales (`articleLead.officialSources`: SII + ChileAtiende; cuerpo: SII ×3 + BCN) frente al mínimo DoD §1 de 2 (SII + ChileAtiende/TGR) para `Impuestos Personas`.
R4 deferral §2.4      : PASS — no hay deferrals de valores fetcheables. "No reemplaza asesoría tributaria en casos mixtos" es deferral legítimo (respuesta intrínsecamente individual, §2.4 condición 2).
R5 exactitud          : PASS — todas las cifras críticas verificadas contra fuente oficial en vivo:
  - Retención 2026 = 15,25% (y escalonamiento 2025:14,5% / 2026:15,25% / 2027:16,0% / 2028:17,0%) vs. oficial SII: idéntico. URL: https://www.sii.cl/destacados/boletas_honorarios/aumento_gradual.html — fetch 2026-08-12.
  - Umbral de exención de cotización = 5 IMM (año base 2025) vs. oficial ChileAtiende: idéntico ("$2.767.765" valor 2025). URL: https://www.chileatiende.gob.cl/fichas/12016-cotizacion-de-trabajadores-que-emiten-boletas-de-honorarios — fetch 2026-08-12.
  - Base de cotización = 80% del total bruto boleteado vs. oficial ChileAtiende: idéntico ("80 % del monto total de las boletas"). Misma URL, mismo fetch.
R6 reformas           : PASS — el bloque de escalonamiento Ley 21.133 separa año por año con marca "← vigente" para 2026 y menciona que 2028 es régimen permanente; no hay lenguaje que sugiera que un tramo futuro "ya se aplica".
R7b estructura DoD    : OBSERVACIÓN (no bloqueante) — H2 presentes no replican los nombres exactos del DoD §2 ("Qué hacer ahora", "Escenarios por perfil", "Si te pasa X, haz Y" en vez de "Qué es/Qué cambia", "Paso a paso", "Casos frecuentes"), pero cubren la misma función. No hay H2 "Errores comunes" literal (existe "Errores que más se repiten", funcionalmente equivalente).
R9 prosa              : Sin patrones prohibidos de §2.2. Prosa clara, es-CL correcto, sin voz editorial interna visible. Tablas y listas facilitan lectura. Sin observaciones accionables.

Scorecard NORMA §7: ancla 9,5/10×35% (3,325) + precisión/fuentes 9,5/10×25% (2,375) + vigencia 7,0/10×15% (1,050) + excepciones 9,0/10×15% (1,350) + claridad 8,5/10×10% (0,850) = 8,95/10
Verdicto: CONDITIONAL
Bucket por hallazgo:
  - SLA de revisión vencido (`validAsOf` 2026-05-11 + 90 días) → Bucket A (humano: decidir si se re-verifica y se mueve `validAsOf`, o si se documenta que el contenido sigue vigente sin cambio sustantivo — NORMA §5.2 prohíbe mover fecha "para que se vea fresco" sin cambio real).
  - H2 no alineados a nomenclatura DoD §2 → Bucket C (estructural, cosmético, no bloqueante).
Tipo de remediación: estructural (SLA es procedimental, no requiere corrección de contenido; ver nota — no es remediación "sustantiva" porque no hay cifra ni regla que corregir, es re-confirmación de vigencia)
