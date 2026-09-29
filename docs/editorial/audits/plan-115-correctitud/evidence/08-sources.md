# Anexo de fuentes primarias — auditoría plan-115-correctitud

Fecha de consulta: 2026-09-29 (UTC). Commit auditado: `d1b1237444bb234535f6b140ac4fe76ab10ed4c3`.

> Las citas se transcriben del texto oficial recuperado; los extractos de BCN
> se obtuvieron del endpoint JSON de LeyChile
> (`nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=...`), decodificando
> entidades HTML. No se usaron valores "de memoria".

## S-A — SII: tabla IUSC septiembre 2026 (art. 43 N°1 LIR), UTM $71.721

URL: https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm
Consulta: 2026-09-29

Extracto textual (período MENSUAL, Septiembre 2026):

```
-.-            | $ 968.233,50        | Exento | -.-
$ 968.233,51   | $ 2.151.630,00      | 0,04   | $ 38.729,34
$ 2.151.630,01 | $ 3.586.050,00      | 0,08   | $ 124.794,54
$ 3.586.050,01 | $ 5.020.470,00      | 0,135  | $ 322.027,29
$ 5.020.470,01 | $ 6.454.890,00      | 0,23   | $ 798.971,94
$ 6.454.890,01 | $ 8.606.520,00      | 0,304  | $ 1.276.633,80
$ 8.606.520,01 | $ 22.233.510,00     | 0,35   | $ 1.672.533,72
$ 22.233.510,01| Y MÁS               | 0,4    | $ 2.784.209,22
```

Verificación aritmética: 22.233.510 = 310 × 71.721; 2.784.209,22 = 38,82 × 71.721.
El tramo 35% llega hasta **310 UTM** (no 150) y el 40% arranca en 310 UTM.
La misma página (pestaña "Todos los meses") muestra Octubre 2026 con idéntica
estructura (35% hasta $22.366.810 = 310 × 72.151; 40% con rebaja $2.800.901,82).

## S-B — SII: tabla IUSC art. 52 bis letra a) LIR (el motor implementa esta)

URL: https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026_art52.htm
Consulta: 2026-09-29

Extracto:

```
La tabla que se presenta a continuación solo se aplicará a las rentas afectas
al IUSC que perciban exclusivamente ... el Presidente de la República,
Ministros de Estado, Subsecretarios, Senadores y Diputados, siempre que tales
rentas mensuales excedan del equivalente a 150 UTM ...
...
$ 8.606.520,01 | $ 10.758.150,00    | 0,35 | $ 1.672.533,72
$ 10.758.150,01| Y MÁS              | 0,4  | $ 2.210.441,22
```

Esta es exactamente la estructura que reproduce `buildSecondCategoryTaxBrackets`
(35% hasta 150 UTM, 40% sobre 150 UTM con rebaja 30,82 UTM), pero corresponde a
la tabla del art. 52 bis — no a la general del art. 43 N°1 (S-A).

## S-C — SII: tabla IGC AT2026 art. 52 LIR y tabla art. 52 bis

URL: https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html
Consulta: 2026-09-29

Tabla general (art. 52 LIR), extracto:

```
$ 75.105.360,01 | $ 100.140.480,00 | 0,304 | $ 14.854.171,20
$ 100.140.480,01| $ 258.696.240,00 | 0,35  | $ 19.460.633,28
$ 258.696.240,01| y más            | 0,40  | $ 32.395.445,28
```

Verificación: 258.696.240 = 310 × 834.504; 32.395.445,28 = 38,82 × 834.504.

Tabla art. 52 bis (Presidente, ministros, subsecretarios, senadores y diputados),
extracto:

```
$ 100.140.480,01| $ 125.175.600,00 | 0,35 | $ 19.460.633,28
$ 125.175.600,01| y más            | 0,40 | $ 25.719.413,28
```

El motor replica la segunda (150 UTA), no la general (310 UTA).

## S-D — SII: UTM/UTA/IPC 2025

URL: https://www.sii.cl/valores_y_fechas/utm/utm2025.htm
Consulta: 2026-09-29

Extracto (2025): Noviembre y Diciembre UTM $69.542, UTA $834.504; IPC
mensual 2025: ene 1,1 / feb 0,4 / mar 0,5 / abr 0,2 / may 0,2 / jun −0,4 /
jul 0,9 / ago 0,0 / sep 0,4 / oct 0,0 / nov 0,3 / dic −0,2.
Nota oficial: "UTA = Unidad Tributaria Anual (UTM x 12)".

## S-E — SII: UTM/UTA/IPC 2026

URL: https://www.sii.cl/valores_y_fechas/utm/utm2026.htm
Consulta: 2026-09-29

