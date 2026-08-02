# Aplicabilidad del pipeline editorial

**Fecha efectiva documentada:** 2026-04-25
**Estado:** vigente para contenido YMYL nuevo y refreshes YMYL sustantivos.

El pipeline canónico de `context/EDITORIAL_AI_PIPELINE.md` exige siete artefactos, separación de funciones y decisión humana. Su evidencia solo puede afirmarse cuando los archivos existen y sus gates fueron resueltos por el rol autorizado. Ningún agente puede completar retroactivamente una firma humana.

El corpus histórico fue publicado bajo controles que evolucionaron y no posee de manera uniforme la cadena de siete artefactos. Para esas piezas se pueden afirmar únicamente controles verificables actuales —frontmatter, estructura, fuentes, vigencia, rutas, RSS y pruebas—, no una auditoría independiente histórica inexistente.

## Retroauditoría basada en riesgo

Prioridad inicial: UTM, AFC/seguro de cesantía, prepago y crédito. Cada refresh sustantivo abre un run nuevo, no altera el registro histórico, y sigue `docs/editorial/NORMA_YMYL.md`, separación de funciones y sign-off humano. Hallazgos sin capacidad de pipeline permanecen `BLOCKED_PENDING_EVIDENCE`.

Inventario reproducible: `node scripts/audit-editorial-pipeline-evidence.mjs`. Salida: `output/audits/editorial-pipeline-2026-08-02/`.
