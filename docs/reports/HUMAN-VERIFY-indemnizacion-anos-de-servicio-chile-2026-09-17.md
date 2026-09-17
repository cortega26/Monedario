# Checklist de verificación humana — `indemnizacion-anos-de-servicio-chile`
(auditoría FINDINGS 5 alta / 6 media / 3 baja, 2026-09-17)

**Cómo usar:** abre cada URL en tu navegador (LeyChile bloquea bots pero
funciona en browser humano), confirma la pregunta exacta y respóndeme por
ítem `CONFIRMADO: <quote> — <URL>` o `RETIRAR: <frase>`. Estimado total:
30–40 min. Base canónica: Código del Trabajo `idNorma=207436`.

## A. Art. 163 — regla base completa (ALTA: F3, F4-parte, F9-parte, ~6 min)

1. Abre <https://www.bcn.cl/leychile/navegar?idNorma=207436> y ubica el
   art. 163. Confirma literalmente, inciso por inciso: (a) contrato vigente
   **un año o más** como requisito; (b) **30 días** de la última
   remuneración por año; (c) fracción **superior a 6 meses = año completo**;
   (d) tope **330 días / 11 años**; (e) obra/faena ≥ 1 mes por causal N°5:
   **2,5 días por mes + fracción > 15 días**; (f) casa particular a todo
   evento. → Quotes por inciso. Lo que no esté: dime "ausente" y lo trato
   como omisión a corregir, no como afirmación.

## B. Art. 172 — base, exclusiones, promedio, tope (ALTA: F1, F2, F7, ~6 min)

2. En la misma norma, art. 172. Confirma: (a) exclusión literal de **"pagos
   por sobretiempo"** (horas extra fuera aunque sean habituales);
   (b) regla de variables = **promedio últimos 3 meses calendario**;
   (c) tope **90 UF del último día del mes anterior al pago**;
   (d) tratamiento de colación/movilización y gratificaciones mensual vs
   anual si el texto lo distingue. → Quotes. Si (d) no está en el artículo:
   lo verifico contra DT 60585 (ya fetcheado) y no necesitas nada más aquí.

## C. Arts. 159/160/161 — causales y desahucio (MEDIA: F9, ~4 min)

3. Confirma numerales de término (159 N°4 vencimiento plazo, N°5 obra/faena)
   y disciplinarias (160), más el **desahucio del empleador (art. 161
   inc. 2°)** como causal habilitante de indemnización. → Quotes o
   corrección de numerales.

## D. Art. 168 — recargos y plazos (ALTA: F5, F8, ~5 min)

4. Confirma la tabla de recargos: **30% / 50% / 80% / 100%** con sus letras
   a)–c) + caso calificado, y el plazo de **60 días hábiles** desde la
   separación (suspendible por reclamo en Inspección, tope **90 días**).
   → Quotes. Este es el fix de mayor impacto al lector (el "hasta 2 años"
   actual hace perder derechos).

## E. Art. 510 — prescripción 2 años (MEDIA, ~2 min)

5. Confirma art. 510 inc. 1°: prescripción de **2 años desde la
   exigibilidad**. → Quote o RETIRAR la mención actual.

## F. Excepción pre-1981 + normas tributarias (MEDIA/BAJA: F11, F14, ~5 min)

6. Confirma: (a) régimen transitorio **contratados antes del 14-08-1981
   sin tope**; (b) art. 178 CT (indemnizaciones legales no renta);
   (c) art. 17 N°13 LIR (exceso voluntario, promedio 24 meses). → Quotes o
   RETIRAR cada sub-ítem no hallado. (El Ord. SII 009/2017 ya está
   verificado por fetch: <https://www.sii.cl/normativa_legislacion/jurisprudencia_administrativa/ley_impuesto_renta/2017/ja009.htm>.)

## G. Iniciativa elimina-tope-330 (BAJA, ~2 min)

7. Abre <https://camara.cl/verDOC.aspx?prmFICHATIPO=DIP&prmID=82391&prmLOCAL=0&prmTipo=FICHAPARLAMENTARIA>.
   Confirma estado (trámite, **no aprobada**). → Si está aprobada o cambió
   de estado: dime el estado exacto; si no: "mantener fuera del artículo".

## H. Interna (no navegador — tarea repo, ~15 min)

8. Auditar `/calculadoras/finiquito-indemnizacion/` contra esta misma
   auditoría: ¿aplica tope 90 UF? ¿excluye horas extra? ¿exige 1 año?
   Si la calculadora replica F1–F3, es un bug de cálculo en producción,
   no solo editorial. Dime si lo reviso yo o va a otro track.

---

**Al responder:** por letra, `CONFIRMADO` o `RETIRAR`. Con eso armo el
refresh con TODO = 0 y va a compliance en sesión fresca. Los hallazgos
OBS-1 (registry de leyes) y OBS-2 (pilar "proporcional") van a tarea
separada, no a este refresh.
