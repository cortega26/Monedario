# Gate 04 — Draft: como-elegir-inversion-segun-plazo-riesgo-objetivos

Status: DRAFT — pending ComplianceAgent (gate 06, nueva sesión Claude Code)
Role: DraftAgent (Claude Code — ED-016)
Fecha de corte: 2026-05-21
requires_calculation: false
regulatory_sensitivity: media

---

> **SEPARATION OF DUTIES NOTICE**
> Este draft fue producido por DraftAgent (Claude Code, sesión ED-016).
> Gate 05 (MathAuditAgent) no aplica para esta pieza — no hay cálculos numéricos.
> Si durante revisión humana se decide agregar retornos históricos, proyecciones o
> ejemplos con montos/tasas, escalar a MathAuditAgent antes de gate 06.
> Gate 06 (ComplianceAgent) debe ejecutarse en una nueva sesión de Claude Code,
> sin contexto de esta sesión. Ver `context/EDITORIAL_AI_PIPELINE.md` §2 y §8.

---

## Nota técnica — Componente InversionReadinessChecklist

El artículo requiere el archivo `src/components/InversionReadinessChecklist.astro`.
El código del componente está al final de este draft (sección "Componente Astro").
Debe crearse antes de publicar el artículo. Sin él, el archivo MDX no compilará.

---

## Draft del artículo

**Archivo destino: `src/data/blog/como-elegir-inversion-segun-plazo-riesgo-objetivos.mdx`**

