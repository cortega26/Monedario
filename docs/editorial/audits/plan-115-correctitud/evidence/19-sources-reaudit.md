# Anexo de fuentes primarias — re-auditoría plan 115 (commit 8b73793)

Fecha de consulta: **2026-09-29, ~19:40 UTC**. Método: `curl` directo a las URLs
oficiales (UA identificable), extracción textual con scripts Python propios sin
dependencias. Las citas se transcriben del texto recuperado; los extractos BCN
provienen del endpoint JSON de LeyChile
(`nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=...`), decodificando
entidades HTML y recorriendo el árbol `html[].h[]...t` (doble articulado).

Los archivos crudos quedaron en `/tmp/opencode/sources/` (fuera del repo); sus
SHA-256 permiten verificar que la cita corresponde al archivo consultado.

## S1 — SII UTM/UTA/IPC 2025

URL: https://www.sii.cl/valores_y_fechas/utm/utm2025.htm
SHA-256 crudo: `3c9a63b9f232956d50779ab17a0f664683d792fcabbcb01d58b1100cf6827533`

Extracto (tabla mensual 2025; columnas UTM | UTA | IPC índice | IPC mes |
acumulada | 12 meses):

```
Noviembre | 69.542 | 834.504 | 109,47 | 0,3 | 3,7 | 3,4
Diciembre | 69.542 | 834.504 | 109,26 | -0,2 | 3,5 | 3,5
```

Nota oficial de la misma página: `(2) UTA = Unidad Tributaria Anual (UTM x 12)`.

## S2 — SII UTM/UTA/IPC 2026

URL: https://www.sii.cl/valores_y_fechas/utm/utm2026.htm
SHA-256 crudo: `d6dc68096d7bc8eebd19d889277d1da15d7fe2dc7b3de4cc6cbd41ce1d89e0fb`

Extracto (IPC mensual 2026, columna INE; y UTM/UTA):

```
Enero | 69.751 | 837.012 | 109,71 | 0,4 | 0,4 | 2,8
Febrero | 69.611 | 835.332 | 109,70 | 0,0 | 0,4 | 2,4
Marzo | 69.889 | 838.668 | 110,75 | 1,0 | 1,4 | 2,8
Abril | 69.889 | 838.668 | 112,18 | 1,3 | 2,7 | 4,0
Mayo | 70.588 | 847.056 | 112,37 | 0,2 | 2,8 | 3,9
Junio | 71.506 | 858.072 | 112,35 | 0,0 | 2,8 | 4,3
Julio | 71.649 | 859.788 | 112,45 | 0,1 | 2,9 | 3,5
Agosto | 71.649 | 859.788 | 113,15 | 0,6 | 3,6 | 4,1
Septiembre | 71.721 | 860.652
```

## S3 — SII IUSC septiembre 2026 (art. 43 N°1 LIR)

URL: https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm
SHA-256 crudo: `a92c3df8f84121ff8a06285f183e817269314ff60e5bdb62bb8169cd334ed12d`

Extracto (período MENSUAL, Septiembre 2026):

```
 | $ 968.233,51 | $ 2.151.630,00 | 0,04 | $ 38.729,34 | 2,20%
 | $ 2.151.630,01 | $ 3.586.050,00 | 0,08 | $ 124.794,54 | 4,52%
 | $ 3.586.050,01 | $ 5.020.470,00 | 0,135 | $ 322.027,29 | 7,09%
 | $ 5.020.470,01 | $ 6.454.890,00 | 0,23 | $ 798.971,94 | 10,62%
 | $ 6.454.890,01 | $ 8.606.520,00 | 0,304 | $ 1.276.633,80 | 15,57%
 | $ 8.606.520,01 | $ 22.233.510,00 | 0,35 | $ 1.672.533,72 | 27,48%
 | $ 22.233.510,01 | Y MÁS | 0,4 | $ 2.784.209,22 | MÁS DE 27,48%
```

Verificación: 22.233.510 = 310 × 71.721; 2.784.209,22 = 38,82 × 71.721;
1.672.533,72 = 23,32 × 71.721 (ejecutado en `11-recalc-independent-reaudit.txt`).

## S4 — SII IUSC art. 52 bis (tabla especial; NO es la general)

URL: https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026_art52.htm
SHA-256 crudo: `1a34a65240c62b3743990b87effdedf2d94f4b70c85dfd83234ca5c679a03b36`

