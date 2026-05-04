# Gate 07 — Publish Packet: fondo-emergencia-chile

Status: BLOCKED — pending human sign-off
Slug: fondo-emergencia-chile
Pipeline opened: 2026-05-03
DraftAgent session: Claude Code — Sprint 2B

---

## Role Identity Map (Separation of Duties)

| Stage | Role | Tool / Session | Status |
|---|---|---|---|
| 01 Brief | HumanEditor | Human (Sprint 2 approval) | ✓ Completado |
| PRE-02 canonicalTopic | Claude Code Sprint 2B | `editorial-topic-policy.mjs` editado | ✓ Completado |
| 02 Research | ResearchAgent | Claude Code Sprint 2B (orientación + estructura) | ✓ Completado — TODO:SOURCE pendientes (ver §Checklist) |
| 03 Outline | OutlineAgent | Claude Code Sprint 2B | ✓ Completado |
| 04 Draft | DraftAgent | Claude Code Sprint 2B | ✓ Completado — draft en `04-draft.md` |
| 05 Math audit | MathAuditAgent | **ChatGPT — sesión fresca (pendiente)** | ⬜ PENDIENTE |
| 06 Compliance | ComplianceAgent | **Claude Code — sesión fresca separada (pendiente)** | ⬜ PENDIENTE |
| 07 Publish | HumanEditor | Human | ⬜ PENDIENTE |

> SoD compliance: DraftAgent (Claude Code Sprint 2B) ≠ MathAuditAgent (ChatGPT fresh session) ≠ ComplianceAgent (Claude Code fresh session).
> Gate 05 y 06 no pueden completarse en esta sesión. Ver instrucciones de handoff al final de este documento.

---

## Publication Gates

> INSTRUCCIÓN INVARIANTE: Solo el HumanEditor puede marcar `[X]` en las gates de publicación.
> Los agentes no deben marcar ninguna gate como completada.

### Gates de integridad del pipeline

- [ ] G1 — Gate 02 (research) completo con TODO:SOURCE ≤ 0 resueltos antes de publicar
- [ ] G2 — Gate 05 (math audit) completado por MathAuditAgent (ChatGPT) con veredicto PASS o CONDITIONAL resuelto
- [ ] G3 — Gate 06 (compliance) completado por ComplianceAgent (Claude Code fresh session) con veredicto PASS
- [ ] G4 — SoD declaration confirmada: roles distintos en stages 04, 05, 06

### Gates de calidad editorial

- [ ] G5 — Fecha de corte visible en el cuerpo del artículo (`INVARIANT.EDITORIAL.CUT_OFF_DATE_REQUIRED`)
- [ ] G6 — No hay `TODO:SOURCE` sin resolver en el artículo publicado
- [ ] G7 — Artículo no recomienda banco o producto específico
- [ ] G8 — Artículo no hace comparaciones de tasas de interés entre instituciones

### Gates técnicos

- [ ] G9 — Hero image creada y disponible en `/public/images/hero/fondo-emergencia-chile.avif` (`INVARIANT.EDITORIAL.HERO_IMAGE_PUBLISHED_REQUIRED`)
- [ ] G10 — `draft: false` en frontmatter (cambio solo tras G1–G9 aprobados)
- [ ] G11 — `pnpm run check:frontmatter` sin errores bloqueantes
- [ ] G12 — `pnpm run check:links` sin links rotos
- [ ] G13 — `pnpm run check:routes` (añade `/posts/fondo-emergencia-chile/` — no bloqueante, verificar)
- [ ] G14 — `pnpm run check:dialect` OK
- [ ] G15 — `pnpm run check:editorial-structure` OK

### Gate final

- [ ] G16 — HumanEditor aprueba publicación y establece `draft: false`

---

## TODO:SOURCE pendientes antes de publicar

| # | Claim | Acción | Bloqueante para publicar |
|---|---|---|---|
| R1 | Rango "3 a 6 meses" — ¿usa CMF exactamente este rango? | Verificar en https://www.cmfchile.cl/educa/ | Sí — si CMF usa un rango distinto, actualizar C1 en draft y artículo |
| R2 | Penalización por retiro anticipado de DAP — mecanismo exacto | Verificar circular CMF vigente sobre depósitos a plazo | Sí — el claim de penalización debe ser preciso |
| R3 | URLs CMF en 02-research.md — verificar que resuelven | Acceso manual a CMF educa | Sí — para publicar, al menos S1 debe tener URL verificada |

---

## Inbound links (agregar al publicar — deferred)

> Los inbound links se deben agregar DESPUÉS de que el artículo esté publicado (`draft: false`).
> El script `check:links` solo reconoce slugs publicados; agregar links a un draft genera broken-link
> en el corpus publicado. Ver: `scripts/check-internal-links.mjs` línea 99–106.

| Artículo fuente | Texto ancla propuesto | Sección | Estado |
|---|---|---|---|
| `como-hacer-presupuesto-mensual-chile` | "construir tu colchón de emergencia" | Sección `## Siguiente paso` — reemplazar texto de "el paso siguiente es poner el excedente a trabajar" para añadir fondo-emergencia como paso intermedio | ⬜ PENDIENTE — agregar al publicar |
| `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` | "fondo de emergencia como base previa" | Párrafo de supuestos (línea "Si alguno de estos puntos no aplica...") | ⬜ PENDIENTE — agregar al publicar |

---

## NORMA_YMYL checklist (completar en Gate 06)

> A completar por ComplianceAgent en la sesión de Gate 06.

- [ ] Fuentes oficiales verificadas y citadas
- [ ] Cut-off date visible y correcto
- [ ] Sin recomendaciones de productos específicos
- [ ] Sin cálculos tributarios sin fuente
- [ ] Sin interpretaciones legales definitivas
- [ ] Tono educativo, no prescriptivo
- [ ] Disclaimer de artículo educativo presente

---

## Handoff — instrucciones para Gate 05 y Gate 06

### Gate 05 — MathAuditAgent (ChatGPT)

1. Abre ChatGPT (nueva conversación).
2. Pega el playbook del Stage 05 de `context/EDITORIAL_AI_PIPELINE.md` §8 como primer mensaje.
3. Proporciona el contenido de:
   - `docs/editorial/artifacts/fondo-emergencia/04-draft.md`
   - `docs/editorial/artifacts/fondo-emergencia/02-research.md`
4. El output reemplaza este archivo: `docs/editorial/artifacts/fondo-emergencia/05-math-audit.md`.

### Gate 06 — ComplianceAgent (Claude Code — nueva sesión)

1. Abre una **nueva** sesión de Claude Code (nuevo terminal, sin cargar esta conversación).
2. Pega el playbook del Stage 06 de `context/EDITORIAL_AI_PIPELINE.md` §8 como primer mensaje.
3. Los archivos a leer al inicio de la sesión son:
   - `docs/editorial/NORMA_YMYL.md`
   - `docs/editorial/artifacts/briefs/fondo-emergencia.md`
   - `docs/editorial/artifacts/fondo-emergencia/04-draft.md`
   - `docs/editorial/artifacts/fondo-emergencia/05-math-audit.md` (después de Gate 05)
4. El output reemplaza: `docs/editorial/artifacts/fondo-emergencia/06-compliance.md`.
