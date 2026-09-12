# Plan 092: Aplicar el límite de analytics durante la lectura del cuerpo

> **Ejecutor:** este archivo es la especificación completa. Sigue decisiones,
> alcance y verificaciones; registra evidencia real. No necesitas la conversación
> ni leer otros planes para ejecutar. La implementación empieza con el baseline.
>
> **Drift check:** `git diff --stat db9d07c8..HEAD -- workers/analytics-collector/src/index.ts tests/workers/analytics-collector/schema.test.ts workers/analytics-collector/README.md docs/adr/ADR-20260906-analytics-body-byte-limit.md`
> Examina también `git diff --` y `git diff --cached --` sobre esos paths para
> detectar cambios locales. Si hay drift material, compara los extractos y
> reconcilia la especificación antes de editar; no sobrescribas trabajo ajeno.

## Status

- **Priority:** P2
- **Effort:** S–M (incluye pruebas y cierre)
- **Risk:** MED
- **Depends on:** ninguno; 087 es orden recomendado, no requisito funcional
- **Category:** security
- **Planned at:** commit `db9d07c8`, 2026-09-06
- **Estado:** TODO — seleccionado por el usuario: «Todos los net-positive»
- **Origen:** hallazgo 6 de la auditoría; hechos relevantes incluidos abajo

## Por qué importa y decisión

El endpoint público tiene límite local de 2 KB, pero sin Content-Length lee todo
el cuerpo antes de rechazarlo. Además, `text.length` cuenta unidades UTF-16, no
bytes. Acotaremos lo que el Worker retiene y seguirá leyendo, sin añadir productos
antiabuso, cambiar autenticación ni modificar el contrato de eventos.

No se afirma un incidente de memoria observado en producción. Es net-positive
porque completa un límite ya existente mediante un cambio local verificable.
La cota real incluye un chunk entregado por el runtime: no prometer que el
Worker puede impedir la asignación de ese chunk antes de recibirlo.

## Estado actual y convenciones

`workers/analytics-collector/src/index.ts:937–953`:

```ts
const contentLength = request.headers.get("Content-Length");
if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
  return new Response(null, { status: 413, headers: corsHeaders() });
}
const text = await request.text();
if (text.length > MAX_BODY_SIZE) {
  return new Response(null, { status: 413, headers: corsHeaders() });
}
body = JSON.parse(text);
```

El try/catch responde 400 a error de lectura/JSON. Después se valida payload,
se aplica rate limit y se agrega. Conservar ese orden relativo y las respuestas
CORS; el cambio solo reemplaza la lectura. El source comparte contrato con
`src/contracts/analytics-events.ts`, que no se modifica.

`tests/workers/analytics-collector/schema.test.ts:1256–1371` ya tiene `enabledEnv`,
`post`, `VALID_BODY`, MockKV y caso chunked de 413 con Request `duplex: "half"`.
Reusar el harness; extender el test para demostrar cancelación temprana, no solo
el código final. Cloudflare documenta `Request.body` como ReadableStream:
https://developers.cloudflare.com/workers/runtime-apis/request/

## Pasos específicos

1. Baseline focal y typecheck. Crear ADR pequeño: límite de bytes recibidos del
   body, no caracteres; límite exacto permitido, MAX+1 rechazado, efectos sobre
   Unicode y conservación de HTTP/eventos. **Verificar:** suite focal,
   `pnpm exec tsc -p workers/analytics-collector/tsconfig.json` y
   `pnpm run check:docs` → exit 0.
2. Implementar helper privado de lectura acotada dentro del mismo index.
   Con `request.body.getReader()` acumular `Uint8Array.byteLength` hasta MAX;
   no concatenar ni retener el chunk que hace superar la cota. Al superar,
   cancelar la lectura y responder 413 con CORS. Leer texto solo una vez
   completado un cuerpo dentro del límite; decodificar UTF-8 correctamente
   aunque caracteres crucen chunks. No usar `request.text()` ni clone para
   volver a cargar todo. Mantener 400 para lectura rota, cuerpo vacío o JSON
   inválido; liberar reader en todos los caminos. Cancelación fallida no debe
   sustituir 413/400 ni dejar un rechazo de Promise sin manejar; documentar su
   carácter de limpieza best-effort. No esperar indefinidamente una cancelación.
   **Verificar:** suite focal y typecheck → exit 0.