Extracto (IPC mensual, columna INE): ene 0,4 / feb 0,0 / mar 1,0 / abr 1,3 /
may 0,2 / jun 0,0 / jul 0,1 / ago 0,6; acumulado 2026 a agosto: 3,6.
UTM sep-2026 $71.721; UTA $860.652.

Estos valores coinciden 1:1 con `src/data/economic-history/ipc-historico.json`
(claim V6) y con los tests del repo.

## S-F — SII: UF al 31.12.2025 (= $39.727,96)

URL: https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html
Consulta: 2026-09-29

Extracto (tabla de exenciones AT2026):

```
10.- INR ... bienes raíces agrícolas y no agrícolas ...
     8.000 UF del 31.12.2025     $317.823.680
```

317.823.680 / 8.000 = **39.727,96**. Fuente independiente oficial:
MDSF — Precios Sociales 2026, Tabla A.1:
"Unidad de Fomento 31 diciembre 2025 | SII | CLP 39.727,96"
(https://sni.gob.cl/wp-content/uploads/Precios-Sociales-2026.pdf).
Además, la serie propia del repo
(`src/data/economic-history/uf-historico.json`) registra 2025-12-31 = 39.727,96
y 2025-12-01 = 39.643,59.

## S-G — SII FAQ 001.140.2738 (intereses de DAP de persona natural)

URL: https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2738.htm
Consulta: 2026-09-29

Extracto: "Los intereses de dicha inversión son rentas que están afectas al
impuesto Global Complementario ... considerar, el monto exento del Impuesto
Global Complementario correspondiente a 13,5 Unidades Tributarias Anuales
(UTA). Debe considerar que la exención otorgada a los intereses, en el caso de
que la persona natural obtenga únicamente rentas gravadas como sueldos o
pequeños contribuyentes, son rentas exentas si no superan las 20 UTM ..."
(La FAQ no menciona retención del banco para residentes.)

## S-H — LIR art. 42 bis (BCN, idNorma 6368, versión 2026-03-27)

Consulta vía API LeyChile: 2026-09-29

Extractos:

- "1. Podrán rebajar ... hasta por un monto total mensual equivalente a
  **50 unidades de fomento**, según el valor de ésta al último día del mes
  respectivo."
- "2. ... hasta por un monto total máximo anual equivalente a la diferencia
  entre **600 unidades de fomento, según el valor de ésta al 31 de diciembre
  del año respectivo** ..."
- "3. En caso que los recursos ... sean retirados y no se destinen a anticipar
  o mejorar las pensiones de jubilación ... quedará afecto a un impuesto único
  ... La tasa de este impuesto será **tres puntos porcentuales superior a la
  que resulte de multiplicar por el factor 1,1**, el producto, expresado como
  porcentaje, que resulte de dividir, por el monto reajustado del retiro
  efectuado, la diferencia entre el monto del impuesto global complementario
  determinado sobre las remuneraciones del ejercicio incluyendo el monto
  reajustado del retiro y el monto del mismo impuesto determinado sin
  considerar dicho retiro. Si el retiro es efectuado por una persona
  pensionada o, que cumple con los requisitos de edad y de monto de pensión
  ... **no se aplicarán los recargos porcentuales ni el factor antes
  señalados**."
- "Las administradoras ... deberán practicar una **retención de impuesto, con
  tasa 15%** ... y servirá de abono al impuesto único determinado."

## S-I — LIR art. 59 (BCN, idNorma 6368)

Extracto (inciso segundo, enumeración):

- "**1) Intereses. Estarán afectos a este impuesto, pero con una tasa del
  4%**, los intereses provenientes de: a) Depósitos en cuenta corriente y a
  plazo en moneda extranjera ...; b) Créditos otorgados desde el exterior ...;
  c) Saldos de precios ...; d) Bonos o debentures ...; e) Bonos o debentures y
  demás títulos emitidos en moneda extranjera por el Estado de Chile o el
  Banco Central ...; f) ... ALADI (ABLAS) ...; **g) los instrumentos señalados
  en las letras a), d) y e) anteriores, emitidos o expresados en moneda
  nacional**."
- "4) Fletes marítimos, comisiones o participaciones en fletes marítimos ...
  El impuesto de este número será de **5%** ..."

Conclusión: la retención del 4% para no domiciliados/no residentes (incluidos
los DAP en pesos por la letra g) está en el **N°1**, no en el N°4. El N°4 es
fletes marítimos (5%).

## S-J — Ley 20.720 art. 260 (BCN, idNorma 1058072; texto con Ley 21.563)

Extracto: "La Persona Deudora podrá someterse a un Procedimiento Concursal de
Renegociación si tuviere **dos o más obligaciones vencidas por más de 90 días
corridos, actualmente exigibles, provenientes de obligaciones diversas, cuyo
monto total sea superior a 80 unidades de fomento**, siempre y cuando no haya
sido notificada de una demanda que solicite el inicio de un Procedimiento
Concursal de Liquidación Simplificada."

