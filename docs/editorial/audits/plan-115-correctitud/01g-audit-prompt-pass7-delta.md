# Prompt pass7 delta — plan 115 (verificación de D25)

> Copia íntegra en una **sesión fresca**, de otra familia que el agente que
> remedió. Rol: `MathAuditAgent` (adversarial), `AI_AUDIT_PROTOCOL` (matriz de
> superficies, §5).

---

Role: MathAuditAgent (adversarial) — protocolo `AI_AUDIT_PROTOCOL`.

Contexto: la pasada 6 devolvió `CONDITIONAL` con **D25 como único defecto de
producto abierto** (D16–D24 verificados resueltos). La remediación se aterrizó
en `bdf26fe7` (PR #603): la interpolación económica se extrajo a
`src/utils/economicInterpolation.ts` (compartida con el plugin remark) y se
aplicó a `/llms-full.txt`, más un check postbuild nuevo. Esta pasada es una
**verificación delta**: confirma o refuta el fix y cierra el artefacto si
corresponde. No confíes en el remediador: re-deriva desde el artefacto
construido.

**IMPORTANTE — worktree limpio de `bdf26fe7`.** El checkout principal tiene WIP
ajeno en curso (migración de hero-images/entrega visual, sin commitear, con
tests antiguos fallando a propósito a mitad de migración). No lo toques y no lo
reportes como defecto de este plan: corre todo en un worktree limpio del SHA.

**Parte 1 — verifica D25**

- `dist/llms-full.txt` del build debe tener **cero** ocurrencias de
  `[[expr | fmt]]` sin interpolar y contener los valores resueltos (p. ej.
  `$968.234`, `$71.721`). Verifica también que las páginas HTML de
  `impuesto-global-complementario-chile` y `sueldo-imponible-chile` no
  expongan `[[`.
- El check postbuild `llms-full-no-raw-interpolation` debe existir, pasar sobre
  el dist real (24 checks en total) y fallar sobre un `llms-full.txt` sintético
  con `[[utm * 13.5 | clp]]` (ver `tests/scripts/check-postbuild.test.ts`).
- El refactor del plugin no puede cambiar su contrato:
  `tests/unit/remarkEconomicVariables.test.ts` (mensajes exactos, snapshot
  ausente, trailing garbage) y `tests/unit/economicInterpolation.test.ts`
  verdes.
- Borde: verifica que ningún artículo use `[[…|…]]` dentro de code spans/blocks
  (el plugin los salta; la interpolación de texto plano de llms-full no
  distingue). Si existiera, es defecto (`surface: product`).

**Regresiones obligatorias** (worktree limpio de `bdf26fe7`):

- `pnpm run test` (suite completa) y `pnpm run check:ci`.
- `pnpm run build` + `node scripts/check-postbuild.mjs dist` (24 checks).
- `SMALL_DETAILS_ENFORCE=1 pnpm run check:small-details` (D16 no puede volver).
- Guardas: `dap-no-retention-surfaces`, `at-taxonomy-consistency`,
  `honorarios-rate-year-consistency`, `audit-scope-consistency`.

**Salida** (actualiza, no reescribas historia):

- `02-result.json` — D25 con `status: resolved` y evidencia verificada;
  `verdict`: `PASS` si y solo si quedan 0 defectos **de producto** abiertos
  (los de `audit-package` se listan y no bloquean); `humanSignoff: null`.
  Deja explícito en el informe que `PASS` es **pre-gate**: la firma humana
  (Carlos Ortega) se registra después y no la sustituye este veredicto.
- `03-report.md` — sección «Pass7 delta»: verificación de D25, borde de
  code spans, regresiones, veredicto y limitaciones.
- Evidencia numerada desde `62-` (no pises 01–61).

Reglas R1–R8 vigentes: nada de aritmética de memoria, anclaje a fuente primaria
con extracto, trazabilidad comando+salida, adversarial en bordes, veredicto
explícito, reproducibilidad (SHA + entorno), y **no modifiques `src/`**.
