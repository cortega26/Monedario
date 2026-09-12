# Plan 088: Preservar números nativos al persistir el perfil

> **Ejecutor:** este archivo es la especificación completa. Sigue decisiones,
> alcance y verificaciones; registra evidencia real. No necesitas la conversación
> ni leer otros planes para ejecutar. La implementación empieza con el baseline.
>
> **Drift check:** `git diff --stat db9d07c8..HEAD -- src/scripts/calculator-prefill.ts tests/integration/calculator-prefill.test.ts`
> Examina también `git diff --` y `git diff --cached --` sobre esos paths para
> detectar cambios locales. Si hay drift material, compara los extractos y
> reconcilia la especificación antes de editar; no sobrescribas trabajo ajeno.

## Status

- **Priority:** P1
- **Effort:** S (incluye pruebas y cierre)
- **Risk:** MED
- **Depends on:** ninguno; 087 es orden recomendado, no requisito funcional
- **Category:** bug
- **Planned at:** commit `db9d07c8`, 2026-09-06
- **Estado:** TODO — seleccionado por el usuario: «Todos los net-positive»
- **Origen:** hallazgo 1 de la auditoría; hechos relevantes incluidos abajo

## Por qué importa y decisión

El perfil transforma un decimal nativo `2.5` en `25` y `1.5e6` en `15000000`.
Guardar y reusar el input puede cambiar su magnitud. Corregiremos únicamente la
lectura de inputs `type="number"`, manteniendo el parser actual de texto chileno.
No es una reforma de formatos ni una migración de perfiles; una cifra guardada
como 25 no contiene evidencia suficiente para inferir si debía ser 2.5.

## Estado actual y convenciones

`src/scripts/calculator-prefill.ts:30–46`:

```ts
if (raw === "") return undefined;
if (NUMERIC_FIELDS.has(field)) {
  const parsed = Number(raw.replace(/\./g, "").replace(/,/g, "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}
// readScalarField:
return toStoredValue(el.value.trim(), field);
```

Los handlers debounced (500 ms, líneas 202–209) llaman `readScalarField` y
`updateProfile`. El campo Isapre de APV, `apv.astro:246–256`, es numérico y usa
`data-profile-bind="isapreAdicionalPct"`. Varios montos también usan number.
`writeScalarField` solo restaura campos vacíos; conservar ese comportamiento.
La persistencia es local (`monedario_profile`), según ADR-20260416-calculator-profile-persistence.

El test existente `tests/integration/calculator-prefill.test.ts` usa happy-dom,
`vi.useFakeTimers()`, `vi.resetModules()`, `seedProfile` y eventos DOM. Ejemplo:

```ts
await import("../../src/scripts/calculator-prefill");
await vi.runOnlyPendingTimersAsync();
```

Seguir ese patrón; verificar la escritura real de localStorage y restauración,
no exponer funciones privadas ni comprobar una copia del parser en el test.

## Pasos específicos

1. Baseline: suite existente de prefill y suite global. Revisar los bindings
   actuales para confirmar que hay campos numéricos y campos de texto; no cambiar
   páginas ni selectores. **Verificar:**
   `pnpm exec vitest run tests/integration/calculator-prefill.test.ts` → exit 0.
2. En `readScalarField`, si el campo está en `NUMERIC_FIELDS` y el elemento es
   `HTMLInputElement` con `type === "number"`, leer su representación numérica
   nativa (`valueAsNumber` es apropiado). Vacío o no finito → `undefined`, nunca
   cero implícito. El resto sigue por `toStoredValue` sin normalizaciones nuevas.
   Añadir los casos de regresión del apartado siguiente en el mismo cambio.
   **Verificar:** comando focal → exit 0; la versión anterior falla los casos
   `2.5` y `1.5e6` de escritura real.
3. Correr cierre común y `pnpm run check:boundaries`.
   **Verificar:** exit 0; no cambios en schema, claves de storage ni analytics.

## Casos de regresión concretos

- Input number decimal `2.5`, entero `1500000`, exponente `1.5e6` y cero legítimo
  de porcentaje: storage conserva exactamente el valor numérico.
- Input vacío y valor no finito/ilegible no guardan NaN, Infinity ni cero falso.
- Campo text monetario con `1.500.000` y `1.500,25` conserva el comportamiento
  chileno existente; select/radio de AFP, salud y contrato permanecen iguales.
- Reabrir el módulo/DOM con un campo vacío restaura el valor guardado; limpiar
  y aviso siguen funcionando. Usar fake timers para debounce, sin sleeps reales.
- Campo con default no vacío permanece intacto, tal como hace hoy el ADR.

## Alcance de implementación

Solo se pueden editar estos archivos de producto/tests/documentación:

- `src/scripts/calculator-prefill.ts`
- `tests/integration/calculator-prefill.test.ts`

Metadatos de ejecución permitidos: este plan, `plans/README.md` y `todo.md`
temporal (retirar al cierre). Si corresponde cierre/archivo, este mismo plan
puede moverse a `plans/archive/088-profile-numeric-roundtrip.md` y actualizar `plans/archive/README.md`.
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

Prueba focal después del cambio: `pnpm exec vitest run tests/integration/calculator-prefill.test.ts` → exit 0.

Escritura real + recarga del perfil usando DOM y fake timers. Mantener tests del aviso y limpiar, y añadir casos numéricos/texto sin mocks de parsing.

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

- El arreglo necesita cambiar defaults, claves o versión de UserProfile, migrar valores históricos, editar fórmulas o enviar datos al servidor. Esos cambios no están autorizados por este plan.
- Conflicto constitucional, drift material sin resolver, necesidad de editar
  fuera de alcance o imposibilidad de demostrar una aceptación crítica.
- No ampliar permisos/tipos/dependencias ni relajar gates para eludir un fallo.
  Registrar la carencia concreta de capacidad y resolverla dentro del alcance
  autorizado, o reportarla; no repetir el mismo intento sin nueva evidencia.

## Git, mantenimiento y rollback

Rama sugerida: `advisor/088-profile-numeric-roundtrip`. Commits convencionales, por ejemplo
`fix(scope): describir el comportamiento corregido` o `test(ci): activar cobertura`.
Una autorización de implementación futura se interpreta según ese encargo; este
plan no añade autorización de push, PR, merge ni deploy por sí solo.

Rollback: Revertir parser y tests de esta unidad. No reescribir ni borrar perfiles locales de usuarios; el rollback no puede reconstruir valores ya corruptos.

Mantenimiento: revisar que futuros consumidores mantengan los casos de aceptación
anotados; este plan no obliga a reconstruir pruebas por cambios de estilo.

## Registro de control de cambios — completar al ejecutar

- Estado de implementación y commit(s): pendiente.
- Baseline real (Node, pnpm/Python, comandos y salidas): pendiente.
- Cambios y correspondencia con el alcance: pendiente.
- Evidencia de aceptación y gates: pendiente.
- Riesgo residual y rollback probado/documentado: pendiente.
- Despliegue (cuando aplique), revisión y actualización del índice: pendiente.
