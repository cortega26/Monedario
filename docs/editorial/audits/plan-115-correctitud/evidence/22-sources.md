# Anexo de fuentes primarias — auditoría plan 115 (commit dd1e8f63)

Fecha de consulta: **2026-09-29 (~20:30 UTC)**. Método: `curl` directo con UA
identificable (`monedario-math-audit/1.0`), extracción textual con Python propio
(regex + strip de tags, sin dependencias). Archivos crudos en
`/tmp/opencode/audit-src/` (fuera del repo) con SHA-256.

Verificación cruzada: los SHA-256 de los 5 archivos SII y los 5 JSON de LeyChile
coinciden **byte por byte** con los registrados por la re-auditoría del mismo
día (`evidence/19-sources-reaudit.md`). Solo la página HTML de SuperIR difiere
(página dinámica; el texto normativo recuperado es idéntico).

## S1 — SII tabla IGC AT2026 (art. 52, personas naturales)

URL: https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html
SHA-256: `33ac2cb354aaa4ad3541668818d516ab21a154df5e534724c61686714d3362ff`
(HTTP 200, 146327 bytes)

```
$ 0,00 $ 11.265.804,00 Exento $ 0,00
$ 11.265.804,01 $ 25.035.120,00 0,04 $ 450.632,16
$ 25.035.120,01 $ 41.725.200,00 0,08 $ 1.452.036,96
$ 41.725.200,01 $ 58.415.280,00 0,135 $ 3.746.922,96
$ 58.415.280,01 $ 75.105.360,00 0,23 $ 9.296.374,56
$ 75.105.360,01 $ 100.140.480,00 0,304 $ 14.854.171,20
$ 100.140.480,01 $ 258.696.240,00 0,35 $ 19.460.633,28
$ 258.696.240,01 y más 0,40 $ 32.395.445,28
1 UTA del mes dic. de 2025 $ 834.504
2.- Exención ... 13,5 UTA del mes dic. de 2025 $11.265.804
8.000 UF del 31.12.2025 $317.823.680
```

Verificado por código (evidence/21): 258.696.240 = 310 × 834.504;
32.395.445,28 = 38,82 × 834.504; 11.265.804 = 13,5 × 834.504;
317.823.680 / 8.000 = **39.727,96**. La misma página trae después la tabla del
art. 52 bis (autoridades, tope 150) — no es la tabla general.

## S2 — SII UTM/UTA/IPC 2025 (UTA dic-2025)

URL: https://www.sii.cl/valores_y_fechas/utm/utm2025.htm
SHA-256: `3c9a63b9f232956d50779ab17a0f664683d792fcabbcb01d58b1100cf6827533`

```
Noviembre 69.542 834.504 109,47 0,3 3,7 3,4
Diciembre 69.542 834.504 109,26 -0,2 3,5 3,5
(2) UTA = Unidad Tributaria Anual (UTM x 12)
```

## S3 — SII UTM/UTA/IPC 2026 (serie IPC + UTM sep/oct)

URL: https://www.sii.cl/valores_y_fechas/utm/utm2026.htm
SHA-256: `d6dc68096d7bc8eebd19d889277d1da15d7fe2dc7b3de4cc6cbd41ce1d89e0fb`

```
Enero 69.751 837.012 109,71 0,4 0,4 2,8
Febrero 69.611 835.332 109,70 0,0 0,4 2,4
Marzo 69.889 838.668 110,75 1,0 1,4 2,8
Abril 69.889 838.668 112,18 1,3 2,7 4,0
Mayo 70.588 847.056 112,37 0,2 2,8 3,9
Junio 71.506 858.072 112,35 0,0 2,8 4,3
Julio 71.649 859.788 112,45 0,1 2,9 3,5
Agosto 71.649 859.788 113,15 0,6 3,6 4,1
Septiembre 71.721 860.652
Octubre 72.151 865.812
```

Nota del auditor: la página ya publica la UTM de **octubre (72.151)**. El
snapshot fija `utm: 71721 (updated 2026-09-01)`, vigente todo septiembre; al 29
de septiembre no hay rezago efectivo para cálculos de septiembre. El dataset IPC
del repo (`hastaFecha 2026-08-01`) coincide con lo último publicado (agosto).

## S4 — SII IUSC septiembre 2026, tabla mensual general

URL: https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm
SHA-256: `a92c3df8f84121ff8a06285f183e817269314ff60e5bdb62bb8169cd334ed12d`

```
MENSUAL -.- $ 968.233,50 Exento -.-
$ 968.233,51 $ 2.151.630,00 0,04 $ 38.729,34 2,20%
$ 2.151.630,01 $ 3.586.050,00 0,08 $ 124.794,54 4,52%
$ 3.586.050,01 $ 5.020.470,00 0,135 $ 322.027,29 7,09%
$ 5.020.470,01 $ 6.454.890,00 0,23 $ 798.971,94 10,62%
$ 6.454.890,01 $ 8.606.520,00 0,304 $ 1.276.633,80 15,57%
$ 8.606.520,01 $ 22.233.510,00 0,35 $ 1.672.533,72 27,48%
$ 22.233.510,01 Y MÁS 0,4 $ 2.784.209,22 MÁS DE 27,48%
```

Verificado por código: 22.233.510 = 310 × 71.721; 2.784.209,22 = 38,82 × 71.721;
1.672.533,72 = 23,32 × 71.721; 968.233,50 = 13,5 × 71.721.

## S5 — SII FAQ 001.140.2738 (DAP persona natural)

URL: https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2738.htm
SHA-256: `9a4049e47a493280c941fc44fbe76e304543d7ade047d1744a683ce6b943c3bd`
(ID 001.140.2738.017, actualización 31/03/2026)

