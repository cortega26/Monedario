# Brief P1 — sueldo-imponible-chile

Fecha: 2026-05-03
Sprint: 2
Estado: BRIEF — pendiente redacción y pipeline YMYL

---

## Slug objetivo

`sueldo-imponible-chile`
URL futura: `/posts/sueldo-imponible-chile/`

## Cluster y canonicalTopic propuesto

- Cluster: `sueldo-remuneraciones`
- canonicalTopic propuesto: `sueldo-imponible-base-descuentos`
- Cluster endurecido: **SÍ** (`HARDENED_OWNERSHIP_CLUSTERS`)

> Gate de pre-publicación obligatorio: registrar `sueldo-imponible-base-descuentos` en
> `CANONICAL_TOPIC_REGISTRY["sueldo-remuneraciones"]` en `src/config/editorial-topic-policy.mjs`
> antes del checkpoint de redacción (gate 02).

## Intención de búsqueda primaria

Entender qué es el sueldo imponible en Chile y cómo determina los descuentos previsionales,
el Impuesto de Segunda Categoría y los beneficios relacionados con el salario.

## Rol editorial

- `topicRole: owner` o `support` (decidir según si compite con `como-calcular-sueldo-liquido`)
- Artículo puente del cluster `sueldo-remuneraciones`: explica la base técnica sobre la que se
  calculan todos los descuentos; no intenta reemplazar la calculadora de sueldo líquido.

## Diferenciación intra-cluster (anti-canibalización)

Este artículo NO debe:
- Ofrecer el cálculo completo de sueldo líquido — eso es `/calculadoras/sueldo-liquido/` y
  `como-calcular-sueldo-liquido`.
- Replicar la clasificación completa de descuentos — eso es `descuentos-de-sueldo`.
- Detallar la liquidación de sueldo línea a línea — eso es `liquidacion-de-sueldo`.

Este artículo SÍ debe:
- Definir qué componentes integran la base imponible y cuáles la excluyen (bonos, colación, movilización).
- Explicar cómo la base imponible afecta AFP, isapre/fonasa, ISC y créditos sociales.
- Ser el vínculo entre "cuánto gano" y "cuánto me descuentan".

## Fuentes oficiales requeridas

1. DT (Dirección del Trabajo) — definición de remuneración imponible
2. SII — Impuesto de Segunda Categoría y base de cálculo
3. BCN — Código del Trabajo art. 41 (remuneración imponible) y tramos ISC vigentes

## Estructura propuesta (H2 principales)

1. ¿Qué es el sueldo imponible? (definición legal)
2. Qué incluye la base imponible y qué no (colación, movilización, asignación familiar)
3. Diferencia entre sueldo bruto, imponible y líquido
4. Cómo afecta el sueldo imponible a AFP e isapre/fonasa
5. Cómo determina el Impuesto de Segunda Categoría (tramos y ejemplo)
6. APV y reducción de la base imponible
7. Límite máximo imponible para cotizaciones previsionales
8. Ejemplo numérico completo (bruto → imponible → descuentos → líquido)

## Claims YMYL a verificar antes de publicar

- Límite máximo imponible AFC/AFP: 87,1 UF (verificar valor vigente y fecha de corte).
- Tramos del Impuesto de Segunda Categoría: actualizar con tabla SII vigente al mes del artículo.
- Confirmar que la asignación familiar NO es imponible pero el bono de asistencia SÍ puede serlo
  (distinción que confunde a trabajadores).
- Fecha de corte visible; los valores en UF se actualizan mensualmente.
- Artículo NO debe calcular sueldo líquido completo — redirigir a calculadora y owner.

## Calculadora relacionada

- `/calculadoras/sueldo-liquido/` — para el cálculo completo
- `/calculadoras/impuesto-segunda-categoria/` — para el tramo ISC

## Artículos internos que enlazarán al nuevo owner (inbound)

| Artículo | Mecanismo | Cluster |
|---|---|---|
| `como-calcular-sueldo-liquido` | Mención de la base imponible como paso previo al descuento | `sueldo-remuneraciones` |
| `liquidacion-de-sueldo` | Referencia a la línea de remuneración imponible en el comprobante | `sueldo-remuneraciones` |
| `descuentos-de-sueldo` | Contexto: todos los descuentos se aplican sobre la base imponible | `sueldo-remuneraciones` |

## Artículos internos que el nuevo owner enlazará (outbound)

| Artículo | Motivo del enlace |
|---|---|
| `como-calcular-sueldo-liquido` | Resultado final del proceso; evita replicar el cálculo completo |
| `liquidacion-de-sueldo` | Dónde aparece la base imponible en el comprobante |
| `/calculadoras/impuesto-segunda-categoria/` | Herramienta para calcular el ISC sobre la base |

## Gates del pipeline que aplican

| Gate | Archivo | Responsable | Notas |
|---|---|---|---|
| 01 Brief aprobado | `briefs/sueldo-imponible.md` (este doc) | Humano | Confirmar rol: owner vs support puente |
| **PRE-02** | `src/config/editorial-topic-policy.mjs` | Agente | Registrar `sueldo-imponible-base-descuentos` en `CANONICAL_TOPIC_REGISTRY["sueldo-remuneraciones"]` |
| 02 Research / Dossier | `artifacts/sueldo-imponible/02-research.md` | Agente + Humano | DT + SII + BCN; límite UF y tramos ISC vigentes con fecha |
| 03 Outline | `artifacts/sueldo-imponible/03-outline.md` | Agente | Confirmar que no absorbe head terms de sueldo líquido ni liquidación |
| 04 Draft | `artifacts/sueldo-imponible/04-draft.md` | Agente | Fecha de corte visible; valores UF referenciados |
| 05 Math audit | `artifacts/sueldo-imponible/05-math-audit.md` | Agente | Verificar tramos ISC, límite UF, ejemplos numéricos |
| 06 Compliance YMYL | `artifacts/sueldo-imponible/06-compliance.md` | Agente | Sin recomendaciones de instrumento APV específico |
| 07 Publish packet | `artifacts/sueldo-imponible/07-publish-packet.md` | **Solo humano** | Separación de deberes |

## Riesgo YMYL

Medio — datos numéricos actualizables (límite UF, tramos ISC). La fecha de corte es obligatoria.
