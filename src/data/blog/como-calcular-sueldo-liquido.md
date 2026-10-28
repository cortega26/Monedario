---
title: "Cómo calcular tu sueldo líquido en Chile: del imponible al depósito final"
seoTitle: "Cómo Calcular tu Sueldo Líquido en Chile | Monedario"
author: "Equipo Monedario"
pubDate: 2026-02-24T10:00:00Z
slug: como-calcular-sueldo-liquido
featured: true
homepagePriority: 100
lang: es-CL
draft: false
tags:
  - sueldo
  - descuentos
  - afp
  - impuestos
  - liquidacion
category: empleo-ingresos
cluster: sueldo-remuneraciones
topicRole: owner
canonicalTopic: calcular-sueldo-liquido
description: "Guía para reconstruir tu sueldo líquido en Chile desde el bruto e imponible hasta AFP, salud, cesantía e impuesto mensual, sin confundir cada línea."
heroImage: /images/hero/como-calcular-sueldo-liquido.avif
articleLead:
  answer: "Si quieres reconstruir tu sueldo líquido en Chile, parte por el imponible y no por el bruto total: AFP, salud, cesantía e impuesto único no usan exactamente la misma base ni siempre aplican sobre el total que te prometieron en la oferta."
  calculatorHref: "/calculadoras/sueldo-liquido/"
  calculatorLabel: "Usar calculadora de sueldo líquido"
  nextStepHref: "/posts/liquidacion-de-sueldo/"
  nextStepLabel: "Auditar la liquidación"
  validAsOf: 2026-10-28
  officialSources:
    - label: "SII — Impuesto Único 2026"
      href: "https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm"
    - label: "Superintendencia de Pensiones"
      href: "https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9908.html"
  covers:
    - "Cómo pasar de bruto e imponible a depósito final."
    - "Qué descuentos obligatorios afectan realmente el cálculo."
    - "Cuándo conviene cruzar con liquidación o descuentos."
  limits:
    - "No reemplaza el documento oficial del empleador."
    - "No resuelve casos de boletas de honorarios."
    - "No modela juicios laborales ni reclamos por finiquito."
volatileData:
  - id: "pensions.afp.worker_mandatory_contribution"
    sync: strict
    expectedValue: 10
  - id: "pensions.afp.uno_commission"
    sync: strict
    expectedValue: 0.46
  - id: "pensions.previsional.monthly_taxable_cap_uf"
    sync: strict
    expectedValue: 90
  - id: "economic.afc.monthly_taxable_cap_uf"
    sync: strict
    expectedValue: 135.2
reviewPolicy:
  cadenceLabel: semiannual
  maxDays: 180
  dataTriggers:
    - economic.afc.monthly_taxable_cap_uf
    - pensions.afp.uno_commission
    - pensions.afp.worker_mandatory_contribution
    - pensions.previsional.monthly_taxable_cap_uf
  derivationFactors:
    - registry:slugOverrides.como-calcular-sueldo-liquido
  computedAt: "2026-10-04"
updatedDate: 2026-10-28T00:00:00Z
---

Te ofrecieron $1.200.000 brutos. Llegó el día de pago y te cayeron $950.000. Esta guía existe para rehacer ese cálculo de principio a fin: partir desde el bruto, separar el imponible y llegar al depósito final con AFP, salud, cesantía e impuesto.

Si tu duda principal no es rehacer el número completo, conviene separar primero si necesitas clasificar descuentos o auditar el comprobante. Si solo necesitas el número, puedes saltar directo a la calculadora más abajo.

## La diferencia entre sueldo bruto y sueldo líquido

Aquí el foco es el cálculo completo del líquido. No es la guía principal para discutir si un descuento es legal ni para revisar el formato del comprobante.

**Sueldo bruto** es lo que acordaste con tu empleador. **Sueldo líquido** es lo que realmente llega a tu cuenta. Entre uno y otro hay una serie de descuentos obligatorios que establece la ley — no los decide tu empresa ni tu AFP.

Para un trabajador dependiente con contrato indefinido, los descuentos típicos son estos:

| Descuento                   | Porcentaje                | Va a...                |
| --------------------------- | ------------------------- | ---------------------- |
| AFP (cotización)            | 10%                       | Tu cuenta de pensión   |
| AFP (comisión)              | 0.46% – 1.45%             | La AFP por administrar |
| Salud (Fonasa o Isapre)     | 7% mínimo                 | Tu cobertura médica    |
| Seguro de cesantía          | 0.6% (0% casa particular) | Tu fondo de cesantía   |
| Impuesto único 2ª categoría | Variable                  | El Fisco               |

