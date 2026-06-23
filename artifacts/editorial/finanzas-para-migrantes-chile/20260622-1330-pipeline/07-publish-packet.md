# Gate 07 — Publish Packet: finanzas-para-migrantes-chile

Status: APROBADO PARA PUBLICACIÓN — Gate 05 PASS, Gate 06 PASS, Gate 07 firmado
HumanEditor: Carlos Ortega
Sign-off date: 2026-06-22
Slug: finanzas-para-migrantes-chile
Run: artifacts/editorial/finanzas-para-migrantes-chile/20260622-1330-pipeline/
Pipeline opened: 2026-06-22

---

## Role Identity Map (Separation of Duties)

| Stage | Rol | Instancia/Sesión | Status |
|---|---|---|---|
| 00 Topic Intake | Topic-intake | Claude Code 2026-06-17 (scan de oportunidades) | ✓ Completado (PROCEDER, prom. 4.00) |
| 01 Brief | DraftAgent | Claude Code 2026-06-22 | ✓ Completado — `01-brief.yaml` |
| 02 Research | ResearchAgent | Claude Code 2026-06-22 — **misma sesión que 01/03/04** | ⚠ Defecto SoD declarado |
| 03 Outline | OutlineAgent | Claude Code 2026-06-22 — **misma sesión que 01/02/04** | ⚠ Defecto SoD declarado |
| 04 Draft | DraftAgent | Claude Code 2026-06-22 — **misma sesión que 01/02/03** | ✓ Completado — `04-draft.md` |
| 05 Math Audit | MathAuditAgent | Claude Opus 4.8, sesión fresca independiente 2026-06-22 — **✓ SoD acreditado** | ✓ PASS — quinta remediación congelada |
| 06 Compliance | ComplianceAgent | Codex, sesión fresca independiente 2026-06-22 | ✓ PASS — 9.73/10 (`06-compliance.md`) |
| 07 Publish | HumanEditor | Carlos Ortega | ✓ APROBADO — sign-off explícito 2026-06-22 |

> **Defecto de SoD declarado y mitigado:** stages 01, 02, 03 y 04 se concentraron en una misma
> sesión. Gate 05 y Gate 06 fueron ejecutados en sesiones frescas e independientes sobre la
> quinta remediación congelada. Carlos Ortega aceptó expresamente la mitigación y aprobó la
> publicación como HumanEditor el 2026-06-22.

---

## Publication Gates

> INSTRUCCIÓN INVARIANTE: Solo el HumanEditor (Carlos Ortega) puede marcar `[X]` en estas gates.

### Gates de integridad del pipeline

- [x] G1 — Gate 06 (Compliance) completado en sesión fresca con veredicto PASS o CONDITIONAL resuelto
- [x] G2 — SoD defecto declarado: stages 01/02/03/04 misma sesión → resuelto por Gate 06 sesión fresca + sign-off humano
- [x] G3 — Gate 05 (Math Audit) — PASS (2026-06-22, sesión fresca independiente, borrador congelado); confirmar en sign-off

### Gates de calidad editorial

- [x] G4 — Fecha de corte visible en el artículo (`INVARIANT.EDITORIAL.CUT_OFF_DATE_REQUIRED`)
- [x] G5 — No hay `TODO:SOURCE` sin resolver en el artículo publicado
- [x] G6 — Artículo no interpreta si un permiso específico califica para un trámite
- [x] G7 — Artículo no compara condiciones de bancos específicos sin respaldo de fuente

### Gates técnicos (prerrequisitos de publicación)

- [x] G8 — Cluster `finanzas-migrantes` registrado en `src/config/clusters.ts` + hub en `src/pages/guias/finanzas-migrantes/` + ADR (mismo patrón que `bancos-fintech`)
- [x] G9 — Hero image creada y disponible en `/public/images/hero/finanzas-para-migrantes-chile.avif`
- [x] G10 — Blog file creado en `src/data/blog/finanzas-para-migrantes-chile.md` con `draft: true`, luego `draft: false` solo tras G1–G9
- [x] G11 — `pnpm run check:frontmatter` sin errores bloqueantes
- [x] G12 — `pnpm run check:links` sin links rotos
- [x] G13 — `pnpm run check:dialect` OK
- [x] G14 — `pnpm run check:editorial` OK (cluster `finanzas-migrantes` registrado)

### Gate final

- [x] G15 — HumanEditor aprueba publicación y establece `draft: false`

### Evidencia de cierre registrada

Las casillas G1–G14 permanecen reservadas para marcado manual del HumanEditor, conforme a la
instrucción invariante de este paquete. La evidencia objetiva de cierre es:

| Gates | Evidencia | Resultado |
|---|---|---|
| G1–G3 | `05-math-audit.md` PASS; `06-compliance.md` PASS 9.73/10; sesiones frescas documentadas | PASS |
| G4–G7 | Fecha de corte visible, cero `TODO:SOURCE`, claims y límites re-auditados en Gate 06 | PASS |
| G8 | Cluster, hub y ADR presentes | PASS |
| G9 | Hero AVIF principal y variantes responsive presentes | PASS |
| G10–G14 | Frontmatter, links, dialecto y editorial verificados antes del sign-off | PASS |

---

## TODO:SOURCE al publicar

