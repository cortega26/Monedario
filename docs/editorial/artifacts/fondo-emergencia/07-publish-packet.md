# Gate 07 — Publish Packet: fondo-emergencia-chile

Status: SIGNED OFF — HumanEditor approved
HumanEditor: Carlos Ortega
Sign-off date: 2026-05-08
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
| 05 Math audit | MathAuditAgent | ChatGPT — sesión fresca | ⬜ NO REQUERIDO (artículo sin cálculos) |
| 06 Compliance | ComplianceAgent | Claude Code — sesión fresca 2026-05-04 + remediación ciclo 2 2026-05-08 | ✓ COMPLETADO — ver `06-compliance.md` (PASS) |
| 07 Publish | HumanEditor | Human | ✓ SIGNED OFF — Carlos Ortega, 2026-05-08 |

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

## TODO:SOURCE

| # | Claim | Resolución | Estado |
|---|---|---|---|
| R1 | Rango "3 a 6 meses" — ¿usa CMF este rango? | No se encontró fuente CMF con rango exacto. Artículo reformulado: "orientación internacional, sin norma chilena específica". | ✓ RESUELTO |
| R2 | Penalización DAP — circular CMF | No se identificó circular. Claim reemplazado por "condiciones varían según contrato; el banco puede aplicar tasa menor". | ✓ RESUELTO |
| R3 | URLs CMF research | Deferido al revisor humano en Gate 07 si corresponde agregar fuente. | ⚠ DEFERIDO |

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

## Estado de Gates

- **Gate 05 (MathAudit)**: No ejecutado. **No requerido** — el artículo no contiene fórmulas, cálculos aritméticos, tablas tributarias ni valores numéricos auditables.
- **Gate 06 (ComplianceAgent)**: Completado 2026-05-04 con veredicto CONDITIONAL. Remediación ciclo 2 (2026-05-08) resolvió DEFECT #1 y DEFECT #2. Veredicto final: **PASS**.
- **Gate 07 (HumanEditor)**: **SIGNED OFF** — Carlos Ortega, 2026-05-08. Reformulaciones aceptadas como política editorial.

---

## HumanEditor Sign-off

| Campo | Valor |
|---|---|
| Editor | Carlos Ortega |
| Rol | HumanEditor |
| Fecha | 2026-05-08 |
| Decisión | **Aprobado** — reformulaciones aceptadas como política editorial para contenido sin fuente CMF. |
| Notas | Artículo sin Gate 05 (MathAudit) por ausencia de cálculos. Verificar `check:links` y hero image antes de `draft:false`. |
