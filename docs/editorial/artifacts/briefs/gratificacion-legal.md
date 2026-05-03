# Brief P1 — gratificacion-legal-chile

Fecha: 2026-05-03
Sprint: 2
Estado: BRIEF — pendiente redacción y pipeline YMYL

---

## Slug objetivo

`gratificacion-legal-chile`
URL futura: `/posts/gratificacion-legal-chile/`

## Cluster y canonicalTopic propuesto

- Cluster: `sueldo-remuneraciones`
- canonicalTopic propuesto: `gratificacion-legal-calculo-tope`
- Cluster endurecido: **SÍ** (`HARDENED_OWNERSHIP_CLUSTERS`)

> Gate de pre-publicación obligatorio: registrar `gratificacion-legal-calculo-tope` en
> `CANONICAL_TOPIC_REGISTRY["sueldo-remuneraciones"]` en `src/config/editorial-topic-policy.mjs`
> antes del checkpoint de redacción (gate 02). Sin ese registro, `audit:topic-overlap` marcará
> el artículo como cluster violation.

## Intención de búsqueda primaria

Calcular la gratificación legal en Chile: qué modalidad aplica, cómo determinar el tope con el IMM y cuándo corresponde recibirla.

## Rol editorial

- `topicRole: owner`
- Satélite del cluster `sueldo-remuneraciones`; la calculadora futura (`/calculadoras/gratificacion-legal/`)
  enlazará de vuelta a este owner sin reemplazarlo.

## Diferenciación intra-cluster (anti-canibalización)

Este artículo NO debe:
- Prometer "calcular sueldo líquido completo" — eso es `como-calcular-sueldo-liquido`.
- Repetir el tutorial completo de descuentos obligatorios — eso es `descuentos-de-sueldo`.
- Abordar gratificación voluntaria o bonos discrecionales como head term.

Este artículo SÍ debe:
- Resolver la fórmula exacta (25 % de remuneraciones imponibles anuales, tope 4,75 IMM) y los dos
  modelos legales del Código del Trabajo (art. 47–50).
- Responder "¿mi empresa debe pagarme gratificación?" y "¿cuánto me corresponde este año?".

## Fuentes oficiales requeridas

1. DT (Dirección del Trabajo) — ordinarios sobre gratificación legal y base de cálculo
2. BCN — Código del Trabajo, artículos 47–52 (texto vigente)
3. Ministerio del Trabajo — IMM vigente para el año en curso

## Estructura propuesta (H2 principales)

1. ¿Qué es la gratificación legal y a quiénes aplica?
2. Las dos modalidades: 25 % de RMR vs 30 % de utilidades netas
3. Cómo calcular: fórmula paso a paso y tope máximo (4,75 IMM)
4. ¿Quiénes tienen derecho? (contrato, plazo, tipo de empresa)
5. ¿Cuándo y cómo se paga? (mensual, anual, proporcional)
6. ¿Qué pasa si la empresa no tuvo utilidades?
7. Ejemplo numérico completo

## Claims YMYL a verificar antes de publicar

- Fórmula: 25 % de remuneraciones imponibles anuales, tope = 4,75 IMM mensual × 12 (BCN art. 50).
- Confirmar IMM vigente en la fecha de corte del artículo.
- Las dos modalidades no son optativas para el trabajador — es la empresa quien elige (aclarar).
- Empresas con pérdidas o sin utilidades: obligación de modalidad 25 % igual subsiste.
- Artículo debe incluir fecha de corte visible (IMM puede actualizarse).

## Calculadora relacionada

Propuesta futura: `/calculadoras/gratificacion-legal/` (Sprint 3 P1 según roadmap).
El owner editorial debe existir antes de publicar la calculadora.

## Artículos internos que enlazarán al nuevo owner (inbound)

| Artículo | Mecanismo | Cluster |
|---|---|---|
| `como-calcular-sueldo-liquido` | Mención de gratificación como componente del sueldo bruto | `sueldo-remuneraciones` |
| `liquidacion-de-sueldo` | Línea de gratificación en el comprobante | `sueldo-remuneraciones` |

## Artículos internos que el nuevo owner enlazará (outbound)

| Artículo | Motivo del enlace |
|---|---|
| `como-calcular-sueldo-liquido` | Contexto: cómo la gratificación integra el sueldo total |
| `liquidacion-de-sueldo` | Cómo leer la línea de gratificación en el comprobante |
| `descuentos-de-sueldo` | La gratificación puede ser base imponible para descuentos |

## Gates del pipeline que aplican

| Gate | Archivo | Responsable | Notas |
|---|---|---|---|
| 01 Brief aprobado | `briefs/gratificacion-legal.md` (este doc) | Humano | Revisión de scope y diferenciación intra-cluster |
| **PRE-02** | `src/config/editorial-topic-policy.mjs` | Agente | Registrar `gratificacion-legal-calculo-tope` en `CANONICAL_TOPIC_REGISTRY["sueldo-remuneraciones"]` |
| 02 Research / Dossier | `artifacts/gratificacion-legal/02-research.md` | Agente + Humano | DT + BCN art. 47–52; IMM vigente con fecha de corte |
| 03 Outline | `artifacts/gratificacion-legal/03-outline.md` | Agente | Confirmar estructura sin absorber head terms de otros owners |
| 04 Draft | `artifacts/gratificacion-legal/04-draft.md` | Agente | Fecha de corte visible; IMM referenciado |
| 05 Math audit | `artifacts/gratificacion-legal/05-math-audit.md` | Agente | Verificar fórmula, tope 4,75 IMM, ejemplos numéricos |
| 06 Compliance YMYL | `artifacts/gratificacion-legal/06-compliance.md` | Agente | Verificar separación educación vs asesoría laboral |
| 07 Publish packet | `artifacts/gratificacion-legal/07-publish-packet.md` | **Solo humano** | Separación de deberes |

## Riesgo YMYL

Medio — claim legal con números (IMM, fórmula). Los valores del IMM cambian por ley y deben
tener fecha de corte explícita.
