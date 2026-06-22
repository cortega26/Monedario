# Gate 07 — Publish Packet: finanzas-para-migrantes-chile

Status: GATES 01–04 COMPLETADOS — pendiente Gate 06 (sesión fresca) + Gate 07 (HumanEditor)
HumanEditor: — (Carlos Ortega)
Sign-off date: —
Slug: finanzas-para-migrantes-chile (provisional)
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
| 05 Math Audit | MathAuditAgent | DeepSeek V4 Pro, sesión fresca independiente 2026-06-22 — **✓ SoD acreditado** | ✓ CONDITIONAL — ver `05-math-audit.md` (reemplazado por auditoría independiente) |
| 06 Compliance | ComplianceAgent | Codex, sesión fresca independiente 2026-06-22 | ✗ FAIL — 8.86/10 (`06-compliance.md`) |
| 07 Publish | HumanEditor | Carlos Ortega | ⬜ PENDIENTE |

> **Defecto de SoD declarado:** stages 01, 02, 03 y 04 los produjo la MISMA sesión (2026-06-22).
> Gate 06 (Compliance) DEBE ejecutarse en una sesión Claude Code completamente fresca — NO puede
> ser continuación de esta sesión ni tener acceso a los drafts producidos en la misma.
> Gate 07 requiere sign-off de Carlos Ortega (HumanEditor) tras revisar Gate 06.

---

## Publication Gates

> INSTRUCCIÓN INVARIANTE: Solo el HumanEditor (Carlos Ortega) puede marcar `[X]` en estas gates.

### Gates de integridad del pipeline

- [ ] G1 — Gate 06 (Compliance) completado en sesión fresca con veredicto PASS o CONDITIONAL resuelto
- [ ] G2 — SoD defecto declarado: stages 01/02/03/04 misma sesión → resuelto por Gate 06 sesión fresca + sign-off humano
- [ ] G3 — Gate 05 (Math Audit) — NO REQUERIDO; confirmar en sign-off

### Gates de calidad editorial

- [ ] G4 — Fecha de corte visible en el artículo (`INVARIANT.EDITORIAL.CUT_OFF_DATE_REQUIRED`)
- [ ] G5 — No hay `TODO:SOURCE` sin resolver en el artículo publicado
- [ ] G6 — Artículo no interpreta si un permiso específico califica para un trámite
- [ ] G7 — Artículo no compara condiciones de bancos específicos sin respaldo de fuente

### Gates técnicos (prerrequisitos de publicación)

- [ ] G8 — Cluster `finanzas-migrantes` registrado en `src/config/clusters.ts` + hub en `src/pages/guias/finanzas-migrantes/` + ADR (mismo patrón que `bancos-fintech`)
- [ ] G9 — Hero image creada y disponible en `/public/images/hero/finanzas-para-migrantes-chile.avif`
- [ ] G10 — Blog file creado en `src/data/blog/finanzas-para-migrantes-chile.md` con `draft: true`, luego `draft: false` solo tras G1–G9
- [ ] G11 — `pnpm run check:frontmatter` sin errores bloqueantes
- [ ] G12 — `pnpm run check:links` sin links rotos
- [ ] G13 — `pnpm run check:dialect` OK
- [ ] G14 — `pnpm run check:editorial` OK (cluster `finanzas-migrantes` registrado)

### Gate final

- [ ] G15 — HumanEditor aprueba publicación y establece `draft: false`

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

