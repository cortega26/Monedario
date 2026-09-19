# Checklist de verificación humana — `cae-costo-real-credito-chile`
(auditoría FINDINGS 1 alta / 2 media / 7 baja, 2026-09-18; tablas y prepago corregidos, VERIFY condicional 7/7)

**Cómo usar:** abre cada URL en tu navegador (tu browser SÍ carga CMF
Educa — los bots no, y ahora mismo tampoco mis agentes: falla de red
transitoria). Responde `CONFIRMADO: <quote> — <URL>` o `RETIRAR`.
Estimado: 20–30 min.

## A. Ley 18.010: prepago y TMC — NHV-1 (~8 min)

1. Abre <https://www.bcn.cl/leychile/navegar?idNorma=29438>. Extrae N° de
   artículo del derecho a prepago y sus topes + N° de artículo de la TMC y
   su ámbito (¿topa interés o también cargos?). → Con esto cierro L173–175
   con número de artículo y L203/L224/L239 (tasa vs cargos).

## B. Ley 19.496: CAE y hoja resumen — NHV-2 (~6 min)

2. Abre <https://www.bcn.cl/leychile/navegar?idNorma=61438> (SERNAC
   Financiero, Ley 20.555). Artículos del deber de informar CAE y hoja
   resumen + alcance subjetivo (¿incluye retail no supervisado por CMF?).
   → Con esto cierro L74, L141 y FAQ L235–236.

## C. Ley 20.448 art. 8 + L214 — NHV-3 (~5 min)

3. Abre <https://www.bcn.cl/leychile/Navegar?idNorma=1016177> y la página
   CMF Educa de crédito de consumo (cierra L214): confirma que los seguros
   asociados son **voluntarios** con libre elección de aseguradora.
   → Con tu confirmación corrijo L214 ("obligatorios" → voluntarios) en
   una línea. Este es el residual MEDIUM abierto: sin tu quote no lo toco
   (fail-closed tras 3 timeouts seguidos contra CMF desde mis agentes).

## D. Periodicidad TMC — NHV-4 (~3 min)

4. ¿La TMC cambia mensualmente? (página CMF de estadísticas / Diario
   Oficial). → Frecuencia + cita o suavizo a "se actualiza
   periódicamente; verifica la vigente".

## E. IVA seguros + portabilidad + metodología tarjetas (~5 min)

5. NHV-5/6/7: IVA a seguros asociados, portabilidad financiera, metodología
   CAE en tarjetas. → URLs o RETIRAR menciones.
