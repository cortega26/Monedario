# Fuentes primarias — pass 4 (auditoría plan 115, commit 72d14e66)

Fecha de consulta: **2026-09-29 (UTC; consulta ~22:15–22:40Z)**. Método: `curl` directo con UA identificable (`monedario-math-audit/1.0`), extracción textual propia con Python (regex + strip de tags, sin dependencias). Archivos crudos en `/tmp/opencode/plan115-pass4/sources/`. HTTP 200 en todas las URLs salvo donde se indica.

## S1 — SII, tabla IGC AT2026 (art. 52 LIR) y valores dic-2025

URL: https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html
SHA-256: `33ac2cb354aaa4ad3541668818d516ab21a154df5e534724c61686714d3362ff` (146327 bytes)
Consultada: 2026-09-29 (UTC; consulta ~22:15–22:40Z)

```
artículo 52 de la LIR. Renta imponible anual Factor Cantidad a rebajar Desde Hasta $ 0,00 $ 11.265.804,00 Exento $ 0,00 $ 11.265.804,01 $ 25.035.120,00 0,04 $ 450.632,16 $ 25.035.120,01 $ 41.725.200,00 0,08 $ 1.452.036,96 $ 41.725.200,01 $ 58.415.280,00 0,135 $ 3.746.922,96 $ 58.415.280,01 $ 75.105.360,00 0,23 $ 9.296.374,56 $ 75.105.360,01 $ 100.140.480,00 0,304 $ 14.854.171,20 $ 100.140.480,01 $ 258.696.240,00 0,35 $ 19.460.633,28 $ 258.696.240,01 y más 0,40 $ 32.395.445,28 Tabla de cálculo del Impuesto Global Complementario vigente para el año tributario 2026, para contribuyentes
...
(art. 40 Nº 6 de la LIR) . La referida liberación no rige respecto de las EIRL. 1 UTA del mes dic. de 2025 $ 834.504 2.- Exención de impuesto global complementario (art. 52 y 52 bis de la LIR) . 13,5 UTA del mes dic. de 2025 $11.265.804 3.-
8.000 UF del 31.12.2025 $317.823.680 Monto máximo a deducir por concepto de gast
```
La página incluye además la tabla del art. 52 bis (autoridades), distinta de la general. 317.823.680 / 8.000 = 39.727,96 (ver `34-recalc-independent.txt`).

## S2 — SII, UTM/UTA/IPC 2025 (UTA dic-2025)

URL: https://www.sii.cl/valores_y_fechas/utm/utm2025.htm
SHA-256: `3c9a63b9f232956d50779ab17a0f664683d792fcabbcb01d58b1100cf6827533` (8055 bytes)
Consultada: 2026-09-29 (UTC; consulta ~22:15–22:40Z)

```
Noviembre 69.542 834.504 109,47 0,3 3,7 3,4 Diciembre 69.542 834.504 109,26 -0,2 3,5 3,5 (
Diciembre 69.542 834.504 109,26 -0,2 3,5 3,5 (1) UTM = Unidad Tributaria Mensual (2) UTA =
(1) UTM = Unidad Tributaria Mensual
(2) UTA = Unidad Tributaria Anual (UTM x 12)
```

## S3 — SII, UTM/UTA/IPC 2026 (serie IPC 2026 y UTM sep/oct)

URL: https://www.sii.cl/valores_y_fechas/utm/utm2026.htm
SHA-256: `d6dc68096d7bc8eebd19d889277d1da15d7fe2dc7b3de4cc6cbd41ce1d89e0fb` (8087 bytes)
Consultada: 2026-09-29 (UTC; consulta ~22:15–22:40Z)