3. Extender tests que invocan `analyticsCollector.fetch`, sin red y con analytics
   habilitado. Probar la matriz siguiente, incluyendo spies de `cancel` y de las
   escrituras KV. **Verificar:** mismo comando focal → exit 0; la versión antigua
   debe fallar la aserción de cancelación/lectura temprana o de bytes Unicode.
4. Ajustar la explicación de tamaño en README, sin ampliar la guía de abuso ni
   publicar ejemplos de carga. Cierre común, gates de docs/context/policy-registry
   por ADR y typecheck Worker. **Verificar:** exit 0; schema, límites de eventos,
   auth, rutas y wrangler sin cambios.

## Matriz de pruebas

- Sin Content-Length y varios chunks: supera MAX, cancela y retorna 413 sin
  necesitar que el productor cierre ni pedir todos los chunks restantes.
- JSON válido exacto de MAX bytes (relleno de whitespace permitido): 202;
  MAX+1 bytes: 413. Afirmar bytes con TextEncoder, no string.length.
- JSON con whitespace/valores UTF-8: por encima de MAX bytes y debajo de MAX
  caracteres → 413; secuencia multibyte partida dentro de la cota se decodifica.
  Usar un payload del contrato para el camino válido, sin ampliar allowlists.
  Si un valor Unicode es rechazado por el schema, el caso dentro del límite debe
  conservar el mismo 422 que el cuerpo sin dividir, nunca un 400 causado por
  partir la secuencia; no debilitar el schema para forzar un 202.
- Content-Length ausente, legítimo y sobredimensionado: la lectura real manda
  cuando se inicia; conservar el fast reject del declarado excesivo.
- Stream que falla, JSON inválido y body nulo/vacío: 400; sin escrituras KV.
- Ningún rechazo de tamaño toca contadores. Happy path, feature flag, auth de
  export, CORS, rate limit y R2 continúan cubiertos por la suite existente.

**Límite de cierre:** verificar primero código y tests; registrar por separado
la versión desplegada del collector cuando una instrucción autorice deploy.

## Alcance de implementación

Solo se pueden editar estos archivos de producto/tests/documentación:

- `workers/analytics-collector/src/index.ts`
- `tests/workers/analytics-collector/schema.test.ts`
- `workers/analytics-collector/README.md`
- `docs/adr/ADR-20260906-analytics-body-byte-limit.md` (crear)

Metadatos de ejecución permitidos: este plan, `plans/README.md` y `todo.md`
temporal (retirar al cierre). Si corresponde cierre/archivo, este mismo plan
puede moverse a `plans/archive/092-analytics-bounded-body-read.md` y actualizar `plans/archive/README.md`.
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

Prueba focal después del cambio: `pnpm exec vitest run tests/workers/analytics-collector/schema.test.ts` → exit 0.

Handler real con streams finitos/controlables y asserts de cancelación, bytes y ausencia de efectos KV; sin producción, cargas grandes ni nuevas dependencias.

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

- El arreglo necesita cambiar SDK, runtime, binding, transporte cliente, límites de schema o rate limiting. Si TypeScript requiere relajar tipos a any, resolver el tipo correcto o reportar; no suprimir errores.
- Conflicto constitucional, drift material sin resolver, necesidad de editar
  fuera de alcance o imposibilidad de demostrar una aceptación crítica.
- No ampliar permisos/tipos/dependencias ni relajar gates para eludir un fallo.
  Registrar la carencia concreta de capacidad y resolverla dentro del alcance
  autorizado, o reportarla; no repetir el mismo intento sin nueva evidencia.

## Git, mantenimiento y rollback

Rama sugerida: `advisor/092-analytics-bounded-body-read`. Commits convencionales, por ejemplo
`fix(scope): describir el comportamiento corregido` o `test(ci): activar cobertura`.
Una autorización de implementación futura se interpreta según ese encargo; este
plan no añade autorización de push, PR, merge ni deploy por sí solo.

Rollback: Revertir helper/integración y tests; si ya se desplegó, restaurar versión previa bajo autorización vigente. El cambio no migra ni borra KV/R2.

Mantenimiento: revisar que futuros consumidores mantengan los casos de aceptación
anotados; este plan no obliga a reconstruir pruebas por cambios de estilo.

## Registro de control de cambios — completar al ejecutar

- Estado de implementación y commit(s): pendiente.
- Baseline real (Node, pnpm/Python, comandos y salidas): pendiente.
- Cambios y correspondencia con el alcance: pendiente.
- Evidencia de aceptación y gates: pendiente.
- Riesgo residual y rollback probado/documentado: pendiente.
- Despliegue (cuando aplique), revisión y actualización del índice: pendiente.