Extracto: "La tabla que se presenta a continuación solo se aplicará a las rentas
afectas al IUSC que perciban exclusivamente por el desempeño de sus funciones el
Presidente de la República, Ministros de Estado, Subsecretarios, Senadores y
Diputados, siempre que tales rentas mensuales excedan del equivalente a 150 UTM
vigente en el mes respectivo."

## S5 — SII tabla IGC AT2026 (personas naturales)

URL: https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html
SHA-256 crudo: `33ac2cb354aaa4ad3541668818d516ab21a154df5e534724c61686714d3362ff`

Extractos:

```
$ 11.265.804,01 | $ 25.035.120,00 | 0,04 | $ 450.632,16
$ 100.140.480,01 | $ 258.696.240,00 | 0,35 | $ 19.460.633,28
$ 258.696.240,01 | y más | 0,40 | $ 32.395.445,28
2.- Exención de impuesto global complementario (art. 52 y 52 bis de la LIR). |
    13,5 UTA del mes dic. de 2025 | $11.265.804
10.- ... 8.000 UF del 31.12.2025 | $317.823.680
```

Verificación: 258.696.240 = 310 × 834.504; 32.395.445,28 = 38,82 × 834.504;
11.265.804 = 13,5 × 834.504; 317.823.680 / 8.000 = **39.727,96**.

## S6 — SII FAQ 001.140.2738 (intereses de DAP de persona natural)

URL: https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2738.htm
SHA-256 crudo: `9a4049e47a493280c941fc44fbe76e304543d7ade047d1744a683ce6b943c3bd`

Extracto: "Los intereses de dicha inversión son rentas que están afectas al
impuesto Golobal Complemetario ... considerar, el monto exento del Impuesto
Global Complementario correspondiente a 13,5 Unidades Tributarias Anuales
(UTA). ... la excención otorgada a los intereses, en el cado de que la persona
natural obtenga únicamente rentas gravadas como sueldos o pequeños
contribuyentes, son rentas exentas si no superan las 20 UTM ...". No menciona
retención del banco para residentes.

## S7 — SII retención de honorarios por año comercial

URL: https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_7297.htm
SHA-256 crudo: `857d9db78cd2f39d51527829b2b3ad2c843fe7e70351826c5cfaf3043f7b7f71`

Extracto: `14,50%` (tasa 2025; la misma página y la serie de aumento gradual
Ley 21.133 fijan 15,25% para 2026).

## S8 — SuperIR: requisitos de renegociación

URL: https://www.superir.gob.cl/perfil-deudor-requisito-renegociacion
SHA-256 crudo: `cef0a0aeccd1fdced4683c879776b2f68f7c23785d9c87d79aa0303d5802ce92`

Extractos:

- "1. Tener dos o más deudas vencidas por más de 90 días corridos y que, en
  total sumen más de 80 Unidades de Fomento (UF)."
- "Tener 2 o más obligaciones vencidas, por más de 90 días corridos,
  actualmente exigibles, que provengan de obligaciones distintas y que en total
  sumen más de 80 U.F."

## S9 — LIR art. 42 bis (BCN, idNorma 6368, última versión 2026-03-27)

SHA-256 crudo: `85716958b904435dedfc710479a21ab6f6a06d26e59420622314ba25b49079da`

Extractos:

- N°2: "... hasta por un monto total máximo anual equivalente a la diferencia
  entre **600 unidades de fomento, según el valor de ésta al 31 de diciembre
  del año respectivo**, menos el monto total del ahorro voluntario ...".
- N°3: "La tasa de este impuesto será **tres puntos porcentuales superior a la
  que resulte de multiplicar por el factor 1,1**, el producto, expresado como
  porcentaje, que resulte de dividir, por el monto reajustado del retiro
  efectuado, la diferencia entre el monto del impuesto global complementario
  determinado sobre las remuneraciones del ejercicio incluyendo el monto
  reajustado del retiro y el monto del mismo impuesto determinado sin
  considerar dicho retiro. Si el retiro es efectuado por una **persona
  pensionada** o, que cumple con los requisitos de edad y de monto de pensión
  ... **no se aplicarán los recargos porcentuales ni el factor** antes
  señalados."
- N°3: "Las administradoras de fondos de pensiones ... deberán practicar una
  **retención de impuesto, con tasa 15%** ... y servirá de abono al impuesto
  único determinado."

## S10 — LIR art. 59 (BCN, idNorma 6368)

Extractos (inciso segundo):

