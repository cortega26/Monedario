# Plan 031: Backlinks internos a la calculadora de IVA

> **Instrucciones para el ejecutor**: sigue este plan paso a paso. Ejecuta cada
> comando de verificación antes de avanzar. Si ocurre una condición de STOP,
> detente e informa. Al terminar, actualiza la fila de estado en `plans/README.md`.
>
> **Chequeo de deriva (córrelo primero)**:
> ```
> git diff --stat 64644fa6..HEAD -- \
>   src/data/glossary/ \
>   src/data/blog/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026.md \
>   src/data/blog/como-hacer-presupuesto-mensual-chile.md
> ```
> Si algún archivo en alcance cambió, compara los extractos de "Estado actual"
> contra el código vivo antes de editar.

## Estado

- **Prioridad**: P3
- **Esfuerzo**: S
- **Riesgo**: BAJO (solo adiciones de enlaces y un artículo de glosario factual)
- **Depende de**: Plan 025 — DONE y MERGEADO (la calculadora ya existe en `/calculadoras/iva/`)
- **Categoría**: SEO / enlazado interno
- **Planificado en**: commit `64644fa6`, 2026-06-19

## Por qué importa

La calculadora IVA acaba de integrarse en el portafolio (Plan 025), pero el
enlazado interno es mínimo: solo aparece en el hub de calculadoras y como
`related` en dos calculadoras (`impuesto-segunda-categoria`, `conversor-utm`).
Una calculadora evergreen de alto volumen necesita enlaces contextuales desde
el contenido editorial para que el crawler la encuentre con profundidad y para
que los lectores lleguen a ella en el momento exacto en que el IVA es relevante.

Las tres acciones de este plan son aditivas (no modifican prosa existente ni
introducen nuevo contenido YMYL): crear el término de glosario (texto factual)
y agregar una CTA link al final de dos posts donde el IVA ya aparece citado.

## Estado actual

### 1. Glosario IVA — no existe

`ls src/data/glossary/` no devuelve ningún `iva.md`. El glosario sí tiene
entradas para términos relacionados: `impuesto-unico.md`, `sii.md`, `utm.md`,
`global-complementario.md`.

El patrón de una entrada de glosario es (ejemplo real de
`src/data/glossary/impuesto-unico.md`):

```markdown
---
term: "Impuesto Único de Segunda Categoría"
shortDefinition: "..."
relatedTerms: ["slug1", "slug2"]
---

Cuerpo en markdown. Párrafos cortos. Sin asesoría personal.

**CTA hacia calculadora:**
**Simula el impacto en tu sueldo líquido:** [Calculadora de sueldo líquido](/calculadoras/sueldo-liquido/) →
```

El campo `term` es el nombre del término. El slug del archivo determina la
URL: `src/data/glossary/iva.md` → `/glosario/iva/`. La CTA sigue el patrón
`**[Texto imperativo]:** [Etiqueta del enlace](/ruta/) →`.

### 2. Blog ahorro-e-inversión — menciona IVA en línea 104

`src/data/blog/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026.md`
línea 104 (extracto literal):

```
- **Intermediación bursátil:** según CMF, el costo puede incluir comisión del corredor, derechos de bolsa, IVA, custodia y otros cargos. El número que te muestran en la pantalla puede no ser el costo total.
```

El IVA aparece como componente de costo; el lector en ese punto ya está
pensando en precios con y sin impuesto incluido. Una CTA al final de esa
sección es contextualmente natural.

### 3. Blog presupuesto mensual — contexto de gastos reales

`src/data/blog/como-hacer-presupuesto-mensual-chile.md` trata el cálculo de
gastos reales. El IVA no aparece nombrado directamente en el texto actual,
pero la sección de "gastos" es el lugar natural para un recordatorio de que
los precios en Chile incluyen IVA. Revisa la línea 51 y su contexto antes de
editar:

```
El punto de partida es cuánto entra efectivamente a tu cuenta, no cuánto te pagan en bruto.
```

Si tras leer el archivo completo encuentras que no hay un gancho claro para
IVA (ningún párrafo menciona precios, compras o gastos con impuesto), aplica
la condición de STOP #2.

## Comandos que necesitarás

| Propósito | Comando | Esperado |
|-----------|---------|----------|
| Typecheck | `npx astro check` | `0 errors` |
| Tests completos | `npx vitest run tests/` | todos pasan |
| Verificar enlace IVA en glosario | `grep -n "iva" src/data/glossary/iva.md` | ≥1 match |
| Verificar enlace en posts | `grep -n "/calculadoras/iva/" src/data/blog/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026.md src/data/blog/como-hacer-presupuesto-mensual-chile.md` | ≥1 match por archivo editado |

## Alcance

**En alcance** (crear o editar):
- `src/data/glossary/iva.md` — CREAR
- `src/data/blog/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026.md` — EDITAR (solo agregar CTA)
- `src/data/blog/como-hacer-presupuesto-mensual-chile.md` — EDITAR solo si hay gancho claro (ver Paso 3)

