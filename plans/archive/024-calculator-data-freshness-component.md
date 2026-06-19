# Plan 024: Estandarizar la vigencia de datos de las calculadoras en un componente compartido

> **Instrucciones para el ejecutor**: sigue este plan paso a paso. Ejecuta cada
> comando de verificación y confirma el resultado esperado antes de pasar al
> siguiente paso. Si ocurre algo de la sección "Condiciones de STOP", detente e
> informa — no improvises. Al terminar, actualiza la fila de estado de este plan
> en `plans/README.md`.
>
> **Chequeo de deriva (córrelo primero)**:
> `git diff --stat fd2b5dff..HEAD -- src/pages/calculadoras/ src/components/calculator/ src/domain/economic/`
> Si algún archivo en alcance cambió desde que se escribió este plan, compara los
> extractos de "Estado actual" contra el código vivo antes de continuar; ante una
> discrepancia, trátalo como condición de STOP.

## Estado

- **Prioridad**: P1
- **Esfuerzo**: M
- **Riesgo**: LOW
- **Depende de**: ninguno
- **Categoría**: tech-debt
- **Planificado en**: commit `fd2b5dff`, 2026-06-17

## Por qué importa

Las dos auditorías en `docs/latest_audits/` coinciden en que el "control de
vigencia de parámetros" es la mejora de confianza de mayor impacto y menor
esfuerzo para un sitio financiero (YMYL): cada calculadora que usa un valor
económico vivo debe mostrar, de forma consistente y honesta, **qué** valor usó y
**con qué fecha**. Hoy esa lógica está **copiada en 11 de las 19 páginas de
calculadora** con texto ligeramente distinto, y 8 calculadoras no muestran nada.
Un bug reciente (sueldo mínimo obsoleto hardcodeado en $500.000) fue exactamente
esta clase de problema. Un único componente compartido (a) elimina ~40 líneas de
duplicación por página, (b) garantiza que todas las calculadoras presenten la
vigencia igual y (c) hace imposible publicar una calculadora que omita en
silencio la procedencia de sus datos.

Este plan NO cambia ningún número mostrado ni ningún *texto* de metodología.
Extrae a un componente y un helper testeado la presentación repetida de "qué
fuente / qué fecha". Es una refactorización pura + consistencia.

## Estado actual

El bloque repetido vive en el frontmatter de cada página de calculadora. Ejemplo
canónico — `src/pages/calculadoras/conversor-utm.astro:17-48`:

```astro
const { parameters: economicParameters } = await getEconomicParameters();
// ...
const utmLastUpdated = resolveEconomicIndicatorDate(economicParameters, "utm");
const economicSourceLabel =
  economicParameters.source === "live"
    ? "dato en línea"
    : economicParameters.source === "snapshot"
      ? "dato de referencia"
      : "fallback de emergencia";
const economicSourceMeta =
  economicParameters.source === "live"
    ? { bannerText: "Consulta en línea a mindicador.cl", methodologyNote: "El valor UTM se consulta en línea ..." }
    : economicParameters.source === "snapshot"
      ? { bannerText: "Snapshot económico del sitio", methodologyNote: "El valor UTM mostrado proviene del snapshot ..." }
      : { bannerText: "Valor de respaldo interno del sitio", methodologyNote: "El valor UTM mostrado corresponde al valor de respaldo ..." };
const utmDateDisplay = new Intl.DateTimeFormat("es-CL", { dateStyle: "long", timeZone: "UTC" })
  .format(new Date(`${utmLastUpdated}T00:00:00.000Z`));
```

Hechos que necesitas:

- El patrón `economicSourceLabel` / `economicSourceMeta` (o el ternario inline
  `source === "live" ? ... : ...`) aparece en estos **11** archivos (confírmalo
  con el grep del Paso 0), todos bajo `src/pages/calculadoras/`:
  `conversor-utm`, `conversor-uf`, `reajuste-arriendo`, `operacion-renta`,
  `simulador-jubilacion`, `simulador-renegociacion`, `impuesto-segunda-categoria`,
  `sueldo-liquido`, `seguro-cesantia`, `apv`, `prepago-credito`.
