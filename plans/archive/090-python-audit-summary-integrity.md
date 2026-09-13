# Plan 090: Distinguir auditoría Python limpia, hallazgos y falta de evidencia

> **Ejecutor:** este archivo es la especificación completa. Sigue decisiones,
> alcance y verificaciones; registra evidencia real. No necesitas la conversación
> ni leer otros planes para ejecutar. La implementación empieza con el baseline.
>
> **Drift check:** `git diff --stat db9d07c8..HEAD -- .github/workflows/security-scans.yml tests/static-analysis/python-audit-summary.test.ts docs/adr/ADR-20260906-python-audit-summary-integrity.md`
> Examina también `git diff --` y `git diff --cached --` sobre esos paths para
> detectar cambios locales. Si hay drift material, compara los extractos y
> reconcilia la especificación antes de editar; no sobrescribas trabajo ajeno.

## Status

- **Priority:** P2
- **Effort:** S–M (incluye pruebas y cierre)
- **Risk:** LOW
- **Depends on:** ninguno; 087 es orden recomendado, no requisito funcional
- **Category:** security / tooling
- **Planned at:** commit `db9d07c8`, 2026-09-06
- **Estado:** TODO — seleccionado por el usuario: «Todos los net-positive»
- **Origen:** hallazgo 4 de la auditoría; hechos relevantes incluidos abajo

## Por qué importa y decisión

El resumen actual cuenta las claves raíz del reporte de pip-audit como paquetes
vulnerables y declara limpieza si el archivo no existe. Un error de ejecución
parece una auditoría limpia. Arreglaremos el resultado observable y su diagnóstico,
sin cambiar que el job es semanal/manual y `continue-on-error: true`.

## Estado actual y convenciones

`.github/workflows/security-scans.yml:277,283,298–301`:

```bash
uv run pip-audit --format json --output output/security/python-audit.json --desc on || true
vuln_count=$(jq 'length' output/security/python-audit.json 2>/dev/null || echo "0")
# Cuando falta el archivo:
echo "No vulnerabilities found. ✓" >> "$GITHUB_STEP_SUMMARY"
```

El formatter instalado `pip_audit._format.json.JsonFormat.format` produce:

```python
output_json = {
    "dependencies": [self._format_dep(dep, vulns) for dep, vulns in result.items()],
    "fixes": [self._format_fix(f) for f in fixes],
}
```

La raíz tiene dos claves incluso con cero vulnerabilidades. Cada dependencia
resuelta tiene su array `vulns`; las dependencias omitidas pueden tener
`skip_reason` en lugar de vulns. No llamarlas limpias. Documentación primaria:
https://github.com/pypa/pip-audit#suppressing-exit-codes-from-pip-audit

Seguir el patrón de `tests/static-analysis/data-signals-workflow.e2e.test.ts`
(ejecutar fragmentos reales del workflow en procesos con archivos temporales),
y `security-supply-chain-config.e2e.test.ts` (`js-yaml.load`). El job ya dispone
de Bash/jq; no introducir script Python/Node nuevo ni dependencias.

## Pasos específicos

1. Baseline común y comprobar `command -v bash jq` → ambos disponibles. Crear ADR
   con tres estados principales CLEAN / VULNERABILITIES / INCOMPLETE, sin alterar
   calendario, permisos, uploads ni la tolerancia deliberada del job.
   **Verificar:** `pnpm run check:docs` → exit 0.
2. Capturar exit code de pip-audit sin perderlo por `|| true`: iniciar variable
   de estado en 0, ejecutar con rama de error que la actualice y escribir un
   output del step. Eliminar solo su reporte de esta corrida antes de ejecutar,
   para no reutilizar un archivo viejo en runners persistentes. En el step
   resumen pasar el output mediante `env`, no interpolarlo dentro del shell.
   **Verificar:** test nuevo extrae del YAML ese bloque y sustituye `uv` por
   un stub temporal: códigos 0, 1 y 2 llegan intactos al output, sin red.