- N°1: "... con una **tasa del 4%**, los intereses provenientes de: a) Depósitos
  en cuenta corriente y a plazo en moneda extranjera ...; ... g) los
  instrumentos señalados en las letras a), d) y e) anteriores, emitidos o
  expresados en moneda nacional."
- N°4: "**Fletes marítimos**, comisiones o participaciones en fletes marítimos
  ... El impuesto de este número será de **5%** ..."

## S11 — Ley 20.720 art. 260 (BCN, idNorma 1058072)

SHA-256 crudo: `4ede48cc3f65b36e447e946e214aebdec8e7cad415c5ccd07841a7958e4254ac`

Extracto: "La Persona Deudora podrá someterse a un Procedimiento Concursal de
Renegociación si tuviere **dos o más obligaciones vencidas por más de 90 días
corridos, actualmente exigibles, provenientes de obligaciones diversas, cuyo
monto total sea superior a 80 unidades de fomento** ...".

## S12 — Ley 19.628 arts. 17 y 18 (BCN, idNorma 141599)

SHA-256 crudo: `358c57e1b7f4b4c7df485f5b8cd5c1ccd444e91ec8dd0974f0ce949de3e39df9`

Extractos:

- Art. 17: "... **en cuanto hayan sido repactadas, renegociadas o novadas**, o
  éstas se encuentren con alguna modalidad pendiente. ..."
- Art. 18: "... **luego de transcurridos cinco años desde que la respectiva
  obligación se hizo exigible. Tampoco se podrá continuar comunicando los datos
  relativos a dicha obligación después de haber sido pagada o haberse extinguido
  por otro modo legal**."

## S13 — Ley 21.830 (BCN, idNorma 1225354)

SHA-256 crudo: `ef4df43277423bbe515f9142fd154b9ec1f70b74ce8d90c17aa47bb04f38bd76`

Extracto: "Artículo 1.- A contar del 1 de mayo de 2026, elévase a **$553.553**
el ingreso mínimo mensual para los trabajadores mayores de 18 años de edad y
hasta de 65 años de edad. ..."

## S14 — Ley 18.010 art. 10 (BCN, idNorma 29438)

SHA-256 crudo: `063a9003435cbf6286a54246d990961b21aeb0bb8dc6d7205484c5c0756930b3`

Extracto: "... en las operaciones de crédito de dinero cuyo importe en capital
no supere el equivalente a **5.000 unidades de fomento**, el deudor ... podrá
anticipar su pago ... a) ... más la comisión de prepago. Dicha comisión, no
podrá exceder el valor de **un mes de intereses** pactados calculados sobre el
capital que se prepaga. b) ... **un mes y medio de intereses** ... Los pagos
anticipados que sean inferiores al **10%** del saldo de la obligación,
requerirán siempre del consentimiento del acreedor."

## S15 — Ley 21.236 (portabilidad; contexto de D6)

URL: https://www.bcn.cl/leychile/navegar?idNorma=1146340
SHA-256 crudo: `4947ebfc7a3f11f677ee927c924486d66b1120b68e83fb4153fc2f6275115fd3`

Extracto: "Artículo 1.- Objeto. Esta ley tiene por objeto promover la
portabilidad financiera, facilitando que las personas ... se cambien ... de un
proveedor de servicios financieros a otro ...". No fija los topes de comisión
de prepago (estos están en Ley 18.010 art. 10, S14).

## S16 — Datos internos usados como entrada (no como fórmula)

- `src/data/economic-history/ipc-historico.json`: 2026-01…2026-08 =
  0,4 / 0 / 1,0 / 1,3 / 0,2 / 0 / 0,1 / 0,6; `hastaFecha 2026-08-01`;
  `actualizadoEl 2026-09-29`.
- `src/data/economic-history/uf-historico.json`: 2025-12-01 = 39.643,59;
  2025-12-31 = 39.727,96. **Último dato del dataset: 2026-07-09**
  (`actualizadoEl 2026-06-21`) — ver limitaciones del informe.
- `src/infrastructure/economic/economic-parameters.snapshot.json`: utm 71.721
  (updated 2026-09-01), uta 834.504 (updated 2025-12-01), uf 41.049,01
  (2026-09-29), ipc 0,6 (2026-08-01), imm 553.553 (2026-05-01).
- `src/config/afpCommissions.ts`: Habitat total 11,27% — comentario de fuente
  "Previred Indicadores Previsionales abril 2026" (no verificado contra CMF en
  esta sesión; ver limitaciones).
