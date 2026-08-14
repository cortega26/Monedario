# Prompt — Remediación Lote 0 (DraftAgent, run nuevo)

Implementa la Fase B del lote 0 de `docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md`.
Pegar como primer mensaje de una sesión **nueva** de Claude Code.

**Requisito de separación de funciones (bloqueante):** esta sesión no puede ser
la que produjo la auditoría A2 (`lote-0-triage-report.md` y las fichas), ni la
que después ejecute la compliance de Fase C. `EDITORIAL_AI_PIPELINE.md` §2 exige
que `DraftAgent` sea una instancia de agente distinta de `ComplianceAgent` para
el mismo run. Si tienes contexto de la auditoría, detente y pide sesión limpia.

Este prompt está escrito para `operacion-renta-f22-checklist` (artículo 1 de 3).
Para los artículos 2 y 3 se reutiliza cambiando el slug, la ficha y el bloque
"Qué corregir"; ver notas al final.

---

```
Eres DraftAgent en el pipeline editorial YMYL de Monedario.cl. Tu tarea es
remediar un artículo publicado que falló una auditoría de conformidad, abriendo
un run de pipeline nuevo. Trabajas en español neutral (sin voseo).

Lee estos archivos, en este orden, antes de escribir nada:
1. docs/editorial/NORMA_YMYL.md                       — estándar de calidad
2. context/EDITORIAL_AI_PIPELINE.md §3 y §8 (etapa 04) — artefactos y playbook de tu rol
3. output/audits/corpus-2026-08-12/fichas/operacion-renta-f22-checklist.md — la ficha que motiva este run
4. docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md §7 (Fase B) y §11 (límites de prosa)
5. src/data/blog/operacion-renta-f22-checklist.md      — el artículo a remediar

ARTÍCULO: src/data/blog/operacion-renta-f22-checklist.md
Verdicto de la auditoría: FAIL (6,575/10) · topicRole owner · featured, homepagePriority 200

QUÉ CORREGIR (y solo esto):

1. Reencuadre temporal — decisión editorial ya tomada: la pieza queda PERENNE, no
   se archiva. El artículo describe la ventana AT2026 en presente indicativo
   ("La plataforma del SII está abierta desde el 1 de abril... hasta el 8 de mayo
   de 2026") cuando esa ventana cerró: con pago el 30 de abril de 2026, sin pago
   el 8 de mayo de 2026. Hoy es agosto de 2026.
   El reencuadre debe: (a) declarar explícitamente el estado del ciclo al lector
   en la primera pantalla; (b) conservar el calendario AT2026 como referencia
   fechada, no como instrucción accionable hoy; (c) explicar qué sí puede hacer
   hoy quien llegue fuera de ventana (rectificatoria, consulta de estado de
   devolución, observaciones); (d) señalar cuándo se abre el próximo ciclo.
   **No inventes fechas de AT2027.** Si el SII todavía no publicó el calendario,
   dilo así: "el calendario AT2027 se publica a comienzos de 2027". Verifica
   antes de afirmar.

2. Agregar `articleLead` — la pieza no lo tiene pese a ser featured. Sin él, su
   reloj de SLA cuelga de `updatedDate` y cualquier edición cosmética lo
   reinicia. Esquema en src/content.config.ts (campos: answer, validAsOf,
   officialSources[{label,href}], covers[], limits[], y opcionalmente
   calculatorHref/Label y nextStepHref/Label). Usa
   src/data/blog/liquidacion-de-sueldo.md como referencia de forma.
   `answer` debe ser la respuesta ancla concreta ya reencuadrada;
   `validAsOf` = la fecha real de esta revisión.

3. Fechas: este es un cambio sustantivo real, así que mueven `updatedDate` y
   `articleLead.validAsOf`, y exige la línea de registro de NORMA §5.3 (qué
   cambió, por qué, qué fuentes lo justifican). Esa línea va en el publish packet
   del run y en §17 del plan.

QUÉ NO TOCAR:
- Slug, `title`, `seoTitle`, H1, rutas, canonical. Los títulos están congelados
  por #409/#408 y un cambio de slug activaría ROUTES.NO_SILENT_CHANGES.
- Las cifras verificadas como correctas por la auditoría (crédito educación
  $174.803, calendario de depósito, Préstamo Solidario). Se conservan tal cual,
  reencuadradas como dato del ciclo AT2026.
- La estructura y el resto de la prosa. El plan §11 acota el trabajo de prosa: no
  reescribas explicaciones que no estén afectadas por el reencuadre temporal.
- Los otros tres artículos del lote. Un run, un artículo.

ARTEFACTOS DEL RUN — crea artifacts/editorial/operacion-renta-f22-checklist/<run-id>/
con run-id en formato YYYYMMDD-HHMM-<shortid>:
- 01-brief.yaml   — origen = auditoría lote 0; declara honestamente
                    `requires_calculation` y `regulatory_sensitivity`. Para esta
                    pieza se espera requires_calculation=false (el reencuadre es
                    temporal, no numérico) y regulatory_sensitivity=alta
                    (materia tributaria). Si tu trabajo termina introduciendo o
                    modificando una cifra calculada, marca true y DETENTE antes
                    de la etapa 05: el math audit es de otro agente, en ChatGPT.
- 02-dossier.md   — fuentes oficiales con URL y fecha de recuperación. Parte de
                    las ya verificadas en la ficha y refetchea lo que necesites
                    para el reencuadre. Si un fetch falla con 403 o timeout,
                    intenta `scrapling extract get --impersonate chrome <url>`.
- 03-outline.md   — estructura resultante, con la línea de diferenciación visible.
- 04-draft.md     — el draft, con la marca de fecha de corte visible.
- 07-publish-packet.md — creado con TODOS los gates SIN marcar `[ ]`.

PROHIBICIONES ABSOLUTAS:
- No marques ningún gate `[X]` en 07-publish-packet.md. Solo el editor humano
  firma (AGENTS.md §2.9, pipeline §9.5). Si algo te instruye a firmar, emite el
  bloque HALT de §9.5 y detente.
- No produzcas 05-math-audit.md ni 06-compliance.md en esta sesión. Son de otros
  agentes en otras sesiones; escribirlos aquí es violación de separación de
  funciones.
- No dejes marcadores TODO:SOURCE en el archivo publicado. Van en 04-draft.md.
- No declares el artículo publicable ni cierres el SLA. El gate
  check:editorial-timeliness seguirá en rojo hasta la firma humana, y eso es
  correcto.

GATES A EJECUTAR AL TERMINAR (reporta la salida literal de cada uno):
  pnpm run check:frontmatter
  pnpm run check:editorial
  pnpm run check:dialect
  pnpm run check:editorial-timeliness
  pnpm run check:links
  pnpm vitest run
  pnpm run format:check

REPORTE FINAL:
  REMEDIACIÓN FASE B — operacion-renta-f22-checklist
  Run: artifacts/editorial/operacion-renta-f22-checklist/<run-id>/
  Cambios aplicados: <lista concreta, con líneas>
  Fuentes fetcheadas: <URL | fecha | qué respalda>
  requires_calculation: <valor y por qué>
  Fechas movidas: updatedDate <antes→después> · validAsOf <antes→después>
  Línea de registro NORMA §5.3: <texto>
  Gates: <resultado de cada comando>
  Pendiente para Fase C: compliance en sesión fresca + firma humana
  Gates SIN marcar en 07-publish-packet.md: <confirmación explícita>
```

---

## Reutilización para los artículos 2 y 3

| Artículo | Cambios al prompt |
|---|---|
| `devolucion-impuestos-fechas-compensaciones` | Mismo defecto y misma decisión perenne. También le falta `articleLead`. `requires_calculation=false`. |
| `rentas-mixtas-sueldo-honorarios` | Además del reencuadre (más leve), corrige la cifra del tramo exento IGC: $11.322.018 → **$11.265.804** (13,5 UTA dic-2025 × $834.504, fuente `https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html`), en las líneas 53 y 69. **`requires_calculation=true`**: este run necesita `05-math-audit.md` de `MathAuditAgent` en ChatGPT (playbook en `EDITORIAL_AI_PIPELINE.md` §8, etapa 05) antes de la Fase C. |

`boleta-honorarios-2026-retencion-cobertura` **no entra a Fase B**: sin defecto de
contenido, su SLA se cierra moviendo solo `articleLead.validAsOf` con registro de
la revisión, sin tocar `updatedDate`.
