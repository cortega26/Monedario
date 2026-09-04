# Plan 083: Dar paridad de instrumentación a las tres superficies de "siguiente paso" y cerrar el drift del enum `page_type`

> **Instrucciones para el ejecutor**: sigue este plan paso a paso. Ejecuta cada
> comando de verificación y confirma el resultado esperado antes de pasar al
> siguiente paso. Si ocurre cualquier cosa de la sección "Condiciones de STOP",
> detente y reporta — no improvises. Al terminar, actualiza la fila de este plan
> en `plans/README.md` salvo que un revisor te haya dicho que él mantiene el índice.
>
> **Drift check (córrelo primero)**:
> ```bash
> git diff --stat 08a6b5b4..HEAD -- \
>   src/components/NextSteps.astro \
>   src/contracts/analytics-events.ts \
>   src/scripts/analytics.ts \
>   src/layouts/PostDetails.astro \
>   src/pages/calculadoras/index.astro
> ```
> Si algún archivo en alcance cambió respecto de lo citado en "Estado actual",
> compara los extractos contra el código vivo antes de escribir. Mismatch = STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (toca el contrato de analytics compartido cliente↔worker; ningún cambio de ruta ni de contenido)
- **Depends on**: ninguno
- **Category**: bug (integridad de medición)
- **Planned at**: commit `08a6b5b4`, 2026-09-04

## Por qué importa

La ventana de validación utility-led (2026-08-02 → 2026-11-02, ver
`docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md`) decide en noviembre si se
amplían los CTA contextuales, las alertas y el apoyo voluntario. Esa decisión se
toma con la razón `next_step_click / next_step_shown`. Hoy **la superficie que el
plan 082 desplegó no emite impresiones**: `src/components/NextSteps.astro` se
renderiza en más de diez calculadoras (entre ellas `seguro-cesantia` y
`prepago-credito`, las que el plan 082 pobló) y **no tiene ningún `<script>`**, así
que nunca emite `next_step_shown`. Sus clics sí se emiten, por el manejador
genérico de `data-analytics-cta`, pero **sin `calculator_id`**, así que caen en un
bucket fantasma.

Evidencia medida en los exports reales (`output/operations/data-signals/analytics/`):

| Semana | `next_step_click` con `calculator_id` real | en bucket `calculator`/`unknown` |
|---|---|---|
| 2026-W33 | 16 | 8 |
| 2026-W34 | 2 | 2 |
| 2026-W35 | 5 | 7 |

Y `seguro-cesantia` / `prepago-credito` muestran `next_step_shown = 0` en W33, W34
y W35 pese a renderizar `NextSteps`.

Consecuencia concreta: **cerca de la mitad de los clics de siguiente paso no tienen
denominador ni dueño**, y la superficie más nueva es invisible. El gate de
noviembre no se puede evaluar sobre datos así.

En el mismo archivo de contrato hay un segundo defecto verificado: el enum
`page_type` no incluye dos valores que el sitio sí emite (`"article"` y
`"calculator-index"`), así que el sanitizador los descarta en silencio de **todos**
los eventos de páginas de artículo y del índice de calculadoras.

## Estado actual

### Archivos relevantes

- `src/components/NextSteps.astro` — tarjeta estática de "Qué sigue"; renderizada
  por 10+ páginas de `src/pages/calculadoras/`. **Sin instrumentación.**
- `src/scripts/analytics.ts` — transporte first-party y manejador genérico de CTA.
- `src/contracts/analytics-events.ts` — contrato v2 compartido cliente↔worker
  (allowlist de eventos, propiedades y enums).
- `src/components/UtmPostResultActions.astro` — la superficie **bien**
  instrumentada; úsala como patrón de referencia.
- `src/layouts/PostDetails.astro:290` y `src/pages/calculadoras/index.astro` —
  emiten los dos `page_type` que el enum no admite.

### Extracto 1 — `NextSteps.astro:92-100` (el ancla, sin impresión ni identidad)

```astro
            <a
              href={getPath(item.href)}
              class="mt-4 inline-flex min-h-[24px] items-center py-1 text-sm font-semibold text-accent underline underline-offset-4 hover:opacity-80"
              data-analytics-cta="next-step"
              data-analytics-label={item.title}
              data-analytics-location={location}
              aria-label={`${item.cta ?? defaultCta(item.href)} ${item.title}`}
            >
```