Claves: umbral **estricto** ("superior a 80 UF"); el requisito se refiere a
**obligaciones diversas**, no a "acreedores distintos".

## S-K — SuperIR: requisitos de renegociación

URL: https://www.superir.gob.cl/perfil-deudor-requisito-renegociacion
Consulta: 2026-09-29

Extracto: "1. Tener **dos o más deudas vencidas por más de 90 días corridos y
que, en total sumen más de 80 Unidades de Fomento (UF)**." En el modal de la
misma página: "Tener 2 o más obligaciones vencidas, por más de 90 días
corridos, actualmente exigibles, **que provengan de obligaciones distintas** y
que en total sumen más de 80 U.F."

## S-L — Ley 19.628 arts. 17 y 18 (BCN, idNorma 141599)

Extractos:

- Art. 17: "... sólo podrán comunicar información que verse sobre obligaciones
  de carácter económico, financiero, bancario o comercial, cuando éstas
  consten en letras de cambio y pagarés protestados; cheques protestados ...
  Se exceptúa ... la información relacionada con obligaciones de carácter
  económico, financiero, bancario o comercial **en cuanto hayan sido
  repactadas, renegociadas o novadas**, o éstas se encuentren con alguna
  modalidad pendiente. ... tampoco las deudas contraídas con instituciones de
  educación superior ... ni alguna deuda contraída con la finalidad de recibir
  ... un servicio educacional formal ..." (esta última exclusión proviene de la
  Ley 21.214).
- Art. 18: "En ningún caso pueden comunicarse los datos a que se refiere el
  artículo anterior ... **luego de transcurridos cinco años desde que la
  respectiva obligación se hizo exigible. Tampoco se podrá continuar
  comunicando los datos relativos a dicha obligación después de haber sido
  pagada o haberse extinguido por otro modo legal**."

## S-M — Ley 21.830 (IMM $553.553 desde 01-05-2026)

URL (D.O. 22-06-2026): https://www.doe.cl/alerta/22062026/2829298 y
https://www.diariooficial.interior.gob.cl/publicaciones/2026/06/22/44481-B/01/2829298.pdf
BCN: https://www.bcn.cl/leychile/navegar?idNorma=1225354
Consulta: 2026-09-29

Extracto: "Artículo 1.- A contar del 1 de mayo de 2026, elévase a **$553.553**
el ingreso mínimo mensual para los trabajadores mayores de 18 años de edad y
hasta de 65 años de edad. ..."

**Nota de alcance:** `00-scope.json` cita S6 como `idNorma=1211138`. Ese
idNorma corresponde a un decreto de 2024 sobre comisión de servicio del
Ministerio de Vivienda y Urbanismo, no a la Ley 21.830. El identificador
correcto es `idNorma=1225354`. El valor $553.553 y la fecha 01-05-2026 usados
por el sitio son correctos.

## S-N — SII: retención de honorarios por año comercial

URLs:
https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_7297.htm
https://www.sii.cl/destacados/boletas_honorarios/aumento_gradual.html
Consulta: 2026-09-29

Extracto: "14,50% | 2025; 15,25% | 2026; 16,00% | 2027; 17,00% | 2028".
Ley 21.133. El valor 0,145 congelado en AT2026 es correcto para boletas 2025.

## S-O — Ley 18.010 art. 10 (prepago y comisión)

URL: https://www.suseso.gob.cl/612/w3-propertyvalue-94947.html (texto oficial)
Consulta: 2026-09-29

Extracto: "... el deudor ... podrá anticipar su pago ... a) Tratándose de
operaciones no reajustables ... más la comisión de prepago. Dicha comisión, no
podrá exceder el valor de **un mes de intereses** pactados calculados sobre el
capital que se prepaga. b) Tratándose de operaciones reajustables ... **un mes
y medio de intereses** ... Los pagos anticipados que sean inferiores al 20%
del saldo ... requerirán ... consentimiento del acreedor."

Contexto Ley 21.236 (portabilidad): regula el traslado de productos y prohíbe
cobros por la portación; no fija los topes de comisión de prepago (esos están
en Ley 18.010 art. 10).

## S-P — Contexto de tabla (Ley 21.210 y tramo 310 UTM/UTA)

Las tablas SII de S-A y S-C son las vigentes para AT2026. El tramo 35% con
tope en 310 UTM/UTA y el 40% sobre ese tope corresponden a la estructura
posterior a la Ley 21.210 (D.O. 24.02.2020), que el propio texto legal de BCN
anota en los artículos 43 y 52. La tabla del art. 52 bis (150 UTM/UTA) se
mantiene como régimen especial.
