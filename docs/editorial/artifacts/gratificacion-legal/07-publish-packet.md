# Gate 07 — Publish Packet: gratificacion-legal-chile

Status: BLOCKED — pending human sign-off
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
| **05 Math audit** | **MathAuditAgent** | **ChatGPT — sesión fresca (pendiente)** | ⬜ PENDIENTE — **OBLIGATORIO** (`requires_calculation=true`) |
| **06 Compliance** | **ComplianceAgent** | **Claude Code — sesión fresca separada (pendiente)** | ⬜ PENDIENTE |
| 07 Publish | HumanEditor | Human | ⬜ PENDIENTE |

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

## TODO:SOURCE pendientes antes de publicar

| # | Claim | Acción | Bloqueante |
|---|---|---|---|
| R1 | IMM vigente al 2026-05-03 | Verificar decreto supremo más reciente en https://www.mintrab.gob.cl/ | Sí — sin este valor el artículo no puede publicarse |
| R2 | Tope = IMM × 4,75 (cálculo) | Calcular con R1 confirmado; MathAuditAgent debe verificar | Sí |
| R3 | Ejemplo numérico completo | Completar $[RESULTADO_TODO:SOURCE] con valores de R1/R2 | Sí |
| R4 | URL BCN arts. 47-52 CT | Verificar que resuelve a la versión vigente del Código | Sí — los links del artículo deben resolver |

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

## Handoff — instrucciones para Gate 05 y Gate 06

### Gate 05 — MathAuditAgent (ChatGPT) — OBLIGATORIO

1. Abre ChatGPT (nueva conversación).
2. Pega el playbook del Stage 05 de `context/EDITORIAL_AI_PIPELINE.md` §8.
3. Proporciona el contenido de:
   - `docs/editorial/artifacts/gratificacion-legal/04-draft.md`
   - `docs/editorial/artifacts/gratificacion-legal/02-research.md`
4. **Instrucción adicional**: verificar todos los placeholders `TODO:SOURCE` en el draft y calcular el ejemplo numérico con el IMM vigente confirmado.
5. Output reemplaza: `docs/editorial/artifacts/gratificacion-legal/05-math-audit.md`.

### Gate 06 — ComplianceAgent (Claude Code — nueva sesión)

1. Abre una **nueva** sesión de Claude Code (nuevo terminal, sin cargar esta conversación).
2. Pega el playbook del Stage 06 de `context/EDITORIAL_AI_PIPELINE.md` §8.
3. Los archivos a leer al inicio:
   - `docs/editorial/NORMA_YMYL.md`
   - `docs/editorial/artifacts/briefs/gratificacion-legal.md`
   - `docs/editorial/artifacts/gratificacion-legal/04-draft.md`
   - `docs/editorial/artifacts/gratificacion-legal/05-math-audit.md` (después de Gate 05)
4. Output reemplaza: `docs/editorial/artifacts/gratificacion-legal/06-compliance.md`.
