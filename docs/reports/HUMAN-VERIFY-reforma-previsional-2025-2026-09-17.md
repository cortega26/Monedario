# Checklist de verificación humana — `reforma-previsional-2025-que-cambia-y-como-te-afecta`
(auditoría FINDINGS 2 alta / 5 media / 4 baja, 2026-09-17)

**Cómo usar:** abre cada URL en tu navegador (LeyChile bloquea bots pero
funciona en browser humano), confirma la pregunta exacta y respóndeme por
ítem `CONFIRMADO: <quote> — <URL>` o `RETIRAR: <frase>`. Estimado total:
25–35 min. Base canónica: Ley 21.735 `idNorma=1212060`. Las cifras de tasa
(F2–F5) ya vienen verificadas por fetch SP — el ítem A es solo
contra-chequeo de 5 min.

## A. Contra-chequeo tasa empleador 3,5% — F2–F5 (ALTA, ~5 min)

1. Abre <https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-10906.html>
   (SP, cotización empleador). Confirma: desde remuneraciones de **agosto
   2026**: **3,5%** = 0,1% cuenta individual + 0,9% CRP + 2,5% SSP (SIS +
   CEV), recaudado por IPS al FAPP. → Si confirma: tabla Hoy corregida.
   Si cambió de nuevo: dime tasa y desglose vigentes.
2. En <https://www.spensiones.cl/portal/institucional/594/w3-article-16708.html>
   (SP 16-09-2025, NCG 350): confirma BAC **0,1 UF/año, tope 25 años**,
   requisitos (mujeres 120→180 meses gradual / hombres 240) y CEV
   (escala por edad de pensión, mínimo 0,25 UF/mes, tope 18 UF
   autofinanciada), ambos **en pago desde enero 2026**. → Quotes o
   correcciones puntuales.

## B. Promulgación y vigencia general — F1, F6 (ALTA/MEDIA, ~6 min)

3. Abre <https://www.bcn.cl/leychile/navegar?idNorma=1212060> (Ley 21.735).
   Confirma: (a) **promulgación 20-03-2025, publicación 26-03-2025**
   (el "julio 2025" publicado es falso); (b) **vigencia general diferida
   al 01-04-2027** con vigencias anticipadas/posteriores por transitorios.
   → Quotes. Con (b) armo el bloque aprobado/rige/se-aplica que hoy falta.

## C. Calendario gradual y meta final — NHV-1 (MEDIA, ~5 min)

4. En el mismo texto BCN: confirma tasas año por año 2025→2033, que el
   7% nuevo + SIS = **8,5% total empleador**, y el endpoint **agosto 2033**.
   → Tabla literal o corrección de la meta publicada.

## D. Fondos generacionales e independientes — NHV-3, NHV-4 (MEDIA, ~5 min)

5. Confirma: (a) fondos generacionales con elección de perfil dentro de
   rangos de cohorte; (b) independientes: cotización mensual voluntaria al
   SSP desde agosto 2025 + esquema anual por Operación Renta. → Quotes o
   RETIRAR cada sub-ítem.

## E. Aporte patronal por tipo de contrato — NHV-5 (MEDIA, ~3 min)

6. Confirma: aporte en contratos a plazo fijo, indefinido y jornada parcial
   con proporcionalidad del Código del Trabajo. → Quote o RETIRAR.

## F. PGU tramo 75+ sep-2026 (BAJA, ~3 min)

7. El tramo sep-2026 (75+, $250.275) viene solo de prensa (Emol). Confirma
   en IPS/ChileAtiende el monto y fecha vigentes. → URL oficial o RETIRAR
   el monto y conservar solo la fecha del hito.

---

**Al responder:** por letra, `CONFIRMADO` o `RETIRAR`. Con eso armo el
refresh (tabla Hoy a 3,5%, bloques BAC/CEV/CRP operativos, vigencia legal,
mini-calendario con estado) con TODO = 0 y va a compliance en sesión
fresca. La decisión de gobierno de datos (dataset `volatileData` vs
`dataTriggers` fechados, F7) queda para tu criterio en la misma pasada.
