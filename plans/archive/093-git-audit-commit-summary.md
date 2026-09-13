# Plan 093: Mostrar el resumen de la revisión solicitada en el exportador Git

> **Ejecutor:** este archivo es la especificación completa. Sigue decisiones,
> alcance y verificaciones; registra evidencia real. No necesitas la conversación
> ni leer otros planes para ejecutar. La implementación empieza con el baseline.
>
> **Drift check:** `git diff --stat db9d07c8..HEAD -- scripts/repo/git_audit_export.py tests/test_git_audit_export.py`
> Examina también `git diff --` y `git diff --cached --` sobre esos paths para
> detectar cambios locales. Si hay drift material, compara los extractos y
> reconcilia la especificación antes de editar; no sobrescribas trabajo ajeno.

## Status

- **Priority:** P3
- **Effort:** S (incluye pruebas y cierre)
- **Risk:** LOW
- **Depends on:** ninguno; 087 es orden recomendado, no requisito funcional
- **Category:** dx / bug
- **Planned at:** commit `db9d07c8`, 2026-09-06
- **Estado:** TODO — seleccionado por el usuario: «Todos los net-positive»
- **Origen:** hallazgo 7 de la auditoría; hechos relevantes incluidos abajo

## Por qué importa y decisión

La sección Resumen de commits puede salir vacía con exit 0 porque el SHA se pasa
como path a `git show`. Arreglo de una invocación más un test de comportamiento;
es net-positive incluso con impacto bajo, sin rediseñar el exportador.

## Estado actual y convenciones

`scripts/repo/git_audit_export.py:128–132`:

```python
out.append("**Resumen:**\n\n")
out.append(md_code_block(run_git(repo, ["show", "--no-patch", "--oneline", "--", sha]), "text"))
# La siguiente sección ya pone el SHA correctamente:
name_only_args = ["show", "--name-only", "--pretty=format:", sha, "--"]
```

`--` inicia los paths. El resumen necesita la revisión antes del separador.
`run_git` usa `subprocess.run` con argv, `shell=False`, `check=True` y convierte
fallos en RuntimeError: conservarlo, sin concatenar strings de shell.
`tests/test_git_audit_export.py` usa pytest con clases por helper y hoy cubre
validación de argumentos/formato, no un repo real. Python se gestiona con uv;
CI usa Ruff check/format y pytest. No cambiar pyproject ni lockfile.

## Pasos específicos

1. Baseline: suite Python sin coverage de archivos y Ruff de los dos paths.
   **Verificar:**
   `uv run pytest tests/test_git_audit_export.py --no-cov -p no:cacheprovider` y
   `uv run ruff check scripts/repo/git_audit_export.py tests/test_git_audit_export.py`
   → exit 0. Solo sincronizar dependencias si faltan y el encargo de ejecución
   lo permite; no cambiar el lockfile para resolver baseline.
2. Colocar `sha` antes de `--` en la invocación del resumen. No alterar path
   filters de secciones siguientes, revisión por defecto ni flags de patches.
   **Verificar:** suite focal con la regresión del paso siguiente → exit 0.
3. Añadir un test con `tmp_path`: crear repositorio desechable y dos commits con
   asuntos diferentes y autor/committer ficticios en env local al subproceso.
   Desactivar hooks/firma solo para ese repo de test, nunca configuración global.
   Invocar `git_show_commit` sobre el primer SHA mientras HEAD apunta al segundo;
   extraer bloque Resumen y afirmar asunto+SHA esperado, no vacío ni asunto de HEAD.
   Parametrizar filtro de paths y include_patch sin multiplicar escenarios triviales.
   No mockear `run_git`: el bug es la semántica real de argv.
   **Verificar:** suite focal y `uv run pytest --no-cov -p no:cacheprovider` → exit 0.
4. Cierre común más `uv run ruff check scripts/ tests/` y
   `uv run ruff format --check scripts/repo/git_audit_export.py tests/test_git_audit_export.py`.
   **Verificar:** exit 0; solo la invocación afectada y su prueba cambian en Python.

## Verificación del síntoma en lectura

Sobre el commit de planificación, `git show --no-patch --oneline -- db9d07c8`
produce texto vacío; `git show --no-patch --oneline db9d07c8 --` sí muestra el
asunto. Estos comandos son lectura; no usar commits del repositorio real como
fixture permanente porque la prueba debe sobrevivir clones y futuros cambios.

## Alcance de implementación

Solo se pueden editar estos archivos de producto/tests/documentación:

- `scripts/repo/git_audit_export.py`
- `tests/test_git_audit_export.py`

Metadatos de ejecución permitidos: este plan, `plans/README.md` y `todo.md`
temporal (retirar al cierre). Si corresponde cierre/archivo, este mismo plan
puede moverse a `plans/archive/093-git-audit-commit-summary.md` y actualizar `plans/archive/README.md`.
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

Prueba focal después del cambio: `uv run pytest tests/test_git_audit_export.py --no-cov -p no:cacheprovider` → exit 0.

Un repo temporal con dos commits prueba selección real del SHA y resumen no vacío. Mantener tests actuales de controles y shell=False.

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

- El test depende de credenciales, config Git global, historial del repo o red. La corrección requiere modificar filtrado/CLI o agregar una dependencia. Mantener el arreglo de argv aislado.
- Conflicto constitucional, drift material sin resolver, necesidad de editar
  fuera de alcance o imposibilidad de demostrar una aceptación crítica.
- No ampliar permisos/tipos/dependencias ni relajar gates para eludir un fallo.
  Registrar la carencia concreta de capacidad y resolverla dentro del alcance
  autorizado, o reportarla; no repetir el mismo intento sin nueva evidencia.

## Git, mantenimiento y rollback

Rama sugerida: `advisor/093-git-audit-commit-summary`. Commits convencionales, por ejemplo
`fix(scope): describir el comportamiento corregido` o `test(ci): activar cobertura`.
Una autorización de implementación futura se interpreta según ese encargo; este
plan no añade autorización de push, PR, merge ni deploy por sí solo.

Rollback: Revertir la línea y su test en una unidad; no borrar los reportes exportados previamente ni tocar el historial que se auditó.

Mantenimiento: revisar que futuros consumidores mantengan los casos de aceptación
anotados; este plan no obliga a reconstruir pruebas por cambios de estilo.

## Registro de control de cambios — completar al ejecutar

- Estado de implementación y commit(s): pendiente.
- Baseline real (Node, pnpm/Python, comandos y salidas): pendiente.
- Cambios y correspondencia con el alcance: pendiente.
- Evidencia de aceptación y gates: pendiente.
- Riesgo residual y rollback probado/documentado: pendiente.
- Despliegue (cuando aplique), revisión y actualización del índice: pendiente.
