# Gate 07 — Publish Packet: gratificacion-legal-chile

Status: SIGNED OFF — HumanEditor approved
HumanEditor: Carlos Ortega
Sign-off date: 2026-05-08
Slug: gratificacion-legal-chile
Pipeline opened: 2026-05-03
DraftAgent session: Claude Code — Sprint 2B
Cluster: sueldo-remuneraciones (HARDENED)
requires_calculation: true
regulatory_sensitivity: media

---

## Role Identity Map (Separation of Duties)

| Stage | Role | Tool / Session | Status |
|---|---|---|---|
| 01 Brief | HumanEditor | Human (Sprint 2 approval) | ✓ Completado |
| PRE-02 canonicalTopic | Claude Code Sprint 2B | `editorial-topic-policy.mjs` editado | ✓ Completado |
| 02 Research | ResearchAgent | Claude Code Sprint 2B | ✓ Completado — TODO:SOURCE pendientes (C4 IMM, C5 tope) |
| 03 Outline | OutlineAgent | Claude Code Sprint 2B | ✓ Completado |
| 04 Draft | DraftAgent | Claude Code Sprint 2B | ✓ Completado — TODO:SOURCE en cifras IMM |
| **05 Math audit** | **MathAuditAgent** | **ChatGPT — sesión fresca** | ✓ COMPLETADO — ver `05-math-audit.md` (FAIL → remediación ciclos 1-3) |
| **06 Compliance** | **ComplianceAgent** | **Claude Code — sesión fresca** | ✓ COMPLETADO — ver `06-compliance.md` (PASS — todos los defectos resueltos) |
| 07 Publish | HumanEditor | Human | ✓ SIGNED OFF — Carlos Ortega, 2026-05-08 |

> SoD compliance: DraftAgent (Claude Code Sprint 2B) ≠ MathAuditAgent (ChatGPT) ≠ ComplianceAgent (Claude Code fresh session).

---

## Publication Gates

> INSTRUCCIÓN INVARIANTE: Solo el HumanEditor puede marcar `[X]` en las gates de publicación.

### Gates de integridad del pipeline

- [ ] G1 — TODO:SOURCE resueltos: IMM vigente confirmado (C4), tope calculado (C5), ejemplo numérico completo
- [ ] G2 — Gate 05 completado por MathAuditAgent (ChatGPT) con veredicto PASS o CONDITIONAL resuelto — **OBLIGATORIO por requires_calculation=true**
- [ ] G3 — Gate 06 completado por ComplianceAgent (Claude Code fresh session) con veredicto PASS
- [ ] G4 — SoD declaration confirmada en publish packet

### Gates de calidad editorial

- [ ] G5 — Fecha de corte visible en cuerpo del artículo (`INVARIANT.EDITORIAL.CUT_OFF_DATE_REQUIRED`)
- [ ] G6 — IMM vigente reemplazado en todos los placeholders del artículo publicado
- [ ] G7 — Ejemplo numérico completo y verificado por MathAuditAgent
- [ ] G8 — Artículo no usa modalidad 30 % como "default" ni invierte la decisión empleador/trabajador
- [ ] G9 — Referencias a arts. 47–52 CT con URL BCN verificada y vigente

### Gates técnicos

- [ ] G10 — Hero image en `/public/images/hero/gratificacion-legal-chile.avif` (`INVARIANT.EDITORIAL.HERO_IMAGE_PUBLISHED_REQUIRED`)
- [ ] G11 — `draft: false` en frontmatter (solo tras G1–G9)
- [ ] G12 — `pnpm run check:frontmatter` sin errores bloqueantes
- [ ] G13 — `pnpm run check:links` sin broken links
- [ ] G14 — `pnpm run check:routes` (añade `/posts/gratificacion-legal-chile/`)
- [ ] G15 — `pnpm run check:dialect` OK
- [ ] G16 — `pnpm run check:editorial-structure` OK
- [ ] G17 — `pnpm run audit:topic-overlap` sin conflictos nuevos

### Gate final

- [ ] G18 — HumanEditor aprueba publicación y establece `draft: false`

---

## TODO:SOURCE

| # | Claim | Resolución | Estado |
|---|---|---|---|
| R1 | IMM vigente al 2026-05-03 | Ley 21.751, Mintrab: $539.000 | ✓ RESUELTO |
| R2 | Tope IMM × 4,75 | $539.000 × 4,75 = $2.560.250 (verificado MathAuditAgent) | ✓ RESUELTO |
| R3 | Ejemplo numérico | $2.400.000 bruto, $200.000/mes provisión | ✓ RESUELTO |
| R4 | URL BCN arts. 47-52 CT | idNorma=207436 verificada | ✓ RESUELTO |

---

## Inbound links (agregar al publicar — deferred)

| Artículo fuente | Texto ancla propuesto | Sección | Estado |
|---|---|---|---|
| `como-calcular-sueldo-liquido` | "gratificación legal" | Componentes del sueldo bruto | ⬜ PENDIENTE — agregar al publicar |
| `liquidacion-de-sueldo` | "línea de gratificación en el comprobante" | Sección de haberes | ⬜ PENDIENTE — agregar al publicar |

---

## NORMA_YMYL checklist (completar en Gate 06)

- [ ] Fuentes oficiales (BCN, DT, Mintrab) verificadas y citadas con URL
- [ ] Fecha de corte visible y con referencia al IMM vigente
- [ ] Fórmula y tope verificados por MathAuditAgent antes de compliance
- [ ] Sin consejo laboral personalizado ("en tu caso deberías...")
- [ ] Distinción clara entre modalidad que decide el empleador vs lo que puede exigir el trabajador
- [ ] Disclaimer de educación editorial presente

---

## Estado de Gates

- **Gate 05 (ChatGPT)**: Completado 2026-05-05. Veredicto `FAIL`. Remediación DraftAgent en ciclos 1-3 resolvió todos los items (IMM $539.000, tope $2.560.250, arts. 47-52 CT citados).
- **Gate 06 (ComplianceAgent)**: Completado 2026-05-06. Veredicto final: **PASS**. Todos los defectos resueltos.
- **Gate 07 (HumanEditor)**: **SIGNED OFF** — Carlos Ortega, 2026-05-08.

---

## HumanEditor Sign-off

| Campo | Valor |
|---|---|
| Editor | Carlos Ortega |
| Rol | HumanEditor |
| Fecha | 2026-05-08 |
| Decisión | **Aprobado** — todos los defectos de pipeline resueltos. |
| Notas | Verificar `check:frontmatter`, `check:links` y hero image antes de `draft:false`. |
