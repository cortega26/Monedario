# Brief ED-016 — Cómo elegir una inversión según plazo, riesgo y objetivos

Fecha: 2026-05-21
Sprint: TBD
Estado: BRIEF — pendiente aprobación humana antes de abrir pipeline

---

## Slug objetivo

`como-elegir-inversion-segun-plazo-riesgo-objetivos`
URL futura: `/posts/como-elegir-inversion-segun-plazo-riesgo-objetivos/`

## Cluster y canonicalTopic propuesto

- Cluster: `ahorro-e-inversion`
- topicRole: `support` (el owner del cluster es `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026`)
- canonicalTopic propuesto: `criterios-decision-inversion` (nuevo — no existe en el registro)
- Cluster endurecido: NO aplica para support; el cluster ya está activo

> **Nota de registro**: `criterios-decision-inversion` no existe aún en `CANONICAL_TOPIC_REGISTRY`
> de `src/config/editorial-topic-policy.mjs`. Registrar como `support` del owner
> `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` antes del checkpoint
> de redacción (gate 02). Ver también `docs/research/seo/strategy/topic_ownership_matrix.md`.

## Intención de búsqueda primaria

"Dónde invertir mi dinero según edad, tolerancia al riesgo y objetivos" — resuelta como
marco de decisión educativo, no como recomendación de productos. La respuesta ancla es:
*esta guía no te dice en qué invertir; te ayuda a saber si estás listo y qué preguntas
deberías poder responder antes.*

## Rol editorial

- `topicRole: support`
- La pieza ordena las preguntas previas a la elección de instrumento; no duplica la
  comparativa de instrumentos que ya hace el owner del cluster.
- Diferenciación obligatoria: no debe contener listas generales de instrumentos, rankings,
  carteras modelo por edad, ni porcentajes normativos. El foco es el marco de criterios,
  no los productos.

## Formato del artículo: híbrido (artículo + checklist interactivo embebido)

Este artículo tiene un elemento diferenciador: un checklist interactivo de prerequisitos
de inversión embebido en el cuerpo del artículo (no un simulador ni una calculadora).

### Justificación del formato híbrido

| Objetivo | Por qué el híbrido lo cumple mejor que el artículo solo |
|---|---|
| Engagement | El checklist da una razón concreta para interactuar; el resultado personalizado aumenta dwell time |
| SEO | El artículo completo es indexable con H2s, FAQPage schema; el interactivo mejora señales de comportamiento |
| No-asesoría | El resultado mapea preparación (Sí/No/Pendiente), nunca productos ni porcentajes |

### Especificación del checklist interactivo

**Componente**: `InversionReadinessChecklist.astro` (nuevo, liviano, sin dependencias externas)
**Ubicación en el artículo**: sección 2 ("¿Estás listo para invertir?"), antes de la matriz
de escenarios.

**Las 5 preguntas (binarias: Sí / No):**

| # | Pregunta | Dimensión |
|---|---|---|
| 1 | ¿Tienes un fondo de emergencia separado, equivalente a 3 o más meses de gastos esenciales? | Prerequisito base |
| 2 | ¿Tu horizonte de inversión es de al menos 12 meses? | Horizonte |
| 3 | ¿Puedes dejar ese dinero sin tocarlo durante todo el período previsto? | Liquidez |
| 4 | ¿Entiendes y aceptas que podrías perder parte del capital (no solo dejar de ganar)? | Tolerancia a pérdida |
| 5 | ¿Sabes cómo tributa el tipo de instrumento que estás evaluando en Chile (SII)? | Tributación |

**Lógica de resultados:**

