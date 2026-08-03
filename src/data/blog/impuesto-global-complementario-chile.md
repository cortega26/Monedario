---
title: "Impuesto Global Complementario en Chile: qué es, tramos y quién lo paga"
author: "Equipo Monedario"
description: "Qué es el IGC, quiénes deben pagarlo, qué rentas suma, cuáles son los tramos vigentes en UTA y qué créditos permiten reducirlo: ISC, honorarios y APV."
slug: impuesto-global-complementario-chile
pubDate: 2026-05-03T12:00:00-04:00
tags:
  - igc
  - impuesto-global-complementario
  - renta
  - operacion-renta
  - impuestos
category: impuestos
cluster: impuestos-personas
lang: es-CL
featured: false
draft: false
heroImage: /images/hero/impuesto-global-complementario-chile.avif
topicRole: owner
canonicalTopic: igc-impuesto-global-complementario
articleAdvisory: "Contenido educativo. Los tramos del IGC se expresan en UTA, que varía anualmente. Verifica los valores vigentes en el SII antes del cierre de tu Operación Renta."
articleLead:
  answer: "El IGC es el impuesto anual que grava la totalidad de tus rentas del año: suma sueldo, honorarios, dividendos y arriendos para determinar tu tramo real. Los trabajadores con solo sueldo lo pagan indirectamente vía ISC; quienes tienen rentas mixtas deben liquidarlo en el F22."
  nextStepHref: "/posts/operacion-renta-f22-checklist/"
  nextStepLabel: "Completar el F22"
  validAsOf: 2026-05-14
  officialSources:
    - label: "SII — Datos informativos AT 2026 (IGC)"
      href: "https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html"
    - label: "BCN — Ley de Impuesto a la Renta, arts. 52–57"
      href: "https://www.bcn.cl/leychile/navegar?idNorma=6368"
  covers:
    - "Por qué el IGC suma todas tus rentas del año, no solo el sueldo."
    - "Los cuatro perfiles de contribuyentes que lo pagan directamente."
    - "Los tramos vigentes y cómo funciona la progresividad."
    - "Qué créditos reducen el IGC: ISC, retenciones de honorarios y APV."
  limits:
    - "No predice el resultado exacto de tu F22 — usa la calculadora o el SII."
    - "Ganancias de capital: excluidas del scope de este artículo por su complejidad."
    - "Los tramos se actualizan cada año tributario; verifica en el SII la tabla vigente."
volatileData:
  - id: economic.uta.value
    sync: strict
    expectedValue: 834504
updatedDate: 2026-08-03T00:00:00Z
reviewPolicy:
  cadenceLabel: quarterly
  maxDays: 90
  dataTriggers:
    - economic.uta.value
  derivationFactors:
    - registry:categoryPolicies.impuestos
    - template:uta
  computedAt: "2026-08-03"
---