- `economicParameters.source` está tipado `"live" | "snapshot" | "fallback"` en
  `src/domain/economic/EconomicParameters.ts:41`.
- El helper de fecha ya existe:
  `resolveEconomicIndicatorDate(parameters, indicatorKey)` en
  `src/domain/economic/EconomicParameters.ts:66-74`. `indicatorKey` es uno de
  `"uf" | "utm" | "uta" | "ipc" | "tmc" | "dolar"`.
- `immEffectiveDate` (una fecha legal gestionada, que NO es un
  `EconomicIndicatorKey`) se agregó en el commit `fd2b5dff`; vive en
  `EconomicParameters.immEffectiveDate`. Las calculadoras que muestran el IMM
  (sueldo mínimo) — hoy solo `sueldo-liquido` — deben mostrar ESA fecha para el
  IMM, nunca la fecha del snapshot de mindicador.
- Los componentes propios de calculadora viven en `src/components/calculator/`
  (p. ej. `CalculatorHero.astro`). Usa esa ubicación y el estilo `.astro`.
- El *texto* `methodologyNote` / `bannerText` difiere por calculadora (nombra el
  indicador específico). **Conserva el texto de cada página** — no unifiques la
  redacción. Solo se estandariza el mapeo `source`→`label`, el formateo de fecha
  y el *markup* del banner de vigencia.

## Comandos que vas a necesitar

| Propósito | Comando | Esperado al éxito |
|-----------|---------|-------------------|
| Typecheck | `npx astro check` | `0 errors` |
| Test unitario | `npx vitest run <archivo>` | todos pasan |
| Test completo | `npx vitest run tests/` | todos pasan |
| Grep | `grep -rln "economicSourceLabel\|economicSourceMeta" src/pages/calculadoras/` | lista archivos |

NO corras `pnpm run build` (ejecuta chequeos de URLs e imágenes ajenos a este
cambio que pueden fallar por entorno). `npx astro check` es la compuerta de
typecheck autoritativa aquí.

## Alcance

**En alcance** (los únicos archivos que puedes modificar o crear):
- `src/domain/economic/economicSourcePresentation.ts` (crear — helper puro)
- `tests/domain/economicSourcePresentation.test.ts` (crear — test unitario)
- `src/components/calculator/CalculatorDataFreshness.astro` (crear — UI)
- Las 11 páginas de calculadora listadas arriba, bajo `src/pages/calculadoras/`

**Fuera de alcance** (NO tocar):
- Cualquier valor numérico mostrado o cualquier texto `methodologyNote`.
- `src/domain/economic/EconomicParameters.ts` y
  `src/infrastructure/economic/EconomicParameterProvider.ts` — la capa de datos
  es correcta; solo se centraliza su *presentación*.
- Las 8 calculadoras que hoy no muestran bloque de vigencia
  (`boleta-honorarios-liquido`, `comisiones-afp`, `credito-consumo`,
  `deposito-a-plazo`, `dividendo-hipotecario`, `finiquito-indemnizacion`,
  `interes-compuesto`, `tarjeta-credito`). Agregarles vigencia es una decisión
  aparte (ver Notas de mantenimiento); no expandas el alcance.

## Flujo git

- Rama: `advisor/024-calculator-data-freshness`
- Estilo conventional commits (ver `git log --oneline -5`); p. ej.
  `refactor(calc): centralizar presentación de vigencia de datos económicos`.
- NO hacer push ni abrir PR salvo que el operador lo indique.

## Pasos

### Paso 0: Confirmar el conjunto de duplicación

Corre `grep -rln "economicSourceLabel\|economicSourceMeta" src/pages/calculadoras/`
y `grep -rln "source === \"live\"" src/pages/calculadoras/`. Confirma que la
unión coincide con los 11 archivos listados en "Estado actual". Si falta o sobra
un archivo, es señal de deriva — relee la página afectada antes de refactorizarla.

**Verifica**: los dos greps juntos listan exactamente los 11 archivos nombrados.

