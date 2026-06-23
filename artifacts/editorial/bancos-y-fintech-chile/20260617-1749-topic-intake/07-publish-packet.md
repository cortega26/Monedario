# Gate 07 — Publish Packet: bancos-y-fintech-chile

Status: GATE 06 CONDITIONAL — awaiting HumanEditor review of defects + sign-off
HumanEditor: — (Carlos Ortega)
Sign-off date: —
Slug: bancos-y-fintech-chile (provisional)
Run: artifacts/editorial/bancos-y-fintech-chile/20260617-1749-topic-intake/
Pipeline opened: 2026-06-17 (Gate 00 → 04-draft)
DraftAgent session: Claude Code — sesión topic-intake 2026-06-17

---

## Role Identity Map (Separation of Duties)

| Stage | Role | Tool / Session | Status |
|---|---|---|---|
| 00 Topic Intake | Topic-intake | Claude Code 2026-06-17 | ✓ Completado (PROCEDER, prom. 4.33) |
| 01 Brief | DraftAgent/intake | Claude Code 2026-06-17 | ✓ Completado — `01-brief.yaml` |
| 02 Research | ResearchAgent | Claude Code 2026-06-17 | ✓ Completado — `02-dossier.md` (Q1 resuelto; Q2/Q3 parciales) |
| 03 Outline | OutlineAgent | Claude Code 2026-06-17 | ✓ Completado — `03-outline.md` |
| 04 Draft | DraftAgent | Claude Code 2026-06-17 | ✓ Completado — `04-draft.md` |
| 05 Math audit | MathAuditAgent | — | ⬜ NO REQUERIDO (`requires_calculation: false`, artículo sin cálculos) |
| 06 Compliance | ComplianceAgent | Claude Sonnet 4.6, sesión 2026-06-22 | ✓ CONDITIONAL — ver `06-compliance.md` (DEFECTO #2/#3 bloquean `draft:false`) |
| 07 Publish | HumanEditor | Human | ⬜ PENDIENTE |

> **Defecto de SoD declarado:** stages 02, 03 y 04 los produjo la MISMA instancia (Claude
> Code, sesión 2026-06-17). Se resuelve con Gate 06 en sesión fresca + sign-off humano.
> Gate 06 NO puede ejecutarse en la sesión que produjo 02–04.

---

## Publication Gates

> INSTRUCCIÓN INVARIANTE: Solo el HumanEditor puede marcar `[X]` en las gates de publicación.
> Los agentes no deben marcar ninguna gate como completada.

### Gates de integridad del pipeline

- [ ] G1 — Gate 02 (research) con TODO:SOURCE ≤ 0 resueltos antes de publicar (pendientes: Q2 cláusula Título III, Q3 sanción CMF — ver dossier)
- [ ] G2 — Gate 05 (math audit) — NO REQUERIDO (sin cálculos); confirmar en sign-off
- [ ] G3 — Gate 06 (compliance) completado por ComplianceAgent (Claude Code sesión fresca) con veredicto PASS o CONDITIONAL resuelto
- [ ] G4 — SoD declaration confirmada: stages 02/03/04 misma instancia → resuelto por sesión fresca en 06 + sign-off humano

### Gates de calidad editorial

- [ ] G5 — Fecha de corte visible en el cuerpo del artículo (`INVARIANT.EDITORIAL.CUT_OFF_DATE_REQUIRED`)
- [ ] G6 — No hay `TODO:SOURCE` sin resolver en el artículo publicado
- [ ] G7 — Artículo no recomienda banco ni fintech específicos
- [ ] G8 — Artículo no hace comparador de tarifas en vivo entre instituciones (alcance diferido de Gate 00)

### Gates técnicos

- [ ] G9 — Hero image creada y disponible en `/public/images/hero/bancos-y-fintech-chile.avif` (`INVARIANT.EDITORIAL.HERO_IMAGE_PUBLISHED_REQUIRED`) — prompt en `hero-prompt.md`
- [ ] G10 — Blog file creado en `src/data/blog/bancos-y-fintech-chile.md` con `draft: true`, luego `draft: false` solo tras G1–G9
- [ ] G11 — `pnpm run check:frontmatter` sin errores bloqueantes
- [ ] G12 — `pnpm run check:links` sin links rotos
- [ ] G13 — `pnpm run check:routes` (añade `/posts/bancos-y-fintech-chile/` — no bloqueante, verificar)
- [ ] G14 — `pnpm run check:dialect` OK
- [ ] G15 — `pnpm run check:editorial` OK (cluster `bancos-fintech` ya registrado en `clusters.ts`)
- [ ] G16 — Flip del hub: quitar `bancos-fintech` del `Exclude` de `HubCluster`, agregar a `GUIDE_HUBS`/`GUIDE_HUB_ORDER`, quitar `noindex`, enlazar el pilar y registrar en `HUB_ARTICLE_ASSIGNMENTS` (ver `docs/adr/ADR-20260617-bancos-fintech-hub.md`)

### Gate final

- [ ] G17 — HumanEditor aprueba publicación y establece `draft: false`

---

## TODO:SOURCE

| # | Claim | Resolución | Estado |
|---|---|---|---|
| Q2 | Cláusula exacta de consentimiento (open banking) | Resuelto vía Opción A (2026-06-23, decisión HumanEditor): puntero de cita inline "(Título III, art. 16 y ss., Ley 21.521)" en cuerpo + FAQ. Ubicación verificada por dossier C10; sin texto literal (BCN sirve solo arts. 1–4). | ✅ RESUELTO (Opción A) |
| Q3 | Sanción por operar sin inscripción en Registro CMF | Existencia del Registro confirmada; el draft NO afirma la sanción, remite a verificar. Confirmar cláusula en Gate 06 o mantener deferral legítimo. | ⬜ PARCIAL |

---

## Inbound links (agregar al publicar — deferred)

> Agregar DESPUÉS de `draft: false` (el corpus publicado no debe enlazar drafts).

| Artículo/hub fuente | Texto ancla propuesto | Estado |
|---|---|---|
| Hub `bancos-fintech` | enlazar el pilar al hacer el flip | ⬜ PENDIENTE |
| `glosario/cuenta-rut` | (ya enlazado desde el hub) | — |
| `leyes/ley-21521-fintech` | (ya enlazado desde el hub) | — |

---

## NORMA_YMYL checklist (completar en Gate 06)

> A completar por ComplianceAgent en la sesión fresca de Gate 06.

- [ ] Fuentes oficiales verificadas y citadas (CMF Educa, BancoEstado, Ley 21.521/BCN)
- [ ] Cut-off date visible y correcto
- [ ] Sin recomendaciones de banco/fintech específicos
- [ ] Sin comparador de tarifas en vivo
- [ ] Sin interpretaciones legales definitivas (open banking descrito, no citado como obligación literal sin artículo)
- [ ] Tono educativo, no prescriptivo
- [ ] Disclaimer de artículo educativo presente

---

## Estado de Gates

- **Gate 05 (MathAudit)**: No requerido — `requires_calculation: false`, sin fórmulas ni valores auditables.
- **Gate 06 (ComplianceAgent)**: CONDITIONAL (2026-06-22) — ver `06-compliance.md`. DEFECTO #2/#3 bloquean `draft:false`; DEFECTO #4 trivial. Resolución: agregar cita art. de consentimiento (Título III, arts. 16-27, Ley 21.521) al borrador antes del sign-off.
- **Gate 07 (HumanEditor)**: PENDIENTE.

---

## Addendum 2026-06-23 — Resolución de defectos bloqueantes (Opción A)

> Registro de acciones, NO sign-off. Ninguna gate G1–G17 fue marcada por el agente.

- **DEFECTO #2/#3 (HIGH) — RESUELTO vía Opción A.** Por decisión del HumanEditor (Carlos
  Ortega, 2026-06-23), se aplicó el puntero de cita inline "(Título III, art. 16 y ss.,
  Ley 21.521)" en `04-draft.md`: cuerpo (sección "Banco tradicional vs. fintech") y FAQ
  ("¿Qué pasa con mis datos en open banking?"). Ubicación verificada por dossier C10. El
  auditor de Gate 06 pre-aprobó la Opción A (condición 4); no requiere re-auditoría fresca.
- **DEFECTO #4 (LOW) — RESUELTO.** Eliminada la ocurrencia duplicada de `draft: true` en el
  frontmatter propuesto de `04-draft.md`.
- **DEFECTO #1 (SoD), #5 (INFO):** sin cambios — #1 se cierra con tu sign-off; #5 no requiere acción.

**Pendiente, todo human-only (Carlos Ortega):** revisar el draft corregido + este packet;
crear el blog file `src/data/blog/bancos-y-fintech-chile.md`; ejecutar G11–G15; crear hero (G9);
hacer el flip del hub G16 (ADR-20260617); marcar G1–G17; sign-off final G17 + `draft:false`.
Recién después se cierra OPP-12 y OPP-13 en el scorecard del scan de oportunidades.

---

## HumanEditor Sign-off

| Campo | Valor |
|---|---|
| Editor | — (Carlos Ortega) |
| Rol | HumanEditor |
| Fecha | — |
| Decisión | — (PENDIENTE) |
| Notas | — |
