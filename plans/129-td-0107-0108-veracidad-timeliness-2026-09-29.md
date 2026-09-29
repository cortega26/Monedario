# Plan 129 — TD-0107 (veracidad explícita) + TD-0108 (gate y cola de backfill)

- **Status**: DONE
- **Fecha**: 2026-09-29
- **Owner**: Carlos Ortega (revisión editorial) / agente (implementación)
- **Scope in**: `src/config/editorial-timeliness-policy.json`,
  `src/config/editorial-volatile-data-registry.json`,
  `scripts/lib/editorial-timeliness-policy.mjs`,
  `scripts/check-editorial-timeliness.mjs`,
  `tests/scripts/check-editorial-timeliness.test.ts`,
  `tests/static-analysis/timeliness-veracity-contract.test.ts`,
  `context/INVARIANTS.md`, `docs/TECH_DEBT_BACKLOG.md`, `plans/README.md`.
- **Scope out**: `src/data/blog/**` (backfill de `articleLead` = autoría YMYL;
  va a cola con auditoría independiente), WIP de hero-images y SEO-SERP de otras
  sesiones.

## Contexto

- TD-0107 (sev 4): `stale` deriva solo de `dueDate`; `stale=0` no certifica
  veracidad. 4+ auditorías del batch 2026-09 hallaron hechos duros falsos en
  artículos "frescos".
- TD-0108 (sev 3): 13 publicados sin `validAsOf` absorbidos en silencio.
- Hallazgo nuevo (2026-09-29): los 13 **no tienen `articleLead`** (schema:
  `articleLead.validAsOf` opcional dentro de un objeto opcional con `answer`
  obligatorio). El backfill requiere autoría del bloque lead + fuentes, y por
  `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` su auditoría va en sesión aparte.

## Cambios

1. **Política** (`editorial-timeliness-policy.json`):
   - `semantics`: `stale=0` = cumplimiento de cadencia, no verificación;
     `veracitySignals` (datasets, fuentes oficiales, gates, auditorías).
   - `hardFacts`: hechos duros con más hallazgos repetidos (tramos IUSC art. 52
     bis, UF, SuperIR art. 260, retención DAP no residentes, tasa honorarios por
     año comercial, topes finiquito) con `owner`, `verification` y cadencia o
     dataset.
2. **Registry volátil**: `owner` en los 8 datasets (hoy vacío).
3. **Loader**: valida `semantics`/`hardFacts` cuando están presentes (contrato,
   no documentación muerta).
4. **Gate**: reporte con `semantics` + `veracity.missingValidAsOf*`; warning
   explícito por publicado sin `validAsOf` (no fatal, CI sigue verde); nota de
   semántica en consola.
5. **Contrato estático** (`tests/static-analysis/`): política real declara
   semántica y hardFacts con owner/verificación; datasets con owner; refs de
   dataset existentes.
6. **Invariante**: `INVARIANT.EDITORIAL.TIMELINESS_REVIEW_SLA` declara
   explícito que frescura ≠ veracidad.
7. **TD-0107**: cerrado (criterios 1–3 cumplidos). **TD-0108**: parcial — gate
   explícito + cola de los 13 con owner y ruta (articleLead + auditoría);
   backfill queda abierto con severidad 3.

## Cola TD-0108 (13 artículos)

| Artículo | Dato duro | Ruta propuesta |
|---|---|---|
| que-es-la-uf | UF (dataset `economic.uf.value`) | articleLead + `validAsOf` = updatedDate; auditoría de superficies |
| que-es-el-ipc-chile-como-se-calcula | IPC (dataset) | ídem |
| reajuste-arriendo-uf-ipc-chile | UF/IPC (datasets) | ídem |
| como-cambiarse-de-afp | comisiones/topes (datasets AFP) | ídem |
| licencia-medica-desde-que-dia-pagan | montos/plazos subsidio | triaje: fuente primaria o `evergreen` |
| fondos-mutuos-comisiones-rescate-impuestos | comisiones/rescate | triaje |
| ahorro-e-inversion-en-chile-...-2026 | costos/impuestos | triaje |
| como-invertir-en-etfs-desde-chile | costos | triaje |
| interes-compuesto-nota-metodologica | ejemplos matemáticos | evaluar `evergreen` |
| como-hacer-presupuesto-mensual-chile | ejemplos | evaluar `evergreen` |
| estafas-financieras-chile-... | sin montos duros | evaluar `evergreen` |
| fraude-tarjeta-que-hacer | plazos/leyes | triaje |
| suplantacion-identidad-creditos-no-reconocidos | plazos/leyes | triaje |

## Criterios de cierre

- [x] TD-0107: semántica explícita en política + invariante; hardFacts con
      owner/verificación; `check:editorial-timeliness` verde.
- [x] TD-0108: gate advierte explícitamente sin `validAsOf`; cola versionada con
      owner; TD actualizado a parcial (en curso).
- [x] Tests nuevos verdes; `check:ci` y build sin regresiones.

## Evidencia

- `pnpm run check:editorial-timeliness` verde con 13 warnings explícitos
  `missingValidAsOf=13` + nota de semántica.
- `tests/scripts/check-editorial-timeliness.test.ts`: 17/17 (4 nuevos).
- `tests/static-analysis/timeliness-veracity-contract.test.ts`: 4/4.
- Worktree limpio: suite completa 1792 passed / 1 skipped; `check:ci` y build
  sin regresiones (ver PR).
