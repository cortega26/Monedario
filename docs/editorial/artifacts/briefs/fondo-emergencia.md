# Brief P1 — fondo-emergencia-chile

Fecha: 2026-05-03
Sprint: 2
Estado: BRIEF — pendiente redacción y pipeline YMYL

---

## Slug objetivo

`fondo-emergencia-chile`
URL futura: `/posts/fondo-emergencia-chile/`

## Cluster y canonicalTopic propuesto

- Cluster: `presupuesto-control-financiero`
- canonicalTopic propuesto: `fondo-emergencia-colchon`
- Cluster endurecido: NO — alta sin ADR requerido para frontmatter

> Nota de registro: `fondo-emergencia-colchon` no existe aún en `CANONICAL_TOPIC_REGISTRY` de
> `src/config/editorial-topic-policy.mjs`. Registrar antes del checkpoint de redacción (gate 02).

## Intención de búsqueda primaria

Construir un fondo de emergencia en Chile: cuánto necesito y dónde guardarlo de forma segura y líquida.

## Rol editorial

- `topicRole: owner`
- Segunda pieza del cluster `presupuesto-control-financiero`; activa el cluster dormido junto a
  `como-hacer-presupuesto-mensual-chile` (owner transitorio del cluster).

## Fuentes oficiales requeridas

1. CMF — sección de educación financiera sobre ahorro de emergencia
2. BCN — marco conceptual de ahorro preventivo (Código Civil / contexto)
3. BancoEstado o CMF — guía sobre instrumentos de ahorro con liquidez inmediata (cuenta vista,
   cuenta corriente, DAP corto plazo)

## Estructura propuesta (H2 principales)

1. ¿Qué es un fondo de emergencia y para qué sirve?
2. ¿Cuánto debe tener? (3–6 meses de gastos esenciales)
3. ¿Dónde guardarlo en Chile? (cuenta vista, DAP 30–90 días, cuenta de ahorro)
4. Errores comunes: invertirlo, mezclarlo con ahorros de largo plazo
5. Cómo construirlo paso a paso desde cero
6. Preguntas frecuentes

## Claims YMYL a verificar antes de publicar

- Rango "3 a 6 meses" — verificar si CMF/educación financiera oficial usa ese rango o uno distinto.
- Instrumentos con liquidez: confirmar que DAP tiene penalización por retiro anticipado y mencionarlo.
- No prometer rentabilidad de ningún instrumento ni comparar tasas de mercado (eso corresponde a
  `/posts/deposito-a-plazo-uf-vs-pesos/`).
- Artículo NO debe recomendar un banco o producto específico.

## Calculadora relacionada

Ninguna existente. Posible futura: `/calculadoras/presupuesto-mensual/` (Sprint 3 P2).

## Artículos internos que enlazarán al nuevo owner (inbound)

| Artículo | Mecanismo | Cluster |
|---|---|---|
| `como-hacer-presupuesto-mensual-chile` | Sección "paso siguiente": construir colchón de emergencia | `presupuesto-control-financiero` |
| `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` | Mención como prerrequisito antes de invertir | `ahorro-e-inversion` |

> Enlace inter-cluster desde `ahorro-e-inversion` cuenta para límite `INTER_CLUSTER_MAX_2_PER_EDIT`
> cuando se editen esos archivos.

## Artículos internos que el nuevo owner enlazará (outbound)

| Artículo | Motivo del enlace |
|---|---|
| `como-hacer-presupuesto-mensual-chile` | Prerequisito: presupuesto ordenado antes del fondo |
| `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` | Paso siguiente tras consolidar el fondo |
| `deposito-a-plazo-uf-vs-pesos` | Instrumento específico de bajo riesgo para el fondo |

## Gates del pipeline que aplican

| Gate | Archivo | Responsable | Notas |
|---|---|---|---|
| 01 Brief aprobado | `briefs/fondo-emergencia.md` (este doc) | Humano | Revisión de scope y enfoque antes de abrir pipeline |
| 02 Research / Dossier | `artifacts/fondo-emergencia/02-research.md` | Agente + Humano | Fuentes CMF, BancoEstado, BCN; sin benchmarks de competidores |
| 03 Outline | `artifacts/fondo-emergencia/03-outline.md` | Agente | Estructura confirmada; sin claims nuevos |
| 04 Draft | `artifacts/fondo-emergencia/04-draft.md` | Agente | Redacción con fecha de corte visible |
| 05 Math audit | `artifacts/fondo-emergencia/05-math-audit.md` | Agente | Verificar rango 3–6 meses y liquidez de instrumentos |
| 06 Compliance YMYL | `artifacts/fondo-emergencia/06-compliance.md` | Agente | Verificar ausencia de recomendaciones personalizadas |
| 07 Publish packet | `artifacts/fondo-emergencia/07-publish-packet.md` | **Solo humano** | Separación de deberes — no marcar `[X]` en sesión de redacción |

## Riesgo YMYL

Bajo/Medio — educación financiera básica sin cálculos normativos ni beneficios estatales.
