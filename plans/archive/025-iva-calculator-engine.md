# Plan 025: Construir el motor y la página de la calculadora de IVA (SIN PUBLICAR, pendiente de visto bueno editorial)

> **Instrucciones para el ejecutor**: sigue este plan paso a paso. Ejecuta cada
> comando de verificación y confirma el resultado esperado antes de avanzar. Si
> ocurre algo de "Condiciones de STOP", detente e informa — no improvises. Al
> terminar, actualiza la fila de estado en `plans/README.md`.
>
> **LÍMITE YMYL CRÍTICO**: esto es una calculadora financiera. Construirás y
> testearás el motor de cálculo y la página, pero **NO la publicarás**: no la
> registres en el portafolio de calculadoras, no la agregues a navegación y no
> escribas prosa de "asesoría" financiera. La publicación es un paso editorial
> aparte con visto bueno humano (ver "Por qué importa" y Condiciones de STOP).
>
> **Chequeo de deriva (córrelo primero)**:
> `git diff --stat fd2b5dff..HEAD -- src/application/use-cases/ src/config/calculatorPortfolio.ts tests/application/`
> Si algún archivo en alcance cambió desde que se escribió este plan, compara los
> extractos de "Estado actual" contra el código vivo.

## Estado

- **Prioridad**: P2
- **Esfuerzo**: M
- **Riesgo**: MED (YMYL — con compuerta; el motor es aritmética de tasa fija, bajo riesgo)
- **Depende de**: ninguno (independiente del plan 024)
- **Categoría**: direction (feature nueva)
- **Planificado en**: commit `fd2b5dff`, 2026-06-17

## Por qué importa

Ambas auditorías ubican una calculadora de IVA chilena como la herramienta
*nueva* de mayor impacto: demanda alta, transversal y evergreen ("calculadora
IVA"), esfuerzo trivial, y sin equivalente hoy (las 19 calculadoras existentes no
la cubren). El IVA es un valor legal de tasa fija (19%), por lo que la matemática
es determinística y el riesgo de interpretación normativa es bajo — por eso es la
primera calculadora nueva segura.

Este sitio trata las calculadoras nuevas como superficies YMYL que requieren el
pipeline editorial + visto bueno humano antes de salir en vivo (ver hard stops de
`CLAUDE.md` y `context/EDITORIAL_AI_PIPELINE.md`). Por eso este plan entrega una
calculadora **completa, testeada, pero sin publicar**: el motor puro, sus tests
unitarios y el archivo de página. El acto de *publicar* — registrarla en
`src/config/calculatorPortfolio.ts` (lo que la agrega a navegación y al hub de
calculadoras) y subir el conteo esperado del test del portafolio — queda para un
humano tras revisar y aprobar el texto de metodología/disclaimer. Dejar el
portafolio en 19 mantiene verde el test guardián existente y hace que "aún no
publicada" sea el estado por defecto, fail-closed.

## Estado actual

- Los motores de cálculo son funciones puras en `src/application/use-cases/`,
  nombradas `Calculate<Cosa>.ts`, con `Input`/`Output` tipados, un guard
  `assertInput` y constantes compartidas desde `./shared/financialConstants`.
  Ejemplar: `src/application/use-cases/CalculateCompoundInterest.ts:1-55` —
  ```ts
  import { PERCENT_DENOMINATOR } from "./shared/financialConstants";
  export interface CompoundInterestInput { /* ... */ }
  export interface CompoundInterestOutput { /* ... */ }
  function assertInput(input: CompoundInterestInput): void {
    if (!Number.isFinite(input.principal) || input.principal <= 0) {
      throw new Error("principal must be a finite number greater than 0.");
    }
    /* ... */
  }
  ```
- Cada motor tiene un test hermano `tests/application/Calculate<Cosa>.test.ts`
  (p. ej. `tests/application/CalculateCompoundInterest.test.ts`). Úsalo como
  patrón estructural.
- Las páginas son `.astro` en `src/pages/calculadoras/`. El ejemplar completo más
  simple es `src/pages/calculadoras/conversor-utm.astro` (480 líneas). Importa un
  stack de componentes estándar: `Layout`, `Header`, `CalculatorJsonLd`,
  `Footer`, `MethodologyBlock`, `PrimaryCTA`, `ShareCalculatorResult`,
  `Breadcrumb`, `CalculatorTrustBadge`, `NextSteps`, `CalculatorHero` (todos de
  `@/components/...`). Replica este stack.