```
ltimos 12 meses (5) Enero 69.751 837.012 109,71 0,4 0,4 2,8 Febrero 69.611 835.332 109,70 0,0 0,4 2,4 Marzo 69.889 838.668 110,75 1,0 1,4 2,8 Abril 69.889 838.668 112,18 1,3 2,7 4,0 Mayo 70.588 847.056 112,37 0,2 2,8 3,9 Junio 71.506 858.072 112,35 0,0 2,8 4,3 Julio 71.649 859.788 112,45 0,1 2,9 3,5 Agosto 71.649 859.788 113,15 0,6 3,6 4,1 Septiembre 71.721 860.652 Octubre 72.151 865.812 Noviembre Diciembre (1) UTM = Unidad Tributaria Mensual (2) UTA = Unidad Tributaria Anual (UTM x 12) (3) Variación mensual : Corresponde a la publicada oficialmente por el INE en cada mes. (4) Variación acumulada 2026 : Corresponde a la acumulada a la fecha respecto del mes de Diciembre del año anterior. (5) Variación Ultimos 12 meses : Corresponde a la variación de los últimos doce meses. (6) IPC Valor en Puntos : A partir del mes de enero 2024, el INE ha procedido a recalcular los IPC, tomando como base anual 2023=100. La serie empalmada de IPC desde diciembre 2009 hasta la fecha, puede ser consultada en www.ine.cl .
```
Columnas: UTM | UTA | IPC base | variación mensual (3) | acumulado 2026 (4) | últimos 12 meses (5). El dataset `ipc-historico.json` reproduce 8/8 meses (ene–ago): 0,4 / 0 / 1,0 / 1,3 / 0,2 / 0 / 0,1 / 0,6.

## S4 — SII, IUSC 2026 (tabla mensual; septiembre embebida en la página)

URL: https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm
SHA-256: `a92c3df8f84121ff8a06285f183e817269314ff60e5bdb62bb8169cd334ed12d` (73987 bytes)
Consultada: 2026-09-29 (UTC; consulta ~22:15–22:40Z)

```
ebajar Tasa de Impuesto Efectiva, máxima por cada tramo de Renta Desde Hasta MENSUAL -.- $ 968.233,50 Exento -.- Exento $ 968.233,51 $ 2.151.630,00 0,04 $ 38.729,34 2,20% $ 2.151.630,01 $ 3.586.050,00 0,08 $ 124.794,54 4,52% $ 3.586.050,01 $ 5.020.470,00 0,135 $ 322.027,29 7,09% $ 5.020.470,01 $ 6.454.890,00 0,23 $ 798.971,94 10,62% $ 6.454.890,01 $ 8.606.520,00 0,304 $ 1.276.633,80 15,57% $ 8.606.520,01 $ 22.233.510,00 0,35 $ 1.672.533,72 27,48% $ 22.233.510,01 Y MÁS 0,4 $ 2.784.209,22 MÁS DE 27,48% QUINCENAL -.- $ 484.116,75 Exento -.- Exento $ 484.116,76 $ 1.075.815,00 0,04 $ 19.364,67 2,20% $ 1.075.815,01 $ 1.793.025,00 0,08 $ 6
```
La página sirve por defecto la tabla de octubre 2026 (UTM 72.151) e incluye la de septiembre 2026 (UTM 71.721) en el mismo HTML: 13,5 UTM = $968.233,50; 4% con rebaja $38.729,34; 35% hasta $22.233.510; 40% con rebaja $2.784.209,22.

## S5 — SII FAQ 001.140.2738.017 (intereses DAP persona natural; act. 31/03/2026)

URL: https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2738.htm
SHA-256: `9a4049e47a493280c941fc44fbe76e304543d7ade047d1744a683ce6b943c3bd` (3931 bytes)
Consultada: 2026-09-29 (UTC; consulta ~22:15–22:40Z)

```
Los intereses de dicha inversión son rentas que están afectas al impuesto Golobal Complemetario, por lo tanto, debe incorporarlos en la determinación y considerar, el monto exento del Impuesto Global Complementario correspondiente a 13,5 Unidades Tributarias Anuales (UTA). Debe considerar que la excención otorgada a los intereses, en el cado de que la persona natural obtenga únicamente rentas gravadas como sueldos o pequeños contribuyentes, son rentas exentas si no superan las 20 UTM, límite que no supera, además, las rentas por dividendos Normativa Relacionada Ver más
```
No menciona retención del banco para residentes; el 4% del art. 59 LIR es Impuesto Adicional de no domiciliados/no residentes (chapeau del inciso 2°).

