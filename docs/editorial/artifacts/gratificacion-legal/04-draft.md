# Gate 04 — Draft: gratificacion-legal-chile

Status: DRAFT — pending MathAuditAgent (ChatGPT) and ComplianceAgent (fresh Claude Code session)
Role: DraftAgent (Claude Code — Sprint 2B session)
Fecha de corte: 2026-05-03
requires_calculation: true
regulatory_sensitivity: media

---

> **SEPARATION OF DUTIES NOTICE**
> Este draft fue producido por DraftAgent (Claude Code, sesión Sprint 2B).
> Gate 05 (MathAuditAgent) debe ejecutarse en ChatGPT — sesión separada. Es **obligatorio** por `INVARIANT.EDITORIAL.MATH_AUDIT_REQUIRED_WHEN_CALC` (requires_calculation=true).
> Gate 06 (ComplianceAgent) debe ejecutarse en una nueva sesión de Claude Code, sin contexto de esta sesión.
> Ver `context/EDITORIAL_AI_PIPELINE.md` §2 y §8.

---

> **DRAFT NOTE — TODO:SOURCE activos**
> Los valores del IMM marcados como `[IMM_VIGENTE_TODO:SOURCE]` y el tope `[TOPE_IMM_TODO:SOURCE]`
> deben ser reemplazados con los valores reales antes de publicar.
> El MathAuditAgent debe verificar y completar todos los TODO:SOURCE del ejemplo numérico.

---

## Draft del artículo

**Frontmatter previsto:**

```yaml
---
title: "Gratificación legal en Chile: cómo calcularla y cuál es el tope"
author: "Equipo Monedario"
description: "Qué es la gratificación legal, cuáles son las dos modalidades del Código del Trabajo, cómo calcular el 25% con el tope de 4,75 IMM y cuándo corresponde recibirla."
slug: gratificacion-legal-chile
pubDate: 2026-05-03T12:00:00-04:00
tags:
  - gratificacion
  - sueldo
  - remuneraciones
  - codigo-del-trabajo
  - empleo
category: empleo-ingresos
cluster: sueldo-remuneraciones
lang: es-CL
featured: false
draft: true
heroImage: /images/hero/gratificacion-legal-chile.avif
topicRole: owner
canonicalTopic: gratificacion-legal-calculo-tope
articleAdvisory: "Contenido educativo basado en el Código del Trabajo. Las cifras del IMM se actualizan periódicamente; verifica el valor vigente antes de hacer cualquier cálculo."
articleLead:
  answer: "La gratificación legal es la participación obligatoria que el empleador debe pagar a los trabajadores. La modalidad más común es el 25% de las remuneraciones imponibles anuales, con un tope máximo de 4,75 veces el Ingreso Mínimo Mensual (IMM) vigente."
  nextStepHref: "/posts/como-calcular-sueldo-liquido/"
  nextStepLabel: "Calcular tu sueldo líquido completo"
  validAsOf: 2026-05-03
  officialSources:
    - label: "BCN — Código del Trabajo, arts. 47–52"
      href: "https://www.bcn.cl/leychile/navegar?idNorma=207436"
    - label: "Dirección del Trabajo"
      href: "https://www.dt.gob.cl/"
  covers:
    - "Las dos modalidades legales y quién decide cuál aplica."
    - "La fórmula exacta y el tope de 4,75 IMM."
    - "Cuándo corresponde gratificación y cómo aparece en la liquidación."
    - "Qué pasa si la empresa tuvo pérdidas."
  limits:
    - "No reemplaza asesoría laboral específica para tu contrato o empresa."
    - "Los valores del IMM se actualizan; verifica el vigente en Ministerio del Trabajo."
    - "No cubre regímenes especiales (agricultura con contrato particular, algunos sectores regulados)."
---
```

---

## Cuerpo del artículo

> **Información vigente al 2026-05-03 según el Código del Trabajo y el IMM vigente a esa fecha.** El Ingreso Mínimo Mensual se actualiza periódicamente por ley; ante cambios, verifica el valor actual en el Ministerio del Trabajo antes de hacer cualquier cálculo.