El porcentaje exacto depende de tu AFP, si estás en [Fonasa o Isapre](/posts/fonasa-vs-isapre-comparativa/), y cuánto ganas.

---

## Qué es el sueldo imponible y por qué importa

Aquí está el primer malentendido frecuente: **no todos los descuentos se calculan sobre tu sueldo bruto total**. La mayoría de las cotizaciones usan el **sueldo imponible**, pero el impuesto único usa la renta líquida imponible y los descuentos que autorizaste por escrito se calculan sobre la remuneración total bruta.

El sueldo imponible es la parte de tu remuneración sobre la que se aplican las cotizaciones. Incluye tu sueldo base, horas extra y la mayoría de los bonos. Lo que generalmente queda fuera del imponible — y por tanto no se descuenta — son:

- Asignación de colación
- Asignación de movilización (dentro de ciertos límites)
- Viáticos
- Indemnizaciones

Si tu liquidación dice "sueldo bruto $1.200.000" pero el imponible es $1.050.000, AFP, salud y cesantía se calculan sobre los $1.050.000, no sobre $1.200.000. El impuesto único se calcula sobre la renta líquida imponible: ese mismo imponible menos las cotizaciones obligatorias. Y un descuento convenido, como un dividendo hipotecario o un préstamo, se calcula sobre la remuneración total bruta.

Esto también tiene un límite superior: existe un **[tope imponible](/glosario/tope-imponible/)** para las cotizaciones previsionales. En 2026, la Superintendencia de Pensiones informa **90 [UF](/guias/uf-costo-de-vida/)** para AFP y salud, mientras la AFC informa **135,2 UF** para seguro de cesantía. Si ganas más que esos topes, esas cotizaciones se calculan solo hasta el límite respectivo. El impuesto único, en cambio, usa su propia tabla mensual del SII.

| Descuento                                   | Base de cálculo                                                                | Tope o límite                                                                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AFP (10% + comisión)                        | Remuneración imponible                                                         | Tope imponible de 90 UF                                                                                                                                         |
| Salud (7% mínimo)                           | Remuneración imponible                                                         | Mismo tope de 90 UF: el 7% legal llega como máximo a 6,3 UF                                                                                                     |
| Cesantía trabajador (0,6%)                  | Remuneración imponible                                                         | Tope de 135,2 UF en 2026; el aporte del trabajador dura como máximo 11 años por relación laboral. No aplica en plazo fijo ni en casa particular (0% trabajador) |
| Impuesto único de segunda categoría         | Renta líquida imponible: remuneraciones brutas menos cotizaciones obligatorias | Tabla mensual del SII                                                                                                                                           |
| Descuentos convenidos por escrito (art. 58) | Remuneración total bruta, sin deducir antes los descuentos obligatorios        | 15% general; hasta 30% en mutuos o créditos sin interés para vivienda o educación, con pago directo al acreedor; 45% en conjunto                                |

La base y el tope de cada línea están desarrollados en la guía de [descuentos de sueldo](/posts/descuentos-de-sueldo/).

---

## Los descuentos uno por uno

### 1. AFP: el 10% + comisión

El 10% de cotización obligatoria va íntegro a tu cuenta de capitalización individual — ese dinero es tuyo. Adicional al 10%, pagas la comisión de la AFP por el servicio de administración, que varía entre AFP:

| AFP       | Comisión 2026 |
| --------- | ------------- |
| Uno       | 0.46%         |
| Modelo    | 0.58%         |
| PlanVital | 1.16%         |
| Habitat   | 1.27%         |
| Capital   | 1.44%         |
| Cuprum    | 1.44%         |
| ProVida   | 1.45%         |

En un imponible de $1.000.000, la diferencia entre la AFP más barata y la más cara hoy es de **$9.900 al mes**, o cerca de **$118.800 al año**. No define toda tu jubilación, pero sí cambia tu descuento mensual real.

Fuente: [Superintendencia de Pensiones](https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9908.html)

### 2. Salud: el 7% (o más)

Si estás en **Fonasa**, descuentan el 7% de tu remuneración imponible, calculado hasta el tope de 90 UF. Por eso el 7% legal llega como máximo a 6,3 UF al mes.

Si estás en **Isapre**, el 7% es el mínimo legal, pero el plan que elegiste probablemente cuesta más. La diferencia entre el 7% legal y el precio de tu plan es el **precio adicional del plan** que pactaste con la Isapre: también se descuenta de tu liquidación, pero no forma parte del 7% mínimo legal. El **copago** es otra cosa: es lo que pagas al usar la cobertura (una consulta, un examen), no la prima mensual.

