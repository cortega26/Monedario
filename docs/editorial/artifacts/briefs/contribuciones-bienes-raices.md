# Brief P1 — contribuciones-bienes-raices-chile

Fecha: 2026-05-03
Sprint: 2
Estado: BRIEF — pendiente redacción y pipeline YMYL

---

## Slug objetivo

`contribuciones-bienes-raices-chile`
URL futura: `/posts/contribuciones-bienes-raices-chile/`

## Cluster y canonicalTopic propuesto

- Cluster: `impuestos-personas`
- canonicalTopic propuesto: `contribuciones-bienes-raices-tramite`
- Cluster endurecido: NO — alta sin ADR requerido para frontmatter

> Nota de registro: `contribuciones-bienes-raices-tramite` no existe aún en
> `CANONICAL_TOPIC_REGISTRY` de `src/config/editorial-topic-policy.mjs`. Registrar antes del
> checkpoint de redacción (gate 02).

## Intención de búsqueda primaria

Contribuciones de bienes raíces en Chile: cómo calcular el monto, cuándo pagar las cuotas y qué
exenciones aplican para propietarios de primera vivienda o adultos mayores.

## Rol editorial

- `topicRole: owner`
- Trámite explicado: envía al canal oficial (SII/TGR); no opera como portal de pago ni como
  tasadora de propiedades.

## Diferenciación intra-cluster (anti-canibalización)

Este artículo NO debe:
- Absorber la Operación Renta como head term — eso es `operacion-renta-f22-checklist`.
- Cubrir el IGC como head term — eso será `impuesto-global-complementario-chile` (futuro owner).
- Prometer tasación o reavaluación de propiedades.

Este artículo SÍ debe:
- Explicar qué es la contribución, cómo se calcula desde el avalúo fiscal y cuánto se paga.
- Guiar el pago por cuotas (SII/TGR) y los canales habilitados.
- Cubrir las exenciones legales más relevantes (DFL-2, adultos mayores, primera vivienda).
- Indicar cómo reclamar un avalúo incorrecto.

## Fuentes oficiales requeridas

1. SII — avalúo fiscal, tasas vigentes (1,2 % no agrícola / 1,0 % DFL-2), y portal de contribuciones
2. TGR (Tesorería General de la República) — calendario de cuotas, portal de pago, estado de deuda
3. BCN — DL 3.063 (Ley de Rentas Municipales) y DFL-2 de 1959 (exenciones vivienda económica)

## Estructura propuesta (H2 principales)

1. ¿Qué son las contribuciones de bienes raíces?
2. ¿Cómo se calcula el monto? (avalúo fiscal × tasa legal)
3. Cuotas y calendario de pago (abril, junio, septiembre, noviembre)
4. Exenciones: DFL-2, primera vivienda, adultos mayores — requisitos y tope
5. Cómo pagar: SII en línea, TGR, app, banco
6. ¿Qué pasa si no pagas? (intereses y deuda fiscal)
7. Cómo reclamar un avalúo incorrecto ante el SII
8. Contribuciones y declaración de renta (F22): cuándo es gasto deducible

## Claims YMYL a verificar antes de publicar

- Tasas vigentes: 1,2 % bienes raíces no agrícolas y 1,0 % DFL-2 (verificar si hay cambios post-2024).
- Montos de exención para primera vivienda y adultos mayores: verificar tope de avalúo y condiciones.
- Calendario de cuotas 2026: confirmar con TGR las fechas exactas de vencimiento.
- La sección de F22 debe ser precisa: las contribuciones son gasto deducible en ciertos casos para
  propietarios que arrienden; confirmar con SII antes de publicar.
- Fecha de corte obligatoria (tasas y montos de exención se actualizan por decreto).

## Calculadora relacionada

Ninguna existente en el portfolio actual. No crear calculadora en Sprint 2.

## Artículos internos que enlazarán al nuevo owner (inbound)

| Artículo | Mecanismo | Cluster |
|---|---|---|
| `operacion-renta-f22-checklist` | Mención de contribuciones como línea deducible en el F22 | `impuestos-personas` |
| `impuesto-global-complementario-chile` (futuro) | Contribuciones como deducción para rentas de arrendamiento | `impuestos-personas` |

## Artículos internos que el nuevo owner enlazará (outbound)

| Artículo | Motivo del enlace |
|---|---|
| `operacion-renta-f22-checklist` | Contexto: cómo declarar la deducción de contribuciones en F22 |

## Gates del pipeline que aplican

| Gate | Archivo | Responsable | Notas |
|---|---|---|---|
| 01 Brief aprobado | `briefs/contribuciones-bienes-raices.md` (este doc) | Humano | Revisión de alcance y diferenciación OR/IGC |
| **PRE-02** | `src/config/editorial-topic-policy.mjs` | Agente | Registrar `contribuciones-bienes-raices-tramite` en `CANONICAL_TOPIC_REGISTRY["impuestos-personas"]` |
| 02 Research / Dossier | `artifacts/contribuciones-bienes-raices/02-research.md` | Agente + Humano | SII + TGR + BCN; tasas, exenciones y calendario 2026 |
| 03 Outline | `artifacts/contribuciones-bienes-raices/03-outline.md` | Agente | Confirmar que no absorbe F22 ni IGC como head terms |
| 04 Draft | `artifacts/contribuciones-bienes-raices/04-draft.md` | Agente | Fecha de corte visible; calendario TGR verificado |
| 05 Math audit | `artifacts/contribuciones-bienes-raices/05-math-audit.md` | Agente | Verificar tasas, montos de exención, ejemplos de cálculo |
| 06 Compliance YMYL | `artifacts/contribuciones-bienes-raices/06-compliance.md` | Agente | Sin asesorías tributarias personalizadas; enviar a SII/TGR |
| 07 Publish packet | `artifacts/contribuciones-bienes-raices/07-publish-packet.md` | **Solo humano** | Separación de deberes |

## Riesgo YMYL

Medio/Alto — datos fiscales con montos exactos, fechas de vencimiento y exenciones legales.
Fecha de corte obligatoria y prominente.
