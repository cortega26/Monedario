# Reconciliación de plans/ con el repositorio — 2026-09-05

Estado: EN CURSO. Base: `main`, `2935878f`.

## Objetivo y alcance

Leer los 70 planes conservados (4 en raíz y 66 archivados) y sus dos índices;
contrastar estados con código, historial y entregables. Los planes 004–019 no
tienen archivo conservado: comprobar su registro histórico, sin recrearlos.

En alcance: `plans/**`, este registro y referencias documentales a planes que se
muevan. Fuera de alcance: implementación, contenido editorial, contratos, rutas,
despliegues y decisiones de producto. Los pendientes operativos se registran sin
dar por cumplidas compuertas humanas ni inferir producción desde un merge.

Autoridad: Constitución > AGENTS > context > código. Aplican Constitución §1,
§9 y protocolo de ejecución §2.13. Este plan es la especificación documental.

## Criterios de aceptación

- [ ] Todos los archivos de planes leídos; estado y evidencia reconciliados.
- [ ] Planes integrados archivados, ambos índices coherentes y referencias vigentes.
- [ ] Pendientes y límites de evidencia conservados de forma explícita.
- [ ] Revisión del diff y comprobaciones documentales terminadas.

## Verificación

| Comando / comprobación | Resultado esperado | Evidencia |
| --- | --- | --- |
| `git merge-base --is-ancestor <merge> HEAD` | 0 para cada cierre nuevo | Pendiente |
| `pnpm run check:docs` | exit 0 | Pendiente |
| `pnpm exec vitest run tests/utils/nextSteps.test.ts tests/scripts/utility-led-sufficiency.test.ts` | Tests de cambios 083/084 verdes; ajustar rutas a las reales | Pendiente |
| Enlaces locales e inventario de planes con script temporal | 70 planes, un registro por índice, sin referencias al path anterior | Pendiente |
| `git diff --check` | Sin errores nuevos de whitespace | Pendiente |

## Change Control Record

1. **Scope:** documentación declarada arriba; no ejecución de los planes revisados.
2. **Módulos:** índices y planes para corregir estado; este registro para evidencia.
3. **Invariantes:** `URL.PUBLIC.NO_POST_ID`, `ROUTES.NO_SILENT_CHANGES`,
   `RSS.NO_REMOVALS`, separación editorial preservados al no tocar producto,
   rutas, contenido ni firmas de publicación.
4. **Contratos:** sin cambios en APIs ni contratos públicos; sin breaking changes.
5. **Fronteras:** sin imports ni cambios de capas; gate de boundaries no aplica al diff.
6. **Tests:** sin cambios de runtime ni cobertura; ejecutar verificación documental
   y tests existentes relevantes para corroborar cierres recientes.
7. **Rollback:** revertir esta unidad documental, incluidos movimientos y enlaces;
   no requiere rollback de datos ni producto.
8. **Riesgo:** bajo; principales riesgos son enlaces rotos, perder evidencia
   histórica o confundir cierre técnico con validación en producción. Mitigación:
   conservar antecedentes, comprobar enlaces y enumerar residuales.
