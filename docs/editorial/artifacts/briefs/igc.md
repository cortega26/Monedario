# Brief P1 — impuesto-global-complementario-chile

Fecha: 2026-05-03
Sprint: 2
Estado: BRIEF — pendiente redacción y pipeline YMYL

---

## Slug objetivo

`impuesto-global-complementario-chile`
URL futura: `/posts/impuesto-global-complementario-chile/`

## Cluster y canonicalTopic propuesto

- Cluster: `impuestos-personas`
- canonicalTopic propuesto: `igc-impuesto-global-complementario`
- Cluster endurecido: NO — alta sin ADR requerido para frontmatter

> Nota de registro: `igc-impuesto-global-complementario` no existe aún en
> `CANONICAL_TOPIC_REGISTRY` de `src/config/editorial-topic-policy.mjs`. Registrar antes del
> checkpoint de redacción (gate 02).

## Intención de búsqueda primaria

Impuesto Global Complementario en Chile: quién lo paga, cómo suma todas las rentas del año y qué
diferencia tiene con el F22 de Operación Renta ordinaria.

## Rol editorial

- `topicRole: owner`
- El IGC es la intención de búsqueda del contribuyente con rentas mixtas o altas (trabajador +
  honorarios, socio + sueldo, arrendatario). No es un glosario ni un satélite del F22.

## Diferenciación intra-cluster (anti-canibalización)

**Separación clave respecto a `operacion-renta-f22-checklist`:**

| Dimensión | F22 checklist (owner existente) | IGC (futuro owner) |
|---|---|---|
| Query head | "F22 operación renta Chile" | "impuesto global complementario Chile" |
| Usuario | Trabajador dependiente que revisa su declaración anual | Persona con rentas mixtas que necesita entender el mecanismo impositivo |
| Contenido | Cómo revisar y enviar el F22, plazos, devolución | Qué es el IGC, tramos, qué rentas se suman, créditos disponibles |
| Formulario | Centra el F22 | El F22 es el vehículo; el IGC es el impuesto |

Este artículo NO debe:
- Sustituir la guía paso a paso del F22 — redirigir a `operacion-renta-f22-checklist`.
- Prometer resultado exacto de impuesto o devolución — redirigir a `/calculadoras/operacion-renta/`.
- Absorber `rentas-mixtas-sueldo-honorarios` como head term (si ese artículo existe o se crea).
- Opinar sobre qué renta minimiza el IGC (asesoría tributaria personalizada).

Este artículo SÍ debe:
- Explicar el mecanismo de "complementar" (= sumar todas las fuentes de renta del año).
- Mostrar los tramos y tasas vigentes (UTA) con fecha de corte.
- Aclarar qué créditos aplican: ISC ya retenido, retenciones de honorarios, APV.
- Responder "¿a mí me afecta el IGC?" para los casos más comunes.

## Fuentes oficiales requeridas

1. SII — tramos IGC vigentes (UTA), formulario F22, instrucciones oficiales
2. BCN — Ley de Impuesto a la Renta, art. 52 y ss. (texto vigente)
3. Ministerio de Hacienda — UTA vigente para el año tributario

## Estructura propuesta (H2 principales)

1. ¿Qué es el Impuesto Global Complementario?
2. ¿Quiénes deben pagarlo? (rentas globales anuales y umbrales)
3. Diferencia con el Impuesto de Segunda Categoría y el F22
4. Qué rentas suma el IGC (sueldos, honorarios, dividendos, arriendos, ganancias de capital)
5. Tramos y tasas vigentes (tabla UTA — fecha de corte explícita)
6. Créditos y deducciones disponibles (ISC retenido, APV, contribuciones de bienes raíces)
7. Cómo se declara: el F22 como formulario del IGC
8. ¿Resultado final: pago adicional o devolución?

## Claims YMYL a verificar antes de publicar

- Tramos UTA vigentes al año tributario del artículo — verificar tabla SII antes de publicar.
- UTA del año en curso: valor exacto y fecha desde cuándo rige.
- Crédito APV: confirmar Modalidad A vs B y cómo se refleja en el F22 para el IGC.
- Ganancias de capital: confirmar si el artículo las cubre o las excluye explícitamente (mayor
  complejidad — podría quedar como "out of scope en esta versión").
- Artículo debe incluir disclaimer: no reemplaza asesoría tributaria profesional; el cálculo
  final lo hace el SII.
- Fecha de corte obligatoria (UTA y tramos cambian cada año tributario).

## Calculadora relacionada

`/calculadoras/operacion-renta/` — enlazar como herramienta de estimación; no como resultado
definitivo (el SII liquida el F22 con datos reales del contribuyente).

## Artículos internos que enlazarán al nuevo owner (inbound)

| Artículo | Mecanismo | Cluster |
|---|---|---|
| `boleta-honorarios-2026-retencion-cobertura` | Cierre: honorarios acumulados pueden gatillar IGC | `impuestos-personas` |
| `operacion-renta-f22-checklist` | Mención de que el F22 liquida el IGC para rentas mixtas | `impuestos-personas` |

## Artículos internos que el nuevo owner enlazará (outbound)

| Artículo | Motivo del enlace |
|---|---|
| `operacion-renta-f22-checklist` | Cómo completar el F22 como formulario del IGC |
| `devolucion-impuestos-fechas-compensaciones` | Qué pasa si el IGC resulta en devolución |
| `contribuciones-bienes-raices-chile` (futuro) | Contribuciones como crédito deducible del IGC |
| `/calculadoras/operacion-renta/` | Estimación orientativa del IGC anual |

## Gates del pipeline que aplican

| Gate | Archivo | Responsable | Notas |
|---|---|---|---|
| 01 Brief aprobado | `briefs/igc.md` (este doc) | Humano | Mayor complejidad del sprint — confirmar alcance antes de abrir pipeline |
| **PRE-02** | `src/config/editorial-topic-policy.mjs` | Agente | Registrar `igc-impuesto-global-complementario` en `CANONICAL_TOPIC_REGISTRY["impuestos-personas"]` |
| 02 Research / Dossier | `artifacts/igc/02-research.md` | Agente + Humano | SII art. 52 + BCN + UTA vigente; definir si cubre ganancias de capital |
| 03 Outline | `artifacts/igc/03-outline.md` | Agente | Confirmar separación de head terms vs F22 y rentas-mixtas |
| 04 Draft | `artifacts/igc/04-draft.md` | Agente | Tramos UTA con fecha de corte visible; sin simulación exacta |
| 05 Math audit | `artifacts/igc/05-math-audit.md` | Agente | Verificar tramos, créditos y ejemplos numéricos |
| 06 Compliance YMYL | `artifacts/igc/06-compliance.md` | Agente | Disclaimer de asesoría; no prometer resultado F22 |
| 07 Publish packet | `artifacts/igc/07-publish-packet.md` | **Solo humano** | Separación de deberes; mayor riesgo YMYL del sprint |

## Riesgo YMYL

Alto — tramos y tasas anuales (UTA), cálculo de impuesto a pagar o devolver, interacción con
múltiples créditos. Los valores cambian cada año tributario. Artículo de mayor complejidad del
Sprint 2.