El archivo tiene 108 líneas y **cero** etiquetas `<script>` (verificado con
`grep -n "<script" src/components/NextSteps.astro` → sin coincidencias).

### Extracto 2 — `src/scripts/analytics.ts:152-163` (el manejador genérico)

```ts
    const ctaElement = target.closest<HTMLElement>("[data-analytics-cta]");
    if (ctaElement) {
      const href =
        ctaElement instanceof HTMLAnchorElement ? ctaElement.href : undefined;
      track(getAnalyticsEventNameForCta(ctaElement.dataset.analyticsCta), {
        cta_type: ctaElement.dataset.analyticsCta,
        cta_label:
          ctaElement.dataset.analyticsLabel ?? ctaElement.textContent?.trim(),
        cta_location: ctaElement.dataset.analyticsLocation,
        destination_url: href,
      });
    }
```

`getAnalyticsEventNameForCta("next-step")` devuelve `"next_step_click"`
(`src/utils/analytics.ts:46`). El payload **no lleva `calculator_id`**, y además
`cta_type`/`cta_location`/`destination_url` **no están** en la allowlist de
`next_step_click`, así que el sanitizador los descarta: el evento llega con
`{page_type, app_version}` y nada más.

### Extracto 3 — `src/contracts/analytics-events.ts:107-118` (el enum incompleto)

```ts
const ENUM_VALUES: Readonly<Record<string, ReadonlySet<string>>> = {
  page_type: new Set([
    "calculator",
    "post",
    "guide",
    "home",
    "hub",
    "support",
    "legal",
    "unknown",
  ]),
```

Valores realmente emitidos en el sitio (verificado con grep sobre `src/`):
`"calculator"` (22 páginas), `"home"` (1), **`"article"`** (`PostDetails.astro:290`)
y **`"calculator-index"`** (`src/pages/calculadoras/index.astro`). Los dos últimos
no están en el enum.

Comprobación empírica ya realizada por el auditor (no hace falta repetirla, pero
puedes reproducirla): al pasar `{page_type: "article", calculator_id: "conversor-uf",
app_version: "5.5.1"}` por `sanitizeAnalyticsPayload("article_calculator_cta_click", …)`
el resultado conserva **solo** `{app_version}`.

### Extracto 4 — el patrón correcto, `UtmPostResultActions.astro:101-135`

```ts
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          if (target.dataset.nextStepId) {
            recordShown(`next:${target.dataset.nextStepId}`, () => {
              trackAnalyticsEvent("next_step_shown", {
                ...BASE,
                next_step_id: target.dataset.nextStepId,
              });
            });
          }
          observer.unobserve(target);
        }
      },
      { threshold: 0.25 }
    );
```

Con `recordShown` deduplicando por vista mediante un `Set`, y
`BASE = { calculator_id, page_type, interaction_variant }`.

### Convenciones del repo que debes respetar

- **El contrato es la frontera de privacidad.** `FORBIDDEN_KEY_PATTERN`
  (`analytics-events.ts:136`) prohíbe claves con datos financieros o
  identificadores. **No agregues ninguna clave nueva de propiedad** en este plan:
  solo usa las que ya existen (`calculator_id`, `page_type`, `next_step_id`,
  `interaction_variant`).
- **Doble validación**: el cliente sanea (descarta claves desconocidas) y el worker
  re-valida con `rejectUnknown: true`. Todo lo que agregues debe pasar **ambas**.
- `A2` del plan utility-led: los eventos representan acciones agregadas, nunca
  personas ni cohortes. No introduzcas identificadores persistentes.
- Español neutral en comentarios y copy (sin voseo).

## Comandos que vas a necesitar

| Propósito | Comando | Procedencia | Esperado |
|---|---|---|---|
| Instalar | `pnpm install --frozen-lockfile` | declared | exit 0 |
| Tests | `pnpm run test` | declared | todos pasan |
| Lint | `pnpm run lint` | declared | exit 0 |
| Formato | `pnpm run format:check` | declared | exit 0 |
| Fronteras | `pnpm run check:boundaries` | declared | exit 0 |
| Typecheck Astro | `pnpm exec astro check` | declared | 0 errores |
| Espejo de CI | `pnpm run check:ci` | declared | exit 0 |

