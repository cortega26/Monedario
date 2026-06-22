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
| 05 Math Audit | MathAuditAgent | Claude Sonnet 4.6, sesión fresca 2026-06-22 (remediación) | ✓ Eximido — `05-math-audit.md` |
| 06 Compliance | ComplianceAgent | **SESIÓN FRESCA REQUERIDA** | ✗ FAIL — reauditoría 6.88/10 (`06-compliance.md`) |
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
| C1 | Proceso RUT en SII para extranjeros (documentos, pasos, presencialidad) | ABIERTO | Verificar en sii.cl antes de afirmar pasos específicos en el blog file |
| C1b | RUT definitivo = RUN del Registro Civil | ABIERTO | Verificar en registrocivil.cl |
| C4 | Práctica de garantías adicionales en arriendo | PARCIAL | Descrito como costumbre de mercado; verificar si hay normativa CMF o circular SERVIU aplicable |
| C5 | Condiciones de otros bancos/fintech para extranjeros | ABIERTO | Verificar con cada entidad antes de agregar al artículo |
| C6 | Impacto de operar sin RUT (AFP, empleo formal, cuenta corriente) | ABIERTO | Verificar en fuentes laborales/tributarias antes de afirmar |

---

## Prerrequisitos de infraestructura (antes de publicar)

1. **Cluster `finanzas-migrantes`:** registrar en `src/config/clusters.ts` (pattern idéntico a `bancos-fintech`).
2. **Hub:** crear `src/pages/guias/finanzas-migrantes/index.astro` (puede ser stub inicialmente).
3. **ADR:** documentar la decisión de crear el cluster y hub (`docs/adr/ADR-YYYYMMDD-finanzas-migrantes-hub.md`).
4. **Hero image:** generar siguiendo el naming convention (`finanzas-para-migrantes-chile.avif`).
5. Solo después de los 4 pasos anteriores crear el blog file con `draft: true`.

---

## Estado de Gates

- **Gate 05 (MathAudit)**: EXIMIDO — artefacto `05-math-audit.md` creado 2026-06-22; inventario de 5 números con disposición; N3/N4/N5 eliminados en remediación, N1/N2 mantenidos como no-calculables.
- **Gate 06 (ComplianceAgent)**: FAIL (5.49/10) — `06-compliance.md` producido por Codex sesión fresca. Draft remediado 2026-06-22 (sesión fresca DraftAgent) — re-auditoría requerida en nueva sesión fresca.
- **Gate 07 (HumanEditor)**: PENDIENTE.

> **Nota de remediación (2026-06-22):** Draft `04-draft.md` remediado por DraftAgent (sesión fresca) para resolver D#1–D#7 de Gate 06 FAIL. Cambios: C1/C1b/C4/C5/C6 convertidos a orientativos; C2 limitado a evidencia VERIFIED; C3 incorporado; afirmaciones legales categóricas retiradas; rangos numéricos sin fuente eliminados (N3/N4/N5); lead generalizado corregido. Gate 06 debe re-ejecutarse en sesión completamente fresca.

---

## HumanEditor Sign-off

| Campo | Valor |
|---|---|
| Editor | — (Carlos Ortega) |
| Rol | HumanEditor |
| Fecha | — |
| Decisión | — (PENDIENTE) |
| Notas | — |
