# Reconciliación de planes — 2026-09-12

**Estado contrastado:** `13c939ed` en `main`. Alcance: los cuatro planes
numerados que quedaban en `plans/` (083–086), sus índices y el estado de cierre
registrado para 087–096. Escritura exclusivamente en `plans/`.

**Resultado:** 083–086 están implementados o tienen su diagnóstico entregado y
mergeado; se archivan como **DONE verificado**. No quedan planes numerados
pendientes de implementación. Los seguimientos de producto y operación que se
detallan abajo siguen abiertos. No se rechaza ningún plan ni se crean duplicados.

## Evidencia de integración y vigencia

Los siguientes merges y sus correcciones son ancestros de `13c939ed`, comprobado
con `git merge-base --is-ancestor <commit> 13c939ed`. Solo existe el worktree
principal: no queda una ejecución aislada de estos planes por integrar.

| Plan | Merge | Verificación actual | Estado |
| --- | --- | --- | --- |
| [083](archive/083-next-step-instrumentation-parity.md) | `e3bd14b3`, 2026-09-04 | `NextSteps` emite shown/click con identidad, deduplica impresiones y elimina el CTA genérico; helpers y contrato probados. W36 ya contiene impresiones para las dos superficies de seguimiento. | DONE verificado |
| [084](archive/084-utility-led-decision-readiness.md) | `b02f0c70`, 2026-09-04 | Registry y backlog incluyen mínimos; generador muestra suficiencia y Gate D sin registro. Corrección `9c7d0609` integrada; tests del render y cálculo pasan. | DONE verificado |
| [085](archive/085-journey-thesis-vehicle-spike.md) | `2935878f`, 2026-09-05 | Dossier con las siete secciones y seis preguntas de decisión. Correcciones de denominador y semanas (`247be7e6`, `99db0341`, `65a2e02c`) integradas. | DONE: spike entregado |
| [086](archive/086-apv-completion-drop-diagnosis.md) | `d412aa57`, 2026-09-04 | Diagnóstico `690ff53e` presente: **causa no identificada**, resultado admitido por su compuerta. Serie y protocolo documentados; APV no cambió desde ese diagnóstico. | DONE: diagnóstico entregado |

Entregables de dirección:

- [Vehículo y superficie](../docs/backlog/JOURNEY-THESIS-VEHICLE-2026-09-04.md).
- [Diagnóstico APV](../docs/backlog/DIAGNOSTICO-apv-completion-2026-09-04.md).

Se conserva el SHA de planificación original y el texto histórico de cada plan;
la nota de reconciliación prevalece sobre sus instrucciones de ejecución antiguas.
Las revisiones históricas del índice se trasladan al archivo correspondiente.

087–096 ya estaban archivados. Se confirmó la existencia de sus archivos y la
ascendencia de los commits de cierre: 087 `f111752b`, 088 `4bb17a7d`, 089
`da033cb4`, 090 `218be569`, 091 `b5805eed`, 092 `0ca87cda`, 093 `4e7c22ae`, 094
`59457be1`, 095 `edac4a33` y 096 `2e0fe2e0`. Esta comprobación de integración no
es una nueva ejecución de todos sus criterios de aceptación ni prueba de deploy.
La deriva editorial UTM citada al cerrar 087 ya fue atendida por 095.

## Evidencia nueva: W36

Fuente: `output/operations/data-signals/analytics/2026-W36.json`, esquema 2,
ventana 2026-08-31 a 2026-09-06. Se sumó `data[].count` por `calculator_id` y
`event_name`, comparando con el archivo equivalente de W35.

| Señal | W35 | W36 | Lectura para el seguimiento |
| --- | --- | --- | --- |
| `seguro-cesantia`: `next_step_shown` | 0 | 6 | Se cumple la observación posterior al 083 que seguía pendiente en el índice. |
| `prepago-credito`: `next_step_shown` | 0 | 3 | También aparece el denominador esperado. |
| APV: complete/start | 3/21 (14,3%) | 6/18 (33,3%) | Mejora, pero sigue bajo 50%; no demuestra recuperación ni identifica causa. |
| UTM: next-step click/shown | 0/30 | 0/58 | No contradice el problema de entrega/demanda del 085; tampoco decide una opción por sí solo. |

W36 cruza la fecha de integración de 083; no debe tratarse como una semana
completa y homogénea posterior al cambio. Los conteos son eventos agregados:
los 108 eventos históricos del panel no equivalen a 108 ensayos independientes,
y la aproximación de 54 exposiciones del dossier tampoco identifica personas
únicas. No se recalifica demanda usando esos conteos como usuarios.