## S6 — SII FAQ 001.140.7297.004 (tasas de honorarios por año comercial; act. 01/04/2026)

URL: https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_7297.htm
SHA-256: `857d9db78cd2f39d51527829b2b3ad2c843fe7e70351826c5cfaf3043f7b7f71` (5025 bytes)
Consultada: 2026-09-29 (UTC; consulta ~22:15–22:40Z)

```
Las tasas de retenciones de honorarios, de acuerdo con cada año comercial, son las siguientes: % AÑO COMERCIAL 10,75% 2020 11,50% 2021 12,25% 2022 13,00% 2023 13,75% 2024 14,50% 2025 15,25% 2026 16,00% 2027 17,00% 2028 Ver más
```
La fuente fija la tasa **por año comercial** (emisión): 14,50% 2025 · 15,25% 2026.

## S7 — SII noticia 26-12-2025 (alza 14,5% → 15,25% desde el 1-1-2026)

URL: https://www.sii.cl/noticias/2025/261225noti01smn.htm
SHA-256: `4fdfe7e1ebfd18f9b151cd97a01c8265591fb6c04164c7c164505bf6f0ff11c6` (4994 bytes)
Consultada: 2026-09-29 (UTC; consulta ~22:15–22:40Z)

```
s mismas coberturas que tienen los trabajadores dependientes, estableció el aumento progresivo de la retención a boletas de honorarios, hasta 2028, cuando llegue a una retención del 17%. A partir del 1 de enero de 2026, todos los trabajadores independientes que emitan boletas de honorarios experimentarán un ajuste en la retención aplicada a sus ingresos. Así, la retención sobre las boletas de honorarios subirá de 14,5% a 15,25%, lo que representa un incremento de 0,75 puntos porcentuales respecto a lo retenido en 2025. Este cambio, que se aplicará automáticamente en el sistema del Servicio de Impuestos Internos (SII) cada vez que el contribuyente emita una boleta, responde a lo establecido e
```

## S8 — SuperIR, requisitos renegociación persona deudora

URL: https://www.superir.gob.cl/perfil-deudor-requisito-renegociacion
SHA-256: `e234e7283b57cafc54b26afc35ad9330000bc209268544f5279a60ff94aa035f` (90751 bytes)
Consultada: 2026-09-29 (UTC; consulta ~22:15–22:40Z)

```
Tener 2 o más obligaciones vencidas, por más de 90 días corridos, actualmente exigibles, que provengan de obligaciones distintas y que en total sumen más de 80 U.F. 2. No haber sido notificado de una demanda de Liquidación Forzosa o de cualquier otro juicio ejecutivo iniciado en su contra. Para descargar modelo de declaraciones
```
La sección de preguntas frecuentes de la misma página parafrasea «dos o más deudas vencidas … sumen más de 80 Unidades de Fomento». Exige además no tener primera categoría en 24 meses y no estar notificado de juicio ejecutivo.

## S9 — LIR (DL 824), art. 42 bis N°2 y N°3 (idNorma 6368)

URL: https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=6368
SHA-256: `85716958b904435dedfc710479a21ab6f6a06d26e59420622314ba25b49079da` (925048 bytes)
Consultada: 2026-09-29 (UTC; consulta ~22:15–22:40Z)