```
¿Cómo tributan los intereses obtenidos por una Persona Natural por depósitos a plazo?
Los intereses de dicha inversión son rentas que están afectas al impuesto
Golobal Complemetario [sic], por lo tanto, debe incorporarlos en la
determinación y considerar, el monto exento del Impuesto Global
Complementario correspondiente a 13,5 Unidades Tributarias Anuales (UTA). ...
son rentas exentas si no superan las 20 UTM ...
```

Sin mención de retención del banco para residentes. Cita JSDoc/copys del repo
(art. 59 inciso 2° N°1 letras a) y g) para el 4% de no domiciliados) coherente
con S7.

## S6 — SuperIR, requisitos de renegociación

URL: https://www.superir.gob.cl/perfil-deudor-requisito-renegociacion
SHA-256 (esta sesión, página dinámica): `4242a33011841d03e532eb5d1f601874a8f0e21405e780c346ff06ef5ac82bf1`

```
1. Tener dos o más deudas vencidas por más de 90 días corridos y que, en total
sumen más de 80 Unidades de Fomento (UF). ...
1. Tener 2 o más obligaciones vencidas, por más de 90 días corridos,
actualmente exigibles, que provengan de obligaciones distintas y que en total
sumen más de 80 U.F.
```

## S7 — LIR art. 42 bis (APV) y art. 59 (4%), vía LeyChile JSON

Endpoint: `https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=6368`
SHA-256: `85716958b904435dedfc710479a21ab6f6a06d26e59420622314ba25b49079da`

Art. 42 bis N°3:
```
La tasa de este impuesto será tres puntos porcentuales superior a la que
resulte de multiplicar por el factor 1,1, el producto, expresado como
porcentaje, que resulte de dividir, por el monto reajustado del retiro
efectuado, la diferencia entre el monto del impuesto global complementario
determinado sobre las remuneraciones del ejercicio incluyendo el monto
reajustado del retiro y el monto del mismo impuesto determinado sin considerar
dicho retiro. Si el retiro es efectuado por una persona pensionada o, que
cumple con los requisitos de edad y de monto de pensión que establecen los
artículos 3º y 68 letra b) del decreto ley Nº 3.500, de 1980, o con los
requisitos para pensionarse que establece el decreto ley Nº 2.448, de 1979, no
se aplicarán los recargos porcentuales ni el factor antes señalados. ...
deberán practicar una retención de impuesto, con tasa 15% ... y servirá de
abono al impuesto único determinado.
... hasta por un monto total máximo anual equivalente a la diferencia entre
600 unidades de fomento, según el valor de ésta al 31 de diciembre del año
respectivo ...
```

Art. 59 (Impuesto Adicional, no domiciliados): el 4% de intereses está bajo el
N°1 (`Estarán afectos a este impuesto, pero con una tasa del 4%, los intereses
provenientes de: a) Depósitos en cuenta corriente y a plazo en moneda
extranjera ...`); el N°4 es `Fletes marítimos ... El impuesto de este número
será de 5%`.

## S8 — Ley 20.720 art. 260 (SuperIR)

Endpoint: `.../get_norma_json?idNorma=1058072`
SHA-256: `4ede48cc3f65b36e447e946e214aebdec8e7cad415c5ccd07841a7958e4254ac`

```
La Persona Deudora podrá someterse a un Procedimiento Concursal de
Renegociación si tuviere dos o más obligaciones vencidas por más de 90 días
corridos, actualmente exigibles, provenientes de obligaciones diversas, cuyo
monto total sea superior a 80 unidades de fomento ...
```

## S9 — Ley 19.628 arts. 17–18 (DICOM)

Endpoint: `.../get_norma_json?idNorma=141599`
SHA-256: `358c57e1b7f4b4c7df485f5b8cd5c1ccd444e91ec8dd0974f0ce949de3e39df9`

```
... en cuanto hayan sido repactadas, renegociadas o novadas, o éstas se
encuentren con alguna modalidad pendiente. ...
... luego de transcurridos cinco años desde que la respectiva obligación se
hizo exigible. Tampoco se podrá continuar comunicando los datos relativos a
dicha obligación después de haber sido pagada o haberse extinguido por otro
modo legal.
```

## S10 — Ley 21.830 (IMM) y Ley 18.010 art. 10 (prepago)

- idNorma 1225354, SHA-256 `ef4df43277423bbe515f9142fd154b9ec1f70b74ce8d90c17aa47bb04f38bd76`:
  `A contar del 1 de mayo de 2026, elévase a $553.553 el ingreso mínimo mensual
  para los trabajadores mayores de 18 años de edad y hasta de 65 años de edad.`
- idNorma 29438, SHA-256 `063a9003435cbf6286a54246d990961b21aeb0bb8dc6d7205484c5c0756930b3`:
  `Dicha comisión, no podrá exceder el valor de un mes de intereses pactados
  calculados sobre el capital que se prepaga` (no reajustables) /
  `un mes y medio de intereses` (reajustables).
  `Los pagos anticipados que sean inferiores al 10% del saldo de la obligación,
  requerirán siempre del consentimiento del acreedor.`

## S11 — Tasa AFP del ejemplo V2: NO VERIFICADA

`src/config/afpCommissions.ts:15`: Habitat total 11,27%. La página de la
Superintendencia consultada (article-2818, HTTP 200) es un FAQ sin tabla de
comisiones; no se recuperó extracto oficial CMF/Previred en esta sesión. El
11,27% queda como supuesto de entrada declarado (claim UNVERIFIED); la
aritmética de V2 bajo ese supuesto es exacta.
