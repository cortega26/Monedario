# Brief P1 — pgu-pension-garantizada-universal

Fecha: 2026-05-03
Sprint: 2
Estado: BRIEF — pendiente redacción y pipeline YMYL

---

## Slug objetivo

`pgu-pension-garantizada-universal`
URL futura: `/posts/pgu-pension-garantizada-universal/`

## Cluster y canonicalTopic propuesto

- Cluster: `pensiones-afp`
- canonicalTopic propuesto: `pgu-pension-garantizada`
- Cluster endurecido: **SÍ** (`HARDENED_OWNERSHIP_CLUSTERS`)

> Gate de pre-publicación obligatorio: registrar `pgu-pension-garantizada` en
> `CANONICAL_TOPIC_REGISTRY["pensiones-afp"]` en `src/config/editorial-topic-policy.mjs`
> antes del checkpoint de redacción (gate 02).

## Intención de búsqueda primaria

PGU en Chile: requisitos actuales, monto vigente, cómo tramitarla ante el IPS y cómo se combina
con la pensión AFP.

## Rol editorial

- `topicRole: owner`
- La PGU es un beneficio estatal evergreen de alto tráfico mensual. No debe absorber todo el
  calendario de reforma previsional — ese es el owner de `reforma-previsional-2025-que-cambia-y-como-te-afecta`.
- No debe recomendar AFP ni instrumento previsional.

## Diferenciación intra-cluster (anti-canibalización)

Este artículo NO debe:
- Describir el proceso de cambio de AFP — eso es `como-cambiarse-de-afp`.
- Comparar fondos AFP — eso es `fondos-afp-a-b-c-d-e`.
- Cubrir la reforma previsional como head term — eso es `reforma-previsional-2025`.
- Recomendar AFP específica para maximizar PGU.

Este artículo SÍ debe:
- Resolver "¿me corresponde la PGU?", "¿cuánto recibiré?", "¿cómo la pido?" y "¿se reduce si
  tengo pensión AFP?".
- Ser la fuente primaria del monto vigente, el calendario de pago y los requisitos de residencia.

## Fuentes oficiales requeridas

1. IPS (Instituto de Previsión Social) — requisitos, monto, trámite y calendario de pago
2. Ley 21.015 (PGU) — texto vigente vía BCN, actualizado con modificaciones posteriores
3. Ministerio de Desarrollo Social — criterios de elegibilidad y percentil de ingresos
4. CMF — reglas sobre complemento con pensión autofinanciada (para la sección de interacción AFP)

## Estructura propuesta (H2 principales)

1. ¿Qué es la PGU?
2. ¿Quiénes pueden recibirla? (edad, residencia, percentil 90 % de menores ingresos)
3. ¿Cuánto se paga? (monto vigente, calendario de ajuste — con fecha de corte visible)
4. ¿Cómo tramitarla? (proceso IPS, documentos, plazos)
5. PGU y pensión AFP: ¿se complementan o se restan?
6. Casos frecuentes: adultos mayores sin cotizaciones, extranjeros residentes, personas con APV
7. Preguntas frecuentes

## Claims YMYL a verificar antes de publicar

- Monto vigente de la PGU al mes de publicación (se reajusta por ley; fecha de corte obligatoria).
- Requisito de residencia: 20 años en Chile desde los 20 años de edad (verificar texto vigente BCN).
- Percentil de ingresos del 90 %: confirmar criterio actual (puede variar por instrumento legal).
- Interacción con pensión AFP: la PGU se reduce en función de la pensión base; explicar la fórmula
  sin simplificar en exceso.
- No prometer monto definitivo — cada caso depende del IPS.

## Calculadora relacionada

`/calculadoras/simulador-jubilacion/` — enlazar como herramienta complementaria, no como
sustituto del trámite IPS.

## Artículos internos que enlazarán al nuevo owner (inbound)

| Artículo | Mecanismo | Cluster |
|---|---|---|
| `reforma-previsional-2025-que-cambia-y-como-te-afecta` | Sección de beneficios vigentes con mención a PGU | `pensiones-afp` |
| `fondos-afp-a-b-c-d-e` | Cierre: para quienes no tienen suficiente cotización, mención PGU | `pensiones-afp` |

## Artículos internos que el nuevo owner enlazará (outbound)

| Artículo | Motivo del enlace |
|---|---|
| `reforma-previsional-2025-que-cambia-y-como-te-afecta` | Contexto del sistema previsional y cambios recientes |
| `/calculadoras/simulador-jubilacion/` | Herramienta para proyectar pensión y estimar complemento PGU |

## Gates del pipeline que aplican

| Gate | Archivo | Responsable | Notas |
|---|---|---|---|
| 01 Brief aprobado | `briefs/pgu.md` (este doc) | Humano | Riesgo YMYL alto; confirmar alcance antes de abrir pipeline |
| **PRE-02** | `src/config/editorial-topic-policy.mjs` | Agente | Registrar `pgu-pension-garantizada` en `CANONICAL_TOPIC_REGISTRY["pensiones-afp"]` |
| 02 Research / Dossier | `artifacts/pgu/02-research.md` | Agente + Humano | IPS + BCN ley 21.015 + Ministerio; monto con fecha de corte explícita |
| 03 Outline | `artifacts/pgu/03-outline.md` | Agente | Confirmar que no absorbe reforma previsional como head term |
| 04 Draft | `artifacts/pgu/04-draft.md` | Agente | Fecha de corte visible; monto referenciado desde fuente oficial |
| 05 Math audit | `artifacts/pgu/05-math-audit.md` | Agente | Verificar fórmula de complemento AFP; tabla de montos y ajuste |
| 06 Compliance YMYL | `artifacts/pgu/06-compliance.md` | Agente | Verificar disclaimers: no reemplaza resolución IPS; sin recomendación AFP |
| 07 Publish packet | `artifacts/pgu/07-publish-packet.md` | **Solo humano** | Separación de deberes; alto riesgo YMYL requiere sign-off explícito |

## Riesgo YMYL

Alto — beneficio estatal con monto, requisitos de elegibilidad y calendario de pagos. Los valores
cambian por decreto. Fecha de corte es obligatoria y debe ser prominente.