Ninguno se ejecutó durante la auditoría (el auditor tiene prohibido instalar
dependencias). Si alguno **no existe** o falla en un checkout limpio, es
condición de STOP (ver Paso 0).

## Alcance

**En alcance** (los únicos archivos que debes modificar):
- `src/components/NextSteps.astro`
- `src/contracts/analytics-events.ts`
- `tests/` — archivo(s) de test nuevos o extendidos para lo anterior

**Fuera de alcance** (NO tocar, aunque parezcan relacionados):
- `src/components/UtmPostResultActions.astro` — ya está bien instrumentado; su
  **ubicación** es problema del plan 085, no de este.
- `src/scripts/next-best-step.ts` — la tarjeta dinámica ya emite bien.
- `workers/analytics-collector/**` — el worker importa el mismo contrato; se
  actualiza solo. No lo edites ni lo despliegues.
- `src/scripts/analytics.ts` — el manejador genérico **se queda como está**; la
  identidad se resuelve en el componente (Paso 2), no en el manejador global.
- Cualquier página de `src/pages/calculadoras/*.astro` — no cambies dónde se
  renderiza `NextSteps` ni su copy.
- `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md` — lo toca el plan 084.

## Flujo git

- Rama: `advisor/083-next-step-instrumentation-parity`
- Commits estilo conventional commits, como el resto del repo. Ejemplo real:
  `fix(analytics): allow article_calculator_cta_click in analytics export validation (#453)`
- **No hagas push ni abras PR** salvo instrucción explícita del operador.

## Pasos

### Paso 0: baseline verde

Ejecuta la fila `Instalar` y luego cada comando de la tabla sobre el checkout sin
modificar.

- Si todos pasan: anótalo y sigue al Paso 1.
- Si un comando `declared` no existe o falla en el checkout limpio: **STOP y
  reporta**, con el comando y su salida exacta. No "arregles" el build.

**Verifica**: cada comando de la tabla corre y coincide con lo esperado.

### Paso 1: admitir en el enum los dos `page_type` que el sitio emite

En `src/contracts/analytics-events.ts`, agrega `"article"` y `"calculator-index"`
al `Set` de `page_type` dentro de `ENUM_VALUES` (extracto 3). Mantén el orden
alfabético-por-familia existente y no toques ningún otro enum.

Añade un comentario de una línea, en español neutral, explicando que estos dos
valores los emiten `PostDetails.astro` y el índice de calculadoras.

> **No renombres** los valores emitidos en las páginas para que calcen con el enum
> (por ejemplo `"article"` → `"post"`). Cambiar el emisor rompería la
> comparabilidad de las series históricas justo dentro de la ventana de medición.
> Se amplía el enum, no se reescribe el emisor.

**Verifica**:
```bash
pnpm exec astro check
```
→ 0 errores. Y:
```bash
grep -n '"article"' src/contracts/analytics-events.ts
grep -n '"calculator-index"' src/contracts/analytics-events.ts
```
→ ambos con al menos una coincidencia dentro del bloque `page_type`.

### Paso 2: emitir `next_step_shown` y dar identidad a los clics en `NextSteps.astro`

`NextSteps.astro` es un componente de Astro sin script. Debes:

1. **Derivar la identidad de la calculadora desde `currentHref`.** **NO agregues
   una prop nueva** (`calculatorId` o similar): ninguna página la pasaría en este
   plan, quedaría sin usar y `pnpm run check:dead-code` (knip) está en el set de
   gates del repo. La identidad se deriva del `currentHref` que las páginas **ya**
   pasan. Implementa un helper local en el frontmatter del componente:

   ```ts
   function deriveCalculatorId(href: string): string | undefined {
     const match = /^\/calculadoras\/([a-z0-9][a-z0-9-]*)\/$/.exec(href);
     return match?.[1];
   }
   ```

   y úsalo así: `const resolvedCalculatorId = deriveCalculatorId(currentHref);`

   > Nota: `currentHref` en las páginas vivas ya tiene exactamente esta forma —
   > por ejemplo `currentHref="/calculadoras/seguro-cesantia/"` en
   > `src/pages/calculadoras/seguro-cesantia.astro:404`. En `/calculadoras/`
   > (el índice) no calzará y quedará `undefined`, que es lo correcto.
   >
   > Pasar `calculatorId` explícitamente desde cada página es más robusto, pero
   > toca 10+ archivos y queda **diferido a propósito** (ver Notas de mantenimiento).