## Seguimientos conservados y orden útil

1. **Operación de medición, disponible ahora:** continuar el seguimiento con
   semanas completas posteriores al corte de 083 y registrar datos reales del
   Gate D. El último `utility-led-ops.json` local disponible sigue siendo W35,
   con `weeklyHours`, `weeklyCostClp` y `burnoutLevel1To5` en `null`; no existe
   aquí un scorecard W36 para verificar su captura. El 084 implementó el aviso,
   no podía completar esos valores por el operador.
2. **Semántica del titular, decisión pendiente (084):**
   `scripts/build-weekly-search-report.mjs:1839` todavía convierte
   `INPUT_REQUIRED` en `WATCH`. Es distinto del aviso explícito del Gate D,
   que sí está resuelto. Definir primero el veredicto deseado y sus consumidores;
   no reabrir 084 para cambiar una clasificación fuera de su alcance.
3. **Vehículo del siguiente paso, decisión pendiente (085):** la opción A
   (acercar el panel UTM al resultado) sigue siendo una recomendación, no una
   elección registrada en el dossier. Panel y página UTM no tienen cambios
   desde el spike. B sigue condicionada a lo que se aprenda con A. Recalcular
   las proyecciones con datos recientes antes de decidir; las ~8,4 semanas del
   dossier corresponden al 2026-09-04, no a hoy. No extender automáticamente la
   ventana del 2026-11-02. El cierre de 046 ya quedó resuelto por el archivo.
4. **Instrumentación diagnóstica, técnicamente disponible para especificar
   (086):** `calculator_error` continúa apareciendo solo en el contrato,
   sin emisores en `src/`. El diagnóstico sigue sin causa confirmada. Un plan
   posterior puede acotar manejo de errores y telemetría agregada, sin entradas
   financieras. También sigue documentado el problema independiente de los
   placeholders con miles en `type="number"`; el arreglo de persistencia del
   088 no cambió APV ni resuelve esa interacción del navegador.
5. **Despliegues 091/092, verificación externa pendiente:** los índices registran
   pendientes el worker económico y el collector. No se consultaron versiones
   de Cloudflare ni se desplegó nada en esta reconciliación; no se infiere que
   estén activos por existir los commits en `main`.

La prop explícita `calculatorId` diferida por 083 sigue siendo una alternativa
de mantenimiento, sin nueva evidencia que justifique tocar todas las páginas.
La observación W36 sí queda cumplida. Los umbrales y decisiones del registry
siguen requiriendo semanas comparables e integridad suficiente. Ningún
seguimiento de esta lista se convierte automáticamente en un plan nuevo.

## Verificación y límites

- `node node_modules/vitest/vitest.mjs run tests/utils/nextSteps.test.ts tests/integration/analytics-sanitizer.test.ts tests/scripts/utility-led-sufficiency.test.ts`:
  **3 archivos, 59 tests pasan** con las dependencias locales instaladas.
- La invocación inicial con `pnpm exec` intentó sincronizar dependencias y falló
  al abrir su base SQLite. Se usó el binario local existente, sin reinstalar.
  Esto no valida una instalación limpia contra el lockfile actualizado por
  `13c939ed`; tampoco es un fallo de los tests del producto.
- `node scripts/check-docs-structure.mjs` (comando de `check:docs`): **exit 0**,
  740 Markdown versionados y 47 ADR. Requirió ejecutarse fuera del sandbox
  porque este impedía invocar Git (`spawnSync git EPERM`).
- Enlaces locales de los ocho documentos nuevos/modificados verificados; ambos
  índices incluyen 083–086 en el archivo y no quedan planes numerados en la raíz.
  `git diff --check` sin errores; contenido original de los cuatro planes
  conservado junto con su registro histórico de revisión.
- No se repitieron build, E2E, cobertura global ni CI completa: el cambio es
  documental. La evidencia histórica de ejecución permanece fechada en los
  archivos; no se presenta como una nueva verificación.

**Riesgo y reversión:** solo cambia la clasificación y ubicación documental.
Si aparece evidencia contraria, reabrir el plan afectado preservando esta nota
y actualizar ambos índices. Revertir esta unidad documental restaura las rutas
anteriores sin cambiar producto. Sin commit, push, merge ni deploy en esta tarea.