```mdx
---
title: "Cómo elegir una inversión en Chile: plazo, riesgo y objetivos"
author: "Equipo Monedario"
description: "Antes de elegir instrumento, hay preguntas que importan más: horizonte real, liquidez, tolerancia a pérdida y tributación. Marco educativo con checklist interactivo."
slug: como-elegir-inversion-segun-plazo-riesgo-objetivos
pubDate: [COMPLETAR EN 07-PUBLISH-PACKET]
tags:
  - inversiones
  - ahorro
  - educacion-financiera
  - plazo
  - riesgo
category: ahorro-inversion
cluster: ahorro-e-inversion
topicRole: support
canonicalTopic: criterios-decision-inversion
lang: es-CL
featured: false
draft: true
heroImage: [COMPLETAR EN 07-PUBLISH-PACKET]
articleAdvisory: "Contenido educativo. No constituye asesoría financiera, tributaria ni previsional personalizada. Las decisiones de inversión dependen de tu situación, horizonte, tolerancia a pérdidas, liquidez, costos e impuestos."
articleLead:
  answer: "Esta guía no te dice en qué invertir. Te ayuda a responder las preguntas previas: si tienes el fondo de emergencia separado, cuál es tu horizonte real, si puedes tolerar pérdidas y cómo tributa lo que estás evaluando. Con ese marco claro, la elección de instrumento tiene sentido."
  nextStepHref: "/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/"
  nextStepLabel: "Comparar DAP, fondos mutuos y ETFs"
  validAsOf: 2026-05-21
  officialSources:
    - label: "CMF — Educación Financiera"
      href: "https://www.cmfchile.cl/educa/"
    - label: "SII — Impuesto a la Renta"
      href: "https://www.sii.cl/"
  covers:
    - "Por qué los criterios previos importan más que el instrumento."
    - "Las cinco preguntas que deberías poder responder antes de invertir."
    - "Cuatro escenarios chilenos con criterios orientativos."
    - "Qué hacer con esta información como paso siguiente."
  limits:
    - "No recomienda productos, instituciones ni porcentajes de asignación."
    - "No reemplaza asesoría financiera, tributaria ni previsional personalizada."
    - "El tratamiento tributario de cada instrumento debe verificarse en el SII."
    - "El plazo de rescate y las condiciones de cada instrumento varían; revisa el contrato específico."
reviewPolicy:
  cadenceLabel: quarterly
  maxDays: 45
  dataTriggers: []
  derivationFactors:
    - category:ahorro-inversion
    - validAsOf
    - officialSources
  computedAt: "2026-05-21"
---

import InversionReadinessChecklist from "@/components/InversionReadinessChecklist.astro";

> **Información vigente al 2026-05-21.** Ante cambios normativos o en las condiciones
> de los instrumentos financieros, verifica en las fuentes oficiales referenciadas
> al final de este artículo.

La pregunta "¿dónde invierto mi plata?" tiene una respuesta difícil de dar y una respuesta
fácil de dar. La fácil es nombrar instrumentos. La difícil es hacer las preguntas previas:
¿cuándo necesitas ese dinero?, ¿qué pasa si baja su valor?, ¿tienes lo que necesitas para
no tocar esa inversión?

Esta guía no te da la respuesta fácil. Te ayuda con las preguntas que importan antes —
para que cuando compares instrumentos, el criterio sea tuyo y no de quien te vende el
producto.

Si todavía no tienes un [fondo de emergencia separado](/posts/fondo-emergencia-chile/),
ese es el primer paso. Esta guía asume que ya lo tienes o que lo estás evaluando en
paralelo.

> **Contenido educativo.** No constituye asesoría financiera, tributaria ni previsional
> personalizada. Las decisiones de inversión dependen de tu situación, horizonte,
> tolerancia a pérdidas, liquidez, costos e impuestos. Si tu situación es compleja,
> considera consultar un asesor inscrito en el Registro de Asesores de la CMF.

## Tabla de contenidos

## Por qué esta guía no te dice en qué invertir

Hay un patrón muy común en Chile: alguien lee sobre inversiones, ve que los ETFs dan
buenos retornos históricos o que el DAP es "seguro", y decide entrar sin haber respondido
preguntas básicas sobre su propia situación.

El resultado no siempre es catastrófico, pero sí es frecuente: rescatar un fondo mutuo
cuando ya bajó porque surgió una emergencia. O poner plata en renta variable con un
horizonte de dos años y vender en pánico a los seis meses cuando el mercado cae.

La elección del instrumento no es el error más común. El error más común es elegir sin
marco.

Esta pieza no es una guía de instrumentos — para eso está la
[guía completa de ahorro e inversión en Chile](/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/).
Lo que hace es algo distinto: ordenar las preguntas que deberías tener respondidas antes
de comparar cualquier instrumento.

## ¿Estás listo para invertir?

Antes de revisar qué dice cada instrumento, cinco preguntas básicas. No hay respuesta
correcta universal — hay respuestas que definen qué tipo de inversión tiene sentido
para tu situación.

<InversionReadinessChecklist />

## Las cinco preguntas que importan antes de elegir

### 1. ¿Tienes el fondo de emergencia separado?

El fondo de emergencia no es inversión. Es el colchón que te permite tomar decisiones
financieras con calma cuando algo sale mal — un despido, un gasto de salud, una reparación
urgente.

Su función específica es impedir que tengas que rescatar una inversión en el peor momento.
Quien invierte sin tenerlo corre el riesgo de necesitar sacar plata justo cuando los
mercados están abajo o cuando su instrumento tiene penalización por retiro anticipado.

En términos prácticos: si no tienes ese colchón separado, el capital que estás pensando
invertir es, en realidad, tu plan de emergencia disfrazado. Y esos dos propósitos no son
compatibles.

¿No tienes aún el fondo de emergencia? Lee primero
[cómo construirlo en Chile](/posts/fondo-emergencia-chile/).

### 2. ¿Cuál es tu horizonte real?

El horizonte de inversión es la fecha en que genuinamente necesitas ese dinero — no la
que quisieras tener. La diferencia importa.

"Largo plazo" dicho en abstracto no es un horizonte. "En tres años para el pie del
departamento" sí lo es. "No lo voy a necesitar en los próximos doce años" también.

Por qué importa: en términos generales, a mayor plazo, mayor es la capacidad de absorber
la volatilidad de corto plazo sin que eso afecte el resultado final. Un instrumento de
renta variable puede bajar 30% en un año y recuperarse en tres. Si tu horizonte es ese
año, esa recuperación no sirve.

Lo que cambia según el horizonte no es el instrumento óptimo — es el marco de riesgo
que tiene sentido analizar.

### 3. ¿Necesitarás liquidez en el camino?

Horizonte y liquidez no son lo mismo. Puedes tener un objetivo a tres años y necesitar
acceso parcial al capital en seis meses.

Esto importa porque algunos instrumentos tienen restricciones de rescate o penalización
por salida anticipada. Un depósito a plazo rescatado antes del vencimiento puede perder
parte de los intereses pactados, dependiendo del contrato. Los fondos mutuos tienen
plazos de rescate definidos en su reglamento. Los ETFs se compran y venden en bolsa, pero
la liquidez depende del volumen del mercado y del intermediario.

Si existe la posibilidad real de necesitar ese dinero antes del horizonte previsto,
la liquidez del instrumento pasa a ser un criterio de selección, no una variable secundaria.

### 4. ¿Cuánta caída puedes tolerar sin vender?

Esta pregunta no es "¿cuál es tu perfil de riesgo?". Es más concreta: si el valor de tu
inversión cae 20% en un mes, ¿venderías?

La respuesta honesta importa más que la respuesta correcta teóricamente. Quien dice que
toleraría una caída del 30% pero vende a los dos meses de la primera baja relevante no
pierde por haber elegido mal el instrumento — pierde por haberse sobreestimado.

La diferencia entre renta variable y renta fija, en términos prácticos, es esta:

- **Renta variable** (ETFs, acciones, algunos fondos mutuos): el capital puede disminuir,
  no solo dejar de crecer. El mayor retorno esperado viene acompañado de mayor volatilidad.
- **Renta fija** (depósitos a plazo, bonos, fondos mutuos de deuda): menor exposición a
  pérdida de capital en condiciones normales, pero también menor retorno esperado.

Ninguna es mejor en abstracto. La que corresponde depende de tu horizonte, tu liquidez
y tu tolerancia real — no la declarada.

### 5. ¿Sabes cómo tributa lo que vas a comprar?

En Chile, los distintos instrumentos tienen tratamientos tributarios distintos. Los
intereses de un depósito a plazo tributan de una forma. El mayor valor obtenido en el
rescate de fondos mutuos, de otra. Los ETFs listados en bolsa tienen condiciones
particulares según la normativa vigente del SII.

Conocer el tratamiento tributario antes de invertir no es un detalle administrativo — afecta
el retorno neto real de la operación. Y corregirlo después, al momento de declarar, es
más costoso que haberlo revisado antes.

Esta guía no detalla las condiciones exactas de cada instrumento, porque esas condiciones
pueden cambiar y deben verificarse en el SII y CMF con la normativa vigente. Lo que sí
aplica siempre: revisar la tributación del instrumento que estás evaluando antes de entrar,
no al momento de salir.

Recursos gratuitos para revisarlo: [CMF Educa](https://www.cmfchile.cl/educa/) y el portal
del [SII](https://www.sii.cl/).

## Cuatro escenarios: criterios, no carteras

Estos escenarios no son recomendaciones de producto. Son ejemplos de cómo los criterios
anteriores cambian según el objetivo — para ayudarte a identificar cuál se parece más
a tu situación.

| Escenario | Horizonte típico | Criterio dominante | Consideraciones clave |
|---|---|---|---|
| **Pie de departamento** | 2–4 años | Liquidez al vencimiento; bajo riesgo de pérdida de capital | La fecha límite es real. La volatilidad de corto plazo no es una oportunidad en este caso — es un riesgo. |
| **Jubilación complementaria** | +10 años | Horizonte largo; capacidad de absorber volatilidad | Mayor plazo no significa "sin criterios". Los costos, la diversificación y la tributación siguen siendo relevantes. |
| **Excedente sin objetivo definido** | Indefinido | Liquidez conservadora como default | Mientras el objetivo no está claro, el criterio conservador aplica. Definir el objetivo antes de elegir el instrumento, no al revés. |
| **Primer acercamiento / capital pequeño** | Variable | Costos proporcionales al monto | Las comisiones, los derechos de bolsa y los mínimos de entrada impactan más cuando el capital es bajo. Revisar el costo total antes de entrar, no solo la rentabilidad esperada. |

Para comparar los instrumentos que aplican según el escenario que te identifica, el
siguiente paso es la
[guía de ahorro e inversión en Chile](/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/).

## Qué hacer con esta información

El marco de criterios no reemplaza la elección — la informa. Una vez que tienes claros
tu horizonte, tu liquidez, tu tolerancia real al riesgo y el tratamiento tributario,
la comparación de instrumentos tiene un eje concreto.

**Secuencia práctica:**

1. Confirmar que el fondo de emergencia está separado y completo.
2. Definir el horizonte real (no el deseado).
3. Evaluar honestamente la tolerancia a la pérdida de capital.
4. Verificar si necesitas liquidez parcial antes del vencimiento.
5. Revisar cómo tributa el instrumento que estás considerando en el SII.
6. Con ese marco, comparar instrumentos según plazo, riesgo y costo en la
   [guía de instrumentos](/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/).

Si tu situación incluye rentas mixtas, patrimonio significativo, instrumentos
internacionales o APV, considera consultar un asesor inscrito en el Registro de
Asesores de la CMF antes de tomar decisiones con montos relevantes.

## Preguntas frecuentes

### ¿Existe una edad ideal para empezar a invertir?

No existe una edad correcta. Lo que sí existe es una secuencia de prerequisitos: fondo
de emergencia, horizonte definido y tolerancia al riesgo clara. La edad afecta el
horizonte disponible —a mayor edad antes de la jubilación, menor puede ser el horizonte
para ciertos objetivos— pero no define por sí sola si es o no el momento de invertir.
Las carteras modelo por edad son orientaciones generales que simplifican factores que
varían mucho entre personas.

### ¿Puedo invertir si tengo deudas?

Depende del costo de la deuda. En términos generales, pagar una deuda de alto costo
(tarjeta de crédito con tasa alta, crédito de consumo caro) antes de invertir reduce el
costo financiero de forma predecible. La inversión tiene retorno incierto; la deuda tiene
costo cierto. Eso no significa que siempre corresponda pagar primero toda la deuda —
hay casos donde conviene hacer ambas cosas en paralelo— pero el costo de la deuda es el
criterio central, no un detalle.

### ¿Cuánto capital mínimo necesito para invertir?

No hay un mínimo universal — depende del instrumento y de las condiciones del intermediario.
Lo que sí aplica siempre: los costos de transacción, custodia y comisiones impactan
proporcionalmente más cuando el capital es bajo. Antes de entrar, revisar el costo total
del instrumento (no solo la rentabilidad esperada) es especialmente importante con
montos pequeños.

### ¿Esta guía aplica para el APV?

El APV tiene criterios adicionales: beneficio tributario, plazo de retiro, relación con
la jubilación y regulación de la Superintendencia de Pensiones. Esta guía no lo cubre en
profundidad. Si el APV es parte de tu evaluación, revisa
[qué es el APV y cuándo conviene](/posts/que-es-el-apv/) antes de aplicar este marco
de criterios.

---

*Información vigente al 2026-05-21. Fuentes: [CMF Educa](https://www.cmfchile.cl/educa/),
[SII — Impuesto a la Renta](https://www.sii.cl/), [CMF — Registro de entidades
supervisadas](https://www.cmfchile.cl/institucional/mercados/entidades.php).*
```