| Condición | Resultado | Mensaje |
|---|---|---|
| P1 = No | 🔴 Bloqueante | "El fondo de emergencia es el paso anterior a la inversión. Sin él, es probable que necesites rescatar en el peor momento." → link a `fondo-emergencia-chile` |
| P2 = No | 🟡 Limitante de horizonte | "Para plazos menores a 12 meses, los instrumentos de mayor riesgo/retorno son inadecuados. Revisa depósitos a plazo o fondos mutuos de liquidez." → link a `deposito-a-plazo-uf-vs-pesos` |
| P3 = No | 🟡 Limitante de liquidez | "Si necesitas acceso en el camino, la liquidez del instrumento es criterio principal. ETFs y algunos fondos tienen costos o restricciones de rescate." |
| P4 = No | 🟠 Orientador de riesgo | "Sin tolerancia a pérdidas, los instrumentos de renta variable no son adecuados para este capital. Esto define tu marco: renta fija o garantizada." |
| P5 = No + resto Sí | 🟢 Con nota pendiente | "Tienes los prerequisitos de preparación. Antes de ejecutar, revisa el tratamiento tributario del instrumento con CMF Educa o SII." |
| Todos Sí | 🟢 Listo | "Tienes los prerequisitos básicos. El siguiente paso es comparar instrumentos según tu horizonte." → link al pilar |

**Restricciones de diseño del componente:**
- Sin frameworks JS externos (solo script inline mínimo o Astro islands)
- Sin cookies ni almacenamiento de datos del usuario
- El resultado NO nombra productos específicos, instituciones ni porcentajes de asignación
- El resultado NO dice "deberías invertir en X"
- El advisory YMYL visible dentro del componente, no solo en el artículo

## Fuentes oficiales requeridas

1. **CMF Educa** — conceptos de riesgo, liquidez e instrumentos supervisados
2. **SII** — tratamiento tributario de ganancias de capital (Art. 17 N°8 LIR y Art. 22 bis)
3. **CMF registro de entidades** — referencia para verificar intermediarios habilitados
4. **Superintendencia de Pensiones** — solo si se menciona APV o instrumentos previsionales
   como contexto (no como recomendación)

## Estructura propuesta (H2 principales)

1. **Por qué esta guía no te dice en qué invertir** *(posicionamiento y advisory de entrada)*
2. **¿Estás listo para invertir?** *(checklist interactivo embebido)*
3. **Las cinco preguntas que importan antes de elegir** *(desarrollo textual de cada dimensión)*
   - 3.1 ¿Tienes el colchón de emergencia separado?
   - 3.2 ¿Cuál es tu horizonte real?
   - 3.3 ¿Necesitarás liquidez en el camino?
   - 3.4 ¿Cuánta caída puedes tolerar sin vender?
   - 3.5 ¿Sabes cómo tributa lo que vas a comprar?
4. **Matriz orientativa por objetivo** *(4 escenarios chilenos → criterios, no productos)*
   - Pie de departamento (horizonte 2–4 años)
   - Jubilación complementaria (horizonte +10 años)
   - Excedente de ahorro sin objetivo definido
   - Capital inicial pequeño (primer acercamiento a la inversión)
5. **Qué hacer con esta información** *(pasos siguientes: pilar, CMF Educa, asesor registrado)*
6. **Preguntas frecuentes**
7. **Fuentes verificadas**

## Advisory YMYL obligatorio

Texto requerido (aparece al inicio del artículo Y dentro del componente checklist):

> *"Contenido educativo. No constituye asesoría financiera, tributaria ni previsional
> personalizada. Las decisiones de inversión dependen de tu situación, horizonte,
> tolerancia a pérdidas, liquidez, costos e impuestos."*

## Claims YMYL a verificar antes de publicar

- El rango "3 meses de gastos" para fondo de emergencia: verificar que CMF Educa lo usa o
  especificar la fuente del criterio.
- Ningún retorno histórico, proyección ni promesa de rentabilidad.
- La matriz de escenarios no debe mapear a productos específicos ni porcentajes de asignación.
- Si se menciona tributación de ETFs o fondos, verificar contra SII actualizado (Art. 22 bis).
- No recomendar ni comparar instituciones financieras por nombre.
- La mención de APV (si aparece) solo como contexto: no describir montos ni beneficios sin
  fuente SP actual.

## Calculadora o herramienta relacionada

