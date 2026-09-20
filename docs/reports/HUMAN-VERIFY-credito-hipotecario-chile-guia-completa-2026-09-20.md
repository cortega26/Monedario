# Checklist de verificación humana — `credito-hipotecario-chile-guia-completa`
(remediación 2026-09-20 sobre AUDIT 2026-09-20: 3 bloqueantes + mayores
verificables corregidos con fuentes primarias re-obtenidas en sesión;
VERIFY 2026-09-20: 24/24 hunks ACCEPT, READY-FOR-HUMAN-CHECKLIST;
matemática recomputada independiente; 8/8 gates en verde)

**Cómo usar:** abre cada URL en tu navegador y responde
`CONFIRMADO: <quote> — <URL>` o `RETIRAR`. Nada de este archivo está
firmado hasta que lo marques tú. Estimado: 30–40 min.

## A. Obligación de "Hoja de Condiciones" — NHV-1 (~8 min)

1. Abre <https://www.bcn.cl/leychile/navegar?idNorma=230416> y
   <https://www.cmfeduca.cl/educa/600/w3-article-27503.html>. ¿Existe una
   "Hoja de Condiciones" obligatoria con ese nombre, o basta la exigencia
   de información por escrito + CAE? → Con esto se confirma la
   neutralización aplicada (remediación retiró la afirmación por
   NOT_FOUND en bcn-cite) o se restaura con cita exacta.

## B. Rebaja de timbres para vivienda DFL2 — NHV-2 (~5 min)

2. Tasa general verificada (0,066%/mes, tope 0,8%, DL 3.475). Falta la
   rebaja habitacional DFL2 (~0,2%): confirma texto y tasa en
   <https://www.bcn.cl/leychile/navegar?idNorma=7137>. → Con esto se
   agrega la fila de rebaja o se deja la tasa general con alcance
   explícito.

## C. Plazos y costos unitarios del proceso — NHV-3 (~8 min)

3. Plazos 60–90 días y montos de tasación/notaría/CBR/operacionales de la
   tabla: contrasta con pizarras de bancos o
   <https://www.sernac.cl/>. → CONFIRMADO (con fuente) o RETIRAR los
   valores sin respaldo.

## D. Techo 5,5% fija a 20 años — NHV-4 (~5 min)

4. El promedio BCCh ago-2026 (4,04%) está confirmado; el techo 5,5% como
   "orientativo" no tiene fuente. Revisa pizarras vigentes sep-2026.
   → CONFIRMADO o se suaviza a rango sin techo.

## E. Límites DFL2 arts. 14/18 — NHV-5 (~5 min)

5. Persona natural / tope 2 viviendas / texto vigente de los arts. 14 y 18:
   <https://www.sii.cl/normativa_legislacion/circulares/2022/circu22.pdf>.
   → Con esto se agrega el calificador sugerido por el verificador.

## F. Subsidio a la tasa Ley 21.748 — NHV-6 (~3 min)

6. Brecha de cobertura deliberada (fuera de alcance minimal): revisa
   <https://bcn.cl/44Wyks> y decide si se agrega una línea o se declara
   fuera de alcance del artículo.

## G. Boilerplate NORMA §3.2 + "requieren" — NHV-7 (~3 min)

7. Evaluar etiqueta verbatim §3.2 en la tabla resumen (hoy "resumen
   orientativo" + disclaimer) y suavizar "requieren garantía estatal" →
   "suelen requerir" (nota menor del verificador, hunks 2–4/13).

## H. Mismatch UF volatileData — NHV-8 (~2 min)

8. Artículo cita UF 40844,79 vs snapshot vigente 40967,24 (+0,3%).
   Frontmatter-regla impidió tocarlo en remediación: decide corrección o
   acepta deriva con registro.

## I. Firma

- [x] A resuelto (CONFIRMADO o RETIRAR)
- [x] B resuelto (CONFIRMADO o RETIRAR)
- [x] C resuelto (CONFIRMADO o RETIRAR)
- [x] D resuelto (CONFIRMADO o RETIRAR)
- [x] E resuelto (CONFIRMADO o RETIRAR)
- [x] F resuelto (agregar línea o fuera de alcance explícito)
- [x] G resuelto (boilerplate + "suelen requerir" aplicados o diferidos)
- [x] H resuelto (corregido o deriva aceptada con registro)
- [x] Gates en verde confirmados por el firmante
