# Checklist de verificación humana — `informe-deudas-cmf-vs-dicom`
(run `2026-09-16-pilot-01`, compliance HOLD 6 alta / 7 media)

**Cómo usar:** abre cada URL en tu navegador (LeyChile bloquea bots,
pero funciona normal en browser humano), confirma la pregunta exacta y
respóndeme con la cita literal + URL por ítem. Estimado total: 25–35 min.
Todo lo que diga "retirar" como fallback evita publicar sin respaldo.

## A. Base legal de eliminación del Boletín — R1 (ALTA, ~5 min)

1. Abre <https://www.bcn.cl/leychile/navegar?idNorma=1037366> (Ley 20.575).
   Confirma: ¿regula SOLO el principio de finalidad, sin ningún derecho
   de borrado/eliminación? → Si hay algún artículo de borrado, el
   compliance está equivocado: dime cuál.
2. En LeyChile usa el buscador con `19812`. Confirma: ¿la Ley 19.812
   regula el Boletín de Informaciones Comerciales y el derecho a
   eliminación tras pago? → Anota número de artículo exacto + cita literal.
3. Fallback (si 19.812 no confirma): abre
   <https://www.bcn.cl/leychile/navegar?idNorma=141599> (Ley 19.628),
   arts. 12 (acceso) y 13 (rectificación y cancelación). Confirma: ¿el
   art. 13 permite pedir cancelación/eliminación de datos comerciales
   pagados? → Cita literal del artículo operativo.
4. Dime la frase final: ley + artículo + quote para el artículo.

## B. Gratuidad mínima de consulta — R5 (ALTA, ~3 min)

5. En la misma Ley 19.628 (`idNorma=141599` arriba) o DS 950: ¿existe base
   para "consulta gratuita mínima por ley"? → Si existe: artículo + quote.
   Si NO existe: dime "retirar atribución a 20.575" y qué frase usar
   (p. ej. solo "el Informe es gratuito en el portal CMF" si el portal lo
   confirma en C).

## C. Prescripción art. 2515 — R4 (ALTA, ~4 min)

6. Abre <https://www.bcn.cl/leychile/navegar?idNorma=172986&idParte=8720591>
   (Código Civil, art. 2515). Confirma textualmente: (a) 3 años
   ejecutivas / 5 ordinarias; (b) desde cuándo corre ("desde que la
   obligación se hizo exigible", art. 2514 contexto); (c) si el texto
   exige alegarla en juicio o opera de oficio. → Quote + matiz
   ordinaria/ejecutiva para el artículo.

## D. Heredero: presencial vs CMF sin papel — R2 (ALTA, ~4 min)

7. Abre <https://conocetudeuda.cmfchile.cl/informe-deudas/> y busca el
   trámite para herederos (o "CMF sin papel"). Confirma: ¿el canal es
   digital (CMF sin papel) y NO presencial? → Anota la lista documental
   exacta que pide (certificados, cédulas, posesión efectiva, etc.).
8. Si el portal no lista documentos, revisa
   <https://www.cmfchile.cl/educa/621/w3-article-27663.html> (CMF Educa,
   ya verificada por fetch) y dime qué dice de herederos.

## E. Desfase "10–20 días hábiles" — R3 (ALTA, ~3 min)

9. En el portal de C (pregunta 7), FAQ o ayuda: ¿aparece alguna magnitud
   de desfase entre pago y actualización (10–20 días u otra)? → Si SÍ:
   quote + URL exacta. Si NO: dime "retirar magnitud, conservar solo
   'puede traer desfase'".

## F. Acceso de terceros — R6 (ALTA, ~3 min)

10. ¿Puede un arrendador/empleador consultar tu Informe sin tu
    autorización? Busca el régimen (mandato/autorización) en CMF Educa
    (URL de D.8) o el portal. → Quote + URL. Si no hay fuente clara:
    dime "retirar frase absoluta, usar versión débil".

## G. Reclamo bancario: deep-link — R11 (MEDIA, ~3 min)

11. Abre <https://www.cmfchile.cl/portal/principal/613/w3-propertyvalue-43332.html>
    (hub de reclamos, vivo). Navega al trámite de reclamo contra bancos
    y pégame la URL final del trámite (no del hub).

## H. Suplantación: OS-9/PDI — R8 (MEDIA, ~2 min)

12. ¿OS-9 recibe denuncias de suplantación para DICOM, o es PDI
    Cibercrimen (delitos informáticos) + reclamo CMF? → URL del canal
    correcto. Si OS-9 no aplica: dime "reemplazar por PDI + CMF".

## I. "Ilimitado" + ClaveÚnica — R7/R12 (MEDIA, ~3 min)

13. En CMF Educa (URL de D.8): ¿dice "ilimitado" o solo "gratis"? →
    Quote o "retirar adjetivo".
14. Requisitos ClaveÚnica (RUT + n° de documento): confirma en
    <https://claveunica.gob.cl/> o Registro Civil. → Quote o URL.

## J. Glosa directas/indirectas/castigos — R9 (MEDIA, ~2 min)

15. En el portal (C) o CMF Educa: ¿cómo define deudas directas,
    indirectas y castigos? → Quotes o "retirar glosa".

## K. Entidades reportantes — R10 (MEDIA, ~2 min)

16. En CMF Educa (D.8): ¿el alcance exacto es "bancos y cooperativas" +
    "sujetas a fiscalización"? → Quote literal para corregir la lista
    del publicado ("emisores de tarjetas y otras").

## L. Boundary Registro de Deuda Consolidada — R13 (MEDIA, ~3 min)

17. Abre <https://www.bcn.cl/leychile/navegar?idNorma=1204681> (Ley 21.680,
    efectiva 2024-07-01). Confirma estado operativo del RDC y dime la
    línea boundary de una frase para el lector ("Informe CMF vs RDC:
    ..."). Si no es operativo aún: dime "línea N/A justificada".

---

**Al responder:** por cada letra, `CONFIRMADO: <quote> — <URL>` o
`RETIRAR: <frase sustituta>`. Con eso re-emito el draft con
`TODO:SOURCE = 0` y armo el packet para tu firma.
