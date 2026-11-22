---
title: "UTM en Chile: qué es, cómo funciona y para qué sirve"
description: "Qué es la UTM en Chile, cómo se reajusta mensualmente según el IPC y para qué sirve: multas, tramos de impuesto y diferencia con la UF."
slug: utm-chile-que-es-como-funciona
author: "Equipo Monedario"
pubDate: 2026-04-09T12:00:00Z
updatedDate: 2026-11-10T12:00:00Z
tags:
  - utm
  - uta
  - uf
  - ipc
  - inflacion
  - impuestos
category: general
cluster: uf-costo-de-vida
topicRole: owner
canonicalTopic: utm-uta-unidades-tributarias
lang: es-CL
featured: false
draft: false
heroImage: /images/hero/utm-chile-que-es-como-funciona.avif
articleAdvisory: "Contenido educativo; el valor de la UTM cambia cada mes y debe verificarse en la fuente oficial antes de usarlo."
volatileData:
  - id: "economic.utm.value"
    sync: reference
  - id: "economic.ipc.monthly_variation"
    sync: reference
articleLead:
  answer: "La UTM es la unidad de medida que el Estado chileno usa para expresar multas e impuestos. Según el artículo cuarto transitorio del DL 830, se reajusta cada mes con la variación del IPC del segundo mes anterior (la UTM de octubre usa el IPC de agosto). El SII publica su valor para cada mes en su tabla oficial; el valor del mes vigente se muestra más abajo."
  calculatorHref: "/calculadoras/conversor-utm/"
  calculatorLabel: "Convertir UTM a pesos"
  nextStepHref: "/calculadoras/impuesto-segunda-categoria/"
  nextStepLabel: "Calcular impuesto de segunda categoría"
  validAsOf: 2026-11-10
  officialSources:
    - label: "SII — UTM, UTA e IPC 2026"
      href: "https://www.sii.cl/valores_y_fechas/utm/utm2026.htm"
    - label: "BCN — Código Tributario (DL 830), artículo cuarto transitorio"
      href: "https://www.bcn.cl/leychile/navegar?idNorma=6374"
    - label: "SII — Impuesto Único de Segunda Categoría 2026"
      href: "https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm"
    - label: "SII — Diccionario básico tributario contable (UTM)"
      href: "https://www.sii.cl/ayudas/ayudas_por_servicios/4669-u.html"
    - label: "SII Educa — Tipos de impuestos en Chile"
      href: "https://www.sii.cl/siieduca/aprende-con-nosotros/tipos-de-impuestos-en-chile.html"
  covers:
    - "Qué es la UTM y la UTA"
    - "Cómo se reajusta la UTM cada mes por el IPC"
    - "Usos prácticos: multas y tramos de impuesto"
    - "Diferencia entre UTM y UF"
  limits:
    - "Los valores exactos de UTM cambian cada mes — verifica en SII.cl antes de aplicarlos."
    - "Este artículo no fija el día del mes en que cambia el valor: el SII publica el valor aplicable a cada mes en su tabla oficial."
    - "Las tablas de tramos en pesos son orientativas para el mes indicado."
    - "No sustituye asesoría tributaria para casos específicos."
faqs:
  - q: "¿Cuánto vale la UTM hoy?"
    a: "La UTM tiene un valor para cada mes y el SII lo publica en su tabla oficial (sii.cl/valores_y_fechas/utm/utm2026.htm), con una fila por mes. En la sección «Respuesta rápida» de esta página aparece el valor del mes vigente según el snapshot de Monedario, y el conversor UTM a pesos lo usa para calcular. El valor de $71.721 de los ejemplos corresponde a septiembre de 2026 y es histórico."
  - q: "¿Cuál es la diferencia entre UTM y UTA?"
    a: "La UTM es mensual y es el valor base. La UTA equivale a la UTM del último mes del año comercial multiplicada por doce (o por el número de meses del año comercial, si son menos de doce) y se usa para calcular los tramos anuales del Impuesto Global Complementario."
  - q: "¿Cuál es la diferencia entre UTM y UF?"
    a: "La UF se actualiza diariamente y la usa principalmente el sector privado en hipotecas, arriendos y créditos. La UTM cambia mensualmente y aparece en las multas y en los tramos de impuestos."
  - q: "¿Las multas de tránsito se cobran en UTM?"
    a: "Sí. El artículo 204 del texto refundido de la Ley de Tránsito (N°18.290) fija las multas en escalas de UTM: 1,5 a 3 UTM (gravísimas), 1 a 1,5 (graves), 0,5 a 1 (menos graves) y 0,2 a 0,5 (leves); algunas infracciones tienen multas propias. El monto en pesos resulta de multiplicar las UTM por el valor de la UTM; para saber qué valor se aplica a tu pago, consulta al juzgado de policía local."
  - q: "¿Cómo afecta el IPC a la UTM?"
    a: "El artículo cuarto transitorio del DL 830 dispone que la UTM «se reajustará mensualmente de acuerdo con el porcentaje de variación que experimente el índice de precios al consumidor en el segundo mes que anteceda al correspondiente a la actualización de dicha unidad». Es decir, la UTM de un mes usa la variación del IPC de dos meses antes: la UTM de octubre se reajusta con el IPC de agosto. El SII publica el valor resultante de cada mes en sii.cl/valores_y_fechas/utm/utm2026.htm."
