# Gate 03 — Outline: como-elegir-inversion-segun-plazo-riesgo-objetivos

Status: DRAFT — pending DraftAgent execution
Role: OutlineAgent (Claude Code — ED-016)
Slug: como-elegir-inversion-segun-plazo-riesgo-objetivos
Fecha: 2026-05-21

---

## Differentiator local (INVARIANT.STRATEGY.DIFFERENTIATED_ADOPTION_REQUIRED)

- **localDelta**: El ángulo de esta pieza es "preparación previa", no ranking de instrumentos. Ningún competidor chileno plantea explícitamente "¿estás listo para invertir?" sin terminar en una recomendación de producto. El checklist interactivo embebido es el elemento diferenciador concreto.
- **nonCopyBoundaries**: No se copian cuestionarios de perfil de riesgo que terminan en "tu perfil es moderado, te recomendamos X". No se publican carteras modelo ni porcentajes de asignación. No se nombran instituciones financieras como mejores opciones. La matriz de escenarios usa criterios, no productos.
- **ownerTarget**: `ahorro-e-inversion::criterios-decision-inversion` — soporte del owner `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026`.

---

## Advisory YMYL de apertura (bloque fijo, antes del primer H2)

```
> **Contenido educativo.** No constituye asesoría financiera, tributaria ni previsional
> personalizada. Las decisiones de inversión dependen de tu situación, horizonte,
> tolerancia a pérdidas, liquidez, costos e impuestos. Información vigente al
> [FECHA DE CORTE] — verifica en CMF y SII antes de tomar decisiones.
```

Este bloque es obligatorio, va inmediatamente después del párrafo introductorio, antes del
primer H2. Nunca moverlo al footer.

---

## Estructura editorial (H2 canónicas)

### Apertura (sin H2 — párrafo introductorio, ~80 palabras)

- Situación del lector: tiene plata disponible para invertir pero no sabe por dónde empezar.
- Ancla de posicionamiento: "Esta guía no te dice en qué invertir. Te ayuda a responder las preguntas que deberías poder contestar antes — para que cuando compares instrumentos, el marco de decisión sea tuyo, no de quien te vende el producto."
- Mención de prerrequisito: la guía asume que el lector ya tiene claro qué es ahorrar; si aún no tiene fondo de emergencia, link directo a `/posts/fondo-emergencia-chile/`.

### `## Por qué esta guía no te dice en qué invertir`

- Explicación del enfoque: diferencia entre marco de criterios (esta pieza) y comparativa de instrumentos (el pilar).
- Por qué importa: quien elige un instrumento sin tener claro su horizonte, liquidez y tolerancia a la pérdida toma una decisión de azar, no de criterio.
- Cierre de sección: enlace al pilar `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` como "cuando tengas claro el marco, el siguiente paso es comparar instrumentos".

### `## ¿Estás listo para invertir?`

**Esta sección contiene el componente interactivo.**

#### Componente `InversionReadinessChecklist`

**Descripción**: checklist de 5 preguntas binarias (Sí / No). Devuelve un resultado de preparación, nunca una recomendación de producto. El resultado es de cuatro tipos: 🔴 bloqueante, 🟡 limitante, 🟠 orientador o 🟢 listo.

**Instrucción para DraftAgent**: implementar como Astro island (`client:idle`), sin dependencias externas, sin cookies, sin llamadas a API. El componente es autocontenido (lógica en el mismo archivo `.astro` o en un `<script>` inline). El advisory YMYL debe aparecer dentro del resultado del componente.

**Las 5 preguntas (en orden; cada una tiene estado Sí/No):**

```
P1 ¿Tienes un fondo de emergencia separado, equivalente a al menos
   3 meses de gastos esenciales?

P2 ¿Tu horizonte de inversión es de al menos 12 meses?

P3 ¿Puedes dejar ese dinero sin tocarlo durante todo el período previsto?

P4 ¿Entiendes y aceptas que podrías perder parte del capital
   (no solo dejar de ganar)?

P5 ¿Sabes cómo tributa el tipo de instrumento que estás evaluando
   en Chile según el SII?
```