2. **Marcar cada ancla con su `next_step_id`.** Usa **exactamente** esta derivación
   —no improvises otra— porque el valor debe cumplir
   `SAFE_TOKEN = /^[a-z0-9][a-z0-9._-]{0,79}$/` (`analytics-events.ts:132`) y el
   sanitizador descarta en silencio cualquier valor que no calce o que exceda 80
   caracteres (`analytics-events.ts:164`):

   ```ts
   function deriveNextStepId(href: string): string {
     return normalizeHref(href)
       .replace(/^\//, "")
       .replace(/\//g, "-")
       .toLowerCase()
       .replace(/[^a-z0-9._-]/g, "-")
       .replace(/^-+/, "")
       .slice(0, 80);
   }
   ```

   Aplícalo en el `<a>` del extracto 1 como `data-next-step-id={deriveNextStepId(item.href)}`.

   La truncación a 80 **no es opcional**: hay slugs de blog largos en este repo
   (por ejemplo `/posts/utm-chile-que-es-como-funciona/` → 
   `posts-utm-chile-que-es-como-funciona`, 36 caracteres, pasa; pero otros títulos
   largos se acercan al tope). Sin `.slice(0, 80)` reproducirías exactamente la
   clase de defecto que este plan existe para corregir: eventos descartados en
   silencio.

3. **Añadir un `<script>`** al final del componente que, siguiendo el patrón del
   extracto 4:
   - importe `trackAnalyticsEvent` desde `@/utils/analytics`;
   - observe con `IntersectionObserver` (`threshold: 0.25`) cada
     `[data-next-step-id]` dentro de la sección, deduplique por vista con un `Set`
     y emita `next_step_shown` con
     `{ calculator_id, page_type: "calculator", next_step_id }`;
   - registre un listener de `click` en las mismas anclas que emita
     `next_step_click` con **las mismas** claves de identidad;
   - re-inicialice en `astro:page-load` y sea idempotente (guarda un
     `dataset.initialized` como hace `UtmPostResultActions.astro:91-92`).

   Omite `calculator_id` del payload cuando `resolvedCalculatorId` sea
   `undefined` — es preferible un evento sin identidad a uno con identidad falsa.

   **Cuidado con el doble conteo**: el ancla ya tiene `data-analytics-cta="next-step"`,
   que el manejador global convierte en otro `next_step_click`. Para no contar dos
   veces, **quita `data-analytics-cta="next-step"` del ancla** en este mismo paso.

   Deja `data-analytics-label` y `data-analytics-location`: el manejador global
   selecciona sobre `[data-analytics-cta]` (`src/scripts/analytics.ts:152`), así que
   sin ese atributo los otros dos quedan inertes y no disparan nada.

   > Si al revisar `src/scripts/analytics.ts` ves que `data-analytics-label`
   > alimentaba `cta_label`: **no se pierde nada medible**. `cta_label` no figura en
   > `ANALYTICS_ALLOWED_PROPERTIES` (`analytics-events.ts:89-105`), así que el
   > sanitizador ya lo descartaba en todos los eventos. No lo agregues al contrato.

**Verifica**:
```bash
pnpm exec astro check && pnpm run lint && pnpm run format:check
```
→ los tres exit 0. Y:
```bash
grep -c "data-analytics-cta=\"next-step\"" src/components/NextSteps.astro
```
→ `0`.
```bash
grep -c "next_step_shown" src/components/NextSteps.astro
```
→ al menos `1`.

### Paso 3: tests

Ver "Plan de pruebas". **Verifica**: `pnpm run test` → todos pasan, incluidos los
nuevos.

### Paso 4: suite completa

**Verifica**:
```bash
pnpm run check:ci
```
→ exit 0.

## Plan de pruebas

Ubicación: sigue la convención existente de `tests/` (busca el archivo que ya
cubre el contrato con `grep -rln "sanitizeAnalyticsPayload" tests/` y modélate
sobre él en estructura, nombres y estilo de aserción).

Casos nuevos obligatorios (≥6):

1. **Enum `page_type` ampliado** — `sanitizeAnalyticsPayload("calculator_view",
   { page_type: "article", calculator_id: "conversor-uf", app_version: "5.5.1" })`
   conserva `page_type: "article"`. Mismo caso con `"calculator-index"`.