Ninguna existente aplica directamente. El componente `InversionReadinessChecklist.astro`
es la herramienta embebida específica de esta pieza (no es una calculadora de retornos).

## Artículos internos que enlazarán al nuevo support (inbound)

| Artículo | Mecanismo | Cluster |
|---|---|---|
| `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` | Sección de prerequisitos: "antes de elegir instrumento" | `ahorro-e-inversion` |
| `fondo-emergencia-chile` | Paso siguiente: "ya tienes el fondo, ahora puedes explorar inversiones" | `presupuesto-control-financiero` |
| `el-poder-del-interes-compuesto` | Contexto: "el marco de decisión antes de aplicar interés compuesto" | `ahorro-e-inversion` |

> Cada enlace inter-artículo cuenta para el límite `INTER_CLUSTER_MAX_2_PER_EDIT` cuando se
> editen los archivos fuente. El enlace desde `presupuesto-control-financiero` es inter-cluster.

## Artículos internos que el nuevo support enlazará (outbound)

| Artículo | Motivo |
|---|---|
| `fondo-emergencia-chile` | Prerequisito bloqueante (P1 del checklist) |
| `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` | Paso siguiente: comparar instrumentos |
| `deposito-a-plazo-uf-vs-pesos` | Contexto de horizonte corto en la matriz |
| `fondos-mutuos-comisiones-rescate-impuestos` | Contexto de horizonte medio en la matriz |
| `como-invertir-en-etfs-desde-chile` | Contexto de horizonte largo en la matriz |

## Prohibido en esta pieza

- Rankings de productos o instituciones
- Frases: "mejor inversión", "conviene más", "deberías invertir en"
- Carteras modelo por edad (ej. "si tienes 30 años, pon 70% en X")
- Porcentajes normativos por perfil (ej. "perfil moderado = 60/40")
- Retornos históricos o proyecciones sin MathAuditAgent completado
- APV o pensiones en profundidad (si aparecen, escalar compliance)
- Cualquier mención que suene a recomendación personalizada

## Gates del pipeline que aplican

| Gate | Archivo | Responsable | Notas |
|---|---|---|---|
| 01 Brief aprobado | `briefs/como-elegir-inversion-segun-plazo-riesgo-objetivos.md` (este doc) | **Humano** | Aprobar scope, enfoque, formato híbrido y lógica del checklist antes de abrir pipeline |
| 02 Research / Dossier | `artifacts/como-elegir-inversion.../02-research.md` | Agente + Humano | Fuentes CMF, SII; verificar claims del fondo emergencia y tributación |
| 03 Outline | `artifacts/como-elegir-inversion.../03-outline.md` | Agente | Estructura confirmada + spec final del componente checklist |
| 04 Draft | `artifacts/como-elegir-inversion.../04-draft.md` | Agente | Redacción con fecha de corte + MDX del componente embebido |
| 05 Math audit | N/A | — | No aplica: no hay cálculos numéricos ni retornos. Si en redacción se agregan datos cuantitativos, escalar. |
| 06 Compliance YMYL | `artifacts/como-elegir-inversion.../06-compliance.md` | Agente | Verificar ausencia de recomendaciones personalizadas; revisar lógica del checklist |
| 07 Publish packet | `artifacts/como-elegir-inversion.../07-publish-packet.md` | **Solo humano** | Separación de deberes — no marcar `[X]` en sesión de redacción |

> **Nota gate 05**: si durante redacción (gate 04) se decide incluir ejemplos con montos,
> tasas históricas o proyecciones de cualquier tipo, escalar a MathAuditAgent antes de
> avanzar a gate 06.

## Riesgo YMYL

**Medio** — marco de decisión financiero sin cálculos normativos ni beneficios estatales.
El formato híbrido (artículo + checklist de preparación) está dentro del rango educativo
mientras el resultado del checklist mapee a preparación y no a productos. Si la pieza
evoluciona hacia simulaciones de retorno o recomendaciones de instrumento específico,
escalar a sensibilidad alta.