3. En el resumen validar JSON y forma antes de contar. Contar dependencias cuyo
   array `vulns` no está vacío, no cantidad de CVEs ni claves raíz. Solo declarar
   CLEAN con exit 0, JSON válido, cero vulnerabilidades y cero dependencias
   omitidas. Exit 1 con vulnerabilidades válidas → VULNERABILITIES; ausencia,
   JSON/shape inválido, fallo operativo, código ausente o contradicción entre
   código/reporte → INCOMPLETE. Si hay vulnerabilidades y dependencias omitidas,
   mostrar ambas condiciones, sin ocultar los hallazgos conocidos.
   Conservar detalle diagnóstico y número de omitidos; no cambiar política de
   bloqueo global. **Verificar:** suite focal → exit 0 con fixtures siguientes.
4. Cierre común y gates `check:policy-registry`/`check:context`.
   **Verificar:** exit 0; `continue-on-error`, triggers y permisos intactos.

## Fixtures mínimos del resumen

Extraer y ejecutar el bloque `run` real con GITHUB_STEP_SUMMARY apuntando a un
archivo temporal y el código en su env. Nunca invocar pip-audit real desde tests.

- Dos dependencias sanas: paquetes vulnerables 0, CLEAN.
- Una dependencia con dos CVEs y otra sana: paquetes vulnerables 1, no 2.
- Reporte vacío, ausente, JSON roto o forma sin `dependencies`: INCOMPLETE.
- Código operativo 2 y reporte ausente; código faltante tras step omitido:
  INCOMPLETE, sin texto de limpieza.
- Código 0 con hallazgos o 1 con lista limpia: inconsistencia, INCOMPLETE.
- Dependencia con `skip_reason`: auditoría parcial explícita; nunca limpieza total.

## Alcance de implementación

Solo se pueden editar estos archivos de producto/tests/documentación:

- `.github/workflows/security-scans.yml`
- `tests/static-analysis/python-audit-summary.test.ts` (crear)
- `docs/adr/ADR-20260906-python-audit-summary-integrity.md` (crear)

Metadatos de ejecución permitidos: este plan, `plans/README.md` y `todo.md`
temporal (retirar al cierre). Si corresponde cierre/archivo, este mismo plan
puede moverse a `plans/archive/090-python-audit-summary-integrity.md` y actualizar `plans/archive/README.md`.
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

Prueba focal después del cambio: `pnpm exec vitest run tests/static-analysis/python-audit-summary.test.ts` → exit 0.

Probar los fragmentos reales del YAML con Bash/jq y fixtures temporales; distinguir paquetes de vulnerabilidades y auditoría incompleta. No test por mera presencia de una cadena.

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

- El formato instalado no coincide con dependencies/fixes y debe investigarse antes de inventar compatibilidad; jq no está disponible en el runner soportado; el arreglo necesita cambiar política de bloqueo semanal. Mantener esos cambios fuera del plan.
- Conflicto constitucional, drift material sin resolver, necesidad de editar
  fuera de alcance o imposibilidad de demostrar una aceptación crítica.
- No ampliar permisos/tipos/dependencias ni relajar gates para eludir un fallo.
  Registrar la carencia concreta de capacidad y resolverla dentro del alcance
  autorizado, o reportarla; no repetir el mismo intento sin nueva evidencia.

## Git, mantenimiento y rollback

Rama sugerida: `advisor/090-python-audit-summary-integrity`. Commits convencionales, por ejemplo
`fix(scope): describir el comportamiento corregido` o `test(ci): activar cobertura`.
Una autorización de implementación futura se interpreta según ese encargo; este
plan no añade autorización de push, PR, merge ni deploy por sí solo.

Rollback: Revertir lógica y tests de resumen juntos; la política del job no cambia. Conservar artefactos de auditoría existentes, que son evidencia y no código a limpiar.

Mantenimiento: revisar que futuros consumidores mantengan los casos de aceptación
anotados; este plan no obliga a reconstruir pruebas por cambios de estilo.

## Registro de control de cambios — completar al ejecutar

- Estado de implementación y commit(s): pendiente.
- Baseline real (Node, pnpm/Python, comandos y salidas): pendiente.
- Cambios y correspondencia con el alcance: pendiente.
- Evidencia de aceptación y gates: pendiente.
- Riesgo residual y rollback probado/documentado: pendiente.
- Despliegue (cuando aplique), revisión y actualización del índice: pendiente.
