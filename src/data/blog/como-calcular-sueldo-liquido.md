---
title: "Cómo calcular tu sueldo líquido en Chile: del imponible al depósito final"
author: "Equipo Monedario"
pubDate: 2026-02-24T10:00:00Z
updatedDate: 2026-05-11T00:00:00Z
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
  validAsOf: 2026-05-11
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
  cadenceLabel: monthly
  maxDays: 30
  dataTriggers:
    - economic.afc.monthly_taxable_cap_uf
    - pensions.afp.uno_commission
    - pensions.afp.worker_mandatory_contribution
    - pensions.previsional.monthly_taxable_cap_uf
  derivationFactors:
    - category:empleo-ingresos
    - validAsOf
    - officialSources
  computedAt: "2026-05-06"
---

Te ofrecieron $1.200.000 brutos. Llegó el día de pago y te cayeron $950.000. Esta guía existe para rehacer ese cálculo de principio a fin: partir desde el bruto, separar el imponible y llegar al depósito final con AFP, salud, cesantía e impuesto.

Si tu duda principal no es rehacer el número completo, conviene separar primero si necesitas clasificar descuentos o auditar el comprobante. Si solo necesitas el número, puedes saltar directo a la calculadora más abajo.

## La diferencia entre sueldo bruto y sueldo líquido

Aquí el foco es el cálculo completo del líquido. No es la guía principal para discutir si un descuento es legal ni para revisar el formato del comprobante.

**Sueldo bruto** es lo que acordaste con tu empleador. **Sueldo líquido** es lo que realmente llega a tu cuenta. Entre uno y otro hay una serie de descuentos obligatorios que establece la ley — no los decide tu empresa ni tu AFP.

Para un trabajador dependiente con contrato indefinido, los descuentos típicos son estos:

| Descuento                   | Porcentaje    | Va a...                |
| --------------------------- | ------------- | ---------------------- |
| AFP (cotización)            | 10%           | Tu cuenta de pensión   |
| AFP (comisión)              | 0.46% – 1.45% | La AFP por administrar |
| Salud (Fonasa o Isapre)     | 7% mínimo     | Tu cobertura médica    |
| Seguro de cesantía          | 0.6%          | Tu fondo de cesantía   |
| Impuesto único 2ª categoría | Variable      | El Fisco               |

El porcentaje exacto depende de tu AFP, si estás en Fonasa o Isapre, y cuánto ganas.

---

## Qué es el sueldo imponible y por qué importa

Aquí está el primer malentendido frecuente: **los descuentos no se calculan sobre tu sueldo bruto total**, sino sobre el **sueldo imponible**.

El sueldo imponible es la parte de tu remuneración sobre la que se aplican las cotizaciones. Incluye tu sueldo base, horas extra y la mayoría de los bonos. Lo que generalmente queda fuera del imponible — y por tanto no se descuenta — son:

- Asignación de colación
- Asignación de movilización (dentro de ciertos límites)
- Viáticos
- Indemnizaciones

Si tu liquidación dice "sueldo bruto $1.200.000" pero el imponible es $1.050.000, los porcentajes de AFP, salud y cesantía se calculan sobre los $1.050.000, no sobre $1.200.000.

Esto también tiene un límite superior: existe un **[tope imponible](/glosario/tope-imponible/)** para las cotizaciones previsionales. En 2026, la Superintendencia de Pensiones informa **90 [UF](/guias/uf-costo-de-vida/)** para AFP y salud, mientras la AFC informa **135,2 UF** para seguro de cesantía. Si ganas más que esos topes, esas cotizaciones se calculan solo hasta el límite respectivo. El impuesto único, en cambio, usa su propia tabla mensual del SII.

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

Si estás en **Fonasa**, descuentan exactamente el 7% de tu imponible. Punto.

Si estás en **Isapre**, el 7% es el mínimo legal, pero el plan que elegiste probablemente cuesta más. La diferencia entre el 7% legal y el precio real de tu plan se llama **copago de Isapre** y también aparece en tu liquidación.

Ejemplo: si tu plan Isapre cuesta el equivalente al 9% de tu imponible, el descuento total de salud será 9%, no 7%.

### 3. Seguro de cesantía: 0.6%

Este descuento va a la **Administradora de Fondos de Cesantía (AFC)**. Acumula un fondo individual a tu nombre que puedes usar si te quedas sin trabajo.

Lo importante: el porcentaje cambia según el tipo de contrato.

| Tipo de contrato          | Descuento trabajador | Aporte empleador |
| ------------------------- | -------------------- | ---------------- |
| Indefinido                | 0.6%                 | 2.4%             |
| Plazo fijo / obra o faena | 0%                   | 3%               |

Si tienes contrato a plazo fijo, **no te descuentan** el seguro de cesantía — pero igual acumulas porque el empleador paga el 3%. Cuando quedes sin trabajo, puedes cobrar ese fondo. La [guía del seguro de cesantía](/posts/seguro-de-cesantia/) detalla cuándo y cuánto te pagan.

