# Gate 03 — Outline: gratificacion-legal-chile

Status: DRAFT — pending DraftAgent execution
Role: OutlineAgent (Claude Code — Sprint 2B session)
Slug: gratificacion-legal-chile
Fecha: 2026-05-03

---

## Differentiator local (INVARIANT.STRATEGY.DIFFERENTIATED_ADOPTION_REQUIRED)

- **localDelta**: Enfoque en la decisión del empleador (no del trabajador) como clave del artículo. La mayoría de las búsquedas son "¿me corresponde gratificación?" y "¿cuánto?"; este artículo responde ambas con la fórmula explícita y el tope IMM vigente. Ejemplo numérico completo con cifras reales (placeholder hasta confirmar IMM).
- **nonCopyBoundaries**: No absorbe "calcular sueldo líquido completo" (owner: `como-calcular-sueldo-liquido`). No aborda bonos discrecionales ni gratificación voluntaria. No repite tutorial de descuentos obligatorios (owner: `descuentos-de-sueldo`).
- **ownerTarget**: `sueldo-remuneraciones::gratificacion-legal-calculo-tope` — cluster endurecido, registro PRE-02 completado.

---

## Anti-canibalización explícita

| Artículo owner existente | Head term protegido | Cómo evitar solapamiento |
|---|---|---|
| `como-calcular-sueldo-liquido` | calcular sueldo líquido | No incluir calculadora completa; enlazar como contexto |
| `descuentos-de-sueldo` | descuentos obligatorios del sueldo | Mencionar que la gratificación puede ser base imponible y enlazar |
| `liquidacion-de-sueldo` | auditar comprobante de sueldo | Mencionar la línea de gratificación en la liquidación y enlazar |

---

## Estructura editorial (H2 canónicas)

### Apertura (sin H2)
- Situación del lector: recibió la liquidación y no sabe qué es la línea de gratificación, o le dijeron que "no corresponde" y quiere saber si es cierto.
- Ancla: Código del Trabajo como base normativa.

### `## ¿Qué es la gratificación legal y a quiénes aplica?`
- Definición legal: parte de las remuneraciones que el empleador comparte con los trabajadores en función de las utilidades del negocio (art. 47 CT).
- Quiénes tienen derecho: establecimientos comerciales, industriales, mineros y agrícolas — incluye contrato indefinido y a plazo fijo.
- Quiénes quedan fuera: empresas sin fines de lucro, regímenes especiales (verificar con S1).

### `## Las dos modalidades: 25 % de remuneraciones vs 30 % de utilidades`
- Modalidad 1 (art. 47 CT): 30% de utilidades netas del ejercicio, distribuido entre todos los trabajadores en proporción a sus sueldos. Solo aplica si hay utilidades.
- Modalidad 2 (art. 50 CT): 25% de remuneraciones imponibles anuales, con tope 4,75 IMM. Aplica aunque la empresa tenga pérdidas.
- **Quién decide**: el empleador. El trabajador no puede exigir una modalidad sobre la otra.
- Práctica habitual: la mayoría de las empresas usa la modalidad 25% por predictibilidad.

### `## Cómo calcular: fórmula, tope máximo y ejemplo`
- Fórmula modalidad 25%: `Gratificación bruta = remuneraciones imponibles anuales × 0,25`
- Tope: `Tope = IMM mensual × 4,75` [TODO:SOURCE C4 — insertar IMM vigente]
- Gratificación efectiva = `min(gratificación bruta, tope)`
- Ejemplo completo: trabajador con sueldo imponible mensual de $800.000, año completo → cálculo paso a paso [TODO:SOURCE — cifras del ejemplo dependen de IMM confirmado]
- Pago mensual (provisión 1/12): `Tope / 12` mensual si se provisiona.

### `## ¿Cuándo y cómo se paga? Mensual, anual y proporcional`
- La ley no obliga pago mensual, pero la práctica habitual es provisionarlo en cada liquidación (1/12 del tope o del 25% anual estimado).
- Pago anual: puede hacerse en cualquier momento del ejercicio siguiente.
- Proporcional: trabajador con menos de 12 meses tiene derecho proporcional (art. 52 CT).

### `## ¿Qué pasa si la empresa no tuvo utilidades?`
- Modalidad 25% subsiste igual: el empleador debe pagar aunque haya pérdidas.
- Modalidad 30% NO aplica: si no hay utilidades, no hay distribución.
- La empresa no puede eximirse de la obligación de gratificación alegando pérdidas si usa modalidad 25%.

### `## Preguntas frecuentes`
- FAQ 1: ¿La gratificación es parte del sueldo imponible?
- FAQ 2: ¿Puede el empleador descontar la gratificación si el trabajador comete un error?
- FAQ 3: ¿Cómo aparece en la liquidación de sueldo?

---

## Inbound links que recibirá este artículo

> Deferred a publicación (misma razón que fondo-emergencia: links a draft generan broken-link en corpus publicado).

| Fuente | Texto ancla propuesto | Sección |
|---|---|---|
| `como-calcular-sueldo-liquido` | "gratificación legal" | Sección de componentes del sueldo bruto |
| `liquidacion-de-sueldo` | "la línea de gratificación en tu comprobante" | Sección de haberes |

## Outbound links del nuevo artículo

| Destino | Texto ancla propuesto | Sección |
|---|---|---|
| `/posts/como-calcular-sueldo-liquido/` | "cómo integra tu sueldo total" | Sección de cálculo |
| `/posts/liquidacion-de-sueldo/` | "cómo leer la línea de gratificación en tu comprobante" | Sección de pago |
| `/posts/descuentos-de-sueldo/` | "la gratificación como base imponible para descuentos" | Sección de cálculo / FAQ |

---

## Frontmatter previsto

```yaml
title: "Gratificación legal en Chile: cómo calcularla y cuál es el tope"
description: "Qué es la gratificación legal, cuáles son las dos modalidades del Código del Trabajo, cómo calcular el 25% con el tope de 4,75 IMM y cuándo corresponde recibirla."
slug: gratificacion-legal-chile
category: empleo-ingresos
cluster: sueldo-remuneraciones
topicRole: owner
canonicalTopic: gratificacion-legal-calculo-tope
draft: true
```
