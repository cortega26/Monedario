# Growth Engine — contrato operativo

Fecha: 2026-10-01 · Fase actual: **0 (report-only)** · Registro:
`src/config/growth-opportunity-registry.json`

Convierte la señal de tráfico que el repo ya recopila (GSC + analytics
first-party en `output/operations/data-signals/`) en oportunidades
priorizadas, y clasifica los fallos de gate por tipo de acción. En Fase 0
**solo observa y reporta**.

## 1. Autonomía proporcional al riesgo

| Nivel | Acción | Autonomía | Fase |
|---|---|---|---|
| **A0** | Detectar, puntuar, reportar | Total (read-only) | 0 (activa) |
| **A1** | Fix mecánico/determinista (formato, índices, lockfile, snapshot) | Auto-PR + auto-merge con CI verde | 1 |
| **A2** | Cambio reversible y medible (title/meta, links internos, freshness de datos máquina) | Auto-PR; automerge solo con umbral pre-declarado | 2 |
| **A3** | Números YMYL, legal, URL nueva, corrección material | Humano siempre | 3 |

Reglas de frontera: `URL.PUBLIC.NO_POST_ID`, FOCO ESTRICTO hasta
2026-11-02, `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` y
`INVARIANT.EDITORIAL.RISK_TIERS` mandan sobre cualquier automatización.

## 2. Detectores (Fase 0)

| Detector | Señal | Uso propuesto | Tier |
|---|---|---|---|
| `striking_distance_query` | Posición 5–15, impresiones ≥ mínimo, CTR bajo la curva esperada | Title/meta/intención | A2 |
| `ctr_gap_page` | Página top-10 con CTR bajo la mitad de lo esperado | Snippet (caso F5) | A2 |
| `decay_page` | Clicks caen ≥25% con impresiones estables (semana vs semana previa) | Refresh/frescura | A2 |
| `cannibalization_query` | Misma query con ≥2 URLs propias con impresiones | Consolidar/enlazar | A3 |
| `calculator_funnel` | `view→start` o `start→complete` bajo umbral con muestra suficiente | UX/copy | A3 |

Cada candidato incluye: `id` estable, tipo, evidencia, `expectedGain`,
`score`, hipótesis redactada y experimento recomendado (métrica, umbral,
`n_min`, ventana 14/28 días, rollback). Umbrales y curva de CTR viven en el
registro.

## 3. Disciplina estadística

- `n_min = ceil(ln(0,05) / ln(1−p))` al 95%; sin muestra suficiente el
  reporte dice `SIN DATOS SUFICIENTES`, nunca 0%.
- Nada se evalúa con <2 semanas comparables; un experimento a la vez.
- Los confounders se anotan en el registro del experimento antes de
  ejecutarlo (pre-registro), como en F5.

## 4. `doctor`

`pnpm run doctor` corre un subconjunto rápido de gates y clasifica cada
fallo:

| Categoría | Ejemplos | Acción esperada |
|---|---|---|
| `mechanical` | prettier, docs structure, lastmod, lockfile | A1 (regenerar) |
| `data` | snapshot vencido, consistencia de fuentes | A1 si el worker lo cubre; si no, issue |
| `editorial` | frontmatter, timeliness, risk-tiers | Agente/humano con auditoría separada |
| `contract` | URLs, rutas, freeze, postbuild | Humano (arquitectura) |
| `unknown` | sin regla | Humano (revisar regla) |

Es report-only: no corrige nada. En Fase 1 su clasificación alimenta a
`self-heal` (A1) y a la apertura de issues (resto).

## 5. Fases y promoción

1. **Fase 0 (2026-10, activa):** detectores y doctor en modo reporte,
   semanal. Objetivo: calibrar umbrales y medir ruido 2 semanas.
2. **Fase 1:** si la revisión del 2026-11-02 aprueba continuidad: doctor →
   self-heal A1 + auto-rollback + source-watch.
3. **Fase 2:** A2 con plan permanente aprobado por tier y auto-revert por
   umbral; WIP=1.
4. **Fase 3:** regeneración A1 de datos máquina; A3 sigue humano.

Promoción de candidato a experimento: issue con spec → aprobación del owner
→ entrada en `experiments` del registro → ejecución (humano/agente) →
`evaluate-experiments.mjs` (Fase 2) dicta keep/revert/extend.

## 6. Guardrails

- Todo cambio real pasa por PR + CI; ningún detector escribe contenido.
- Sin PII en reportes ni prompts (solo agregados).
- Límites: PRs automáticos/día, minutos Actions, kill switch por workflow.
- Cada acción futura deja traza (issue/PR) con causa e idempotencia.

## 7. Métricas del sistema

- Oportunidades detectadas / promovidas / con veredicto.
- Tasa de falsos positivos por detector (revisión mensual).
- MTTR de fallos y % de fallos clasificados como `unknown`.
- Resultado externo: clicks/impresiones/CTR orgánicos por cohorte, con
  confounders anotados.