**Fuera de alcance** (NO tocar):
- `src/config/calculatorPortfolio.ts` — ya tiene la entrada IVA
- `src/pages/calculadoras/iva.astro` — no necesita cambios
- Cualquier otro post o página de calculadora
- `src/data/blog/operacion-renta-f22-checklist.md` — menciona impuestos pero no IVA en contexto de cálculo de montos; no encaja
- `src/data/blog/utm-chile-que-es-como-funciona.md` — no menciona IVA; no editar

## Flujo git

- Rama: `content/031-iva-backlinks`
- Conventional commit: `content(iva): glosario IVA y backlinks internos desde posts`
- NO hacer push ni PR salvo indicación del operador.

## Pasos

### Paso 1: Crear la entrada de glosario `iva.md`

Crea `src/data/glossary/iva.md`. El contenido debe ser:

- **Factual y neutro**: el IVA es un hecho legal (Decreto Ley 825), tasa 19%,
  fuente = SII. No ofrecer asesoría tributaria ni decir qué "debería" hacer el
  lector.
- **Estructura**: frontmatter con `term`, `shortDefinition`, `relatedTerms`
  (incluir `"sii"`, `"impuesto-unico"`, `"utm"`); cuerpo de 3–4 párrafos
  cortos explicando qué es el IVA, quién lo cobra, las dos situaciones más
  comunes (agregar IVA a un neto, extraerlo de un bruto); una CTA final.
- **CTA**: `**Calcula el IVA de cualquier monto:** [Calculadora de IVA Chile 19%](/calculadoras/iva/) →`
- **Longitud**: 150–250 palabras en el cuerpo (mismo rango que `impuesto-unico.md`).
- NO mencionar que la herramienta fue "revisada" o "aprobada" por nadie.

**Verifica**: `npx astro check` → `0 errors`.

### Paso 2: CTA en el post de ahorro e inversión

Lee el archivo
`src/data/blog/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026.md`
completo. Localiza la línea 104 (párrafo de intermediación bursátil).

Agrega la siguiente CTA **inmediatamente después del párrafo** que termina en
"...puede no ser el costo total.":

```markdown
> **¿Necesitas separar el IVA de un precio?** Usa la [Calculadora de IVA Chile 19%](/calculadoras/iva/) para desglosar neto, IVA y bruto en segundos.
```

No modifiques el párrafo existente. Solo insertar la cita blockquote después.

**Verifica**: `grep -n "/calculadoras/iva/" src/data/blog/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026.md` → muestra la línea recién agregada.

### Paso 3: CTA condicional en el post de presupuesto mensual

Lee `src/data/blog/como-hacer-presupuesto-mensual-chile.md` completo.

Busca un párrafo que hable de precios, gastos o compras del día a día. Si
encuentras uno donde tenga sentido recordar que los precios de tiendas
incluyen IVA (contexto: "el precio que ves ya tiene IVA incluido"), agrega
inmediatamente después:

```markdown
> **¿Quieres separar el IVA de lo que gastas?** La [Calculadora de IVA Chile 19%](/calculadoras/iva/) te muestra neto, IVA y bruto de cualquier monto.
```

Si no hay un párrafo con ese gancho natural (el texto trata solo ingresos y
no precios de compras), **no edites este archivo** y documenta en tu informe
que fue descartado por falta de gancho.

### Paso 4: Verificación final

```bash
npx astro check              # 0 errors
npx vitest run tests/        # todos pasan
```

## Plan de pruebas

No se escriben tests nuevos: los archivos de contenido no tienen cobertura
unitaria. La verificación es el typecheck de Astro (detecta frontmatter roto
o slugs inválidos en `relatedTerms`) y la suite completa de vitest.

## Criterios de hecho

TODOS deben cumplirse:

- [ ] `src/data/glossary/iva.md` existe con frontmatter válido, cuerpo ≤250 palabras y CTA a `/calculadoras/iva/`.
- [ ] El post `ahorro-e-inversion` tiene un enlace a `/calculadoras/iva/`.
- [ ] El post `presupuesto-mensual` tiene un enlace a `/calculadoras/iva/` O el informe documenta explícitamente por qué fue descartado.
- [ ] `npx astro check` → `0 errors`.
- [ ] `npx vitest run tests/` → todos pasan.
- [ ] `git status` muestra solo los archivos en alcance.

## Condiciones de STOP

Detente e informa si:

- El frontmatter de `iva.md` causa un error de tipo en Astro Check y no puedes
  corregirlo ajustando solo el frontmatter del nuevo archivo.
- El post de presupuesto mensual no tiene ningún párrafo que mencione precios,
  gastos o compras — descártalo sin editar y documéntalo en el informe.
- El post de ahorro e inversión cambió tanto desde `64644fa6` que el párrafo de
  IVA en línea 104 ya no existe; busca el nuevo contexto y si no hay ninguno,
  descártalo.

## Notas de mantenimiento

- Si se crea un artículo de blog dedicado al IVA en el futuro (fuera de este plan,
  requiere pipeline editorial), debería enlazar la calculadora y aparecer en el
  `related` de la entrada de glosario.
- El patrón de CTA blockquote (`> **Texto:** [Enlace]`) es el usado en otros posts
  del sitio; no inventar formato nuevo.
- Si en el futuro el SII modifica la tasa de IVA, el glosario `iva.md` necesita
  actualizarse junto con `CalculateIva.ts`.
