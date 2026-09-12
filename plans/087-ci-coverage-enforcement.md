# Plan 087: Conectar el umbral de cobertura al CI y a su espejo local

> **Ejecutor:** este archivo es la especificación completa. Sigue decisiones,
> alcance y verificaciones; registra evidencia real. No necesitas la conversación
> ni leer otros planes para ejecutar. La implementación empieza con el baseline.
>
> **Drift check:** `git diff --stat db9d07c8..HEAD -- .github/workflows/ci.yml package.json README.md tests/static-analysis/ci-coverage-contract.test.ts docs/adr/ADR-20260906-ci-coverage-enforcement.md`
> Examina también `git diff --` y `git diff --cached --` sobre esos paths para
> detectar cambios locales. Si hay drift material, compara los extractos y
> reconcilia la especificación antes de editar; no sobrescribas trabajo ajeno.

## Status

- **Priority:** P1
- **Effort:** S (incluye pruebas y cierre)
- **Risk:** LOW
- **Depends on:** ninguno; 087 es orden recomendado, no requisito funcional
- **Category:** tests / CI
- **Planned at:** commit `db9d07c8`, 2026-09-06
- **Estado:** TODO — seleccionado por el usuario: «Todos los net-positive»
- **Origen:** hallazgo 3 de la auditoría; hechos relevantes incluidos abajo

## Por qué importa y decisión

La Constitución §5.3 exige que una caída de cobertura bloquee merge. CI ejecuta
los tests sin activar coverage, de modo que el umbral configurado no se evalúa.
Conectaremos el comando existente a CI y al espejo local, sin cambiar qué se mide.
La auditoría obtuvo 91,81% de líneas, por encima del 80%; no hace falta una campaña
de tests ni rebajar el umbral. Beneficio neto: recuperar un control existente con
cambio pequeño, sin duplicar la ejecución de Vitest.

## Estado actual y convenciones

`.github/workflows/ci.yml:81–82`:

```yaml
- name: "🧪 Run tests"
  run: pnpm run test
```

`package.json:16–17`:

```json
"test": "vitest run",
"test:coverage": "vitest run --coverage",
```

`check:ci` encadena `pnpm run test` después de formato. `vitest.config.ts:46–47`
contiene `thresholds: { lines: 80 }`; sus exclusiones de páginas, componentes,
cliente y Workers son deliberadas (plan 073). No tocarlas. README explica que
`check:ci` es el espejo de gates, sin build. El patrón de tests de configuración
es `tests/static-analysis/security-supply-chain-config.e2e.test.ts`: `load` de
`js-yaml`, lectura del workflow y aserciones semánticas de la configuración.

## Pasos específicos

1. Ejecutar baseline y leer Constitución §5.3/§6 y ADR template. Crear el ADR
   indicado con la decisión: ejecutar Vitest con coverage una sola vez por job;
   conservar exclusiones, umbral y ausencia de build en el espejo. Ajustar la
   explicación de README solo donde describe esta paridad.
   **Verificar:** `pnpm run check:docs` → exit 0.
2. Cambiar el paso de tests del job actual a `pnpm run test:coverage`; sustituir
   la invocación de `test` en `check:ci` por `test:coverage`. Mantener `test` como
   comando rápido independiente. No introducir otro job, otra suite ni uploads.
   **Verificar:** `pnpm run test:coverage` → exit 0 y líneas >=80%.
3. Crear un test de contrato que cargue el YAML y `package.json`: el comando de
   tests del job bloqueante debe resolver a un script que active `--coverage`;
   `check:ci` también lo invoca una vez y no duplica la suite normal. El job/paso
   no debe tolerar fallos de tests con `continue-on-error` o `|| true`.
   **Verificar:** `pnpm exec vitest run tests/static-analysis/ci-coverage-contract.test.ts`
   → exit 0. Revertir temporalmente solo la activación en una copia/fixture del
   YAML que consume el test debe hacer fallar su aserción, sin editar el workflow
   real ni provocar una corrida remota.
4. Correr cierre común y `pnpm run check:policy-registry`, `pnpm run check:context`.
   **Verificar:** todos exit 0; diff de `vitest.config.ts` vacío.

## Alcance de implementación

Solo se pueden editar estos archivos de producto/tests/documentación:

- `.github/workflows/ci.yml`
- `package.json`
- `README.md`
- `tests/static-analysis/ci-coverage-contract.test.ts` (crear)
- `docs/adr/ADR-20260906-ci-coverage-enforcement.md` (crear)

Metadatos de ejecución permitidos: este plan, `plans/README.md` y `todo.md`
temporal (retirar al cierre). Si corresponde cierre/archivo, este mismo plan
puede moverse a `plans/archive/087-ci-coverage-enforcement.md` y actualizar `plans/archive/README.md`.
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

Prueba focal después del cambio: `pnpm exec vitest run tests/static-analysis/ci-coverage-contract.test.ts` → exit 0.

Contrato de activación y propagación del fallo; coverage real >=80%. No tests nuevos del dominio ni cambios al alcance medido.

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

- La cobertura real sobre Node 22 cae bajo 80%; sería otra tarea de caracterización. El workflow cambia de arquitectura o existen activadores de cobertura no identificados. No rebajar umbral ni sumar exclusiones.
- Conflicto constitucional, drift material sin resolver, necesidad de editar
  fuera de alcance o imposibilidad de demostrar una aceptación crítica.
- No ampliar permisos/tipos/dependencias ni relajar gates para eludir un fallo.
  Registrar la carencia concreta de capacidad y resolverla dentro del alcance
  autorizado, o reportarla; no repetir el mismo intento sin nueva evidencia.

## Git, mantenimiento y rollback

Rama sugerida: `advisor/087-ci-coverage-enforcement`. Commits convencionales, por ejemplo
`fix(scope): describir el comportamiento corregido` o `test(ci): activar cobertura`.
Una autorización de implementación futura se interpreta según ese encargo; este
plan no añade autorización de push, PR, merge ni deploy por sí solo.

Rollback: Revertir el cambio de invocaciones y el test de wiring en la misma unidad; conservar el registro del motivo. Esto reabre explícitamente el incumplimiento de coverage, no lo resuelve.

Mantenimiento: revisar que futuros consumidores mantengan los casos de aceptación
anotados; este plan no obliga a reconstruir pruebas por cambios de estilo.

## Registro de control de cambios — completar al ejecutar

- Estado de implementación y commit(s): pendiente.
- Baseline real (Node, pnpm/Python, comandos y salidas): pendiente.
- Cambios y correspondencia con el alcance: pendiente.
- Evidencia de aceptación y gates: pendiente.
- Riesgo residual y rollback probado/documentado: pendiente.
- Despliegue (cuando aplique), revisión y actualización del índice: pendiente.