Ejemplo: si tu plan Isapre cuesta el equivalente al 9% de tu imponible y ese imponible está bajo el tope de 90 UF, el descuento total de salud será 9%, no 7%. Sobre el tope, el 7% legal se calcula solo hasta 90 UF.

### 3. Seguro de cesantía: 0.6% (0% en casa particular)

Este descuento va a la **Administradora de Fondos de Cesantía (AFC)**. Acumula un fondo individual a tu nombre que puedes usar si te quedas sin trabajo.

Lo importante: el porcentaje cambia según el tipo de contrato.

| Tipo de contrato          | Descuento trabajador | Aporte empleador |
| ------------------------- | -------------------- | ---------------- |
| Indefinido                | 0.6%                 | 2.4%             |
| Plazo fijo / obra o faena | 0%                   | 3%               |
| Casa particular           | 0%                   | 3%               |

Si tienes contrato a plazo fijo o trabajas en casa particular, **no te descuentan** el seguro de cesantía — pero igual acumulas porque el empleador paga el 3%. Cuando quedes sin trabajo, puedes cobrar ese fondo. La [guía del seguro de cesantía](/posts/seguro-de-cesantia/) detalla cuándo y cuánto te pagan.

Fuente: [Dirección del Trabajo](https://www.dt.gob.cl/portal/1628/w3-article-95306.html)

### 4. Impuesto único de segunda categoría

Este es el más variable y el que más confusión genera. Es el equivalente al impuesto a la renta para trabajadores dependientes, y se paga mensualmente directo en tu liquidación — no en abril como en la Operación Renta.

Se calcula aplicando una tabla progresiva sobre tu **renta líquida imponible mensual**. El SII actualiza los valores cada mes. Como referencia, en **abril de 2026** el primer tramo exento llega hasta **$943.501,50**. Sobre ese monto empiezan a correr los tramos y la rebaja correspondiente.

_(Los montos exactos del mes los publica el SII en su [tabla vigente](https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm))._

El impuesto es **marginal**: solo el tramo que supera el umbral paga la tasa más alta, no todo tu sueldo.

---

## Por qué te subieron el sueldo y te bajó el líquido

Esto pasa más seguido de lo que crees, y tiene dos causas principales:

**Causa 1: Cruzaste un tramo del impuesto único.**
Si tu renta líquida imponible pasó de $2.000.000 a $2.150.000, la parte que cruza los **$2.096.670** (referencia marzo 2026) ya entra al tramo siguiente. El impuesto aumenta más rápido que antes, y en algunos casos el alza efectiva del líquido se siente menor a lo esperado.

**Causa 2: Te cambiaste a Isapre o subió tu plan.**
Si antes estabas en Fonasa (7% fijo) y te cambiaste a una Isapre con un plan de 10%, ese 3% extra puede comerse parte del aumento. La matemática no miente: más bruto no siempre significa más líquido si al mismo tiempo subió algún descuento.

---

## Ejemplo completo: de bruto a líquido

**Supuesto:** Trabajador con contrato indefinido, sueldo bruto total $1.500.000, del cual $150.000 son colación no imponible; remuneración imponible $1.350.000. Afiliado a Capital AFP (comisión 1,44%, total AFP 11,44%) y Fonasa.

| Concepto                        | Base                                 | Cálculo                        | Monto          |
| ------------------------------- | ------------------------------------ | ------------------------------ | -------------- |
| Sueldo bruto total              | —                                    | —                              | $1.500.000     |
| (-) AFP cotización 10%          | Imponible $1.350.000                 | × 10%                          | -$135.000      |
| (-) AFP comisión 1,44%          | Imponible $1.350.000                 | × 1,44%                        | -$19.440       |
| (-) Salud Fonasa 7%             | Imponible $1.350.000                 | × 7%                           | -$94.500       |
| (-) Seguro cesantía 0,6%        | Imponible $1.350.000                 | × 0,6%                         | -$8.100        |
| = Renta líquida imponible       | Imponible menos cotizaciones         | $1.350.000 - $257.040          | $1.092.960     |
| (-) Impuesto único 2ª categoría | RLI $1.092.960                       | Tramo 4% abril 2026            | -$5.978        |
| **= Sueldo líquido**            | Bruto total menos cotizaciones e ISC | $1.500.000 - $257.040 - $5.978 | **$1.236.982** |

La colación de $150.000 ya está incluida en el sueldo bruto total y no se suma otra vez: no cotiza, pero tampoco es un ingreso adicional. Las cotizaciones se calculan sobre la remuneración imponible de $1.350.000; el impuesto único, sobre la RLI de $1.092.960.

De $1.500.000 brutos a **$1.236.982 líquidos**. La diferencia final de **$263.018** se explica solo por los descuentos: las cotizaciones legales por **$257.040** y el impuesto único del mes por **$5.978**. La porción no imponible ($150.000 por colación) llega íntegra a tu cuenta sin sufrir descuentos previsionales ni de impuestos.

---

## Cómo leer tu liquidación sin perderte

Tu liquidación tiene tres secciones que siempre aparecen:

**Haberes:** Todo lo que te pagan (sueldo base, horas extra, bonos, colación, movilización).

**Descuentos legales:** AFP, salud, cesantía, impuesto único. Estos los exige la ley.

**Descuentos varios:** Anticipos, seguros voluntarios y otros pagos que autorizaste por escrito. Estos son opcionales. La cuota sindical y el crédito social de una caja de compensación también pueden aparecer aquí, pero son obligatorios: la [guía de descuentos de sueldo](/posts/descuentos-de-sueldo/) explica la diferencia.

El **total haberes menos total descuentos** es tu líquido. Si los números no cuadran, puedes pedirle a tu empleador que te explique cada línea — es tu derecho.

---

## Errores frecuentes al calcular el líquido

**Aplicar el mismo porcentaje a todo.** Cada descuento tiene su base: AFP, salud y cesantía van sobre el imponible; el impuesto único sobre la renta líquida imponible; los descuentos convenidos sobre la remuneración total bruta. El imponible puede ser menor que el bruto si tienes colación o movilización no imponible.

**Olvidar la comisión AFP.** No es solo el 10% — es 10% más la comisión de tu AFP.

**Asumir que el impuesto es fijo.** El impuesto único se recalcula cada mes según tu renta imponible de ese mes. Un mes con bono puede generar un impuesto significativamente mayor.

**Confundir descuentos legales con descuentos voluntarios.** Los préstamos de caja, seguros y anticipos que autorizaste también aparecen como descuentos y bajan el líquido — pero no son obligatorios.

---

## Preguntas frecuentes

**¿Qué pasa si tengo dos empleadores?**
Cada empleador descuenta AFP y salud por separado, como si fuera tu único trabajo. Al momento de la Operación Renta anual, el SII consolida ambos ingresos y puede resultar en impuesto adicional a pagar — o en devolución, si hubo sobrepago.

**¿El tope imponible aplica a todos los descuentos?**
No a todos. Como referencia 2026, AFP y salud usan 90 UF y el seguro de cesantía usa 135,2 UF. El impuesto único opera con su propia tabla mensual y no con esos topes previsionales.

**¿Tengo que pagar impuesto si gano el mínimo?**
No, en el escenario habitual. Como referencia, en marzo de 2026 el primer tramo exento llega hasta $943.501,50 de renta líquida imponible mensual. Si quedas bajo ese nivel, no pagas impuesto único ese mes.

**¿Puedo reducir legalmente lo que pago de impuesto?**
Sí. El APV en Régimen B reduce tu base imponible mensual, lo que baja el impuesto. Si cotizas $200.000 al mes en APV Régimen B y tu tasa marginal es 8%, pagas $16.000 menos de impuesto ese mes. [Más sobre el APV aquí](/posts/que-es-el-apv/).

**¿Dónde veo el impuesto que me corresponde exactamente?**
El SII publica la tabla mensual del Impuesto Único de Segunda Categoría en su sitio: [sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm](https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm)

---

## Qué hacer ahora

- AFP, salud y cesantía van sobre el **imponible**; el impuesto único sobre la renta líquida imponible; los descuentos convenidos sobre la remuneración total bruta.
- El **10% AFP** es tuyo; la comisión adicional depende de tu administradora y hoy puede mover bastante el descuento total.
- El **7% de salud** es el mínimo y se calcula hasta el tope de 90 UF; si tienes Isapre, el precio adicional del plan se paga aparte.
- El **impuesto único** es progresivo y se recalcula cada mes — un bono puede subirte el impuesto más de lo que esperabas.
- Si te subieron el sueldo y te bajó el líquido, probablemente cruzaste un tramo de impuesto.
- Puedes reducir legalmente tu impuesto mensual ahorrando en **APV Régimen B**.

Si quieres probar tus números exactos, usa una calculadora de sueldo líquido. Y si después necesitas desglosar mejor descuentos, comprobante o contingencias de empleo, cambia de ruta según esa necesidad específica. Para entender exactamente qué conceptos forman el [sueldo imponible](/posts/sueldo-imponible-chile/) — que es la base de las cotizaciones previsionales — conviene revisarlo en detalle.

---
