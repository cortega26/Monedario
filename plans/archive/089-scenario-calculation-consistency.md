# Plan 089: Guardar escenarios correspondientes a un cálculo válido completo

> **Ejecutor:** este archivo es la especificación completa. Sigue decisiones,
> alcance y verificaciones; registra evidencia real. No necesitas la conversación
> ni leer otros planes para ejecutar. La implementación empieza con el baseline.
>
> **Drift check:** `git diff --stat db9d07c8..HEAD -- src/pages/calculadoras/credito-consumo.astro src/pages/calculadoras/deposito-a-plazo.astro src/pages/calculadoras/dividendo-hipotecario.astro src/pages/calculadoras/interes-compuesto.astro src/pages/calculadoras/simulador-jubilacion.astro src/pages/calculadoras/tarjeta-credito.astro src/utils/sueldo-liquido/formController.ts tests/accessibility/calculator-scenario-consistency.test.ts`
> Examina también `git diff --` y `git diff --cached --` sobre esos paths para
> detectar cambios locales. Si hay drift material, compara los extractos y
> reconcilia la especificación antes de editar; no sobrescribas trabajo ajeno.

## Status

- **Priority:** P1
- **Effort:** M–L (incluye pruebas y cierre)
- **Risk:** MED
- **Depends on:** ninguno; 087 es orden recomendado, no requisito funcional
- **Category:** bug / tests
- **Planned at:** commit `db9d07c8`, 2026-09-06
- **Estado:** TODO — seleccionado por el usuario: «Todos los net-positive»
- **Origen:** hallazgo 2 de la auditoría; hechos relevantes incluidos abajo

## Por qué importa y decisión

Hoy guardar después de editar un monto combina entradas actuales con el resultado
anterior. En depósito a plazo, calcular 1000000, editar a 2000000 y guardar puede
conservar el monto de dos millones con el resumen del cálculo de un millón.
Restaurar luego produce otro resultado. El defecto afecta siete adaptadores.

Decisión: guardar siempre el último cálculo completado con éxito, junto con las
entradas que lo produjeron. Editar el formulario no cambia esa captura. Empezar
un nuevo intento invalida su elegibilidad hasta que ese intento termine bien;
un intento inválido o fallido no permite guardar un par mezclado. No recalcular
implícitamente al guardar, no cambiar fórmulas ni esquema de localStorage.
El beneficio justifica M–L por las siete integraciones; limitarse a una corrección
local repetida, sin refactor general del controlador de sueldo.

## Estado actual y convenciones

`src/utils/calculatorScenariosUI.ts:288–298` (referencia, fuera de escritura):

```ts
const inputs = options.readInputs();
const summary = options.buildSummary();
if (!inputs || !summary || summary.length === 0) {
  showFeedback("No se pudo guardar: realiza un cálculo válido primero.");
  closeNameForm();
  return;
}
saveScenario(calculatorId, { name: nameInput.value, inputs, summary });
```

El adaptador de `deposito-a-plazo.astro:586–599` combina:

```ts
readInputs: () => snapshotInputs(scenarioFormCard),
// ...
buildSummary: () => {
  if (!scenarioLastResult) return null;
  const r = scenarioLastResult;
  return [
    { label: "Monto al vencimiento", value: fmt(r.finalAmount) },
    { label: "Interés bruto", value: fmt(r.grossInterest) },
    { label: "Interés neto", value: fmt(r.netInterest) },
  ];
},
```

`scenarioLastResult` se asigna en las líneas aproximadas 472 (consumo), 552
(depósito), 594 (hipotecario), 605 (interés), 461 (jubilación) y 350 (tarjeta).
En sueldo son `lastResultado` y `lastOtrosDescuentos`: dos ramas de éxito,
`formController.ts:273` y `:381`, adaptador en `:701–727`.

`monedario_scenarios` guarda inputs como `Record<string,string>` y summary como
filas label/value. `snapshotInputs` ya copia inputs/selects, radios y checkboxes;
reusarlo. No modificar esa utilidad ni la API `ScenarioPanelOptions` para este fix.
Las pruebas de I/O existentes no cubren el flujo temporal. Seguir el patrón real
Playwright de `tests/accessibility/utm-utility-led.test.ts`: navegar, llenar,
interceptar analytics local, actuar sobre DOM y esperar condiciones visibles.
`playwright.config.ts` descubre `tests/accessibility` e inicia preview en 4321.

## Pasos específicos

1. Baseline común; build y suite actual de controles antes de editar.
   **Verificar:** `pnpm run build` y
   `pnpm exec playwright test tests/accessibility/calculator-semantics.test.ts`
   → exit 0. No actualizar snapshots/versionar artefactos ajenos si el build los
   genera; cualquier fallo del baseline se diagnostica antes de atribuirlo al fix.
