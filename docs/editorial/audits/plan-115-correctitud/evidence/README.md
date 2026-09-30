# Evidencia

Salidas crudas del audit: outputs de comandos, extractos textuales de fuentes
primarias con fecha de consulta, harness independientes y capturas. Cada claim
de `02-result.json` debe apuntar aquí vía `reproduction.output` o
`source.quote`/`evidenceRef`.

## Versionado de harness

| Ruta | Qué audita | Estado |
|---|---|---|
| `pass5.generate-evidence.sh` + `pass5.dap-retention-sweep.py` + `pass5.d21-compare.mjs` | Pass 5 (2026-09-29) delta sobre `c1701ad5`: D17–D21, barrido DAP↔retención y motor IUSC vs SII/glosario; salidas en `44-…` a `55-…` | **Actual (delta)** |
| `pass4.independent.audit.test.ts` (+ `vitest.pass4.config.ts`) | Pass 4 (2026-09-29) sobre `72d14e66`/`30d6e39a`: 73 checks motor vs reimplementación independiente (V1–V6, bordes, freshness, effective-dated) | **Actual para V1–V6** (el motor no cambió desde `30d6e39a` salvo `EffectiveDatedParameters.ts`, re-ejecutado en pass5); salida en `36-…` y `43-…` |
| `reaudit.independent.audit.test.ts` (+ `vitest.reaudit.config.ts`) | Re-auditoría sobre `8b73793` (HEAD tras la remediación D1–D8) | Histórico |
| `pass3.independent.audit.test.ts` (+ `vitest.pass3.config.ts`) | Pass 3 (2026-09-29) sobre `9e195743`: 97 checks | Histórico |
| `audit-1/` (`recalc.audit.test.ts` + `vitest.audit.config.ts`) | Primera auditoría sobre `d1b12374` (pre-remediación) | **Histórico** — sus expectativas fijan el estado auditado; falla en HEAD por diseño (no corregir: es el registro) |

## Índice pass5 (delta `c1701ad5`)

| Archivo | Contenido |
|---|---|
| `44-env-pass5.txt` | Entorno, SHA del worktree, lock sha256 y comandos de reproducción |
| `45-sources-pass5.md` | Fuentes primarias SII/LeyChile con URL, extracto, fecha y sha256 |
| `46-d17-verification.txt` … `50-d21-verification.txt` | Verificación por defecto D17–D21 (comando + salida + render) |
| `51-regressions-pass5.txt` | Suite, `check:ci`, `SMALL_DETAILS_ENFORCE=1` y gates extra |
| `52-build-postbuild-pass5.txt` | `pnpm run build` + `check-postbuild` (332 páginas, 23 checks) |
| `53-guards-pass5.txt` | Guardas mandatadas + test de dominio (5 archivos / 21 tests) |
| `54-surface-sweep-pass5.txt` | Barrido de superficies y residuales nuevos D23/D24 |
| `55-artifact-validation-pass5.txt` | Validación del `02-result.json` pass5 + diff de la remediación |

Nota: `pass5.generate-evidence.sh` regenera 44–50 y 54 desde el worktree; las
secciones 51–53 reutilizan logs de la corrida (comandos en `03-report.md` §8.2).

## Índice pass6 (delta `02b878a7`)

| Archivo | Contenido |
|---|---|
| `56-env-pass6.txt` | Entorno y SHA del worktree |
| `57-d23-verification.txt` / `58-d24-verification.txt` | Verificación por defecto D23/D24 (comando + salida + render) |
| `59-class-sweep-pass6.txt` | Barrido de clase A (retención DAP) y B (umbrales CLP), exhaustivo |
| `60-d25-finding.txt` | Hallazgo D25 (`[[...]]` crudo en `dist/llms-full.txt`) |
| `61-regressions-pass6.txt` | Suite, `check:ci`, small-details enforce, build+postbuild, guardas |

## Índice pass7 (delta `bdf26fe7`)

| Archivo | Contenido |
|---|---|
| `62-env-pass7.txt` | Entorno, SHA del worktree e install |
| `63-d25-verification.txt` | D25: 0 `[[` en `dist/llms-full.txt`, valores + recálculo Decimal, HTML 2 posts |
| `64-postbuild-plugin-pass7.txt` | Check postbuild (24 + sintético), contrato del plugin, barrido total del dist |
| `65-codespan-edge-pass7.txt` | Borde: `[[…\|…]]` en code spans/blocks (0/131 archivos) |
| `66-regressions-pass7.txt` | Suite 188/1804, `check:ci`, small-details enforce, build+postbuild, guardas |

Comandos:

```bash
# Pass 4 (debe pasar en HEAD)
pnpm exec vitest run --config docs/editorial/audits/plan-115-correctitud/evidence/vitest.pass4.config.ts

# Re-auditoría previa (histórica)
pnpm exec vitest run --config docs/editorial/audits/plan-115-correctitud/evidence/vitest.reaudit.config.ts

# Primera auditoría (histórico, solo referencia)
pnpm exec vitest run --config docs/editorial/audits/plan-115-correctitud/evidence/audit-1/vitest.audit.config.ts
```
