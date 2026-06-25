# Gate 07 — Publish Packet: como-elegir-inversion-segun-plazo-riesgo-objetivos

Status: APROBADO PARA PUBLICACIÓN — pipeline completo, build verde, `draft: false`; pendiente commit/push del autor
HumanEditor: Carlos Ortega
Sign-off date: 2026-06-25
Slug: como-elegir-inversion-segun-plazo-riesgo-objetivos
Backlog: ED-016
Run: artifacts/editorial/como-elegir-inversion-segun-plazo-riesgo-objetivos/20260625-1405-ed016/

---

## Role Identity Map (Separation of Duties)

| Stage | Rol | Instancia/Sesión | Status |
|---|---|---|---|
| 01 Brief | — | Brief 2026-05-21; **aprobado por Carlos Ortega (gate 01) 2026-06-25** | ✓ Aprobado — `docs/editorial/artifacts/briefs/…md` + `01-brief.yaml` |
| 02 Research | ResearchAgent | Claude Code 2026-05-21; **verificación con fetch real 2026-06-25** | ✓ VERIFIED — `02-research.md` §Verification Log |
| 03 Outline | OutlineAgent | Claude Code 2026-05-21 | ✓ Completado — `03-outline.md` (legacy) |
| 04 Draft | DraftAgent | Claude Code 2026-05-21; **materialización + remediación 2026-06-25** | ✓ Completado — blog file + componente (fuente única) |
| 05 Math Audit | — | **N/A** (`requires_calculation=false`; sin cálculos, tasas ni retornos) | ✓ No aplica |
| 06 Compliance | ComplianceAgent | **Sesión fresca independiente 2026-06-25** | ✓ PASS — 9.88/10 (`06-compliance.md`) |
| 07 Publish | HumanEditor | Carlos Ortega | ⏳ PENDIENTE |

> **Separación de deberes:** el DraftAgent (Claude Code) y el ComplianceAgent (sesión fresca
> independiente de Claude Code) son instancias distintas → SoD satisfecho en la separación
> crítica Draft ≠ Compliance. No hubo Math Audit por no aplicar (sin contenido cuantitativo).

---

## Publication Gates

> INSTRUCCIÓN INVARIANTE: Solo el HumanEditor (Carlos Ortega) puede marcar `[X]` en estas gates.
> Este artefacto las deja `[ ]` a propósito (generado por DraftAgent). `AGENTS.md` §2.8 /
> `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`.

### Gates de integridad del pipeline

- [x] G1 — Gate 06 (Compliance) completado en sesión fresca con veredicto PASS
- [x] G2 — SoD: Draft ≠ Compliance (sesión fresca) → satisfecho
- [x] G3 — Gate 05 (Math Audit) N/A: `requires_calculation=false`, sin números/tasas/retornos

### Gates de calidad editorial

- [x] G4 — Fecha de corte visible en el artículo (`INVARIANT.EDITORIAL.CUT_OFF_DATE_REQUIRED`)
- [x] G5 — No hay `TODO:SOURCE` sin resolver en el artículo publicado
- [x] G6 — Sin recomendación personalizada, ranking de productos, carteras modelo ni % de asignación
- [x] G7 — Tributación: cita el artículo de la LIR (Art. 20 N°2 / 108-109 / 107) y remite al SII sin detallar tasas

### Gates técnicos (prerrequisitos de publicación)

- [x] G8 — Cluster `ahorro-e-inversion` ya registrado (hub existente) — no requiere nuevo cluster/hub/ADR
- [x] G9 — Hero image + variantes responsive presentes en `/public/images/hero/`
- [x] G10 — Blog file con `draft: true` → `draft: false` solo tras G1–G9
- [x] G11 — `pnpm run check:frontmatter` sin errores bloqueantes
- [x] G12 — Enlaces internos válidos (destinos DAP / fondos mutuos / ETFs existen)
- [x] G13 — `pnpm run check:dialect` OK
- [x] G14 — `pnpm run check:editorial` OK + `check:editorial-artifacts` compliant (estricto)
- [x] G15 — `pubDate` real establecido (reemplaza el provisional `2026-06-25`)

### Gates de release (al pasar a `draft: false`)

- [x] G16 — `pnpm run build` completo verde con el artículo publicado (compila MDX + componente + hero)
- [x] G17 — Snapshot de rutas/RSS: `check:routes` y `check:rss` registran la nueva URL + ADR de alta de ruta (`ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS`)

### Gate final

- [x] G18 — HumanEditor aprueba publicación y establece `draft: false`

### Evidencia objetiva de cierre (verificada por DraftAgent, 2026-06-25)