**Lógica de resultados (prioridad de arriba a abajo; el primer match define el resultado):**

```
IF P1 = No  → 🔴 Bloqueante
  Título: "Hay un paso previo importante"
  Texto:  "El fondo de emergencia es el colchón que impide que tengas
           que rescatar tu inversión en el peor momento. Es el paso
           anterior a la inversión, no opcional."
  CTA:    "Cómo construir tu fondo de emergencia" → /posts/fondo-emergencia-chile/

IF P2 = No  → 🟡 Horizonte corto
  Título: "Para este plazo, los instrumentos adecuados cambian"
  Texto:  "Con un horizonte menor a 12 meses, los instrumentos de
           mayor riesgo/retorno también tienen mayor probabilidad de
           pérdida. Los de renta fija de corto plazo son el marco
           que aplica."
  CTA:    "Depósito a plazo: cuándo conviene y cómo funciona"
          → /posts/deposito-a-plazo-uf-vs-pesos/

IF P3 = No  → 🟡 Liquidez crítica
  Título: "La liquidez del instrumento es tu criterio principal"
  Texto:  "Si puedes necesitar ese dinero en el camino, elegir un
           instrumento con restricciones de rescate o penalización
           por salida anticipada puede costarte más que no invertir."
  CTA:    "Ver criterios de liquidez en la guía de instrumentos"
          → /posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/

IF P4 = No  → 🟠 Marco de riesgo definido
  Título: "Tu marco: instrumentos de renta fija o garantizada"
  Texto:  "Sin tolerancia a pérdida de capital, los instrumentos de
           renta variable —ETFs, acciones, algunos fondos mutuos—
           no son adecuados para este capital. Eso no es un defecto:
           define qué instrumentos analizar."
  CTA:    "Ver opciones de renta fija y garantizada"
          → /posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/

IF P5 = No (y P1–P4 = Sí)  → 🟢 Listo con pendiente tributario
  Título: "Tienes los prerequisitos de preparación"
  Texto:  "Antes de ejecutar, revisa el tratamiento tributario del
           instrumento que elijas. CMF Educa y el SII tienen guías
           gratuitas sobre cómo tributan los distintos instrumentos."
  CTA1:   "Ver instrumentos según horizonte y riesgo"
          → /posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/
  CTA2:   "CMF Educa" → https://www.cmfchile.cl/educa/ (rel="noopener")

IF P1–P5 = Sí  → 🟢 Listo
  Título: "Tienes los prerequisitos básicos"
  Texto:  "El siguiente paso es comparar instrumentos según tu
           horizonte, tu tolerancia real al riesgo y los costos
           de cada opción."
  CTA:    "Comparar instrumentos: DAP, fondos mutuos y ETFs"
          → /posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/
```

**Advisory YMYL dentro del componente** (aparece en todos los resultados, debajo del mensaje):
```
Nota educativa: este resultado no es asesoría financiera ni sustituye
la evaluación de tu situación particular.
```

### `## Las cinco preguntas que importan antes de elegir`

Desarrollo textual de cada dimensión. Cada sub-sección (H3) explica el "por qué importa"
sin mapear a productos específicos.

#### `### 1. ¿Tienes el colchón de emergencia separado?`
- Por qué es prerequisito: rescatar una inversión en un mal momento puede ser más costoso que no haber invertido (C1, C4 del research).
- Qué pasa si el fondo no existe: la inversión pasa a ser el plan de emergencia, que no es su función.
- Outbound: `/posts/fondo-emergencia-chile/`

#### `### 2. ¿Cuál es tu horizonte real?`
- Definir "horizonte real": la fecha en que genuinamente necesitas el dinero, no la que quisieras tener.
- Qué cambia según el horizonte: a mayor plazo, mayor capacidad de absorber volatilidad (C5, C6 — verificar CMF).
- Escenarios concretos: pie de departamento vs. jubilación complementaria.
- Sin nombrar instrumentos en esta sección; eso va en la matriz de escenarios.