2. **Regresión del defecto** — el mismo payload con `page_type: "article"` pasado
   con `{ rejectUnknown: true }` (la ruta del worker) devuelve un objeto válido,
   no `null`.
3. **Valor inválido sigue rechazándose** — `page_type: "articulo"` (que no está en
   el enum) se sigue descartando; el enum se amplió, no se abrió.
4. **`next_step_id` derivado cumple `SAFE_TOKEN`** — para los destinos reales que
   `NextSteps` recibe hoy (por ejemplo `/calculadoras/conversor-uf/`,
   `/posts/...`), el identificador que produce el Paso 2 calza con
   `/^[a-z0-9][a-z0-9._-]{0,79}$/`.
5. **`deriveNextStepId`** — trunca a 80 caracteres y el resultado siempre cumple
   `SAFE_TOKEN` para todos los `item.href` que `NextSteps` recibe hoy.
6. **`deriveCalculatorId`** — devuelve `"seguro-cesantia"` para
   `"/calculadoras/seguro-cesantia/"` y `undefined` para `"/calculadoras/"`, para `"/posts/algo/"`
   y para `"/calculadoras/apv"` (sin barra final).

Si `NextSteps.astro` no es testeable directamente en la suite actual, extrae
`deriveCalculatorId` y la derivación de `next_step_id` a un módulo pequeño bajo
`src/utils/` y testea ese módulo — pero **solo** si es necesario, y decláralo como
desviación en tu reporte.

## Criterios de terminado

Todos deben cumplirse:

- [ ] `pnpm exec astro check` → 0 errores
- [ ] `pnpm run test` → exit 0, con los ≥6 tests nuevos pasando
- [ ] `pnpm run check:ci` → exit 0
- [ ] `pnpm run check:dead-code` no reporta símbolos nuevos sin uso introducidos por este plan
- [ ] `grep -c 'data-analytics-cta="next-step"' src/components/NextSteps.astro` → `0`
- [ ] `grep -n '"article"' src/contracts/analytics-events.ts` → coincide dentro del bloque `page_type`
- [ ] `git diff --name-only main...HEAD` lista **solo** archivos en alcance
- [ ] Fila de este plan actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta (no improvises) si:

- Los extractos de "Estado actual" no calzan con el código vivo (drift).
- Un comando `declared` no existe o falla en el checkout sin modificar (Paso 0).
- La verificación de un paso falla dos veces tras un intento razonable de arreglo.
- El arreglo parece exigir tocar un archivo fuera de alcance — **en particular**,
  si concluyes que hay que editar `src/scripts/analytics.ts` o alguna página de
  `src/pages/calculadoras/`. Reporta la razón; no lo hagas por tu cuenta.
- Descubres que **`NextSteps.astro` sí emitía `next_step_shown` por alguna vía
  indirecta** que la auditoría no vio: entonces la premisa central es falsa y el
  plan debe rediseñarse, no parchearse.
- `pnpm run check:dead-code` empieza a reportar algo que tú introdujiste (por
  ejemplo un helper o una prop sin uso): revisa el Paso 2 — el plan está diseñado
  para no agregar superficie muerta.
- Añadir el enum hace fallar algún test existente que afirme explícitamente que
  `"article"` **debe** descartarse: sería una decisión de privacidad deliberada que
  este plan no puede revertir por su cuenta.

## Notas de mantenimiento

- **Qué debe mirar un revisor**: (1) que no se haya agregado ninguna clave nueva a
  `ANALYTICS_ALLOWED_PROPERTIES` ni a `FORBIDDEN_KEY_PATTERN`; (2) que el evento
  de clic se emita **una sola vez** por clic (el riesgo real de este plan es el
  doble conteo con el manejador genérico); (3) que ningún payload lleve valores
  ingresados por la persona.
- **Interacción futura**: cuando el plan 084 agregue la columna de denominador al
  scorecard, las impresiones que este plan empieza a emitir cambiarán las razones
  publicadas. Es lo buscado, pero la serie **no es comparable hacia atrás**: anota
  la fecha de corte en el scorecard para no leer el salto como cambio de conducta.
- **Diferido a propósito**: pasar `calculatorId` explícitamente como prop desde cada
  página (en vez de derivarlo de `currentHref`) es más robusto pero toca 10+
  páginas y agregaría una prop sin uso si se hiciera a medias; se dejó fuera para
  mantener el diff chico dentro de la ventana de medición.