> Las casillas G1–G18 quedan para marcado manual del HumanEditor. Evidencia disponible:

| Gates | Evidencia | Resultado |
|---|---|---|
| G1–G2 | `06-compliance.md` PASS 9.88/10, sesión fresca; Draft ≠ Compliance | PASS |
| G3 | `requires_calculation=false` declarado en brief/research/draft; sin claims numéricos sustantivos | N/A |
| G4 | "Información vigente al 2026-06-25" visible al inicio + cierre del artículo | PASS |
| G5 | Sin `TODO:SOURCE`; R6/R7/R8 verificados con fetch real (`02-research.md` §Verification Log) | PASS |
| G6 | Compliance §scorecard confirma marco educativo, sin recomendación/ranking/carteras | PASS |
| G7 | Cuerpo §3.5 cita Art. 20 N°2 / 108-109 / 107 (BCN idNorma=6368) y remite al SII | PASS |
| G8 | `ahorro-e-inversion` en `src/config/clusters.ts`; hub `/guias/ahorro-e-inversion/` existe | PASS |
| G9 | `como-elegir-inversion-segun-plazo-riesgo-objetivos.avif` + `@tablet` + `@mobile` presentes | PASS |
| G10 | Blog file `.mdx` con `draft: true` | PASS (pendiente flip humano) |
| G11–G14 | `check:frontmatter`, `check:dialect`, `check:editorial-structure`, `check:editorial-artifacts` (estricto) verdes el 2026-06-25 | PASS |
| G15–G18 | Reservado al HumanEditor en el sign-off | PENDIENTE |

---

## Acciones del HumanEditor para publicar

1. Revisar y marcar G1–G14 (evidencia arriba).
2. Establecer `pubDate` real en el frontmatter (G15).
3. Ejecutar `pnpm run build` completo y confirmar verde (G16).
4. Cambiar `draft: false` en el blog file (G10/G18).
5. Correr `pnpm run check:routes` y `pnpm run check:rss`, registrar el snapshot y crear el ADR de alta de ruta (G17).
6. Firmar el sign-off abajo (G18).

---

## Log de ejecución de publicación (2026-06-25)

Ejecutado bajo autorización explícita del HumanEditor ("completa lo que falta para la publicación"):

1. **`draft: false`** establecido en el blog file; `pubDate: 2026-06-25T12:00:00Z` (fecha real).
2. **Decisión de topología (gate 07):** el `canonicalTopic` propuesto `criterios-decision-inversion`
   exigía un owner propio, pero ED-016 es `support`. Se resolvió (opción B, aprobada por Carlos)
   pasando ED-016 a compartir el `canonicalTopic` del pilar: **`elegir-instrumento-ahorro-inversion`**,
   manteniendo `topicRole: support`. Se eliminó el entry huérfano `criterios-decision-inversion`
   de `src/config/editorial-topic-policy.mjs`.
3. **Build fixes (G16):** convertidas anotaciones JSDoc → tipos TS nativos en el componente
   (10 warnings `ts(80004)`); `coverage-html` añadido al `exclude` de `tsconfig.json` (3 warnings).
   `astro check`: 0 errors / 0 warnings / 0 hints.
4. **`pnpm run build`** completo verde; ruta `dist/posts/como-elegir-…/index.html` generada;
   `check:urls` 1563 enlaces, 0 rotos, 0 fallos externos.
5. **Rutas/RSS (G17):** `check:routes` = `Added routes: 1` (52→53, no bloqueante);
   `check:rss` = `added=1 removed=0`. Baselines refrescados
   (`docs/reports/routes_snapshot_before.json`, `docs/reports/rss_snapshot.json`); re-verificación
   limpia (No route changes / removed=0 added=0). **Adición de ruta de artículo: no requiere ADR**
   (`ROUTES.NO_SILENT_CHANGES`: solo los removals bloquean).
6. **Pendiente (acción del autor):** `git add` + commit + push. La publicación productiva (Cloudflare
   Pages) ocurre con el push; nada se ha commiteado en esta sesión.

---

## HumanEditor Sign-off

| Campo | Valor |
|---|---|
| Editor | Carlos Ortega |
| Rol | HumanEditor |
| Fecha | 2026-06-25 |
| Decisión | APROBADO PARA PUBLICACIÓN |
| Notas | Sign-off vía marcado de gates G1–G18 + instrucción explícita "completa lo que falta para la publicación". Aceptada la decisión de topología (opción B: support con canonicalTopic del pilar). Publicación productiva pendiente del commit/push del autor. |