#### `### 3. ¿Necesitarás liquidez en el camino?`
- Diferencia entre horizonte y liquidez: puedes tener horizonte de 3 años pero necesitar acceso parcial en 6 meses.
- Qué implica: instrumentos con restricciones de rescate o penalización (C8, C9 del research).
- Lenguaje condicional: "según el contrato y las condiciones del instrumento específico".

#### `### 4. ¿Cuánta caída puedes tolerar sin vender?`
- La pregunta honesta: no "¿cuál es tu perfil de riesgo?" sino "¿venderías si tu inversión baja un 20% en un mes?"
- Diferencia entre renta variable y renta fija en términos de exposición a pérdida de capital (C11, C12 del research).
- La trampa conductual: sobreestimar la tolerancia y vender en el peor momento (C13 del research).
- Sin porcentajes normativos de asignación.

#### `### 5. ¿Sabes cómo tributa lo que vas a comprar?`
- Por qué importa saber antes (no después): el costo tributario afecta el retorno neto real.
- Mencionar que los distintos instrumentos tienen tratamiento distinto en Chile, con referencia al SII (C14, C15, C16 del research — lenguaje condicional y remisión a fuentes oficiales).
- CTA: CMF Educa y SII para verificar el instrumento específico.
- Sin detallar artículos de ley ni condiciones exactas de exención (eso requiere verificación de gate 02 TODO:SOURCE R6, R7, R8).

### `## Cuatro escenarios: criterios, no carteras`

Tabla orientativa + párrafo breve por escenario. Ningún escenario termina en "invierte en X".
El cierre de cada uno mapea a criterios y enlaza al pilar o a un artículo de instrumento específico.

| Escenario | Horizonte típico | Criterio dominante | Consideraciones clave |
|---|---|---|---|
| Pie de departamento | 2–4 años | Liquidez al vencimiento; bajo riesgo de pérdida de capital | La fecha límite es real; volatilidad de corto plazo es riesgo, no oportunidad |
| Jubilación complementaria | +10 años | Horizonte largo; puede tolerar mayor volatilidad | No significa "sin criterios"; costos, diversificación y tributación siguen importando |
| Excedente sin objetivo definido | Indefinido | Liquidez conservadora como default | Definir el objetivo antes de elegir instrumento; mientras tanto, el criterio conservador aplica |
| Primer acercamiento / capital pequeño | Variable | Costos proporcionales al monto | Comisiones y mínimos de entrada impactan más cuando el capital es bajo |

**Nota de drafting**: la tabla es orientativa. Bajo cada fila, un párrafo breve explica el razonamiento sin nombrar productos ni instituciones. Los outbound links van al pilar y a artículos de instrumento específico como rutas de profundización.

### `## Qué hacer con esta información`

- Resumen del flujo: fondo de emergencia → definir horizonte y liquidez → definir tolerancia → revisar tributación → comparar instrumentos.
- No es una receta; es una secuencia de preguntas.
- CTA principal: pilar de instrumentos para comparar una vez definidos los criterios.
- CTA secundario: CMF Educa y registro de entidades supervisadas CMF (link externo con `rel="noopener"`).
- Mención de asesor registrado: "Si tu situación es compleja (rentas mixtas, patrimonio significativo, instrumentos internacionales), considera consultar un asesor inscrito en el Registro de Asesores de la CMF."

### `## Preguntas frecuentes`

| # | Pregunta | Criterio de respuesta |
|---|---|---|
| FAQ 1 | ¿Existe una edad correcta para empezar a invertir? | No existe; depende de los prerequisitos (fondo de emergencia, horizonte, tolerancia). La edad afecta el horizonte disponible, no la elegibilidad. Sin "carteras por edad". |
| FAQ 2 | ¿Puedo invertir si tengo deudas? | Depende del costo de la deuda vs. el retorno esperado. Deudas de alto costo (tarjetas, créditos de consumo) suelen ser más urgentes de resolver. Sin recomendación absoluta. |
| FAQ 3 | ¿Cuánto debo tener para empezar a invertir? | No hay un mínimo universal; los instrumentos tienen condiciones distintas. Lo que sí aplica: los costos proporcionales al monto son más relevantes con capital pequeño. Sin nombrar mínimos de instituciones específicas. |
| FAQ 4 | ¿Esta guía aplica para el APV? | El APV tiene criterios adicionales (beneficio tributario, plazo de retiro, relación con la jubilación). Esta guía no cubre APV en profundidad; ver `/posts/que-es-el-apv/`. |