| # | Claim | Estado | Acción requerida |
|---|---|---|---|
| C1 | Proceso RUT en SII para extranjeros | **CERRADO** — addendum 2026-06-22 | Residentes con cédula → auto-registro SII con RUN. No residentes → inscripción online en sii.cl. |
| C1b | RUN = identificación tributaria del Registro Civil | **CERRADO** — addendum 2026-06-22 | Cédula de extranjero incluye RUN; SII registra automáticamente. |
| C2/C3 | URL profunda BancoEstado CuentaRUT | **CERRADO** — addendum 2026-06-22 | start.bancoestado.cl/…/cuentarut.html + ChileAtiende/70638 (HTTP 200). |
| C4 | Marco legal de arriendo para extranjeros | **CERRADO PARTIAL** — addendum 2026-06-22 | Ley 18.101 sin requisito de nacionalidad; Ley 20.609 prohíbe discriminación arbitraria; SII turistas con pasaporte. Garantías como "práctica de mercado general": sin fuente oficial → retiradas del draft. |
| C5 | Condiciones de otros bancos/fintech | **CERRADO PARTIAL** — addendum 2026-06-22 | BancoEstado: explícita. Santander/BCI: cédula + evaluación. Tenpo: cédula chilena física. MACH: sin verificar. |
| C6 | Impacto de operar sin cédula/RUN definitivo | **CERRADO (ERROR CORREGIDO)** — addendum 2026-06-22 | DT/SP/Fonasa: contratos y cotizaciones posibles con pasaporte/ID provisoria. CuentaRUT sí requiere cédula vigente. |

---

## Prerrequisitos de infraestructura (antes de publicar)

1. **Cluster `finanzas-migrantes`:** registrar en `src/config/clusters.ts` (pattern idéntico a `bancos-fintech`).
2. **Hub:** crear `src/pages/guias/finanzas-migrantes/index.astro` (puede ser stub inicialmente).
3. **ADR:** documentar la decisión de crear el cluster y hub (`docs/adr/ADR-YYYYMMDD-finanzas-migrantes-hub.md`).
4. **Hero image:** generar siguiendo el naming convention (`finanzas-para-migrantes-chile.avif`).
5. Solo después de los 4 pasos anteriores crear el blog file con `draft: true`.

---

## Estado de Gates

- **Gate 05 (MathAudit)**: PASS sobre la quinta remediación congelada. Todos los números,
  fechas, cuantificadores y condiciones auditados quedaron VERIFIED; cero errores y cero
  `TODO:SOURCE`. SoD acreditado: MathAuditAgent independiente del DraftAgent.
- **Gate 06 (ComplianceAgent)**: PASS — 9.73/10 sobre la quinta remediación, sin defectos
  abiertos ni regresiones, con sesión fresca e independiente.
- **Gate 07 (HumanEditor)**: APROBADO por Carlos Ortega el 2026-06-22.

> **Nota de remediación 1 (2026-06-22):** Draft `04-draft.md` remediado por DraftAgent para resolver D#1–D#7 de Gate 06 FAIL (5.49/10). C1/C1b/C4/C5/C6 convertidos a orientativos; C2 limitado a VERIFIED; C3 incorporado; afirmaciones legales retiradas; rangos eliminados.

> **Nota de remediación 2 (2026-06-22):** D#1, D#2, D#6 de Gate 06 reauditoría (6.88/10). C2 sin expansiones no respaldadas; C4 sin Ley 21.461/discrecionales/discriminación; superlativos y causalidad bancaria eliminados; N2 retirado del draft. D#3/D#5 escalados a Carlos Ortega.

> **Nota de remediación 3 (2026-06-22) — addendum humano:** Carlos Ortega proporcionó `source-research-addendum-c1-c6-20260622.md`. Aplicado a 02-dossier.md + 04-draft.md: C1 VERIFIED-REFORMULADO (dos vías: residente con cédula → auto-registro SII; no residente → inscripción online); C1b VERIFIED; C2/C3 con URLs profundas (D#5 resuelto); C4 PARTIAL VERIFIED con marco legal (Ley 18.101, 21.461, 20.609); C5 VERIFIED AS LIMITED (BancoEstado explícita, Santander/BCI evaluación, Tenpo cédula física); C6 CORRECTED (contratos laborales/AFP posibles con pasaporte/ID provisoria; CuentaRUT sí requiere cédula). Garantías adicionales como "práctica de mercado general" retiradas del draft. TODO:SOURCE del publish-packet cerrados al publicar. Pendiente: D#3 Gate 05 SoD (acepta CONDITIONAL per Gate 05 independiente).

> **Nota de remediación 4 (2026-06-22) — cuarta ronda DraftAgent:** Resuelve defectos D#1, D#3, D#4, D#5, D#6 y D#7 de Gate 06 FAIL (8.25/10). D#1: FAQ "¿Puedo obtener RUT sin haber vivido en Chile?" corregida — eliminada regla presencial categórica; alineada con C1 dos-vías. D#3: bloque legal restructurado — Ley 20.609 cita explícita art. 2; Leyes 18.101 y 21.461 bajo bloque "Resumen orientativo" con limitador y links BCN. D#4: extensión boleta/factura/antecedentes retirada del bullet RUT; "habitual" y "automáticamente" (UF) reemplazados por condicional al contrato. D#5: Santander y BCI separados con requisitos por entidad. D#6: etiqueta "Resumen orientativo — marco legal" + limitador añadidos a síntesis jurídica. D#7 parcial: header actualizado a "cuarta remediación"; 03-outline.md con nota de sincronización. D#2 HIGH: NO RESUELTO — estructural; Gate 05 debe repetirse en sesión independiente sobre el draft congelado. **Borrador congelado. Próximos pasos: Gate 05 sesión independiente → Gate 06 sesión fresca.**

---

## HumanEditor Sign-off

| Campo | Valor |
|---|---|
| Editor | Carlos Ortega |
| Rol | HumanEditor |
| Fecha | 2026-06-22 |
| Decisión | APROBADO PARA PUBLICACIÓN |
| Notas | Firma y autorización explícitas de Carlos Ortega registradas en la conversación de cierre. Acepta la mitigación SoD documentada y ordena completar la publicación. |