> **Información vigente al 2026-05-14.** Los tramos del IGC se expresan en UTA (Unidad Tributaria Anual), que varía cada año. Verifica la tabla vigente en el [SII](https://www.sii.cl/) antes de tu Operación Renta. Este artículo no cubre ganancias de capital.

Tienes sueldo y además emites boletas de honorarios. O eres socio de una empresa y también recibes sueldo. O arriendas una propiedad. En todos esos casos, el Impuesto de Segunda Categoría que te retienen mensualmente no cierra el ciclo: al final del año, el SII suma todas tus rentas y liquida el Impuesto Global Complementario (IGC) en el F22.

## ¿Qué es el Impuesto Global Complementario?

El IGC es el impuesto anual que grava la totalidad de las rentas obtenidas durante el año por personas naturales domiciliadas en Chile, regulado en los artículos 52 a 57 de la [Ley de Impuesto a la Renta](https://www.bcn.cl/leychile/navegar?idNorma=6368).

El nombre lo explica: "global" porque suma todas las fuentes de renta; "complementario" porque complementa el ISC que se retuvo mensualmente durante el año. Si tus retenciones durante el año fueron suficientes para cubrir el IGC calculado, no pagas nada adicional — o recibes devolución. Si fueron insuficientes, pagas la diferencia.

## ¿Quiénes deben pagarlo?

No todos los contribuyentes liquidan IGC directamente. Los cuatro perfiles que sí lo hacen:

**1. Trabajador dependiente con ingresos por honorarios adicionales.**
El ISC cubre el sueldo, pero los honorarios se suman a la base global y pueden subir el tramo efectivo.

**2. Socio o accionista que también recibe sueldo.**
Los dividendos o retiros de utilidades de sociedades se suman al sueldo para determinar el IGC.

**3. Propietario que arrienda bienes raíces.**
La renta de arrendamiento (neta de gastos deducibles) se agrega a las demás rentas.

**4. Inversionista con rentas de capital.**
Intereses, dividendos de acciones y otros ingresos de capital entran en la base del IGC (ganancias de capital quedan fuera del scope de este artículo).

Los trabajadores con **solo sueldo** cuyo ISC retenido mensualmente coincide con lo que corresponde pagan el IGC a través de las retenciones — no tienen impuesto adicional que pagar al declarar.

## Qué rentas suma el IGC

El IGC consolida en una sola base todas las rentas del año:

- **Sueldos y salarios**: ya cubiertos por ISC, pero se suman para determinar el tramo global.
- **Honorarios**: la retención aplicada mensualmente es un crédito, pero la renta bruta entra en la base.
- **Dividendos de sociedades**: los retiros de utilidades se agregan con sus propias reglas de crédito.
- **Rentas de arrendamiento**: la renta bruta menos gastos presuntos o efectivos.

**Fuera del scope de este artículo**: ganancias de capital por venta de acciones, bienes raíces y otros activos tienen reglas específicas de tributación que exceden el alcance de esta guía.

## Tramos y tasas vigentes

El IGC tiene 8 tramos progresivos, expresados en UTA (Unidad Tributaria Anual). La UTA se calcula como 12 × UTM del mes de diciembre del año tributario. La UTA vigente es **[[uta | clp]]**; el primer tramo exento cubre rentas anuales hasta **[[uta * 13.5 | clp]]** (13,5 UTA).

**Tabla IGC** (tramos fijos por ley; rebaja en CLP = factor × UTA del año tributario). Fuente: [SII — Datos informativos AT 2026](https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html).

| Tramo (UTA)   | Tasa   | Factor de rebaja |
| ------------- | ------ | ---------------- |
| 0–13,5 UTA    | Exento | —                |
| 13,5–30 UTA   | 4%     | 0,54 × UTA       |
| 30–50 UTA     | 8%     | 1,74 × UTA       |
| 50–70 UTA     | 13,5%  | 4,49 × UTA       |
| 70–90 UTA     | 23%    | 11,14 × UTA      |
| 90–120 UTA    | 30,4%  | 17,80 × UTA      |
| 120–310 UTA   | 35%    | 23,32 × UTA      |
| Sobre 310 UTA | 40%    | 38,82 × UTA      |

Con UTA = [[uta | clp]] (AT 2026): el tramo exento cubre hasta [[uta * 13.5 | clp]], el del 4% hasta [[uta * 30 | clp]] (rebaja: [[uta * 0.54 | clp]]), el del 8% hasta [[uta * 50 | clp]] (rebaja: [[uta * 1.74 | clp]]), el del 13,5% hasta [[uta * 70 | clp]] (rebaja: [[uta * 4.49 | clp]]). Los tramos en UTA son fijos por ley ([art. 52 LIR](https://www.bcn.cl/leychile/navegar?idNorma=6368), modificado por Ley 21.210 desde 2020).

La progresividad funciona así: solo el tramo que supera cada umbral paga la tasa correspondiente. Si tu renta global queda en el cuarto tramo, solo esa porción marginal paga la tasa del cuarto tramo — los tramos inferiores pagan sus tasas más bajas.

## Créditos y deducciones disponibles

Varios pagos realizados durante el año se convierten en créditos que reducen el IGC final:

**ISC retenido mensualmente**
Lo que tu empleador descontó mes a mes como Impuesto de Segunda Categoría se imputa directamente contra el IGC. Es el crédito más importante para los trabajadores dependientes.

**Retenciones de boletas de honorarios**
La retención aplicada a tus boletas de honorarios es un crédito contra el IGC. Para el año tributario 2026, la tasa de retención es **15,25%** (verifica en el [SII](https://www.sii.cl/) ante posibles actualizaciones). Si cotizaste como trabajador independiente, también están sujetas cotizaciones previsionales obligatorias sobre tus honorarios según la Ley 21.242 (entrada en vigor progresiva desde 2019) — revisa el F22 del SII o consulta a un contador para el monto aplicable a tu año tributario.

**APV Modalidad A vs Modalidad B**

El APV puede reducir el IGC según la modalidad elegida, de acuerdo con el [artículo 42 bis de la LIR](https://www.bcn.cl/leychile/navegar?idNorma=6368):

- **Modalidad A**: genera un crédito tributario directo sobre el monto cotizado, hasta **50 UF mensuales o 600 UF anuales** ([art. 42 bis LIR](https://www.bcn.cl/leychile/navegar?idNorma=6368)).
- **Modalidad B**: reduce la base imponible del IGC, con el mismo tope de 600 UF anuales establecido en el mismo artículo.

Los topes se expresan en UF — verifica los valores vigentes en el [SII](https://www.sii.cl/) para confirmar actualizaciones al año tributario correspondiente.

**Contribuciones de bienes raíces** (solo para arrendadores)
Las contribuciones pagadas pueden ser deducibles como gasto en rentas de arrendamiento — las condiciones exactas dependen del régimen tributario y del año tributario. Consulta las instrucciones del F22 del SII o a un contador para confirmar si aplica a tu situación. Para el contexto del impuesto territorial, revisa la guía de [contribuciones de bienes raíces](/posts/contribuciones-bienes-raices-chile/).

## Cómo se declara: el F22

El IGC se liquida a través del Formulario 22 (F22) de la Operación Renta, en abril de cada año por el período tributario del año anterior. El SII prellenará el F22 con la información disponible (retenciones, boletas, etc.); el contribuyente verifica, agrega lo que falte y envía.

Para el proceso paso a paso de cómo completar y enviar el F22, revisa la [guía de Operación Renta F22](/posts/operacion-renta-f22-checklist/).

## ¿Resultado: pago adicional o devolución?

Si tus créditos (ISC retenido + retenciones de honorarios + APV + otros) superan el IGC calculado sobre tu renta global, obtienes devolución. Si el IGC calculado supera tus créditos, pagas la diferencia.

El resultado exacto depende de tus rentas totales del año y los créditos específicos de tu situación. Para una estimación orientativa, usa la [calculadora de Operación Renta](/calculadoras/operacion-renta/). Si tu situación es compleja (sociedades, múltiples fuentes de renta, ganancias de capital), consulta con un contador.

Si el resultado es devolución, la guía de [devolución de impuestos](/posts/devolucion-impuestos-fechas-compensaciones/) explica los plazos y mecanismos.