```
hasta por un monto total máximo anual equivalente a la diferencia entre 600 unidades de fomento, según el valor de ésta al 31 de diciembre del año respectivo, menos el monto total del ahorro voluntario, de las cotizaciones voluntarias y del ahorro previsional voluntario colectivo, acogidos al número 1 anterior. Para los efectos de impetrar el beneficio, cada inversión efectuada en el año deberá considerarse según el valor de la unidad de fomento en el día
...
rma dispuesta en el inciso penúltimo del número 3 del artículo 54º, quedará afecto a un impuesto único que se declarará y pagará en la misma forma y oportunidad que el impuesto global complementario. La tasa de este impuesto será tres puntos porcentuales superior a la que resulte de multiplicar por el factor 1,1, el producto, expresado como porcentaje, que resulte de dividir, por el monto reajustado del retiro efectuado, la diferencia entre el monto del impuesto global complementario determinado sobre las remuneraciones del ejercicio incluyendo el monto reajustado del retiro y el monto del mismo impuesto determinado sin considerar dicho retiro. Si el retiro es efectuado por una persona pensionada o, que cumple con los requisitos de edad y de monto de pensión que establecen los artículos 3º y 68 letra b) del decreto ley Nº 3.500, de 1980, o con los requisitos para pensionarse que establece el decreto ley Nº 2.448, de 1979, no se aplicarán los recargos porcentuales ni el factor antes señalados. Las administradoras de fondos de pensiones y las instituciones autorizadas que administren l
```
Los JSON LeyChile no son byte-estables entre sesiones (el hash cambia al regenerar metadatos); la comparación válida es de texto.

## S10 — LIR art. 59 inciso 2° N°1 (Impuesto Adicional; tasa 4%) y N°4 (fletes 5%)

URL: https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=6368
SHA-256: `85716958b904435dedfc710479a21ab6f6a06d26e59420622314ba25b49079da` (925048 bytes)
Consultada: 2026-09-29 (UTC; consulta ~22:15–22:40Z)

```
Este impuesto se aplicará, con tasa 35%, respecto de las rentas que se paguen o abonen en cuenta a personas a que se refiere el inci so primero por concepto de: 1) Intereses. Estarán afectos a este impuesto, pero con una tasa del 4%, los intereses provenientes de: a) Depósitos en cuenta corriente y a plazo en moneda extranjera, efectuados en cualquiera de las instituciones autorizadas por el Banco Central de Chile para recibirlos; b) Créditos otorgados desde el exterior por instituciones banc arias o financieras extranjeras o internacionales, así como por compañías de seguros y fondos de pensiones extranjeros que
...
g) los instrumentos señalados e n las letras a), d) y e) NOTA 9 anteriores, emitidos o expresados en moneda nacional. INCISO SUPRIMIDO h) Los instrumentos de de
...
4) Fletes marítimos, comisiones o participaciones en fletes marítimos desde o hacia puertos chilenos, y demás ingresos por servicios a las naves y a los cargamentos en puertos nacionales o extranjeros
```

## S11 — Ley 20.720 art. 260 (renegociación; idNorma 1058072)

URL: https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=1058072
SHA-256: `4ede48cc3f65b36e447e946e214aebdec8e7cad415c5ccd07841a7958e4254ac` (792135 bytes)
Consultada: 2026-09-29 (UTC; consulta ~22:15–22:40Z)

```
Artículo 260.- Ámbito de aplicación y requisitos. El Procedimiento Concursal de Renegociación será aplicable sólo a la Persona Deudora, que para efectos de este Título se denominará indistintamente Persona Deudora o Deudor. La Persona Deudora podrá someterse a un Procedimiento Concursal de Renegociación si tuviere dos o más obligaciones vencidas por más de 90 días corridos, actualmente exigibles, provenientes de obligaciones diversas, cuyo monto total sea superior a 80 unidades de fomento, siempre y cuando no haya sido notificada de una demanda que solicite el inicio de un Procedimiento Concursal de Liquidación Simplificada. Quedarán excluidas del Procedimiento Concursal de Renegociación de
```

## S12 — Ley 19.628 arts. 17 y 18 (comunicación de deudas; idNorma 141599)

URL: https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=141599
SHA-256: `358c57e1b7f4b4c7df485f5b8cd5c1ccd444e91ec8dd0974f0ce949de3e39df9` (60838 bytes)
Consultada: 2026-09-29 (UTC; consulta ~22:15–22:40Z)

