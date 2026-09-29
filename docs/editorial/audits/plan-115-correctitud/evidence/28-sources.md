# Anexo de fuentes primarias — pass 3 (commit 9e195743)

Fecha de consulta: **2026-09-29 (~21:05–21:15 UTC)**. Método: `curl` directo con
UA identificable (`monedario-math-audit/1.0`), extracción textual propia con
Python (regex + strip de tags, sin dependencias). Archivos crudos en
`/tmp/opencode/audit-src3/` con SHA-256. Todos respondieron HTTP 200 salvo donde
se indica.

Nota de estabilidad: los JSON de LeyChile **no son byte-estables** entre
sesiones (el `get_norma_json` regenera metadatos). El `idNorma=6368` cambió de
SHA-256 respecto de la sesión anterior (`85716958…` → `6a36972b…`): el contenido
de los artículos 42 bis y 59 extraído y citado aquí es textualmente idéntico al
de `evidence/22-sources.md`. La comparación válida es de texto, no de hash.

## S1 — SII tabla IGC AT2026 (art. 52, personas naturales)

URL: https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html
SHA-256: `33ac2cb354aaa4ad3541668818d516ab21a154df5e534724c61686714d3362ff`
(146.327 bytes)

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

Verificado por código (`27-recalc-independent.txt`): 258.696.240 = 310 ×
834.504; 32.395.445,28 = 38,82 × 834.504; 450.632,16 = 0,54 × 834.504;
317.823.680 / 8.000 = **39.727,96**. La página incluye además la tabla del
art. 52 bis (tope 150) para autoridades, que no es la general.

## S2 — SII UTM/UTA/IPC 2025 (UTA dic-2025)

URL: https://www.sii.cl/valores_y_fechas/utm/utm2025.htm
SHA-256: `3c9a63b9f232956d50779ab17a0f664683d792fcabbcb01d58b1100cf6827533`
(8.055 bytes)

```
Noviembre 69.542 834.504 109,47 0,3 3,7 3,4
Diciembre 69.542 834.504 109,26 -0,2 3,5 3,5
(2) UTA = Unidad Tributaria Anual (UTM x 12)
```

## S3 — SII UTM/UTA/IPC 2026 (serie IPC y UTM sep/oct)

URL: https://www.sii.cl/valores_y_fechas/utm/utm2026.htm
SHA-256: `d6dc68096d7bc8eebd19d889277d1da15d7fe2dc7b3de4cc6cbd41ce1d89e0fb`
(8.087 bytes)

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

La columna «Mensual (3)» es la variación oficial del INE. El dataset
`ipc-historico.json` reproduce 8/8 meses (ene–ago). El snapshot fija UTM
septiembre (71.721, `updated 2026-09-01`); la UTM de octubre ya está publicada
(72.151) pero aún no rige.

## S4 — SII IUSC 2026 (tabla mensual general)

URL: https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm
SHA-256: `a92c3df8f84121ff8a06285f183e817269314ff60e5bdb62bb8169cd334ed12d`
(73.987 bytes)

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

## S5 — SII FAQ 001.140.2738 (intereses de DAP de persona natural)

URL: https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2738.htm
SHA-256: `9a4049e47a493280c941fc44fbe76e304543d7ade047d1744a683ce6b943c3bd`
(3.931 bytes) — ID 001.140.2738.017, actualización **31/03/2026**.

```
¿Cómo tributan los intereses obtenidos por una Persona Natural por depósitos a plazo?
Los intereses de dicha inversión son rentas que están afectas al impuesto Golobal
Complemetario [sic], por lo tanto, debe incorporarlos en la determinación y
considerar, el monto exento del Impuesto Global Complementario correspondiente a
13,5 Unidades Tributarias Anuales (UTA). ... son rentas exentas si no superan las
20 UTM ...
```

No menciona retención del banco para residentes: sostiene la decisión de F03.