### Paso 1: Crear el helper de presentación puro

Crea `src/domain/economic/economicSourcePresentation.ts` exportando una función
pura que mapea un `source` económico a su etiqueta corta. Forma objetivo:

```ts
import type { EconomicParameters } from "./EconomicParameters";

export type EconomicSourceLabel =
  | "dato en línea"
  | "dato de referencia"
  | "fallback de emergencia";

export function resolveEconomicSourceLabel(
  source: EconomicParameters["source"]
): EconomicSourceLabel {
  switch (source) {
    case "live":
      return "dato en línea";
    case "snapshot":
      return "dato de referencia";
    case "fallback":
      return "fallback de emergencia";
  }
}

/** Formatea una fecha ISO (YYYY-MM-DD) como fecha larga chilena en UTC. */
export function formatEconomicDate(isoDate: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00.000Z`));
}
```

Conserva exactamente las cadenas de etiqueta de arriba — deben coincidir verbatim
con las actuales por página para que no cambie ningún texto visible.

**Verifica**: `npx astro check` → `0 errors`.

### Paso 2: Test unitario del helper

Crea `tests/domain/economicSourcePresentation.test.ts`. Modela su estructura
según un test de dominio existente como `tests/domain/EconomicParameters.test.ts`.
Cubre: cada uno de los tres valores de `source` mapea a la etiqueta correcta; y
`formatEconomicDate("2026-05-01")` devuelve un string que contiene `"2026"` y
`"mayo"` (estable por zona horaria porque fija UTC).

**Verifica**: `npx vitest run tests/domain/economicSourcePresentation.test.ts` →
todos pasan (≥4 aserciones).

### Paso 3: Crear el componente de vigencia

Crea `src/components/calculator/CalculatorDataFreshness.astro`. Renderiza el
banner estandarizado de vigencia. Props:

```ts
interface Props {
  source: "live" | "snapshot" | "fallback";
  /** Fecha larga ya formateada, p. ej. "1 de mayo de 2026". */
  updatedDate: string;
  /** Texto de banner propio de la página (conserva la redacción actual). */
  bannerText: string;
}
```

En el componente, llama a `resolveEconomicSourceLabel(source)` para la etiqueta
corta. Renderiza el mismo markup que hoy renderizan las páginas (una línea/insignia
con etiqueta + `updatedDate` + `bannerText`). Replica la estructura visual de la
línea de vigencia en `src/pages/calculadoras/conversor-utm.astro` — ábrelo y
reproduce sus clases de contenedor para que la salida sea visualmente idéntica.

**Verifica**: `npx astro check` → `0 errors`.

### Paso 4: Migrar las 11 páginas — una a una

Para CADA uno de los 11 archivos, en este orden (más simple primero):
`conversor-utm`, `conversor-uf`, `reajuste-arriendo`, `impuesto-segunda-categoria`,
`prepago-credito`, `seguro-cesantia`, `operacion-renta`, `simulador-renegociacion`,
`apv`, `simulador-jubilacion`, `sueldo-liquido`.

En cada página:
1. Reemplaza la derivación inline de `economicSourceLabel` / `economicSourceMeta`
   por: importar `resolveEconomicSourceLabel`, `formatEconomicDate` desde
   `@/domain/economic/economicSourcePresentation`; sigue computando el
   `bannerText` y el `methodologyNote` propios de la página (el `methodologyNote`
   alimenta `MethodologyBlock` — déjalo intacto).
2. Reemplaza el formateo de fecha inline (`new Intl.DateTimeFormat(...)`) por
   `formatEconomicDate(<laFechaIsoDeEsaPágina>)`.
3. Reemplaza la línea de vigencia renderizada a mano por
   `<CalculatorDataFreshness source={economicParameters.source}
   updatedDate={formatEconomicDate(...)} bannerText={...} />`.

Después de cada archivo: corre `npx astro check`. No pases al siguiente archivo
hasta que devuelva `0 errors`.

**Caso especial — `sueldo-liquido.astro`**: muestra el IMM (sueldo mínimo). Para
la línea del IMM específicamente, la fecha relevante es
`economicParameters.immEffectiveDate` (fecha legal de vigencia), NO una fecha de
indicador de mindicador. Si la página hoy muestra el IMM con `lastUpdated` del
snapshot, cambia esa única línea a
`formatEconomicDate(economicParameters.immEffectiveDate)`. Si `immEffectiveDate`
estuviera ausente en runtime, cae a la fecha existente y anótalo en tu informe —
NO lances excepción.

**Verifica (por archivo)**: `npx astro check` → `0 errors`.

### Paso 5: Confirmar que no queda duplicación

**Verifica**:
`grep -rln "economicSourceMeta" src/pages/calculadoras/` → sin coincidencias
(los strings `methodologyNote` propios pueden quedar inline; solo se centraliza
la derivación de source/label/fecha).

## Plan de pruebas

- Nuevo archivo `tests/domain/economicSourcePresentation.test.ts`:
  - mapeo de etiqueta para `"live"`, `"snapshot"`, `"fallback"` (3 casos);
  - `formatEconomicDate` devuelve fecha larga chilena estable en UTC (1 caso).
  - Patrón a seguir: `tests/domain/EconomicParameters.test.ts`.
- Corre la suite completa para asegurar que ningún test de calculadora regresó:
  `npx vitest run tests/` → todos pasan (línea base al planificar: 729 pasando;
  esperado 729 + tus casos nuevos).

## Criterios de hecho

TODOS deben cumplirse:

- [ ] `npx astro check` termina con `0 errors`
- [ ] `npx vitest run tests/` pasa, incluyendo los tests nuevos de
      `economicSourcePresentation`
- [ ] `grep -rln "economicSourceMeta" src/pages/calculadoras/` no devuelve nada
- [ ] `src/components/calculator/CalculatorDataFreshness.astro` existe y lo
      importan las 11 páginas listadas
      (`grep -rln "CalculatorDataFreshness" src/pages/calculadoras/ | wc -l` → `11`)
- [ ] No se modifican archivos fuera de la lista de alcance (`git status`)
- [ ] Fila de estado en `plans/README.md` actualizada

## Condiciones de STOP

Detente e informa (no improvises) si:

- El grep del Paso 0 encuentra un número de archivos materialmente distinto de 11
  (el código derivó desde que se escribió este plan).
- La redacción de vigencia o la salida numérica de alguna calculadora tendría que
  cambiar para encajar en el componente — el objetivo es salida visible idéntica
  byte a byte salvo la corrección de la fecha del IMM en `sueldo-liquido`. Si no
  puedes conservar el texto exacto vía el prop `bannerText`, DETENTE.
- `npx astro check` reporta errores que no puedes resolver dentro del alcance
  tras dos intentos.
- Descubres que una calculadora deriva su fecha de algo distinto a
  `resolveEconomicIndicatorDate` / `lastUpdated` / `immEffectiveDate`.

## Notas de mantenimiento

- Para el revisor: confirma que el banner de vigencia se ve idéntico en 2–3
  páginas migradas (p. ej. `/calculadoras/conversor-utm/` y
  `/calculadoras/sueldo-liquido/`), y que `sueldo-liquido` muestra la fecha del
  IMM como su fecha legal de vigencia, no la del snapshot.
- Diferido a propósito: agregar el banner a las 8 calculadoras que no lo tienen.
  Una vez exista este componente, será un seguimiento trivial — pero si cada una
  *debe* mostrar vigencia depende de si consume un valor económico volátil, lo
  cual es una decisión editorial.
- Relación con los planes de diseño 017/019 (`CalculatorShell`): aquel shell
  absorbe la duplicación de "próximos pasos"; este componente es más estrecho
  (procedencia de datos). No se solapan; si más adelante se activa el shell,
  puede componer este componente.
- Cualquier valor `source` futuro agregado a la unión en `EconomicParameters.ts`
  debe manejarse también en `resolveEconomicSourceLabel` (el `switch` es
  exhaustivo, así que `astro check` fallará fuerte — es lo buscado).