Revisas tu liquidación y hay una línea que dice "gratificación". A veces es un monto fijo mensual. A veces no aparece. Y cuando preguntas por qué, la respuesta habitual es "eso lo decide la empresa". Pero la empresa no decide todo: hay reglas claras en el Código del Trabajo que establecen cuándo corresponde, cuánto es y qué tope tiene.

## ¿Qué es la gratificación legal y a quiénes aplica?

La gratificación legal es una parte de las remuneraciones que el empleador debe compartir con los trabajadores cuando el establecimiento donde prestan servicios obtiene utilidades en el ejercicio comercial (artículo 47 del Código del Trabajo).

**Quiénes tienen derecho:**

Todo trabajador que preste servicios en un establecimiento de carácter comercial, industrial, minero o agrícola, con independencia del tipo de contrato — indefinido o a plazo fijo — tiene derecho a gratificación legal según el artículo 47 del Código del Trabajo.

**Quiénes pueden quedar fuera:**

Las personas jurídicas sin fines de lucro y algunos regímenes especiales establecidos por ley pueden estar excluidos o sujetos a reglas distintas. Si tienes dudas sobre tu tipo de empleador, consulta directamente con la [Dirección del Trabajo](https://www.dt.gob.cl/).

## Las dos modalidades: 25 % de remuneraciones vs 30 % de utilidades

El Código del Trabajo establece dos formas de calcular y pagar la gratificación. **La elección es del empleador, no del trabajador.**

**Modalidad 1 — 30 % de utilidades netas (art. 47 CT)**

Cuando la empresa obtuvo utilidades líquidas en el ejercicio, puede distribuir el 30% de esas utilidades entre todos los trabajadores, en proporción a sus remuneraciones. Solo aplica si hay utilidades reales contabilizadas. Si la empresa tuvo pérdidas, esta modalidad no genera obligación de pago.

**Modalidad 2 — 25 % de remuneraciones imponibles con tope IMM (art. 50 CT)**

El empleador paga el 25% de las remuneraciones imponibles que el trabajador devengó durante el año, con un tope máximo de **4,75 veces el Ingreso Mínimo Mensual (IMM) vigente**. Esta modalidad subsiste aunque la empresa haya tenido pérdidas — la obligación no depende del resultado del ejercicio.

Esta es la modalidad más utilizada en Chile porque:
1. El monto es predecible (no depende de las utilidades).
2. Libera al empleador de compartir balances ni resultados del ejercicio.
3. Se puede provisionar mensualmente en la liquidación de sueldo.

## Cómo calcular: fórmula, tope máximo y ejemplo

### La fórmula base (modalidad 25 %)

```
Gratificación bruta anual = Suma de remuneraciones imponibles del año × 0,25
Tope anual = IMM mensual vigente × 4,75
Gratificación efectiva = el menor valor entre (gratificación bruta) y (tope anual)
```

### El tope en términos del IMM

El IMM vigente (Ley 21.751, Mintrab) es **CLP $539.000**.

Tope anual = $539.000 × 4,75 = **CLP $2.560.250**

Si se provisiona mensualmente en la liquidación: $2.560.250 ÷ 12 = **CLP $213.354 por mes**.

### Ejemplo numérico completo

Supongamos un trabajador con:
- Sueldo imponible mensual: **CLP $800.000** (fijo durante todo el año)
- Año trabajado completo (12 meses)

Remuneraciones imponibles anuales = $800.000 × 12 = **$9.600.000**

Gratificación bruta = $9.600.000 × 0,25 = **$2.400.000**

Tope legal = $539.000 × 4,75 = **$2.560.250**

Gratificación efectiva = min($2.400.000, $2.560.250) = **$2.400.000** (la bruta es menor al tope, se paga la bruta completa)

Si se provisiona mensualmente: $2.400.000 ÷ 12 = **$200.000 por mes**. El tope mensual de referencia (cuando el sueldo es alto) es $2.560.250 ÷ 12 = **$213.354 por mes**.

La gratificación efectiva, si se paga mensualmente, aparece en la liquidación dividida en 12 cuotas iguales.

Para entender cómo se integra la gratificación al total de tu sueldo, consulta [cómo calcular tu sueldo líquido](/posts/como-calcular-sueldo-liquido/).

## ¿Cuándo y cómo se paga? Mensual, anual y proporcional

**Provisión mensual:** aunque la obligación es anual, la práctica más extendida es que las empresas provisionen la gratificación en cada liquidación mensual. En la liquidación aparece como "Gratificación" o "Prov. Gratificación", por un monto equivalente a 1/12 del tope o del 25% proyectado.

**Pago anual:** la ley permite pagar la gratificación en una sola cuota. Si el empleador opta por esto, el pago debe hacerse dentro del ejercicio correspondiente o en el siguiente, según lo acuerde.

**Proporcional al tiempo trabajado:** si el trabajador no completó el año (contrato a plazo fijo terminado, renuncia, despido), tiene derecho a la gratificación proporcional al tiempo efectivamente trabajado (artículo 52 CT). Por ejemplo, quien trabajó 6 meses recibe el 50% del monto que hubiera correspondido al año completo, con el mismo tope.

Para entender cómo leer la [línea de gratificación en tu comprobante de sueldo](/posts/liquidacion-de-sueldo/), revisa la guía de liquidación de sueldo.

## ¿Qué pasa si la empresa no tuvo utilidades?

Si el empleador usa la **modalidad 25 %** (la más común), la obligación de pagar gratificación **subsiste aunque la empresa haya tenido pérdidas**. La ley no condiciona esta modalidad al resultado del ejercicio — el empleador eligió esta fórmula precisamente para separar la gratificación del resultado contable.

Si el empleador usa la **modalidad 30 % de utilidades** y la empresa no tuvo utilidades, no hay obligación de pago por esa vía.

Si tienes dudas sobre qué modalidad aplica a tu contrato o crees que la gratificación que recibes es incorrecta, consulta directamente con la [Dirección del Trabajo](https://www.dt.gob.cl/).

## Preguntas frecuentes

**¿La gratificación es parte del sueldo imponible?**

La gratificación legal recibida como parte del sueldo mensual provisionado es remuneración y puede ser base imponible para descuentos previsionales y tributarios. Sin embargo, hay reglas específicas sobre en qué casos cotiza y en cuáles no, que dependen de la forma de pago. Para revisar cómo afecta tus [descuentos de sueldo](/posts/descuentos-de-sueldo/), consulta esa guía.

**¿Puede el empleador descontar la gratificación si el trabajador comete un error?**

No. La gratificación legal no es un bono discrecional: es una obligación del empleador establecida por ley. No puede ser usada como mecanismo de castigo ni descontada por desempeño. El empleador puede tener bonos voluntarios adicionales que sí dependan del desempeño — eso es distinto de la gratificación legal.

**¿Cómo aparece en la liquidación de sueldo?**

Habitualmente como "Gratificación" o "Provisión Gratificación" en el bloque de haberes. Si no aparece y tienes derecho a ella, solicita la liquidación detallada a tu empleador. La [guía de liquidación de sueldo](/posts/liquidacion-de-sueldo/) explica cómo leer cada línea.

---

> **Fecha de corte: 2026-05-03.** El Ingreso Mínimo Mensual (IMM) se actualiza por la Ley 21.751 (Ministerio del Trabajo); ante cambios, el tope de 4,75 IMM también cambia. Verifica el IMM vigente en el [Ministerio del Trabajo](https://www.mintrab.gob.cl/) antes de hacer cualquier cálculo. Los artículos 47–52 del Código del Trabajo están disponibles en la [Biblioteca del Congreso Nacional](https://www.bcn.cl/leychile/navegar?idNorma=207436).