## S5b — SII FAQ 001.140.7297 (tasas de retención de honorarios por año comercial)

URL: https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_7297.htm
SHA-256: `857d9db78cd2f39d51527829b2b3ad2c843fe7e70351826c5cfaf3043f7b7f71`
(5.025 bytes) — ID 001.140.7297.004, actualización **01/04/2026**.

```
Las tasas de retenciones de honorarios, de acuerdo con cada año comercial, son las siguientes:
10,75% 2020 · 11,50% 2021 · 12,25% 2022 · 13,00% 2023 · 13,75% 2024 ·
14,50% 2025 · 15,25% 2026 · 16,00% 2027 · 17,00% 2028
```

## S5c — SII noticia 26-12-2025 (alza 14,5% → 15,25% desde el 1-1-2026)

URL: https://www.sii.cl/noticias/2025/261225noti01smn.htm
SHA-256: `4fdfe7e1ebfd18f9b151cd97a01c8265591fb6c04164c7c164505bf6f0ff11c6`
(4.994 bytes)

```
A partir del 1 de enero de 2026 ... la retención sobre las boletas de honorarios
subirá de 14,5% a 15,25% ... 0,75 puntos porcentuales respecto a lo retenido en 2025.
```

**Uso en esta auditoría (D15):** el año comercial 2025 usa 14,5% (consistente
con `AT2026.honorariosPpmRate = 0.145`); tres artículos editoriales del sitio
declaran 15,25% para boletas de 2025 / AT2026 — ver `32-f02-residual.txt`.

## S6 — SuperIR, requisitos de renegociación (persona deudora)

URL: https://www.superir.gob.cl/perfil-deudor-requisito-renegociacion
SHA-256: `bab51cab4970e0eeab57f6c192e3996d90dd05722edc6adac606a2a7d65ed0f5`
(90.751 bytes; redirección 301 → https, seguida con `curl -L`)

```
1. Tener 2 o más obligaciones vencidas, por más de 90 días corridos, actualmente
exigibles, que provengan de obligaciones distintas y que en total sumen más de
80 U.F.
```

Y en la sección principal de la misma página:
```
1. Tener dos o más deudas vencidas por más de 90 días corridos y que, en total
sumen más de 80 Unidades de Fomento (UF).
```

## S7 — LIR arts. 42 bis y 59 (LeyChile `get_norma_json`, idNorma=6368)

URL: https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=6368
SHA-256: `6a36972b7319ab4cbd3088d5f592ec63e2cf6f594032fc12fe31b878ef638477`
(925.048 bytes)

Art. 42 bis N°3 (extracto textual, extracción propia del nodo):

```
... el monto retirado, reajustado en la forma dispuesta en el inciso penúltimo
del número 3 del artículo 54º, quedará afecto a un impuesto único ... La tasa de
este impuesto será tres puntos porcentuales superior a la que resulte de
multiplicar por el factor 1,1, el producto, expresado como porcentaje, que
resulte de dividir, por el monto reajustado del retiro efectuado, la diferencia
entre el monto del impuesto global complementario determinado sobre las
remuneraciones del ejercicio incluyendo el monto reajustado del retiro y el monto
del mismo impuesto determinado sin considerar dicho retiro. Si el retiro es
efectuado por una persona pensionada o, que cumple con los requisitos de edad y
de monto de pensión ... no se aplicarán los recargos porcentuales ni el factor
antes señalados.
 Las administradoras de fondos de pensiones y las instituciones autorizadas ...
deberán practicar una retención de impuesto, con tasa 15% ... y servirá de abono
al impuesto único determinado.
```

Art. 42 bis N°2 (tope 600 UF, valor al 31 de diciembre):

```
... hasta por un monto total máximo anual equivalente a la diferencia entre 600
unidades de fomento, según el valor de ésta al 31 de diciembre del año respectivo,
menos el monto total del ahorro voluntario ...
```