reviewPolicy:
  cadenceLabel: monthly
  maxDays: 30
  dataTriggers:
    - economic.utm.value
  derivationFactors:
    - registry:categoryPolicies.general
    - template:utm
  computedAt: "2026-05-06"
---

La **UTM (Unidad Tributaria Mensual)** es la unidad de valor que usa el Estado chileno para fijar multas y tramos de impuestos. Se reajusta cada mes según la variación del IPC del segundo mes anterior.

> **Respuesta rápida**
>
> **Qué es:** Unidad de medida del valor monetario que el Estado usa para expresar multas e impuestos — no es una moneda, sino un indicador de referencia reajustable.
>
> **Cómo cambia:** Se reajusta mensualmente con la variación del IPC del segundo mes anterior (art. cuarto transitorio del DL 830); el SII publica el valor de cada mes.
>
> **Valor del mes vigente (según el snapshot de Monedario):** [[utm | clp]]
>
> **Valor de ejemplo (histórico, septiembre 2026):** $71.721
>
> **Fuente oficial:** [SII — UTM/UTA/IPC 2026](https://www.sii.cl/valores_y_fechas/utm/utm2026.htm)
>
> **Vigencia de la regla:** artículo cuarto transitorio del DL 830, texto consultado en la BCN el 2026-11-10 (versión vigente del 2026-10-17).
>
> **Vigencia del valor de ejemplo:** Este valor corresponde a septiembre 2026 y no es el valor actual. La UTM cambia cada mes — verifica siempre el valor del mes que necesitas en SII.cl.

El monto en pesos de una multa de tránsito resulta de multiplicar las UTM de la multa por el valor de la UTM que se aplique a tu pago. El mismo número de UTM puede significar más o menos pesos según el mes. Si necesitas la equivalencia exacta ahora, usa el [conversor UTM a pesos](/calculadoras/conversor-utm/).

> **Alcance de la revisión del 2026-11-10.** Fecha de corte de la información: 2026-11-10. Cubre la regla de reajuste de la UTM, los valores mensuales de la UTM de septiembre, octubre y noviembre de 2026 y de diciembre de 2025, y los ejemplos (UTA, tramos del impuesto de segunda categoría, bono del APV). Los ejemplos conservan el período que indica cada uno. Ante cambios normativos o de política pública, verifique en las fuentes oficiales referenciadas al final de este artículo.

Si quieres ver este frente completo junto con UF, reajustes y herramientas, entra a la [guía UF, inflación y costo de vida](/guias/uf-costo-de-vida/).

## Tabla de contenidos

## ¿Qué es la UTM?

La **Unidad Tributaria Mensual (UTM)** es una unidad de medida del valor monetario definida por el Estado chileno que sirve como denominador común para expresar multas y obligaciones tributarias.

No es una moneda ni un tipo de cambio. Es una **unidad de cuenta reajustable**: un número de referencia que se reajusta mensualmente de acuerdo con el IPC y cuyo valor para cada mes publica el SII, de modo que una obligación de "3 UTM" se ajusta con la inflación (con un rezago de dos meses) en vez de quedar fija en pesos.

Su reajuste lo establece la ley (artículo cuarto transitorio del DL 830) y el **SII (Servicio de Impuestos Internos)** publica su valor cada mes. El SII explica que la UTM se actualiza según el Índice de Precios al Consumidor (IPC) ([Diccionario básico tributario contable](https://www.sii.cl/ayudas/ayudas_por_servicios/4669-u.html)) y que ese reajuste es mensual ([SII Educa](https://www.sii.cl/siieduca/aprende-con-nosotros/tipos-de-impuestos-en-chile.html)).

Para ver la definición formal del término, consulta el [glosario UTM](/glosario/utm/).

### Cómo se reajusta la UTM

El [artículo cuarto transitorio del Código Tributario (DL 830)](https://www.bcn.cl/leychile/navegar?idNorma=6374) dispone que la UTM:

> «se reajustará mensualmente de acuerdo con el porcentaje de variación que experimente el índice de precios al consumidor en el segundo mes que anteceda al correspondiente a la actualización de dicha unidad».

En palabras simples: para la UTM de un mes (M) se usa la variación del **IPC (Índice de Precios al Consumidor)** del segundo mes anterior (M−2). Por ejemplo, la UTM de octubre se reajusta con la variación del IPC de agosto. La norma fija **qué mes de IPC** se usa; no señala un día específico del mes. El valor resultante de cada mes es el que publica el SII en su [tabla mensual](https://www.sii.cl/valores_y_fechas/utm/utm2026.htm): en octubre de 2026, $72.151.

El IPC lo calcula y publica el **INE (Instituto Nacional de Estadísticas)** mensualmente. Si quieres entender cómo el INE mide la inflación y por qué afecta deudas y reajustes, revisa [qué es el IPC en Chile y cómo se calcula](/posts/que-es-el-ipc-chile-como-se-calcula/).

### Base legal

El **Código Tributario** (DL 830/1974, art. 8 N.º 10) define la «unidad tributaria» como «la cantidad de dinero cuyo monto, determinado por ley y permanentemente actualizado, sirve como medida o como punto de referencia tributario»; su reajuste mensual lo regula el artículo cuarto transitorio de ese cuerpo legal.

---

## UTM y UTA: dos unidades de la misma familia

La UTM tiene una derivada anual: la **UTA (Unidad Tributaria Anual)**. Son dos caras del mismo sistema:

| Característica | UTM                          | UTA                                                                                               |
| -------------- | ---------------------------- | ------------------------------------------------------------------------------------------------- |
| Período        | Mensual                      | Anual                                                                                             |
| Definición     | Valor base mensual           | UTM del último mes del año comercial × 12 (o × los meses del año comercial, si son menos de doce) |
| Actualización  | Mensual, según el IPC        | Anual: depende de la UTM del último mes del año comercial                                         |
| Uso principal  | Multas y tramos de impuestos | Tramos del Impuesto a la Renta anual                                                              |

### ¿Cómo se calcula la UTA?

La UTA equivale a la UTM vigente en el **último mes del año comercial** respectivo, multiplicada por doce, o por el número de meses que comprende el año comercial cuando son menos de doce (Código Tributario, art. 8 N.º 10; SII, Diccionario básico tributario contable). Los tramos del Impuesto Global Complementario (IGC) de un año tributario usan la UTA del año comercial anterior: el año tributario 2026 usa la UTA de diciembre de 2025.

**Ejemplo orientativo** _(solo referencia — verifica siempre el valor vigente en SII.cl)_:

- UTA del año tributario 2026: $834.504 (= 12 × $69.542, con la UTM de diciembre de 2025). La tabla del SII muestra además una columna "UTA" para cada mes (UTM del mes × 12); la UTA del año tributario 2026 es la de diciembre de 2025.

> **Nota:** Los tramos anuales del IGC se expresan en UTA; para el año tributario 2026 el SII usa la UTA de diciembre de 2025 ([SII — Personas naturales AT 2026](https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html)).

Para el concepto completo de UTA y sus usos tributarios, consulta el [glosario UTA](/glosario/uta/).

---

## La UTM vs la UF — ¿cuál es la diferencia?

La duda más frecuente es confundir la UTM con la UF. Aunque ambas se reajustan según el IPC, lo hacen con mecanismos distintos y tienen propósitos y frecuencias completamente distintas:

| Característica              | UTM                                                                                         | UF                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Frecuencia de actualización | Mensual (1 vez por mes)                                                                     | Diaria (cada día)                                                                         |
| Quién la define             | La ley (DL 830); el SII publica su valor                                                    | Banco Central de Chile                                                                    |
| Ámbito principal            | Multas e impuestos                                                                          | Privado: hipotecas, arriendos, créditos                                                   |
| Mecanismo de reajuste       | Mensual, con la variación del IPC del segundo mes anterior (art. cuarto transitorio DL 830) | Diario: del 10 de cada mes al 9 del siguiente, según la variación del IPC (Banco Central) |
| Efecto directo sobre ti     | En multas e impuestos                                                                       | En contratos privados indexados                                                           |

**Para recordar:** la UTM aparece en las multas y en los tramos de impuestos; la UF, en contratos privados como hipotecas, arriendos y créditos.

Para entender en detalle cómo funciona la UF y cómo afecta tu arriendo o dividendo hipotecario, revisa [UF en simple: qué es y cómo te afecta](/posts/que-es-la-uf/). Si necesitas convertir montos en UF, usa el [conversor UF a pesos chilenos](/calculadoras/conversor-uf/).

---

## Usos prácticos de la UTM

### Multas de tránsito y sanciones legales

El **artículo 204 del texto refundido de la Ley de Tránsito (N°18.290)** fija las multas en escalas de UTM: 1,5 a 3 UTM para las infracciones gravísimas, 1 a 1,5 para las graves, 0,5 a 1 para las menos graves y 0,2 a 0,5 para las leves (algunas infracciones tienen multas propias). El monto en pesos resulta de multiplicar las UTM de la sanción por el valor de la UTM; para saber qué valor se aplica a tu pago, consulta al juzgado de policía local.

**Ejemplo orientativo** _(solo conversiones de ejemplo, no son tramos de la ley — el monto exacto depende de la infracción y del valor de la UTM que se aplique)_:

| Multa (en UTM) | Equivalente aprox. en pesos (UTM septiembre 2026: $71.721) |
| -------------- | ---------------------------------------------------------- |
| 1 UTM          | ~$71.721                                                   |
| 2 UTM          | ~$143.442                                                  |
| 5 UTM          | ~$358.605                                                  |

> **Importante:** El valor en pesos depende del valor de la UTM que se aplique a tu caso, que puede variar de un mes a otro. Confirma el monto exacto con el juzgado de policía local o la municipalidad antes de pagar.

### Tramos del Impuesto a la Renta

El Estado usa UTM (para cálculo mensual) y UTA (para cálculo anual) para fijar los tramos del impuesto a los sueldos y del Impuesto Global Complementario.

**Impuesto Único de Segunda Categoría (Art. 43 N°1 LIR — sueldos y pensiones):**

La **renta líquida imponible** mensual está exenta hasta **13,5 UTM**. Para septiembre 2026 (UTM = $71.721) eso equivale a **$968.233,50**. La renta líquida imponible es la remuneración después de descontar las cotizaciones previsionales y de salud obligatorias; no es la remuneración bruta.

| Tramo mensual — orientativo, septiembre 2026 | Tasa marginal |
| -------------------------------------------- | ------------- |
| Hasta $968.233,50 (13,5 UTM)                 | Exento        |
| $968.233,51 – $2.151.630,00                  | 4%            |
| $2.151.630,01 – $3.586.050,00                | 8%            |
| $3.586.050,01 – $5.020.470,00                | 13,5%         |
| $5.020.470,01 – $6.454.890,00                | 23%           |
| $6.454.890,01 – $8.606.520,00                | 30,4%         |
| $8.606.520,01 – $22.233.510,00               | 35%           |
| Más de $22.233.510,00                        | 40%           |

> **Tabla orientativa — datos de septiembre 2026.** Los tramos en pesos cambian cada mes con la UTM. Fuente: [SII — Impuesto Único 2da Categoría 2026](https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm). Verifica siempre la tabla vigente del mes correspondiente.

Si tu renta líquida imponible mensual supera el umbral, tu empleador aplica retención mensual según los tramos progresivos hasta el 40%. Para calcular tu retención, usa la [calculadora de Impuesto de Segunda Categoría](/calculadoras/impuesto-segunda-categoria/).

**Impuesto Global Complementario (IGC — anual):**

El IGC usa la UTA para definir los tramos anuales. El umbral estándar de exención es **13,5 UTA anuales** (13,5 UTA de diciembre del año anterior: **$11.265.804** para el año tributario 2026). Fuente: [SII — Personas naturales AT 2026](https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html). Para calcular tu posible devolución o pago, usa la [calculadora de Operación Renta](/calculadoras/operacion-renta/).

### APV Régimen A — bono estatal

Si acoges tu APV (Ahorro Previsional Voluntario) al Régimen A (art. 20 L letra a del D.L. N° 3.500) y destinas lo ahorrado a adelantar o incrementar tu pensión, tienes derecho a una bonificación fiscal equivalente al **15% de lo ahorrado** (art. 20 O). El derecho se tiene al momento de pensionarte, pero el Estado deposita la bonificación cada año en una cuenta individual especial en tu AFP o institución autorizada, con la misma rentabilidad y comisiones del ahorro que la originó; cuando haces un retiro de ahorro acogido a este régimen, se gira de esa cuenta a la Tesorería el 15% del retiro, o el saldo remanente de la cuenta si éste fuese inferior. En cada año calendario la bonificación no puede superar **6 UTM**, según la UTM vigente al 31 de diciembre del año en que ahorraste, y solo cubre aportes del año que no superen diez veces tus cotizaciones obligatorias de ese mismo año.

**Ejemplo orientativo** (referencia para el período de escritura): 6 × $69.542 (UTM de diciembre de 2025) = $417.252 máximo _(orientativo — verifica en [tabla SII AT 2026](https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html))_.

### Multas tributarias

El Código Tributario expresa multas por infracciones tributarias en UTM o UTA. Por ejemplo, el artículo 97 N.º 1 sanciona el retardo u omisión en la presentación de declaraciones, informes o solicitudes de inscripción en roles o registros obligatorios que no constituyan la base inmediata para determinar un impuesto, con «multa de una unidad tributaria mensual a una unidad tributaria anual». Para las sanciones expresadas en unidades tributarias, la UTA es la UTM vigente al momento de aplicarse la sanción multiplicada por doce (art. 8 N.º 10).

---

## ¿Dónde ver el valor vigente de la UTM?

El valor oficial de la UTM lo publica mensualmente el SII:

1. **SII.cl (fuente oficial):** [sii.cl/valores_y_fechas/utm/utm2026.htm](https://www.sii.cl/valores_y_fechas/utm/utm2026.htm) — tabla con UTM, UTA e IPC mensual para el año en curso, con el valor de cada mes.

2. **Banco Central de Chile:** [si3.bcentral.cl](https://si3.bcentral.cl/Siete/) — series históricas disponibles.

> **Dado que el valor de la UTM cambia cada mes, el valor de los ejemplos de este artículo ($71.721, correspondiente a septiembre 2026) no es el vigente.** El valor del mes vigente que usa Monedario es **[[utm | clp]]** y el oficial es el de la fila del mes en la tabla del SII. Antes de usar la UTM en cualquier cálculo real —una multa, un impuesto u otro pago— verifica siempre el valor del mes correspondiente directamente en SII.cl.

---

## Resumen: lo que debes recordar

- La UTM es la **unidad del Estado**: multas e impuestos. Se reajusta **cada mes**.
- Se reajusta con la variación del IPC del segundo mes anterior (art. cuarto transitorio del DL 830) y el SII publica su valor para cada mes.
- La **UTA** es la UTM del último mes del año comercial multiplicada por doce (o por el número de meses del año comercial, si son menos de doce); se usa para los tramos anuales del impuesto a la renta.
- La UF es para el **sector privado** (arriendos, hipotecas) y cambia **cada día**; la UTM es para el **Estado** y cambia cada **mes**.
- Valor oficial de la UTM este mes: siempre en [SII.cl](https://www.sii.cl/valores_y_fechas/utm/utm2026.htm).

---

## Fuentes

- SII, tabla UTM-UTA-IPC 2026: https://www.sii.cl/valores_y_fechas/utm/utm2026.htm
- BCN, Código Tributario (DL 830), artículo cuarto transitorio y artículos 8 N.º 10 y 97 N.º 1 (texto consultado el 2026-11-10; versión vigente del 2026-10-17): https://www.bcn.cl/leychile/navegar?idNorma=6374
- SII, Diccionario básico tributario contable, entrada UTM: https://www.sii.cl/ayudas/ayudas_por_servicios/4669-u.html
- SII Educa, Tipos de impuestos en Chile (reajuste mensual de la UTM): https://www.sii.cl/siieduca/aprende-con-nosotros/tipos-de-impuestos-en-chile.html
- SII, Impuesto Único de Segunda Categoría 2026: https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm
- SII, personas naturales AT 2026: https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html
- BCN, DFL 1/2007 (texto refundido de la Ley de Tránsito N°18.290), artículo 204, escala de multas en UTM (consultado el 2026-11-10): https://www.bcn.cl/leychile/navegar?idNorma=1007469
- BCN, D.L. N° 3.500, artículo 20 O (bonificación del Régimen A): https://www.bcn.cl/leychile/navegar?idNorma=7147
- Banco Central de Chile, series estadísticas: https://si3.bcentral.cl/Siete/
- Banco Central de Chile, metodología de la UF (reajuste diario del día 10 al día 9 según el IPC): https://si3.bcentral.cl/estadisticas/Principal1/Metodologias/EMF/UF.pdf
- INE, publicaciones IPC: https://www.ine.gob.cl/estadisticas-por-tema/precios-e-inflacion/indice-de-precios-al-consumidor
