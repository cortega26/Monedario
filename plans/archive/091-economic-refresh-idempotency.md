# Plan 091: Evitar refrescos económicos que solo cambian tiempos de observación

> **Ejecutor:** este archivo es la especificación completa. Sigue decisiones,
> alcance y verificaciones; registra evidencia real. No necesitas la conversación
> ni leer otros planes para ejecutar. La implementación empieza con el baseline.
>
> **Drift check:** `git diff --stat db9d07c8..HEAD -- workers/economic-snapshot-refresh/src/index.ts workers/economic-snapshot-refresh/README.md tests/workers/economic-snapshot-refresh/idempotency.test.ts`
> Examina también `git diff --` y `git diff --cached --` sobre esos paths para
> detectar cambios locales. Si hay drift material, compara los extractos y
> reconcilia la especificación antes de editar; no sobrescribas trabajo ajeno.

## Status

- **Priority:** P2
- **Effort:** S–M (incluye pruebas y cierre)
- **Risk:** MED
- **Depends on:** ninguno; 087 es orden recomendado, no requisito funcional
- **Category:** perf / bug
- **Planned at:** commit `db9d07c8`, 2026-09-06
- **Estado:** TODO — seleccionado por el usuario: «Todos los net-positive»
- **Origen:** hallazgo 5 de la auditoría; hechos relevantes incluidos abajo

## Por qué importa y decisión

El Worker compara payloads para evitar commits y despliegues cuando no cambió
ningún dato. Excluye `capturedAt`, pero cada ejecución también cambia
`provenance.utm.verifiedAt`. Los tres crons diarios dejan de ser no-ops aunque
valores y procedencia sean idénticos. Restableceremos el contrato de idempotencia
del ADR-20260516-economic-snapshot-cloudflare-worker, sin cambiar cron ni datos.

Decisión: comparar objetos de snapshot ignorando exclusivamente el instante de
captura raíz y el instante de verificación de procedencia UTM. Todo lo demás,
incluidos datos desconocidos futuros, fechas de vigencia y cambio de fuente,
debe seguir generando un cambio. Preservar ambos timestamps en el payload cuando
sí se escribe; no simular una actualización de freshness ni suprimir procedencia.

## Estado actual y convenciones

`workers/economic-snapshot-refresh/src/index.ts:214–218`:

```ts
const stableContent = (raw: string): string =>
  raw.replace(/"capturedAt": "[^"]+",?\n?/, "");
if (stableContent(current.content) === stableContent(serialized)) {
```

`src/buildSnapshot.ts:277–284` del Worker (referencia de solo lectura):

```ts
capturedAt: now.toISOString(),
// Dentro de provenance.utm:
verifiedAt: now.toISOString(),
```

`runRefresh` obtiene current, valida plausibilidad, ejecuta `mergePrev`, serializa,
compara y llama a `putFile`. No mover ni omitir la validación/merge.
`tests/workers/economic-snapshot-refresh/manualTrigger.test.ts` ejecuta el handler
real y mockea GitHub/builder, pero su fixture `{uf:1, utm:1}` no contiene tiempos.
`buildSnapshot.test.ts` usa deps inyectadas y `fixedNow`: modelo para generar
snapshots realistas y deterministas. El Worker tiene typecheck propio.

## Pasos específicos

1. Baseline: tests y typecheck del Worker. **Verificar:**
   `pnpm exec vitest run tests/workers/economic-snapshot-refresh` y
   `pnpm exec tsc -p workers/economic-snapshot-refresh/tsconfig.json` → exit 0.
2. Reemplazar el borrado por regex con comparación estructural local al módulo
   index. Parsear copias de ambos JSON, omitir solo las dos rutas permitidas y
   comparar sin depender del orden de claves de objetos; mantener orden de arrays.
   Una canonicalización pequeña de objetos JSON es suficiente: no dependencias
   ni import Node-only al runtime Worker. No mutar `snapshot`, `current.content`
   ni la serialización enviada a GitHub. JSON inválido debe propagar un error,
   no convertirse en objeto vacío o equivalencia.
   **Verificar:** tests nuevos del handler (paso 3) y typecheck → exit 0.