---

## Componente Astro — InversionReadinessChecklist

**Archivo destino: `src/components/InversionReadinessChecklist.astro`**

El componente es autocontenido: lógica de UI y estado en el mismo archivo, sin dependencias
externas, sin cookies, sin llamadas a API. Se implementa con un `<script>` inline que
maneja el estado de las respuestas y renderiza el resultado.

```astro
---
// InversionReadinessChecklist.astro
// Checklist de prerequisitos de inversión — 5 preguntas binarias
// Resultado: preparación (no recomendación de producto)
---

<div class="checklist-inversion" id="checklist-inversion">
  <h3 class="checklist-title">¿Estás listo para invertir?</h3>
  <p class="checklist-subtitle">
    Responde las siguientes preguntas. El resultado te indica si tienes
    los prerequisitos básicos — no qué instrumento elegir.
  </p>

  <form id="checklist-form" class="checklist-form" novalidate>
    <fieldset class="checklist-fieldset">
      <div class="checklist-question" data-question="1">
        <p class="checklist-question-text">
          <span class="checklist-q-num">1.</span>
          ¿Tienes un fondo de emergencia separado, equivalente a al menos
          3 meses de gastos esenciales?
        </p>
        <div class="checklist-options" role="group" aria-label="Pregunta 1">
          <label class="checklist-option">
            <input type="radio" name="q1" value="si" required />
            <span>Sí</span>
          </label>
          <label class="checklist-option">
            <input type="radio" name="q1" value="no" />
            <span>No</span>
          </label>
        </div>
      </div>

      <div class="checklist-question" data-question="2">
        <p class="checklist-question-text">
          <span class="checklist-q-num">2.</span>
          ¿Tu horizonte de inversión es de al menos 12 meses?
        </p>
        <div class="checklist-options" role="group" aria-label="Pregunta 2">
          <label class="checklist-option">
            <input type="radio" name="q2" value="si" required />
            <span>Sí</span>
          </label>
          <label class="checklist-option">
            <input type="radio" name="q2" value="no" />
            <span>No</span>
          </label>
        </div>
      </div>

      <div class="checklist-question" data-question="3">
        <p class="checklist-question-text">
          <span class="checklist-q-num">3.</span>
          ¿Puedes dejar ese dinero sin tocarlo durante todo el período previsto?
        </p>
        <div class="checklist-options" role="group" aria-label="Pregunta 3">
          <label class="checklist-option">
            <input type="radio" name="q3" value="si" required />
            <span>Sí</span>
          </label>
          <label class="checklist-option">
            <input type="radio" name="q3" value="no" />
            <span>No</span>
          </label>
        </div>
      </div>

      <div class="checklist-question" data-question="4">
        <p class="checklist-question-text">
          <span class="checklist-q-num">4.</span>
          ¿Entiendes y aceptas que podrías perder parte del capital
          (no solo dejar de ganar)?
        </p>
        <div class="checklist-options" role="group" aria-label="Pregunta 4">
          <label class="checklist-option">
            <input type="radio" name="q4" value="si" required />
            <span>Sí</span>
          </label>
          <label class="checklist-option">
            <input type="radio" name="q4" value="no" />
            <span>No</span>
          </label>
        </div>
      </div>

      <div class="checklist-question" data-question="5">
        <p class="checklist-question-text">
          <span class="checklist-q-num">5.</span>
          ¿Sabes cómo tributa el tipo de instrumento que estás evaluando
          en Chile según el SII?
        </p>
        <div class="checklist-options" role="group" aria-label="Pregunta 5">
          <label class="checklist-option">
            <input type="radio" name="q5" value="si" required />
            <span>Sí</span>
          </label>
          <label class="checklist-option">
            <input type="radio" name="q5" value="no" />
            <span>No</span>
          </label>
        </div>
      </div>
    </fieldset>

    <button type="button" id="checklist-submit" class="checklist-btn" disabled>
      Ver resultado
    </button>
  </form>

  <div id="checklist-result" class="checklist-result" aria-live="polite" hidden>
  </div>
</div>

<script>
  const form = document.getElementById("checklist-form");
  const submitBtn = document.getElementById("checklist-submit");
  const resultEl = document.getElementById("checklist-result");

  const RESULTS = {
    bloqueante: {
      icon: "🔴",
      label: "Hay un paso previo importante",
      text: `El fondo de emergencia es el colchón que impide que tengas que rescatar
             tu inversión en el peor momento. Es el paso anterior a la inversión,
             no una opción.`,
      cta: {
        label: "Cómo construir tu fondo de emergencia",
        href: "/posts/fondo-emergencia-chile/"
      }
    },
    horizonte: {
      icon: "🟡",
      label: "Para este plazo, los instrumentos adecuados cambian",
      text: `Con un horizonte menor a 12 meses, los instrumentos de mayor riesgo
             también tienen mayor probabilidad de pérdida en el corto plazo.
             Los de renta fija de corto plazo son el marco que aplica.`,
      cta: {
        label: "Depósito a plazo: cuándo conviene",
        href: "/posts/deposito-a-plazo-uf-vs-pesos/"
      }
    },
    liquidez: {
      icon: "🟡",
      label: "La liquidez del instrumento es tu criterio principal",
      text: `Si puedes necesitar ese dinero antes del horizonte previsto, elegir
             un instrumento con restricciones de rescate o penalización por salida
             anticipada puede costarte más que no invertir.`,
      cta: {
        label: "Ver criterios de liquidez por instrumento",
        href: "/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/"
      }
    },
    riesgo: {
      icon: "🟠",
      label: "Tu marco: instrumentos de renta fija o garantizada",
      text: `Sin tolerancia a pérdida de capital, los instrumentos de renta variable
             —ETFs, acciones, algunos fondos mutuos— no son adecuados para este
             capital. Eso no es un defecto: define qué instrumentos analizar.`,
      cta: {
        label: "Ver opciones de menor riesgo",
        href: "/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/"
      }
    },
    listoConPendiente: {
      icon: "🟢",
      label: "Tienes los prerequisitos de preparación",
      text: `Antes de ejecutar, revisa el tratamiento tributario del instrumento
             que elijas. CMF Educa y el SII tienen guías gratuitas sobre cómo
             tributan los distintos instrumentos.`,
      ctas: [
        { label: "Comparar DAP, fondos mutuos y ETFs", href: "/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/" },
        { label: "CMF Educa", href: "https://www.cmfchile.cl/educa/", external: true }
      ]
    },
    listo: {
      icon: "🟢",
      label: "Tienes los prerequisitos básicos",
      text: `El siguiente paso es comparar instrumentos según tu horizonte,
             tu tolerancia real al riesgo y los costos de cada opción.`,
      cta: {
        label: "Comparar DAP, fondos mutuos y ETFs",
        href: "/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/"
      }
    }
  };

  const ADVISORY =
    `<p class="checklist-advisory">
       <strong>Nota educativa:</strong> este resultado no es asesoría financiera
       ni sustituye la evaluación de tu situación particular.
     </p>`;

  function getAnswers() {
    return {
      q1: form.querySelector('[name="q1"]:checked')?.value,
      q2: form.querySelector('[name="q2"]:checked')?.value,
      q3: form.querySelector('[name="q3"]:checked')?.value,
      q4: form.querySelector('[name="q4"]:checked')?.value,
      q5: form.querySelector('[name="q5"]:checked')?.value,
    };
  }

  function allAnswered(answers) {
    return Object.values(answers).every(Boolean);
  }

  function classify(answers) {
    if (answers.q1 === "no") return "bloqueante";
    if (answers.q2 === "no") return "horizonte";
    if (answers.q3 === "no") return "liquidez";
    if (answers.q4 === "no") return "riesgo";
    if (answers.q5 === "no") return "listoConPendiente";
    return "listo";
  }

  function renderResult(key) {
    const r = RESULTS[key];
    let ctaHtml = "";

    if (r.ctas) {
      ctaHtml = r.ctas
        .map(c => {
          const ext = c.external
            ? ' target="_blank" rel="noopener"'
            : "";
          return `<a href="${c.href}" class="checklist-cta"${ext}>${c.label}</a>`;
        })
        .join("");
    } else if (r.cta) {
      ctaHtml = `<a href="${r.cta.href}" class="checklist-cta">${r.cta.label}</a>`;
    }

    return `
      <div class="checklist-result-inner checklist-result--${key}">
        <div class="checklist-result-header">
          <span class="checklist-result-icon" aria-hidden="true">${r.icon}</span>
          <strong class="checklist-result-label">${r.label}</strong>
        </div>
        <p class="checklist-result-text">${r.text}</p>
        <div class="checklist-result-ctas">${ctaHtml}</div>
        ${ADVISORY}
      </div>`;
  }

  form.addEventListener("change", () => {
    const answers = getAnswers();
    submitBtn.disabled = !allAnswered(answers);
  });

  submitBtn.addEventListener("click", () => {
    const answers = getAnswers();
    if (!allAnswered(answers)) return;

    const key = classify(answers);
    resultEl.innerHTML = renderResult(key);
    resultEl.hidden = false;
    resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
</script>

<style>
  .checklist-inversion {
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin: 2rem 0;
    background: var(--color-surface-alt, #f8fafc);
  }

  .checklist-title {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    color: var(--color-text-primary, #1e293b);
  }

  .checklist-subtitle {
    font-size: 0.9rem;
    color: var(--color-text-secondary, #64748b);
    margin: 0 0 1.5rem;
  }

  .checklist-fieldset {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .checklist-question {
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .checklist-question-text {
    margin: 0 0 0.75rem;
    font-size: 0.95rem;
    line-height: 1.5;
    color: var(--color-text-primary, #1e293b);
  }

  .checklist-q-num {
    font-weight: 700;
    color: var(--color-accent, #0ea5e9);
    margin-right: 0.25rem;
  }

  .checklist-options {
    display: flex;
    gap: 1rem;
  }

  .checklist-option {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--color-text-primary, #1e293b);
  }

  .checklist-option input[type="radio"] {
    accent-color: var(--color-accent, #0ea5e9);
    width: 1rem;
    height: 1rem;
  }

  .checklist-btn {
    margin-top: 1.5rem;
    padding: 0.625rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    background: var(--color-accent, #0ea5e9);
    color: #fff;
    border: none;
    transition: opacity 0.15s;
  }

  .checklist-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .checklist-result {
    margin-top: 1.5rem;
  }

  .checklist-result-inner {
    padding: 1rem 1.25rem;
    border-radius: 0.5rem;
    border-left: 4px solid;
  }

  .checklist-result--bloqueante  { border-color: #ef4444; background: #fef2f2; }
  .checklist-result--horizonte   { border-color: #f59e0b; background: #fffbeb; }
  .checklist-result--liquidez    { border-color: #f59e0b; background: #fffbeb; }
  .checklist-result--riesgo      { border-color: #f97316; background: #fff7ed; }
  .checklist-result--listoConPendiente { border-color: #22c55e; background: #f0fdf4; }
  .checklist-result--listo       { border-color: #22c55e; background: #f0fdf4; }

  .checklist-result-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .checklist-result-icon {
    font-size: 1.1rem;
    line-height: 1;
  }

  .checklist-result-label {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-primary, #1e293b);
  }

  .checklist-result-text {
    margin: 0 0 1rem;
    font-size: 0.9rem;
    line-height: 1.6;
    color: var(--color-text-primary, #1e293b);
  }

  .checklist-result-ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .checklist-cta {
    display: inline-block;
    padding: 0.375rem 0.875rem;
    border-radius: 0.375rem;
    background: var(--color-accent, #0ea5e9);
    color: #fff;
    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.15s;
  }

  .checklist-cta:hover {
    opacity: 0.88;
  }

  .checklist-advisory {
    font-size: 0.8rem;
    color: var(--color-text-secondary, #64748b);
    margin: 0;
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-border, #e2e8f0);
  }
</style>
```

---

## Notas post-draft

1. **TODO:SOURCE bloqueantes**: Los claims R6, R7, R8 (tributación exacta de DAP, fondos mutuos y ETFs) no están detallados en el draft — el texto remite al SII en lugar de afirmar condiciones. Esto es correcto según las instrucciones del outline. No desbloquear hasta verificar en gate 02 con fuentes primarias.

2. **Fecha de corte**: el draft usa `2026-05-21` como fecha de corte provisional. Actualizar en 07-publish-packet con la fecha de publicación real.

3. **heroImage**: pendiente asignación desde el pool en `scripts/hero-images/pool/`. Candidatos: assets del pool `a--ahorro--*`. Completar en 07-publish-packet.

4. **pubDate**: dejar en blanco hasta 07-publish-packet.

5. **Dialecto**: tuteo chileno. Sin "voseo". Revisar con `check:dialect` en gate 06.

6. **Componente InversionReadinessChecklist**: el código está en este draft. Antes de publicar, crear el archivo `src/components/InversionReadinessChecklist.astro` con el código de la sección "Componente Astro". El archivo MDX no compilará sin él.

7. **`articleLead.officialSources`**: las URLs de CMF y SII son referencias generales — verificar en gate 06 que apuntan a secciones vigentes.