- **Gate 05 (MathAudit)**: CONDITIONAL — artefacto `05-math-audit.md` reemplazado 2026-06-22 por auditoría independiente en sesión fresca (DeepSeek V4 Pro). N1 (12 años), N2 (rango 12–17), N3 (2026-06-22), N4 (2026-06-17) y 7 condiciones de C2/C3 VERIFIED sin ampliaciones. 4 defectos de cuantificadores sin respaldo (Q1 MEDIUM, Q2–Q4 INFO) — sin errores aritméticos. SoD acreditado: DraftAgent ≠ MathAuditAgent. **Carlos Ortega debe decidir si acepta CONDITIONAL o requiere resolver cuantificadores.** ⚠ **D#2 HIGH (Gate 06 tercera auditoría):** Gate 05 auditó el draft en versión anterior (claims aún TODO:SOURCE). Debe repetirse en sesión independiente sobre el draft congelado (cuarta remediación) antes de Gate 07.
- **Gate 06 (ComplianceAgent)**: FAIL tercera evaluación (8.25/10) — ver `06-compliance.md`. Draft remediado por cuarta vez 2026-06-22 (D#1 FAQ corregida, D#3 art. 2 Ley 20.609 citado, D#4 extensiones C4 retiradas, D#5 atribución por entidad, D#6 resumen orientativo). Re-auditoría requerida en nueva sesión fresca.
- **Gate 07 (HumanEditor)**: PENDIENTE.

> **Nota de remediación 1 (2026-06-22):** Draft `04-draft.md` remediado por DraftAgent para resolver D#1–D#7 de Gate 06 FAIL (5.49/10). C1/C1b/C4/C5/C6 convertidos a orientativos; C2 limitado a VERIFIED; C3 incorporado; afirmaciones legales retiradas; rangos eliminados.

> **Nota de remediación 2 (2026-06-22):** D#1, D#2, D#6 de Gate 06 reauditoría (6.88/10). C2 sin expansiones no respaldadas; C4 sin Ley 21.461/discrecionales/discriminación; superlativos y causalidad bancaria eliminados; N2 retirado del draft. D#3/D#5 escalados a Carlos Ortega.

> **Nota de remediación 3 (2026-06-22) — addendum humano:** Carlos Ortega proporcionó `source-research-addendum-c1-c6-20260622.md`. Aplicado a 02-dossier.md + 04-draft.md: C1 VERIFIED-REFORMULADO (dos vías: residente con cédula → auto-registro SII; no residente → inscripción online); C1b VERIFIED; C2/C3 con URLs profundas (D#5 resuelto); C4 PARTIAL VERIFIED con marco legal (Ley 18.101, 21.461, 20.609); C5 VERIFIED AS LIMITED (BancoEstado explícita, Santander/BCI evaluación, Tenpo cédula física); C6 CORRECTED (contratos laborales/AFP posibles con pasaporte/ID provisoria; CuentaRUT sí requiere cédula). Garantías adicionales como "práctica de mercado general" retiradas del draft. TODO:SOURCE del publish-packet cerrados al publicar. Pendiente: D#3 Gate 05 SoD (acepta CONDITIONAL per Gate 05 independiente).

> **Nota de remediación 4 (2026-06-22) — cuarta ronda DraftAgent:** Resuelve defectos D#1, D#3, D#4, D#5, D#6 y D#7 de Gate 06 FAIL (8.25/10). D#1: FAQ "¿Puedo obtener RUT sin haber vivido en Chile?" corregida — eliminada regla presencial categórica; alineada con C1 dos-vías. D#3: bloque legal restructurado — Ley 20.609 cita explícita art. 2; Leyes 18.101 y 21.461 bajo bloque "Resumen orientativo" con limitador y links BCN. D#4: extensión boleta/factura/antecedentes retirada del bullet RUT; "habitual" y "automáticamente" (UF) reemplazados por condicional al contrato. D#5: Santander y BCI separados con requisitos por entidad. D#6: etiqueta "Resumen orientativo — marco legal" + limitador añadidos a síntesis jurídica. D#7 parcial: header actualizado a "cuarta remediación"; 03-outline.md con nota de sincronización. D#2 HIGH: NO RESUELTO — estructural; Gate 05 debe repetirse en sesión independiente sobre el draft congelado. **Borrador congelado. Próximos pasos: Gate 05 sesión independiente → Gate 06 sesión fresca.**

---

## HumanEditor Sign-off

| Campo | Valor |
|---|---|
| Editor | — (Carlos Ortega) |
| Rol | HumanEditor |
| Fecha | — |
| Decisión | — (PENDIENTE) |
| Notas | — |
