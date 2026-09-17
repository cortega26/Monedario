# Checklist de verificación humana — `el-poder-del-interes-compuesto`
(auditoría FINDINGS 3 alta / 6 media / 6 baja, 2026-09-17)

**Cómo usar:** abre cada URL en tu navegador, confirma la pregunta exacta y
respóndeme por ítem `CONFIRMADO: <quote> — <URL>` o `RETIRAR: <frase>`.
Estimado total: 30–40 min. Las 3 cifras altas (F1–F3) ya vienen verificadas
por fetch (SII/Mintrab) — los ítems A–C son solo contra-chequeo de 5 min.

## A. Contra-chequeo dólar cierre dic-2025 — F1 (ALTA, ~2 min)

1. Abre <https://www.sii.cl/valores_y_fechas/dolar/dolar2025.htm>.
   Confirma: promedio dic-2025 ≈ $916,16; 30-dic ≈ $911,18; ningún día de
   diciembre tocó $970. → Si confirma: cifra corregida **~$118,0M** lista.
   Si NO: dime el valor exacto que ves y recalculo.

## B. Contra-chequeo UF 31-dic-2025 — F3 (ALTA, ~2 min)

2. Abre <https://www.sii.cl/valores_y_fechas/uf/uf2025.htm>.
   Confirma: UF 31-dic-2025 = **$39.727,96**. → Si confirma: equivalencia
   **~2.970 UF** lista. Si NO: dime el valor exacto.

## C. Contra-chequeo sueldo mínimo dic-2025 — F2 (ALTA, ~2 min)

3. Abre <https://www.bcn.cl/leychile/navegar?idNorma=1192720> (Ley 21.578)
   y/o <https://mintrab.gob.cl/reajuste-al-ingreso-minimo-mensual/>.
   Confirma: dic-2025 = **$529.000** (vigente desde 01-05-2025, Ley 21.751);
   ene–abr 2025 = **$510.636** (reajuste automático IPC, Ley 21.578 art. 1
   inc. 4). → Si confirma: fila 2025 corregida (escalón 510.636 + 529.000).
   Si NO: dime valores y fechas exactas.

## D. Serie IMM 1990–2024 + anomalía 2006 — NHV-1 (MEDIA, ~5 min)

4. En LeyChile busca las leyes de reajuste del ingreso mínimo por año.
   Confirma la serie fila por fila, con foco en **2006: $155.510** (único
   valor no redondo — ¿es correcto o es un error de tipeo por $155.000?).
   → Si no encuentras serie completa: fallback "retirar tabla anual
   detallada, conservar solo escalones verificados 2022–2025".

## E. Reajuste automático ene-2025 — NHV-2 (MEDIA, ~3 min)

5. En el texto de la Ley 21.578 (`idNorma=1192720` arriba): confirma el
   inciso que ordena el reajuste automático por IPC de ene-2025 (art. 1
   inc. 4 según excerpt BCN). → Quote del inciso o RETIRAR la mención.

## F. Esperanza de vida INE — NHV-4 (MEDIA, ~5 min)

6. Abre <https://www.ine.gob.cl/estadisticas/sociales/demografia-y-vitales/proyecciones-de-poblacion>.
   Busca la tabla con expectativa de vida por sexo (≈79 hombres / ≈82
   promedio / ≈84 mujeres) e indica: ¿base 2017 o base Censo 2024? → URL
   exacta de la tabla + valores literales + fecha. Si no aparecen esos
   valores: dime "retirar horizontes 301/333/366 como afirmación, usar
   como supuesto explícito".

## G. Drawdown NASDAQ-100 2000–2002 — NHV-5 (BAJA, ~3 min)

7. Abre <https://www.nasdaq.com/market-activity/index/ndx/historical>.
   Confirma el peak-to-trough mar-2000→oct-2002 (price y, si aparece,
   total-return). → % exacto o RETIRAR "casi 78%".

## H. Etiqueta Total Return — NHV-6 (BAJA, ~3 min)

8. Si la misma página de G ofrece serie total-return (NDXTR), confirma el
   +20,2% 2025 y los spots 1991/1998/1999. → Si no: fallback "re-etiquetar
   a price-return", sin verificación adicional.

## I. Rangos inmobiliarios — NHV-7 (MEDIA, ~5 min)

9. Por cada fuente citada (BDO Chile, BioBioChile, urbani.cl, TocToc, HDI
   Seguros 2025): URL + fecha de publicación. → Lo que no tenga URL+fecha:
   RETIRAR la atribución y conservar solo el anclaje UF ya corregido.

## J. Comisión AFP del período — NHV-8 (BAJA, ~3 min)

10. En SPensiones busca el rango de comisiones por AFP vigente en el
    período del ejercicio. → Rango + URL para el footnote, o RETIRAR el
    footnote propuesto.

## K. Interna (no navegador — tarea repo, ~10 min)

11. Ubicar el script/serie mensual original de la simulación + set de las
    24 lagunas (no están en el repo). Sin esto no hay re-simulación
    posible: o aparece el artefacto o el refresh usa serie reconstruida
    con escalones verificados (D+E) y lagunas fijadas por escrito.

---

**Al responder:** por letra, `CONFIRMADO` o `RETIRAR` según formato. Con eso
armo el refresh con TODO = 0 y va a compliance en sesión fresca.