- El registro del portafolio es `src/config/calculatorPortfolio.ts`. Su test
  `tests/application/CalculatorPortfolio.test.ts:13` asegura
  `expect(CALCULATOR_PORTFOLIO).toHaveLength(19);`. **No lo cambiarás.**
- `check:catalog-drift` (`scripts/check-catalog-drift.mjs`) valida
  artículos→guías, NO páginas de calculadora, así que una calculadora sin
  registrar no lo rompe.

## La matemática del IVA (toda la lógica de dominio)

Tasa IVA Chile = **19%** (fijada por ley). Dos direcciones:

- **neto → bruto**: `iva = round(neto * 0.19)`; `bruto = neto + iva`.
- **bruto → neto**: `neto = round(bruto / 1.19)`; `iva = bruto - neto`.

Redondea a pesos enteros (el CLP no tiene decimales). Define la tasa como
constante nombrada (`const IVA_RATE_PERCENT = 19;`) — no esparzas literales
`0.19`/`1.19`.

## Comandos que vas a necesitar

| Propósito | Comando | Esperado al éxito |
|-----------|---------|-------------------|
| Typecheck | `npx astro check` | `0 errors` |
| Test unitario | `npx vitest run tests/application/CalculateIva.test.ts` | todos pasan |
| Test completo | `npx vitest run tests/` | todos pasan (incl. el test de 19 sin cambiar) |

## Alcance

**En alcance** (solo crear):
- `src/application/use-cases/CalculateIva.ts`
- `tests/application/CalculateIva.test.ts`
- `src/pages/calculadoras/iva.astro`

**Fuera de alcance** (NO tocar):
- `src/config/calculatorPortfolio.ts` — registrar = publicar. SOLO HUMANO,
  post-visto-bueno. Deja el portafolio en 19 entradas.
- `tests/application/CalculatorPortfolio.test.ts` — debe seguir asegurando 19.
- Navegación, footer shortcuts, config de sitemap, cualquier guía/hub.
- Cualquier markdown de blog/guía — escribir prosa de asesoría financiera es
  trabajo editorial.

## Flujo git

- Rama: `advisor/025-iva-calculator`
- Estilo conventional commits; p. ej. `feat(calc): motor y página IVA (sin publicar)`.
- NO hacer push ni abrir PR salvo que el operador lo indique.

## Pasos

### Paso 1: Escribir el motor puro

Crea `src/application/use-cases/CalculateIva.ts` siguiendo la forma de
`CalculateCompoundInterest.ts`: un `CalculateIvaInput`
(`{ amount: number; direction: "neto-a-bruto" | "bruto-a-neto" }`), un
`CalculateIvaOutput`
(`{ neto: number; iva: number; bruto: number; ivaRatePercent: number }`), un
`assertInput` que lance ante `amount` no finito o no positivo, y un
`calculateIva(input): CalculateIvaOutput` que aplique la matemática de arriba con
redondeo a pesos enteros y `IVA_RATE_PERCENT = 19`.

**Verifica**: `npx astro check` → `0 errors`.

### Paso 2: Test unitario del motor

Crea `tests/application/CalculateIva.test.ts`, modelado según
`tests/application/CalculateCompoundInterest.test.ts`. Cubre como mínimo:
- neto→bruto: `amount: 1_000_000` → `iva: 190000`, `bruto: 1190000`.
- bruto→neto: `amount: 1_190_000` → `neto: 1000000`, `iva: 190000`.
- redondeo: `amount: 999` neto→bruto → `iva: 190` (round de 189,81), `bruto: 1189`.
- `assertInput` lanza para `amount: 0`, negativo y `NaN`.
- `ivaRatePercent` es `19` en la salida.

**Verifica**: `npx vitest run tests/application/CalculateIva.test.ts` → todos pasan.

### Paso 3: Construir la página (replicando el ejemplar)