---

## Inbound links que recibirá este artículo

| Fuente | Texto ancla propuesto | Sección de inserción en fuente |
|---|---|---|
| `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` | "antes de elegir instrumento, revisa si tienes los prerequisitos" | Sección introductoria ("Antes de comparar") |
| `fondo-emergencia-chile` | "cuando tengas el fondo, el siguiente paso es explorar instrumentos de inversión" | Sección de cierre / próximos pasos |
| `el-poder-del-interes-compuesto` | "el marco de decisión antes de aplicar interés compuesto a un objetivo real" | Sección de cierre |

## Outbound links del nuevo artículo

| Destino | Texto ancla propuesto | Sección |
|---|---|---|
| `/posts/fondo-emergencia-chile/` | "construye primero tu fondo de emergencia" | Apertura + H3 prerequisito + resultado P1 del checklist |
| `/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/` | "comparar DAP, fondos mutuos y ETFs" | Cierre de sección 1 + resultados del checklist + cierre general |
| `/posts/deposito-a-plazo-uf-vs-pesos/` | "depósito a plazo: cuándo conviene" | H3 horizonte corto + resultado P2 del checklist |
| `/posts/fondos-mutuos-comisiones-rescate-impuestos/` | "fondos mutuos: costos y condiciones de rescate" | H3 liquidez + escenario horizonte medio |
| `/posts/como-invertir-en-etfs-desde-chile/` | "ETFs desde Chile: costos, custodia e impuestos" | Escenario horizonte largo |
| `/posts/que-es-el-apv/` | "el APV tiene criterios adicionales" | FAQ 4 |
| `https://www.cmfchile.cl/educa/` | "CMF Educa" | Sección "Qué hacer con esta información" + resultado P5 del checklist |

---

## Frontmatter previsto

```yaml
title: "Cómo elegir una inversión en Chile: plazo, riesgo y objetivos"
description: "Antes de elegir instrumento, hay preguntas que importan más: horizonte real, liquidez, tolerancia a pérdida y tributación. Marco educativo con checklist interactivo."
slug: como-elegir-inversion-segun-plazo-riesgo-objetivos
author: "Equipo Monedario"
category: ahorro-inversion
cluster: ahorro-e-inversion
topicRole: support
canonicalTopic: criterios-decision-inversion
lang: es-CL
featured: false
draft: true
reviewPolicy:
  cadenceLabel: quarterly
  maxDays: 45
  dataTriggers: []
  derivationFactors:
    - category:ahorro-inversion
```

> `heroImage`, `pubDate` y `updatedDate` se completan en el 07-publish-packet. No agregar
> retornos ni datos de mercado al frontmatter.

---

## Notas para DraftAgent

1. El H1 se deriva del `title` del frontmatter. El tono introductorio (primer párrafo) debe anclar el posicionamiento: "esta guía no dice qué comprar; ayuda a decidir si ya tienes el marco para elegir".
2. El advisory YMYL aparece dos veces: después del párrafo introductorio (como blockquote) y dentro del resultado del componente checklist.
3. La `Fecha de corte` visible en el cuerpo es obligatoria (`INVARIANT.EDITORIAL.CUT_OFF_DATE_REQUIRED`).
4. Los TODO:SOURCE del research que NO son bloqueantes para drafting (R1, R2, R3, R4, R5, R9) se manejan con lenguaje condicional ("según CMF Educa", "en términos generales"). Los bloqueantes para publicación (R6, R7, R8) → no afirmar tratamiento tributario específico; solo mencionar que existe y remitir al SII.
5. El componente `InversionReadinessChecklist` se implementa en el mismo archivo MDX o como componente importado. Sin dependencias externas. Spec completa en este outline, sección `## ¿Estás listo para invertir?`.
6. Dialecto: español de Chile, tuteo, sin voseo. Verificar con `check:dialect` antes de gate 06.