3. Crear `idempotency.test.ts`: ejecutar handler manual autenticado con
   credenciales ficticias y fronteras externas mockeadas, manteniendo comparación,
   serialize y merge reales. Generar snapshots realistas con builder real y
   deps fijas (sin red), luego hacer que el builder del handler entregue esos
   objetos; conservar estado de GitHub en el mock entre runs. No copiar la
   comparación en el test. **Verificar:** comando focal → exit 0 y matriz abajo.
4. Ajustar README: el no-op omite exclusivamente tiempos de observación, no
   fechas del indicador; durante un no-op el archivo conserva la hora de la
   última escritura, aunque el Worker volvió a verificar. Correr cierre común,
   typecheck y todos los tests del Worker. **Verificar:** exit 0; snapshot JSON
   versionado, cron, fuentes, token y schema sin cambios.

## Matriz de idempotencia

- Segundo run con mismos indicadores/procedencia y horas distintas: cero PUT.
- Cambiar valor o fecha de vigencia de un indicador: un PUT.
- Mismo valor, status primary→fallback o cambio de sourceUrl: un PUT.
- Agregar/eliminar/cambiar un campo de datos no excluido: un PUT.
- Mismas claves con distinto orden/espacios: no-op; arrays reordenados difieren.
- Ante PUT, payload conserva timestamps nuevos y `prev` correcto; el SHA viene
  del GET. El objeto original de cada comparación permanece intacto.
- Error de lectura/JSON inválido: falla observable, no no-op falso.

**Límite de cierre:** tests locales demuestran el fix del repositorio. El Worker
se despliega independientemente del sitio; anotar despliegue pendiente hasta
verificar la versión aplicada. Este encargo de planificación no autoriza deploy.

## Alcance de implementación

Solo se pueden editar estos archivos de producto/tests/documentación:

- `workers/economic-snapshot-refresh/src/index.ts`
- `workers/economic-snapshot-refresh/README.md`
- `tests/workers/economic-snapshot-refresh/idempotency.test.ts` (crear)

Metadatos de ejecución permitidos: este plan, `plans/README.md` y `todo.md`
temporal (retirar al cierre). Si corresponde cierre/archivo, este mismo plan
puede moverse a `plans/archive/091-economic-refresh-idempotency.md` y actualizar `plans/archive/README.md`.
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

Prueba focal después del cambio: `pnpm exec vitest run tests/workers/economic-snapshot-refresh` → exit 0.

Handler real con mock de fronteras y dos ejecuciones, incluyendo cambios semánticos y timestamps conservados. La fixture antigua sin procedencia no prueba el bug.

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

- La normalización tiene que ignorar otra fecha/campo de datos; se pretende modificar builder/provenance/schema, rediseñar fallback o forzar un PUT para actualizar timestamps. Esas decisiones contradicen el alcance.
- Conflicto constitucional, drift material sin resolver, necesidad de editar
  fuera de alcance o imposibilidad de demostrar una aceptación crítica.
- No ampliar permisos/tipos/dependencias ni relajar gates para eludir un fallo.
  Registrar la carencia concreta de capacidad y resolverla dentro del alcance
  autorizado, o reportarla; no repetir el mismo intento sin nueva evidencia.

## Git, mantenimiento y rollback

Rama sugerida: `advisor/091-economic-refresh-idempotency`. Commits convencionales, por ejemplo
`fix(scope): describir el comportamiento corregido` o `test(ci): activar cobertura`.
Una autorización de implementación futura se interpreta según ese encargo; este
plan no añade autorización de push, PR, merge ni deploy por sí solo.

Rollback: Revertir comparator y tests y redesplegar la versión anterior solo con autorización vigente. No revertir automáticamente commits de datos económicos ni sus snapshots.

Mantenimiento: revisar que futuros consumidores mantengan los casos de aceptación
anotados; este plan no obliga a reconstruir pruebas por cambios de estilo.

## Registro de control de cambios — completar al ejecutar

- Estado de implementación y commit(s): pendiente.
- Baseline real (Node, pnpm/Python, comandos y salidas): pendiente.
- Cambios y correspondencia con el alcance: pendiente.
- Evidencia de aceptación y gates: pendiente.
- Riesgo residual y rollback probado/documentado: pendiente.
- Despliegue (cuando aplique), revisión y actualización del índice: pendiente.