Fuente: [Dirección del Trabajo](https://www.dt.gob.cl/portal/1628/w3-article-95306.html)

### 4. Impuesto único de segunda categoría

Este es el más variable y el que más confusión genera. Es el equivalente al impuesto a la renta para trabajadores dependientes, y se paga mensualmente directo en tu liquidación — no en abril como en la Operación Renta.

Se calcula aplicando una tabla progresiva sobre tu **renta tributable mensual**. El SII actualiza los valores cada mes. Como referencia, en **abril de 2026** el primer tramo exento llega hasta **$943.501,50**. Sobre ese monto empiezan a correr los tramos y la rebaja correspondiente.

_(Los montos exactos del mes los publica el SII en su [tabla vigente](https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm))._

El impuesto es **marginal**: solo el tramo que supera el umbral paga la tasa más alta, no todo tu sueldo.

---

## Por qué te subieron el sueldo y te bajó el líquido

Esto pasa más seguido de lo que crees, y tiene dos causas principales:

**Causa 1: Cruzaste un tramo del impuesto único.**
Si tu renta tributable pasó de $2.000.000 a $2.150.000, la parte que cruza los **$2.096.670** (referencia marzo 2026) ya entra al tramo siguiente. El impuesto aumenta más rápido que antes, y en algunos casos el alza efectiva del líquido se siente menor a lo esperado.

**Causa 2: Te cambiaste a Isapre o subió tu plan.**
Si antes estabas en Fonasa (7% fijo) y te cambiaste a una Isapre con un plan de 10%, ese 3% extra puede comerse parte del aumento. La matemática no miente: más bruto no siempre significa más líquido si al mismo tiempo subió algún descuento.

---

## Ejemplo completo: de bruto a líquido

**Supuesto:** Trabajador con contrato indefinido, sueldo bruto $1.500.000, imponible $1.350.000 (incluye colación no imponible de $150.000), afiliado a Capital AFP (comisión 0,58%, total AFP 10,58%) y Fonasa.

| Concepto                         | Cálculo               | Monto           |
| -------------------------------- | --------------------- | --------------- |
| Sueldo bruto                     | —                     | $1.500.000      |
| (-) AFP cotización 10%           | $1.350.000 × 10%      | -$135.000       |
| (-) AFP comisión 0,58%           | $1.350.000 × 0,58%    | -$7.830         |
| (-) Salud Fonasa 7%              | $1.350.000 × 7%       | -$94.500        |
| (-) Seguro cesantía 0,6%         | $1.350.000 × 0,6%     | -$8.100         |
| = Renta tributable para impuesto | $1.350.000 - $245.430 | $1.104.570      |
| (-) Impuesto único 2ª categoría  | Tramo 4% abril 2026   | -$6.443         |
| (+) Ingresos no imponibles       | Colación              | +$150.000       |
| **= Sueldo líquido**             | Bruto - Descuentos    | **~$1.248.000** |

De $1.500.000 brutos a **~$1.248.000 líquidos**. La diferencia final de **~$252.000** se explica solo por los descuentos: las cotizaciones legales por **$245.430** y el impuesto único del mes por **~$6.443**. La porción no imponible ($150.000 por colación) llega íntegra a tu cuenta sin sufrir descuentos previsionales ni de impuestos.

---

## Cómo leer tu liquidación sin perderte

Tu liquidación tiene tres secciones que siempre aparecen:

**Haberes:** Todo lo que te pagan (sueldo base, horas extra, bonos, colación, movilización).

**Descuentos legales:** AFP, salud, cesantía, impuesto único. Estos los exige la ley.

**Descuentos varios:** Préstamos de caja de compensación, anticipos, seguros voluntarios. Estos son opcionales y los autorizaste tú.

El **total haberes menos total descuentos** es tu líquido. Si los números no cuadran, puedes pedirle a tu empleador que te explique cada línea — es tu derecho.

---

## Errores frecuentes al calcular el líquido

**Aplicar el porcentaje sobre el bruto total.** Los descuentos van sobre el imponible, que puede ser menor si tienes colación o movilización no imponible.

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
No, en el escenario habitual. Como referencia, en marzo de 2026 el primer tramo exento llega hasta $943.501,50 de renta tributable mensual. Si quedas bajo ese nivel, no pagas impuesto único ese mes.

**¿Puedo reducir legalmente lo que pago de impuesto?**
Sí. El APV en Régimen B reduce tu base imponible mensual, lo que baja el impuesto. Si cotizas $200.000 al mes en APV Régimen B y tu tasa marginal es 8%, pagas $16.000 menos de impuesto ese mes. [Más sobre el APV aquí](/posts/que-es-el-apv/).

**¿Dónde veo el impuesto que me corresponde exactamente?**
El SII publica la tabla mensual del Impuesto Único de Segunda Categoría en su sitio: [sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm](https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm)

---

## Qué hacer ahora

- Los descuentos van sobre el **imponible**, no sobre el bruto total.
- El **10% AFP** es tuyo; la comisión adicional depende de tu administradora y hoy puede mover bastante el descuento total.
- El **7% de salud** es el mínimo; si tienes Isapre puede ser más.
- El **impuesto único** es progresivo y se recalcula cada mes — un bono puede subirte el impuesto más de lo que esperabas.
- Si te subieron el sueldo y te bajó el líquido, probablemente cruzaste un tramo de impuesto.
- Puedes reducir legalmente tu impuesto mensual ahorrando en **APV Régimen B**.

Si quieres probar tus números exactos, usa una calculadora de sueldo líquido. Y si después necesitas desglosar mejor descuentos, comprobante o contingencias de empleo, cambia de ruta según esa necesidad específica. Para entender exactamente qué conceptos forman el [sueldo imponible](/posts/sueldo-imponible-chile/) — que es la base sobre la que se calculan todos estos descuentos — conviene revisarlo en detalle.

---