Art. 59 (Impuesto Adicional): el 4% está en el inciso 2° N°1 letras a) y g); el
N°4 es fletes marítimos al 5%:

```
Este impuesto se aplicará, con tasa 35%, respecto de las rentas que se paguen o
abonen en cuenta a personas a que se refiere el inciso primero por concepto de:
1) Intereses. Estarán afectos a este impuesto, pero con una tasa del 4%, los
intereses provenientes de:
a) Depósitos en cuenta corriente y a plazo en moneda extranjera ...
g) los instrumentos señalados en las letras a), d) y e) anteriores, emitidos o
expresados en moneda nacional.
...
4) Fletes marítimos ... El impuesto de este número será de 5% ...
```

## S8 — Ley 20.720 art. 260 (SuperIR)

URL: https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=1058072
SHA-256: `4ede48cc3f65b36e447e946e214aebdec8e7cad415c5ccd07841a7958e4254ac`
(792.135 bytes)

```
La Persona Deudora podrá someterse a un Procedimiento Concursal de Renegociación
si tuviere dos o más obligaciones vencidas por más de 90 días corridos,
actualmente exigibles, provenientes de obligaciones diversas, cuyo monto total
sea superior a 80 unidades de fomento ...
```

El texto legal dice «obligaciones diversas», no «acreedores distintos»: el
motor exige ≥2 obligaciones calificadas y acepta el mismo acreedor (D3).

## S9 — Ley 19.628 arts. 17–18 (DICOM)

URL: https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=141599
SHA-256: `358c57e1b7f4b4c7df485f5b8cd5c1ccd444e91ec8dd0974f0ce949de3e39df9`
(60.838 bytes)

```
Artículo 18.- En ningún caso pueden comunicarse los datos a que se refiere el
artículo anterior ... luego de transcurridos cinco años desde que la respectiva
obligación se hizo exigible.
 Tampoco se podrá continuar comunicando los datos relativos a dicha obligación
después de haber sido pagada o haberse extinguido por otro modo legal.
```

## S10 — Ley 21.830 (IMM) y Ley 18.010 art. 10 (prepago)

- IMM — idNorma 1225354, SHA-256
  `ef4df43277423bbe515f9142fd154b9ec1f70b74ce8d90c17aa47bb04f38bd76`
  (9.488 bytes):
  `"Artículo 1.- A contar del 1 de mayo de 2026, elévase a $553.553 el ingreso
  mínimo mensual para los trabajadores mayores de 18 años de edad y hasta de 65
  años de edad."`
- Prepago — idNorma 29438, SHA-256
  `063a9003435cbf6286a54246d990961b21aeb0bb8dc6d7205484c5c0756930b3`
  (73.934 bytes):
  `Dicha comisión, no podrá exceder el valor de un mes de intereses pactados
  calculados sobre el capital que se prepaga` (no reajustables) / `un mes y
  medio de intereses` (reajustables). `Los pagos anticipados que sean inferiores
  al 10% del saldo de la obligación, requerirán siempre del consentimiento del
  acreedor.`

## S11 — Previred, comisiones AFP (cargo del trabajador)

URL: https://www.previred.com/indicadores-previsionales/
SHA-256: `bf969a1ac5d819bf920a58b86d0b1abc8cbea2f63fbd82f9314a1a4dad2ac4fd`
(89.539 bytes)

```
Capital 11,44% 0,1% 11,54% | Cuprum 11,44% ... | Habitat 11,27% 0,1% 11,37% |
PlanVital 11,16% ... | ProVida 11,45% ... | Modelo 10,58% ... | Uno 10,46% ...
(*) Aplica a pensionados cotizantes, mayores de ...
```

Verificado además con el gate del repo `node scripts/check-afp-commissions.mjs`
(2026-09-29): `✓ All AFP commission rates match Previred official figures.`
(`31-residuals-gates.txt`). Esto **levanta la reserva UNVERIFIED** que la
re-auditoría previa mantenía para el 11,27% del ejemplo V2.