2. En cada adaptador mantener una captura local de inputs válida o `null`.
   Invalidarla al iniciar un intento y capturar los inputs candidatos al mismo
   tiempo que se leen los valores del cálculo, antes de cualquier `await`.
   Publicar la captura únicamente después de completar el resultado/renderizado
   exitoso. El adaptador `readInputs` devuelve una copia de esa captura, nunca
   una lectura del formulario vivo. `buildSummary` devuelve null cuando no hay
   captura válida, incluso si queda una variable de resultado anterior.
   En sueldo incluir las dos ramas y el valor de otros descuentos correspondiente;
   no sobrescribir una captura con inputs editados durante una espera.
   **Verificar:** `pnpm run astro check` y
   `pnpm exec vitest run tests/unit/calculator-controllers-scenario-io.test.ts tests/integration/calculatorScenarios.test.ts`
   → exit 0.
3. Crear pruebas Playwright de comportamiento en el archivo declarado. Usar una
   tabla con las siete rutas existentes, inputs válidos tomados de sus ejemplos
   y un campo significativo para editar. Capturar el input válido antes de
   calcular; guardar A, editar sin recalcular y guardar B. Los inputs y summaries
   de A/B deben coincidir, ignorando nombre/id/ts; al calcular de nuevo C debe
   reflejar las entradas nuevas. Evaluar storage local solo como evidencia del
   resultado de clicks reales, no insertar resultados prefabricados.
   Añadir los casos de fallo/inicio vacío, restauración y ambos modos de sueldo.
   **Verificar:** `pnpm run build` seguido de
   `pnpm exec playwright test tests/accessibility/calculator-scenario-consistency.test.ts`
   → exit 0, casos sobre siete calculadoras y dos modos de sueldo.
4. Cierre común más `pnpm run check:boundaries` y suite Playwright completa
   (`pnpm exec playwright test`) sobre ese mismo build, sin reconstruirlo si no
   cambió código. **Verificar:** exit 0; rutas, copy editorial, eventos y fórmulas
   sin cambios.

## Pruebas de aceptación adicionales

- Guardar antes de un cálculo válido no añade storage.
- Calcular A, editar a B y guardar conserva A/A; recalcular y guardar produce B/B.
- Intento inválido después de A no guarda una entrada incoherente.
- Durante una espera del controlador, editar no sustituye los inputs candidatos
  que originaron el resultado; sin sleeps arbitrarios, usar señales controlables.
- Restaurar A rellena A y recalcula con mismos parámetros; comparación es coherente.
- Sueldo bruto→líquido con otros descuentos y líquido→bruto: summaries e inputs
  se corresponden; radio, select y checkbox sobreviven la captura.
- No garantizar igualdad de resultados entre días con otros valores económicos;
  la invariancia exigida aquí mantiene fijo el contexto económico del build.

## Alcance de implementación

Solo se pueden editar estos archivos de producto/tests/documentación:

- `src/pages/calculadoras/credito-consumo.astro`
- `src/pages/calculadoras/deposito-a-plazo.astro`
- `src/pages/calculadoras/dividendo-hipotecario.astro`
- `src/pages/calculadoras/interes-compuesto.astro`
- `src/pages/calculadoras/simulador-jubilacion.astro`
- `src/pages/calculadoras/tarjeta-credito.astro`
- `src/utils/sueldo-liquido/formController.ts`
- `tests/accessibility/calculator-scenario-consistency.test.ts` (crear)

Metadatos de ejecución permitidos: este plan, `plans/README.md` y `todo.md`
temporal (retirar al cierre). Si corresponde cierre/archivo, este mismo plan
puede moverse a `plans/archive/089-scenario-calculation-consistency.md` y actualizar `plans/archive/README.md`.
No reconstruir el historial de otros planes. No crear `spec.md`: este plan ya
cumple esa función conforme a AGENT_EXECUTION_PROTOCOL §2.14.

Fuera de alcance: cualquier otro archivo, contenido `src/data/`, fórmulas ajenas,
URLs/slugs/RSS, nuevas superficies indexables, secretos, dependencias, lockfiles,
configuración de cuentas y cambios no vinculados al defecto. Los archivos usados
como ejemplos y no listados arriba son referencias de lectura, no permiso de edición.

## Autoridad y contratos

Aplicar Constitución > AGENTS > context > código. Constitución §1 exige alcance
mínimo y compatibilidad; §2 mantiene pureza del dominio y aislamiento de I/O;
§5 exige pruebas de comportamiento; §9 exige ADR en cambios arquitectónicos.
Preservar `URL.PUBLIC.NO_POST_ID`, rutas y freeze utility-led hasta 2026-11-02.
No datos financieros personales en analytics ni logs. `no-console` rige en src;
Workers/scripts tienen la excepción existente. Node 22, pnpm, TypeScript estricto;
dobles comillas y estilo local. No refactors de oportunidad ni tests eliminados.

## Comandos y procedencia