Crea `src/pages/calculadoras/iva.astro` copiando la *estructura* de
`src/pages/calculadoras/conversor-utm.astro`: mismo stack de componentes
importados, misma disposición de
`Layout`/`Header`/`Breadcrumb`/`CalculatorHero`/`MethodologyBlock`/`Footer`,
mismo enfoque de cálculo del lado del cliente (el cálculo corre en el navegador;
no se envían datos al servidor — es invariante del sitio). Cablea las dos
entradas (monto, toggle de dirección) a `calculateIva` y renderiza
neto / IVA / bruto.

Para todo texto explicativo:
- La tasa de IVA, la fórmula y el SII como fuente legal son **factuales** y
  pueden afirmarse llanamente (tasa = 19%, fuente = Servicio de Impuestos
  Internos).
- Reutiliza el patrón de disclaimer/metodología **existente** de
  `conversor-utm.astro` verbatim en estructura — NO inventes asesoría financiera,
  recomendaciones ni orientación sobre qué "debería" hacer el usuario.
- NO afirmes que la herramienta fue revisada/aprobada por nadie.

**Verifica**: `npx astro check` → `0 errors`.

### Paso 4: Confirmar que está construida pero NO publicada

**Verifica**:
- `npx vitest run tests/` → todos pasan, y
  `tests/application/CalculatorPortfolio.test.ts` sigue asegurando 19 (no la
  registraste).
- `grep -c "iva" src/config/calculatorPortfolio.ts` → `0` (o sin entrada IVA).

## Plan de pruebas

- `tests/application/CalculateIva.test.ts` — los casos del Paso 2 (happy paths en
  ambas direcciones, borde de redondeo, guards de entrada inválida, exposición de
  la tasa).
- Patrón fuente: `tests/application/CalculateCompoundInterest.test.ts`.
- La suite completa debe seguir verde con el portafolio aún en 19.

## Criterios de hecho

TODOS deben cumplirse:

- [ ] `src/application/use-cases/CalculateIva.ts` existe; `calculateIva` es una
      función pura con guard `assertInput`.
- [ ] `npx vitest run tests/application/CalculateIva.test.ts` pasa (≥6 casos).
- [ ] `src/pages/calculadoras/iva.astro` existe y typechequea
      (`npx astro check` → `0 errors`).
- [ ] `npx vitest run tests/` pasa; el test del portafolio sigue esperando 19.
- [ ] La calculadora NO está en `calculatorPortfolio.ts` y NO está enlazada en
      navegación.
- [ ] No se modifican archivos fuera del alcance (`git status`).
- [ ] Fila de estado en `plans/README.md` actualizada Y tu informe declara
      explícitamente "construida pero sin publicar — pendiente de visto bueno
      editorial antes de registrar en el portafolio".

## Condiciones de STOP

Detente e informa (no improvises) si:

- Te tienta registrar la calculadora en `calculatorPortfolio.ts`, agregarla a
  navegación o cambiar el test de conteo del portafolio. Ese es el paso humano de
  publicación — DETENTE y devuelve.
- La estructura del ejemplar `conversor-utm.astro` derivó tanto que tendrías que
  inventar prosa de asesoría financiera nueva para que la página sea coherente.
- La tasa de IVA ya no parece ser 19% según fuente primaria — DETENTE e informa
  (un cambio de tasa es un evento legal que necesita confirmación humana).
- `npx astro check` reporta errores que no puedes resolver en alcance tras dos
  intentos.

## Notas de mantenimiento

- **Publicación (humano, post-visto-bueno)**: tras revisar el texto de
  metodología/disclaimer, un mantenedor (a) agrega la entrada IVA a
  `CALCULATOR_PORTFOLIO` en `src/config/calculatorPortfolio.ts` en la familia más
  adecuada (probablemente `ingresos` o un nuevo grupo tributario), (b) sube la
  aserción `toHaveLength(19)` en `tests/application/CalculatorPortfolio.test.ts` a
  20, y (c) verifica que la página aparezca en el hub de calculadoras y en el
  sitemap.
- `IVA_RATE_PERCENT` es constante legal gestionada; si Chile cambia la tasa de
  IVA, actualiza la única constante y las expectativas del test.
- Un revisor debe escrutar: dirección de redondeo (pesos enteros), que ningún
  dato del usuario salga del navegador, y que el texto explicativo no haga
  afirmaciones de asesoría tributaria personalizada.
