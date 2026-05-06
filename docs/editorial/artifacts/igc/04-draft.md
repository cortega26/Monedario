# Gate 04 — Draft: impuesto-global-complementario-chile

Status: DRAFT — pending MathAuditAgent (ChatGPT) and ComplianceAgent (fresh Claude Code session)
Role: DraftAgent (Claude Code — Sprint 2B)
Fecha de corte: 2026-05-03
requires_calculation: true
regulatory_sensitivity: alta

> **SoD NOTICE**: DraftAgent = Claude Code Sprint 2B. Gate 05 → ChatGPT (obligatorio). Gate 06 → nueva sesión Claude Code (obligatorio por alta sensibilidad).
> **TODO:SOURCE críticos**: tabla de tramos IGC en UTA, valor UTA 2026, tasa retención honorarios 2026, condiciones exactas APV Modalidad A vs B.

---

## TODO:SOURCE para MathAuditAgent

| # | Claim | Prioridad | Estado post-remediación |
|---|---|---|---|
| C3/C4 | Tabla 7 tramos IGC con UTA 2026 y equivalencia en pesos | CRÍTICO | RESUELTO — UTA 2026 $834.504; tramo exento $11.265.804 (13,5 UTA) |
| C4 | Valor exacto UTA 2026 (= 12 × UTM dic. año anterior) | CRÍTICO | RESUELTO — $834.504 verificado por MathAuditAgent (SII) |
| C6 | Tasa retención honorarios vigente 2026 | Alta | RESUELTO — 15,25% AT 2026 verificado |
| C7 | Condiciones APV Modalidad A (crédito 15%) vs Modalidad B (reducción base) — topes vigentes | Alta | PARCIALMENTE RESUELTO — topes deferidos al SII; URL art. 42 bis LIR agregada |
| C8 | Condiciones deducción contribuciones bienes raíces para arrendadores en IGC | Alta | REFORMULADO — condicional con deferred al SII/contador |

## Decisión editorial confirmada

- Ganancias de capital: **excluidas del scope** de esta versión. El artículo menciona explícitamente que no las cubre. Esta decisión queda registrada aquí para que ComplianceAgent lo valide como scope decision, no como omisión accidental.

---

## Cuerpo del artículo (body para src/data/blog/impuesto-global-complementario-chile.md)

> **Información vigente al 2026-05-03.** Los tramos del IGC se expresan en UTA (Unidad Tributaria Anual), que varía cada año. Verifica la tabla vigente en el [SII](https://www.sii.cl/) antes de tu Operación Renta. Este artículo no cubre ganancias de capital.

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

El IGC tiene 7 tramos progresivos, expresados en UTA (Unidad Tributaria Anual). La UTA se calcula como 12 × UTM del mes de diciembre del año tributario.

La UTA 2026 es **$834.504**. El primer tramo exento (0%) aplica a rentas globales anuales hasta **$11.265.804** (equivalente a 13,5 UTA). Para la tabla completa de los 7 tramos vigentes con tasas y montos a rebajar, consulta la [página oficial del SII](https://www.sii.cl/).

La progresividad funciona así: solo el tramo que supera cada umbral paga la tasa correspondiente. Si tu renta global queda en el cuarto tramo, solo esa porción marginal paga la tasa del cuarto tramo — los tramos inferiores pagan sus tasas más bajas.

## Créditos y deducciones disponibles

Varios pagos realizados durante el año se convierten en créditos que reducen el IGC final:

**ISC retenido mensualmente**
Lo que tu empleador descontó mes a mes como Impuesto de Segunda Categoría se imputa directamente contra el IGC. Es el crédito más importante para los trabajadores dependientes.

**Retenciones de boletas de honorarios**
La retención aplicada a tus boletas de honorarios es un crédito contra el IGC. Para el año tributario 2026, la tasa de retención es **15,25%** (verifica en el [SII](https://www.sii.cl/) ante posibles actualizaciones). Si cotizaste como trabajador independiente, también están sujetas cotizaciones previsionales obligatorias sobre tus honorarios según la Ley 21.242 (entrada en vigor progresiva desde 2019) — revisa el F22 del SII o consulta a un contador para el monto aplicable a tu año tributario.

**APV Modalidad A vs Modalidad B**

El APV puede reducir el IGC según la modalidad elegida, de acuerdo con el [artículo 42 bis de la LIR](https://www.bcn.cl/leychile/navegar?idNorma=6368):
- **Modalidad A**: genera un beneficio tributario sobre el monto cotizado, con topes establecidos en el [art. 42 bis de la LIR](https://www.bcn.cl/leychile/navegar?idNorma=6368) — verifica los topes vigentes en el [SII](https://www.sii.cl/) para el año tributario correspondiente.
- **Modalidad B**: reduce la base imponible del IGC, con topes distintos establecidos en el mismo artículo.

Las condiciones exactas y los topes vigentes deben verificarse en el [SII](https://www.sii.cl/) — las instrucciones del F22 del año tributario correspondiente detallan la mecánica aplicable.

**Contribuciones de bienes raíces** (solo para arrendadores)
Las contribuciones pagadas pueden ser deducibles como gasto en rentas de arrendamiento — las condiciones exactas dependen del régimen tributario y del año tributario. Consulta las instrucciones del F22 del SII o a un contador para confirmar si aplica a tu situación. Para el contexto del impuesto territorial, revisa la guía de [contribuciones de bienes raíces](/posts/contribuciones-bienes-raices-chile/).

## Cómo se declara: el F22

El IGC se liquida a través del Formulario 22 (F22) de la Operación Renta, en abril de cada año por el período tributario del año anterior. El SII prellenará el F22 con la información disponible (retenciones, boletas, etc.); el contribuyente verifica, agrega lo que falte y envía.

Para el proceso paso a paso de cómo completar y enviar el F22, revisa la [guía de Operación Renta F22](/posts/operacion-renta-f22-checklist/).

## ¿Resultado: pago adicional o devolución?

Si tus créditos (ISC retenido + retenciones de honorarios + APV + otros) superan el IGC calculado sobre tu renta global, obtienes devolución. Si el IGC calculado supera tus créditos, pagas la diferencia.

El resultado exacto depende de tus rentas totales del año y los créditos específicos de tu situación. Para una estimación orientativa, usa la [calculadora de Operación Renta](/calculadoras/operacion-renta/). Si tu situación es compleja (sociedades, múltiples fuentes de renta, ganancias de capital), consulta con un contador.

Si el resultado es devolución, la guía de [devolución de impuestos](/posts/devolucion-impuestos-fechas-compensaciones/) explica los plazos y mecanismos.

---

> **Fecha de corte: 2026-05-03.** Los tramos del IGC (expresados en UTA) y el valor de la UTA se actualizan cada año tributario. Verifica la tabla vigente en el [SII](https://www.sii.cl/) antes de tu Operación Renta. Los artículos 52–57 de la Ley de Impuesto a la Renta están disponibles en la [BCN](https://www.bcn.cl/leychile/navegar?idNorma=6368).