```
Artículo 17.- Los responsables de los registros NOTA: o bancos de datos personales sólo podrán comunicar información que verse sobre obligaciones de carácter económico, financiero, bancario o comercial, cuando éstas consten en letras de cambio y pagarés protestados; cheques protestados por falta de fondos, por haber sido girados contra cuenta corriente cerrada o por otra causa; como asimismo el incumplimiento de obligaciones derivadas de mutuos hipotecarios y de préstamos o créditos de bancos, sociedades financieras, administradoras de mutuos hipotecarios, cooperativas de ahorros y créditos, organismos públicos y empresas del Estado sometidas a la legislación común, y de sociedades administr
...
Artículo 18.- En ningún caso pueden comunicarse los datos a que se refiere el artículo anterior, que se relacionen con una persona identificada o identificable, luego de transcurridos cinco años desde que la respectiva obligación se hizo exigible. Tampoco se podrá continuar comunicando los datos relativos a dicha obligación después de haber sido pagada o haberse extinguido por otro modo legal. Con todo, se comunicará a los tri
```

## S13 — Ley 21.830 (IMM; idNorma 1225354)

URL: https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=1225354
SHA-256: `ef4df43277423bbe515f9142fd154b9ec1f70b74ce8d90c17aa47bb04f38bd76` (9488 bytes)
Consultada: 2026-09-29 (UTC; consulta ~22:15–22:40Z)

```
Artículo 1.- A contar del 1 de mayo de 2026, elévase a $553.553 el ingreso mínimo mensual para los trabajadores mayores de 18 años de edad y hasta de 65 años de edad. A contar del 1 de enero de 2027, reajústese el ingreso mínimo mensual para los trabajadores mayores de 18 y de hasta 65 años conforme a la variación acumulada por el Índice de Precios al Consumidor, determinada e informada por el Instituto Nacional de Estadísticas entre el 1 de mayo de 2026 y el 31 de diciembre de 2026. Artículo 2.- A contar del 1 de mayo de 2026, elévase a $412.938 el ingreso mínimo mensual para los trabajadores menores de 18 años
```

## S14 — Ley 18.010 art. 10 (prepago; idNorma 29438)

URL: https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=29438
SHA-256: `063a9003435cbf6286a54246d990961b21aeb0bb8dc6d7205484c5c0756930b3` (73934 bytes)
Consultada: 2026-09-29 (UTC; consulta ~22:15–22:40Z)

```
Artículo 10.- Los pagos anticipados de una operación de crédito de dinero, serán convenidos libremente entre acreedor y deudor. Sin embargo, en las operaciones de crédito de dinero cuyo importe en capital no supere el equivalente a 5.000 unidades de fomento, el deudor que no sea una institución fiscalizada por la Comisión para el Mercado Financiero o el Fisco o el Banco Central de Chile, podrá anticipar su pago, aun contra la voluntad del acreedor, siempre que: a) Tratándose de operaciones no reajustables, pague el capital que se anticipa y los intereses pactados calculados hasta la fecha de pago efectivo, más la comisión de prepago. Dicha comisión, no podrá exceder el valor de un mes de intereses pactados calculados sobre el capital que se prepaga. b) Tratándose de operaciones reajustables, pague el capital que se anticipa y los intereses pactados calculados hasta la fecha de pago efectivo, más la comisión de prepago. Dicha comisión, no podrá exceder el valor de un mes y medio de inte
```

## S15 — Previred, indicadores previsionales (AFP y topes)

URL: https://www.previred.com/indicadores-previsionales/
SHA-256: `bf969a1ac5d819bf920a58b86d0b1abc8cbea2f63fbd82f9314a1a4dad2ac4fd` (89539 bytes)
Consultada: 2026-09-29 (UTC; consulta ~22:15–22:40Z)

```
Para afiliados a una AFP (90 UF): $ 3.695.148 Para afiliados al IPS (ex INP) (60 UF): $ 2.452.426 Para Seguro de Cesantía (135,2 UF): $ 5.550.933 AFP TASA COTIZACIÓN AFP Cargo del Trabajador (*) Cargo del Empleador Total a Pagar (**) Capital 11,44% 0,1% 11,54% Cuprum 11,44% 0,1% 11,54% Habitat 11,27% 0,1% 11,37% PlanVital 11,16%
...
Habitat 11,27% 0,1% 11,37% PlanVital 11,16% 0,1% 11,26% ProVida 11,45%
```