| Propósito | Comando | Procedencia | Resultado esperado |
| --- | --- | --- | --- |
| Toolchain | `node --version` y `pnpm --version` | executed | Auditor: Node 24.19.0, pnpm 11.7.0; ejecutor usar Node 22 del repo |
| Dependencias si faltan | `pnpm install --frozen-lockfile` | declared | exit 0, lockfile intacto; omitir si ya están |
| Tests globales | `pnpm run test` | executed | exit 0; baseline 1438 tests en 162 archivos |
| Cobertura de referencia | `pnpm run test:coverage --coverage.reportsDirectory=/tmp/monedario-improve-coverage` | executed | exit 0; baseline 91,81% líneas, no rebajar 80% |
| Lint | `pnpm run lint` | declared | exit 0 |
| Formato global | `pnpm run format:check` | declared | exit 0, sin formatear archivos ajenos |
| Espejo CI | `pnpm run check:ci` | declared | exit 0; no equivale a build ni todos los gates postbuild |
| Documentación | `pnpm run check:docs` | executed | exit 0 (729 Markdown, 44 ADR al planificar) |

`executed` corresponde a la auditoría del 2026-09-06, no al arreglo futuro. El
baseline ejecutado fue en Node 24; reproducir en Node 22. La primera corrida
sandbox bloqueó subprocesos con EPERM; al autorizarlos pasó sin cambios de código.
Diagnosticar capacidad del entorno antes de atribuir esos errores al repositorio.
Los comandos adicionales de pasos/tests son `declared` salvo indicación explícita.
Un archivo nuevo de test no forma parte del baseline: se ejecuta después de crearlo.

## Baseline y prueba focal

Antes de modificar: drift check, tests existentes relevantes, tests globales y
gates declarados pertinentes. Si aparece un fallo, registrar comando/error,
distinguir sandbox, datos temporales y drift de un defecto nuevo; no editar
fuera de alcance ni declarar verificación exitosa por inferencia.

Prueba focal después del cambio: `pnpm exec vitest run tests/unit/calculator-controllers-scenario-io.test.ts tests/integration/calculatorScenarios.test.ts` → exit 0.

Pruebas Playwright del flujo real en siete páginas, regresión de I/O existente y ambos modos sueldo. No añadir tests de texto que solo busquen nombres de variables.

## Criterios de terminado

- [ ] Casos de aceptación de este plan ejecutados; el caso del defecto discrimina
      el código anterior del corregido, con comando y salida registrados.
- [ ] Prueba focal, `pnpm run lint`, `pnpm run format:check`, `pnpm run test` y
      `pnpm run check:ci` salen 0; gates adicionales de los pasos también pasan.
- [ ] Diff limitado al alcance, usando `git diff --name-only db9d07c8..HEAD`
      para commits y `git diff --name-only`/`git diff --cached --name-only` para
      trabajo local. Si aterrizaron cambios ajenos desde db9d07c8, usar el
      merge-base de la rama ejecutora contra main para separar responsabilidades.
- [ ] Registro de control de cambios de abajo completado con evidencia, riesgo
      residual y rollback; `todo.md` retirado y fila del índice actualizada.
- [ ] No marcar DONE/desplegado si falta un requisito. Al cerrar realmente,
      archivar plan y actualizar índices en la misma unidad, según política repo.

## Condiciones de STOP

- Un consumidor requiere cambiar almacenamiento o cálculos para guardar una captura; existe otro adaptador afectado fuera de los siete; no se puede probar captura antes de awaits; el build requiere cambiar contenido o baselines ajenos. Reportar el alcance real en vez de arreglar solo una página.
- Conflicto constitucional, drift material sin resolver, necesidad de editar
  fuera de alcance o imposibilidad de demostrar una aceptación crítica.
- No ampliar permisos/tipos/dependencias ni relajar gates para eludir un fallo.
  Registrar la carencia concreta de capacidad y resolverla dentro del alcance
  autorizado, o reportarla; no repetir el mismo intento sin nueva evidencia.

## Git, mantenimiento y rollback

Rama sugerida: `advisor/089-scenario-calculation-consistency`. Commits convencionales, por ejemplo
`fix(scope): describir el comportamiento corregido` o `test(ci): activar cobertura`.
Una autorización de implementación futura se interpreta según ese encargo; este
plan no añade autorización de push, PR, merge ni deploy por sí solo.

Rollback: Revertir las siete integraciones y su prueba E2E como una unidad. No borrar escenarios almacenados: no puede inferirse cuáles eran coherentes antes del fix.

Mantenimiento: revisar que futuros consumidores mantengan los casos de aceptación
anotados; este plan no obliga a reconstruir pruebas por cambios de estilo.

## Registro de control de cambios — completar al ejecutar

- Estado de implementación y commit(s): pendiente.
- Baseline real (Node, pnpm/Python, comandos y salidas): pendiente.
- Cambios y correspondencia con el alcance: pendiente.
- Evidencia de aceptación y gates: pendiente.
- Riesgo residual y rollback probado/documentado: pendiente.
- Despliegue (cuando aplique), revisión y actualización del índice: pendiente.
